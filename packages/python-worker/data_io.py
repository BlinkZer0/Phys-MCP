"""
Data I/O module for scientific formats (HDF5, FITS, ROOT)
Supports import/export with metadata extraction and diagnostic plots
"""

import os
import json
import numpy as np
import matplotlib.pyplot as plt
from typing import Dict, Any, Optional, List
from .utils import fig_to_base64, fig_to_svg, create_csv_artifact

# Optional dependencies with graceful fallback
try:
    import h5py
    HDF5_AVAILABLE = True
except ImportError:
    HDF5_AVAILABLE = False

try:
    from astropy.io import fits
    FITS_AVAILABLE = True
except ImportError:
    FITS_AVAILABLE = False

try:
    import uproot
    ROOT_AVAILABLE = True
except ImportError:
    ROOT_AVAILABLE = False


def data_import_hdf5(file_path: str, dataset_path: Optional[str] = None, 
                    emit_plots: bool = True) -> Dict[str, Any]:
    """Import HDF5 scientific dataset with metadata extraction"""
    
    if not HDF5_AVAILABLE:
        raise RuntimeError("h5py not available. Install with: pip install h5py")
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"HDF5 file not found: {file_path}")
    
    try:
        with h5py.File(file_path, 'r') as f:
            if dataset_path:
                if dataset_path not in f:
                    raise KeyError(f"Dataset '{dataset_path}' not found in HDF5 file")
                dataset = f[dataset_path]
                data = dataset[:]
                attrs = dict(dataset.attrs)
            else:
                # Auto-discover main dataset
                data, attrs, dataset_path = _auto_discover_hdf5_data(f)
            
            # Extract file-level metadata
            file_attrs = dict(f.attrs)
            
    except Exception as e:
        raise RuntimeError(f"Failed to read HDF5 file: {str(e)}")
    
    # Generate diagnostic plots
    artifacts = {}
    if emit_plots and data is not None:
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))
        fig.suptitle(f'HDF5 Data Analysis: {os.path.basename(file_path)}')
        
        # Data shape and type info
        axes[0,0].text(0.1, 0.8, f"Dataset: {dataset_path}", fontsize=12, transform=axes[0,0].transAxes)
        axes[0,0].text(0.1, 0.6, f"Shape: {data.shape}", fontsize=12, transform=axes[0,0].transAxes)
        axes[0,0].text(0.1, 0.4, f"Dtype: {data.dtype}", fontsize=12, transform=axes[0,0].transAxes)
        axes[0,0].text(0.1, 0.2, f"Size: {data.nbytes / 1024**2:.2f} MB", fontsize=12, transform=axes[0,0].transAxes)
        axes[0,0].set_title("Dataset Information")
        axes[0,0].axis('off')
        
        # Data visualization based on dimensions
        if data.ndim == 1:
            axes[0,1].plot(data)
            axes[0,1].set_title("1D Data Plot")
            axes[0,1].set_xlabel("Index")
            axes[0,1].set_ylabel("Value")
        elif data.ndim == 2:
            im = axes[0,1].imshow(data, aspect='auto', cmap='viridis')
            axes[0,1].set_title("2D Data Heatmap")
            plt.colorbar(im, ax=axes[0,1])
        else:
            # For higher dimensions, show a slice
            if data.ndim == 3:
                slice_data = data[data.shape[0]//2, :, :]
            else:
                slice_data = data.flatten()[:1000]  # First 1000 elements
            axes[0,1].plot(slice_data)
            axes[0,1].set_title(f"{data.ndim}D Data (slice/sample)")
        
        # Statistics
        if np.issubdtype(data.dtype, np.number):
            stats_text = f"""Statistics:
Mean: {np.mean(data):.6f}
Std:  {np.std(data):.6f}
Min:  {np.min(data):.6f}
Max:  {np.max(data):.6f}"""
            axes[1,0].text(0.1, 0.5, stats_text, fontsize=10, transform=axes[1,0].transAxes, 
                          verticalalignment='center', fontfamily='monospace')
            axes[1,0].set_title("Statistical Summary")
            axes[1,0].axis('off')
            
            # Histogram
            if data.size < 1000000:  # Only for reasonable sizes
                axes[1,1].hist(data.flatten(), bins=50, alpha=0.7)
                axes[1,1].set_title("Data Distribution")
                axes[1,1].set_xlabel("Value")
                axes[1,1].set_ylabel("Frequency")
        else:
            axes[1,0].text(0.5, 0.5, "Non-numeric data", ha='center', va='center', 
                          transform=axes[1,0].transAxes)
            axes[1,0].set_title("Statistics")
            axes[1,0].axis('off')
            axes[1,1].axis('off')
        
        plt.tight_layout()
        artifacts["png_b64"] = fig_to_base64(fig)
        artifacts["svg"] = fig_to_svg(fig)
        plt.close(fig)
    
    # Create CSV export for numeric data
    if data is not None and np.issubdtype(data.dtype, np.number):
        csv_path = create_csv_artifact(data, f"hdf5_data_{os.path.basename(file_path)}")
        artifacts["csv_path"] = csv_path
    
    return {
        "data": data.tolist() if data is not None else None,
        "dataset_path": dataset_path,
        "metadata": attrs,
        "file_metadata": file_attrs,
        "shape": list(data.shape) if data is not None else None,
        "dtype": str(data.dtype) if data is not None else None,
        "size_mb": data.nbytes / 1024**2 if data is not None else 0,
        "artifacts": artifacts,
        "meta": {
            "file_size_mb": os.path.getsize(file_path) / 1024**2,
            "format": "HDF5",
            "readable": True
        }
    }


def data_import_fits(file_path: str, hdu_index: int = 0, emit_plots: bool = True) -> Dict[str, Any]:
    """Import FITS astronomical data with header information"""
    
    if not FITS_AVAILABLE:
        raise RuntimeError("astropy not available. Install with: pip install astropy")
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"FITS file not found: {file_path}")
    
    try:
        with fits.open(file_path) as hdul:
            if hdu_index >= len(hdul):
                raise IndexError(f"HDU index {hdu_index} out of range (file has {len(hdul)} HDUs)")
            
            hdu = hdul[hdu_index]
            data = hdu.data
            header = dict(hdu.header)
            
            # Get info about all HDUs
            hdu_info = []
            for i, h in enumerate(hdul):
                hdu_info.append({
                    "index": i,
                    "name": h.name,
                    "type": type(h).__name__,
                    "shape": list(h.data.shape) if h.data is not None else None
                })
                
    except Exception as e:
        raise RuntimeError(f"Failed to read FITS file: {str(e)}")
    
    # Generate diagnostic plots
    artifacts = {}
    if emit_plots and data is not None:
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))
        fig.suptitle(f'FITS Data Analysis: {os.path.basename(file_path)} (HDU {hdu_index})')
        
        # Header information
        key_headers = ['OBJECT', 'TELESCOP', 'INSTRUME', 'DATE-OBS', 'EXPTIME']
        header_text = "Key Headers:\n"
        for key in key_headers:
            if key in header:
                header_text += f"{key}: {header[key]}\n"
        
        axes[0,0].text(0.05, 0.95, header_text, fontsize=10, transform=axes[0,0].transAxes,
                      verticalalignment='top', fontfamily='monospace')
        axes[0,0].set_title("FITS Header Info")
        axes[0,0].axis('off')
        
        # Data visualization
        if data.ndim == 1:
            axes[0,1].plot(data)
            axes[0,1].set_title("1D Spectrum/Light Curve")
            axes[0,1].set_xlabel("Pixel/Time")
            axes[0,1].set_ylabel("Intensity")
        elif data.ndim == 2:
            # Astronomical image
            vmin, vmax = np.percentile(data, [1, 99])  # Robust scaling
            im = axes[0,1].imshow(data, origin='lower', cmap='gray', vmin=vmin, vmax=vmax)
            axes[0,1].set_title("Astronomical Image")
            axes[0,1].set_xlabel("X (pixels)")
            axes[0,1].set_ylabel("Y (pixels)")
            plt.colorbar(im, ax=axes[0,1])
        else:
            # Multi-dimensional data (e.g., data cube)
            slice_data = data[data.shape[0]//2] if data.ndim == 3 else data.flatten()[:1000]
            axes[0,1].plot(slice_data)
            axes[0,1].set_title(f"{data.ndim}D Data (slice)")
        
        # Statistics
        if np.issubdtype(data.dtype, np.number):
            stats_text = f"""Image Statistics:
Mean: {np.mean(data):.3e}
Std:  {np.std(data):.3e}
Min:  {np.min(data):.3e}
Max:  {np.max(data):.3e}
Shape: {data.shape}"""
            axes[1,0].text(0.1, 0.5, stats_text, fontsize=10, transform=axes[1,0].transAxes,
                          verticalalignment='center', fontfamily='monospace')
            axes[1,0].set_title("Image Statistics")
            axes[1,0].axis('off')
            
            # Histogram
            axes[1,1].hist(data.flatten(), bins=50, alpha=0.7, log=True)
            axes[1,1].set_title("Intensity Distribution")
            axes[1,1].set_xlabel("Intensity")
            axes[1,1].set_ylabel("Log Frequency")
        
        plt.tight_layout()
        artifacts["png_b64"] = fig_to_base64(fig)
        artifacts["svg"] = fig_to_svg(fig)
        plt.close(fig)
    
    # Create CSV export for numeric data
    if data is not None and np.issubdtype(data.dtype, np.number):
        csv_path = create_csv_artifact(data, f"fits_data_{os.path.basename(file_path)}")
        artifacts["csv_path"] = csv_path
    
    return {
        "data": data.tolist() if data is not None else None,
        "header": header,
        "hdu_info": hdu_info,
        "shape": list(data.shape) if data is not None else None,
        "dtype": str(data.dtype) if data is not None else None,
        "artifacts": artifacts,
        "meta": {
            "file_size_mb": os.path.getsize(file_path) / 1024**2,
            "format": "FITS",
            "hdu_count": len(hdu_info),
            "current_hdu": hdu_index
        }
    }


def data_import_root(file_path: str, tree_name: str, branches: Optional[List[str]] = None,
                    max_entries: int = 10000, emit_plots: bool = True) -> Dict[str, Any]:
    """Import ROOT particle physics data with branch analysis"""
    
    if not ROOT_AVAILABLE:
        raise RuntimeError("uproot not available. Install with: pip install uproot")
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"ROOT file not found: {file_path}")
    
    try:
        with uproot.open(file_path) as f:
            if tree_name not in f:
                available_trees = [key for key in f.keys() if hasattr(f[key], 'arrays')]
                raise KeyError(f"Tree '{tree_name}' not found. Available trees: {available_trees}")
            
            tree = f[tree_name]
            
            # Get branch information
            all_branches = list(tree.keys())
            if branches is None:
                branches = all_branches[:10]  # Limit to first 10 branches
            
            # Read data with entry limit
            arrays = tree.arrays(branches, library="np", entry_stop=max_entries)
            
            # Convert to regular dict
            data = {k: v.tolist() if hasattr(v, 'tolist') else v for k, v in arrays.items()}
            
    except Exception as e:
        raise RuntimeError(f"Failed to read ROOT file: {str(e)}")
    
    # Generate diagnostic plots
    artifacts = {}
    if emit_plots and data:
        n_branches = len(branches)
        n_cols = min(3, n_branches)
        n_rows = (n_branches + n_cols - 1) // n_cols
        
        fig, axes = plt.subplots(n_rows, n_cols, figsize=(4*n_cols, 3*n_rows))
        if n_branches == 1:
            axes = [axes]
        elif n_rows == 1:
            axes = [axes]
        else:
            axes = axes.flatten()
        
        fig.suptitle(f'ROOT Data Analysis: {os.path.basename(file_path)} - {tree_name}')
        
        for i, branch in enumerate(branches):
            if i >= len(axes):
                break
                
            branch_data = np.array(data[branch])
            
            if np.issubdtype(branch_data.dtype, np.number):
                axes[i].hist(branch_data, bins=50, alpha=0.7)
                axes[i].set_title(f'{branch}\n(μ={np.mean(branch_data):.3f}, σ={np.std(branch_data):.3f})')
                axes[i].set_xlabel('Value')
                axes[i].set_ylabel('Entries')
            else:
                axes[i].text(0.5, 0.5, f'{branch}\n(non-numeric)', ha='center', va='center',
                           transform=axes[i].transAxes)
                axes[i].set_title(branch)
        
        # Hide unused subplots
        for i in range(len(branches), len(axes)):
            axes[i].axis('off')
        
        plt.tight_layout()
        artifacts["png_b64"] = fig_to_base64(fig)
        artifacts["svg"] = fig_to_svg(fig)
        plt.close(fig)
    
    # Create CSV export
    if data:
        import pandas as pd
        df = pd.DataFrame(data)
        csv_path = f"artifacts/root_data_{os.path.basename(file_path)}_{tree_name}.csv"
        os.makedirs("artifacts", exist_ok=True)
        df.to_csv(csv_path, index=False)
        artifacts["csv_path"] = csv_path
    
    return {
        "data": data,
        "tree_name": tree_name,
        "branches": branches,
        "all_branches": all_branches,
        "entries_read": len(data[branches[0]]) if branches and data else 0,
        "total_entries": len(tree) if 'tree' in locals() else 0,
        "artifacts": artifacts,
        "meta": {
            "file_size_mb": os.path.getsize(file_path) / 1024**2,
            "format": "ROOT",
            "tree_count": 1,  # Simplified for now
            "branch_count": len(all_branches)
        }
    }


