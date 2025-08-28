# config.py
from dotenv import load_dotenv
import os

#busca automáticamente el archivo .env en la raíz del proyecto
# y carga las variables de entorno definidas en él
load_dotenv()  # Lee .env

# Supabase Auth
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SERVICE_ROLE")

#PostgreSQL Supabase
DATABASE_URL = os.getenv("DATABASE_URL")

#PostgreSQL Local
DATABASE_URL_LOCAL = os.getenv("DATABASE_URL_LOCAL")

# PostgreSQL
DB_HOST     = os.getenv("DB_HOST")
DB_PORT     = os.getenv("DB_PORT")
DB_NAME     = os.getenv("DB_NAME")
DB_USER     = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

#DATABASE_URL = (f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

#IDRIVE2
IDRIVE_ENDPOINT_URL = os.getenv("IDRIVE_ENDPOINT_URL")
IDRIVE_ACCESS_KEY_ID = os.getenv("IDRIVE_ACCESS_KEY_ID")
IDRIVE_SECRET_ACCESS_KEY = os.getenv("IDRIVE_SECRET_ACCESS_KEY")
print(f"la clave secreta es :{IDRIVE_SECRET_ACCESS_KEY}")
IDRIVE_BUCKET_NAME = os.getenv("IDRIVE_BUCKET_NAME")


#Weaviate
#WEAVIATE_URL = os.getenv("WEAVIATE_URL")
#WEAVIATE_API_KEY = os.getenv("WEAVIATE_API_KEY")
WEAVIATE_URL = os.getenv("WEAVIATE_URL")