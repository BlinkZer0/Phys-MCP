#!/usr/bin/env node

/**
 * Test Plot tools loading
 */

async function testPlotTools() {
  try {
    console.log('Testing Plot tools import...');
    const plotModule = await import('./packages/tools-plot/dist/index.js');
    console.log('Plot module imported successfully');
    console.log('Available exports:', Object.keys(plotModule));
    
    if (plotModule.buildPlotTools) {
      console.log('Testing buildPlotTools...');
      const tools = plotModule.buildPlotTools();
      console.log('Plot tools built successfully:', tools.length);
      console.log('Tool names:', tools.map(t => t.name));
    } else {
      console.log('buildPlotTools not available');
    }
  } catch (error) {
    console.error('Error testing plot tools:', error);
    console.error('Stack trace:', error.stack);
  }
}

testPlotTools();
