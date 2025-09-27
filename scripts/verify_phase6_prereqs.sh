#!/bin/bash

# Phase 6: ML/AI Augmentation Prerequisites Verification Script
# Verifies acceleration module, ffmpeg, and Python ML dependencies

set -e

echo "🔍 Phase 6: ML/AI Augmentation Prerequisites Check"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "server.config.json" ]; then
    echo "❌ Error: Must run from Phys-MCP root directory"
    exit 1
fi

# Check acceleration module
echo "📊 Checking acceleration module..."
if [ -f "packages/python-worker/accel.py" ]; then
    echo "✅ Acceleration module found"
    
    # Test device detection
    cd packages/python-worker
    python3 -c "
import accel
try:
    device = accel.get_device()
    print(f'✅ Device detection working: {device}')
    if device != 'cpu':
        print(f'🚀 GPU acceleration available: {device}')
    else:
        print('💻 CPU fallback available')
except Exception as e:
    print(f'⚠️  Device detection issue: {e}')
    print('💻 Will use CPU fallback')
"
    cd ../..
else
    echo "❌ Acceleration module not found at packages/python-worker/accel.py"
    exit 1
fi

# Check ffmpeg for video encoding
echo "🎬 Checking ffmpeg..."
if command -v ffmpeg >/dev/null 2>&1; then
    echo "✅ ffmpeg found: $(ffmpeg -version | head -n1)"
    
    # Check for required encoders
    if ffmpeg -encoders 2>/dev/null | grep -q libx264; then
        echo "✅ H.264 encoder (libx264) available"
    else
        echo "⚠️  H.264 encoder not available - MP4 export may fail"
    fi
    
    if ffmpeg -encoders 2>/dev/null | grep -q libvpx-vp9; then
        echo "✅ VP9 encoder (libvpx-vp9) available"
    else
        echo "⚠️  VP9 encoder not available - WebM export may fail"
    fi
else
    echo "❌ ffmpeg not found - video animations will not work"
    echo "   Install with: apt install ffmpeg (Linux) or brew install ffmpeg (macOS)"
    exit 1
fi

# Check Python ML dependencies
echo "🧠 Checking Python ML dependencies..."

# Core ML dependencies
python3 -c "
import sys
missing = []
optional_missing = []

# Required dependencies
try:
    import torch
    print('✅ PyTorch found:', torch.__version__)
    
    # Check device availability
    if torch.cuda.is_available():
        print(f'🚀 CUDA available: {torch.cuda.device_count()} device(s)')
    elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        print('🚀 MPS (Apple Silicon) available')
    else:
        print('💻 GPU not available, will use CPU')
        
except ImportError:
    missing.append('torch')

try:
    import torchvision
    print('✅ TorchVision found:', torchvision.__version__)
except ImportError:
    missing.append('torchvision')

try:
    import sklearn
    print('✅ Scikit-learn found:', sklearn.__version__)
except ImportError:
    missing.append('scikit-learn')

try:
    import matplotlib
    print('✅ Matplotlib found:', matplotlib.__version__)
except ImportError:
    missing.append('matplotlib')

try:
    import sympy
    print('✅ SymPy found:', sympy.__version__)
except ImportError:
    missing.append('sympy')

try:
    import trimesh
    print('✅ Trimesh found (from Phase 5):', trimesh.__version__)
except ImportError:
    missing.append('trimesh')

# Optional dependencies
try:
    import pysr
    print('✅ PySR found:', pysr.__version__)
except ImportError:
    optional_missing.append('pysr')

try:
    import deepxde
    print('✅ DeepXDE found:', deepxde.__version__)
except ImportError:
    optional_missing.append('deepxde')

if missing:
    print('❌ Missing required dependencies:', ', '.join(missing))
    print('   Install with: pip install', ' '.join(missing))
    sys.exit(1)

if optional_missing:
    print('⚠️  Missing optional dependencies:', ', '.join(optional_missing))
    print('   For full functionality, install with: pip install', ' '.join(optional_missing))
    print('   Note: PySR requires Julia; DeepXDE provides advanced PINN features')

print('✅ All required ML dependencies satisfied')
"

if [ $? -ne 0 ]; then
    echo "❌ Python dependency check failed"
    exit 1
fi

# Check existing Phase 5 components
echo "🎨 Checking Phase 5 integration..."
if [ -f "packages/tools-plot/src/handlers.ts" ]; then
    if grep -q "plot_type.*volume_3d\|animation\|interactive" packages/tools-plot/src/handlers.ts; then
        echo "✅ Phase 5 advanced visualization tools found"
    else
        echo "⚠️  Phase 5 tools may not be fully integrated"
    fi
else
    echo "❌ Phase 5 plot handlers not found"
    exit 1
fi

echo ""
echo "🎉 Phase 6 Prerequisites Check Complete!"
echo "✅ Acceleration module ready"
echo "✅ Video encoding (ffmpeg) ready"
echo "✅ ML dependencies satisfied"
echo "✅ Phase 5 integration confirmed"
echo ""
echo "Ready to implement Phase 6: ML/AI Augmentation! 🚀"
