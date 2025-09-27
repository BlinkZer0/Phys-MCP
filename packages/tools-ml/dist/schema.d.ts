/**
 * Phase 6: ML/AI Augmentation Tool Schemas
 * Provides symbolic regression, PDE surrogates, pattern recognition, and derivation explanation
 */
import { JSONSchema } from '@phys-mcp/mcp-types';
export interface MLMethodParams {
    method: 'symbolic_regression_train' | 'surrogate_pde_train' | 'pattern_recognition_infer' | 'explain_derivation';
}
export interface SymbolicRegressionParams extends MLMethodParams {
    method: 'symbolic_regression_train';
    X: string;
    y: string;
    features?: string[];
    ops?: string[];
    max_depth?: number;
    pop_size?: number;
    trials?: number;
    metric?: 'mse' | 'mae' | 'r2';
    seed?: number;
    use_pysr?: boolean;
}
export interface SurrogatePDEParams extends MLMethodParams {
    method: 'surrogate_pde_train';
    problem: 'pinn' | 'data';
    equations: string;
    domain: {
        bounds?: {
            [key: string]: [number, number];
        };
        boundary_conditions?: {
            [key: string]: any;
        };
        initial_conditions?: {
            [key: string]: any;
        };
    };
    train_data?: string;
    epochs?: number;
    batch_size?: number;
    lr?: number;
    animate?: boolean;
    fps?: number;
    format?: 'mp4' | 'webm' | 'gif';
}
export interface PatternRecognitionParams extends MLMethodParams {
    method: 'pattern_recognition_infer';
    task: 'detect' | 'segment' | 'classify';
    images: string[];
    model: string;
    threshold?: number;
    labels?: string[];
}
export interface ExplainDerivationParams extends MLMethodParams {
    method: 'explain_derivation';
    goal: 'derive' | 'explain';
    context_expr_sympy?: string;
    assumptions?: string[];
    audience_level?: 'undergrad' | 'grad' | 'expert';
}
export type MLAugmentationParams = SymbolicRegressionParams | SurrogatePDEParams | PatternRecognitionParams | ExplainDerivationParams;
export declare const symbolicRegressionSchema: JSONSchema;
export declare const surrogatePDESchema: JSONSchema;
export declare const patternRecognitionSchema: JSONSchema;
export declare const explainDerivationSchema: JSONSchema;
export declare const mlAugmentationSchema: JSONSchema;
export interface SymbolicRegressionResponse {
    expression_sympy: string;
    expression_latex: string;
    overlay_png_b64: string;
    residuals_png_b64: string;
    csv_prediction_path: string;
    meta: {
        device: string;
        cached: boolean;
        duration_ms: number;
        r2_score?: number;
        mse?: number;
        mae?: number;
    };
}
export interface SurrogatePDEResponse {
    model_path: string;
    training_curves_png_b64: string;
    pred_vs_truth_png_b64: string;
    error_heatmap_png_b64: string;
    animation_path?: string;
    meta: {
        device: string;
        epochs: number;
        early_stopped: boolean;
        final_loss: number;
        duration_ms: number;
    };
}
export interface PatternRecognitionResponse {
    annotated_images: string[];
    confusion_matrix_png_b64: string;
    metrics_json_path: string;
    meta: {
        device: string;
        cached: boolean;
        num_detections?: number;
        mean_confidence?: number;
        accuracy?: number;
    };
}
export interface ExplainDerivationResponse {
    latex: string;
    summary_md: string;
    meta: {
        tokens: number;
        model_used?: string;
        duration_ms: number;
    };
}
export type MLAugmentationResponse = SymbolicRegressionResponse | SurrogatePDEResponse | PatternRecognitionResponse | ExplainDerivationResponse;
