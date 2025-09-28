"""
Tests for performance enhancements
"""

import pytest
import numpy as np
import sys
import os
import tempfile
import shutil
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from performance import (
    with_cache, generate_cache_key, save_to_cache, load_from_cache,
    GPUFallback, ChunkedProcessor, optimize_fft, perf_monitor
)

class TestCaching:
    """Test caching functionality"""
    
    def setup_method(self):
        """Setup test environment"""
        self.temp_dir = Path(tempfile.mkdtemp())
        # Patch CACHE_DIR to use temp directory
        import performance
        self.original_cache_dir = performance.CACHE_DIR
        performance.CACHE_DIR = self.temp_dir
    
    def teardown_method(self):
        """Cleanup test environment"""
        shutil.rmtree(self.temp_dir)
        # Restore original cache dir
        import performance
        performance.CACHE_DIR = self.original_cache_dir
    
    def test_cache_key_generation(self):
        """Test cache key generation"""
        key1 = generate_cache_key("test_func", (1, 2), {"param": "value"})
        key2 = generate_cache_key("test_func", (1, 2), {"param": "value"})
        key3 = generate_cache_key("test_func", (1, 3), {"param": "value"})
        
        assert key1 == key2  # Same inputs should generate same key
        assert key1 != key3  # Different inputs should generate different keys
        assert len(key1) == 64  # SHA256 hash length
    
    def test_cache_save_load(self):
        """Test cache save and load operations"""
        test_data = {"result": 42, "message": "test"}
        cache_key = "test_key"
        
        # Save to cache
        success = save_to_cache(cache_key, test_data)
        assert success is True
        
        # Load from cache
        loaded_data = load_from_cache(cache_key)
        assert loaded_data == test_data
    
    def test_cache_decorator(self):
        """Test cache decorator functionality"""
        call_count = 0
        
        @with_cache(ttl_hours=1)
        def expensive_function(x, y):
            nonlocal call_count
            call_count += 1
            return x * y + call_count
        
        # First call should execute function
        result1 = expensive_function(2, 3)
        assert call_count == 1
        
        # Second call with same parameters should use cache
        result2 = expensive_function(2, 3)
        assert call_count == 1  # Function not called again
        assert result1 == result2
        
        # Different parameters should execute function
        result3 = expensive_function(3, 4)
        assert call_count == 2

class TestGPUFallback:
    """Test GPU fallback functionality"""
    
    def test_gpu_fallback_init(self):
        """Test GPU fallback initialization"""
        gpu_fallback = GPUFallback()
        
        # Should initialize without error
        assert hasattr(gpu_fallback, 'gpu_available')
        assert hasattr(gpu_fallback, 'gpu_memory_threshold')
    
    def test_get_device_cpu_fallback(self):
        """Test device selection with CPU fallback"""
        gpu_fallback = GPUFallback()
        
        # When GPU not preferred, should return CPU
        device = gpu_fallback.get_device(prefer_gpu=False)
        assert device == 'cpu'
    
    @patch('torch.cuda.is_available', return_value=False)
    def test_get_device_no_gpu(self, mock_cuda):
        """Test device selection when GPU not available"""
        gpu_fallback = GPUFallback()
        device = gpu_fallback.get_device(prefer_gpu=True)
        assert device == 'cpu'
    
    def test_with_fallback_success(self):
        """Test successful execution with fallback"""
        gpu_fallback = GPUFallback()
        
        def test_func(x, y, device='cpu'):
            if device == 'cuda':
                raise RuntimeError("CUDA error")
            return x + y
        
        result = gpu_fallback.with_fallback(test_func, 2, 3, prefer_gpu=False)
        assert result == 5
    
    def test_with_fallback_gpu_to_cpu(self):
        """Test GPU to CPU fallback"""
        gpu_fallback = GPUFallback()
        
        def test_func(x, y, device='cpu'):
            if device == 'cuda':
                raise RuntimeError("CUDA out of memory")
            return x + y
        
        # Should fallback to CPU if GPU fails
        with patch.object(gpu_fallback, 'get_device', return_value='cuda'):
            result = gpu_fallback.with_fallback(test_func, 2, 3, prefer_gpu=True)
            assert result == 5

