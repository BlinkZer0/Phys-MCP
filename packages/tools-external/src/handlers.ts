/**
 * Request handlers for External API tools
 */

// Simple handler type since we're using direct function calls
export type ToolHandler = (params: any) => Promise<any>;

export const apiArxivHandler: ToolHandler = async (params) => {
  return {
    method: 'api_arxiv',
    params
  };
};

export const apiCernHandler: ToolHandler = async (params) => {
  return {
    method: 'api_cern',
    params
  };
};

export const apiNasaHandler: ToolHandler = async (params) => {
  return {
    method: 'api_nasa',
    params
  };
};

export const apiNistHandler: ToolHandler = async (params) => {
  return {
    method: 'api_nist',
    params
  };
};
