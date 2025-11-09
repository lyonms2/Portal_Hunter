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

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json(
        { message: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    console.log("Buscando avatares do usuário:", userId);

    const { data: avatares, error } = await supabase
      .from('avatares')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Erro ao buscar avatares:", error);
      return Response.json(
        { message: "Erro ao buscar avatares: " + error.message },
        { status: 500 }
      );
    }

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
  console.log("=== INÍCIO PUT - ATIVAR AVATAR ===");
  
  try {
    if (!supabase) {
      return Response.json(
        { message: "Serviço temporariamente indisponível" },
        { status: 503 }
      );
    }

    const { userId, avatarId } = await request.json();

    console.log("Recebido:", { userId, avatarId });

    if (!userId || !avatarId) {
      return Response.json(
        { message: "userId e avatarId são obrigatórios" },
        { status: 400 }
      );
    }

    console.log("1. Verificando se avatar existe...");

    // Verificar se o avatar pertence ao usuário e está vivo
    const { data: avatarToActivate, error: checkError } = await supabase
      .from('avatares')
      .select('*')
      .eq('id', avatarId)
      .eq('user_id', userId)
      .single();

    if (checkError) {
      console.error("Erro ao verificar avatar:", checkError);
      return Response.json(
        { message: "Avatar não encontrado: " + checkError.message },
        { status: 404 }
      );
    }

    if (!avatarToActivate) {
      console.error("Avatar não encontrado");
      return Response.json(
        { message: "Avatar não encontrado ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    console.log("Avatar encontrado:", avatarToActivate.nome);

    if (!avatarToActivate.vivo) {
      console.error("Avatar está morto");
      return Response.json(
        { message: "Não é possível ativar um avatar destruído" },
        { status: 400 }
      );
    }

    console.log("2. Desativando todos os avatares do usuário...");

    // Desativar todos os avatares do usuário primeiro
    const { error: deactivateError, data: deactivated } = await supabase
      .from('avatares')
      .update({ ativo: false })
      .eq('user_id', userId)
      .select();

    if (deactivateError) {
      console.error("Erro ao desativar avatares:", deactivateError);
      return Response.json(
        { message: "Erro ao desativar avatares anteriores: " + deactivateError.message },
        { status: 500 }
      );
    }

    console.log(`Desativados ${deactivated?.length || 0} avatares`);

    console.log("3. Ativando avatar selecionado...");

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

    if (!avatar) {
      console.error("Avatar não foi ativado (retorno vazio)");
      return Response.json(
        { message: "Erro: avatar não foi ativado" },
        { status: 500 }
      );
    }

    console.log("✅ Avatar ativado com sucesso:", avatar.nome, "| ativo:", avatar.ativo);

    // Verificar se realmente salvou
    const { data: verificacao } = await supabase
      .from('avatares')
      .select('id, nome, ativo')
      .eq('id', avatarId)
      .single();

    console.log("Verificação final:", verificacao);

    return Response.json({
      message: "Avatar ativado com sucesso!",
      avatar,
      verificacao
    });

  } catch (error) {
    console.error("❌ ERRO NO SERVIDOR:", error);
    return Response.json(
      { message: "Erro ao processar: " + error.message },
      { status: 500 }
    );
  }
}
