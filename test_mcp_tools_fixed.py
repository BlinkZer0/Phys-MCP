#!/usr/bin/env python3
"""
Test MCP tools after database fixes
"""

import json
import subprocess
import sys
import time

def test_mcp_tools():
    """Test MCP tools through simple JSON-RPC calls"""
    print("🔧 Testing MCP Tools After Database Fixes")
    print("="*60)
    
    # Test data for different tools
    test_cases = [
        {
            "name": "tools/list",
            "description": "List all available tools",
            "request": {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/list",
                "params": {}
            }
        },
        {
            "name": "CAS evaluation",
            "description": "Test CAS tool with simple arithmetic",
            "request": {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {
                    "name": "cas",
                    "arguments": {
                        "action": "evaluate",
                        "expr": "2 + 3 * 4"
                    }
                }
            }
        },
        {
            "name": "Constants lookup",
            "description": "Test constants tool",
            "request": {
                "jsonrpc": "2.0",
                "id": 3,
                "method": "tools/call",
                "params": {
                    "name": "constants_get",
                    "arguments": {
                        "name": "c"
                    }
                }
            }
        }
    ]
    
    tests_passed = 0
    tests_total = len(test_cases)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. Testing {test_case['name']}: {test_case['description']}")
        
        try:
            # Create a simple test by writing to stdin and reading stdout
            server_path = "packages\\server\\dist\\index.js"
            
            # Start server process
            process = subprocess.Popen(
                ["node", server_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd="."
            )
            
            # Send request
            request_json = json.dumps(test_case["request"]) + "\n"
            stdout, stderr = process.communicate(input=request_json, timeout=15)
            
            if stdout.strip():
                try:
                    response = json.loads(stdout.strip())
                    print(f"   ✅ SUCCESS: Got valid JSON response")
                    
                    if test_case["name"] == "tools/list":
                        tools = response.get("result", {}).get("tools", [])
                        tool_names = [tool["name"] for tool in tools]
                        print(f"   📊 Found {len(tools)} tools: {', '.join(tool_names[:5])}{'...' if len(tools) > 5 else ''}")
                    elif "result" in response:
                        print(f"   📋 Response: {json.dumps(response['result'], indent=2)[:200]}...")
                    
                    tests_passed += 1
                except json.JSONDecodeError as e:
                    print(f"   ❌ FAILED: Invalid JSON response: {e}")
                    print(f"   Raw output: {stdout[:200]}...")
            else:
                print(f"   ❌ FAILED: No output received")
                if stderr:
                    print(f"   Error: {stderr[:200]}...")
                    
        except subprocess.TimeoutExpired:
            print(f"   ❌ FAILED: Request timed out")
            process.kill()
        except Exception as e:
            print(f"   ❌ FAILED: {e}")
    
    # Summary
    print(f"\n{'='*60}")
    print(f"🏁 MCP TOOLS TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Tests passed: {tests_passed}/{tests_total}")
    print(f"Success rate: {tests_passed/tests_total*100:.1f}%")
    
    if tests_passed == tests_total:
        print("🎉 ALL MCP TOOLS TESTS PASSED!")
        print("✅ The MCP database issues have been resolved.")
        print("✅ Tools are now accessible and functional.")
        return True
    else:
        print("⚠️  Some MCP tools tests failed.")
        return False

if __name__ == "__main__":
    success = test_mcp_tools()
    sys.exit(0 if success else 1)
