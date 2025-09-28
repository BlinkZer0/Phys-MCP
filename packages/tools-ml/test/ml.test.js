const { createMockWorkerClient, fixtures, testUtils } = require('../../../tests/shared/test-harness');
const { handleMLAugmentationTool } = require('../dist');

// Mock the worker client
jest.mock('../../tools-cas/dist/worker-client.js', () => ({
  getWorkerClient: () => createMockWorkerClient({
    'ml_symbolic_regression': { 
      success: true, 
      expression_sympy: '2*x + 1',
      r_squared: 0.9997,
      mse: 0.001,
      plot_path: 'artifacts/regression_plot.png'
    },
    'ml_surrogate_pde': { 
      success: true, 
      model_path: 'artifacts/pde_model.pth',
      training_loss: 0.001,
      validation_loss: 0.002
    },
    'ml_pattern_recognition': { 
      success: true, 
      detections: [{ class: 'particle', confidence: 0.95, bbox: [10, 10, 50, 50] }],
      accuracy: 0.92
    }
  })
}));

describe('ML/AI Augmentation Tool - Comprehensive Test Suite', () => {
  beforeEach(() => {
    testUtils.mockFileSystem();
  });

  describe('Symbolic Regression', () => {
    test('Linear relationship discovery: y = 2x + 1', async () => {
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'symbolic_regression_train',
        X: [1, 2, 3, 4, 5],
        y: [3, 5, 7, 9, 11],
        ops: ['+', '-', '*'],
        max_depth: 3
      });
      testUtils.validateToolResponse(result);
      expect(result.expression_sympy).toContain('2*x');
      expect(result.r_squared).toBeGreaterThan(0.99);
    });

    test('Polynomial relationship discovery', async () => {
      const mockClient = createMockWorkerClient({ 
        'ml_symbolic_regression': { 
          success: true, 
          expression_sympy: 'x**2 + 2*x + 1',
          r_squared: 0.9999,
          complexity: 5,
          plot_path: 'artifacts/poly_regression.png'
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'symbolic_regression_train',
        X: [1, 2, 3, 4],
        y: [4, 9, 16, 25], // x^2 + 2x + 1 pattern
        ops: ['+', '-', '*', 'pow'],
        max_depth: 5
      });
      expect(result.success).toBe(true);
      expect(result.expression_sympy).toContain('x**2');
    });

    test('Trigonometric function discovery', async () => {
      const mockClient = createMockWorkerClient({ 
        'ml_symbolic_regression': { 
          success: true, 
          expression_sympy: 'sin(x)',
          r_squared: 0.98,
          mae: 0.05,
          plot_path: 'artifacts/trig_regression.png'
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'symbolic_regression_train',
        X: Array.from({length: 20}, (_, i) => i * Math.PI / 10),
        y: Array.from({length: 20}, (_, i) => Math.sin(i * Math.PI / 10)),
        ops: ['+', '-', '*', 'sin', 'cos'],
        max_depth: 4
      });
      expect(result.success).toBe(true);
      expect(result.expression_sympy).toContain('sin');
    });
  });

  describe('Surrogate PDE Training', () => {
    test('Heat equation surrogate model', async () => {
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'surrogate_pde_train',
        problem: 'pinn',
        domain: { x: [0, 1], t: [0, 1] },
        pde: 'u_t - 0.01 * u_xx = 0',
        boundary_conditions: { x0: 0, x1: 0 },
        initial_condition: 'sin(pi*x)',
        epochs: 100
      });
      testUtils.validateToolResponse(result);
      expect(result.model_path).toContain('artifacts/');
      expect(result.training_loss).toBeLessThan(0.1);
    });

    test('Wave equation surrogate', async () => {
      const mockClient = createMockWorkerClient({ 
        'ml_surrogate_pde': { 
          success: true, 
          model_path: 'artifacts/wave_model.pth',
          training_loss: 0.005,
          physics_loss: 0.002,
          animation_path: 'artifacts/wave_evolution.mp4'
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'surrogate_pde_train',
        problem: 'pinn',
        domain: { x: [-1, 1], t: [0, 2] },
        pde: 'u_tt - u_xx = 0',
        animate: true,
        epochs: 200
      });
      expect(result.success).toBe(true);
      expect(result.animation_path).toBeDefined();
    });
  });

  describe('Pattern Recognition', () => {
    test('Particle detection in physics images', async () => {
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'pattern_recognition_infer',
        images: ['detector_image_1.jpg', 'detector_image_2.jpg'],
        model: 'yolo_particles',
        task: 'detect',
        threshold: 0.8
      });
      testUtils.validateToolResponse(result);
      expect(result.detections).toBeDefined();
      expect(result.detections.length).toBeGreaterThan(0);
    });

    test('Bubble chamber track classification', async () => {
      const mockClient = createMockWorkerClient({ 
        'ml_pattern_recognition': { 
          success: true, 
          classifications: [
            { track_id: 1, particle_type: 'electron', confidence: 0.92 },
            { track_id: 2, particle_type: 'muon', confidence: 0.88 }
          ],
          accuracy: 0.90,
          confusion_matrix: [[45, 5], [3, 47]]
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'pattern_recognition_infer',
        images: ['bubble_chamber.jpg'],
        model: 'track_classifier',
        task: 'classify'
      });
      expect(result.success).toBe(true);
      expect(result.classifications).toBeDefined();
    });

    test('Astronomical object detection', async () => {
      const mockClient = createMockWorkerClient({ 
        'ml_pattern_recognition': { 
          success: true, 
          detections: [
            { class: 'galaxy', confidence: 0.95, coordinates: [120.5, 45.2] },
            { class: 'star', confidence: 0.98, coordinates: [200.1, 100.8] }
          ],
          total_objects: 2,
          processing_time: 1.2
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'pattern_recognition_infer',
        images: ['telescope_field.fits'],
        model: 'astro_detector',
        task: 'detect',
        threshold: 0.9
      });
      expect(result.success).toBe(true);
      expect(result.total_objects).toBe(2);
    });
  });

  describe('Derivation Explanation', () => {
    test('Maxwell equations derivation', async () => {
      const mockClient = createMockWorkerClient({ 
        'ml_explain_derivation': { 
          success: true, 
          explanation: 'Maxwell\'s equations can be derived from the principle of gauge invariance...',
          steps: [
            'Start with electromagnetic field tensor',
            'Apply gauge transformation',
            'Derive field equations'
          ],
          difficulty_level: 'graduate',
          references: ['Griffiths E&M', 'Jackson Classical Electrodynamics']
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'explain_derivation',
        topic: 'Maxwell equations',
        goal: 'explain',
        audience_level: 'grad',
        assumptions: ['vector calculus', 'special relativity']
      });
      expect(result.success).toBe(true);
      expect(result.explanation).toBeDefined();
      expect(result.steps.length).toBeGreaterThan(0);
    });

    test('Schrödinger equation derivation', async () => {
      const mockClient = createMockWorkerClient({ 
        'ml_explain_derivation': { 
          success: true, 
          explanation: 'The time-dependent Schrödinger equation emerges from the correspondence principle...',
          mathematical_steps: [
            'E = ℏω → iℏ∂/∂t',
            'p = ℏk → -iℏ∇',
            'H = E - V → iℏ∂ψ/∂t = Ĥψ'
          ],
          visual_aids: ['wavefunction_evolution.gif'],
          complexity_score: 7
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'explain_derivation',
        topic: 'Schrödinger equation',
        goal: 'derive',
        audience_level: 'undergrad'
      });
      expect(result.success).toBe(true);
      expect(result.mathematical_steps).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('Invalid training data should return error', async () => {
      const mockClient = createMockWorkerClient({ 
        'ml_symbolic_regression': { success: false, error: 'Training data contains NaN values' } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'symbolic_regression_train',
        X: [1, 2, NaN, 4],
        y: [2, 4, 6, 8]
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('Missing required parameters should return error', async () => {
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'symbolic_regression_train'
        // Missing X and y
      });
      expect(result.success).toBe(false);
    });

    test('Unsupported ML method should return error', async () => {
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'unsupported_method',
        data: [1, 2, 3]
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Performance and GPU Acceleration', () => {
    test('GPU-accelerated training', async () => {
      const mockClient = createMockWorkerClient({ 
        'ml_symbolic_regression': { 
          success: true, 
          expression_sympy: 'x**3 - 2*x**2 + x',
          device_used: 'cuda:0',
          training_time: 2.5,
          gpu_memory_used: '1.2GB'
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'symbolic_regression_train',
        X: Array.from({length: 1000}, (_, i) => i / 100),
        y: Array.from({length: 1000}, (_, i) => Math.pow(i/100, 3) - 2*Math.pow(i/100, 2) + i/100),
        use_gpu: true,
        max_depth: 6
      });
      expect(result.success).toBe(true);
      expect(result.device_used).toContain('cuda');
    });

    test('Large dataset processing with chunking', async () => {
      const mockClient = createMockWorkerClient({ 
        'ml_pattern_recognition': { 
          success: true, 
          processed_images: 1000,
          chunks_processed: 10,
          average_confidence: 0.87,
          processing_time: 45.2
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleMLAugmentationTool('ml_ai_augmentation', { 
        method: 'pattern_recognition_infer',
        images: Array.from({length: 1000}, (_, i) => `image_${i}.jpg`),
        model: 'efficient_detector',
        batch_size: 100
      });
      expect(result.success).toBe(true);
      expect(result.processed_images).toBe(1000);
    });
  });
});
