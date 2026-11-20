# Validation record

Local validation on **12 November 2026 (Asia/Kolkata)**, Windows, Node **24.15.0**, Python **3.14.2**, Next.js **16.4.6**, websockets **17.2**, Playwright **1.65.0** / bundled Chromium. This is software validation, not an engine benchmark or scientific accuracy report.

## Results

| Check | Observed result |
| --- | --- |
| `npm run lint` | Pass, no warnings/errors |
| `npm run typecheck` | Pass |
| `npm test` | 5 passing tests: contract validation, history boundaries, fault semantics, safe CSV, actual legacy Socket.IO replay |
| `python -m unittest discover -s tests -p 'test_*.py' -v` | 9 passing tests, including actual local WebSocket connections |
| `python scripts/validate_datasets.py --check` | All 77,950 rows valid; canonical-newline SHA-256 inventory matches |
| `npm run build` | Pass; production route prerendered |
| `npm run test:e2e` | 3 passing Chromium scenarios against production build and Python server |
| `npm audit --omit=dev --json` | 0 reported runtime vulnerabilities at validation time |
| Full dependency audit | 7 moderate development-only findings remain in the minimatch/typescript-eslint chain |
| `git diff --check` | Pass |

The full audit originally reported 11 findings: 7 moderate, 3 high, 1 critical. Next.js and compatible dependency updates removed the runtime/high/critical findings. The remaining [minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249) affects the installed lint-tool chain. A compatible `npm audit fix` did not resolve it; no cross-major override was forced. Audit results change over time; rerun before merging.

## Behavior covered

- All repository CSV rows, field types, finite values and simulated provenance; malformed CSVs rejected.
- Invalid commands leave state intact; deterministic model response stays bounded; counter clamps and resets.
- Four modes over real WebSockets; malformed JSON, missing/untrusted Origin, oversized frames and two-client control sharing.
- Browser keyboard throttle input, dataset selection, replay-disabled throttle, parsed JSON/CSV downloads, every navigation tab, mobile navigation/layout and optional WebGL canvas.
- Controlled browser fixture tests for malformed messages, low-severity labelled faults, stale-data recovery/reconnect and disconnected controls. These fixtures are test inputs, not recordings of real failures or real engines.
- Legacy Socket.IO dataset switching and invalid scenario rejection.

## Evidence and limits

`docs/assets/dashboard.png` and `mobile.png` are actual browser captures. The short walkthrough recording is an automated UI test, not a narrated product demo. Browser traces/videos are generated under ignored `test-results/`; CI uploads them as artifacts. The curated walkthrough can be refreshed from the successful real-simulator test.

Hosted GitHub Actions has **not** run for this branch because it has not been published. Linux CI is configured but local execution was Windows only. Windows-restricted execution could not run socket checks; the same tests passed with permitted local networking. No real-engine calibration, ML evaluation, false-alarm assessment, throughput/latency benchmark, load test, or certification was performed. Firefox/Safari and physical mobile/GPU coverage remain future work.

## Reproduction

Follow README setup and run its validation commands with the project virtual environment. Browser tests launch production servers on ports 3000 and 3002; stop other instances first. Node legacy integration temporarily uses port 3001. On Windows set `$env:PYTHON = (Resolve-Path .venv/Scripts/python.exe).Path`. Use `npm ci --ignore-scripts` for the locked JavaScript dependency tree.
