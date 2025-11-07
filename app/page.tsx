"use client";

export default function HomePage() {
  return (
    <div>
      <h1>Portal Hunter: Awakening</h1>
      <p>Bem-vindo, caçador de portais.</p>
      <button
        onClick={() => window.location.href = "/login"}
        style={{
          padding: "10px 20px",
          marginTop: "20px",
          cursor: "pointer",
          background: "#222",
          color: "#fff",
          border: "none",
          borderRadius: "6px"
        }}
      >
        Entrar no Portal
      </button>
    </div>
  );
}
