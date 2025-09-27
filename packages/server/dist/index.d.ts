#!/usr/bin/env node
/**
 * Physics MCP Server
 *
 * Main server that orchestrates CAS, Plot, and NLI tools for physics computations.
 * Communicates via JSON-RPC over stdio with MCP clients.
 */
declare let Server: any;
declare let StdioServerTransport: any;
declare let CallToolRequestSchema: any;
declare let ListToolsRequestSchema: any;
declare let InitializeRequestSchema: any;
declare let getPersistenceManagerFn: any;
declare let buildCASTools: any;
declare let handleCASTool: any;
declare let buildPlotTools: any;
declare let handlePlotTool: any;
declare let buildNLITools: any;
declare let handleNLITool: any;
declare let buildUnitsTools: any;
declare let handleUnitsTool: any;
declare let buildConstantsTools: any;
declare let handleConstantsTool: any;
declare let buildReportTools: any;
declare let buildTensorTools: any;
declare let handleTensorTool: any;
declare let buildQuantumTools: any;
declare let handleQuantumTool: any;
declare let buildStatmechTools: any;
declare let handleStatmechTool: any;
declare let buildDataIOTools: any;
declare let handleDataIOTool: any;
declare let buildExternalTools: any;
declare let handleExternalTool: any;
declare let buildExportTools: any;
declare let handleExportTool: any;
declare let buildMLTools: any;
declare let handleMLAugmentationTool: any;
declare let buildGraphingCalculatorTools: any;
declare let handleGraphingCalculatorTool: any;
declare let buildDistributedTools: any;
declare let handleDistributedCollaborationTool: any;
declare let buildOrchestratorTools: any;
declare let handleExperimentOrchestratorTool: any;
declare function initializeDependencies(): Promise<void>;
declare class PhysicsMCPServer {
    private server;
    private tools;
    constructor();
    private setupHandlers;
    start(): Promise<void>;
    private shutdown;
}
declare let serverInstance: PhysicsMCPServer | null;
declare function main(): Promise<void>;
declare const isMainModule: boolean | "";
declare function handleReportGenerate(args: any, pm: any, sessionId?: string): Promise<any>;
declare function persistArtifactsIfAny(name: string, result: any, pm: any, sessionId: string): Promise<any>;
