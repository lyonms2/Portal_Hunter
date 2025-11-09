"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundEffects from "@/components/BackgroundEffects";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [avatares, setAvatares] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para gerar código de caçador
  const gerarCodigoCacador = (userId) => {
    const prefixo = userId.slice(0, 3).toUpperCase();
    const sufixo = userId.slice(-3).toUpperCase();
    return `HNT-${prefixo}-${sufixo}`;
  };

  // Função para gerar nome de caçador
  const gerarNomeCacador = (email) => {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  // Função para calcular dias desde o registro
  const calcularDiasRegistro = () => {
    if (!stats?.created_at) return 0;
    
    const dataRegistro = new Date(stats.created_at);
    const hoje = new Date();
    const diferencaMs = hoje - dataRegistro;
    const dias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
    
    // Retornar pelo menos 1 dia se for o mesmo dia
    return dias === 0 ? 1 : dias;
  };

  // Função para determinar classificação baseada em stats
  const getClassificacao = () => {
    const totalMissoes = stats?.missoes_completadas || 0;
    const totalAvatares = avatares.length;
    
    if (totalMissoes >= 50 || totalAvatares >= 10) return { nome: "ELITE", cor: "text-amber-400" };
    if (totalMissoes >= 25 || totalAvatares >= 5) return { nome: "VETERANO", cor: "text-purple-400" };
    if (totalMissoes >= 10 || totalAvatares >= 3) return { nome: "EXPERIENTE", cor: "text-blue-400" };
    if (totalMissoes >= 1 || totalAvatares >= 1) return { nome: "ATIVO", cor: "text-green-400" };
    return { nome: "RECRUTA", cor: "text-slate-400" };
  };

  useEffect(() => {
    const initializePlayer = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        router.push("/login");
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      try {
        const response = await fetch("/api/inicializar-jogador", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: parsedUser.id }),
        });

        const data = await response.json();
        setStats(data.stats);

        const avatarResponse = await fetch(`/api/meus-avatares?userId=${parsedUser.id}`);
        const avatarData = await avatarResponse.json();
        setAvatares(avatarData.avatares || []);
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

  const classificacao = getClassificacao();

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
            <p className="text-slate-400 font-mono text-sm">Bem-vindo de volta, Caçador!</p>
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
            {/* Carteira de Identidade de Caçador */}
            <div className="relative group mb-6">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-lg blur opacity-50"></div>
              
              <div className="relative bg-slate-950/90 backdrop-blur-xl border-2 border-cyan-900/50 rounded-lg overflow-hidden">
                {/* Header da Carteira */}
                <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-b border-cyan-500/30 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded border border-cyan-500/50 flex items-center justify-center">
                        <span className="text-cyan-400 text-xl">🛡️</span>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Organização de Caçadores Dimensionais</div>
                        <div className="text-sm font-bold text-cyan-400">CARTEIRA OFICIAL</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-mono">ID DE REGISTRO</div>
                      <div className="text-sm font-bold text-cyan-400 font-mono">{gerarCodigoCacador(user?.id)}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex gap-6 mb-6">
                    {/* Foto/Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center border-2 border-cyan-400/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
                        <span className="text-6xl font-black text-white z-10 drop-shadow-lg">
                          {user?.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-2 text-center">
                        <div className={`text-xs font-bold ${classificacao.cor} font-mono`}>
                          {classificacao.nome}
                        </div>
                      </div>
                    </div>

                    {/* Informações do Caçador */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="text-xs text-slate-500 uppercase font-mono mb-1">Nome de Operação</div>
                        <div className="text-2xl font-bold text-cyan-400">{gerarNomeCacador(user?.email)}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-slate-500 uppercase font-mono mb-1">Ranking</div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-purple-400">{stats?.ranking || 'F'}</span>
                            <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400 font-mono">
                              CLASSE
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 uppercase font-mono mb-1">Dias Ativos</div>
                          <div className="text-lg font-bold text-slate-300">{calcularDiasRegistro()} dias</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500 uppercase font-mono mb-1">Status Operacional</div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-400 font-bold">ATIVO E OPERACIONAL</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-4"></div>

                  {/* Recursos */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-900/50 rounded p-3 border border-amber-500/20">
                      <div className="text-xs text-slate-500 uppercase font-mono mb-1">💰 Moedas</div>
                      <div className="text-xl font-bold text-amber-400">{stats?.moedas || 0}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded p-3 border border-purple-500/20">
                      <div className="text-xs text-slate-500 uppercase font-mono mb-1">💎 Fragmentos</div>
                      <div className="text-xl font-bold text-purple-400">{stats?.fragmentos || 0}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded p-3 border border-red-500/20">
                      <div className="text-xs text-slate-500 uppercase font-mono mb-1">🔴 Dívida</div>
                      <div className="text-xl font-bold text-red-400">{stats?.divida || 0}</div>
                    </div>
                  </div>

                  {/* Selo de Autenticidade */}
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-cyan-500/20 rounded-full border border-cyan-500/50 flex items-center justify-center">
                        <span className="text-cyan-400 text-xs">✓</span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">DOCUMENTO VERIFICADO</span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono">OCD-2025 // v2.1.4</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded blur"></div>
              <div className="relative bg-slate-950/50 backdrop-blur border border-slate-800/50 rounded p-6">
                <h3 className="text-cyan-400 font-bold mb-4 text-sm uppercase tracking-wider">Estatísticas de Campo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-500 text-xs mb-1">✅ Missões Completadas</div>
                    <div className="text-xl font-bold text-slate-300">{stats?.missoes_completadas || 0}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs mb-1">🔵 Total de Avatares</div>
                    <div className="text-xl font-bold text-slate-300">{avatares.length}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs mb-1">💚 Avatares Vivos</div>
                    <div className="text-xl font-bold text-green-400">{avatares.filter(av => av.vivo).length}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs mb-1">☠️ Avatares Mortos</div>
                    <div className="text-xl font-bold text-red-400">{avatares.filter(av => !av.vivo).length}</div>
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

