<p align="center">
  <img src="../assets/svg/experiment-orchestrator-hero.svg" width="960" alt="Experiment Orchestrator" />
</p>

# Experiment Orchestrator

The Experiment Orchestrator is the crown jewel of Physics MCP—a unified digital physics lab that allows you to define, validate, execute, and publish complex multi-step physics experiments using Directed Acyclic Graphs (DAGs).

## Core Capabilities

### DAG Definition
- **Visual Workflow**: Define experiments as connected graphs of tools
- **Natural Language**: Describe experiments in plain English
- **JSON Specification**: Programmatic definition for advanced users
- **Template Library**: Pre-built workflows for common experiments

### Validation & Safety
- **Cyclic Detection**: Ensure workflows don't have circular dependencies
- **Schema Validation**: Verify all parameters are correct
- **Resource Limits**: Prevent runaway computations
- **Graphics Audit**: Ensure all visual outputs are properly declared

### Execution & Monitoring
- **Parallel Processing**: Run independent steps simultaneously
- **Progress Tracking**: Real-time monitoring of experiment progress
- **Error Handling**: Graceful failure recovery and retry logic
- **Caching**: Avoid redundant computations with intelligent caching

### Publication & Sharing
- **Automatic Reports**: Generate publication-ready PDFs with figures
- **Artifact Management**: Track and version all generated content
- **Collaboration**: Share experiments with colleagues and students
- **Reproducibility**: Exact reproduction of any previous experiment

## Usage Examples

### Define Simple DAG
```json
{
  "tool": "experiment_orchestrator",
  "params": {
    "action": "define_dag",
    "name": "Quantum Oscillator Analysis",
    "description": "Analyze energy levels of quantum harmonic oscillator",
    "nodes": [
      {
        "id": "calculate_levels",
        "tool": "quantum",
        "params": {
          "problem": "sho",
          "params": {"mass": 1.0, "frequency": 2.0}
        }
      },
      {
        "id": "plot_levels",
        "tool": "plot",
        "params": {
          "plot_type": "function_2d",
          "f": "from:calculate_levels.energy_expression"
        },
        "dependencies": ["calculate_levels"]
      }
    ]
  }
}
```

### Natural Language Definition
```json
{
  "tool": "experiment_orchestrator",
  "params": {
    "action": "define_dag",
    "description": "First calculate the energy levels of a quantum harmonic oscillator, then plot the wave functions for the first three states, and finally create an animation showing how the probability density changes over time"
  }
}
```

### Execute Complete Experiment
```json
{
  "tool": "experiment_orchestrator",
  "params": {
    "action": "run_dag",
    "dag_id": "quantum_oscillator_analysis",
    "execution_policy": "local_first",
    "parallel_execution": true,
    "cache_enabled": true
  }
}
```

### Publish Results
```json
{
  "tool": "experiment_orchestrator",
  "params": {
    "action": "publish_report",
    "dag_id": "quantum_oscillator_analysis",
    "title": "Quantum Harmonic Oscillator: Complete Analysis",
    "authors": ["Dr. Smith", "Student Name"],
    "abstract": "Comprehensive analysis of quantum harmonic oscillator using Physics MCP",
    "include_artifacts": true,
    "format": "pdf"
  }
}
```

## Educational Applications

### Student Projects
- **Guided Experiments**: Step-by-step workflows for learning
- **Template Library**: Pre-built experiments for common topics
- **Customization**: Students can modify parameters and see results
- **Documentation**: Automatic generation of lab reports

### Research Workflows
- **Complex Analyses**: Multi-step research processes
- **Reproducible Science**: Exact reproduction of published results
- **Collaboration**: Share complex workflows with colleagues
- **Publication**: Generate publication-ready figures and reports

### Course Development
- **Lab Preparation**: Create standardized lab procedures
- **Assessment**: Automated grading of student work
- **Resource Management**: Efficient use of computing resources
- **Quality Control**: Ensure consistent results across sections

## Advanced Features

### Complex DAG Example
```json
{
  "tool": "experiment_orchestrator",
  "params": {
    "action": "define_dag",
    "name": "Particle Physics Analysis",
    "nodes": [
      {
        "id": "import_data",
        "tool": "api_tools",
        "params": {
          "api": "cern",
          "dataset_name": "CMS-Run2011A-MuOnia"
        }
      },
      {
        "id": "preprocess",
        "tool": "data",
        "params": {
          "action": "filter",
          "filter_type": "lowpass",
          "cutoff_freq": 1000
        },
        "dependencies": ["import_data"]
      },
      {
        "id": "analyze_signal",
        "tool": "ml_ai_augmentation",
        "params": {
          "action": "pattern_recognition_infer",
          "model_type": "yolo"
        },
        "dependencies": ["preprocess"]
      },
      {
        "id": "visualize_results",
        "tool": "plot",
        "params": {
          "plot_type": "function_2d",
          "data": "from:analyze_signal.results"
        },
        "dependencies": ["analyze_signal"]
      },
      {
        "id": "generate_report",
        "tool": "export_tool",
        "params": {
          "export_type": "overleaf",
          "artifacts": "from:visualize_results"
        },
        "dependencies": ["visualize_results"]
      }
    ]
  }
}
```

