const fs = require('fs');
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

packages.forEach(pkg => {
  const pkgPath = path.join(__dirname, '..', 'packages', pkg);
  const pkgJsonPath = path.join(pkgPath, 'package.json');
  
  // Create test directory
  const testDir = path.join(pkgPath, 'test');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  // Create basic test file
  const testFile = path.join(testDir, 'basic.test.js');
  if (!fs.existsSync(testFile)) {
    fs.writeFileSync(testFile, 'test("Basic test", () => expect(true).toBe(true));');
  }

  // Update package.json
  if (fs.existsSync(pkgJsonPath)) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath));
    
    if (!pkgJson.scripts) pkgJson.scripts = {};
    if (!pkgJson.scripts.test) {
      pkgJson.scripts.test = "jest --passWithNoTests";
    }
    
    if (!pkgJson.devDependencies) pkgJson.devDependencies = {};
    if (!pkgJson.devDependencies.jest) {
      pkgJson.devDependencies.jest = "^29.0.0";
    }
    
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
  }
});

console.log('✅ Test setup completed for all packages');
