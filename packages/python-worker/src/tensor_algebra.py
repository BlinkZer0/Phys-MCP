"""
Advanced Tensor Algebra Implementation

Comprehensive tensor operations including:
- Multi-dimensional tensor operations
- Einstein summation notation
- Differential geometry (Christoffel symbols, curvature tensors)
- General relativity calculations
- Tensor decompositions and contractions
- Coordinate transformations
"""

import numpy as np
import sympy as sp
from sympy import symbols, Matrix, Array, simplify, diff, sqrt, sin, cos
from typing import Dict, Any, List, Tuple, Optional, Union
import itertools
from functools import reduce

class TensorField:
    """Advanced tensor field implementation"""
    
    def __init__(self, components: Union[np.ndarray, List], coordinates: List[str], 
                 tensor_type: Tuple[int, int] = (0, 0)):
        """
        Initialize tensor field
        
        Args:
            components: Tensor components
            coordinates: Coordinate system (e.g., ['t', 'x', 'y', 'z'])
            tensor_type: (contravariant_rank, covariant_rank)
        """
        self.components = np.array(components)
        self.coordinates = coordinates
        self.dim = len(coordinates)
        self.contravariant_rank, self.covariant_rank = tensor_type
        self.total_rank = self.contravariant_rank + self.covariant_rank
        
        # Validate dimensions
        expected_shape = tuple([self.dim] * self.total_rank)
        if self.components.shape != expected_shape:
            raise ValueError(f"Component shape {self.components.shape} doesn't match expected {expected_shape}")
    
    def contract(self, other: 'TensorField', indices: Tuple[int, int]) -> 'TensorField':
        """Contract two tensors along specified indices"""
        # Einstein summation for tensor contraction
        i, j = indices
        
        # Build einsum string
        self_indices = list(range(self.total_rank))
        other_indices = list(range(self.total_rank, self.total_rank + other.total_rank))
        
        # Contract indices
        other_indices[j] = self_indices[i]
        
        # Remove contracted indices
        result_indices = [idx for k, idx in enumerate(self_indices) if k != i]
        result_indices.extend([idx for k, idx in enumerate(other_indices) if k != j])
        
        # Perform contraction
        einsum_str = f"{''.join(chr(97+i) for i in self_indices)},{''.join(chr(97+i) for i in other_indices)}"
        einsum_str += f"->{''.join(chr(97+i) for i in result_indices)}"
        
        result_components = np.einsum(einsum_str, self.components, other.components)
        
        # Determine result tensor type
        new_contravariant = self.contravariant_rank + other.contravariant_rank - 1
        new_covariant = self.covariant_rank + other.covariant_rank - 1
        
        return TensorField(result_components, self.coordinates, (new_contravariant, new_covariant))
    
    def raise_index(self, metric: 'TensorField', index: int) -> 'TensorField':
        """Raise an index using the metric tensor"""
        if metric.tensor_type != (2, 0):
            raise ValueError("Metric must be a (2,0) tensor")
        
        # Contract with inverse metric
        metric_inv = metric.inverse()
        return self.contract(metric_inv, (index, 0))
    
    def lower_index(self, metric: 'TensorField', index: int) -> 'TensorField':
        """Lower an index using the metric tensor"""
        if metric.tensor_type != (0, 2):
            raise ValueError("Metric must be a (0,2) tensor")
        
        return self.contract(metric, (index, 0))
    
    def inverse(self) -> 'TensorField':
        """Compute tensor inverse (for rank-2 tensors)"""
        if self.total_rank != 2:
            raise ValueError("Inverse only defined for rank-2 tensors")
        
        inv_components = np.linalg.inv(self.components)
        
        # Flip tensor type for inverse
        new_type = (self.covariant_rank, self.contravariant_rank)
        return TensorField(inv_components, self.coordinates, new_type)

