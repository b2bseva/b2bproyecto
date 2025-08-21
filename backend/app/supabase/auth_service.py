#registro/login usando supabase

from supabase import Client, create_client
from sqlalchemy import create_engine
from app.core.config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL


# Supabase Auth client
supabase_auth: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)

# SQLAlchemy engine para tu base de datos propia
#engine = create_engine(DATABASE_URL, echo=True)

