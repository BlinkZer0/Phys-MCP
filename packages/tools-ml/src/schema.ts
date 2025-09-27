/**
 * Phase 6: ML/AI Augmentation Tool Schemas
 * Provides symbolic regression, PDE surrogates, pattern recognition, and derivation explanation
 */

import { JSONSchema } from '@phys-mcp/mcp-types';

// Base ML method parameter interface
export interface MLMethodParams {
  method: 'symbolic_regression_train' | 'surrogate_pde_train' | 'pattern_recognition_infer' | 'explain_derivation';
}

// Symbolic Regression Parameters
export interface SymbolicRegressionParams extends MLMethodParams {
  method: 'symbolic_regression_train';
  X: string; // Path to CSV/NPZ or inline base64 CSV; features
  y: string; // Path or base64; target
  features?: string[]; // Optional feature names
  ops?: string[]; // Operations: ["+","-","*","/","sin","cos","exp","log","pow"]
  max_depth?: number; // Default: 12
  pop_size?: number; // Default: 1000
  trials?: number; // Default: 1
  metric?: 'mse' | 'mae' | 'r2'; // Default: 'mse'
  seed?: number; // Default: 0
  use_pysr?: boolean; // Default: true
}

// Surrogate PDE Parameters
export interface SurrogatePDEParams extends MLMethodParams {
  method: 'surrogate_pde_train';
  problem: 'pinn' | 'data'; // Default: 'pinn'
  equations: string; // For PINN: PDE in symbolic form; For data: operator form or metadata
  domain: {
    bounds?: { [key: string]: [number, number] }; // Spatial/temporal bounds
    boundary_conditions?: { [key: string]: any }; // BC specifications
    initial_conditions?: { [key: string]: any }; // IC specifications
  };
  train_data?: string; // Optional path/base64 to (x,t,u) samples for data-driven
  epochs?: number; // Default: 200
  batch_size?: number; // Default: 1024
  lr?: number; // Default: 1e-3
  animate?: boolean; // Default: false
  fps?: number; // Default: 24
  format?: 'mp4' | 'webm' | 'gif'; // Default: 'mp4'
}

// Pattern Recognition Parameters
export interface PatternRecognitionParams extends MLMethodParams {
  method: 'pattern_recognition_infer';
  task: 'detect' | 'segment' | 'classify'; // Default: 'detect'
  images: string[]; // Paths or base64 images
  model: string; // Pretrained tag or path (e.g., 'yolo11n.pt' or 'unet_fluorescence.pt')
  threshold?: number; // Default: 0.25
  labels?: string[]; // Class labels
}

// Explain Derivation Parameters
export interface ExplainDerivationParams extends MLMethodParams {
  method: 'explain_derivation';
  goal: 'derive' | 'explain'; // Default: 'explain'
  context_expr_sympy?: string; // SymPy expression to explain/derive
  assumptions?: string[]; // Mathematical assumptions
  audience_level?: 'undergrad' | 'grad' | 'expert'; // Default: 'grad'
}

// Union type for all ML method parameters
export type MLAugmentationParams = 
  | SymbolicRegressionParams 
  | SurrogatePDEParams 
  | PatternRecognitionParams 
  | ExplainDerivationParams;

// JSON Schema for symbolic regression
export const symbolicRegressionSchema: JSONSchema = {
  type: 'object',
  properties: {
    method: { type: 'string', const: 'symbolic_regression_train' },
    X: { 
      type: 'string', 
      description: 'Path to CSV/NPZ or inline base64 CSV; features' 
    },
    y: { 
      type: 'string', 
      description: 'Path or base64; target' 
    },
    features: { 
      type: 'array', 
      items: { type: 'string' }, 
      description: 'Optional feature names' 
    },
    ops: { 
      type: 'array', 
      items: { type: 'string' }, 
      default: ['+', '-', '*', '/', 'sin', 'cos', 'exp', 'log', 'pow'],
      description: 'Mathematical operations to use in symbolic regression'
    },
    max_depth: { 
      type: 'integer', 
      default: 12,
      minimum: 1,
      maximum: 20,
      description: 'Maximum expression tree depth'
    },
    pop_size: { 
      type: 'integer', 
      default: 1000,
      minimum: 10,
      maximum: 10000,
      description: 'Population size for genetic programming'
    },
    trials: { 
      type: 'integer', 
      default: 1,
      minimum: 1,
      maximum: 10,
      description: 'Number of independent trials'
    },
    metric: { 
      type: 'string', 
      enum: ['mse', 'mae', 'r2'], 
      default: 'mse',
      description: 'Fitness metric for symbolic regression'
    },
    seed: { 
      type: 'integer', 
      default: 0,
      description: 'Random seed for reproducibility'
    },
    use_pysr: { 
      type: 'boolean', 
      default: true,
      description: 'Use PySR if available, otherwise fallback to internal SR'
    }
  },
  required: ['method', 'X', 'y'],
  additionalProperties: false
};

