import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  console.log("=== INICIANDO RESSURREIÇÃO ===");
  
  try {
    const { userId, avatarId } = await request.json();
    console.log("Dados recebidos:", { userId, avatarId });

    if (!userId || !avatarId) {
      console.log("❌ Dados incompletos");
      return Response.json(
        { message: "Dados incompletos" },
        { status: 400 }
      );
    }

    // 1. Buscar avatar morto
    console.log("Buscando avatar morto...");
    const { data: avatar, error: avatarError } = await supabase
      .from('avatares')
      .select('*')
      .eq('id', avatarId)
      .eq('user_id', userId)
      .eq('vivo', false)
      .single();

    if (avatarError) {
      console.error("❌ Erro ao buscar avatar:", avatarError);
      return Response.json(
        { message: "Erro ao buscar avatar: " + avatarError.message },
        { status: 404 }
      );
    }

    if (!avatar) {
      console.log("❌ Avatar não encontrado");
      return Response.json(
        { message: "Avatar não encontrado ou não está morto" },
        { status: 404 }
      );
    }

    console.log("✅ Avatar encontrado:", avatar.nome);

    // 2. Calcular custo baseado na raridade
    const custos = {
      'Comum': { moedas: 500, fragmentos: 50 },
      'Raro': { moedas: 1000, fragmentos: 100 },
      'Lendário': { moedas: 1500, fragmentos: 150 }
    };

    const custo = custos[avatar.raridade] || custos['Comum'];
    console.log("Custo do ritual:", custo);

    // 3. Verificar se jogador tem recursos
    console.log("Buscando recursos do jogador...");
    const { data: stats, error: statsError } = await supabase
      .from('player_stats')
      .select('moedas, fragmentos')
      .eq('user_id', userId)
      .single();

    if (statsError) {
      console.error("❌ Erro ao buscar stats:", statsError);
      return Response.json(
        { message: "Erro ao buscar recursos: " + statsError.message },
        { status: 500 }
      );
    }

    if (!stats) {
      console.log("❌ Stats não encontrados");
      return Response.json(
        { message: "Jogador não encontrado" },
        { status: 404 }
      );
    }

    console.log("✅ Recursos do jogador:", stats);

    if (stats.moedas < custo.moedas || stats.fragmentos < custo.fragmentos) {
      console.log("❌ Recursos insuficientes");
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
    console.log("Calculando novos stats (50% redução)...");
    const statsReduzidos = {
      forca: Math.floor(avatar.forca * 0.5),
      agilidade: Math.floor(avatar.agilidade * 0.5),
      resistencia: Math.floor(avatar.resistencia * 0.5),
      foco: Math.floor(avatar.foco * 0.5)
    };
    console.log("Stats reduzidos:", statsReduzidos);

    console.log("Atualizando avatar no banco...");
    const { error: updateAvatarError } = await supabase
      .from('avatares')
      .update({
        vivo: true,
        forca: statsReduzidos.forca,
        agilidade: statsReduzidos.agilidade,
        resistencia: statsReduzidos.resistencia,
        foco: statsReduzidos.foco,
        vinculo: 0,
        marca_morte: true
      })
      .eq('id', avatarId);

    if (updateAvatarError) {
      console.error("❌ Erro ao atualizar avatar:", updateAvatarError);
      return Response.json(
        { message: "Erro ao ressuscitar avatar: " + updateAvatarError.message },
        { status: 500 }
      );
    }

    console.log("✅ Avatar ressuscitado!");

    // 5. Deduzir recursos do jogador
    console.log("Deduzindo recursos...");
    const { error: updateStatsError } = await supabase
      .from('player_stats')
      .update({
        moedas: stats.moedas - custo.moedas,
        fragmentos: stats.fragmentos - custo.fragmentos
      })
      .eq('user_id', userId);

    if (updateStatsError) {
      console.error("❌ Erro ao deduzir recursos:", updateStatsError);
      return Response.json(
        { message: "Erro ao deduzir recursos: " + updateStatsError.message },
        { status: 500 }
      );
    }

    console.log("✅ Recursos deduzidos!");

    // 6. Buscar stats atualizados
    console.log("Buscando dados atualizados...");
    const { data: statsAtualizados } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: avatarRessuscitado } = await supabase
      .from('avatares')
      .select('*')
      .eq('id', avatarId)
      .single();

    console.log("✅ RESSURREIÇÃO COMPLETA!");

    return Response.json({
      success: true,
      message: "Avatar ressuscitado com sucesso!",
      avatar: avatarRessuscitado,
      stats: statsAtualizados,
      custoUtilizado: custo
    });

  } catch (error) {
    console.error("❌ ERRO CRÍTICO:", error);
    console.error("Stack:", error.stack);
    return Response.json(
      { message: "Erro interno: " + error.message },
      { status: 500 }
    );
  }
}
