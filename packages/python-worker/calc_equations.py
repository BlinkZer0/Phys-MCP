"""
Equation solving operations for graphing calculator
"""

import numpy as np
import sympy as sp
from sympy import solve, symbols
from scipy import optimize
from typing import Dict, List, Any

def solve_equation(params: Dict[str, Any]) -> Dict[str, Any]:
    """Solve equation for variable"""
    equation = params.get('equation', '')
    variable = params.get('variable', 'x')
    
    try:
        # Parse equation (handle = sign)
        if '=' in equation:
            left, right = equation.split('=', 1)
            eq = sp.parse_expr(left) - sp.parse_expr(right)
        else:
            eq = sp.parse_expr(equation)
        
        var = sp.Symbol(variable)
        solutions = solve(eq, var)
        
        # Format solutions
        solution_strs = [str(sol) for sol in solutions]
        numeric_solutions = []
        
        for sol in solutions:
            try:
                numeric_solutions.append(float(sol.evalf()))
            except:
                numeric_solutions.append(None)
        
        return {
            'success': True,
            'equation': equation,
            'variable': variable,
            'solutions': solution_strs,
            'numeric_solutions': numeric_solutions,
            'latex_equation': sp.latex(eq),
            'num_solutions': len(solutions)
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

def solve_system(params: Dict[str, Any]) -> Dict[str, Any]:
    """Solve system of equations"""
    equations = params.get('equations', [])
    solve_for = params.get('solve_for', [])
    
    try:
        # Parse equations
        eqs = []
        for eq_str in equations:
            if '=' in eq_str:
                left, right = eq_str.split('=', 1)
                eq = sp.parse_expr(left) - sp.parse_expr(right)
            else:
                eq = sp.parse_expr(eq_str)
            eqs.append(eq)
        
        # Get variables to solve for
        if not solve_for:
            # Auto-detect variables
            all_symbols = set()
            for eq in eqs:
                all_symbols.update(eq.free_symbols)
            solve_for = [str(sym) for sym in all_symbols]
        
        vars_to_solve = [sp.Symbol(var) for var in solve_for]
        
        # Solve system
        solutions = solve(eqs, vars_to_solve)
        
        # Format solutions
        if isinstance(solutions, dict):
            solution_dict = {str(k): str(v) for k, v in solutions.items()}
            numeric_dict = {}
            for k, v in solutions.items():
                try:
                    numeric_dict[str(k)] = float(v.evalf())
                except:
                    numeric_dict[str(k)] = None
        else:
            solution_dict = {}
            numeric_dict = {}
        
        return {
            'success': True,
            'equations': equations,
            'variables': solve_for,
            'solutions': solution_dict,
            'numeric_solutions': numeric_dict,
            'system_consistent': len(solution_dict) > 0
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

def find_roots(params: Dict[str, Any]) -> Dict[str, Any]:
    """Find roots of function numerically"""
    function = params.get('function', '')
    x_range = params.get('x_range', [-10, 10])
    
    try:
        # Convert to numpy function
        x_sym = sp.Symbol('x')
        expr = sp.parse_expr(function)
        f = sp.lambdify(x_sym, expr, 'numpy')
        
        # Find roots using scipy
        x_vals = np.linspace(x_range[0], x_range[1], 1000)
        y_vals = f(x_vals)
        
        # Find sign changes
        roots = []
        for i in range(len(y_vals) - 1):
            if y_vals[i] * y_vals[i + 1] < 0:
                # Use Brent's method to find precise root
                try:
                    root = optimize.brentq(f, x_vals[i], x_vals[i + 1])
                    roots.append(root)
                except:
                    pass
        
        # Remove duplicates
        roots = list(set([round(r, 8) for r in roots]))
        roots.sort()
        
        return {
            'success': True,
            'function': function,
            'x_range': x_range,
            'roots': roots,
            'num_roots': len(roots)
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}
