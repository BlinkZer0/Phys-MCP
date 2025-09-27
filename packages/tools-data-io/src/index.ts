/**
 * Data I/O tools for scientific formats
 */

// Local Tool interface to avoid import issues
interface Tool {
  name: string;
  description: string;
  inputSchema: any;
}
import {
  dataImportHdf5Schema,
  dataImportFitsSchema,
  dataImportRootSchema,
  dataExportHdf5Schema
} from './schema.js';
import {
  dataImportHdf5Handler,
  dataImportFitsHandler,
  dataImportRootHandler,
  dataExportHdf5Handler
} from './handlers.js';

// Signal processing handlers will be loaded dynamically

export const tools: Tool[] = [
  {
    name: 'data',
    description: 'Data processing operations: import/export scientific formats (HDF5, FITS, ROOT), signal processing (FFT, filtering, spectrograms, wavelets)',
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "Data operation to perform",
          enum: ["import_hdf5", "import_fits", "import_root", "export_hdf5", "fft", "filter", "spectrogram", "wavelet"]
        },
        // File I/O parameters
        file_path: { type: "string", description: "Path to input/output file" },
        dataset_path: { type: "string", description: "Path to dataset within HDF5 file" },
        hdu_index: { type: "integer", default: 0, description: "HDU index for FITS files" },
        tree_name: { type: "string", description: "Tree name for ROOT files" },
        branches: { type: "array", items: { type: "string" }, description: "Branch names for ROOT files" },
        max_entries: { type: "integer", default: 10000, description: "Max entries to read from ROOT" },
        data: { type: "object", description: "Data to export" },
        compression: { type: "string", enum: ["gzip", "lzf", "szip", "none"], default: "gzip", description: "Compression for export" },
        metadata: { type: "object", description: "Metadata for export" },
        
        // Signal processing parameters
        signal_data: { type: "array", items: { type: "number" }, description: "Input signal data array" },
        sample_rate: { type: "number", description: "Sample rate in Hz" },
        window: { type: "string", enum: ["hann", "hamming", "blackman", "bartlett", "none"], default: "hann", description: "Window function" },
        filter_type: { type: "string", enum: ["lowpass", "highpass", "bandpass", "bandstop"], description: "Filter type" },
        cutoff_freq: { 
          oneOf: [
            { type: "number" },
            { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 }
          ],
          description: "Cutoff frequency or [low, high] for bandpass/bandstop"
        },
        filter_order: { type: "integer", default: 4, minimum: 1, maximum: 10, description: "Filter order" },
        window_size: { type: "integer", default: 256, description: "Window size for STFT" },
        overlap: { type: "number", default: 0.5, minimum: 0, maximum: 0.95, description: "Window overlap fraction" },
        window_type: { type: "string", enum: ["hann", "hamming", "blackman", "bartlett"], default: "hann", description: "Window function for STFT" },
        wavelet: { type: "string", enum: ["morlet", "mexican_hat", "daubechies", "haar"], default: "morlet", description: "Wavelet function" },
        scales: { type: "array", items: { type: "number" }, description: "Scale values for wavelet transform" },
        
        // Output options
        emit_plots: { type: "boolean", default: true, description: "Generate diagnostic plots" },
        emit_csv: { type: "boolean", default: true, description: "Export data as CSV" }
      },
      required: ["action"]
    }
  }
];

// Handler mapping
const handlers: Record<string, any> = {
  'data_import_hdf5': dataImportHdf5Handler,
  'data_import_fits': dataImportFitsHandler,
  'data_import_root': dataImportRootHandler,
  'data_export_hdf5': dataExportHdf5Handler
};

export * from './schema.js';
export * from './handlers.js';

// Server integration functions
export function buildDataIOTools() {
  return tools;
}

export async function handleDataIOTool(name: string, args: any): Promise<any> {
  if (name === 'data') {
    const action = args.action;
    
    switch (action) {
      case 'import_hdf5':
        return await dataImportHdf5Handler({
          file_path: args.file_path,
          dataset_path: args.dataset_path,
          emit_plots: args.emit_plots
        });
        
      case 'import_fits':
        return await dataImportFitsHandler({
          file_path: args.file_path,
          hdu_index: args.hdu_index,
          emit_plots: args.emit_plots
        });
        
      case 'import_root':
        return await dataImportRootHandler({
          file_path: args.file_path,
          tree_name: args.tree_name,
          branches: args.branches,
          max_entries: args.max_entries,
          emit_plots: args.emit_plots
        });
        
      case 'export_hdf5':
        return await dataExportHdf5Handler({
          data: args.data,
          file_path: args.file_path,
          compression: args.compression,
          metadata: args.metadata
        });
        
      // Signal processing actions - load handlers dynamically
      case 'fft':
      case 'filter':
      case 'spectrogram':
      case 'wavelet':
        try {
          const signalModule = await import('../../tools-signal/dist/handlers.js');
          const handlerMap: any = {
            'fft': signalModule.dataFftHandler,
            'filter': signalModule.dataFilterHandler,
            'spectrogram': signalModule.dataSpectrogramHandler,
            'wavelet': signalModule.dataWaveletHandler
          };
          
          const handler = handlerMap[action];
          if (!handler) {
            throw new Error(`Unknown signal processing action: ${action}`);
          }
          
          return await handler(args);
        } catch (error) {
          throw new Error(`Signal processing not available: ${error}`);
        }
        
      default:
        throw new Error(`Unknown data action: ${action}`);
    }
  }
  
  // Legacy support for individual tools
  if (name === 'data_fft' || name === 'data_filter' || name === 'data_spectrogram' || name === 'data_wavelet') {
    // Convert individual signal tool calls to consolidated format
    const actionMap: Record<string, string> = {
      'data_fft': 'fft',
      'data_filter': 'filter', 
      'data_spectrogram': 'spectrogram',
      'data_wavelet': 'wavelet'
    };
    
    const action = actionMap[name];
    return await handleDataIOTool('data', { ...args, action });
  }
  
  const handler = handlers[name];
  if (!handler) {
    throw new Error(`Unknown data I/O tool: ${name}`);
  }
  return await handler(args);
}
