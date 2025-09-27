#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('🧪 Testing wrapper-based server startup...');
  const wrapperPath = join(__dirname, 'start-server.cjs');

  const child = spawn(process.execPath, [wrapperPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'production' },
  });

  let ready = false;
  const timeout = setTimeout(() => {
    console.log('❌ Timeout: server did not become ready in 10s');
    child.kill();
    process.exit(1);
  }, 10000);

  child.stderr.on('data', (buf) => {
    const s = buf.toString();
    if (s.includes('Server ready for connections')) {
      console.log('✅ Wrapper launched server successfully');
      ready = true;
      const req = { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} };
      child.stdin.write(JSON.stringify(req) + '\n');
    }
  });

  child.stdout.on('data', (buf) => {
    const s = buf.toString();
    try {
      const msg = JSON.parse(s);
      if (msg.result && msg.result.tools) {
        console.log(`🎯 Tools listed: ${msg.result.tools.length}`);
        clearTimeout(timeout);
        child.kill();
        process.exit(0);
      }
    } catch {
      // ignore partial lines
    }
  });

  child.on('exit', (code) => {
    console.log(`🛑 Child exited early with code ${code}`);
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
