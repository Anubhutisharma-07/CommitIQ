# PROJECT BRAIN

## What this project is
CommitIQ is a full-stack repository health analyzer for GitHub projects. It ingests commit history, computes complexity/churn/dependency/semantic/bus-factor signals, stores snapshots in SQLite or Postgres, and presents an interactive React dashboard with optional LLM-generated commit narratives.

## Tech stack
- Backend: Python 3.11+, FastAPI, SQLAlchemy async ORM, SQLite via aiosqlite by default, optional Postgres via asyncpg.
- Repository analysis: GitPython, git subprocess calls, radon for Python complexity, lizard for JS/TS/Java/Go/C/C++ metrics, custom import/co-change graph extraction, git blame for bus factor.
- Semantic analysis: optional GraphCodeBERT via transformers and torch, with difflib fallback.
- LLM layer: Anthropic Claude first, Google Gemini fallback, persisted narrative cache and per-repo cost/call guard.
- Frontend: React 18, TypeScript, Vite, SWR, axios, Recharts, react-force-graph-2d, d3-force, lucide-react, Tailwind CSS-style utility classes plus custom CSS tokens.
- Deployment/config: `.env.example` only; no Dockerfile, CI, lockfiles, or deployment manifests are checked in.

## Architecture overview
- `backend/main.py` creates the FastAPI app, initializes database schema on lifespan startup, configures CORS, and mounts repo ingestion plus LLM routers under `/api`.
- `backend/config.py` loads environment variables, normalizes database URLs, creates repo storage, and exposes operational settings.
- `backend/shared/models.py` defines repos, commits, health snapshots, graph nodes/edges, bus factor rows, LLM narratives, and ingestion jobs.
- Repo ingestion starts at `POST /api/repos/ingest`, validates a GitHub URL, creates/updates a `Repo` and `AnalysisJob`, then runs `run_ingestion` as a FastAPI background task.
- Ingestion clones a shallow single-branch repo, walks commits oldest-to-newest, checks out each commit, extracts file metrics and semantic drift, builds import and co-change graph rows, computes health snapshots, computes bus factor at HEAD, and marks the repo ready/error.
- The frontend entry is `frontend/src/App.tsx`, with routes for landing, ingestion progress, dashboard, commit detail, demo redirect, and 404.
- Frontend data flow uses `frontend/src/lib/api.ts` for REST/SSE/fetch calls and SWR in dashboard/detail views. The landing page starts ingestion; the analyze page streams job progress; dashboard and detail pages read persisted snapshots/graphs/narratives.
- LLM narratives are requested on demand from `NarrativeCard`, streamed over `/api/explain/stream`, cached in `llm_narratives`, and summarized in the cost meter.

## Current state assessment
Working well:
- Clear product concept with a coherent end-to-end flow: enter GitHub repo, ingest, view health timeline, inspect commit graph, review hotspots/bus-factor, generate narratives.
- Backend has structured schemas/models and separates ingestion, analysis, graph, bus factor, semantic, and LLM concerns.
- LLM cost guard and cache are already part of the domain model, which is the right production instinct.
- The UI has loading/error/empty states in many places and exposes high-value analysis concepts rather than raw tables only.

Incomplete or fragile:
- There are no checked-in tests, no test runner config, no frontend lockfile, no backend lockfile, and no CI quality gate.
- The database migration hook exists, but no `migrations/` directory is present. Startup relies mostly on `Base.metadata.create_all`, which cannot safely evolve existing schemas.
- Backend ingestion performs long CPU/disk/network work inside FastAPI `BackgroundTasks`; this is fragile for restarts, concurrency, cancellation, and production scaling.
- Graph and health metrics are often based only on files changed in each commit, not a stable whole-repo snapshot, so dashboard labels can overstate "codebase" health.
- Some frontend classes reference Tailwind tokens not defined in the local Tailwind config because there is no Tailwind config checked in.
- Demo flow expects preseeded `facebook-react` data, but no seed command or seed data exists.

## User flows (as-is)
- New analysis: user opens `/`, enters a GitHub URL or `owner/repo`, optionally sets max commits, submits, then lands on `/analyze?repo_id=...`.
- Ingestion progress: `/analyze` opens an EventSource to `/api/repos/ingest/progress/{repo_id}`, displays clone/analyze/bus-factor/finalize progress, then redirects to `/dashboard/{repo_slug}` when ready.
- Dashboard: user views latest health score, commit timeline, recent commit list, selected commit metrics, graph explorer, bus factor table, hotspot map, and LLM cost meter.
- Commit selection: user can select commits from the timeline/list or step through graph playback. Commit detail route shows metadata, metrics, graph, structural diff vs previous commit, and narrative controls.
- Narrative generation: user clicks the narrative card, frontend streams generated chunks, then displays provider/cache/cost metadata.
- Demo: `/demo` attempts to load `facebook-react`; if absent, it shows an error and asks for an undocumented seed command.

