/**
 * Shared Test Harness for Phys-MCP Tools
 * Provides mocking utilities and common test patterns
 */

const { jest } = require('@jest/globals');

// Mock worker client for testing tool handlers
const createMockWorkerClient = (mockResponses = {}) => {
  return {
    call: jest.fn().mockImplementation((method, params) => {
      if (mockResponses[method]) {
        return Promise.resolve(mockResponses[method]);
      }
      return Promise.resolve({ success: true, result: 'mock_result' });
    })
  };
};

// Common test fixtures
const fixtures = {
  cas: {
    basicArithmetic: {
      input: { action: 'evaluate', expr: '2 + 3 * 4' },
      expected: { success: true, result: 14 }
    },
    differentiation: {
      input: { action: 'diff', expr: 'x^2', symbol: 'x' },
      expected: { success: true, result: '2*x' }
    },
    integration: {
      input: { action: 'integrate', expr: '2*x + 3', symbol: 'x' },
      expected: { success: true, result: 'x**2 + 3*x' }
    }
  },
  plot: {
    function2d: {
      input: { plot_type: 'function_2d', function: 'x^2', x_range: [-5, 5] },
      expected: { success: true, plot_path: 'artifacts/plot_123.png' }
    },
    surface3d: {
      input: { plot_type: 'surface_3d', function: 'x^2 + y^2', x_range: [-2, 2], y_range: [-2, 2] },
      expected: { success: true, plot_path: 'artifacts/surface_123.png' }
    }
  },
  quantum: {
    blochSphere: {
      input: { action: 'visualize', state: [1, 0], kind: 'bloch_sphere' },
      expected: { success: true, plot_path: 'artifacts/bloch_123.png' }
    }
  },
  data: {
    fft: {
      input: { action: 'fft', signal_data: [1, 2, 3, 4], sample_rate: 1000 },
      expected: { success: true, frequencies: [0, 250, 500, 750], magnitudes: [10, 2, 2, 2] }
    }
  }
};

// Test utilities
const testUtils = {
  // Validate tool response structure
  validateToolResponse: (response) => {
    expect(response).toHaveProperty('success');
    if (response.success) {
      expect(response).toHaveProperty('result');
    } else {
      expect(response).toHaveProperty('error');
    }
  },

  // Mock file system operations
  mockFileSystem: () => {
    const fs = require('fs');
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockReturnValue('mock file content');
  },

  // Generate test artifacts directory
  setupArtifactsDir: () => {
    const path = require('path');
    const artifactsDir = path.join(__dirname, '../../artifacts/test');
    return artifactsDir;
  }
};

module.exports = {
  createMockWorkerClient,
  fixtures,
  testUtils
};
