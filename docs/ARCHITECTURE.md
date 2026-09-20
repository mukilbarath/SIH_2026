# Architecture

## System overview

The project has a Next.js frontend and a Python telemetry simulation server. The current dashboard uses the Python WebSocket path.

```text
Browser / Next.js dashboard
        │
        │ WebSocket ws://localhost:3002
        ▼
Python simulation server
        │
        ├── Physics model
        └── CSV replay datasets
            ├── train_healthy.csv
            ├── train_faults.csv
            └── test_scenarios.csv
```

An optional Node.js Socket.IO service runs independently on port `3001` and can replay CSV data for Socket.IO clients.

## Frontend

`app/page.tsx` owns the browser WebSocket connection, current telemetry state, a rolling history of 50 samples, navigation, and control messages. Components receive data through props.

Main components include:

- `TelemetryDashboard` — current telemetry and charts.
- `DiagnosticsPanel` — engine health information.
- `EngineControls` — throttle and control inputs.
- `Engine3DView` — Three.js visualization.
- `AnalyticsView` — real-time analysis.
- `FaultDetectionView` — faults and severity.
- `TrendLogs` — telemetry history.
- `DatasetManager` — simulation mode selection.

## Python server

`server/mavlink_sitl.py` exposes a WebSocket server on `localhost:3002` and runs an asynchronous engine loop at approximately 10 Hz.

### Physics mode

Physics mode derives RPM, engine load, fuel flow, CHT, EGT, vibration, oil pressure, and RUL from throttle and simulated engine state. The model is designed for demonstration and is not a validated aircraft-engine model.

### Replay modes

| Mode | File |
| --- | --- |
| `healthy` | `train_healthy.csv` |
| `faults` | `train_faults.csv` |
| `scenarios` | `test_scenarios.csv` |

Rows are loaded from the repository root and replayed in order. Replay loops after the final row. RUL and fault state are reset when the mode changes.

## WebSocket messages

Server-to-client telemetry messages use JSON:

```json
{
  "type": "telemetry",
  "time_s": 0,
  "throttle_pct": 0,
  "rpm": 0,
  "fuel_flow_lph": 0,
  "fault_label": "HEALTHY",
  "fault_severity": 0,
  "rul_hours": 500,
  "mode": "physics"
}
```

The complete payload also includes cylinder temperatures, EGT values, vibration, oil pressure, and oil temperature.

Client-to-server control messages:

```json
{"type":"set_throttle","value":35}
{"type":"set_mode","value":"faults"}
```

Supported modes are `physics`, `healthy`, `faults`, and `scenarios`.

## Operational notes

- The system is intended for local simulation.
- No authentication or authorization layer is implemented.
- State and replay position are held in memory.
- The optional Socket.IO service currently allows all CORS origins and should be restricted before any non-local deployment.
- Telemetry, fault labels, and RUL calculations require domain validation before real-world use.
