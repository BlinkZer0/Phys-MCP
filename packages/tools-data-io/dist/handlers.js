/**
 * Request handlers for Data I/O tools
 */
export const dataImportHdf5Handler = async (params) => {
    return {
        method: 'data_import_hdf5',
        params
    };
};
export const dataImportFitsHandler = async (params) => {
    return {
        method: 'data_import_fits',
        params
    };
};
export const dataImportRootHandler = async (params) => {
    return {
        method: 'data_import_root',
        params
    };
};
export const dataExportHdf5Handler = async (params) => {
    return {
        method: 'data_export_hdf5',
        params
    };
};
