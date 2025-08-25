#autenticacion supabase
# app/api/v1/routers/auth.py
import uuid
from sqlalchemy import UUID, select
from app.schemas.auth import SignInIn, SignUpIn, SignUpSuccess, TokenOut, RefreshTokenIn, EmailOnlyIn
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.v1.dependencies.auth_user import get_current_user  # dependencia que valida el JWT
from app.api.v1.dependencies.database_supabase import get_async_db  # dependencia que proporciona la sesión de DB
from app.supabase.auth_service import supabase_auth  # cliente Supabase inicializado
from typing import Any, Dict, Union
from app.schemas.user import UserProfileAndRolesOut
from app.schemas.auth_user import SupabaseUser
from app.utils.errores import handle_supabase_auth_error  # Importa la función para manejar errores de Supabase
from supabase import AuthApiError  # Importa la excepción de error de Supabase
from sqlalchemy.ext.asyncio import AsyncSession 
from app.models2.usuario_rol import UsuarioRolModel  
from app.models2.rol import RolModel  
from app.models2.perfil import UserModel  # Importa tu modelo actualizado
import logging
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload

# Configurar logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# --- Endpoints de autenticación ---

@router.post(
    "/signup",
    response_model=Union[TokenOut, SignUpSuccess],
    status_code=status.HTTP_201_CREATED,
    description="Crea un usuario en Supabase Auth. El perfil y rol se crean automáticamente via trigger."
)
async def sign_up(data: SignUpIn, db: AsyncSession = Depends(get_async_db)) -> Union[TokenOut, SignUpSuccess]:
    try:
        logger.info(f"Iniciando registro para usuario: {data.email}")
        
        # --- Paso 1: Crear usuario en Supabase Auth con metadata ---
        # La metadata se enviará al trigger para crear automáticamente el perfil y asignar el rol "Cliente"
        signup_data = {
            "email": data.email,
            "password": data.password,
            "options": {
                "data": {
                    "nombre_persona": data.nombre_persona,
                    "nombre_empresa": data.nombre_empresa
                }
            }
        }
        
        logger.info(f"Enviando datos a Supabase Auth: {signup_data}")
        signup_response = supabase_auth.auth.sign_up(signup_data)

        if not signup_response.user:
            handle_supabase_auth_error("Respuesta de Supabase incompleta (no hay user)")

        id_user = str(signup_response.user.id)
        logger.info(f"Usuario creado en Supabase Auth con ID: {id_user}")

        # --- Paso 2: Verificar que el trigger funcionó correctamente ---
        # Esperamos un momento para que el trigger se ejecute
        import asyncio
        await asyncio.sleep(2)  # Aumentamos el tiempo de espera

        # Verificar que el perfil se creó con manejo de errores de conexión
        try:
            logger.info(f"Verificando si el perfil se creó para el usuario: {id_user}")
            result = await db.execute(select(UserModel).filter(UserModel.id == id_user))
            user_profile = result.scalars().first()

            if not user_profile:
                logger.error(f"El perfil no se creó para el usuario: {id_user}")
                # Intentar crear el perfil manualmente como fallback
                try:
                    logger.info("Intentando crear perfil manualmente como fallback")
                    new_profile = UserModel(
                        id=id_user,
                        nombre_persona=data.nombre_persona,
                        nombre_empresa=data.nombre_empresa
                    )
                    db.add(new_profile)
                    await db.commit()
                    logger.info("Perfil creado manualmente exitosamente")
                except SQLAlchemyError as e:
                    logger.error(f"Error al crear perfil manualmente: {e}")
                    await db.rollback()
                    raise HTTPException(
                        status_code=500, 
                        detail=f"Error: El perfil del usuario no se creó automáticamente. Error del trigger: {str(e)}"
                    )
        except SQLAlchemyError as e:
            logger.error(f"Error de base de datos al verificar perfil: {e}")
            # Intentar recrear la conexión
            try:
                await db.close()
                # Aquí deberías obtener una nueva sesión, pero por ahora usamos fallback
                raise HTTPException(
                    status_code=500, 
                    detail=f"Error de conexión a la base de datos: {str(e)}"
                )
            except Exception as reconnect_error:
                logger.error(f"Error al intentar reconectar: {reconnect_error}")
                raise HTTPException(
                    status_code=500, 
                    detail="Error de conexión a la base de datos. Inténtalo de nuevo."
                )

        # Verificar que el rol "Cliente" se asignó con manejo de errores
        try:
            logger.info(f"Verificando si el rol 'Cliente' se asignó para el usuario: {id_user}")
            result = await db.execute(
                select(UsuarioRolModel)
                .join(RolModel)
                .filter(
                    UsuarioRolModel.id_usuario == id_user,
                    RolModel.nombre == "Cliente"
                )
            )
            user_role = result.scalars().first()

            if not user_role:
                logger.error(f"El rol 'Cliente' no se asignó para el usuario: {id_user}")
                # Intentar asignar el rol manualmente como fallback
                try:
                    logger.info("Intentando asignar rol manualmente como fallback")
                    result = await db.execute(select(RolModel).filter(RolModel.nombre == "Cliente"))
                    cliente_rol = result.scalars().first()
                    
                    if cliente_rol:
                        new_user_role = UsuarioRolModel(
                            id_usuario=id_user,
                            id_rol=cliente_rol.id
                        )
                        db.add(new_user_role)
                        await db.commit()
                        logger.info("Rol asignado manualmente exitosamente")
                    else:
                        logger.error("Rol 'Cliente' no encontrado en la base de datos")
                        raise HTTPException(
                            status_code=500, 
                            detail="Error: El rol 'Cliente' no existe en la base de datos"
                        )
                except SQLAlchemyError as e:
                    logger.error(f"Error al asignar rol manualmente: {e}")
                    await db.rollback()
                    raise HTTPException(
                        status_code=500, 
                        detail=f"Error: El rol 'Cliente' no se asignó automáticamente. Error del trigger: {str(e)}"
                    )
        except SQLAlchemyError as e:
            logger.error(f"Error de base de datos al verificar rol: {e}")
            raise HTTPException(
                status_code=500, 
                detail=f"Error de conexión al verificar roles: {str(e)}"
            )

        logger.info(f"Registro completado exitosamente para usuario: {id_user}")

        # --- Manejo de confirmación de email ---
        if not signup_response.session:
            return SignUpSuccess(
                message="¡Registro exitoso! Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja de entrada.",
                email=data.email,
                nombre_persona=data.nombre_persona,
                nombre_empresa=data.nombre_empresa,
            )

        return TokenOut(
            access_token=signup_response.session.access_token,
            refresh_token=signup_response.session.refresh_token,
            expires_in=signup_response.session.expires_in,
        )

    except AuthApiError as e:
        logger.error(f"Error de Supabase Auth: {e}")
        handle_supabase_auth_error(e)
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error de base de datos: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error inesperado al registrar el usuario: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error inesperado al registrar el usuario: {str(e)}"
        )


