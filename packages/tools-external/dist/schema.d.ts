/**
 * JSON Schema definitions for External API tools
 */
export declare const apiArxivSchema: {
    readonly type: "object";
    readonly properties: {
        readonly query: {
            readonly type: "string";
            readonly description: "Search query (title, author, abstract, etc.)";
        };
        readonly category: {
            readonly type: "string";
            readonly description: "arXiv category (e.g., 'physics', 'math-ph', 'quant-ph')";
        };
        readonly max_results: {
            readonly type: "integer";
            readonly default: 10;
            readonly minimum: 1;
            readonly maximum: 100;
            readonly description: "Maximum number of results to return";
        };
        readonly sort_by: {
            readonly type: "string";
            readonly enum: readonly ["relevance", "lastUpdatedDate", "submittedDate"];
            readonly default: "relevance";
            readonly description: "Sort order for results";
        };
        readonly download_pdfs: {
            readonly type: "boolean";
            readonly default: false;
            readonly description: "Download PDF files for found papers";
        };
    };
    readonly required: readonly ["query"];
    readonly additionalProperties: false;
};
export declare const apiCernSchema: {
    readonly type: "object";
    readonly properties: {
        readonly dataset_name: {
            readonly type: "string";
            readonly description: "Name or ID of CERN Open Data dataset";
        };
        readonly experiment: {
            readonly type: "string";
            readonly enum: readonly ["CMS", "ATLAS", "ALICE", "LHCb"];
            readonly description: "LHC experiment (optional filter)";
        };
        readonly data_type: {
            readonly type: "string";
            readonly enum: readonly ["AOD", "MINIAOD", "NanoAOD", "derived"];
            readonly description: "Data format type";
        };
        readonly year: {
            readonly type: "integer";
            readonly minimum: 2010;
            readonly maximum: 2024;
            readonly description: "Data collection year";
        };
        readonly max_files: {
            readonly type: "integer";
            readonly default: 5;
            readonly minimum: 1;
            readonly maximum: 50;
            readonly description: "Maximum number of files to retrieve";
        };
    };
    readonly required: readonly ["dataset_name"];
    readonly additionalProperties: false;
};
export declare const apiNasaSchema: {
    readonly type: "object";
    readonly properties: {
        readonly dataset_type: {
            readonly type: "string";
            readonly enum: readonly ["astronomy", "earth", "planetary", "heliophysics"];
            readonly description: "Type of NASA dataset";
        };
        readonly mission: {
            readonly type: "string";
            readonly description: "Mission name (e.g., 'Hubble', 'Kepler', 'MODIS')";
        };
        readonly instrument: {
            readonly type: "string";
            readonly description: "Instrument name";
        };
        readonly date_range: {
            readonly type: "object";
            readonly properties: {
                readonly start: {
                    readonly type: "string";
                    readonly format: "date";
                };
                readonly end: {
                    readonly type: "string";
                    readonly format: "date";
                };
            };
            readonly description: "Date range for data collection";
        };
        readonly coordinates: {
            readonly type: "object";
            readonly properties: {
                readonly ra: {
                    readonly type: "number";
                    readonly description: "Right ascension (degrees)";
                };
                readonly dec: {
                    readonly type: "number";
                    readonly description: "Declination (degrees)";
                };
                readonly radius: {
                    readonly type: "number";
                    readonly description: "Search radius (arcminutes)";
                };
            };
            readonly description: "Sky coordinates for astronomical data";
        };
        readonly max_results: {
            readonly type: "integer";
            readonly default: 20;
            readonly minimum: 1;
            readonly maximum: 100;
            readonly description: "Maximum number of results";
        };
    };
    readonly required: readonly ["dataset_type"];
    readonly additionalProperties: false;
};
export declare const apiNistSchema: {
    readonly type: "object";
    readonly properties: {
        readonly data_type: {
            readonly type: "string";
            readonly enum: readonly ["atomic", "molecular", "material", "constants", "reference"];
            readonly description: "Type of NIST data";
        };
        readonly element: {
            readonly type: "string";
            readonly description: "Chemical element symbol (for atomic data)";
        };
        readonly property: {
            readonly type: "string";
            readonly description: "Physical property to search for";
        };
        readonly temperature: {
            readonly type: "number";
            readonly description: "Temperature in Kelvin (for material properties)";
        };
        readonly pressure: {
            readonly type: "number";
            readonly description: "Pressure in Pa (for material properties)";
        };
        readonly format: {
            readonly type: "string";
            readonly enum: readonly ["json", "xml", "csv"];
            readonly default: "json";
            readonly description: "Output format";
        };
    };
    readonly required: readonly ["data_type"];
    readonly additionalProperties: false;
};
