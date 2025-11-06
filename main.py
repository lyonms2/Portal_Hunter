from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import os

app = FastAPI()

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexão com Supabase usando variáveis de ambiente
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

class AuthData(BaseModel):
    email: str
    password: str

@app.get("/api/start")
def start_game():
    return {"message": "Conexão com o Portal estabelecida com sucesso!"}

@app.post("/api/signup")
def signup(data: AuthData):
    try:
        result = supabase.auth.sign_up({"email": data.email, "password": data.password})
        if result.user:
            return {"message": f"Conta criada para {data.email}"}
        else:
            return {"message": "Erro ao criar conta."}
    except Exception as e:
        return {"message": f"Erro: {str(e)}"}

@app.post("/api/login")
def login(data: AuthData):
    try:
        result = supabase.auth.sign_in_with_password({"email": data.email, "password": data.password})
        if result.session:
            return {"message": f"Bem-vindo, {data.email}!"}
        else:
            return {"message": "Credenciais inválidas."}
    except Exception as e:
        return {"message": f"Erro: {str(e)}"}
