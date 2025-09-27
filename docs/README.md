# Documentation

<p align="center">
  <img src="assets/header.svg" width="960" alt="Physics MCP banner" />
  
</p>

[Home](../README.md) · [Architecture](Architecture.md) · [Configuration](Configuration.md) · Tools: [CAS](Tools/CAS.md) · [Plot](Tools/Plot.md) · [NLI](Tools/NLI.md) · [Report](Tools/Report.md) · [Tensor](Tools/Tensor.md) · [Quantum](Tools/Quantum.md) · [StatMech](Tools/StatMech.md) · [FAQ](FAQ.md)

- Architecture: `docs/Architecture.md`
- Configuration: `docs/Configuration.md`
- Tools
  - CAS: `docs/Tools/CAS.md`
  - Plot: `docs/Tools/Plot.md`
  - NLI: `docs/Tools/NLI.md`
  - Report: `docs/Tools/Report.md`
  - Tensor: `docs/Tools/Tensor.md`
  - Quantum: `docs/Tools/Quantum.md`
  - StatMech: `docs/Tools/StatMech.md`
- Examples: see `examples/requests/`

Note on NLI: LM Studio (or any OpenAI-compatible local LM) is optional and only accelerates natural-language parsing; all calculations run locally regardless.

Quick Links
- Server entry: `packages/server/src/index.ts`
- Python worker: `packages/python-worker/worker.py`
- MCP config example: `mcp_config.json`

Doc humor (order-parameter aligned): our errors are bounded in L2; going L∞ would be rude.
