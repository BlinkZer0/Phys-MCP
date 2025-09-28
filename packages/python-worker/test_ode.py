#!/usr/bin/env python3
"""
Test ODE solving functionality
"""

import sys
import sympy as sp
from sympy import *
import json

def cas_solve_ode_direct(ode_str, symbol_str, func_str, ics=None):
    """Direct ODE solving without decorators"""
    # Parse symbols and function
    symbol = sp.Symbol(symbol_str)
    func = sp.Function(func_str)
    
    # Parse the ODE string
    # Replace function notation like y'' with Derivative(y(x), x, 2)
    ode_processed = ode_str
    
    # Handle common ODE notations
    if func_str + "''" in ode_str:
        # Second derivative
        ode_processed = ode_processed.replace(
            func_str + "''", 
            f"Derivative({func_str}({symbol_str}), {symbol_str}, 2)"
        )
    if func_str + "'" in ode_str:
        # First derivative
        ode_processed = ode_processed.replace(
            func_str + "'", 
            f"Derivative({func_str}({symbol_str}), {symbol_str})"
        )
    if func_str in ode_str and f"{func_str}({symbol_str})" not in ode_processed:
        # Replace bare function with function of variable
        ode_processed = ode_processed.replace(func_str, f"{func_str}({symbol_str})")
    
    print(f"Original ODE: {ode_str}")
    print(f"Processed ODE: {ode_processed}")
    
    try:
        # Parse the processed ODE
        ode_expr = sp.sympify(ode_processed)
        print(f"Parsed ODE expression: {ode_expr}")
        
        # Solve the ODE
        solution = sp.dsolve(ode_expr, func(symbol))
        print(f"Solution: {solution}")
        
        # Apply initial conditions if provided
        if ics:
            # This is a simplified approach - full IC handling is more complex
            pass
        
        return {
            "solution": str(solution),
            "ode": ode_str,
            "symbol": symbol_str,
            "function": func_str,
            "initial_conditions": ics
        }
        
    except Exception as e:
        print(f"Error solving ODE: {e}")
        raise

def test_ode_solving():
    """Test ODE solving functionality"""
    print("🔬 Testing ODE Solving Functionality")
    print("="*50)
    
    tests_passed = 0
    tests_total = 0
    
    # Test 1: Simple first-order ODE: y' = y
    print("\n1. Testing simple first-order ODE: y' = y")
    tests_total += 1
    try:
        result = cas_solve_ode_direct("y' - y", "x", "y")
        print(f"   Result: {json.dumps(result, indent=2)}")
        if "exp(x)" in result["solution"]:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected solution with exp(x), got {result['solution']}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 2: Second-order harmonic oscillator: y'' + y = 0
    print("\n2. Testing harmonic oscillator: y'' + y = 0")
    tests_total += 1
    try:
        result = cas_solve_ode_direct("y'' + y", "x", "y")
        print(f"   Result: {json.dumps(result, indent=2)}")
        solution = result["solution"]
        if "sin" in solution and "cos" in solution:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected solution with sin/cos, got {solution}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 3: First-order linear ODE: y' + 2*y = 0
    print("\n3. Testing first-order linear: y' + 2*y = 0")
    tests_total += 1
    try:
        result = cas_solve_ode_direct("y' + 2*y", "x", "y")
        print(f"   Result: {json.dumps(result, indent=2)}")
        if "exp(-2*x)" in result["solution"]:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected solution with exp(-2*x), got {result['solution']}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Summary
    print(f"\n{'='*50}")
    print(f"🏁 ODE TEST SUMMARY")
    print(f"{'='*50}")
    print(f"Tests passed: {tests_passed}/{tests_total}")
    print(f"Success rate: {tests_passed/tests_total*100:.1f}%")
    
    if tests_passed == tests_total:
        print("🎉 ALL ODE TESTS PASSED!")
        return True
    else:
        print("⚠️  Some ODE tests failed.")
        return False

if __name__ == "__main__":
    success = test_ode_solving()
    sys.exit(0 if success else 1)
