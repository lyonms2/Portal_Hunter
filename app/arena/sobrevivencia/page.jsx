"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { aplicarPenalidadesExaustao, getNivelExaustao } from "../../avatares/sistemas/exhaustionSystem";
import AvatarSVG from "../../components/AvatarSVG";

export default function ArenaSobrevivenciaPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [avatares, setAvatares] = useState([]);
  const [avatarSelecionado, setAvatarSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estadoJogo, setEstadoJogo] = useState('selecao'); // selecao, preparando, sobrevivendo, game_over
  const [ondaAtual, setOndaAtual] = useState(0);
  const [recordePessoal, setRecordePessoal] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    carregarAvatares(parsedUser.id);

    // Carregar recorde pessoal (simular - depois implementar com API)
    const recordeSalvo = localStorage.getItem(`survival_record_${parsedUser.id}`);
    if (recordeSalvo) {
      setRecordePessoal(parseInt(recordeSalvo));
    }
  }, [router]);

  const carregarAvatares = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/meus-avatares?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        // Filtro mais rigoroso: apenas avatares vivos com menos de 60% exaustão
        const avataresAptos = data.avatares.filter(av => av.vivo && av.exaustao < 60);
        setAvatares(avataresAptos);

        const ativo = avataresAptos.find(av => av.ativo);
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

  const calcularMultiplicadorOnda = (onda) => {
    // Dificuldade aumenta exponencialmente mas de forma balanceada
    if (onda <= 5) return 1.0 + (onda * 0.05); // 1.0 a 1.25
    if (onda <= 10) return 1.25 + ((onda - 5) * 0.08); // 1.25 a 1.65
    if (onda <= 15) return 1.65 + ((onda - 10) * 0.10); // 1.65 a 2.15
    if (onda <= 20) return 2.15 + ((onda - 15) * 0.12); // 2.15 a 2.75
    return 2.75 + ((onda - 20) * 0.15); // 2.75+
  };

  const calcularRecompensasOnda = (onda) => {
    const base_xp = 30;
    const base_moedas = 20;
    const multiplicador = Math.floor(onda / 5) + 1;

    const isBossWave = onda % 5 === 0;
    const bossBonus = isBossWave ? 2 : 1;

    return {
      xp: Math.floor(base_xp * onda * 0.8 * bossBonus),
      moedas: Math.floor(base_moedas * onda * 0.6 * bossBonus),
      chance_fragmento: isBossWave ? 0.3 + (Math.floor(onda / 10) * 0.1) : 0.05 + (Math.floor(onda / 10) * 0.02),
      fragmentos_garantidos: onda >= 20 && isBossWave ? 1 : 0
    };
  };

  const calcularExaustaoOnda = (onda) => {
    // Exaustão aumenta gradualmente - começa baixo mas acelera
    if (onda <= 5) return 3 + onda;
    if (onda <= 10) return 8 + (onda - 5) * 2;
    if (onda <= 15) return 18 + (onda - 10) * 3;
    return 33 + (onda - 15) * 4;
  };

  const getNomeDificuldadeOnda = (onda) => {
    if (onda <= 5) return { nome: 'Iniciante', cor: 'text-green-400' };
    if (onda <= 10) return { nome: 'Intermediário', cor: 'text-cyan-400' };
    if (onda <= 15) return { nome: 'Avançado', cor: 'text-blue-400' };
    if (onda <= 20) return { nome: 'Elite', cor: 'text-purple-400' };
    if (onda <= 30) return { nome: 'Lendário', cor: 'text-red-400' };
    return { nome: 'IMPOSSÍVEL', cor: 'text-red-600' };
  };

  const iniciarSobrevivencia = () => {
    if (!avatarSelecionado) {
      alert('Selecione um avatar primeiro!');
      return;
    }

    if (avatarSelecionado.exaustao >= 60) {
      alert('Seu avatar está muito exausto! Modo Sobrevivência exige avatares em boa forma (< 60% exaustão).');
      return;
    }

    setEstadoJogo('preparando');
    setOndaAtual(1);

    // Simular preparação
    setTimeout(() => {
      setEstadoJogo('sobrevivendo');
      iniciarOndaAtual(1);
    }, 3000);
  };

  const iniciarOndaAtual = (onda) => {
    // TODO: Implementar sistema de batalha de sobrevivência
    // Por enquanto, apenas simulação
    alert(`Iniciando Onda ${onda}!\n\nInimigo: ${calcularMultiplicadorOnda(onda).toFixed(2)}x mais forte\n\nEm desenvolvimento: batalhas de sobrevivência`);

    // Simular vitória (para teste)
    setTimeout(() => {
      ondaCompleta(onda);
    }, 2000);
  };

  const ondaCompleta = (onda) => {
    // Atualizar recorde se necessário
    if (onda > recordePessoal) {
      setRecordePessoal(onda);
      localStorage.setItem(`survival_record_${user.id}`, onda.toString());
    }

    // Mostrar recompensas e opção de continuar
    const recompensas = calcularRecompensasOnda(onda);
    const exaustao = calcularExaustaoOnda(onda);

    const continuar = confirm(
      `🎉 ONDA ${onda} COMPLETADA!\n\n` +
      `Recompensas:\n` +
      `+${recompensas.xp} XP\n` +
      `+${recompensas.moedas} Moedas\n` +
      `Chance de Fragmento: ${(recompensas.chance_fragmento * 100).toFixed(0)}%\n\n` +
      `Exaustão acumulada: +${exaustao}\n\n` +
      `Deseja continuar para a Onda ${onda + 1}?`
    );

    if (continuar) {
      setOndaAtual(onda + 1);
      iniciarOndaAtual(onda + 1);
    } else {
      finalizarSobrevivencia(onda, false);
    }
  };

  const finalizarSobrevivencia = (ondaFinal, derrota = true) => {
    const recompensasTotais = calcularRecompensasTotais(ondaFinal);

    alert(
      `${derrota ? '💀 GAME OVER' : '🏆 SOBREVIVÊNCIA FINALIZADA'}\n\n` +
      `Ondas Sobrevividas: ${ondaFinal}\n` +
      `${ondaFinal > recordePessoal ? '🎊 NOVO RECORDE!' : ''}\n\n` +
      `Recompensas Totais:\n` +
      `+${recompensasTotais.xp} XP\n` +
      `+${recompensasTotais.moedas} Moedas\n` +
      `+${recompensasTotais.fragmentos} Fragmentos`
    );

    setEstadoJogo('selecao');
    setOndaAtual(0);
  };

  const calcularRecompensasTotais = (ondaFinal) => {
    let totalXP = 0;
    let totalMoedas = 0;
    let totalFragmentos = 0;

    for (let i = 1; i <= ondaFinal; i++) {
      const recompensas = calcularRecompensasOnda(i);
      totalXP += recompensas.xp;
      totalMoedas += recompensas.moedas;
      totalFragmentos += recompensas.fragmentos_garantidos;

      // Simular chance de fragmento
      if (Math.random() < recompensas.chance_fragmento) {
        totalFragmentos++;
      }
    }

    return { xp: totalXP, moedas: totalMoedas, fragmentos: totalFragmentos };
  };

  const getAvisoExaustao = (exaustao) => {
    if (exaustao >= 60) return { texto: '🔴 MUITO EXAUSTO - NÃO RECOMENDADO!', cor: 'text-red-500' };
    if (exaustao >= 40) return { texto: '🟡 CANSADO - Cuidado com penalidades', cor: 'text-yellow-500' };
    if (exaustao >= 20) return { texto: '🟢 BOM - Pequenas penalidades', cor: 'text-green-500' };
    return { texto: '💚 PERFEITO - Sem penalidades!', cor: 'text-green-400' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 flex items-center justify-center">
        <div className="text-purple-400 font-mono animate-pulse">Carregando Modo Sobrevivência...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
              💀 MODO SOBREVIVÊNCIA
            </h1>
            <p className="text-slate-400 font-mono text-sm">
              Quantas ondas você consegue sobreviver? Sem recuperação, sem piedade.
            </p>
          </div>

          <button
            onClick={() => router.push("/arena")}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            ← Voltar ao Lobby
          </button>
        </div>

        {/* Recorde Pessoal */}
        {recordePessoal > 0 && (
          <div className="mb-8 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🏆</div>
                <div>
                  <div className="text-sm text-purple-400 font-bold uppercase tracking-wider">Seu Recorde</div>
                  <div className="text-4xl font-black text-white">{recordePessoal} Ondas</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Dificuldade</div>
                <div className={`text-xl font-bold ${getNomeDificuldadeOnda(recordePessoal).cor}`}>
                  {getNomeDificuldadeOnda(recordePessoal).nome}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aviso de Desenvolvimento */}
        <div className="mb-8 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🚧</div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-yellow-400 mb-2">MODO EM DESENVOLVIMENTO</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                O sistema de batalhas de sobrevivência está em desenvolvimento. Você pode testar a interface e mecânicas básicas.
              </p>
              <div className="text-xs text-slate-400 space-y-1">
                <div>✅ Seleção de avatares</div>
                <div>✅ Sistema de ondas e dificuldade progressiva</div>
                <div>✅ Cálculo de recompensas balanceadas</div>
                <div>⏳ Batalhas em tempo real (em breve)</div>
                <div>⏳ Ranking global (em breve)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sem avatares aptos */}
        {avatares.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-20 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="text-6xl mb-6">💀</div>
            <h2 className="text-2xl font-bold text-slate-300 mb-4">
              Nenhum Avatar Apto para Sobrevivência
            </h2>
            <p className="text-slate-400 mb-8">
              Modo Sobrevivência exige avatares em boa forma. Apenas avatares vivos com menos de 60% de exaustão podem participar.
            </p>
            <button
              onClick={() => router.push("/avatares")}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-colors"
            >
              Ver Meus Avatares
            </button>
          </div>
        )}

        {/* Interface Principal */}
        {avatares.length > 0 && estadoJogo === 'selecao' && (
          <div className="space-y-8">
            {/* Explicação do Modo */}
            <div className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 rounded-xl p-8 border-2 border-purple-500/30">
              <h2 className="text-2xl font-black text-purple-400 mb-6 flex items-center gap-3">
                <span className="text-3xl">⚔️</span> COMO FUNCIONA
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">🎯 Mecânicas</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">▸</span>
                      <span><strong>Ondas infinitas:</strong> Enfrente inimigos cada vez mais fortes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">▸</span>
                      <span><strong>Sem recuperação:</strong> HP e energia não regeneram entre ondas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">▸</span>
                      <span><strong>Exaustão crescente:</strong> Cada onda aumenta sua exaustão permanentemente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">▸</span>
                      <span><strong>Boss Waves:</strong> A cada 5 ondas, enfrente um chefe poderoso com recompensas dobradas</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-3">🎁 Recompensas</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">▸</span>
                      <span><strong>Crescentes:</strong> Recompensas aumentam a cada onda</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">▸</span>
                      <span><strong>Boss Bonus:</strong> Ondas 5, 10, 15, 20+ dão o dobro de XP e moedas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">▸</span>
                      <span><strong>Fragmentos:</strong> Chance alta em boss waves, garantido na onda 20+</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">▸</span>
                      <span><strong>Pode desistir:</strong> Colete suas recompensas a qualquer momento</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Tabela de Dificuldade */}
              <div className="bg-slate-950/50 rounded-lg p-4">
                <h3 className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider">📊 Progressão de Dificuldade</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                  {[
                    { ondas: '1-5', nome: 'Iniciante', mult: '1.0-1.25x', cor: 'border-green-500' },
                    { ondas: '6-10', nome: 'Intermediário', mult: '1.25-1.65x', cor: 'border-cyan-500' },
                    { ondas: '11-15', nome: 'Avançado', mult: '1.65-2.15x', cor: 'border-blue-500' },
                    { ondas: '16-20', nome: 'Elite', mult: '2.15-2.75x', cor: 'border-purple-500' },
                    { ondas: '21-30', nome: 'Lendário', mult: '2.75-4.25x', cor: 'border-red-500' },
                    { ondas: '31+', nome: 'IMPOSSÍVEL', mult: '4.25x+', cor: 'border-red-700' }
                  ].map((tier, idx) => (
                    <div key={idx} className={`bg-slate-900/50 border-2 ${tier.cor} rounded p-2 text-center`}>
                      <div className="font-bold text-white mb-1">{tier.ondas}</div>
                      <div className="text-slate-400 mb-1">{tier.nome}</div>
                      <div className="text-[10px] text-slate-500">{tier.mult}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Seleção de Avatar */}
            <div>
              <h2 className="text-3xl font-black text-purple-400 mb-6 flex items-center gap-3">
                <span className="text-4xl">👤</span> SELECIONAR AVATAR
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {avatares.map((avatar) => {
                  const selecionado = avatarSelecionado?.id === avatar.id;
                  const aviso = getAvisoExaustao(avatar.exaustao);
                  const podeJogar = avatar.exaustao < 60;

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
                      onClick={() => podeJogar && setAvatarSelecionado(avatar)}
                      disabled={!podeJogar}
                      className={`group relative text-left overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                        selecionado
                          ? 'border-purple-500 bg-purple-900/30 ring-4 ring-purple-500/50 scale-105 shadow-2xl shadow-purple-500/20'
                          : podeJogar
                            ? 'border-slate-700 bg-slate-900/50 hover:border-purple-700 hover:scale-102 hover:shadow-xl'
                            : 'border-red-900 bg-red-950/30 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {selecionado && (
                        <div className="absolute top-3 right-3 z-10 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
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

                      <div className="relative p-6 pb-3 flex justify-center items-center bg-gradient-to-b from-purple-950/50 to-transparent">
                        <div className={`relative ${podeJogar ? 'group-hover:scale-110' : ''} transition-transform duration-300`}>
                          <AvatarSVG avatar={avatar} tamanho={140} />
                          {!podeJogar && (
                            <div className="absolute inset-0 bg-red-950/70 rounded-full flex items-center justify-center">
                              <span className="text-4xl">⚠️</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-4 pb-4">
                        <div className="text-center mb-3">
                          <div className="font-black text-lg text-white mb-1">{avatar.nome}</div>
                          <div className="flex items-center justify-center gap-2 text-sm">
                            <span className="text-purple-400 font-bold">Nv.{avatar.nivel}</span>
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
                          podeJogar ? 'bg-slate-900/50' : 'bg-red-950/50'
                        }`}>
                          {aviso.texto}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Botão Iniciar */}
              <div className="max-w-2xl mx-auto space-y-4">
                {avatarSelecionado && avatarSelecionado.exaustao >= 40 && (
                  <div className="p-4 bg-orange-950/50 border-2 border-orange-500/50 rounded-lg">
                    <p className="text-sm text-orange-400 font-bold text-center">
                      ⚠️ Seu avatar está cansado! Sobrevivência é mais difícil com penalidades.
                    </p>
                  </div>
                )}

                <button
                  onClick={iniciarSobrevivencia}
                  disabled={!avatarSelecionado}
                  className="w-full group relative disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition-all"></div>

                  <div className="relative px-12 py-6 bg-slate-950 rounded-xl border-2 border-purple-500 group-hover:border-purple-400 transition-all">
                    <span className="text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                      💀 INICIAR SOBREVIVÊNCIA
                    </span>
                  </div>
                </button>

                {!avatarSelecionado && (
                  <p className="text-center text-sm text-slate-500 font-mono">
                    Selecione um avatar para começar o desafio
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Estado: Preparando */}
        {estadoJogo === 'preparando' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/80 to-slate-950/80 backdrop-blur-xl rounded-2xl p-12 border-2 border-purple-500/30">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-32 h-32 mx-auto">
                    <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-5xl">
                      💀
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-4xl font-black text-white mb-2">
                    PREPARANDO DESAFIO
                  </h2>
                  <p className="text-purple-400 font-mono text-lg">
                    Onda 1 • Iniciante
                  </p>
                </div>

                <div className="bg-slate-950/50 rounded-lg p-6 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-4">Seu Avatar</p>
                  <div className="flex items-center gap-4 justify-center">
                    <AvatarSVG avatar={avatarSelecionado} tamanho={100} />
                    <div className="text-left">
                      <div className="font-bold text-white text-xl">{avatarSelecionado.nome}</div>
                      <div className="text-slate-400">Nv.{avatarSelecionado.nivel} • {avatarSelecionado.elemento}</div>
                    </div>
                  </div>
                </div>

                <p className="text-slate-500 text-sm font-mono">
                  Boa sorte, caçador...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
