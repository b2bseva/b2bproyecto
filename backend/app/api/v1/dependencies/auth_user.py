#logica de autenticacion/validacion de token (jwt, auth0, etc)
#una dependencia para validar el token JWT en cada request
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
#from app.core.supabase import supabase  # Asegúrate de que esta importación sea correcta
from app.supabase.auth_service import supabase_auth  # Importa el cliente Supabase inicializado
from app.schemas.auth_user import SupabaseUser  # o desde schemas si lo moviste


security = HTTPBearer()

# Dependencia para validar el token JWT y obtener los datos del usuario autenticado
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> SupabaseUser:
    """
    Dependencia que valida el token JWT y retorna los datos del usuario autenticado.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se proporcionó un token de autorización"
        )
    token = credentials.credentials
    user_data = supabase_auth.auth.get_user(token).get("data")

    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )

    return SupabaseUser(
        id=user_data.get("id"),
        email=user_data.get("email")
    )
