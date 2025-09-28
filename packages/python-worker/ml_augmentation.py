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
from io import BytesIO
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

try:
    from PIL import Image, ImageDraw
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    from scipy import ndimage as ndi
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False

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
            # Load data - handle both parameter formats
            X_param = params.get('X') or params.get('data_x')
            y_param = params.get('y') or params.get('data_y')
            
            if X_param is None or y_param is None:
                raise ValueError("Missing required parameters: X/data_x and y/data_y")
            
            # Handle direct array data vs file paths
            if isinstance(X_param, (list, np.ndarray)) and isinstance(y_param, (list, np.ndarray)):
                X_data = np.array(X_param)
                y_data = np.array(y_param)
                if X_data.ndim == 1:
                    X_data = X_data.reshape(-1, 1)
                if y_data.ndim > 1:
                    y_data = y_data.flatten()
            else:
                X_data, y_data = self._load_regression_data(X_param, y_param)
            
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
    

def surrogate_pde_train(self, params: Dict[str, Any]) -> Dict[str, Any]:
    """Milestone M6-2: Train a surrogate for PDE solutions."""
    start_time = time.time()

    if not TORCH_AVAILABLE:
        raise RuntimeError("PyTorch is required for surrogate PDE training")

    sanitized_params = dict(params)
    if sanitized_params.get('train_data'):
        data_value = sanitized_params['train_data']
        sanitized_params['train_data'] = f"len:{len(data_value)}"

    cache_key = self._create_cache_key('surrogate_pde', sanitized_params)
    cached_result = self._check_cache(cache_key)
    if cached_result:
        cached_result['meta']['cached'] = True
        return cached_result

    epochs = int(params.get('epochs', 200))
    batch_size = int(params.get('batch_size', 1024))
    lr = float(params.get('lr', 1e-3))
    problem = params.get('problem', 'pinn') or 'pinn'
    animate = bool(params.get('animate', False))
    fps = max(1, int(params.get('fps', 24)))
    fmt = params.get('format', 'mp4') or 'mp4'

    if params.get('train_data'):
        inputs, targets = self._load_pde_dataset(params['train_data'])
    else:
        inputs, targets = self._generate_synthetic_pde_samples(params)

    if inputs.size == 0 or targets.size == 0:
        raise ValueError("Failed to load training data for surrogate PDE model")

    device = torch.device(self.device if self.device and TORCH_AVAILABLE else 'cpu')
    input_tensor = torch.from_numpy(inputs).float().to(device)
    target_tensor = torch.from_numpy(targets).float().to(device)

    dataset = TensorDataset(input_tensor, target_tensor)
    adjusted_batch = self._adjust_batch_size(batch_size, model_params=inputs.shape[1] * 128)
    loader = DataLoader(dataset, batch_size=max(1, adjusted_batch), shuffle=True)

    model = nn.Sequential(
        nn.Linear(inputs.shape[1], 128),
        nn.Tanh(),
        nn.Linear(128, 128),
        nn.Tanh(),
        nn.Linear(128, 1)
    ).to(device)

    optimizer = optim.Adam(model.parameters(), lr=lr)
    loss_fn = nn.MSELoss()

    loss_history: List[float] = []
    best_loss = float('inf')
    patience = 20
    patience_counter = 0
    epochs_run = 0

    for epoch in range(epochs):
        model.train()
        epoch_loss = 0.0
        for batch_inputs, batch_targets in loader:
            optimizer.zero_grad()
            preds = model(batch_inputs)
            loss = loss_fn(preds, batch_targets)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item() * batch_inputs.size(0)

        epoch_loss /= len(dataset)
        loss_history.append(epoch_loss)
        epochs_run = epoch + 1

        if epoch_loss + 1e-6 < best_loss:
            best_loss = epoch_loss
            patience_counter = 0
        else:
            patience_counter += 1

        if patience_counter >= patience:
            break

    model.eval()
    with torch.no_grad():
        predictions = model(input_tensor).cpu().numpy().flatten()

    true_values = target_tensor.cpu().numpy().flatten()
    duration_ms = int((time.time() - start_time) * 1000)

    training_plot = self.artifacts_dir / f"{cache_key}_training.png"
    self._plot_training_curve(loss_history, training_plot)
    training_b64 = encode_image_b64(training_plot)

    comparison_plot = self.artifacts_dir / f"{cache_key}_comparison.png"
    error_plot = self.artifacts_dir / f"{cache_key}_error.png"
    self._plot_pde_diagnostics(inputs, true_values, predictions, comparison_plot, error_plot)
    comparison_b64 = encode_image_b64(comparison_plot)
    error_b64 = encode_image_b64(error_plot)

    model_path = self.artifacts_dir / f"{cache_key}_model.pt"
    torch.save({
        'state_dict': model.state_dict(),
        'input_dim': inputs.shape[1],
        'problem': problem,
        'learning_rate': lr,
        'epochs_trained': epochs_run
    }, model_path)

    animation_path = None
    if animate:
        animation_path = self._maybe_generate_surrogate_animation(inputs, predictions, cache_key, fmt, fps)

    response = {
        'model_path': str(model_path),
        'training_curves_png_b64': training_b64,
        'pred_vs_truth_png_b64': comparison_b64,
        'error_heatmap_png_b64': error_b64,
        'animation_path': animation_path,
        'meta': {
            'device': self.device,
            'epochs': epochs_run,
            'early_stopped': epochs_run < epochs,
            'final_loss': float(best_loss),
            'duration_ms': duration_ms,
            'cached': False,
            'animation_generated': animation_path is not None
        }
    }

    self._save_cache(cache_key, response)
    return response

