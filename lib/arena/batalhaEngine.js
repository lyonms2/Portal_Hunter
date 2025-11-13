// ==================== MOTOR DE BATALHA ====================
// Arquivo: /lib/arena/batalhaEngine.js

import { calcularVantagemElemental } from '../../app/avatares/sistemas/elementalSystem';
import { calcularDanoHabilidade } from '../../app/avatares/sistemas/abilitiesSystem';
import { calcularHPMaximoCompleto } from '../combat/statsCalculator';

/**
 * Configurações da batalha
 */
export const CONFIG_BATALHA = {
  ENERGIA_INICIAL: 100,
  ENERGIA_MAXIMA: 100,
  ENERGIA_POR_TURNO: 20,
  RODADAS_MAXIMAS: 20,
  CHANCE_CRITICO_BASE: 0.05, // 5%
  MULTIPLICADOR_CRITICO: 2.0,
  TEMPO_TURNO: 30000, // 30 segundos
};

/**
 * Calcula HP máximo do avatar
 * @deprecated Use calcularHPMaximoCompleto de statsCalculator.js
 */
export function calcularHPMaximo(avatar) {
  return calcularHPMaximoCompleto(avatar);
}

/**
 * Calcula dano de uma habilidade
 */
export function calcularDano(atacante, habilidade, defensor, critico = false) {
  // Dano base da habilidade
  let dano = habilidade.dano_base || 30;
  
  // Aplica multiplicador do stat primário
  const statValue = atacante[habilidade.stat_primario] || atacante.forca;
  dano += statValue * (habilidade.multiplicador_stat || 1.0);
  
  // Bônus de nível
  dano += atacante.nivel * 2;
  
  // Vantagem elemental
  const vantagemElemental = calcularVantagemElemental(atacante.elemento, defensor.elemento);
  dano *= vantagemElemental;
  
  // Crítico
  if (critico) {
    dano *= CONFIG_BATALHA.MULTIPLICADOR_CRITICO;
  }
  
  // Defesa do oponente (reduz até 50% do dano)
  const reducao = Math.min(defensor.resistencia * 0.5, dano * 0.5);
  dano -= reducao;
  
  // Bônus de vínculo (se avatar do jogador)
  if (atacante.vinculo >= 80) {
    dano *= 1.2; // +20% com vínculo alto
  } else if (atacante.vinculo >= 60) {
    dano *= 1.1; // +10%
  }
  
  // Penalidade de exaustão
  if (atacante.exaustao >= 80) {
    dano *= 0.5; // -50% se exausto
  } else if (atacante.exaustao >= 60) {
    dano *= 0.75; // -25%
  }
  
  return Math.max(1, Math.floor(dano));
}

/**
 * Calcula chance de crítico
 */
export function calcularChanceCritico(avatar) {
  let chance = CONFIG_BATALHA.CHANCE_CRITICO_BASE;
  
  // Foco aumenta crítico
  chance += avatar.foco * 0.003; // +0.3% por ponto de foco
  
  // Vínculo alto aumenta
  if (avatar.vinculo >= 80) {
    chance += 0.10; // +10%
  }
  
  // Exaustão reduz
  if (avatar.exaustao >= 60) {
    chance *= 0.5;
  }
  
  return Math.min(chance, 0.5); // Cap de 50%
}

/**
 * Verifica se o ataque foi crítico
 */
export function isCritico(avatar) {
  const chance = calcularChanceCritico(avatar);
  return Math.random() < chance;
}

/**
 * Processa o uso de uma habilidade
 */
