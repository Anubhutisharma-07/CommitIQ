# Developer Guide & Contributing Standards

This guide covers local environment setup, architectural design patterns, testing strategies, and governance standards for contributing to CommitIQ.

---

## 🏗️ Architecture & Philosophy

CommitIQ is designed with a high standard of maintainability and resilience:

1. **Production-First Integrity**: No fake links, dummy placeholders, or mocked test shortcuts in production code.
2. **Resilient Dependency Architecture**: Optional libraries (such as `reportlab` for PDF generation, `redis` for caching, and `pybreaker` for circuit breaking) must be safely handled via import guards (`try/except ImportError`).
3. **Strict CI/CD Gates**: Every change must pass Pytest, Vitest, ESLint, Prettier, CodeQL Security Analysis, and FreshstartCI.

---

## 💻 Local Environment Setup

### Prerequisites

- **Python**: 3.11+
- **Node.js**: 20+ & `npm`
- **Git**: with support for modern CLI operations

### 1. Backend Setup

```bash
# From workspace root:
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements-dev.txt

# Run backend API server:
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
# From frontend directory:
cd frontend
npm install

# Run frontend development server:
npm run dev
```

---

## 🧪 Verification & Testing Commands

Before submitting a Pull Request, run the full verification battery locally:

### 1. Backend Tests & Coverage

```bash
cd backend
python -m pytest --cov=backend
```

### 2. Frontend Tests & Component Coverage

```bash
cd frontend
npm run test
```

### 3. Frontend Linting & Typecheck

```bash
cd frontend
npm run lint
npm run build
```

### 4. Code Formatting Verification

```bash
npx prettier --check .
npx prettier --write .
```

---

## 📝 Commit Conventions

Commit messages must follow standard Conventional Commits:

- `feat(...)`: New features and dashboard capabilities
- `fix(...)`: Bug fixes and regression repairs
- `perf(...)`: Performance optimizations and caching
- `docs(...)`: Documentation updates
- `refactor(...)`: Code changes that neither fix a bug nor add a feature
- `test(...)`: Adding or updating test suites
- `chore(...)`: Maintenance, dependency updates, and CI configs

---

## 🔄 Pull Request Workflow

1. Create a descriptive feature branch: `git checkout -b feat/my-new-feature`.
2. Implement your changes along with corresponding unit tests.
3. Update `PROJECT_BRAIN.md` with an entry documenting your addition.
4. Run `npx prettier --write .` and execute local test suites.
5. Push your branch and open a Pull Request against `main`.
