/**
 * Request handlers for Export tools
 */

// Simple handler type since we're using direct function calls
export type ToolHandler = (params: any) => Promise<any>;

export const exportOverleafHandler: ToolHandler = async (params) => {
  return {
    method: 'export_overleaf',
    params
  };
};

export const exportGithubHandler: ToolHandler = async (params) => {
  return {
    method: 'export_github',
    params
  };
};

export const exportZenodoHandler: ToolHandler = async (params) => {
  return {
    method: 'export_zenodo',
    params
  };
};

export const exportJupyterHandler: ToolHandler = async (params) => {
  return {
    method: 'export_jupyter',
    params
  };
};
