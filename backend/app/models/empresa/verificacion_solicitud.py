# app/models/verificacion_solicitud.py

from typing import List, Optional
from datetime import datetime
from sqlalchemy import Column, String, BigInteger, DateTime, text, ForeignKey
from sqlalchemy.orm import relationship, Mapped
from app.supabase.db.db_supabase import Base # Importación de la base declarativa
#from app.models.empresa.perfil_empresa import PerfilEmpresa
from app.models.empresa.documento import Documento
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.empresa.documento import Documento

class VerificacionSolicitud(Base):
    """
    Modelo que representa las solicitudes de verificación de proveedores.
    """
    __tablename__ = 'verificacion_solicitud'

    # El id_verificacion es de tipo BIGINT y se deja que la base de datos lo autogenere.
    id_verificacion: Mapped[int] = Column(BigInteger, primary_key=True)
    
    fecha_solicitud: Mapped[datetime] = Column(DateTime(True), nullable=False, server_default=text('now()'))
    # fecha_revision puede ser nula si la solicitud aún no ha sido revisada.
    fecha_revision: Mapped[Optional[datetime]] = Column(DateTime(True), nullable=True) 
    estado: Mapped[str] = Column(String(20), nullable=False) # ej. 'pendiente', 'aprobada', 'rechazada'
    comentario: Mapped[Optional[str]] = Column(String(1000), nullable=True)
    created_at: Mapped[datetime] = Column(DateTime(True), server_default=text('now()'))

    # Clave foránea al perfil de empresa, usando BIGINT
    id_perfil: Mapped[int] = Column(BigInteger, ForeignKey('perfil_empresa.id_perfil', ondelete='CASCADE'), nullable=False, index=True)

    # Relaciones con otras tablas
    perfil_empresa: Mapped["PerfilEmpresa"] = relationship(back_populates='verificacion_solicitud')
    documento: Mapped[List["Documento"]] = relationship(back_populates='verificacion_solicitud')