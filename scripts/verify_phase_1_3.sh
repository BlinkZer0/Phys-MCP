#!/bin/bash

# Preflight verification script for Physics MCP Server Phases 1-3
# Checks all required tools are present and functional

echo "🔍 Physics MCP Server - Phase 1-3 Preflight Verification"
echo "========================================================="

# Required tools from Phases 1-3
REQUIRED_TOOLS=(
    "cas_evaluate"
    "cas_diff" 
    "cas_integrate"
    "cas_solve_equation"
    "cas_solve_ode"
    "cas_propagate_uncertainty"
    "plot_function_2d"
    "plot_parametric_2d"
    "plot_field_2d"
    "plot_phase_portrait"
    "plot_surface_3d"
    "plot_contour_2d"
    "nli_parse"
    "units_convert"
    "constants_get"
    "tensor_algebra"
    "quantum_ops"
    "quantum_solve"
    "quantum_visualize"
    "statmech_partition"
    "report_generate"
)

# Expected tool count
EXPECTED_COUNT=21

echo "📋 Checking for ${#REQUIRED_TOOLS[@]} required tools..."

# Start server and get tool list
echo "🚀 Starting MCP server..."
cd "$(dirname "$0")/.."

# Build if needed
if [ ! -f "packages/server/dist/index.js" ]; then
    echo "🔨 Building server..."
    npm run build
fi

# Get tools list via JSON-RPC
SERVER_PATH="packages/server/dist/index.js"
TOOLS_REQUEST='{"jsonrpc":"2.0","id":"tools","method":"tools/list","params":{}}'

# Run server and capture tools list
TOOLS_OUTPUT=$(echo "$TOOLS_REQUEST" | timeout 10s node "$SERVER_PATH" 2>/dev/null | grep -o '"tools":\[.*\]')

if [ -z "$TOOLS_OUTPUT" ]; then
    echo "❌ FAILED: Could not get tools list from server"
    exit 1
fi

# Extract tool names
AVAILABLE_TOOLS=$(echo "$TOOLS_OUTPUT" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
TOOL_COUNT=$(echo "$AVAILABLE_TOOLS" | wc -l)

echo "📊 Found $TOOL_COUNT tools:"
echo "$AVAILABLE_TOOLS" | sort

# Check each required tool
MISSING_TOOLS=()
for tool in "${REQUIRED_TOOLS[@]}"; do
    if echo "$AVAILABLE_TOOLS" | grep -q "^$tool$"; then
        echo "✅ $tool"
    else
        echo "❌ $tool - MISSING"
        MISSING_TOOLS+=("$tool")
    fi
done

# Check acceleration layer
echo ""
echo "🚀 Checking acceleration layer..."
if [ -f "packages/python-worker/accel.py" ]; then
    echo "✅ accel.py exists"
    
    # Check for acceleration environment variables
    if [ -n "$ACCEL_MODE" ] || [ -n "$ACCEL_DEVICE" ]; then
        echo "✅ Acceleration environment configured"
    else
        echo "ℹ️  Acceleration environment not configured (using defaults)"
    fi
else
    echo "❌ accel.py missing"
    MISSING_TOOLS+=("accel.py")
fi

# Summary
echo ""
echo "📊 PREFLIGHT SUMMARY"
echo "===================="
echo "Expected tools: ${#REQUIRED_TOOLS[@]}"
echo "Found tools: $TOOL_COUNT"
echo "Missing tools: ${#MISSING_TOOLS[@]}"

if [ ${#MISSING_TOOLS[@]} -eq 0 ] && [ "$TOOL_COUNT" -ge "$EXPECTED_COUNT" ]; then
    echo ""
    echo "🎉 PREFLIGHT PASSED - All Phase 1-3 requirements met!"
    echo "✅ Ready to proceed with Phase 4-8 implementation"
    exit 0
else
    echo ""
    echo "❌ PREFLIGHT FAILED"
    if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
        echo "Missing tools: ${MISSING_TOOLS[*]}"
    fi
    if [ "$TOOL_COUNT" -lt "$EXPECTED_COUNT" ]; then
        echo "Tool count below expected ($TOOL_COUNT < $EXPECTED_COUNT)"
    fi
    echo ""
    echo "🔧 Required actions:"
    echo "1. Complete Phase 1-3 implementation"
    echo "2. Ensure all tools are properly registered"
    echo "3. Run 'npm run build' to compile packages"
    exit 1
fi
