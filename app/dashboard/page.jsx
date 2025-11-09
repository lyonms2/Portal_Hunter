"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundEffects from "@/components/BackgroundEffects";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePlayer = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        router.push("/login");
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Inicializar stats do jogador
      try {
        const response = await fetch("/api/inicializar-jogador", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: parsedUser.id }),
        });

        const data = await response.json();
        console.log("Resposta da API:", data);
        setStats(data.stats);
      } catch (error) {
        console.error("Erro ao inicializar:", error);
      } finally {
        setLoading(false);
      }
    };

    initializePlayer();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse">Inicializando sistema...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-gray-100 relative overflow-hidden">
      <BackgroundEffects />

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

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Info do Jogador */}
          <div className="lg:col-span-2">
            {/* Card de Perfil */}
            <div className="relative group mb-6">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-lg blur opacity-50"></div>
              
              <div className="relative bg-slate-950/80 backdrop-blur-xl border border-cyan-900/30 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-cyan-400">{user?.email}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-slate-400 font-mono text-sm">ID: {user?.id?.slice(0, 8)}...</span>
                      <span className="px-2 py-1 bg-slate-800 rounded text-xs font-bold text-purple-400">
                        RANK {stats?.ranking || 'F'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-4"></div>
                
                {/* Recursos */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900/50 rounded p-3 border border-amber-500/20">
                    <div className="text-xs text-slate-500 uppercase font-mono mb-1">Moedas</div>
                    <div className="text-2xl font-bold text-amber-400">{stats?.moedas || 0}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded p-3 border border-purple-500/20">
                    <div className="text-xs text-slate-500 uppercase font-mono mb-1">Fragmentos</div>
                    <div className="text-2xl font-bold text-purple-400">{stats?.fragmentos || 0}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded p-3 border border-red-500/20">
                    <div className="text-xs text-slate-500 uppercase font-mono mb-1">Dívida</div>
                    <div className="text-2xl font-bold text-red-400">{stats?.divida || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded blur"></div>
              <div className="relative bg-slate-950/50 backdrop-blur border border-slate-800/50 rounded p-6">
                <h3 className="text-cyan-400 font-bold mb-4 text-sm uppercase tracking-wider">Estatísticas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Missões Completadas</div>
                    <div className="text-xl font-bold text-slate-300">{stats?.missoes_completadas || 0}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Avatares Ativos</div>
                    <div className="text-xl font-bold text-slate-300">0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Ações Rápidas */}
          <div className="space-y-4">
            {/* Botão Invocar Avatar */}
            <button
              onClick={() => router.push("/ocultista")}
              className="w-full group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-all duration-300"></div>
              
              <div className="relative bg-slate-950 rounded-lg border border-purple-500/50 group-hover:border-purple-400 transition-all p-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🔮</div>
                  <div className="text-lg font-bold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent mb-1">
                    INVOCAR AVATAR
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {stats?.primeira_invocacao ? "Primeira invocação: GRATUITA" : "Custo: 100 moedas"}
                  </div>
                </div>
              </div>
            </button>

            {/* Botão Meus Avatares */}
            <button
              onClick={() => router.push("/avatares")}
              className="w-full group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              
              <div className="relative bg-slate-950/80 backdrop-blur border border-cyan-900/30 rounded p-4 group-hover:border-cyan-500/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">⚔️</div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-cyan-400 text-sm">Meus Avatares</div>
                    <div className="text-xs text-slate-500">Gerenciar coleção</div>
                  </div>
                  <div className="text-cyan-400">→</div>
                </div>
              </div>
            </button>

            {/* Botão Missões (desabilitado) */}
            <button
              disabled
              className="w-full group relative opacity-50 cursor-not-allowed"
            >
              <div className="relative bg-slate-950/80 backdrop-blur border border-slate-800/30 rounded p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🌀</div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-slate-500 text-sm">Missões</div>
                    <div className="text-xs text-slate-600">Em breve...</div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
