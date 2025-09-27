<p align="center">
  <img src="../assets/svg/experiment-orchestrator-hero.svg" width="960" alt="Export Tools" />
</p>

# Export & Publishing Tools

The Export tool provides comprehensive capabilities for publishing your physics work in various formats and platforms, from academic papers to interactive notebooks and VR experiences.

## Export Formats

### Academic Publishing
- **Overleaf LaTeX**: Direct integration with Overleaf for collaborative writing
- **GitHub Repositories**: Create repositories with code, data, and documentation
- **Zenodo Datasets**: Archive research data with DOI assignment
- **Jupyter Notebooks**: Interactive notebooks with embedded results

### Interactive & Multimedia
- **VR/AR Formats**: Export 3D visualizations for virtual reality
- **Web Presentations**: HTML slides with embedded visualizations
- **Interactive Demos**: Standalone applications for student exploration

## Usage Examples

### Create Overleaf Project
```json
{
  "tool": "export_tool",
  "params": {
    "export_type": "overleaf",
    "title": "Quantum Mechanics Lab Report",
    "authors": ["Dr. Smith", "Student Name"],
    "abstract": "Analysis of particle in a box using Physics MCP",
    "template": "article",
    "artifacts": [
      {
        "type": "figure",
        "content": "wave_function_plot.png",
        "caption": "First three energy eigenfunctions",
        "label": "fig:wavefunctions"
      }
    ]
  }
}
```

### Generate GitHub Repository
```json
{
  "tool": "export_tool",
  "params": {
    "export_type": "github",
    "repository_name": "physics-lab-analysis",
    "description": "Student physics lab analysis using Physics MCP",
    "include_artifacts": true,
    "include_code": true,
    "license": "MIT",
    "topics": ["physics", "education", "mcp"]
  }
}
```

### Archive Research Data
```json
{
  "tool": "export_tool",
  "params": {
    "export_type": "zenodo",
    "title": "Pendulum Period Measurements",
    "description": "Experimental data from physics lab",
    "creators": [
      {
        "name": "Dr. Johnson",
        "affiliation": "University Physics Department"
      }
    ],
    "keywords": ["pendulum", "physics", "measurements"],
    "upload_type": "dataset"
  }
}
```

### Create Jupyter Notebook
```json
{
  "tool": "export_tool",
  "params": {
    "export_type": "jupyter",
    "notebook_name": "quantum_analysis.ipynb",
    "session_data": {
      "title": "Quantum Mechanics Analysis",
      "cells": [
        {
          "type": "markdown",
          "content": "# Particle in a Box Analysis"
        },
        {
          "type": "code",
          "content": "import matplotlib.pyplot as plt"
        }
      ]
    },
    "include_outputs": true,
    "kernel": "python3"
  }
}
```

### Export VR Visualization
```json
{
  "tool": "export_tool",
  "params": {
    "export_type": "vr_export",
    "geometry": {
      "vertices": [[0,0,0], [1,0,0], [0,1,0]],
      "faces": [[0,1,2]],
      "colors": [[1,0,0], [0,1,0], [0,0,1]]
    },
    "format": "glb",
    "extras": {
      "title": "3D Physics Visualization",
      "description": "Interactive 3D model for VR exploration"
    }
  }
}
```

## Educational Applications

### Student Project Submissions
- **Lab Reports**: Professional LaTeX documents with embedded plots
- **Research Papers**: Collaborative writing with automatic figure inclusion
- **Portfolio Creation**: GitHub repositories showcasing student work
- **Data Archives**: Proper data management and sharing

### Course Materials
- **Lecture Notes**: Interactive notebooks with live calculations
- **Homework Solutions**: Automated generation of solution sets
- **Exam Materials**: Professional formatting for assessments
- **Student Resources**: Self-contained learning materials

### Research Collaboration
- **Data Sharing**: Standardized data formats for collaboration
- **Reproducible Research**: Complete workflows with all dependencies
- **Publication Support**: Direct integration with academic publishing
- **Open Science**: Public repositories for transparency

## Advanced Features

### Automatic Figure Captioning
```json
{
  "tool": "export_tool",
  "params": {
    "export_type": "overleaf",
    "artifacts": [
      {
        "type": "figure",
        "content": "plot.png",
        "auto_caption": true
      }
    ]
  }
}
```

### Bibliography Management
```json
{
  "tool": "export_tool",
  "params": {
    "export_type": "overleaf",
    "bibliography": [
      "@article{einstein1905, title={On the Electrodynamics of Moving Bodies}, author={Einstein, Albert}, journal={Annalen der Physik}, year={1905}}"
    ]
  }
}
```

### Multi-format Export
```json
{
  "tool": "export_tool",
  "params": {
    "export_type": "jupyter",
    "export_format": "html",
    "include_outputs": true
  }
}
```

## Integration Workflows

### Complete Research Pipeline
1. **Data Collection**: Use data tools to import experimental data
2. **Analysis**: Apply CAS and plotting tools for analysis
3. **Visualization**: Create publication-quality figures
4. **Documentation**: Generate LaTeX reports with embedded results
5. **Publishing**: Export to appropriate academic platforms

### Student Assignment Workflow
1. **Problem Setup**: Use CAS tools for symbolic calculations
2. **Numerical Analysis**: Apply graphing calculator for plots
3. **Report Generation**: Create professional documents
4. **Submission**: Export to course management system

## Quality Assurance

### Document Validation
- **LaTeX Syntax**: Automatic validation of LaTeX documents
- **Figure Quality**: Resolution and format checking
- **Bibliography**: Citation format validation
- **Metadata**: Complete metadata for all exports

### Reproducibility
- **Code Inclusion**: All analysis code included in exports
- **Dependency Tracking**: Complete dependency lists
- **Version Control**: Git integration for change tracking
- **Environment Documentation**: System requirements specified

## Best Practices

### Academic Writing
- Use proper LaTeX templates for your institution
- Include all necessary metadata and abstracts
- Ensure proper attribution and citations
- Follow journal formatting guidelines

### Data Management
- Use descriptive filenames and folder structures
- Include README files with usage instructions
- Provide sample data and expected outputs
- Document data sources and processing steps

### Collaboration
- Use version control for all collaborative projects
- Maintain clear communication about changes
- Document all custom modifications
- Share access credentials securely
