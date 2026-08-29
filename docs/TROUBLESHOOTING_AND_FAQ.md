# Troubleshooting & Frequently Asked Questions (FAQ)

Common questions, troubleshooting steps, and operational insights for CommitIQ.

---

## ❓ Frequently Asked Questions

### 1. How does CommitIQ calculate the repository health score?

The composite health score (0–100) is a weighted, bounded aggregation of 6 signals:

- **Cyclomatic Complexity (30%)**: Scaled via non-linear decay from average McCabe complexity.
- **Churn Volatility (25%)**: Ratio of modified lines to total codebase lines over time.
- **Bus Factor & Ownership (20%)**: Penalizes single-contributor dependencies.
- **Dependency & Co-Change Coupling (10%)**: Measures architectural inter-module sprawl.
- **Semantic Drift (10%)**: Measures cognitive drift in git commit diff distributions.
- **Documentation & Cleanliness (5%)**: Evaluates comment-to-code ratios and structural integrity.

### 2. Can CommitIQ analyze private GitHub repositories?

Yes. When running CommitIQ locally or in your self-hosted cloud environment, provide a GitHub Personal Access Token (PAT) with `repo` read scopes:

```bash
export GITHUB_TOKEN="ghp_yourPersonalAccessToken"
```

### 3. What languages are supported for Cyclomatic Complexity?

CommitIQ uses a hybrid AST and lexical analysis pipeline (integrating **Radon** and **Lizard**), supporting:

- Python, JavaScript, TypeScript, JSX, TSX
- Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin

---

## 🛠️ Troubleshooting Common Issues

### Issue: "SQLite database is locked (`sqlite3.OperationalError`)"

**Cause**: High concurrency during simultaneous repository ingestion jobs competing for SQLite write locks.  
**Resolution**: CommitIQ has built-in transaction retries via `commit_with_retry(session, max_attempts=3)`. For high-throughput enterprise deployments, configure PostgreSQL by setting `DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/commitiq`.

### Issue: "Git clone network timeout"

**Cause**: Very large repository histories (>100,000 commits) on slow network links.  
**Resolution**: Set the `max_commits` parameter (e.g. `max_commits=100` or `max_commits=500`) when requesting repository analysis to perform a bounded, shallow historical walk.

### Issue: "AI Commit Narrative generation fails or falls back to template"

**Cause**: Missing or exhausted `GEMINI_API_KEY` / `ANTHROPIC_API_KEY`.  
**Resolution**: Set a valid Google Gemini API key in your `.env` file (`GEMINI_API_KEY=AIza...`). CommitIQ automatically falls back to an offline deterministic template if an AI provider is unreachable.
