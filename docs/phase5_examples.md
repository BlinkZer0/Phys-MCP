---
title: Phase 5 Visualization Examples
kind: tutorial
header_svg:
  src: "/assets/svg/cas-lab-hero.svg"
  static: "/assets/svg/cas-lab-hero-static.svg"
  title: "Phase 5 Visualization"
  animate: true
  theme_variant: "auto"
  reduced_motion: "auto"
---

# Phase 5: Advanced Visualization Examples

This document provides examples of using the Phase 5 advanced visualization tools in Phys-MCP.

## Overview

Phase 5 introduces four new graphics-first tools with GPU acceleration and advanced rendering capabilities:

1. **plot_volume_3d** - 3D scalar field visualization with slices and isosurfaces
2. **plot_animation** - Time evolution animations with multiple renderers
3. **plot_interactive** - Parameter sweep with interactive UI specifications
4. **plot_vr_export** - Export 3D meshes to VR/AR formats (GLB, PLY)

## Prerequisites

Ensure you have the required dependencies:

```bash
# Run the preflight check
./scripts/verify_phase5_prereqs.sh

# Install additional dependencies if needed
pip install trimesh[easy]  # For VR export
pip install torch          # For GPU acceleration (optional)
```

## Examples

### 1. Volume 3D Visualization

#### Basic 3D Scalar Field with Slices

```json
{
  "method": "plot_volume_3d",
  "params": {
    "f": "exp(-(x**2 + y**2 + z**2)/2)",
    "x": [-3, 3, 50],
    "y": [-3, 3, 50],
    "z": [-3, 3, 50],
    "mode": "slices"
  }
}
```

This creates orthogonal slice views of a 3D Gaussian function.

#### Isosurface Visualization

```json
{
  "method": "plot_volume_3d",
  "params": {
    "f": "sin(x) * cos(y) * sin(z)",
    "x": [-6.28, 6.28, 60],
    "y": [-6.28, 6.28, 60],
    "z": [-6.28, 6.28, 60],
    "mode": "isosurface",
    "iso_level": 0.5
  }
}
```

Visualizes isosurfaces at a specific level of a 3D sinusoidal function.

#### Animated Volume Sweep

```json
{
  "method": "plot_volume_3d",
  "params": {
    "f": "x**2 + y**2 - z**2",
    "x": [-2, 2, 40],
    "y": [-2, 2, 40],
    "z": [-2, 2, 40],
    "emit_animation": true,
    "animate_axis": "z",
    "fps": 24,
    "format": "mp4"
  }
}
```

Creates an MP4 animation sweeping through Z-axis slices.

### 2. Time Evolution Animations

#### Wave Packet Evolution

```json
{
  "method": "plot_animation",
  "params": {
    "frame_expr": "exp(-(x-2*t)**2/2) * cos(5*x - 10*t)",
    "x_range": [-10, 10, 200],
    "t_range": [0, 5, 100],
    "renderer": "line",
    "fps": 20,
    "format": "mp4",
    "emit_csv": true
  }
}
```

Animates a traveling wave packet with CSV data export.

#### Heat Diffusion Simulation

```json
{
  "method": "plot_animation",
  "params": {
    "frame_expr": "exp(-x**2/(1+t)) / sqrt(1+t)",
    "x_range": [-5, 5, 100],
    "t_range": [0, 10, 50],
    "renderer": "imshow",
    "fps": 10,
    "format": "gif"
  }
}
```

Creates a GIF showing heat diffusion over time.

#### Quantum Harmonic Oscillator

```json
{
  "method": "plot_animation",
  "params": {
    "frame_expr": "exp(-x**2/2) * cos(x*sqrt(2)*cos(t))",
    "x_range": [-4, 4, 150],
    "t_range": [0, 6.28, 60],
    "renderer": "line",
    "fps": 15,
    "emit_frames": true
  }
}
```

Animates quantum oscillator wavefunction with frame data export.

### 3. Interactive Parameter Sweeps

#### Damped Oscillator Analysis

```json
{
  "method": "plot_interactive",
  "params": {
    "expr": "exp(-gamma*x) * sin(omega*x + phi)",
    "x_range": [0, 10, 200],
    "controls": [
      {"name": "gamma", "min": 0.1, "max": 2.0, "step": 0.1, "default": 0.5},
      {"name": "omega", "min": 0.5, "max": 5.0, "step": 0.5, "default": 2.0},
      {"name": "phi", "min": 0, "max": 6.28, "step": 0.314, "default": 0}
    ],
    "renderer": "line",
    "grid_limit": 18
  }
}
```

Generates thumbnail grid for different damping and frequency parameters.

#### Polynomial Family Explorer

```json
{
  "method": "plot_interactive",
  "params": {
    "expr": "a*x**3 + b*x**2 + c*x + d",
    "x_range": [-3, 3, 100],
    "controls": [
      {"name": "a", "min": -1, "max": 1, "step": 0.2, "default": 0.1},
      {"name": "b", "min": -2, "max": 2, "step": 0.5, "default": 0},
      {"name": "c", "min": -3, "max": 3, "step": 0.5, "default": 1},
      {"name": "d", "min": -2, "max": 2, "step": 0.5, "default": 0}
    ],
    "grid_limit": 24
  }
}
```

