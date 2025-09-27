#!/usr/bin/env python3
"""
Phase 8: Unified Digital Physics Lab (Experiment Orchestrator) Implementation
Provides DAG definition, validation, execution, report publishing, and collaboration
"""

import os
import sys
import json
import time
import uuid
import hashlib
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Optional, Union, Set, Tuple
from datetime import datetime, timedelta
import base64
import copy
import networkx as nx

# Graphics and acceleration imports
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Rectangle, FancyBboxPatch
import matplotlib.patches as mpatches

# Import utilities and other modules
from utils import (
    get_session_id, save_artifact, encode_image_b64, 
    get_device_info, apply_safety_caps, create_contact_sheet
)

# Import distributed collaboration for offloading
try:
    from distributed_collaboration import get_manager as get_distributed_manager
    _DISTRIBUTED_AVAILABLE = True
except ImportError:
    _DISTRIBUTED_AVAILABLE = False

class ExperimentOrchestratorManager:
    """Manager for experiment orchestration and DAG execution"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.artifacts_dir = Path(config.get('artifacts_dir', 'artifacts'))
        self.artifacts_dir.mkdir(exist_ok=True)
        
        # DAG storage
        self.dags_dir = self.artifacts_dir / 'dags'
        self.dags_dir.mkdir(exist_ok=True)
        self.runs_dir = self.artifacts_dir / 'runs'
        self.runs_dir.mkdir(exist_ok=True)
        
        # Available tools registry
        self.available_tools = {
            'cas', 'plot', 'data', 'quantum', 'ml_ai_augmentation',
            'api_tools', 'export_tool', 'distributed_collaboration',
            'constants_get', 'units_convert', 'statmech_partition',
            'tensor_algebra', 'nli_parse', 'report_generate'
        }
        
        # Cache for DAG executions
        self.execution_cache = {}
    
    def define_dag(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Define a DAG from specification or natural language"""
        
        if 'spec' in params:
            dag_spec = params['spec']
        elif 'natural_language' in params:
            dag_spec = self._nl_to_dag(params['natural_language'])
        else:
            raise ValueError("Either 'spec' or 'natural_language' must be provided")
        
        # Generate DAG ID and validate
        dag_id = uuid.uuid4().hex[:16]
        dag_spec['dag_id'] = dag_id
        dag_spec['created_at'] = datetime.now().isoformat()
        
        validation_result = self._validate_dag_spec(dag_spec)
        
        # Save DAG
        dag_path = self.dags_dir / f"dag_{dag_id}.json"
        with open(dag_path, 'w') as f:
            json.dump(dag_spec, f, indent=2)
        
        # Generate UI overview
        ui_overview_png_b64 = self._generate_dag_overview(dag_spec)
        
        return {
            'dag_id': dag_id,
            'validated': validation_result['ok'],
            'nodes': dag_spec['nodes'],
            'edges': dag_spec['edges'],
            'ui_overview_png_b64': ui_overview_png_b64
        }
    
    def _nl_to_dag(self, natural_language: str) -> Dict[str, Any]:
        """Convert natural language description to DAG specification"""
        # Hydrogen 2p exemplar for demo
        if 'hydrogen' in natural_language.lower() and '2p' in natural_language.lower():
            return {
                'nodes': [
                    {
                        'id': 'constants',
                        'tool': 'constants_get',
                        'params': {'name': 'hbar'},
                        'visual_outputs': {'static': False, 'series': False, 'animation': False}
                    },
                    {
                        'id': 'solve_schrodinger',
                        'tool': 'quantum',
                        'method': 'solve',
                        'params': {'problem': 'particle_in_box', 'params': {'n': 2, 'L': 1.0}},
                        'dependencies': ['constants'],
                        'visual_outputs': {'static': True, 'series': True, 'animation': False}
                    },
                    {
                        'id': 'plot_wavefunction',
                        'tool': 'plot',
                        'method': 'function_2d',
                        'params': {'f': 'sin(2*pi*x)', 'x': [-1, 1, 100], 'title': 'Hydrogen 2p Wavefunction'},
                        'dependencies': ['solve_schrodinger'],
                        'visual_outputs': {'static': True, 'series': False, 'animation': False}
                    }
                ],
                'edges': [
                    {'from': 'constants', 'to': 'solve_schrodinger', 'data_key': 'hbar'},
                    {'from': 'solve_schrodinger', 'to': 'plot_wavefunction', 'data_key': 'wavefunction'}
                ],
                'metadata': {'title': 'Hydrogen 2p Analysis', 'description': 'Generated from NL', 'author': 'Phys-MCP NLI'}
            }
        else:
            return {
                'nodes': [{'id': 'analysis', 'tool': 'cas', 'method': 'evaluate', 'params': {'expr': 'x^2 + 1', 'vars': {'x': 2}}, 'visual_outputs': {'static': False, 'series': False, 'animation': False}}],
                'edges': [],
                'metadata': {'title': 'Generic Analysis', 'description': 'Generated from NL', 'author': 'Phys-MCP NLI'}
            }
    
    def validate_dag(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Validate a DAG for execution"""
        dag_id = params['dag_id']
        dag_path = self.dags_dir / f"dag_{dag_id}.json"
        if not dag_path.exists():
            raise ValueError(f"DAG {dag_id} not found")
        
        with open(dag_path, 'r') as f:
            dag_spec = json.load(f)
        
        validation_result = self._validate_dag_spec(dag_spec)
        return {'dag_id': dag_id, 'ok': validation_result['ok'], 'warnings': validation_result['warnings']}
    
    def _validate_dag_spec(self, dag_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive DAG validation"""
        warnings = []
        
        try:
            G = nx.DiGraph()
            node_ids = set()
            
            for node in dag_spec['nodes']:
                node_id = node['id']
                if node_id in node_ids:
                    warnings.append(f"Duplicate node ID: {node_id}")
                node_ids.add(node_id)
                G.add_node(node_id)
                
                if node['tool'] not in self.available_tools:
                    warnings.append(f"Unknown tool: {node['tool']}")
                if 'visual_outputs' not in node:
                    warnings.append(f"Node {node_id} missing visual_outputs declaration")
            
            for edge in dag_spec['edges']:
                if edge['from'] not in node_ids or edge['to'] not in node_ids:
                    warnings.append(f"Edge references unknown node")
                G.add_edge(edge['from'], edge['to'])
            
            if not nx.is_directed_acyclic_graph(G):
                warnings.append("DAG contains cycles")
                return {'ok': False, 'warnings': warnings}
            
            return {'ok': True, 'warnings': warnings}
            
        except Exception as e:
            warnings.append(f"Validation error: {str(e)}")
            return {'ok': False, 'warnings': warnings}
    
    def run_dag(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a DAG with parallelization and caching"""
        dag_id = params['dag_id']
        dag_path = self.dags_dir / f"dag_{dag_id}.json"
        if not dag_path.exists():
            raise ValueError(f"DAG {dag_id} not found")
        
        with open(dag_path, 'r') as f:
            dag_spec = json.load(f)
        
        run_id = uuid.uuid4().hex[:16]
        start_time = time.time()
        
        # Mock execution for demo
        artifacts = [f"artifact_{run_id}_1.png", f"artifact_{run_id}_2.csv"]
        reportable = {
            'figures': [{'path': artifacts[0], 'caption': 'Generated plot', 'node_id': 'plot_node'}],
            'tables': [{'path': artifacts[1], 'caption': 'Data table', 'node_id': 'data_node'}]
        }
        
        duration_ms = int((time.time() - start_time) * 1000)
        meta = {'device_mix': ['cpu'], 'cache_hits': 0, 'duration_ms': duration_ms}
        
        # Save run record
        run_record = {
            'run_id': run_id, 'dag_id': dag_id, 'artifacts': artifacts,
            'reportable': reportable, 'meta': meta, 'completed_at': datetime.now().isoformat()
        }
        
        run_path = self.runs_dir / f"run_{run_id}.json"
        with open(run_path, 'w') as f:
            json.dump(run_record, f, indent=2)
        
        return {'run_id': run_id, 'artifacts': artifacts, 'reportable': reportable, 'meta': meta}
    
    def _generate_dag_overview(self, dag_spec: Dict[str, Any]) -> str:
        """Generate DAG overview visualization"""
        session_id = get_session_id()
        
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.text(0.5, 0.5, f"DAG Overview: {dag_spec.get('metadata', {}).get('title', 'Untitled')}", 
                ha='center', va='center', fontsize=16, weight='bold')
        ax.text(0.5, 0.3, f"Nodes: {len(dag_spec['nodes'])}, Edges: {len(dag_spec['edges'])}", 
                ha='center', va='center', fontsize=12)
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        png_path = save_artifact(f"dag_overview_{dag_spec['dag_id']}.png", fig, session_id)
        plt.close(fig)
        
        return encode_image_b64(png_path)
    
    def publish_report(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate paper-like PDF report from run results"""
        run_id = params['run_id']
        title = params.get('title', 'Experiment Report')
        
        run_path = self.runs_dir / f"run_{run_id}.json"
        if not run_path.exists():
            raise ValueError(f"Run {run_id} not found")
        
        session_id = get_session_id()
        
        # Generate report PDF (mock)
        fig, ax = plt.subplots(figsize=(8.5, 11))
        ax.text(0.5, 0.8, title, ha='center', va='center', fontsize=20, weight='bold')
        ax.text(0.5, 0.6, f"Run ID: {run_id}", ha='center', va='center', fontsize=12)
        ax.text(0.5, 0.4, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", 
                ha='center', va='center', fontsize=10)
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        pdf_path = save_artifact(f"report_{run_id}.pdf", fig, session_id, format='pdf')
        plt.close(fig)
        
        return {'pdf_path': pdf_path}
    
    def collaborate_share(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Share DAG + artifacts + report bundle with participants"""
        dag_id = params['dag_id']
        
        # Mock implementation
        share_url = f"https://phys-mcp.example.com/dag/{dag_id}/share"
        expires_at = (datetime.now() + timedelta(hours=168)).isoformat()
        
        return {'share_url': share_url, 'expires_at': expires_at}


# Global manager instance
_manager = None

def get_manager(config: Dict[str, Any]) -> ExperimentOrchestratorManager:
    """Get or create the global manager instance"""
    global _manager
    if _manager is None:
        _manager = ExperimentOrchestratorManager(config)
    return _manager

# Main method handlers
def orchestrator_define_dag(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Handle define_dag method"""
    return get_manager(config).define_dag(params)

def orchestrator_validate_dag(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Handle validate_dag method"""
    return get_manager(config).validate_dag(params)

def orchestrator_run_dag(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Handle run_dag method"""
    return get_manager(config).run_dag(params)

def orchestrator_publish_report(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Handle publish_report method"""
    return get_manager(config).publish_report(params)

def orchestrator_collaborate_share(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Handle collaborate_share method"""
    return get_manager(config).collaborate_share(params)
