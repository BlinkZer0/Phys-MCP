import { execSync } from 'child_process';
import fs from 'fs';

const packages = [
  'mcp-types',
  'server',
  'tools-cas',
  'tools-constants',
  'tools-data-io',
  'tools-distributed',
  'tools-export',
  'tools-external',
  'tools-graphing-calculator',
  'tools-ml',
  'tools-nli',
  'tools-orchestrator',
  'tools-plot',
  'tools-quantum',
  'tools-report',
  'tools-signal',
  'tools-statmech',
  'tools-tensor',
  'tools-units',
  'validation',
  'python-worker'
];

async function runTests() {
  const results = [];
  
  for (const pkg of packages) {
    const packagePath = `packages/${pkg}`;
    const packageJson = JSON.parse(fs.readFileSync(`${packagePath}/package.json`));
    const hasTestScript = packageJson.scripts && packageJson.scripts.test;
    
    console.log(`📦 Testing ${pkg}...`);
    
    try {
      if (hasTestScript) {
        execSync(`cd ${packagePath} && pnpm test`, { stdio: 'inherit' });
        results.push({ package: pkg, status: '✅ Passed' });
      } else {
        console.log(`   ⚠️ No test script found. Creating basic test...`);
        if (!fs.existsSync(`${packagePath}/test`)) {
          fs.mkdirSync(`${packagePath}/test`);
        }
        fs.writeFileSync(`${packagePath}/test/index.test.js`, 'test("Stub test", () => expect(true).toBe(true));');
        execSync(`cd ${packagePath} && pnpm test`, { stdio: 'inherit' });
        results.push({ package: pkg, status: '⚠️ Basic test added' });
      }
    } catch (error) {
      results.push({ package: pkg, status: `❌ Failed: ${error.message}` });
    }
  }
  
  console.log('\n📊 Test Results:');
  results.forEach(result => {
    console.log(`${result.package}: ${result.status}`);
  });
}

runTests();
