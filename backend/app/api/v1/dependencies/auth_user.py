#logica de autenticacion/validacion de token (jwt, auth0, etc)
#una dependencia para validar el token JWT en cada request
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import AuthApiError
#from app.core.supabase import supabase  # Asegúrate de que esta importación sea correcta
from app.api.v1.routers.users.auth_user2.auth import read_profile
from app.schemas.user import UserProfileAndRolesOut
from app.supabase.auth_service import supabase_auth  # Importa el cliente Supabase inicializado
from app.schemas.auth_user import SupabaseUser  # o desde schemas si lo moviste
from gotrue.types import User  # Importa el tipo User de gotrue import UserResponse  # Importa UserResponse para manejar la respuesta de get_user

security = HTTPBearer()

# Dependencia para validar el token JWT y obtener los datos del usuario autenticado
async def get_current_user(
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
    #user_data = supabase_auth.auth.get_user(token).get("data")

    # Manejando el objeto UserResponse en lugar de un diccionario

    '''if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )

    return SupabaseUser(
        id=user_data.get("id"),
        email=user_data.get("email")
    )'''

    try:
        # Obtenemos la respuesta completa del cliente de Supabase
        user_response = supabase_auth.auth.get_user(token)
        
        # Accedemos al objeto 'user' que está anidado en la respuesta
        user_data = user_response.user
        
        if not user_data:
            # Si no hay datos de usuario, es un token inválido
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado"
            )

        # Si el usuario es válido, creamos y devolvemos nuestro esquema Pydantic
        return SupabaseUser(
            id=user_data.id,
            email=user_data.email
        )
    except AuthApiError as e:
        # Capturamos la excepción específica de la librería para un token inválido
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido o expirado: {e.message}"
        )
    except Exception as e:
        # Captura cualquier otra excepción inesperada
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al validar el token: {str(e)}"
        )
    

async def get_admin_user(
    current_user_profile: UserProfileAndRolesOut = Depends(read_profile)
) -> SupabaseUser:
    """
    Dependencia que asegura que el usuario autenticado es un administrador.
    """
    if "admin" not in current_user_profile.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )
    return current_user_profile