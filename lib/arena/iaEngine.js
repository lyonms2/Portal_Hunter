// ==================== IA DO ADVERSÁRIO ====================
// Arquivo: /lib/arena/iaEngine.js

import { usarHabilidade, defender, esperar, calcularDano } from './batalhaEngine';

/**
 * Comportamentos da IA por dificuldade
 */
const COMPORTAMENTOS = {
  facil: {
    agressividade: 0.6, // 60% chance de atacar
    usa_defesa: 0.2,
    usa_esperar: 0.2,
    prioriza_ultimate: false,
    considera_vantagem_elemental: false,
    considera_hp_baixo: false
  },
  
  normal: {
    agressividade: 0.7,
    usa_defesa: 0.2,
    usa_esperar: 0.1,
    prioriza_ultimate: true,
    considera_vantagem_elemental: true,
    considera_hp_baixo: true,
    hp_baixo_threshold: 0.3 // 30%
  },
  
  dificil: {
    agressividade: 0.75,
    usa_defesa: 0.15,
    usa_esperar: 0.1,
    prioriza_ultimate: true,
    considera_vantagem_elemental: true,
    considera_hp_baixo: true,
    hp_baixo_threshold: 0.4,
    usa_combo: true
  },
  
  mestre: {
    agressividade: 0.8,
    usa_defesa: 0.15,
    usa_esperar: 0.05,
    prioriza_ultimate: true,
    considera_vantagem_elemental: true,
    considera_hp_baixo: true,
    hp_baixo_threshold: 0.5,
    usa_combo: true,
    perfeita: true // Sempre faz a melhor jogada
  }
};

/**
 * Avalia o valor de uma habilidade
 */
function avaliarHabilidade(habilidade, estado) {
  const { inimigo, jogador } = estado;
  
  // Não pode usar se não tem energia
  if (inimigo.energia_atual < habilidade.custo_energia) {
    return -1;
  }
  
  let score = habilidade.dano_base || 0;
  
  // Prioriza habilidades de alto dano
  score += habilidade.multiplicador_stat * 10;
  
  // Bônus se tem efeitos de status
  if (habilidade.efeitos_status && habilidade.efeitos_status.length > 0) {
    score += 20;
  }
  
  // Penalidade por custo alto
  score -= habilidade.custo_energia * 0.5;
  
  // Bônus se é ultimate e tem energia suficiente
  if (habilidade.raridade === 'Ultimate' && inimigo.energia_atual >= habilidade.custo_energia) {
    score += 50;
  }
  
  return score;
}

/**
 * Decide ação da IA
 */
export function decidirAcaoIA(estado) {
  const { inimigo, jogador, dificuldade } = estado;
  const comportamento = COMPORTAMENTOS[dificuldade] || COMPORTAMENTOS.normal;
  
  // Calcular HP percentual
  const hpPercent = inimigo.hp_atual / inimigo.hp_maximo;
  const hpJogadorPercent = jogador.hp_atual / jogador.hp_maximo;
  
  // === MODO MESTRE: IA Perfeita ===
  if (comportamento.perfeita) {
    return decidirAcaoPerfeita(estado);
  }
  
  // === HP BAIXO: Prioriza sobrevivência ===
  if (comportamento.considera_hp_baixo && hpPercent < comportamento.hp_baixo_threshold) {
    // 50% chance de defender se HP baixo
    if (Math.random() < 0.5) {
      return { tipo: 'defender' };
    }
    
    // 30% chance de esperar para recuperar energia
    if (inimigo.energia_atual < 40 && Math.random() < 0.3) {
      return { tipo: 'esperar' };
    }
  }
  
  // === ENERGIA BAIXA: Esperar ou defender ===
  if (inimigo.energia_atual < 30) {
    if (Math.random() < 0.6) {
      return { tipo: 'esperar' };
    } else {
      return { tipo: 'defender' };
    }
  }
  
  // === DECISÃO NORMAL ===
  const rand = Math.random();
  
  // Defender?
  if (rand < comportamento.usa_defesa) {
    return { tipo: 'defender' };
  }
  
  // Esperar?
  if (rand < comportamento.usa_defesa + comportamento.usa_esperar) {
    return { tipo: 'esperar' };
  }
  
  // Atacar - escolher melhor habilidade
  const habilidades = inimigo.habilidades;
  let melhorHabilidade = 0;
  let melhorScore = -1;
  
  habilidades.forEach((hab, index) => {
    const score = avaliarHabilidade(hab, estado);
    if (score > melhorScore) {
      melhorScore = score;
      melhorHabilidade = index;
    }
  });
  
  // Se nenhuma habilidade disponível, esperar
  if (melhorScore < 0) {
    return { tipo: 'esperar' };
  }
  
  return {
    tipo: 'habilidade',
    habilidadeIndex: melhorHabilidade
  };
}

/**
 * IA Perfeita (Modo Mestre)
 * Faz cálculos avançados para escolher a melhor jogada
 */