## Identified problems (root causes, not symptoms)
- Missing verification foundation: no unit/integration/e2e tests means changes to parsers, scoring, ingestion, or UI flows cannot be made safely.
- Missing dependency reproducibility: no `package-lock.json`, `requirements` pins, or lock tooling means installs can drift and break builds.
- No production ingestion boundary: FastAPI background tasks are not a durable job system. Long repo analysis should not be tied to a web worker process lifecycle.
- Schema evolution gap: create-all plus absent migrations hides incompatible model changes until existing deployments break.
- Metric contract ambiguity: names like "codebase health" are presented broadly, but many calculations operate on commit-touched files and shallow clone data.
- Semantic analysis default risk: `ENABLE_SEMANTIC_ANALYSIS` defaults to true, which can trigger large model downloads/imports unless optional ML dependencies and cache strategy are deliberately configured.
- Security/abuse surface: ingestion clones arbitrary public GitHub repositories and runs git commands over repo contents; URL validation and max-commit caps are now stronger, but storage quotas, concurrency controls, and operational limits still need hardening.
- API/base URL fragility: frontend defaults to `http://localhost:8000`; acceptable locally but needs environment-driven deployment config and documented production behavior.
- UI maintainability drift: many custom Tailwind classes depend on missing theme configuration and heavy one-off styling, making visual regressions likely.

## Discovered issues
- Critical: zero tests exist across backend and frontend.
- Critical: frontend still lacks route-level/e2e coverage, though focused Vitest coverage now exists for health utilities, `HealthBadge`, and narrative stream parsing.
- High: no deployment health gate; CI now exists for tests/lint/build.
- High: npm audit reports 9 frontend dependency vulnerabilities after lockfile generation.
- High: no migration files despite migration-aware database code.
- High: demo route references seeded data that the repo does not provide.
- Medium: production frontend bundle is about 919 kB minified, triggering the configured Vite chunk warning.
- Medium: backend startup uses `print` in database initialization instead of structured logging.
- Medium: default CORS allows several localhost origins only; production CORS must be explicit.
- Medium: LLM usage summary counts persisted narratives, not runtime cache-hit events; cache hit metrics are therefore misleading.
- Medium: shallow clone plus per-commit checkout can fail or produce incomplete stats around boundary commits and deleted/renamed files.

## Feature analysis
Exists:
- GitHub URL ingestion, shallow clone, commit walk, metric extraction, health scoring, dependency/co-change graph storage, bus-factor table, hot spot map, timeline, graph explorer, commit detail, LLM narratives, cost meter, dark/light theme toggle.

Half-done:
- Demo mode exists as a route and LLM fallback concept but lacks seed data/scripts and a complete no-backend demo experience.
- Migration support exists as code but lacks migration assets and a revision process.
- Semantic drift is implemented but optional dependency/runtime behavior is not productionized.
- Structural graph diff exists but uses separate visual language from the rest of the UI and likely relies on undefined design tokens.
- LLM cache exists but usage reporting does not distinguish ordinary cached reads accurately.

Missing but obviously needed:
- Test infrastructure and focused tests for URL parsing, cache keys, cost guard, scoring, graph import resolution, bus-factor classification, API validation, and frontend ingest/dashboard flows.
- Lockfiles or pinned dependency management.
- CI running backend tests, frontend typecheck/build/lint, and secret/debug scans.
- Durable job processing or at least safer ingestion state management with cancellation/retry.
- Documented seed/demo path.
- Production deployment configuration and environment docs.

## Improvement plan (prioritised)
1. Establish verification baseline: add backend pytest setup, frontend test setup, and smoke checks for core user/API flows. This matters because every meaningful improvement touches scoring, ingestion, or UI behavior.
2. Make builds reproducible: add frontend lockfile and tighten Python dependency strategy enough for deterministic local/CI installs.
3. Fix immediate correctness bugs in low-risk pure logic: URL parsing parity, cache/usage accounting, health scoring edge cases, graph import resolution, and bus-factor risk classification.
4. Add backend API/integration tests around ingestion-adjacent endpoints using database fixtures and isolated temp storage.
5. Add frontend smoke tests for landing validation, progress/error rendering, dashboard empty/loading/error states, and narrative streaming parser behavior.
6. Create a documented demo seed path or replace `/demo` with a reliable static/local fixture flow.
7. Introduce migrations or a documented schema bootstrap/evolution strategy.
8. Harden ingestion limits: max commit clamp, storage cleanup guarantees, better subprocess logging, safer concurrency, and clearer failure codes.
9. Improve deployment readiness: CI workflow, environment docs, production CORS/API base config, no production debug output.
10. Revisit ingestion architecture for durable jobs once baseline tests protect current behavior.

