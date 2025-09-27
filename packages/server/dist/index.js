#!/usr/bin/env node
"use strict";
/**
 * Physics MCP Server
 *
 * Main server that orchestrates CAS, Plot, and NLI tools for physics computations.
 * Communicates via JSON-RPC over stdio with MCP clients.
 */
let Server;
let StdioServerTransport;
let CallToolRequestSchema;
let ListToolsRequestSchema;
let InitializeRequestSchema;
let getPersistenceManagerFn;
// Tool handlers - these will be set during initialization
let buildCASTools;
let handleCASTool;
let buildPlotTools;
let handlePlotTool;
let buildNLITools;
let handleNLITool;
let buildUnitsTools;
let handleUnitsTool;
let buildConstantsTools;
let handleConstantsTool;
let buildReportTools;
let buildTensorTools;
let handleTensorTool;
let buildQuantumTools;
let handleQuantumTool;
let buildStatmechTools;
let handleStatmechTool;
// Phase 4 tool handlers
let buildDataIOTools;
let handleDataIOTool;
let buildExternalTools;
let handleExternalTool;
let buildExportTools;
let handleExportTool;
// Phase 6 ML tool handlers
let buildMLTools;
let handleMLAugmentationTool;
// Graphing Calculator tool handlers
let buildGraphingCalculatorTools;
let handleGraphingCalculatorTool;
// Phase 7 & 8 tool handlers
let buildDistributedTools;
let handleDistributedCollaborationTool;
let buildOrchestratorTools;
let handleExperimentOrchestratorTool;
async function initializeDependencies() {
    try {
        console.log("🔧 Loading MCP SDK...");
        // Use the official MCP SDK
        const serverModule = await import("@modelcontextprotocol/sdk/server/index.js");
        const stdioModule = await import("@modelcontextprotocol/sdk/server/stdio.js");
        const typesModule = await import("@modelcontextprotocol/sdk/types.js");
        console.log("🔧 MCP SDK modules loaded, setting up exports...");
        Server = serverModule.Server;
        StdioServerTransport = stdioModule.StdioServerTransport;
        CallToolRequestSchema = typesModule.CallToolRequestSchema;
        ListToolsRequestSchema = typesModule.ListToolsRequestSchema;
        InitializeRequestSchema = typesModule.InitializeRequestSchema;
        console.log("🔧 MCP SDK setup complete");
        console.log("🔧 Server class:", typeof Server);
    }
    catch (error) {
        console.error("Failed to load MCP SDK:", error);
        throw error;
    }
    try {
        const casModule = await import("../../tools-cas/dist/index.js");
        buildCASTools = casModule.buildCASTools;
        handleCASTool = casModule.handleCASTool;
    }
    catch (error) {
        console.warn("CAS tools not available:", error);
    }
    try {
        const plotModule = await import("../../tools-plot/dist/index.js");
        buildPlotTools = plotModule.buildPlotTools;
        handlePlotTool = plotModule.handlePlotTool;
    }
    catch (error) {
        console.warn("Plot tools not available:", error);
    }
    try {
        const nliModule = await import("../../tools-nli/dist/index.js");
        buildNLITools = nliModule.buildNLITools;
        handleNLITool = nliModule.handleNLITool;
    }
    catch (error) {
        console.warn("NLI tools not available:", error);
    }
    try {
        const unitsModule = await import("../../tools-units/dist/index.js");
        buildUnitsTools = unitsModule.buildUnitsTools;
        handleUnitsTool = unitsModule.handleUnitsTool;
    }
    catch (error) {
        console.warn("Units tools not available:", error);
    }
    try {
        const constantsModule = await import("../../tools-constants/dist/index.js");
        buildConstantsTools = constantsModule.buildConstantsTools;
        handleConstantsTool = constantsModule.handleConstantsTool;
    }
    catch (error) {
        console.warn("Constants tools not available:", error);
    }
    // Optional: reporting tools (schema only, local handler lives in server)
    try {
        const reportPath = "../../tools-report/dist/index.js";
        const reportModule = await import(reportPath);
        buildReportTools = reportModule.buildReportTools;
    }
    catch (error) {
        console.warn("Report tools not available:", error);
    }
    // Phase 3 tool packages (optional scaffolding)
    try {
        const tensorPath = "../../tools-tensor/dist/index.js";
        const tensorModule = await import(tensorPath);
        buildTensorTools = tensorModule.buildTensorTools;
        handleTensorTool = tensorModule.handleTensorTool;
    }
    catch (error) {
        console.warn("Tensor tools not available:", error);
    }
    try {
        const quantumPath = "../../tools-quantum/dist/index.js";
        const quantumModule = await import(quantumPath);
        buildQuantumTools = quantumModule.buildQuantumTools;
        handleQuantumTool = quantumModule.handleQuantumTool;
    }
    catch (error) {
        console.warn("Quantum tools not available:", error);
    }
    try {
        const statmechPath = "../../tools-statmech/dist/index.js";
        const statmechModule = await import(statmechPath);
        buildStatmechTools = statmechModule.buildStatmechTools;
        handleStatmechTool = statmechModule.handleStatmechTool;
    }
    catch (error) {
        console.warn("StatMech tools not available:", error);
    }
    // Phase 4 tool packages
    try {
        const dataIOPath = "../../tools-data-io/dist/index.js";
        const dataIOModule = await import(dataIOPath);
        buildDataIOTools = dataIOModule.buildDataIOTools;
        handleDataIOTool = dataIOModule.handleDataIOTool;
    }
    catch (error) {
        console.warn("Data I/O tools not available:", error);
    }
    // Signal tools are now consolidated under the 'data' tool
    // The tools-signal package is still used for handlers but not for tool registration
    try {
        const externalPath = "../../tools-external/dist/index.js";
        const externalModule = await import(externalPath);
        buildExternalTools = externalModule.buildExternalTools;
        handleExternalTool = externalModule.handleExternalTool;
    }
    catch (error) {
        console.warn("External API tools not available:", error);
    }
    try {
        const exportPath = "../../tools-export/dist/index.js";
        const exportModule = await import(exportPath);
        buildExportTools = exportModule.buildExportTools;
        handleExportTool = exportModule.handleExportTool;
    }
    catch (error) {
        console.warn("Export tools not available:", error);
    }
    // Phase 6 ML tools
    try {
        const mlPath = "../../tools-ml/dist/index.js";
        const mlModule = await import(mlPath);
        buildMLTools = mlModule.buildMLTools;
        handleMLAugmentationTool = mlModule.handleMLAugmentationTool;
    }
    catch (error) {
        console.warn("ML tools not available:", error);
    }
    // Graphing Calculator tools
    try {
        const graphingCalcPath = "../../tools-graphing-calculator/dist/index.js";
        const graphingCalcModule = await import(graphingCalcPath);
        buildGraphingCalculatorTools = graphingCalcModule.buildGraphingCalculatorTools;
        handleGraphingCalculatorTool = graphingCalcModule.handleGraphingCalculatorTool;
    }
    catch (error) {
        console.warn("Graphing Calculator tools not available:", error);
    }
    // Phase 7 & 8 tools
    try {
        const distributedPath = "../../tools-distributed/dist/index.js";
        const distributedModule = await import(distributedPath);
        buildDistributedTools = distributedModule.buildDistributedTools;
        handleDistributedCollaborationTool = distributedModule.handleDistributedCollaborationTool;
    }
    catch (error) {
        console.warn("Distributed collaboration tools not available:", error);
    }
    try {
        const orchestratorPath = "../../tools-orchestrator/dist/index.js";
        const orchestratorModule = await import(orchestratorPath);
        buildOrchestratorTools = orchestratorModule.buildOrchestratorTools;
        handleExperimentOrchestratorTool = orchestratorModule.handleExperimentOrchestratorTool;
    }
    catch (error) {
        console.warn("Experiment orchestrator tools not available:", error);
    }
    // Persistence manager
    try {
        const persistModule = await import("./persist.js");
        getPersistenceManagerFn = persistModule.getPersistenceManager;
    }
    catch (error) {
        console.warn("Persistence layer not available:", error);
    }
}
class PhysicsMCPServer {
    server;
    tools = [];
    constructor() {
        console.log("🔧 Creating MCP Server instance...");
        this.server = new Server({
            name: "phys-mcp",
            version: "0.1.0",
        }, {
            capabilities: {
                tools: {}
            }
        });
        console.log("🔧 MCP Server instance created");
        // Collect all available tools
        console.log("🔧 Loading tools...");
        try {
            // Core physics tools
            if (buildCASTools) {
                console.log("🔧 Loading CAS tools...");
                this.tools.push(...buildCASTools());
            }
            if (buildUnitsTools) {
                console.log("🔧 Loading Units tools...");
                this.tools.push(...buildUnitsTools());
            }
            if (buildConstantsTools) {
                console.log("🔧 Loading Constants tools...");
                this.tools.push(...buildConstantsTools());
            }
            if (buildPlotTools) {
                console.log("🔧 Loading Plot tools...");
                this.tools.push(...buildPlotTools());
            }
            if (buildNLITools) {
                console.log("🔧 Loading NLI tools...");
                this.tools.push(...buildNLITools());
            }
            // Phase 3 tools (scaffolding)
            if (buildTensorTools) {
                console.log("🔧 Loading Tensor tools...");
                this.tools.push(...buildTensorTools());
            }
            if (buildQuantumTools) {
                console.log("🔧 Loading Quantum tools...");
                this.tools.push(...buildQuantumTools());
            }
            if (buildStatmechTools) {
                console.log("🔧 Loading StatMech tools...");
                this.tools.push(...buildStatmechTools());
            }
            // Phase 4 tools
            if (buildDataIOTools) {
                console.log("🔧 Loading Data I/O tools...");
                this.tools.push(...buildDataIOTools());
            }
            // Signal tools are now consolidated under the 'data' tool
            // Individual signal tools (data_fft, data_filter, etc.) are supported via legacy routing
            if (buildExternalTools) {
                console.log("🔧 Loading External API tools...");
                this.tools.push(...buildExternalTools());
            }
            if (buildExportTools) {
                console.log("🔧 Loading Export tools...");
                this.tools.push(...buildExportTools());
            }
            // Phase 6 ML tools
            if (buildMLTools) {
                console.log("🔧 Loading ML tools...");
                this.tools.push(...buildMLTools());
            }
            // Graphing Calculator tools
            if (buildGraphingCalculatorTools) {
                console.log("🔧 Loading Graphing Calculator tools...");
                this.tools.push(...buildGraphingCalculatorTools());
            }
            // Phase 7 & 8 tools
            if (buildDistributedTools) {
                console.log("🔧 Loading Distributed Collaboration tools...");
                this.tools.push(...buildDistributedTools());
            }
            if (buildOrchestratorTools) {
                console.log("🔧 Loading Experiment Orchestrator tools...");
                this.tools.push(...buildOrchestratorTools());
            }
            // Report tools (local handler)
            if (buildReportTools) {
                console.log("🔧 Loading Report tools...");
                this.tools.push(...buildReportTools());
            }
            console.log("🔧 Setting up handlers...");
            this.setupHandlers();
            console.log("🔧 PhysicsMCPServer constructor complete");
        }
        catch (error) {
            console.error("❌ Error in PhysicsMCPServer constructor:", error);
            throw error;
        }
    }
    setupHandlers() {
        // Handle MCP initialization
        this.server.setRequestHandler(InitializeRequestSchema, async (request) => {
            return {
                protocolVersion: "2024-11-05",
                capabilities: {
                    tools: {},
                },
                serverInfo: {
                    name: "phys-mcp",
                    version: "0.1.0",
                },
            };
        });
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: this.tools,
            };
        });
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            // Prepare persistence
            const pm = typeof getPersistenceManagerFn === 'function' ? getPersistenceManagerFn() : null;
            const sessionIdArg = (args && args.session_id) ? args.session_id : undefined;
            const sessionId = pm ? pm.ensureSession(sessionIdArg) : sessionIdArg;
            try {
                let result;
                // Local handler for report generation
                if (name === "report_generate") {
                    result = await handleReportGenerate(args, pm, sessionId);
                }
                // Route to appropriate tool handler - consolidated tools
                else if (name === "cas" && handleCASTool) {
                    result = await handleCASTool(name, args);
                }
                else if (name === "plot" && handlePlotTool) {
                    result = await handlePlotTool(name, args);
                }
                else if (name === "data" && handleDataIOTool) {
                    result = await handleDataIOTool(name, args);
                }
                else if (name === "api_tools" && handleExternalTool) {
                    result = await handleExternalTool(name, args);
                }
                else if (name === "export_tool" && handleExportTool) {
                    result = await handleExportTool(name, args);
                }
                else if (name === "quantum" && handleQuantumTool) {
                    result = await handleQuantumTool(name, args);
                }
                else if (name === "ml_ai_augmentation" && handleMLAugmentationTool) {
                    result = await handleMLAugmentationTool(name, args);
                }
                else if (name === "graphing_calculator" && handleGraphingCalculatorTool) {
                    result = await handleGraphingCalculatorTool(name, args);
                }
                else if (name === "distributed_collaboration" && handleDistributedCollaborationTool) {
                    result = await handleDistributedCollaborationTool(name, args);
                }
                else if (name === "experiment_orchestrator" && handleExperimentOrchestratorTool) {
                    result = await handleExperimentOrchestratorTool(name, args);
                }
                // Legacy support for individual tool names
                else if (name.startsWith("cas_") && handleCASTool) {
                    result = await handleCASTool(name, args);
                }
                else if (name.startsWith("plot_") && handlePlotTool) {
                    result = await handlePlotTool(name, args);
                }
                else if (name.startsWith("nli_") && handleNLITool) {
                    result = await handleNLITool(name, args);
                }
                else if (name.startsWith("units_") && handleUnitsTool) {
                    result = await handleUnitsTool(name, args);
                }
                else if (name.startsWith("constants_") && handleConstantsTool) {
                    result = await handleConstantsTool(name, args);
                }
                else if (name.startsWith("tensor_") && handleTensorTool) {
                    result = await handleTensorTool(name, args);
                }
                else if (name.startsWith("quantum_") && handleQuantumTool) {
                    result = await handleQuantumTool(name, args);
                }
                else if (name.startsWith("statmech_") && handleStatmechTool) {
                    result = await handleStatmechTool(name, args);
                }
                else if (name.startsWith("data_") && handleDataIOTool) {
                    // Route all data tools to consolidated data handler
                    result = await handleDataIOTool(name, args);
                }
                else if (name.startsWith("api_") && handleExternalTool) {
                    result = await handleExternalTool(name, args);
                }
                else if (name.startsWith("export_") && handleExportTool) {
                    result = await handleExportTool(name, args);
                }
                else if ((name === "symbolic_regression_train" || name === "surrogate_pde_train" ||
                    name === "pattern_recognition_infer" || name === "explain_derivation") && handleMLAugmentationTool) {
                    result = await handleMLAugmentationTool(name, args);
                }
                else if (name.startsWith("calculator_") && handleGraphingCalculatorTool) {
                    // Route legacy calculator tools to the main graphing_calculator tool
                    const operation = name.replace("calculator_", "");
                    const updatedArgs = { ...args, operation };
                    result = await handleGraphingCalculatorTool("graphing_calculator", updatedArgs);
                }
                else if ((name === "job_submit" || name === "session_share" ||
                    name === "lab_notebook" || name === "artifact_versioning") && handleDistributedCollaborationTool) {
                    result = await handleDistributedCollaborationTool(name, args);
                }
                else if ((name === "define_dag" || name === "validate_dag" || name === "run_dag" ||
                    name === "publish_report" || name === "collaborate_share") && handleExperimentOrchestratorTool) {
                    result = await handleExperimentOrchestratorTool(name, args);
                }
                else {
                    throw new Error(`Unknown tool: ${name}`);
                }
                // Save artifacts for common plot outputs
                let augmented = result;
                if (pm && sessionId) {
                    augmented = await persistArtifactsIfAny(name, result, pm, sessionId);
                    // Record event
                    try {
                        pm.recordEvent(sessionId, name, args, augmented);
                    }
                    catch (e) {
                        console.warn("Failed to record event:", e);
                    }
                }
                // Include session_id for client convenience
                const payload = (pm && sessionId)
                    ? { ...augmented, session_id: sessionId }
                    : augmented;
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(payload, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`Tool execution error for ${name}:`, error);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error executing ${name}: ${errorMessage}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async start() {
        const transport = new StdioServerTransport();
        // Handle graceful shutdown
        process.on("SIGINT", () => this.shutdown());
        process.on("SIGTERM", () => this.shutdown());
        console.log("🚀 Physics MCP Server starting...");
        console.log(`📊 Loaded ${this.tools.length} tools:`);
        for (const tool of this.tools) {
            console.log(`  - ${tool.name}: ${tool.description}`);
        }
        console.log("🎯 Server ready for connections");
        await this.server.connect(transport);
    }
    shutdown() {
        console.error("🛑 Shutting down Physics MCP Server...");
        // Cleanup Python worker if available
        if (handleCASTool && handleCASTool.shutdownWorkerClient) {
            handleCASTool.shutdownWorkerClient();
        }
        // Clear singleton references
        serverInstance = null;
        process.env.PHYS_MCP_SERVER_RUNNING = 'false';
        process.exit(0);
    }
}
// Singleton to prevent multiple server instances
let serverInstance = null;
// Process-level singleton to prevent multiple instances across imports
if (process.env.PHYS_MCP_SERVER_RUNNING === 'true') {
    console.error("⚠️ Phys-MCP server already running in this process");
    process.exit(0);
}
process.env.PHYS_MCP_SERVER_RUNNING = 'true';
// Start the server
async function main() {
    // Prevent multiple instances
    if (serverInstance) {
        console.error("⚠️ Server instance already running");
        return;
    }
    await initializeDependencies();
    try {
        serverInstance = new PhysicsMCPServer();
        await serverInstance.start();
    }
    catch (error) {
        console.error("❌ Failed to start Physics MCP Server:", error);
        serverInstance = null;
        process.exit(1);
    }
}
// Only run if this is the main module
const isMainModule = process.argv[1] && process.argv[1].endsWith('index.js');
if (isMainModule) {
    main().catch((error) => {
        console.error("❌ Unhandled error:", error);
        process.exit(1);
    });
}
// --- Helpers ---
async function handleReportGenerate(args, pm, sessionId) {
    if (!pm) {
        throw new Error("Persistence layer not available; cannot generate reports");
    }
    const { randomUUID } = await import('node:crypto');
    const fs = await import('node:fs');
    const sid = sessionId || (args && args.session_id);
    if (!sid) {
        throw new Error("report_generate requires 'session_id'");
    }
    const format = (args && args.format) || 'markdown';
    const title = (args && args.title) || 'Physics MCP Session Report';
    const author = (args && args.author) || '';
    const include = (args && args.include) || ["cas", "plots", "constants", "units"]; // advisory only for now
    // Gather session data
    const events = pm.getSessionEvents(sid) || [];
    const artifacts = pm.getSessionArtifacts(sid) || [];
    const now = new Date().toISOString();
    // Build Markdown report
    let md = `# ${title}\n\n`;
    if (author)
        md += `Author: ${author}\n\n`;
    md += `Generated: ${now}\n\n`;
    md += `Session ID: ${sid}\n\n`;
    md += `## Summary\n`;
    md += `- Total events: ${events.length}\n`;
    md += `- Total artifacts: ${artifacts.length}\n\n`;
    md += `## Events\n`;
    for (const ev of events) {
        md += `- Tool: ${ev.tool_name} at ${new Date(ev.ts).toISOString()}\n`;
        try {
            const inputObj = JSON.parse(ev.input_json);
            md += "  - Input:\n\n";
            md += "```json\n" + JSON.stringify(inputObj, null, 2) + "\n```\n";
        }
        catch { }
        try {
            const outputObj = JSON.parse(ev.output_json);
            md += "  - Output:\n\n";
            md += "```json\n" + JSON.stringify(outputObj, null, 2) + "\n```\n";
        }
        catch { }
    }
    md += `\n## Artifacts\n`;
    for (const a of artifacts) {
        md += `- ${a.kind}: ${a.path}\n`;
    }
    const filename = `report-${randomUUID()}.md`;
    const reportPath = pm.getArtifactPath(sid, filename);
    fs.writeFileSync(reportPath, md, { encoding: 'utf-8' });
    // Record artifact in DB
    pm.recordArtifact(sid, 'report_markdown', reportPath, { title, author, format, include });
    const stats = fs.statSync(reportPath);
    return {
        report_path: reportPath,
        format: 'markdown',
        bytes: stats.size,
        session_id: sid,
        title,
        author
    };
}
async function persistArtifactsIfAny(name, result, pm, sessionId) {
    if (!result || typeof result !== 'object')
        return result;
    const fs = await import('node:fs');
    const { randomUUID } = await import('node:crypto');
    const artifactsMeta = [];
    // Save PNG image if present
    if (result.image_png_b64) {
        try {
            const imgBuffer = Buffer.from(result.image_png_b64, 'base64');
            const pngName = `${name}-${randomUUID()}.png`;
            const pngPath = pm.getArtifactPath(sessionId, pngName);
            fs.writeFileSync(pngPath, imgBuffer);
            pm.recordArtifact(sessionId, 'plot_image', pngPath, { tool: name });
            artifactsMeta.push({ kind: 'plot_image', path: pngPath });
            // Remove inline base64 to reduce payload; keep a small preview? For now, keep it and also attach path.
        }
        catch (e) {
            console.warn('Failed to persist PNG artifact:', e);
        }
    }
    // Save CSV if present
    if (result.csv_data) {
        try {
            const csvName = `${name}-${randomUUID()}.csv`;
            const csvPath = pm.getArtifactPath(sessionId, csvName);
            fs.writeFileSync(csvPath, result.csv_data, { encoding: 'utf-8' });
            pm.recordArtifact(sessionId, 'plot_csv', csvPath, { tool: name });
            artifactsMeta.push({ kind: 'plot_csv', path: csvPath });
        }
        catch (e) {
            console.warn('Failed to persist CSV artifact:', e);
        }
    }
    // Save SVG if present
    if (result.image_svg) {
        try {
            const svgName = `${name}-${randomUUID()}.svg`;
            const svgPath = pm.getArtifactPath(sessionId, svgName);
            fs.writeFileSync(svgPath, result.image_svg, { encoding: 'utf-8' });
            pm.recordArtifact(sessionId, 'plot_svg', svgPath, { tool: name });
            artifactsMeta.push({ kind: 'plot_svg', path: svgPath });
        }
        catch (e) {
            console.warn('Failed to persist SVG artifact:', e);
        }
    }
    if (artifactsMeta.length) {
        return { ...result, artifacts: artifactsMeta };
    }
    return result;
}
