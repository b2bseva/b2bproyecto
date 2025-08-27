# app/models/perfil.py
from typing import List, Optional
from uuid import UUID
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.dialects.postgresql import UUID
from app.supabase.db.db_supabase import Base
from app.models2.usuario_rol import UsuarioRolModel

class UserModel(Base):
    __tablename__ = "users"  # Nombre de la tabla en Supabase
    
    # Clave primaria que coincide con auth.users.id (manejada por el trigger)
    id: Mapped[UUID] = Column(UUID(as_uuid=True), primary_key=True)
    nombre_persona: Mapped[str] = Column(String(100), nullable=False)
    nombre_empresa: Mapped[str] = Column(String(100), nullable=True)

    # Relación con la tabla de unión UsuarioRol (relación muchos a muchos)
    roles: Mapped[List["UsuarioRolModel"]] = relationship(back_populates="usuario")
    # Relación con el perfil de empresa (relacion uno a muchos, un usuario puede tener un perfil de empresa)
    perfil_empresa: Mapped[List["PerfilEmpresa"]] = relationship(
        "PerfilEmpresa", 
        back_populates="user",
        primaryjoin="foreign(PerfilEmpresa.user_id) == UserModel.id"
    )
    

