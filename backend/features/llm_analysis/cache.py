import hashlib


def make_cache_key(repo_id: int, full_sha: str, prompt_type: str) -> str:
    """SHA256 of (repo_id:full_sha:prompt_type) — deterministic, collision-free."""
    raw = f"{repo_id}:{full_sha}:{prompt_type}"
    return hashlib.sha256(raw.encode()).hexdigest()
