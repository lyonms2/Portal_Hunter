"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { aplicarPenalidadesExaustao, getNivelExaustao } from "../../avatares/sistemas/exhaustionSystem";
import AvatarSVG from "../../components/AvatarSVG";

export default function ArenaPvPPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [avatares, setAvatares] = useState([]);
  const [avatarSelecionado, setAvatarSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estadoMatchmaking, setEstadoMatchmaking] = useState('selecao'); // selecao, procurando, encontrado, em_batalha
  const [tempoEspera, setTempoEspera] = useState(0);
  const [oponenteEncontrado, setOponenteEncontrado] = useState(null);

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

  // Timer de espera no matchmaking
  useEffect(() => {
    let interval;
    if (estadoMatchmaking === 'procurando') {
      interval = setInterval(() => {
        setTempoEspera(prev => prev + 1);
      }, 1000);
    } else {
      setTempoEspera(0);
    }

    return () => clearInterval(interval);
  }, [estadoMatchmaking]);

  const carregarAvatares = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/meus-avatares?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        const avataresVivos = data.avatares.filter(av => av.vivo && av.exaustao < 80);
        setAvatares(avataresVivos);

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

  const iniciarMatchmaking = () => {
    if (!avatarSelecionado) {
      alert('Selecione um avatar primeiro!');
      return;
    }

    if (avatarSelecionado.exaustao >= 60) {
      if (!confirm('Seu avatar está exausto! Isso pode prejudicar seu desempenho. Continuar?')) {
        return;
      }
    }

    setEstadoMatchmaking('procurando');

    // Simulação de matchmaking (substituir por WebSocket/API real)
    setTimeout(() => {
      // Gerar oponente simulado
      const oponente = {
        id: 'oponente_' + Date.now(),
        nome: 'Jogador Adversário',
        nivel: avatarSelecionado.nivel + Math.floor(Math.random() * 3) - 1, // ±1 nivel
        avatar: gerarAvatarOponente(avatarSelecionado.nivel)
      };

      setOponenteEncontrado(oponente);
      setEstadoMatchmaking('encontrado');

      // Auto-iniciar após 3 segundos
      setTimeout(() => {
        iniciarBatalha();
      }, 3000);
    }, Math.random() * 3000 + 2000); // 2-5 segundos
  };

  const cancelarMatchmaking = () => {
    setEstadoMatchmaking('selecao');
    setOponenteEncontrado(null);
    setTempoEspera(0);
  };

  const gerarAvatarOponente = (nivelBase) => {
    const elementos = ['Fogo', 'Água', 'Terra', 'Vento', 'Eletricidade', 'Sombra', 'Luz'];
    const raridades = ['Comum', 'Raro', 'Lendário'];

    return {
      id: 'oponente_avatar_' + Date.now(),
      nome: 'Avatar do Oponente',
      elemento: elementos[Math.floor(Math.random() * elementos.length)],
      raridade: raridades[Math.floor(Math.random() * raridades.length)],
      nivel: nivelBase,
      forca: 15 + nivelBase * 2,
      agilidade: 15 + nivelBase * 2,
      resistencia: 15 + nivelBase * 2,
      foco: 15 + nivelBase * 2,
    };
  };

  const iniciarBatalha = () => {
    // TODO: Implementar sistema de batalha PvP real
    alert('Sistema de batalha PvP em desenvolvimento!\n\nFuncionalidades planejadas:\n- Turnos de 30 segundos\n- Sistema de ranking\n- Recompensas competitivas\n- Chat durante batalha');
    setEstadoMatchmaking('selecao');
    setOponenteEncontrado(null);
  };

  const getAvisoExaustao = (exaustao) => {
    if (exaustao >= 80) return { texto: '💀 EXAUSTO DEMAIS - NÃO PODE LUTAR!', cor: 'text-red-500' };
    if (exaustao >= 60) return { texto: '🔴 EXAUSTO - Penalidades severas', cor: 'text-orange-500' };
    if (exaustao >= 40) return { texto: '🟡 CANSADO - Penalidades leves', cor: 'text-yellow-500' };
    if (exaustao >= 20) return { texto: '🟢 ALERTA - Bom para lutar', cor: 'text-green-500' };
    return { texto: '💚 DESCANSADO - Em ótima forma!', cor: 'text-green-400' };
  };

  const formatarTempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse">Carregando Arena PvP...</div>
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
              ⚔️ ARENA PvP
            </h1>
            <p className="text-slate-400 font-mono text-sm">
              Enfrente outros jogadores em batalhas competitivas 1v1
            </p>
          </div>

          <button
            onClick={() => router.push("/arena")}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            ← Voltar ao Lobby
          </button>
        </div>

        {/* Aviso de Desenvolvimento */}
        <div className="mb-8 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🚧</div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-yellow-400 mb-2">MODO EM DESENVOLVIMENTO</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                O sistema de PvP está em fase inicial. Atualmente você pode testar a interface de matchmaking e seleção de avatares.
              </p>
              <div className="text-xs text-slate-400 space-y-1">
                <div>✅ Seleção de avatares</div>
                <div>✅ Sistema de matchmaking (simulado)</div>
                <div>⏳ Batalhas em tempo real (em breve)</div>
                <div>⏳ Sistema de ranking (em breve)</div>
                <div>⏳ Recompensas competitivas (em breve)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sem avatares */}
        {avatares.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-20 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="text-6xl mb-6">⚔️</div>
            <h2 className="text-2xl font-bold text-slate-300 mb-4">
              Nenhum Avatar Disponível para PvP
            </h2>
            <p className="text-slate-400 mb-8">
              Apenas avatares vivos e com menos de 80% de exaustão podem lutar no PvP.
            </p>
            <button
              onClick={() => router.push("/avatares")}
              className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold transition-colors"
            >
              Ver Meus Avatares
            </button>
          </div>
        )}

        {/* Interface Principal */}
        {avatares.length > 0 && (
          <div className="space-y-8">
            {/* Estado: Seleção de Avatar */}
            {estadoMatchmaking === 'selecao' && (
              <>
                {/* Seleção de Avatar */}
                <div>
                  <h2 className="text-3xl font-black text-cyan-400 mb-6 flex items-center gap-3">
                    <span className="text-4xl">👤</span> SELECIONAR AVATAR
                  </h2>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {avatares.map((avatar) => {
                      const selecionado = avatarSelecionado?.id === avatar.id;
                      const aviso = getAvisoExaustao(avatar.exaustao);
                      const podeLutar = avatar.exaustao < 80;

                      const statsBase = {
                        forca: avatar.forca || 0,
                        agilidade: avatar.agilidade || 0,
                        resistencia: avatar.resistencia || 0,
                        foco: avatar.foco || 0
                      };
                      const statsAtuais = aplicarPenalidadesExaustao(statsBase, avatar.exaustao || 0);
                      const nivelExaustao = getNivelExaustao(avatar.exaustao || 0);
                      const temPenalidade = nivelExaustao.penalidades.stats !== undefined;

                      return (
                        <button
                          key={avatar.id}
                          onClick={() => podeLutar && setAvatarSelecionado(avatar)}
                          disabled={!podeLutar}
                          className={`group relative text-left overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                            selecionado
                              ? 'border-cyan-500 bg-cyan-900/30 ring-4 ring-cyan-500/50 scale-105 shadow-2xl shadow-cyan-500/20'
                              : podeLutar
                                ? 'border-slate-700 bg-slate-900/50 hover:border-cyan-700 hover:scale-102 hover:shadow-xl'
                                : 'border-red-900 bg-red-950/30 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {selecionado && (
                            <div className="absolute top-3 right-3 z-10 bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
                              ✓ Selecionado
                            </div>
                          )}

                          <div className={`absolute top-3 left-3 z-10 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                            avatar.raridade === 'Lendário' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' :
                            avatar.raridade === 'Raro' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {avatar.raridade}
                          </div>

                          <div className="relative p-6 pb-3 flex justify-center items-center bg-gradient-to-b from-slate-950/50 to-transparent">
                            <div className={`relative ${podeLutar ? 'group-hover:scale-110' : ''} transition-transform duration-300`}>
                              <AvatarSVG avatar={avatar} tamanho={140} />
                              {!podeLutar && (
                                <div className="absolute inset-0 bg-red-950/70 rounded-full flex items-center justify-center">
                                  <span className="text-4xl">💀</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="px-4 pb-4">
                            <div className="text-center mb-3">
                              <div className="font-black text-lg text-white mb-1">{avatar.nome}</div>
                              <div className="flex items-center justify-center gap-2 text-sm">
                                <span className="text-cyan-400 font-bold">Nv.{avatar.nivel}</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-400">{avatar.elemento}</span>
                              </div>
                            </div>

                            <div className="bg-slate-950/50 rounded-lg p-3 mb-3">
                              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                <div>
                                  {temPenalidade ? (
                                    <div>
                                      <div className="text-[9px] text-slate-700 line-through">{statsBase.forca}</div>
                                      <div className="text-red-400 font-bold text-base">{statsAtuais.forca}</div>
                                    </div>
                                  ) : (
                                    <div className="text-red-400 font-bold text-base">{statsBase.forca}</div>
                                  )}
                                  <div className="text-slate-600 font-semibold mt-1">FOR</div>
                                </div>
                                <div>
                                  {temPenalidade ? (
                                    <div>
                                      <div className="text-[9px] text-slate-700 line-through">{statsBase.agilidade}</div>
                                      <div className="text-green-400 font-bold text-base">{statsAtuais.agilidade}</div>
                                    </div>
                                  ) : (
                                    <div className="text-green-400 font-bold text-base">{statsBase.agilidade}</div>
                                  )}
                                  <div className="text-slate-600 font-semibold mt-1">AGI</div>
                                </div>
                                <div>
                                  {temPenalidade ? (
                                    <div>
                                      <div className="text-[9px] text-slate-700 line-through">{statsBase.resistencia}</div>
                                      <div className="text-blue-400 font-bold text-base">{statsAtuais.resistencia}</div>
                                    </div>
                                  ) : (
                                    <div className="text-blue-400 font-bold text-base">{statsBase.resistencia}</div>
                                  )}
                                  <div className="text-slate-600 font-semibold mt-1">RES</div>
                                </div>
                                <div>
                                  {temPenalidade ? (
                                    <div>
                                      <div className="text-[9px] text-slate-700 line-through">{statsBase.foco}</div>
                                      <div className="text-purple-400 font-bold text-base">{statsAtuais.foco}</div>
                                    </div>
                                  ) : (
                                    <div className="text-purple-400 font-bold text-base">{statsBase.foco}</div>
                                  )}
                                  <div className="text-slate-600 font-semibold mt-1">FOC</div>
                                </div>
                              </div>
                            </div>

                            <div className={`text-xs ${aviso.cor} font-mono text-center font-bold py-2 px-3 rounded ${
                              podeLutar ? 'bg-slate-900/50' : 'bg-red-950/50'
                            }`}>
                              {aviso.texto}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Botão Procurar Partida */}
                  <div className="max-w-2xl mx-auto space-y-4">
                    {avatarSelecionado && avatarSelecionado.exaustao >= 60 && (
                      <div className="p-4 bg-orange-950/50 border-2 border-orange-500/50 rounded-lg">
                        <p className="text-sm text-orange-400 font-bold text-center">
                          ⚠️ Seu avatar está exausto! Você terá penalidades em combate.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={iniciarMatchmaking}
                      disabled={!avatarSelecionado}
                      className="w-full group relative disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition-all"></div>

                      <div className="relative px-12 py-6 bg-slate-950 rounded-xl border-2 border-orange-500 group-hover:border-orange-400 transition-all">
                        <span className="text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-red-300 to-yellow-300 bg-clip-text text-transparent">
                          🔍 PROCURAR PARTIDA
                        </span>
                      </div>
                    </button>

                    {!avatarSelecionado && (
                      <p className="text-center text-sm text-slate-500 font-mono">
                        Selecione um avatar para procurar uma partida
                      </p>
                    )}
                  </div>
                </div>

                {/* Info PvP */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                      <span>⚔️</span> Como Funciona
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">▸</span>
                        <span><strong>Matchmaking equilibrado:</strong> Sistema busca oponentes de nível similar.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">▸</span>
                        <span><strong>Turnos de 30 segundos:</strong> Decida rápido ou sua vez será pulada.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">▸</span>
                        <span><strong>Sem desistência:</strong> Abandonar a partida conta como derrota.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">▸</span>
                        <span><strong>Recompensas baseadas em ranking:</strong> Quanto maior seu rank, melhores as recompensas.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                    <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                      <span>🏆</span> Ranking e Recompensas
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg">
                        <span className="text-slate-400">Seu Ranking</span>
                        <span className="text-2xl font-bold text-slate-500">-</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg">
                        <span className="text-slate-400">Vitórias / Derrotas</span>
                        <span className="text-2xl font-bold text-slate-500">- / -</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg">
                        <span className="text-slate-400">Win Rate</span>
                        <span className="text-2xl font-bold text-slate-500">-%</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 text-center">
                      * Sistema de ranking será implementado em breve
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Estado: Procurando Partida */}
            {estadoMatchmaking === 'procurando' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl rounded-2xl p-12 border-2 border-cyan-500/30">
                  <div className="text-center space-y-6">
                    {/* Animação de busca */}
                    <div className="relative">
                      <div className="w-32 h-32 mx-auto">
                        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-4 border-4 border-orange-500/20 rounded-full"></div>
                        <div className="absolute inset-4 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-4xl">
                          🔍
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-3xl font-black text-white mb-2">
                        PROCURANDO OPONENTE...
                      </h2>
                      <p className="text-slate-400 font-mono text-sm">
                        Buscando jogador de nível similar
                      </p>
                    </div>

                    {/* Timer */}
                    <div className="inline-block bg-slate-950/50 rounded-lg px-6 py-3 border border-slate-700">
                      <div className="text-cyan-400 font-mono text-2xl font-bold">
                        ⏱️ {formatarTempo(tempoEspera)}
                      </div>
                    </div>

                    {/* Avatar Selecionado */}
                    {avatarSelecionado && (
                      <div className="bg-slate-950/50 rounded-lg p-6 border border-slate-700">
                        <p className="text-xs text-slate-500 uppercase mb-3">Seu Avatar</p>
                        <div className="flex items-center gap-4">
                          <AvatarSVG avatar={avatarSelecionado} tamanho={80} />
                          <div className="text-left">
                            <div className="font-bold text-white text-lg">{avatarSelecionado.nome}</div>
                            <div className="text-sm text-slate-400">Nv.{avatarSelecionado.nivel} • {avatarSelecionado.elemento}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botão Cancelar */}
                    <button
                      onClick={cancelarMatchmaking}
                      className="px-8 py-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg border border-red-700 transition-colors font-bold"
                    >
                      ✕ Cancelar Busca
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Estado: Oponente Encontrado */}
            {estadoMatchmaking === 'encontrado' && oponenteEncontrado && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-green-900/30 to-slate-950/80 backdrop-blur-xl rounded-2xl p-12 border-2 border-green-500/50">
                  <div className="text-center space-y-8">
                    <div>
                      <div className="text-6xl mb-4 animate-bounce">⚔️</div>
                      <h2 className="text-4xl font-black text-green-400 mb-2">
                        OPONENTE ENCONTRADO!
                      </h2>
                      <p className="text-slate-400 font-mono">
                        Preparando batalha...
                      </p>
                    </div>

                    {/* VS Display */}
                    <div className="grid grid-cols-3 gap-8 items-center">
                      {/* Seu Avatar */}
                      <div className="bg-slate-950/50 rounded-xl p-6 border-2 border-cyan-500">
                        <p className="text-xs text-cyan-400 uppercase mb-4 font-bold">Você</p>
                        <AvatarSVG avatar={avatarSelecionado} tamanho={120} />
                        <div className="mt-4">
                          <div className="font-bold text-white text-lg">{avatarSelecionado.nome}</div>
                          <div className="text-sm text-slate-400">Nv.{avatarSelecionado.nivel}</div>
                        </div>
                      </div>

                      {/* VS */}
                      <div className="text-6xl font-black text-red-400 animate-pulse">
                        VS
                      </div>

                      {/* Oponente */}
                      <div className="bg-slate-950/50 rounded-xl p-6 border-2 border-red-500">
                        <p className="text-xs text-red-400 uppercase mb-4 font-bold">Oponente</p>
                        <AvatarSVG avatar={oponenteEncontrado.avatar} tamanho={120} />
                        <div className="mt-4">
                          <div className="font-bold text-white text-lg">{oponenteEncontrado.nome}</div>
                          <div className="text-sm text-slate-400">Nv.{oponenteEncontrado.nivel}</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-400 text-sm font-mono">
                      Iniciando em 3 segundos...
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
