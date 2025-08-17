# app/models/usuario_rol.py
import uuid
from sqlalchemy import Column, ForeignKey, String, Integer, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.supabase.db.db_supabase import Base # Asume que tienes una Base de SQLAlchemy

class UsuarioRol(Base):
    __tablename__ = "usuario_rol"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_user = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"), nullable=False)  # relación con Supabase auth.users
    id_rol = Column(UUID(as_uuid=True), ForeignKey("rol.id"), nullable=False)

   # Relación con la tabla de roles
    rol = relationship("Rol", back_populates="usuario")