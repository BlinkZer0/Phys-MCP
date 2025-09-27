---
title: Data Processing & Signal Analysis
kind: reference
header_svg:
  src: "/assets/svg/experiment-orchestrator-hero.svg"
  static: "/assets/svg/experiment-orchestrator-hero-static.svg"
  title: "Data Processing"
  animate: true
  theme_variant: "auto"
  reduced_motion: "auto"
---

# Data Processing & Signal Analysis Tool

The Data Processing tool provides comprehensive capabilities for importing, analyzing, and processing scientific data from various formats. It includes advanced signal processing capabilities with GPU acceleration.

## Core Capabilities

### Data Import/Export
- **HDF5**: Hierarchical data format for large datasets
- **FITS**: Astronomy data format
- **ROOT**: High-energy physics data format
- **CSV/JSON**: Standard tabular data formats

### Signal Processing
- **FFT Analysis**: Fast Fourier transforms with windowing
- **Filtering**: Low-pass, high-pass, band-pass, band-stop filters
- **Spectrograms**: Time-frequency analysis
- **Wavelets**: Advanced time-frequency decomposition

## Usage Examples

### Import HDF5 Data
```json
{
  "tool": "data",
  "params": {
    "action": "import_hdf5",
    "file_path": "/path/to/data.h5",
    "dataset_path": "/experiment/measurements"
  }
}
```

### FFT Analysis
```json
{
  "tool": "data",
  "params": {
    "action": "fft",
    "signal_data": [1, 2, 3, 4, 5, 6, 7, 8],
    "sample_rate": 1000,
    "window": "hann"
  }
}
```

### Signal Filtering
```json
{
  "tool": "data",
  "params": {
    "action": "filter",
    "signal_data": [/* array of data points */],
    "filter_type": "lowpass",
    "cutoff_freq": 50,
    "sample_rate": 1000,
    "filter_order": 4
  }
}
```

### Spectrogram Generation
```json
{
  "tool": "data",
  "params": {
    "action": "spectrogram",
    "signal_data": [/* time series data */],
    "sample_rate": 44100,
    "window_size": 1024,
    "overlap": 0.5
  }
}
```

## Advanced Features

### GPU Acceleration
- Automatic GPU detection and utilization
- CUDA/HIP/MPS support for different platforms
- Memory-efficient processing for large datasets
- Automatic fallback to CPU when GPU unavailable

### Window Functions
- **Hann**: Good frequency resolution
- **Hamming**: Reduced sidelobe leakage
- **Blackman**: Excellent sidelobe suppression
- **Bartlett**: Triangular window
- **None**: Rectangular window

### Filter Types
- **Low-pass**: Remove high-frequency noise
- **High-pass**: Remove low-frequency drift
- **Band-pass**: Isolate specific frequency range
- **Band-stop**: Remove specific frequency range

## Educational Applications

### Physics Laboratory Data
- Analyze pendulum period measurements
- Process voltage/current data from circuits
- Extract resonance frequencies from oscillating systems
- Filter noise from experimental measurements

### Signal Analysis Examples
- **Chirp Signal**: Analyze frequency-swept signals
- **Pulse Analysis**: Extract pulse characteristics
- **Noise Characterization**: Analyze background noise
- **Modulation Detection**: Identify AM/FM signals

## Integration with Other Tools

### Plot Integration
```json
{
  "tool": "plot",
  "params": {
    "plot_type": "function_2d",
    "f": "sin(2*pi*50*t) + 0.1*sin(2*pi*120*t)",
    "x_min": 0,
    "x_max": 1
  }
}
```

### CAS Integration
```json
{
  "tool": "cas",
  "params": {
    "expr": "fft_result",
    "vars": {"fft_result": /* from data tool output */}
  }
}
```

## Performance Considerations

- **Large Datasets**: Automatic chunking for files >1GB
- **Memory Management**: Efficient buffer handling
- **GPU Utilization**: Automatic batch size optimization
- **Caching**: Results cached for repeated operations

## Error Handling

- **File Format Validation**: Automatic format detection
- **Data Type Checking**: Ensures compatible data types
- **Memory Limits**: Prevents system overload
- **GPU Fallback**: Graceful degradation to CPU processing
