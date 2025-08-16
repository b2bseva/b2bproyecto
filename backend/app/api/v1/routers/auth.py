#autenticacion supabase
# app/api/routers/auth.py
from app.schemas.auth import SignUpIn, SignUpSuccess, TokenOut, RefreshTokenIn, EmailOnlyIn
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.v1.dependencies.auth_user import get_current_user  # dependencia que valida el JWT
from app.supabase.auth_service import supabase_auth  # cliente Supabase inicializado
from typing import Any, Dict, Union
from app.schemas.user import UserOut
from app.schemas.auth_user import SupabaseUser
from app.utils.errores import handle_supabase_auth_error  # Importa la función para manejar errores de Supabase
from supabase import AuthApiError  # Importa la excepción de error de Supabase


router = APIRouter(prefix="/auth", tags=["auth"])

# --- Endpoints de autenticación ---

@router.post(
    "/signup",
    response_model=Union[TokenOut, SignUpSuccess],
    status_code=status.HTTP_201_CREATED,
    description="Crea un usuario en Supabase Auth."
)
async def sign_up(data: SignUpIn) -> Union[TokenOut, SignUpSuccess]:
    """
    Crea un usuario en Supabase Auth.
    - Si el registro es exitoso y no requiere confirmación, devuelve los tokens de acceso y actualización.
    - Si requiere confirmación de email, devuelve un mensaje de éxito con el email.
    """
    try:
        signup_response = supabase_auth.auth.sign_up({
            "email": data.email,
            "password": data.password
        })

        # Gotrue (la librería subyacente de Supabase Auth) ahora lanza AuthApiError
        # para errores, así que no necesitamos verificar signup_response.get("error")
        # directamente para esos casos.

        # La propiedad 'session' será None si se requiere confirmación de email.
        # La propiedad 'user' será None si algo falló fundamentalmente, o si
        # el email ya existe y Supabase devuelve un 409 (que se capturaría como AuthApiError)
        if signup_response.user is None:
            # Este caso es crítico: si no hay usuario, algo salió mal y no fue un AuthApiError
            # (ej. un problema de configuración o un estado inesperado).
            # No debería ocurrir si AuthApiError captura la mayoría de los fallos,
            # pero es una buena salvaguarda. Podríamos considerarlo un error interno.
            handle_supabase_auth_error("Supabase signup response incomplete")


        if signup_response.session is None:
            # Si session es None, Supabase requiere confirmación de correo electrónico.
            return SignUpSuccess(
                message="¡Registro exitoso! Te enviamos un correo para confirmar tu cuenta. Por favor, revisa tu bandeja de entrada para verificar tu email.",
                email=data.email,
            )
        
        # Si hay una sesión, el usuario está logueado automáticamente.
        # Esto ocurre si la confirmación de email está deshabilitada en Supabase.
        return TokenOut(
            access_token=signup_response.session.access_token,
            refresh_token=signup_response.session.refresh_token,
            expires_in=signup_response.session.expires_in,
        )
    
    # Captura errores específicos de Supabase Auth
    except AuthApiError as e:
        # Capturamos el error específico de autenticación de Supabase
        # y lo pasamos a nuestra función centralizada de manejo de errores.
        handle_supabase_auth_error(e)
    except (KeyError, TypeError) as e:
        # Captura errores si la estructura de la respuesta de Supabase
        # no es la esperada (ej. faltan claves en session/user si existe).
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar los datos de registro de usuario: La respuesta de Supabase no tiene el formato esperado. Detalles: {e}"
        )
    except Exception as e:
        # Captura cualquier otra excepción inesperada
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ha ocurrido un error inesperado al registrar el usuario: {str(e)}"
        )

#para probar el endpoint desde postman http://localhost:8000/auth/signin
@router.post("/signin", response_model=TokenOut,
            status_code=status.HTTP_200_OK,
            description="Autentica un usuario con email y contraseña y devuelve sus tokens de acceso y refresh.")
async def sign_in(data: SignUpIn) -> TokenOut:
    """
    Autentica un usuario con email y contraseña y devuelve sus tokens.
    """
    #Dict[str, Any] es solo una anotación de tipo, no es necesario para la implementación
    #pero ayuda a entender que supabase_auth.sign_in devuelve un diccionario con los datos de la sesión
    #Supabase Auth utiliza el método sign_in para autenticar usuarios
    
    try:
        signin_response = supabase_auth.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })

        if signin_response.user is None or not signin_response.session:
           handle_supabase_auth_error("Supabase response incomplete")

        return TokenOut(
            access_token=signin_response.session.access_token,
            refresh_token=signin_response.session.refresh_token,
            expires_in=signin_response.session.expires_in,
        )

    except AuthApiError as e:
        # Llama a la función centralizada que usa el diccionario
        handle_supabase_auth_error(e)
    except (KeyError, TypeError) as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar los datos de la sesión: La respuesta de Supabase no tiene el formato esperado. Detalles: {e}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ha ocurrido un error inesperado al iniciar sesión: {str(e)}"
        )


