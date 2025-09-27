"""
Export utilities module
Provides enhanced export capabilities to Overleaf, GitHub, Zenodo, and Jupyter
"""

import os
import json
import zipfile
import tempfile
from typing import Dict, Any, List, Optional
from datetime import datetime
import base64

# Optional dependencies
try:
    import nbformat
    from nbformat.v4 import new_notebook, new_code_cell, new_markdown_cell
    JUPYTER_AVAILABLE = True
except ImportError:
    JUPYTER_AVAILABLE = False

try:
    from nbconvert import exporters
    NBCONVERT_AVAILABLE = True
except ImportError:
    NBCONVERT_AVAILABLE = False
    exporters = None

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False


def export_overleaf(project_name: str, template: str = "article", title: str = "",
                   authors: List[str] = None, abstract: str = "",
                   artifacts: List[Dict] = None, bibliography: List[str] = None) -> Dict[str, Any]:
    """Create Overleaf project with LaTeX document and embedded artifacts"""
    
    if not REQUESTS_AVAILABLE:
        raise RuntimeError("requests not available. Install with: pip install requests")
    
    # Create project directory structure
    project_dir = f"artifacts/overleaf_projects/{project_name}"
    os.makedirs(project_dir, exist_ok=True)
    
    # Generate main LaTeX document
    latex_content = _generate_latex_document(template, title, authors or [], abstract, artifacts or [])
    
    # Write main document
    main_file = os.path.join(project_dir, "main.tex")
    with open(main_file, 'w', encoding='utf-8') as f:
        f.write(latex_content)
    
    # Process and copy artifacts
    artifact_files = []
    if artifacts:
        for i, artifact in enumerate(artifacts):
            if artifact.get('type') == 'figure' and 'content' in artifact:
                # Handle base64 encoded images
                if artifact['content'].startswith('data:image'):
                    # Extract base64 data
                    header, data = artifact['content'].split(',', 1)
                    image_data = base64.b64decode(data)
                    
                    # Determine file extension
                    if 'png' in header:
                        ext = 'png'
                    elif 'svg' in header:
                        ext = 'svg'
                    else:
                        ext = 'png'
                    
                    # Save image file
                    img_filename = f"figure_{i+1}.{ext}"
                    img_path = os.path.join(project_dir, img_filename)
                    
                    with open(img_path, 'wb') as f:
                        f.write(image_data)
                    
                    artifact_files.append(img_filename)
    
    # Generate bibliography file if provided
    if bibliography:
        bib_content = '\n'.join(bibliography)
        bib_file = os.path.join(project_dir, "references.bib")
        with open(bib_file, 'w', encoding='utf-8') as f:
            f.write(bib_content)
        artifact_files.append("references.bib")
    
    # Create project archive
    archive_path = f"{project_dir}.zip"
    with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(project_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, project_dir)
                zipf.write(file_path, arcname)
    
    # Note: Actual Overleaf API integration would require authentication
    # This creates a local project that can be manually uploaded
    
    return {
        "project_name": project_name,
        "project_directory": project_dir,
        "archive_path": archive_path,
        "main_file": "main.tex",
        "artifact_files": artifact_files,
        "template": template,
        "overleaf_url": None,  # Would be populated with actual API
        "meta": {
            "created": datetime.now().isoformat(),
            "file_count": len(artifact_files) + 1,
            "ready_for_upload": True
        }
    }


