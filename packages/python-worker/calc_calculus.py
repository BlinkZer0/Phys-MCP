"""
Calculus operations for graphing calculator
"""

import sympy as sp
from sympy import diff, integrate, limit, series, latex, Symbol, oo
from typing import Dict, Any

def derivative(params: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate derivative"""
    expression = params.get('expression', '')
    variable = params.get('variable', 'x')
    order = params.get('order', 1)
    
    try:
        expr = sp.parse_expr(expression)
        var = Symbol(variable)
        
        # Calculate derivative
        derivative_result = expr
        for _ in range(order):
            derivative_result = diff(derivative_result, var)
        
        return {
            'success': True,
            'original': expression,
            'variable': variable,
            'order': order,
            'derivative': str(derivative_result),
            'latex_original': latex(expr),
            'latex_derivative': latex(derivative_result)
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

def integral(params: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate integral"""
    expression = params.get('expression', '')
    variable = params.get('variable', 'x')
    bounds = params.get('bounds', None)
    
    try:
        expr = sp.parse_expr(expression)
        var = Symbol(variable)
        
        if bounds:
            # Definite integral
            result = integrate(expr, (var, bounds[0], bounds[1]))
            integral_type = 'definite'
        else:
            # Indefinite integral
            result = integrate(expr, var)
            integral_type = 'indefinite'
        
        # Try to get numeric value
        numeric_value = None
        try:
            numeric_value = float(result.evalf())
        except:
            pass
        
        return {
            'success': True,
            'original': expression,
            'variable': variable,
            'bounds': bounds,
            'type': integral_type,
            'result': str(result),
            'numeric_value': numeric_value,
            'latex_original': latex(expr),
            'latex_result': latex(result)
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

def limit_calc(params: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate limit"""
    expression = params.get('expression', '')
    variable = params.get('variable', 'x')
    point = params.get('point', 0)
    
    try:
        expr = sp.parse_expr(expression)
        var = Symbol(variable)
        
        # Handle infinity
        if str(point).lower() in ['inf', 'infinity', '+inf']:
            point = oo
        elif str(point).lower() in ['-inf', '-infinity']:
            point = -oo
        
        result = limit(expr, var, point)
        
        return {
            'success': True,
            'expression': expression,
            'variable': variable,
            'point': str(point),
            'limit': str(result),
            'latex_expression': latex(expr),
            'latex_limit': latex(result)
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

def series_expansion(params: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate series expansion"""
    expression = params.get('expression', '')
    variable = params.get('variable', 'x')
    point = params.get('point', 0)
    order = params.get('order', 6)
    
    try:
        expr = sp.parse_expr(expression)
        var = Symbol(variable)
        
        result = series(expr, var, point, order)
        
        return {
            'success': True,
            'expression': expression,
            'variable': variable,
            'point': point,
            'order': order,
            'series': str(result),
            'latex_expression': latex(expr),
            'latex_series': latex(result)
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}
