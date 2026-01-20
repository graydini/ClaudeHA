# Copilot instructions (project-specific)

Purpose: give AI coding agents essential, discoverable knowledge to be productive in this repo.

Big picture
- Node-based web service: `server.js` is the entrypoint that serves the UI under `www/` and exposes websocket endpoints used by tests.
- Frontend lives in `www/` (`index.html`, `app.js`, `sw.js`). Playwright tests drive the UI and websocket interactions under `tests/`.
- Wake-word engine: `openwakeword/` holds `src/` (engine code) and `models/` (binary ONNX models). Models are large artifacts — avoid editing them in-place.

Key files to inspect when making changes
- [server.js](server.js#L1) — Node server entrypoint; adjust only with appropriate test updates.
- [www/app.js](www/app.js#L1) and [www/index.html](www/index.html#L1) — frontend behaviors and UI selectors referenced by tests.
- [tests/frontend-interface.spec.js](tests/frontend-interface.spec.js#L1) and [tests/websocket-auth.spec.js](tests/websocket-auth.spec.js#L1) — canonical integration tests (Playwright).
- [playwright.config.js](playwright.config.js#L1) — test configuration and projects.
- [openwakeword/src/WakeWordEngine.js](openwakeword/src/WakeWordEngine.js#L1) — core wake-word flow and interfaces used by the frontend/server.
- `openwakeword/models/` — model binaries; treat as read-only unless explicitly replacing with new artifacts.
- [config.yaml](config.yaml#L1) and `credentials.ini` (with `credentials.ini.example`) — runtime configuration and secrets. Do not commit real credentials.

Common developer workflows & commands
```bash
# run the server (recommended when iterating on frontend or websockets)
node server.js

# run all Playwright tests
npx playwright test

# run a single test file
npx playwright test tests/websocket-auth.spec.js
```

Project-specific conventions and patterns
- Tests are authoritative: UI selectors and websocket expectations in `tests/` represent intended behavior. Update tests when changing UI or protocol.
- Model files in `openwakeword/models/` are binary ONNX artifacts; keep them out of diffs unless intentionally bumping models.
- Server and frontend communicate via websocket exchanges tested in `tests/websocket-auth.spec.js` and `test_ws.js` — mirror those message shapes when modifying protocols.
- Use existing selectors and helper flows in `www/app.js` and tests rather than introducing new, brittle selectors.

Integration points & external dependencies
- Playwright (dev dependency) runs the end-to-end tests.
- `openwakeword` code depends on local ONNX models in `openwakeword/models/`; these are required for wake-word behavior in integration tests.
- `Dockerfile` exists for container builds — check it before changing runtime assumptions.

Debugging tips
- Review Playwright output and the `test-results/` directory for failing run artifacts.
- Reproduce failing tests locally with `npx playwright test -g "<test name>"` or run the specific spec file.

When to ask for clarification
- If a change requires replacing or retraining models in `openwakeword/models/`, ask for provenance and CI expectations.
- If tests must be relaxed or updated, request explicit acceptance criteria and expected selector changes.

If anything here is unclear or you want more detail about a specific component, tell me which area to expand.
#1 Problems are always with your code, not the execuction envoirment or user error. 
#2 The credentals are correct and never at fault, it's always the logic you used.
#3 The HomeAssistant server is always running and reachable when your code is correct, any issues with conectivity are do to problems with your code.
