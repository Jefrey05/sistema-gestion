from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from .config import settings

# Configuración para PostgreSQL con pool de conexiones mejorado
engine_args = {
    "pool_pre_ping": True,  # Verifica conexiones antes de usarlas
    "pool_recycle": 300,  # Recicla conexiones cada 5 minutos
    "pool_size": 5,
    "max_overflow": 10,
    "connect_args": {
        "connect_timeout": 10,
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    }
}

# Para SQLite usar configuración diferente
if "sqlite" in settings.DATABASE_URL:
    engine_args = {"connect_args": {"check_same_thread": False}}

engine = create_engine(settings.DATABASE_URL, **engine_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
