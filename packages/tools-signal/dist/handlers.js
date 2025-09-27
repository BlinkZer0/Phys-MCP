/**
 * Request handlers for Signal Processing tools
 */
export const dataFftHandler = async (params) => {
    return {
        method: 'data_fft',
        params
    };
};
export const dataFilterHandler = async (params) => {
    return {
        method: 'data_filter',
        params
    };
};
export const dataSpectrogramHandler = async (params) => {
    return {
        method: 'data_spectrogram',
        params
    };
};
export const dataWaveletHandler = async (params) => {
    return {
        method: 'data_wavelet',
        params
    };
};
