import { z } from 'zod';
export declare const GraphingCalculatorOperation: z.ZodEnum<["evaluate", "simplify", "expand", "factor", "solve_equation", "solve_system", "find_roots", "derivative", "integral", "limit", "series", "plot_function", "plot_parametric", "plot_polar", "plot_implicit", "plot_inequality", "plot_data", "matrix_add", "matrix_multiply", "matrix_determinant", "matrix_inverse", "matrix_eigenvalues", "matrix_rref", "stats_descriptive", "stats_regression", "stats_distribution", "stats_hypothesis_test", "create_list", "list_operations", "table_values", "store_variable", "recall_variable", "define_function", "execute_program", "convert_units", "financial_calc"]>;
export declare const ExpressionSchema: z.ZodObject<{
    expression: z.ZodString;
    variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
}, "strip", z.ZodTypeAny, {
    expression: string;
    variables?: Record<string, string | number> | undefined;
}, {
    expression: string;
    variables?: Record<string, string | number> | undefined;
}>;
export declare const GraphingSchema: z.ZodObject<{
    function: z.ZodString;
    x_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    y_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    resolution: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    style: z.ZodDefault<z.ZodOptional<z.ZodEnum<["line", "points", "both"]>>>;
    color: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    grid: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    axes_labels: z.ZodOptional<z.ZodObject<{
        x: z.ZodOptional<z.ZodString>;
        y: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        x?: string | undefined;
        y?: string | undefined;
    }, {
        x?: string | undefined;
        y?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    function: string;
    resolution: number;
    style: "line" | "points" | "both";
    grid: boolean;
    x_range?: [number, number] | undefined;
    y_range?: [number, number] | undefined;
    color?: string | undefined;
    title?: string | undefined;
    axes_labels?: {
        x?: string | undefined;
        y?: string | undefined;
    } | undefined;
}, {
    function: string;
    x_range?: [number, number] | undefined;
    y_range?: [number, number] | undefined;
    resolution?: number | undefined;
    style?: "line" | "points" | "both" | undefined;
    color?: string | undefined;
    title?: string | undefined;
    grid?: boolean | undefined;
    axes_labels?: {
        x?: string | undefined;
        y?: string | undefined;
    } | undefined;
}>;
export declare const MatrixSchema: z.ZodObject<{
    matrix: z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">;
    matrix_b: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">>;
}, "strip", z.ZodTypeAny, {
    matrix: number[][];
    matrix_b?: number[][] | undefined;
}, {
    matrix: number[][];
    matrix_b?: number[][] | undefined;
}>;
export declare const StatisticsSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodNumber, "many">;
    data_y: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    confidence_level: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    distribution: z.ZodOptional<z.ZodEnum<["normal", "binomial", "poisson", "t", "chi_square", "f"]>>;
    parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    data: number[];
    confidence_level: number;
    data_y?: number[] | undefined;
    distribution?: "normal" | "binomial" | "poisson" | "t" | "chi_square" | "f" | undefined;
    parameters?: Record<string, number> | undefined;
}, {
    data: number[];
    data_y?: number[] | undefined;
    confidence_level?: number | undefined;
    distribution?: "normal" | "binomial" | "poisson" | "t" | "chi_square" | "f" | undefined;
    parameters?: Record<string, number> | undefined;
}>;
export declare const ListSchema: z.ZodObject<{
    list_name: z.ZodString;
    data: z.ZodArray<z.ZodNumber, "many">;
    operation: z.ZodOptional<z.ZodEnum<["sum", "mean", "median", "std", "var", "min", "max", "sort", "reverse"]>>;
}, "strip", z.ZodTypeAny, {
    data: number[];
    list_name: string;
    operation?: "reverse" | "sort" | "sum" | "mean" | "median" | "std" | "var" | "min" | "max" | undefined;
}, {
    data: number[];
    list_name: string;
    operation?: "reverse" | "sort" | "sum" | "mean" | "median" | "std" | "var" | "min" | "max" | undefined;
}>;
export declare const VariableSchema: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodUnion<[z.ZodNumber, z.ZodString, z.ZodArray<z.ZodNumber, "many">]>;
    type: z.ZodOptional<z.ZodEnum<["number", "expression", "list", "matrix", "function"]>>;
}, "strip", z.ZodTypeAny, {
    value: string | number | number[];
    name: string;
    type?: "number" | "function" | "expression" | "matrix" | "list" | undefined;
}, {
    value: string | number | number[];
    name: string;
    type?: "number" | "function" | "expression" | "matrix" | "list" | undefined;
}>;
export declare const FinancialSchema: z.ZodObject<{
    calculation_type: z.ZodEnum<["present_value", "future_value", "payment", "interest_rate", "periods"]>;
    present_value: z.ZodOptional<z.ZodNumber>;
    future_value: z.ZodOptional<z.ZodNumber>;
    payment: z.ZodOptional<z.ZodNumber>;
    interest_rate: z.ZodOptional<z.ZodNumber>;
    periods: z.ZodOptional<z.ZodNumber>;
    compounding: z.ZodDefault<z.ZodOptional<z.ZodEnum<["annual", "semi_annual", "quarterly", "monthly", "daily"]>>>;
}, "strip", z.ZodTypeAny, {
    calculation_type: "present_value" | "future_value" | "payment" | "interest_rate" | "periods";
    compounding: "annual" | "semi_annual" | "quarterly" | "monthly" | "daily";
    present_value?: number | undefined;
    future_value?: number | undefined;
    payment?: number | undefined;
    interest_rate?: number | undefined;
    periods?: number | undefined;
}, {
    calculation_type: "present_value" | "future_value" | "payment" | "interest_rate" | "periods";
    present_value?: number | undefined;
    future_value?: number | undefined;
    payment?: number | undefined;
    interest_rate?: number | undefined;
    periods?: number | undefined;
    compounding?: "annual" | "semi_annual" | "quarterly" | "monthly" | "daily" | undefined;
}>;
export declare const GraphingCalculatorSchema: z.ZodObject<{
    operation: z.ZodEnum<["evaluate", "simplify", "expand", "factor", "solve_equation", "solve_system", "find_roots", "derivative", "integral", "limit", "series", "plot_function", "plot_parametric", "plot_polar", "plot_implicit", "plot_inequality", "plot_data", "matrix_add", "matrix_multiply", "matrix_determinant", "matrix_inverse", "matrix_eigenvalues", "matrix_rref", "stats_descriptive", "stats_regression", "stats_distribution", "stats_hypothesis_test", "create_list", "list_operations", "table_values", "store_variable", "recall_variable", "define_function", "execute_program", "convert_units", "financial_calc"]>;
    expression: z.ZodOptional<z.ZodString>;
    variable: z.ZodOptional<z.ZodString>;
    variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    equation: z.ZodOptional<z.ZodString>;
    equations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    solve_for: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    point: z.ZodOptional<z.ZodNumber>;
    order: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    bounds: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    function: z.ZodOptional<z.ZodString>;
    x_function: z.ZodOptional<z.ZodString>;
    y_function: z.ZodOptional<z.ZodString>;
    r_function: z.ZodOptional<z.ZodString>;
    x_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    y_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    t_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    theta_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    resolution: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    matrix: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">>;
    matrix_b: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">>;
    data: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    data_x: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    data_y: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    regression_type: z.ZodOptional<z.ZodEnum<["linear", "quadratic", "cubic", "exponential", "logarithmic", "power", "sinusoidal"]>>;
    distribution: z.ZodOptional<z.ZodEnum<["normal", "binomial", "poisson", "t", "chi_square", "f"]>>;
    list_name: z.ZodOptional<z.ZodString>;
    list_data: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    list_operation: z.ZodOptional<z.ZodEnum<["sum", "mean", "median", "std", "var", "min", "max", "sort", "reverse"]>>;
    var_name: z.ZodOptional<z.ZodString>;
    var_value: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString, z.ZodArray<z.ZodNumber, "many">]>>;
    func_name: z.ZodOptional<z.ZodString>;
    func_expression: z.ZodOptional<z.ZodString>;
    func_variables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    from_unit: z.ZodOptional<z.ZodString>;
    to_unit: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodNumber>;
    financial_type: z.ZodOptional<z.ZodEnum<["present_value", "future_value", "payment", "interest_rate", "periods"]>>;
    present_value: z.ZodOptional<z.ZodNumber>;
    future_value: z.ZodOptional<z.ZodNumber>;
    payment: z.ZodOptional<z.ZodNumber>;
    interest_rate: z.ZodOptional<z.ZodNumber>;
    periods: z.ZodOptional<z.ZodNumber>;
    compounding: z.ZodOptional<z.ZodEnum<["annual", "semi_annual", "quarterly", "monthly", "daily"]>>;
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<["exact", "decimal", "fraction"]>>>;
    precision: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    plot_style: z.ZodDefault<z.ZodOptional<z.ZodEnum<["line", "points", "both"]>>>;
    plot_color: z.ZodOptional<z.ZodString>;
    show_grid: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    plot_title: z.ZodOptional<z.ZodString>;
    export_data: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    resolution: number;
    operation: "evaluate" | "simplify" | "expand" | "factor" | "solve_equation" | "solve_system" | "find_roots" | "derivative" | "integral" | "limit" | "series" | "plot_function" | "plot_parametric" | "plot_polar" | "plot_implicit" | "plot_inequality" | "plot_data" | "matrix_add" | "matrix_multiply" | "matrix_determinant" | "matrix_inverse" | "matrix_eigenvalues" | "matrix_rref" | "stats_descriptive" | "stats_regression" | "stats_distribution" | "stats_hypothesis_test" | "create_list" | "list_operations" | "table_values" | "store_variable" | "recall_variable" | "define_function" | "execute_program" | "convert_units" | "financial_calc";
    order: number;
    format: "exact" | "decimal" | "fraction";
    precision: number;
    plot_style: "line" | "points" | "both";
    show_grid: boolean;
    export_data: boolean;
    function?: string | undefined;
    data?: number[] | undefined;
    expression?: string | undefined;
    value?: number | undefined;
    variables?: Record<string, string | number> | undefined;
    x_range?: [number, number] | undefined;
    y_range?: [number, number] | undefined;
    matrix?: number[][] | undefined;
    matrix_b?: number[][] | undefined;
    data_y?: number[] | undefined;
    distribution?: "normal" | "binomial" | "poisson" | "t" | "chi_square" | "f" | undefined;
    list_name?: string | undefined;
    present_value?: number | undefined;
    future_value?: number | undefined;
    payment?: number | undefined;
    interest_rate?: number | undefined;
    periods?: number | undefined;
    compounding?: "annual" | "semi_annual" | "quarterly" | "monthly" | "daily" | undefined;
    variable?: string | undefined;
    equation?: string | undefined;
    equations?: string[] | undefined;
    solve_for?: string[] | undefined;
    point?: number | undefined;
    bounds?: [number, number] | undefined;
    x_function?: string | undefined;
    y_function?: string | undefined;
    r_function?: string | undefined;
    t_range?: [number, number] | undefined;
    theta_range?: [number, number] | undefined;
    data_x?: number[] | undefined;
    regression_type?: "linear" | "quadratic" | "cubic" | "exponential" | "logarithmic" | "power" | "sinusoidal" | undefined;
    list_data?: number[] | undefined;
    list_operation?: "reverse" | "sort" | "sum" | "mean" | "median" | "std" | "var" | "min" | "max" | undefined;
    var_name?: string | undefined;
    var_value?: string | number | number[] | undefined;
    func_name?: string | undefined;
    func_expression?: string | undefined;
    func_variables?: string[] | undefined;
    from_unit?: string | undefined;
    to_unit?: string | undefined;
    financial_type?: "present_value" | "future_value" | "payment" | "interest_rate" | "periods" | undefined;
    plot_color?: string | undefined;
    plot_title?: string | undefined;
}, {
    operation: "evaluate" | "simplify" | "expand" | "factor" | "solve_equation" | "solve_system" | "find_roots" | "derivative" | "integral" | "limit" | "series" | "plot_function" | "plot_parametric" | "plot_polar" | "plot_implicit" | "plot_inequality" | "plot_data" | "matrix_add" | "matrix_multiply" | "matrix_determinant" | "matrix_inverse" | "matrix_eigenvalues" | "matrix_rref" | "stats_descriptive" | "stats_regression" | "stats_distribution" | "stats_hypothesis_test" | "create_list" | "list_operations" | "table_values" | "store_variable" | "recall_variable" | "define_function" | "execute_program" | "convert_units" | "financial_calc";
    function?: string | undefined;
    data?: number[] | undefined;
    expression?: string | undefined;
    value?: number | undefined;
    variables?: Record<string, string | number> | undefined;
    x_range?: [number, number] | undefined;
    y_range?: [number, number] | undefined;
    resolution?: number | undefined;
    matrix?: number[][] | undefined;
    matrix_b?: number[][] | undefined;
    data_y?: number[] | undefined;
    distribution?: "normal" | "binomial" | "poisson" | "t" | "chi_square" | "f" | undefined;
    list_name?: string | undefined;
    present_value?: number | undefined;
    future_value?: number | undefined;
    payment?: number | undefined;
    interest_rate?: number | undefined;
    periods?: number | undefined;
    compounding?: "annual" | "semi_annual" | "quarterly" | "monthly" | "daily" | undefined;
    variable?: string | undefined;
    equation?: string | undefined;
    equations?: string[] | undefined;
    solve_for?: string[] | undefined;
    point?: number | undefined;
    order?: number | undefined;
    bounds?: [number, number] | undefined;
    x_function?: string | undefined;
    y_function?: string | undefined;
    r_function?: string | undefined;
    t_range?: [number, number] | undefined;
    theta_range?: [number, number] | undefined;
    data_x?: number[] | undefined;
    regression_type?: "linear" | "quadratic" | "cubic" | "exponential" | "logarithmic" | "power" | "sinusoidal" | undefined;
    list_data?: number[] | undefined;
    list_operation?: "reverse" | "sort" | "sum" | "mean" | "median" | "std" | "var" | "min" | "max" | undefined;
    var_name?: string | undefined;
    var_value?: string | number | number[] | undefined;
    func_name?: string | undefined;
    func_expression?: string | undefined;
    func_variables?: string[] | undefined;
    from_unit?: string | undefined;
    to_unit?: string | undefined;
    financial_type?: "present_value" | "future_value" | "payment" | "interest_rate" | "periods" | undefined;
    format?: "exact" | "decimal" | "fraction" | undefined;
    precision?: number | undefined;
    plot_style?: "line" | "points" | "both" | undefined;
    plot_color?: string | undefined;
    show_grid?: boolean | undefined;
    plot_title?: string | undefined;
    export_data?: boolean | undefined;
}>;
export type GraphingCalculatorParams = z.infer<typeof GraphingCalculatorSchema>;
export type GraphingCalculatorOperationType = z.infer<typeof GraphingCalculatorOperation>;
