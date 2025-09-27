# Phase 4 Implementation Guide: Data I/O & External Integration

## Overview
Phase 4 adds scientific data format support, GPU-accelerated signal processing, external API integration, and enhanced export capabilities to the Physics MCP Server.

## Implementation Checklist

### Week 1: Data I/O Infrastructure
- [ ] Create `packages/tools-data-io` package structure
- [ ] Implement HDF5 import/export with h5py
- [ ] Implement FITS astronomical data support with astropy
- [ ] Implement ROOT particle physics data support with uproot
- [ ] Add metadata extraction and validation
- [ ] Create streaming readers for large datasets
- [ ] Add GPU memory management for large arrays

### Week 2: Signal Processing with GPU Acceleration
- [ ] Create `packages/tools-signal` package structure  
- [ ] Implement `data_fft` with torch.fft → numpy.fft fallback
- [ ] Implement `data_filter` with GPU-accelerated IIR/FIR filters
- [ ] Implement `data_spectrogram` with time-frequency analysis
- [ ] Implement `data_wavelet` for wavelet transforms
- [ ] Add comprehensive diagnostic plotting for all transforms
- [ ] Integrate with existing acceleration layer (`accel.py`)

### Week 3: External APIs and Export
- [ ] Create `packages/tools-external` package structure
- [ ] Implement arXiv API integration with rate limiting
- [ ] Implement CERN Open Data Portal access
- [ ] Implement NASA dataset API integration  
- [ ] Implement NIST physical data access
- [ ] Create `packages/tools-export` package structure
- [ ] Implement Overleaf project creation
- [ ] Implement GitHub repository export with artifacts
- [ ] Implement Zenodo DOI-minted publication
- [ ] Implement Jupyter notebook generation

## Package Structure

### tools-data-io
```
packages/tools-data-io/
├── src/
│   ├── index.ts           # Main exports and tool definitions
│   ├── schema.ts          # JSON schemas for all tools
│   └── handlers.ts        # Request handlers and routing
├── package.json
└── tsconfig.json
```

### tools-signal  
```
packages/tools-signal/
├── src/
│   ├── index.ts           # Signal processing tool exports
│   ├── schema.ts          # FFT, filter, spectrogram schemas
│   └── handlers.ts        # GPU-accelerated signal processing
├── package.json
└── tsconfig.json
```

### tools-external
```
packages/tools-external/
├── src/
│   ├── index.ts           # External API tool definitions
│   ├── schema.ts          # API request/response schemas
│   ├── handlers.ts        # API integration handlers
│   └── rate-limiter.ts    # Rate limiting for external APIs
├── package.json
└── tsconfig.json
```

### tools-export
```
packages/tools-export/
├── src/
│   ├── index.ts           # Export tool definitions
│   ├── schema.ts          # Export format schemas
│   ├── handlers.ts        # Export handlers
│   └── templates/         # Export templates (LaTeX, etc.)
├── package.json
└── tsconfig.json
```

## Python Worker Extensions

Add to `packages/python-worker/`:

### data_io.py
```python
import h5py
import numpy as np
from astropy.io import fits
import uproot

def import_hdf5(file_path, dataset_path=None):
    """Import HDF5 scientific dataset with metadata"""
    with h5py.File(file_path, 'r') as f:
        if dataset_path:
            data = f[dataset_path][:]
            attrs = dict(f[dataset_path].attrs)
        else:
            # Auto-discover main dataset
            data, attrs = auto_discover_hdf5_data(f)
    
    return {
        "data": data.tolist(),
        "metadata": attrs,
        "shape": data.shape,
        "dtype": str(data.dtype)
    }

def import_fits(file_path, hdu_index=0):
    """Import FITS astronomical data"""
    with fits.open(file_path) as hdul:
        data = hdul[hdu_index].data
        header = dict(hdul[hdu_index].header)
    
    return {
        "data": data.tolist() if data is not None else None,
        "header": header,
        "shape": data.shape if data is not None else None
    }

def import_root(file_path, tree_name, branches=None):
    """Import ROOT particle physics data"""
    with uproot.open(file_path) as f:
        tree = f[tree_name]
        if branches:
            data = tree.arrays(branches, library="np")
        else:
            data = tree.arrays(library="np")
    
    return {
        "data": {k: v.tolist() for k, v in data.items()},
        "branches": list(data.keys()),
        "entries": len(data[list(data.keys())[0]])
    }
```

