// Define the JSON schema for the graphing calculator
const graphingCalculatorSchema = {
    type: "object",
    properties: {
        operation: {
            type: "string",
            enum: [
                "evaluate", "simplify", "expand", "factor",
                "solve_equation", "solve_system", "find_roots",
                "derivative", "integral", "limit", "series",
                "plot_function", "plot_parametric", "plot_polar", "plot_implicit", "plot_inequality", "plot_data",
                "matrix_add", "matrix_multiply", "matrix_determinant", "matrix_inverse", "matrix_eigenvalues", "matrix_rref",
                "stats_descriptive", "stats_regression", "stats_distribution", "stats_hypothesis_test",
                "create_list", "list_operations", "table_values",
                "store_variable", "recall_variable", "define_function", "execute_program",
                "convert_units", "financial_calc"
            ],
            description: "Calculator operation to perform"
        },
        expression: {
            type: "string",
            description: "Mathematical expression"
        },
        variable: {
            type: "string",
            description: "Variable for calculus operations"
        },
        variables: {
            type: "object",
            description: "Variable substitutions"
        },
        equation: {
            type: "string",
            description: "Equation to solve"
        },
        equations: {
            type: "array",
            items: { type: "string" },
            description: "System of equations"
        },
        function: {
            type: "string",
            description: "Function to graph"
        },
        x_range: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2,
            description: "X-axis range [min, max]"
        },
        y_range: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2,
            description: "Y-axis range [min, max]"
        },
        matrix: {
            type: "array",
            items: {
                type: "array",
                items: { type: "number" }
            },
            description: "Matrix A"
        },
        matrix_b: {
            type: "array",
            items: {
                type: "array",
                items: { type: "number" }
            },
            description: "Matrix B"
        },
        data: {
            type: "array",
            items: { type: "number" },
            description: "Data for statistical analysis"
        },
        data_x: {
            type: "array",
            items: { type: "number" },
            description: "X-data for regression"
        },
        data_y: {
            type: "array",
            items: { type: "number" },
            description: "Y-data for regression"
        },
        regression_type: {
            type: "string",
            enum: ["linear", "quadratic", "cubic", "exponential", "logarithmic", "power", "sinusoidal"],
            description: "Regression type"
        },
        list_name: {
            type: "string",
            description: "List identifier"
        },
        list_data: {
            type: "array",
            items: { type: "number" },
            description: "List data"
        },
        var_name: {
            type: "string",
            description: "Variable name"
        },
        var_value: {
            description: "Variable value"
        },
        from_unit: {
            type: "string",
            description: "Source unit"
        },
        to_unit: {
            type: "string",
            description: "Target unit"
        },
        value: {
            type: "number",
            description: "Value to convert"
        },
        format: {
            type: "string",
            enum: ["exact", "decimal", "fraction"],
            default: "decimal",
            description: "Output format"
        },
        precision: {
            type: "number",
            default: 6,
            description: "Decimal precision"
        },
        plot_title: {
            type: "string",
            description: "Plot title"
        },
        show_grid: {
            type: "boolean",
            default: true,
            description: "Show grid on plots"
        },
        export_data: {
            type: "boolean",
            default: false,
            description: "Export plot data as CSV"
        }
    },
    required: ["operation"]
};
/**
 * Comprehensive Graphing Calculator Tool
 *
 * Provides all the functionality of a modern graphing calculator including:
 * - Basic arithmetic and algebraic operations
 * - Computer Algebra System (CAS) operations
 * - 2D graphing (function, parametric, polar, implicit)
 * - Matrix operations and linear algebra
 * - Statistical analysis and regression
 * - Equation solving (numerical and symbolic)
 * - Calculus operations (derivatives, integrals, limits)
 * - Data analysis and list operations
 * - Variable storage and programming
 * - Unit conversions and financial calculations
 */
export const graphingCalculatorTool = {
    name: 'graphing_calculator',
    description: `🧮 **Comprehensive Graphing Calculator** - Full-featured calculator with CAS, graphing, statistics, and matrix operations.

**Core Operations:**
- **Basic Math**: evaluate, simplify, expand, factor algebraic expressions
- **Equation Solving**: solve_equation, solve_system, find_roots (numerical & symbolic)
- **Calculus**: derivative, integral, limit, series expansions
- **Graphing**: plot_function, plot_parametric, plot_polar, plot_implicit, plot_inequality
- **Matrix Ops**: matrix_add, matrix_multiply, matrix_determinant, matrix_inverse, matrix_eigenvalues
- **Statistics**: stats_descriptive, stats_regression, stats_distribution, stats_hypothesis_test
- **Data Analysis**: create_list, list_operations, table_values
- **Programming**: store_variable, recall_variable, define_function, execute_program
- **Utilities**: convert_units, financial_calc

**Key Features:**
- Computer Algebra System (CAS) for symbolic computation
- High-resolution graphing with multiple plot types
- Comprehensive statistical analysis and regression
- Matrix operations and linear algebra
- Variable storage and custom function definitions
- Unit conversions and financial calculations
- Export capabilities (CSV data, high-quality plots)

**Graphics-First Outputs:**
- Professional mathematical plots with customizable styling
- Statistical charts and regression analysis
- Matrix visualizations and eigenvalue plots
- Function analysis with critical points and asymptotes
- Interactive parameter exploration

**Natural Language Interface:**
- "Graph y = x^2 + 2x + 1 from -5 to 5"
- "Solve the system: x + y = 5, 2x - y = 1"
- "Find the derivative of sin(x) * cos(x)"
- "Calculate regression for this data: [1,2,3,4,5] vs [2,4,7,8,10]"
- "What's the determinant of [[1,2],[3,4]]?"`,
    inputSchema: graphingCalculatorSchema
};
/**
 * Handle graphing calculator operations
 */
export async function handleGraphingCalculatorTool(params) {
    // Route to Python worker for actual computation
    return {
        tool: 'graphing_calculator',
        params,
        // This will be handled by the Python worker
        action: 'route_to_python'
    };
}
// Export only the main graphing calculator tool
export const buildGraphingCalculatorTools = () => {
    return [graphingCalculatorTool];
};
export default graphingCalculatorTool;
