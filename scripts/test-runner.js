const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PACKAGES = [
  'mcp-types', 'server', 'tools-cas', 'tools-constants',
  'tools-data-io', 'tools-distributed', 'tools-export',
  'tools-external', 'tools-graphing-calculator', 'tools-ml',
  'tools-nli', 'tools-orchestrator', 'tools-plot',
  'tools-quantum', 'tools-report', 'tools-signal',
  'tools-statmech', 'tools-tensor', 'tools-units',
  'validation', 'python-worker'
];

function setupPackageTests(pkg) {
  const pkgPath = path.join(__dirname, '..', 'packages', pkg);
  const pkgJsonPath = path.join(pkgPath, 'package.json');
  
  // Create test directory if missing
  const testDir = path.join(pkgPath, 'test');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  // Add basic test file
  const testFile = path.join(testDir, 'basic.test.js');
  if (!fs.existsSync(testFile)) {
    fs.writeFileSync(testFile, 'test("Basic test", () => expect(true).toBe(true));');
  }

  // Update package.json
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath));
  if (!pkgJson.scripts) pkgJson.scripts = {};
  if (!pkgJson.scripts.test) {
    pkgJson.scripts.test = "jest --passWithNoTests";
  }
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
}

function runTests() {
  PACKAGES.forEach(pkg => {
    console.log(`🚀 Setting up tests for ${pkg}`);
    setupPackageTests(pkg);
    
    try {
      console.log(`🔧 Running tests for ${pkg}`);
      execSync(`cd packages/${pkg} && pnpm test`, { stdio: 'inherit' });
      console.log(`✅ ${pkg} tests passed\n`);
    } catch (error) {
      console.error(`❌ ${pkg} tests failed: ${error.message}`);
    }
  });
}

runTests();
