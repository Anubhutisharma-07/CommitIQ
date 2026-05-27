import json


def assign_health_color(avg_complexity: float) -> str:
    if avg_complexity <= 5:
        return "green"
    if avg_complexity <= 10:
        return "yellow"
    if avg_complexity <= 20:
        return "orange"
    return "red"


def build_top_files_json(
    files_list: list[str],
    file_metrics_map: dict,
    max_files: int = 5,
) -> str:
    ranked = sorted(
        (
            {
                "path": fpath,
                "complexity": file_metrics_map.get(fpath, {}).get("avg_complexity", 0.0),
                "loc": file_metrics_map.get(fpath, {}).get("loc", 0),
            }
            for fpath in files_list
            if fpath in file_metrics_map
        ),
        key=lambda item: (item["complexity"], item["loc"]),
        reverse=True,
    )
    return json.dumps(ranked[:max_files])


def compute_health_score(
    avg_complexity: float,
    prev_avg_complexity: float,
    churn_rate: float,
    bus_factor_min: int,
    dependency_density: float,
    has_cycles: bool,
    hotspot_files: list[str],
    semantic_health_score: float = 100.0,
) -> dict:
    """Compute CommitIQ's five-subscore repo health model."""
    complexity_score = max(0.0, 100.0 - min(avg_complexity * 5.0, 100.0))
    if prev_avg_complexity > 0:
        drift_pct = (avg_complexity - prev_avg_complexity) / prev_avg_complexity
        if drift_pct > 0.20:
            complexity_score = max(0.0, complexity_score - 10.0)

    churn_rate = max(0.0, min(churn_rate, 1.0))
    churn_score = max(0.0, 100.0 - (churn_rate * 100.0))
    if hotspot_files:
        churn_score = max(0.0, churn_score - 15.0)

    bus_score = min(float(bus_factor_min) * 20.0, 100.0)

    dep_score = max(0.0, 100.0 - min(dependency_density * 50.0, 100.0))
    if has_cycles:
        dep_score = max(0.0, dep_score - 20.0)

    semantic_score = max(0.0, min(float(semantic_health_score), 100.0))

    health_score = (
        complexity_score * 0.25
        + churn_score * 0.20
        + bus_score * 0.20
        + dep_score * 0.15
        + semantic_score * 0.20
    )

    return {
        "health_score": round(max(0.0, min(100.0, health_score)), 1),
        "subscores": {
            "complexity_drift": round(complexity_score, 1),
            "churn_risk": round(churn_score, 1),
            "bus_factor_risk": round(bus_score, 1),
            "dependency_health": round(dep_score, 1),
            "semantic_drift": round(semantic_score, 1),
        },
        "breakdown": {
            "avg_complexity": round(avg_complexity, 2),
            "churn_rate": round(churn_rate, 4),
            "bus_factor_min": bus_factor_min,
            "dependency_density": round(dependency_density, 4),
            "has_cycles": has_cycles,
            "hotspot_count": len(hotspot_files),
            "semantic_health_score": round(semantic_score, 1),
        },
    }


def compute_full_snapshot(
    commit_data: dict,
    file_metrics_map: dict,
    bus_factor_min: int,
    prev_health: float | None,
    prev_avg_complexity: float = 0.0,
    dependency_density: float = 0.0,
    has_cycles: bool = False,
    hotspot_files: list[str] | None = None,
) -> dict:
    hotspot_files = hotspot_files or []
    files_list = commit_data.get("files_list", [])
    metrics = [file_metrics_map[fpath] for fpath in files_list if fpath in file_metrics_map]
    semantic_health = file_metrics_map.get("__semantic_health__", {})

    total_loc = sum(item.get("loc", 0) for item in metrics)
    complexities = [
        item.get("avg_complexity", 0.0)
        for item in metrics
        if item.get("avg_complexity", 0.0) > 0
    ]
    max_complexities = [item.get("max_complexity", 0.0) for item in metrics]

    avg_cc = round(sum(complexities) / len(complexities), 2) if complexities else 0.0
    max_cc = round(max(max_complexities), 2) if max_complexities else 0.0
    lines_changed = commit_data["insertions"] + commit_data["deletions"]
    churn_rate = round(min(1.0, lines_changed / max(total_loc, lines_changed, 1)), 4)

    score = compute_health_score(
        avg_complexity=avg_cc,
        prev_avg_complexity=prev_avg_complexity,
        churn_rate=churn_rate,
        bus_factor_min=bus_factor_min,
        dependency_density=dependency_density,
        has_cycles=has_cycles,
        hotspot_files=hotspot_files,
        semantic_health_score=semantic_health.get("semantic_health_score", 100.0),
    )
    subscores = score["subscores"]
    health = score["health_score"]

    return {
        "full_sha": commit_data["full_sha"],
        "health_score": health,
        "avg_complexity": avg_cc,
        "max_complexity": max_cc,
        "total_loc": total_loc,
        "churn_rate": churn_rate,
        "num_files_changed": len(files_list),
        "bus_factor_min": bus_factor_min,
        "health_delta": round(health - prev_health, 2) if prev_health is not None else None,
        "cc_score": subscores["complexity_drift"],
        "churn_score": subscores["churn_risk"],
        "bus_score": subscores["bus_factor_risk"],
        "loc_score": subscores["dependency_health"],
        "complexity_drift_score": subscores["complexity_drift"],
        "churn_risk_score": subscores["churn_risk"],
        "bus_factor_risk_score": subscores["bus_factor_risk"],
        "dependency_health_score": subscores["dependency_health"],
        "avg_semantic_drift": semantic_health.get("avg_semantic_drift", 0.0),
        "semantic_health_score": semantic_health.get("semantic_health_score", 100.0),
        "high_drift_files": semantic_health.get("high_drift_files", 0),
        "semantic_drift_method": semantic_health.get("semantic_drift_method", "none"),
        "dependency_density": score["breakdown"]["dependency_density"],
        "has_cycles": has_cycles,
        "hotspot_count": len(hotspot_files),
        "top_files_json": build_top_files_json(files_list, file_metrics_map),
    }
