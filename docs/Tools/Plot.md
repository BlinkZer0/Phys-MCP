<p align="center">
  <img src="../assets/svg/experiment-orchestrator-hero.svg" width="960" alt="Plotting Utilities" />
</p>

# Plot Tools

[Home](../../README.md) · [Architecture](../Architecture.md) · [Configuration](../Configuration.md) · Tools: [CAS](CAS.md) · [Plot](Plot.md) · [NLI](NLI.md)

Plotting is performed by the Python worker using Matplotlib. Images are returned as base64 PNG strings; CSV data is included for function plots.

Common Notes
- Expressions use SymPy-compatible syntax; NumPy is used for evaluation.
- Optional styling: `title`, `xlabel`, `ylabel`, `dpi`, `width`, `height`.

Tools
- `plot.function_2d`
  - Params: `f` (string), `x_min` (number), `x_max` (number), `samples?` (int)
  - Returns: `{ image_png_b64, csv_data, x_range, y_range, samples }`
  - Example request:
    ```json
    {"jsonrpc":"2.0","id":"1","method":"plot.function_2d","params":{
      "f":"sin(x)","x_min":0,"x_max":6.28318,"dpi":160
    }}
    ```

- `plot.parametric_2d`
  - Params: `x_t` (string), `y_t` (string), `t_min` (number), `t_max` (number), `samples?` (int)
  - Returns: `{ image_png_b64, t_range, samples }`

- `plot.field_2d`
  - Params: `fx` (string), `fy` (string), `x_min` (number), `x_max` (number), `y_min` (number), `y_max` (number), `grid_points?` (int), `plot_type?` (`"quiver"|"stream"`)
  - Returns: `{ image_png_b64, x_range, y_range, grid_points, plot_type }`

Schemas
- Source of truth: `packages/tools-plot/src/schema.ts`

Backend
- Implementations: `packages/python-worker/worker.py`

Plot pun (low-frequency): all creation happens in a buffer—no energy escapes the bounding box.


