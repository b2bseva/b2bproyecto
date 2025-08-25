# app/schemas/perfil_empresa.py

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List

# Importar schemas de tablas relacionadas
# from .direccion import DireccionOut
# from .plan_suscripcion import PlanSuscripcionOut
# from .servicio import ServicioOut
# from .sucursal_empresa import SucursalEmpresaOut
# from .verificacion_solicitud import VerificacionSolicitudOut

class PerfilEmpresaIn(BaseModel):
    razon_social: str
    nombre_fantasia: str
    
    # Estos campos se usarán para crear un perfil
    id_direccion: UUID 
    id_user: UUID 

class PerfilEmpresaOut(BaseModel):
    id_perfil: UUID
    user_id: UUID
    verificado: bool
    fecha_verificacion: Optional[datetime]
    razon_social: str
    nombre_fantasia: str
    estado: str
    fecha_inicio: datetime
    fecha_fin: Optional[datetime]
    
    # Aquí puedes incluir los schemas de las relaciones si quieres mostrarlas
    # direccion: Optional[DireccionOut]
    # sucursal_empresa: List[SucursalEmpresaOut] = []
    # servicio: List[ServicioOut] = []
    # verificacion_solicitud: List[VerificacionSolicitudOut] = []

    class Config:
        from_attributes = True