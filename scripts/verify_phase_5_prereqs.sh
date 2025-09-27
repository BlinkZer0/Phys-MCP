#!/bin/bash
# Preflight script for Phase 5: Advanced Visualization
# Verifies prerequisites for GPU acceleration and multimedia encoding

set -e

echo "🔍 Phase 5 Prerequisites Check"
echo "==============================="

# Check Python environment
echo "📦 Checking Python environment..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo "✅ Python $PYTHON_VERSION found"

# Check acceleration layer
echo "🚀 Checking acceleration layer..."
if [ ! -f "packages/python-worker/accel.py" ]; then
    echo "❌ Acceleration layer not found at packages/python-worker/accel.py"
    exit 1
fi
echo "✅ Acceleration layer present"

# Test device detection
echo "🎯 Testing device detection..."
cd packages/python-worker
python3 -c "
import sys
sys.path.insert(0, '.')
from accel import accel_init, accel_caps
caps = accel_init()
print(f'Device: {caps[\"device\"]}')
print(f'Active: {caps[\"active\"]}')
print(f'Mode: {caps[\"mode\"]}')
print(f'Has PyTorch: {caps[\"has_torch\"]}')
"
cd ../..

# Check FFmpeg availability
echo "🎬 Checking FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg not found - animations will be disabled"
    echo "   Install with: apt-get install ffmpeg (Ubuntu) or brew install ffmpeg (macOS)"
else
    FFMPEG_VERSION=$(ffmpeg -version | head -n1 | cut -d' ' -f3)
    echo "✅ FFmpeg $FFMPEG_VERSION found"
    
    # Check for required codecs
    echo "🔧 Checking codecs..."
    if ffmpeg -codecs 2>/dev/null | grep -q "libx264"; then
        echo "✅ H.264 codec (libx264) available"
    else
        echo "⚠️  H.264 codec (libx264) not available"
    fi
    
    if ffmpeg -codecs 2>/dev/null | grep -q "libvpx-vp9"; then
        echo "✅ VP9 codec (libvpx-vp9) available"
    else
        echo "⚠️  VP9 codec (libvpx-vp9) not available"
    fi
fi

# Check 3D export libraries
echo "🎲 Checking 3D export libraries..."
cd packages/python-worker
python3 -c "
try:
    import trimesh
    print('✅ trimesh available for GLB/PLY export')
    print(f'   Version: {trimesh.__version__}')
except ImportError:
    print('❌ trimesh not found - install with: pip install trimesh')
    exit(1)

try:
    import trimesh.exchange.gltf
    print('✅ glTF export support available')
except ImportError:
    print('⚠️  glTF export may be limited')

try:
    import trimesh.exchange.ply
    print('✅ PLY export support available')
except ImportError:
    print('⚠️  PLY export may be limited')
"
cd ../..

echo ""
echo "🎉 Phase 5 prerequisites check complete!"
echo "   Ready to implement advanced visualization tools"
