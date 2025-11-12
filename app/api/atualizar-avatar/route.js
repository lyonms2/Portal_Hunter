// ==================== API: ATUALIZAR AVATAR ====================
// Arquivo: /app/api/atualizar-avatar/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processarGanhoXP } from '@/app/avatares/sistemas/progressionSystem';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { avatarId, experiencia, exaustao } = await request.json();
    
    if (!avatarId) {
      return NextResponse.json(
        { message: 'avatarId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar avatar atual
    const { data: avatarAtual, error: fetchError } = await supabase
      .from('avatares')
      .select('*')
      .eq('id', avatarId)
      .single();

    if (fetchError || !avatarAtual) {
      console.error('Erro ao buscar avatar:', fetchError);
      return NextResponse.json(
        { message: 'Avatar não encontrado' },
        { status: 404 }
      );
    }

    // === PROCESSAR XP E LEVEL UP ===
    let levelUpData = null;
    let novoNivel = avatarAtual.nivel;
    let novaExperiencia = avatarAtual.experiencia || 0;

    if (experiencia && experiencia > 0) {
      const resultadoXP = processarGanhoXP(avatarAtual, experiencia);
      
      novoNivel = resultadoXP.nivelAtual;
      novaExperiencia = resultadoXP.xpAtual;

      if (resultadoXP.levelUps > 0) {
        levelUpData = {
          levelUp: true,
          nivelAnterior: resultadoXP.nivelAnterior,
          novoNivel: resultadoXP.nivelAtual,
          levelUps: resultadoXP.levelUps,
          statsNovos: resultadoXP.statsNovos,
          recompensas: resultadoXP.recompensas,
          mensagens: resultadoXP.mensagens
        };

        // Atualizar stats se subiu de nível
        const { forca, agilidade, resistencia, foco } = resultadoXP.statsNovos;
        
        await supabase
          .from('avatares')
          .update({
            forca,
            agilidade,
            resistencia,
            foco
          })
          .eq('id', avatarId);
      }
    }

    // === PROCESSAR EXAUSTÃO ===
    const novaExaustao = Math.min(100, (avatarAtual.exaustao || 0) + (exaustao || 0));

    // === ATUALIZAR AVATAR NO BANCO ===
    const updates = {
      nivel: novoNivel,
      experiencia: novaExperiencia,
      exaustao: novaExaustao,
      updated_at: new Date().toISOString()
    };

    const { data: avatarAtualizado, error: updateError } = await supabase
      .from('avatares')
      .update(updates)
      .eq('id', avatarId)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar avatar:', updateError);
      return NextResponse.json(
        { message: 'Erro ao atualizar avatar' },
        { status: 500 }
      );
    }

    // === RESPOSTA ===
    return NextResponse.json({
      sucesso: true,
      avatar: avatarAtualizado,
      ganhos: {
        experiencia: experiencia || 0,
        exaustao: exaustao || 0
      },
      ...levelUpData
    });

  } catch (error) {
    console.error('Erro na API atualizar-avatar:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor', erro: error.message },
      { status: 500 }
    );
  }
}
