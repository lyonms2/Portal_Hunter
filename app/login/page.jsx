"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();
    alert(data.message);
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Entrada do Portal</h1>
      <p>Identifique-se, caçador.</p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", margin: "1rem auto", padding: "0.5rem" }}
      />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        style={{ display: "block", margin: "1rem auto", padding: "0.5rem" }}
      />

      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          marginTop: "10px",
          background: "#222",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Entrar
      </button>
    </div>
  );
}
