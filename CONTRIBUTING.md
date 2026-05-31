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
