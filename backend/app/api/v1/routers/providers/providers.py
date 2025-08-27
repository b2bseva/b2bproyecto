# app/api/v1/routers/providers.py

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api.v1.dependencies.auth_user import get_current_user
from app.api.v1.dependencies.database_supabase import get_async_db
from app.models.perfil_empresa import PerfilEmpresa
from app.models.verificacion_solicitud import VerificacionSolicitud
from app.models.documento import Documento
from app.models.direccion import Direccion
from app.models.usuario_rol import UsuarioRolModel
from app.models.rol import RolModel
from app.schemas.providers import PerfilEmpresaIn
from app.schemas.auth_user import SupabaseUser
import uuid

router = APIRouter(prefix="/providers", tags=["providers"])

@router.post(
    "/solicitar-verificacion",
    status_code=status.HTTP_201_CREATED,
    description="Registra un perfil de empresa y una solicitud de verificación con documentos adjuntos."
)
async def solicitar_verificacion_completa(
    perfil_in: PerfilEmpresaIn,
    comentario_solicitud: Optional[str] = Form(None),
    documentos: List[UploadFile] = File(...),
    current_user: SupabaseUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):

    '''
    Este endpoint manejará toda la lógica. Recibirá un formulario con los datos del perfil, la solicitud y los documentos binarios. Se encargará de:

    Crear la dirección.

    Crear el perfil de la empresa y asociarlo al usuario.

    Crear la solicitud de verificación.

    Guardar los documentos en iDrive.

    Guardar los registros de los documentos en la base de datos.
    '''

    try:
       # 1. Obtener el perfil del usuario actual para recuperar el nombre de la empresa
        user_profile_result = await db.execute(
            select(UserModel).where(UserModel.id == uuid.UUID(current_user.id))
        )

        user_profile = user_profile_result.scalars().first()

        if not user_profile or not user_profile.nombre_empresa:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El nombre de la empresa no está disponible en el perfil de usuario.")

        razon_social = user_profile.nombre_empresa
        
        # 2. Validar la unicidad de la empresa
        query = select(PerfilEmpresa).where(
            (PerfilEmpresa.razon_social == razon_social) |
            (PerfilEmpresa.nombre_fantasia == perfil_in.nombre_fantasia)
        )

        empresa_existente = await db.execute(query)

        if empresa_existente.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Una empresa con esta razón social o nombre de fantasía ya está registrada."
            )
        
        # 3. Iniciar transacción y creación de registros
        async with db.begin():
            # a. Crear la dirección
            #** sirve para desempaquetar el modelo pydantic
            nueva_direccion = Direccion(**perfil_in.direccion.model_dump())
            db.add(nueva_direccion)
            await db.flush()
            
            # b. Crear el perfil de la empresa
            nuevo_perfil = PerfilEmpresa(
                user_id=uuid.UUID(current_user.id),
                razon_social=perfil_in.razon_social,
                nombre_fantasia=perfil_in.nombre_fantasia,
                id_direccion=nueva_direccion.id_direccion,
                estado="pendiente",
                verificado=False
            )
            db.add(nuevo_perfil)
            #flush() sincroniza los objetos de la sesion, es mejor que commit()
            #porque es bueno para obtener el id autogenerado del nuevo objeto
            await db.flush()

            # c. Crear la solicitud de verificación
            nueva_solicitud = VerificacionSolicitud(
                id_perfil=nuevo_perfil.id_perfil,
                estado="pendiente",
                comentario=comentario_solicitud
            )
            db.add(nueva_solicitud)
            await db.flush()

            # d. Subir archivos a iDrive y registrar en la base de datos
            for file in documentos:
                # 🚨 Lógica de subida a iDrive aquí 🚨
                # Esta es una lógica de ejemplo, debes implementarla
                # idrive_url = await upload_file_to_idrive(file)
                #idrive_url = f"https://idrive.com/{file.filename}"
                
                idrive_url = await upload_file_to_idrive(file, current_user.id, "documentos_verificacion")
                
                # Crear el registro del documento
                nuevo_documento = Documento(
                    id_verificacion=nueva_solicitud.id_verificacion,
                    # Aquí deberías tener un campo para el tipo de documento
                    # id_tip_documento=...,
                    url_archivo=idrive_url,
                    estado_revision="pendiente"
                )
                db.add(nuevo_documento)
        
        # 3. Respuesta final
        return {"message": "Perfil de empresa y solicitud de verificación creados exitosamente."}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error inesperado: {str(e)}")