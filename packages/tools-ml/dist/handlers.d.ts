/**
 * Phase 6: ML/AI Augmentation Tool Handlers
 * Routes ML method calls to Python worker implementations
 */
import { MLAugmentationResponse, SymbolicRegressionParams, SurrogatePDEParams, PatternRecognitionParams, ExplainDerivationParams } from './schema.js';
type WorkerClient = {
    call: (method: string, params: Record<string, unknown>) => Promise<unknown>;
};
/**
 * Main handler for ML/AI augmentation tool
 * Routes to appropriate method based on the method parameter
 */
export declare function handleMLAugmentationTool(toolName: string, args: Record<string, unknown>): Promise<MLAugmentationResponse>;
/**
 * Legacy support for individual method calls
 * Maintains backward compatibility if individual tools were used
 */
export declare function createLegacyHandlers(pythonWorker: WorkerClient): {
    handleSymbolicRegressionTrain(params: Omit<SymbolicRegressionParams, "method">): Promise<MLAugmentationResponse>;
    handleSurrogatePDETrain(params: Omit<SurrogatePDEParams, "method">): Promise<MLAugmentationResponse>;
    handlePatternRecognitionInfer(params: Omit<PatternRecognitionParams, "method">): Promise<MLAugmentationResponse>;
    handleExplainDerivation(params: Omit<ExplainDerivationParams, "method">): Promise<MLAugmentationResponse>;
};
export {};
