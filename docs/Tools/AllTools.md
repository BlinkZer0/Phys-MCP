<p align="center">
  <img src="../assets/svg/physics-mcp-hero.svg" width="960" alt="All 17 Physics MCP Tools" />
</p>

# Physics MCP Complete Tool Catalog

**Current server version: 2.0** - All 17 tools are available through the Physics MCP Server and can be orchestrated individually or chained together in complex workflows using the experiment orchestrator.

## 🔢 Core Mathematics & Computation (4 tools)

### 1. [Computer Algebra System (CAS)](CAS.md)
**Tool name:** `cas`  
**Purpose:** Symbolic mathematics, equation solving, calculus operations  
**Capabilities:** Evaluate expressions, differentiate, integrate, solve equations and ODEs, propagate uncertainty  
**Best for:** Algebraic manipulations, symbolic calculations, mathematical derivations

### 2. [Graphing Calculator](GraphingCalculator.md) 
**Tool name:** `graphing_calculator`  
**Purpose:** Interactive plotting and mathematical visualization  
**Capabilities:** Multi-series plotting, parametric curves, implicit functions, animations, matrix operations, statistics  
**Best for:** Student exploration, interactive demonstrations, mathematical visualization

### 3. [Units Converter](Units.md)
**Tool name:** `units_convert`  
**Purpose:** Unit conversions and dimensional analysis  
**Capabilities:** Convert between SI, imperial, and physics-specific units with Pint registry  
**Best for:** Unit consistency, dimensional analysis, physics calculations

### 4. [Physical Constants](Constants.md)
**Tool name:** `constants_get`  
**Purpose:** Access to fundamental physical constants  
**Capabilities:** CODATA constants, astrophysical constants, uncertainties, proper units  
**Best for:** Problem setup, constant lookup, precision calculations

## 📊 Visualization & Analysis (4 tools)

### 5. [Plot Generator](Plot.md)
**Tool name:** `plot`  
**Purpose:** Advanced scientific plotting and visualization  
**Capabilities:** 2D/3D plots, vector fields, phase portraits, animations, interactive plots  
**Best for:** Publication-quality figures, complex visualizations, scientific plots

### 6. [Statistical Mechanics](StatMech.md)
**Tool name:** `statmech_partition`  
**Purpose:** Thermodynamic calculations and partition functions  
**Capabilities:** Calculate partition functions, thermodynamic quantities from energy levels  
**Best for:** Statistical mechanics courses, thermodynamic analysis

### 7. [Quantum Tools](Quantum.md)
**Tool name:** `quantum`  
**Purpose:** Quantum mechanics calculations and visualization  
**Capabilities:** Bloch sphere visualization, commutators, matrix representations, quantum state analysis  
**Best for:** Quantum mechanics courses, quantum computing, quantum state visualization

### 8. [Tensor Algebra](Tensor.md)
**Tool name:** `tensor_algebra`  
**Purpose:** General relativity and tensor mathematics  
**Capabilities:** Christoffel symbols, curvature tensors, geodesics, metric tensor operations  
**Best for:** General relativity, advanced mathematics, tensor calculus

## 🔬 Data & Experimentation (4 tools)

### 9. [Data Processing](Data.md)
**Tool name:** `data`  
**Purpose:** Scientific data import/export and signal processing  
**Capabilities:** HDF5/FITS/ROOT import/export, FFT analysis, filtering, spectrograms, wavelets  
**Best for:** Experimental data analysis, signal processing, data format conversion

### 10. [External APIs](ExternalAPIs.md)
**Tool name:** `api_tools`  
**Purpose:** Access to scientific databases and repositories  
**Capabilities:** arXiv papers, CERN data, NASA datasets, NIST constants, literature search  
**Best for:** Research, literature reviews, data acquisition, current events

