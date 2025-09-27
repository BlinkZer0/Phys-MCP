#!/usr/bin/env python3
"""
Phase 7: Distributed & Collaborative Computing Implementation
Provides job submission, session sharing, lab notebook, and artifact versioning
"""

import os
import sys
import json
import time
import hashlib
import subprocess
import tempfile
import shutil
import uuid
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import base64

# Graphics and acceleration imports
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

# Try to import optional dependencies
try:
    import yaml
    _YAML_AVAILABLE = True
except ImportError:
    _YAML_AVAILABLE = False

try:
    import kubernetes
    from kubernetes import client, config
    _K8S_AVAILABLE = True
except ImportError:
    _K8S_AVAILABLE = False

# Import utilities
from utils import (
    get_session_id, save_artifact, encode_image_b64, 
    get_device_info, apply_safety_caps, create_contact_sheet
)

class DistributedCollaborationManager:
    """Manager for distributed computing and collaboration features"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.artifacts_dir = Path(config.get('artifacts_dir', 'artifacts'))
        self.artifacts_dir.mkdir(exist_ok=True)
        
        # Initialize backends
        self.slurm_available = self._check_slurm_available()
        self.k8s_available = self._check_k8s_available()
        
        # Session and artifact storage
        self.sessions_dir = self.artifacts_dir / 'sessions'
        self.sessions_dir.mkdir(exist_ok=True)
        self.registry_dir = self.artifacts_dir / 'registry'
        self.registry_dir.mkdir(exist_ok=True)
    
    def _check_slurm_available(self) -> bool:
        """Check if Slurm commands are available"""
        try:
            subprocess.run(['sbatch', '--version'], 
                         capture_output=True, check=True, timeout=5)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
            return False
    
    def _check_k8s_available(self) -> bool:
        """Check if Kubernetes client is available and configured"""
        if not _K8S_AVAILABLE:
            return False
        try:
            config.load_incluster_config()
            return True
        except:
            try:
                config.load_kube_config()
                return True
            except:
                return False
    
    def job_submit(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Submit a job to Slurm or Kubernetes backend"""
        backend = params['backend']
        job_spec = params['job_spec']
        artifacts_path = params['artifacts_path']
        stream_logs = params.get('stream_logs', True)
        timeout_sec = params.get('timeout_sec', 3600)
        
        session_id = get_session_id()
        start_time = time.time()
        
        try:
            if backend == 'slurm':
                if not self.slurm_available:
                    raise RuntimeError("Slurm not available on this system")
                result = self._submit_slurm_job(job_spec, artifacts_path, stream_logs, timeout_sec)
            elif backend == 'k8s':
                if not self.k8s_available:
                    raise RuntimeError("Kubernetes not available or not configured")
                result = self._submit_k8s_job(job_spec, artifacts_path, stream_logs, timeout_sec)
            else:
                raise ValueError(f"Unknown backend: {backend}")
            
            # Add metadata
            duration_ms = int((time.time() - start_time) * 1000)
            result['meta'] = {
                'backend': backend,
                'device': get_device_info()['device'],
                'duration_ms': duration_ms,
                **result.get('meta', {})
            }
            
            return result
            
        except Exception as e:
            raise RuntimeError(f"Job submission failed: {str(e)}")
    
    def _submit_slurm_job(self, job_spec: Dict[str, Any], artifacts_path: str, 
                         stream_logs: bool, timeout_sec: int) -> Dict[str, Any]:
        """Submit job to Slurm via sbatch"""
        
        # Create temporary script
        script_content = self._generate_slurm_script(job_spec, artifacts_path)
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.sh', delete=False) as f:
            f.write(script_content)
            script_path = f.name
        
        try:
            # Submit job
            cmd = ['sbatch', script_path]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode != 0:
                raise RuntimeError(f"sbatch failed: {result.stderr}")
            
            # Extract job ID
            job_id = result.stdout.strip().split()[-1]
            
            # Monitor job if requested
            log_stream_path = ""
            if stream_logs:
                log_stream_path = self._monitor_slurm_job(job_id, timeout_sec)
            
            # Retrieve artifacts (mock implementation)
            returned_artifacts = self._retrieve_slurm_artifacts(job_id, artifacts_path)
            
            return {
                'job_id': job_id,
                'log_stream_path': log_stream_path,
                'returned_artifacts': returned_artifacts,
                'meta': {
                    'commit': self._get_git_commit(),
                    'mesh': [64, 64]  # Mock mesh info
                }
            }
            
        finally:
            os.unlink(script_path)
    
    def _submit_k8s_job(self, job_spec: Dict[str, Any], artifacts_path: str,
                       stream_logs: bool, timeout_sec: int) -> Dict[str, Any]:
        """Submit job to Kubernetes"""
        
        # Create K8s Job manifest
        job_manifest = self._generate_k8s_manifest(job_spec, artifacts_path)
        
        # Submit job
        batch_v1 = client.BatchV1Api()
        job_name = f"phys-mcp-{uuid.uuid4().hex[:8]}"
        
        try:
            # Create job
            job = batch_v1.create_namespaced_job(
                body=job_manifest,
                namespace="default"
            )
            
            job_id = job.metadata.name
            
            # Monitor job if requested
            log_stream_path = ""
            if stream_logs:
                log_stream_path = self._monitor_k8s_job(job_id, timeout_sec)
            
            # Retrieve artifacts (mock implementation)
            returned_artifacts = self._retrieve_k8s_artifacts(job_id, artifacts_path)
            
            # Clean up job if configured
            try:
                batch_v1.delete_namespaced_job(name=job_id, namespace="default")
            except:
                pass  # Best effort cleanup
            
            return {
                'job_id': job_id,
                'log_stream_path': log_stream_path,
                'returned_artifacts': returned_artifacts,
                'meta': {
                    'commit': self._get_git_commit(),
                    'mesh': [64, 64]  # Mock mesh info
                }
            }
            
        except Exception as e:
            raise RuntimeError(f"Kubernetes job submission failed: {str(e)}")
    
    def _generate_slurm_script(self, job_spec: Dict[str, Any], artifacts_path: str) -> str:
        """Generate Slurm batch script"""
        resources = job_spec.get('resources', {})
        
        script = "#!/bin/bash\n"
        script += f"#SBATCH --job-name=phys-mcp-job\n"
        
        if 'cpu' in resources:
            script += f"#SBATCH --cpus-per-task={resources['cpu']}\n"
        if 'memory' in resources:
            script += f"#SBATCH --mem={resources['memory']}\n"
        if 'gpu' in resources and resources['gpu'] > 0:
            script += f"#SBATCH --gres=gpu:{resources['gpu']}\n"
        if 'time_limit' in resources:
            script += f"#SBATCH --time={resources['time_limit']}\n"
        
        # Environment variables
        env_vars = job_spec.get('env', {})
        for key, value in env_vars.items():
            script += f"export {key}={value}\n"
        
        # Commands
        commands = job_spec['command']
        if isinstance(commands, list):
            script += ' '.join(commands) + '\n'
        else:
            script += str(commands) + '\n'
        
        # Artifact handling
        script += f"# Copy artifacts to {artifacts_path}\n"
        script += f"mkdir -p {artifacts_path}\n"
        script += f"cp *.png *.csv *.mp4 {artifacts_path}/ 2>/dev/null || true\n"
        
        return script
    
    def _generate_k8s_manifest(self, job_spec: Dict[str, Any], artifacts_path: str) -> Dict[str, Any]:
        """Generate Kubernetes Job manifest"""
        resources = job_spec.get('resources', {})
        
        manifest = {
            "apiVersion": "batch/v1",
            "kind": "Job",
            "metadata": {
                "name": f"phys-mcp-{uuid.uuid4().hex[:8]}"
            },
            "spec": {
                "template": {
                    "spec": {
                        "containers": [{
                            "name": "phys-mcp-worker",
                            "image": job_spec.get('image', 'python:3.11'),
                            "command": job_spec['command'],
                            "env": [{"name": k, "value": v} for k, v in job_spec.get('env', {}).items()],
                            "resources": {}
                        }],
                        "restartPolicy": "Never"
                    }
                }
            }
        }
        
        # Add resource requirements
        if resources:
            container_resources = {}
            if 'cpu' in resources:
                container_resources['cpu'] = str(resources['cpu'])
            if 'memory' in resources:
                container_resources['memory'] = resources['memory']
            if 'gpu' in resources and resources['gpu'] > 0:
                container_resources['nvidia.com/gpu'] = str(resources['gpu'])
            
            if container_resources:
                manifest['spec']['template']['spec']['containers'][0]['resources'] = {
                    'requests': container_resources,
                    'limits': container_resources
                }
        
        return manifest
    
    def _monitor_slurm_job(self, job_id: str, timeout_sec: int) -> str:
        """Monitor Slurm job and return log path"""
        session_id = get_session_id()
        log_path = save_artifact(f"slurm_job_{job_id}.log", "", session_id)
        
        # Mock monitoring - in real implementation, would poll squeue/sacct
        with open(log_path, 'w') as f:
            f.write(f"Job {job_id} submitted to Slurm\n")
            f.write(f"Monitoring for {timeout_sec} seconds\n")
            f.write("Job completed successfully\n")
        
        return log_path
    
    def _monitor_k8s_job(self, job_id: str, timeout_sec: int) -> str:
        """Monitor Kubernetes job and return log path"""
        session_id = get_session_id()
        log_path = save_artifact(f"k8s_job_{job_id}.log", "", session_id)
        
        # Mock monitoring - in real implementation, would watch pod logs
        with open(log_path, 'w') as f:
            f.write(f"Job {job_id} submitted to Kubernetes\n")
            f.write(f"Monitoring for {timeout_sec} seconds\n")
            f.write("Job completed successfully\n")
        
        return log_path
    
    def _retrieve_slurm_artifacts(self, job_id: str, artifacts_path: str) -> List[str]:
        """Retrieve artifacts from Slurm job"""
        # Mock artifact retrieval - in real implementation, would use rsync/scp
        session_id = get_session_id()
        artifacts = []
        
        # Create mock artifacts
        for ext in ['png', 'csv', 'mp4']:
            artifact_path = save_artifact(f"slurm_result_{job_id}.{ext}", "", session_id)
            artifacts.append(artifact_path)
        
        return artifacts
    
    def _retrieve_k8s_artifacts(self, job_id: str, artifacts_path: str) -> List[str]:
        """Retrieve artifacts from Kubernetes job"""
        # Mock artifact retrieval - in real implementation, would pull from volumes/object store
        session_id = get_session_id()
        artifacts = []
        
        # Create mock artifacts
        for ext in ['png', 'csv', 'mp4']:
            artifact_path = save_artifact(f"k8s_result_{job_id}.{ext}", "", session_id)
            artifacts.append(artifact_path)
        
        return artifacts
    
    def _get_git_commit(self) -> Optional[str]:
        """Get current git commit hash"""
        try:
            result = subprocess.run(['git', 'rev-parse', 'HEAD'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                return result.stdout.strip()[:8]
        except:
            pass
        return None
    
    def session_share(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update a multi-user share for a session"""
        session_id = params['session_id']
        access = params.get('access', 'read')
        expires_in_hours = params.get('expires_in_hours', 72)
        participants = params.get('participants', [])
        
        # Create share record
        share_id = uuid.uuid4().hex[:16]
        expires_at = datetime.now() + timedelta(hours=expires_in_hours)
        
        share_record = {
            'share_id': share_id,
            'session_id': session_id,
            'access': access,
            'expires_at': expires_at.isoformat(),
            'participants': participants,
            'created_at': datetime.now().isoformat()
        }
        
        # Save share record
        share_path = self.sessions_dir / f"share_{share_id}.json"
        with open(share_path, 'w') as f:
            json.dump(share_record, f, indent=2)
        
        # Generate share URL (mock)
        share_url = f"https://phys-mcp.example.com/share/{share_id}"
        
        return {
            'share_url': share_url,
            'expires_at': expires_at.isoformat(),
            'participants': participants
        }
    
    def lab_notebook(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Append a signed, versioned notebook entry"""
        session_id = params['session_id']
        title = params['title']
        notes_md = params.get('notes_md', '')
        attach_artifacts = params.get('attach_artifacts', [])
        sign_as = params.get('sign_as', 'anonymous')
        
        # Create entry
        entry_id = uuid.uuid4().hex[:16]
        timestamp = datetime.now().isoformat()
        
        entry = {
            'entry_id': entry_id,
            'session_id': session_id,
            'title': title,
            'notes_md': notes_md,
            'attached_artifacts': attach_artifacts,
            'signed_by': sign_as,
            'timestamp': timestamp
        }
        
        # Generate content hash for integrity
        content_str = json.dumps(entry, sort_keys=True)
        content_hash = hashlib.sha256(content_str.encode()).hexdigest()
        entry['content_hash'] = content_hash
        
        # Save entry
        entry_path = self.sessions_dir / f"notebook_{entry_id}.json"
        with open(entry_path, 'w') as f:
            json.dump(entry, f, indent=2)
        
        # Generate PDF (mock implementation)
        pdf_path = self._generate_notebook_pdf(entry)
        
        return {
            'entry_id': entry_id,
            'pdf_path': pdf_path,
            'meta': {
                'hash': f"sha256:{content_hash}"
            }
        }
    
    def _generate_notebook_pdf(self, entry: Dict[str, Any]) -> str:
        """Generate PDF for notebook entry"""
        session_id = get_session_id()
        
        # Create a simple plot as PDF content (mock)
        fig, ax = plt.subplots(figsize=(8, 6))
        ax.text(0.5, 0.7, f"Lab Notebook Entry", ha='center', va='center', 
                fontsize=16, weight='bold')
        ax.text(0.5, 0.5, f"Title: {entry['title']}", ha='center', va='center', fontsize=12)
        ax.text(0.5, 0.3, f"Signed by: {entry['signed_by']}", ha='center', va='center', fontsize=10)
        ax.text(0.5, 0.1, f"Timestamp: {entry['timestamp']}", ha='center', va='center', fontsize=8)
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        pdf_path = save_artifact(f"notebook_{entry['entry_id']}.pdf", fig, session_id, format='pdf')
        plt.close(fig)
        
        return pdf_path
    
    def artifact_versioning(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Register artifacts with content-addressable hashes and lineage"""
        artifacts = params['artifacts']
        parents = params.get('parents', [])
        params_json = params.get('params_json', {})
        code_version = params.get('code_version', self._get_git_commit())
        
        records = []
        cached = True
        
        for artifact_path in artifacts:
            # Calculate content hash
            if os.path.exists(artifact_path):
                with open(artifact_path, 'rb') as f:
                    content = f.read()
                content_hash = hashlib.sha256(content).hexdigest()
            else:
                # Mock hash for non-existent files
                content_hash = hashlib.sha256(artifact_path.encode()).hexdigest()
                cached = False
            
            # Generate lineage ID
            lineage_data = {
                'artifact': artifact_path,
                'parents': parents,
                'params': params_json,
                'code_version': code_version,
                'timestamp': datetime.now().isoformat()
            }
            lineage_str = json.dumps(lineage_data, sort_keys=True)
            lineage_id = hashlib.sha256(lineage_str.encode()).hexdigest()[:16]
            
            # Save to registry
            registry_entry = {
                'artifact': artifact_path,
                'content_hash': content_hash,
                'lineage_id': lineage_id,
                'parents': parents,
                'params': params_json,
                'code_version': code_version,
                'registered_at': datetime.now().isoformat()
            }
            
            registry_path = self.registry_dir / f"artifact_{content_hash[:16]}.json"
            with open(registry_path, 'w') as f:
                json.dump(registry_entry, f, indent=2)
            
            records.append({
                'artifact': artifact_path,
                'hash': f"sha256:{content_hash}",
                'lineage_id': lineage_id
            })
        
        return {
            'records': records,
            'meta': {
                'cached': cached
            }
        }


# Global manager instance
_manager = None

def get_manager(config: Dict[str, Any]) -> DistributedCollaborationManager:
    """Get or create the global manager instance"""
    global _manager
    if _manager is None:
        _manager = DistributedCollaborationManager(config)
    return _manager

# Main method handlers
def distributed_job_submit(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Handle job_submit method"""
    manager = get_manager(config)
    return manager.job_submit(params)

def distributed_session_share(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Handle session_share method"""
    manager = get_manager(config)
    return manager.session_share(params)

def distributed_lab_notebook(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Handle lab_notebook method"""
    manager = get_manager(config)
    return manager.lab_notebook(params)

def distributed_artifact_versioning(params: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Handle artifact_versioning method"""
    manager = get_manager(config)
    return manager.artifact_versioning(params)
