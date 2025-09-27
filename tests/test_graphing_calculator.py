#!/usr/bin/env python3
"""
Test script for the Graphing Calculator tool

Tests basic functionality of the comprehensive graphing calculator.
"""

import json
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'packages', 'python-worker'))

from graphing_calculator import GraphingCalculator

def test_basic_operations():
    """Test basic arithmetic and algebraic operations"""
    calc = GraphingCalculator()
    
    print("🧮 Testing Basic Operations...")
    
    # Test evaluation
    result = calc.handle_operation('evaluate', {
        'expression': '2 + 3 * 4',
        'format': 'decimal'
    })
    print(f"✅ Evaluate '2 + 3 * 4': {result}")
    assert result['success'] == True
    assert float(result['result']) == 14.0
    
    # Test simplification
    result = calc.handle_operation('simplify', {
        'expression': 'x^2 + 2*x + 1'
    })
    print(f"✅ Simplify 'x^2 + 2*x + 1': {result}")
    assert result['success'] == True
    
    # Test factoring
    result = calc.handle_operation('factor', {
        'expression': 'x^2 - 4'
    })
    print(f"✅ Factor 'x^2 - 4': {result}")
    assert result['success'] == True

def test_equation_solving():
    """Test equation solving capabilities"""
    calc = GraphingCalculator()
    
    print("\n🔍 Testing Equation Solving...")
    
    # Test simple equation
    result = calc.handle_operation('solve_equation', {
        'equation': 'x^2 - 4 = 0',
        'variable': 'x'
    })
    print(f"✅ Solve 'x^2 - 4 = 0': {result}")
    assert result['success'] == True
    assert len(result['solutions']) == 2
    
    # Test system of equations
    result = calc.handle_operation('solve_system', {
        'equations': ['x + y = 5', '2*x - y = 1'],
        'solve_for': ['x', 'y']
    })
    print(f"✅ Solve system: {result}")
    assert result['success'] == True

def test_calculus():
    """Test calculus operations"""
    calc = GraphingCalculator()
    
    print("\n📐 Testing Calculus...")
    
    # Test derivative
    result = calc.handle_operation('derivative', {
        'expression': 'x^2 + 3*x + 2',
        'variable': 'x'
    })
    print(f"✅ Derivative of 'x^2 + 3*x + 2': {result}")
    assert result['success'] == True
    
    # Test integral
    result = calc.handle_operation('integral', {
        'expression': '2*x + 1',
        'variable': 'x'
    })
    print(f"✅ Integral of '2*x + 1': {result}")
    assert result['success'] == True

def test_matrix_operations():
    """Test matrix operations"""
    calc = GraphingCalculator()
    
    print("\n🔢 Testing Matrix Operations...")
    
    # Test matrix addition
    result = calc.handle_operation('matrix_add', {
        'matrix': [[1, 2], [3, 4]],
        'matrix_b': [[5, 6], [7, 8]]
    })
    print(f"✅ Matrix addition: {result}")
    assert result['success'] == True
    assert result['result'] == [[6, 8], [10, 12]]
    
    # Test determinant
    result = calc.handle_operation('matrix_determinant', {
        'matrix': [[1, 2], [3, 4]]
    })
    print(f"✅ Matrix determinant: {result}")
    assert result['success'] == True
    assert result['determinant'] == -2.0

def test_statistics():
    """Test statistical operations"""
    calc = GraphingCalculator()
    
    print("\n📊 Testing Statistics...")
    
    # Test descriptive statistics
    result = calc.handle_operation('stats_descriptive', {
        'data': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    })
    print(f"✅ Descriptive statistics: {result}")
    assert result['success'] == True
    assert result['mean'] == 5.5
    
    # Test linear regression
    result = calc.handle_operation('stats_regression', {
        'data_x': [1, 2, 3, 4, 5],
        'data_y': [2, 4, 6, 8, 10],
        'regression_type': 'linear'
    })
    print(f"✅ Linear regression: {result}")
    assert result['success'] == True
    assert result['r_squared'] > 0.99  # Should be perfect correlation

def test_graphing():
    """Test graphing capabilities"""
    calc = GraphingCalculator()
    
    print("\n📈 Testing Graphing...")
    
    # Test function plotting
    result = calc.handle_operation('plot_function', {
        'function': 'x^2',
        'x_range': [-5, 5],
        'plot_title': 'Test Parabola'
    })
    print(f"✅ Plot function 'x^2': {result}")
    assert result['success'] == True
    assert 'plot_path' in result

def main():
    """Run all tests"""
    print("🚀 Starting Graphing Calculator Tests...\n")
    
    try:
        test_basic_operations()
        test_equation_solving()
        test_calculus()
        test_matrix_operations()
        test_statistics()
        test_graphing()
        
        print("\n🎉 All tests passed! Graphing Calculator is working correctly.")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
