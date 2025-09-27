"""
Phase 6: ML/AI Augmentation Implementation
GPU-first machine learning capabilities with graphics-first outputs
"""

import os
import sys
import json
import base64
import hashlib
import time
from typing import Dict, Any, List, Optional, Tuple, Union
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend

# Core ML imports
try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader, TensorDataset
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("Warning: PyTorch not available - ML features will be limited")

try:
    import sklearn
    from sklearn.metrics import confusion_matrix, classification_report, mean_squared_error, r2_score
    from sklearn.model_selection import train_test_split
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Warning: Scikit-learn not available")

try:
    import sympy as sp
    SYMPY_AVAILABLE = True
except ImportError:
    SYMPY_AVAILABLE = False
    print("Warning: SymPy not available")

# Optional advanced ML imports
try:
    import pysr
    PYSR_AVAILABLE = True
except ImportError:
    PYSR_AVAILABLE = False

try:
    import deepxde as dde
    DEEPXDE_AVAILABLE = True
except ImportError:
    DEEPXDE_AVAILABLE = False

# Import local modules
from accel import accel_caps, accel_init
from utils import generate_session_id, ensure_artifacts_dir, encode_image_b64

class MLAugmentation:
    """Main class for ML/AI augmentation capabilities"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.ml_config = config.get('ml', {})
        self.device = self._setup_device()
        self.session_id = generate_session_id()
        self.artifacts_dir = ensure_artifacts_dir(self.session_id)
        
    def _setup_device(self) -> str:
        """Setup ML device with VRAM monitoring"""
        if not TORCH_AVAILABLE:
            return 'cpu'
            
        try:
            # Get device info from accel module
            caps = accel_caps()
            device = caps.get('device', 'cpu')
            
            if device != 'cpu' and torch.cuda.is_available():
                # Check VRAM availability
                if 'cuda' in device:
                    total_memory = torch.cuda.get_device_properties(0).total_memory
                    max_vram_bytes = self.ml_config.get('max_vram_mb', 4096) * 1024 * 1024
                    if total_memory < max_vram_bytes:
                        print(f"Warning: Available VRAM ({total_memory//1024//1024}MB) less than configured max ({max_vram_bytes//1024//1024}MB)")
                        
            print(f"ML device initialized: {device}")
            return device
        except Exception as e:
            print(f"Device setup failed, using CPU: {e}")
            return 'cpu'
    
    def _estimate_memory_usage(self, batch_size: int, model_params: int = 1000000) -> int:
        """Estimate memory usage in bytes"""
        # Rough estimation: model params + batch data + gradients + optimizer states
        param_memory = model_params * 4  # 4 bytes per float32 parameter
        batch_memory = batch_size * 1000 * 4  # Rough estimate for batch data
        gradient_memory = param_memory  # Gradients same size as parameters
        optimizer_memory = param_memory * 2  # Adam optimizer states
        
        total_memory = param_memory + batch_memory + gradient_memory + optimizer_memory
        return total_memory
    
    def _adjust_batch_size(self, initial_batch_size: int, model_params: int = 1000000) -> int:
        """Adjust batch size based on VRAM constraints"""
        max_vram_bytes = self.ml_config.get('max_vram_mb', 4096) * 1024 * 1024
        
        batch_size = initial_batch_size
        while batch_size > 1:
            estimated_usage = self._estimate_memory_usage(batch_size, model_params)
            if estimated_usage <= max_vram_bytes * 0.8:  # Use 80% of available VRAM
                break
            batch_size = batch_size // 2
            
        print(f"Adjusted batch size: {initial_batch_size} -> {batch_size}")
        return max(1, batch_size)
    
    def _create_cache_key(self, method: str, params: Dict[str, Any]) -> str:
        """Create cache key from method and parameters"""
        # Remove non-deterministic fields
        cache_params = {k: v for k, v in params.items() 
                       if k not in ['session_id', 'artifacts_dir']}
        
        # Add device and version info
        cache_params['device_type'] = self.device.split(':')[0] if ':' in self.device else self.device
        cache_params['torch_version'] = torch.__version__ if TORCH_AVAILABLE else 'none'
        
        # Create hash
        param_str = json.dumps(cache_params, sort_keys=True)
        cache_key = hashlib.md5(f"{method}_{param_str}".encode()).hexdigest()
        return cache_key
    
    def symbolic_regression_train(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Milestone M6-1: Symbolic Regression Training
        Discover interpretable equations from data
        """
        start_time = time.time()
        
        try:
            # Load data
            X_data, y_data = self._load_regression_data(params['X'], params['y'])
            
            # Check cache
            cache_key = self._create_cache_key('symbolic_regression', params)
            cached_result = self._check_cache(cache_key)
            if cached_result:
                cached_result['meta']['cached'] = True
                return cached_result
            
            # Run symbolic regression
            if params.get('use_pysr', True) and PYSR_AVAILABLE:
                result = self._run_pysr_regression(X_data, y_data, params)
            else:
                result = self._run_fallback_regression(X_data, y_data, params)
            
            # Generate plots
            overlay_b64, residuals_b64 = self._create_regression_plots(
                X_data, y_data, result['predictions'], result['expression_sympy']
            )
            
            # Save predictions
            pred_path = self.artifacts_dir / f"{cache_key}_predictions.csv"
            np.savetxt(pred_path, np.column_stack([X_data.flatten(), y_data, result['predictions']]), 
                      delimiter=',', header='X,y_true,y_pred', comments='')
            
            # Prepare response
            response = {
                'expression_sympy': result['expression_sympy'],
                'expression_latex': result['expression_latex'],
                'overlay_png_b64': overlay_b64,
                'residuals_png_b64': residuals_b64,
                'csv_prediction_path': str(pred_path),
                'meta': {
                    'device': self.device,
                    'cached': False,
                    'duration_ms': int((time.time() - start_time) * 1000),
                    'r2_score': result.get('r2_score', 0.0),
                    'mse': result.get('mse', 0.0),
                    'mae': result.get('mae', 0.0)
                }
            }
            
            # Cache result
            self._save_cache(cache_key, response)
            return response
            
        except Exception as e:
            print(f"Symbolic regression error: {e}")
            raise RuntimeError(f"Symbolic regression failed: {str(e)}")
    
    def _load_regression_data(self, X_path: str, y_path: str) -> Tuple[np.ndarray, np.ndarray]:
        """Load regression data from various formats"""
        def load_data(path_or_b64: str) -> np.ndarray:
            if path_or_b64.startswith('data:') or len(path_or_b64) > 1000:
                # Base64 encoded data
                if path_or_b64.startswith('data:'):
                    b64_data = path_or_b64.split(',')[1]
                else:
                    b64_data = path_or_b64
                csv_data = base64.b64decode(b64_data).decode('utf-8')
                from io import StringIO
                return np.loadtxt(StringIO(csv_data), delimiter=',')
            else:
                # File path
                path = Path(path_or_b64)
                if path.suffix == '.csv':
                    return np.loadtxt(path, delimiter=',')
                elif path.suffix == '.npz':
                    return np.load(path)['data']
                else:
                    return np.loadtxt(path)
        
        X_data = load_data(X_path)
        y_data = load_data(y_path)
        
        # Ensure proper shapes
        if X_data.ndim == 1:
            X_data = X_data.reshape(-1, 1)
        if y_data.ndim > 1:
            y_data = y_data.flatten()
            
        return X_data, y_data
    
    def _run_pysr_regression(self, X: np.ndarray, y: np.ndarray, params: Dict[str, Any]) -> Dict[str, Any]:
        """Run PySR symbolic regression"""
        try:
            model = pysr.PySRRegressor(
                niterations=params.get('pop_size', 1000) // 10,  # Adjust iterations
                binary_operators=params.get('ops', ['+', '-', '*', '/']),
                unary_operators=['sin', 'cos', 'exp', 'log'] if 'sin' in params.get('ops', []) else [],
                maxsize=params.get('max_depth', 12),
                populations=params.get('trials', 1) * 15,
                random_state=params.get('seed', 0)
            )
            
            model.fit(X, y)
            
            # Get best expression
            best_expr = str(model.sympy())
            latex_expr = sp.latex(model.sympy()) if SYMPY_AVAILABLE else best_expr
            
            # Make predictions
            predictions = model.predict(X)
            
            # Calculate metrics
            r2 = r2_score(y, predictions) if SKLEARN_AVAILABLE else 0.0
            mse = mean_squared_error(y, predictions) if SKLEARN_AVAILABLE else 0.0
            mae = np.mean(np.abs(y - predictions))
            
            return {
                'expression_sympy': best_expr,
                'expression_latex': latex_expr,
                'predictions': predictions,
                'r2_score': r2,
                'mse': mse,
                'mae': mae
            }
            
        except Exception as e:
            print(f"PySR failed: {e}, falling back to internal method")
            return self._run_fallback_regression(X, y, params)
    
    def _run_fallback_regression(self, X: np.ndarray, y: np.ndarray, params: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback symbolic regression using genetic programming"""
        # Simple polynomial fitting as fallback
        try:
            if X.shape[1] == 1:  # Single variable
                # Try polynomial fits of increasing degree
                best_poly = None
                best_score = -np.inf
                best_degree = 1
                
                for degree in range(1, min(6, len(y) // 2)):
                    coeffs = np.polyfit(X.flatten(), y, degree)
                    poly = np.poly1d(coeffs)
                    pred = poly(X.flatten())
                    score = r2_score(y, pred) if SKLEARN_AVAILABLE else -np.mean((y - pred)**2)
                    
                    if score > best_score:
                        best_score = score
                        best_poly = poly
                        best_degree = degree
                
                # Convert to SymPy expression
                if SYMPY_AVAILABLE:
                    x = sp.Symbol('x')
                    expr = sum(coeff * x**i for i, coeff in enumerate(reversed(best_poly.coeffs)))
                    expr_str = str(expr)
                    latex_str = sp.latex(expr)
                else:
                    expr_str = f"polynomial_degree_{best_degree}"
                    latex_str = f"P_{{{best_degree}}}(x)"
                
                predictions = best_poly(X.flatten())
                
            else:  # Multiple variables - linear regression
                from sklearn.linear_model import LinearRegression
                model = LinearRegression()
                model.fit(X, y)
                predictions = model.predict(X)
                
                # Create expression string
                feature_names = [f'x{i}' for i in range(X.shape[1])]
                terms = [f"{coeff:.3f}*{name}" for coeff, name in zip(model.coef_, feature_names)]
                expr_str = f"{model.intercept_:.3f} + " + " + ".join(terms)
                latex_str = expr_str.replace('*', r' \cdot ')
            
            # Calculate metrics
            r2 = r2_score(y, predictions) if SKLEARN_AVAILABLE else 0.0
            mse = mean_squared_error(y, predictions) if SKLEARN_AVAILABLE else np.mean((y - predictions)**2)
            mae = np.mean(np.abs(y - predictions))
            
            return {
                'expression_sympy': expr_str,
                'expression_latex': latex_str,
                'predictions': predictions,
                'r2_score': r2,
                'mse': mse,
                'mae': mae
            }
            
        except Exception as e:
            # Ultimate fallback - mean prediction
            mean_pred = np.full_like(y, np.mean(y))
            return {
                'expression_sympy': f"{np.mean(y):.3f}",
                'expression_latex': f"{np.mean(y):.3f}",
                'predictions': mean_pred,
                'r2_score': 0.0,
                'mse': np.var(y),
                'mae': np.mean(np.abs(y - np.mean(y)))
            }
    
    def _create_regression_plots(self, X: np.ndarray, y_true: np.ndarray, 
                               y_pred: np.ndarray, expression: str) -> Tuple[str, str]:
        """Create overlay and residuals plots for regression"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
        
        # Overlay plot
        if X.shape[1] == 1:
            sort_idx = np.argsort(X.flatten())
            ax1.scatter(X.flatten(), y_true, alpha=0.6, label='Data', s=20)
            ax1.plot(X.flatten()[sort_idx], y_pred[sort_idx], 'r-', label='Prediction', linewidth=2)
        else:
            ax1.scatter(y_true, y_pred, alpha=0.6, s=20)
            ax1.plot([y_true.min(), y_true.max()], [y_true.min(), y_true.max()], 'r--', alpha=0.8)
            ax1.set_xlabel('True Values')
            ax1.set_ylabel('Predicted Values')
        
        ax1.set_title(f'Prediction Overlay\n{expression[:50]}{"..." if len(expression) > 50 else ""}')
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        
        # Residuals plot
        residuals = y_true - y_pred
        if X.shape[1] == 1:
            ax2.scatter(X.flatten(), residuals, alpha=0.6, s=20)
            ax2.set_xlabel('X')
        else:
            ax2.scatter(y_pred, residuals, alpha=0.6, s=20)
            ax2.set_xlabel('Predicted Values')
        
        ax2.axhline(y=0, color='r', linestyle='--', alpha=0.8)
        ax2.set_ylabel('Residuals')
        ax2.set_title('Residuals Plot')
        ax2.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        # Save and encode
        overlay_path = self.artifacts_dir / 'regression_overlay.png'
        plt.savefig(overlay_path, dpi=150, bbox_inches='tight')
        overlay_b64 = encode_image_b64(overlay_path)
        
        # Create separate residuals plot
        plt.figure(figsize=(8, 6))
        plt.scatter(y_pred, residuals, alpha=0.6, s=20)
        plt.axhline(y=0, color='r', linestyle='--', alpha=0.8)
        plt.xlabel('Predicted Values')
        plt.ylabel('Residuals')
        plt.title('Residuals Analysis')
        plt.grid(True, alpha=0.3)
        
        residuals_path = self.artifacts_dir / 'regression_residuals.png'
        plt.savefig(residuals_path, dpi=150, bbox_inches='tight')
        residuals_b64 = encode_image_b64(residuals_path)
        
        plt.close('all')
        return overlay_b64, residuals_b64
    
    def _check_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Check if cached result exists"""
        cache_path = self.artifacts_dir / f"cache_{cache_key}.json"
        if cache_path.exists():
            try:
                with open(cache_path, 'r') as f:
                    return json.load(f)
            except Exception:
                pass
        return None
    
    def _save_cache(self, cache_key: str, result: Dict[str, Any]) -> None:
        """Save result to cache"""
        cache_path = self.artifacts_dir / f"cache_{cache_key}.json"
        try:
            with open(cache_path, 'w') as f:
                json.dump(result, f, indent=2)
        except Exception as e:
            print(f"Cache save failed: {e}")


# Worker function implementations
def ml_symbolic_regression(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Worker function for symbolic regression"""
    ml = MLAugmentation(config)
    return ml.symbolic_regression_train(params)


def ml_surrogate_pde(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Worker function for surrogate PDE training - placeholder for now"""
    # TODO: Implement in next part
    raise NotImplementedError("Surrogate PDE training will be implemented in the next update")


def ml_pattern_recognition(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Worker function for pattern recognition - placeholder for now"""
    # TODO: Implement in next part
    raise NotImplementedError("Pattern recognition will be implemented in the next update")


def ml_explain_derivation(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Worker function for derivation explanation - placeholder for now"""
    # TODO: Implement in next part
    raise NotImplementedError("Derivation explanation will be implemented in the next update")
