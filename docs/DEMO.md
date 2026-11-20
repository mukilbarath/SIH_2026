# Two-minute showcase guide

Start both local services, open the dashboard and wait for Connected. Stop other sessions that could change the shared engine. The included screenshots are generated from the working application by browser tests, not design mockups.

| Time | Action | Explain |
| --- | --- | --- |
| 0:00–0:15 | Show the simulation notice and schematic | A local engineering prototype using simulated data |
| 0:15–0:40 | Move physics throttle to 60%, then down | Deterministic first-order response, live charts and server-confirmed control |
| 0:40–1:00 | Open Datasets; select faults | Replays existing source rows, including initial healthy periods |
| 1:00–1:20 | Open Fault Detection and Analytics | Source labels and illustrative scores; no trained AI or measured BSFC |
| 1:20–1:40 | Export a CSV and JSON report | Downloads the latest 50-sample window with explicit provenance |
| 1:40–2:00 | Stop/restart simulator | Stale readings disappear; controls disable and the client reconnects |

For a quick labelled fault demonstration without waiting through healthy rows, show the browser regression test's documented fixture scenario. Clearly label that recording as a fixture-driven test; do not present it as spontaneous diagnosis or live aircraft data.

Capture at 1280×720 or larger and keep the simulation notice visible. Use an actual screen recording with captions; avoid claims about accuracy, FPS, latency or real flight performance without measured evidence. Screenshots can be regenerated with `npm run test:e2e` after a production build.

No hosted demo is deployed.

## Captured walkthrough

[Watch the automated local-simulator walkthrough](assets/walkthrough.webm). This short, unedited browser-test recording covers controls, mode selection, exports, navigation, mobile settings and the Dashboard's 3D engine view. It has no narration and is software demonstration evidence, not an aircraft test.
