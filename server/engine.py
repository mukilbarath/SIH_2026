"""Deterministic demonstration model and validated CSV replay; no aircraft I/O."""
import csv
import math
from pathlib import Path

DATA_ROOT = Path(__file__).resolve().parent.parent
DATASETS = {'healthy': 'train_healthy.csv', 'faults': 'train_faults.csv', 'scenarios': 'test_scenarios.csv'}
MODES = ('physics', *DATASETS)
NUMERIC_FIELDS = ('throttle_pct', 'rpm', 'fuel_flow_lph', 'oil_pressure_bar', 'oil_temp_c',
    'vibration_x_g', 'vibration_y_g', 'vibration_z_g', 'fault_severity',
    *(f'{kind}_{i}_c' for kind in ('cht', 'egt') for i in range(1, 5)))


def load_dataset(path):
    """Reject corruption at startup instead of silently displaying zeroes."""
    with Path(path).open(newline='', encoding='utf-8-sig') as source:
        reader = csv.DictReader(source)
        required = {*NUMERIC_FIELDS, 'time_s', 'run_id', 'phase', 'fault_label', 'provenance'}
        if not required.issubset(reader.fieldnames or []):
            raise ValueError(f'{Path(path).name}: missing required columns')
        rows = []
        for line, raw in enumerate(reader, 2):
            if None in raw or any(value is None or value == '' for value in raw.values()):
                raise ValueError(f'{Path(path).name}:{line}: missing or extra cells')
            row = dict(raw)
            for field in raw:
                if field not in ('phase', 'fault_label', 'provenance'):
                    try:
                        row[field] = float(raw[field])
                    except (ValueError, TypeError) as exc:
                        raise ValueError(f'{Path(path).name}:{line}: invalid {field}') from exc
                    if not math.isfinite(row[field]):
                        raise ValueError(f'{Path(path).name}:{line}: non-finite {field}')
            if not 0 <= row['throttle_pct'] <= 100 or not 0 <= row['fault_severity'] <= 1 or row['rpm'] < 0:
                raise ValueError(f'{Path(path).name}:{line}: out-of-range telemetry')
            if row['provenance'] != 'SIMULATED':
                raise ValueError(f'{Path(path).name}:{line}: expected SIMULATED provenance')
            rows.append(row)
    if not rows:
        raise ValueError(f'{Path(path).name}: empty dataset')
    return rows


class Engine:
    def __init__(self, datasets=None):
        self.datasets = datasets if datasets is not None else {
            mode: load_dataset(DATA_ROOT / filename) for mode, filename in DATASETS.items()}
        self.mode = 'physics'
        self.throttle = 0.0
        self.sequence = 0
        self.elapsed = 0.0
        self.reset()

    def reset(self):
        self.index = 0
        self.rul = 500.0
        self.rpm = 0.0
        self.cht = [150.0] * 4
        self.egt = [700.0] * 4

    def command(self, data):
        """Validate before mutation; clients intentionally share one engine."""
        if not isinstance(data, dict) or set(data) != {'type', 'value'}:
            raise ValueError('Expected an object with type and value')
        value = data['value']
        if data['type'] == 'set_throttle':
            if type(value) not in (int, float) or not math.isfinite(value) or not 0 <= value <= 100:
                raise ValueError('Throttle must be a finite number from 0 to 100')
            if self.mode != 'physics':
                raise ValueError('Throttle is only available in physics mode')
            self.throttle = float(value)
        elif data['type'] == 'set_mode':
            if not isinstance(value, str) or value not in MODES:
                raise ValueError('Unknown simulation mode')
            self.mode = value
            self.reset()
        else:
            raise ValueError('Unknown command')

    def step(self, dt=0.1):
        if not math.isfinite(dt) or not 0 < dt <= 1:
            raise ValueError('Step must be finite and in (0, 1] seconds')
        self.elapsed += dt
        self.sequence += 1
        if self.mode == 'physics':
            running = self.throttle > 5
            target = self.throttle * 50 if running else 0
            self.rpm += (target - self.rpm) * (1 - math.exp(-dt / 1.5))
            for i in range(4):
                self.cht[i] += (150 + self.rpm / 5000 * 60 + math.sin(self.elapsed * 2 + i) * 2 - self.cht[i]) * (1 - math.exp(-dt / 10))
                self.egt[i] += (700 + self.rpm / 5000 * 150 + math.cos(self.elapsed * 5 + i) * 5 - self.egt[i]) * (1 - math.exp(-dt / 2))
            self.rul = max(0, self.rul - (dt / 3600 * (10 if self.rpm > 4500 else 1) if running else 0))
            row = {
                'throttle_pct': self.throttle, 'rpm': self.rpm,
                'fuel_flow_lph': self.rpm / 5000 * 30 + (5 if running else 0),
                'oil_pressure_bar': 4.2 if running else 0, 'oil_temp_c': 90 if running else 20,
                **{f'vibration_{axis}_g': 0.1 if running else 0 for axis in 'xyz'},
                **{f'cht_{i + 1}_c': v for i, v in enumerate(self.cht)},
                **{f'egt_{i + 1}_c': v for i, v in enumerate(self.egt)},
                'fault_label': 'WEAR_WARNING' if self.rul < 50 else 'HEALTHY',
                'fault_severity': 0.8 if self.rul < 50 else 0,
                'phase': 'THROTTLE_DEMO', 'source_time_s': None, 'run_id': None}
        else:
            rows = self.datasets[self.mode]
            source = rows[self.index]
            if self.index == 0 or source['run_id'] != rows[self.index - 1]['run_id']:
                self.rul = 500.0
            degradation = dt / 3600 * max(1, (source['rpm'] / 3000) ** 2)
            degradation *= 1 + source['fault_severity'] * 500
            self.rul = max(0, self.rul - degradation)
            row = {key: source[key] for key in NUMERIC_FIELDS}
            row.update(fault_label=source['fault_label'], phase=source['phase'],
                       source_time_s=source['time_s'], run_id=source['run_id'])
            self.index = (self.index + 1) % len(rows)
        return {**row, 'type': 'telemetry', 'schema_version': 1, 'sequence': self.sequence,
                'time_s': self.elapsed, 'mode': self.mode, 'rul_hours': self.rul, 'provenance': 'SIMULATED'}
