#!/usr/bin/env node
/**
 * Test the Python worker client communication
 */

import { getWorkerClient } from './packages/tools-cas/dist/worker-client.js';

async function testWorkerClient() {
    console.log('🔬 Testing Python Worker Client Communication');
    console.log('='*50);
    
    try {
        const worker = getWorkerClient();
        
        // Test CAS operation
        console.log('\n1. Testing CAS operation:');
        const casResult = await worker.call('cas_evaluate', {
            expr: '2 + 2'
        });
        console.log('✅ CAS operation successful');
        console.log('Result:', casResult);
        
        // Test quantum operation
        console.log('\n2. Testing quantum operation:');
        const quantumResult = await worker.call('quantum_ops', {
            operators: ['X', 'Y'],
            task: 'commutator'
        });
        console.log('✅ Quantum operation successful');
        console.log('Result:', quantumResult);
        
    } catch (error) {
        console.error('❌ Worker client test failed:', error);
        process.exit(1);
    }
}

testWorkerClient().catch(console.error);
