/**
 * Request handlers for Signal Processing tools
 */

// Simple handler type since we're using direct function calls
export type ToolHandler = (params: any) => Promise<any>;

export const dataFftHandler: ToolHandler = async (params) => {
  return {
    method: 'data_fft',
    params
  };
};

export const dataFilterHandler: ToolHandler = async (params) => {
  return {
    method: 'data_filter',
    params
  };
};

export const dataSpectrogramHandler: ToolHandler = async (params) => {
  return {
    method: 'data_spectrogram',
    params
  };
};

export const dataWaveletHandler: ToolHandler = async (params) => {
  return {
    method: 'data_wavelet',
    params
  };
};
