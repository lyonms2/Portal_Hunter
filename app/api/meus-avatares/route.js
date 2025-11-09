import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    if (!supabase) {
      return Response.json(
        { message: "Serviço temporariamente indisponível" },
        { status: 503 }
      );
    }

    // Extrair userId dos parâmetros de query string
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json(
        { message: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    console.log("Buscando avatares do usuário:", userId);

    // Buscar todos os avatares do usuário
    const { data: avatares, error } = await supabase
      .from('avatares')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao buscar avatares:", error);
      return Response.json(
        { message: "Erro ao buscar avatares: " + error.message },
        { status: 500 }
      );
    }

    // CORREÇÃO: Template literal correto com parênteses
    console.log(`Encontrados ${avatares?.length || 0} avatares`);

    return Response.json({
      avatares: avatares || [],
      total: avatares?.length || 0
    });
  } catch (error) {
    console.error("Erro no servidor:", error);
    return Response.json(
      { message: "Erro ao processar: " + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    if (!supabase) {
      return Response.json(
        { message: "Serviço temporariamente indisponível" },
        { status: 503 }
      );
    }

    const { userId, avatarId } = await request.json();

    if (!userId || !avatarId) {
      return Response.json(
        { message: "userId e avatarId são obrigatórios" },
        { status: 400 }
      );
    }

    console.log("Ativando avatar:", avatarId, "para usuário:", userId);

    // Verificar se o avatar pertence ao usuário e está vivo
    const { data: avatarToActivate, error: checkError } = await supabase
      .from('avatares')
      .select('*')
      .eq('id', avatarId)
      .eq('user_id', userId)
      .single();

    if (checkError || !avatarToActivate) {
      return Response.json(
        { message: "Avatar não encontrado ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    if (!avatarToActivate.vivo) {
      return Response.json(
        { message: "Não é possível ativar um avatar destruído" },
        { status: 400 }
      );
    }

    // Desativar todos os avatares do usuário
    const { error: deactivateError } = await supabase
      .from('avatares')
      .update({ ativo: false })
      .eq('user_id', userId);

    if (deactivateError) {
      console.error("Erro ao desativar avatares:", deactivateError);
      return Response.json(
        { message: "Erro ao desativar avatares anteriores" },
        { status: 500 }
      );
    }

    // Ativar o avatar selecionado
    const { data: avatar, error: activateError } = await supabase
      .from('avatares')
      .update({ ativo: true })
      .eq('id', avatarId)
      .eq('user_id', userId)
      .select()
      .single();

    if (activateError) {
      console.error("Erro ao ativar avatar:", activateError);
      return Response.json(
        { message: "Erro ao ativar avatar: " + activateError.message },
        { status: 500 }
      );
    }

    console.log("Avatar ativado com sucesso:", avatar);

    return Response.json({
      message: "Avatar ativado com sucesso!",
      avatar
    });
  } catch (error) {
    console.error("Erro no servidor:", error);
    return Response.json(
      { message: "Erro ao processar: " + error.message },
      { status: 500 }
    );
  }
}
