/**
 * Phase 6: ML/AI Augmentation Tool Package
 * Exports schemas, handlers, and tool definitions for machine learning capabilities
 */

export * from './schema.js';
export * from './handlers.js';

import { Tool } from '@phys-mcp/mcp-types';
import { mlAugmentationSchema } from './schema.js';

/**
 * ML/AI Augmentation tool definition
 * Single consolidated tool with multiple ML methods
 */
export const mlAugmentationTool: Tool = {
  name: 'ml_ai_augmentation',
  description: `🧠 **ML/AI Augmentation Tool** - GPU-first machine learning capabilities for scientific computing with graphics-first outputs. Provides symbolic regression, PDE surrogates, pattern recognition, and derivation explanation.

**Methods Available:**
- **symbolic_regression_train**: Discover interpretable equations from data using PySR or genetic programming
- **surrogate_pde_train**: Train physics-informed neural networks (PINNs) or data-driven PDE surrogates  
- **pattern_recognition_infer**: Detection/segmentation/classification on scientific imagery using YOLO/U-Net
- **explain_derivation**: LLM-powered mathematical derivation and explanation with LaTeX output

**GPU Acceleration:**
- Automatic device selection (CUDA/HIP/MPS/XPU) with CPU fallback
- VRAM monitoring and automatic batch size adjustment
- Memory-efficient processing with configurable caps

**Graphics-First Outputs:**
- Training curves and loss plots for all methods
- Prediction vs truth overlays and error visualizations  
- Confusion matrices for classification tasks
- Optional MP4/WebM/GIF animations for PDE field evolution
- Professional LaTeX formatting for mathematical explanations

**Key Features:**
- Caching by parameter hash for reproducibility
- Early stopping and timeout protection
- Comprehensive error handling and validation
- Integration with Phase 5 visualization pipeline
- Natural language interface ready`,
  inputSchema: mlAugmentationSchema
};

/**
 * Build all ML tools (currently just the consolidated tool)
 */
export function buildMLTools(): Tool[] {
  return [mlAugmentationTool];
}

/**
 * Legacy tool names for backward compatibility
 * Maps individual method names to consolidated tool calls
 */
export const legacyMLToolNames = [
  'symbolic_regression_train',
  'surrogate_pde_train', 
  'pattern_recognition_infer',
  'explain_derivation'
] as const;

export type LegacyMLToolName = typeof legacyMLToolNames[number];