### 11. [Export & Publishing](Export.md)
**Tool name:** `export_tool`  
**Purpose:** Publish and share research results  
**Capabilities:** LaTeX reports, GitHub repos, Zenodo datasets, Jupyter notebooks, VR/AR formats  
**Best for:** Publication, sharing results, creating reports, collaborative work

### 12. [Acceleration Detection](CAS.md#accel_caps)
**Tool name:** `accel_caps`  
**Purpose:** Hardware acceleration capabilities  
**Capabilities:** Report GPU capabilities, acceleration modes, device information  
**Best for:** Performance optimization, hardware utilization

## 🤖 AI & Advanced Tools (5 tools)

### 13. [Natural Language Interface](NLI.md)
**Tool name:** `nli_parse`  
**Purpose:** Convert natural language to tool commands  
**Capabilities:** Parse physics requests, generate structured tool calls, intent recognition  
**Best for:** Voice commands, natural interaction, accessibility

### 14. [Machine Learning & AI](ML.md)
**Tool name:** `ml_ai_augmentation`  
**Purpose:** AI-powered physics analysis and pattern recognition  
**Capabilities:** Symbolic regression, physics-informed neural networks, pattern recognition, derivation explanation  
**Best for:** Data mining, equation discovery, advanced analysis, AI-assisted learning

### 15. [Distributed Computing](Distributed.md)
**Tool name:** `distributed_collaboration`  
**Purpose:** Collaborative computing and remote job execution  
**Capabilities:** Remote job submission, session sharing, lab notebook, artifact versioning  
**Best for:** Large-scale computations, collaboration, research workflows

### 16. [Experiment Orchestrator](Orchestrator.md)
**Tool name:** `experiment_orchestrator`  
**Purpose:** Chain multiple tools into complex workflows  
**Capabilities:** DAG definition, validation, execution, publication, workflow automation  
**Best for:** Complex experiments, reproducible research, automated workflows

### 17. [Report Generator](Report.md)
**Tool name:** `report_generate`  
**Purpose:** Generate comprehensive session reports  
**Capabilities:** Markdown reports, artifact summaries, session documentation  
**Best for:** Documentation, session summaries, progress tracking

## 🚀 Getting Started with the Tools

### For Educators
1. **Start Simple**: Begin with [Graphing Calculator](GraphingCalculator.md) for basic plotting
2. **Add Math**: Use [CAS](CAS.md) for symbolic calculations
3. **Get Constants**: Access [Physical Constants](Constants.md) for problem setup
4. **Create Visuals**: Use [Plot Generator](Plot.md) for publication-quality figures

### For Students
1. **Learn Basics**: Start with [Graphing Calculator](GraphingCalculator.md) and [CAS](CAS.md)
2. **Explore Physics**: Try [Quantum Tools](Quantum.md) and [Statistical Mechanics](StatMech.md)
3. **Analyze Data**: Use [Data Processing](Data.md) for lab work
4. **Share Results**: Use [Export Tools](Export.md) for assignments

### For Researchers
1. **Complex Workflows**: Use [Experiment Orchestrator](Orchestrator.md) for multi-step analyses
2. **Collaboration**: Leverage [Distributed Computing](Distributed.md) for team projects
3. **AI Analysis**: Apply [Machine Learning](ML.md) for pattern recognition
4. **Publication**: Use [Export Tools](Export.md) for papers and reports

## 🔗 Tool Integration

All tools are designed to work together seamlessly:
- **Data flows** between tools automatically
- **Artifacts** are shared and versioned
- **Workflows** can be saved and reproduced
- **Results** can be exported in multiple formats

## 📚 Documentation

Each tool has detailed documentation with:
- **Usage examples** for common tasks
- **Parameter specifications** for advanced use
- **Integration patterns** with other tools
- **Educational applications** for classroom use

---

*This catalog is maintained by the Physics MCP community. Have suggestions or found an issue? [Let us know](https://github.com/your-repo/Phys-MCP/discussions)!*