export function usarHabilidade(atacante, habilidade, defensor, estado) {
  const resultado = {
    sucesso: false,
    mensagem: '',
    dano: 0,
    critico: false,
    energiaGasta: 0,
    efeitosAplicados: [],
    novoHP: defensor.hp_atual,
    novaEnergia: atacante.energia_atual,
  };
  
  // Verificar energia suficiente
  if (atacante.energia_atual < habilidade.custo_energia) {
    resultado.mensagem = `${atacante.nome} não tem energia suficiente!`;
    return resultado;
  }
  
  // Chance de falhar se vínculo baixo
  if (atacante.vinculo < 20 && Math.random() < 0.05) {
    resultado.mensagem = `${atacante.nome} hesitou e não obedeceu o comando!`;
    resultado.energiaGasta = Math.floor(habilidade.custo_energia / 2);
    resultado.novaEnergia = atacante.energia_atual - resultado.energiaGasta;
    return resultado;
  }
  
  // Verificar se acertou (chance de esquiva do defensor)
  const chanceAcerto = habilidade.chance_acerto || 95;
  const evasaoDefensor = Math.min(defensor.agilidade * 0.3, 40); // Cap 40%
  
  if (Math.random() * 100 > chanceAcerto - evasaoDefensor) {
    resultado.mensagem = `${defensor.nome} esquivou do ataque!`;
    resultado.energiaGasta = habilidade.custo_energia;
    resultado.novaEnergia = atacante.energia_atual - resultado.energiaGasta;
    return resultado;
  }
  
  // Calcular dano
  const critico = isCritico(atacante);
  const dano = calcularDano(atacante, habilidade, defensor, critico);
  
  // Aplicar dano
  const novoHP = Math.max(0, defensor.hp_atual - dano);
  
  // Construir resultado
  resultado.sucesso = true;
  resultado.dano = dano;
  resultado.critico = critico;
  resultado.novoHP = novoHP;
  resultado.energiaGasta = habilidade.custo_energia;
  resultado.novaEnergia = atacante.energia_atual - habilidade.custo_energia;
  
  // Mensagem
  const vantagemTexto = calcularVantagemElemental(atacante.elemento, defensor.elemento);
  let vantagemMsg = '';
  if (vantagemTexto >= 1.5) vantagemMsg = ' (SUPER EFETIVO!)';
  else if (vantagemTexto <= 0.75) vantagemMsg = ' (Pouco efetivo...)';
  
  resultado.mensagem = `${atacante.nome} usou ${habilidade.nome}! Causou ${dano} de dano${critico ? ' (CRÍTICO!)' : ''}${vantagemMsg}`;
  
  // Aplicar efeitos de status (futura implementação)
  if (habilidade.efeitos_status && habilidade.efeitos_status.length > 0) {
    resultado.efeitosAplicados = habilidade.efeitos_status;
  }
  
  return resultado;
}

/**
 * Ação de defender
 */
export function defender(avatar, estado) {
  return {
    sucesso: true,
    mensagem: `${avatar.nome} assumiu posição defensiva!`,
    energiaGasta: 0,
    energiaRecuperada: 15,
    novaEnergia: Math.min(CONFIG_BATALHA.ENERGIA_MAXIMA, avatar.energia_atual + 15),
    defesaAumentada: true,
    buffs: [{
      tipo: 'defesa',
      valor: 50, // +50% defesa
      turnos: 1
    }]
  };
}

/**
 * Ação de esperar (recupera mais energia)
 */
export function esperar(avatar, estado) {
  return {
    sucesso: true,
    mensagem: `${avatar.nome} concentrou suas energias!`,
    energiaGasta: 0,
    energiaRecuperada: 30,
    novaEnergia: Math.min(CONFIG_BATALHA.ENERGIA_MAXIMA, avatar.energia_atual + 30)
  };
}

/**
 * Processa início do turno
 */
export function iniciarTurno(avatar, estado) {
  // Regenera energia
  const energiaRegenerada = CONFIG_BATALHA.ENERGIA_POR_TURNO;
  const novaEnergia = Math.min(
    CONFIG_BATALHA.ENERGIA_MAXIMA,
    avatar.energia_atual + energiaRegenerada
  );
  
  // Processar buffs/debuffs (futura implementação)
  
  return {
    energia: novaEnergia,
    mensagem: `Turno de ${avatar.nome}! (+${energiaRegenerada} energia)`
  };
}

/**
 * Verifica condição de vitória
 */
