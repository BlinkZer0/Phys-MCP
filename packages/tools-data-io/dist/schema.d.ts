/**
 * JSON Schema definitions for Data I/O tools
 */
export declare const dataImportHdf5Schema: {
    readonly type: "object";
    readonly properties: {
        readonly file_path: {
            readonly type: "string";
            readonly description: "Path to HDF5 file";
        };
        readonly dataset_path: {
            readonly type: "string";
            readonly description: "Path to dataset within HDF5 file (optional, auto-discover if not provided)";
        };
        readonly emit_plots: {
            readonly type: "boolean";
            readonly default: true;
            readonly description: "Generate diagnostic plots of the imported data";
        };
    };
    readonly required: readonly ["file_path"];
    readonly additionalProperties: false;
};
export declare const dataImportFitsSchema: {
    readonly type: "object";
    readonly properties: {
        readonly file_path: {
            readonly type: "string";
            readonly description: "Path to FITS file";
        };
        readonly hdu_index: {
            readonly type: "integer";
            readonly default: 0;
            readonly description: "HDU (Header Data Unit) index to read";
        };
        readonly emit_plots: {
            readonly type: "boolean";
            readonly default: true;
            readonly description: "Generate diagnostic plots of the astronomical data";
        };
    };
    readonly required: readonly ["file_path"];
    readonly additionalProperties: false;
};
export declare const dataImportRootSchema: {
    readonly type: "object";
    readonly properties: {
        readonly file_path: {
            readonly type: "string";
            readonly description: "Path to ROOT file";
        };
        readonly tree_name: {
            readonly type: "string";
            readonly description: "Name of the tree to read";
        };
        readonly branches: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "List of branch names to read (optional, read all if not provided)";
        };
        readonly max_entries: {
            readonly type: "integer";
            readonly default: 10000;
            readonly description: "Maximum number of entries to read";
        };
        readonly emit_plots: {
            readonly type: "boolean";
            readonly default: true;
            readonly description: "Generate diagnostic plots of the particle physics data";
        };
    };
    readonly required: readonly ["file_path", "tree_name"];
    readonly additionalProperties: false;
};
export declare const dataExportHdf5Schema: {
    readonly type: "object";
    readonly properties: {
        readonly data: {
            readonly type: "object";
            readonly description: "Data to export (nested structure)";
        };
        readonly file_path: {
            readonly type: "string";
            readonly description: "Output HDF5 file path";
        };
        readonly compression: {
            readonly type: "string";
            readonly enum: readonly ["gzip", "lzf", "szip", "none"];
            readonly default: "gzip";
            readonly description: "Compression algorithm";
        };
        readonly metadata: {
            readonly type: "object";
            readonly description: "Metadata attributes to store";
        };
    };
    readonly required: readonly ["data", "file_path"];
    readonly additionalProperties: false;
};
