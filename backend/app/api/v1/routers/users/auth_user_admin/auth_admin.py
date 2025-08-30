# app/api/v1/routers/admin.py

import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from typing import List, Optional
from app.api.v1.dependencies.database_supabase import get_async_db
from app.models.empresa.verificacion_solicitud import VerificacionSolicitud
from app.models.empresa.perfil_empresa import PerfilEmpresa
from app.models.empresa.documento import Documento
from app.schemas.empresa.solicitudverificacion import VerificacionSolicitudOut
from app.api.v1.dependencies.auth_user import get_admin_user  # <-- Nueva dependencia de seguridad

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_admin_user)])


@router.get(
    "/verificaciones/pendientes",
    response_model=List[VerificacionSolicitudOut],
    description="Obtiene todas las solicitudes de verificación pendientes."
)
async def get_solicitudes_pendientes(db: AsyncSession = Depends(get_async_db)):

    query = select(VerificacionSolicitud).where(VerificacionSolicitud.estado == "pendiente")
    result = await db.execute(query)
    solicitudes = result.scalars().all()

    return list(solicitudes)

    
@router.get(
    "/verificaciones/{solicitud_id}",
    response_model=VerificacionSolicitudOut,
    description="Obtiene los detalles de una solicitud de verificación específica, incluyendo el perfil "
    "de la empresa y los documentos asociados."
)
async def get_detalle_solicitud(solicitud_id: int, db: AsyncSession = Depends(get_async_db)):

    query = select(VerificacionSolicitud).where(VerificacionSolicitud.id_verificacion == solicitud_id)
    #joinedload para cargar el perfil y los documentos
    result = await db.execute(query.options(joinedload(VerificacionSolicitud.perfil_empresa), 
                                            joinedload(VerificacionSolicitud.documento)))
    solicitud = result.scalars().first()

    if not solicitud:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada.")
    return solicitud

class AdministradorDecision(BaseModel):
    comentario: Optional[str] = None

@router.post(
    "/verificaciones/{solicitud_id}/aprobar",
    status_code=status.HTTP_200_OK,
    description="Aprobar una solicitud de verificación y actualizar el estado de la empresa."
)
async def aprobar_solicitud(solicitud_id: int, decision: AdministradorDecision, db: AsyncSession = Depends(get_async_db)):
    async with db.begin():

        solicitud = await db.execute(select(VerificacionSolicitud).where(
                                    VerificacionSolicitud.id_verificacion == solicitud_id))
        solicitud = solicitud.scalars().first()

        if not solicitud:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada.")

        solicitud.estado = "aprobada"
        solicitud.fecha_revision = datetime.utcnow()
        solicitud.comentario = decision.comentario
        db.add(solicitud)

        perfil_empresa = await db.execute(select(PerfilEmpresa).where(PerfilEmpresa.id_empresa == solicitud.id_empresa))
        perfil_empresa = perfil_empresa.scalars().first()

        if not perfil_empresa:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil de empresa no encontrado.")

        perfil_empresa.estado = "True" #"verificado"
        db.add(perfil_empresa)

    return {"message": "Solicitud aprobada y perfil verificado."}


@router.post(
    "/verificaciones/{solicitud_id}/rechazar",
    status_code=status.HTTP_200_OK,
    description="Rechazar una solicitud de verificación y actualizar el estado de la empresa."
)
async def rechazar_solicitud(solicitud_id: int, decision: AdministradorDecision, db: AsyncSession = Depends(get_async_db)):
    async with db.begin():

        solicitud = await db.execute(select(VerificacionSolicitud).where(
                                    VerificacionSolicitud.id_verificacion == solicitud_id))
        solicitud = solicitud.scalars().first()

        if not solicitud:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada.")

        solicitud.estado = "rechazada"
        solicitud.fecha_revision = datetime.utcnow()
        solicitud.comentario = decision.comentario
        db.add(solicitud)

        '''
        perfil_empresa = await db.execute(select(PerfilEmpresa).where(PerfilEmpresa.id_empresa == solicitud.id_empresa))
        perfil_empresa = perfil_empresa.scalars().first()

        if not perfil_empresa:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil de empresa no encontrado.")

        perfil_empresa.estado = "rechazado"
        db.add(perfil_empresa)
        '''

    return {"message": "Solicitud rechazada."}