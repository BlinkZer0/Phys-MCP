from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path

pattern = re.compile(r'src:\s*\"(/assets/svg/[^\"]+)\"')
usage: dict[str, list[str]] = {}
for md_path in Path('docs').rglob('*.md'):
    try:
        text = md_path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    if not text.startswith('---'):
        continue
    end = text.find('\n---', 3)
    if end == -1:
        continue
    front = text[:end]
    match = pattern.search(front)
    if not match:
        continue
    asset_name = Path(match.group(1)).stem
    usage.setdefault(asset_name, []).append(str(md_path).replace('\\', '/'))

assets = []
for name in sorted(usage):
    static_path = Path(f'assets/svg/{name}-static.svg')
    animated_path = Path(f'assets/svg/{name}.svg')
    entry = {
        'name': name,
        'usage': sorted(usage[name]),
    }
    if animated_path.exists():
        entry['animated'] = f"/assets/svg/{animated_path.name}"
    if static_path.exists():
        entry['static'] = f"/assets/svg/{static_path.name}"
    assets.append(entry)

manifest = {
    'updatedAt': datetime.now().isoformat(timespec='seconds'),
    'assets': assets,
}

Path('assets/svg/manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
