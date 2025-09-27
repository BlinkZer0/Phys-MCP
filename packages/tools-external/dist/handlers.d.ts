/**
 * Request handlers for External API tools
 */
export type ToolHandler = (params: any) => Promise<any>;
export declare const apiArxivHandler: ToolHandler;
export declare const apiCernHandler: ToolHandler;
export declare const apiNasaHandler: ToolHandler;
export declare const apiNistHandler: ToolHandler;
