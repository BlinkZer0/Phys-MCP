/**
 * Request handlers for Data I/O tools
 */

// Simple handler type since we're using direct function calls
export type ToolHandler = (params: any) => Promise<any>;

export const dataImportHdf5Handler: ToolHandler = async (params) => {
  return {
    method: 'data_import_hdf5',
    params
  };
};

export const dataImportFitsHandler: ToolHandler = async (params) => {
  return {
    method: 'data_import_fits',
    params
  };
};

export const dataImportRootHandler: ToolHandler = async (params) => {
  return {
    method: 'data_import_root',
    params
  };
};

export const dataExportHdf5Handler: ToolHandler = async (params) => {
  return {
    method: 'data_export_hdf5',
    params
  };
};
