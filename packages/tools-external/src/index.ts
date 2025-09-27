/**
 * External API integration tools
 */

// Local Tool interface to avoid import issues
interface Tool {
  name: string;
  description: string;
  inputSchema: any;
}
import {
  apiArxivSchema,
  apiCernSchema,
  apiNasaSchema,
  apiNistSchema
} from './schema.js';
import {
  apiArxivHandler,
  apiCernHandler,
  apiNasaHandler,
  apiNistHandler
} from './handlers.js';

export const tools: Tool[] = [
  {
    name: 'api_tools',
    description: 'Access external scientific APIs: arXiv papers, CERN Open Data, NASA datasets, NIST physical data',
    inputSchema: {
      type: "object",
      properties: {
        api: {
          type: "string",
          description: "External API to access",
          enum: ["arxiv", "cern", "nasa", "nist"]
        },
        // arXiv parameters
        query: { type: "string", description: "Search query (title, author, abstract, etc.)" },
        category: { type: "string", description: "arXiv category (e.g., 'physics', 'math-ph', 'quant-ph')" },
        sort_by: { type: "string", enum: ["relevance", "lastUpdatedDate", "submittedDate"], default: "relevance", description: "Sort order for results" },
        download_pdfs: { type: "boolean", default: false, description: "Download PDF files for found papers" },
        
        // CERN parameters
        dataset_name: { type: "string", description: "Name or ID of CERN Open Data dataset" },
        experiment: { type: "string", enum: ["CMS", "ATLAS", "ALICE", "LHCb"], description: "LHC experiment (optional filter)" },
        data_type: { type: "string", enum: ["AOD", "MINIAOD", "NanoAOD", "derived"], description: "Data format type" },
        year: { type: "integer", minimum: 2010, maximum: 2024, description: "Data collection year" },
        max_files: { type: "integer", default: 5, minimum: 1, maximum: 50, description: "Maximum number of files to retrieve" },
        
        // NASA parameters
        dataset_type: { type: "string", enum: ["astronomy", "earth", "planetary", "heliophysics"], description: "Type of NASA dataset" },
        mission: { type: "string", description: "Mission name (e.g., 'Hubble', 'Kepler', 'MODIS')" },
        instrument: { type: "string", description: "Instrument name" },
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
        
        // NIST parameters
        element: { type: "string", description: "Chemical element symbol (for atomic data)" },
        property: { type: "string", description: "Physical property to search for" },
        temperature: { type: "number", description: "Temperature in Kelvin (for material properties)" },
        pressure: { type: "number", description: "Pressure in Pa (for material properties)" },
        format: { type: "string", enum: ["json", "xml", "csv"], default: "json", description: "Output format" },
        
        // Common parameters
        max_results: { type: "integer", default: 10, minimum: 1, maximum: 100, description: "Maximum number of results to return" }
      },
      required: ["api"]
    }
  }
];

// Handler mapping
const handlers: Record<string, any> = {
  'api_arxiv': apiArxivHandler,
  'api_cern': apiCernHandler,
  'api_nasa': apiNasaHandler,
  'api_nist': apiNistHandler
};

export * from './schema.js';
export * from './handlers.js';

// Server integration functions
export function buildExternalTools() {
  return tools;
}

export async function handleExternalTool(name: string, args: any) {
  if (name === 'api_tools') {
    const api = args.api;
    
    switch (api) {
      case 'arxiv':
        return await apiArxivHandler({
          query: args.query,
          category: args.category,
          max_results: args.max_results,
          sort_by: args.sort_by,
          download_pdfs: args.download_pdfs
        });
        
      case 'cern':
        return await apiCernHandler({
          dataset_name: args.dataset_name,
          experiment: args.experiment,
          data_type: args.data_type,
          year: args.year,
          max_files: args.max_files
        });
        
      case 'nasa':
        return await apiNasaHandler({
          dataset_type: args.dataset_type,
          mission: args.mission,
          instrument: args.instrument,
          date_range: args.date_range,
          coordinates: args.coordinates,
          max_results: args.max_results
        });
        
      case 'nist':
        return await apiNistHandler({
          data_type: args.data_type,
          element: args.element,
          property: args.property,
          temperature: args.temperature,
          pressure: args.pressure,
          format: args.format
        });
        
      default:
        throw new Error(`Unknown API: ${api}`);
    }
  }
  
  // Legacy support for individual tools
  const handler = handlers[name];
  if (!handler) {
    throw new Error(`Unknown external API tool: ${name}`);
  }
  return await handler(args);
}
