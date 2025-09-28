#!/usr/bin/env python3
"""
Test CAS handler functions directly
"""

import sys
import os
import json

# Import the worker functions directly
try:
    from worker import (
        handle_cas_evaluate,
        handle_cas_diff, 
        handle_cas_integrate,
        handle_cas_solve_equation,
        handle_cas_propagate_uncertainty
    )
    print("✅ Successfully imported CAS handler functions")
except ImportError as e:
    print(f"❌ Failed to import CAS handlers: {e}")
    
    # Try to import individual functions to see what's missing
    try:
        import sympy
        print("✅ SymPy is available")
    except ImportError:
        print("❌ SymPy not available")
    
    try:
        from src.error_handling import wrap_tool_execution
        print("✅ Error handling module available")
    except ImportError as e:
        print(f"❌ Error handling module not available: {e}")
    
    try:
        from src.performance import with_cache
        print("✅ Performance module available")
    except ImportError as e:
        print(f"❌ Performance module not available: {e}")
    
    sys.exit(1)

def test_cas_handlers():
    """Test CAS handler functions with known problems"""
    print("\n🧮 Testing CAS Handler Functions")
    print("="*60)
    
    tests_passed = 0
    tests_total = 0
    
    # Test 1: Basic evaluation
    print("\n1. Testing cas_evaluate: 2 + 3 * 4")
    tests_total += 1
    try:
        result = handle_cas_evaluate({"expr": "2 + 3 * 4"})
        print(f"   Result: {json.dumps(result, indent=2)}")
        if result.get("result") == 14:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected 14, got {result.get('result')}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 2: Evaluation with variables
    print("\n2. Testing cas_evaluate with variables: x^2 + 2*x + 1, x=3")
    tests_total += 1
    try:
        result = handle_cas_evaluate({
            "expr": "x**2 + 2*x + 1", 
            "vars": {"x": 3}
        })
        print(f"   Result: {json.dumps(result, indent=2)}")
        if result.get("result") == 16:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected 16, got {result.get('result')}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 3: Differentiation
    print("\n3. Testing cas_diff: d/dx(x^3 + 2*x^2 + x + 1)")
    tests_total += 1
    try:
        result = handle_cas_diff({
            "expr": "x**3 + 2*x**2 + x + 1",
            "symbol": "x"
        })
        print(f"   Result: {json.dumps(result, indent=2)}")
        # Check if result contains the expected derivative
        derivative = result.get("result", "")
        if "3*x**2 + 4*x + 1" in str(derivative):
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected '3*x**2 + 4*x + 1', got {derivative}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 4: Integration
    print("\n4. Testing cas_integrate: ∫(2*x + 3)dx")
    tests_total += 1
    try:
        result = handle_cas_integrate({
            "expr": "2*x + 3",
            "symbol": "x"
        })
        print(f"   Result: {json.dumps(result, indent=2)}")
        # Check if result contains the expected integral
        integral = result.get("result", "")
        if "x**2 + 3*x" in str(integral):
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected 'x**2 + 3*x', got {integral}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 5: Definite integration
    print("\n5. Testing cas_integrate definite: ∫₀²x²dx")
    tests_total += 1
    try:
        result = handle_cas_integrate({
            "expr": "x**2",
            "symbol": "x",
            "bounds": [0, 2]
        })
        print(f"   Result: {json.dumps(result, indent=2)}")
        # Check if result is 8/3
        integral_result = result.get("result")
        if abs(float(integral_result) - 8/3) < 1e-10:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected 8/3 ≈ 2.667, got {integral_result}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 6: Equation solving
    print("\n6. Testing cas_solve_equation: x^2 - 4 = 0")
    tests_total += 1
    try:
        result = handle_cas_solve_equation({
            "equation": "x**2 - 4",
            "symbol": "x"
        })
        print(f"   Result: {json.dumps(result, indent=2)}")
        solutions = result.get("solutions", [])
        if set(solutions) == {-2, 2}:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected [-2, 2], got {solutions}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 7: Uncertainty propagation
    print("\n7. Testing cas_propagate_uncertainty: (10±0.1) + (5±0.2)")
    tests_total += 1
    try:
        result = handle_cas_propagate_uncertainty({
            "expr": "x + y",
            "vars": {
                "x": {"value": 10.0, "sigma": 0.1},
                "y": {"value": 5.0, "sigma": 0.2}
            }
        })
        print(f"   Result: {json.dumps(result, indent=2)}")
        value = result.get("value")
        uncertainty = result.get("uncertainty")
        if abs(value - 15.0) < 1e-10 and abs(uncertainty - 0.223606797749979) < 1e-6:
            print("   ✅ PASSED")
            tests_passed += 1
        else:
            print(f"   ❌ FAILED: Expected value=15.0, uncertainty≈0.224, got value={value}, uncertainty={uncertainty}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Summary
    print(f"\n{'='*60}")
    print(f"🏁 CAS HANDLER TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Tests passed: {tests_passed}/{tests_total}")
    print(f"Success rate: {tests_passed/tests_total*100:.1f}%")
    
    if tests_passed == tests_total:
        print("🎉 ALL CAS HANDLER TESTS PASSED!")
        return True
    else:
        print("⚠️  Some CAS handler tests failed.")
        return False

if __name__ == "__main__":
    success = test_cas_handlers()
    sys.exit(0 if success else 1)