def pattern_recognition_infer(self, params: Dict[str, Any]) -> Dict[str, Any]:
    """Milestone M6-3: Perform lightweight pattern recognition on imagery."""
    start_time = time.time()

    sanitized_params = dict(params)
    sanitized_params['images'] = [f"len:{len(img)}" for img in sanitized_params.get('images', [])]
    cache_key = self._create_cache_key('pattern_recognition', sanitized_params)
    cached_result = self._check_cache(cache_key)
    if cached_result:
        cached_result['meta']['cached'] = True
        return cached_result

    images = params.get('images', [])
    if not images:
        raise ValueError("At least one image is required for pattern recognition")

    threshold = float(params.get('threshold', 0.25))
    task = params.get('task', 'detect') or 'detect'
    labels = params.get('labels') or []

    annotated_images: List[str] = []
    per_image_stats: List[Dict[str, Any]] = []
    confidences: List[float] = []
    confusion_totals = {'tp': 0, 'fp': 0, 'fn': 0, 'tn': 0}
    total_pixels = 0
    positive_pixels = 0

    for idx, source in enumerate(images):
        image_arr = self._load_image_data(source)
        mask, detections, confusion, mean_intensity, positives, pixel_count = self._detect_image_regions(image_arr, threshold)

        total_pixels += pixel_count
        positive_pixels += positives
        for key in confusion_totals:
            confusion_totals[key] += confusion[key]

        annotated_path = self.artifacts_dir / f"{cache_key}_annotated_{idx}.png"
        self._save_annotated_image(image_arr, mask, detections, annotated_path, task, labels)
        annotated_images.append(encode_image_b64(annotated_path))

        confidences.extend([det['confidence'] for det in detections])
        per_image_stats.append({
            'index': idx,
            'detections': detections,
            'mean_intensity': mean_intensity,
            'positive_pixels': positives,
            'total_pixels': pixel_count
        })

    metrics = {
        'task': task,
        'threshold': threshold,
        'confusion_totals': confusion_totals,
        'mean_confidence': float(np.mean(confidences)) if confidences else 0.0,
        'detections_per_image': [len(item['detections']) for item in per_image_stats],
        'positive_ratio': positive_pixels / total_pixels if total_pixels else 0.0,
        'per_image': per_image_stats
    }

    metrics_path = self.artifacts_dir / f"{cache_key}_metrics.json"
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)

    confusion_plot = self.artifacts_dir / f"{cache_key}_confusion.png"
    self._plot_confusion_overview(confusion_totals, confusion_plot)
    confusion_b64 = encode_image_b64(confusion_plot)

    accuracy_den = sum(confusion_totals.values())
    accuracy = ((confusion_totals['tp'] + confusion_totals['tn']) / accuracy_den) if accuracy_den else 0.0

    response = {
        'annotated_images': annotated_images,
        'confusion_matrix_png_b64': confusion_b64,
        'metrics_json_path': str(metrics_path),
        'meta': {
            'device': self.device,
            'cached': False,
            'num_detections': sum(len(item['detections']) for item in per_image_stats),
            'mean_confidence': metrics['mean_confidence'],
            'accuracy': accuracy
        }
    }

    self._save_cache(cache_key, response)
    return response

