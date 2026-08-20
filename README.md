# CommitIQ

[![CI](https://github.com/Myparadox-creator/CommitIQ---/actions/workflows/ci.yml/badge.svg)](https://github.com/Myparadox-creator/CommitIQ---/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Repository health intelligence for GitHub projects.

CommitIQ analyzes a repository's commit history and turns raw engineering activity into maintainability signals: complexity, churn, dependency risk, semantic drift, ownership concentration, bus factor, and AI-generated commit narratives.

## Why It Exists

Most GitHub dashboards show activity. CommitIQ focuses on code health.

It helps developers and maintainers answer questions like:

- Which files are becoming risky over time?
- Where is churn hiding architectural debt?
- Which parts of the repo depend too heavily on one contributor?
- What changed across a period of commits, in plain English?
- Which hotspots deserve review before the next release?

## Demo

Live app: https://commit-iq-iota.vercel.app

## Features

- GitHub repository ingestion with bounded commit analysis.
- Health timelines built from complexity, churn, dependency, semantic, and ownership signals.
- Import and co-change graph exploration for architectural risk discovery.
- Hotspot and bus-factor views for maintainability and ownership risk.
- Optional Claude/Gemini-generated narratives with cache, budget controls, and demo fallback when provider keys are not configured.
- Streaming ingestion progress with cancellation support.
- Light/dark React dashboard with Vite, SWR, Recharts, and force graph tooling.
- CI coverage for backend tests, frontend tests, linting, builds, and repository hygiene checks.

## Tech Stack

| Area           | Stack                                                                           |
| -------------- | ------------------------------------------------------------------------------- |
| Backend        | FastAPI, SQLAlchemy async ORM, SQLite by default, optional Postgres             |
| Analysis       | GitPython, git subprocesses, radon, lizard, custom graph and ownership analysis |
| Semantic drift | difflib fallback, optional GraphCodeBERT                                        |
| LLM layer      | Anthropic Claude, Google Gemini fallback                                        |
| Frontend       | React, TypeScript, Vite, SWR, Recharts, react-force-graph-2d                    |
| Quality        | pytest, Vitest, ESLint, CI, secret/conflict/debug-output guards                 |

## Repository Structure

```text
backend/      FastAPI app, ingestion, metrics, LLM layer, database models, tests
frontend/     React dashboard, routes, components, tests, Vite config
migrations/   SQL migration runner documentation
docs/         Product and engineering design notes
.github/      CI workflow, issue templates, pull request template
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- Git
- Optional API keys for Anthropic Claude, Google Gemini, and GitHub

## Run Locally

Clone the repository:

```bash
git clone https://github.com/Myparadox-creator/CommitIQ---.git
cd CommitIQ---
```

Create the backend environment file:

```bash
cp .env.example .env
```

For local SQLite, use a SQLAlchemy async URL such as:

```env
DATABASE_URL=sqlite+aiosqlite:///./commitiq.db
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
REPO_STORAGE_PATH=/tmp/commitiq_repos
LLM_MAX_CALLS=25
MAX_COMMITS=150
ENABLE_SEMANTIC_ANALYSIS=true
ENABLE_GRAPHCODEBERT=false
GITHUB_TOKEN=your_github_token_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Install and run the backend:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Install and run the frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` by default. In local development, Vite can proxy `/api` requests when `VITE_DEV_API_PROXY_TARGET` is set in `frontend/.env`:

```env
VITE_API_BASE_URL=
VITE_DEV_API_PROXY_TARGET=http://127.0.0.1:8000
```

## Quality Gates

Run these before opening a pull request:

```bash
python -m pytest
cd frontend
npm run test
npx playwright install chromium
npm run test:e2e
npm run lint
npm run build
npm audit --audit-level=moderate
```

CI also checks for merge conflict markers, obvious secrets, debug output in production code, conventional pull request titles, pull request bodies, and required `PROJECT_BRAIN.md` updates for source, migration, package, or workflow changes.

## Documentation

- [PROJECT_BRAIN.md](PROJECT_BRAIN.md) tracks architecture, decisions, risks, test status, and improvement history.
- [docs/REPO_HEALTH_METRICS.md](docs/REPO_HEALTH_METRICS.md) explains planned and implemented health signals.
- [CONTRIBUTING.md](CONTRIBUTING.md) covers setup, expectations, and pull request checks.
- [SECURITY.md](SECURITY.md) covers vulnerability reporting and operator security notes.

## Roadmap

- Add a browser-level landing-to-dashboard E2E test.
- Tighten backend dependency reproducibility.
- Add a fixture-backed instant demo path.
- Improve deployment packaging and health checks.
- Deepen health scoring with risk reasons, hotspot persistence, ownership entropy, coupling surprise, blast radius, and cycle severity.

## License

This project is licensed under the [MIT](LICENSE) License.
