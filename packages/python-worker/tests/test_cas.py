"""
Test suite for CAS (Computer Algebra System) worker
"""
import pytest
import numpy as np
from unittest.mock import Mock, patch
from src.cas import CAS

class TestCAS:
    """Test CAS worker functionality"""
    
    def test_cas_evaluate_basic_arithmetic(self, cas_worker, sample_data):
        """Test basic arithmetic evaluation"""
        result = cas_worker.cas_evaluate({
            'expr': '2 + 3 * 4',
            'method': 'cas_evaluate'
        })
        
        assert result['success'] is True
        assert result['result'] == 14
    
    def test_cas_evaluate_with_variables(self, cas_worker, sample_data):
        """Test expression evaluation with variables"""
        result = cas_worker.cas_evaluate({
            'expr': 'x**2 + 2*x + 1',
            'vars': {'x': 3},
            'method': 'cas_evaluate'
        })
        
        assert result['success'] is True
        assert result['result'] == 16
    
    def test_cas_differentiate(self, cas_worker, mock_sympy):
        """Test symbolic differentiation"""
        mock_sympy['diff'].return_value = Mock(__str__=lambda: '2*x')
        
        result = cas_worker.cas_diff({
            'expr': 'x**2',
            'symbol': 'x',
            'method': 'cas_diff'
        })
        
        assert result['success'] is True
        assert '2*x' in str(result['result'])
    
    def test_cas_integrate(self, cas_worker, mock_sympy):
        """Test symbolic integration"""
        mock_sympy['integrate'].return_value = Mock(__str__=lambda: 'x**2 + 3*x')
        
        result = cas_worker.cas_integrate({
            'expr': '2*x + 3',
            'symbol': 'x',
            'method': 'cas_integrate'
        })
        
        assert result['success'] is True
        assert 'x**2' in str(result['result'])
    
    def test_cas_solve_equation(self, cas_worker, mock_sympy):
        """Test equation solving"""
        mock_sympy['solve'] = Mock(return_value=[-2, 2])
        
        with patch('sympy.solve', mock_sympy['solve']):
            result = cas_worker.cas_solve_equation({
                'equation': 'x**2 - 4 = 0',
                'symbol': 'x',
                'method': 'cas_solve_equation'
            })
        
        assert result['success'] is True
        assert result['result'] == [-2, 2]
    
    def test_cas_error_handling(self, cas_worker):
        """Test error handling for invalid expressions"""
        result = cas_worker.cas_evaluate({
            'expr': 'invalid_function(',
            'method': 'cas_evaluate'
        })
        
        assert result['success'] is False
        assert 'error' in result
    
    def test_cas_complex_expression(self, cas_worker, mock_sympy):
        """Test complex mathematical expressions"""
        mock_sympy['sympify'].return_value = Mock(evalf=Mock(return_value=7))
        
        with patch('sympy.sympify', mock_sympy['sympify']):
            result = cas_worker.cas_evaluate({
                'expr': 'sqrt(16) + log(exp(2)) + sin(pi/2)',
                'method': 'cas_evaluate'
            })
        
        assert result['success'] is True
        assert result['result'] == 7
    
    def test_cas_matrix_operations(self, cas_worker):
        """Test matrix operations"""
        with patch('numpy.linalg.det') as mock_det:
            mock_det.return_value = -2.0
            
            result = cas_worker.cas_matrix_det({
                'matrix': [[1, 2], [3, 4]],
                'method': 'cas_matrix_det'
            })
        
        assert result['success'] is True
        assert result['result'] == -2.0
    
    def test_cas_performance_caching(self, cas_worker):
        """Test performance caching for repeated calculations"""
        expr = 'x**2 + 2*x + 1'
        vars_dict = {'x': 5}
        
        # First calculation
        result1 = cas_worker.cas_evaluate({
            'expr': expr,
            'vars': vars_dict,
            'method': 'cas_evaluate'
        })
        
        # Second calculation (should use cache)
        result2 = cas_worker.cas_evaluate({
            'expr': expr,
            'vars': vars_dict,
            'method': 'cas_evaluate'
        })
        
        assert result1['success'] is True
        assert result2['success'] is True
        assert result1['result'] == result2['result']
