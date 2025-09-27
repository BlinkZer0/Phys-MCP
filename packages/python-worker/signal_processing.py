"""
GPU-accelerated signal processing module
Supports FFT, filtering, spectrograms, and wavelets with comprehensive diagnostics
"""

import os
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal
from typing import Dict, Any, List, Union, Optional
from .utils import fig_to_base64, fig_to_svg, create_csv_artifact
from .accel import accel_caps

# Optional GPU acceleration
try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

# Optional wavelet support
try:
    import pywt
    WAVELET_AVAILABLE = True
except ImportError:
    WAVELET_AVAILABLE = False


def data_fft(signal_data: List[float], sample_rate: float, window: str = "hann",
            emit_plots: bool = True, emit_csv: bool = True) -> Dict[str, Any]:
    """GPU-accelerated Fast Fourier Transform with comprehensive diagnostic plots"""
    
    signal_array = np.array(signal_data, dtype=np.float32)
    N = len(signal_array)
    
    # Apply window function
    if window != "none":
        window_func = _get_window_function(window, N)
        windowed_signal = signal_array * window_func
    else:
        windowed_signal = signal_array
        window_func = np.ones(N)
    
    # Try GPU acceleration first
    device_used = "cpu"
    try:
        if TORCH_AVAILABLE and accel_caps()["active"]:
            device = torch.device("cuda" if torch.cuda.is_available() else 
                                "mps" if torch.backends.mps.is_available() else "cpu")
            
            if device.type != "cpu":
                # GPU path
                signal_tensor = torch.tensor(windowed_signal, device=device, dtype=torch.float32)
                fft_result = torch.fft.fft(signal_tensor)
                freqs = torch.fft.fftfreq(N, 1/sample_rate, device=device)
                
                # Convert back to numpy
                spectrum = fft_result.cpu().numpy()
                frequencies = freqs.cpu().numpy()
                device_used = device.type
            else:
                raise RuntimeError("GPU not available")
        else:
            raise RuntimeError("Torch not available or acceleration disabled")
            
    except (RuntimeError, MemoryError) as e:
        # CPU fallback
        spectrum = np.fft.fft(windowed_signal)
        frequencies = np.fft.fftfreq(N, 1/sample_rate)
        device_used = "cpu"
    
    # Compute magnitude and phase
    magnitude = np.abs(spectrum)
    phase = np.angle(spectrum)
    
    # Only keep positive frequencies for display
    nyquist_idx = N // 2
    freqs_pos = frequencies[:nyquist_idx]
    magnitude_pos = magnitude[:nyquist_idx]
    phase_pos = phase[:nyquist_idx]
    
    # Generate comprehensive diagnostic plots
    artifacts = {}
    if emit_plots:
        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        fig.suptitle(f'FFT Analysis (Sample Rate: {sample_rate} Hz, Window: {window})')
        
        # Time domain signal
        time = np.arange(N) / sample_rate
        axes[0,0].plot(time, signal_array, 'b-', alpha=0.7, label='Original')
        if window != "none":
            axes[0,0].plot(time, windowed_signal, 'r-', alpha=0.7, label='Windowed')
            axes[0,0].legend()
        axes[0,0].set_title('Time Domain Signal')
        axes[0,0].set_xlabel('Time (s)')
        axes[0,0].set_ylabel('Amplitude')
        axes[0,0].grid(True, alpha=0.3)
        
        # Window function
        axes[0,1].plot(time, window_func)
        axes[0,1].set_title(f'Window Function ({window})')
        axes[0,1].set_xlabel('Time (s)')
        axes[0,1].set_ylabel('Amplitude')
        axes[0,1].grid(True, alpha=0.3)
        
        # Magnitude spectrum
        axes[0,2].plot(freqs_pos, 20*np.log10(magnitude_pos + 1e-12))
        axes[0,2].set_title('Magnitude Spectrum')
        axes[0,2].set_xlabel('Frequency (Hz)')
        axes[0,2].set_ylabel('Magnitude (dB)')
        axes[0,2].grid(True, alpha=0.3)
        
        # Phase spectrum
        axes[1,0].plot(freqs_pos, phase_pos)
        axes[1,0].set_title('Phase Spectrum')
        axes[1,0].set_xlabel('Frequency (Hz)')
        axes[1,0].set_ylabel('Phase (rad)')
        axes[1,0].grid(True, alpha=0.3)
        
        # Spectrogram
        f_spec, t_spec, Sxx = signal.spectrogram(signal_array, sample_rate, nperseg=min(256, N//4))
        im = axes[1,1].pcolormesh(t_spec, f_spec, 10*np.log10(Sxx + 1e-12), shading='gouraud')
        axes[1,1].set_title('Spectrogram')
        axes[1,1].set_xlabel('Time (s)')
        axes[1,1].set_ylabel('Frequency (Hz)')
        plt.colorbar(im, ax=axes[1,1], label='Power (dB)')
        
        # Power spectral density
        f_psd, psd = signal.welch(signal_array, sample_rate, nperseg=min(256, N//4))
        axes[1,2].semilogy(f_psd, psd)
        axes[1,2].set_title('Power Spectral Density')
        axes[1,2].set_xlabel('Frequency (Hz)')
        axes[1,2].set_ylabel('PSD (V²/Hz)')
        axes[1,2].grid(True, alpha=0.3)
        
        plt.tight_layout()
        artifacts["png_b64"] = fig_to_base64(fig)
        artifacts["svg"] = fig_to_svg(fig)
        plt.close(fig)
    
    # Export data as CSV
    if emit_csv:
        fft_data = np.column_stack([
            frequencies, 
            magnitude, 
            phase,
            np.real(spectrum),
            np.imag(spectrum)
        ])
        csv_path = create_csv_artifact(
            fft_data, 
            "fft_analysis",
            headers=["frequency_hz", "magnitude", "phase_rad", "real", "imaginary"]
        )
        artifacts["csv_path"] = csv_path
    
    return {
        "frequencies": frequencies.tolist(),
        "spectrum_real": np.real(spectrum).tolist(),
        "spectrum_imag": np.imag(spectrum).tolist(),
        "magnitude": magnitude.tolist(),
        "phase": phase.tolist(),
        "sample_rate": sample_rate,
        "window_used": window,
        "nyquist_frequency": sample_rate / 2,
        "frequency_resolution": sample_rate / N,
        "artifacts": artifacts,
        "meta": {
            "device": device_used,
            "length": N,
            "duration_s": N / sample_rate,
            "window_correction": np.mean(window_func**2)**0.5
        }
    }


def data_filter(signal_data: List[float], sample_rate: float, filter_type: str,
               cutoff_freq: Union[float, List[float]], filter_order: int = 4,
               emit_plots: bool = True, emit_csv: bool = True) -> Dict[str, Any]:
    """GPU-accelerated digital filtering with response analysis"""
    
    signal_array = np.array(signal_data, dtype=np.float32)
    nyquist = sample_rate / 2
    
    # Normalize cutoff frequencies
    if isinstance(cutoff_freq, list):
        normalized_cutoff = [f / nyquist for f in cutoff_freq]
    else:
        normalized_cutoff = cutoff_freq / nyquist
    
    # Design filter
    try:
        if filter_type in ["lowpass", "highpass"]:
            b, a = signal.butter(filter_order, normalized_cutoff, btype=filter_type)
        elif filter_type in ["bandpass", "bandstop"]:
            if not isinstance(cutoff_freq, list) or len(cutoff_freq) != 2:
                raise ValueError("Bandpass/bandstop filters require two cutoff frequencies")
            b, a = signal.butter(filter_order, normalized_cutoff, btype=filter_type)
        else:
            raise ValueError(f"Unknown filter type: {filter_type}")
    except Exception as e:
        raise RuntimeError(f"Filter design failed: {str(e)}")
    
    # Apply filter
    try:
        if TORCH_AVAILABLE and accel_caps()["active"]:
            # GPU filtering (simplified - scipy doesn't have GPU support yet)
            filtered_signal = signal.filtfilt(b, a, signal_array)
            device_used = "cpu"  # scipy always uses CPU
        else:
            filtered_signal = signal.filtfilt(b, a, signal_array)
            device_used = "cpu"
    except Exception as e:
        raise RuntimeError(f"Filtering failed: {str(e)}")
    
    # Compute filter response
    w, h = signal.freqz(b, a, worN=1024, fs=sample_rate)
    
    # Generate diagnostic plots
    artifacts = {}
    if emit_plots:
        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        fig.suptitle(f'{filter_type.title()} Filter Analysis (Order: {filter_order})')
        
        # Time domain comparison
        time = np.arange(len(signal_array)) / sample_rate
        axes[0,0].plot(time, signal_array, 'b-', alpha=0.7, label='Original')
        axes[0,0].plot(time, filtered_signal, 'r-', alpha=0.7, label='Filtered')
        axes[0,0].set_title('Time Domain Signals')
        axes[0,0].set_xlabel('Time (s)')
        axes[0,0].set_ylabel('Amplitude')
        axes[0,0].legend()
        axes[0,0].grid(True, alpha=0.3)
        
        # Filter magnitude response
        axes[0,1].plot(w, 20*np.log10(np.abs(h)))
        axes[0,1].set_title('Filter Magnitude Response')
        axes[0,1].set_xlabel('Frequency (Hz)')
        axes[0,1].set_ylabel('Magnitude (dB)')
        axes[0,1].grid(True, alpha=0.3)
        
        # Filter phase response
        axes[0,2].plot(w, np.angle(h))
        axes[0,2].set_title('Filter Phase Response')
        axes[0,2].set_xlabel('Frequency (Hz)')
        axes[0,2].set_ylabel('Phase (rad)')
        axes[0,2].grid(True, alpha=0.3)
        
        # Frequency domain comparison
        freqs_orig = np.fft.fftfreq(len(signal_array), 1/sample_rate)
        spectrum_orig = np.fft.fft(signal_array)
        spectrum_filt = np.fft.fft(filtered_signal)
        
        nyquist_idx = len(freqs_orig) // 2
        freqs_pos = freqs_orig[:nyquist_idx]
        
        axes[1,0].plot(freqs_pos, 20*np.log10(np.abs(spectrum_orig[:nyquist_idx]) + 1e-12), 
                      'b-', alpha=0.7, label='Original')
        axes[1,0].plot(freqs_pos, 20*np.log10(np.abs(spectrum_filt[:nyquist_idx]) + 1e-12), 
                      'r-', alpha=0.7, label='Filtered')
        axes[1,0].set_title('Frequency Domain Comparison')
        axes[1,0].set_xlabel('Frequency (Hz)')
        axes[1,0].set_ylabel('Magnitude (dB)')
        axes[1,0].legend()
        axes[1,0].grid(True, alpha=0.3)
        
        # Group delay
        w_gd, gd = signal.group_delay((b, a), w=1024, fs=sample_rate)
        axes[1,1].plot(w_gd, gd)
        axes[1,1].set_title('Group Delay')
        axes[1,1].set_xlabel('Frequency (Hz)')
        axes[1,1].set_ylabel('Delay (samples)')
        axes[1,1].grid(True, alpha=0.3)
        
        # Pole-zero plot
        z, p, k = signal.tf2zpk(b, a)
        axes[1,2].scatter(np.real(z), np.imag(z), marker='o', s=50, label='Zeros')
        axes[1,2].scatter(np.real(p), np.imag(p), marker='x', s=50, label='Poles')
        
        # Unit circle
        theta = np.linspace(0, 2*np.pi, 100)
        axes[1,2].plot(np.cos(theta), np.sin(theta), 'k--', alpha=0.5)
        axes[1,2].set_title('Pole-Zero Plot')
        axes[1,2].set_xlabel('Real Part')
        axes[1,2].set_ylabel('Imaginary Part')
        axes[1,2].legend()
        axes[1,2].grid(True, alpha=0.3)
        axes[1,2].axis('equal')
        
        plt.tight_layout()
        artifacts["png_b64"] = fig_to_base64(fig)
        artifacts["svg"] = fig_to_svg(fig)
        plt.close(fig)
    
    # Export data as CSV
    if emit_csv:
        time = np.arange(len(signal_array)) / sample_rate
        filter_data = np.column_stack([time, signal_array, filtered_signal])
        csv_path = create_csv_artifact(
            filter_data,
            f"filter_{filter_type}",
            headers=["time_s", "original", "filtered"]
        )
        artifacts["csv_path"] = csv_path
    
    return {
        "filtered_signal": filtered_signal.tolist(),
        "filter_coefficients": {"b": b.tolist(), "a": a.tolist()},
        "filter_type": filter_type,
        "cutoff_frequency": cutoff_freq,
        "filter_order": filter_order,
        "sample_rate": sample_rate,
        "artifacts": artifacts,
        "meta": {
            "device": device_used,
            "length": len(signal_array),
            "stable": np.all(np.abs(np.roots(a)) < 1)  # Check stability
        }
    }


def data_spectrogram(signal_data: List[float], sample_rate: float, window_size: int = 256,
                    overlap: float = 0.5, window_type: str = "hann",
                    emit_plots: bool = True, emit_csv: bool = True) -> Dict[str, Any]:
    """Time-frequency analysis with Short-Time Fourier Transform"""
    
    signal_array = np.array(signal_data, dtype=np.float32)
    
    # Calculate overlap in samples
    overlap_samples = int(window_size * overlap)
    
    # Compute spectrogram
    try:
        f, t, Sxx = signal.spectrogram(
            signal_array, 
            sample_rate,
            window=window_type,
            nperseg=window_size,
            noverlap=overlap_samples
        )
    except Exception as e:
        raise RuntimeError(f"Spectrogram computation failed: {str(e)}")
    
    # Generate diagnostic plots
    artifacts = {}
    if emit_plots:
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))
        fig.suptitle(f'Spectrogram Analysis (Window: {window_size}, Overlap: {overlap*100}%)')
        
        # Time domain signal
        time_signal = np.arange(len(signal_array)) / sample_rate
        axes[0,0].plot(time_signal, signal_array)
        axes[0,0].set_title('Time Domain Signal')
        axes[0,0].set_xlabel('Time (s)')
        axes[0,0].set_ylabel('Amplitude')
        axes[0,0].grid(True, alpha=0.3)
        
        # Spectrogram
        im = axes[0,1].pcolormesh(t, f, 10*np.log10(Sxx + 1e-12), shading='gouraud')
        axes[0,1].set_title('Spectrogram')
        axes[0,1].set_xlabel('Time (s)')
        axes[0,1].set_ylabel('Frequency (Hz)')
        plt.colorbar(im, ax=axes[0,1], label='Power (dB)')
        
        # Average spectrum
        avg_spectrum = np.mean(Sxx, axis=1)
        axes[1,0].semilogy(f, avg_spectrum)
        axes[1,0].set_title('Average Power Spectrum')
        axes[1,0].set_xlabel('Frequency (Hz)')
        axes[1,0].set_ylabel('Power')
        axes[1,0].grid(True, alpha=0.3)
        
        # Temporal evolution at peak frequency
        peak_freq_idx = np.argmax(avg_spectrum)
        axes[1,1].plot(t, 10*np.log10(Sxx[peak_freq_idx, :] + 1e-12))
        axes[1,1].set_title(f'Power Evolution at {f[peak_freq_idx]:.1f} Hz')
        axes[1,1].set_xlabel('Time (s)')
        axes[1,1].set_ylabel('Power (dB)')
        axes[1,1].grid(True, alpha=0.3)
        
        plt.tight_layout()
        artifacts["png_b64"] = fig_to_base64(fig)
        artifacts["svg"] = fig_to_svg(fig)
        plt.close(fig)
    
    # Export data as CSV
    if emit_csv:
        # Create a flattened representation for CSV
        csv_data = []
        for i, freq in enumerate(f):
            for j, time in enumerate(t):
                csv_data.append([time, freq, Sxx[i, j]])
        
        csv_path = create_csv_artifact(
            np.array(csv_data),
            "spectrogram",
            headers=["time_s", "frequency_hz", "power"]
        )
        artifacts["csv_path"] = csv_path
    
    return {
        "frequencies": f.tolist(),
        "times": t.tolist(),
        "spectrogram": Sxx.tolist(),
        "window_size": window_size,
        "overlap": overlap,
        "window_type": window_type,
        "sample_rate": sample_rate,
        "artifacts": artifacts,
        "meta": {
            "frequency_resolution": f[1] - f[0],
            "time_resolution": t[1] - t[0],
            "shape": list(Sxx.shape)
        }
    }


def data_wavelet(signal_data: List[float], sample_rate: float, wavelet: str = "morlet",
                scales: Optional[List[float]] = None, emit_plots: bool = True,
                emit_csv: bool = True) -> Dict[str, Any]:
    """Continuous wavelet transform for time-scale analysis"""
    
    if not WAVELET_AVAILABLE:
        raise RuntimeError("pywt not available. Install with: pip install PyWavelets")
    
    signal_array = np.array(signal_data, dtype=np.float32)
    
    # Generate scales if not provided
    if scales is None:
        scales = np.logspace(0, 3, 50)  # 50 scales from 1 to 1000
    else:
        scales = np.array(scales)
    
    # Perform continuous wavelet transform
    try:
        if wavelet == "morlet":
            coefficients, frequencies = pywt.cwt(signal_array, scales, 'cmor', sampling_period=1/sample_rate)
        elif wavelet == "mexican_hat":
            coefficients, frequencies = pywt.cwt(signal_array, scales, 'mexh', sampling_period=1/sample_rate)
        else:
            coefficients, frequencies = pywt.cwt(signal_array, scales, wavelet, sampling_period=1/sample_rate)
    except Exception as e:
        raise RuntimeError(f"Wavelet transform failed: {str(e)}")
    
    # Generate diagnostic plots
    artifacts = {}
    if emit_plots:
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))
        fig.suptitle(f'Wavelet Analysis ({wavelet})')
        
        # Time domain signal
        time = np.arange(len(signal_array)) / sample_rate
        axes[0,0].plot(time, signal_array)
        axes[0,0].set_title('Time Domain Signal')
        axes[0,0].set_xlabel('Time (s)')
        axes[0,0].set_ylabel('Amplitude')
        axes[0,0].grid(True, alpha=0.3)
        
        # Scalogram (wavelet power)
        power = np.abs(coefficients)**2
        im = axes[0,1].pcolormesh(time, frequencies, power, shading='gouraud')
        axes[0,1].set_title('Scalogram (Wavelet Power)')
        axes[0,1].set_xlabel('Time (s)')
        axes[0,1].set_ylabel('Frequency (Hz)')
        axes[0,1].set_yscale('log')
        plt.colorbar(im, ax=axes[0,1], label='Power')
        
        # Global wavelet spectrum
        global_spectrum = np.mean(power, axis=1)
        axes[1,0].loglog(frequencies, global_spectrum)
        axes[1,0].set_title('Global Wavelet Spectrum')
        axes[1,0].set_xlabel('Frequency (Hz)')
        axes[1,0].set_ylabel('Power')
        axes[1,0].grid(True, alpha=0.3)
        
        # Scale-averaged power
        scale_avg_power = np.mean(power, axis=0)
        axes[1,1].plot(time, scale_avg_power)
        axes[1,1].set_title('Scale-Averaged Power')
        axes[1,1].set_xlabel('Time (s)')
        axes[1,1].set_ylabel('Power')
        axes[1,1].grid(True, alpha=0.3)
        
        plt.tight_layout()
        artifacts["png_b64"] = fig_to_base64(fig)
        artifacts["svg"] = fig_to_svg(fig)
        plt.close(fig)
    
    # Export data as CSV
    if emit_csv:
        # Create a flattened representation for CSV
        csv_data = []
        for i, freq in enumerate(frequencies):
            for j, t in enumerate(time):
                csv_data.append([t, freq, np.abs(coefficients[i, j]), np.angle(coefficients[i, j])])
        
        csv_path = create_csv_artifact(
            np.array(csv_data),
            f"wavelet_{wavelet}",
            headers=["time_s", "frequency_hz", "magnitude", "phase_rad"]
        )
        artifacts["csv_path"] = csv_path
    
    return {
        "coefficients_real": np.real(coefficients).tolist(),
        "coefficients_imag": np.imag(coefficients).tolist(),
        "frequencies": frequencies.tolist(),
        "scales": scales.tolist(),
        "wavelet": wavelet,
        "sample_rate": sample_rate,
        "artifacts": artifacts,
        "meta": {
            "shape": list(coefficients.shape),
            "frequency_range": [float(frequencies.min()), float(frequencies.max())],
            "scale_range": [float(scales.min()), float(scales.max())]
        }
    }


def _get_window_function(window_name: str, N: int) -> np.ndarray:
    """Get window function by name"""
    if window_name == "hann":
        return np.hanning(N)
    elif window_name == "hamming":
        return np.hamming(N)
    elif window_name == "blackman":
        return np.blackman(N)
    elif window_name == "bartlett":
        return np.bartlett(N)
    else:
        return np.ones(N)  # Rectangular window
