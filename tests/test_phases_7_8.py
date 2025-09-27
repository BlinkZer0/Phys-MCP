#!/usr/bin/env python3
"""
Test suite for Phases 7 & 8: Distributed Collaboration & Experiment Orchestrator
"""

import pytest
import json
import tempfile
import os
from pathlib import Path
from unittest.mock import Mock, patch

# Import the modules we're testing
import sys
sys.path.append(str(Path(__file__).parent.parent / "packages" / "python-worker"))

import distributed_collaboration
import experiment_orchestrator

class TestDistributedCollaboration:
    """Test Phase 7: Distributed Collaboration functionality"""
    
    def setup_method(self):
        """Set up test environment"""
        self.config = {
            'artifacts_dir': tempfile.mkdtemp(),
            'session_id': 'test_session_123'
        }
    
    def test_manager_initialization(self):
        """Test that the distributed collaboration manager initializes correctly"""
        manager = distributed_collaboration.DistributedCollaborationManager(self.config)
        
        assert manager.config == self.config
        assert manager.artifacts_dir.exists()
        assert manager.sessions_dir.exists()
        assert manager.registry_dir.exists()
    
    def test_session_share(self):
        """Test session sharing functionality"""
        manager = distributed_collaboration.DistributedCollaborationManager(self.config)
        
        params = {
            'session_id': 'test_session_123',
            'access': 'read',
            'expires_in_hours': 72,
            'participants': ['alice@example.com', 'bob@example.com']
        }
        
        result = manager.session_share(params)
        
        assert 'share_url' in result
        assert 'expires_at' in result
        assert 'participants' in result
        assert result['participants'] == params['participants']
        assert 'phys-mcp.example.com' in result['share_url']
    
    def test_lab_notebook(self):
        """Test lab notebook entry creation"""
        manager = distributed_collaboration.DistributedCollaborationManager(self.config)
        
        params = {
            'session_id': 'test_session_123',
            'title': 'Test Notebook Entry',
            'notes_md': '# Test\n\nThis is a test entry.',
            'attach_artifacts': [],
            'sign_as': 'Test User'
        }
        
        result = manager.lab_notebook(params)
        
        assert 'entry_id' in result
        assert 'pdf_path' in result
        assert 'meta' in result
        assert 'hash' in result['meta']
        assert result['meta']['hash'].startswith('sha256:')
    
    def test_artifact_versioning(self):
        """Test artifact versioning functionality"""
        manager = distributed_collaboration.DistributedCollaborationManager(self.config)
        
        params = {
            'artifacts': ['test_artifact_1.png', 'test_artifact_2.csv'],
            'parents': ['sha256:parent123'],
            'params_json': {'temperature': 300, 'method': 'DFT'},
            'code_version': 'v1.0.0'
        }
        
        result = manager.artifact_versioning(params)
        
        assert 'records' in result
        assert 'meta' in result
        assert len(result['records']) == 2
        
        for record in result['records']:
            assert 'artifact' in record
            assert 'hash' in record
            assert 'lineage_id' in record
            assert record['hash'].startswith('sha256:')
    
    @patch('subprocess.run')
    def test_slurm_availability_check(self, mock_run):
        """Test Slurm availability detection"""
        # Mock successful sbatch command
        mock_run.return_value = Mock(returncode=0)
        
        manager = distributed_collaboration.DistributedCollaborationManager(self.config)
        assert manager.slurm_available == True
        
        # Mock failed sbatch command
        mock_run.side_effect = FileNotFoundError()
        manager = distributed_collaboration.DistributedCollaborationManager(self.config)
        assert manager.slurm_available == False


