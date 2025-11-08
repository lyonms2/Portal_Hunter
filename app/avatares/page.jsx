"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AvatarsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [avatares, setAvatares] = useState([]);
  const [avatarSelecionado, setAvatarSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const response = await fetch(`/api/meus-avatares?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setAvatares(data.avatares);
      } else {
        console.error("Erro ao carregar avatares:", data.message);
      }
    } catch (error) {
      console.error("Erro ao carregar avatares:", error);
    } finally {
      setLoading(false);
    }
  };

  const ativarAvatar = async (avatarId) => {
    try {
      const response = await fetch("/api/meus-avatares", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, avatarId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Atualizar lista local
        setAvatares(prev => prev.map(av => ({
          ...av,
          ativo: av.id === avatarId
        })));
        alert("Avatar ativado com sucesso!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Erro ao ativar avatar:", error);
      alert("Erro ao ativar avatar");
    }
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
              {avatares.length} {avatares.length === 1 ? 'Avatar' : 'Avatares'} invocados
            </p>
          </div>
          
          <button
            onClick={() => router.push("/dashboard")}
            className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 font-mono text-sm group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            <span>VOLTAR</span>
          </button>
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

        {/* Grid de Avatares */}
        {avatares.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {avatares.map((avatar) => (
              <div
                key={avatar.id}
                className="relative group cursor-pointer"
                onClick={() => setAvatarSelecionado(avatar)}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                
                <div className="relative bg-slate-950/80 backdrop-blur-xl border border-cyan-900/30 rounded-lg overflow-hidden group-hover:border-cyan-500/50 transition-all">
                  {/* Badge de raridade */}
                  <div className={`p-2 text-center font-bold text-xs bg-gradient-to-r ${getCorRaridade(avatar.raridade)}`}>
                    {avatar.raridade.toUpperCase()}
                  </div>

                  {/* Badge de ativo */}
                  {avatar.ativo && (
                    <div className="absolute top-12 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                      ✓ ATIVO
                    </div>
                  )}

                  <div className="p-6">
                    {/* Nome */}
                    <h3 className="text-xl font-bold text-cyan-400 mb-2 truncate">
                      {avatar.nome}
                    </h3>

                    {/* Elemento */}
                    <div className="mb-4">
                      <span className={`text-sm font-mono ${getCorElemento(avatar.elemento)}`}>
                        {avatar.elemento}
                      </span>
                    </div>

                    {/* Stats resumidos */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="text-center">
                        <div className="text-red-400 font-bold text-lg">{avatar.forca}</div>
                        <div className="text-xs text-slate-500">FOR</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-bold text-lg">{avatar.agilidade}</div>
                        <div className="text-xs text-slate-500">AGI</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-400 font-bold text-lg">{avatar.resistencia}</div>
                        <div className="text-xs text-slate-500">RES</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-400 font-bold text-lg">{avatar.foco}</div>
                        <div className="text-xs text-slate-500">FOC</div>
                      </div>
                    </div>

                    {/* Info adicional */}
                    <div className="flex justify-between text-xs text-slate-500 mb-4">
                      <span>Nv. {avatar.nivel}</span>
                      <span>Vínculo: {avatar.vinculo}%</span>
                    </div>

                    {/* Botão ativar */}
                    {!avatar.ativo && avatar.vivo && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          ativarAvatar(avatar.id);
                        }}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded transition-colors"
                      >
                        Ativar
                      </button>
                    )}

                    {!avatar.vivo && (
                      <div className="w-full py-2 bg-red-900/50 text-red-400 text-sm font-bold rounded text-center">
                        ☠️ Destruído
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
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
                    className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl"
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
                      {avatarSelecionado.elemento}
                    </span>
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
    </div>
  );
}
