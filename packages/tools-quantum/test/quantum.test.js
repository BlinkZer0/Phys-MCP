const { createMockWorkerClient, fixtures, testUtils } = require('../../../tests/shared/test-harness');
const { handleQuantumTool } = require('../dist');

// Mock the worker client
jest.mock('../../tools-cas/dist/worker-client.js', () => ({
  getWorkerClient: () => createMockWorkerClient({
    'quantum_solve': { success: true, eigenvalues: [-0.5, 0.5, 1.5], eigenvectors: [[1, 0], [0, 1]] },
    'quantum_visualize': { success: true, plot_path: 'artifacts/bloch_sphere.png' },
    'quantum_ops': { success: true, result_matrix: [[1, 0], [0, -1]] }
  })
}));

describe('Quantum Tool - Comprehensive Test Suite', () => {
  beforeEach(() => {
    testUtils.mockFileSystem();
  });

  describe('Quantum Problem Solving', () => {
    test('Harmonic oscillator eigenvalues', async () => {
      const result = await handleQuantumTool('quantum', { 
        action: 'solve', 
        problem: 'sho',
        params: { n_levels: 3, omega: 1.0 }
      });
      testUtils.validateToolResponse(result);
      expect(result.eigenvalues).toBeDefined();
      expect(result.eigenvalues.length).toBe(3);
    });

    test('Particle in a box', async () => {
      const mockClient = createMockWorkerClient({ 
        'quantum_solve': { 
          success: true, 
          eigenvalues: [1.23, 4.93, 11.1],
          wavefunctions: [[0.1, 0.2, 0.1], [0.2, 0, -0.2], [0.1, -0.2, 0.1]]
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleQuantumTool('quantum', { 
        action: 'solve', 
        problem: 'particle_in_box',
        params: { length: 1.0, n_levels: 3 }
      });
      expect(result.success).toBe(true);
      expect(result.eigenvalues).toBeDefined();
      expect(result.wavefunctions).toBeDefined();
    });

    test('Bell state preparation', async () => {
      const mockClient = createMockWorkerClient({ 
        'quantum_solve': { 
          success: true, 
          state: [0.707, 0, 0, 0.707],
          fidelity: 0.999,
          entanglement_measure: 1.0
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleQuantumTool('quantum', { 
        action: 'solve', 
        problem: 'bell_state',
        params: { bell_type: 'phi_plus' }
      });
      expect(result.success).toBe(true);
      expect(result.state).toBeDefined();
      expect(result.fidelity).toBeGreaterThan(0.99);
    });

    test('Custom Hamiltonian diagonalization', async () => {
      const mockClient = createMockWorkerClient({ 
        'quantum_solve': { 
          success: true, 
          eigenvalues: [-1, 1],
          eigenvectors: [[0.707, 0.707], [0.707, -0.707]]
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleQuantumTool('quantum', { 
        action: 'solve', 
        problem: 'custom',
        hamiltonian: [[0, 1], [1, 0]] // Pauli-X matrix
      });
      expect(result.success).toBe(true);
      expect(result.eigenvalues).toEqual([-1, 1]);
    });
  });

  describe('Quantum State Visualization', () => {
    test('Bloch sphere visualization', async () => {
      const result = await handleQuantumTool('quantum', { 
        action: 'visualize', 
        state: [1, 0], // |0⟩ state
        kind: 'bloch_sphere'
      });
      testUtils.validateToolResponse(result);
      expect(result.plot_path).toContain('artifacts/');
      expect(result.plot_path).toMatch(/\.(png|jpg|svg)$/);
    });

    test('Probability density visualization', async () => {
      const mockClient = createMockWorkerClient({ 
        'quantum_visualize': { 
          success: true, 
          plot_path: 'artifacts/probability_density.png',
          max_probability: 0.4
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleQuantumTool('quantum', { 
        action: 'visualize', 
        state: [0.6, 0.8], // Normalized superposition
        kind: 'probability_density'
      });
      expect(result.success).toBe(true);
      expect(result.plot_path).toBeDefined();
    });

    test('Wavefunction visualization', async () => {
      const mockClient = createMockWorkerClient({ 
        'quantum_visualize': { 
          success: true, 
          plot_path: 'artifacts/wavefunction.png',
          nodes: [0.5, 1.5], // Wavefunction nodes
          normalization: 1.0
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleQuantumTool('quantum', { 
        action: 'visualize', 
        wavefunction: Array.from({length: 100}, (_, i) => Math.sin(Math.PI * i / 50)),
        x_range: [0, 2],
        kind: 'wavefunction'
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Quantum Operations', () => {
    test('Pauli matrix operations', async () => {
      const result = await handleQuantumTool('quantum', { 
        action: 'ops', 
        operators: ['X', 'Y'],
        task: 'commutator'
      });
      testUtils.validateToolResponse(result);
      expect(result.result_matrix).toBeDefined();
    });

    test('Hadamard gate matrix', async () => {
      const mockClient = createMockWorkerClient({ 
        'quantum_ops': { 
          success: true, 
          result_matrix: [[0.707, 0.707], [0.707, -0.707]]
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleQuantumTool('quantum', { 
        action: 'ops', 
        operators: ['H'],
        task: 'matrix_representation'
      });
      expect(result.success).toBe(true);
      expect(result.result_matrix).toBeDefined();
    });

    test('CNOT gate operation', async () => {
      const mockClient = createMockWorkerClient({ 
        'quantum_ops': { 
          success: true, 
          result_matrix: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]]
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleQuantumTool('quantum', { 
        action: 'ops', 
        operators: ['CNOT'],
        task: 'matrix_representation'
      });
      expect(result.success).toBe(true);
      expect(result.result_matrix.length).toBe(4); // 2-qubit gate
    });
  });

  describe('Advanced Quantum Algorithms', () => {
    test('Grover search algorithm', async () => {
      const mockClient = createMockWorkerClient({ 
        'quantum_solve': { 
          success: true, 
          marked_item: 5,
          success_probability: 0.95,
          optimal_iterations: 2,
          final_state: [0.1, 0.1, 0.1, 0.1, 0.9, 0.1, 0.1, 0.1]
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleQuantumTool('quantum', { 
        action: 'solve', 
        problem: 'grover',
        params: { num_qubits: 3, marked_item: 5 }
      });
      expect(result.success).toBe(true);
      expect(result.success_probability).toBeGreaterThan(0.9);
    });

    test('Quantum teleportation protocol', async () => {
      const mockClient = createMockWorkerClient({ 
        'quantum_solve': { 
          success: true, 
          teleported_state: [0.6, 0.8],
          fidelity: 0.999,
          measurement_outcomes: [0, 1],
          correction_gates: ['X']
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleQuantumTool('quantum', { 
        action: 'solve', 
        problem: 'teleportation',
        params: { input_state: [0.6, 0.8] }
      });
      expect(result.success).toBe(true);
      expect(result.fidelity).toBeGreaterThan(0.99);
    });

    test('VQE molecular simulation', async () => {
      const mockClient = createMockWorkerClient({ 
        'quantum_solve': { 
          success: true, 
          ground_state_energy: -1.137,
          optimal_parameters: [0.1, 0.2, 0.3],
          convergence_history: [-1.0, -1.1, -1.13, -1.137],
          molecule: 'H2'
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleQuantumTool('quantum', { 
        action: 'solve', 
        problem: 'vqe',
        params: { 
          molecule: 'H2', 
          bond_length: 0.74,
          ansatz: 'UCCSD'
        }
      });
      expect(result.success).toBe(true);
      expect(result.ground_state_energy).toBeLessThan(0);
    });
  });

  describe('Error Handling', () => {
    test('Invalid quantum state should return error', async () => {
      const mockClient = createMockWorkerClient({ 
        'quantum_visualize': { success: false, error: 'State not normalized' } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleQuantumTool('quantum', { 
        action: 'visualize', 
        state: [1, 1], // Not normalized
        kind: 'bloch_sphere'
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('Invalid Hamiltonian matrix should return error', async () => {
      const result = await handleQuantumTool('quantum', { 
        action: 'solve', 
        problem: 'custom',
        hamiltonian: [[1, 2], [3]] // Non-square matrix
      });
      expect(result.success).toBe(false);
    });

    test('Missing required parameters should return error', async () => {
      const result = await handleQuantumTool('quantum', { action: 'solve' }); // Missing problem
      expect(result.success).toBe(false);
    });
  });

  describe('Quantum Circuit Simulation', () => {
    test('Simple quantum circuit', async () => {
      const mockClient = createMockWorkerClient({ 
        'quantum_circuit': { 
          success: true, 
          final_state: [0.5, 0.5, 0.5, 0.5],
          circuit_depth: 2,
          gate_count: 3
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleQuantumTool('quantum', { 
        action: 'circuit', 
        gates: [
          { gate: 'H', qubits: [0] },
          { gate: 'CNOT', qubits: [0, 1] }
        ],
        num_qubits: 2
      });
      expect(result.success).toBe(true);
      expect(result.final_state).toBeDefined();
    });
  });
});
