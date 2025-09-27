#!/usr/bin/env python3
"""
Physics MCP Python Worker

Handles symbolic computation, numerical analysis, and plotting operations
via JSON-RPC over stdin/stdout.
"""

import sys
import json
import math
import traceback
import signal
import threading
from typing import Any, Dict, Optional, Union, List
from io import BytesIO
import base64
import time

# Core computation libraries
import sympy as sp
from sympy import *
import numpy as np
import scipy.constants as const
import pint

# Plotting
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Optional device-aware acceleration
try:
    from accel import (
        accel_init,
        accel_caps,
        accel_eval_parametric_1d,
        accel_eval_scalar_2d,
        accel_eval_vector_2d,
    )
    _ACCEL_INFO = accel_init()
except Exception:
    def accel_caps():
        return {"active": False, "device": "cpu", "mode": "cpu", "has_torch": False}
    _ACCEL_INFO = accel_caps()

# Optional quantum physics library
try:
    import qutip  # type: ignore
    _HAS_QUTIP = True
except ImportError:
    qutip = None  # type: ignore
    _HAS_QUTIP = False

# Phase 4 modules
from . import data_io
from . import signal_processing
from . import external_apis
from . import export_utils

# Safety configuration
EXECUTION_TIMEOUT = 10.0  # seconds
MAX_ARRAY_SIZE = 100000
SAFE_SYMPY_NAMESPACE = {
    # Core sympy functions
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
    'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
    'exp', 'log', 'ln', 'sqrt', 'cbrt', 'Abs', 'sign',
    'pi', 'E', 'I', 'oo', 'zoo', 'nan',
    'Symbol', 'symbols', 'Function', 'Derivative', 'Integral',
    'diff', 'integrate', 'limit', 'series', 'solve', 'dsolve',
    'Matrix', 'eye', 'zeros', 'ones', 'diag',
    'simplify', 'expand', 'factor', 'collect', 'cancel',
    'apart', 'together', 'trigsimp', 'powsimp', 'radsimp',
    'Eq', 'Ne', 'Lt', 'Le', 'Gt', 'Ge',
    'And', 'Or', 'Not', 'Implies', 'Equivalent',
    'Sum', 'Product', 'factorial', 'binomial', 'gamma',
    'Rational', 'Float', 'Integer', 'Poly', 'roots',
    'latex', 'pretty', 'pprint'
}

# Initialize unit registry
ureg = pint.UnitRegistry()

# CODATA constants with units - Extended set
CODATA = {
    "c": const.c * ureg("m/s"),           # Speed of light
    "h": const.h * ureg("J*s"),           # Planck constant  
    "hbar": const.hbar * ureg("J*s"),     # Reduced Planck constant
    "e": const.e * ureg("C"),             # Elementary charge
    "m_e": const.m_e * ureg("kg"),        # Electron mass
    "m_p": const.m_p * ureg("kg"),        # Proton mass
    "k_B": const.k * ureg("J/K"),         # Boltzmann constant
    "N_A": const.N_A * ureg("1/mol"),     # Avogadro constant
    "epsilon_0": const.epsilon_0 * ureg("F/m"),  # Vacuum permittivity
    "mu_0": const.mu_0 * ureg("H/m"),     # Vacuum permeability
    "G": const.G * ureg("m^3/(kg*s^2)"),  # Gravitational constant
    "R": const.R * ureg("J/(mol*K)"),     # Gas constant
    "sigma": const.sigma * ureg("W/(m^2*K^4)"),  # Stefan-Boltzmann constant
    "a_0": const.physical_constants["Bohr radius"][0] * ureg("m"),  # Bohr radius
    "alpha": const.alpha,                  # Fine structure constant (dimensionless)
    # Astrophysical constants
    "M_sun": 1.98847e30 * ureg("kg"),     # Solar mass
    "pc": const.parsec * ureg("m"),       # Parsec
    "ly": const.c * 365.25 * 24 * 3600 * ureg("m"),  # Light year
    "au": const.au * ureg("m"),           # Astronomical unit
}


class TimeoutError(Exception):
    """Custom timeout exception."""
    pass


def timeout_handler(signum, frame):
    """Signal handler for timeouts."""
    raise TimeoutError("Operation timed out")


def safe_sympify(expr_str: str, timeout: float = EXECUTION_TIMEOUT) -> sp.Basic:
    """Safely parse a sympy expression with timeout and restricted namespace."""
    def parse_with_timeout():
        # Create a restricted local namespace
        safe_locals = {}
        for name in SAFE_SYMPY_NAMESPACE:
            if hasattr(sp, name):
                safe_locals[name] = getattr(sp, name)
        
        # Add common mathematical constants
        safe_locals.update({
            'pi': sp.pi, 'e': sp.E, 'I': sp.I, 'oo': sp.oo,
            'sin': sp.sin, 'cos': sp.cos, 'exp': sp.exp, 'log': sp.log
        })
        
        return sp.sympify(expr_str, locals=safe_locals, evaluate=False)
    
    # Set up timeout
    if sys.platform != 'win32':
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(int(timeout))
    
    try:
        result = parse_with_timeout()
        return result
    except Exception as e:
        raise ValueError(f"Failed to parse expression '{expr_str}': {e}")
    finally:
        if sys.platform != 'win32':
            signal.alarm(0)  # Cancel the alarm


def safe_evaluate(expr: sp.Basic, timeout: float = EXECUTION_TIMEOUT) -> sp.Basic:
    """Safely evaluate a sympy expression with timeout."""
    def evaluate_with_timeout():
        return expr.simplify()
    
    if sys.platform != 'win32':
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(int(timeout))
    
    try:
        result = evaluate_with_timeout()
        return result
    finally:
        if sys.platform != 'win32':
            signal.alarm(0)


def parse_quantity(value: Union[float, Dict[str, Any]]) -> Union[float, pint.Quantity]:
    """Parse a value that might have units."""
    if isinstance(value, dict) and "value" in value:
        val = value["value"]
        unit = value.get("unit", "")
        if unit:
            return val * ureg(unit)
        return val
    return value


def quantity_to_dict(q: Union[float, pint.Quantity]) -> Dict[str, Any]:
    """Convert a quantity back to dict format."""
    if isinstance(q, pint.Quantity):
        return {"value": float(q.magnitude), "unit": str(q.units)}
    return {"value": float(q), "unit": ""}


