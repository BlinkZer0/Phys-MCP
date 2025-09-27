#!/usr/bin/env python3
"""
Basic Phase 6 ML/AI Augmentation Test
Tests the symbolic regression functionality with synthetic data
"""

import numpy as np
import json
import sys
import os
from pathlib import Path

# Add the python-worker to path
sys.path.insert(0, str(Path(__file__).parent / "packages" / "python-worker"))

def test_symbolic_regression_basic():
    """Test basic symbolic regression with synthetic data"""
    print("🧠 Testing Phase 6: Symbolic Regression")
    
    try:
        # Import ML module
        import ml_augmentation
        
        # Create synthetic data: y = 2*x + 1 + noise
        np.random.seed(42)
        X = np.linspace(-5, 5, 50).reshape(-1, 1)
        y = 2 * X.flatten() + 1 + 0.1 * np.random.randn(50)
        
        # Save data to temporary files
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            np.savetxt(f, X, delimiter=',')
            X_path = f.name
            
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            np.savetxt(f, y, delimiter=',')
            y_path = f.name
        
        # Test parameters
        params = {
            'method': 'symbolic_regression_train',
            'X': X_path,
            'y': y_path,
            'ops': ['+', '-', '*'],
            'max_depth': 3,
            'pop_size': 100,
            'trials': 1,
            'use_pysr': False  # Use fallback method for testing
        }
        
        # Load config
        config = {
            "ml": {
                "default_backend": "torch",
                "max_vram_mb": 4096,
                "train": {"epochs": 200, "early_stop_patience": 20, "batch_size": 64, "lr": 1e-3}
            }
        }
        
        # Run symbolic regression
        result = ml_augmentation.ml_symbolic_regression(params, config)
        
        # Verify result structure
        assert 'expression_sympy' in result
        assert 'expression_latex' in result
        assert 'overlay_png_b64' in result
        assert 'residuals_png_b64' in result
        assert 'csv_prediction_path' in result
        assert 'meta' in result
        
        print(f"✅ Found expression: {result['expression_sympy']}")
        print(f"✅ R² score: {result['meta'].get('r2_score', 'N/A')}")
        print(f"✅ Device used: {result['meta']['device']}")
        print(f"✅ Duration: {result['meta']['duration_ms']}ms")
        
        # Cleanup
        os.unlink(X_path)
        os.unlink(y_path)
        
        return True
        
    except Exception as e:
        print(f"❌ Symbolic regression test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_ml_device_setup():
    """Test ML device setup and configuration"""
    print("🔧 Testing ML Device Setup")
    
    try:
        import ml_augmentation
        
        config = {
            "ml": {
                "default_backend": "torch",
                "max_vram_mb": 4096
            }
        }
        
        ml = ml_augmentation.MLAugmentation(config)
        print(f"✅ ML device initialized: {ml.device}")
        
        # Test memory estimation
        memory_usage = ml._estimate_memory_usage(64, 1000000)
        print(f"✅ Memory estimation working: {memory_usage // 1024 // 1024}MB for batch_size=64")
        
        # Test batch size adjustment
        adjusted_batch = ml._adjust_batch_size(1024, 10000000)
        print(f"✅ Batch size adjustment: 1024 -> {adjusted_batch}")
        
        return True
        
    except Exception as e:
        print(f"❌ ML device setup test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run basic Phase 6 tests"""
    print("🚀 Phase 6: ML/AI Augmentation Basic Tests")
    print("=" * 50)
    
    tests = [
        test_ml_device_setup,
        test_symbolic_regression_basic,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
            print()
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
            print()
    
    print(f"📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All basic Phase 6 tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed - check implementation")
        return 1

if __name__ == "__main__":
    sys.exit(main())
