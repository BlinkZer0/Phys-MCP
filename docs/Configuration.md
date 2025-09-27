---
title: Configuration
kind: howto
header_svg:
  src: "/assets/svg/cas-lab-hero.svg"
  static: "/assets/svg/cas-lab-hero-static.svg"
  title: "Configure Physics MCP"
  animate: true
  theme_variant: "auto"
  reduced_motion: "auto"
---

# Configuration

<p align="center">
  <img src="assets/header.svg" width="960" alt="Physics MCP banner" />
</p>

[Home](../README.md) · [Architecture](Architecture.md) · [Configuration](Configuration.md) · Tools: [CAS](Tools/CAS.md) · [Plot](Tools/Plot.md) · [NLI](Tools/NLI.md)

Environment Variables (NLI, optional)
- `LM_BASE_URL`: Base URL for a local OpenAI-compatible LM API (e.g., `http://localhost:1234/v1` for LM Studio)
- `LM_API_KEY`: Optional API key if your local API requires it
- `DEFAULT_MODEL`: Model name to use (e.g., `qwen2.5-coder`)

Notes
- These variables are optional. If omitted, NLI uses a deterministic, rule-based fallback and all tools still work.
- A local LM (e.g., LM Studio) improves NLI speed and robustness, but it is not required for core calculations.

MCP Client Config
- See `config/mcp_config.json` for a ready-to-use entry. Example:

```
{
  "mcpServers": {
    "phys-mcp": {
      "command": "node",
      "args": ["packages/server/dist/index.js"],
      "env": {
        "LM_BASE_URL": "http://localhost:1234/v1",
        "LM_API_KEY": "",
        "DEFAULT_MODEL": "qwen2.5-coder"
      },
      "disabled": false
    }
  }
}
```

Python Worker Dependencies
- Declared in `packages/python-worker/requirements.txt`
- Install with: `pip install -r packages/python-worker/requirements.txt`

Local Development
- Build: `pnpm build`
- Run: `pnpm dev` or 
ode packages/server/dist/index.js`
- Test: `pnpm run test:install`

Quick LM Studio setup (optional)
1. Install and run LM Studio.
2. Set `LM_BASE_URL` (e.g., `http://localhost:1234/v1`) and `DEFAULT_MODEL`.
3. If required, set `LM_API_KEY` for your local server.

Joke in reduced units: the NLI won't violate causality—if you don’t set `LM_BASE_URL`, it simply takes the rule-based path.