function decidirAcaoPerfeita(estado) {
  const { inimigo, jogador } = estado;
  
  const hpPercent = inimigo.hp_atual / inimigo.hp_maximo;
  const hpJogadorPercent = jogador.hp_atual / jogador.hp_maximo;
  
  // === ANÁLISE: Pode matar o jogador neste turno? ===
  for (let i = 0; i < inimigo.habilidades.length; i++) {
    const hab = inimigo.habilidades[i];
    
    if (inimigo.energia_atual < hab.custo_energia) continue;
    
    // Simular dano
    const danoSimulado = simularDano(hab, inimigo, jogador);
    
    // Se pode matar, MATA!
    if (danoSimulado >= jogador.hp_atual) {
      return {
        tipo: 'habilidade',
        habilidadeIndex: i
      };
    }
  }
  
  // === ANÁLISE: HP crítico? ===
  if (hpPercent < 0.25) {
    // Se jogador também está com HP baixo, all-in!
    if (hpJogadorPercent < 0.3) {
      // Ataque mais forte disponível
      return escolherMelhorAtaque(estado);
    }
    
    // Senão, defender
    if (inimigo.energia_atual < 50) {
      return { tipo: 'esperar' };
    }
    return { tipo: 'defender' };
  }
  
  // === ANÁLISE: Energia para ultimate? ===
  const ultimate = inimigo.habilidades.find(h => h.raridade === 'Ultimate');
  if (ultimate && inimigo.energia_atual >= ultimate.custo_energia) {
    const index = inimigo.habilidades.indexOf(ultimate);
    return {
      tipo: 'habilidade',
      habilidadeIndex: index
    };
  }
  
  // === ESTRATÉGIA PADRÃO: Melhor ataque disponível ===
  return escolherMelhorAtaque(estado);
}

/**
 * Escolhe o ataque com melhor custo-benefício
 */
function escolherMelhorAtaque(estado) {
  const { inimigo, jogador } = estado;
  
  let melhorIndex = 0;
  let melhorRatio = 0;
  
  inimigo.habilidades.forEach((hab, index) => {
    if (inimigo.energia_atual < hab.custo_energia) return;
    
    const dano = simularDano(hab, inimigo, jogador);
    const ratio = dano / hab.custo_energia; // Dano por energia
    
    if (ratio > melhorRatio) {
      melhorRatio = ratio;
      melhorIndex = index;
    }
  });
  
  // Se nenhum ataque disponível
  if (melhorRatio === 0) {
    if (inimigo.energia_atual < 40) {
      return { tipo: 'esperar' };
    }
    return { tipo: 'defender' };
  }
  
  return {
    tipo: 'habilidade',
    habilidadeIndex: melhorIndex
  };
}

/**
 * Simula dano de uma habilidade (versão simplificada para IA)
 * Reutiliza calcularDano do batalhaEngine sem aplicar crítico
 *
 * @param {Object} habilidade - Habilidade a simular
 * @param {Object} atacante - Avatar atacante
 * @param {Object} defensor - Avatar defensor
 * @returns {number} Dano estimado (sem crítico)
 */
function simularDano(habilidade, atacante, defensor) {
  // Reutiliza função completa de cálculo de dano
  // mas sempre sem crítico (false) para estimativa conservadora
  return calcularDano(atacante, habilidade, defensor, false);
}

/**
 * Processa turno da IA
 */
export function processarTurnoIA(estado) {
  // Decidir ação
  const acao = decidirAcaoIA(estado);

  let resultado;

  switch (acao.tipo) {
    case 'habilidade':
      const habilidade = estado.inimigo.habilidades[acao.habilidadeIndex];
      resultado = usarHabilidade(estado.inimigo, habilidade, estado.jogador, estado);

      // Atualizar estado
      if (resultado.sucesso) {
        estado.jogador.hp_atual = resultado.novoHP;
        estado.inimigo.energia_atual = resultado.novaEnergia;

        // Atualizar HP do atacante se houver cura
        if (resultado.novoHPAtacante !== undefined && resultado.novoHPAtacante !== estado.inimigo.hp_atual) {
          estado.inimigo.hp_atual = resultado.novoHPAtacante;
        }
      } else {
        // Mesmo se falhou, pode ter gastado energia
        if (resultado.energiaGasta > 0) {
          estado.inimigo.energia_atual = resultado.novaEnergia;
        }
      }
      break;

    case 'defender':
      resultado = defender(estado.inimigo, estado);
      estado.inimigo.energia_atual = resultado.novaEnergia;
      if (!estado.inimigo.buffs) estado.inimigo.buffs = [];
      estado.inimigo.buffs.push(...(resultado.buffs || []));
      break;

    case 'esperar':
      resultado = esperar(estado.inimigo, estado);
      estado.inimigo.energia_atual = resultado.novaEnergia;
      break;

    default:
      resultado = { sucesso: false, mensagem: 'Ação inválida da IA!' };
  }

  // Adicionar ao histórico
  estado.historico.push({
    rodada: estado.rodada,
    turno: 'inimigo',
    acao: acao.tipo,
    resultado,
    timestamp: new Date().toISOString()
  });

  return resultado;
}

/**
 * Mensagens de flavor para a IA
 */
export function getMensagemIA(acao, estado) {
  const mensagens = {
    habilidade: [
      "O adversário prepara seu ataque!",
      "Uma energia poderosa se concentra!",
      "Seu oponente lança sua técnica!",
    ],
    defender: [
      "O adversário assume posição defensiva!",
      "Uma barreira se forma!",
      "Seu oponente se prepara para o contra-ataque!",
    ],
    esperar: [
      "O adversário está concentrando energia!",
      "Seu oponente aguarda o momento certo!",
      "Uma aura misteriosa envolve o inimigo...",
    ]
  };
  
  const lista = mensagens[acao.tipo] || ["O adversário age!"];
  return lista[Math.floor(Math.random() * lista.length)];
}

export default {
  decidirAcaoIA,
  processarTurnoIA,
  getMensagemIA,
};
