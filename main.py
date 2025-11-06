from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Conexão com Supabase
url = "https://mygsvqcdzdntadjvfvmy.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Z3N2cWNkemRudGFkanZmdm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjM4OTYsImV4cCI6MjA3ODAzOTg5Nn0.UH5eN-qb5VIbPcBpoBEJ1lChjYiQLPuc92qtggbqRoU"

supabase: Client = create_client(url, key)

@app.get("/api/start")
def start_game():
    return {"message": "Conexão com o Portal estabelecida com sucesso!"}
