/**
 * Data I/O tools for scientific formats
 */

// Local Tool interface to avoid import issues
interface Tool {
  name: string;
  description: string;
  inputSchema: any;
}
import {
  dataImportHdf5Schema,
  dataImportFitsSchema,
  dataImportRootSchema,
  dataExportHdf5Schema
} from './schema.js';
import {
  dataImportHdf5Handler,
  dataImportFitsHandler,
  dataImportRootHandler,
  dataExportHdf5Handler
} from './handlers.js';

export const tools: Tool[] = [
  {
    name: 'data_import_hdf5',
    description: 'Import HDF5 scientific datasets with metadata extraction and diagnostic plots',
    inputSchema: dataImportHdf5Schema
  },
  {
    name: 'data_import_fits',
    description: 'Import FITS astronomical data with header information and visualization',
    inputSchema: dataImportFitsSchema
  },
  {
    name: 'data_import_root',
    description: 'Import ROOT particle physics data with branch analysis and histograms',
    inputSchema: dataImportRootSchema
  },
  {
    name: 'data_export_hdf5',
    description: 'Export data to HDF5 format with compression and metadata',
    inputSchema: dataExportHdf5Schema
  }
];

// Handler mapping
const handlers: Record<string, any> = {
  'data_import_hdf5': dataImportHdf5Handler,
  'data_import_fits': dataImportFitsHandler,
  'data_import_root': dataImportRootHandler,
  'data_export_hdf5': dataExportHdf5Handler
};

export * from './schema.js';
export * from './handlers.js';

// Server integration functions
export function buildDataIOTools() {
  return tools;
}

export async function handleDataIOTool(name: string, args: any) {
  const handler = handlers[name];
  if (!handler) {
    throw new Error(`Unknown data I/O tool: ${name}`);
  }
  return await handler(args);
}
