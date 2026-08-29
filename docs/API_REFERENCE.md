# REST API Reference

CommitIQ exposes a complete, high-performance RESTful API built on **FastAPI** with asynchronous SQLAlchemy database execution.

---

## 🌐 Base URL & Interactive Docs

- **Local Development**: `http://localhost:8000/api`
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 📌 Repositories API

### 1. Ingest / Register Repository

Initiates asynchronous repository cloning, commit walking, code complexity calculation, and graph indexing.

```http
POST /api/repos
Content-Type: application/json

{
  "repo_url": "https://github.com/owner/repository",
  "max_commits": 100,
  "default_branch": "main",
  "exclude_merges": true
}
```

#### Response (`202 Accepted`)

```json
{
  "id": 1,
  "name": "repository",
  "repo_slug": "owner/repository",
  "status": "processing",
  "default_branch": "main",
  "created_at": "2026-08-28T12:00:00Z"
}
```

---

### 2. Stream Ingestion Progress (SSE)

Real-time Server-Sent Events stream delivering progress stages during repository analysis.

```http
GET /api/repos/{repo_id}/progress
Accept: text/event-stream
```

#### SSE Stream Events

```json
data: {"status": "cloning", "progress": 25, "message": "Cloning git repository..."}
data: {"status": "analyzing", "progress": 60, "message": "Computing cyclomatic complexity..."}
data: {"status": "ready", "progress": 100, "message": "Analysis complete."}
```

---

### 3. Get Repository Health Timeline

Fetches chronological commit health records including composite health scores, churn, complexity, and ownership signals.

```http
GET /api/repos/{repo_id}/timeline?start_date=2026-08-01T00:00:00Z&end_date=2026-08-28T23:59:59Z
```

#### Response (`200 OK`)

```json
[
  {
    "id": 101,
    "sha": "a1b2c3d",
    "full_sha": "a1b2c3d4e5f6789012345678901234567890abcd",
    "committed_at": "2026-08-28T10:15:00Z",
    "author_name": "Developer Name",
    "message": "feat: integrate caching layer",
    "health_score": 88,
    "churn_rate": 0.04,
    "complexity_avg": 4.2,
    "bus_factor_min": 2,
    "semantic_drift": 0.12,
    "dependency_risk": 0.18
  }
]
```

---

### 4. Get Architectural Dependency Graph

Retrieves module nodes, imports, and co-change coupling edges computed across the repository tree.

```http
GET /api/repos/{repo_id}/graph
```

#### Response (`200 OK`)

```json
{
  "nodes": [
    {
      "id": "backend/main.py",
      "name": "main.py",
      "type": "file",
      "complexity": 5,
      "churn": 12,
      "page_rank": 0.082
    }
  ],
  "links": [
    {
      "source": "backend/main.py",
      "target": "backend/database.py",
      "coupling_strength": 0.85
    }
  ]
}
```

---

### 5. Get Hotspot Maintainability Matrix

Identifies high-complexity, high-churn files representing architectural risk zones.

```http
GET /api/repos/{repo_id}/hotspots?limit=20&offset=0
```

#### Response (`200 OK`)

```json
{
  "total": 1,
  "hotspots": [
    {
      "file_path": "backend/features/repo_ingestion/commit_walker.py",
      "complexity": 18,
      "churn": 45,
      "risk_score": 82.5,
      "risk_level": "High",
      "top_contributor": "eshaanag",
      "contributor_count": 2
    }
  ]
}
```

---

### 6. Get Bus Factor & Ownership Concentration

Retrieves ownership distribution and identifies single-point-of-failure files.

```http
GET /api/repos/{repo_id}/bus-factor
```

---

### 7. Export Unified Health Report (PDF)

Generates an executive-ready PDF report containing DORA metrics, Cycle Time charts, Hotspots, and Team Health signals.

```http
GET /api/repos/{repo_id}/report
Accept: application/pdf
```

---

### 8. Side-by-Side Codebase Comparison

Compares health, complexity, and maintainability metrics across two distinct repositories.

```http
GET /api/compare?base_slug=owner/repo1&target_slug=owner/repo2
```

---

### 9. AI Commit Narrative Stream

Generates plain-English architectural summaries of codebase changes via Anthropic Claude or Google Gemini fallback.

```http
POST /api/llm/narrative
Content-Type: application/json

{
  "repo_id": 1,
  "commit_sha": "a1b2c3d",
  "diff_text": "..."
}
```
