const { createMockWorkerClient, fixtures, testUtils } = require('../../../tests/shared/test-harness');
const { handleCAS } = require('../dist');

// Mock the worker client
jest.mock('../../tools-cas/dist/worker-client.js', () => ({
  getWorkerClient: () => createMockWorkerClient({
    'cas_evaluate': { success: true, result: 14 },
    'cas_diff': { success: true, result: '2*x' },
    'cas_integrate': { success: true, result: 'x**2 + 3*x' },
    'cas_solve_equation': { success: true, result: [-2, 2] }
  })
}));

describe('CAS Tool - Comprehensive Test Suite', () => {
  beforeEach(() => {
    testUtils.mockFileSystem();
  });

  describe('Basic Arithmetic Operations', () => {
    test('2 + 3 * 4 = 14', async () => {
      const result = await handleCAS('cas', { action: 'evaluate', expr: '2 + 3 * 4' });
      testUtils.validateToolResponse(result);
      expect(result.result).toBe(14);
    });

    test('(5 + 3) * 2 = 16', async () => {
      const mockClient = createMockWorkerClient({ 'cas_evaluate': { success: true, result: 16 } });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleCAS('cas', { action: 'evaluate', expr: '(5 + 3) * 2' });
      expect(result.result).toBe(16);
    });

    test('sqrt(16) = 4', async () => {
      const mockClient = createMockWorkerClient({ 'cas_evaluate': { success: true, result: 4 } });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleCAS('cas', { action: 'evaluate', expr: 'sqrt(16)' });
      expect(result.result).toBe(4);
    });
  });

  describe('Algebraic Expressions', () => {
    test('x^2 + 2x + 1 with x=3 → 16', async () => {
      const mockClient = createMockWorkerClient({ 'cas_evaluate': { success: true, result: 16 } });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleCAS('cas', { 
        action: 'evaluate', 
        expr: 'x^2 + 2*x + 1', 
        vars: { x: 3 } 
      });
      expect(result.result).toBe(16);
    });

    test('a*b + c with a=2, b=3, c=4 → 10', async () => {
      const mockClient = createMockWorkerClient({ 'cas_evaluate': { success: true, result: 10 } });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleCAS('cas', { 
        action: 'evaluate', 
        expr: 'a*b + c', 
        vars: { a: 2, b: 3, c: 4 } 
      });
      expect(result.result).toBe(10);
    });
  });

  describe('Differentiation', () => {
    test('d/dx(x^2) = 2x', async () => {
      const result = await handleCAS('cas', { action: 'diff', expr: 'x^2', symbol: 'x' });
      testUtils.validateToolResponse(result);
      expect(result.result).toBe('2*x');
    });

    test('d/dx(x^3 + 2x^2 + x + 1) = 3x^2 + 4x + 1', async () => {
      const mockClient = createMockWorkerClient({ 'cas_diff': { success: true, result: '3*x**2 + 4*x + 1' } });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleCAS('cas', { action: 'diff', expr: 'x^3 + 2*x^2 + x + 1', symbol: 'x' });
      expect(result.result).toBe('3*x**2 + 4*x + 1');
    });
  });

  describe('Integration', () => {
    test('∫(2x + 3)dx = x^2 + 3x', async () => {
      const result = await handleCAS('cas', { action: 'integrate', expr: '2*x + 3', symbol: 'x' });
      testUtils.validateToolResponse(result);
      expect(result.result).toBe('x**2 + 3*x');
    });

    test('Definite integral ∫₀²x²dx = 8/3', async () => {
      const mockClient = createMockWorkerClient({ 'cas_integrate': { success: true, result: 8/3 } });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleCAS('cas', { 
        action: 'integrate', 
        expr: 'x^2', 
        symbol: 'x', 
        limits: [0, 2] 
      });
      expect(result.result).toBeCloseTo(8/3, 3);
    });
  });

  describe('Equation Solving', () => {
    test('x^2 - 4 = 0 → x = ±2', async () => {
      const result = await handleCAS('cas', { action: 'solve_equation', equation: 'x^2 - 4 = 0', symbol: 'x' });
      testUtils.validateToolResponse(result);
      expect(result.result).toEqual([-2, 2]);
    });

    test('2x + 6 = 0 → x = -3', async () => {
      const mockClient = createMockWorkerClient({ 'cas_solve_equation': { success: true, result: [-3] } });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleCAS('cas', { action: 'solve_equation', equation: '2*x + 6 = 0', symbol: 'x' });
      expect(result.result).toEqual([-3]);
    });
  });

  describe('Complex Expressions', () => {
    test('sqrt(16) + log(exp(2)) + sin(π/2) = 7', async () => {
      const mockClient = createMockWorkerClient({ 'cas_evaluate': { success: true, result: 7 } });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleCAS('cas', { action: 'evaluate', expr: 'sqrt(16) + log(exp(2)) + sin(pi/2)' });
      expect(result.result).toBe(7);
    });

    test('factorial(5)/factorial(3) = 20', async () => {
      const mockClient = createMockWorkerClient({ 'cas_evaluate': { success: true, result: 20 } });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleCAS('cas', { action: 'evaluate', expr: 'factorial(5)/factorial(3)' });
      expect(result.result).toBe(20);
    });
  });

  describe('Error Handling', () => {
    test('Invalid expression should return error', async () => {
      const mockClient = createMockWorkerClient({ 'cas_evaluate': { success: false, error: 'Invalid expression' } });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleCAS('cas', { action: 'evaluate', expr: 'invalid_expr(' });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('Missing required parameters should return error', async () => {
      const result = await handleCAS('cas', { action: 'evaluate' }); // Missing expr
      expect(result.success).toBe(false);
    });
  });
});
