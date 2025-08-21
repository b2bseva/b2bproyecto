# app/models/usuario_rol.py
from typing import Optional
from uuid import UUID
from sqlalchemy import Column, ForeignKey
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.dialects.postgresql import UUID
from app.supabase.db.db_supabase import Base
from app.models import RolModel, UserModel

class UsuarioRolModel(Base):
    __tablename__ = "usuario_rol"  # Nombre de la tabla en Supabase
    
    # Clave primaria compuesta por las dos claves foráneas
    id_usuario: Mapped[UUID] = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    id_rol: Mapped[UUID] = Column(UUID(as_uuid=True), ForeignKey("rol.id"), primary_key=True)

    # Relaciones bidireccionales para acceder al usuario y al rol asociados
    usuario: Mapped["UserModel"] = relationship(back_populates="roles")
    rol: Mapped["RolModel"] = relationship(back_populates="usuarios_asociados")
