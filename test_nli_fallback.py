#!/usr/bin/env python3
"""
Test NLI fallback behavior (LM independent)
"""
import json
import subprocess
import sys

def call_mcp(method: str, params: dict):
    server_path = "packages\\server\\dist\\index.js"
    process = subprocess.Popen(
        ["node", server_path],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd="."
    )
    request = {
        "jsonrpc": "2.0",
        "id": 42,
        "method": method,
        "params": params,
    }
    stdout, stderr = process.communicate(input=json.dumps(request) + "\n", timeout=15)
    if not stdout.strip():
        raise RuntimeError(f"No output from server. Stderr: {stderr[:200]}...")
    envelope = json.loads(stdout.strip())
    if "result" not in envelope:
        raise AssertionError(f"Missing result in response: {envelope}")
    return envelope["result"]


def parse_tool_result(result_envelope: dict) -> dict:
    # tools/call returns { content: [ { type: 'text', text: '<json>' } ] }
    content = result_envelope.get("content", [])
    assert content and isinstance(content, list), f"Unexpected content: {result_envelope}"
    text = content[0].get("text", "{}").strip()
    return json.loads(text)


def test_nli_diff():
    res = call_mcp(
        "tools/call",
        {
            "name": "nli_parse",
            "arguments": {"text": "Differentiate x^2 with respect to x"}
        },
    )
    parsed = parse_tool_result(res)
    assert parsed["intent"] == "cas", parsed
    assert parsed["args"].get("action") == "diff", parsed
    assert parsed["args"].get("expr") in ("x**2", "(x)**2"), parsed
    assert parsed["args"].get("symbol") == "x", parsed


def test_nli_plot():
    res = call_mcp(
        "tools/call",
        {
            "name": "nli_parse",
            "arguments": {"text": "Plot y = x^2 from -5 to 5"}
        },
    )
    parsed = parse_tool_result(res)
    assert parsed["intent"] == "plot", parsed
    assert parsed["args"].get("plot_type") == "function_2d", parsed
    assert parsed["args"].get("f") in ("x**2", "(x)**2"), parsed
    assert parsed["args"].get("x_min") == -5, parsed
    assert parsed["args"].get("x_max") == 5, parsed


if __name__ == "__main__":
    try:
        test_nli_diff()
        print("✅ NLI fallback diff test passed")
        test_nli_plot()
        print("✅ NLI fallback plot test passed")
        sys.exit(0)
    except Exception as e:
        print(f"❌ NLI fallback test failed: {e}")
        sys.exit(1)
