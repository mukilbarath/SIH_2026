# Contributing to SIH 2026

Thank you for contributing to the SIH 2026 Digital Twin Core project.

## Team access

Repository administrators should add team members as GitHub collaborators or through a GitHub team. Grant the least privilege needed for each role.

Recommended roles:

- **Maintain/Admin:** project leads and repository maintainers.
- **Write:** active developers who create branches and pull requests.
- **Triage/Read:** reviewers, testers, and documentation contributors.

## Development workflow

1. Create an issue or agree on the task with the team.
2. Create a focused branch from `main`.
3. Make the change and update related documentation.
4. Run the validation commands.
5. Open a pull request for review.
6. Merge only after the required reviewers approve the change.

Example branch names:

```text
feat/fault-alerts
fix/websocket-reconnect
docs/setup-guide
```

## Code guidelines

### TypeScript and React

- Prefer typed props and state for new code.
- Keep reusable UI in `components/`.
- Keep page-level orchestration in `app/`.
- Clean up WebSocket listeners and timers when components unmount.
- Follow the existing CSS Module and global style conventions.

### Python

- Preserve the asynchronous 10 Hz simulation loop unless intentionally changing it.
- Handle missing or malformed CSV values safely.
- Document changes to simulation behavior and telemetry fields.
- Avoid blocking operations inside the engine loop.

### Telemetry changes

When changing a telemetry field:

1. Update the producer.
2. Update all frontend consumers.
3. Update `README.md` and `docs/ARCHITECTURE.md`.
4. Test physics and CSV replay modes.

## Validation

Run before opening a pull request:

```bash
npm run lint
npm run build
npm run typecheck
npm test
python -m unittest discover -s tests -p 'test_*.py' -v
python scripts/validate_datasets.py --check
npm audit --omit=dev --audit-level=high
npx playwright install chromium
npm run test:e2e
```

For UI changes, include screenshots or a short recording in the pull request.

## Commit messages

Use short, imperative messages:

```text
Add fault severity indicator
Fix WebSocket connection cleanup
Document telemetry replay modes
```

Do not commit credentials, `.env` files, generated build output, or unrelated large files.

## Pull request checklist

- [ ] The change has a clear description.
- [ ] Related documentation is updated.
- [ ] Validation commands were run.
- [ ] UI changes include screenshots or recordings.
- [ ] Telemetry/schema changes are documented.
- [ ] No secrets or generated files are included.
- [ ] At least one team member reviewed the change.

Use Node 24 and the project Python virtual environment. Browser checks start their own servers; stop manual servers first. Set PYTHON to the environment executable if it is not activated. Consult docs/VALIDATION.md for evidence and known gaps. Do not imply source labels are inferred faults or the illustrative counter is calibrated RUL.
