"""
Utility functions for the Python worker
Shared functions for artifact creation, plotting, and data handling
"""

import os
import io
import base64
import uuid
import time
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
from typing import Any, Optional, List

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False


def fig_to_base64(fig) -> str:
    """Convert matplotlib figure to base64 encoded PNG"""
    buffer = io.BytesIO()
    fig.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    image_png = buffer.getvalue()
    buffer.close()
    
    graphic = base64.b64encode(image_png)
    return graphic.decode('utf-8')


def fig_to_svg(fig) -> str:
    """Convert matplotlib figure to SVG string"""
    buffer = io.StringIO()
    fig.savefig(buffer, format='svg', bbox_inches='tight')
    buffer.seek(0)
    svg_string = buffer.getvalue()
    buffer.close()
    
    return svg_string


def create_csv_artifact(data: Any, filename_prefix: str, headers: Optional[List[str]] = None) -> str:
    """Create CSV artifact from data and return file path"""
    
    # Ensure artifacts directory exists
    os.makedirs("artifacts", exist_ok=True)
    
    # Convert data to DataFrame
    if isinstance(data, np.ndarray):
        if data.ndim == 1:
            df = pd.DataFrame(data, columns=['value'])
        elif data.ndim == 2:
            if headers and len(headers) == data.shape[1]:
                df = pd.DataFrame(data, columns=headers)
            else:
                df = pd.DataFrame(data)
        else:
            # Flatten higher dimensional arrays
            df = pd.DataFrame(data.flatten(), columns=['value'])
    elif isinstance(data, list):
        df = pd.DataFrame(data)
    elif isinstance(data, dict):
        df = pd.DataFrame(data)
    else:
        # Try to convert to DataFrame directly
        df = pd.DataFrame(data)
    
    # Generate filename
    timestamp = pd.Timestamp.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{filename_prefix}_{timestamp}.csv"
    filepath = os.path.join("artifacts", filename)
    
    # Save CSV
    df.to_csv(filepath, index=False)
    
    return filepath


def safe_filename(name: str) -> str:
    """Convert string to safe filename"""
    # Remove or replace unsafe characters
    safe_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_."
    return ''.join(c if c in safe_chars else '_' for c in name)


def format_number(value: float, precision: int = 6) -> str:
    """Format number with appropriate precision"""
    if abs(value) < 1e-3 or abs(value) > 1e6:
        return f"{value:.{precision}e}"
    else:
        return f"{value:.{precision}f}".rstrip('0').rstrip('.')


def create_artifact_metadata(tool_name: str, params: dict, result: dict) -> dict:
    """Create standardized metadata for artifacts"""
    return {
        "tool_name": tool_name,
        "parameters": params,
        "created_at": pd.Timestamp.now().isoformat(),
        "result_keys": list(result.keys()) if isinstance(result, dict) else [],
        "version": "1.0"
    }


def ensure_numpy_array(data: Any) -> np.ndarray:
    """Ensure data is a numpy array"""
    if isinstance(data, np.ndarray):
        return data
    elif isinstance(data, list):
        return np.array(data)
    else:
        return np.array([data])


def validate_signal_data(signal_data: Any, min_length: int = 2) -> np.ndarray:
    """Validate and convert signal data to numpy array"""
    signal_array = ensure_numpy_array(signal_data)
    
    if signal_array.ndim != 1:
        raise ValueError("Signal data must be 1-dimensional")
    
    if len(signal_array) < min_length:
        raise ValueError(f"Signal data must have at least {min_length} samples")
    
    if not np.issubdtype(signal_array.dtype, np.number):
        raise ValueError("Signal data must be numeric")
    
    return signal_array.astype(np.float64)


def setup_matplotlib_style():
    """Set up consistent matplotlib styling"""
    plt.style.use('default')
    plt.rcParams.update({
        'figure.figsize': (10, 6),
        'figure.dpi': 100,
        'savefig.dpi': 150,
        'font.size': 10,
        'axes.titlesize': 12,
        'axes.labelsize': 10,
        'xtick.labelsize': 9,
        'ytick.labelsize': 9,
        'legend.fontsize': 9,
        'grid.alpha': 0.3,
        'lines.linewidth': 1.5,
        'axes.grid': True
    })


def memory_usage_mb() -> float:
    """Get current memory usage in MB"""
    try:
        import psutil
        process = psutil.Process()
        return process.memory_info().rss / 1024 / 1024
    except ImportError:
        return 0.0


def check_memory_limit(limit_mb: float = 1000.0) -> bool:
    """Check if memory usage is below limit"""
    current_usage = memory_usage_mb()
    return current_usage < limit_mb


def truncate_large_arrays(data: np.ndarray, max_size: int = 100000) -> np.ndarray:
    """Truncate arrays that are too large for processing"""
    if data.size > max_size:
        # Take evenly spaced samples
        indices = np.linspace(0, len(data)-1, max_size, dtype=int)
        return data[indices]
    return data


