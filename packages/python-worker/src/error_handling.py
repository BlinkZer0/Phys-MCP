"""
Standardized error handling and observability for Phys-MCP
"""

import json
import logging
import traceback
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Union, List
from pathlib import Path
import os

# Configure structured logging
class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured JSON logs"""
    
    def format(self, record):
        log_entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add extra fields if present
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
        if hasattr(record, 'tool_name'):
            log_entry['tool_name'] = record.tool_name
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        if hasattr(record, 'session_id'):
            log_entry['session_id'] = record.session_id
        if hasattr(record, 'duration_ms'):
            log_entry['duration_ms'] = record.duration_ms
        if hasattr(record, 'error_code'):
            log_entry['error_code'] = record.error_code
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = {
                'type': record.exc_info[0].__name__,
                'message': str(record.exc_info[1]),
                'traceback': traceback.format_exception(*record.exc_info)
            }
        
        # Redact large payloads unless in debug mode
        if hasattr(record, 'payload'):
            if os.getenv('DEBUG_VERBOSE') == '1':
                log_entry['payload'] = record.payload
            else:
                log_entry['payload'] = '[redacted]'
        
        return json.dumps(log_entry)

# Setup logger
def setup_logger(name: str = 'phys-mcp') -> logging.Logger:
    """Setup structured logger"""
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(StructuredFormatter())
        logger.addHandler(handler)
        
        # Set log level from environment
        log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
        logger.setLevel(getattr(logging, log_level, logging.INFO))
    
    return logger

# Global logger instance
logger = setup_logger()

class PhysicsError(Exception):
    """Base exception class for Phys-MCP with standardized error format"""
    
    def __init__(
        self,
        message: str,
        code: str = 'PHYSICS_ERROR',
        hint: Optional[str] = None,
        cause: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.hint = hint
        self.cause = cause
        self.details = details or {}
        self.request_id = request_id
        self.timestamp = datetime.now(timezone.utc).isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert error to standardized dictionary format"""
        error_dict = {
            'code': self.code,
            'message': self.message,
            'timestamp': self.timestamp
        }
        
        if self.hint:
            error_dict['hint'] = self.hint
        if self.cause:
            error_dict['cause'] = self.cause
        if self.details:
            error_dict['details'] = self.details
        if self.request_id:
            error_dict['request_id'] = self.request_id
        
        return error_dict
    
    def log_error(self, logger_instance: Optional[logging.Logger] = None):
        """Log the error with structured format"""
        log = logger_instance or logger
        log.error(
            self.message,
            extra={
                'error_code': self.code,
                'request_id': self.request_id,
                'tool_name': self.details.get('tool_name'),
                'payload': self.details.get('input_data')
            },
            exc_info=True
        )

class ValidationError(PhysicsError):
    """Input validation error"""
    
    def __init__(self, message: str, hint: Optional[str] = None, details: Optional[Dict] = None):
        super().__init__(
            message=message,
            code='VALIDATION_ERROR',
            hint=hint or 'Please check your input parameters and try again',
            details=details
        )

class ComputationError(PhysicsError):
    """Computation or calculation error"""
    
    def __init__(self, message: str, hint: Optional[str] = None, cause: Optional[str] = None, details: Optional[Dict] = None):
        super().__init__(
            message=message,
            code='COMPUTATION_ERROR',
            hint=hint or 'Check input values and mathematical validity',
            cause=cause,
            details=details
        )

class UnitsError(PhysicsError):
    """Units-related error"""
    
    def __init__(self, message: str, hint: Optional[str] = None, details: Optional[Dict] = None):
        super().__init__(
            message=message,
            code='UNITS_ERROR',
            hint=hint or 'Check unit compatibility and spelling',
            details=details
        )

class ResourceError(PhysicsError):
    """Resource availability error (GPU, memory, etc.)"""
    
    def __init__(self, message: str, hint: Optional[str] = None, details: Optional[Dict] = None):
        super().__init__(
            message=message,
            code='RESOURCE_ERROR',
            hint=hint or 'Try reducing problem size or using CPU fallback',
            details=details
        )

class ConfigurationError(PhysicsError):
    """Configuration or setup error"""
    
    def __init__(self, message: str, hint: Optional[str] = None, details: Optional[Dict] = None):
        super().__init__(
            message=message,
            code='CONFIGURATION_ERROR',
            hint=hint or 'Check environment variables and configuration files',
            details=details
        )

def generate_request_id() -> str:
    """Generate unique request ID"""
    return str(uuid.uuid4())

def log_tool_call(
    tool_name: str,
    parameters: Dict[str, Any],
    request_id: Optional[str] = None,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None
):
    """Log tool call with structured format"""
    logger.info(
        f"Tool call: {tool_name}",
        extra={
            'tool_name': tool_name,
            'request_id': request_id,
            'user_id': user_id,
            'session_id': session_id,
            'payload': parameters
        }
    )

