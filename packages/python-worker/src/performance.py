"""
Performance enhancements for Phys-MCP with caching, GPU fallback, and chunked processing
"""

import hashlib
import json
import pickle
import time
from functools import wraps
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union, Callable
import numpy as np
from datetime import datetime, timedelta
import psutil
import threading
import queue

# Cache configuration
CACHE_DIR = Path(".cache")
CACHE_MAX_SIZE_MB = 500
CACHE_TTL_HOURS = 24
ENABLE_CACHE = True

# Performance monitoring
class PerformanceMonitor:
    """Monitor and track performance metrics"""
    
    def __init__(self):
        self.metrics = {}
        self.lock = threading.Lock()
    
    def record_metric(self, name: str, value: float, unit: str = 'ms', tags: Optional[Dict] = None):
        """Record a performance metric"""
        with self.lock:
            if name not in self.metrics:
                self.metrics[name] = []
            
            self.metrics[name].append({
                'value': value,
                'unit': unit,
                'timestamp': datetime.now().isoformat(),
                'tags': tags or {}
            })
            
            # Keep only last 1000 entries per metric
            if len(self.metrics[name]) > 1000:
                self.metrics[name] = self.metrics[name][-1000:]
    
    def get_stats(self, name: str) -> Dict[str, float]:
        """Get statistics for a metric"""
        with self.lock:
            if name not in self.metrics or not self.metrics[name]:
                return {}
            
            values = [m['value'] for m in self.metrics[name]]
            return {
                'count': len(values),
                'mean': np.mean(values),
                'median': np.median(values),
                'min': np.min(values),
                'max': np.max(values),
                'std': np.std(values)
            }
    
    def get_all_stats(self) -> Dict[str, Dict[str, float]]:
        """Get statistics for all metrics"""
        return {name: self.get_stats(name) for name in self.metrics.keys()}

# Global performance monitor
perf_monitor = PerformanceMonitor()

def generate_cache_key(func_name: str, args: tuple, kwargs: dict) -> str:
    """Generate cache key from function name and parameters"""
    # Create deterministic representation
    cache_data = {
        'function': func_name,
        'args': args,
        'kwargs': {k: v for k, v in kwargs.items() if k not in ['emit_plots', 'emit_csv', 'emit_frames']}
    }
    
    # Convert to JSON string and hash
    cache_str = json.dumps(cache_data, sort_keys=True, default=str)
    return hashlib.sha256(cache_str.encode()).hexdigest()

def get_cache_path(cache_key: str) -> Path:
    """Get cache file path"""
    CACHE_DIR.mkdir(exist_ok=True)
    return CACHE_DIR / f"{cache_key}.pkl"

def is_cache_valid(cache_path: Path, ttl_hours: int = CACHE_TTL_HOURS) -> bool:
    """Check if cache file is valid (exists and not expired)"""
    if not cache_path.exists():
        return False
    
    # Check TTL
    file_age = datetime.now() - datetime.fromtimestamp(cache_path.stat().st_mtime)
    return file_age < timedelta(hours=ttl_hours)

def save_to_cache(cache_key: str, data: Any) -> bool:
    """Save data to cache"""
    if not ENABLE_CACHE:
        return False
    
    try:
        cache_path = get_cache_path(cache_key)
        
        # Check cache size limit
        cleanup_cache_if_needed()
        
        with open(cache_path, 'wb') as f:
            pickle.dump(data, f)
        
        return True
    except Exception as e:
        print(f"Cache save failed: {e}")
        return False

def load_from_cache(cache_key: str) -> Optional[Any]:
    """Load data from cache"""
    if not ENABLE_CACHE:
        return None
    
    try:
        cache_path = get_cache_path(cache_key)
        
        if not is_cache_valid(cache_path):
            return None
        
        with open(cache_path, 'rb') as f:
            return pickle.load(f)
    
    except Exception as e:
        print(f"Cache load failed: {e}")
        return None

def cleanup_cache_if_needed():
    """Clean up cache if it exceeds size limit"""
    if not CACHE_DIR.exists():
        return
    
    # Calculate total cache size
    total_size = sum(f.stat().st_size for f in CACHE_DIR.glob("*.pkl"))
    max_size_bytes = CACHE_MAX_SIZE_MB * 1024 * 1024
    
    if total_size <= max_size_bytes:
        return
    
    # Remove oldest files until under limit
    cache_files = [(f, f.stat().st_mtime) for f in CACHE_DIR.glob("*.pkl")]
    cache_files.sort(key=lambda x: x[1])  # Sort by modification time
    
    current_size = total_size
    for cache_file, _ in cache_files:
        if current_size <= max_size_bytes:
            break
        
        file_size = cache_file.stat().st_size
        cache_file.unlink()
        current_size -= file_size