def data_export_hdf5(data: Dict[str, Any], file_path: str, compression: str = "gzip",
                    metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Export data to HDF5 format with compression and metadata"""
    
    if not HDF5_AVAILABLE:
        raise RuntimeError("h5py not available. Install with: pip install h5py")
    
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with h5py.File(file_path, 'w') as f:
            # Add file-level metadata
            if metadata:
                for key, value in metadata.items():
                    f.attrs[key] = value
            
            # Recursively write data structure
            _write_hdf5_recursive(f, data, compression)
            
    except Exception as e:
        raise RuntimeError(f"Failed to write HDF5 file: {str(e)}")
    
    file_size = os.path.getsize(file_path)
    
    return {
        "file_path": file_path,
        "file_size_mb": file_size / 1024**2,
        "compression": compression,
        "success": True,
        "meta": {
            "format": "HDF5",
            "created": True
        }
    }


def _auto_discover_hdf5_data(f):
    """Auto-discover the main dataset in an HDF5 file"""
    datasets = []
    
    def visit_func(name, obj):
        if isinstance(obj, h5py.Dataset):
            datasets.append((name, obj.shape, obj.dtype))
    
    f.visititems(visit_func)
    
    if not datasets:
        return None, {}, None
    
    # Choose the largest dataset
    largest = max(datasets, key=lambda x: np.prod(x[1]))
    dataset_path = largest[0]
    
    dataset = f[dataset_path]
    data = dataset[:]
    attrs = dict(dataset.attrs)
    
    return data, attrs, dataset_path


def _write_hdf5_recursive(group, data, compression):
    """Recursively write nested data structure to HDF5"""
    for key, value in data.items():
        if isinstance(value, dict):
            subgroup = group.create_group(key)
            _write_hdf5_recursive(subgroup, value, compression)
        else:
            # Convert to numpy array
            if isinstance(value, list):
                value = np.array(value)
            elif not isinstance(value, np.ndarray):
                value = np.array([value])
            
            # Create dataset with compression
            if compression != "none" and value.size > 100:
                group.create_dataset(key, data=value, compression=compression)
            else:
                group.create_dataset(key, data=value)
