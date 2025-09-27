/**
 * JSON Schema definitions for Data I/O tools
 */

export const dataImportHdf5Schema = {
  type: "object",
  properties: {
    file_path: {
      type: "string",
      description: "Path to HDF5 file"
    },
    dataset_path: {
      type: "string",
      description: "Path to dataset within HDF5 file (optional, auto-discover if not provided)"
    },
    emit_plots: {
      type: "boolean",
      default: true,
      description: "Generate diagnostic plots of the imported data"
    }
  },
  required: ["file_path"],
  additionalProperties: false
} as const;

export const dataImportFitsSchema = {
  type: "object",
  properties: {
    file_path: {
      type: "string",
      description: "Path to FITS file"
    },
    hdu_index: {
      type: "integer",
      default: 0,
      description: "HDU (Header Data Unit) index to read"
    },
    emit_plots: {
      type: "boolean",
      default: true,
      description: "Generate diagnostic plots of the astronomical data"
    }
  },
  required: ["file_path"],
  additionalProperties: false
} as const;

export const dataImportRootSchema = {
  type: "object",
  properties: {
    file_path: {
      type: "string",
      description: "Path to ROOT file"
    },
    tree_name: {
      type: "string",
      description: "Name of the tree to read"
    },
    branches: {
      type: "array",
      items: { type: "string" },
      description: "List of branch names to read (optional, read all if not provided)"
    },
    max_entries: {
      type: "integer",
      default: 10000,
      description: "Maximum number of entries to read"
    },
    emit_plots: {
      type: "boolean",
      default: true,
      description: "Generate diagnostic plots of the particle physics data"
    }
  },
  required: ["file_path", "tree_name"],
  additionalProperties: false
} as const;

export const dataExportHdf5Schema = {
  type: "object",
  properties: {
    data: {
      type: "object",
      description: "Data to export (nested structure)"
    },
    file_path: {
      type: "string",
      description: "Output HDF5 file path"
    },
    compression: {
      type: "string",
      enum: ["gzip", "lzf", "szip", "none"],
      default: "gzip",
      description: "Compression algorithm"
    },
    metadata: {
      type: "object",
      description: "Metadata attributes to store"
    }
  },
  required: ["data", "file_path"],
  additionalProperties: false
} as const;
