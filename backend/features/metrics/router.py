from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.shared.models import Repo
from backend.features.metrics.cycle_time import compute_cycle_time_metrics
from backend.features.metrics.dora import compute_dora_metrics
from backend.features.metrics.team_health import compute_team_health

router = APIRouter(prefix="/metrics", tags=["metrics"])

@router.get("/repos/{repo_id}/cycle-time")
async def get_cycle_time(repo_id: int, db: AsyncSession = Depends(get_db)):
    repo = await db.get(Repo, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    metrics = await compute_cycle_time_metrics(db, repo_id)
    return metrics

@router.get("/repos/{repo_id}/dora")
async def get_dora_metrics(repo_id: int, db: AsyncSession = Depends(get_db)):
    repo = await db.get(Repo, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    metrics = await compute_dora_metrics(db, repo_id)
    return metrics

@router.get("/repos/{repo_id}/team-health")
async def get_team_health_metrics(repo_id: int, db: AsyncSession = Depends(get_db)):
    repo = await db.get(Repo, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    metrics = await compute_team_health(db, repo_id)
    return metrics
