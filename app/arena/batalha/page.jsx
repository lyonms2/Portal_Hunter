"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { processarAcaoJogador, verificarVitoria, iniciarTurno } from "@/lib/arena/batalhaEngine";
import { processarTurnoIA, getMensagemIA } from "@/lib/arena/iaEngine";
import { calcularRecompensasTreino } from "@/lib/arena/recompensasCalc";

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

        // Atualizar avatar (XP e exaustão)
        await fetch('/api/atualizar-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            avatarId: estado.jogador.id,
            experiencia: resultado.recompensas.xp,
            exaustao: resultado.recompensas.exaustao
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

              <div className="text-center p-3 bg-orange-900/30 rounded border border-orange-500/50">
                <span className="text-orange-400 text-sm">
                  😰 +{resultado.recompensas.exaustao} Exaustão
                </span>
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
            <div className="bg-slate-900/80 rounded-lg p-6 border-2 border-red-500/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-red-400">{estado.inimigo.nome}</h3>
                  <div className="text-sm text-slate-400">
                    Nv.{estado.inimigo.nivel} • {estado.inimigo.elemento}
                  </div>
                </div>
                <div className="text-6xl">
                  {estado.inimigo.elemento === 'Fogo' && '🔥'}
                  {estado.inimigo.elemento === 'Água' && '💧'}
                  {estado.inimigo.elemento === 'Terra' && '🪨'}
                  {estado.inimigo.elemento === 'Vento' && '💨'}
                  {estado.inimigo.elemento === 'Eletricidade' && '⚡'}
                  {estado.inimigo.elemento === 'Sombra' && '🌑'}
                  {estado.inimigo.elemento === 'Luz' && '✨'}
                </div>
              </div>

              {/* HP do Inimigo */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">HP</span>
                  <span className="text-red-400 font-mono">{estado.inimigo.hp_atual} / {estado.inimigo.hp_maximo}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-4 transition-all duration-500"
                    style={{width: `${hpInimigoPercent}%`}}
                  ></div>
                </div>
              </div>
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="inline-block bg-slate-900 px-6 py-2 rounded-full border-2 border-orange-500 text-orange-400 font-black text-2xl">
                ⚔️ VS ⚔️
              </div>
            </div>

            {/* Jogador */}
            <div className="bg-slate-900/80 rounded-lg p-6 border-2 border-cyan-500/50">
              <div className="flex items-center justify-between mb-4">
                <div className="text-6xl">
                  {estado.jogador.elemento === 'Fogo' && '🔥'}
                  {estado.jogador.elemento === 'Água' && '💧'}
                  {estado.jogador.elemento === 'Terra' && '🪨'}
                  {estado.jogador.elemento === 'Vento' && '💨'}
                  {estado.jogador.elemento === 'Eletricidade' && '⚡'}
                  {estado.jogador.elemento === 'Sombra' && '🌑'}
                  {estado.jogador.elemento === 'Luz' && '✨'}
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-bold text-cyan-400">{estado.jogador.nome}</h3>
                  <div className="text-sm text-slate-400">
                    Nv.{estado.jogador.nivel} • {estado.jogador.elemento}
                  </div>
                </div>
              </div>

              {/* HP do Jogador */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">HP</span>
                  <span className="text-green-400 font-mono">{estado.jogador.hp_atual} / {estado.jogador.hp_maximo}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-4 transition-all duration-500"
                    style={{width: `${hpJogadorPercent}%`}}
                  ></div>
                </div>
              </div>

              {/* Energia do Jogador */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Energia</span>
                  <span className="text-blue-400 font-mono">{estado.jogador.energia_atual} / 100</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 transition-all duration-500"
                    style={{width: `${energiaJogadorPercent}%`}}
                  ></div>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="bg-slate-900/80 rounded-lg p-6 border-2 border-slate-700">
              <h3 className="text-cyan-400 font-bold mb-4">⚡ SUAS AÇÕES</h3>
              
              {/* Habilidades */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {estado.jogador.habilidades.map((hab, index) => {
                  const podeUsar = estado.jogador.energia_atual >= hab.custo_energia && !turnoIA && !processando;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => podeUsar && executarAcao('habilidade', index)}
                      disabled={!podeUsar}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        podeUsar
                          ? 'border-purple-500 bg-purple-900/30 hover:bg-purple-900/50'
                          : 'border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-bold text-purple-300 text-sm mb-1">{hab.nome}</div>
                      <div className="text-xs text-slate-400 mb-2 line-clamp-2">{hab.descricao}</div>
                      <div className="text-xs text-blue-400">⚡ {hab.custo_energia} energia</div>
                    </button>
                  );
                })}
              </div>

              {/* Ações Especiais */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => !turnoIA && !processando && executarAcao('defender')}
                  disabled={turnoIA || processando}
                  className="px-4 py-3 bg-blue-900/50 hover:bg-blue-900/70 rounded border border-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  🛡️ Defender (+15 energia)
                </button>
                
                <button
                  onClick={() => !turnoIA && !processando && executarAcao('esperar')}
                  disabled={turnoIA || processando}
                  className="px-4 py-3 bg-green-900/50 hover:bg-green-900/70 rounded border border-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  ⏸️ Esperar (+30 energia)
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
