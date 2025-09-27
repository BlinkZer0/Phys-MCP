/**
 * JSON Schema definitions for Export tools
 */

export const exportOverleafSchema = {
  type: "object",
  properties: {
    project_name: {
      type: "string",
      description: "Name for the Overleaf project"
    },
    template: {
      type: "string",
      enum: ["article", "report", "book", "beamer", "poster"],
      default: "article",
      description: "LaTeX document template"
    },
    title: {
      type: "string",
      description: "Document title"
    },
    authors: {
      type: "array",
      items: { type: "string" },
      description: "List of author names"
    },
    abstract: {
      type: "string",
      description: "Document abstract"
    },
    artifacts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["figure", "table", "equation"] },
          content: { type: "string" },
          caption: { type: "string" },
          label: { type: "string" }
        }
      },
      description: "Artifacts to include in the document"
    },
    bibliography: {
      type: "array",
      items: { type: "string" },
      description: "BibTeX entries"
    }
  },
  required: ["project_name", "title"],
  additionalProperties: false
} as const;

export const exportGithubSchema = {
  type: "object",
  properties: {
    repository_name: {
      type: "string",
      description: "GitHub repository name"
    },
    description: {
      type: "string",
      description: "Repository description"
    },
    private: {
      type: "boolean",
      default: false,
      description: "Make repository private"
    },
    include_artifacts: {
      type: "boolean",
      default: true,
      description: "Include generated artifacts (plots, data)"
    },
    include_code: {
      type: "boolean",
      default: true,
      description: "Include analysis code and notebooks"
    },
    license: {
      type: "string",
      enum: ["MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", "CC-BY-4.0"],
      default: "MIT",
      description: "Repository license"
    },
    topics: {
      type: "array",
      items: { type: "string" },
      description: "GitHub topics/tags"
    },
    readme_content: {
      type: "string",
      description: "Custom README content"
    }
  },
  required: ["repository_name"],
  additionalProperties: false
} as const;

export const exportZenodoSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Dataset title"
    },
    description: {
      type: "string",
      description: "Dataset description"
    },
    creators: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          affiliation: { type: "string" },
          orcid: { type: "string" }
        },
        required: ["name"]
      },
      description: "Dataset creators"
    },
    keywords: {
      type: "array",
      items: { type: "string" },
      description: "Keywords for the dataset"
    },
    license: {
      type: "string",
      enum: ["CC-BY-4.0", "CC-BY-SA-4.0", "CC0-1.0", "MIT"],
      default: "CC-BY-4.0",
      description: "Data license"
    },
    upload_type: {
      type: "string",
      enum: ["dataset", "software", "publication"],
      default: "dataset",
      description: "Type of upload"
    },
    related_identifiers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          identifier: { type: "string" },
          relation: { type: "string" },
          resource_type: { type: "string" }
        }
      },
      description: "Related publications or datasets"
    }
  },
  required: ["title", "description", "creators"],
  additionalProperties: false
} as const;

export const exportJupyterSchema = {
  type: "object",
  properties: {
    notebook_name: {
      type: "string",
      description: "Jupyter notebook filename"
    },
    title: {
      type: "string",
      description: "Notebook title"
    },
    description: {
      type: "string",
      description: "Notebook description"
    },
    session_data: {
      type: "object",
      description: "Session data to convert to notebook"
    },
    include_outputs: {
      type: "boolean",
      default: true,
      description: "Include cell outputs (plots, results)"
    },
    kernel: {
      type: "string",
      enum: ["python3", "julia", "r"],
      default: "python3",
      description: "Jupyter kernel to use"
    },
    export_format: {
      type: "string",
      enum: ["ipynb", "html", "pdf", "slides"],
      default: "ipynb",
      description: "Export format"
    }
  },
  required: ["notebook_name", "session_data"],
  additionalProperties: false
} as const;