#para probar el endpoint desde postman http://localhost:8000/auth/signin
@router.post("/signin", response_model=TokenOut,
            status_code=status.HTTP_200_OK,
            description="Autentica un usuario con email y contraseña y devuelve sus tokens de acceso y refresh.")
async def sign_in(data: SignInIn) -> TokenOut:
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


@router.post("/resend-confirmation-email",
             status_code=status.HTTP_200_OK,
             description="Re-envia un correo de confirmacion para verificar la cuenta.")
async def resend_confirmation_email(data: EmailOnlyIn):
    """
    Re-envia un correo de confirmacion de email para verificar la cuenta del usuario.
    """
    try:
        supabase_auth.auth.resend({
            "type": "signup",
            "email": data.email
        })
        
        return {"message": f"Se ha enviado un nuevo correo de confirmacion a {data.email}. Por favor, revisa tu bandeja de entrada."}

    except AuthApiError as e:
        handle_supabase_auth_error(e)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ha ocurrido un error inesperado al re-enviar el correo de confirmaci?n: {str(e)}"
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
        # supabase_auth.sign_out()
        supabase_auth.auth.sign_out()

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
async def read_profile(current_user: SupabaseUser = Depends(get_current_user),
                       db: AsyncSession = Depends(get_async_db)) -> UserProfileAndRolesOut:
    """
    Devuelve la información del usuario autenticado.
    """

    # 1. Recuperar el perfil del usuario de la base de datos
    # Se utiliza joinedload para cargar los roles de forma eficiente en una sola consulta.
    '''result_profile = await db.execute(
        select(UserModel)
        .options(joinedload(UserModel.roles))
        .where(UserModel.id == UUID(current_user.id))
    )'''

     # 1. Convertir el id de string a UUID de Python
    user_uuid = uuid.UUID(current_user.id)

    # Se utiliza joinedload para cargar los roles de forma eficiente en una sola consulta,
    # incluyendo la relación anidada `rol` para evitar lazy-loading en el contexto async.
    result_profile = await db.execute(
        select(UserModel)
        .options(
            joinedload(UserModel.roles).joinedload(UsuarioRolModel.rol)
        )
        .where(UserModel.id == user_uuid)
    )

    user_profile = result_profile.scalars().first()
    
    if not user_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil de usuario no encontrado")

    # 2. Extraer los nombres de los roles de la lista de objetos de rol
    roles_nombres = [rol_asociado.rol.nombre for rol_asociado in user_profile.roles]

    # 3. Construir y devolver la respuesta final
    return UserProfileAndRolesOut(
        id=user_profile.id,
        email=current_user.email, # El email se obtiene de la autenticacion
        nombre_persona=user_profile.nombre_persona,
        nombre_empresa=user_profile.nombre_empresa,
        roles=roles_nombres
    )
