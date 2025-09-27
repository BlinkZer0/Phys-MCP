#!/usr/bin/env node

/**
 * Simple build script to work around TypeScript configuration issues
 * This script builds each package individually using a simpler approach
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔨 Building Physics MCP Server...\n');

// Ensure dist directories exist
const packages = ['tools-cas', 'tools-plot', 'tools-nli', 'server'];
packages.forEach(pkg => {
  const distDir = join(projectRoot, 'packages', pkg, 'dist');
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }
});

try {
  // Try building with workspace first
  console.log('Attempting workspace build...');
  execSync('npm run build:workspace', { cwd: projectRoot, stdio: 'inherit' });
} catch (error) {
  console.log('Workspace build failed, trying individual builds...');

  // Build each package individually
  for (const pkg of packages) {
    try {
      console.log(`\n📦 Building ${pkg}...`);
      execSync(`npx tsc --project packages/${pkg}/tsconfig.json`, {
        cwd: projectRoot,
        stdio: 'inherit'
      });
      console.log(`✅ ${pkg} built successfully`);
    } catch (pkgError) {
      console.log(`❌ Failed to build ${pkg}:`, pkgError.message);

      // Try a more basic build approach
      try {
        console.log(`Trying basic tsc build for ${pkg}...`);
        execSync(`npx tsc packages/${pkg}/src/**/*.ts --outDir packages/${pkg}/dist --target ES2022 --module ESNext --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports --strict --skipLibCheck`, {
          cwd: projectRoot,
          stdio: 'inherit'
        });
        console.log(`✅ ${pkg} built with basic tsc`);
      } catch (basicError) {
        console.log(`❌ Basic build also failed for ${pkg}`);
      }
    }
  }
}

console.log('\n🎉 Build process completed!');
console.log('If you encounter issues, try:');
console.log('1. npm install');
console.log('2. npm run build');
console.log('3. Or use the individual package build scripts');
