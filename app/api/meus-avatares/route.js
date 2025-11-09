import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

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

    return Response.json({
      avatares: avatares || [],
      total: (avatares || []).length
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

    const body = await request.json();
    const { userId, avatarId } = body;

    if (!userId || !avatarId) {
      return Response.json(
        { message: "userId e avatarId são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o avatar existe, pertence ao usuário e está vivo
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
        { message: "Erro ao desativar avatares: " + deactivateError.message },
        { status: 500 }
      );
    }

    // Ativar o avatar escolhido
    const { data: avatarAtivado, error: activateError } = await supabase
      .from('avatares')
      .update({ ativo: true })
      .eq('id', avatarId)
      .select()
      .single();

    if (activateError || !avatarAtivado) {
      console.error("Erro ao ativar avatar:", activateError);
      return Response.json(
        { message: "Erro ao ativar avatar" },
        { status: 500 }
      );
    }

    // Buscar todos os avatares atualizados
    const { data: todosAvatares } = await supabase
      .from('avatares')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return Response.json({
      success: true,
      message: "Avatar ativado com sucesso!",
      avatar: avatarAtivado,
      avatares: todosAvatares || []
    });

  } catch (error) {
    console.error("Erro crítico:", error);
    return Response.json(
      { message: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    if (!supabase) {
      return Response.json(
        { message: "Serviço temporariamente indisponível" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { userId, avatarId } = body;

    if (!userId || !avatarId) {
      return Response.json(
        { message: "userId e avatarId são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o avatar pertence ao usuário
    const { data: avatar, error: checkError } = await supabase
      .from('avatares')
      .select('*')
      .eq('id', avatarId)
      .eq('user_id', userId)
      .single();

    if (checkError || !avatar) {
      return Response.json(
        { message: "Avatar não encontrado" },
        { status: 404 }
      );
    }

    // Deletar o avatar
    const { error: deleteError } = await supabase
      .from('avatares')
      .delete()
      .eq('id', avatarId);

    if (deleteError) {
      console.error("Erro ao deletar avatar:", deleteError);
      return Response.json(
        { message: "Erro ao deletar avatar" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "Avatar removido com sucesso"
    });

  } catch (error) {
    console.error("Erro ao deletar:", error);
    return Response.json(
      { message: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}
