"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar se está logado
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("session");
    router.push("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-cyan-400 font-mono">Carregando...</div>
      </div>
    );
  }

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

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-2">
              CENTRAL DE COMANDO
            </h1>
            <p className="text-slate-400 font-mono text-sm">Bem-vindo de volta, Hunter</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="group relative px-6 py-3"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/30 to-red-600/30 rounded blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative px-6 py-3 bg-slate-950 rounded border border-red-500/50 group-hover:border-red-400 transition-all">
              <span className="text-sm font-bold tracking-wider uppercase text-red-400">
                Sair
              </span>
            </div>
          </button>
        </div>

        {/* Info do usuário */}
        <div className="max-w-4xl mx-auto">
          <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-lg blur opacity-50"></div>
            
            <div className="relative bg-slate-950/80 backdrop-blur-xl border border-cyan-900/30 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-cyan-400">{user.email}</h2>
                  <p className="text-slate-400 font-mono text-sm">ID: {user.id.slice(0, 8)}...</p>
                </div>
              </div>
              
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-4"></div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-900/50 rounded p-4">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">0</div>
                  <div className="text-xs text-slate-500 uppercase font-mono">Missões</div>
                </div>
                <div className="bg-slate-900/50 rounded p-4">
                  <div className="text-2xl font-bold text-purple-400 mb-1">1</div>
                  <div className="text-xs text-slate-500 uppercase font-mono">Nível</div>
                </div>
                <div className="bg-slate-900/50 rounded p-4">
                  <div className="text-2xl font-bold text-blue-400 mb-1">0</div>
                  <div className="text-xs text-slate-500 uppercase font-mono">Artefatos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mensagem temporária */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-blue-500/10 rounded blur"></div>
            <div className="relative bg-slate-950/50 backdrop-blur border border-blue-900/20 rounded p-6">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-blue-400 font-bold mb-2">Sistema em Desenvolvimento</h3>
                  <p className="text-sm text-slate-300 font-mono leading-relaxed">
                    O sistema de missões e gameplay está sendo construído. 
                    Em breve você poderá explorar portais, enfrentar criaturas do Vazio 
                    e coletar artefatos ancestrais.
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
