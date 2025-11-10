"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AvatarSVG from '../components/AvatarSVG';

export default function AvatarsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [avatares, setAvatares] = useState([]);
  const [avatarSelecionado, setAvatarSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalConfirmacao, setModalConfirmacao] = useState(null); // {tipo: 'sucesso'/'erro', mensagem: ''}
  const [ativando, setAtivando] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    carregarAvatares(parsedUser.id);
  }, [router]);

  const carregarAvatares = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/meus-avatares?userId=${userId}&t=${Date.now()}`);
      const data = await response.json();
      
      if (response.ok) {
        setAvatares(data.avatares);
        console.log('Avatares carregados:', data.avatares);
      } else {
        console.error("Erro ao carregar avatares:", data.message);
      }
    } catch (error) {
      console.error("Erro ao carregar avatares:", error);
    } finally {
      setLoading(false);
    }
  };

  const ativarAvatar = async (avatarId, avatarNome) => {
    if (ativando) return; // Previne cliques múltiplos
    
    setAtivando(true);
    
    try {
      const response = await fetch("/api/meus-avatares", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, avatarId }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Avatar ativado com sucesso:', data.avatar);
        
        // IMPORTANTE: Recarregar avatares do banco após ativar
        await carregarAvatares(user.id);
        
        // Mostrar modal de sucesso
        setModalConfirmacao({
          tipo: 'sucesso',
          mensagem: `${avatarNome} foi ativado com sucesso!`,
          avatar: data.avatar
        });
      } else {
        // Mostrar modal de erro
        setModalConfirmacao({
          tipo: 'erro',
          mensagem: data.message || 'Erro ao ativar avatar'
        });
      }
    } catch (error) {
      console.error("Erro ao ativar avatar:", error);
      setModalConfirmacao({
        tipo: 'erro',
        mensagem: 'Erro de conexão ao ativar avatar'
      });
    } finally {
      setAtivando(false);
    }
  };

  const fecharModal = () => {
    setModalConfirmacao(null);
  };

  const getCorRaridade = (raridade) => {
    switch (raridade) {
      case 'Lendário':
        return 'from-amber-500 to-yellow-500';
      case 'Raro':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-slate-600 to-slate-700';
    }
  };

  const getCorBorda = (raridade) => {
    switch (raridade) {
      case 'Lendário':
        return 'border-amber-500/50';
      case 'Raro':
        return 'border-purple-500/50';
      default:
        return 'border-slate-700/50';
    }
  };

  const getCorElemento = (elemento) => {
    const cores = {
      'Fogo': 'text-orange-400',
      'Água': 'text-blue-400',
      'Terra': 'text-amber-600',
      'Vento': 'text-cyan-400',
      'Eletricidade': 'text-yellow-400',
      'Sombra': 'text-purple-400',
      'Luz': 'text-yellow-200'
    };
    return cores[elemento] || 'text-gray-400';
  };

  const getEmojiElemento = (elemento) => {
    const emojis = {
      'Fogo': '🔥',
      'Água': '💧',
      'Terra': '🪨',
      'Vento': '💨',
      'Eletricidade': '⚡',
      'Sombra': '🌑',
      'Luz': '✨'
    };
    return emojis[elemento] || '⭐';
  };

  // Separar avatar ativo dos outros
  const avatarAtivo = avatares.find(av => av.ativo && av.vivo);
  const avataresInativos = avatares.filter(av => !av.ativo || !av.vivo);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse">Carregando coleção...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-gray-100 relative overflow-hidden">
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl top-20 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/5 rounded-full blur-3xl bottom-20 -right-48 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Grid hexagonal */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yOCAwTDAgMTVWMzVMMjggNTBMNTYgMzVWMTVaTTI4IDUwTDAgNjVWODVMMjggMTAwTDU2IDg1VjY1WiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY3lhbiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')] pointer-events-none"></div>

      {/* Vinheta */}
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.9)] pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-2">
              MINHA COLEÇÃO
            </h1>
            <p className="text-slate-400 font-mono text-sm">
              {avatares.length} {avatares.length === 1 ? 'Avatar' : 'Avatares'} | {avatares.filter(a => a.vivo).length} Vivos | {avatares.filter(a => !a.vivo).length} Destruídos
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/ocultista")}
              className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 font-mono text-sm group"
            >
              <span>🔮</span>
              <span>INVOCAR</span>
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 font-mono text-sm group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> 
              <span>VOLTAR</span>
            </button>
          </div>
        </div>

        {/* Lista vazia */}
        {avatares.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-6xl mb-6">🔮</div>
            <h2 className="text-2xl font-bold text-slate-300 mb-4">Nenhum Avatar Invocado</h2>
            <p className="text-slate-400 mb-8">
              Você ainda não possui avatares. Visite o Ocultista para invocar seu primeiro guardião!
            </p>
            <button
              onClick={() => router.push("/ocultista")}
              className="group relative inline-block"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-all duration-300"></div>
              
              <div className="relative px-8 py-4 bg-slate-950 rounded-lg border border-purple-500/50 group-hover:border-purple-400 transition-all">
                <span className="text-lg font-bold tracking-wider uppercase bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                  Invocar Avatar
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Avatar Ativo em Destaque */}
        {avatarAtivo && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
              <span className="text-3xl">⚔️</span>
              <span>AVATAR ATIVO</span>
            </h2>

            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-green-500/30 via-cyan-500/30 to-blue-500/30 rounded-lg blur-xl animate-pulse"></div>
              
              <div 
                className="relative bg-slate-950/90 backdrop-blur-xl border-2 border-green-500/50 rounded-lg overflow-hidden cursor-pointer transform transition-all hover:scale-[1.02]"
                onClick={() => setAvatarSelecionado(avatarAtivo)}
              >
                {/* Badge de raridade */}
                <div className={`p-3 text-center font-bold text-lg bg-gradient-to-r ${getCorRaridade(avatarAtivo.raridade)} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  <span className="relative">{avatarAtivo.raridade.toUpperCase()}</span>
                </div>

                {/* Badge ATIVO pulsante */}
                <div className="absolute top-16 right-4 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-lg animate-pulse"></div>
                    <div className="relative bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      ATIVO
                    </div>
                  </div>
                </div>
                
                {/* Badge Marca da Morte (se tiver) */}
                {avatarAtivo.marca_morte && (
                  <div className="absolute top-28 right-4 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-900 rounded blur-lg opacity-50"></div>
                      <div className="relative bg-red-900/90 text-white text-xs font-bold px-3 py-1.5 rounded border border-red-500/50 flex items-center gap-1.5">
                        <span>💀</span>
                        <span>MARCA DA MORTE</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 p-8">
                  {/* Coluna Esquerda - Visual do Avatar */}
                  <div>
                    <div className={`bg-slate-900/70 rounded-lg p-6 aspect-square border-2 ${getCorBorda(avatarAtivo.raridade)} flex items-center justify-center`}>
                      <AvatarSVG avatar={avatarAtivo} tamanho={200} />
                    </div>
                  </div>

                  {/* Coluna Direita - Info */}
                  <div className="space-y-4">
                    {/* Nome */}
                    <div>
                      <h3 className="text-3xl font-black text-cyan-400 mb-2">
                        {avatarAtivo.nome}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-mono ${getCorElemento(avatarAtivo.elemento)}`}>
                          {getEmojiElemento(avatarAtivo.elemento)} {avatarAtivo.elemento}
                        </span>
                      </div>
                    </div>

                    {/* Descrição */}
                    <p className="text-slate-300 text-sm leading-relaxed italic border-l-2 border-cyan-500/50 pl-4">
                      {avatarAtivo.descricao}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-900/50 rounded p-3 text-center border border-red-500/20">
                        <div className="text-xs text-slate-500 uppercase mb-1">FOR</div>
                        <div className="text-2xl font-bold text-red-400">{avatarAtivo.forca}</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-3 text-center border border-green-500/20">
                        <div className="text-xs text-slate-500 uppercase mb-1">AGI</div>
                        <div className="text-2xl font-bold text-green-400">{avatarAtivo.agilidade}</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-3 text-center border border-blue-500/20">
                        <div className="text-xs text-slate-500 uppercase mb-1">RES</div>
                        <div className="text-2xl font-bold text-blue-400">{avatarAtivo.resistencia}</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-3 text-center border border-purple-500/20">
                        <div className="text-xs text-slate-500 uppercase mb-1">FOC</div>
                        <div className="text-2xl font-bold text-purple-400">{avatarAtivo.foco}</div>
                      </div>
                    </div>

                    {/* Progresso */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 rounded p-3">
                        <div className="text-xs text-slate-500 mb-2">NÍVEL</div>
                        <div className="text-xl font-bold text-cyan-400">{avatarAtivo.nivel}</div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                          <div className="bg-cyan-400 h-1.5 rounded-full" style={{width: `${(avatarAtivo.experiencia % 100)}%`}}></div>
                        </div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-3">
                        <div className="text-xs text-slate-500 mb-2">VÍNCULO</div>
                        <div className="text-xl font-bold text-purple-400">{avatarAtivo.vinculo}%</div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                          <div className="bg-purple-400 h-1.5 rounded-full" style={{width: `${avatarAtivo.vinculo}%`}}></div>
                        </div>
                      </div>
                    </div>

                    {/* Habilidades resumidas */}
                    <div className="bg-slate-900/50 rounded p-3">
                      <div className="text-xs text-slate-500 mb-2 uppercase">Habilidades</div>
                      <div className="flex flex-wrap gap-2">
                        {avatarAtivo.habilidades.map((hab, index) => (
                          <span key={index} className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                            {hab.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Outros Avatares */}
        {avataresInativos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-400 mb-6 flex items-center gap-3">
              <span className="text-3xl">📚</span>
              <span>OUTROS AVATARES ({avataresInativos.length})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {avataresInativos.map((avatar) => (
                <div
                  key={avatar.id}
                  className="relative group cursor-pointer"
                  onClick={() => setAvatarSelecionado(avatar)}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  
                  <div className={`relative bg-slate-950/80 backdrop-blur-xl border ${getCorBorda(avatar.raridade)} rounded-lg overflow-hidden group-hover:border-cyan-500/50 transition-all ${!avatar.vivo ? 'opacity-50' : ''}`}>
                    {/* Badge de raridade */}
                    <div className={`p-2 text-center font-bold text-xs bg-gradient-to-r ${getCorRaridade(avatar.raridade)}`}>
                      {avatar.raridade.toUpperCase()}
                    </div>

                    {/* Badge de morto */}
                    {!avatar.vivo && (
                      <div className="absolute top-12 right-2 bg-red-900 text-white text-xs font-bold px-2 py-1 rounded z-10">
                        ☠️ MORTO
                      </div>
                    )}
                    {/* Badge Marca da Morte (ADICIONAR ESTE BLOCO) */}
                    {avatar.vivo && avatar.marca_morte && (
                      <div className="absolute top-12 left-2 bg-red-900/90 text-white text-xs font-bold px-2 py-1 rounded z-10 border border-red-500/50 flex items-center gap-1">
                        <span>💀</span>
                      </div>
                    )}

                    <div className="p-4">
                      {/* Visual do avatar */}
                      <div className={`bg-slate-900/50 rounded p-4 aspect-square border ${getCorBorda(avatar.raridade)} flex items-center justify-center mb-3`}>
                        <AvatarSVG avatar={avatar} tamanho={120} />
                      </div>

                      {/* Nome */}
                      <h3 className="text-base font-bold text-cyan-400 mb-1 truncate">
                        {avatar.nome}
                      </h3>

                      {/* Elemento */}
                      <div className="mb-3">
                        <span className={`text-xs font-mono ${getCorElemento(avatar.elemento)}`}>
                          {getEmojiElemento(avatar.elemento)} {avatar.elemento}
                        </span>
                      </div>

                      {/* Stats resumidos */}
                      <div className="grid grid-cols-4 gap-1 mb-3">
                        <div className="text-center">
                          <div className={`font-bold text-sm ${avatar.marca_morte ? 'text-red-400' : 'text-red-400'}`}>
                            {avatar.forca}
                            {avatar.marca_morte && <span className="text-[8px] ml-0.5">💀</span>}
                          </div>
                          <div className="text-[10px] text-slate-500">FOR</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold text-sm ${avatar.marca_morte ? 'text-green-400/70' : 'text-green-400'}`}>
                            {avatar.agilidade}
                            {avatar.marca_morte && <span className="text-[8px] ml-0.5">💀</span>}
                          </div>
                          <div className="text-[10px] text-slate-500">AGI</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold text-sm ${avatar.marca_morte ? 'text-blue-400/70' : 'text-blue-400'}`}>
                            {avatar.resistencia}
                            {avatar.marca_morte && <span className="text-[8px] ml-0.5">💀</span>}
                          </div>
                          <div className="text-[10px] text-slate-500">RES</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold text-sm ${avatar.marca_morte ? 'text-purple-400/70' : 'text-purple-400'}`}>
                            {avatar.foco}
                            {avatar.marca_morte && <span className="text-[8px] ml-0.5">💀</span>}
                          </div>
                          <div className="text-[10px] text-slate-500">FOC</div>
                        </div>
                      </div>

                      {/* Info adicional */}
                      <div className="flex justify-between text-[10px] text-slate-500 mb-3">
                        <span>Nv. {avatar.nivel}</span>
                        <span>Vínculo: {avatar.vinculo}%</span>
                      </div>

                      {/* Botão ativar */}
                      {!avatar.ativo && avatar.vivo && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            ativarAvatar(avatar.id, avatar.nome);
                          }}
                          disabled={ativando}
                          className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {ativando ? 'Ativando...' : 'Ativar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação */}
      {modalConfirmacao && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={fecharModal}
        >
          <div 
            className="max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative group">
              <div className={`absolute -inset-1 ${
                modalConfirmacao.tipo === 'sucesso' 
                  ? 'bg-gradient-to-r from-green-500/30 via-cyan-500/30 to-blue-500/30' 
                  : 'bg-gradient-to-r from-red-500/30 via-orange-500/30 to-red-500/30'
              } rounded-lg blur opacity-75 animate-pulse`}></div>
              
              <div className="relative bg-slate-950/95 backdrop-blur-xl border-2 border-cyan-900/50 rounded-lg overflow-hidden">
                {/* Header */}
                <div className={`p-4 text-center font-bold text-lg ${
                  modalConfirmacao.tipo === 'sucesso'
                    ? 'bg-gradient-to-r from-green-600 to-cyan-600'
                    : 'bg-gradient-to-r from-red-600 to-orange-600'
                }`}>
                  {modalConfirmacao.tipo === 'sucesso' ? '✅ SUCESSO' : '❌ ERRO'}
                </div>

                <div className="p-8 text-center">
                  {/* Ícone */}
                  <div className="text-6xl mb-4">
                    {modalConfirmacao.tipo === 'sucesso' ? '⚔️' : '⚠️'}
                  </div>

                  {/* Mensagem */}
                  <p className="text-xl text-slate-200 font-bold mb-2">
                    {modalConfirmacao.mensagem}
                  </p>

                  {modalConfirmacao.tipo === 'sucesso' && (
                    <p className="text-sm text-slate-400 font-mono mb-6">
                      Avatar pronto para combate
                    </p>
                  )}

                  {/* Botão */}
                  <button
                    onClick={fecharModal}
                    className="group/btn relative inline-block mt-4"
                  >
                    <div className={`absolute -inset-1 ${
                      modalConfirmacao.tipo === 'sucesso'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        : 'bg-gradient-to-r from-red-500 to-orange-500'
                    } rounded blur opacity-50 group-hover/btn:opacity-75 transition-all duration-300`}></div>
                    
                    <div className="relative px-8 py-3 bg-slate-950 rounded border border-cyan-500/50 group-hover/btn:border-cyan-400 transition-all">
                      <span className="font-bold tracking-wider uppercase bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                        Entendido
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Avatar */}
      {avatarSelecionado && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setAvatarSelecionado(null)}
        >
          <div 
            className="max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-lg blur opacity-75"></div>
              
              <div className="relative bg-slate-950/95 backdrop-blur-xl border border-cyan-900/30 rounded-lg overflow-hidden">
                {/* Header com raridade */}
                <div className={`p-4 text-center font-bold text-lg bg-gradient-to-r ${getCorRaridade(avatarSelecionado.raridade)}`}>
                  {avatarSelecionado.raridade.toUpperCase()}
                </div>

                <div className="p-8">
                  {/* Fechar */}
                  <button
                    onClick={() => setAvatarSelecionado(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl z-10"
                  >
                    ×
                  </button>

                  {/* Nome */}
                  <h3 className="text-3xl font-black text-center mb-2 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                    {avatarSelecionado.nome}
                  </h3>

                  {/* Elemento */}
                  <div className="text-center mb-6">
                    <span className={`inline-block px-4 py-1 bg-slate-800 rounded-full text-sm font-mono ${getCorElemento(avatarSelecionado.elemento)}`}>
                      {getEmojiElemento(avatarSelecionado.elemento)} {avatarSelecionado.elemento}
                    </span>
                    
                    {/* Badge Marca da Morte no modal */}
                    {avatarSelecionado.marca_morte && (
                      <span className="inline-block ml-2 px-3 py-1 bg-red-900/80 border border-red-500/50 rounded-full text-xs font-bold text-white">
                        💀 MARCA DA MORTE
                      </span>
                    )}
                  </div>

                  {/* Descrição */}
                  <p className="text-slate-300 text-center leading-relaxed mb-8 italic">
                    {avatarSelecionado.descricao}
                  </p>

                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-8"></div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-900/50 rounded p-4 text-center border border-red-500/20">
                      <div className="text-xs text-slate-500 uppercase mb-1">Força</div>
                      <div className="text-3xl font-bold text-red-400">{avatarSelecionado.forca}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded p-4 text-center border border-green-500/20">
                      <div className="text-xs text-slate-500 uppercase mb-1">Agilidade</div>
                      <div className="text-3xl font-bold text-green-400">{avatarSelecionado.agilidade}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded p-4 text-center border border-blue-500/20">
                      <div className="text-xs text-slate-500 uppercase mb-1">Resistência</div>
                      <div className="text-3xl font-bold text-blue-400">{avatarSelecionado.resistencia}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded p-4 text-center border border-purple-500/20">
                      <div className="text-xs text-slate-500 uppercase mb-1">Foco</div>
                      <div className="text-3xl font-bold text-purple-400">{avatarSelecionado.foco}</div>
                    </div>
                  </div>

                  {/* Habilidades */}
                  <div className="space-y-3 mb-8">
                    <h4 className="text-cyan-400 font-bold text-sm uppercase tracking-wider">Habilidades</h4>
                    {avatarSelecionado.habilidades.map((hab, index) => (
                      <div key={index} className="bg-slate-900/50 rounded p-3 border border-slate-700/50">
                        <div className="font-bold text-purple-400 text-sm mb-1">{hab.nome}</div>
                        <div className="text-slate-400 text-xs">{hab.descricao}</div>
                      </div>
                    ))}
                  </div>

                  {/* Info adicional */}
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="text-slate-500 text-xs mb-1">Nível</div>
                      <div className="text-cyan-400 font-bold">{avatarSelecionado.nivel}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1">Vínculo</div>
                      <div className="text-purple-400 font-bold">{avatarSelecionado.vinculo}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1">Status</div>
                      <div className={avatarSelecionado.vivo ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                        {avatarSelecionado.vivo ? 'Ativo' : 'Destruído'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Efeito de scan */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent animate-scan"></div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
