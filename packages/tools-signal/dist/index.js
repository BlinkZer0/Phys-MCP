/**
 * GPU-accelerated signal processing tools
 */
import { dataFftSchema, dataFilterSchema, dataSpectrogramSchema, dataWaveletSchema } from './schema.js';
import { dataFftHandler, dataFilterHandler, dataSpectrogramHandler, dataWaveletHandler } from './handlers.js';
export const tools = [
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
const handlers = {
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
export async function handleSignalTool(name, args) {
    const handler = handlers[name];
    if (!handler) {
        throw new Error(`Unknown signal processing tool: ${name}`);
    }
    return await handler(args);
}
