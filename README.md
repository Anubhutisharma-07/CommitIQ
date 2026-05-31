# CommitIQ

CommitIQ analyzes a GitHub repository's commit history to show how code health changes over time. It ingests commits, computes complexity, churn, dependency, semantic drift, and bus factor signals, then presents an interactive dashboard with health timelines, graph exploration, hotspot views, and optional Claude or Gemini-generated commit narratives.

## Tech Stack

- FastAPI and Python
- React and Vite
- SQLite
- Claude and Gemini APIs

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

For optional GraphCodeBERT semantic analysis:

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
REPO_STORAGE_PATH=/tmp/commitiq_repos
LLM_MAX_CALLS=25
MAX_COMMITS=150
GITHUB_TOKEN=your_github_token_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Frontend variables live in `frontend/.env`:

```env
VITE_API_BASE_URL=
VITE_DEV_API_PROXY_TARGET=http://127.0.0.1:8000
```

Leave `VITE_API_BASE_URL` blank when the deployed frontend and backend share an origin and the API is mounted at `/api`. Set it only when the browser must call a separate backend origin.
