/**
 * GPU-accelerated signal processing tools
 */

// Local Tool interface to avoid import issues
interface Tool {
  name: string;
  description: string;
  inputSchema: any;
}
import {
  dataFftSchema,
  dataFilterSchema,
  dataSpectrogramSchema,
  dataWaveletSchema
} from './schema.js';
import {
  dataFftHandler,
  dataFilterHandler,
  dataSpectrogramHandler,
  dataWaveletHandler
} from './handlers.js';

// Simple handler type since we're using direct function calls
export type ToolHandler = (params: any) => Promise<any>;

export const tools: Tool[] = [
  {
    name: 'data_fft',
    description: 'GPU-accelerated Fast Fourier Transform with comprehensive diagnostic plots',
    inputSchema: dataFftSchema
  },
  {
    name: 'data_filter',
    description: 'GPU-accelerated digital filtering (IIR/FIR) with response analysis',
    inputSchema: dataFilterSchema
  },
  {
    name: 'data_spectrogram',
    description: 'Time-frequency analysis with Short-Time Fourier Transform',
    inputSchema: dataSpectrogramSchema
  },
  {
    name: 'data_wavelet',
    description: 'Continuous wavelet transform for time-scale analysis',
    inputSchema: dataWaveletSchema
  }
];

// Handler mapping
const handlers: Record<string, any> = {
  'data_fft': dataFftHandler,
  'data_filter': dataFilterHandler,
  'data_spectrogram': dataSpectrogramHandler,
  'data_wavelet': dataWaveletHandler
};

export * from './schema.js';
export * from './handlers.js';

// Server integration functions
export function buildSignalTools() {
  return tools;
}

export async function handleSignalTool(name: string, args: any) {
  const handler = handlers[name];
  if (!handler) {
    throw new Error(`Unknown signal processing tool: ${name}`);
  }
  return await handler(args);
}
