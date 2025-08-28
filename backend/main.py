from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routers import auth
from app.api.v1.routers.locations import locations
from app.api.v1.routers.providers import providers

# Instancia de la aplicación de FastAPI
app = FastAPI(
    title="SEVA B2B API",
    description="API para la plataforma B2B SEVA Empresas",
    version="1.0.0"
)

# Configurar CORS para permitir comunicación con el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # React dev server
        "https://*.railway.app",  # Railway URLs
        "https://*.vercel.app",   # Vercel URLs
        "https://*.netlify.app",  # Netlify URLs
        "*"  # Temporalmente para testing - REMOVER EN PRODUCCIÓN
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(providers.router, prefix="/api/v1")
app.include_router(locations.router, prefix="/api/v1") 

# endpoint (una ruta) para la URL raíz ("/")
@app.get("/")
def read_root():
    return {"Hello": "World", "message": "SEVA B2B API está funcionando"}