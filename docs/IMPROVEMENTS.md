# Inspection and improvement checklist

Baseline: `39e39f3acbe9b7651b6ea88250fef825bf969b33` (main). Work branch: `improve/reproducibility-and-showcase`.

The earlier chat did not preserve its interactive checklist. This tracker is grounded in source inspection rather than treating its suggestions as verified defects. All tracked application source, configuration and documentation were read; every CSV row was machine-validated. Lockfile packages were inspected through installation/audit tooling. Existing SVGs are starter assets; the ICO is a binary icon, not application logic. No synced project reference files were modified.

## P0 — correctness, security and reproducibility

- [x] Replace missing `websockets` dependency and remove unused pymavlink/socketio/aiohttp Python dependencies.
- [x] Pin the actual Python transport dependency; use npm lockfile installation and Node 24 target.
- [x] Validate commands before mutation: types, bounds, supported modes and malformed JSON.
- [x] Restrict telemetry to loopback and allowed origins; bound input size, queue, connection count and control rate.
- [x] Separate deterministic model/replay from network lifecycle; propagate loop failure.
- [x] Validate CSV schema, numeric cells, finite values and provenance at startup; retain source metadata.
- [x] Fix history discontinuities on mode/run changes and replay wraps.
- [x] Update Next.js and compatible dependencies; runtime audit clean at recorded validation time.
- [x] Remove unsupported AI, MAVLink, BSFC and predictive-maintenance claims from active UI.
- [x] Preserve CSV files, four modes, charts, controls, schematic geometry and optional legacy stream.

## P1 — frontend and verification

- [x] Replace telemetry `any` props with a runtime-validated shared TypeScript contract.
- [x] Reconnect with capped backoff; clear stale data and disable unavailable controls.
- [x] Reflect server throttle state; coalesce slider commands.
- [x] Make JSON and CSV export functional; escape spreadsheet formula strings.
- [x] Replace fake configuration saves with truthful effective settings.
- [x] Use consistent fault semantics, including low-severity labelled faults.
- [x] Keyboard-accessible navigation/dataset buttons, mobile navigation, visible focus and responsive cards.
- [x] Load 3D on request, isolate failure, remove external font fetches, lower rendering cost.
- [x] Deterministic model, corrupt input, real-socket, browser and legacy stream checks.
- [x] CI for lint, types, tests, dataset hashes, production build and browser evidence.
- [x] Dependency update configuration and PR review template.

## P2 — documentation and showcase

- [x] Rename package `temp_app` to `sih-2026-digital-twin`; no generic project folder exists in this checkout.
- [x] Document actual architecture, protocol, state ownership, timing and reset behavior.
- [x] Include dataset inventory, hashes, provenance gaps and validation limits.
- [x] Supply reproducible setup, Windows instructions, demo script and actual screenshots.
- [x] Prepare local PR summary and validation record; publication awaits approval.

## Genuine follow-ups (not fabricated as completed)

- [ ] Recover original dataset generator, parameters, seeds and licensing evidence from authors.
- [ ] Obtain domain-reviewed engine calibration and held-out evaluation before claiming real fault detection or RUL quality.
- [ ] Resolve the remaining development-only minimatch advisory through an upstream compatible lint-tool update.
- [ ] Validate Firefox/Safari, physical mobile devices, keyboard/screen-reader workflows beyond current smoke checks, and a wider GPU range.
- [ ] Design authenticated, TLS-protected deployment if public hosting is desired; no deployment is included.
- [ ] Confirm final narrated demo, repository topics/description and pinning with the owner.
- [ ] Publish branch/PR, run hosted CI and request human review after owner confirmation.

## Inspection map

| Original area | Finding and disposition |
| --- | --- |
| app/page.tsx | Socket lifecycle and unsafe parsing extracted; dead export wired; accessible navigation |
| app/layout.tsx, styles | Honest metadata, no Google font dependency, mobile navigation/cards |
| TelemetryDashboard, AnalyticsView | Typed data; removed mount-effect lint errors; labelled illustrative ratio |
| DiagnosticsPanel, FaultDetectionView | Source label consistency; unvalidated guidance explicitly educational |
| EngineControls, DatasetManager | Server-backed values and disabled states; keyboard controls |
| TrendLogs, SystemConfigView | Working export and truthful settings |
| Engine3DView | Typed geometry props, explicit Curve constructor, optional lazy view and error containment |
| MissionReplay | Unused alternative component retained; inaccurate CAN wording corrected |
| Python server and requirements | Missing dependency, global unvalidated state and silent fallback replaced |
| Legacy Node streamer | Startup cache avoids racing file loads; allowlist, loopback and validated modes |
| Three CSVs | Preserved; all 77,950 rows checked and hashed |
| package files, TS/ESLint/Next config | Lockfile/security updates; strict checks retained |
| README, architecture, contributing | Rewritten/expanded around actual implementation and checks |
| LICENSE, conduct, CODEOWNERS | Retained existing ownership and policy |
| AGENTS.md, CLAUDE.md | Followed installed Next.js guide requirement; retained |
| public SVGs, favicon | Starter assets retained; no invented branding or attribution |
| .gitignore | Added environment/test exclusions and allowed example configuration |
