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
      console.error("Supabase não inicializado");
      return Response.json(
        { message: "Serviço temporariamente indisponível" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { userId, avatarId } = body;

    console.log("Payload recebido:", JSON.stringify(body, null, 2));

    if (!userId || !avatarId) {
      console.error("Faltando userId ou avatarId");
      return Response.json(
        { message: "userId e avatarId são obrigatórios" },
        { status: 400 }
      );
    }

    console.log(`1. Verificando avatar ${avatarId} do usuário ${userId}...`);

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

    console.log("Avatar encontrado:", {
      nome: avatarToActivate.nome,
      vivo: avatarToActivate.vivo,
      ativo_antes: avatarToActivate.ativo
    });

    if (!avatarToActivate.vivo) {
      console.error("Avatar está morto");
      return Response.json(
        { message: "Não é possível ativar um avatar destruído" },
        { status: 400 }
      );
    }

    // PASSO 1: Desativar todos
    console.log("2. Desativando TODOS os avatares do usuário...");
    
    const { error: deactivateError, count: deactivateCount } = await supabase
      .from('avatares')
      .update({ ativo: false })
      .eq('user_id', userId);

    if (deactivateError) {
      console.error("❌ Erro ao desativar avatares:", deactivateError);
      return Response.json(
        { message: "Erro ao desativar avatares: " + deactivateError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Desativação concluída. Count: ${deactivateCount}`);

    // Aguardar um pouco para garantir que o banco processou
    await new Promise(resolve => setTimeout(resolve, 100));

    // PASSO 2: Ativar o escolhido
    console.log(`3. Ativando avatar ${avatarId}...`);

    const { data: avatarAtivado, error: activateError } = await supabase
      .from('avatares')
      .update({ ativo: true })
      .eq('id', avatarId)
      .select()
      .single();

    if (activateError) {
      console.error("❌ Erro ao ativar avatar:", activateError);
      return Response.json(
        { message: "Erro ao ativar avatar: " + activateError.message },
        { status: 500 }
      );
    }

    if (!avatarAtivado) {
      console.error("❌ Avatar não foi retornado após ativação");
      return Response.json(
        { message: "Erro: avatar não foi ativado corretamente" },
        { status: 500 }
      );
    }

    console.log("✅ Avatar ativado:", {
      nome: avatarAtivado.nome,
      ativo: avatarAtivado.ativo
    });

    // PASSO 3: Verificação final
    console.log("4. Fazendo verificação final...");
    
    await new Promise(resolve => setTimeout(resolve, 100));

    const { data: verificacaoFinal, error: verifyError } = await supabase
      .from('avatares')
      .select('id, nome, ativo')
      .eq('user_id', userId)
      .order('ativo', { ascending: false });

    if (verifyError) {
      console.error("Erro na verificação:", verifyError);
    } else {
      console.log("Estado final de TODOS os avatares:");
      verificacaoFinal.forEach(av => {
        console.log(`  - ${av.nome}: ativo=${av.ativo}`);
      });
    }

    return Response.json({
      success: true,
      message: "Avatar ativado com sucesso!",
      avatar: avatarAtivado,
      todosAvatares: verificacaoFinal
    });

  } catch (error) {
    console.error("❌ ERRO CRÍTICO:", error);
    return Response.json(
      { message: "Erro ao processar: " + error.message },
      { status: 500 }
    );
  }
}
