# CommitIQ

[![CI](https://github.com/eshaanag/CommitIQ---/actions/workflows/ci.yml/badge.svg)](https://github.com/eshaanag/CommitIQ---/actions/workflows/ci.yml)

CommitIQ analyzes a GitHub repository's commit history to show how code health changes over time. It ingests commits, computes complexity, churn, dependency, semantic drift, and bus factor signals, then presents an interactive dashboard with health timelines, graph exploration, hotspot views, and optional Claude or Gemini-generated commit narratives.

## Features

- GitHub repository ingestion with bounded commit analysis.
- Health timeline based on complexity, churn, dependency, semantic, and ownership signals.
- Import and co-change graph exploration for architectural risk.
- Hotspot and bus-factor views for maintainability and ownership risk.
- Optional Claude/Gemini narrative generation with cache and budget controls.
- Ingestion progress streaming with cancellation support.
- Light/dark React dashboard built with Vite, SWR, Recharts, and force graph tooling.

## Tech Stack

- Backend: FastAPI, SQLAlchemy async ORM, SQLite by default, optional Postgres.
- Analysis: GitPython, git subprocesses, radon, lizard, custom graph and ownership analysis.
- Semantic drift: lightweight difflib fallback by default, optional GraphCodeBERT.
- LLMs: Anthropic Claude first, Google Gemini fallback.
- Frontend: React, TypeScript, Vite, SWR, Recharts, react-force-graph-2d.

## Repository Structure

```text
backend/      FastAPI app, ingestion, metrics, LLM, database models, tests
frontend/     React dashboard, route/component tests, Vite config
migrations/   SQL migration runner documentation
docs/         Product and engineering design notes
.github/      CI workflow, issue templates, pull request template
```

## Prerequisites

- Python 3.11 or newer
- Node.js 18 or newer
- Git
- Optional API keys for Anthropic Claude, Google Gemini, and GitHub

## Run Locally

1. Clone the repository:

```bash
git clone https://github.com/eshaanag/CommitIQ---.git
cd CommitIQ---
```

2. Create an environment file:

```bash
cp .env.example .env
```

Update `.env` with your local values. For SQLite, use a SQLAlchemy async URL such as `sqlite+aiosqlite:///./commitiq.db`.

3. Install backend dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

Semantic drift uses a lightweight difflib fallback by default. For optional
GraphCodeBERT embeddings, install the ML extras and set `ENABLE_GRAPHCODEBERT=true`:

```bash
pip install -r backend/requirements-ml.txt
```

4. Run the backend:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

5. Install frontend dependencies and run Vite:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` by default. In local development, Vite proxies `/api` requests when `VITE_DEV_API_PROXY_TARGET` is set in `frontend/.env`.

## Environment Variables

```env
DATABASE_URL=your_database_url_here
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

Set `ENVIRONMENT=production` in deployed environments and provide the exact browser origins allowed to call the API in `CORS_ORIGINS`.
Set `ENABLE_SEMANTIC_ANALYSIS=false` to disable semantic drift entirely. Keep
`ENABLE_GRAPHCODEBERT=false` unless the ML dependencies are installed and model
downloads/caching are intentional.

Frontend variables live in `frontend/.env`:

```env
VITE_API_BASE_URL=
VITE_DEV_API_PROXY_TARGET=http://127.0.0.1:8000
```

Leave `VITE_API_BASE_URL` blank when the deployed frontend and backend share an origin and the API is mounted at `/api`. Set it only when the browser must call a separate backend origin.

## Quality Gates

Run these before opening a pull request:

```bash
python -m pytest
cd frontend
npm run test
npm run lint
npm run build
npm audit --audit-level=moderate
```

CI runs backend tests and frontend tests/lint/build on pushes to `main` and pull requests.
Repository governance checks also run on pushes and pull requests to reject merge
conflict markers, obvious secrets, and debug output in production code. Pull
requests additionally validate conventional PR titles, require a PR body, and
require `PROJECT_BRAIN.md` updates for source, migration, package, or workflow
changes.

## Documentation

- [PROJECT_BRAIN.md](PROJECT_BRAIN.md) tracks architecture, decisions, current risks, test status, and improvement history.
- [docs/REPO_HEALTH_METRICS.md](docs/REPO_HEALTH_METRICS.md) outlines deeper repo-health metrics planned for future product versions.
- [CONTRIBUTING.md](CONTRIBUTING.md) explains local setup, expectations, and pull request checks.
- [SECURITY.md](SECURITY.md) explains vulnerability reporting and operator security notes.

## Roadmap

Near-term priorities:

- Add a real-browser landing-to-dashboard e2e test.
- Tighten backend dependency reproducibility.
- Add a fixture-backed instant demo path.
- Improve deployment packaging and health checks.
- Deepen health scoring with risk reasons, hotspot persistence, ownership entropy, coupling surprise, blast radius, and cycle severity.
