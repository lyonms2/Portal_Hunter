import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// ==================== DADOS DE GERAÇÃO ====================

const ELEMENTOS = ['Fogo', 'Água', 'Terra', 'Vento', 'Eletricidade', 'Sombra', 'Luz'];

const PREFIXOS_NOME = {
  Fogo: ['Ignis', 'Pyro', 'Vulcan', 'Ember', 'Blaze', 'Inferno', 'Scorch', 'Cinder'],
  Água: ['Aqua', 'Hydro', 'Oceanus', 'Tide', 'Torrent', 'Frost', 'Glacier', 'Rain'],
  Terra: ['Terra', 'Geo', 'Boulder', 'Titan', 'Golem', 'Stone', 'Granite', 'Quake'],
  Vento: ['Aero', 'Zephyr', 'Gale', 'Storm', 'Tempest', 'Cyclone', 'Breeze', 'Nimbus'],
  Eletricidade: ['Volt', 'Thunder', 'Spark', 'Bolt', 'Tesla', 'Ion', 'Surge', 'Arc'],
  Sombra: ['Umbra', 'Nox', 'Shade', 'Eclipse', 'Void', 'Phantom', 'Dusk', 'Raven'],
  Luz: ['Lux', 'Sol', 'Aurora', 'Radiant', 'Dawn', 'Celestial', 'Halo', 'Prism']
};

const SUFIXOS_NOME = [
  'ius', 'ion', 'or', 'ax', 'os', 'ar', 'el', 'on', 
  'is', 'us', 'yn', 'eth', 'ara', 'iel', 'ash', 'en'
];

const TITULOS = {
  Comum: [
    'o Errante', 'o Iniciado', 'o Jovem', 'o Aprendiz', 'o Desperto',
    'o Cauteloso', 'o Vigilante', 'o Guardião', 'o Protetor', 'o Buscador'
  ],
  Raro: [
    'o Destemido', 'o Valoroso', 'o Implacável', 'o Feroz', 'o Astuto',
    'o Sábio', 'o Justo', 'o Vingador', 'o Mestre', 'o Lendário'
  ],
  Lendário: [
    'o Destruidor de Mundos', 'o Arauto do Caos', 'o Guardião Eterno',
    'o Conquistador', 'o Imortal', 'o Primordial', 'o Soberano',
    'o Apocalipse', 'o Absoluto', 'o Transcendente'
  ]
};

const DESCRICOES_TEMPLATE = {
  Fogo: [
    'Nascido das chamas de um portal instável, este avatar carrega o calor da destruição.',
    'Forjado no coração de um vulcão dimensional, sua fúria é incontrolável.',
    'Uma entidade de puro fogo, surgida do colapso de uma estrela em outro plano.'
  ],
  Água: [
    'Emergiu das profundezas de um oceano dimensional, trazendo consigo o poder das marés.',
    'Criado a partir da essência de geleiras ancestrais, seu toque congela o tempo.',
    'Um espírito aquático que atravessou portais submersos em busca de propósito.'
  ],
  Terra: [
    'Moldado a partir das rochas mais antigas do universo, sua resistência é lendária.',
    'Despertado de um sono milenar nas entranhas da terra, protege os segredos do solo.',
    'Um colosso de pedra viva que emergiu quando a realidade se fragmentou.'
  ],
  Vento: [
    'Nascido dos ventos que atravessam dimensões, sua velocidade desafia a física.',
    'Um espírito etéreo que cavalga tempestades entre mundos paralelos.',
    'Formado pela colisão de correntes de ar de múltiplas realidades.'
  ],
  Eletricidade: [
    'Criado no epicentro de uma tempestade dimensional, pulsa com energia pura.',
    'Um ser de relâmpagos condensados, capaz de mover-se à velocidade do pensamento.',
    'Nasceu quando raios cósmicos colidiram com um portal instável.'
  ],
  Sombra: [
    'Surgiu das trevas que existem entre dimensões, onde a luz não ousa penetrar.',
    'Um fragmento da escuridão primordial, anterior à criação.',
    'Manifesta-se a partir das sombras deixadas pelos caídos nos portais.'
  ],
  Luz: [
    'Materializado a partir da luz de estrelas distantes, traz esperança e destruição.',
    'Um farol dimensional que guia e protege aqueles dignos de seu brilho.',
    'Nasceu da primeira aurora após o colapso dimensional.'
  ]
};

