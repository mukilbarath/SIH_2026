## Summary

Make the local engine dashboard reproducible and truthful about simulated data, while preserving physics/replay modes, charts, controls, schematic visualization and the optional legacy streamer.

```text
server/engine.py       deterministic model + validated replay
server/mavlink_sitl.py  bounded local WebSocket transport
lib/telemetry.ts        typed runtime contract + safe exports
hooks/useTelemetry.ts  reconnect, stale-data handling, bounded history
tests/                unit, real-socket and browser checks
docs/                 architecture, provenance, validation and demo evidence
```

Reject malformed controls before state changes, validate CSVs at startup, limit origins/messages/clients, and update vulnerable runtime dependencies. Replace nonfunctional exports and pretend configuration saves; distinguish source fault labels and illustrative RUL/scores from validated inference. Make 3D optional, retain mobile navigation, and add CI/dependency maintenance.

## Evidence

- **Before:** `npm run lint` reported 19 errors and 7 warnings. Python requirements omitted the imported WebSocket library. Dependency audit reported 11 findings, including high/critical findings. Export buttons had no handlers and configuration success was only a timer.
  **After:** lint/typecheck/build pass; 5 JavaScript tests, 9 Python tests and 3 Chromium scenarios pass. All 77,950 CSV rows validate with portable hashes. Runtime audit reports zero findings; 7 moderate development-only lint-chain findings are documented.
- Actual screenshots: [dashboard](docs/assets/dashboard.png), [mobile](docs/assets/mobile.png). See [validation record](docs/VALIDATION.md), [architecture](docs/ARCHITECTURE.md), [checklist](docs/IMPROVEMENTS.md) and [demo guide](docs/DEMO.md) and [short recording](docs/assets/walkthrough.webm).
- Hosted CI and domain validation are not claimed; branch publication is pending owner confirmation.

## Merge Danger

**Door:** two-way

No data migration, CSV changes, repository renaming or deployment. Revert the commit to restore the previous implementation.

**Blast Radius:** application

Protocol v1 now requires typed fields and simulated provenance. Native WebSocket/Socket.IO clients must supply an allowed Origin; out-of-range/string throttle commands are rejected. One simulator remains shared by all clients. Model interpolation is deterministic/stable; mode/run/wrap reset behavior is explicit. 3D now opens on request. Node 24 and Python 3.14 are the validated setup targets.

Remaining work: upstream development dependency advisory, broader device/browser checks, original dataset provenance/generator, and independent domain validation before any real-engine claims.
