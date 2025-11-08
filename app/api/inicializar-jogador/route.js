import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export async function POST(request) {
  try {
    if (!supabase) {
      return Response.json(
        { message: "Serviço temporariamente indisponível" },
        { status: 503 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return Response.json(
        { message: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se já existe
    const { data: existing } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      return Response.json({
        message: "Jogador já inicializado",
        stats: existing
      });
    }

    // Criar stats iniciais
    const { data: stats, error } = await supabase
      .from('player_stats')
      .insert([{
        user_id: userId,
        moedas: 500,
        fragmentos: 0,
        divida: 0,
        ranking: 'F',
        missoes_completadas: 0,
        primeira_invocacao: true
      }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar stats:", error);
      return Response.json(
        { message: "Erro ao inicializar jogador: " + error.message },
        { status: 500 }
      );
    }

    return Response.json({
      message: "Jogador inicializado com sucesso!",
      stats
    });

  } catch (error) {
    console.error("Erro no servidor:", error);
    return Response.json(
      { message: "Erro ao processar: " + error.message },
      { status: 500 }
    );
  }
}
