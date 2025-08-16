from fastapi import FastAPI

# Instancia de la aplicación de FastAPI
app = FastAPI()

# endpoint (una ruta) para la URL raíz ("/")
@app.get("/")
def read_root():
    return {"Hello": "World"}