export function verificarVitoria(estado) {
  const jogadorMorto = estado.jogador.hp_atual <= 0;
  const inimigoMorto = estado.inimigo.hp_atual <= 0;
  const maxRodadas = estado.rodada >= CONFIG_BATALHA.RODADAS_MAXIMAS;
  
  if (jogadorMorto && inimigoMorto) {
    return { fim: true, vencedor: 'empate', razao: 'Ambos caíram!' };
  }
  
  if (jogadorMorto) {
    return { fim: true, vencedor: 'inimigo', razao: 'Seu avatar foi derrotado!' };
  }
  
  if (inimigoMorto) {
    return { fim: true, vencedor: 'jogador', razao: 'Vitória!' };
  }
  
  if (maxRodadas) {
    // Empate por tempo - vence quem tem mais HP %
    const hpJogadorPercent = estado.jogador.hp_atual / estado.jogador.hp_maximo;
    const hpInimigoPercent = estado.inimigo.hp_atual / estado.inimigo.hp_maximo;
    
    if (hpJogadorPercent > hpInimigoPercent) {
      return { fim: true, vencedor: 'jogador', razao: 'Vitória por pontos!' };
    } else if (hpInimigoPercent > hpJogadorPercent) {
      return { fim: true, vencedor: 'inimigo', razao: 'Derrota por pontos!' };
    } else {
      return { fim: true, vencedor: 'empate', razao: 'Empate técnico!' };
    }
  }
  
  return { fim: false };
}

/**
 * Inicializa estado da batalha
 */
export function inicializarBatalha(avatarJogador, avatarInimigo, dificuldade = 'normal') {
  // Calcular stats do inimigo baseado na dificuldade
  let multiplicador = 1.0;
  switch (dificuldade) {
    case 'facil': multiplicador = 0.7; break;
    case 'normal': multiplicador = 1.0; break;
    case 'dificil': multiplicador = 1.3; break;
    case 'mestre': multiplicador = 1.5; break;
  }
  
  // Stats do inimigo
  const inimigoAjustado = {
    ...avatarInimigo,
    forca: Math.floor(avatarInimigo.forca * multiplicador),
    agilidade: Math.floor(avatarInimigo.agilidade * multiplicador),
    resistencia: Math.floor(avatarInimigo.resistencia * multiplicador),
    foco: Math.floor(avatarInimigo.foco * multiplicador),
  };
  
  const hpJogador = calcularHPMaximo(avatarJogador);
  const hpInimigo = calcularHPMaximo(inimigoAjustado);
  
  return {
    id: `battle_${Date.now()}`,
    tipo: 'treino',
    dificuldade,
    rodada: 1,
    turno_atual: 'jogador', // Jogador sempre começa
    
    jogador: {
      ...avatarJogador,
      hp_maximo: hpJogador,
      hp_atual: hpJogador,
      energia_atual: CONFIG_BATALHA.ENERGIA_INICIAL,
      buffs: [],
      debuffs: [],
    },
    
    inimigo: {
      ...inimigoAjustado,
      hp_maximo: hpInimigo,
      hp_atual: hpInimigo,
      energia_atual: CONFIG_BATALHA.ENERGIA_INICIAL,
      buffs: [],
      debuffs: [],
    },
    
    historico: [],
    iniciado_em: new Date().toISOString(),
  };
}

/**
 * Processa ação do jogador
 */
export function processarAcaoJogador(estado, acao) {
  const { tipo, habilidadeIndex } = acao;
  
  let resultado;
  
  switch (tipo) {
    case 'habilidade':
      const habilidade = estado.jogador.habilidades[habilidadeIndex];
      resultado = usarHabilidade(estado.jogador, habilidade, estado.inimigo, estado);
      
      // Atualizar estado
      estado.inimigo.hp_atual = resultado.novoHP;
      estado.jogador.energia_atual = resultado.novaEnergia;
      break;
      
    case 'defender':
      resultado = defender(estado.jogador, estado);
      estado.jogador.energia_atual = resultado.novaEnergia;
      estado.jogador.buffs.push(...(resultado.buffs || []));
      break;
      
    case 'esperar':
      resultado = esperar(estado.jogador, estado);
      estado.jogador.energia_atual = resultado.novaEnergia;
      break;
      
    default:
      resultado = { sucesso: false, mensagem: 'Ação inválida!' };
  }
  
  // Adicionar ao histórico
  estado.historico.push({
    rodada: estado.rodada,
    turno: 'jogador',
    acao: tipo,
    resultado,
    timestamp: new Date().toISOString()
  });
  
  return resultado;
}

/**
 * Exportações
 */
export default {
  CONFIG_BATALHA,
  calcularHPMaximo,
  calcularDano,
  calcularChanceCritico,
  isCritico,
  usarHabilidade,
  defender,
  esperar,
  iniciarTurno,
  verificarVitoria,
  inicializarBatalha,
  processarAcaoJogador,
};
