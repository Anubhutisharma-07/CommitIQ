from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from backend.config import DATABASE_URL

_IS_SQLITE = DATABASE_URL.startswith("sqlite")

engine = create_async_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False, "timeout": 30} if _IS_SQLITE else {},
    echo=False,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


def _migrations_dir() -> Path:
    return Path(__file__).resolve().parent.parent / "migrations"


async def _sqlite_columns(conn, table_name: str) -> set[str]:
    result = await conn.execute(text(f"PRAGMA table_info({table_name})"))
    return {row[1] for row in result.fetchall()}


async def _execute_statement(conn, statement: str) -> None:
    if not _IS_SQLITE:
        await conn.execute(text(statement))
        return

    upper = statement.upper()
    if upper.startswith("ALTER TABLE") and " ADD COLUMN " in upper:
        parts = statement.split()
        if len(parts) >= 6:
            table_name = parts[2]
            column_name = parts[5]
            if column_name in await _sqlite_columns(conn, table_name):
                return
    await conn.execute(text(statement))


async def init_db():
    """Initialize database schema for local SQLite and hosted Postgres."""
    from backend.shared import models  # noqa: F401

    async with engine.begin() as conn:
        if not _IS_SQLITE:
            await conn.run_sync(Base.metadata.create_all)
            print("Database schema initialized.")
            return

        await conn.execute(text("PRAGMA journal_mode=WAL"))
        await conn.execute(text("PRAGMA synchronous=NORMAL"))
        await conn.execute(text("PRAGMA foreign_keys=ON"))
        await conn.run_sync(Base.metadata.create_all)

        for migration_path in sorted(_migrations_dir().glob("*.sql")):
            migration_lines = migration_path.read_text(encoding="utf-8").splitlines()
            migration_sql = "\n".join(
                line for line in migration_lines
                if not line.lstrip().startswith("--")
            )
            statements = [
                statement.strip()
                for statement in migration_sql.split(";")
                if statement.strip()
            ]
            for statement in statements:
                if not _IS_SQLITE and statement.upper().startswith("PRAGMA"):
                    continue
                await _execute_statement(conn, statement)

    print("Database migrations applied.")
