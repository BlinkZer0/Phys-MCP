/**
 * Request handlers for Data I/O tools
 */
export type ToolHandler = (params: any) => Promise<any>;
export declare const dataImportHdf5Handler: ToolHandler;
export declare const dataImportFitsHandler: ToolHandler;
export declare const dataImportRootHandler: ToolHandler;
export declare const dataExportHdf5Handler: ToolHandler;