Explores cubic polynomial parameter space.

### 4. VR/AR Export

#### Simple Geometric Shapes

```json
{
  "method": "plot_vr_export",
  "params": {
    "geometry": {
      "vertices": [
        [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
        [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
      ],
      "faces": [
        [0, 1, 2], [0, 2, 3], [4, 7, 6], [4, 6, 5],
        [0, 4, 5], [0, 5, 1], [2, 6, 7], [2, 7, 3],
        [0, 3, 7], [0, 7, 4], [1, 5, 6], [1, 6, 2]
      ]
    },
    "format": "glb",
    "extras": {"name": "unit_cube", "material": "metal"}
  }
}
```

Exports a unit cube to GLB format for VR applications.

#### Point Cloud Export

```json
{
  "method": "plot_vr_export",
  "params": {
    "geometry": {
      "vertices": [
        [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]
      ],
      "faces": [
        [0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]
      ],
      "colors": [
        [255, 0, 0, 255], [0, 255, 0, 255], 
        [0, 0, 255, 255], [255, 255, 0, 255]
      ]
    },
    "format": "ply"
  }
}
```

Exports a colored tetrahedron to PLY format.

## Advanced Features

### GPU Acceleration

The tools automatically detect and use available GPU acceleration:

- **CUDA** (NVIDIA GPUs)
- **MPS** (Apple Silicon)
- **ROCm** (AMD GPUs)  
- **XPU** (Intel GPUs)

Set environment variables to control acceleration:

```bash
export ACCEL_MODE=auto        # auto, gpu, cpu
export ACCEL_DEVICE=auto      # auto, cuda, mps, xpu
```

### Performance Tuning

#### Memory Management

```json
{
  "method": "plot_volume_3d",
  "params": {
    "f": "complex_function(x, y, z)",
    "x": [-5, 5, 100],
    "y": [-5, 5, 100], 
    "z": [-5, 5, 100],
    "samples_cap": 80,      // Reduce for memory constraints
    "allow_large": false    // Enforce caps
  }
}
```

#### Animation Optimization

```json
{
  "method": "plot_animation",
  "params": {
    "frame_expr": "heavy_computation(x, t)",
    "x_range": [-10, 10, 500],
    "t_range": [0, 20, 200],
    "frames_cap": 100,      // Limit frames
    "allow_large": false,
    "dpi": 100             // Reduce resolution if needed
  }
}
```

## Error Handling

The tools include comprehensive error handling:

- **GPU OOM**: Automatic fallback to CPU
- **Invalid expressions**: Graceful error messages
- **Missing dependencies**: Clear installation instructions
- **File I/O errors**: Detailed error reporting

## Integration with Existing Tools

Phase 5 tools integrate seamlessly with the consolidated tool interface:

```json
{
  "method": "plot",
  "params": {
    "plot_type": "volume_3d",
    "f": "x**2 + y**2 + z**2",
    "x": [-2, 2, 30],
    "y": [-2, 2, 30],
    "z": [-2, 2, 30]
  }
}
```

## Output Formats

### Volume 3D
- **PNG**: Contact sheet with orthogonal slices
- **CSV**: Sampled scalar field data
- **MP4/WebM/GIF**: Optional animations

### Animation
- **MP4**: H.264 encoded video (default)
- **WebM**: VP9 encoded video
- **GIF**: Animated GIF
- **CSV**: Frame-by-frame data
- **JSON**: Frame metadata

### Interactive
- **PNG**: Thumbnail grid (base64 encoded)
- **JSON**: UI specification for sliders

### VR Export
- **GLB**: Binary glTF 2.0 (recommended for VR)
- **PLY**: Stanford polygon format

## Best Practices

1. **Start Small**: Begin with low resolution for testing
2. **Use GPU**: Enable acceleration for large datasets
3. **Monitor Memory**: Watch for OOM conditions
4. **Cache Results**: Leverage built-in caching for repeated operations
5. **Validate Inputs**: Check expressions before heavy computation
6. **Choose Formats**: Use appropriate output formats for your use case

## Troubleshooting

### Common Issues

**FFmpeg not found**:
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/
```

**GPU acceleration not working**:
```bash
# Check PyTorch installation
python -c "import torch; print(torch.cuda.is_available())"

# Check MPS (Apple Silicon)
python -c "import torch; print(torch.backends.mps.is_available())"
```

**Trimesh import errors**:
```bash
pip install trimesh[easy]
```

### Performance Tips

- Use `allow_large=false` to prevent memory issues
- Reduce `samples_cap` and `frames_cap` for faster iteration
- Use `dpi=80` for draft quality, `dpi=150+` for publication
- Choose `format="gif"` for small animations, `"mp4"` for quality

## See Also

- [Phase 2 Implementation](Phase2-Implementation.md)
- [Phases 7 & 8 Implementation](phases_7_8_implementation.md)
- [Plot Tool Reference](Tools/Plot.md)

