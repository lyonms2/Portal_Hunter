from http.server import BaseHTTPRequestHandler
import json
from supabase import create_client, Client
import os

# === Configuração Supabase ===
SUPABASE_URL = "https://mygsvqcdzdntadjvfvmy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Z3N2cWNkemRudGFkanZmdm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjM4OTYsImV4cCI6MjA3ODAzOTg5Nn0.UH5eN-qb5VIbPcBpoBEJ1lChjYiQLPuc92qtggbqRoU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            message = {"message": "Conexão com o Portal estabelecida com sucesso!"}
            self.wfile.write(json.dumps(message).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/api/login":
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data)

            email = body.get("email")
            password = body.get("password")

            # tentativa de login via Supabase
            try:
                auth_response = supabase.auth.sign_in_with_password({
                    "email": email,
                    "password": password
                })
                data = {
                    "message": "Login bem-sucedido!",
                    "user": str(auth_response.user.id) if auth_response.user else None
                }
                self.send_response(200)
            except Exception as e:
                data = {"error": str(e)}
                self.send_response(400)

            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode())

        else:
            self.send_response(404)
            self.end_headers()
