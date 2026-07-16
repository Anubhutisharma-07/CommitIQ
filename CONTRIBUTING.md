# Contributing

Thanks for improving CommitIQ. This project is still early, so contributions should favor correctness, observability, and test coverage over broad feature surface.

## Development Setup

Backend:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements-dev.txt
python -m pytest
```

Frontend:

```bash
cd frontend
npm ci
npm run test
npx playwright install chromium
npm run test:e2e
npm run lint
npm run build
```

## Change Expectations

- Keep changes focused to one behavior or concern.
- Add or update tests alongside code changes.
- Update `PROJECT_BRAIN.md` when a change affects architecture, product direction, risks, tests, or operational behavior.
- Do not commit secrets, local databases, generated build output, or cloned repository storage.
- Prefer small, readable fixes over broad refactors unless the refactor directly reduces risk.

## Pull Request Checklist

- [ ] Backend tests pass with `python -m pytest`
- [ ] Frontend tests pass with `npm run test`
- [ ] Frontend e2e tests pass with `npm run test:e2e`
- [ ] Frontend lint passes with `npm run lint`
- [ ] Frontend build passes with `npm run build`
- [ ] New behavior has tests
- [ ] `PROJECT_BRAIN.md` is current
- [ ] No hardcoded secrets, credentials, localhost-only production URLs, or debug output were added

## Commit Style

Use conventional commit prefixes:

- `feat:` for user-visible features
- `fix:` for bug fixes
- `test:` for test coverage
- `docs:` for documentation
- `refactor:` for behavior-preserving restructuring
- `chore:` for tooling and dependency maintenance

## Contribution limits (anti-spam policy)

To keep review quality high and prevent low-effort/farmed contributions, we enforce:

- **Max 3 open pull requests** per contributor at a time.
- **Max 5 open issues** per contributor at a time.
- **Max 6 items (PRs + issues combined)** opened by one person within a rolling 24-hour window.

If you exceed these limits, new PRs/issues will be automatically closed with a comment
explaining why, and labeled `rate-limited`. This isn't personal — please get your existing
open items reviewed and merged first, then open new ones.

We also expect:
- One issue per distinct bug/feature — no duplicate or vague issues opened just to later "resolve" them.
- PRs should be scoped, tested, and pass CI (`Auto Format`, `CI / Backend Tests`, `CI / Frontend Tests`) before requesting review.
