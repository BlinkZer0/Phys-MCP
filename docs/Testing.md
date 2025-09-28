# Phys-MCP Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for Phys-MCP, covering all consolidated physics tools and ensuring production-ready reliability.

## Test Architecture

### Test Harness (`tests/shared/test-harness.js`)
- **Mock Worker Client**: Simulates Python worker responses
- **Common Fixtures**: Predefined test data for all tools
- **Utility Functions**: Validation helpers and file system mocking

### Test Categories

#### 1. Unit Tests (TypeScript)
- **Location**: `packages/tools-*/test/*.test.js`
- **Framework**: Jest with custom setup
- **Coverage**: Handler functions, parameter validation, error handling
- **Mocking**: Python worker calls, file system operations

#### 2. Integration Tests (Python)
- **Location**: `packages/python-worker/tests/test_*.py`
- **Framework**: pytest with fixtures
- **Coverage**: Worker implementations, scientific computations
- **Mocking**: External dependencies (matplotlib, sympy, etc.)

#### 3. End-to-End Tests
- **Location**: `tests/e2e/`
- **Framework**: Custom test runner
- **Coverage**: Full tool workflows, server integration

## Tool Coverage

### High Priority Tools ✅
- **CAS Tool**: 23 test cases covering arithmetic, calculus, equation solving
- **Plot Tool**: 15 test cases covering 2D/3D plotting, animations
- **Data Tool**: 18 test cases covering signal processing, I/O operations
- **Quantum Tool**: 20 test cases covering algorithms, visualization

### Medium Priority Tools ✅
- **ML/AI Augmentation**: 12 test cases covering regression, PDE, pattern recognition
- **Distributed Collaboration**: 15 test cases covering job submission, session sharing
- **Graphing Calculator**: Comprehensive test suite (reference MEMORY[712634b4])
- **Export Tools**: API integration tests

### Additional Tools
- **Units/Constants**: Basic validation tests
- **Tensor Algebra**: Advanced differential geometry tests (reference MEMORY[e707390f])
- **Report Generation**: Markdown output validation

## Running Tests

### Local Development
```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit          # TypeScript unit tests
pnpm test:python        # Python worker tests
pnpm test:integration   # Integration tests
pnpm test:watch         # Watch mode for development

# Run tests for specific tool
cd packages/tools-cas && pnpm test
```

### CI/CD Pipeline
```bash
# CI command (used in GitHub Actions)
pnpm test:ci
```

## Test Configuration

### Jest Configuration
Each package includes:
- `jest.config.js`: Test configuration
- `test/setup.js`: Global test setup
- Mock configurations for external dependencies

### Python Configuration
- `conftest.py`: Shared pytest fixtures
- Mock configurations for scientific libraries
- Temporary artifact directories

## Writing New Tests

### TypeScript Tests
```javascript
const { createMockWorkerClient, fixtures, testUtils } = require('../../../tests/shared/test-harness');

describe('New Tool Tests', () => {
  beforeEach(() => {
    testUtils.mockFileSystem();
  });

  test('should handle basic operation', async () => {
    const result = await handleNewTool('new_tool', { 
      action: 'basic_operation',
      input: 'test_data'
    });
    
    testUtils.validateToolResponse(result);
    expect(result.success).toBe(true);
  });
});
```

### Python Tests
```python
def test_new_worker_function(self, new_worker, sample_data):
    """Test new worker functionality"""
    result = new_worker.new_method({
        'input': sample_data['test_input'],
        'method': 'new_method'
    })
    
    assert result['success'] is True
    assert 'expected_output' in result
```

## Coverage Requirements

### Minimum Coverage Targets
- **Unit Tests**: 80% line coverage
- **Integration Tests**: 70% function coverage
- **Critical Paths**: 95% coverage for core physics operations

### Coverage Reporting
```bash
# Generate coverage reports
pnpm test:unit --coverage
python -m pytest --cov=src --cov-report=html
```

## Test Data Management

### Fixtures and Golden Files
- **Location**: `tests/fixtures/`
- **Format**: JSON for structured data, binary for scientific data
- **Versioning**: Git LFS for large test datasets

### Mock Data Generation
```javascript
// Generate realistic physics data
const generateSignalData = (samples, frequency) => {
  return Array.from({length: samples}, (_, i) => 
    Math.sin(2 * Math.PI * frequency * i / samples)
  );
};
```

## Performance Testing

### Benchmarks
- **Location**: `tests/benchmarks/`
- **Tools**: Jest performance tests, Python timeit
- **Metrics**: Execution time, memory usage, GPU utilization

### Load Testing
- **Concurrent Operations**: Multiple tool calls
- **Large Datasets**: Memory management validation
- **Resource Limits**: GPU memory, CPU usage

## Error Testing

### Error Scenarios
- Invalid input parameters
- Missing dependencies
- Resource exhaustion
- Network failures (for distributed tools)

### Error Validation
```javascript
test('should handle invalid input gracefully', async () => {
  const result = await handleTool('tool', { invalid: 'input' });
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
  expect(result.error).toContain('validation');
});
```

## Continuous Integration

### GitHub Actions Workflow
- **Trigger**: Push to main, pull requests
- **Matrix**: Node.js 20.x/22.x, Python 3.11/3.12
- **Platforms**: Ubuntu, Windows, macOS
- **Steps**: Install → Lint → Build → Test → Coverage

### Quality Gates
- All tests must pass
- Coverage thresholds met
- No critical linting errors
- TypeScript compilation successful

## Future Enhancements

### Planned Improvements
1. **Visual Regression Testing**: Plot output comparison
2. **Property-Based Testing**: Hypothesis for Python, fast-check for JS
3. **Mutation Testing**: Code quality validation
4. **Performance Regression**: Automated benchmarking

### Coverage Gaps
1. **Edge Cases**: Boundary conditions for numerical methods
2. **Stress Testing**: Large-scale computations
3. **Integration**: Full server-to-worker communication
4. **Documentation**: Test case documentation

## Troubleshooting

### Common Issues
- **Mock Failures**: Ensure proper mock setup in beforeEach
- **Async Issues**: Use proper async/await patterns
- **File System**: Use testUtils.mockFileSystem()
- **Dependencies**: Check package.json test dependencies

### Debug Commands
```bash
# Debug specific test
npx jest --testNamePattern="specific test" --verbose

# Debug Python tests
python -m pytest tests/test_specific.py -v -s

# Debug with coverage
pnpm test:unit --coverage --verbose
```

## Contributing

### Test Requirements for PRs
1. New features must include tests
2. Bug fixes must include regression tests
3. Tests must pass in CI
4. Coverage must not decrease

### Review Checklist
- [ ] Tests cover happy path and error cases
- [ ] Mocks are properly configured
- [ ] Test names are descriptive
- [ ] No hardcoded values in tests
- [ ] Performance considerations addressed

---

This testing strategy ensures Phys-MCP maintains production-ready quality while supporting rapid development of new physics computation features.