def explain_derivation(self, params: Dict[str, Any]) -> Dict[str, Any]:
    """Milestone M6-4: Provide structured explanations for symbolic derivations."""
    start_time = time.time()

    cache_key = self._create_cache_key('explain_derivation', params)
    cached_result = self._check_cache(cache_key)
    if cached_result:
        cached_result['meta']['cached'] = True
        return cached_result

    goal = params.get('goal', 'explain') or 'explain'
    expr_text = params.get('context_expr_sympy')
    if not expr_text:
        raise ValueError("context_expr_sympy is required to explain a derivation")

    assumptions = params.get('assumptions', []) or []
    audience = params.get('audience_level', 'grad') or 'grad'

    if SYMPY_AVAILABLE:
        expr = sp.sympify(expr_text)
        latex = sp.latex(expr)
        steps = self._summarize_expression(expr)
        if goal == 'derive' and expr.free_symbols:
            symbol = sorted(expr.free_symbols, key=lambda s: s.name)[0]
            derivative = sp.diff(expr, symbol)
            steps.append(f"Differentiate with respect to {symbol}: ${sp.latex(derivative)}$")
    else:
        latex = expr_text
        steps = [f"Expression analysis requires SymPy. Treating `{expr_text}` as a symbolic string."]

    summary_md = self._build_explanation_markdown(expr_text, steps, assumptions, goal, audience)

    response = {
        'latex': latex,
        'summary_md': summary_md,
        'meta': {
            'tokens': len(summary_md.split()),
            'model_used': 'sympy' if SYMPY_AVAILABLE else 'rule-based',
            'duration_ms': int((time.time() - start_time) * 1000),
            'cached': False
        }
    }

    self._save_cache(cache_key, response)
    return response
    
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
    

    def _load_pde_dataset(self, data_source: str) -> Tuple[np.ndarray, np.ndarray]:
        """Load PDE training data from a file path or base64 payload."""
        if not data_source:
            return np.empty((0, 0)), np.empty((0, 0))

        raw_bytes: Optional[bytes]
        if data_source.startswith('data:'):
            _, b64 = data_source.split(',', 1)
            raw_bytes = base64.b64decode(b64)
        elif len(data_source) > 512 and not Path(data_source).exists():
            try:
                raw_bytes = base64.b64decode(data_source)
            except Exception:
                raw_bytes = None
        else:
            raw_bytes = None

        if raw_bytes is not None:
            buffer = BytesIO(raw_bytes)
            try:
                array = np.loadtxt(buffer, delimiter=',')
            except Exception:
                buffer.seek(0)
                data = np.load(buffer, allow_pickle=True)
                if isinstance(data, np.lib.npyio.NpzFile):
                    if 'inputs' in data and 'targets' in data:
                        return data['inputs'], data['targets']
                    elif {'x', 't', 'u'}.issubset(data.files):
                        inputs = np.stack([data['x'], data['t']], axis=1)
                        targets = data['u'].reshape(-1, 1)
                        return inputs, targets
                raise ValueError('Unable to parse provided train_data payload')
        else:
            path = Path(data_source)
            if not path.exists():
                raise FileNotFoundError(f'Training data not found: {data_source}')
            if path.suffix == '.npz':
                data = np.load(path, allow_pickle=True)
                if 'inputs' in data and 'targets' in data:
                    return data['inputs'], data['targets']
                elif {'x', 't', 'u'}.issubset(data.files):
                    inputs = np.stack([data['x'], data['t']], axis=1)
                    targets = data['u'].reshape(-1, 1)
                    return inputs, targets
                raise ValueError('Unsupported NPZ layout for PDE data')
            else:
                array = np.loadtxt(path, delimiter=',')

        if isinstance(array, np.ndarray):
            if array.ndim == 1:
                array = array.reshape(-1, 1)
            if array.shape[1] < 2:
                raise ValueError('Expected at least two columns (inputs + target) in train_data')
            inputs = array[:, :-1]
            targets = array[:, -1:].reshape(-1, 1)
            return inputs, targets

        raise ValueError('Failed to load PDE dataset')

    def _generate_synthetic_pde_samples(self, params: Dict[str, Any], samples: int = 4096) -> Tuple[np.ndarray, np.ndarray]:
        """Generate synthetic samples for a simple heat-equation style solution."""
        domain = params.get('domain', {}) or {}
        bounds = domain.get('bounds', {}) or {}
        axes = list(bounds.keys()) or ['x', 't']
        rng = np.random.default_rng(params.get('seed', 0))

        data = []
        for axis in axes:
            low, high = bounds.get(axis, [0.0, 1.0])
            data.append(rng.uniform(low, high, samples))

        inputs = np.stack(data, axis=1)
        response = np.ones(samples)

        for idx, axis in enumerate(axes):
            axis_vals = data[idx]
            if axis.lower().startswith('t'):
                response *= np.exp(-np.pi ** 2 * axis_vals)
            elif axis.lower().startswith('y'):
                response *= np.cos(np.pi * axis_vals)
            else:
                response *= np.sin(np.pi * axis_vals)

        targets = response.reshape(-1, 1)
        return inputs.astype(np.float32), targets.astype(np.float32)

    def _plot_training_curve(self, losses: List[float], path: Path) -> None:
        """Plot training loss history."""
        plt.figure(figsize=(6, 4))
        if losses:
            plt.plot(range(1, len(losses) + 1), losses, marker='o', linewidth=1.5)
        else:
            plt.plot([0], [0])
        plt.xlabel('Epoch')
        plt.ylabel('MSE Loss')
        plt.title('Surrogate PDE Training Curve')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(path, dpi=150)
        plt.close()

    def _plot_pde_diagnostics(self, inputs: np.ndarray, true_vals: np.ndarray, pred_vals: np.ndarray,
                              comparison_path: Path, error_path: Path) -> None:
        """Create diagnostic plots comparing predictions to ground truth."""
        plt.figure(figsize=(6, 5))
        diff = pred_vals - true_vals
        scatter = plt.scatter(true_vals, pred_vals, c=np.abs(diff), cmap='viridis', s=12)
        plt.plot([true_vals.min(), true_vals.max()], [true_vals.min(), true_vals.max()], 'k--', linewidth=1)
        plt.xlabel('True Values')
        plt.ylabel('Predicted Values')
        plt.title('Prediction vs Truth')
        plt.colorbar(scatter, label='|Error|')
        plt.tight_layout()
        plt.savefig(comparison_path, dpi=150)
        plt.close()

        plt.figure(figsize=(6, 5))
        if inputs.shape[1] >= 2:
            contour = plt.tricontourf(inputs[:, 0], inputs[:, 1], diff, levels=24, cmap='coolwarm')
            plt.colorbar(contour, label='Prediction Error')
            plt.xlabel('Input axis 0')
            plt.ylabel('Input axis 1')
            plt.title('Error Field (Pred - True)')
        else:
            order = np.argsort(inputs[:, 0])
            plt.plot(inputs[order, 0], diff[order], 'r-', linewidth=1.5)
            plt.xlabel('Input axis 0')
            plt.ylabel('Error')
            plt.title('Prediction Error Profile')
            plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(error_path, dpi=150)
        plt.close()

    def _maybe_generate_surrogate_animation(self, inputs: np.ndarray, predictions: np.ndarray, cache_key: str,
                                            fmt: str, fps: int) -> Optional[str]:
        """Generate an optional animation showing surrogate evolution over time."""
        if inputs.shape[1] < 2:
            return None
        try:
            from matplotlib import animation
        except ImportError:
            return None

        fmt = (fmt or 'gif').lower()
        if fmt not in {'gif', 'mp4', 'webm'}:
            fmt = 'gif'

        times = np.linspace(inputs[:, 1].min(), inputs[:, 1].max(), num=min(30, max(5, len(np.unique(inputs[:, 1])))))
        x_values = inputs[:, 0]
        predictions = predictions.reshape(-1)

        fig, ax = plt.subplots(figsize=(6, 4))
        ax.set_xlabel('x')
        ax.set_ylabel('u(x, t)')
        ax.set_title('Surrogate Evolution')
        ax.set_xlim(float(np.min(x_values)), float(np.max(x_values)))
        ax.set_ylim(float(np.min(predictions)), float(np.max(predictions)))
        line, = ax.plot([], [], lw=2)

        def frame_data(t_value: float) -> Tuple[np.ndarray, np.ndarray]:
            mask = np.isclose(inputs[:, 1], t_value, atol=1e-3)
            if not mask.any():
                idx = np.argmin(np.abs(inputs[:, 1] - t_value))
                mask = np.abs(inputs[:, 1] - inputs[idx, 1]) < 1e-2
            xs = x_values[mask]
            ys = predictions[mask]
            if xs.size == 0:
                return np.array([]), np.array([])
            order = np.argsort(xs)
            return xs[order], ys[order]

        def init():
            line.set_data([], [])
            return (line,)

        def update(frame_time: float):
            xs, ys = frame_data(frame_time)
            if xs.size:
                line.set_data(xs, ys)
                ax.set_title(f'Surrogate Evolution t={frame_time:.3f}')
            return (line,)

        ani = animation.FuncAnimation(fig, update, frames=times, init_func=init, blit=True)
        writer_map = {
            'gif': animation.PillowWriter,
            'mp4': animation.FFMpegWriter,
            'webm': animation.FFMpegWriter
        }
        writer_cls = writer_map.get(fmt, animation.PillowWriter)
        extension = 'gif' if writer_cls is animation.PillowWriter else fmt
        animation_path = self.artifacts_dir / f"{cache_key}_animation.{extension}"
        try:
            if writer_cls is animation.PillowWriter:
                ani.save(animation_path, writer=writer_cls(fps=fps))
            else:
                ani.save(animation_path, writer=writer_cls(fps=fps))
        except Exception:
            plt.close(fig)
            return None
        finally:
            plt.close(fig)
        return str(animation_path)

    def _load_image_data(self, source: str) -> np.ndarray:
        """Load an image from a path or base64 payload and normalize to [0, 1]."""
        if not source:
            raise ValueError('Empty image source provided')

        raw_bytes: Optional[bytes]
        if source.startswith('data:'):
            _, b64 = source.split(',', 1)
            raw_bytes = base64.b64decode(b64)
        elif len(source) > 512 and not Path(source).exists():
            raw_bytes = base64.b64decode(source)
        else:
            path = Path(source)
            if not path.exists():
                raise FileNotFoundError(f'Image not found: {source}')
            raw_bytes = path.read_bytes()

        if PIL_AVAILABLE:
            image = Image.open(BytesIO(raw_bytes)).convert('RGB')
            array = np.asarray(image, dtype=np.float32)
        else:
            from matplotlib import image as mpimg
            array = mpimg.imread(BytesIO(raw_bytes))
            if array.dtype != np.float32:
                array = array.astype(np.float32)
            if array.max() > 1.0:
                array /= 255.0
            return array

        if array.max() > 1.0:
            array /= 255.0
        return array

    def _detect_image_regions(self, image: np.ndarray, threshold: float) -> Tuple[np.ndarray, List[Dict[str, Any]], Dict[str, int], float, int, int]:
        """Detect bright regions in the image using a simple threshold heuristic."""
        if image.ndim == 3:
            gray = image.mean(axis=2)
        else:
            gray = image.astype(np.float32)

        norm = gray - gray.min()
        denom = gray.max() - gray.min()
        if denom > 0:
            norm /= denom
        mask = norm >= threshold

        detections: List[Dict[str, Any]] = []
        positive_pixels = int(mask.sum())
        total_pixels = int(mask.size)

        if mask.any():
            if SCIPY_AVAILABLE:
                labeled, num = ndi.label(mask)
                for label_id in range(1, num + 1):
                    coords = np.argwhere(labeled == label_id)
                    if coords.size == 0:
                        continue
                    y_min, x_min = coords.min(axis=0)
                    y_max, x_max = coords.max(axis=0)
                    confidence = float(norm[labeled == label_id].mean())
                    detections.append({
                        'bbox': [int(x_min), int(y_min), int(x_max), int(y_max)],
                        'confidence': confidence
                    })
            else:
                coords = np.argwhere(mask)
                y_min, x_min = coords.min(axis=0)
                y_max, x_max = coords.max(axis=0)
                confidence = float(norm[mask].mean())
                detections.append({
                    'bbox': [int(x_min), int(y_min), int(x_max), int(y_max)],
                    'confidence': confidence
                })
        else:
            mask = np.zeros_like(mask, dtype=bool)

        if not detections:
            mean_intensity = float(norm.mean()) if norm.size else 0.0
            detections.append({
                'bbox': [0, 0, int(mask.shape[1]) - 1, int(mask.shape[0]) - 1],
                'confidence': mean_intensity,
                'label': 'global'
            })
        else:
            mean_intensity = float(norm[mask].mean()) if mask.any() else float(norm.mean())

        if SCIPY_AVAILABLE:
            smoothed = ndi.gaussian_filter(norm, sigma=1.0)
            reference_mask = smoothed >= min(threshold + 0.1, 0.95)
        else:
            reference_mask = norm >= min(threshold + 0.1, 1.0)

        tp = int(np.logical_and(mask, reference_mask).sum())
        fp = int(np.logical_and(mask, ~reference_mask).sum())
        fn = int(np.logical_and(~mask, reference_mask).sum())
        tn = int(mask.size - tp - fp - fn)

        confusion = {'tp': tp, 'fp': fp, 'fn': fn, 'tn': tn}
        return mask, detections, confusion, mean_intensity, positive_pixels, total_pixels

    def _save_annotated_image(self, image: np.ndarray, mask: np.ndarray, detections: List[Dict[str, Any]],
                              path: Path, task: str, labels: List[str]) -> None:
        """Save an annotated version of the image highlighting detections."""
        array = (np.clip(image, 0.0, 1.0) * 255).astype(np.uint8)

        if PIL_AVAILABLE:
            base = Image.fromarray(array)
            if task == 'segment':
                overlay = Image.new('RGBA', base.size, (255, 0, 0, 0))
                alpha = Image.fromarray((mask.astype(np.uint8) * 120))
                overlay.putalpha(alpha)
                base = Image.alpha_composite(base.convert('RGBA'), overlay)
            draw = ImageDraw.Draw(base)
            for idx, det in enumerate(detections):
                x0, y0, x1, y1 = det['bbox']
                draw.rectangle([x0, y0, x1, y1], outline=(0, 255, 0), width=2)
                label_text = det.get('label')
                if not label_text and labels:
                    label_text = labels[min(idx, len(labels) - 1)]
                if not label_text:
                    label_text = f"conf={det['confidence']:.2f}"
                draw.text((x0 + 2, y0 + 2), label_text, fill=(255, 255, 255))
            base.save(path)
        else:
            plt.figure(figsize=(6, 6))
            plt.imshow(array)
            if task == 'segment':
                plt.imshow(mask, alpha=0.3, cmap='Reds')
            ax = plt.gca()
            for idx, det in enumerate(detections):
                x0, y0, x1, y1 = det['bbox']
                rect = plt.Rectangle((x0, y0), x1 - x0, y1 - y0, linewidth=2, edgecolor='lime', facecolor='none')
                ax.add_patch(rect)
            plt.axis('off')
            plt.tight_layout()
            plt.savefig(path, dpi=150)
            plt.close()

    def _plot_confusion_overview(self, totals: Dict[str, int], path: Path) -> None:
        """Render a simple confusion-style overview chart."""
        matrix = np.array([[totals.get('tp', 0), totals.get('fp', 0)],
                           [totals.get('fn', 0), totals.get('tn', 0)]], dtype=float)
        plt.figure(figsize=(4, 4))
        im = plt.imshow(matrix, cmap='Blues')
        for (i, j), value in np.ndenumerate(matrix):
            plt.text(j, i, f"{int(value)}", ha='center', va='center', color='black', fontsize=12)
        plt.xticks([0, 1], ['Positive', 'Negative'])
        plt.yticks([0, 1], ['Positive', 'Negative'])
        plt.xlabel('Predicted')
        plt.ylabel('Reference')
        plt.title('Detection Quality Proxy')
        plt.colorbar(im, fraction=0.046, pad=0.04)
        plt.tight_layout()
        plt.savefig(path, dpi=150)
        plt.close()

    def _build_explanation_markdown(self, expr_text: str, steps: List[str], assumptions: List[str],
                                    goal: str, audience: str) -> str:
        """Compose a Markdown explanation from analysis steps."""
        expr_text_safe = expr_text.replace('`', r'\`')
        md_lines = [
            f"### Goal: {goal.capitalize()}",
            f"**Audience:** {audience}",
            f"**Expression:** `${expr_text_safe}$`",
            ""
        ]
        if assumptions:
            md_lines.append("**Assumptions:**")
            md_lines.extend([f"- {assumption}" for assumption in assumptions])
            md_lines.append("")
        md_lines.append("### Explanation")
        for step in steps:
            md_lines.append(f"- {step}")
        return "\n".join(md_lines).strip()

    def _summarize_expression(self, expr: Any, depth: int = 0, max_depth: int = 3) -> List[str]:
        """Recursively summarise a SymPy expression into human-readable steps."""
        if depth > max_depth:
            return []
        if not SYMPY_AVAILABLE:
            return [str(expr)]

        steps: List[str] = []
        indent = '  ' * depth

        import sympy as _sp  # Safe because SYMPY_AVAILABLE is True

        if isinstance(expr, _sp.Add):
            steps.append(f"{indent}Sum of {len(expr.args)} terms.")
            for arg in expr.args:
                steps.extend(self._summarize_expression(arg, depth + 1, max_depth))
        elif isinstance(expr, _sp.Mul):
            steps.append(f"{indent}Product of {len(expr.args)} factors.")
            for arg in expr.args:
                steps.extend(self._summarize_expression(arg, depth + 1, max_depth))
        elif isinstance(expr, _sp.Pow):
            steps.append(f"{indent}Power: base $_{{{_sp.latex(expr.base)}}}$ with exponent $_{{{_sp.latex(expr.exp)}}}$.")
        elif isinstance(expr, _sp.Function):
            args_latex = ', '.join(_sp.latex(arg) for arg in expr.args)
            steps.append(f"{indent}{expr.func.__name__} applied to {args_latex}.")
            for arg in expr.args:
                steps.extend(self._summarize_expression(arg, depth + 1, max_depth))
        elif isinstance(expr, _sp.Symbol):
            steps.append(f"{indent}Symbol {expr.name}.")
        elif isinstance(expr, _sp.Number):
            steps.append(f"{indent}Constant {_sp.latex(expr)}.")
        else:
            steps.append(f"{indent}{_sp.latex(expr)}.")

        return steps
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
    """Worker function for surrogate PDE training"""
    ml = MLAugmentation(config)
    return ml.surrogate_pde_train(params)


def ml_pattern_recognition(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Worker function for pattern recognition"""
    ml = MLAugmentation(config)
    return ml.pattern_recognition_infer(params)


def ml_explain_derivation(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Worker function for derivation explanation"""
    ml = MLAugmentation(config)
    return ml.explain_derivation(params)