def christoffel_symbols(metric: Union[np.ndarray, List], coordinates: List[str]) -> Dict[str, Any]:
    """
    Compute Christoffel symbols from metric tensor
    
    Args:
        metric: Metric tensor components (symmetric matrix)
        coordinates: Coordinate names
    
    Returns:
        Dictionary with Christoffel symbols and related quantities
    """
    try:
        # Convert to sympy for symbolic computation
        coords = [symbols(coord) for coord in coordinates]
        dim = len(coordinates)
        
        # Convert metric to sympy Matrix
        if isinstance(metric, (list, np.ndarray)):
            # For numerical metric, create symbolic representation
            g = Matrix([[sp.sympify(metric[i][j]) for j in range(dim)] for i in range(dim)])
        else:
            g = Matrix(metric)
        
        # Compute inverse metric
        g_inv = g.inv()
        
        # Compute Christoffel symbols Γ^k_ij = (1/2) g^kl (∂g_il/∂x^j + ∂g_jl/∂x^i - ∂g_ij/∂x^l)
        christoffel = sp.MutableDenseNDimArray.zeros(dim, dim, dim)
        
        for k in range(dim):
            for i in range(dim):
                for j in range(dim):
                    gamma_kij = 0
                    for l in range(dim):
                        term1 = diff(g[i, l], coords[j])
                        term2 = diff(g[j, l], coords[i])
                        term3 = diff(g[i, j], coords[l])
                        gamma_kij += g_inv[k, l] * (term1 + term2 - term3) / 2
                    
                    christoffel[k, i, j] = simplify(gamma_kij)
        
        return {
            'christoffel_symbols': christoffel,
            'metric': g,
            'inverse_metric': g_inv,
            'coordinates': coordinates,
            'dimension': dim,
            'computation': 'symbolic'
        }
        
    except Exception as e:
        raise ValueError(f"Christoffel symbol computation failed: {e}")

def riemann_tensor(christoffel: sp.Array, coordinates: List[str]) -> Dict[str, Any]:
    """
    Compute Riemann curvature tensor from Christoffel symbols
    
    R^ρ_σμν = ∂Γ^ρ_σν/∂x^μ - ∂Γ^ρ_σμ/∂x^ν + Γ^ρ_λμ Γ^λ_σν - Γ^ρ_λν Γ^λ_σμ
    """
    try:
        coords = [symbols(coord) for coord in coordinates]
        dim = len(coordinates)
        
        # Initialize Riemann tensor
        riemann = sp.MutableDenseNDimArray.zeros(dim, dim, dim, dim)
        
        for rho in range(dim):
            for sigma in range(dim):
                for mu in range(dim):
                    for nu in range(dim):
                        # Partial derivatives
                        term1 = diff(christoffel[rho, sigma, nu], coords[mu])
                        term2 = diff(christoffel[rho, sigma, mu], coords[nu])
                        
                        # Christoffel products
                        term3 = sum(christoffel[rho, lam, mu] * christoffel[lam, sigma, nu] 
                                   for lam in range(dim))
                        term4 = sum(christoffel[rho, lam, nu] * christoffel[lam, sigma, mu] 
                                   for lam in range(dim))
                        
                        riemann[rho, sigma, mu, nu] = simplify(term1 - term2 + term3 - term4)
        
        return {
            'riemann_tensor': riemann,
            'coordinates': coordinates,
            'dimension': dim,
            'symmetries': {
                'antisymmetric_last_two': True,
                'antisymmetric_first_two': True,
                'bianchi_identity': True
            }
        }
        
    except Exception as e:
        raise ValueError(f"Riemann tensor computation failed: {e}")

def ricci_tensor(riemann: sp.Array, coordinates: List[str]) -> Dict[str, Any]:
    """
    Compute Ricci tensor from Riemann tensor
    
    R_μν = R^ρ_μρν (contraction of Riemann tensor)
    """
    try:
        dim = len(coordinates)
        
        # Contract Riemann tensor: R_μν = R^ρ_μρν
        ricci = sp.MutableDenseNDimArray.zeros(dim, dim)
        
        for mu in range(dim):
            for nu in range(dim):
                ricci[mu, nu] = sum(riemann[rho, mu, rho, nu] for rho in range(dim))
                ricci[mu, nu] = simplify(ricci[mu, nu])
        
        return {
            'ricci_tensor': ricci,
            'coordinates': coordinates,
            'dimension': dim,
            'symmetry': 'symmetric'
        }
        
    except Exception as e:
        raise ValueError(f"Ricci tensor computation failed: {e}")

def ricci_scalar(ricci: sp.Array, metric_inv: sp.Matrix, coordinates: List[str]) -> Dict[str, Any]:
    """
    Compute Ricci scalar from Ricci tensor
    
    R = g^μν R_μν
    """
    try:
        dim = len(coordinates)
        
        # Contract Ricci tensor with inverse metric
        scalar = sum(metric_inv[mu, nu] * ricci[mu, nu] 
                    for mu in range(dim) for nu in range(dim))
        scalar = simplify(scalar)
        
        return {
            'ricci_scalar': scalar,
            'coordinates': coordinates,
            'dimension': dim,
            'physical_meaning': 'spacetime_curvature'
        }
        
    except Exception as e:
        raise ValueError(f"Ricci scalar computation failed: {e}")

