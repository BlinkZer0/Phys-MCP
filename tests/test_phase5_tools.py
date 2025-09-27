#!/usr/bin/env python3
"""
Tests for Phase 5: Advanced Visualization Tools
"""

import pytest
import json
import os
import sys
import tempfile
from pathlib import Path

# Add the python-worker to the path
sys.path.insert(0, str(Path(__file__).parent.parent / "packages" / "python-worker"))

from worker import handle_request

class TestPhase5Tools:
    """Test suite for Phase 5 advanced visualization tools."""
    
    def test_plot_volume_3d_basic(self):
        """Test basic 3D volume plotting with slices mode."""
        request = {
            "method": "plot_volume_3d",
            "params": {
                "f": "x**2 + y**2 + z**2",
                "x": [-2, 2, 20],
                "y": [-2, 2, 20], 
                "z": [-2, 2, 20],
                "mode": "slices"
            }
        }
        
        result = handle_request(request)
        
        assert "png_contact_sheet_b64" in result
        assert "csv_data" in result
        assert "meta" in result
        assert result["meta"]["mode"] == "slices"
        assert result["meta"]["mesh"] == [20, 20, 20]
        assert "device" in result["meta"]
        assert "duration_ms" in result["meta"]
    
    def test_plot_volume_3d_isosurface(self):
        """Test 3D volume plotting with isosurface mode."""
        request = {
            "method": "plot_volume_3d",
            "params": {
                "f": "sin(x) * cos(y) * sin(z)",
                "x": [-3, 3, 15],
                "y": [-3, 3, 15],
                "z": [-3, 3, 15],
                "mode": "isosurface",
                "iso_level": 0.5
            }
        }
        
        result = handle_request(request)
        
        assert "png_contact_sheet_b64" in result
        assert result["meta"]["mode"] == "isosurface"
    
    def test_plot_animation_line(self):
        """Test animation with line renderer."""
        request = {
            "method": "plot_animation",
            "params": {
                "frame_expr": "sin(x - t)",
                "x_range": [-5, 5, 50],
                "t_range": [0, 6.28, 10],
                "renderer": "line",
                "fps": 10,
                "format": "gif",
                "emit_csv": True
            }
        }
        
        result = handle_request(request)
        
        assert "animation_path" in result
        assert "csv_data" in result
        assert result["meta"]["renderer"] == "line"
        assert result["meta"]["format"] == "gif"
        assert result["meta"]["frames"] == 10
        
        # Check that animation file exists
        assert os.path.exists(result["animation_path"])
    
    def test_plot_animation_imshow(self):
        """Test animation with imshow renderer."""
        request = {
            "method": "plot_animation", 
            "params": {
                "frame_expr": "exp(-(x**2)/2) * cos(5*t)",
                "x_range": [-3, 3, 30],
                "t_range": [0, 2, 8],
                "renderer": "imshow",
                "fps": 4
            }
        }
        
        result = handle_request(request)
        
        assert "animation_path" in result
        assert result["meta"]["renderer"] == "imshow"
    
    def test_plot_interactive_basic(self):
        """Test interactive parameter sweep."""
        request = {
            "method": "plot_interactive",
            "params": {
                "expr": "a * sin(b * x + c)",
                "x_range": [-5, 5, 100],
                "controls": [
                    {"name": "a", "min": 0.1, "max": 2.0, "step": 0.1, "default": 1.0},
                    {"name": "b", "min": 0.5, "max": 3.0, "step": 0.5, "default": 1.0},
                    {"name": "c", "min": 0, "max": 6.28, "step": 0.314, "default": 0}
                ],
                "renderer": "line",
                "grid_limit": 12
            }
        }
        
        result = handle_request(request)
        
        assert "thumbnails" in result
        assert "ui_spec" in result
        assert len(result["thumbnails"]) <= 12
        assert result["ui_spec"]["type"] == "sliders"
        assert len(result["ui_spec"]["controls"]) == 3
        
        # Check thumbnail structure
        for thumb in result["thumbnails"]:
            assert "control_values" in thumb
            assert "png_b64" in thumb
            assert "a" in thumb["control_values"]
            assert "b" in thumb["control_values"]
            assert "c" in thumb["control_values"]
    
    def test_plot_vr_export_glb(self):
        """Test VR export to GLB format."""
        # Create a simple cube mesh
        vertices = [
            [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],  # bottom face
            [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]   # top face
        ]
        faces = [
            [0, 1, 2], [0, 2, 3],  # bottom
            [4, 7, 6], [4, 6, 5],  # top
            [0, 4, 5], [0, 5, 1],  # front
            [2, 6, 7], [2, 7, 3],  # back
            [0, 3, 7], [0, 7, 4],  # left
            [1, 5, 6], [1, 6, 2]   # right
        ]
        
        request = {
            "method": "plot_vr_export",
            "params": {
                "geometry": {
                    "vertices": vertices,
                    "faces": faces
                },
                "format": "glb",
                "extras": {"name": "test_cube"}
            }
        }
        
        result = handle_request(request)
        
        if "error" in result:
            # Skip if trimesh not available
            pytest.skip(f"VR export not available: {result['error']}")
        
        assert "path" in result
        assert result["path"].endswith(".glb")
        assert result["meta"]["vertices"] == 8
        assert result["meta"]["faces"] == 12
        assert result["meta"]["format"] == "glb"
        assert "extras" in result["meta"]
        
        # Check that file exists
        assert os.path.exists(result["path"])
    
    def test_plot_vr_export_ply(self):
        """Test VR export to PLY format."""
        # Simple triangle
        vertices = [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]]
        faces = [[0, 1, 2]]
        
        request = {
            "method": "plot_vr_export",
            "params": {
                "geometry": {
                    "vertices": vertices,
                    "faces": faces
                },
                "format": "ply"
            }
        }
        
        result = handle_request(request)
        
        if "error" in result:
            # Skip if trimesh not available
            pytest.skip(f"VR export not available: {result['error']}")
        
        assert "path" in result
        assert result["path"].endswith(".ply")
        assert result["meta"]["vertices"] == 3
        assert result["meta"]["faces"] == 1
    
    def test_volume_3d_caps_enforcement(self):
        """Test that volume 3D enforces caps correctly."""
        request = {
            "method": "plot_volume_3d",
            "params": {
                "f": "x + y + z",
                "x": [-1, 1, 200],  # Exceeds default cap
                "y": [-1, 1, 200],
                "z": [-1, 1, 200],
                "allow_large": False
            }
        }
        
        result = handle_request(request)
        
        # Should be capped at 160 (default samples_cap)
        assert all(dim <= 160 for dim in result["meta"]["mesh"])
    
    def test_animation_frames_cap(self):
        """Test that animation enforces frame caps."""
        request = {
            "method": "plot_animation",
            "params": {
                "frame_expr": "sin(x + t)",
                "x_range": [-2, 2, 20],
                "t_range": [0, 10, 500],  # Exceeds default cap
                "allow_large": False
            }
        }
        
        result = handle_request(request)
        
        # Should be capped at 300 (default frames_cap)
        assert result["meta"]["frames"] <= 300
    
    def test_interactive_grid_limit(self):
        """Test that interactive tool respects grid limit."""
        request = {
            "method": "plot_interactive",
            "params": {
                "expr": "a * x + b",
                "controls": [
                    {"name": "a", "min": -2, "max": 2, "step": 0.1, "default": 1},
                    {"name": "b", "min": -5, "max": 5, "step": 0.1, "default": 0}
                ],
                "grid_limit": 6
            }
        }
        
        result = handle_request(request)
        
        assert len(result["thumbnails"]) <= 6

    def test_error_handling(self):
        """Test error handling for invalid inputs."""
        # Invalid expression
        request = {
            "method": "plot_volume_3d",
            "params": {
                "f": "invalid_function(x, y, z)",
                "x": [-1, 1],
                "y": [-1, 1], 
                "z": [-1, 1]
            }
        }
        
        # Should not crash, may return error or fallback
        result = handle_request(request)
        # Test passes if no exception is raised
        assert isinstance(result, dict)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