def handle_cas_evaluate(params: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate a symbolic/numeric expression."""
    expr_str = params["expr"]
    variables = params.get("vars", {})
    
    # Parse the expression safely
    expr = safe_sympify(expr_str)
    
    # Substitute variables
    subs = {}
    for var_name, var_value in variables.items():
        parsed_val = parse_quantity(var_value)
        # For symbolic computation, use magnitude if it's a quantity
        if isinstance(parsed_val, pint.Quantity):
            subs[sp.Symbol(var_name)] = parsed_val.magnitude
        else:
            subs[sp.Symbol(var_name)] = parsed_val
    
    # Substitute and simplify
    if subs:
        result_expr = expr.subs(subs)
    else:
        result_expr = expr
    
    simplified = safe_evaluate(result_expr)
    
    # Try to evaluate numerically
    evalf_result = None
    try:
        if simplified.is_real or simplified.is_complex:
            evalf_result = float(simplified.evalf())
    except (TypeError, ValueError):
        pass
    
    return {
        "latex": sp.latex(simplified),
        "str": str(simplified),
        "evalf": evalf_result,
        "original": str(expr)
    }


def handle_cas_diff(params: Dict[str, Any]) -> Dict[str, Any]:
    """Differentiate an expression."""
    expr_str = params["expr"]
    symbol_str = params["symbol"]
    order = params.get("order", 1)
    
    expr = safe_sympify(expr_str)
    symbol = sp.Symbol(symbol_str)
    
    result = sp.diff(expr, symbol, order)
    
    return {
        "latex": sp.latex(result),
        "str": str(result),
        "original": f"d^{order}/d{symbol_str}^{order} ({expr_str})"
    }


def handle_cas_integrate(params: Dict[str, Any]) -> Dict[str, Any]:
    """Integrate an expression."""
    expr_str = params["expr"]
    symbol_str = params["symbol"]
    bounds = params.get("bounds")
    variables = params.get("vars", {})
    
    expr = safe_sympify(expr_str)
    symbol = sp.Symbol(symbol_str)
    
    # Substitute variables if provided
    if variables:
        subs = {}
        for var_name, var_value in variables.items():
            if var_name != symbol_str:  # Don't substitute the integration variable
                parsed_val = parse_quantity(var_value)
                if isinstance(parsed_val, pint.Quantity):
                    subs[sp.Symbol(var_name)] = parsed_val.magnitude
                else:
                    subs[sp.Symbol(var_name)] = parsed_val
        if subs:
            expr = expr.subs(subs)
    
    if bounds:
        # Definite integral
        lower, upper = bounds
        result = sp.integrate(expr, (symbol, lower, upper))
    else:
        # Indefinite integral
        result = sp.integrate(expr, symbol)
    
    # Try to evaluate numerically if definite
    evalf_result = None
    if bounds:
        try:
            evalf_result = float(result.evalf())
        except (TypeError, ValueError):
            pass
    
    return {
        "latex": sp.latex(result),
        "str": str(result),
        "evalf": evalf_result,
        "definite": bounds is not None
    }


def handle_cas_solve_equation(params: Dict[str, Any]) -> Dict[str, Any]:
    """Solve an algebraic equation."""
    equation_str = params["equation"]
    symbol_str = params["symbol"]
    assumptions = params.get("assumptions", {})
    
    # Create symbol with assumptions
    symbol_kwargs = {}
    if assumptions:
        for assumption, value in assumptions.items():
            if assumption in ['real', 'positive', 'negative', 'integer', 'rational']:
                symbol_kwargs[assumption] = value
    
    symbol = sp.Symbol(symbol_str, **symbol_kwargs)
    
    # Parse equation (assume it's in the form "expr = 0" or "lhs = rhs")
    if "=" in equation_str:
        lhs, rhs = equation_str.split("=", 1)
        equation = sp.Eq(safe_sympify(lhs.strip()), safe_sympify(rhs.strip()))
    else:
        # Assume it's already in the form "expr = 0"
        equation = sp.Eq(safe_sympify(equation_str), 0)
    
    solutions = sp.solve(equation, symbol)
    
    # Try to evaluate solutions numerically
    numeric_solutions = []
    for sol in solutions:
        try:
            numeric_val = complex(sol.evalf())
            if numeric_val.imag == 0:
                numeric_solutions.append(float(numeric_val.real))
            else:
                numeric_solutions.append(numeric_val)
        except (TypeError, ValueError):
            numeric_solutions.append(None)
    
    return {
        "solutions": [str(sol) for sol in solutions],
        "latex_solutions": [sp.latex(sol) for sol in solutions],
        "numeric_solutions": numeric_solutions,
        "count": len(solutions),
        "assumptions": assumptions
    }


def handle_cas_solve_ode(params: Dict[str, Any]) -> Dict[str, Any]:
    """Solve an ordinary differential equation."""
    ode_str = params["ode"]
    symbol_str = params["symbol"]
    func_str = params["func"]
    initial_conditions = params.get("ics", {})
    
    # Parse symbols and function
    x = sp.Symbol(symbol_str)
    y = sp.Function(func_str)
    
    # Enhanced ODE parsing - handle common forms
    ode_processed = ode_str
    # Replace derivative notation
    ode_processed = ode_processed.replace(f"{func_str}''", f"{func_str}(x).diff(x,2)")
    ode_processed = ode_processed.replace(f"{func_str}'", f"{func_str}(x).diff(x)")
    ode_processed = ode_processed.replace(f"{func_str}", f"{func_str}(x)")
    
    try:
        # Parse the ODE expression
        if "=" in ode_processed:
            lhs, rhs = ode_processed.split("=", 1)
            ode_expr = safe_sympify(lhs.strip()) - safe_sympify(rhs.strip())
        else:
            ode_expr = safe_sympify(ode_processed)
        
        # Create the differential equation
        ode = sp.Eq(ode_expr, 0)
        
        # Solve the ODE
        general_solution = sp.dsolve(ode, y(x))
        
        # Apply initial conditions if provided
        particular_solution = None
        if initial_conditions:
            try:
                # Extract constants from general solution
                constants = general_solution.free_symbols - {x}
                if constants and len(initial_conditions) >= len(constants):
                    # Create system of equations from initial conditions
                    ic_equations = []
                    solution_rhs = general_solution.rhs
                    
                    for condition, value in initial_conditions.items():
                        if condition.startswith(f"{func_str}("):
                            # Extract x value from condition like "y(0)"
                            x_val = float(condition.split("(")[1].split(")")[0])
                            ic_eq = sp.Eq(solution_rhs.subs(x, x_val), value)
                            ic_equations.append(ic_eq)
                        elif condition.startswith(f"{func_str}'("):
                            # Derivative initial condition
                            x_val = float(condition.split("(")[1].split(")")[0])
                            ic_eq = sp.Eq(solution_rhs.diff(x).subs(x, x_val), value)
                            ic_equations.append(ic_eq)
                    
                    if ic_equations:
                        const_values = sp.solve(ic_equations, list(constants))
                        if const_values:
                            particular_solution = general_solution.subs(const_values)
            except Exception as e:
                # If IC application fails, just return general solution
                pass
        
        result = {
            "general_solution": str(general_solution),
            "latex": sp.latex(general_solution),
            "ode": str(ode),
            "ode_original": ode_str
        }
        
        if particular_solution:
            result.update({
                "particular_solution": str(particular_solution),
                "particular_latex": sp.latex(particular_solution),
                "initial_conditions": initial_conditions
            })
        
        return result
        
    except Exception as e:
        raise ValueError(f"Failed to solve ODE '{ode_str}': {e}")


def handle_cas_propagate_uncertainty(params: Dict[str, Any]) -> Dict[str, Any]:
    """Propagate uncertainty through an expression using linear approximation."""
    expr_str = params["expr"]
    variables = params["vars"]  # Dict of {var_name: {value, sigma, unit?}}
    
    # Parse the expression
    expr = safe_sympify(expr_str)
    
    # Extract variable information
    var_values = {}
    var_uncertainties = {}
    var_units = {}
    
    for var_name, var_info in variables.items():
        var_values[var_name] = var_info["value"]
        var_uncertainties[var_name] = var_info["sigma"]
        if "unit" in var_info:
            var_units[var_name] = var_info["unit"]
    
    # Calculate partial derivatives
    partials = {}
    for var_name in variables.keys():
        var_symbol = sp.Symbol(var_name)
        partial = sp.diff(expr, var_symbol)
        partials[var_name] = partial
    
    # Evaluate expression at mean values
    subs_dict = {sp.Symbol(name): value for name, value in var_values.items()}
    mean_value = float(expr.subs(subs_dict).evalf())
    
    # Calculate uncertainty using linear propagation
    # σ_f² = Σ (∂f/∂x_i)² σ_x_i²
    variance = 0
    partial_contributions = {}
    
    for var_name, partial_expr in partials.items():
        partial_value = float(partial_expr.subs(subs_dict).evalf())
        var_uncertainty = var_uncertainties[var_name]
        contribution = (partial_value * var_uncertainty) ** 2
        variance += contribution
        partial_contributions[var_name] = {
            "partial_derivative": str(partial_expr),
            "partial_value": partial_value,
            "contribution": contribution
        }
    
    total_uncertainty = math.sqrt(variance)
    
    # Calculate relative uncertainty
    relative_uncertainty = abs(total_uncertainty / mean_value) if mean_value != 0 else float('inf')
    
    return {
        "expression": expr_str,
        "mean_value": mean_value,
        "uncertainty": total_uncertainty,
        "relative_uncertainty": relative_uncertainty,
        "result_with_uncertainty": f"{mean_value:.6g} ± {total_uncertainty:.6g}",
        "partial_contributions": partial_contributions,
        "latex": sp.latex(expr)
    }


def handle_units_convert(params: Dict[str, Any]) -> Dict[str, Any]:
    """Convert units using Pint."""
    quantity = params["quantity"]  # {value, unit}
    to_unit = params["to"]
    
    # Parse input quantity
    input_value = quantity["value"]
    input_unit = quantity["unit"]
    
    try:
        # Create Pint quantity
        input_quantity = input_value * ureg(input_unit)
        
        # Convert to target unit
        converted = input_quantity.to(to_unit)
        
        # Check dimensional compatibility
        dimensionality = str(converted.dimensionality)
        
        return {
            "input": quantity,
            "output": {
                "value": float(converted.magnitude),
                "unit": str(converted.units)
            },
            "conversion_factor": float(converted.magnitude / input_value),
            "dimensionality": dimensionality
        }
        
    except Exception as e:
        raise ValueError(f"Unit conversion failed: {e}")


def handle_constants_get(params: Dict[str, Any]) -> Dict[str, Any]:
    """Get a physical constant by name."""
    name = params["name"]
    
    if name in CODATA:
        constant = CODATA[name]
        
        if isinstance(constant, pint.Quantity):
            return {
                "name": name,
                "value": float(constant.magnitude),
                "unit": str(constant.units),
                "dimensionality": str(constant.dimensionality),
                "description": f"CODATA physical constant: {name}"
            }
        else:
            # Dimensionless constant
            return {
                "name": name,
                "value": float(constant),
                "unit": "",
                "dimensionality": "dimensionless",
                "description": f"CODATA physical constant: {name}"
            }
    else:
        # Try to find similar constants
        similar = [k for k in CODATA.keys() if name.lower() in k.lower() or k.lower() in name.lower()]
        available = list(CODATA.keys())
        
        raise ValueError(f"Unknown constant '{name}'. Similar: {similar}. Available: {available}")


def handle_plot_function_2d(params: Dict[str, Any]) -> Dict[str, Any]:
    """Plot a 2D function."""
    f_str = params["f"]
    x_min = params["x_min"]
    x_max = params["x_max"]
    samples = params.get("samples", 1000)
    
    # Optional styling parameters
    title = params.get("title", f"Plot of {f_str}")
    xlabel = params.get("xlabel", "x")
    ylabel = params.get("ylabel", "f(x)")
    dpi = params.get("dpi", 100)
    width = params.get("width", 8)
    height = params.get("height", 6)
    
    # Create x values
    x_vals = np.linspace(x_min, x_max, samples)
    
    # Parse and evaluate function
    x_sym = sp.Symbol('x')
    f_expr = sp.sympify(f_str)
    f_lambda = sp.lambdify(x_sym, f_expr, 'numpy')
    
    try:
        y_vals = f_lambda(x_vals)
    except Exception as e:
        raise ValueError(f"Error evaluating function: {e}")
    
    # Create plot
    plt.figure(figsize=(width, height), dpi=dpi)
    plt.plot(x_vals, y_vals, 'b-', linewidth=2)
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.grid(True, alpha=0.3)
    
    # Save to base64 PNG
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=dpi, bbox_inches='tight')
    buffer.seek(0)
    image_png_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()
    
    # Generate CSV data
    csv_data = "x,y\n" + "\n".join(f"{x},{y}" for x, y in zip(x_vals, y_vals))
    
    return {
        "image_png_b64": image_png_b64,
        "csv_data": csv_data,
        "x_range": [float(x_min), float(x_max)],
        "y_range": [float(np.min(y_vals)), float(np.max(y_vals))],
        "samples": samples
    }


def handle_plot_parametric_2d(params: Dict[str, Any]) -> Dict[str, Any]:
    """Plot a 2D parametric curve."""
    x_str = params["x_t"]
    y_str = params["y_t"] 
    t_min = params["t_min"]
    t_max = params["t_max"]
    samples = params.get("samples", 1000)
    
    # Attempt accelerated sampling first, then fallback to CPU
    x_vals = y_vals = None
    try:
        x_expr = safe_sympify(x_str)
        y_expr = safe_sympify(y_str)
        # Try GPU/MPS/XPU path
        try:
            Xacc, Yacc = accel_eval_parametric_1d(x_expr, y_expr, t_min, t_max, samples)
            x_vals, y_vals = Xacc, Yacc
        except Exception as e:
            # Fallback to CPU
            t_vals = np.linspace(t_min, t_max, samples)
            t_sym = sp.Symbol('t')
            x_lambda = sp.lambdify(t_sym, x_expr, 'numpy')
            y_lambda = sp.lambdify(t_sym, y_expr, 'numpy')
            x_vals = x_lambda(t_vals)
            y_vals = y_lambda(t_vals)
            try:
                sys.stderr.write(f"[ACCEL] parametric_2d fallback to CPU: {e}\n")
            except Exception:
                pass
    except Exception as e:
        raise ValueError(f"Error evaluating parametric functions: {e}")
    
    # Create plot
    plt.figure(figsize=(8, 6), dpi=100)
    plt.plot(x_vals, y_vals, 'b-', linewidth=2)
    plt.title(f"Parametric Plot: x(t)={x_str}, y(t)={y_str}")
    plt.xlabel("x")
    plt.ylabel("y")
    plt.grid(True, alpha=0.3)
    plt.axis('equal')
    
    # Save to base64 PNG
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
    buffer.seek(0)
    image_png_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()
    
    return {
        "image_png_b64": image_png_b64,
        "t_range": [float(t_min), float(t_max)],
        "samples": samples
    }


def handle_plot_field_2d(params: Dict[str, Any]) -> Dict[str, Any]:
    """Plot a 2D vector field."""
    fx_str = params["fx"]
    fy_str = params["fy"]
    x_min = params["x_min"]
    x_max = params["x_max"]
    y_min = params["y_min"]
    y_max = params["y_max"]
    grid_points = params.get("grid_points", 20)
    plot_type = params.get("plot_type", "quiver")
    
    # Optional styling
    title = params.get("title", f"Vector Field: F = ({fx_str}, {fy_str})")
    xlabel = params.get("xlabel", "x")
    ylabel = params.get("ylabel", "y")
    dpi = params.get("dpi", 100)
    width = params.get("width", 8)
    height = params.get("height", 6)
    
    # Create coordinate grids via ACCEL if possible, else CPU
    x_sym, y_sym = sp.symbols('x y')
    fx_expr = safe_sympify(fx_str)
    fy_expr = safe_sympify(fy_str)
    try:
      try:
        X, Y, FX, FY = accel_eval_vector_2d(fx_expr, fy_expr, x_min, x_max, y_min, y_max, grid_points)
      except Exception as e:
        x_vals = np.linspace(x_min, x_max, grid_points)
        y_vals = np.linspace(y_min, y_max, grid_points)
        X, Y = np.meshgrid(x_vals, y_vals)
        fx_lambda = sp.lambdify((x_sym, y_sym), fx_expr, 'numpy')
        fy_lambda = sp.lambdify((x_sym, y_sym), fy_expr, 'numpy')
        FX = fx_lambda(X, Y)
        FY = fy_lambda(X, Y)
        try:
            sys.stderr.write(f"[ACCEL] field_2d fallback to CPU: {e}\n")
        except Exception:
            pass
    except Exception as e:
      raise ValueError(f"Error evaluating vector field: {e}")
    
    # Create plot
    plt.figure(figsize=(width, height), dpi=dpi)
    
    if plot_type == "quiver":
        # Quiver plot
        plt.quiver(X, Y, FX, FY, angles='xy', scale_units='xy', scale=1, alpha=0.8)
    elif plot_type == "stream":
        # Streamline plot
        plt.streamplot(X, Y, FX, FY, density=1.5, arrowsize=1.2, arrowstyle='->')
    else:
        raise ValueError(f"Unknown plot_type: {plot_type}")
    
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.grid(True, alpha=0.3)
    plt.axis('equal')
    
    # Save to base64 PNG
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=dpi, bbox_inches='tight')
    buffer.seek(0)
    image_png_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()
    
    return {
        "image_png_b64": image_png_b64,
        "x_range": [float(x_min), float(x_max)],
        "y_range": [float(y_min), float(y_max)],
        "grid_points": grid_points,
        "plot_type": plot_type
    }


def handle_plot_phase_portrait(params: Dict[str, Any]) -> Dict[str, Any]:
    """Plot a phase portrait for a 2D dynamical system."""
    dx_str = params["dx"]  # dx/dt
    dy_str = params["dy"]  # dy/dt
    x_min = params["x_min"]
    x_max = params["x_max"]
    y_min = params["y_min"]
    y_max = params["y_max"]
    grid_points = params.get("grid_points", 20)
    
    # Optional styling
    title = params.get("title", f"Phase Portrait: dx/dt = {dx_str}, dy/dt = {dy_str}")
    xlabel = params.get("xlabel", "x")
    ylabel = params.get("ylabel", "y")
    dpi = params.get("dpi", 100)
    width = params.get("width", 8)
    height = params.get("height", 6)
    
    # Create coordinate grids and evaluate via ACCEL if possible, else CPU
    x_sym, y_sym = sp.symbols('x y')
    dx_expr = safe_sympify(dx_str)
    dy_expr = safe_sympify(dy_str)
    try:
        try:
            X, Y, DX, DY = accel_eval_vector_2d(dx_expr, dy_expr, x_min, x_max, y_min, y_max, grid_points)
        except Exception as e:
            x_vals = np.linspace(x_min, x_max, grid_points)
            y_vals = np.linspace(y_min, y_max, grid_points)
            X, Y = np.meshgrid(x_vals, y_vals)
            dx_lambda = sp.lambdify((x_sym, y_sym), dx_expr, 'numpy')
            dy_lambda = sp.lambdify((x_sym, y_sym), dy_expr, 'numpy')
            DX = dx_lambda(X, Y)
            DY = dy_lambda(X, Y)
            try:
                sys.stderr.write(f"[ACCEL] phase_portrait fallback to CPU: {e}\n")
            except Exception:
                pass
    except Exception as e:
        raise ValueError(f"Error evaluating dynamical system: {e}")
    
    # Normalize for better visualization
    M = np.sqrt(DX**2 + DY**2)
    M[M == 0] = 1  # Avoid division by zero
    DX_norm = DX / M
    DY_norm = DY / M
    
    # Create plot
    plt.figure(figsize=(width, height), dpi=dpi)
    
    # Plot direction field
    plt.quiver(X, Y, DX_norm, DY_norm, M, angles='xy', scale_units='xy', scale=1, 
               alpha=0.7, cmap='viridis')
    
    # Add some sample trajectories
    try:
        from scipy.integrate import odeint
        
        def system(state, t):
            x, y = state
            return [float(dx_lambda(x, y)), float(dy_lambda(x, y))]
        
        # Sample initial conditions
        n_trajectories = 8
        x_starts = np.linspace(x_min + 0.1*(x_max-x_min), x_max - 0.1*(x_max-x_min), n_trajectories//2)
        y_starts = np.linspace(y_min + 0.1*(y_max-y_min), y_max - 0.1*(y_max-y_min), n_trajectories//2)
        
        t = np.linspace(0, 2, 100)
        
        for x0 in x_starts:
            for y0 in y_starts:
                try:
                    trajectory = odeint(system, [x0, y0], t)
                    plt.plot(trajectory[:, 0], trajectory[:, 1], 'r-', alpha=0.6, linewidth=1)
                except:
                    pass  # Skip if integration fails
    except ImportError:
        pass  # scipy not available
    
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.grid(True, alpha=0.3)
    plt.xlim(x_min, x_max)
    plt.ylim(y_min, y_max)
    
    # Save to base64 PNG
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=dpi, bbox_inches='tight')
    buffer.seek(0)
    image_png_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()
    
    return {
        "image_png_b64": image_png_b64,
        "x_range": [float(x_min), float(x_max)],
        "y_range": [float(y_min), float(y_max)],
        "grid_points": grid_points,
        "system": {"dx_dt": dx_str, "dy_dt": dy_str}
    }


def handle_plot_surface_3d(params: Dict[str, Any]) -> Dict[str, Any]:
    """Plot a 3D surface."""
    f_str = params["f"]
    x_min = params["x_min"]
    x_max = params["x_max"]
    y_min = params["y_min"]
    y_max = params["y_max"]
    samples = params.get("samples", 50)
    
    # Optional styling
    title = params.get("title", f"3D Surface: z = {f_str}")
    xlabel = params.get("xlabel", "x")
    ylabel = params.get("ylabel", "y")
    zlabel = params.get("zlabel", "z")
    dpi = params.get("dpi", 100)
    width = params.get("width", 10)
    height = params.get("height", 8)
    
    # Limit samples for performance
    samples = min(samples, 100)
    
    # Create coordinate grids and evaluate via ACCEL if possible, else CPU
    x_sym, y_sym = sp.symbols('x y')
    f_expr = safe_sympify(f_str)
    try:
        try:
            X, Y, Z = accel_eval_scalar_2d(f_expr, x_min, x_max, y_min, y_max, samples)
        except Exception as e:
            x_vals = np.linspace(x_min, x_max, samples)
            y_vals = np.linspace(y_min, y_max, samples)
            X, Y = np.meshgrid(x_vals, y_vals)
            f_lambda = sp.lambdify((x_sym, y_sym), f_expr, 'numpy')
            Z = f_lambda(X, Y)
            try:
                sys.stderr.write(f"[ACCEL] surface_3d fallback to CPU: {e}\n")
            except Exception:
                pass
    except Exception as e:
        raise ValueError(f"Error evaluating function: {e}")
    
    # Create 3D plot
    fig = plt.figure(figsize=(width, height), dpi=dpi)
    ax = fig.add_subplot(111, projection='3d')
    
    # Surface plot
    surf = ax.plot_surface(X, Y, Z, cmap='viridis', alpha=0.8, 
                          linewidth=0, antialiased=True)
    
    # Add contour lines at the bottom
    ax.contour(X, Y, Z, zdir='z', offset=np.min(Z), cmap='viridis', alpha=0.5)
    
    ax.set_title(title)
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    ax.set_zlabel(zlabel)
    
    # Add colorbar
    fig.colorbar(surf, shrink=0.5, aspect=5)
    
    # Save to base64 PNG
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=dpi, bbox_inches='tight')
    buffer.seek(0)
    image_png_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()
    
    # Generate CSV data
    csv_data = "x,y,z\n"
    for i in range(samples):
        for j in range(samples):
            csv_data += f"{X[i,j]},{Y[i,j]},{Z[i,j]}\n"
    
    return {
        "image_png_b64": image_png_b64,
        "csv_data": csv_data,
        "x_range": [float(x_min), float(x_max)],
        "y_range": [float(y_min), float(y_max)],
        "z_range": [float(np.min(Z)), float(np.max(Z))],
        "samples": samples
    }


def handle_plot_contour_2d(params: Dict[str, Any]) -> Dict[str, Any]:
    """Plot 2D contour lines."""
    f_str = params["f"]
    x_min = params["x_min"]
    x_max = params["x_max"]
    y_min = params["y_min"]
    y_max = params["y_max"]
    levels = params.get("levels", 15)
    samples = params.get("samples", 100)
    
    # Optional styling
    title = params.get("title", f"Contour Plot: {f_str}")
    xlabel = params.get("xlabel", "x")
    ylabel = params.get("ylabel", "y")
    dpi = params.get("dpi", 100)
    width = params.get("width", 8)
    height = params.get("height", 6)
    
    # Create coordinate grids
    x_vals = np.linspace(x_min, x_max, samples)
    y_vals = np.linspace(y_min, y_max, samples)
    X, Y = np.meshgrid(x_vals, y_vals)
    
    # Parse and evaluate function
    x_sym, y_sym = sp.symbols('x y')
    f_expr = safe_sympify(f_str)
    f_lambda = sp.lambdify((x_sym, y_sym), f_expr, 'numpy')
    
    try:
        Z = f_lambda(X, Y)
    except Exception as e:
        raise ValueError(f"Error evaluating function: {e}")
    
    # Create plot
    plt.figure(figsize=(width, height), dpi=dpi)
    
    # Contour plot with filled contours
    contour_filled = plt.contourf(X, Y, Z, levels=levels, cmap='viridis', alpha=0.8)
    contour_lines = plt.contour(X, Y, Z, levels=levels, colors='black', alpha=0.4, linewidths=0.5)
    
    # Add labels to contour lines
    plt.clabel(contour_lines, inline=True, fontsize=8)
    
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.colorbar(contour_filled)
    plt.grid(True, alpha=0.3)
    
    # Save to base64 PNG
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=dpi, bbox_inches='tight')
    buffer.seek(0)
    image_png_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()
    
    return {
        "image_png_b64": image_png_b64,
        "x_range": [float(x_min), float(x_max)],
        "y_range": [float(y_min), float(y_max)],
        "z_range": [float(np.min(Z)), float(np.max(Z))],
        "levels": levels,
        "samples": samples
    }


def handle_tensor_algebra(params: Dict[str, Any]) -> Dict[str, Any]:
    """Compute Christoffel symbols, curvature tensors, and geodesics."""
    metric = params["metric"]  # nested array
    coords = params["coords"]  # coordinate names
    compute = params["compute"]  # list of quantities to compute
    
    try:
        # Convert metric to sympy Matrix
        coord_symbols = [sp.Symbol(c) for c in coords]
        n = len(coord_symbols)
        
        # Parse metric components
        g = sp.Matrix(n, n, lambda i, j: safe_sympify(str(metric[i][j])))
        
        results = {}
        
        if "christoffel" in compute:
            # Christoffel symbols Γ^k_{ij} = (1/2) g^{kl} (∂g_{il}/∂x^j + ∂g_{jl}/∂x^i - ∂g_{ij}/∂x^l)
            christoffel = sp.MutableDenseNDimArray.zeros(n, n, n)
            g_inv = g.inv()
            
            for i in range(n):
                for j in range(n):
                    for k in range(n):
                        gamma = 0
                        for l in range(n):
                            term1 = sp.diff(g[i, l], coord_symbols[j])
                            term2 = sp.diff(g[j, l], coord_symbols[i])
                            term3 = sp.diff(g[i, j], coord_symbols[l])
                            gamma += g_inv[k, l] * (term1 + term2 - term3) / 2
                        christoffel[k, i, j] = sp.simplify(gamma)
            
            results["christoffel"] = {
                "components": [[[str(christoffel[k, i, j]) for j in range(n)] for i in range(n)] for k in range(n)],
                "latex": [[[sp.latex(christoffel[k, i, j]) for j in range(n)] for i in range(n)] for k in range(n)]
            }
        
        if "riemann" in compute:
            # Simplified Riemann tensor computation (basic implementation)
            results["riemann"] = {
                "status": "partial_implementation",
                "message": "Full Riemann tensor computation requires extensive symbolic manipulation. Use sympy.diffgeom for complete implementation."
            }
        
        if "ricci" in compute:
            # Ricci tensor R_{ij} (simplified)
            results["ricci"] = {
                "status": "partial_implementation", 
                "message": "Ricci tensor computation from Christoffel symbols requires contraction. Use sympy.diffgeom for complete implementation."
            }
        
        if "ricci_scalar" in compute:
            results["ricci_scalar"] = {
                "status": "partial_implementation",
                "message": "Ricci scalar R = g^{ij} R_{ij}. Use sympy.diffgeom for complete implementation."
            }
        
        if "geodesics" in compute:
            # Geodesic equation: d²x^μ/dτ² + Γ^μ_{αβ} (dx^α/dτ)(dx^β/dτ) = 0
            results["geodesics"] = {
                "equation_form": "d²x^μ/dτ² + Γ^μ_{αβ} (dx^α/dτ)(dx^β/dτ) = 0",
                "latex": r"\frac{d^2x^\mu}{d\tau^2} + \Gamma^\mu_{\alpha\beta} \frac{dx^\alpha}{d\tau}\frac{dx^\beta}{d\tau} = 0",
                "message": "Use computed Christoffel symbols with specific initial conditions to solve geodesics numerically."
            }
        
        return {
            "metric_determinant": str(sp.simplify(g.det())),
            "coordinates": coords,
            "computed": compute,
            "results": results
        }
        
    except Exception as e:
        raise ValueError(f"Tensor algebra computation failed: {e}")


def handle_quantum_ops(params: Dict[str, Any]) -> Dict[str, Any]:
    """Quantum operator utilities (commutators, matrix representations)."""
    operators = params["operators"]
    task = params["task"]
    
    try:
        if task == "commutator":
            if len(operators) != 2:
                raise ValueError("Commutator requires exactly 2 operators")
            
            # Parse operators as sympy expressions
            A = safe_sympify(operators[0])
            B = safe_sympify(operators[1])
            
            # For symbolic operators, compute [A,B] = AB - BA
            commutator = A * B - B * A
            
            return {
                "operators": operators,
                "commutator": str(sp.simplify(commutator)),
                "latex": sp.latex(sp.simplify(commutator)),
                "task": task
            }
        
        elif task == "matrix_rep":
            if not _HAS_QUTIP:
                return {
                    "error": "qutip not available",
                    "message": "Install qutip for matrix representations of quantum operators",
                    "operators": operators,
                    "task": task
                }
            
            # Basic matrix representations for common operators
            matrices = {}
            for op_name in operators:
                if op_name.lower() in ["sigma_x", "pauli_x", "sx"]:
                    matrices[op_name] = qutip.sigmax().full().tolist()
                elif op_name.lower() in ["sigma_y", "pauli_y", "sy"]:
                    matrices[op_name] = qutip.sigmay().full().tolist()
                elif op_name.lower() in ["sigma_z", "pauli_z", "sz"]:
                    matrices[op_name] = qutip.sigmaz().full().tolist()
                elif op_name.lower() in ["a", "annihilation"]:
                    matrices[op_name] = qutip.destroy(4).full().tolist()  # 4-level truncation
                elif op_name.lower() in ["a_dag", "creation"]:
                    matrices[op_name] = qutip.create(4).full().tolist()
                else:
                    matrices[op_name] = f"Unknown operator: {op_name}"
            
            return {
                "operators": operators,
                "matrices": matrices,
                "task": task
            }
        
        else:
            raise ValueError(f"Unknown task: {task}")
            
    except Exception as e:
        raise ValueError(f"Quantum operator computation failed: {e}")


def handle_quantum_solve(params: Dict[str, Any]) -> Dict[str, Any]:
    """Quantum solver for standard problems or custom Hamiltonians."""
    problem = params["problem"]
    hamiltonian = params.get("hamiltonian")
    solve_params = params.get("params", {})
    
    try:
        if problem == "sho":
            # Simple Harmonic Oscillator
            n_levels = solve_params.get("n_levels", 5)
            omega = solve_params.get("omega", 1.0)
            hbar = solve_params.get("hbar", 1.0)
            
            # Energy eigenvalues: E_n = ħω(n + 1/2)
            energies = [hbar * omega * (n + 0.5) for n in range(n_levels)]
            
            # Wavefunctions (symbolic form)
            x = sp.Symbol('x')
            wavefunctions = []
            for n in range(min(n_levels, 4)):  # Limit for computational efficiency
                # Hermite polynomial approach (simplified)
                if n == 0:
                    psi_n = f"(mω/πħ)^(1/4) * exp(-mωx²/2ħ)"
                elif n == 1:
                    psi_n = f"(mω/πħ)^(1/4) * sqrt(2mω/ħ) * x * exp(-mωx²/2ħ)"
                else:
                    psi_n = f"ψ_{n}(x) - use Hermite polynomials H_{n}"
                wavefunctions.append(psi_n)
            
            return {
                "problem": "sho",
                "parameters": {"omega": omega, "hbar": hbar, "n_levels": n_levels},
                "energies": energies,
                "energy_units": "ħω",
                "wavefunctions": wavefunctions,
                "ground_state_energy": energies[0]
            }
        
        elif problem == "particle_in_box":
            # Infinite square well
            L = solve_params.get("L", 1.0)
            n_levels = solve_params.get("n_levels", 5)
            m = solve_params.get("m", 1.0)
            hbar = solve_params.get("hbar", 1.0)
            
            # Energy eigenvalues: E_n = n²π²ħ²/2mL²
            energies = [n**2 * sp.pi**2 * hbar**2 / (2 * m * L**2) for n in range(1, n_levels + 1)]
            
            # Wavefunctions: ψ_n(x) = sqrt(2/L) * sin(nπx/L)
            wavefunctions = [f"sqrt(2/L) * sin({n}πx/L)" for n in range(1, n_levels + 1)]
            
            return {
                "problem": "particle_in_box",
                "parameters": {"L": L, "m": m, "hbar": hbar, "n_levels": n_levels},
                "energies": [float(E.evalf()) for E in energies],
                "energy_units": "ħ²π²/2mL²",
                "wavefunctions": wavefunctions
            }
        
        elif problem == "custom":
            if not hamiltonian:
                raise ValueError("Custom problem requires hamiltonian parameter")
            
            return {
                "problem": "custom",
                "hamiltonian": hamiltonian,
                "message": "Custom Hamiltonian solving requires numerical diagonalization. Use qutip.Qobj(H).eigenstates() for matrix Hamiltonians.",
                "suggestion": "Provide matrix representation or use symbolic eigenvalue solving with sympy"
            }
        
        else:
            raise ValueError(f"Unknown problem type: {problem}")
            
    except Exception as e:
        raise ValueError(f"Quantum solver failed: {e}")


def handle_quantum_visualize(params: Dict[str, Any]) -> Dict[str, Any]:
    """Visualize quantum states (Bloch sphere, probability density)."""
    state = params["state"]
    kind = params["kind"]
    
    try:
        if kind == "bloch":
            if not _HAS_QUTIP:
                return {
                    "error": "qutip not available",
                    "message": "Install qutip for Bloch sphere visualization",
                    "state": state,
                    "kind": kind
                }
            
            # Parse state (simplified - assume it's a qubit state)
            # For demo, create a simple Bloch sphere representation
            try:
                # Parse state as |0⟩ + |1⟩ coefficients
                if "+" in state:
                    # Superposition state
                    bloch_vector = [1/sp.sqrt(2), 0, 1/sp.sqrt(2)]  # |+⟩ state
                else:
                    bloch_vector = [0, 0, 1]  # |0⟩ state
                
                return {
                    "state": state,
                    "kind": "bloch",
                    "bloch_vector": [float(x.evalf()) if hasattr(x, 'evalf') else float(x) for x in bloch_vector],
                    "message": "Use qutip.Bloch() for interactive visualization"
                }
            except Exception:
                return {
                    "error": "state_parse_failed",
                    "message": "Could not parse quantum state. Use qutip.Qobj format.",
                    "state": state
                }
        
        elif kind == "prob_density":
            return {
                "state": state,
                "kind": "prob_density",
                "message": "Probability density visualization requires wavefunction ψ(x). Use |ψ(x)|² plotting.",
                "suggestion": "Provide wavefunction expression and use plot_function_2d with f='abs(psi)**2'"
            }
        
        else:
            raise ValueError(f"Unknown visualization kind: {kind}")
            
    except Exception as e:
        raise ValueError(f"Quantum visualization failed: {e}")


def handle_statmech_partition(params: Dict[str, Any]) -> Dict[str, Any]:
    """Statistical mechanics partition function and thermodynamic quantities."""
    energy_levels = params.get("energy_levels", [])
    temperature = params.get("temperature", 300.0)  # Kelvin
    degeneracies = params.get("degeneracies", None)
    
    try:
        if not energy_levels:
            raise ValueError("energy_levels parameter required")
        
        # Boltzmann constant
        k_B = 1.380649e-23  # J/K (CODATA 2018)
        beta = 1.0 / (k_B * temperature)
        
        # Convert energy levels to numpy array
        E = np.array(energy_levels, dtype=float)
        
        # Degeneracies (default to 1 for all levels)
        if degeneracies is None:
            g = np.ones_like(E)
        else:
            g = np.array(degeneracies, dtype=float)
            if len(g) != len(E):
                raise ValueError("degeneracies length must match energy_levels length")
        
        # Shift energies to avoid numerical overflow (subtract ground state)
        E_shifted = E - E[0]
        
        # Partition function Z = Σ g_i * exp(-β E_i)
        Z = np.sum(g * np.exp(-beta * E_shifted))
        
        # Thermodynamic quantities
        ln_Z = np.log(Z)
        
        # Internal energy U = -∂ln(Z)/∂β = Σ E_i * g_i * exp(-β E_i) / Z
        U = np.sum(E * g * np.exp(-beta * E_shifted)) / Z
        
        # Heat capacity C_V = ∂U/∂T = k_B * β² * (⟨E²⟩ - ⟨E⟩²)
        E_avg = U
        E2_avg = np.sum(E**2 * g * np.exp(-beta * E_shifted)) / Z
        C_V = k_B * beta**2 * (E2_avg - E_avg**2)
        
        # Helmholtz free energy F = -k_B * T * ln(Z)
        F = -k_B * temperature * ln_Z
        
        # Entropy S = k_B * (ln(Z) + β * U)
        S = k_B * (ln_Z + beta * U)
        
        # Population probabilities
        populations = g * np.exp(-beta * E_shifted) / Z
        
        return {
            "temperature": temperature,
            "temperature_unit": "K",
            "energy_levels": energy_levels,
            "degeneracies": g.tolist(),
            "partition_function": float(Z),
            "ln_partition_function": float(ln_Z),
            "internal_energy": float(U),
            "internal_energy_unit": "J",
            "heat_capacity": float(C_V),
            "heat_capacity_unit": "J/K",
            "helmholtz_free_energy": float(F),
            "helmholtz_free_energy_unit": "J",
            "entropy": float(S),
            "entropy_unit": "J/K",
            "populations": populations.tolist(),
            "most_populated_level": int(np.argmax(populations))
        }
        
    except Exception as e:
        raise ValueError(f"Statistical mechanics computation failed: {e}")


def handle_request(msg: Dict[str, Any]) -> Dict[str, Any]:
    """Handle a single JSON-RPC request."""
    method = msg["method"]
    params = msg.get("params", {})
    
    # CAS methods
    if method == "cas_evaluate":
        return handle_cas_evaluate(params)
    elif method == "cas_diff":
        return handle_cas_diff(params)
    elif method == "cas_integrate":
        return handle_cas_integrate(params)
    elif method == "cas_solve_equation":
        return handle_cas_solve_equation(params)
    elif method == "cas_solve_ode":
        return handle_cas_solve_ode(params)
    elif method == "cas_propagate_uncertainty":
        return handle_cas_propagate_uncertainty(params)
    
    # Units and Constants methods
    elif method == "units_convert":
        return handle_units_convert(params)
    elif method == "constants_get":
        return handle_constants_get(params)
    
    # Plot methods
    elif method == "plot_function_2d":
        return handle_plot_function_2d(params)
    elif method == "plot_parametric_2d":
        return handle_plot_parametric_2d(params)
    elif method == "plot_field_2d":
        return handle_plot_field_2d(params)
    elif method == "plot_phase_portrait":
        return handle_plot_phase_portrait(params)
    elif method == "plot_surface_3d":
        return handle_plot_surface_3d(params)
    elif method == "plot_contour_2d":
        return handle_plot_contour_2d(params)
    elif method == "accel_caps":
        return accel_caps()
    
    # Phase 3 methods
    elif method == "tensor_algebra":
        return handle_tensor_algebra(params)
    elif method == "quantum_ops":
        return handle_quantum_ops(params)
    elif method == "quantum_solve":
        return handle_quantum_solve(params)
    elif method == "quantum_visualize":
        return handle_quantum_visualize(params)
    elif method == "statmech_partition":
        return handle_statmech_partition(params)
    
    # Phase 4 methods - Data I/O
    elif method == "data_import_hdf5":
        return data_io.data_import_hdf5(**params)
    elif method == "data_import_fits":
        return data_io.data_import_fits(**params)
    elif method == "data_import_root":
        return data_io.data_import_root(**params)
    elif method == "data_export_hdf5":
        return data_io.data_export_hdf5(**params)
    
    # Phase 4 methods - Signal Processing
    elif method == "data_fft":
        return signal_processing.data_fft(**params)
    elif method == "data_filter":
        return signal_processing.data_filter(**params)
    elif method == "data_spectrogram":
        return signal_processing.data_spectrogram(**params)
    elif method == "data_wavelet":
        return signal_processing.data_wavelet(**params)
    
    # Phase 4 methods - External APIs
    elif method == "api_arxiv":
        return external_apis.api_arxiv(**params)
    elif method == "api_cern":
        return external_apis.api_cern(**params)
    elif method == "api_nasa":
        return external_apis.api_nasa(**params)
    elif method == "api_nist":
        return external_apis.api_nist(**params)
    
    # Phase 4 methods - Export
    elif method == "export_overleaf":
        return export_utils.export_overleaf(**params)
    elif method == "export_github":
        return export_utils.export_github(**params)
    elif method == "export_zenodo":
        return export_utils.export_zenodo(**params)
    elif method == "export_jupyter":
        return export_utils.export_jupyter(**params)
    
    else:
        raise ValueError(f"Unknown method: {method}")


def main():
    """Main worker loop - read JSON-RPC requests from stdin, write responses to stdout."""
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
            
        try:
            request = json.loads(line)
            result = handle_request(request)
            response = {
                "id": request.get("id"),
                "result": result
            }
        except Exception as e:
            response = {
                "id": request.get("id") if 'request' in locals() else None,
                "error": {
                    "code": -32603,
                    "message": str(e),
                    "data": traceback.format_exc()
                }
            }
        
        print(json.dumps(response))
        sys.stdout.flush()


if __name__ == "__main__":
    main()
