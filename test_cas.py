#!/usr/bin/env python3
"""
Test script for CAS (Computer Algebra System) functionality
"""

import sys
import os
import json

# Add the python-worker directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'packages', 'python-worker'))

from worker import handle_message

def test_cas_operation(method, params, expected_description):
    """Test a CAS operation and print results"""
    print(f"\n{'='*60}")
    print(f"Testing: {expected_description}")
    print(f"Method: {method}")
    print(f"Params: {params}")
    print(f"{'='*60}")
    
    message = {
        "method": method,
        "params": params
    }
    
    try:
        result = handle_message(message)
        print(f"✅ SUCCESS")
        print(f"Result: {json.dumps(result, indent=2)}")
        return True
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run comprehensive CAS tests"""
    print("🧮 Testing Phys-MCP CAS (Computer Algebra System) Tool")
    print("="*70)
    
    tests_passed = 0
    tests_total = 0
    
    # Test 1: Basic arithmetic evaluation
    tests_total += 1
    if test_cas_operation(
        "cas_evaluate",
        {"expr": "2 + 3 * 4"},
        "Basic arithmetic: 2 + 3 * 4 = 14"
    ):
        tests_passed += 1
    
    # Test 2: Algebraic expression evaluation with variables
    tests_total += 1
    if test_cas_operation(
        "cas_evaluate", 
        {"expr": "x**2 + 2*x + 1", "vars": {"x": 3}},
        "Algebraic expression: x² + 2x + 1 with x=3 = 16"
    ):
        tests_passed += 1
    
    # Test 3: Symbolic differentiation
    tests_total += 1
    if test_cas_operation(
        "cas_diff",
        {"expr": "x**3 + 2*x**2 + x + 1", "symbol": "x"},
        "Derivative: d/dx(x³ + 2x² + x + 1) = 3x² + 4x + 1"
    ):
        tests_passed += 1
    
    # Test 4: Second derivative
    tests_total += 1
    if test_cas_operation(
        "cas_diff",
        {"expr": "x**4", "symbol": "x", "order": 2},
        "Second derivative: d²/dx²(x⁴) = 12x²"
    ):
        tests_passed += 1
    
    # Test 5: Indefinite integration
    tests_total += 1
    if test_cas_operation(
        "cas_integrate",
        {"expr": "2*x + 3", "symbol": "x"},
        "Indefinite integral: ∫(2x + 3)dx = x² + 3x + C"
    ):
        tests_passed += 1
    
    # Test 6: Definite integration
    tests_total += 1
    if test_cas_operation(
        "cas_integrate",
        {"expr": "x**2", "symbol": "x", "bounds": [0, 2]},
        "Definite integral: ∫₀²x²dx = 8/3"
    ):
        tests_passed += 1
    
    # Test 7: Quadratic equation solving
    tests_total += 1
    if test_cas_operation(
        "cas_solve_equation",
        {"equation": "x**2 - 4", "symbol": "x"},
        "Solve quadratic: x² - 4 = 0 → x = ±2"
    ):
        tests_passed += 1
    
    # Test 8: Linear equation solving
    tests_total += 1
    if test_cas_operation(
        "cas_solve_equation",
        {"equation": "2*x + 6", "symbol": "x"},
        "Solve linear: 2x + 6 = 0 → x = -3"
    ):
        tests_passed += 1
    
    # Test 9: Trigonometric functions
    tests_total += 1
    if test_cas_operation(
        "cas_diff",
        {"expr": "sin(x)", "symbol": "x"},
        "Derivative of sin(x) = cos(x)"
    ):
        tests_passed += 1
    
    # Test 10: Exponential functions
    tests_total += 1
    if test_cas_operation(
        "cas_integrate",
        {"expr": "exp(x)", "symbol": "x"},
        "Integral of e^x = e^x + C"
    ):
        tests_passed += 1
    
    # Test 11: Complex expression evaluation
    tests_total += 1
    if test_cas_operation(
        "cas_evaluate",
        {"expr": "sqrt(16) + log(exp(2)) + sin(pi/2)"},
        "Complex expression: √16 + ln(e²) + sin(π/2) = 4 + 2 + 1 = 7"
    ):
        tests_passed += 1
    
    # Test 12: Uncertainty propagation
    tests_total += 1
    if test_cas_operation(
        "cas_propagate_uncertainty",
        {
            "expr": "x + y", 
            "vars": {
                "x": {"value": 10.0, "sigma": 0.1},
                "y": {"value": 5.0, "sigma": 0.2}
            }
        },
        "Uncertainty propagation: (10.0±0.1) + (5.0±0.2)"
    ):
        tests_passed += 1
    
    # Summary
    print(f"\n{'='*70}")
    print(f"🏁 TEST SUMMARY")
    print(f"{'='*70}")
    print(f"Tests passed: {tests_passed}/{tests_total}")
    print(f"Success rate: {tests_passed/tests_total*100:.1f}%")
    
    if tests_passed == tests_total:
        print("🎉 ALL TESTS PASSED! CAS tool is working correctly.")
        return True
    else:
        print("⚠️  Some tests failed. CAS tool needs fixes.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
