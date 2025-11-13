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

      if (resultado.energiaRecuperada > 0) {
        adicionarLog(`⚡ +${resultado.energiaRecuperada} energia recuperada`);
      }

      if (resultado.dano > 0) {
        adicionarLog(`💥 ${resultado.dano} de dano causado`);
      }

      if (resultado.buffs && resultado.buffs.length > 0) {
        resultado.buffs.forEach(buff => {
          if (buff.tipo === 'defesa') {
            adicionarLog(`🛡️ Defesa aumentada em ${buff.valor}% por 1 turno!`);
          }
        });
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

      // Decrementar turnos dos buffs e remover expirados
      novoEstado.jogador.buffs = novoEstado.jogador.buffs
        .map(buff => ({ ...buff, turnos: buff.turnos - 1 }))
        .filter(buff => buff.turnos > 0);

      novoEstado.inimigo.buffs = novoEstado.inimigo.buffs
        .map(buff => ({ ...buff, turnos: buff.turnos - 1 }))
        .filter(buff => buff.turnos > 0);

      // Regenerar energia
      const turnoJogador = iniciarTurno(novoEstado.jogador, novoEstado);
      novoEstado.jogador.energia_atual = turnoJogador.energia;

      const turnoInimigo = iniciarTurno(novoEstado.inimigo, novoEstado);
      novoEstado.inimigo.energia_atual = turnoInimigo.energia;

      adicionarLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      adicionarLog(`⏰ Rodada ${novoEstado.rodada}`);
      adicionarLog(`⚡ Energia regenerada!`);

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
                    Nv.{estado.inimigo.nivel} • {estado.inimigo.elemento} • {estado.inimigo.raridade}
                  </div>
                </div>
                <div className="w-24 h-24 flex-shrink-0">
                  <AvatarSVG avatar={estado.inimigo} tamanho={96} isEnemy={true} />
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
                <div className="w-24 h-24 flex-shrink-0">
                  <AvatarSVG avatar={estado.jogador} tamanho={96} isEnemy={false} />
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-bold text-cyan-400">{estado.jogador.nome}</h3>
                  <div className="text-sm text-slate-400">
                    Nv.{estado.jogador.nivel} • {estado.jogador.elemento} • {estado.jogador.raridade}
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

              {/* Ataque Básico */}
              <div className="mb-4">
                <button
                  onClick={() => !turnoIA && !processando && executarAcao('atacar')}
                  disabled={turnoIA || processando}
                  className="w-full p-4 rounded-lg border-2 transition-all text-left bg-gradient-to-r from-red-900/40 to-orange-900/40 border-red-500 hover:from-red-900/60 hover:to-orange-900/60 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-red-300 text-lg mb-1">⚔️ Ataque Básico</div>
                      <div className="text-xs text-slate-300">Ataque físico rápido • Sem custo de energia</div>
                    </div>
                    <div className="text-3xl">⚔️</div>
                  </div>
                  <div className="mt-2 text-xs text-green-400">✅ Sempre disponível • Pode causar crítico</div>
                </button>
              </div>

              {/* Habilidades */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {estado.jogador.habilidades && estado.jogador.habilidades.length > 0 ? (
                  estado.jogador.habilidades.map((hab, index) => {
                    // Debug: garantir que custo_energia existe
                    const custoEnergia = hab.custo_energia || hab.custoEnergia || 20;
                    const podeUsar = estado.jogador.energia_atual >= custoEnergia && !turnoIA && !processando;

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
                        <div className="text-xs text-blue-400">⚡ {custoEnergia} energia</div>
                        {!podeUsar && estado.jogador.energia_atual < custoEnergia && (
                          <div className="text-xs text-red-400 mt-1">Energia insuficiente</div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center text-slate-500 py-4">
                    Nenhuma habilidade disponível
                  </div>
                )}
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
