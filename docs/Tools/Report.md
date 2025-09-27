# Report Tool

- Name: `report_generate`
- Description: Generate a session report (Markdown) summarizing tool events and artifacts.
- Package: `packages/tools-report/`

## Input Schema

```json
{
  "type": "object",
  "properties": {
    "session_id": { "type": "string", "description": "Target session ID" },
    "format": { "type": "string", "enum": ["markdown"], "default": "markdown" },
    "title": { "type": "string" },
    "author": { "type": "string" },
    "include": {
      "type": "array",
      "items": { "type": "string", "enum": ["cas", "plots", "constants", "units", "events", "artifacts"] }
    }
  },
  "required": ["session_id"]
}
```

## Behavior

- The server aggregates events and artifacts for the given `session_id` using `packages/server/src/persist.ts`.
- A Markdown file is written to `artifacts/<session_id>/report-<uuid>.md` and recorded as an artifact of kind `report_markdown`.
- Returns the `report_path`, `format`, `bytes`, and metadata.

## Example Request

```json
{
  "jsonrpc": "2.0",
  "id": "report-1",
  "method": "report_generate",
  "params": {
    "session_id": "<your-session-id>",
    "format": "markdown",
    "title": "My Physics Session",
    "author": "Physicist X"
  }
}
```

## Notes

- Currently, only Markdown is supported. PDF generation can be added later via LaTeX/Pandoc as an optional step.
- Large image/CSV artifacts are referenced by path. Plots already save their PNG/CSV to the artifacts directory.
