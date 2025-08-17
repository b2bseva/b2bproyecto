# app/models/user.py

from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.supabase.db.db_supabase import Base # Asume que tienes una Base de SQLAlchemy

class AuthUsuario(Base):
    __tablename__ = "perfil" # Nombre de la tabla en tu BD de Supabase
    
    id_usuario = Column(UUID(as_uuid=True), primary_key=True)
    email = Column(String(80), nullable=False, unique=True)
    nombre_persona = Column(String(100), nullable=False)
    nombre_empresa = Column(String(100), nullable=False)

    # Relación con la tabla de roles
    rol = relationship("UsuarioRol", back_populates="usuario")

class Rol(Base):
    __tablename__ = "rol"

    id_rol = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False, unique=True)
    descripcion = Column(String(200), nullable=True)

    usuario = relationship("UsuarioRol", back_populates="rol")

class UsuarioRol(Base):
    __tablename__ = "usuario_rol"

    id_usuario = Column(UUID(as_uuid=True), primary_key=True)
    id_rol = Column(UUID(as_uuid=True), primary_key=True)

    usuario = relationship("AuthUsuario", back_populates="rol")
    rol = relationship("Rol", back_populates="usuario")