def einstein_tensor(ricci: sp.Array, ricci_scalar: sp.Expr, metric: sp.Matrix, 
                   coordinates: List[str]) -> Dict[str, Any]:
    """
    Compute Einstein tensor
    
    G_μν = R_μν - (1/2) g_μν R
    """
    try:
        dim = len(coordinates)
        
        # Compute Einstein tensor
        einstein = sp.MutableDenseNDimArray.zeros(dim, dim)
        
        for mu in range(dim):
            for nu in range(dim):
                einstein[mu, nu] = ricci[mu, nu] - sp.Rational(1, 2) * metric[mu, nu] * ricci_scalar
                einstein[mu, nu] = simplify(einstein[mu, nu])
        
        return {
            'einstein_tensor': einstein,
            'coordinates': coordinates,
            'dimension': dim,
            'physical_meaning': 'spacetime_geometry_source',
            'field_equations': 'G_μν = 8πT_μν (in natural units)'
        }
        
    except Exception as e:
        raise ValueError(f"Einstein tensor computation failed: {e}")

def geodesic_equation(christoffel: sp.Array, coordinates: List[str]) -> Dict[str, Any]:
    """
    Generate geodesic equations
    
    d²x^μ/dτ² + Γ^μ_αβ (dx^α/dτ)(dx^β/dτ) = 0
    """
    try:
        coords = [symbols(coord) for coord in coordinates]
        dim = len(coordinates)
        
        # Parameter for geodesic (proper time or affine parameter)
        tau = symbols('tau')
        
        # Coordinate functions along geodesic
        x_funcs = [sp.Function(f'x{i}')(tau) for i in range(dim)]
        
        # Geodesic equations
        geodesic_eqs = []
        
        for mu in range(dim):
            # Second derivative term
            d2x_dtau2 = sp.diff(x_funcs[mu], tau, 2)
            
            # Christoffel term
            christoffel_term = 0
            for alpha in range(dim):
                for beta in range(dim):
                    dx_alpha = sp.diff(x_funcs[alpha], tau)
                    dx_beta = sp.diff(x_funcs[beta], tau)
                    christoffel_term += christoffel[mu, alpha, beta] * dx_alpha * dx_beta
            
            # Geodesic equation: d²x^μ/dτ² + Γ^μ_αβ (dx^α/dτ)(dx^β/dτ) = 0
            geodesic_eq = d2x_dtau2 + christoffel_term
            geodesic_eqs.append(geodesic_eq)
        
        return {
            'geodesic_equations': geodesic_eqs,
            'coordinates': coordinates,
            'parameter': 'tau',
            'physical_meaning': 'paths_of_free_particles',
            'dimension': dim
        }
        
    except Exception as e:
        raise ValueError(f"Geodesic equation generation failed: {e}")

def schwarzschild_metric() -> Dict[str, Any]:
    """Generate Schwarzschild metric for black hole spacetime"""
    try:
        # Coordinates: (t, r, θ, φ)
        t, r, theta, phi = symbols('t r theta phi', real=True)
        M, c = symbols('M c', positive=True)  # Mass and speed of light
        
        # Schwarzschild radius
        rs = 2 * M  # In natural units where G = c = 1
        
        # Metric components
        g_tt = -(1 - rs/r)
        g_rr = 1/(1 - rs/r)
        g_theta_theta = r**2
        g_phi_phi = r**2 * sin(theta)**2
        
        # Metric tensor (diagonal)
        metric = Matrix([
            [g_tt, 0, 0, 0],
            [0, g_rr, 0, 0],
            [0, 0, g_theta_theta, 0],
            [0, 0, 0, g_phi_phi]
        ])
        
        return {
            'metric': metric,
            'coordinates': ['t', 'r', 'theta', 'phi'],
            'signature': '(-,+,+,+)',
            'schwarzschild_radius': rs,
            'singularities': ['r = 0 (physical)', f'r = {rs} (coordinate)'],
            'physical_meaning': 'spacetime_around_spherically_symmetric_mass',
            'applications': ['black_holes', 'planetary_orbits', 'light_deflection']
        }
        
    except Exception as e:
        raise ValueError(f"Schwarzschild metric generation failed: {e}")

