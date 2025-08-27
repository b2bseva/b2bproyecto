# app/models/perfil_empresa.py

from typing import List, Optional
from uuid import UUID
from sqlalchemy import BIGINT, BigInteger, Column, String, Boolean, DateTime, text, ForeignKey
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.supabase.db.db_supabase import Base 
from app.models2.perfil import UserModel
from app.models2.empresa.sucursal_empresa import SucursalEmpresa
from app.models2.empresa.direccion import Direccion
from typing import TYPE_CHECKING



if TYPE_CHECKING:
    from app.models2.perfil import UserModel


class PerfilEmpresa(Base):
    __tablename__ = "perfil_empresa"
    
    id_perfil: Mapped[int] = Column(BigInteger, primary_key=True)
    
    # El user_id también debe ser UUID para la integración con Supabase Auth
    user_id: Mapped[UUID] = Column(PG_UUID(as_uuid=True), ForeignKey("auth.users.id"), nullable=False, unique=True, index=True)
    
    verificado: Mapped[bool] = Column(Boolean, nullable=False, server_default=text('false'))
    
    # La fecha de verificacion debe ser opcional (None) si no esta verificado
    fecha_verificacion: Mapped[Optional[DateTime]] = Column(DateTime(True), nullable=True)

    razon_social: Mapped[str] = Column(String(80), nullable=False)
    nombre_fantasia: Mapped[str] = Column(String(80), nullable=False)
    estado: Mapped[str] = Column(String(20), nullable=False) # 'activo', 'inactivo', 'pendiente'
    fecha_inicio: Mapped[DateTime] = Column(DateTime(True), nullable=False, server_default=text('now()'))
    fecha_fin: Mapped[Optional[DateTime]] = Column(DateTime(True), nullable=True)

    # Nota: id_direccion es una clave foranea, deberias definirla
    id_direccion: Mapped[int] = Column(BigInteger, ForeignKey('direccion.id_direccion', ondelete='SET NULL'), nullable=True)

    # Relaciones
    direccion: Mapped["Direccion"] = relationship(back_populates="perfil_empresa")
    user: Mapped["UserModel"] = relationship(back_populates="perfil_empresa")
    plan_suscripcion: Mapped[List["PlanSuscripcion"]] = relationship(back_populates="perfil_empresa")
    servicio: Mapped[List["Servicio"]] = relationship(back_populates="perfil_empresa")
    sucursal_empresa: Mapped[List["SucursalEmpresa"]] = relationship(back_populates="perfil_empresa")
    verificacion_solicitud: Mapped[List["VerificacionSolicitud"]] = relationship(back_populates="perfil_empresa")