class TestExperimentOrchestrator:
    """Test Phase 8: Experiment Orchestrator functionality"""
    
    def setup_method(self):
        """Set up test environment"""
        self.config = {
            'artifacts_dir': tempfile.mkdtemp(),
            'session_id': 'test_session_456'
        }
    
    def test_manager_initialization(self):
        """Test that the experiment orchestrator manager initializes correctly"""
        manager = experiment_orchestrator.ExperimentOrchestratorManager(self.config)
        
        assert manager.config == self.config
        assert manager.artifacts_dir.exists()
        assert manager.dags_dir.exists()
        assert manager.runs_dir.exists()
        assert len(manager.available_tools) > 0
        assert 'cas' in manager.available_tools
        assert 'plot' in manager.available_tools
    
    def test_define_dag_natural_language(self):
        """Test DAG definition from natural language"""
        manager = experiment_orchestrator.ExperimentOrchestratorManager(self.config)
        
        params = {
            'natural_language': 'Analyze hydrogen 2p orbital with quantum mechanics and visualization'
        }
        
        result = manager.define_dag(params)
        
        assert 'dag_id' in result
        assert 'validated' in result
        assert 'nodes' in result
        assert 'edges' in result
        assert 'ui_overview_png_b64' in result
        assert len(result['nodes']) > 0
        assert result['validated'] == True
    
    def test_define_dag_explicit_spec(self):
        """Test DAG definition from explicit specification"""
        manager = experiment_orchestrator.ExperimentOrchestratorManager(self.config)
        
        dag_spec = {
            'nodes': [
                {
                    'id': 'test_node',
                    'tool': 'cas',
                    'method': 'evaluate',
                    'params': {'expr': 'x^2', 'vars': {'x': 2}},
                    'visual_outputs': {'static': False, 'series': False, 'animation': False}
                }
            ],
            'edges': [],
            'metadata': {
                'title': 'Test DAG',
                'description': 'Simple test DAG'
            }
        }
        
        params = {'spec': dag_spec}
        result = manager.define_dag(params)
        
        assert 'dag_id' in result
        assert result['validated'] == True
        assert len(result['nodes']) == 1
        assert result['nodes'][0]['id'] == 'test_node'
    
    def test_validate_dag(self):
        """Test DAG validation"""
        manager = experiment_orchestrator.ExperimentOrchestratorManager(self.config)
        
        # First create a DAG
        dag_spec = {
            'nodes': [
                {
                    'id': 'node1',
                    'tool': 'cas',
                    'params': {'expr': 'x+1'},
                    'visual_outputs': {'static': False, 'series': False, 'animation': False}
                },
                {
                    'id': 'node2',
                    'tool': 'plot',
                    'params': {'f': 'x^2'},
                    'dependencies': ['node1'],
                    'visual_outputs': {'static': True, 'series': False, 'animation': False}
                }
            ],
            'edges': [
                {'from': 'node1', 'to': 'node2'}
            ]
        }
        
        define_result = manager.define_dag({'spec': dag_spec})
        dag_id = define_result['dag_id']
        
        # Now validate it
        validate_result = manager.validate_dag({'dag_id': dag_id})
        
        assert 'dag_id' in validate_result
        assert 'ok' in validate_result
        assert 'warnings' in validate_result
        assert validate_result['dag_id'] == dag_id
        assert validate_result['ok'] == True
    
    def test_run_dag(self):
        """Test DAG execution"""
        manager = experiment_orchestrator.ExperimentOrchestratorManager(self.config)
        
        # Create a simple DAG
        dag_spec = {
            'nodes': [
                {
                    'id': 'simple_calc',
                    'tool': 'cas',
                    'method': 'evaluate',
                    'params': {'expr': '2+2'},
                    'visual_outputs': {'static': False, 'series': True, 'animation': False}
                }
            ],
            'edges': []
        }
        
        define_result = manager.define_dag({'spec': dag_spec})
        dag_id = define_result['dag_id']
        
        # Run the DAG
        run_params = {
            'dag_id': dag_id,
            'parallelism': 2,
            'offload_policy': 'local_first'
        }
        
        run_result = manager.run_dag(run_params)
        
        assert 'run_id' in run_result
        assert 'artifacts' in run_result
        assert 'reportable' in run_result
        assert 'meta' in run_result
        assert 'device_mix' in run_result['meta']
        assert 'cache_hits' in run_result['meta']
        assert 'duration_ms' in run_result['meta']
    
    def test_publish_report(self):
        """Test report publishing"""
        manager = experiment_orchestrator.ExperimentOrchestratorManager(self.config)
        
        # Create and run a DAG first
        dag_spec = {
            'nodes': [
                {
                    'id': 'test_analysis',
                    'tool': 'cas',
                    'params': {'expr': 'sin(x)'},
                    'visual_outputs': {'static': False, 'series': False, 'animation': False}
                }
            ],
            'edges': []
        }
        
        define_result = manager.define_dag({'spec': dag_spec})
        run_result = manager.run_dag({'dag_id': define_result['dag_id']})
        
        # Publish report
        report_params = {
            'run_id': run_result['run_id'],
            'title': 'Test Report',
            'authors': ['Test Author']
        }
        
        report_result = manager.publish_report(report_params)
        
        assert 'pdf_path' in report_result
        assert report_result['pdf_path'].endswith('.pdf')
    
    def test_collaborate_share(self):
        """Test collaboration sharing"""
        manager = experiment_orchestrator.ExperimentOrchestratorManager(self.config)
        
        # Create a DAG first
        dag_spec = {
            'nodes': [
                {
                    'id': 'shared_analysis',
                    'tool': 'plot',
                    'params': {'f': 'x^2'},
                    'visual_outputs': {'static': True, 'series': False, 'animation': False}
                }
            ],
            'edges': []
        }
        
        define_result = manager.define_dag({'spec': dag_spec})
        dag_id = define_result['dag_id']
        
        # Share the DAG
        share_params = {
            'dag_id': dag_id,
            'access': 'read',
            'participants': ['collaborator@example.com']
        }
        
        share_result = manager.collaborate_share(share_params)
        
        assert 'share_url' in share_result
        assert 'expires_at' in share_result
        assert dag_id in share_result['share_url']


