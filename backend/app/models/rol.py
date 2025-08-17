# app/models/rol
# .py
import uuid
from sqlalchemy import Column, ForeignKey, String, Integer, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.supabase.db.db_supabase import Base # Asume que tienes una Base de SQLAlchemy

class Rol(Base):
    __tablename__ = "rol"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False, unique=True)
    descripcion = Column(String(200), nullable=True)

    # Relación con la tabla de usuarios
    usuarios = relationship("UsuarioRol", back_populates="rol")