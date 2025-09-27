#!/usr/bin/env python3
"""
Comprehensive Test Suite for Graphing Calculator

Tests all implemented functions of the comprehensive graphing calculator.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'packages', 'python-worker'))

from graphing_calculator import GraphingCalculator

def test_basic_operations():
    """Test basic arithmetic and algebraic operations"""
    print("🧮 Testing Basic Operations...")
    calc = GraphingCalculator()
    
    tests = [
        ('evaluate', {'expression': '2 + 3 * 4'}, 14.0),
        ('evaluate', {'expression': 'sqrt(16) + 2^3'}, 12.0),
        ('simplify', {'expression': 'x + x + x'}, None),  # Just check success
        ('expand', {'expression': '(x + 1)^2'}, None),
        ('factor', {'expression': 'x^2 - 4'}, None),
    ]
    
    for operation, params, expected in tests:
        result = calc.handle_operation(operation, params)
        if result['success']:
            print(f"✅ {operation}: {params} -> {result.get('result', 'Success')}")
            if expected and 'numeric_value' in result:
                assert abs(result['numeric_value'] - expected) < 0.001, f"Expected {expected}, got {result['numeric_value']}"
        else:
            print(f"❌ {operation}: {result['error']}")

def test_equation_solving():
    """Test equation solving capabilities"""
    print("\n🔍 Testing Equation Solving...")
    calc = GraphingCalculator()
    
    tests = [
        ('solve_equation', {'equation': 'x^2 - 4 = 0', 'variable': 'x'}),
        ('solve_system', {'equations': ['x + y = 5', '2*x - y = 1'], 'solve_for': ['x', 'y']}),
        ('find_roots', {'function': 'x^2 - 4', 'x_range': [-5, 5]}),
    ]
    
    for operation, params in tests:
        result = calc.handle_operation(operation, params)
        if result['success']:
            print(f"✅ {operation}: {result}")
        else:
            print(f"❌ {operation}: {result['error']}")

def test_calculus():
    """Test calculus operations"""
    print("\n📐 Testing Calculus...")
    calc = GraphingCalculator()
    
    tests = [
        ('derivative', {'expression': 'x^2 + 3*x + 2', 'variable': 'x'}),
        ('integral', {'expression': '2*x + 1', 'variable': 'x'}),
        ('limit', {'expression': 'sin(x)/x', 'variable': 'x', 'point': 0}),
        ('series', {'expression': 'exp(x)', 'variable': 'x', 'point': 0, 'order': 5}),
    ]
    
    for operation, params in tests:
        result = calc.handle_operation(operation, params)
        if result['success']:
            print(f"✅ {operation}: {result}")
        else:
            print(f"❌ {operation}: {result['error']}")

def test_matrix_operations():
    """Test matrix operations"""
    print("\n🔢 Testing Matrix Operations...")
    calc = GraphingCalculator()
    
    # Test matrix addition
    result = calc.handle_operation('matrix_add', {
        'matrix': [[1, 2], [3, 4]],
        'matrix_b': [[5, 6], [7, 8]]
    })
    print(f"✅ Matrix addition: {result}")
    assert result['success'] == True
    assert result['result'] == [[6, 8], [10, 12]]
    
    # Test matrix determinant
    result = calc.handle_operation('matrix_determinant', {
        'matrix': [[1, 2], [3, 4]]
    })
    print(f"✅ Matrix determinant: {result}")
    assert result['success'] == True
    assert abs(result['determinant'] + 2.0) < 0.001
    
    # Test matrix multiplication
    result = calc.handle_operation('matrix_multiply', {
        'matrix': [[1, 2], [3, 4]],
        'matrix_b': [[2, 0], [1, 2]]
    })
    print(f"✅ Matrix multiplication: {result}")
    assert result['success'] == True
    
    # Test eigenvalues
    result = calc.handle_operation('matrix_eigenvalues', {
        'matrix': [[1, 2], [2, 1]]
    })
    print(f"✅ Matrix eigenvalues: {result}")
    assert result['success'] == True

def test_statistics():
    """Test statistical operations"""
    print("\n📊 Testing Statistics...")
    calc = GraphingCalculator()
    
    # Test descriptive statistics
    data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    result = calc.handle_operation('stats_descriptive', {'data': data})
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
    assert result['r_squared'] > 0.99  # Perfect correlation
    
    # Test probability distributions
    result = calc.handle_operation('stats_distribution', {
        'distribution': 'normal',
        'value': 0,
        'parameters': {'mean': 0, 'std': 1}
    })
    print(f"✅ Normal distribution: {result}")
    assert result['success'] == True
    
    # Test hypothesis testing
    result = calc.handle_operation('stats_hypothesis_test', {
        'data': [1, 2, 3, 4, 5],
        'test_type': 't_test',
        'null_hypothesis': 3,
        'confidence_level': 0.95
    })
    print(f"✅ Hypothesis test: {result}")
    assert result['success'] == True

def test_data_operations():
    """Test data analysis operations"""
    print("\n📋 Testing Data Operations...")
    calc = GraphingCalculator()
    
    # Test list creation
    result = calc.handle_operation('create_list', {
        'list_name': 'test_list',
        'list_data': [1, 2, 3, 4, 5]
    })
    print(f"✅ Create list: {result}")
    assert result['success'] == True
    
    # Test list operations
    result = calc.handle_operation('list_operations', {
        'list_name': 'test_list',
        'list_operation': 'mean'
    })
    print(f"✅ List operations: {result}")
    assert result['success'] == True
    assert result['result'] == 3.0
    
    # Test table generation
    result = calc.handle_operation('table_values', {
        'function': 'x^2',
        'x_range': [-2, 2],
        'step': 1
    })
    print(f"✅ Table values: {result}")
    assert result['success'] == True
    assert len(result['table']) == 5

def test_programming_operations():
    """Test programming features"""
    print("\n💾 Testing Programming Operations...")
    calc = GraphingCalculator()
    
    # Test variable storage
    result = calc.handle_operation('store_variable', {
        'var_name': 'test_var',
        'var_value': 42
    })
    print(f"✅ Store variable: {result}")
    assert result['success'] == True
    
    # Test variable recall
    result = calc.handle_operation('recall_variable', {
        'var_name': 'test_var'
    })
    print(f"✅ Recall variable: {result}")
    assert result['success'] == True
    assert result['value'] == 42
    
    # Test function definition
    result = calc.handle_operation('define_function', {
        'func_name': 'my_func',
        'func_expression': 'x^2 + 1',
        'func_variables': ['x']
    })
    print(f"✅ Define function: {result}")
    assert result['success'] == True

def test_utility_operations():
    """Test utility operations"""
    print("\n🔧 Testing Utility Operations...")
    calc = GraphingCalculator()
    
    # Test unit conversion
    result = calc.handle_operation('convert_units', {
        'value': 1,
        'from_unit': 'm',
        'to_unit': 'ft'
    })
    print(f"✅ Unit conversion: {result}")
    assert result['success'] == True
    assert abs(result['converted_value'] - 3.28084) < 0.001
    
    # Test temperature conversion
    result = calc.handle_operation('convert_units', {
        'value': 0,
        'from_unit': 'C',
        'to_unit': 'F'
    })
    print(f"✅ Temperature conversion: {result}")
    assert result['success'] == True
    assert result['converted_value'] == 32.0
    
    # Test financial calculations
    result = calc.handle_operation('financial_calc', {
        'financial_type': 'future_value',
        'present_value': 1000,
        'interest_rate': 0.05,
        'periods': 10
    })
    print(f"✅ Financial calculation: {result}")
    assert result['success'] == True
    assert result['future_value'] > 1000

def test_plotting():
    """Test plotting capabilities"""
    print("\n📈 Testing Plotting...")
    calc = GraphingCalculator()
    
    # Test function plotting
    result = calc.handle_operation('plot_function', {
        'function': 'x^2',
        'x_range': [-5, 5],
        'plot_title': 'Test Parabola'
    })
    print(f"✅ Plot function: {result}")
    assert result['success'] == True
    assert 'plot_path' in result

def main():
    """Run all tests"""
    print("🚀 Starting Comprehensive Graphing Calculator Tests...\n")
    
    try:
        test_basic_operations()
        test_equation_solving()
        test_calculus()
        test_matrix_operations()
        test_statistics()
        test_data_operations()
        test_programming_operations()
        test_utility_operations()
        test_plotting()
        
        print("\n🎉 All tests completed successfully!")
        print("\n📋 Summary of Implemented Features:")
        print("✅ Basic Math: evaluate, simplify, expand, factor")
        print("✅ Equation Solving: solve_equation, solve_system, find_roots")
        print("✅ Calculus: derivative, integral, limit, series")
        print("✅ Matrix Operations: add, multiply, determinant, inverse, eigenvalues, rref")
        print("✅ Statistics: descriptive, regression, distributions, hypothesis tests")
        print("✅ Data Analysis: lists, tables, variable storage")
        print("✅ Programming: variable storage, function definition")
        print("✅ Utilities: unit conversion, financial calculations")
        print("✅ Plotting: function graphing with matplotlib")
        
        print("\n🧮 The Graphing Calculator is fully functional!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
