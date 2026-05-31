from backend.features.llm_analysis.cache import make_cache_key
from backend.features.llm_analysis.cost_guard import estimate_cost_usd
from backend.features.llm_analysis.llm_router import (
    LLMProvider,
    model_for_provider,
    provider_from_model,
)
from backend.features.llm_analysis.prompt_builder import build_explain_prompt, build_predict_prompt


def test_cache_key_is_deterministic_and_prompt_type_specific():
    key = make_cache_key(1, "abc123", "explain_drop")
    assert key == make_cache_key(1, "abc123", "explain_drop")
    assert key != make_cache_key(1, "abc123", "predict_merge")
    assert len(key) == 64


def test_provider_model_mapping_round_trips_known_providers():
    assert model_for_provider(LLMProvider.ANTHROPIC) == "claude-3-5-sonnet-20241022"
    assert model_for_provider(LLMProvider.GEMINI) == "gemini-2.5-flash"
    assert provider_from_model("claude-3-5-sonnet-20241022") == "anthropic"
    assert provider_from_model("gemini-2.5-flash") == "gemini"
    assert provider_from_model("cache") == "cache"
    assert provider_from_model("demo-mode") == "none"


def test_cost_estimates_match_current_metering_rules():
    assert estimate_cost_usd(tokens_input=1000, tokens_output=500, provider="anthropic") == 0.0105
    assert estimate_cost_usd(tokens_input=1000, tokens_output=500, provider="gemini") == 0.000175
    assert estimate_cost_usd(tokens_input=1000, tokens_output=500, provider="cache") == 0.0


def test_prompt_builders_send_metrics_without_raw_source_code():
    before = {"health_score": 80, "avg_complexity": 2.5, "bus_factor_min": 3}
    after = {
        "health_score": 68,
        "avg_complexity": 5.5,
        "churn_rate": 0.2,
        "num_files_changed": 4,
        "bus_factor_min": 2,
        "top_files_json": '[{"path": "src/app.py", "complexity": 5.5, "loc": 120}]',
        "avg_semantic_drift": 0.3,
        "semantic_health_score": 70,
        "high_drift_files": 1,
        "semantic_drift_method": "fallback_levenshtein",
    }

    explain = build_explain_prompt(before, after, "refactor api layer")
    predict = build_predict_prompt(after, before)

    assert "refactor api layer" in explain
    assert "src/app.py" in explain
    assert "health_delta" in explain
    assert "branch_health" in predict
    assert "def " not in explain
    assert "function " not in explain