def export_github(repository_name: str, description: str = "", private: bool = False,
                 include_artifacts: bool = True, include_code: bool = True,
                 license: str = "MIT", topics: List[str] = None,
                 readme_content: str = "") -> Dict[str, Any]:
    """Create GitHub repository with code, data, and documentation"""
    
    # Create repository directory structure
    repo_dir = f"artifacts/github_repos/{repository_name}"
    os.makedirs(repo_dir, exist_ok=True)
    
    # Generate README.md
    if not readme_content:
        readme_content = _generate_default_readme(repository_name, description, topics or [])
    
    readme_path = os.path.join(repo_dir, "README.md")
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    
    # Create directory structure
    directories = ["data", "notebooks", "scripts", "docs", "results"]
    if include_artifacts:
        directories.extend(["figures", "plots"])
    
    for dir_name in directories:
        os.makedirs(os.path.join(repo_dir, dir_name), exist_ok=True)
        
        # Add .gitkeep files to empty directories
        gitkeep_path = os.path.join(repo_dir, dir_name, ".gitkeep")
        with open(gitkeep_path, 'w') as f:
            f.write("")
    
    # Generate LICENSE file
    license_content = _generate_license(license)
    license_path = os.path.join(repo_dir, "LICENSE")
    with open(license_path, 'w', encoding='utf-8') as f:
        f.write(license_content)
    
    # Generate .gitignore
    gitignore_content = _generate_gitignore()
    gitignore_path = os.path.join(repo_dir, ".gitignore")
    with open(gitignore_path, 'w', encoding='utf-8') as f:
        f.write(gitignore_content)
    
    # Generate requirements.txt for Python projects
    if include_code:
        requirements_content = _generate_requirements()
        req_path = os.path.join(repo_dir, "requirements.txt")
        with open(req_path, 'w', encoding='utf-8') as f:
            f.write(requirements_content)
    
    # Copy artifacts if requested
    artifact_count = 0
    if include_artifacts and os.path.exists("artifacts"):
        import shutil
        
        # Copy plots and figures
        for item in os.listdir("artifacts"):
            item_path = os.path.join("artifacts", item)
            if os.path.isfile(item_path) and any(item.endswith(ext) for ext in ['.png', '.svg', '.pdf']):
                dest_path = os.path.join(repo_dir, "figures", item)
                shutil.copy2(item_path, dest_path)
                artifact_count += 1
            elif item.endswith('.csv'):
                dest_path = os.path.join(repo_dir, "data", item)
                shutil.copy2(item_path, dest_path)
                artifact_count += 1
    
    # Note: Actual GitHub API integration would require authentication
    # This creates a local repository that can be pushed to GitHub
    
    return {
        "repository_name": repository_name,
        "local_path": repo_dir,
        "description": description,
        "private": private,
        "license": license,
        "topics": topics or [],
        "artifact_count": artifact_count,
        "github_url": None,  # Would be populated with actual API
        "meta": {
            "created": datetime.now().isoformat(),
            "ready_for_push": True,
            "structure_created": True
        }
    }


def export_zenodo(title: str, description: str, creators: List[Dict],
                 keywords: List[str] = None, license: str = "CC-BY-4.0",
                 upload_type: str = "dataset", related_identifiers: List[Dict] = None) -> Dict[str, Any]:
    """Publish dataset to Zenodo with DOI for citation"""
    
    # Create Zenodo package directory
    package_dir = f"artifacts/zenodo_packages/{title.replace(' ', '_')}"
    os.makedirs(package_dir, exist_ok=True)
    
    # Generate metadata.json for Zenodo
    metadata = {
        "title": title,
        "description": description,
        "creators": creators,
        "keywords": keywords or [],
        "license": license,
        "upload_type": upload_type,
        "access_right": "open",
        "related_identifiers": related_identifiers or []
    }
    
    metadata_path = os.path.join(package_dir, "metadata.json")
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    
    # Copy data files
    data_files = []
    if os.path.exists("artifacts"):
        import shutil
        
        for item in os.listdir("artifacts"):
            item_path = os.path.join("artifacts", item)
            if os.path.isfile(item_path):
                dest_path = os.path.join(package_dir, item)
                shutil.copy2(item_path, dest_path)
                data_files.append(item)
    
    # Generate data description file
    description_content = f"""# {title}

## Description
{description}

## Files
"""
    for file in data_files:
        description_content += f"- `{file}`: Data file\n"
    
    description_content += f"""
## Citation
Please cite this dataset as:

{creators[0]['name'] if creators else 'Author'}. ({datetime.now().year}). {title}. Zenodo. DOI: [Will be assigned upon publication]

## License
This dataset is licensed under {license}.
"""
    
    desc_path = os.path.join(package_dir, "README.md")
    with open(desc_path, 'w', encoding='utf-8') as f:
        f.write(description_content)
    
    # Create package archive
    archive_path = f"{package_dir}.zip"
    with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(package_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, package_dir)
                zipf.write(file_path, arcname)
    
    # Note: Actual Zenodo API integration would require authentication
    
    return {
        "title": title,
        "package_directory": package_dir,
        "archive_path": archive_path,
        "metadata": metadata,
        "data_files": data_files,
        "zenodo_url": None,  # Would be populated with actual API
        "doi": None,  # Would be assigned by Zenodo
        "meta": {
            "created": datetime.now().isoformat(),
            "file_count": len(data_files),
            "ready_for_upload": True
        }
    }


