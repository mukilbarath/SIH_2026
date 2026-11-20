# Security

This is an unauthenticated local simulation. Both telemetry services bind to loopback; the Python service rejects non-loopback configuration. Allowed browser origins are exact matches. Missing origins are rejected. Native clients can forge Origin, so this is not authentication.

Do not expose the app or telemetry service through a public interface or tunnel without a separately reviewed design for identity, authorization, TLS, rate limits and isolation. Every connected client can change shared simulation state. No actual aircraft should be attached.

Commands are schema/range checked before mutation, oversized frames are rejected, and the dashboard validates incoming telemetry. CSV export escapes quoted fields and neutralizes leading spreadsheet formula characters. `.env` files, virtual environments and generated test outputs are ignored.

Run `npm audit` and review the full report, plus `npm audit --omit=dev --audit-level=high` as the runtime gate. Review Dependabot updates through tests and pull requests; do not force-install incompatible dependencies merely to suppress advisories. Current observations are recorded in docs/VALIDATION.md.

Report suspected vulnerabilities privately to repository maintainers using GitHub private vulnerability reporting if enabled; otherwise arrange a private channel. Do not include credentials or exploit details in public issues.