## Decisions log
- 2026-05-31: Read the entire tracked codebase and project config before feature work, per requested process.
- 2026-05-31: Treated `PROJECT_BRAIN.md` as the first required artifact and did not edit source code before creating it.
- 2026-05-31: Prioritized test infrastructure and reproducibility ahead of feature additions because the project currently has no safe change boundary.
- 2026-05-31: Added a "Discovered issues" section because critical production-readiness gaps were found during the audit.
- 2026-05-31: Added backend pytest infrastructure before broader feature work, because pure parser/scoring/LLM helpers are the safest first regression boundary.
- 2026-05-31: Hardened GitHub URL validation after tests exposed that non-GitHub HTTPS URLs and `.`/`..` path segments could pass low-level parsing.
- 2026-05-31: Generated and committed the frontend npm lockfile to make installs reproducible before adding more frontend testing or dependency changes.
- 2026-05-31: Added ESLint 9 flat config and typed graph explorer integration points instead of weakening `no-explicit-any`, so `npm run lint` is now a usable gate.
- 2026-05-31: Added Vitest with jsdom and focused frontend smoke tests for health display logic and SSE narrative parsing; deferred route/e2e coverage to the next testing increment.
- 2026-05-31: Added GitHub Actions CI to run backend pytest and frontend npm ci/test/lint/build on pushes to `main` and pull requests.
- 2026-05-31: Capped `IngestRequest.max_commits` at the configured backend maximum and exposed the 500-commit UI max to prevent accidental oversized ingestion jobs.
- 2026-05-31: Added backend database-backed endpoint coverage for repo listing, lookup, timeline, graph, bus factor, usage, and commit detail payloads.
- 2026-05-31: Moved the heavy metrics extractor import into `run_ingestion` so read-only API route imports do not require analysis dependencies such as `lizard` unless ingestion actually runs.
- 2026-05-31: Added landing-page route smoke coverage for invalid repo input, shorthand submission normalization, full GitHub URL normalization, and commit-limit submission.

## Test coverage status
- Backend unit tests: initial pure-logic coverage exists for repo URL parsing/validation, max-commit cap validation, slug generation, import extraction/resolution, bus-factor file filtering, health snapshot aggregation, LLM cache keys, provider mapping, cost estimation, and prompt builders.
- Backend integration/API tests: database-backed coverage exists for repo listing/lookup, timeline payloads, graph payloads, bus factor payloads, LLM usage payloads, and commit detail composition.
- Frontend unit/component tests: Vitest coverage exists for health status/formatting helpers, `HealthBadge`, and `streamNarrative` success/error parsing.
- Frontend route/smoke tests: landing-page repository validation and submission flow coverage exists with mocked API calls.
- Local quality gates: `python -m pytest`, `npm run test`, `npm run lint`, and `npm run build` pass as of 2026-05-31. `npm run test` emits Vite React plugin deprecation warnings; `npm run build` still emits a chunk-size warning.
- CI quality gates: GitHub Actions workflow exists for backend tests and frontend tests/lint/build.
- Must be tested before shipping: GitHub URL parsing, repo slug generation, cache key generation, cost guard behavior, health scoring, semantic fallback behavior, graph import/co-change generation, bus-factor risk levels, ingestion progress SSE payloads, timeline/graph API responses, narrative streaming parser, and landing/analyze/dashboard user flows.

## Commit log summary
- `1132a0d` docs: initial PROJECT_BRAIN.md — full codebase understanding. Added the required living project understanding document before feature work.
- `e2fc631` test: add backend logic coverage and harden repo URL validation. Established pytest configuration/dev requirements, added 19 backend pure-logic tests, and fixed URL validation gaps those tests exposed.
- `d1e0cef` docs: update project brain after backend test baseline. Recorded the backend test baseline and parser-hardening decision.
- `aa471ab` chore: make frontend builds reproducible and enforce lint. Added `package-lock.json`, ESLint flat config, and graph explorer type cleanup so lint/build are actionable.
- `c089461` docs: update project brain after frontend quality gate. Recorded the frontend lockfile/lint/build baseline and remaining audit/bundle risks.
- `4f5940b` test: add frontend smoke coverage for dashboard utilities. Added Vitest/jsdom setup and 7 frontend tests around health utilities, `HealthBadge`, and narrative stream parsing.
- `00a4c17` docs: update project brain after frontend tests. Recorded the frontend test baseline and current local gate status.
- `40d4663` ci: run backend and frontend quality gates. Added GitHub Actions for backend pytest and frontend npm ci/test/lint/build on pushes and pull requests.
- `d840474` docs: update project brain after ci setup. Recorded the CI workflow and updated quality-gate status.
- `6fb83c3` fix: cap ingestion commit limits to protect analysis jobs. Enforced the configured max commit cap in backend validation, added regression coverage, and reflected the limit in the landing form.
- `b049e64` docs: update project brain after ingestion cap. Recorded the ingestion cap hardening and updated test coverage notes.
- `4b3ee64` test: cover backend repository data endpoints. Added database-backed endpoint coverage and deferred heavy metrics imports until ingestion execution.
- `18be60f` docs: update project brain after backend endpoint tests. Recorded backend endpoint coverage and the read-only route import-boundary decision.
- `e625d54` test: cover landing repository submission flow. Added landing-page smoke tests and shared Testing Library cleanup for Vitest.
