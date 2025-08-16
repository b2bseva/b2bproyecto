from pydantic import BaseModel, EmailStr

class UserOut(BaseModel):
    """
    Modelo de salida para representar los datos públicos del usuario.
    Usado por endpoints como /me.
    Modelo publico para exponer los datos del usuario autenticado.
    Atributos:
        id (str): Identificador único del usuario (UUID).
        email (EmailStr): Correo electrónico del usuario.
    """
    id: str
    email: EmailStr

