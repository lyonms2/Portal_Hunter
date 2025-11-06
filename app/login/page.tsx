"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setMessage("❌ Falha no login: " + error.message);
    else setMessage("✅ Portal aberto! Bem-vindo, caçador.");
  }

  return (
    <main style={{ textAlign: "center", padding: "50px" }}>
      <h1>Login do Caçador</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", margin: "10px auto", padding: "10px" }}
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", margin: "10px auto", padding: "10px" }}
      />
      <button onClick={handleLogin} style={{ padding: "10px 20px" }}>
        Entrar
      </button>
      <p style={{ marginTop: "20px" }}>{message}</p>
    </main>
  );
}
