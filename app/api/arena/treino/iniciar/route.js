// ==================== API: INICIAR TREINO ====================
// Arquivo: /app/api/arena/treino/iniciar/route.js

import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { inicializarBatalha } from '@/lib/arena/batalhaEngine';
import { selecionarHabilidadesIniciais } from '@/app/avatares/sistemas/abilitiesSystem';
import { gerarStatsBalanceados } from '@/app/avatares/sistemas/statsSystem';

const supabase = getSupabaseServiceClient();

/**
 * Gera um avatar inimigo para treino
 */
function gerarAvatarInimigo(nivel, dificuldade) {
  const elementos = ['Fogo', 'Água', 'Terra', 'Vento', 'Eletricidade', 'Sombra', 'Luz'];
  const elemento = elementos[Math.floor(Math.random() * elementos.length)];
  
  // Raridade baseada na dificuldade
  let raridade;
  switch (dificuldade) {
    case 'facil':
      raridade = 'Comum';
      break;
    case 'normal':
      raridade = Math.random() < 0.7 ? 'Comum' : 'Raro';
      break;
    case 'dificil':
      raridade = Math.random() < 0.5 ? 'Raro' : 'Comum';
      break;
    case 'mestre':
      raridade = Math.random() < 0.6 ? 'Lendário' : 'Raro';
      break;
    default:
      raridade = 'Comum';
  }
  
  // Gerar stats
  const stats = gerarStatsBalanceados(raridade, elemento);
  
  // Gerar habilidades
  const habilidades = selecionarHabilidadesIniciais(elemento, raridade);
  
  return {
    id: `ia_${Date.now()}`,
    nome: `${elemento} Selvagem`,
    elemento,
    raridade,
    nivel,
    ...stats,
    habilidades,
    vivo: true,
    vinculo: 0,
    exaustao: 0
  };
}

export async function POST(request) {
  try {
    const { userId, avatarId, dificuldade } = await request.json();
    
    if (!userId || !avatarId || !dificuldade) {
      return NextResponse.json(
        { message: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    // Buscar avatar do jogador
    const { data: avatar, error: avatarError } = await supabase
      .from('avatares')
      .select('*')
      .eq('id', avatarId)
      .eq('user_id', userId)
      .single();
    
    if (avatarError || !avatar) {
      return NextResponse.json(
        { message: 'Avatar não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar se pode lutar
    if (!avatar.vivo) {
      return NextResponse.json(
        { message: 'Avatar está morto!' },
        { status: 400 }
      );
    }
    
    if (avatar.exaustao >= 100) {
      return NextResponse.json(
        { message: 'Avatar está colapsado! Precisa descansar.' },
        { status: 400 }
      );
    }
    
    // Garantir que o avatar tenha habilidades
    if (!avatar.habilidades || avatar.habilidades.length === 0) {
      avatar.habilidades = selecionarHabilidadesIniciais(avatar.elemento, avatar.raridade);
    }

    // Gerar inimigo
    const inimigo = gerarAvatarInimigo(avatar.nivel, dificuldade);

    // Inicializar batalha
    const estadoBatalha = inicializarBatalha(avatar, inimigo, dificuldade);
    
    // Salvar estado da batalha no localStorage/sessionStorage
    // (Por enquanto, retorna o estado para o frontend gerenciar)
    
    return NextResponse.json({
      sucesso: true,
      batalha: estadoBatalha
    });
    
  } catch (error) {
    console.error('Erro ao iniciar treino:', error);
    return NextResponse.json(
      { message: 'Erro ao iniciar treino', erro: error.message },
      { status: 500 }
    );
  }
}
