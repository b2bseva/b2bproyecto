from typing import Generator
from sqlalchemy.ext.asyncio import AsyncSession
from app.supabase.db.db_supabase import AsyncSessionLocal

def get_async_db() -> Generator[AsyncSession, None, None]:

    db = AsyncSessionLocal() # Crea una sesión de base de datos asíncrona
    try:
        yield db  #proporciona la sesion a los endpoints que la necesitan
    finally:
        db.close() #cierra la sesion despues de que se completa la peticion