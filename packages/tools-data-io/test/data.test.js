const { createMockWorkerClient, fixtures, testUtils } = require('../../../tests/shared/test-harness');
const { handleDataIOTool } = require('../dist');

// Mock the worker client
jest.mock('../../tools-cas/dist/worker-client.js', () => ({
  getWorkerClient: () => createMockWorkerClient({
    'data_fft': { success: true, frequencies: [0, 250, 500, 750], magnitudes: [10, 2, 2, 2] },
    'data_filter': { success: true, filtered_signal: [1, 1.5, 2, 2.5] },
    'data_import_hdf5': { success: true, data: { dataset1: [1, 2, 3, 4] } },
    'data_export_hdf5': { success: true, file_path: 'artifacts/data_export.h5' }
  })
}));

describe('Data Tool - Comprehensive Test Suite', () => {
  beforeEach(() => {
    testUtils.mockFileSystem();
  });

  describe('Signal Processing', () => {
    test('FFT analysis of signal', async () => {
      const result = await handleDataIOTool('data', { 
        action: 'fft', 
        signal_data: [1, 2, 3, 4], 
        sample_rate: 1000 
      });
      testUtils.validateToolResponse(result);
      expect(result.frequencies).toBeDefined();
      expect(result.magnitudes).toBeDefined();
      expect(result.frequencies.length).toBe(result.magnitudes.length);
    });

    test('Low-pass filter application', async () => {
      const mockClient = createMockWorkerClient({ 
        'data_filter': { success: true, filtered_signal: [0.5, 1, 1.5, 2] } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleDataIOTool('data', { 
        action: 'filter', 
        signal_data: [1, 2, 3, 4], 
        filter_type: 'lowpass',
        cutoff_freq: 100,
        sample_rate: 1000
      });
      expect(result.success).toBe(true);
      expect(result.filtered_signal).toBeDefined();
    });

    test('Spectrogram generation', async () => {
      const mockClient = createMockWorkerClient({ 
        'data_spectrogram': { 
          success: true, 
          spectrogram_path: 'artifacts/spectrogram.png',
          frequencies: [0, 100, 200],
          times: [0, 0.1, 0.2],
          power: [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleDataIOTool('data', { 
        action: 'spectrogram', 
        signal_data: Array.from({length: 1000}, (_, i) => Math.sin(2 * Math.PI * 50 * i / 1000)), 
        sample_rate: 1000
      });
      expect(result.success).toBe(true);
      expect(result.spectrogram_path).toBeDefined();
    });

    test('Wavelet transform', async () => {
      const mockClient = createMockWorkerClient({ 
        'data_wavelet': { 
          success: true, 
          coefficients: [[1, 2], [3, 4]], 
          scales: [1, 2],
          wavelet_plot: 'artifacts/wavelet.png'
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleDataIOTool('data', { 
        action: 'wavelet', 
        signal_data: [1, 2, 3, 4, 5, 6, 7, 8], 
        wavelet_type: 'morlet'
      });
      expect(result.success).toBe(true);
      expect(result.coefficients).toBeDefined();
    });
  });

  describe('Data Import/Export', () => {
    test('HDF5 data import', async () => {
      const result = await handleDataIOTool('data', { 
        action: 'import_hdf5', 
        file_path: 'test_data.h5',
        dataset_name: 'experiment_data'
      });
      testUtils.validateToolResponse(result);
      expect(result.data).toBeDefined();
    });

    test('HDF5 data export', async () => {
      const result = await handleDataIOTool('data', { 
        action: 'export_hdf5', 
        data: { measurements: [1, 2, 3, 4] },
        file_path: 'output_data.h5'
      });
      testUtils.validateToolResponse(result);
      expect(result.file_path).toContain('.h5');
    });

    test('FITS file import', async () => {
      const mockClient = createMockWorkerClient({ 
        'data_import_fits': { 
          success: true, 
          data: { image: [[1, 2], [3, 4]], header: { NAXIS: 2 } } 
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleDataIOTool('data', { 
        action: 'import_fits', 
        file_path: 'astronomy_data.fits'
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test('ROOT file import', async () => {
      const mockClient = createMockWorkerClient({ 
        'data_import_root': { 
          success: true, 
          data: { histogram: [10, 20, 30, 25, 15] } 
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleDataIOTool('data', { 
        action: 'import_root', 
        file_path: 'particle_data.root',
        tree_name: 'events'
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('Data Analysis', () => {
    test('Statistical analysis of dataset', async () => {
      const mockClient = createMockWorkerClient({ 
        'data_analyze': { 
          success: true, 
          statistics: {
            mean: 2.5,
            std: 1.29,
            min: 1,
            max: 4,
            median: 2.5
          }
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleDataIOTool('data', { 
        action: 'analyze', 
        data: [1, 2, 3, 4],
        analysis_type: 'statistics'
      });
      expect(result.success).toBe(true);
      expect(result.statistics).toBeDefined();
    });

    test('Correlation analysis', async () => {
      const mockClient = createMockWorkerClient({ 
        'data_correlate': { 
          success: true, 
          correlation: 0.95,
          p_value: 0.01,
          correlation_plot: 'artifacts/correlation.png'
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleDataIOTool('data', { 
        action: 'correlate', 
        data_x: [1, 2, 3, 4],
        data_y: [2, 4, 6, 8]
      });
      expect(result.success).toBe(true);
      expect(result.correlation).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('Invalid file path should return error', async () => {
      const mockClient = createMockWorkerClient({ 
        'data_import_hdf5': { success: false, error: 'File not found' } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleDataIOTool('data', { 
        action: 'import_hdf5', 
        file_path: 'nonexistent.h5'
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('Invalid signal data should return error', async () => {
      const result = await handleDataIOTool('data', { 
        action: 'fft', 
        signal_data: [], // Empty array
        sample_rate: 1000 
      });
      expect(result.success).toBe(false);
    });

    test('Missing required parameters should return error', async () => {
      const result = await handleDataIOTool('data', { action: 'fft' }); // Missing signal_data
      expect(result.success).toBe(false);
    });
  });

  describe('Performance and Large Data', () => {
    test('Large signal FFT processing', async () => {
      const largeSignal = Array.from({length: 10000}, (_, i) => Math.sin(2 * Math.PI * 50 * i / 1000));
      const mockClient = createMockWorkerClient({ 
        'data_fft': { 
          success: true, 
          frequencies: Array.from({length: 5000}, (_, i) => i * 0.1),
          magnitudes: Array.from({length: 5000}, () => Math.random())
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleDataIOTool('data', { 
        action: 'fft', 
        signal_data: largeSignal, 
        sample_rate: 1000 
      });
      expect(result.success).toBe(true);
      expect(result.frequencies.length).toBeGreaterThan(1000);
    });

    test('Chunked data processing', async () => {
      const mockClient = createMockWorkerClient({ 
        'data_process_chunks': { 
          success: true, 
          processed_chunks: 5,
          total_samples: 50000,
          processing_time: 2.5
        } 
      });
      jest.doMock('../../tools-cas/dist/worker-client.js', () => ({ getWorkerClient: () => mockClient }));
      
      const result = await handleDataIOTool('data', { 
        action: 'process_chunks', 
        data: Array.from({length: 50000}, () => Math.random()),
        chunk_size: 10000
      });
      expect(result.success).toBe(true);
    });
  });
});
