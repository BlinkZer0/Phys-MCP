const { execSync } = require('child_process');
const path = require('path');

const packages = [
  'mcp-types', 'server', 'tools-cas', 'tools-constants',
  'tools-data-io', 'tools-distributed', 'tools-export',
  'tools-external', 'tools-graphing-calculator', 'tools-ml',
  'tools-nli', 'tools-orchestrator', 'tools-plot',
  'tools-quantum', 'tools-report', 'tools-signal',
  'tools-statmech', 'tools-tensor', 'tools-units',
  'validation', 'python-worker'
];

console.log('🚀 Starting test suite execution...');

packages.forEach(pkg => {
  const pkgPath = path.join(__dirname, '..', 'packages', pkg);
  
  try {
    console.log(`🔧 Testing ${pkg}`);
    execSync(`cd ${pkgPath} && pnpm test`, { stdio: 'inherit' });
    console.log(`✅ ${pkg} tests passed\n`);
  } catch (error) {
    console.error(`❌ ${pkg} tests failed: ${error.message}`);
  }
});

console.log('🏁 All package tests completed');