def with_cache(ttl_hours: int = CACHE_TTL_HOURS):
    """Decorator to add caching to functions"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = generate_cache_key(func.__name__, args, kwargs)
            
            # Try to load from cache
            cached_result = load_from_cache(cache_key)
            if cached_result is not None:
                perf_monitor.record_metric(f"{func.__name__}_cache_hit", 0, 'count')
                return cached_result
            
            # Execute function
            start_time = time.time()
            result = func(*args, **kwargs)
            duration_ms = (time.time() - start_time) * 1000
            
            # Save to cache
            save_to_cache(cache_key, result)
            
            # Record metrics
            perf_monitor.record_metric(f"{func.__name__}_cache_miss", duration_ms, 'ms')
            
            return result
        return wrapper
    return decorator

class GPUFallback:
    """GPU acceleration with automatic CPU fallback"""
    
    def __init__(self):
        self.gpu_available = self._check_gpu_availability()
        self.gpu_memory_threshold = 0.9  # Use up to 90% of GPU memory
        
    def _check_gpu_availability(self) -> bool:
        """Check if GPU is available"""
        try:
            import torch
            return torch.cuda.is_available()
        except ImportError:
            return False
    
    def get_device(self, prefer_gpu: bool = True) -> str:
        """Get optimal device for computation"""
        if not prefer_gpu or not self.gpu_available:
            return 'cpu'
        
        try:
            import torch
            
            # Check GPU memory
            if torch.cuda.is_available():
                memory_free = torch.cuda.get_device_properties(0).total_memory - torch.cuda.memory_allocated(0)
                memory_total = torch.cuda.get_device_properties(0).total_memory
                memory_usage = 1 - (memory_free / memory_total)
                
                if memory_usage < self.gpu_memory_threshold:
                    return 'cuda'
                else:
                    print(f"GPU memory usage too high ({memory_usage:.1%}), falling back to CPU")
                    return 'cpu'
            
        except Exception as e:
            print(f"GPU check failed: {e}, falling back to CPU")
        
        return 'cpu'
    
    def with_fallback(self, func: Callable, *args, prefer_gpu: bool = True, **kwargs):
        """Execute function with GPU fallback"""
        device = self.get_device(prefer_gpu)
        
        try:
            return func(*args, device=device, **kwargs)
        except Exception as e:
            if device == 'cuda':
                print(f"GPU execution failed: {e}, retrying on CPU")
                return func(*args, device='cpu', **kwargs)
            else:
                raise e

# Global GPU fallback instance
gpu_fallback = GPUFallback()

class ChunkedProcessor:
    """Process large datasets in chunks to manage memory"""
    
    def __init__(self, max_chunk_size: int = 10000, max_memory_mb: int = 1000):
        self.max_chunk_size = max_chunk_size
        self.max_memory_mb = max_memory_mb
    
    def calculate_chunk_size(self, data_size: int, item_size_bytes: int = 8) -> int:
        """Calculate optimal chunk size based on memory constraints"""
        # Estimate memory usage
        estimated_memory_mb = (data_size * item_size_bytes) / (1024 * 1024)
        
        if estimated_memory_mb <= self.max_memory_mb:
            return data_size  # Process all at once
        
        # Calculate chunk size to stay within memory limit
        chunk_size = int((self.max_memory_mb * 1024 * 1024) / item_size_bytes)
        return min(chunk_size, self.max_chunk_size)
    
    def process_chunks(self, data: Union[List, np.ndarray], processor_func: Callable, 
                      combine_func: Optional[Callable] = None, **kwargs) -> Any:
        """Process data in chunks"""
        if len(data) == 0:
            return []
        
        # Calculate chunk size
        item_size = data[0].nbytes if hasattr(data[0], 'nbytes') else 8
        chunk_size = self.calculate_chunk_size(len(data), item_size)
        
        if chunk_size >= len(data):
            # Process all at once
            return processor_func(data, **kwargs)
        
        # Process in chunks
        results = []
        for i in range(0, len(data), chunk_size):
            chunk = data[i:i + chunk_size]
            chunk_result = processor_func(chunk, **kwargs)
            results.append(chunk_result)
            
            # Log progress
            progress = min(100, (i + chunk_size) * 100 // len(data))
            if i % (chunk_size * 10) == 0:  # Log every 10 chunks
                print(f"Processing progress: {progress}%")
        
        # Combine results
        if combine_func:
            return combine_func(results)
        elif isinstance(results[0], np.ndarray):
            return np.concatenate(results)
        elif isinstance(results[0], list):
            return [item for sublist in results for item in sublist]
        else:
            return results

# Global chunked processor
chunked_processor = ChunkedProcessor()

def optimize_fft(signal_data: np.ndarray, sample_rate: float, **kwargs) -> Dict[str, Any]:
    """Optimized FFT with caching and chunked processing"""
    
    def _compute_fft_chunk(chunk: np.ndarray, sample_rate: float) -> Dict[str, Any]:
        """Compute FFT for a chunk of data"""
        # Use GPU if available
        device = gpu_fallback.get_device()
        
        if device == 'cuda':
            try:
                import torch
                chunk_tensor = torch.from_numpy(chunk).cuda()
                fft_result = torch.fft.fft(chunk_tensor)
                frequencies = torch.fft.fftfreq(len(chunk), 1/sample_rate)
                
                return {
                    'frequencies': frequencies.cpu().numpy(),
                    'amplitudes': torch.abs(fft_result).cpu().numpy(),
                    'phases': torch.angle(fft_result).cpu().numpy()
                }
            except Exception as e:
                print(f"GPU FFT failed: {e}, falling back to CPU")
        
        # CPU fallback
        fft_result = np.fft.fft(chunk)
        frequencies = np.fft.fftfreq(len(chunk), 1/sample_rate)
        
        return {
            'frequencies': frequencies,
            'amplitudes': np.abs(fft_result),
            'phases': np.angle(fft_result)
        }
    
    def _combine_fft_results(results: List[Dict]) -> Dict[str, Any]:
        """Combine FFT results from multiple chunks"""
        if len(results) == 1:
            return results[0]
        
        # Average the results (simple approach)
        combined = {
            'frequencies': results[0]['frequencies'],
            'amplitudes': np.mean([r['amplitudes'] for r in results], axis=0),
            'phases': np.mean([r['phases'] for r in results], axis=0)
        }
        return combined
    
    # Process with chunking if needed
    if len(signal_data) > 50000:  # Use chunking for large signals
        result = chunked_processor.process_chunks(
            data=signal_data.reshape(-1, min(10000, len(signal_data))),
            processor_func=lambda chunk: _compute_fft_chunk(chunk.flatten(), sample_rate),
            combine_func=_combine_fft_results
        )
    else:
        result = _compute_fft_chunk(signal_data, sample_rate)
    
    return result

@with_cache(ttl_hours=1)  # Cache FFT results for 1 hour
def cached_fft(signal_data: List[float], sample_rate: float) -> Dict[str, Any]:
    """Cached FFT computation"""
    signal_array = np.array(signal_data)
    return optimize_fft(signal_array, sample_rate)

def optimize_plot_generation(plot_func: Callable, *args, **kwargs) -> Any:
    """Optimize plot generation with caching and performance monitoring"""
    start_time = time.time()
    
    try:
        # Check if we should use high DPI
        dpi = kwargs.get('dpi', 100)
        if dpi > 200:
            # High DPI plots are expensive, check system resources
            memory_percent = psutil.virtual_memory().percent
            if memory_percent > 80:
                print(f"High memory usage ({memory_percent}%), reducing DPI from {dpi} to 150")
                kwargs['dpi'] = 150
        
        # Execute plot function
        result = plot_func(*args, **kwargs)
        
        # Record performance
        duration_ms = (time.time() - start_time) * 1000
        perf_monitor.record_metric('plot_generation', duration_ms, 'ms', {
            'plot_type': kwargs.get('plot_type', 'unknown'),
            'dpi': kwargs.get('dpi', 100)
        })
        
        return result
        
    except Exception as e:
        # Log performance even on failure
        duration_ms = (time.time() - start_time) * 1000
        perf_monitor.record_metric('plot_generation_failed', duration_ms, 'ms')
        raise e

def get_performance_report() -> Dict[str, Any]:
    """Get comprehensive performance report"""
    stats = perf_monitor.get_all_stats()
    
    # Add system info
    system_info = {
        'cpu_percent': psutil.cpu_percent(interval=1),
        'memory_percent': psutil.virtual_memory().percent,
        'disk_usage_percent': psutil.disk_usage('.').percent
    }
    
    # Add GPU info if available
    if gpu_fallback.gpu_available:
        try:
            import torch
            if torch.cuda.is_available():
                memory_allocated = torch.cuda.memory_allocated(0)
                memory_total = torch.cuda.get_device_properties(0).total_memory
                system_info['gpu_memory_percent'] = (memory_allocated / memory_total) * 100
        except Exception:
            pass
    
    # Add cache info
    cache_info = {
        'cache_enabled': ENABLE_CACHE,
        'cache_size_mb': 0,
        'cache_files': 0
    }
    
    if CACHE_DIR.exists():
        cache_files = list(CACHE_DIR.glob("*.pkl"))
        cache_info['cache_files'] = len(cache_files)
        cache_info['cache_size_mb'] = sum(f.stat().st_size for f in cache_files) / (1024 * 1024)
    
    return {
        'performance_stats': stats,
        'system_info': system_info,
        'cache_info': cache_info,
        'timestamp': datetime.now().isoformat()
    }

def clear_cache():
    """Clear all cached data"""
    if CACHE_DIR.exists():
        for cache_file in CACHE_DIR.glob("*.pkl"):
            cache_file.unlink()
        print(f"Cleared cache directory: {CACHE_DIR}")

def configure_performance(
    cache_enabled: bool = True,
    cache_size_mb: int = 500,
    cache_ttl_hours: int = 24,
    chunk_size: int = 10000
):
    """Configure performance settings"""
    global ENABLE_CACHE, CACHE_MAX_SIZE_MB, CACHE_TTL_HOURS
    
    ENABLE_CACHE = cache_enabled
    CACHE_MAX_SIZE_MB = cache_size_mb
    CACHE_TTL_HOURS = cache_ttl_hours
    
    chunked_processor.max_chunk_size = chunk_size
    
    print(f"Performance configured: cache={cache_enabled}, size={cache_size_mb}MB, ttl={cache_ttl_hours}h")
