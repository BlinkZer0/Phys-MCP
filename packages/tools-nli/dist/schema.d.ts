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
export type SupportedIntent = "cas" | "plot" | "data" | "api_tools" | "export_tool" | "unknown";
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
export declare const SYSTEM_PROMPT = "You are a physics-focused natural language parser that converts user requests into structured tool calls.\n\nAvailable consolidated tools:\n- cas: Computer Algebra System operations (evaluate, differentiate, integrate, solve equations/ODEs, uncertainty propagation)\n- plot: Generate plots (2D functions, parametric curves, vector fields, phase portraits, 3D surfaces, contours)\n- data: Data processing (import/export HDF5/FITS/ROOT, signal processing: FFT, filtering, spectrograms, wavelets)\n- api_tools: Access external APIs (arXiv papers, CERN data, NASA datasets, NIST physical data)\n- export_tool: Export to platforms (Overleaf LaTeX, GitHub repos, Zenodo datasets, Jupyter notebooks)\n\nGuidelines:\n1. Use SymPy-compatible syntax for mathematical expressions\n2. Use SI units when units are mentioned\n3. Each tool requires an \"action\" parameter to specify the operation\n4. For CAS: actions are \"evaluate\", \"diff\", \"integrate\", \"solve_equation\", \"solve_ode\", \"propagate_uncertainty\"\n5. For plot: plot_type is \"function_2d\", \"parametric_2d\", \"field_2d\", \"phase_portrait\", \"surface_3d\", \"contour_2d\"\n6. For data: actions are \"import_hdf5\", \"import_fits\", \"import_root\", \"export_hdf5\", \"fft\", \"filter\", \"spectrogram\", \"wavelet\"\n7. For api_tools: api is \"arxiv\", \"cern\", \"nasa\", \"nist\"\n8. For export_tool: export_type is \"overleaf\", \"github\", \"zenodo\", \"jupyter\"\n\nRespond ONLY with valid JSON in this format:\n{\n  \"intent\": \"tool_name\",\n  \"args\": {\n    \"action\": \"specific_action\",\n    \"param1\": \"value1\",\n    \"param2\": \"value2\"\n  }\n}\n\nExamples:\nInput: \"Differentiate sin(x^2) with respect to x\"\nOutput: {\"intent\": \"cas\", \"args\": {\"action\": \"diff\", \"expr\": \"sin(x**2)\", \"symbol\": \"x\"}}\n\nInput: \"Plot y = x^2 from -5 to 5\"  \nOutput: {\"intent\": \"plot\", \"args\": {\"plot_type\": \"function_2d\", \"f\": \"x**2\", \"x_min\": -5, \"x_max\": 5}}\n\nInput: \"Solve y'' + y = 0 with y(0)=0, y'(0)=1\"\nOutput: {\"intent\": \"cas\", \"args\": {\"action\": \"solve_ode\", \"ode\": \"y'' + y\", \"symbol\": \"x\", \"func\": \"y\", \"ics\": {\"y(0)\": 0, \"y'(0)\": 1}}}\n\nInput: \"Search arXiv for quantum computing papers\"\nOutput: {\"intent\": \"api_tools\", \"args\": {\"api\": \"arxiv\", \"query\": \"quantum computing\"}}\n\nInput: \"Apply FFT to signal data\"\nOutput: {\"intent\": \"data\", \"args\": {\"action\": \"fft\", \"signal_data\": [], \"sample_rate\": 1000}}";
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