class TestIntegration:
    """Integration tests for both phases"""
    
    def test_distributed_orchestrator_integration(self):
        """Test integration between distributed collaboration and orchestrator"""
        config = {
            'artifacts_dir': tempfile.mkdtemp(),
            'session_id': 'integration_test'
        }
        
        # Create orchestrator and distributed managers
        orchestrator = experiment_orchestrator.ExperimentOrchestratorManager(config)
        distributed = distributed_collaboration.DistributedCollaborationManager(config)
        
        # Define a DAG that could use distributed computing
        dag_spec = {
            'nodes': [
                {
                    'id': 'ml_analysis',
                    'tool': 'ml_ai_augmentation',
                    'method': 'symbolic_regression_train',
                    'params': {'X': 'data.csv', 'y': 'target.csv'},
                    'visual_outputs': {'static': True, 'series': True, 'animation': False}
                }
            ],
            'edges': []
        }
        
        dag_result = orchestrator.define_dag({'spec': dag_spec})
        assert dag_result['validated'] == True
        
        # Test artifact versioning integration
        artifacts = ['test_ml_result.png', 'test_data.csv']
        version_result = distributed.artifact_versioning({
            'artifacts': artifacts,
            'params_json': {'dag_id': dag_result['dag_id']},
            'code_version': 'test_v1.0'
        })
        
        assert len(version_result['records']) == len(artifacts)
        assert all(record['hash'].startswith('sha256:') for record in version_result['records'])


def test_method_handlers():
    """Test the main method handler functions"""
    config = {'artifacts_dir': tempfile.mkdtemp()}
    
    # Test distributed collaboration handlers
    params = {
        'session_id': 'test_123',
        'access': 'read',
        'participants': ['test@example.com']
    }
    
    result = distributed_collaboration.distributed_session_share(params, config)
    assert 'share_url' in result
    
    # Test orchestrator handlers
    params = {
        'natural_language': 'Create a simple analysis workflow'
    }
    
    result = experiment_orchestrator.orchestrator_define_dag(params, config)
    assert 'dag_id' in result
    assert 'validated' in result


if __name__ == '__main__':
    # Run basic smoke tests
    print("Running Phases 7 & 8 smoke tests...")
    
    # Test distributed collaboration
    config = {'artifacts_dir': tempfile.mkdtemp()}
    manager = distributed_collaboration.DistributedCollaborationManager(config)
    print("✓ Distributed collaboration manager initialized")
    
    # Test experiment orchestrator
    manager = experiment_orchestrator.ExperimentOrchestratorManager(config)
    print("✓ Experiment orchestrator manager initialized")
    
    # Test method handlers
    result = distributed_collaboration.distributed_session_share({
        'session_id': 'test',
        'access': 'read'
    }, config)
    print("✓ Session share method works")
    
    result = experiment_orchestrator.orchestrator_define_dag({
        'natural_language': 'Simple test workflow'
    }, config)
    print("✓ DAG definition method works")
    
    print("\n🎉 All smoke tests passed! Phases 7 & 8 implementation is ready.")
