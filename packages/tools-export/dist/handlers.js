/**
 * Request handlers for Export tools
 */
export const exportOverleafHandler = async (params) => {
    return {
        method: 'export_overleaf',
        params
    };
};
export const exportGithubHandler = async (params) => {
    return {
        method: 'export_github',
        params
    };
};
export const exportZenodoHandler = async (params) => {
    return {
        method: 'export_zenodo',
        params
    };
};
export const exportJupyterHandler = async (params) => {
    return {
        method: 'export_jupyter',
        params
    };
};
export const exportVRHandler = async (params) => {
    return {
        method: 'plot_vr_export',
        params
    };
};
