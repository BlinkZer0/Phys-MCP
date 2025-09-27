/**
 * JSON Schema definitions for Export tools
 */
export declare const exportOverleafSchema: {
    readonly type: "object";
    readonly properties: {
        readonly project_name: {
            readonly type: "string";
            readonly description: "Name for the Overleaf project";
        };
        readonly template: {
            readonly type: "string";
            readonly enum: readonly ["article", "report", "book", "beamer", "poster"];
            readonly default: "article";
            readonly description: "LaTeX document template";
        };
        readonly title: {
            readonly type: "string";
            readonly description: "Document title";
        };
        readonly authors: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "List of author names";
        };
        readonly abstract: {
            readonly type: "string";
            readonly description: "Document abstract";
        };
        readonly artifacts: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly type: {
                        readonly type: "string";
                        readonly enum: readonly ["figure", "table", "equation"];
                    };
                    readonly content: {
                        readonly type: "string";
                    };
                    readonly caption: {
                        readonly type: "string";
                    };
                    readonly label: {
                        readonly type: "string";
                    };
                };
            };
            readonly description: "Artifacts to include in the document";
        };
        readonly bibliography: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "BibTeX entries";
        };
    };
    readonly required: readonly ["project_name", "title"];
    readonly additionalProperties: false;
};
export declare const exportGithubSchema: {
    readonly type: "object";
    readonly properties: {
        readonly repository_name: {
            readonly type: "string";
            readonly description: "GitHub repository name";
        };
        readonly description: {
            readonly type: "string";
            readonly description: "Repository description";
        };
        readonly private: {
            readonly type: "boolean";
            readonly default: false;
            readonly description: "Make repository private";
        };
        readonly include_artifacts: {
            readonly type: "boolean";
            readonly default: true;
            readonly description: "Include generated artifacts (plots, data)";
        };
        readonly include_code: {
            readonly type: "boolean";
            readonly default: true;
            readonly description: "Include analysis code and notebooks";
        };
        readonly license: {
            readonly type: "string";
            readonly enum: readonly ["MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", "CC-BY-4.0"];
            readonly default: "MIT";
            readonly description: "Repository license";
        };
        readonly topics: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "GitHub topics/tags";
        };
        readonly readme_content: {
            readonly type: "string";
            readonly description: "Custom README content";
        };
    };
    readonly required: readonly ["repository_name"];
    readonly additionalProperties: false;
};
export declare const exportZenodoSchema: {
    readonly type: "object";
    readonly properties: {
        readonly title: {
            readonly type: "string";
            readonly description: "Dataset title";
        };
        readonly description: {
            readonly type: "string";
            readonly description: "Dataset description";
        };
        readonly creators: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly affiliation: {
                        readonly type: "string";
                    };
                    readonly orcid: {
                        readonly type: "string";
                    };
                };
                readonly required: readonly ["name"];
            };
            readonly description: "Dataset creators";
        };
        readonly keywords: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "Keywords for the dataset";
        };
        readonly license: {
            readonly type: "string";
            readonly enum: readonly ["CC-BY-4.0", "CC-BY-SA-4.0", "CC0-1.0", "MIT"];
            readonly default: "CC-BY-4.0";
            readonly description: "Data license";
        };
        readonly upload_type: {
            readonly type: "string";
            readonly enum: readonly ["dataset", "software", "publication"];
            readonly default: "dataset";
            readonly description: "Type of upload";
        };
        readonly related_identifiers: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly identifier: {
                        readonly type: "string";
                    };
                    readonly relation: {
                        readonly type: "string";
                    };
                    readonly resource_type: {
                        readonly type: "string";
                    };
                };
            };
            readonly description: "Related publications or datasets";
        };
    };
    readonly required: readonly ["title", "description", "creators"];
    readonly additionalProperties: false;
};
export declare const exportJupyterSchema: {
    readonly type: "object";
    readonly properties: {
        readonly notebook_name: {
            readonly type: "string";
            readonly description: "Jupyter notebook filename";
        };
        readonly title: {
            readonly type: "string";
            readonly description: "Notebook title";
        };
        readonly description: {
            readonly type: "string";
            readonly description: "Notebook description";
        };
        readonly session_data: {
            readonly type: "object";
            readonly description: "Session data to convert to notebook";
        };
        readonly include_outputs: {
            readonly type: "boolean";
            readonly default: true;
            readonly description: "Include cell outputs (plots, results)";
        };
        readonly kernel: {
            readonly type: "string";
            readonly enum: readonly ["python3", "julia", "r"];
            readonly default: "python3";
            readonly description: "Jupyter kernel to use";
        };
        readonly export_format: {
            readonly type: "string";
            readonly enum: readonly ["ipynb", "html", "pdf", "slides"];
            readonly default: "ipynb";
            readonly description: "Export format";
        };
    };
    readonly required: readonly ["notebook_name", "session_data"];
    readonly additionalProperties: false;
};
export declare const exportVRSchema: {
    readonly type: "object";
    readonly properties: {
        readonly geometry: {
            readonly type: "object";
            readonly properties: {
                readonly vertices: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "number";
                        };
                        readonly minItems: 3;
                        readonly maxItems: 3;
                    };
                    readonly description: "Array of [x,y,z] coordinates";
                };
                readonly faces: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "integer";
                            readonly minimum: 0;
                        };
                    };
                    readonly description: "Array of vertex indices";
                };
                readonly normals: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "number";
                        };
                    };
                    readonly nullable: true;
                    readonly description: "Optional normals";
                };
                readonly colors: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "number";
                        };
                    };
                    readonly nullable: true;
                    readonly description: "Optional colors";
                };
            };
            readonly required: readonly ["vertices", "faces"];
            readonly description: "3D geometry data";
        };
        readonly format: {
            readonly type: "string";
            readonly enum: readonly ["glb", "ply"];
            readonly default: "glb";
            readonly description: "Export format";
        };
        readonly extras: {
            readonly type: "object";
            readonly description: "Additional metadata";
        };
    };
    readonly required: readonly ["geometry"];
    readonly additionalProperties: false;
};
