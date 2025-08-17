# app/models/perfil.py
import uuid
from sqlalchemy import Column, ForeignKey, String, Integer, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.supabase.db.db_supabase import Base # Asume que tienes una Base de SQLAlchemy

class AuthUsuario(Base):
    __tablename__ = "usuario_perfil" # Nombre de la tabla en tu BD de Supabase
    
    id_usuario = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_user = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"), nullable=False)  # relación con Supabase auth.users
    email = Column(String(80), nullable=False, unique=True)
    nombre_persona = Column(String(100), nullable=False)
    nombre_empresa = Column(String(100), nullable=False)

    # Relación con la tabla de roles
    #rol = relationship("UsuarioRol", back_populates="usuario")