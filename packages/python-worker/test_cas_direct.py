#!/usr/bin/env python3
"""
Direct test of CAS functionality without decorators
"""

import sys
import sympy as sp
from sympy import *
import json

def cas_evaluate_direct(expr_str, variables=None):
    """Direct CAS evaluation without decorators"""
    if variables is None:
        variables = {}
    
    # Parse the expression
    expr = sp.sympify(expr_str)
    
    # Substitute variables if provided
    if variables:
        # Convert variable names to symbols
        substitutions = {}
        for var_name, var_value in variables.items():
            if isinstance(var_value, dict):
                # Handle uncertainty format
                substitutions[sp.Symbol(var_name)] = var_value["value"]
            else:
                substitutions[sp.Symbol(var_name)] = var_value
        expr = expr.subs(substitutions)
    
    # Evaluate the expression
    result = expr.evalf()
    
    return {
        "result": float(result) if result.is_number else str(result),
        "expression": str(expr),
        "original": expr_str
    }

def cas_diff_direct(expr_str, symbol_str, order=1):
    """Direct CAS differentiation without decorators"""
    expr = sp.sympify(expr_str)
    symbol = sp.Symbol(symbol_str)
    
    # Compute derivative
    derivative = sp.diff(expr, symbol, order)
    
    return {
        "result": str(derivative),
        "expression": str(expr),
        "symbol": symbol_str,
        "order": order
    }

def cas_integrate_direct(expr_str, symbol_str, bounds=None):
    """Direct CAS integration without decorators"""
    expr = sp.sympify(expr_str)
    symbol = sp.Symbol(symbol_str)
    
    if bounds:
        # Definite integral
        result = sp.integrate(expr, (symbol, bounds[0], bounds[1]))
        return {
            "result": float(result) if result.is_number else str(result),
            "expression": str(expr),
            "symbol": symbol_str,
            "bounds": bounds,
            "type": "definite"
        }
    else:
        # Indefinite integral
        result = sp.integrate(expr, symbol)
        return {
            "result": str(result),
            "expression": str(expr),
            "symbol": symbol_str,
            "type": "indefinite"
        }

def cas_solve_equation_direct(equation_str, symbol_str):
    """Direct CAS equation solving without decorators"""
    # Parse equation (assume it equals zero)
    if "=" in equation_str:
        left, right = equation_str.split("=")
        equation = sp.sympify(left) - sp.sympify(right)
    else:
        equation = sp.sympify(equation_str)
    
    symbol = sp.Symbol(symbol_str)
    
    # Solve the equation
    solutions = sp.solve(equation, symbol)
    
    # Convert solutions to float/string
    solution_values = []
    for sol in solutions:
        if sol.is_number:
            solution_values.append(float(sol))
        else:
            solution_values.append(str(sol))
    
    return {
        "solutions": solution_values,
        "equation": str(equation),
        "symbol": symbol_str
    }

def test_cas_direct():
    """Test CAS functions directly"""
    print("🧮 Testing CAS Functions Directly (No Decorators)")
    print("="*60)
    
    tests_passed = 0
    tests_total = 0
    
    # Test 1: Basic evaluation
    print("\n1. Testing cas_evaluate: 2 + 3 * 4")
    tests_total += 1
    try:
        result = cas_evaluate_direct("2 + 3 * 4")
        print(f"   Result: {json.dumps(result, indent=2)}")
        if result["result"] == 14.0:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected 14.0, got {result['result']}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 2: Evaluation with variables
    print("\n2. Testing cas_evaluate with variables: x^2 + 2*x + 1, x=3")
    tests_total += 1
    try:
        result = cas_evaluate_direct("x**2 + 2*x + 1", {"x": 3})
        print(f"   Result: {json.dumps(result, indent=2)}")
        if result["result"] == 16.0:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected 16.0, got {result['result']}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 3: Differentiation
    print("\n3. Testing cas_diff: d/dx(x^3 + 2*x^2 + x + 1)")
    tests_total += 1
    try:
        result = cas_diff_direct("x**3 + 2*x**2 + x + 1", "x")
        print(f"   Result: {json.dumps(result, indent=2)}")
        expected = "3*x**2 + 4*x + 1"
        if result["result"] == expected:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected '{expected}', got '{result['result']}'")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 4: Integration (indefinite)
    print("\n4. Testing cas_integrate: ∫(2*x + 3)dx")
    tests_total += 1
    try:
        result = cas_integrate_direct("2*x + 3", "x")
        print(f"   Result: {json.dumps(result, indent=2)}")
        expected = "x**2 + 3*x"
        if result["result"] == expected:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected '{expected}', got '{result['result']}'")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 5: Definite integration
    print("\n5. Testing cas_integrate definite: ∫₀²x²dx")
    tests_total += 1
    try:
        result = cas_integrate_direct("x**2", "x", [0, 2])
        print(f"   Result: {json.dumps(result, indent=2)}")
        expected = 8/3
        if abs(result["result"] - expected) < 1e-10:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected {expected}, got {result['result']}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 6: Equation solving
    print("\n6. Testing cas_solve_equation: x^2 - 4 = 0")
    tests_total += 1
    try:
        result = cas_solve_equation_direct("x**2 - 4", "x")
        print(f"   Result: {json.dumps(result, indent=2)}")
        solutions = set(result["solutions"])
        expected = {-2.0, 2.0}
        if solutions == expected:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected {expected}, got {solutions}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 7: Trigonometric derivative
    print("\n7. Testing cas_diff: d/dx(sin(x))")
    tests_total += 1
    try:
        result = cas_diff_direct("sin(x)", "x")
        print(f"   Result: {json.dumps(result, indent=2)}")
        expected = "cos(x)"
        if result["result"] == expected:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected '{expected}', got '{result['result']}'")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 8: Complex expression
    print("\n8. Testing cas_evaluate: sqrt(16) + log(exp(2)) + sin(pi/2)")
    tests_total += 1
    try:
        result = cas_evaluate_direct("sqrt(16) + log(exp(2)) + sin(pi/2)")
        print(f"   Result: {json.dumps(result, indent=2)}")
        expected = 7.0  # 4 + 2 + 1
        if abs(result["result"] - expected) < 1e-10:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected {expected}, got {result['result']}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Summary
    print(f"\n{'='*60}")
    print(f"🏁 DIRECT CAS TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Tests passed: {tests_passed}/{tests_total}")
    print(f"Success rate: {tests_passed/tests_total*100:.1f}%")
    
    if tests_passed == tests_total:
        print("🎉 ALL DIRECT CAS TESTS PASSED!")
        print("The core CAS functionality is working correctly.")
        return True
    else:
        print("⚠️  Some direct CAS tests failed.")
        return False

if __name__ == "__main__":
    success = test_cas_direct()
    sys.exit(0 if success else 1)
