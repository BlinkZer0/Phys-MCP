/**
 * Request handlers for Export tools
 */
export type ToolHandler = (params: any) => Promise<any>;
export declare const exportOverleafHandler: ToolHandler;
export declare const exportGithubHandler: ToolHandler;
export declare const exportZenodoHandler: ToolHandler;
export declare const exportJupyterHandler: ToolHandler;
export declare const exportVRHandler: ToolHandler;
