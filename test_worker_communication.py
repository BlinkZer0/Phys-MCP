#!/usr/bin/env python3
"""
Test Python worker communication
"""

import sys
import os
import json

# Add the python-worker directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'packages', 'python-worker'))

from worker import handle_request

def test_worker_communication():
    """Test worker communication with a simple message"""
    print("🔬 Testing Python Worker Communication")
    print("="*50)
    
    # Test with quantum operation
    message = {
        "method": "quantum_ops",
        "params": {
            "operators": ["X", "Y"],
            "task": "commutator"
        }
    }
    
    try:
        result = handle_request(message)
        print("✅ Quantum operation successful")
        print(f"Result: {result}")
        return True
    except Exception as e:
        print(f"❌ Quantum operation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_worker_communication()
    sys.exit(0 if success else 1)
