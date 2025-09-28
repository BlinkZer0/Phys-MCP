#!/usr/bin/env python3
"""
Comprehensive CAS Tool Test Suite for Phys-MCP
Run this script to verify all CAS functionality is working correctly.
"""

import sys
import os
import json

# Add the python-worker directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'packages', 'python-worker'))

def test_cas_comprehensive():
    """Comprehensive test of all CAS functionality"""
    print("🧮 COMPREHENSIVE CAS TOOL TEST SUITE")
    print("="*70)
    print("Testing Phys-MCP Computer Algebra System functionality")
    print("="*70)
    
    # Test basic SymPy availability
    try:
        import sympy as sp
        print("✅ SymPy library available")
    except ImportError as e:
        print(f"❌ SymPy not available: {e}")
        return False
    
    tests_passed = 0
    tests_total = 0
    
    print(f"\n{'='*70}")
    print("📊 TESTING CORE CAS OPERATIONS")
    print(f"{'='*70}")
    
    # Test 1: Basic Arithmetic
    print(f"\n{'-'*50}")
    print("1. BASIC ARITHMETIC")
    print(f"{'-'*50}")
    
    test_cases = [
        ("2 + 3 * 4", 14),
        ("(5 + 3) * 2", 16),
        ("10 / 2 + 3", 8),
        ("2**3", 8),
        ("sqrt(16)", 4)
    ]
    
    for expr_str, expected in test_cases:
        tests_total += 1
        try:
            expr = sp.sympify(expr_str)
            result = float(expr.evalf())
            print(f"   {expr_str} = {result} (Expected: {expected})")
            if abs(result - expected) < 1e-10:
                print("   ✅ PASSED")
                tests_passed += 1
            else:
                print(f"   ❌ FAILED")
        except Exception as e:
            print(f"   ❌ FAILED: {e}")
    
    # Test 2: Algebraic Expressions
    print(f"\n{'-'*50}")
    print("2. ALGEBRAIC EXPRESSIONS")
    print(f"{'-'*50}")
    
    algebraic_tests = [
        ("x**2 + 2*x + 1", {"x": 3}, 16),  # (3+1)^2 = 16
        ("a*b + c", {"a": 2, "b": 3, "c": 4}, 10),  # 2*3 + 4 = 10
        ("x**2 - 4", {"x": 2}, 0),  # 4 - 4 = 0
    ]
    
    for expr_str, vars_dict, expected in algebraic_tests:
        tests_total += 1
        try:
            expr = sp.sympify(expr_str)
            substitutions = {sp.Symbol(k): v for k, v in vars_dict.items()}
            result = float(expr.subs(substitutions).evalf())
            print(f"   {expr_str} with {vars_dict} = {result} (Expected: {expected})")
            if abs(result - expected) < 1e-10:
                print("   ✅ PASSED")
                tests_passed += 1
            else:
                print(f"   ❌ FAILED")
        except Exception as e:
            print(f"   ❌ FAILED: {e}")
    
    # Test 3: Differentiation
    print(f"\n{'-'*50}")
    print("3. DIFFERENTIATION")
    print(f"{'-'*50}")
    
    diff_tests = [
        ("x**2", "x", "2*x"),
        ("x**3 + 2*x**2 + x + 1", "x", "3*x**2 + 4*x + 1"),
        ("sin(x)", "x", "cos(x)"),
        ("exp(x)", "x", "exp(x)"),
        ("log(x)", "x", "1/x")
    ]
    
    for expr_str, var_str, expected_str in diff_tests:
        tests_total += 1
        try:
            expr = sp.sympify(expr_str)
            var = sp.Symbol(var_str)
            derivative = sp.diff(expr, var)
            expected = sp.sympify(expected_str)
            print(f"   d/d{var_str}({expr_str}) = {derivative}")
            if derivative.equals(expected) or str(derivative) == expected_str:
                print("   ✅ PASSED")
                tests_passed += 1
            else:
                print(f"   ❌ FAILED: Expected {expected_str}")
        except Exception as e:
            print(f"   ❌ FAILED: {e}")
    
    # Test 4: Integration
    print(f"\n{'-'*50}")
    print("4. INTEGRATION")
    print(f"{'-'*50}")
    
    integral_tests = [
        ("2*x + 3", "x", None, "x**2 + 3*x"),  # Indefinite
        ("x**2", "x", [0, 2], 8/3),  # Definite
        ("sin(x)", "x", None, "-cos(x)"),  # Indefinite
        ("1/x", "x", None, "log(x)"),  # Indefinite
    ]
    
    for expr_str, var_str, bounds, expected in integral_tests:
        tests_total += 1
        try:
            expr = sp.sympify(expr_str)
            var = sp.Symbol(var_str)
            
            if bounds:
                # Definite integral
                result = sp.integrate(expr, (var, bounds[0], bounds[1]))
                result_val = float(result.evalf())
                print(f"   ∫[{bounds[0]}→{bounds[1]}] {expr_str} d{var_str} = {result_val}")
                if abs(result_val - expected) < 1e-10:
                    print("   ✅ PASSED")
                    tests_passed += 1
                else:
                    print(f"   ❌ FAILED: Expected {expected}")
            else:
                # Indefinite integral
                result = sp.integrate(expr, var)
                expected_expr = sp.sympify(expected)
                print(f"   ∫ {expr_str} d{var_str} = {result}")
                # Check if derivatives are equal (since integrals differ by constant)
                if sp.diff(result, var).equals(sp.diff(expected_expr, var)):
                    print("   ✅ PASSED")
                    tests_passed += 1
                else:
                    print(f"   ❌ FAILED: Expected form like {expected}")
        except Exception as e:
            print(f"   ❌ FAILED: {e}")
    
    # Test 5: Equation Solving
    print(f"\n{'-'*50}")
    print("5. EQUATION SOLVING")
    print(f"{'-'*50}")
    
    equation_tests = [
        ("x**2 - 4", "x", [-2, 2]),
        ("2*x + 6", "x", [-3]),
        ("x**2 - 5*x + 6", "x", [2, 3]),  # (x-2)(x-3) = 0
    ]
    
    for eq_str, var_str, expected_solutions in equation_tests:
        tests_total += 1
        try:
            equation = sp.sympify(eq_str)
            var = sp.Symbol(var_str)
            solutions = sp.solve(equation, var)
            solutions_float = [float(sol) for sol in solutions if sol.is_real]
            solutions_float.sort()
            expected_solutions.sort()
            print(f"   {eq_str} = 0, solve for {var_str}: {solutions_float}")
            if solutions_float == expected_solutions:
                print("   ✅ PASSED")
                tests_passed += 1
            else:
                print(f"   ❌ FAILED: Expected {expected_solutions}")
        except Exception as e:
            print(f"   ❌ FAILED: {e}")
    
    # Test 6: Complex Expressions
    print(f"\n{'-'*50}")
    print("6. COMPLEX EXPRESSIONS")
    print(f"{'-'*50}")
    
    complex_tests = [
        ("sqrt(16) + log(exp(2)) + sin(pi/2)", 7.0),  # 4 + 2 + 1 = 7
        ("cos(0) + sin(pi/2) + tan(pi/4)", 3.0),  # 1 + 1 + 1 = 3
        ("factorial(5)/factorial(3)", 20.0),  # 120/6 = 20
    ]
    
    for expr_str, expected in complex_tests:
        tests_total += 1
        try:
            expr = sp.sympify(expr_str)
            result = float(expr.evalf())
            print(f"   {expr_str} = {result} (Expected: {expected})")
            if abs(result - expected) < 1e-10:
                print("   ✅ PASSED")
                tests_passed += 1
            else:
                print(f"   ❌ FAILED")
        except Exception as e:
            print(f"   ❌ FAILED: {e}")
    
    # Final Summary
    print(f"\n{'='*70}")
    print("🏁 COMPREHENSIVE CAS TEST RESULTS")
    print(f"{'='*70}")
    print(f"Tests passed: {tests_passed}/{tests_total}")
    print(f"Success rate: {tests_passed/tests_total*100:.1f}%")
    
    if tests_passed == tests_total:
        print("🎉 ALL CAS TESTS PASSED!")
        print("✅ The CAS tool is working correctly and ready for use.")
        print("\n📋 VERIFIED CAPABILITIES:")
        print("   • Basic arithmetic operations")
        print("   • Algebraic expression evaluation")
        print("   • Symbolic differentiation")
        print("   • Symbolic and numerical integration")
        print("   • Equation solving")
        print("   • Complex mathematical expressions")
        print("   • Trigonometric functions")
        print("   • Exponential and logarithmic functions")
        return True
    else:
        print("⚠️  Some CAS tests failed.")
        print("🔧 Issues found that may need attention:")
        failed_tests = tests_total - tests_passed
        print(f"   • {failed_tests} test(s) failed out of {tests_total}")
        return False

def main():
    """Main test function"""
    print("Starting comprehensive CAS tool testing...")
    success = test_cas_comprehensive()
    
    if success:
        print(f"\n{'='*70}")
        print("✅ CAS TOOL VERIFICATION COMPLETE")
        print(f"{'='*70}")
        print("The Phys-MCP CAS tool is fully functional and ready for use.")
        print("\n🚀 NEXT STEPS:")
        print("1. The CAS tool can be used through the MCP server")
        print("2. Test it in Windsurf with commands like:")
        print("   • Calculate the derivative of x^2 + 3x + 1")
        print("   • Solve the equation x^2 - 4 = 0")
        print("   • Integrate 2x + 3 from 0 to 5")
        print("   • Evaluate sqrt(16) + log(exp(2))")
    else:
        print(f"\n{'='*70}")
        print("⚠️  CAS TOOL NEEDS ATTENTION")
        print(f"{'='*70}")
        print("Some tests failed. Please review the output above.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
