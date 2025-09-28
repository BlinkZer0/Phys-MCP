"""
Shared pytest fixtures for Python worker tests
"""
import pytest
import numpy as np
import tempfile
import os
from unittest.mock import Mock, patch

@pytest.fixture
def mock_config():
    """Mock configuration for worker tests"""
    return {
        'artifacts_dir': '/tmp/test_artifacts',
        'cache_enabled': True,
        'gpu_enabled': False,
        'debug': True
    }

@pytest.fixture
def sample_data():
    """Sample data for testing"""
    return {
        'signal_1d': np.array([1, 2, 3, 4, 5]),
        'signal_2d': np.random.randn(10, 10),
        'coordinates_x': np.linspace(-5, 5, 100),
        'coordinates_y': np.linspace(-5, 5, 100),
        'expression': 'x**2 + 2*x + 1',
        'equation': 'x**2 - 4 = 0'
    }

@pytest.fixture
def temp_artifacts_dir():
    """Temporary directory for test artifacts"""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield tmpdir

@pytest.fixture
def mock_matplotlib():
    """Mock matplotlib to avoid GUI dependencies"""
    with patch('matplotlib.pyplot.show'), \
         patch('matplotlib.pyplot.savefig') as mock_savefig:
        mock_savefig.return_value = None
        yield mock_savefig

@pytest.fixture
def mock_sympy():
    """Mock SymPy for predictable symbolic computation"""
    with patch('sympy.sympify') as mock_sympify, \
         patch('sympy.diff') as mock_diff, \
         patch('sympy.integrate') as mock_integrate:
        
        # Configure mocks with realistic responses
        mock_sympify.return_value = Mock()
        mock_diff.return_value = Mock()
        mock_integrate.return_value = Mock()
        
        yield {
            'sympify': mock_sympify,
            'diff': mock_diff,
            'integrate': mock_integrate
        }

@pytest.fixture
def cas_worker():
    """CAS worker instance for testing"""
    from src.cas import CAS
    return CAS({'artifacts_dir': '/tmp/test'})

@pytest.fixture
def plot_worker():
    """Plot worker instance for testing"""
    from src.plot import Plot
    return Plot({'artifacts_dir': '/tmp/test'})

@pytest.fixture
def quantum_worker():
    """Quantum worker instance for testing"""
    from src.quantum import Quantum
    return Quantum({'artifacts_dir': '/tmp/test'})

@pytest.fixture
def data_worker():
    """Data worker instance for testing"""
    from src.data_io import DataIO
    return DataIO({'artifacts_dir': '/tmp/test'})
