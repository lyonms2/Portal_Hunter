// ==================== SISTEMA DE RECOMPENSAS ====================
// Arquivo: /lib/arena/recompensasCalc.js

/**
 * Recompensas base por dificuldade
 */
const RECOMPENSAS_BASE = {
  facil: {
    xp: 15,
    moedas: 10,
    fragmentos: 0,
    chance_fragmento: 0.02,
    exaustao: 5
  },
  normal: {
    xp: 30,
    moedas: 20,
    fragmentos: 0,
    chance_fragmento: 0.05,
    exaustao: 12
  },
  dificil: {
    xp: 60,
    moedas: 40,
    fragmentos: 0,
    chance_fragmento: 0.10,
    exaustao: 20
  },
  mestre: {
    xp: 120,
    moedas: 80,
    fragmentos: 1,
    chance_fragmento: 0.25,
    exaustao: 30
  }
};

/**
 * Calcula recompensas de uma batalha de treino
 */
export function calcularRecompensasTreino(estado, vencedor) {
  const { dificuldade, jogador, inimigo, rodada } = estado;
  const base = RECOMPENSAS_BASE[dificuldade] || RECOMPENSAS_BASE.normal;

  const recompensas = {
    xp: 0,
    moedas: 0,
    fragmentos: 0,
    vinculo: 0, // Novo campo
    exaustao: base.exaustao,
    mensagens: []
  };

  // === DERROTA ===
  if (vencedor !== 'jogador') {
    recompensas.xp = Math.floor(base.xp * 0.2); // 20% do XP
    recompensas.moedas = Math.floor(base.moedas * 0.1); // 10% das moedas
    recompensas.exaustao = Math.floor(base.exaustao * 0.5); // 50% da exaustão
    recompensas.vinculo = -1; // Perde 1 ponto de vínculo na derrota
    recompensas.mensagens.push('Derrota... mas você ganhou experiência!');
    recompensas.mensagens.push('💔 Seu avatar ficou desapontado (-1 Vínculo)');

    return recompensas;
  }

  // === VITÓRIA ===
  recompensas.xp = base.xp;
  recompensas.moedas = base.moedas;
  recompensas.fragmentos = base.fragmentos;

  // Vínculo base por vitória (2 pontos)
  recompensas.vinculo = 2;

  // === BÔNUS POR PERFORMANCE ===

  // 1. Vitória rápida (menos de 5 rodadas)
  if (rodada <= 5) {
    const bonusRapido = Math.floor(base.xp * 0.25);
    recompensas.xp += bonusRapido;
    recompensas.moedas += Math.floor(base.moedas * 0.25);
    recompensas.vinculo += 1; // +1 vínculo extra
    recompensas.mensagens.push(`⚡ Vitória Rápida! (+${bonusRapido} XP, +1 Vínculo)`);
  }

  // 2. Vitória perfeita (sem tomar dano ou com 80%+ HP)
  const hpPercent = jogador.hp_atual / jogador.hp_maximo;
  if (hpPercent >= 0.8) {
    const bonusPerfeito = Math.floor(base.xp * 0.5);
    recompensas.xp += bonusPerfeito;
    recompensas.moedas += Math.floor(base.moedas * 0.5);
    recompensas.vinculo += 2; // +2 vínculo extra
    recompensas.mensagens.push(`👑 Vitória Perfeita! (+${bonusPerfeito} XP, +2 Vínculo)`);
  } else if (jogador.hp_atual === jogador.hp_maximo) {
    const bonusSemDano = Math.floor(base.xp * 1.0);
    recompensas.xp += bonusSemDano;
    recompensas.moedas += base.moedas;
    recompensas.fragmentos += 1;
    recompensas.vinculo += 5; // +5 vínculo por vitória sem dano!
    recompensas.mensagens.push(`💎 SEM DANO! Incrível! (+${bonusSemDano} XP, +1 Fragmento, +5 Vínculo)`);
  }

  // 3. Bônus de vínculo (vínculo alto dá mais XP)
  if (jogador.vinculo >= 80) {
    const bonusVinculo = Math.floor(recompensas.xp * 0.2);
    recompensas.xp += bonusVinculo;
    recompensas.mensagens.push(`💜 Bônus de Vínculo! (+${bonusVinculo} XP)`);
  }

  // 4. Chance de fragmento extra
  if (Math.random() < base.chance_fragmento) {
    recompensas.fragmentos += 1;
    recompensas.mensagens.push('💎 Você encontrou um Fragmento extra!');
  }

  // 5. Bônus por dificuldade alta
  if (dificuldade === 'mestre') {
    recompensas.vinculo += 3; // +3 vínculo extra por dificuldade mestre
    recompensas.mensagens.push('⭐ Derrotou um adversário Lendário! (+3 Vínculo)');
  } else if (dificuldade === 'dificil') {
    recompensas.vinculo += 1; // +1 vínculo extra por dificuldade difícil
  }

  // Adicionar mensagem de vínculo ganho total
  if (recompensas.vinculo > 0) {
    recompensas.mensagens.push(`💚 Vínculo fortalecido! (+${recompensas.vinculo})`);
  }

  return recompensas;
}

