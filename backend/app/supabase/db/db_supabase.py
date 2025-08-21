#from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import DATABASE_URL

#DATABASE_URL = "postgresql://user:password@localhost/dbname"

#engine = create_engine(DATABASE_URL)
#SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.core.config import DATABASE_URL
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear la base para los modelos SQLAlchemy
Base = declarative_base()

# Verificar que DATABASE_URL esté configurado
if not DATABASE_URL:
    logger.error("❌ DATABASE_URL no está configurado")
    logger.error("💡 Asegúrate de crear el archivo .env en la carpeta backend")
    logger.error("💡 Con la connection string del Transaction Pooler")
    raise ValueError(
        "DATABASE_URL no está configurado. "
        "Verifica que el archivo .env existe y contiene DATABASE_URL."
    )

logger.info(f"🔗 Intentando conectar a la base de datos (Transaction Pooler): {DATABASE_URL}")

# Crear engine síncrono
try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info("✅ Engine síncrono creado exitosamente")
except Exception as e:
    logger.error(f"❌ Error al crear la conexión síncrona a la base de datos: {e}")
    raise ValueError(f"Error al crear la conexión a la base de datos: {e}")

# Crear engine asíncrono (para operaciones async) con configuración simplificada
try:
    # Convertir URL síncrona a asíncrona
    async_database_url = DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://')
    logger.info(f"🔄 Creando engine asíncrono con URL: {async_database_url}")
    
    # Configuración simplificada y robusta del pool de conexiones
    async_engine = create_async_engine(
        async_database_url,
        # Configuración básica del pool de conexiones
        pool_size=5,  # Número de conexiones en el pool (reducido)
        max_overflow=10,  # Conexiones adicionales (reducido)
        pool_pre_ping=True,  # Verificar conexiones antes de usarlas
        pool_recycle=1800,  # Reciclar conexiones cada 30 minutos
        pool_timeout=20,  # Timeout para obtener conexión del pool
        echo=False,  # No mostrar SQL en logs
        # Configuración mínima para asyncpg
        connect_args={
            "server_settings": {
                "application_name": "SAVEB2B_Backend"
            }
        }
    )
    
    AsyncSessionLocal = sessionmaker(
        async_engine, 
        class_=AsyncSession, 
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )
    logger.info("✅ Engine asíncrono creado exitosamente con configuración simplificada")
except Exception as e:
    logger.error(f"❌ Error al crear la conexión asíncrona a la base de datos: {e}")
    raise ValueError(f"Error al crear la conexión asíncrona a la base de datos: {e}")


