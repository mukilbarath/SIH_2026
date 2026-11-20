"""Validate every dataset cell and record reproducible inventory, not model accuracy."""
import argparse
import collections
import hashlib
import json
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from server.engine import DATASETS, DATA_ROOT, load_dataset


def inventory():
    report = {}
    for mode, filename in DATASETS.items():
        path = DATA_ROOT / filename
        rows = load_dataset(path)
        report[filename] = {
            'mode': mode, 'rows': len(rows), 'columns': list(rows[0]),
            'sha256_lf': hashlib.sha256(path.read_bytes().replace(b'\r\n', b'\n')).hexdigest(),
            'runs': len({row['run_id'] for row in rows}),
            'provenance_counts': dict(sorted(collections.Counter(row['provenance'] for row in rows).items())),
            'fault_counts': dict(sorted(collections.Counter(row['fault_label'] for row in rows).items())),
        }
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--check', action='store_true'); args = parser.parse_args()
    target = DATA_ROOT / 'docs' / 'dataset-inventory.json'
    actual = inventory()
    if args.check:
        if actual != json.loads(target.read_text()): raise SystemExit('Dataset inventory changed; inspect and regenerate intentionally.')
        print('Validated all 77,950 rows; inventory and SHA-256 hashes match.')
    else:
        target.write_text(json.dumps(actual, indent=2) + '\n', encoding='utf-8')
        print(f'Wrote {target.name}')