def validate_frequency_range(frequencies: np.ndarray, sample_rate: float) -> np.ndarray:
    """Validate frequency array is within Nyquist limit"""
    nyquist = sample_rate / 2
    valid_freqs = frequencies[frequencies <= nyquist]
    
    if len(valid_freqs) < len(frequencies):
        print(f"Warning: {len(frequencies) - len(valid_freqs)} frequencies above Nyquist limit removed")
    
    return valid_freqs


def create_time_axis(length: int, sample_rate: float) -> np.ndarray:
    """Create time axis for signal plotting"""
    return np.arange(length) / sample_rate


def db_scale(magnitude: np.ndarray, reference: float = 1.0) -> np.ndarray:
    """Convert magnitude to dB scale"""
    return 20 * np.log10(np.abs(magnitude) / reference + 1e-12)


def normalize_signal(signal: np.ndarray, method: str = "peak") -> np.ndarray:
    """Normalize signal using various methods"""
    if method == "peak":
        return signal / np.max(np.abs(signal))
    elif method == "rms":
        rms = np.sqrt(np.mean(signal**2))
        return signal / rms
    elif method == "energy":
        energy = np.sqrt(np.sum(signal**2))
        return signal / energy
    else:
        return signal


def find_peaks_simple(signal: np.ndarray, threshold: float = 0.5) -> np.ndarray:
    """Simple peak finding algorithm"""
    peaks = []
    for i in range(1, len(signal) - 1):
        if (signal[i] > signal[i-1] and 
            signal[i] > signal[i+1] and 
            signal[i] > threshold * np.max(signal)):
            peaks.append(i)
    return np.array(peaks)


def estimate_noise_floor(signal: np.ndarray, percentile: float = 10) -> float:
    """Estimate noise floor of signal"""
    return np.percentile(np.abs(signal), percentile)


def apply_window_correction(signal: np.ndarray, window: np.ndarray) -> float:
    """Calculate window correction factor"""
    return np.sqrt(np.mean(window**2))


def create_frequency_axis(length: int, sample_rate: float) -> np.ndarray:
    """Create frequency axis for FFT results"""
    return np.fft.fftfreq(length, 1/sample_rate)


def get_positive_frequencies(frequencies: np.ndarray, spectrum: np.ndarray):
    """Extract positive frequency components"""
    nyquist_idx = len(frequencies) // 2
    return frequencies[:nyquist_idx], spectrum[:nyquist_idx]


def calculate_spectral_centroid(frequencies: np.ndarray, magnitude: np.ndarray) -> float:
    """Calculate spectral centroid (center of mass of spectrum)"""
    return np.sum(frequencies * magnitude) / np.sum(magnitude)


def calculate_spectral_bandwidth(frequencies: np.ndarray, magnitude: np.ndarray, 
                               centroid: Optional[float] = None) -> float:
    """Calculate spectral bandwidth"""
    if centroid is None:
        centroid = calculate_spectral_centroid(frequencies, magnitude)
    
    return np.sqrt(np.sum(((frequencies - centroid)**2) * magnitude) / np.sum(magnitude))


def zero_pad_signal(signal: np.ndarray, target_length: int) -> np.ndarray:
    """Zero-pad signal to target length"""
    if len(signal) >= target_length:
        return signal[:target_length]
    
    padding = target_length - len(signal)
    return np.pad(signal, (0, padding), mode='constant')


def next_power_of_2(n: int) -> int:
    """Find next power of 2 greater than or equal to n"""
    return 2 ** int(np.ceil(np.log2(n)))


def overlap_add(segments: List[np.ndarray], hop_size: int) -> np.ndarray:
    """Overlap-add reconstruction from signal segments"""
    if not segments:
        return np.array([])
    
    segment_length = len(segments[0])
    total_length = (len(segments) - 1) * hop_size + segment_length
    result = np.zeros(total_length)
    
    for i, segment in enumerate(segments):
        start_idx = i * hop_size
        end_idx = start_idx + len(segment)
        result[start_idx:end_idx] += segment
    
    return result


def create_test_signal(duration: float, sample_rate: float, 
                      frequencies: List[float], amplitudes: List[float] = None,
                      noise_level: float = 0.0) -> np.ndarray:
    """Create test signal with multiple frequency components"""
    if amplitudes is None:
        amplitudes = [1.0] * len(frequencies)
    
    t = np.arange(0, duration, 1/sample_rate)
    signal = np.zeros_like(t)
    
    for freq, amp in zip(frequencies, amplitudes):
        signal += amp * np.sin(2 * np.pi * freq * t)
    
    if noise_level > 0:
        noise = noise_level * np.random.randn(len(signal))
        signal += noise
    
    return signal


# Phase 6 ML utility functions
def generate_session_id() -> str:
    """Generate unique session ID"""
    return f"session_{int(time.time())}_{str(uuid.uuid4())[:8]}"

def ensure_artifacts_dir(session_id: str) -> Path:
    """Ensure artifacts directory exists and return path"""
    artifacts_dir = Path("artifacts") / session_id
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    return artifacts_dir

def encode_image_b64(image_path: Path) -> str:
    """Encode image file to base64 string"""
    with open(image_path, 'rb') as f:
        image_data = f.read()
    return base64.b64encode(image_data).decode('utf-8')

# Initialize matplotlib style when module is imported
setup_matplotlib_style()
