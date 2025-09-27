"""
Comprehensive Graphing Calculator Implementation

Provides all functionality of a modern graphing calculator including:
- Computer Algebra System (CAS) operations
- Advanced graphing capabilities
- Matrix operations and linear algebra
- Statistical analysis and regression
- Equation solving and calculus
- Data analysis and programming features
- Unit conversions and financial calculations
"""

import numpy as np
import matplotlib.pyplot as plt
import sympy as sp
from sympy import symbols, solve, diff, integrate, limit, series, simplify, expand, factor
from sympy import Matrix as SymMatrix, latex
try:
    import pandas as pd
    _HAS_PANDAS = True
except ImportError:
    _HAS_PANDAS = False
from scipy import stats, optimize, linalg
import json
import os
from typing import Dict, List, Any, Union, Optional, Tuple
import warnings
warnings.filterwarnings('ignore')

from utils import generate_session_id
from calc_equations import solve_equation, solve_system, find_roots
from calc_calculus import derivative, integral, limit_calc, series_expansion

class GraphingCalculator:
    """Comprehensive graphing calculator with CAS, statistics, and visualization capabilities"""
    
    def __init__(self):
        self.variables = {}  # Variable storage
        self.functions = {}  # User-defined functions
        self.lists = {}      # Named lists
        self.session_id = generate_session_id()
        self.config = {}
        
        # Common symbols
        self.x, self.y, self.z, self.t = symbols('x y z t')
        self.theta = symbols('theta')
    
    def save_artifact(self, plt_obj, filename: str, session_id: str) -> str:
        """Save matplotlib plot as artifact"""
        try:
            # Create artifacts directory
            artifacts_dir = f"artifacts/{session_id}"
            os.makedirs(artifacts_dir, exist_ok=True)
            
            # Save plot
            filepath = os.path.join(artifacts_dir, filename)
            plt_obj.savefig(filepath, dpi=150, bbox_inches='tight')
            plt_obj.close()
            
            return filepath
        except Exception as e:
            return f"Error saving artifact: {str(e)}"
        
    def handle_operation(self, operation: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Route operation to appropriate handler"""
        
        operation_map = {
            # Basic operations
            'evaluate': self._evaluate,
            'simplify': self._simplify,
            'expand': self._expand,
            'factor': self._factor,
            
            # Equation solving
            'solve_equation': lambda p: solve_equation(p),
            'solve_system': lambda p: solve_system(p),
            'find_roots': lambda p: find_roots(p),
            
            # Calculus
            'derivative': lambda p: derivative(p),
            'integral': lambda p: integral(p),
            'limit': lambda p: limit_calc(p),
            'series': lambda p: series_expansion(p),
            
            # Graphing
            'plot_function': self._plot_function,
            'plot_parametric': self._plot_parametric,
            'plot_polar': self._plot_polar,
            'plot_implicit': self._plot_implicit,
            'plot_inequality': self._plot_inequality,
            'plot_data': self._plot_data,
            
            # Matrix operations
            'matrix_add': self._matrix_add,
            'matrix_multiply': self._matrix_multiply,
            'matrix_determinant': self._matrix_determinant,
            'matrix_inverse': self._matrix_inverse,
            'matrix_eigenvalues': self._matrix_eigenvalues,
            'matrix_rref': self._matrix_rref,
            
            # Statistics
            'stats_descriptive': self._stats_descriptive,
            'stats_regression': self._stats_regression,
            'stats_distribution': self._stats_distribution,
            'stats_hypothesis_test': self._stats_hypothesis_test,
            
            # Data operations
            'create_list': self._create_list,
            'list_operations': self._list_operations,
            'table_values': self._table_values,
            
            # Programming
            'store_variable': self._store_variable,
            'recall_variable': self._recall_variable,
            'define_function': self._define_function,
            'execute_program': self._execute_program,
            
            # Utilities
            'convert_units': self._convert_units,
            'financial_calc': self._financial_calc
        }
        
        if operation not in operation_map:
            raise ValueError(f"Unknown operation: {operation}")
            
        try:
            return operation_map[operation](params)
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'operation': operation
            }
    
    # Basic Operations
    def _evaluate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate mathematical expression"""
        expr_str = params.get('expression', '')
        variables = params.get('variables', {})
        format_type = params.get('format', 'decimal')
        precision = params.get('precision', 6)
        
        try:
            # Parse expression
            expr = sp.parse_expr(expr_str)
            
            # Substitute variables
            if variables:
                substitutions = {sp.Symbol(k): v for k, v in variables.items()}
                expr = expr.subs(substitutions)
            
            # Evaluate
            result = expr.evalf()
            
            # Format result
            if format_type == 'exact':
                result_str = str(expr)
            elif format_type == 'fraction':
                result_str = str(sp.nsimplify(result))
            else:
                result_str = f"{float(result):.{precision}f}"
            
            return {
                'success': True,
                'result': result_str,
                'numeric_value': float(result) if result.is_real else None,
                'expression': expr_str,
                'latex': latex(expr)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _simplify(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Simplify mathematical expression"""
        expr_str = params.get('expression', '')
        
        try:
            expr = sp.parse_expr(expr_str)
            simplified = simplify(expr)
            
            return {
                'success': True,
                'original': expr_str,
                'simplified': str(simplified),
                'latex_original': latex(expr),
                'latex_simplified': latex(simplified)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _expand(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Expand mathematical expression"""
        expr_str = params.get('expression', '')
        
        try:
            expr = sp.parse_expr(expr_str)
            expanded = expand(expr)
            
            return {
                'success': True,
                'original': expr_str,
                'expanded': str(expanded),
                'latex_original': latex(expr),
                'latex_expanded': latex(expanded)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _factor(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Factor mathematical expression"""
        expr_str = params.get('expression', '')
        
        try:
            expr = sp.parse_expr(expr_str)
            factored = factor(expr)
            
            return {
                'success': True,
                'original': expr_str,
                'factored': str(factored),
                'latex_original': latex(expr),
                'latex_factored': latex(factored)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    # Placeholder methods for operations not yet implemented
    def _plot_function(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Plot mathematical function"""
        function = params.get('function', '')
        x_range = params.get('x_range', [-10, 10])
        title = params.get('plot_title', f'Graph of {function}')
        
        try:
            plt.figure(figsize=(10, 8))
            x_vals = np.linspace(x_range[0], x_range[1], 1000)
            
            # Parse and evaluate function
            x_sym = sp.Symbol('x')
            expr = sp.parse_expr(function)
            f = sp.lambdify(x_sym, expr, 'numpy')
            y_vals = f(x_vals)
            
            plt.plot(x_vals, y_vals, 'b-', linewidth=2, label=function)
            plt.xlabel('x')
            plt.ylabel('y')
            plt.title(title)
            plt.grid(True)
            plt.legend()
            
            plot_path = self.save_artifact(plt, 'function_plot.png', self.session_id)
            
            return {
                'success': True,
                'function': function,
                'x_range': x_range,
                'plot_path': plot_path,
                'title': title
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _plot_parametric(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Plot parametric equations"""
        return {'success': False, 'error': 'Parametric plotting not yet implemented'}
    
    def _plot_polar(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Plot polar equation"""
        return {'success': False, 'error': 'Polar plotting not yet implemented'}
    
    def _plot_implicit(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Plot implicit equation"""
        return {'success': False, 'error': 'Implicit plotting not yet implemented'}
    
    def _plot_inequality(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Plot inequality region"""
        return {'success': False, 'error': 'Inequality plotting not yet implemented'}
    
    def _plot_data(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Plot data points"""
        return {'success': False, 'error': 'Data plotting not yet implemented'}
    
    def _matrix_add(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Add two matrices"""
        try:
            matrix_a = params.get('matrix', [])
            matrix_b = params.get('matrix_b', [])
            A = np.array(matrix_a)
            B = np.array(matrix_b)
            result = A + B
            return {
                'success': True,
                'result': result.tolist(),
                'dimensions': list(result.shape)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _matrix_multiply(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Multiply two matrices"""
        try:
            matrix_a = params.get('matrix', [])
            matrix_b = params.get('matrix_b', [])
            A = np.array(matrix_a)
            B = np.array(matrix_b)
            result = np.dot(A, B)
            return {
                'success': True,
                'result': result.tolist(),
                'dimensions': list(result.shape)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _matrix_determinant(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate matrix determinant"""
        try:
            matrix = params.get('matrix', [])
            A = np.array(matrix)
            det = np.linalg.det(A)
            return {
                'success': True,
                'determinant': float(det),
                'matrix': matrix
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _matrix_inverse(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate matrix inverse"""
        try:
            matrix = params.get('matrix', [])
            A = np.array(matrix)
            inv_A = np.linalg.inv(A)
            return {
                'success': True,
                'inverse': inv_A.tolist(),
                'matrix': matrix
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _matrix_eigenvalues(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate eigenvalues and eigenvectors"""
        try:
            matrix = params.get('matrix', [])
            A = np.array(matrix)
            eigenvals, eigenvecs = np.linalg.eig(A)
            return {
                'success': True,
                'eigenvalues': eigenvals.tolist(),
                'eigenvectors': eigenvecs.tolist(),
                'matrix': matrix
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _matrix_rref(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate reduced row echelon form"""
        try:
            matrix = params.get('matrix', [])
            A = SymMatrix(matrix)
            rref_matrix, pivot_cols = A.rref()
            return {
                'success': True,
                'rref': [[float(x) for x in row] for row in rref_matrix.tolist()],
                'pivot_columns': pivot_cols,
                'rank': len(pivot_cols)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _stats_descriptive(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate descriptive statistics"""
        try:
            data = params.get('data', [])
            data_array = np.array(data)
            return {
                'success': True,
                'mean': float(np.mean(data_array)),
                'median': float(np.median(data_array)),
                'std_dev': float(np.std(data_array, ddof=1)),
                'min': float(np.min(data_array)),
                'max': float(np.max(data_array)),
                'count': len(data)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _stats_regression(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Perform regression analysis"""
        try:
            data_x = params.get('data_x', [])
            data_y = params.get('data_y', [])
            slope, intercept, r_value, p_value, std_err = stats.linregress(data_x, data_y)
            return {
                'success': True,
                'slope': slope,
                'intercept': intercept,
                'r_squared': r_value ** 2,
                'equation': f"y = {slope:.6f}x + {intercept:.6f}"
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _stats_distribution(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate probability distribution values"""
        distribution = params.get('distribution', 'normal')
        value = params.get('value', 0)
        parameters = params.get('parameters', {})
        
        try:
            if distribution == 'normal':
                mean = parameters.get('mean', 0)
                std = parameters.get('std', 1)
                pdf = stats.norm.pdf(value, mean, std)
                cdf = stats.norm.cdf(value, mean, std)
                
            elif distribution == 'binomial':
                n = parameters.get('n', 10)
                p = parameters.get('p', 0.5)
                pdf = stats.binom.pmf(value, n, p)
                cdf = stats.binom.cdf(value, n, p)
                
            elif distribution == 'poisson':
                mu = parameters.get('mu', 1)
                pdf = stats.poisson.pmf(value, mu)
                cdf = stats.poisson.cdf(value, mu)
                
            elif distribution == 't':
                df = parameters.get('df', 1)
                pdf = stats.t.pdf(value, df)
                cdf = stats.t.cdf(value, df)
                
            else:
                return {'success': False, 'error': f'Distribution {distribution} not implemented'}
            
            return {
                'success': True,
                'distribution': distribution,
                'value': value,
                'parameters': parameters,
                'pdf_pmf': float(pdf),
                'cdf': float(cdf)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _stats_hypothesis_test(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Perform hypothesis test"""
        data = params.get('data', [])
        test_type = params.get('test_type', 't_test')
        null_hypothesis = params.get('null_hypothesis', 0)
        confidence_level = params.get('confidence_level', 0.95)
        
        try:
            data_array = np.array(data)
            
            if test_type == 't_test':
                t_stat, p_value = stats.ttest_1samp(data_array, null_hypothesis)
                
                # Calculate confidence interval
                alpha = 1 - confidence_level
                df = len(data) - 1
                t_critical = stats.t.ppf(1 - alpha/2, df)
                margin_error = t_critical * stats.sem(data_array)
                mean = np.mean(data_array)
                ci_lower = mean - margin_error
                ci_upper = mean + margin_error
                
                return {
                    'success': True,
                    'test_type': test_type,
                    'null_hypothesis': null_hypothesis,
                    't_statistic': float(t_stat),
                    'p_value': float(p_value),
                    'sample_size': len(data),
                    'sample_mean': float(mean),
                    'confidence_level': confidence_level,
                    'confidence_interval': [float(ci_lower), float(ci_upper)],
                    'reject_null': p_value < (1 - confidence_level)
                }
                
            elif test_type == 'z_test':
                # Simple z-test (assuming known population std)
                pop_std = params.get('population_std', 1)
                z_stat = (np.mean(data_array) - null_hypothesis) / (pop_std / np.sqrt(len(data_array)))
                p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))
                
                return {
                    'success': True,
                    'test_type': test_type,
                    'null_hypothesis': null_hypothesis,
                    'z_statistic': float(z_stat),
                    'p_value': float(p_value),
                    'sample_size': len(data),
                    'sample_mean': float(np.mean(data_array)),
                    'reject_null': p_value < (1 - confidence_level)
                }
                
            else:
                return {'success': False, 'error': f'Test type {test_type} not implemented'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _create_list(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create named list"""
        try:
            list_name = params.get('list_name', '')
            data = params.get('list_data', [])
            self.lists[list_name] = data
            return {
                'success': True,
                'list_name': list_name,
                'length': len(data)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _list_operations(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Perform operations on lists"""
        list_name = params.get('list_name', '')
        operation = params.get('list_operation', 'sum')
        
        try:
            if list_name not in self.lists:
                return {'success': False, 'error': f'List {list_name} not found'}
            
            data = np.array(self.lists[list_name])
            
            if operation == 'sum':
                result = float(np.sum(data))
            elif operation == 'mean':
                result = float(np.mean(data))
            elif operation == 'median':
                result = float(np.median(data))
            elif operation == 'std':
                result = float(np.std(data, ddof=1))
            elif operation == 'var':
                result = float(np.var(data, ddof=1))
            elif operation == 'min':
                result = float(np.min(data))
            elif operation == 'max':
                result = float(np.max(data))
            elif operation == 'sort':
                result = np.sort(data).tolist()
            elif operation == 'reverse':
                result = data[::-1].tolist()
            else:
                return {'success': False, 'error': f'Unknown operation: {operation}'}
            
            return {
                'success': True,
                'list_name': list_name,
                'operation': operation,
                'result': result
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _table_values(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate table of function values"""
        function = params.get('function', '')
        x_range = params.get('x_range', [-5, 5])
        step = params.get('step', 1)
        
        try:
            x_vals = np.arange(x_range[0], x_range[1] + step, step)
            
            # Parse and evaluate function
            x_sym = sp.Symbol('x')
            expr = sp.parse_expr(function)
            f = sp.lambdify(x_sym, expr, 'numpy')
            
            y_vals = f(x_vals)
            
            # Create table
            table_data = [{'x': float(x), 'y': float(y)} for x, y in zip(x_vals, y_vals)]
            
            return {
                'success': True,
                'function': function,
                'x_range': x_range,
                'step': step,
                'table': table_data,
                'num_points': len(table_data)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _store_variable(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Store variable"""
        try:
            var_name = params.get('var_name', '')
            var_value = params.get('var_value', 0)
            self.variables[var_name] = var_value
            return {
                'success': True,
                'variable': var_name,
                'value': var_value
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _recall_variable(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Recall variable"""
        try:
            var_name = params.get('var_name', '')
            if var_name in self.variables:
                return {
                    'success': True,
                    'variable': var_name,
                    'value': self.variables[var_name]
                }
            else:
                return {'success': False, 'error': f'Variable {var_name} not found'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _define_function(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Define custom function"""
        func_name = params.get('func_name', '')
        func_expression = params.get('func_expression', '')
        func_variables = params.get('func_variables', ['x'])
        
        try:
            # Store function definition
            self.functions[func_name] = {
                'expression': func_expression,
                'variables': func_variables
            }
            
            # Try to parse the expression to validate it
            symbols_dict = {var: sp.Symbol(var) for var in func_variables}
            expr = sp.parse_expr(func_expression, local_dict=symbols_dict)
            
            return {
                'success': True,
                'function_name': func_name,
                'expression': func_expression,
                'variables': func_variables,
                'latex': sp.latex(expr)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _execute_program(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute simple program"""
        return {'success': False, 'error': 'Program execution not yet implemented'}
    
    def _convert_units(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Convert units"""
        value = params.get('value', 0)
        from_unit = params.get('from_unit', '')
        to_unit = params.get('to_unit', '')
        
        try:
            # Common unit conversions
            conversion_factors = {
                # Length
                ('m', 'ft'): 3.28084,
                ('ft', 'm'): 0.3048,
                ('m', 'in'): 39.3701,
                ('in', 'm'): 0.0254,
                ('km', 'mi'): 0.621371,
                ('mi', 'km'): 1.60934,
                ('cm', 'in'): 0.393701,
                ('in', 'cm'): 2.54,
                
                # Mass
                ('kg', 'lb'): 2.20462,
                ('lb', 'kg'): 0.453592,
                ('g', 'oz'): 0.035274,
                ('oz', 'g'): 28.3495,
                
                # Temperature (special functions)
                ('C', 'F'): lambda c: c * 9/5 + 32,
                ('F', 'C'): lambda f: (f - 32) * 5/9,
                ('C', 'K'): lambda c: c + 273.15,
                ('K', 'C'): lambda k: k - 273.15,
                ('F', 'K'): lambda f: (f - 32) * 5/9 + 273.15,
                ('K', 'F'): lambda k: (k - 273.15) * 9/5 + 32,
                
                # Volume
                ('L', 'gal'): 0.264172,
                ('gal', 'L'): 3.78541,
                ('mL', 'fl_oz'): 0.033814,
                ('fl_oz', 'mL'): 29.5735,
                
                # Energy
                ('J', 'cal'): 0.239006,
                ('cal', 'J'): 4.184,
                ('kWh', 'J'): 3600000,
                ('J', 'kWh'): 2.77778e-7,
            }
            
            key = (from_unit, to_unit)
            if key in conversion_factors:
                factor = conversion_factors[key]
                if callable(factor):
                    result = factor(value)
                else:
                    result = value * factor
                
                return {
                    'success': True,
                    'original_value': value,
                    'from_unit': from_unit,
                    'to_unit': to_unit,
                    'converted_value': result
                }
            else:
                return {'success': False, 'error': f'Conversion from {from_unit} to {to_unit} not supported'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _financial_calc(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Financial calculations"""
        calc_type = params.get('financial_type', 'present_value')
        
        try:
            if calc_type == 'present_value':
                future_value = params.get('future_value', 0)
                interest_rate = params.get('interest_rate', 0)
                periods = params.get('periods', 1)
                
                present_value = future_value / ((1 + interest_rate) ** periods)
                
                return {
                    'success': True,
                    'calculation_type': calc_type,
                    'present_value': present_value,
                    'future_value': future_value,
                    'interest_rate': interest_rate,
                    'periods': periods
                }
                
            elif calc_type == 'future_value':
                present_value = params.get('present_value', 0)
                interest_rate = params.get('interest_rate', 0)
                periods = params.get('periods', 1)
                
                future_value = present_value * ((1 + interest_rate) ** periods)
                
                return {
                    'success': True,
                    'calculation_type': calc_type,
                    'present_value': present_value,
                    'future_value': future_value,
                    'interest_rate': interest_rate,
                    'periods': periods
                }
                
            elif calc_type == 'payment':
                principal = params.get('present_value', 0)
                interest_rate = params.get('interest_rate', 0)
                periods = params.get('periods', 1)
                
                if interest_rate == 0:
                    payment = principal / periods
                else:
                    payment = principal * (interest_rate * (1 + interest_rate)**periods) / ((1 + interest_rate)**periods - 1)
                
                return {
                    'success': True,
                    'calculation_type': calc_type,
                    'principal': principal,
                    'payment': payment,
                    'interest_rate': interest_rate,
                    'periods': periods
                }
                
            else:
                return {'success': False, 'error': f'Financial calculation {calc_type} not implemented'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