/**
 * Aplica recompensas ao jogador e avatar
 */
export async function aplicarRecompensas(userId, avatarId, recompensas) {
  try {
    // Atualizar stats do jogador
    const statsResponse = await fetch('/api/atualizar-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        moedas: recompensas.moedas,
        fragmentos: recompensas.fragmentos
      })
    });

    if (!statsResponse.ok) {
      throw new Error('Erro ao atualizar stats do jogador');
    }

    // Atualizar avatar (XP, exaustão e vínculo)
    const avatarResponse = await fetch('/api/atualizar-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        avatarId,
        experiencia: recompensas.xp,
        exaustao: recompensas.exaustao,
        vinculo: recompensas.vinculo || 0 // Adicionar vínculo
      })
    });

    if (!avatarResponse.ok) {
      throw new Error('Erro ao atualizar avatar');
    }

    const avatarData = await avatarResponse.json();

    return {
      sucesso: true,
      levelUp: avatarData.levelUp || false,
      novoNivel: avatarData.novoNivel,
      vinculoNovo: avatarData.vinculo,
      nivelVinculo: avatarData.nivelVinculo,
      ...recompensas
    };

  } catch (error) {
    console.error('Erro ao aplicar recompensas:', error);
    return {
      sucesso: false,
      erro: error.message
    };
  }
}

/**
 * Calcula exaustão ganha na batalha
 */
export function calcularExaustaoGanha(estado, vencedor) {
  const { dificuldade, rodada } = estado;
  const base = RECOMPENSAS_BASE[dificuldade] || RECOMPENSAS_BASE.normal;
  
  let exaustao = base.exaustao;
  
  // Batalha longa aumenta exaustão
  if (rodada > 10) {
    exaustao += (rodada - 10) * 2;
  }
  
  // Derrota gera menos exaustão (avatar não lutou tanto)
  if (vencedor !== 'jogador') {
    exaustao = Math.floor(exaustao * 0.6);
  }
  
  return exaustao;
}

/**
 * Gera resumo de recompensas formatado
 */
export function gerarResumoRecompensas(recompensas) {
  const linhas = [
    '🎁 RECOMPENSAS DA BATALHA',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━'
  ];

  if (recompensas.xp > 0) {
    linhas.push(`⭐ XP Ganho: +${recompensas.xp}`);
  }

  if (recompensas.moedas > 0) {
    linhas.push(`💰 Moedas: +${recompensas.moedas}`);
  }

  if (recompensas.fragmentos > 0) {
    linhas.push(`💎 Fragmentos: +${recompensas.fragmentos}`);
  }

  if (recompensas.vinculo) {
    const sinal = recompensas.vinculo > 0 ? '+' : '';
    const emoji = recompensas.vinculo > 0 ? '💚' : '💔';
    linhas.push(`${emoji} Vínculo: ${sinal}${recompensas.vinculo}`);
  }

  if (recompensas.exaustao > 0) {
    linhas.push(`😰 Exaustão: +${recompensas.exaustao}`);
  }

  if (recompensas.mensagens && recompensas.mensagens.length > 0) {
    linhas.push('');
    linhas.push('🏆 BÔNUS:');
    recompensas.mensagens.forEach(msg => {
      linhas.push(`  • ${msg}`);
    });
  }

  if (recompensas.levelUp) {
    linhas.push('');
    linhas.push(`🎉 LEVEL UP! Agora você é nível ${recompensas.novoNivel}!`);
  }

  if (recompensas.nivelVinculo) {
    linhas.push('');
    linhas.push(`${recompensas.nivelVinculo.emoji} Nível de Vínculo: ${recompensas.nivelVinculo.nome}`);
  }

  return linhas.join('\n');
}

/**
 * Verifica se jogador pode continuar treinando
 */
export function podeIniciarTreino(avatar) {
  // Verificar exaustão
  if (avatar.exaustao >= 100) {
    return {
      pode: false,
      motivo: 'Avatar está colapsado! Precisa descansar.'
    };
  }
  
  if (avatar.exaustao >= 80) {
    return {
      pode: false,
      motivo: 'Avatar muito exausto! Risco de colapso.'
    };
  }
  
  // Verificar se está vivo
  if (!avatar.vivo) {
    return {
      pode: false,
      motivo: 'Avatar está morto! Visite o Necromante.'
    };
  }
  
  // Aviso se exaustão moderada
  if (avatar.exaustao >= 60) {
    return {
      pode: true,
      aviso: 'Avatar está exausto! Terá penalidades em combate.'
    };
  }
  
  return { pode: true };
}

export default {
  RECOMPENSAS_BASE,
  calcularRecompensasTreino,
  aplicarRecompensas,
  calcularExaustaoGanha,
  gerarResumoRecompensas,
  podeIniciarTreino
};
