#!/usr/bin/env node
/**
 * Comprehensive Test Runner for Phys-MCP
 * Runs all test suites across TypeScript and Python packages
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test packages with their configurations
const TEST_PACKAGES = [
  {
    name: 'tools-cas',
    type: 'jest',
    path: 'packages/tools-cas',
    priority: 'high'
  },
  {
    name: 'tools-plot', 
    type: 'jest',
    path: 'packages/tools-plot',
    priority: 'high'
  },
  {
    name: 'tools-data-io',
    type: 'jest', 
    path: 'packages/tools-data-io',
    priority: 'high'
  },
  {
    name: 'tools-quantum',
    type: 'jest',
    path: 'packages/tools-quantum', 
    priority: 'high'
  },
  {
    name: 'tools-ml',
    type: 'jest',
    path: 'packages/tools-ml',
    priority: 'medium'
  },
  {
    name: 'tools-distributed',
    type: 'jest',
    path: 'packages/tools-distributed',
    priority: 'medium'
  },
  {
    name: 'python-worker',
    type: 'pytest',
    path: 'packages/python-worker',
    priority: 'high'
  }
];

class TestRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Phys-MCP Test Suite\n');
    
    // Install dependencies first
    await this.installDependencies();
    
    // Run tests by priority
    const highPriorityTests = TEST_PACKAGES.filter(pkg => pkg.priority === 'high');
    const mediumPriorityTests = TEST_PACKAGES.filter(pkg => pkg.priority === 'medium');
    
    console.log('📋 Running High Priority Tests...\n');
    await this.runTestGroup(highPriorityTests);
    
    console.log('\n📋 Running Medium Priority Tests...\n');
    await this.runTestGroup(mediumPriorityTests);
    
    // Generate summary
    this.generateSummary();
  }

  async installDependencies() {
    console.log('📦 Installing test dependencies...');
    try {
      execSync('pnpm install', { stdio: 'inherit' });
      console.log('✅ Dependencies installed\n');
    } catch (error) {
      console.error('❌ Failed to install dependencies:', error.message);
    }
  }

  async runTestGroup(packages) {
    for (const pkg of packages) {
      await this.runPackageTests(pkg);
    }
  }

  async runPackageTests(pkg) {
    const startTime = Date.now();
    console.log(`🔧 Testing ${pkg.name}...`);
    
    try {
      // Ensure test directory exists
      const testDir = path.join(pkg.path, 'test');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      // Run appropriate test command
      let command;
      if (pkg.type === 'jest') {
        // Ensure package has Jest config
        await this.ensureJestConfig(pkg.path);
        command = `cd ${pkg.path} && npx jest --passWithNoTests --verbose`;
      } else if (pkg.type === 'pytest') {
        command = `cd ${pkg.path} && python -m pytest tests/ -v --tb=short`;
      }

      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const duration = Date.now() - startTime;
      this.results.push({
        package: pkg.name,
        status: 'PASSED',
        duration,
        output: output.slice(-500) // Last 500 chars
      });

      console.log(`✅ ${pkg.name} tests passed (${duration}ms)\n`);

    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        package: pkg.name,
        status: 'FAILED',
        duration,
        error: error.message.slice(-500)
      });

      console.log(`❌ ${pkg.name} tests failed (${duration}ms)`);
      console.log(`   Error: ${error.message.split('\n')[0]}\n`);
    }
  }

  async ensureJestConfig(packagePath) {
    const jestConfigPath = path.join(packagePath, 'jest.config.js');
    const packageJsonPath = path.join(packagePath, 'package.json');
    
    // Create Jest config if missing
    if (!fs.existsSync(jestConfigPath)) {
      const jestConfig = `module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js']
};`;
      fs.writeFileSync(jestConfigPath, jestConfig);
    }

    // Create test setup if missing
    const setupPath = path.join(packagePath, 'test', 'setup.js');
    if (!fs.existsSync(setupPath)) {
      const setupContent = `// Jest setup
global.jest = require('@jest/globals').jest;
global.describe = require('@jest/globals').describe;
global.test = require('@jest/globals').test;
global.expect = require('@jest/globals').expect;
global.beforeEach = require('@jest/globals').beforeEach;
global.afterEach = require('@jest/globals').afterEach;`;
      
      fs.mkdirSync(path.dirname(setupPath), { recursive: true });
      fs.writeFileSync(setupPath, setupContent);
    }

    // Ensure package.json has Jest dependency
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
      if (!packageJson.scripts) packageJson.scripts = {};
      if (!packageJson.scripts.test) {
        packageJson.scripts.test = 'jest';
      }
      if (!packageJson.devDependencies) packageJson.devDependencies = {};
      if (!packageJson.devDependencies.jest) {
        packageJson.devDependencies.jest = '^29.0.0';
        packageJson.devDependencies['@jest/globals'] = '^29.0.0';
      }
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  }

  generateSummary() {
    const totalTime = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Packages: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log('');

    // Detailed results
    this.results.forEach(result => {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} ${result.package.padEnd(20)} ${result.duration}ms`);
      if (result.status === 'FAILED') {
        console.log(`   ${result.error.split('\n')[0]}`);
      }
    });

    console.log('\n' + '='.repeat(60));
    
    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run tests if called directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;
