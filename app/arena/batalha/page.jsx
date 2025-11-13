"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { processarAcaoJogador, verificarVitoria, iniciarTurno } from "@/lib/arena/batalhaEngine";
import { processarTurnoIA, getMensagemIA } from "@/lib/arena/iaEngine";
import { calcularRecompensasTreino } from "@/lib/arena/recompensasCalc";
import AvatarSVG from "@/app/components/AvatarSVG";

export default function BatalhaPage() {
  const router = useRouter();
  const [estado, setEstado] = useState(null);
  const [log, setLog] = useState([]);
  const [turnoIA, setTurnoIA] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    // Carregar estado da batalha
    const batalhaJSON = localStorage.getItem('batalha_atual');
    
    if (!batalhaJSON) {
      router.push('/arena');
      return;
    }

    const batalha = JSON.parse(batalhaJSON);
    setEstado(batalha);
    
    adicionarLog('🎮 Batalha iniciada!');
    adicionarLog(`Você: ${batalha.jogador.nome} (${batalha.jogador.elemento})`);
    adicionarLog(`VS`);
    adicionarLog(`Oponente: ${batalha.inimigo.nome} (${batalha.inimigo.elemento})`);
    adicionarLog(`Dificuldade: ${batalha.dificuldade.toUpperCase()}`);
    adicionarLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, [router]);

  const adicionarLog = (mensagem) => {
    setLog(prev => [...prev, { texto: mensagem, timestamp: Date.now() }]);
  };

  const executarAcao = async (tipo, habilidadeIndex = null) => {
    if (!estado || turnoIA || processando) return;

    setProcessando(true);

    try {
      const novoEstado = { ...estado };

      // === TURNO DO JOGADOR ===
      const resultado = processarAcaoJogador(novoEstado, { tipo, habilidadeIndex });
      
      adicionarLog(`🎯 ${resultado.mensagem}`);

      if (resultado.energiaGasta > 0) {
        adicionarLog(`⚡ -${resultado.energiaGasta} energia`);
      }

      // Verificar vitória
      const vitoria = verificarVitoria(novoEstado);
      
      if (vitoria.fim) {
        finalizarBatalha(novoEstado, vitoria.vencedor);
        return;
      }

      // Atualizar estado
      setEstado(novoEstado);

      // Aguardar 1 segundo antes do turno da IA
      await new Promise(resolve => setTimeout(resolve, 1000));

      // === TURNO DA IA ===
      setTurnoIA(true);
      adicionarLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      adicionarLog('🤖 Turno do oponente...');
      
      // Mensagem de flavor
      const mensagemIA = getMensagemIA({ tipo: 'habilidade' }, novoEstado);
      adicionarLog(mensagemIA);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Executar ação da IA
      const resultadoIA = processarTurnoIA(novoEstado);
      adicionarLog(`💥 ${resultadoIA.mensagem}`);

      // Verificar vitória novamente
      const vitoriaIA = verificarVitoria(novoEstado);
      
      if (vitoriaIA.fim) {
        finalizarBatalha(novoEstado, vitoriaIA.vencedor);
        return;
      }

      // === PRÓXIMA RODADA ===
      novoEstado.rodada++;
      novoEstado.turno_atual = 'jogador';

      // Processar efeitos contínuos (dano/cura por turno, reduzir duração de buffs/debuffs)
      const turnoJogador = iniciarTurno(novoEstado.jogador, novoEstado);
      const turnoInimigo = iniciarTurno(novoEstado.inimigo, novoEstado);

      // Registrar efeitos processados
      if (turnoJogador.efeitosProcessados && turnoJogador.efeitosProcessados.length > 0) {
        turnoJogador.efeitosProcessados.forEach(efeito => {
          if (efeito.tipo === 'dano_continuo') {
            adicionarLog(`🔥 ${novoEstado.jogador.nome} sofreu ${efeito.dano} de dano de ${efeito.nome}`);
          } else if (efeito.tipo === 'cura_continua') {
            adicionarLog(`💚 ${novoEstado.jogador.nome} recuperou ${efeito.cura} HP de ${efeito.nome}`);
          }
        });
      }

      if (turnoInimigo.efeitosProcessados && turnoInimigo.efeitosProcessados.length > 0) {
        turnoInimigo.efeitosProcessados.forEach(efeito => {
          if (efeito.tipo === 'dano_continuo') {
            adicionarLog(`🔥 ${novoEstado.inimigo.nome} sofreu ${efeito.dano} de dano de ${efeito.nome}`);
          } else if (efeito.tipo === 'cura_continua') {
            adicionarLog(`💚 ${novoEstado.inimigo.nome} recuperou ${efeito.cura} HP de ${efeito.nome}`);
          }
        });
      }

      adicionarLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      adicionarLog(`⏰ Rodada ${novoEstado.rodada}`);

      setEstado(novoEstado);
      setTurnoIA(false);

    } catch (error) {
      console.error('Erro ao executar ação:', error);
      adicionarLog('❌ Erro ao processar ação!');
    } finally {
      setProcessando(false);
    }
  };

  const finalizarBatalha = (estadoFinal, vencedor) => {
    setTurnoIA(false);
    
    adicionarLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (vencedor === 'jogador') {
      adicionarLog('🎉 VITÓRIA!');
    } else if (vencedor === 'inimigo') {
      adicionarLog('☠️ DERROTA!');
    } else {
      adicionarLog('⚖️ EMPATE!');
    }

    // Calcular recompensas
    const recompensas = calcularRecompensasTreino(estadoFinal, vencedor);
    
    setResultado({
      vencedor,
      recompensas,
      estado: estadoFinal
    });
  };

  const voltarAoLobby = async () => {
    if (resultado && resultado.vencedor === 'jogador') {
      // Aplicar recompensas
      const userData = JSON.parse(localStorage.getItem('user'));
      
      try {
        // Atualizar stats do jogador
        await fetch('/api/atualizar-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userData.id,
            moedas: resultado.recompensas.moedas,
            fragmentos: resultado.recompensas.fragmentos || 0
          })
        });

        // Atualizar avatar (XP, exaustão e vínculo)
        await fetch('/api/atualizar-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            avatarId: estado.jogador.id,
            experiencia: resultado.recompensas.xp,
            exaustao: resultado.recompensas.exaustao,
            vinculo: resultado.recompensas.vinculo || 0
          })
        });
      } catch (error) {
        console.error('Erro ao aplicar recompensas:', error);
      }
    }

    localStorage.removeItem('batalha_atual');
    router.push('/arena');
  };

  if (!estado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 flex items-center justify-center">
        <div className="text-red-400 font-mono animate-pulse">Carregando batalha...</div>
      </div>
    );
  }

  const hpJogadorPercent = (estado.jogador.hp_atual / estado.jogador.hp_maximo) * 100;
  const hpInimigoPercent = (estado.inimigo.hp_atual / estado.inimigo.hp_maximo) * 100;
  const energiaJogadorPercent = (estado.jogador.energia_atual / 100) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-gray-100">
      {/* Modal de Resultado */}
      {resultado && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 rounded-lg border-2 border-cyan-500 p-8">
            <div className="text-center mb-6">
              {resultado.vencedor === 'jogador' && (
                <>
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-4xl font-black text-green-400 mb-2">VITÓRIA!</h2>
                </>
              )}
              
              {resultado.vencedor === 'inimigo' && (
                <>
                  <div className="text-6xl mb-4">☠️</div>
                  <h2 className="text-4xl font-black text-red-400 mb-2">DERROTA</h2>
                </>
              )}
              
              {resultado.vencedor === 'empate' && (
                <>
                  <div className="text-6xl mb-4">⚖️</div>
                  <h2 className="text-4xl font-black text-yellow-400 mb-2">EMPATE</h2>
                </>
              )}
            </div>

            <div className="bg-slate-800 rounded-lg p-6 mb-6">
              <h3 className="text-cyan-400 font-bold mb-4 text-center">🎁 RECOMPENSAS</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 bg-slate-900 rounded">
                  <div className="text-3xl font-bold text-blue-400">{resultado.recompensas.xp}</div>
                  <div className="text-xs text-slate-400">XP Ganho</div>
                </div>
                <div className="text-center p-4 bg-slate-900 rounded">
                  <div className="text-3xl font-bold text-yellow-400">{resultado.recompensas.moedas}</div>
                  <div className="text-xs text-slate-400">Moedas</div>
                </div>
              </div>

              {resultado.recompensas.fragmentos > 0 && (
                <div className="text-center p-3 bg-purple-900/30 rounded border border-purple-500/50 mb-4">
                  <span className="text-purple-400 font-bold">
                    💎 +{resultado.recompensas.fragmentos} Fragmento(s)!
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-orange-900/30 rounded border border-orange-500/50">
                  <span className="text-orange-400 text-sm">
                    😰 +{resultado.recompensas.exaustao} Exaustão
                  </span>
                </div>
                {resultado.recompensas.vinculo !== undefined && (
                  <div className={`text-center p-3 rounded border ${
                    resultado.recompensas.vinculo > 0
                      ? 'bg-green-900/30 border-green-500/50'
                      : 'bg-red-900/30 border-red-500/50'
                  }`}>
                    <span className={`text-sm font-bold ${
                      resultado.recompensas.vinculo > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {resultado.recompensas.vinculo > 0 ? '💚' : '💔'} {resultado.recompensas.vinculo > 0 ? '+' : ''}{resultado.recompensas.vinculo} Vínculo
                    </span>
                  </div>
                )}
              </div>

              {resultado.recompensas.mensagens && resultado.recompensas.mensagens.length > 0 && (
                <div className="mt-4 space-y-2">
                  {resultado.recompensas.mensagens.map((msg, i) => (
                    <div key={i} className="text-sm text-cyan-300 text-center">
                      {msg}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={voltarAoLobby}
              className="w-full px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
            >
              Voltar ao Lobby
            </button>
          </div>
        </div>
      )}

      {/* Interface de Batalha */}
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-slate-400 font-mono">
            ⏰ Rodada {estado.rodada} | 🎯 Dificuldade: {estado.dificuldade}
          </div>
          <div className="text-sm text-slate-400 font-mono">
            {turnoIA ? '🤖 Turno do Oponente' : '🎮 Seu Turno'}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Arena de Combate */}
          <div className="lg:col-span-2 space-y-4">
            {/* Inimigo */}
            <div className="bg-gradient-to-br from-slate-900/90 via-red-950/30 to-slate-900/90 rounded-xl p-6 border-2 border-red-500/50 shadow-2xl shadow-red-900/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-red-400">{estado.inimigo.nome}</h3>
                    <span className="px-2 py-0.5 bg-red-900/50 border border-red-500/50 rounded text-xs text-red-300">
                      Lv.{estado.inimigo.nivel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 bg-slate-800/50 rounded text-slate-400">
                      {estado.inimigo.elemento}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{estado.inimigo.raridade}</span>
                  </div>

                  {/* Debuffs do Inimigo */}
                  {estado.inimigo.debuffs && estado.inimigo.debuffs.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {estado.inimigo.debuffs.map((debuff, idx) => (
                        <span key={idx} className="text-lg" title={`${debuff.nome} (${debuff.turnos} turnos)`}>
                          {debuff.icone}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-36 h-36 flex-shrink-0">
                  <AvatarSVG avatar={estado.inimigo} tamanho={144} isEnemy={true} />
                </div>
              </div>

              {/* HP do Inimigo */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-semibold">HP</span>
                  <span className="text-red-400 font-mono font-bold">{estado.inimigo.hp_atual} / {estado.inimigo.hp_maximo}</span>
                </div>
                <div className="relative w-full bg-slate-800 rounded-full h-5 overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 h-5 transition-all duration-500 relative"
                    style={{width: `${hpInimigoPercent}%`}}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {Math.round(hpInimigoPercent)}%
                  </div>
                </div>
              </div>
            </div>

            {/* VS */}
            <div className="text-center relative">
              <div className="inline-block bg-gradient-to-r from-red-900/50 via-orange-900/80 to-cyan-900/50 px-8 py-3 rounded-full border-2 border-orange-500 text-orange-400 font-black text-3xl shadow-lg shadow-orange-500/30 animate-pulse">
                ⚔️ VS ⚔️
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-2 text-xs text-slate-500">
                Rodada {estado.rodada}
              </div>
            </div>

            {/* Jogador */}
            <div className="bg-gradient-to-br from-slate-900/90 via-cyan-950/30 to-slate-900/90 rounded-xl p-6 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-900/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-36 h-36 flex-shrink-0">
                  <AvatarSVG avatar={estado.jogador} tamanho={144} isEnemy={false} />
                </div>

                <div className="text-right flex-1 ml-4">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-cyan-900/50 border border-cyan-500/50 rounded text-xs text-cyan-300">
                      Lv.{estado.jogador.nivel}
                    </span>
                    <h3 className="text-2xl font-bold text-cyan-400">{estado.jogador.nome}</h3>
                  </div>
                  <div className="flex items-center justify-end gap-2 text-sm">
                    <span className="text-slate-400">{estado.jogador.raridade}</span>
                    <span className="text-slate-500">•</span>
                    <span className="px-2 py-0.5 bg-slate-800/50 rounded text-slate-400">
                      {estado.jogador.elemento}
                    </span>
                  </div>

                  {/* Buffs do Jogador */}
                  {estado.jogador.buffs && estado.jogador.buffs.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap justify-end">
                      {estado.jogador.buffs.map((buff, idx) => (
                        <span key={idx} className="text-lg" title={`${buff.nome} (${buff.turnos} turnos)`}>
                          {buff.icone}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* HP do Jogador */}
              <div className="mb-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-semibold">HP</span>
                  <span className="text-green-400 font-mono font-bold">{estado.jogador.hp_atual} / {estado.jogador.hp_maximo}</span>
                </div>
                <div className="relative w-full bg-slate-800 rounded-full h-5 overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 h-5 transition-all duration-500 relative"
                    style={{width: `${hpJogadorPercent}%`}}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {Math.round(hpJogadorPercent)}%
                  </div>
                </div>
              </div>

              {/* Energia do Jogador */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-semibold">Energia</span>
                  <span className="text-blue-400 font-mono font-bold">{estado.jogador.energia_atual} / {estado.jogador.energia_maxima || 100}</span>
                </div>
                <div className="relative w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 h-4 transition-all duration-500 relative"
                    style={{width: `${energiaJogadorPercent}%`}}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {estado.jogador.energia_atual}
                  </div>
                </div>
              </div>

              {/* Indicador de Exaustão */}
              {estado.jogador.exaustao > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Exaustão {estado.jogador.nivel_exaustao && `(${estado.jogador.nivel_exaustao})`}</span>
                    <span className={`font-bold ${
                      estado.jogador.exaustao >= 80 ? 'text-red-500' :
                      estado.jogador.exaustao >= 60 ? 'text-red-400' :
                      estado.jogador.exaustao >= 40 ? 'text-orange-400' :
                      estado.jogador.exaustao >= 20 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {estado.jogador.exaustao >= 80 ? '💀' :
                       estado.jogador.exaustao >= 60 ? '🔴' :
                       estado.jogador.exaustao >= 40 ? '🟠' :
                       estado.jogador.exaustao >= 20 ? '💛' :
                       '💚'} {estado.jogador.exaustao}/100
                    </span>
                  </div>
                  <div className="relative w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 transition-all duration-500 ${
                        estado.jogador.exaustao >= 80 ? 'bg-red-600' :
                        estado.jogador.exaustao >= 60 ? 'bg-red-500' :
                        estado.jogador.exaustao >= 40 ? 'bg-orange-500' :
                        estado.jogador.exaustao >= 20 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{width: `${estado.jogador.exaustao}%`}}
                    ></div>
                  </div>
                  {estado.jogador.exaustao >= 60 && (
                    <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>Stats reduzidos por exaustão!</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="bg-slate-900/80 rounded-lg p-6 border-2 border-slate-700">
              <h3 className="text-cyan-400 font-bold mb-4">⚡ SUAS AÇÕES</h3>
              
              {/* Habilidades */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {estado.jogador.habilidades && estado.jogador.habilidades.length > 0 ? estado.jogador.habilidades.map((hab, index) => {
                  const custoEnergia = hab.custo_energia || hab.custoEnergia || 20;
                  const podeUsar = estado.jogador.energia_atual >= custoEnergia && !turnoIA && !processando;
                  const energiaInsuficiente = estado.jogador.energia_atual < custoEnergia;

                  return (
                    <button
                      key={index}
                      onClick={() => podeUsar && executarAcao('habilidade', index)}
                      disabled={!podeUsar}
                      className={`p-3 rounded-lg border-2 transition-all text-left relative overflow-hidden ${
                        podeUsar
                          ? 'border-purple-500 bg-gradient-to-br from-purple-900/40 to-purple-800/30 hover:from-purple-800/50 hover:to-purple-700/40 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer'
                          : energiaInsuficiente
                          ? 'border-slate-700 bg-slate-800/30 opacity-40 cursor-not-allowed'
                          : 'border-slate-600 bg-slate-800/20 opacity-50 cursor-wait'
                      }`}
                    >
                      {podeUsar && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 animate-pulse"></div>
                      )}
                      <div className="relative z-10">
                        <div className="font-bold text-purple-300 text-sm mb-1 flex items-center justify-between">
                          <span>{hab.nome}</span>
                          {hab.tipo && (
                            <span className="text-[10px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-200">
                              {hab.tipo}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mb-2 line-clamp-2">{hab.descricao}</div>
                        <div className={`text-xs flex items-center justify-between ${
                          energiaInsuficiente ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          <span>⚡ {custoEnergia} energia</span>
                          {energiaInsuficiente && (
                            <span className="text-[10px] text-red-400">❌ Sem energia</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                }) : (
                  <div className="col-span-2 text-center text-slate-400 py-4">
                    Nenhuma habilidade disponível
                  </div>
                )}
              </div>

              {/* Ações Especiais */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => !turnoIA && !processando && executarAcao('ataque_basico')}
                  disabled={turnoIA || processando}
                  className="px-4 py-3 bg-gradient-to-br from-red-900/60 to-red-800/40 hover:from-red-800/70 hover:to-red-700/50 rounded-lg border-2 border-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
                >
                  ⚔️ Ataque Básico <span className="text-xs text-red-300">(0 energia)</span>
                </button>

                <button
                  onClick={() => !turnoIA && !processando && executarAcao('defender')}
                  disabled={turnoIA || processando}
                  className="px-4 py-3 bg-gradient-to-br from-blue-900/60 to-blue-800/40 hover:from-blue-800/70 hover:to-blue-700/50 rounded-lg border-2 border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  🛡️ Defender <span className="text-xs text-blue-300">(+15 energia)</span>
                </button>

                <button
                  onClick={() => !turnoIA && !processando && executarAcao('esperar')}
                  disabled={turnoIA || processando}
                  className="px-4 py-3 bg-gradient-to-br from-green-900/60 to-green-800/40 hover:from-green-800/70 hover:to-green-700/50 rounded-lg border-2 border-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold hover:scale-105 hover:shadow-lg hover:shadow-green-500/20"
                >
                  ⏸️ Esperar <span className="text-xs text-green-300">(+30 energia)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Log de Combate */}
          <div className="bg-slate-900/80 rounded-lg p-4 border-2 border-slate-700 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
            <h3 className="text-cyan-400 font-bold mb-3">📜 LOG DE COMBATE</h3>
            
            <div className="flex-1 overflow-y-auto space-y-1 text-sm font-mono">
              {log.map((entry, i) => (
                <div key={i} className="text-slate-300">
                  {entry.texto}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
