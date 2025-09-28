/**
 * Type definitions and schemas for Natural Language Interface
 */
export interface NLIParams {
    text: string;
}
export interface NLIResult {
    intent: string;
    args: Record<string, any>;
    confidence?: number;
    explanation?: string;
}
export type SupportedIntent = "cas" | "units_convert" | "constants_get" | "nli_parse" | "accel_caps" | "plot" | "data" | "api_tools" | "export_tool" | "quantum" | "tensor_algebra" | "statmech_partition" | "ml_ai_augmentation" | "graphing_calculator" | "distributed_collaboration" | "experiment_orchestrator" | "report_generate" | "unknown";
export declare const nliSchema: {
    readonly type: "object";
    readonly properties: {
        readonly text: {
            readonly type: "string";
            readonly description: "Natural language request to parse into a structured tool call";
        };
    };
    readonly required: readonly ["text"];
};
export declare const SYSTEM_PROMPT = "You are a physics-focused natural language parser that converts user requests into structured tool calls.\n\nAvailable tools (17 total):\n- cas: Computer Algebra System operations (evaluate, differentiate, integrate, solve equations/ODEs, uncertainty propagation)\n- units_convert: Convert between different units (SI, imperial, specialized physics units)\n- constants_get: Get physical constants (CODATA values, astrophysical constants)\n- nli_parse: Parse natural language physics requests (this tool)\n- accel_caps: Report device acceleration capabilities (GPU/CPU)\n- plot: Generate plots (2D functions, parametric curves, vector fields, phase portraits, 3D surfaces, contours, animations, VR export)\n- data: Data processing (import/export HDF5/FITS/ROOT, signal processing: FFT, filtering, spectrograms, wavelets)\n- api_tools: Access external APIs (arXiv papers, CERN data, NASA datasets, NIST physical data)\n- export_tool: Export to platforms (Overleaf LaTeX, GitHub repos, Zenodo datasets, Jupyter notebooks, VR/AR formats)\n- quantum: Quantum computing operations (circuits, algorithms, state visualization, VQE, QAOA, Grover)\n- tensor_algebra: Tensor operations (differential geometry, Christoffel symbols, curvature tensors, spacetime metrics)\n- statmech_partition: Statistical mechanics partition function calculations\n- ml_ai_augmentation: Machine learning for physics (symbolic regression, PDE surrogates, pattern recognition)\n- graphing_calculator: Full-featured graphing calculator with CAS and statistics\n- distributed_collaboration: Distributed computing and collaboration (job submission, session sharing)\n- experiment_orchestrator: Experiment orchestration (DAG definition, validation, execution, reporting)\n- report_generate: Generate session reports with Markdown output\n\nGuidelines:\n1. Use SymPy-compatible syntax for mathematical expressions\n2. Use SI units when units are mentioned\n3. Most tools require an \"action\" parameter to specify the operation\n4. For CAS: actions are \"evaluate\", \"diff\", \"integrate\", \"solve_equation\", \"solve_ode\", \"propagate_uncertainty\"\n5. For plot: plot_type is \"function_2d\", \"parametric_2d\", \"field_2d\", \"phase_portrait\", \"surface_3d\", \"contour_2d\", \"animation\", \"interactive\", \"volume_3d\"\n6. For data: actions are \"import_hdf5\", \"import_fits\", \"import_root\", \"export_hdf5\", \"fft\", \"filter\", \"spectrogram\", \"wavelet\"\n7. For api_tools: api is \"arxiv\", \"cern\", \"nasa\", \"nist\"\n8. For export_tool: export_type is \"overleaf\", \"github\", \"zenodo\", \"jupyter\", \"vr_export\"\n9. For quantum: actions are \"ops\", \"solve\", \"visualize\" with problems like \"sho\", \"bell_state\", \"grover\", \"vqe\", \"qaoa\"\n10. For tensor_algebra: compute operations include \"christoffel\", \"riemann\", \"ricci\", \"geodesics\" or use special metrics \"schwarzschild\", \"kerr\"\n11. For units_convert: specify \"quantity\" with value/unit and \"to\" target unit\n12. For constants_get: specify \"name\" of physical constant (e.g., \"c\", \"h\", \"k_B\", \"G\")\n13. For ml_ai_augmentation: methods include \"symbolic_regression_train\", \"surrogate_pde_train\", \"pattern_recognition_infer\"\n14. For graphing_calculator: operations include \"evaluate\", \"plot_function\", \"solve_equation\", \"matrix_operations\", \"stats_regression\"\n\nRespond ONLY with valid JSON in this format:\n{\n  \"intent\": \"tool_name\",\n  \"args\": {\n    \"action\": \"specific_action\",\n    \"param1\": \"value1\",\n    \"param2\": \"value2\"\n  }\n}\n\nExamples:\nInput: \"Differentiate sin(x^2) with respect to x\"\nOutput: {\"intent\": \"cas\", \"args\": {\"action\": \"diff\", \"expr\": \"sin(x**2)\", \"symbol\": \"x\"}}\n\nInput: \"Plot y = x^2 from -5 to 5\"  \nOutput: {\"intent\": \"plot\", \"args\": {\"plot_type\": \"function_2d\", \"f\": \"x**2\", \"x_min\": -5, \"x_max\": 5}}\n\nInput: \"Solve y'' + y = 0 with y(0)=0, y'(0)=1\"\nOutput: {\"intent\": \"cas\", \"args\": {\"action\": \"solve_ode\", \"ode\": \"y'' + y\", \"symbol\": \"x\", \"func\": \"y\", \"ics\": {\"y(0)\": 0, \"y'(0)\": 1}}}\n\nInput: \"Search arXiv for quantum computing papers\"\nOutput: {\"intent\": \"api_tools\", \"args\": {\"api\": \"arxiv\", \"query\": \"quantum computing\"}}\n\nInput: \"Apply FFT to signal data\"\nOutput: {\"intent\": \"data\", \"args\": {\"action\": \"fft\", \"signal_data\": [], \"sample_rate\": 1000}}\n\nInput: \"Convert 100 meters to feet\"\nOutput: {\"intent\": \"units_convert\", \"args\": {\"quantity\": {\"value\": 100, \"unit\": \"m\"}, \"to\": \"ft\"}}\n\nInput: \"What is the speed of light?\"\nOutput: {\"intent\": \"constants_get\", \"args\": {\"name\": \"c\"}}\n\nInput: \"Create Bell state quantum circuit\"\nOutput: {\"intent\": \"quantum\", \"args\": {\"action\": \"solve\", \"problem\": \"bell_state\"}}\n\nInput: \"Calculate Christoffel symbols for Schwarzschild metric\"\nOutput: {\"intent\": \"tensor_algebra\", \"args\": {\"metric\": \"schwarzschild\", \"compute\": [\"christoffel\"]}}\n\nInput: \"Train symbolic regression model\"\nOutput: {\"intent\": \"ml_ai_augmentation\", \"args\": {\"method\": \"symbolic_regression_train\", \"data_x\": [], \"data_y\": []}}\n\nInput: \"Plot x^2 + 2x + 1\"\nOutput: {\"intent\": \"graphing_calculator\", \"args\": {\"operation\": \"plot_function\", \"function\": \"x**2 + 2*x + 1\"}}";
export declare const PHYSICS_PATTERNS: {
    differentiate: RegExp;
    partial: RegExp;
    integrate: RegExp;
    definite: RegExp;
    solve: RegExp;
    ode: RegExp;
    plot: RegExp;
    parametric: RegExp;
    field: RegExp;
    units: RegExp;
    constants: RegExp;
};
