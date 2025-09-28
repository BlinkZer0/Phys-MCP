const { createMockWorkerClient, fixtures, testUtils } = require('../../../tests/shared/test-harness');
const { handlePlotTool } = require('../dist');

// Mock the worker client
jest.mock('../../tools-cas/dist/worker-client.js', () => ({
  getWorkerClient: () => createMockWorkerClient({
    'plot_function_2d': { success: true, plot_path: 'artifacts/plot_123.png' },
    'plot_surface_3d': { success: true, plot_path: 'artifacts/surface_123.png' },
    'plot_contour_2d': { success: true, plot_path: 'artifacts/contour_123.png' },
    'plot_animation': { success: true, plot_path: 'artifacts/animation_123.mp4' }
  })
}));

describe('Plot Tool - Comprehensive Test Suite', () => {
  beforeEach(() => {
    testUtils.mockFileSystem();
  });

  describe('2D Function Plotting', () => {
    test('Basic function plot: y = x^2', async () => {
      const result = await handlePlotTool('plot', { 
        plot_type: 'function_2d', 
        function: 'x^2', 
        x_range: [-5, 5] 
      });
      testUtils.validateToolResponse(result);
      expect(result.plot_path).toContain('artifacts/');
      expect(result.plot_path).toMatch(/\.(png|jpg|svg)$/);
    });

    test('Trigonometric function: y = sin(x)', async () => {
      const mockClient = createMockWorkerClient({ 
        'plot_function_2d': { success: true, plot_path: 'artifacts/sin_plot.png' } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handlePlotTool('plot', { 
        plot_type: 'function_2d', 
        function: 'sin(x)', 
        x_range: [-10, 10] 
      });
      expect(result.success).toBe(true);
      expect(result.plot_path).toBeDefined();
    });

    test('Multiple functions on same plot', async () => {
      const mockClient = createMockWorkerClient({ 
        'plot_function_2d': { success: true, plot_path: 'artifacts/multi_plot.png' } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handlePlotTool('plot', { 
        plot_type: 'function_2d', 
        functions: ['x^2', 'x^3', 'sin(x)'], 
        x_range: [-3, 3] 
      });
      expect(result.success).toBe(true);
    });
  });

  describe('3D Surface Plotting', () => {
    test('Basic surface plot: z = x^2 + y^2', async () => {
      const result = await handlePlotTool('plot', { 
        plot_type: 'surface_3d', 
        function: 'x^2 + y^2', 
        x_range: [-2, 2], 
        y_range: [-2, 2] 
      });
      testUtils.validateToolResponse(result);
      expect(result.plot_path).toContain('artifacts/');
    });

    test('Complex surface: z = sin(sqrt(x^2 + y^2))', async () => {
      const mockClient = createMockWorkerClient({ 
        'plot_surface_3d': { success: true, plot_path: 'artifacts/complex_surface.png' } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handlePlotTool('plot', { 
        plot_type: 'surface_3d', 
        function: 'sin(sqrt(x^2 + y^2))', 
        x_range: [-5, 5], 
        y_range: [-5, 5] 
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Parametric Plotting', () => {
    test('Parametric curve: circle', async () => {
      const mockClient = createMockWorkerClient({ 
        'plot_parametric_2d': { success: true, plot_path: 'artifacts/circle.png' } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handlePlotTool('plot', { 
        plot_type: 'parametric_2d', 
        x_expr: 'cos(t)', 
        y_expr: 'sin(t)', 
        t_range: [0, 6.28] 
      });
      expect(result.success).toBe(true);
    });

    test('Parametric curve: spiral', async () => {
      const mockClient = createMockWorkerClient({ 
        'plot_parametric_2d': { success: true, plot_path: 'artifacts/spiral.png' } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handlePlotTool('plot', { 
        plot_type: 'parametric_2d', 
        x_expr: 't*cos(t)', 
        y_expr: 't*sin(t)', 
        t_range: [0, 20] 
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Advanced Visualization', () => {
    test('Volume 3D rendering', async () => {
      const mockClient = createMockWorkerClient({ 
        'plot_volume_3d': { success: true, plot_path: 'artifacts/volume_123.png' } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handlePlotTool('plot', { 
        plot_type: 'volume_3d', 
        x: [1, 2, 3], 
        y: [1, 2, 3], 
        z: [1, 2, 3], 
        values: [0.1, 0.5, 0.9] 
      });
      expect(result.success).toBe(true);
    });

    test('Animation generation', async () => {
      const result = await handlePlotTool('plot', { 
        plot_type: 'animation', 
        frame_expr: 'sin(x + t)', 
        x_range: [-10, 10], 
        t_range: [0, 6.28], 
        frames: 30 
      });
      testUtils.validateToolResponse(result);
      expect(result.plot_path).toMatch(/\.(mp4|gif|webm)$/);
    });
  });

  describe('Error Handling', () => {
    test('Invalid function should return error', async () => {
      const mockClient = createMockWorkerClient({ 
        'plot_function_2d': { success: false, error: 'Invalid function syntax' } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handlePlotTool('plot', { 
        plot_type: 'function_2d', 
        function: 'invalid_func(', 
        x_range: [-5, 5] 
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('Missing required parameters should return error', async () => {
      const result = await handlePlotTool('plot', { plot_type: 'function_2d' }); // Missing function
      expect(result.success).toBe(false);
    });

    test('Invalid range should return error', async () => {
      const result = await handlePlotTool('plot', { 
        plot_type: 'function_2d', 
        function: 'x^2', 
        x_range: [5, -5] // Invalid range
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Plot Customization', () => {
    test('Custom styling options', async () => {
      const mockClient = createMockWorkerClient({ 
        'plot_function_2d': { success: true, plot_path: 'artifacts/styled_plot.png' } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handlePlotTool('plot', { 
        plot_type: 'function_2d', 
        function: 'x^2', 
        x_range: [-5, 5],
        title: 'Parabola',
        xlabel: 'x-axis',
        ylabel: 'y-axis',
        color: 'blue',
        linewidth: 2
      });
      expect(result.success).toBe(true);
    });

    test('High resolution output', async () => {
      const mockClient = createMockWorkerClient({ 
        'plot_function_2d': { success: true, plot_path: 'artifacts/hires_plot.png' } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handlePlotTool('plot', { 
        plot_type: 'function_2d', 
        function: 'sin(x)', 
        x_range: [-10, 10],
        dpi: 300,
        figsize: [12, 8]
      });
      expect(result.success).toBe(true);
    });
  });
});
