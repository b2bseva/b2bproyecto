from typing import Generator
from fastapi import logger
from sqlalchemy.ext.asyncio import AsyncSession
from app.supabase.db.db_supabase import AsyncSessionLocal, SessionLocal

#def get_async_db() -> Generator[AsyncSession, None, None]:

    #db = AsyncSessionLocal() # Crea una sesión de base de datos asíncrona
    #try:
        #yield db  #proporciona la sesion a los endpoints que la necesitan
    #finally:
        #db.close() #cierra la sesion despues de que se completa la peticion

# Función síncrona para obtener sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Función asíncrona para obtener sesión de base de datos con mejor manejo de errores
async def get_async_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Error en sesión de base de datos: {e}")
            await session.rollback()
            raise
        finally:
            try:
                await session.close()
            except Exception as e:
                logger.error(f"Error al cerrar sesión: {e}")