### Parameter Sweeps
```json
{
  "tool": "experiment_orchestrator",
  "params": {
    "action": "define_dag",
    "name": "Parameter Study",
    "parameter_sweep": {
      "parameter": "frequency",
      "values": [1.0, 2.0, 3.0, 4.0, 5.0],
      "parallel": true
    },
    "nodes": [
      {
        "id": "calculate",
        "tool": "quantum",
        "params": {
          "problem": "sho",
          "frequency": "from:sweep"
        }
      }
    ]
  }
}
```

### Conditional Execution
```json
{
  "tool": "experiment_orchestrator",
  "params": {
    "action": "define_dag",
    "name": "Conditional Analysis",
    "nodes": [
      {
        "id": "check_data",
        "tool": "data",
        "params": {
          "action": "validate",
          "file": "input.csv"
        }
      },
      {
        "id": "process_if_valid",
        "tool": "cas",
        "params": {
          "expr": "analyze_data()"
        },
        "dependencies": ["check_data"],
        "condition": "check_data.valid == true"
      }
    ]
  }
}
```

## Execution Policies

### Local Execution
- **Fast Development**: Run experiments on your local machine
- **Interactive Debugging**: Step through experiments interactively
- **Resource Control**: Full control over local resources
- **Privacy**: Keep sensitive data on your machine

### Remote Execution
- **HPC Clusters**: Use institutional supercomputers
- **Cloud Computing**: Scale to cloud platforms
- **Resource Sharing**: Efficient use of shared resources
- **Cost Optimization**: Pay only for what you use

### Hybrid Execution
- **Intelligent Scheduling**: Automatically choose best execution location
- **Load Balancing**: Distribute work based on resource availability
- **Fault Tolerance**: Handle failures gracefully
- **Cost Awareness**: Balance performance and cost

## Quality Assurance

### Validation Pipeline
- **Syntax Checking**: Verify DAG structure and syntax
- **Parameter Validation**: Ensure all parameters are valid
- **Resource Estimation**: Predict resource requirements
- **Safety Checks**: Prevent dangerous or expensive operations

### Testing Framework
- **Unit Tests**: Test individual nodes in isolation
- **Integration Tests**: Test complete workflows
- **Regression Tests**: Ensure changes don't break existing workflows
- **Performance Tests**: Validate performance characteristics

### Monitoring and Logging
- **Real-time Monitoring**: Track experiment progress
- **Detailed Logging**: Complete audit trail of all operations
- **Error Reporting**: Clear error messages and debugging information
- **Performance Metrics**: Track resource usage and execution time

## Integration Examples

### Complete Research Pipeline
```json
{
  "tool": "experiment_orchestrator",
  "params": {
    "action": "define_dag",
    "name": "Complete Research Workflow",
    "nodes": [
      {
        "id": "literature_review",
        "tool": "api_tools",
        "params": {
          "api": "arxiv",
          "query": "quantum computing"
        }
      },
      {
        "id": "data_collection",
        "tool": "data",
        "params": {
          "action": "import_hdf5",
          "file": "experiment_data.h5"
        }
      },
      {
        "id": "analysis",
        "tool": "ml_ai_augmentation",
        "params": {
          "action": "symbolic_regression_train"
        },
        "dependencies": ["data_collection"]
      },
      {
        "id": "visualization",
        "tool": "plot",
        "params": {
          "plot_type": "function_2d"
        },
        "dependencies": ["analysis"]
      },
      {
        "id": "collaboration",
        "tool": "distributed_collaboration",
        "params": {
          "action": "session_share"
        },
        "dependencies": ["visualization"]
      },
      {
        "id": "publication",
        "tool": "export_tool",
        "params": {
          "export_type": "overleaf"
        },
        "dependencies": ["collaboration"]
      }
    ]
  }
}
```

## Best Practices

### DAG Design
- **Modularity**: Break complex experiments into smaller, reusable components
- **Clarity**: Use descriptive names and clear documentation
- **Efficiency**: Minimize dependencies to maximize parallelization
- **Robustness**: Include error handling and validation steps

### Resource Management
- **Resource Estimation**: Accurately estimate resource requirements
- **Caching**: Use caching to avoid redundant computations
- **Cleanup**: Clean up temporary files and resources
- **Monitoring**: Monitor resource usage and adjust as needed

### Collaboration
- **Documentation**: Document all experiments thoroughly
- **Version Control**: Use version control for all DAG definitions
- **Sharing**: Share successful workflows with the community
- **Feedback**: Gather feedback and improve workflows iteratively
