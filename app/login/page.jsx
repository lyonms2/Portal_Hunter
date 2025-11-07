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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-gray-100 relative overflow-hidden">
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl top-20 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/5 rounded-full blur-3xl bottom-20 -right-48 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Grid hexagonal */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yOCAwTDAgMTVWMzVMMjggNTBMNTYgMzVWMTVaTTI4IDUwTDAgNjVWODVMMjggMTAwTDU2IDg1VjY1WiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY3lhbiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')] pointer-events-none"></div>

      {/* Vinheta */}
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.9)] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Botão Voltar */}
        <button
          onClick={() => window.location.href = "/"}
          className="absolute top-8 left-8 text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 font-mono text-sm group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> 
          <span>RETORNAR</span>
        </button>

        {/* Container do formulário */}
        <div className="w-full max-w-lg">
          {/* Cabeçalho */}
          <div className="text-center mb-10">
            <div className="inline-block relative mb-4">
              <h2 className="text-5xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                AUTENTICAÇÃO
              </h2>
              <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            </div>
            <p className="text-slate-400 font-mono text-sm mt-6">Identifique-se para acessar o sistema</p>
          </div>

          {/* Formulário */}
          <div className="relative group mb-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            
            <div className="relative bg-slate-950/90 backdrop-blur-xl border border-cyan-900/30 rounded-lg p-8 shadow-2xl">
              {/* Email */}
              <div className="mb-6">
                <label className="block text-cyan-400 text-xs uppercase tracking-widest mb-3 font-mono">
                  ID de Usuário
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="hunter@zone-7.net"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-900/80 border border-slate-700/50 rounded text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Senha */}
              <div className="mb-8">
                <label className="block text-cyan-400 text-xs uppercase tracking-widest mb-3 font-mono">
                  Código de Acesso
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-900/80 border border-slate-700/50 rounded text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Botão de Login */}
              <button
                onClick={handleLogin}
                className="w-full group/btn relative mb-6"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded blur opacity-40 group-hover/btn:opacity-75 transition-all duration-300"></div>
                
                <div className="relative px-6 py-4 bg-slate-950 rounded border border-cyan-500/50 group-hover/btn:border-cyan-400 transition-all">
                  <span className="text-lg font-bold tracking-wider uppercase bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    Iniciar Sessão
                  </span>
                </div>
              </button>

              {/* Links de recuperação */}
              <div className="flex items-center justify-between text-xs font-mono">
                <button className="text-slate-500 hover:text-cyan-400 transition-colors">
                  Recuperar acesso
                </button>
                <span className="text-slate-700">|</span>
                <button className="text-slate-500 hover:text-cyan-400 transition-colors">
                  Novo hunter
                </button>
              </div>
            </div>
          </div>

          {/* Aviso de segurança */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-amber-500/10 rounded blur"></div>
            <div className="relative bg-slate-950/50 backdrop-blur border border-amber-900/20 rounded p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-amber-400/80 font-mono leading-relaxed">
                    AVISO: Acesso restrito a operadores certificados. Exposição prolongada 
                    a anomalias dimensionais pode causar efeitos psicológicos permanentes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Efeito de scan */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent animate-scan"></div>
      </div>
    </div>
  );
}