// JSON Schema for surrogate PDE
export const surrogatePDESchema: JSONSchema = {
  type: 'object',
  properties: {
    method: { type: 'string', const: 'surrogate_pde_train' },
    problem: { 
      type: 'string', 
      enum: ['pinn', 'data'], 
      default: 'pinn',
      description: 'PINN (physics-informed) or data-driven approach'
    },
    equations: { 
      type: 'string', 
      description: 'For PINN: PDE in symbolic form; For data: operator form or metadata' 
    },
    domain: { 
      type: 'object', 
      description: 'Bounds & BC/IC specs',
      properties: {
        bounds: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2,
            maxItems: 2
          },
          description: 'Spatial/temporal domain bounds'
        },
        boundary_conditions: {
          type: 'object',
          description: 'Boundary condition specifications'
        },
        initial_conditions: {
          type: 'object',
          description: 'Initial condition specifications'
        }
      }
    },
    train_data: { 
      type: 'string', 
      description: 'Optional path/base64 to (x,t,u) samples for data-driven' 
    },
    epochs: { 
      type: 'integer', 
      default: 200,
      minimum: 1,
      maximum: 10000,
      description: 'Training epochs'
    },
    batch_size: { 
      type: 'integer', 
      default: 1024,
      minimum: 1,
      maximum: 65536,
      description: 'Training batch size'
    },
    lr: { 
      type: 'number', 
      default: 1e-3,
      minimum: 1e-6,
      maximum: 1.0,
      description: 'Learning rate'
    },
    animate: { 
      type: 'boolean', 
      default: false,
      description: 'Generate field animation'
    },
    fps: { 
      type: 'integer', 
      default: 24,
      minimum: 1,
      maximum: 60,
      description: 'Animation frames per second'
    },
    format: { 
      type: 'string', 
      enum: ['mp4', 'webm', 'gif'], 
      default: 'mp4',
      description: 'Animation output format'
    }
  },
  required: ['method', 'problem', 'equations', 'domain'],
  additionalProperties: false
};

// JSON Schema for pattern recognition
export const patternRecognitionSchema: JSONSchema = {
  type: 'object',
  properties: {
    method: { type: 'string', const: 'pattern_recognition_infer' },
    task: { 
      type: 'string', 
      enum: ['detect', 'segment', 'classify'], 
      default: 'detect',
      description: 'Computer vision task type'
    },
    images: { 
      type: 'array', 
      items: { type: 'string' }, 
      description: 'Paths or base64 images',
      minItems: 1
    },
    model: { 
      type: 'string', 
      description: 'Pretrained tag or path (e.g., "yolo11n.pt" or "unet_fluorescence.pt")' 
    },
    threshold: { 
      type: 'number', 
      default: 0.25,
      minimum: 0.0,
      maximum: 1.0,
      description: 'Detection/classification confidence threshold'
    },
    labels: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Class labels for classification/detection'
    }
  },
  required: ['method', 'task', 'images', 'model'],
  additionalProperties: false
};

// JSON Schema for explain derivation
export const explainDerivationSchema: JSONSchema = {
  type: 'object',
  properties: {
    method: { type: 'string', const: 'explain_derivation' },
    goal: { 
      type: 'string', 
      enum: ['derive', 'explain'], 
      default: 'explain',
      description: 'Derive new result or explain existing one'
    },
    context_expr_sympy: { 
      type: 'string', 
      description: 'SymPy expression to explain/derive from'
    },
    assumptions: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Mathematical assumptions and constraints'
    },
    audience_level: { 
      type: 'string', 
      enum: ['undergrad', 'grad', 'expert'], 
      default: 'grad',
      description: 'Target audience complexity level'
    }
  },
  required: ['method', 'goal'],
  additionalProperties: false
};

// Consolidated ML augmentation schema
export const mlAugmentationSchema: JSONSchema = {
  type: 'object',
  oneOf: [
    symbolicRegressionSchema,
    surrogatePDESchema,
    patternRecognitionSchema,
    explainDerivationSchema
  ]
};

// Response interfaces
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

export type MLAugmentationResponse = 
  | SymbolicRegressionResponse 
  | SurrogatePDEResponse 
  | PatternRecognitionResponse 
  | ExplainDerivationResponse;
