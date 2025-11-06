"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main style={{ textAlign: "center", padding: "50px" }}>
      <h1>🌀 Portal Hunter: Awakening</h1>
      <p>Bem-vindo, caçador de portais.</p>
      <button
        onClick={() => router.push("/login")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Entrar no Portal
      </button>
    </main>
  );
}