class TestChunkedProcessor:
    """Test chunked processing functionality"""
    
    def test_chunk_size_calculation(self):
        """Test chunk size calculation"""
        processor = ChunkedProcessor(max_chunk_size=1000, max_memory_mb=10)
        
        # Small data should not be chunked
        chunk_size = processor.calculate_chunk_size(100, 8)
        assert chunk_size == 100
        
        # Large data should be chunked
        chunk_size = processor.calculate_chunk_size(1000000, 8)
        assert chunk_size < 1000000
        assert chunk_size <= processor.max_chunk_size
    
    def test_process_chunks_small_data(self):
        """Test processing small data (no chunking)"""
        processor = ChunkedProcessor()
        data = [1, 2, 3, 4, 5]
        
        def sum_processor(chunk):
            return sum(chunk)
        
        result = processor.process_chunks(data, sum_processor)
        assert result == 15
    
    def test_process_chunks_large_data(self):
        """Test processing large data with chunking"""
        processor = ChunkedProcessor(max_chunk_size=3)
        data = [1, 2, 3, 4, 5, 6, 7, 8]
        
        def sum_processor(chunk):
            return sum(chunk)
        
        def combine_sums(results):
            return sum(results)
        
        result = processor.process_chunks(data, sum_processor, combine_sums)
        assert result == 36  # Sum of 1+2+...+8
    
    def test_process_chunks_numpy_arrays(self):
        """Test processing numpy arrays"""
        processor = ChunkedProcessor(max_chunk_size=5)
        data = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        
        def square_processor(chunk):
            return chunk ** 2
        
        result = processor.process_chunks(data, square_processor)
        expected = np.array([1, 4, 9, 16, 25, 36, 49, 64, 81, 100])
        np.testing.assert_array_equal(result, expected)

class TestOptimizedFFT:
    """Test optimized FFT functionality"""
    
    def test_optimize_fft_basic(self):
        """Test basic FFT optimization"""
        # Create test signal
        t = np.linspace(0, 1, 1000, endpoint=False)
        signal = np.sin(2 * np.pi * 50 * t)  # 50 Hz sine wave
        sample_rate = 1000
        
        result = optimize_fft(signal, sample_rate)
        
        assert 'frequencies' in result
        assert 'amplitudes' in result
        assert 'phases' in result
        assert len(result['frequencies']) == len(signal)
        assert len(result['amplitudes']) == len(signal)
        assert len(result['phases']) == len(signal)
    
    def test_optimize_fft_large_signal(self):
        """Test FFT optimization with large signal (chunking)"""
        # Create large test signal
        t = np.linspace(0, 10, 100000, endpoint=False)
        signal = np.sin(2 * np.pi * 10 * t)  # 10 Hz sine wave
        sample_rate = 10000
        
        result = optimize_fft(signal, sample_rate)
        
        assert 'frequencies' in result
        assert 'amplitudes' in result
        assert 'phases' in result
        # Results should be reasonable
        assert len(result['frequencies']) > 0
        assert np.max(result['amplitudes']) > 0

class TestPerformanceMonitor:
    """Test performance monitoring"""
    
    def test_record_metric(self):
        """Test metric recording"""
        monitor = perf_monitor
        
        # Record a metric
        monitor.record_metric('test_metric', 100.5, 'ms', {'tool': 'test'})
        
        # Check if metric was recorded
        stats = monitor.get_stats('test_metric')
        assert stats['count'] == 1
        assert stats['mean'] == 100.5
        assert stats['min'] == 100.5
        assert stats['max'] == 100.5
    
    def test_get_stats(self):
        """Test statistics calculation"""
        monitor = perf_monitor
        
        # Record multiple metrics
        values = [10, 20, 30, 40, 50]
        for value in values:
            monitor.record_metric('test_stats', value, 'ms')
        
        stats = monitor.get_stats('test_stats')
        assert stats['count'] >= len(values)  # May include previous test data
        assert stats['mean'] >= 0
        assert stats['min'] >= 0
        assert stats['max'] >= 0
        assert stats['std'] >= 0
    
    def test_get_all_stats(self):
        """Test getting all statistics"""
        monitor = perf_monitor
        
        # Record metrics for different tools
        monitor.record_metric('tool_a', 100, 'ms')
        monitor.record_metric('tool_b', 200, 'ms')
        
        all_stats = monitor.get_all_stats()
        assert isinstance(all_stats, dict)
        assert len(all_stats) >= 2

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
