#!/usr/bin/env python3
"""
Simple test for CAS functionality
"""

import sympy as sp
from sympy import *
import json

def test_basic_cas():
    """Test basic CAS operations directly"""
    print("🧮 Testing Basic CAS Operations")
    print("="*50)
    
    # Test 1: Basic arithmetic
    print("\n1. Basic arithmetic: 2 + 3 * 4")
    result = 2 + 3 * 4
    print(f"   Result: {result} (Expected: 14)")
    assert result == 14
    
    # Test 2: Symbolic expression
    print("\n2. Symbolic expression: x^2 + 2*x + 1 with x=3")
    x = sp.Symbol('x')
    expr = x**2 + 2*x + 1
    result = expr.subs(x, 3)
    print(f"   Expression: {expr}")
    print(f"   Result: {result} (Expected: 16)")
    assert result == 16
    
    # Test 3: Differentiation
    print("\n3. Derivative: d/dx(x^3 + 2*x^2 + x + 1)")
    expr = x**3 + 2*x**2 + x + 1
    derivative = sp.diff(expr, x)
    expected = 3*x**2 + 4*x + 1
    print(f"   Expression: {expr}")
    print(f"   Derivative: {derivative}")
    print(f"   Expected: {expected}")
    assert derivative.equals(expected)
    
    # Test 4: Integration
    print("\n4. Integral: ∫(2*x + 3)dx")
    expr = 2*x + 3
    integral = sp.integrate(expr, x)
    expected = x**2 + 3*x
    print(f"   Expression: {expr}")
    print(f"   Integral: {integral}")
    print(f"   Expected: {expected} + C")
    # Note: SymPy doesn't add the constant of integration automatically
    
    # Test 5: Definite integration
    print("\n5. Definite integral: ∫₀²x²dx")
    expr = x**2
    result = sp.integrate(expr, (x, 0, 2))
    expected = sp.Rational(8, 3)
    print(f"   Expression: {expr}")
    print(f"   Result: {result} (Expected: 8/3)")
    assert result == expected
    
    # Test 6: Equation solving
    print("\n6. Solve equation: x^2 - 4 = 0")
    equation = x**2 - 4
    solutions = sp.solve(equation, x)
    expected = [-2, 2]
    print(f"   Equation: {equation} = 0")
    print(f"   Solutions: {solutions}")
    print(f"   Expected: {expected}")
    assert set(solutions) == set(expected)
    
    # Test 7: Trigonometric derivative
    print("\n7. Derivative: d/dx(sin(x))")
    expr = sp.sin(x)
    derivative = sp.diff(expr, x)
    expected = sp.cos(x)
    print(f"   Expression: {expr}")
    print(f"   Derivative: {derivative}")
    print(f"   Expected: {expected}")
    assert derivative.equals(expected)
    
    # Test 8: Exponential integral
    print("\n8. Integral: ∫e^x dx")
    expr = sp.exp(x)
    integral = sp.integrate(expr, x)
    expected = sp.exp(x)
    print(f"   Expression: {expr}")
    print(f"   Integral: {integral}")
    print(f"   Expected: {expected} + C")
    assert integral.equals(expected)
    
    print("\n" + "="*50)
    print("✅ ALL BASIC CAS TESTS PASSED!")
    print("SymPy is working correctly for CAS operations.")
    
    return True

if __name__ == "__main__":
    try:
        test_basic_cas()
        print("\n🎉 CAS functionality is working properly!")
    except Exception as e:
        print(f"\n❌ CAS test failed: {e}")
        import traceback
        traceback.print_exc()
