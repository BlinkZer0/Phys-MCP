"""
Tests for error handling and observability
"""

import pytest
import sys
import os
import json
from unittest.mock import patch, MagicMock

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from error_handling import (
    PhysicsError, ValidationError, ComputationError, UnitsError, ResourceError,
    wrap_tool_execution, create_error_response, generate_request_id
)

class TestPhysicsError:
    """Test PhysicsError base class"""
    
    def test_basic_error_creation(self):
        """Test basic error creation"""
        error = PhysicsError(
            message="Test error",
            code="TEST_ERROR",
            hint="This is a test"
        )
        
        assert error.message == "Test error"
        assert error.code == "TEST_ERROR"
        assert error.hint == "This is a test"
        assert error.cause is None
        assert error.details == {}
    
    def test_error_to_dict(self):
        """Test error serialization"""
        error = PhysicsError(
            message="Test error",
            code="TEST_ERROR",
            hint="This is a test",
            cause="ValueError",
            details={"tool": "test_tool"}
        )
        
        error_dict = error.to_dict()
        
        assert error_dict['code'] == "TEST_ERROR"
        assert error_dict['message'] == "Test error"
        assert error_dict['hint'] == "This is a test"
        assert error_dict['cause'] == "ValueError"
        assert error_dict['details'] == {"tool": "test_tool"}
        assert 'timestamp' in error_dict

class TestSpecificErrors:
    """Test specific error types"""
    
    def test_validation_error(self):
        """Test ValidationError"""
        error = ValidationError("Invalid input", hint="Check parameters")
        
        assert error.code == "VALIDATION_ERROR"
        assert error.message == "Invalid input"
        assert error.hint == "Check parameters"
    
    def test_computation_error(self):
        """Test ComputationError"""
        error = ComputationError(
            "Calculation failed",
            hint="Check input values",
            cause="ZeroDivisionError"
        )
        
        assert error.code == "COMPUTATION_ERROR"
        assert error.message == "Calculation failed"
        assert error.hint == "Check input values"
        assert error.cause == "ZeroDivisionError"
    
    def test_units_error(self):
        """Test UnitsError"""
        error = UnitsError("Invalid unit", hint="Check unit spelling")
        
        assert error.code == "UNITS_ERROR"
        assert error.message == "Invalid unit"
        assert error.hint == "Check unit spelling"
    
    def test_resource_error(self):
        """Test ResourceError"""
        error = ResourceError("GPU out of memory", hint="Reduce batch size")
        
        assert error.code == "RESOURCE_ERROR"
        assert error.message == "GPU out of memory"
        assert error.hint == "Reduce batch size"

class TestErrorHandling:
    """Test error handling utilities"""
    
    def test_generate_request_id(self):
        """Test request ID generation"""
        request_id = generate_request_id()
        
        assert isinstance(request_id, str)
        assert len(request_id) == 36  # UUID4 format
        assert request_id.count('-') == 4
    
    def test_create_error_response(self):
        """Test error response creation"""
        error = ValidationError("Test error")
        response = create_error_response(error, "test_tool")
        
        assert response['success'] is False
        assert response['tool'] == "test_tool"
        assert 'error' in response
        assert response['error']['code'] == "VALIDATION_ERROR"
    
    def test_create_error_response_generic(self):
        """Test error response for generic exceptions"""
        error = ValueError("Generic error")
        response = create_error_response(error, "test_tool")
        
        assert response['success'] is False
        assert response['tool'] == "test_tool"
        assert response['error']['code'] == "COMPUTATION_ERROR"
        assert response['error']['cause'] == "ValueError"

class TestWrapToolExecution:
    """Test tool execution wrapper"""
    
    def test_successful_execution(self):
        """Test successful tool execution"""
        @wrap_tool_execution
        def test_tool(x, y):
            return x + y
        
        result = test_tool(2, 3)
        assert result == 5
    
    def test_validation_error_conversion(self):
        """Test automatic validation error conversion"""
        @wrap_tool_execution
        def test_tool():
            raise ValueError("Invalid input parameter")
        
        with pytest.raises(ValidationError) as exc_info:
            test_tool()
        
        assert exc_info.value.code == "VALIDATION_ERROR"
        assert "Invalid input parameter" in exc_info.value.message
    
    def test_units_error_conversion(self):
        """Test automatic units error conversion"""
        @wrap_tool_execution
        def test_tool():
            raise ValueError("Unknown unit 'xyz'")
        
        with pytest.raises(UnitsError) as exc_info:
            test_tool()
        
        assert exc_info.value.code == "UNITS_ERROR"
    
    def test_resource_error_conversion(self):
        """Test automatic resource error conversion"""
        @wrap_tool_execution
        def test_tool():
            raise RuntimeError("CUDA out of memory")
        
        with pytest.raises(ResourceError) as exc_info:
            test_tool()
        
        assert exc_info.value.code == "RESOURCE_ERROR"
    
    def test_physics_error_passthrough(self):
        """Test that PhysicsError instances pass through unchanged"""
        @wrap_tool_execution
        def test_tool():
            raise ValidationError("Custom validation error")
        
        with pytest.raises(ValidationError) as exc_info:
            test_tool()
        
        assert exc_info.value.message == "Custom validation error"
        assert exc_info.value.code == "VALIDATION_ERROR"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
