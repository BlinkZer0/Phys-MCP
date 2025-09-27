/**
 * JSON Schema definitions for Signal Processing tools
 */
export declare const dataFftSchema: {
    readonly type: "object";
    readonly properties: {
        readonly signal_data: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
            readonly description: "Input signal data array";
        };
        readonly sample_rate: {
            readonly type: "number";
            readonly description: "Sample rate in Hz";
        };
        readonly window: {
            readonly type: "string";
            readonly enum: readonly ["hann", "hamming", "blackman", "bartlett", "none"];
            readonly default: "hann";
            readonly description: "Window function to apply before FFT";
        };
        readonly emit_plots: {
            readonly type: "boolean";
            readonly default: true;
            readonly description: "Generate comprehensive FFT analysis plots";
        };
        readonly emit_csv: {
            readonly type: "boolean";
            readonly default: true;
            readonly description: "Export frequency and spectrum data as CSV";
        };
    };
    readonly required: readonly ["signal_data", "sample_rate"];
    readonly additionalProperties: false;
};
export declare const dataFilterSchema: {
    readonly type: "object";
    readonly properties: {
        readonly signal_data: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
            readonly description: "Input signal data array";
        };
        readonly sample_rate: {
            readonly type: "number";
            readonly description: "Sample rate in Hz";
        };
        readonly filter_type: {
            readonly type: "string";
            readonly enum: readonly ["lowpass", "highpass", "bandpass", "bandstop"];
            readonly description: "Type of filter to apply";
        };
        readonly cutoff_freq: {
            readonly oneOf: readonly [{
                readonly type: "number";
            }, {
                readonly type: "array";
                readonly items: {
                    readonly type: "number";
                };
                readonly minItems: 2;
                readonly maxItems: 2;
            }];
            readonly description: "Cutoff frequency (Hz) or [low, high] for bandpass/bandstop";
        };
        readonly filter_order: {
            readonly type: "integer";
            readonly default: 4;
            readonly minimum: 1;
            readonly maximum: 10;
            readonly description: "Filter order (higher = steeper rolloff)";
        };
        readonly emit_plots: {
            readonly type: "boolean";
            readonly default: true;
            readonly description: "Generate filter response and comparison plots";
        };
        readonly emit_csv: {
            readonly type: "boolean";
            readonly default: true;
            readonly description: "Export filtered signal data as CSV";
        };
    };
    readonly required: readonly ["signal_data", "sample_rate", "filter_type", "cutoff_freq"];
    readonly additionalProperties: false;
};
export declare const dataSpectrogramSchema: {
    readonly type: "object";
    readonly properties: {
        readonly signal_data: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
            readonly description: "Input signal data array";
        };
        readonly sample_rate: {
            readonly type: "number";
            readonly description: "Sample rate in Hz";
        };
        readonly window_size: {
            readonly type: "integer";
            readonly default: 256;
            readonly description: "Window size for STFT";
        };
        readonly overlap: {
            readonly type: "number";
            readonly default: 0.5;
            readonly minimum: 0;
            readonly maximum: 0.95;
            readonly description: "Window overlap fraction";
        };
        readonly window_type: {
            readonly type: "string";
            readonly enum: readonly ["hann", "hamming", "blackman", "bartlett"];
            readonly default: "hann";
            readonly description: "Window function for STFT";
        };
        readonly emit_plots: {
            readonly type: "boolean";
            readonly default: true;
            readonly description: "Generate time-frequency spectrogram plot";
        };
        readonly emit_csv: {
            readonly type: "boolean";
            readonly default: true;
            readonly description: "Export spectrogram data as CSV";
        };
    };
    readonly required: readonly ["signal_data", "sample_rate"];
    readonly additionalProperties: false;
};
export declare const dataWaveletSchema: {
    readonly type: "object";
    readonly properties: {
        readonly signal_data: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
            readonly description: "Input signal data array";
        };
        readonly sample_rate: {
            readonly type: "number";
            readonly description: "Sample rate in Hz";
        };
        readonly wavelet: {
            readonly type: "string";
            readonly enum: readonly ["morlet", "mexican_hat", "daubechies", "haar"];
            readonly default: "morlet";
            readonly description: "Wavelet function to use";
        };
        readonly scales: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
            readonly description: "Scale values for wavelet transform (optional, auto-generate if not provided)";
        };
        readonly emit_plots: {
            readonly type: "boolean";
            readonly default: true;
            readonly description: "Generate wavelet scalogram plot";
        };
        readonly emit_csv: {
            readonly type: "boolean";
            readonly default: true;
            readonly description: "Export wavelet coefficients as CSV";
        };
    };
    readonly required: readonly ["signal_data", "sample_rate"];
    readonly additionalProperties: false;
};
