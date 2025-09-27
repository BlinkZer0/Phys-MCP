/**
 * Phase 6: ML/AI Augmentation Tool Schemas
 * Provides symbolic regression, PDE surrogates, pattern recognition, and derivation explanation
 */
// JSON Schema for symbolic regression
export const symbolicRegressionSchema = {
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
export const surrogatePDESchema = {
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
export const patternRecognitionSchema = {
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
export const explainDerivationSchema = {
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
export const mlAugmentationSchema = {
    type: 'object',
    oneOf: [
        symbolicRegressionSchema,
        surrogatePDESchema,
        patternRecognitionSchema,
        explainDerivationSchema
    ]
};