def kerr_metric() -> Dict[str, Any]:
    """Generate Kerr metric for rotating black hole"""
    try:
        # Boyer-Lindquist coordinates: (t, r, θ, φ)
        t, r, theta, phi = symbols('t r theta phi', real=True)
        M, a = symbols('M a', real=True)  # Mass and angular momentum parameter
        
        # Auxiliary quantities
        rho2 = r**2 + a**2 * cos(theta)**2
        Delta = r**2 - 2*M*r + a**2
        
        # Metric components
        g_tt = -(1 - 2*M*r/rho2)
        g_rr = rho2/Delta
        g_theta_theta = rho2
        g_phi_phi = (r**2 + a**2 + 2*M*r*a**2*sin(theta)**2/rho2) * sin(theta)**2
        g_t_phi = -2*M*r*a*sin(theta)**2/rho2
        
        # Metric tensor
        metric = Matrix([
            [g_tt, 0, 0, g_t_phi],
            [0, g_rr, 0, 0],
            [0, 0, g_theta_theta, 0],
            [g_t_phi, 0, 0, g_phi_phi]
        ])
        
        return {
            'metric': metric,
            'coordinates': ['t', 'r', 'theta', 'phi'],
            'signature': '(-,+,+,+)',
            'angular_momentum': a,
            'ergosphere': f'r < M + sqrt(M^2 - a^2*cos^2(theta))',
            'event_horizon': f'r = M + sqrt(M^2 - a^2)',
            'physical_meaning': 'spacetime_around_rotating_mass',
            'applications': ['rotating_black_holes', 'frame_dragging', 'penrose_process']
        }
        
    except Exception as e:
        raise ValueError(f"Kerr metric generation failed: {e}")

def tensor_algebra_compute(metric: List[List], coordinates: List[str], 
                          compute: List[str]) -> Dict[str, Any]:
    """
    Main function for tensor algebra computations
    
    Args:
        metric: Metric tensor components
        coordinates: Coordinate names
        compute: List of quantities to compute
    
    Returns:
        Dictionary with computed results
    """
    try:
        results = {
            'input_metric': metric,
            'coordinates': coordinates,
            'requested_computations': compute
        }
        
        # Compute Christoffel symbols if needed
        if any(comp in compute for comp in ['christoffel', 'riemann', 'ricci', 'ricci_scalar', 'geodesics']):
            christoffel_result = christoffel_symbols(metric, coordinates)
            results['christoffel'] = christoffel_result
            
            if 'christoffel' in compute:
                results['christoffel_symbols'] = christoffel_result['christoffel_symbols']
        
        # Compute Riemann tensor if needed
        if any(comp in compute for comp in ['riemann', 'ricci', 'ricci_scalar']):
            if 'christoffel' not in results:
                christoffel_result = christoffel_symbols(metric, coordinates)
                results['christoffel'] = christoffel_result
            
            riemann_result = riemann_tensor(
                christoffel_result['christoffel_symbols'], 
                coordinates
            )
            results['riemann'] = riemann_result
            
            if 'riemann' in compute:
                results['riemann_tensor'] = riemann_result['riemann_tensor']
        
        # Compute Ricci tensor if needed
        if any(comp in compute for comp in ['ricci', 'ricci_scalar']):
            if 'riemann' not in results:
                if 'christoffel' not in results:
                    christoffel_result = christoffel_symbols(metric, coordinates)
                    results['christoffel'] = christoffel_result
                riemann_result = riemann_tensor(
                    christoffel_result['christoffel_symbols'], 
                    coordinates
                )
                results['riemann'] = riemann_result
            
            ricci_result = ricci_tensor(
                results['riemann']['riemann_tensor'], 
                coordinates
            )
            results['ricci'] = ricci_result
            
            if 'ricci' in compute:
                results['ricci_tensor'] = ricci_result['ricci_tensor']
        
        # Compute Ricci scalar if needed
        if 'ricci_scalar' in compute:
            if 'ricci' not in results:
                # Compute prerequisites
                if 'christoffel' not in results:
                    christoffel_result = christoffel_symbols(metric, coordinates)
                    results['christoffel'] = christoffel_result
                if 'riemann' not in results:
                    riemann_result = riemann_tensor(
                        christoffel_result['christoffel_symbols'], 
                        coordinates
                    )
                    results['riemann'] = riemann_result
                ricci_result = ricci_tensor(
                    results['riemann']['riemann_tensor'], 
                    coordinates
                )
                results['ricci'] = ricci_result
            
            scalar_result = ricci_scalar(
                results['ricci']['ricci_tensor'],
                results['christoffel']['inverse_metric'],
                coordinates
            )
            results['ricci_scalar'] = scalar_result['ricci_scalar']
        
        # Compute geodesics if needed
        if 'geodesics' in compute:
            if 'christoffel' not in results:
                christoffel_result = christoffel_symbols(metric, coordinates)
                results['christoffel'] = christoffel_result
            
            geodesic_result = geodesic_equation(
                results['christoffel']['christoffel_symbols'],
                coordinates
            )
            results['geodesics'] = geodesic_result['geodesic_equations']
        
        return results
        
    except Exception as e:
        raise ValueError(f"Tensor algebra computation failed: {e}")
