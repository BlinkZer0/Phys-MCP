"""
Smart units evaluation with constant substitution and dimensional analysis
"""

import re
import pint
from typing import Dict, Any, Optional, Tuple
from sympy import symbols, sympify, N
from .constants import get_constant

# Initialize Pint unit registry
ureg = pint.UnitRegistry()

# Physical constants with their symbols
CONSTANTS_MAP = {
    'c': 'c',
    'h': 'h', 
    'hbar': 'hbar',
    'e': 'e',
    'k_B': 'k_B',
    'N_A': 'N_A',
    'G': 'G',
    'g': 'g',
    'epsilon_0': 'epsilon_0',
    'mu_0': 'mu_0',
    'sigma': 'sigma',
    'alpha': 'alpha',
    'a_0': 'a_0',
    'm_e': 'm_e',
    'm_p': 'm_p',
    'R': 'R'
}

def parse_expression_with_units(expr: str) -> Tuple[str, Dict[str, Any]]:
    """
    Parse expression like "2 m / 200 ms" into symbolic expression and units
    
    Returns:
        (symbolic_expr, units_dict)
    """
    # Pattern to match number + unit combinations
    unit_pattern = r'(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*([a-zA-Z_][a-zA-Z0-9_/*^]*)'
    
    matches = re.findall(unit_pattern, expr)
    
    if not matches:
        # No units found, return as-is
        return expr, {}
    
    # Replace unit expressions with variables
    symbolic_expr = expr
    units_dict = {}
    var_counter = 0
    
    for value_str, unit_str in matches:
        var_name = f'_var_{var_counter}'
        var_counter += 1
        
        # Replace in expression
        original = f'{value_str} {unit_str}'
        symbolic_expr = symbolic_expr.replace(original, var_name, 1)
        
        # Store value and unit
        try:
            quantity = ureg.Quantity(float(value_str), unit_str)
            units_dict[var_name] = {
                'value': float(value_str),
                'unit': unit_str,
                'quantity': quantity
            }
        except Exception as e:
            raise ValueError(f"Invalid unit '{unit_str}': {e}")
    
    return symbolic_expr, units_dict

def substitute_constants(expr: str, constants: Dict[str, bool]) -> Tuple[str, Dict[str, Any]]:
    """
    Substitute physical constants in expression
    
    Args:
        expr: Mathematical expression
        constants: Dict of constant names to substitute
        
    Returns:
        (modified_expr, constants_used)
    """
    constants_used = {}
    modified_expr = expr
    
    for const_name, should_substitute in constants.items():
        if should_substitute and const_name in CONSTANTS_MAP:
            try:
                const_data = get_constant(CONSTANTS_MAP[const_name])
                constants_used[const_name] = const_data
                
                # Replace constant symbol in expression
                # Use word boundaries to avoid partial matches
                pattern = r'\b' + re.escape(const_name) + r'\b'
                modified_expr = re.sub(pattern, str(const_data['value']), modified_expr)
                
            except Exception as e:
                print(f"Warning: Could not substitute constant {const_name}: {e}")
    
    return modified_expr, constants_used

def evaluate_with_units(expr: str, constants: Optional[Dict[str, bool]] = None) -> Dict[str, Any]:
    """
    Smart evaluation of expression with units and constants
    
    Args:
        expr: Expression like "2 m / 200 ms" or "c * 1 s"
        constants: Constants to substitute (e.g., {"c": True, "h": False})
        
    Returns:
        Result with value, unit, and metadata
    """
    try:
        # Step 1: Substitute constants if requested
        if constants:
            expr, constants_used = substitute_constants(expr, constants)
        else:
            constants_used = {}
        
        # Step 2: Parse units from expression
        symbolic_expr, units_dict = parse_expression_with_units(expr)
        
        # Step 3: If we have units, do dimensional analysis
        if units_dict:
            # Evaluate symbolically first
            sym_expr = sympify(symbolic_expr)
            
            # Substitute unit quantities
            substitutions = {}
            for var_name, unit_data in units_dict.items():
                substitutions[symbols(var_name)] = unit_data['value']
            
            # Get numerical result
            numerical_result = float(N(sym_expr.subs(substitutions)))
            
            # Calculate resulting units using Pint
            unit_expr = symbolic_expr
            for var_name, unit_data in units_dict.items():
                unit_expr = unit_expr.replace(var_name, f"({unit_data['value']} * {unit_data['unit']})")
            
            try:
                # Evaluate with Pint for unit calculation
                result_quantity = ureg.parse_expression(unit_expr)
                result_unit = str(result_quantity.units)
                result_value = float(result_quantity.magnitude)
                
                # Check if our numerical calculation matches Pint's
                if abs(result_value - numerical_result) > 1e-10 * abs(result_value):
                    print(f"Warning: Numerical mismatch between symbolic ({numerical_result}) and Pint ({result_value})")
                
            except Exception as e:
                # Fallback: use numerical result with unknown units
                result_value = numerical_result
                result_unit = "unknown"
                print(f"Warning: Could not determine units: {e}")
        
        else:
            # No units, just evaluate numerically
            try:
                sym_expr = sympify(expr)
                result_value = float(N(sym_expr))
                result_unit = "dimensionless"
            except Exception as e:
                raise ValueError(f"Could not evaluate expression '{expr}': {e}")
        
        # Determine if result is exact
        is_exact = all(
            const_data.get('uncertainty', 0) == 0 
            for const_data in constants_used.values()
        )
        
        return {
            'result': result_value,
            'value': result_value,
            'unit': result_unit,
            'exact': is_exact,
            'source': 'smart_evaluation',
            'constants_used': constants_used,
            'original_expression': expr,
            'units_parsed': units_dict
        }
        
    except Exception as e:
        raise ValueError(f"Smart evaluation failed: {e}")

def round_trip_test(value: float, from_unit: str, to_unit: str, tolerance: float = 1e-9) -> Dict[str, Any]:
    """
    Test round-trip unit conversion accuracy
    
    Args:
        value: Original value
        from_unit: Source unit
        to_unit: Target unit  
        tolerance: Maximum relative error allowed
        
    Returns:
        Test results with accuracy metrics
    """
    try:
        # Forward conversion
        original_qty = ureg.Quantity(value, from_unit)
        converted_qty = original_qty.to(to_unit)
        
        # Backward conversion
        back_converted_qty = converted_qty.to(from_unit)
        
        # Calculate errors
        absolute_error = abs(back_converted_qty.magnitude - value)
        relative_error = absolute_error / abs(value) if value != 0 else absolute_error
        
        # Test passes if relative error is within tolerance
        test_passed = relative_error < tolerance
        
        return {
            'passed': test_passed,
            'original_value': value,
            'original_unit': from_unit,
            'converted_value': converted_qty.magnitude,
            'converted_unit': to_unit,
            'back_converted_value': back_converted_qty.magnitude,
            'absolute_error': absolute_error,
            'relative_error': relative_error,
            'tolerance': tolerance,
            'precision_loss': not test_passed
        }
        
    except Exception as e:
        return {
            'passed': False,
            'error': str(e),
            'original_value': value,
            'original_unit': from_unit,
            'target_unit': to_unit
        }
