# Welcome to the CommitIQ Wiki

**CommitIQ** analyzes a repository's commit history and transforms raw git activity into actionable maintainability signals: **code complexity**, **churn rate**, **dependency risk**, **semantic drift**, **ownership concentration (Bus Factor)**, and **AI-generated plain-English commit narratives**.

---

## 🧭 Navigation

| Section                                                    | Description                                                                                 |
| :--------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| **[[Architecture]]**                                       | Deep-dive into backend pipelines, AST parsing, graph calculation, and frontend structure.   |
| **[[Metrics & Formulas\|Metrics-and-Formulas]]**           | Mathematical formulations and thresholds for all 6 core health signals.                     |
| **[[DORA & Cycle Time\|DORA-and-Cycle-Time]]**             | DevOps delivery metrics (Deployment Frequency, Lead Time, CFR, MTTR) and cycle time phases. |
| **[[REST API Reference\|API-Reference]]**                  | Comprehensive OpenAPI REST API endpoints and payload schemas.                               |
| **[[Developer Guide\|Developer-Guide]]**                   | Local development setup, running Pytest & Vitest, and PR governance.                        |
| **[[Deployment & Operations\|Deployment-and-Operations]]** | Vercel deployment, Docker Compose, SQLite vs PostgreSQL, and background cron jobs.          |
| **[[Troubleshooting & FAQ\|Troubleshooting-and-FAQ]]**     | Resolving common errors, concurrency locks, and provider API keys.                          |

---

## ⚡ Quick Start

```bash
# 1. Clone repo
git clone https://github.com/eshaanag/CommitIQ.git
cd CommitIQ

# 2. Run backend
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements-dev.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# 3. Run frontend (in a second terminal)
cd frontend
npm install && npm run dev
```

Visit `http://localhost:5173` to explore the interactive dashboard!
