"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MissoesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [avatarAtivo, setAvatarAtivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalSelecionado, setPortalSelecionado] = useState(null);
  const [filtroElemento, setFiltroElemento] = useState('todos');
  const [filtroDificuldade, setFiltroDificuldade] = useState('todas');

  // Base de portais/missões
  const portais = [
    {
      id: 1,
      nome: "Ruínas Flamejantes",
      elemento: "Fogo",
      dificuldade: "Fácil",
      nivelMin: 1,
      nivelMax: 5,
      descricao: "Um portal menor emana calor intenso. Criaturas de fogo básicas rondam as ruínas.",
      recompensas: { xp: 150, ouro: 50 },
      emoji: "🔥",
      cor: "from-orange-600 to-red-600",
      corBorda: "border-orange-500/50",
      exaustaoGanha: 15
    },
    {
      id: 2,
      nome: "Caverna Aquática",
      elemento: "Água",
      dificuldade: "Fácil",
      nivelMin: 1,
      nivelMax: 5,
      descricao: "Águas místicas borbulham do portal. Espíritos aquáticos menores emergem constantemente.",
      recompensas: { xp: 150, ouro: 50 },
      emoji: "💧",
      cor: "from-blue-600 to-cyan-600",
      corBorda: "border-blue-500/50",
      exaustaoGanha: 15
    },
    {
      id: 3,
      nome: "Desfiladeiro Ventoso",
      elemento: "Vento",
      dificuldade: "Média",
      nivelMin: 4,
      nivelMax: 8,
      descricao: "Ventos cortantes emanam do portal. Elementais de ar dançam em redemoinhos violentos.",
      recompensas: { xp: 300, ouro: 120 },
      emoji: "💨",
      cor: "from-cyan-600 to-teal-600",
      corBorda: "border-cyan-500/50",
      exaustaoGanha: 25
    },
    {
      id: 4,
      nome: "Templo Elétrico",
      elemento: "Eletricidade",
      dificuldade: "Média",
      nivelMin: 4,
      nivelMax: 8,
      descricao: "Raios crepitam ao redor do portal. A energia elétrica distorce o ar ao seu redor.",
      recompensas: { xp: 300, ouro: 120 },
      emoji: "⚡",
      cor: "from-yellow-600 to-amber-600",
      corBorda: "border-yellow-500/50",
      exaustaoGanha: 25
    },
    {
      id: 5,
      nome: "Floresta Enraizada",
      elemento: "Terra",
      dificuldade: "Média",
      nivelMin: 5,
      nivelMax: 9,
      descricao: "Raízes antigas protegem o portal. Golems de pedra patrulham o perímetro.",
      recompensas: { xp: 350, ouro: 150 },
      emoji: "🪨",
      cor: "from-amber-700 to-stone-700",
      corBorda: "border-amber-600/50",
      exaustaoGanha: 30
    },
    {
      id: 6,
      nome: "Vulcão Primordial",
      elemento: "Fogo",
      dificuldade: "Difícil",
      nivelMin: 8,
      nivelMax: 12,
      descricao: "Lava escorre do portal dimensional. Demônios de fogo guardam a entrada.",
      recompensas: { xp: 600, ouro: 300 },
      emoji: "🌋",
      cor: "from-red-700 to-orange-700",
      corBorda: "border-red-600/50",
      exaustaoGanha: 40
    },
    {
      id: 7,
      nome: "Abismo das Sombras",
      elemento: "Sombra",
      dificuldade: "Difícil",
      nivelMin: 10,
      nivelMax: 15,
      descricao: "Escuridão viva flui do portal. Criaturas das trevas espreitam nas sombras.",
      recompensas: { xp: 700, ouro: 400 },
      emoji: "🌑",
      cor: "from-purple-900 to-black",
      corBorda: "border-purple-700/50",
      exaustaoGanha: 45
    },
    {
      id: 8,
      nome: "Santuário da Luz",
      elemento: "Luz",
      dificuldade: "Extrema",
      nivelMin: 12,
      nivelMax: 20,
      descricao: "Energia radiante emana do portal. Arautos celestiais testam os dignos.",
      recompensas: { xp: 1000, ouro: 600 },
      emoji: "✨",
      cor: "from-yellow-400 to-white",
      corBorda: "border-yellow-400/50",
      exaustaoGanha: 50
    },
    {
      id: 9,
      nome: "Maelstrom Abissal",
      elemento: "Água",
      dificuldade: "Extrema",
      nivelMin: 15,
      nivelMax: 20,
      descricao: "Um vórtice de água dimensional. Leviatãs antigos emergem das profundezas.",
      recompensas: { xp: 1200, ouro: 700 },
      emoji: "🌊",
      cor: "from-blue-900 to-indigo-900",
      corBorda: "border-blue-700/50",
      exaustaoGanha: 55
    },
    {
      id: 10,
      nome: "Nexus do Caos",
      elemento: "Todos",
      dificuldade: "Lendária",
      nivelMin: 18,
      nivelMax: 99,
      descricao: "O portal supremo. Todos os elementos convergem. Apenas os mais poderosos podem entrar.",
      recompensas: { xp: 2000, ouro: 1500 },
      emoji: "🌀",
      cor: "from-purple-600 via-pink-600 to-cyan-600",
      corBorda: "border-purple-500/70",
      exaustaoGanha: 70
    }
  ];

  useEffect(() => {
    const init = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        router.push("/login");
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      try {
        const response = await fetch(`/api/meus-avatares?userId=${parsedUser.id}`);
        const data = await response.json();
        
        if (response.ok) {
          const ativo = data.avatares.find(av => av.ativo && av.vivo);
          setAvatarAtivo(ativo);
        }
      } catch (error) {
        console.error("Erro ao carregar avatar:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const getDificuldadeCor = (dificuldade) => {
    switch (dificuldade) {
      case 'Fácil': return 'text-green-400';
      case 'Média': return 'text-yellow-400';
      case 'Difícil': return 'text-orange-400';
      case 'Extrema': return 'text-red-400';
      case 'Lendária': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const podeEntrarNoPortal = (portal) => {
    if (!avatarAtivo) return { pode: false, motivo: "Nenhum avatar ativo" };
    
    if (avatarAtivo.nivel < portal.nivelMin) {
      return { pode: false, motivo: `Nível mínimo: ${portal.nivelMin}` };
    }
    
    if (avatarAtivo.exaustao >= 80) {
      return { pode: false, motivo: "Avatar muito exausto" };
    }
    
    return { pode: true, motivo: null };
  };

  const iniciarMissao = (portal) => {
    const verificacao = podeEntrarNoPortal(portal);
    
    if (!verificacao.pode) {
      alert(verificacao.motivo);
      return;
    }
    
    // Aqui vai a lógica de iniciar a missão
    // Por enquanto só selecionamos
    setPortalSelecionado(portal);
  };

  const portaisFiltrados = portais.filter(portal => {
    const matchElemento = filtroElemento === 'todos' || portal.elemento === filtroElemento || portal.elemento === 'Todos';
    const matchDificuldade = filtroDificuldade === 'todas' || portal.dificuldade === filtroDificuldade;
    return matchElemento && matchDificuldade;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse">Escaneando portais...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-gray-100 relative overflow-hidden">
      {/* Efeitos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl top-20 left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl bottom-20 right-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Grade dimensional */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDAgTCA2MCAwIEwgNjAgNjAgTCAwIDYwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3lhbiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent mb-3">
              PORTAIS DIMENSIONAIS
            </h1>
            <p className="text-slate-400 font-mono text-sm">
              Escolha um portal para fechar e ganhe experiência e recompensas
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 font-mono text-sm group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> 
              <span>VOLTAR</span>
            </button>
          </div>
        </div>

        {/* Avatar Ativo Info */}
        {avatarAtivo ? (
          <div className="mb-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur opacity-75"></div>
              
              <div className="relative bg-slate-900/80 backdrop-blur border border-cyan-900/30 rounded-lg p-6">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-4xl">
                      ⚔️
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-cyan-300">{avatarAtivo.nome}</h3>
                      <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-purple-400">
                        Nível {avatarAtivo.nivel}
                      </span>
                      <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono">
                        {avatarAtivo.elemento}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Força</div>
                        <div className="text-sm font-bold text-red-400">{avatarAtivo.forca}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Agilidade</div>
                        <div className="text-sm font-bold text-green-400">{avatarAtivo.agilidade}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Resistência</div>
                        <div className="text-sm font-bold text-blue-400">{avatarAtivo.resistencia}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Exaustão</div>
                        <div className={`text-sm font-bold ${
                          avatarAtivo.exaustao >= 80 ? 'text-red-400' :
                          avatarAtivo.exaustao >= 60 ? 'text-orange-400' :
                          avatarAtivo.exaustao >= 40 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {avatarAtivo.exaustao || 0}/100
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Nenhum Avatar Ativo</h3>
            <p className="text-slate-400 text-sm mb-4">
              Você precisa ter um avatar ativo para entrar em missões
            </p>
            <button
              onClick={() => router.push("/avatares")}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold transition-colors"
            >
              Ativar Avatar
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-slate-500 uppercase mb-2">Elemento</label>
            <select
              value={filtroElemento}
              onChange={(e) => setFiltroElemento(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="todos">Todos</option>
              <option value="Fogo">🔥 Fogo</option>
              <option value="Água">💧 Água</option>
              <option value="Terra">🪨 Terra</option>
              <option value="Vento">💨 Vento</option>
              <option value="Eletricidade">⚡ Eletricidade</option>
              <option value="Sombra">🌑 Sombra</option>
              <option value="Luz">✨ Luz</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 uppercase mb-2">Dificuldade</label>
            <select
              value={filtroDificuldade}
              onChange={(e) => setFiltroDificuldade(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="todas">Todas</option>
              <option value="Fácil">Fácil</option>
              <option value="Média">Média</option>
              <option value="Difícil">Difícil</option>
              <option value="Extrema">Extrema</option>
              <option value="Lendária">Lendária</option>
            </select>
          </div>
        </div>

        {/* Grid de Portais */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portaisFiltrados.map((portal) => {
            const verificacao = podeEntrarNoPortal(portal);
            
            return (
              <div key={portal.id} className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r ${portal.cor} rounded-lg blur opacity-20 group-hover:opacity-40 transition-all duration-300`}></div>
                
                <div className={`relative bg-slate-900/90 backdrop-blur border-2 ${portal.corBorda} rounded-lg overflow-hidden transition-all duration-300 ${!verificacao.pode ? 'opacity-60' : 'group-hover:scale-105'}`}>
                  {/* Header do Portal */}
                  <div className={`bg-gradient-to-r ${portal.cor} p-4 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="text-4xl">{portal.emoji}</div>
                      <div className={`px-3 py-1 bg-black/30 rounded-full text-xs font-bold ${getDificuldadeCor(portal.dificuldade)}`}>
                        {portal.dificuldade}
                      </div>
                    </div>
                  </div>

                  {/* Corpo do Portal */}
                  <div className="p-5">
                    <h3 className="text-xl font-black text-slate-100 mb-2">
                      {portal.nome}
                    </h3>
                    
                    <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                      {portal.descricao}
                    </p>

                    {/* Info Rápida */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="text-xs text-slate-500">Nível</div>
                        <div className="text-sm font-bold text-cyan-400">{portal.nivelMin} - {portal.nivelMax}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="text-xs text-slate-500">Elemento</div>
                        <div className="text-sm font-bold">{portal.elemento}</div>
                      </div>
                    </div>

                    {/* Recompensas */}
                    <div className="bg-slate-800/30 rounded-lg p-3 mb-4">
                      <div className="text-xs text-slate-500 uppercase mb-2">Recompensas</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm font-bold text-yellow-400">{portal.recompensas.xp} XP</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400">💰</span>
                          <span className="text-sm font-bold text-amber-400">{portal.recompensas.ouro} Ouro</span>
                        </div>
                      </div>
                      <div className="text-xs text-red-400 mt-2">
                        +{portal.exaustaoGanha} Exaustão
                      </div>
                    </div>

                    {/* Botão de Ação */}
                    {verificacao.pode ? (
                      <button
                        onClick={() => iniciarMissao(portal)}
                        className={`w-full py-3 rounded-lg font-bold bg-gradient-to-r ${portal.cor} hover:opacity-90 transition-all transform hover:scale-105`}
                      >
                        ENTRAR NO PORTAL
                      </button>
                    ) : (
                      <div className="w-full py-3 rounded-lg font-bold bg-slate-800 text-slate-500 text-center">
                        🔒 {verificacao.motivo}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {portaisFiltrados.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20">🌀</div>
            <p className="text-slate-500 text-lg">Nenhum portal encontrado com esses filtros</p>
          </div>
        )}
      </div>

      {/* Modal de Portal Selecionado (preparação para PixiJS) */}
      {portalSelecionado && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setPortalSelecionado(null)}
        >
          <div 
            className="max-w-4xl w-full bg-slate-900 rounded-lg p-8 border-2 border-cyan-500/50"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-black text-center mb-4">
              {portalSelecionado.emoji} {portalSelecionado.nome}
            </h2>
            <p className="text-center text-slate-400 mb-8">
              Aqui será renderizado o combate com PixiJS
            </p>
            
            <div className="bg-slate-800 rounded-lg h-96 flex items-center justify-center mb-6">
              <div className="text-6xl animate-pulse">{portalSelecionado.emoji}</div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setPortalSelecionado(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 rounded-lg font-bold transition-all"
              >
                Iniciar Combate
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}
