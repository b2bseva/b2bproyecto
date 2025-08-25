#registro/login usando supabase

from supabase import Client, create_client
from sqlalchemy import create_engine
from app.core.config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL
from supabase.lib.client_options import ClientOptions


#options = ClientOptions(use_ssl=False)

# Supabase Auth client
#supabase_auth: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)

# Cliente para uso publico/autenticacion de usuarios (con la anon key)
supabase_auth: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Cliente para tareas administrativas (con la service_role key)
# Lo inicializaremos solo cuando sea necesario para mayor seguridad
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# SQLAlchemy engine para tu base de datos propia
#engine = create_engine(DATABASE_URL, echo=True)