def export_jupyter(notebook_name: str, title: str, description: str,
                  session_data: Dict, include_outputs: bool = True,
                  kernel: str = "python3", export_format: str = "ipynb") -> Dict[str, Any]:
    """Generate Jupyter notebook from session data with embedded outputs"""
    
    if not JUPYTER_AVAILABLE:
        raise RuntimeError("nbformat not available. Install with: pip install nbformat")
    
    # Create notebook
    nb = new_notebook()
    
    # Add title and description
    title_cell = new_markdown_cell(f"# {title}\n\n{description}")
    nb.cells.append(title_cell)
    
    # Add imports cell
    imports_code = """import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from scipy import signal
import json

# Configure matplotlib for inline plots
%matplotlib inline
plt.style.use('default')
"""
    imports_cell = new_code_cell(imports_code)
    nb.cells.append(imports_cell)
    
    # Process session data
    if 'events' in session_data:
        for event in session_data['events']:
            if event.get('type') == 'tool_call':
                # Add tool call as code cell
                tool_name = event.get('tool_name', 'unknown')
                params = event.get('params', {})
                
                # Generate code cell
                code = _generate_notebook_code(tool_name, params)
                code_cell = new_code_cell(code)
                
                # Add outputs if available and requested
                if include_outputs and 'result' in event:
                    result = event['result']
                    if 'artifacts' in result and 'png_b64' in result['artifacts']:
                        # Add plot output
                        output = {
                            "output_type": "display_data",
                            "data": {
                                "image/png": result['artifacts']['png_b64']
                            },
                            "metadata": {}
                        }
                        code_cell.outputs = [output]
                
                nb.cells.append(code_cell)
                
                # Add markdown explanation
                explanation = _generate_tool_explanation(tool_name, params, event.get('result'))
                if explanation:
                    explanation_cell = new_markdown_cell(explanation)
                    nb.cells.append(explanation_cell)
    
    # Save notebook
    notebook_dir = "artifacts/jupyter_notebooks"
    os.makedirs(notebook_dir, exist_ok=True)
    
    if not notebook_name.endswith('.ipynb'):
        notebook_name += '.ipynb'
    
    notebook_path = os.path.join(notebook_dir, notebook_name)
    
    with open(notebook_path, 'w', encoding='utf-8') as f:
        nbformat.write(nb, f)
    
    # Export to other formats if requested
    exported_files = [notebook_path]
    resolved_format = 'ipynb'

    if export_format.lower() != "ipynb":
        normalized_format = export_format.lower().strip()
        format_aliases = {
            'md': 'markdown',
            'markdown': 'markdown',
            'htm': 'html',
            'html': 'html',
            'pdf': 'pdf',
            'latex': 'latex',
            'tex': 'latex',
            'python': 'python',
            'py': 'python'
        }
        target_format = format_aliases.get(normalized_format, normalized_format)
        resolved_format = target_format

        if not NBCONVERT_AVAILABLE or exporters is None:
            raise RuntimeError(
                f"nbconvert not available. Install with: pip install nbconvert to export as {export_format}"
            )

        try:
            exporter_cls = exporters.get_exporter(target_format)
        except ValueError as exc:
            raise ValueError(f"Unsupported export format: {export_format}") from exc

        exporter = exporter_cls()
        resources = {
            'metadata': {
                'name': os.path.splitext(notebook_name)[0],
                'path': notebook_dir
            }
        }

        try:
            body, nb_resources = exporter.from_notebook_node(nb, resources=resources)
        except Exception as exc:
            raise RuntimeError(f"Failed to export notebook to {export_format}: {exc}") from exc

        extension = 'py' if target_format == 'python' else target_format
        converted_path = os.path.splitext(notebook_path)[0] + f'.{extension}'

        if isinstance(body, bytes):
            with open(converted_path, 'wb') as f:
                f.write(body)
        else:
            with open(converted_path, 'w', encoding='utf-8') as f:
                f.write(body)

        exported_files.append(converted_path)

        output_files = (nb_resources or {}).get('output_files', {})
        if output_files:
            resource_dir = os.path.splitext(converted_path)[0] + '_files'
            os.makedirs(resource_dir, exist_ok=True)
            for filename, data in output_files.items():
                resource_path = os.path.join(resource_dir, filename)
                if isinstance(data, str):
                    data = data.encode('utf-8')
                with open(resource_path, 'wb') as fh:
                    fh.write(data)
                exported_files.append(resource_path)
    
    return {
        "notebook_name": notebook_name,
        "notebook_path": notebook_path,
        "title": title,
        "description": description,
        "kernel": kernel,
        "export_format": export_format,
        "exported_files": exported_files,
        "cell_count": len(nb.cells),
        "meta": {
            "created": datetime.now().isoformat(),
            "includes_outputs": include_outputs,
            "nbformat_version": nbformat.v4,
            "resolved_format": resolved_format,
            "nbconvert_available": NBCONVERT_AVAILABLE,
            "exported_file_count": len(exported_files)
        }
    }