const HABILIDADES_POR_ELEMENTO = {
  Fogo: [
    { nome: 'Explosão Ígnea', descricao: 'Causa dano em área com chamas devastadoras' },
    { nome: 'Escudo de Fogo', descricao: 'Reduz dano recebido e queima atacantes' },
    { nome: 'Onda de Calor', descricao: 'Debilita inimigos com calor extremo' },
    { nome: 'Combustão', descricao: 'Aplica queimadura contínua no alvo' }
  ],
  Água: [
    { nome: 'Maré Crescente', descricao: 'Cura aliados e empurra inimigos' },
    { nome: 'Prisão de Gelo', descricao: 'Imobiliza o alvo temporariamente' },
    { nome: 'Torrente', descricao: 'Ataque em linha que atravessa múltiplos alvos' },
    { nome: 'Névoa Curativa', descricao: 'Regenera vida ao longo do tempo' }
  ],
  Terra: [
    { nome: 'Terremoto', descricao: 'Atordoa todos os inimigos próximos' },
    { nome: 'Armadura de Pedra', descricao: 'Aumenta drasticamente a defesa' },
    { nome: 'Lança de Rocha', descricao: 'Projétil perfurante de alta precisão' },
    { nome: 'Fissura', descricao: 'Cria uma rachadura que causa dano contínuo' }
  ],
  Vento: [
    { nome: 'Lâminas de Ar', descricao: 'Ataque rápido múltiplo' },
    { nome: 'Velocidade do Vento', descricao: 'Aumenta evasão drasticamente' },
    { nome: 'Ciclone', descricao: 'Causa dano em área e desorienta inimigos' },
    { nome: 'Levitação', descricao: 'Evita ataques terrestres' }
  ],
  Eletricidade: [
    { nome: 'Raio Perfurante', descricao: 'Dano alto com chance de paralisia' },
    { nome: 'Campo Elétrico', descricao: 'Área que causa dano a quem entrar' },
    { nome: 'Sobrecarga', descricao: 'Aumenta poder de ataque mas reduz defesa' },
    { nome: 'Pulso Magnético', descricao: 'Desabilita habilidades inimigas temporariamente' }
  ],
  Sombra: [
    { nome: 'Abraço das Trevas', descricao: 'Drena vida do inimigo' },
    { nome: 'Manto da Noite', descricao: 'Torna-se invisível temporariamente' },
    { nome: 'Terror Sombrio', descricao: 'Reduz stats do inimigo' },
    { nome: 'Lança das Sombras', descricao: 'Ignora parte da defesa inimiga' }
  ],
  Luz: [
    { nome: 'Raio Divino', descricao: 'Dano massivo contra criaturas das trevas' },
    { nome: 'Benção', descricao: 'Aumenta todos os stats de aliados' },
    { nome: 'Purificação', descricao: 'Remove efeitos negativos' },
    { nome: 'Julgamento', descricao: 'Ataque que causa mais dano em inimigos feridos' }
  ]
};

// ==================== FUNÇÕES DE GERAÇÃO ====================

