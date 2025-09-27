/**
 * Request handlers for Signal Processing tools
 */
export type ToolHandler = (params: any) => Promise<any>;
export declare const dataFftHandler: ToolHandler;
export declare const dataFilterHandler: ToolHandler;
export declare const dataSpectrogramHandler: ToolHandler;
export declare const dataWaveletHandler: ToolHandler;
