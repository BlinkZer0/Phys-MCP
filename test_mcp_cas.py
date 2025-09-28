#!/usr/bin/env python3
"""
Test CAS tool through MCP protocol
"""

import sys
import json
import subprocess
import time
import os

def test_mcp_cas():
    """Test CAS tool through MCP server"""
    print("🧮 Testing CAS Tool through MCP Protocol")
    print("="*60)
    
    # Server should already be running
    server_path = os.path.join("packages", "server", "dist", "index.js")
    
    tests_passed = 0
    tests_total = 0
    
    def send_mcp_request(method, params):
        """Send an MCP request to the server"""
        try:
            # Create MCP request
            request = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": method,
                "params": params
            }
            
            # Start server process for this test
            process = subprocess.Popen(
                ["node", server_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=os.getcwd()
            )
            
            # Send request
            request_json = json.dumps(request) + "\n"
            stdout, stderr = process.communicate(input=request_json, timeout=10)
            
            # Parse response
            if stdout.strip():
                response = json.loads(stdout.strip())
                return response
            else:
                print(f"No stdout, stderr: {stderr}")
                return None
                
        except Exception as e:
            print(f"Error sending MCP request: {e}")
            return None
    
    # Test 1: List available tools
    print("\n1. Testing tools/list")
    tests_total += 1
    try:
        response = send_mcp_request("tools/list", {})
        if response and "result" in response:
            tools = response["result"]["tools"]
            tool_names = [tool["name"] for tool in tools]
            print(f"   Available tools: {tool_names}")
            if "cas" in tool_names:
                print("   ✅ PASSED: CAS tool found")
                tests_passed += 1
            else:
                print("   ❌ FAILED: CAS tool not found")
        else:
            print(f"   ❌ FAILED: Invalid response: {response}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 2: Test CAS evaluation
    print("\n2. Testing CAS evaluation: 2 + 3 * 4")
    tests_total += 1
    try:
        response = send_mcp_request("tools/call", {
            "name": "cas",
            "arguments": {
                "action": "evaluate",
                "expr": "2 + 3 * 4"
            }
        })
        if response and "result" in response:
            result = response["result"]
            print(f"   Response: {json.dumps(result, indent=2)}")
            if "result" in result and result["result"] == 14:
                print("   ✅ PASSED")
                tests_passed += 1
            else:
                print(f"   ❌ FAILED: Expected result=14, got {result}")
        else:
            print(f"   ❌ FAILED: Invalid response: {response}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 3: Test CAS differentiation
    print("\n3. Testing CAS differentiation: d/dx(x^2)")
    tests_total += 1
    try:
        response = send_mcp_request("tools/call", {
            "name": "cas",
            "arguments": {
                "action": "diff",
                "expr": "x**2",
                "symbol": "x"
            }
        })
        if response and "result" in response:
            result = response["result"]
            print(f"   Response: {json.dumps(result, indent=2)}")
            if "result" in result and "2*x" in str(result["result"]):
                print("   ✅ PASSED")
                tests_passed += 1
            else:
                print(f"   ❌ FAILED: Expected 2*x in result, got {result}")
        else:
            print(f"   ❌ FAILED: Invalid response: {response}")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Summary
    print(f"\n{'='*60}")
    print(f"🏁 MCP CAS TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Tests passed: {tests_passed}/{tests_total}")
    print(f"Success rate: {tests_passed/tests_total*100:.1f}%")
    
    if tests_passed == tests_total:
        print("🎉 ALL MCP CAS TESTS PASSED!")
        return True
    else:
        print("⚠️  Some MCP CAS tests failed.")
        return False

if __name__ == "__main__":
    success = test_mcp_cas()
    sys.exit(0 if success else 1)
