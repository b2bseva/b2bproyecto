import uuid
from app.idrive.idrive_service import idrive_s3_client
from app.core.config import IDRIVE_BUCKET_NAME, IDRIVE_ENDPOINT_URL
from botocore.exceptions import NoCredentialsError, ClientError
from fastapi import UploadFile


async def upload_file_to_idrive(file: UploadFile, user_id: str, file_type: str) -> str:
    """
    Sube un archivo a iDrive y devuelve la URL del archivo subido.
    
    parametro file: Archivo a subir (debe ser un objeto UploadFile de FastAPI).
    parametro user_id: ID del usuario que sube el archivo (para organizar en carpetas).
    parametro file_type: Tipo de archivo (para organizar en carpetas).
    return: URL del archivo subido.
    """
    try:
        # Construir el nombre del archivo y la ruta en iDrive
        file_extension = file.filename.split('.')[-1]
        idrive_file_key = f"{user_id}/{file_type}/{uuid.uuid4()}.{file_extension}"
        
        # Subir el archivo a iDrive
        idrive_s3_client.upload_fileobj(
            file.file,
            IDRIVE_BUCKET_NAME,
            idrive_file_key,
            ExtraArgs={"ACL": "public-read"}  # Hacer el archivo público
        )
        
        # Construir la URL pública del archivo subido
        idrive_file_url = f"{IDRIVE_ENDPOINT_URL}/{IDRIVE_BUCKET_NAME}/{idrive_file_key}"
        
        return idrive_file_url
    
    except NoCredentialsError:
        raise ValueError("Credenciales de iDrive no encontradas.")
    except ClientError as e:
        raise ValueError(f"Error al subir el archivo a iDrive: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error inesperado: {str(e)}")