### signal_processing.py
```python
import torch
import numpy as np
from scipy import signal
import matplotlib.pyplot as plt

def data_fft(signal_data, sample_rate, emit_plots=True):
    """GPU-accelerated FFT with diagnostic plots"""
    try:
        # GPU path
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        signal_tensor = torch.tensor(signal_data, device=device, dtype=torch.float32)
        
        # Compute FFT on GPU
        fft_result = torch.fft.fft(signal_tensor)
        freqs = torch.fft.fftfreq(len(signal_data), 1/sample_rate, device=device)
        
        # Convert back to numpy for plotting
        freqs_np = freqs.cpu().numpy()
        spectrum_np = fft_result.cpu().numpy()
        
    except (RuntimeError, MemoryError):
        # CPU fallback
        freqs_np = np.fft.fftfreq(len(signal_data), 1/sample_rate)
        spectrum_np = np.fft.fft(signal_data)
    
    artifacts = {}
    if emit_plots:
        # Generate 4-panel diagnostic plot
        fig, axes = plt.subplots(2, 2, figsize=(12, 8))
        
        # Time domain
        time = np.arange(len(signal_data)) / sample_rate
        axes[0,0].plot(time, signal_data)
        axes[0,0].set_title("Time Domain Signal")
        axes[0,0].set_xlabel("Time (s)")
        axes[0,0].set_ylabel("Amplitude")
        
        # Magnitude spectrum
        axes[0,1].plot(freqs_np[:len(freqs_np)//2], 
                      np.abs(spectrum_np[:len(spectrum_np)//2]))
        axes[0,1].set_title("Magnitude Spectrum")
        axes[0,1].set_xlabel("Frequency (Hz)")
        axes[0,1].set_ylabel("Magnitude")
        
        # Phase spectrum
        axes[1,0].plot(freqs_np[:len(freqs_np)//2], 
                      np.angle(spectrum_np[:len(spectrum_np)//2]))
        axes[1,0].set_title("Phase Spectrum")
        axes[1,0].set_xlabel("Frequency (Hz)")
        axes[1,0].set_ylabel("Phase (rad)")
        
        # Spectrogram
        f, t, Sxx = signal.spectrogram(signal_data, sample_rate)
        axes[1,1].pcolormesh(t, f, 10*np.log10(Sxx))
        axes[1,1].set_title("Spectrogram")
        axes[1,1].set_xlabel("Time (s)")
        axes[1,1].set_ylabel("Frequency (Hz)")
        
        artifacts["png_b64"] = fig_to_base64(fig)
        artifacts["svg"] = fig_to_svg(fig)
        plt.close(fig)
    
    return {
        "frequencies": freqs_np.tolist(),
        "spectrum": spectrum_np.tolist(),
        "sample_rate": sample_rate,
        "artifacts": artifacts,
        "meta": {
            "device": "cuda" if torch.cuda.is_available() else "cpu",
            "length": len(signal_data),
            "nyquist_freq": sample_rate / 2
        }
    }
```

## Integration Steps

### 1. Update Server Package
Add new tool packages to `packages/server/src/index.ts`:

```typescript
// Import new tool packages
import * as dataIOTools from '@phys-mcp/tools-data-io';
import * as signalTools from '@phys-mcp/tools-signal';
import * as externalTools from '@phys-mcp/tools-external';
import * as exportTools from '@phys-mcp/tools-export';

// Register tools
const allTools = [
  ...existingTools,
  ...dataIOTools.tools,
  ...signalTools.tools,
  ...externalTools.tools,
  ...exportTools.tools
];
```

### 2. Update Python Worker
Add new method handlers to `packages/python-worker/worker.py`:

```python
# Import new modules
from . import data_io
from . import signal_processing
from . import external_apis
from . import export_utils

# Add method handlers
METHODS = {
    # Existing methods...
    
    # Data I/O
    "data_import_hdf5": data_io.import_hdf5,
    "data_import_fits": data_io.import_fits,
    "data_import_root": data_io.import_root,
    
    # Signal processing
    "data_fft": signal_processing.data_fft,
    "data_filter": signal_processing.data_filter,
    "data_spectrogram": signal_processing.data_spectrogram,
    
    # External APIs
    "api_arxiv": external_apis.search_arxiv,
    "api_cern": external_apis.access_cern_data,
    
    # Export tools
    "export_overleaf": export_utils.create_overleaf_project,
    "export_jupyter": export_utils.generate_jupyter_notebook,
}
```

### 3. Update Dependencies
Add to `packages/python-worker/requirements.txt`:

```
h5py>=3.8.0
astropy>=5.0.0
uproot>=5.0.0
requests>=2.28.0
jupyter>=1.0.0
```

### 4. Create Example Requests
Add to `examples/requests/phase4-examples.json`:

```json
{
  "data_fft_example": {
    "jsonrpc": "2.0",
    "id": "fft_test",
    "method": "data_fft",
    "params": {
      "signal_data": [/* sine wave data */],
      "sample_rate": 1000,
      "emit_plots": true
    }
  },
  "hdf5_import_example": {
    "jsonrpc": "2.0", 
    "id": "hdf5_test",
    "method": "data_import_hdf5",
    "params": {
      "file_path": "./examples/data/sample.h5",
      "dataset_path": "/experiment/data"
    }
  }
}
```

## Testing Strategy

### Unit Tests
- Test each data format import/export
- Test GPU vs CPU FFT consistency  
- Test external API rate limiting
- Test export format generation

### Integration Tests
- End-to-end data pipeline: import → process → export
- GPU memory management under load
- External API error handling
- Artifact caching and retrieval

### Golden Tests
- Compare FFT results with scipy reference
- Validate exported file formats
- Check diagnostic plot generation
- Verify metadata preservation

## Success Criteria

### Functional Requirements
- [ ] Import HDF5, FITS, ROOT files with metadata
- [ ] GPU-accelerated FFT matches CPU results within tolerance
- [ ] External APIs work with proper rate limiting
- [ ] Export formats are valid and complete

### Performance Requirements  
- [ ] GPU FFT is 5-10x faster than CPU for large signals
- [ ] Large dataset imports stream without OOM
- [ ] API requests complete within timeout limits
- [ ] Export generation completes within 30 seconds

### Quality Requirements
- [ ] All diagnostic plots are publication-ready
- [ ] Error messages are clear and actionable
- [ ] Documentation covers all new tools
- [ ] Examples work out of the box

## Next Steps After Phase 4

Upon completion, Phase 4 provides the foundation for:
- **Phase 5**: Advanced visualization with imported data
- **Phase 6**: ML training on imported datasets  
- **Phase 7**: Distributed processing of large data files
- **Phase 8**: Complete experimental workflows with data I/O

---

**Ready to begin Phase 4 implementation!** 🚀
