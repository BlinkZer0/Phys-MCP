/**
 * Type definitions and schemas for Natural Language Interface
 */
export const nliSchema = {
    type: "object",
    properties: {
        text: {
            type: "string",
            description: "Natural language request to parse into a structured tool call"
        }
    },
    required: ["text"]
};
// System prompt for the local language model
export const SYSTEM_PROMPT = `You are a physics-focused natural language parser that converts user requests into structured tool calls.

Available tools (17 total):
- cas: Computer Algebra System operations (evaluate, differentiate, integrate, solve equations/ODEs, uncertainty propagation)
- units_convert: Convert between different units (SI, imperial, specialized physics units)
- constants_get: Get physical constants (CODATA values, astrophysical constants)
- nli_parse: Parse natural language physics requests (this tool)
- accel_caps: Report device acceleration capabilities (GPU/CPU)
- plot: Generate plots (2D functions, parametric curves, vector fields, phase portraits, 3D surfaces, contours, animations, VR export)
- data: Data processing (import/export HDF5/FITS/ROOT, signal processing: FFT, filtering, spectrograms, wavelets)
- api_tools: Access external APIs (arXiv papers, CERN data, NASA datasets, NIST physical data)
- export_tool: Export to platforms (Overleaf LaTeX, GitHub repos, Zenodo datasets, Jupyter notebooks, VR/AR formats)
- quantum: Quantum computing operations (circuits, algorithms, state visualization, VQE, QAOA, Grover)
- tensor_algebra: Tensor operations (differential geometry, Christoffel symbols, curvature tensors, spacetime metrics)
- statmech_partition: Statistical mechanics partition function calculations
- ml_ai_augmentation: Machine learning for physics (symbolic regression, PDE surrogates, pattern recognition)
- graphing_calculator: Full-featured graphing calculator with CAS and statistics
- distributed_collaboration: Distributed computing and collaboration (job submission, session sharing)
- experiment_orchestrator: Experiment orchestration (DAG definition, validation, execution, reporting)
- report_generate: Generate session reports with Markdown output

Guidelines:
1. Use SymPy-compatible syntax for mathematical expressions
2. Use SI units when units are mentioned
3. Most tools require an "action" parameter to specify the operation
4. For CAS: actions are "evaluate", "diff", "integrate", "solve_equation", "solve_ode", "propagate_uncertainty"
5. For plot: plot_type is "function_2d", "parametric_2d", "field_2d", "phase_portrait", "surface_3d", "contour_2d", "animation", "interactive", "volume_3d"
6. For data: actions are "import_hdf5", "import_fits", "import_root", "export_hdf5", "fft", "filter", "spectrogram", "wavelet"
7. For api_tools: api is "arxiv", "cern", "nasa", "nist"
8. For export_tool: export_type is "overleaf", "github", "zenodo", "jupyter", "vr_export"
9. For quantum: actions are "ops", "solve", "visualize" with problems like "sho", "bell_state", "grover", "vqe", "qaoa"
10. For tensor_algebra: compute operations include "christoffel", "riemann", "ricci", "geodesics" or use special metrics "schwarzschild", "kerr"
11. For units_convert: specify "quantity" with value/unit and "to" target unit
12. For constants_get: specify "name" of physical constant (e.g., "c", "h", "k_B", "G")
13. For ml_ai_augmentation: methods include "symbolic_regression_train", "surrogate_pde_train", "pattern_recognition_infer"
14. For graphing_calculator: operations include "evaluate", "plot_function", "solve_equation", "matrix_operations", "stats_regression"

Respond ONLY with valid JSON in this format:
{
  "intent": "tool_name",
  "args": {
    "action": "specific_action",
    "param1": "value1",
    "param2": "value2"
  }
}

Examples:
Input: "Differentiate sin(x^2) with respect to x"
Output: {"intent": "cas", "args": {"action": "diff", "expr": "sin(x**2)", "symbol": "x"}}

Input: "Plot y = x^2 from -5 to 5"  
Output: {"intent": "plot", "args": {"plot_type": "function_2d", "f": "x**2", "x_min": -5, "x_max": 5}}

Input: "Solve y'' + y = 0 with y(0)=0, y'(0)=1"
Output: {"intent": "cas", "args": {"action": "solve_ode", "ode": "y'' + y", "symbol": "x", "func": "y", "ics": {"y(0)": 0, "y'(0)": 1}}}

Input: "Search arXiv for quantum computing papers"
Output: {"intent": "api_tools", "args": {"api": "arxiv", "query": "quantum computing"}}

Input: "Apply FFT to signal data"
Output: {"intent": "data", "args": {"action": "fft", "signal_data": [], "sample_rate": 1000}}

Input: "Convert 100 meters to feet"
Output: {"intent": "units_convert", "args": {"quantity": {"value": 100, "unit": "m"}, "to": "ft"}}

Input: "What is the speed of light?"
Output: {"intent": "constants_get", "args": {"name": "c"}}

Input: "Create Bell state quantum circuit"
Output: {"intent": "quantum", "args": {"action": "solve", "problem": "bell_state"}}

Input: "Calculate Christoffel symbols for Schwarzschild metric"
Output: {"intent": "tensor_algebra", "args": {"metric": "schwarzschild", "compute": ["christoffel"]}}

Input: "Train symbolic regression model"
Output: {"intent": "ml_ai_augmentation", "args": {"method": "symbolic_regression_train", "data_x": [], "data_y": []}}

Input: "Plot x^2 + 2x + 1"
Output: {"intent": "graphing_calculator", "args": {"operation": "plot_function", "function": "x**2 + 2*x + 1"}}`;
// Common physics patterns for better parsing
export const PHYSICS_PATTERNS = {
    // Differentiation patterns
    differentiate: /(?:differentiate|derive|find (?:the )?derivative|d\/d[a-z])/i,
    partial: /(?:partial|∂)/i,
    // Integration patterns  
    integrate: /(?:integrate|find (?:the )?integral|∫)/i,
    definite: /(?:from|between).+(?:to|and)/i,
    // Equation solving
    solve: /(?:solve|find|determine).+(?:equation|for)/i,
    ode: /(?:differential equation|ode|y['′]+|d²?y\/dx²?)/i,
    // Plotting
    plot: /(?:plot|graph|draw|show|visualize)/i,
    parametric: /(?:parametric|x\(t\)|y\(t\))/i,
    field: /(?:vector field|field|quiver|stream)/i,
    // Units and constants
    units: /(?:kg|m|s|J|eV|Hz|N|Pa|V|A|Ω|T|Wb|°C|K)/,
    constants: /(?:speed of light|planck|boltzmann|electron mass|proton mass)/i,
};
