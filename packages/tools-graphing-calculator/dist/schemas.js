import { z } from 'zod';
// Base operation types
export const GraphingCalculatorOperation = z.enum([
    // Basic arithmetic and functions
    'evaluate',
    'simplify',
    'expand',
    'factor',
    // Equation solving
    'solve_equation',
    'solve_system',
    'find_roots',
    // Calculus operations
    'derivative',
    'integral',
    'limit',
    'series',
    // Graphing operations
    'plot_function',
    'plot_parametric',
    'plot_polar',
    'plot_implicit',
    'plot_inequality',
    'plot_data',
    // Matrix operations
    'matrix_add',
    'matrix_multiply',
    'matrix_determinant',
    'matrix_inverse',
    'matrix_eigenvalues',
    'matrix_rref',
    // Statistics operations
    'stats_descriptive',
    'stats_regression',
    'stats_distribution',
    'stats_hypothesis_test',
    // Data operations
    'create_list',
    'list_operations',
    'table_values',
    // Programming operations
    'store_variable',
    'recall_variable',
    'define_function',
    'execute_program',
    // Unit conversions
    'convert_units',
    // Financial calculations
    'financial_calc'
]);
// Common parameter schemas
export const ExpressionSchema = z.object({
    expression: z.string().describe('Mathematical expression to process'),
    variables: z.record(z.union([z.number(), z.string()])).optional().describe('Variable substitutions')
});
export const GraphingSchema = z.object({
    function: z.string().describe('Function to graph (e.g., "x^2 + 2*x + 1")'),
    x_range: z.tuple([z.number(), z.number()]).optional().describe('X-axis range [min, max]'),
    y_range: z.tuple([z.number(), z.number()]).optional().describe('Y-axis range [min, max]'),
    resolution: z.number().optional().default(1000).describe('Number of points to plot'),
    style: z.enum(['line', 'points', 'both']).optional().default('line').describe('Plot style'),
    color: z.string().optional().describe('Plot color'),
    title: z.string().optional().describe('Graph title'),
    grid: z.boolean().optional().default(true).describe('Show grid'),
    axes_labels: z.object({
        x: z.string().optional(),
        y: z.string().optional()
    }).optional().describe('Axis labels')
});
export const MatrixSchema = z.object({
    matrix: z.array(z.array(z.number())).describe('Matrix as 2D array'),
    matrix_b: z.array(z.array(z.number())).optional().describe('Second matrix for operations')
});
export const StatisticsSchema = z.object({
    data: z.array(z.number()).describe('Data array for statistical analysis'),
    data_y: z.array(z.number()).optional().describe('Y-data for bivariate analysis'),
    confidence_level: z.number().optional().default(0.95).describe('Confidence level for intervals'),
    distribution: z.enum(['normal', 'binomial', 'poisson', 't', 'chi_square', 'f']).optional().describe('Probability distribution'),
    parameters: z.record(z.number()).optional().describe('Distribution parameters')
});
export const ListSchema = z.object({
    list_name: z.string().describe('Name of the list'),
    data: z.array(z.number()).describe('List data'),
    operation: z.enum(['sum', 'mean', 'median', 'std', 'var', 'min', 'max', 'sort', 'reverse']).optional().describe('Operation to perform on list')
});
export const VariableSchema = z.object({
    name: z.string().describe('Variable name'),
    value: z.union([z.number(), z.string(), z.array(z.number())]).describe('Variable value'),
    type: z.enum(['number', 'expression', 'list', 'matrix', 'function']).optional().describe('Variable type')
});
export const FinancialSchema = z.object({
    calculation_type: z.enum(['present_value', 'future_value', 'payment', 'interest_rate', 'periods']).describe('Type of financial calculation'),
    present_value: z.number().optional().describe('Present value'),
    future_value: z.number().optional().describe('Future value'),
    payment: z.number().optional().describe('Payment amount'),
    interest_rate: z.number().optional().describe('Interest rate (as decimal)'),
    periods: z.number().optional().describe('Number of periods'),
    compounding: z.enum(['annual', 'semi_annual', 'quarterly', 'monthly', 'daily']).optional().default('annual').describe('Compounding frequency')
});
// Main graphing calculator schema
export const GraphingCalculatorSchema = z.object({
    operation: GraphingCalculatorOperation.describe('Calculator operation to perform'),
    // Expression-based operations
    expression: z.string().optional().describe('Mathematical expression'),
    variable: z.string().optional().describe('Variable for calculus operations'),
    variables: z.record(z.union([z.number(), z.string()])).optional().describe('Variable substitutions'),
    // Equation solving
    equation: z.string().optional().describe('Equation to solve (e.g., "x^2 - 4 = 0")'),
    equations: z.array(z.string()).optional().describe('System of equations'),
    solve_for: z.array(z.string()).optional().describe('Variables to solve for'),
    // Calculus parameters
    point: z.number().optional().describe('Point for limit evaluation'),
    order: z.number().optional().default(1).describe('Order of derivative'),
    bounds: z.tuple([z.number(), z.number()]).optional().describe('Integration bounds'),
    // Graphing parameters
    function: z.string().optional().describe('Function to graph'),
    x_function: z.string().optional().describe('X-component for parametric plots'),
    y_function: z.string().optional().describe('Y-component for parametric plots'),
    r_function: z.string().optional().describe('R-component for polar plots'),
    x_range: z.tuple([z.number(), z.number()]).optional().describe('X-axis range'),
    y_range: z.tuple([z.number(), z.number()]).optional().describe('Y-axis range'),
    t_range: z.tuple([z.number(), z.number()]).optional().describe('Parameter range'),
    theta_range: z.tuple([z.number(), z.number()]).optional().describe('Theta range for polar'),
    resolution: z.number().optional().default(1000).describe('Plot resolution'),
    // Matrix operations
    matrix: z.array(z.array(z.number())).optional().describe('Matrix A'),
    matrix_b: z.array(z.array(z.number())).optional().describe('Matrix B'),
    // Statistics
    data: z.array(z.number()).optional().describe('Data for statistical analysis'),
    data_x: z.array(z.number()).optional().describe('X-data for regression'),
    data_y: z.array(z.number()).optional().describe('Y-data for regression'),
    regression_type: z.enum(['linear', 'quadratic', 'cubic', 'exponential', 'logarithmic', 'power', 'sinusoidal']).optional().describe('Regression type'),
    distribution: z.enum(['normal', 'binomial', 'poisson', 't', 'chi_square', 'f']).optional().describe('Probability distribution'),
    // List operations
    list_name: z.string().optional().describe('List identifier'),
    list_data: z.array(z.number()).optional().describe('List data'),
    list_operation: z.enum(['sum', 'mean', 'median', 'std', 'var', 'min', 'max', 'sort', 'reverse']).optional().describe('List operation'),
    // Variable storage
    var_name: z.string().optional().describe('Variable name'),
    var_value: z.union([z.number(), z.string(), z.array(z.number())]).optional().describe('Variable value'),
    // Function definition
    func_name: z.string().optional().describe('Function name'),
    func_expression: z.string().optional().describe('Function expression'),
    func_variables: z.array(z.string()).optional().describe('Function parameters'),
    // Unit conversion
    from_unit: z.string().optional().describe('Source unit'),
    to_unit: z.string().optional().describe('Target unit'),
    value: z.number().optional().describe('Value to convert'),
    // Financial calculations
    financial_type: z.enum(['present_value', 'future_value', 'payment', 'interest_rate', 'periods']).optional().describe('Financial calculation type'),
    present_value: z.number().optional().describe('Present value'),
    future_value: z.number().optional().describe('Future value'),
    payment: z.number().optional().describe('Payment amount'),
    interest_rate: z.number().optional().describe('Interest rate (as decimal)'),
    periods: z.number().optional().describe('Number of periods'),
    compounding: z.enum(['annual', 'semi_annual', 'quarterly', 'monthly', 'daily']).optional().describe('Compounding frequency'),
    // Output options
    format: z.enum(['exact', 'decimal', 'fraction']).optional().default('decimal').describe('Output format'),
    precision: z.number().optional().default(6).describe('Decimal precision'),
    plot_style: z.enum(['line', 'points', 'both']).optional().default('line').describe('Plot style'),
    plot_color: z.string().optional().describe('Plot color'),
    show_grid: z.boolean().optional().default(true).describe('Show grid on plots'),
    plot_title: z.string().optional().describe('Plot title'),
    export_data: z.boolean().optional().default(false).describe('Export plot data as CSV')
});
