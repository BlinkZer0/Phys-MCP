/**
 * Request handlers for External API tools
 */
export const apiArxivHandler = async (params) => {
    return {
        method: 'api_arxiv',
        params
    };
};
export const apiCernHandler = async (params) => {
    return {
        method: 'api_cern',
        params
    };
};
export const apiNasaHandler = async (params) => {
    return {
        method: 'api_nasa',
        params
    };
};
export const apiNistHandler = async (params) => {
    return {
        method: 'api_nist',
        params
    };
};