@router.post(
    "/refresh",
    response_model=TokenOut,
    status_code=status.HTTP_200_OK,
    description="Refresca el JWT usando el refresh_token."
)
async def refresh_token(data: RefreshTokenIn) -> TokenOut:
    """
    Refresca el JWT usando el refresh_token.
    """
    try:
        # Intenta refrescar la sesión usando el refresh_token proporcionado
        refresh_response = supabase_auth.auth.refresh_session({
            "refresh_token": data.refresh_token
        })

        # Supabase Auth lanza AuthApiError si el refresh_token es inválido o expiró.
        # Sin embargo, si la respuesta es exitosa pero la sesión está ausente,
        # lo manejamos como un error interno.
        if refresh_response.session is None:
            # Esto podría ocurrir si la operación no lanzó un AuthApiError pero
            # no se pudo obtener una sesión válida (ej. problema en Supabase, token ya usado).
            handle_supabase_auth_error("Supabase refresh response incomplete")

        # Si la sesión se refrescó exitosamente, devuelve los nuevos tokens
        return TokenOut(
            access_token=refresh_response.session.access_token,
            refresh_token=refresh_response.session.refresh_token,
            expires_in=refresh_response.session.expires_in,
        )
    except AuthApiError as e:
        # Captura errores específicos de la API de autenticación de Supabase.
        # Esto incluirá casos como un refresh_token inválido o expirado.
        handle_supabase_auth_error(e)
    except (KeyError, TypeError) as e:
        # Captura errores si la estructura de la respuesta de Supabase no es la esperada
        # (ej. si el objeto de sesión no contiene 'access_token', 'refresh_token', 'expires_in').
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar los datos del refresh token: La respuesta de Supabase no tiene el formato esperado. Detalles: {e}"
        )
    except Exception as e:
        # Captura cualquier otra excepción inesperada.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ha ocurrido un error inesperado al refrescar el token: {str(e)}"
        )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(current_user: SupabaseUser = Depends(get_current_user)):
    """
    Revoca el refresh token del usuario (deslogueo) y termina su sesión activa.
    """
    try:
        # Intenta cerrar la sesión del usuario actual.
        # Supabase suele manejar esto invalidando el refresh token.
        # El resultado de sign_out es a menudo None si es exitoso y no hay errores.
        supabase_auth.sign_out()
        
        # Si la operación fue exitosa y no lanzó una excepción,
        # simplemente devuelve None para un 204 No Content.
        return None
    except AuthApiError as e:
        # Captura errores específicos de la API de Supabase Auth durante el deslogueo.
        # Esto podría incluir problemas si el token ya no es válido,
        # aunque sign_out es bastante tolerante en esos casos.
        handle_supabase_auth_error(e)
    except Exception as e:
        # Captura cualquier otra excepción inesperada.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ha ocurrido un error inesperado al cerrar la sesión: {str(e)}"
        )

   
@router.post("/forgot-password", status_code=status.HTTP_200_OK,
            description="Envía un correo electrónico para restablecer la contraseña.")
async def forgot_password(data: EmailOnlyIn):
    """
    Solicita a Supabase que envíe un correo de recuperación de contraseña.
    """
    try:
        # Supabase típicamente responde con éxito si la solicitud es válida,
            # incluso si el email no existe, para evitar enumeración de usuarios.
            # El método `reset_password_for_email` es el correcto.
        response = supabase_auth.auth.reset_password_for_email(data.email)
        
        # Si no hay error, significa que el correo se envió correctamente
        return {"message": "Te enviamos un correo para restablecer tu contraseña."}
    except Exception as e:
        # Captura cualquier otra excepción inesperada.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ha ocurrido un error inesperado al solicitar el restablecimiento de contraseña: {str(e)}"
        )


@router.get("/me",
            status_code=status.HTTP_200_OK,
            description="Devuelve la información del usuario autenticado.")
async def read_profile(current_user: SupabaseUser = Depends(get_current_user)) -> UserOut:
    """
    Devuelve la información del usuario autenticado.
    """
    return UserOut(id=current_user.id,
                   email=current_user.email)

