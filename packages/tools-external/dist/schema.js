/**
 * JSON Schema definitions for External API tools
 */
export const apiArxivSchema = {
    type: "object",
    properties: {
        query: {
            type: "string",
            description: "Search query (title, author, abstract, etc.)"
        },
        category: {
            type: "string",
            description: "arXiv category (e.g., 'physics', 'math-ph', 'quant-ph')"
        },
        max_results: {
            type: "integer",
            default: 10,
            minimum: 1,
            maximum: 100,
            description: "Maximum number of results to return"
        },
        sort_by: {
            type: "string",
            enum: ["relevance", "lastUpdatedDate", "submittedDate"],
            default: "relevance",
            description: "Sort order for results"
        },
        download_pdfs: {
            type: "boolean",
            default: false,
            description: "Download PDF files for found papers"
        }
    },
    required: ["query"],
    additionalProperties: false
};
export const apiCernSchema = {
    type: "object",
    properties: {
        dataset_name: {
            type: "string",
            description: "Name or ID of CERN Open Data dataset"
        },
        experiment: {
            type: "string",
            enum: ["CMS", "ATLAS", "ALICE", "LHCb"],
            description: "LHC experiment (optional filter)"
        },
        data_type: {
            type: "string",
            enum: ["AOD", "MINIAOD", "NanoAOD", "derived"],
            description: "Data format type"
        },
        year: {
            type: "integer",
            minimum: 2010,
            maximum: 2024,
            description: "Data collection year"
        },
        max_files: {
            type: "integer",
            default: 5,
            minimum: 1,
            maximum: 50,
            description: "Maximum number of files to retrieve"
        }
    },
    required: ["dataset_name"],
    additionalProperties: false
};
export const apiNasaSchema = {
    type: "object",
    properties: {
        dataset_type: {
            type: "string",
            enum: ["astronomy", "earth", "planetary", "heliophysics"],
            description: "Type of NASA dataset"
        },
        mission: {
            type: "string",
            description: "Mission name (e.g., 'Hubble', 'Kepler', 'MODIS')"
        },
        instrument: {
            type: "string",
            description: "Instrument name"
        },
        date_range: {
            type: "object",
            properties: {
                start: { type: "string", format: "date" },
                end: { type: "string", format: "date" }
            },
            description: "Date range for data collection"
        },
        coordinates: {
            type: "object",
            properties: {
                ra: { type: "number", description: "Right ascension (degrees)" },
                dec: { type: "number", description: "Declination (degrees)" },
                radius: { type: "number", description: "Search radius (arcminutes)" }
            },
            description: "Sky coordinates for astronomical data"
        },
        max_results: {
            type: "integer",
            default: 20,
            minimum: 1,
            maximum: 100,
            description: "Maximum number of results"
        }
    },
    required: ["dataset_type"],
    additionalProperties: false
};
export const apiNistSchema = {
    type: "object",
    properties: {
        data_type: {
            type: "string",
            enum: ["atomic", "molecular", "material", "constants", "reference"],
            description: "Type of NIST data"
        },
        element: {
            type: "string",
            description: "Chemical element symbol (for atomic data)"
        },
        property: {
            type: "string",
            description: "Physical property to search for"
        },
        temperature: {
            type: "number",
            description: "Temperature in Kelvin (for material properties)"
        },
        pressure: {
            type: "number",
            description: "Pressure in Pa (for material properties)"
        },
        format: {
            type: "string",
            enum: ["json", "xml", "csv"],
            default: "json",
            description: "Output format"
        }
    },
    required: ["data_type"],
    additionalProperties: false
};
