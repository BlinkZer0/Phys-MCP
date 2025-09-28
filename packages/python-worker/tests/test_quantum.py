"""
Tests for quantum MVP functionality
"""

import pytest
import numpy as np
import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from quantum_mvp import (
    get_operator_matrix, commutator, is_unitary, normalize_state,
    state_to_bloch_vector, quantum_ops, quantum_solve, quantum_visualize,
    parse_state_string, simple_harmonic_oscillator, particle_in_box
)

class TestQuantumOperators:
    """Test quantum operator functionality"""
    
    def test_pauli_matrices(self):
        """Test Pauli matrix properties"""
        X = get_operator_matrix('X')
        Y = get_operator_matrix('Y')
        Z = get_operator_matrix('Z')
        I = get_operator_matrix('I')
        
        # Test dimensions
        assert X.shape == (2, 2)
        assert Y.shape == (2, 2)
        assert Z.shape == (2, 2)
        assert I.shape == (2, 2)
        
        # Test unitarity
        assert is_unitary(X)
        assert is_unitary(Y)
        assert is_unitary(Z)
        assert is_unitary(I)
        
        # Test Pauli algebra: {σᵢ, σⱼ} = 2δᵢⱼI
        assert np.allclose(X @ X, I)
        assert np.allclose(Y @ Y, I)
        assert np.allclose(Z @ Z, I)
    
    def test_commutators(self):
        """Test commutation relations"""
        X = get_operator_matrix('X')
        Y = get_operator_matrix('Y')
        Z = get_operator_matrix('Z')
        
        # [X, Y] = 2iZ
        comm_XY = commutator(X, Y)
        expected = 2j * Z
        assert np.allclose(comm_XY, expected)
        
        # [Y, Z] = 2iX
        comm_YZ = commutator(Y, Z)
        expected = 2j * X
        assert np.allclose(comm_YZ, expected)
        
        # [Z, X] = 2iY
        comm_ZX = commutator(Z, X)
        expected = 2j * Y
        assert np.allclose(comm_ZX, expected)
    
    def test_hadamard_gate(self):
        """Test Hadamard gate properties"""
        H = get_operator_matrix('H')
        
        # Test unitarity
        assert is_unitary(H)
        
        # H² = I
        assert np.allclose(H @ H, np.eye(2))
        
        # H|0⟩ = (|0⟩ + |1⟩)/√2
        state_0 = np.array([1, 0])
        plus_state = H @ state_0
        expected = np.array([1, 1]) / np.sqrt(2)
        assert np.allclose(plus_state, expected)

class TestQuantumStates:
    """Test quantum state operations"""
    
    def test_state_normalization(self):
        """Test state normalization"""
        state = np.array([3, 4], dtype=complex)
        normalized = normalize_state(state)
        
        assert np.allclose(np.linalg.norm(normalized), 1.0)
        assert np.allclose(normalized, np.array([0.6, 0.8]))
    
    def test_bloch_vector_conversion(self):
        """Test Bloch sphere coordinate conversion"""
        # |0⟩ state should be at north pole
        state_0 = np.array([1, 0])
        x, y, z = state_to_bloch_vector(state_0)
        assert np.allclose([x, y, z], [0, 0, 1])
        
        # |1⟩ state should be at south pole
        state_1 = np.array([0, 1])
        x, y, z = state_to_bloch_vector(state_1)
        assert np.allclose([x, y, z], [0, 0, -1])
        
        # |+⟩ state should be on +X axis
        state_plus = np.array([1, 1]) / np.sqrt(2)
        x, y, z = state_to_bloch_vector(state_plus)
        assert np.allclose([x, y, z], [1, 0, 0], atol=1e-10)
    
    def test_state_parsing(self):
        """Test state string parsing"""
        # Real amplitudes
        state = parse_state_string("1,0")
        assert np.allclose(state, [1, 0])
        
        state = parse_state_string("0.707,0.707")
        assert np.allclose(state, [0.707, 0.707])
        
        # Complex amplitudes
        state = parse_state_string("1+0j,0+0j")
        assert np.allclose(state, [1+0j, 0+0j])

class TestQuantumOps:
    """Test quantum_ops function"""
    
    def test_matrix_representation(self):
        """Test matrix representation task"""
        result = quantum_ops(['X', 'Y', 'Z'], 'matrix_rep')
        
        assert result['task'] == 'matrix_representation'
        assert 'X' in result['matrices']
        assert 'Y' in result['matrices']
        assert 'Z' in result['matrices']
        
        # Check properties
        assert result['properties']['X']['unitary'] is True
        assert result['properties']['X']['hermitian'] is True
    
    def test_commutator_task(self):
        """Test commutator calculation task"""
        result = quantum_ops(['X', 'Y'], 'commutator')
        
        assert result['task'] == 'commutator'
        assert result['commute'] is False
        assert result['commutator_norm'] > 0
        
        # Test commuting operators
        result = quantum_ops(['X', 'X'], 'commutator')
        assert result['commute'] is True

class TestQuantumSolve:
    """Test quantum problem solving"""
    
    def test_harmonic_oscillator(self):
        """Test quantum harmonic oscillator"""
        result = quantum_solve('sho', params={'n_max': 5, 'omega': 2.0})
        
        assert result['problem'] == 'quantum_harmonic_oscillator'
        assert len(result['energy_levels']) == 6  # n=0 to n=5
        
        # Check energy level spacing
        energies = result['energy_levels']
        spacing = energies[1] - energies[0]
        assert np.allclose(spacing, 2.0)  # ℏω = 2.0
    
    def test_particle_in_box(self):
        """Test particle in a box"""
        result = quantum_solve('particle_in_box', params={'length': 1.0, 'n_max': 3})
        
        assert result['problem'] == 'particle_in_box'
        assert len(result['energy_levels']) == 3
        
        # Check energy scaling: E_n ∝ n²
        energies = result['energy_levels']
        assert energies[1] / energies[0] == pytest.approx(4.0, rel=1e-6)  # E₂/E₁ = 4
        assert energies[2] / energies[0] == pytest.approx(9.0, rel=1e-6)  # E₃/E₁ = 9

class TestQuantumVisualize:
    """Test quantum visualization"""
    
    def test_bloch_sphere_visualization(self):
        """Test Bloch sphere visualization"""
        result = quantum_visualize("1,0", "bloch")
        
        assert result['visualization'] == 'bloch_sphere'
        assert 'image' in result
        assert result['format'] == 'png_base64'
        assert 'bloch_vector' in result
        
        # Check Bloch vector for |0⟩ state
        bloch = result['bloch_vector']
        assert np.allclose([bloch['x'], bloch['y'], bloch['z']], [0, 0, 1])
    
    def test_probability_density_visualization(self):
        """Test probability density visualization"""
        result = quantum_visualize("0.6,0.8", "prob_density")
        
        assert result['visualization'] == 'probability_density'
        assert 'image' in result
        assert result['format'] == 'png_base64'
        assert 'probabilities' in result
        
        # Check probabilities
        probs = result['probabilities']
        assert np.allclose(probs, [0.36, 0.64])  # |0.6|² and |0.8|²
        assert np.allclose(sum(probs), 1.0)  # Normalized

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
