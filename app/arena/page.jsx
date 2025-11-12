"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ArenaPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [avatares, setAvatares] = useState([]);
  const [avatarSelecionado, setAvatarSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dificuldadeSelecionada, setDificuldadeSelecionada] = useState('normal');
  const [iniciandoBatalha, setIniciandoBatalha] = useState(false);

  const dificuldades = {
    facil: {
      nome: "Recruta",
      emoji: "🟢",
      descricao: "Inimigo fraco, ideal para praticar",
      stats: "70% dos seus stats",
      recompensas: { xp: 15, moedas: 10 },
      cor: "from-green-600 to-green-700"
    },
    normal: {
      nome: "Veterano",
      emoji: "🟡",
      descricao: "Desafio equilibrado",
      stats: "100% dos seus stats",
      recompensas: { xp: 30, moedas: 20 },
      cor: "from-yellow-600 to-yellow-700"
    },
    dificil: {
      nome: "Elite",
      emoji: "🔴",
      descricao: "Adversário poderoso!",
      stats: "130% dos seus stats",
      recompensas: { xp: 60, moedas: 40 },
      cor: "from-red-600 to-red-700"
    },
    mestre: {
      nome: "Lendário",
      emoji: "💀",
      descricao: "IA perfeita. Boa sorte!",
      stats: "150% dos seus stats",
      recompensas: { xp: 120, moedas: 80, fragmentos: 1 },
      cor: "from-purple-600 to-purple-800"
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    carregarAvatares(parsedUser.id);
  }, [router]);

  const carregarAvatares = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/meus-avatares?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        const avataresVivos = data.avatares.filter(av => av.vivo);
        setAvatares(avataresVivos);
        
        // Auto-seleciona o avatar ativo
        const ativo = avataresVivos.find(av => av.ativo);
        if (ativo) {
          setAvatarSelecionado(ativo);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar avatares:", error);
    } finally {
      setLoading(false);
    }
  };

  const iniciarTreino = async () => {
    if (!avatarSelecionado) {
      alert('Selecione um avatar primeiro!');
      return;
    }

    if (avatarSelecionado.exaustao >= 80) {
      if (!confirm('Seu avatar está muito exausto! Continuar mesmo assim?')) {
        return;
      }
    }

    setIniciandoBatalha(true);

    try {
      const response = await fetch('/api/arena/treino/iniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          avatarId: avatarSelecionado.id,
          dificuldade: dificuldadeSelecionada
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Salvar estado da batalha
        localStorage.setItem('batalha_atual', JSON.stringify(data.batalha));
        
        // Redirecionar para tela de batalha
        router.push('/arena/batalha');
      } else {
        alert(data.message || 'Erro ao iniciar treino');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao iniciar treino');
    } finally {
      setIniciandoBatalha(false);
    }
  };

  const getAvisoExaustao = (exaustao) => {
    if (exaustao >= 80) return { texto: '💀 COLAPSADO - NÃO PODE LUTAR!', cor: 'text-red-500' };
    if (exaustao >= 60) return { texto: '🔴 EXAUSTO - Penalidades severas', cor: 'text-orange-500' };
    if (exaustao >= 40) return { texto: '🟡 CANSADO - Penalidades leves', cor: 'text-yellow-500' };
    if (exaustao >= 20) return { texto: '🟢 ALERTA - Tudo ok', cor: 'text-green-500' };
    return { texto: '💚 DESCANSADO - Bônus ativo!', cor: 'text-green-400' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse">Carregando Arena...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-2">
              🏟️ ARENA DE TREINO
            </h1>
            <p className="text-slate-400 font-mono text-sm">
              Teste suas habilidades contra adversários controlados por IA
            </p>
          </div>
          
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            ← Voltar
          </button>
        </div>

        {/* Sem avatares */}
        {avatares.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-20 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="text-6xl mb-6">⚔️</div>
            <h2 className="text-2xl font-bold text-slate-300 mb-4">
              Nenhum Avatar Disponível
            </h2>
            <p className="text-slate-400 mb-8">
              Você precisa de avatares vivos para treinar!
            </p>
            <button
              onClick={() => router.push("/ocultista")}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-colors"
            >
              Invocar Avatar
            </button>
          </div>
        )}

        {/* Interface Principal */}
        {avatares.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Seleção de Avatar */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                👤 SELECIONAR AVATAR
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {avatares.map((avatar) => {
                  const selecionado = avatarSelecionado?.id === avatar.id;
                  const aviso = getAvisoExaustao(avatar.exaustao);
                  const podeLutar = avatar.exaustao < 100;
                  
                  return (
                    <button
                      key={avatar.id}
                      onClick={() => podeLutar && setAvatarSelecionado(avatar)}
                      disabled={!podeLutar}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        selecionado 
                          ? 'border-cyan-500 bg-cyan-900/30' 
                          : podeLutar
                            ? 'border-slate-700 bg-slate-900/50 hover:border-cyan-700'
                            : 'border-red-900 bg-red-950/30 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-4xl">
                          {avatar.elemento === 'Fogo' && '🔥'}
                          {avatar.elemento === 'Água' && '💧'}
                          {avatar.elemento === 'Terra' && '🪨'}
                          {avatar.elemento === 'Vento' && '💨'}
                          {avatar.elemento === 'Eletricidade' && '⚡'}
                          {avatar.elemento === 'Sombra' && '🌑'}
                          {avatar.elemento === 'Luz' && '✨'}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-cyan-400">{avatar.nome}</div>
                          <div className="text-xs text-slate-500">
                            Nv.{avatar.nivel} • {avatar.elemento}
                          </div>
                        </div>
                        {selecionado && (
                          <div className="text-cyan-400 text-xl">✓</div>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center text-xs mb-2">
                        <div>
                          <div className="text-red-400 font-bold">{avatar.forca}</div>
                          <div className="text-slate-600">FOR</div>
                        </div>
                        <div>
                          <div className="text-green-400 font-bold">{avatar.agilidade}</div>
                          <div className="text-slate-600">AGI</div>
                        </div>
                        <div>
                          <div className="text-blue-400 font-bold">{avatar.resistencia}</div>
                          <div className="text-slate-600">RES</div>
                        </div>
                        <div>
                          <div className="text-purple-400 font-bold">{avatar.foco}</div>
                          <div className="text-slate-600">FOC</div>
                        </div>
                      </div>

                      <div className={`text-xs ${aviso.cor} font-mono text-center`}>
                        {aviso.texto}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seleção de Dificuldade e Iniciar */}
            <div>
              <h2 className="text-2xl font-bold text-orange-400 mb-4">
                🎯 DIFICULDADE
              </h2>

              <div className="space-y-3 mb-6">
                {Object.entries(dificuldades).map(([key, dif]) => (
                  <button
                    key={key}
                    onClick={() => setDificuldadeSelecionada(key)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      dificuldadeSelecionada === key
                        ? 'border-orange-500 bg-orange-900/30'
                        : 'border-slate-700 bg-slate-900/50 hover:border-orange-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{dif.emoji}</span>
                      <div>
                        <div className="font-bold text-white">{dif.nome}</div>
                        <div className="text-xs text-slate-400">{dif.descricao}</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 mb-2">
                      Inimigo: {dif.stats}
                    </div>

                    <div className="flex gap-2 text-xs">
                      <span className="bg-blue-900/50 px-2 py-1 rounded">
                        +{dif.recompensas.xp} XP
                      </span>
                      <span className="bg-yellow-900/50 px-2 py-1 rounded">
                        +{dif.recompensas.moedas} 💰
                      </span>
                      {dif.recompensas.fragmentos && (
                        <span className="bg-purple-900/50 px-2 py-1 rounded">
                          +{dif.recompensas.fragmentos} 💎
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Botão Iniciar */}
              <button
                onClick={iniciarTreino}
                disabled={!avatarSelecionado || avatarSelecionado.exaustao >= 100 || iniciandoBatalha}
                className="w-full group relative disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-all"></div>
                
                <div className="relative px-8 py-4 bg-slate-950 rounded-lg border-2 border-orange-500 group-hover:border-orange-400 transition-all">
                  <span className="text-xl font-black tracking-wider uppercase bg-gradient-to-r from-red-300 to-yellow-300 bg-clip-text text-transparent">
                    {iniciandoBatalha ? '⏳ Iniciando...' : '⚔️ INICIAR TREINO'}
                  </span>
                </div>
              </button>

              {avatarSelecionado && avatarSelecionado.exaustao >= 60 && (
                <div className="mt-4 p-3 bg-orange-950/50 border border-orange-500/50 rounded">
                  <p className="text-xs text-orange-400">
                    ⚠️ Seu avatar está exausto e terá penalidades em combate!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
