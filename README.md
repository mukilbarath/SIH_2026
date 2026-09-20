# SIH 2026 — Digital Twin Core

A prototype digital-twin dashboard for monitoring and simulating a MALE UAV aero piston engine. It combines a Next.js/React interface with a Python WebSocket simulation server, CSV telemetry replay, fault indicators, analytics, trend logs, and a Three.js engine visualization.

> **Status:** Hackathon/team prototype. The simulated telemetry is not intended for flight-critical or safety-critical use.

## Features

- Real-time telemetry at approximately 10 Hz.
- Physics-based engine simulation.
- Healthy, fault, and scenario CSV replay modes.
- Throttle and simulation-mode controls.
- Fault detection, severity, RUL, diagnostics, and trend monitoring.
- Interactive 3D engine view.
- Analytics and telemetry charts.

## Technology

- Next.js 16, React 19, TypeScript, CSS Modules
- Three.js, React Three Fiber, Recharts
- Python asyncio WebSocket server
- MAVLink-related Python dependencies
- Node.js Socket.IO CSV streamer

## Repository structure

```text
app/                 Next.js pages and styles
components/          Dashboard and visualization components
server/              Python simulation and optional Socket.IO server
*.csv                Healthy, fault, and test telemetry datasets
docs/                Architecture and project documentation
CONTRIBUTING.md      Contribution guidelines
CODE_OF_CONDUCT.md   Team collaboration standards
LICENSE              MIT License
```

## Requirements

- Node.js 20+
- npm 10+
- Python 3.10+
- A modern browser with WebSocket and WebGL support

## Setup

```bash
git clone https://github.com/mukilbarath/SIH_2026.git
cd SIH_2026
npm install

python -m venv .venv

# macOS/Linux
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1

pip install -r server/requirements.txt
```

## Run locally

Start the Python telemetry server from the repository root:

```bash
python server/mavlink_sitl.py
```

In a second terminal, start the dashboard:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard connects to `ws://localhost:3002`.

The optional Socket.IO streamer can be started with:

```bash
node server/telemetryStreamer.js
```

It listens on port `3001` and is separate from the WebSocket server used by the current dashboard.

## Simulation modes

| Mode | Data source |
| --- | --- |
| `physics` | Generated engine physics model |
| `healthy` | `train_healthy.csv` |
| `faults` | `train_faults.csv` |
| `scenarios` | `test_scenarios.csv` |

## Useful commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # Run ESLint
python -m py_compile server/mavlink_sitl.py
```

## Telemetry controls

The dashboard sends JSON commands such as:

```json
{"type":"set_throttle","value":50}
{"type":"set_mode","value":"faults"}
```

Telemetry messages contain fields such as `rpm`, `throttle_pct`, `fuel_flow_lph`, `cht_*_c`, `egt_*_c`, `fault_label`, `fault_severity`, `rul_hours`, and `mode`.

## Troubleshooting

- **Disconnected dashboard:** verify that `python server/mavlink_sitl.py` is running and port `3002` is available.
- **CSV errors:** start the Python server from the repository root and verify that all three CSV files exist.
- **Blank 3D view:** enable WebGL or browser hardware acceleration.

## Team workflow

Team members should be added as repository collaborators with the minimum GitHub role required for their work. Use feature branches and pull requests for shared changes. Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting work.

## Safety and data notice

This project uses simulated and replayed data. It does not provide certified aircraft monitoring, engine control, or maintenance guidance. Do not connect it to a real aircraft or use it for operational decisions without independent validation and appropriate safety controls.

## License

This project is licensed under the [MIT License](LICENSE). Third-party dependencies, datasets, images, fonts, and other external assets remain subject to their respective licenses.
