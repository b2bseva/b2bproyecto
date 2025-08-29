# app/api/v1/routers/providers.py

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api.v1.dependencies.auth_user import get_current_user
from app.api.v1.dependencies.database_supabase import get_async_db
from app.models.empresa.perfil_empresa import PerfilEmpresa
from app.models.empresa.verificacion_solicitud import VerificacionSolicitud
from app.models.empresa.documento import Documento
from app.models.empresa.direccion import Direccion
from app.models.perfil import UserModel 
from app.schemas.empresa.perfil_empresa import PerfilEmpresaIn
from app.schemas.auth_user import SupabaseUser
from app.api.v1.dependencies.idrive import upload_file_to_idrive
from typing import Optional, List
import uuid

router = APIRouter(prefix="/providers", tags=["providers"])

@router.post(
    "/solicitar-verificacion",
    status_code=status.HTTP_201_CREATED,
    description="Registra un perfil de empresa y una solicitud de verificación con documentos adjuntos."
)
async def solicitar_verificacion_completa(
    perfil_in: PerfilEmpresaIn = Depends(),
    ids_tip_documento: List[int] = Form(...), # Recibe una lista de IDs de tipos de documento
    documentos: List[UploadFile] = File(...),
    comentario_solicitud: Optional[str] = Form(None),
    current_user: SupabaseUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    try:
        # Validar que la cantidad de IDs de tipos de documento coincide con la de los archivos
        if len(ids_tip_documento) != len(documentos):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El número de IDs de tipo de documento no coincide con el número de archivos."
            )

        # 1. Obtener el perfil del usuario actual para recuperar el nombre de la empresa
        #esto porque al iniciar sesion ya carga el nombre de su empresa
        user_profile_result = await db.execute(
            select(UserModel).where(UserModel.id == uuid.UUID(current_user.id))
        )

        # Obtener el perfil de usuario
        user_profile = user_profile_result.scalars().first()

        # Verificar que el perfil de usuario tiene un nombre de empresa
        if not user_profile or not user_profile.nombre_empresa:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail="El nombre de la empresa no está disponible en el perfil de usuario.")
        
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
            nueva_direccion = Direccion(**perfil_in.direccion.model_dump())
            db.add(nueva_direccion)
            await db.flush()
            
            nuevo_perfil = PerfilEmpresa(
                user_id=uuid.UUID(current_user.id),
                razon_social=razon_social,
                nombre_fantasia=perfil_in.nombre_fantasia,
                id_direccion=nueva_direccion.id_direccion,
                estado="pendiente",
                verificado=False
            )
            db.add(nuevo_perfil)
            await db.flush()

            nueva_solicitud = VerificacionSolicitud(
                id_perfil=nuevo_perfil.id_perfil,
                estado="pendiente",
                comentario=comentario_solicitud
            )
            db.add(nueva_solicitud)
            await db.flush()

            # 4. Subir archivos a iDrive y registrar en la base de datos
            for index, file in enumerate(documentos):
                id_tip_documento = ids_tip_documento[index]
                
                # Sube el archivo a iDrive y obtiene la URL
                idrive_url = await upload_file_to_idrive(
                    file=file, 
                    user_id=str(current_user.id), 
                    file_type=str(id_tip_documento) # Usa el ID del tipo de documento como nombre de carpeta
                )
                
                # Crea el registro del documento
                nuevo_documento = Documento(
                    id_verificacion=nueva_solicitud.id_verificacion,
                    id_tip_documento=id_tip_documento,
                    url_archivo=idrive_url,
                    estado_revision="pendiente"
                )
                db.add(nuevo_documento)
        
        return {"message": "Perfil de empresa y solicitud de verificación creados exitosamente."}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error inesperado: {str(e)}")