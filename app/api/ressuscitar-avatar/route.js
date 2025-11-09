import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { userId, avatarId } = await request.json();

    if (!userId || !avatarId) {
      return Response.json(
        { message: "Dados incompletos" },
        { status: 400 }
      );
    }

    // 1. Buscar avatar morto
    const { data: avatar, error: avatarError } = await supabase
      .from('avatares')
      .select('*')
      .eq('id', avatarId)
      .eq('user_id', userId)
      .eq('vivo', false)
      .single();

    if (avatarError || !avatar) {
      return Response.json(
        { message: "Avatar não encontrado ou não está morto" },
        { status: 404 }
      );
    }

    // 2. Calcular custo baseado na raridade
    const custos = {
      'Comum': { moedas: 500, fragmentos: 50 },
      'Raro': { moedas: 1000, fragmentos: 100 },
      'Lendário': { moedas: 1500, fragmentos: 150 }
    };

    const custo = custos[avatar.raridade] || custos['Comum'];

    // 3. Verificar se jogador tem recursos
    const { data: stats, error: statsError } = await supabase
      .from('jogadores')
      .select('moedas, fragmentos')
      .eq('user_id', userId)
      .single();

    if (statsError || !stats) {
      return Response.json(
        { message: "Erro ao buscar recursos do jogador" },
        { status: 500 }
      );
    }

    if (stats.moedas < custo.moedas || stats.fragmentos < custo.fragmentos) {
      return Response.json(
        { 
          message: "Recursos insuficientes",
          necessario: custo,
          atual: { moedas: stats.moedas, fragmentos: stats.fragmentos }
        },
        { status: 400 }
      );
    }

    // 4. Ressuscitar avatar (reduz stats em 50%, reseta vínculo)
    const statsReduzidos = {
      vida: Math.floor(avatar.vida * 0.5),
      ataque: Math.floor(avatar.ataque * 0.5),
      defesa: Math.floor(avatar.defesa * 0.5),
      velocidade: Math.floor(avatar.velocidade * 0.5)
    };

    const { error: updateAvatarError } = await supabase
      .from('avatares')
      .update({
        vivo: true,
        vida: statsReduzidos.vida,
        ataque: statsReduzidos.ataque,
        defesa: statsReduzidos.defesa,
        velocidade: statsReduzidos.velocidade,
        vinculo: 0,
        marca_morte: true, // Nova coluna que vamos adicionar
        updated_at: new Date().toISOString()
      })
      .eq('id', avatarId);

    if (updateAvatarError) {
      return Response.json(
        { message: "Erro ao ressuscitar avatar" },
        { status: 500 }
      );
    }

    // 5. Deduzir recursos do jogador
    const { error: updateStatsError } = await supabase
      .from('jogadores')
      .update({
        moedas: stats.moedas - custo.moedas,
        fragmentos: stats.fragmentos - custo.fragmentos
      })
      .eq('user_id', userId);

    if (updateStatsError) {
      return Response.json(
        { message: "Erro ao deduzir recursos" },
        { status: 500 }
      );
    }

    // 6. Buscar stats atualizados
    const { data: statsAtualizados } = await supabase
      .from('jogadores')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 7. Buscar avatar ressuscitado
    const { data: avatarRessuscitado } = await supabase
      .from('avatares')
      .select('*')
      .eq('id', avatarId)
      .single();

    return Response.json({
      success: true,
      message: "Avatar ressuscitado com sucesso!",
      avatar: avatarRessuscitado,
      stats: statsAtualizados,
      custoUtilizado: custo
    });

  } catch (error) {
    console.error("Erro na ressurreição:", error);
    return Response.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
