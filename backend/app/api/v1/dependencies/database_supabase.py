from app.supabase.db.db_supabase import SessionLocal

def get_db():
    db = SessionLocal() #crea una nueva sesión de base de datos
    try:
        yield db #proporciona la sesion al endpoint que la necesita
    finally:
        db.close() #cierra la sesion despues de que se completa la peticion