def _generate_latex_document(template: str, title: str, authors: List[str],
                           abstract: str, artifacts: List[Dict]) -> str:
    """Generate LaTeX document content"""
    
    # Document class and packages
    latex = f"""\\documentclass[11pt,a4paper]{{{template}}}

\\usepackage{{amsmath,amssymb,amsfonts}}
\\usepackage{{graphicx}}
\\usepackage{{float}}
\\usepackage{{hyperref}}
\\usepackage{{booktabs}}
\\usepackage{{geometry}}
\\geometry{{margin=1in}}

\\title{{{title}}}
"""
    
    # Authors
    if authors:
        author_str = " \\and ".join(authors)
        latex += f"\\author{{{author_str}}}\n"
    
    latex += "\\date{\\today}\n\n\\begin{document}\n\n\\maketitle\n\n"
    
    # Abstract
    if abstract:
        latex += f"\\begin{{abstract}}\n{abstract}\n\\end{{abstract}}\n\n"
    
    # Introduction section
    latex += "\\section{Introduction}\n\nThis document was automatically generated from Physics MCP Server analysis.\n\n"
    
    # Add figures and tables from artifacts
    if artifacts:
        latex += "\\section{Results}\n\n"
        
        for i, artifact in enumerate(artifacts):
            if artifact.get('type') == 'figure':
                caption = artifact.get('caption', f'Figure {i+1}')
                label = artifact.get('label', f'fig:{i+1}')
                
                latex += f"""\\begin{{figure}}[H]
\\centering
\\includegraphics[width=0.8\\textwidth]{{figure_{i+1}}}
\\caption{{{caption}}}
\\label{{{label}}}
\\end{{figure}}

"""
            elif artifact.get('type') == 'table':
                # Table handling would go here
                pass
    
    # Conclusion
    latex += "\\section{Conclusion}\n\nAnalysis completed using Physics MCP Server.\n\n"
    
    # Bibliography
    latex += "\\bibliographystyle{plain}\n\\bibliography{references}\n\n"
    
    latex += "\\end{document}"
    
    return latex


def _generate_default_readme(repo_name: str, description: str, topics: List[str]) -> str:
    """Generate default README.md content"""
    
    readme = f"""# {repo_name}

{description}

## Overview

This repository contains physics analysis results generated using the Physics MCP Server.

## Structure

- `data/` - Raw and processed data files
- `notebooks/` - Jupyter notebooks with analysis
- `scripts/` - Analysis scripts and utilities
- `figures/` - Generated plots and visualizations
- `results/` - Analysis results and outputs
- `docs/` - Documentation

## Requirements

See `requirements.txt` for Python dependencies.

## Usage

1. Install dependencies: `pip install -r requirements.txt`
2. Run analysis notebooks in the `notebooks/` directory
3. Generated results will be saved in the `results/` directory

## Topics

{', '.join(f'`{topic}`' for topic in topics)}

## License

See LICENSE file for details.

## Generated

This repository was automatically generated by Physics MCP Server on {datetime.now().strftime('%Y-%m-%d')}.
"""
    
    return readme


def _generate_license(license_type: str) -> str:
    """Generate license content"""
    
    year = datetime.now().year
    
    if license_type == "MIT":
        return f"""MIT License

Copyright (c) {year} Physics MCP Server User

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""
    else:
        return f"# {license_type} License\n\nCopyright (c) {year} Physics MCP Server User\n"


def _generate_gitignore() -> str:
    """Generate .gitignore content"""
    
    return """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Jupyter Notebook
.ipynb_checkpoints

# Environment
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Data files (uncomment if needed)
# *.csv
# *.h5
# *.hdf5
# *.fits

# Large files
*.zip
*.tar.gz
*.pdf
"""


def _generate_requirements() -> str:
    """Generate requirements.txt content"""
    
    return """numpy>=1.21.0
scipy>=1.7.0
matplotlib>=3.5.0
pandas>=1.3.0
jupyter>=1.0.0
h5py>=3.6.0
astropy>=5.0.0
uproot>=4.0.0
requests>=2.25.0
"""


def _generate_notebook_code(tool_name: str, params: Dict) -> str:
    """Generate code for notebook cell based on tool call"""
    
    # This would generate appropriate code based on the tool
    # For now, return a simple representation
    
    code = f"# {tool_name.replace('_', ' ').title()}\n\n"
    code += f"# Parameters:\n"
    for key, value in params.items():
        if isinstance(value, str):
            code += f"{key} = '{value}'\n"
        else:
            code += f"{key} = {value}\n"
    
    code += f"\n# Call {tool_name}\n"
    code += f"result = physics_mcp.{tool_name}(**params)\n"
    
    return code


def _generate_tool_explanation(tool_name: str, params: Dict, result: Dict) -> str:
    """Generate markdown explanation for tool usage"""
    
    explanation = f"## {tool_name.replace('_', ' ').title()}\n\n"
    explanation += f"This analysis used the `{tool_name}` tool with the following parameters:\n\n"
    
    for key, value in params.items():
        explanation += f"- **{key}**: {value}\n"
    
    if result and 'meta' in result:
        meta = result['meta']
        explanation += f"\n### Results Summary\n\n"
        for key, value in meta.items():
            explanation += f"- **{key}**: {value}\n"
    
    return explanation