def log_tool_result(
    tool_name: str,
    success: bool,
    duration_ms: float,
    request_id: Optional[str] = None,
    error: Optional[Exception] = None,
    result_size: Optional[int] = None
):
    """Log tool result with performance metrics"""
    level = logging.INFO if success else logging.ERROR
    message = f"Tool {tool_name} {'completed' if success else 'failed'} in {duration_ms:.1f}ms"
    
    extra = {
        'tool_name': tool_name,
        'request_id': request_id,
        'duration_ms': duration_ms,
        'success': success
    }
    
    if result_size:
        extra['result_size_bytes'] = result_size
    
    if error:
        extra['error_type'] = type(error).__name__
        extra['error_message'] = str(error)
    
    logger.log(level, message, extra=extra)

def log_performance_metric(
    metric_name: str,
    value: Union[int, float],
    unit: str = '',
    tool_name: Optional[str] = None,
    request_id: Optional[str] = None,
    tags: Optional[Dict[str, str]] = None
):
    """Log performance metric"""
    logger.info(
        f"Performance metric: {metric_name} = {value} {unit}",
        extra={
            'metric_name': metric_name,
            'metric_value': value,
            'metric_unit': unit,
            'tool_name': tool_name,
            'request_id': request_id,
            'tags': tags or {}
        }
    )

def wrap_tool_execution(func):
    """Decorator to wrap tool execution with error handling and logging"""
    def wrapper(*args, **kwargs):
        request_id = generate_request_id()
        tool_name = func.__name__.replace('handle_', '').replace('_', ' ').title()
        start_time = datetime.now()
        
        try:
            # Log tool call
            log_tool_call(
                tool_name=tool_name,
                parameters=kwargs,
                request_id=request_id
            )
            
            # Execute tool
            result = func(*args, **kwargs)
            
            # Calculate duration
            duration_ms = (datetime.now() - start_time).total_seconds() * 1000
            
            # Log success
            log_tool_result(
                tool_name=tool_name,
                success=True,
                duration_ms=duration_ms,
                request_id=request_id,
                result_size=len(str(result)) if result else 0
            )
            
            return result
            
        except Exception as e:
            # Calculate duration
            duration_ms = (datetime.now() - start_time).total_seconds() * 1000
            
            # Convert to standardized error if needed
            if not isinstance(e, PhysicsError):
                if 'validation' in str(e).lower() or 'invalid' in str(e).lower():
                    error = ValidationError(
                        message=str(e),
                        details={'tool_name': tool_name, 'input_data': kwargs}
                    )
                elif 'unit' in str(e).lower():
                    error = UnitsError(
                        message=str(e),
                        details={'tool_name': tool_name}
                    )
                elif 'memory' in str(e).lower() or 'gpu' in str(e).lower():
                    error = ResourceError(
                        message=str(e),
                        details={'tool_name': tool_name}
                    )
                else:
                    error = ComputationError(
                        message=str(e),
                        cause=str(type(e).__name__),
                        details={'tool_name': tool_name}
                    )
            else:
                error = e
            
            error.request_id = request_id
            
            # Log error
            error.log_error()
            log_tool_result(
                tool_name=tool_name,
                success=False,
                duration_ms=duration_ms,
                request_id=request_id,
                error=error
            )
            
            # Re-raise as standardized error
            raise error
    
    return wrapper

def create_error_response(error: Exception, tool_name: str) -> Dict[str, Any]:
    """Create standardized error response"""
    if isinstance(error, PhysicsError):
        return {
            'success': False,
            'error': error.to_dict(),
            'tool': tool_name
        }
    else:
        # Convert generic exception to PhysicsError
        physics_error = ComputationError(
            message=str(error),
            cause=type(error).__name__,
            details={'tool_name': tool_name}
        )
        return {
            'success': False,
            'error': physics_error.to_dict(),
            'tool': tool_name
        }

def log_system_info():
    """Log system information for debugging"""
    import platform
    import psutil
    
    try:
        system_info = {
            'platform': platform.platform(),
            'python_version': platform.python_version(),
            'cpu_count': psutil.cpu_count(),
            'memory_total_gb': round(psutil.virtual_memory().total / (1024**3), 2),
            'memory_available_gb': round(psutil.virtual_memory().available / (1024**3), 2)
        }
        
        # GPU info if available
        try:
            import torch
            if torch.cuda.is_available():
                system_info['gpu_count'] = torch.cuda.device_count()
                system_info['gpu_name'] = torch.cuda.get_device_name(0)
                system_info['gpu_memory_gb'] = round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2)
        except ImportError:
            pass
        
        logger.info("System information", extra={'system_info': system_info})
        
    except Exception as e:
        logger.warning(f"Failed to log system info: {e}")

def setup_error_monitoring():
    """Setup error monitoring and alerting"""
    # Log system info on startup
    log_system_info()
    
    # Setup error tracking
    logger.info("Error monitoring initialized")

# Initialize error monitoring
setup_error_monitoring()