function escolherAleatorio(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function gerarNomeAvatar(elemento) {
  const prefixo = escolherAleatorio(PREFIXOS_NOME[elemento]);
  const sufixo = escolherAleatorio(SUFIXOS_NOME);
  return prefixo + sufixo;
}

function determinarRaridade() {
  const rand = Math.random() * 100;
  if (rand < 70) return 'Comum';
  if (rand < 99) return 'Raro';
  return 'Lendário';
}

function gerarStats(raridade) {
  const ranges = {
    Comum: { min: 3, max: 7 },
    Raro: { min: 6, max: 12 },
    Lendário: { min: 10, max: 18 }
  };

  const range = ranges[raridade];
  
  return {
    forca: Math.floor(Math.random() * (range.max - range.min + 1)) + range.min,
    agilidade: Math.floor(Math.random() * (range.max - range.min + 1)) + range.min,
    resistencia: Math.floor(Math.random() * (range.max - range.min + 1)) + range.min,
    foco: Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
  };
}

function gerarHabilidades(elemento, raridade) {
  const habilidadesDisponiveis = HABILIDADES_POR_ELEMENTO[elemento];
  const quantidade = raridade === 'Comum' ? 1 : raridade === 'Raro' ? 2 : 3;
  
  const selecionadas = [];
  const indices = [...Array(habilidadesDisponiveis.length).keys()];
  
  for (let i = 0; i < quantidade; i++) {
    const index = Math.floor(Math.random() * indices.length);
    selecionadas.push(habilidadesDisponiveis[indices[index]]);
    indices.splice(index, 1);
  }
  
  return selecionadas;
}

function gerarAvatar(primeiraInvocacao = false) {
  const raridade = primeiraInvocacao ? 'Comum' : determinarRaridade();
  const elemento = escolherAleatorio(ELEMENTOS);
  const nome = gerarNomeAvatar(elemento);
  const titulo = escolherAleatorio(TITULOS[raridade]);
  const descricao = escolherAleatorio(DESCRICOES_TEMPLATE[elemento]);
  const stats = gerarStats(raridade);
  const habilidades = gerarHabilidades(elemento, raridade);
  
  return {
    nome: `${nome}, ${titulo}`,
    descricao,
    elemento,
    raridade,
    nivel: 1,
    experiencia: 0,
    vinculo: 0,
    ...stats,
    habilidades,
    vivo: true,
    ativo: false
  };
}

// ==================== API ROUTE ====================

export async function POST(request) {
  console.log("=== INICIANDO INVOCAÇÃO ===");
  
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

    console.log("Buscando stats do jogador:", userId);

    // Buscar stats do jogador
    const { data: stats, error: statsError } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statsError || !stats) {
      console.error("Erro ao buscar stats:", statsError);
      return Response.json(
        { message: "Jogador não encontrado" },
        { status: 404 }
      );
    }

    console.log("Stats encontrados:", stats);

    // Verificar se é primeira invocação
    const ehPrimeiraInvocacao = stats.primeira_invocacao;
    const custoMoedas = ehPrimeiraInvocacao ? 0 : 100;
    const custoFragmentos = ehPrimeiraInvocacao ? 0 : 0;

    console.log("Primeira invocação?", ehPrimeiraInvocacao);
    console.log("Custo:", custoMoedas, "moedas");

    // Verificar recursos
    if (!ehPrimeiraInvocacao && stats.moedas < custoMoedas) {
      return Response.json(
        { 
          message: "Moedas insuficientes",
          recursos_necessarios: { moedas: custoMoedas, fragmentos: custoFragmentos },
          recursos_atuais: { moedas: stats.moedas, fragmentos: stats.fragmentos }
        },
        { status: 400 }
      );
    }

    console.log("Gerando avatar...");

    // Gerar avatar
    const avatarGerado = gerarAvatar(ehPrimeiraInvocacao);
    avatarGerado.user_id = userId;

    console.log("Avatar gerado:", avatarGerado);

    // Inserir avatar no banco
    const { data: avatar, error: avatarError } = await supabase
      .from('avatares')
      .insert([avatarGerado])
      .select()
      .single();

    if (avatarError) {
      console.error("Erro ao inserir avatar:", avatarError);
      return Response.json(
        { message: "Erro ao criar avatar: " + avatarError.message },
        { status: 500 }
      );
    }

    console.log("Avatar inserido no banco:", avatar);

    // Atualizar recursos do jogador
    const novosMoedas = stats.moedas - custoMoedas;
    const novosFragmentos = stats.fragmentos - custoFragmentos;

    const { error: updateError } = await supabase
      .from('player_stats')
      .update({
        moedas: novosMoedas,
        fragmentos: novosFragmentos,
        primeira_invocacao: false
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error("Erro ao atualizar stats:", updateError);
    }

    console.log("Stats atualizados. Novas moedas:", novosMoedas);

    // Registrar no histórico
    await supabase
      .from('invocacoes_historico')
      .insert([{
        user_id: userId,
        avatar_id: avatar.id,
        custo_moedas: custoMoedas,
        custo_fragmentos: custoFragmentos,
        gratuita: ehPrimeiraInvocacao
      }]);

    console.log("✅ Invocação concluída com sucesso!");

    return Response.json({
      message: "Avatar invocado com sucesso!",
      avatar,
      custos: {
        moedas: custoMoedas,
        fragmentos: custoFragmentos,
        gratuita: ehPrimeiraInvocacao
      },
      recursos_restantes: {
        moedas: novosMoedas,
        fragmentos: novosFragmentos
      }
    });

  } catch (error) {
    console.error("❌ ERRO:", error);
    return Response.json(
      { message: "Erro ao processar invocação: " + error.message },
      { status: 500 }
    );
  }
}
