from __future__ import annotations

from pathlib import Path

MAPPING = {
    'docs/Tools/AllTools.md': 'tool-all-hero',
    'docs/Tools/CAS.md': 'tool-cas-hero',
    'docs/Tools/Constants.md': 'tool-constants-hero',
    'docs/Tools/Data.md': 'tool-data-hero',
    'docs/Tools/Distributed.md': 'tool-distributed-hero',
    'docs/Tools/Export.md': 'tool-export-hero',
    'docs/Tools/ExternalAPIs.md': 'tool-external-hero',
    'docs/Tools/GraphingCalculator.md': 'tool-graphing-hero',
    'docs/Tools/ML.md': 'tool-ml-hero',
    'docs/Tools/NLI.md': 'tool-nli-hero',
    'docs/Tools/Orchestrator.md': 'tool-orchestrator-hero',
    'docs/Tools/Plot.md': 'tool-plot-hero',
    'docs/Tools/Quantum.md': 'tool-quantum-hero',
    'docs/Tools/Report.md': 'tool-report-hero',
    'docs/Tools/StatMech.md': 'tool-statmech-hero',
    'docs/Tools/Tensor.md': 'tool-tensor-hero',
    'docs/Tools/Units.md': 'tool-units-hero',
    'docs/guides/educators.md': 'tool-educators-hero',
}

ASSIGN_LINE = '{% assign header_svg = page.header_svg %}'
INCLUDE_LINE = '{% include header-svg.html %}'

for path_str, hero in MAPPING.items():
    path = Path(path_str)
    text = path.read_text(encoding='utf-8')
    lines = text.splitlines()

    if lines and lines[0].strip() == '---':
        for idx in range(1, len(lines)):
            if lines[idx].strip() == '---':
                lines = lines[idx + 1 :]
                break

    while lines and not lines[0].strip():
        lines = lines[1:]

    if lines and lines[0].strip().startswith('<p'):
        while lines and '</p>' not in lines[0]:
            lines = lines[1:]
        if lines:
            lines = lines[1:]
        while lines and not lines[0].strip():
            lines = lines[1:]

    while len(lines) >= 2 and lines[0].strip() == ASSIGN_LINE and lines[1].strip() == INCLUDE_LINE:
        lines = lines[2:]
        while lines and not lines[0].strip():
            lines = lines[1:]

    if not lines:
        raise RuntimeError(f'Empty content in {path}')

    heading_idx = next((i for i, line in enumerate(lines) if line.lstrip().startswith('#')), None)
    if heading_idx is None:
        raise RuntimeError(f'Cannot locate heading in {path}')

    title_line = lines[heading_idx].lstrip('#').strip()
    body = '\n'.join(lines).strip('\n') + '\n'
    kind = 'howto' if 'guides' in path.parts else 'reference'

    front_matter = (
        f"---\n"
        f"title: {title_line}\n"
        f"kind: {kind}\n"
        f"header_svg:\n"
        f"  src: \"/assets/svg/{hero}.svg\"\n"
        f"  static: \"/assets/svg/{hero}-static.svg\"\n"
        f"  title: \"{title_line}\"\n"
        f"  animate: true\n"
        f"  theme_variant: \"auto\"\n"
        f"  reduced_motion: \"auto\"\n"
        f"---\n\n"
        f"{ASSIGN_LINE}\n"
        f"{INCLUDE_LINE}\n\n"
    )

    path.write_text(front_matter + body, encoding='utf-8')
