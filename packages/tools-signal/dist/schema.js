/**
 * JSON Schema definitions for Signal Processing tools
 */
export const dataFftSchema = {
    type: "object",
    properties: {
        signal_data: {
            type: "array",
            items: { type: "number" },
            description: "Input signal data array"
        },
        sample_rate: {
            type: "number",
            description: "Sample rate in Hz"
        },
        window: {
            type: "string",
            enum: ["hann", "hamming", "blackman", "bartlett", "none"],
            default: "hann",
            description: "Window function to apply before FFT"
        },
        emit_plots: {
            type: "boolean",
            default: true,
            description: "Generate comprehensive FFT analysis plots"
        },
        emit_csv: {
            type: "boolean",
            default: true,
            description: "Export frequency and spectrum data as CSV"
        }
    },
    required: ["signal_data", "sample_rate"],
    additionalProperties: false
};
export const dataFilterSchema = {
    type: "object",
    properties: {
        signal_data: {
            type: "array",
            items: { type: "number" },
            description: "Input signal data array"
        },
        sample_rate: {
            type: "number",
            description: "Sample rate in Hz"
        },
        filter_type: {
            type: "string",
            enum: ["lowpass", "highpass", "bandpass", "bandstop"],
            description: "Type of filter to apply"
        },
        cutoff_freq: {
            oneOf: [
                { type: "number" },
                { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 }
            ],
            description: "Cutoff frequency (Hz) or [low, high] for bandpass/bandstop"
        },
        filter_order: {
            type: "integer",
            default: 4,
            minimum: 1,
            maximum: 10,
            description: "Filter order (higher = steeper rolloff)"
        },
        emit_plots: {
            type: "boolean",
            default: true,
            description: "Generate filter response and comparison plots"
        },
        emit_csv: {
            type: "boolean",
            default: true,
            description: "Export filtered signal data as CSV"
        }
    },
    required: ["signal_data", "sample_rate", "filter_type", "cutoff_freq"],
    additionalProperties: false
};
export const dataSpectrogramSchema = {
    type: "object",
    properties: {
        signal_data: {
            type: "array",
            items: { type: "number" },
            description: "Input signal data array"
        },
        sample_rate: {
            type: "number",
            description: "Sample rate in Hz"
        },
        window_size: {
            type: "integer",
            default: 256,
            description: "Window size for STFT"
        },
        overlap: {
            type: "number",
            default: 0.5,
            minimum: 0,
            maximum: 0.95,
            description: "Window overlap fraction"
        },
        window_type: {
            type: "string",
            enum: ["hann", "hamming", "blackman", "bartlett"],
            default: "hann",
            description: "Window function for STFT"
        },
        emit_plots: {
            type: "boolean",
            default: true,
            description: "Generate time-frequency spectrogram plot"
        },
        emit_csv: {
            type: "boolean",
            default: true,
            description: "Export spectrogram data as CSV"
        }
    },
    required: ["signal_data", "sample_rate"],
    additionalProperties: false
};
export const dataWaveletSchema = {
    type: "object",
    properties: {
        signal_data: {
            type: "array",
            items: { type: "number" },
            description: "Input signal data array"
        },
        sample_rate: {
            type: "number",
            description: "Sample rate in Hz"
        },
        wavelet: {
            type: "string",
            enum: ["morlet", "mexican_hat", "daubechies", "haar"],
            default: "morlet",
            description: "Wavelet function to use"
        },
        scales: {
            type: "array",
            items: { type: "number" },
            description: "Scale values for wavelet transform (optional, auto-generate if not provided)"
        },
        emit_plots: {
            type: "boolean",
            default: true,
            description: "Generate wavelet scalogram plot"
        },
        emit_csv: {
            type: "boolean",
            default: true,
            description: "Export wavelet coefficients as CSV"
        }
    },
    required: ["signal_data", "sample_rate"],
    additionalProperties: false
};
