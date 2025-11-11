"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Componente AvatarSVG simplificado (assumindo que existe)
const AvatarSVG = ({ avatar, tamanho = 120 }) => (
  <div style={{ width: tamanho, height: tamanho }} className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-4xl">
    {avatar.elemento === 'Fogo' ? '🔥' :
     avatar.elemento === 'Água' ? '💧' :
     avatar.elemento === 'Terra' ? '🪨' :
     avatar.elemento === 'Vento' ? '💨' :
     avatar.elemento === 'Eletricidade' ? '⚡' :
     avatar.elemento === 'Sombra' ? '🌑' :
     avatar.elemento === 'Luz' ? '✨' : '⭐'}
  </div>
);

export default function AvatarsPage() {
  const router = useRouter();
  const [avatares, setAvatares] = useState([]);
  const [avatarSelecionado, setAvatarSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  // MOCK DATA para demonstração
  useEffect(() => {
    setTimeout(() => {
      setAvatares([
        {
          id: "1",
          nome: "Dew, o Guardião",
          descricao: "Um espírito aquático jovem, ainda aprendendo a controlar as marés dentro de si.",
          elemento: "Água",
          raridade: "Comum",
          nivel: 1,
          experiencia: 45,
          vinculo: 15,
          exaustao: 0,
          forca: 9,
          agilidade: 6,
          resistencia: 8,
          foco: 5,
          habilidades: [{nome: "Corrente Aquática", descricao: "Ataque básico de água", tipo: "Ofensiva"}],
          vivo: true,
          ativo: true,
          marca_morte: false
        },
        {
          id: "2",
          nome: "Ember, o Feroz",
          descricao: "Chamas ancestrais personificadas em forma de guardião.",
          elemento: "Fogo",
          raridade: "Raro",
          nivel: 5,
          experiencia: 230,
          vinculo: 42,
          exaustao: 65,
          forca: 14,
          agilidade: 11,
          resistencia: 9,
          foco: 13,
          habilidades: [
            {nome: "Chamas Básicas", descricao: "Rajada de fogo", tipo: "Ofensiva"},
            {nome: "Explosão Ígnea", descricao: "Dano em área", tipo: "Ofensiva"}
          ],
          vivo: true,
          ativo: false,
          marca_morte: false
        },
        {
          id: "3",
          nome: "Shadow, o Caído",
          descricao: "Um fragmento das trevas primordiais, ressuscitado através de necromancia.",
          elemento: "Sombra",
          raridade: "Comum",
          nivel: 3,
          experiencia: 180,
          vinculo: 0,
          exaustao: 0,
          forca: 4,
          agilidade: 3,
          resistencia: 2,
          foco: 3,
          habilidades: [{nome: "Toque Sombrio", descricao: "Drena vida", tipo: "Ofensiva"}],
          vivo: true,
          ativo: false,
          marca_morte: true
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getCorRaridade = (raridade) => {
    switch (raridade) {
      case 'Lendário': return 'from-amber-500 to-yellow-500';
      case 'Raro': return 'from-purple-500 to-pink-500';
      default: return 'from-slate-600 to-slate-700';
    }
  };

  const getCorBorda = (raridade) => {
    switch (raridade) {
      case 'Lendário': return 'border-amber-500/50';
      case 'Raro': return 'border-purple-500/50';
      default: return 'border-slate-700/50';
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
      'Fogo': '🔥', 'Água': '💧', 'Terra': '🪨', 'Vento': '💨',
      'Eletricidade': '⚡', 'Sombra': '🌑', 'Luz': '✨'
    };
    return emojis[elemento] || '⭐';
  };

  const getNivelExaustao = (exaustao) => {
    if (exaustao < 20) return { nome: 'Descansado', cor: 'text-green-400', emoji: '💚' };
    if (exaustao < 40) return { nome: 'Alerta', cor: 'text-yellow-400', emoji: '💛' };
    if (exaustao < 60) return { nome: 'Cansado', cor: 'text-orange-400', emoji: '🟠' };
    if (exaustao < 80) return { nome: 'Exausto', cor: 'text-red-400', emoji: '🔴' };
    if (exaustao < 100) return { nome: 'Colapso Iminente', cor: 'text-red-600', emoji: '💀' };
    return { nome: 'Colapsado', cor: 'text-gray-400', emoji: '💀💀' };
  };

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
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl top-20 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/5 rounded-full blur-3xl bottom-20 -right-48 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-2">
              MINHA COLEÇÃO
            </h1>
            <p className="text-slate-400 font-mono text-sm">
              {avatares.length} Avatares | {avatares.filter(a => a.vivo).length} Vivos | {avatares.filter(a => !a.vivo).length} Mortos
            </p>
          </div>
          
          <button onClick={() => router.push("/dashboard")} className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 font-mono text-sm">
            <span>←</span> <span>VOLTAR</span>
          </button>
        </div>

        {/* Avatar Ativo em Destaque */}
        {avatarAtivo && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
              <span className="text-3xl">⚔️</span>
              <span>AVATAR ATIVO</span>
            </h2>

            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-green-500/30 via-cyan-500/30 to-blue-500/30 rounded-lg blur-xl animate-pulse"></div>
              
              <div className="relative bg-slate-950/90 backdrop-blur-xl border-2 border-green-500/50 rounded-lg overflow-hidden">
                {/* Header */}
                <div className={`p-3 text-center font-bold text-lg bg-gradient-to-r ${getCorRaridade(avatarAtivo.raridade)}`}>
                  {avatarAtivo.raridade.toUpperCase()}
                </div>

                {/* Badge ATIVO */}
                <div className="absolute top-16 right-4 z-10">
                  <div className="bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    ATIVO
                  </div>
                </div>
                
                {/* Badge Marca da Morte */}
                {avatarAtivo.marca_morte && (
                  <div className="absolute top-28 right-4 z-10">
                    <div className="bg-red-900/90 text-white text-xs font-bold px-3 py-1.5 rounded border border-red-500/50 flex items-center gap-1.5">
                      <span>💀</span>
                      <span>MARCA DA MORTE</span>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 p-8">
                  {/* Coluna Esquerda - Visual */}
                  <div>
                    <div className={`bg-slate-900/70 rounded-lg p-6 aspect-square border-2 ${getCorBorda(avatarAtivo.raridade)} flex items-center justify-center mb-4`}>
                      <AvatarSVG avatar={avatarAtivo} tamanho={200} />
                    </div>

                    {/* Total Stats - NOVO */}
                    <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-4 border border-cyan-500/30">
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-2 text-center">Poder Total</div>
                      <div className="text-4xl font-black text-center">
                        <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                          {avatarAtivo.forca + avatarAtivo.agilidade + avatarAtivo.resistencia + avatarAtivo.foco}
                        </span>
                      </div>
                      <div className="text-xs text-center text-slate-500 mt-1">
                        {avatarAtivo.marca_morte && <span className="text-red-400">(-50% por Marca da Morte)</span>}
                      </div>
                    </div>
                  </div>

                  {/* Coluna Direita - Info */}
                  <div className="space-y-4">
                    {/* Nome */}
                    <div>
                      <h3 className="text-3xl font-black text-cyan-400 mb-2">{avatarAtivo.nome}</h3>
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

                    {/* Stats Grid - MELHORADO */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className={`bg-slate-900/50 rounded p-3 text-center border border-red-500/20 ${avatarAtivo.marca_morte ? 'opacity-60' : ''}`}>
                        <div className="text-[10px] text-slate-500 uppercase mb-1">FOR</div>
                        <div className="text-2xl font-bold text-red-400 flex items-center justify-center gap-1">
                          {avatarAtivo.forca}
                          {avatarAtivo.marca_morte && <span className="text-xs">💀</span>}
                        </div>
                      </div>
                      <div className={`bg-slate-900/50 rounded p-3 text-center border border-green-500/20 ${avatarAtivo.marca_morte ? 'opacity-60' : ''}`}>
                        <div className="text-[10px] text-slate-500 uppercase mb-1">AGI</div>
                        <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
                          {avatarAtivo.agilidade}
                          {avatarAtivo.marca_morte && <span className="text-xs">💀</span>}
                        </div>
                      </div>
                      <div className={`bg-slate-900/50 rounded p-3 text-center border border-blue-500/20 ${avatarAtivo.marca_morte ? 'opacity-60' : ''}`}>
                        <div className="text-[10px] text-slate-500 uppercase mb-1">RES</div>
                        <div className="text-2xl font-bold text-blue-400 flex items-center justify-center gap-1">
                          {avatarAtivo.resistencia}
                          {avatarAtivo.marca_morte && <span className="text-xs">💀</span>}
                        </div>
                      </div>
                      <div className={`bg-slate-900/50 rounded p-3 text-center border border-purple-500/20 ${avatarAtivo.marca_morte ? 'opacity-60' : ''}`}>
                        <div className="text-[10px] text-slate-500 uppercase mb-1">FOC</div>
                        <div className="text-2xl font-bold text-purple-400 flex items-center justify-center gap-1">
                          {avatarAtivo.foco}
                          {avatarAtivo.marca_morte && <span className="text-xs">💀</span>}
                        </div>
                      </div>
                    </div>

                    {/* Progresso - MELHORADO */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-900/50 rounded p-3">
                        <div className="text-[10px] text-slate-500 mb-2 uppercase">Nível</div>
                        <div className="text-xl font-bold text-cyan-400">{avatarAtivo.nivel}</div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                          <div className="bg-cyan-400 h-1.5 rounded-full" style={{width: `${(avatarAtivo.experiencia % 100)}%`}}></div>
                        </div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-3">
                        <div className="text-[10px] text-slate-500 mb-2 uppercase">Vínculo</div>
                        <div className="text-xl font-bold text-purple-400">{avatarAtivo.vinculo}%</div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                          <div className="bg-purple-400 h-1.5 rounded-full" style={{width: `${avatarAtivo.vinculo}%`}}></div>
                        </div>
                      </div>
                      {/* NOVO: Exaustão */}
                      <div className="bg-slate-900/50 rounded p-3">
                        <div className="text-[10px] text-slate-500 mb-2 uppercase">Exaustão</div>
                        <div className={`text-xl font-bold ${getNivelExaustao(avatarAtivo.exaustao).cor}`}>
                          {avatarAtivo.exaustao}%
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                          <div className={`h-1.5 rounded-full ${
                            avatarAtivo.exaustao < 40 ? 'bg-green-400' :
                            avatarAtivo.exaustao < 60 ? 'bg-yellow-400' :
                            avatarAtivo.exaustao < 80 ? 'bg-orange-400' : 'bg-red-400'
                          }`} style={{width: `${avatarAtivo.exaustao}%`}}></div>
                        </div>
                      </div>
                    </div>

                    {/* Habilidades */}
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

        {/* Outros Avatares - MELHORADO */}
        {avataresInativos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-400 mb-6 flex items-center gap-3">
              <span className="text-3xl">📚</span>
              <span>OUTROS AVATARES ({avataresInativos.length})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {avataresInativos.map((avatar) => {
                const totalStats = avatar.forca + avatar.agilidade + avatar.resistencia + avatar.foco;
                const nivelExaustao = getNivelExaustao(avatar.exaustao);

                return (
                  <div key={avatar.id} className="relative group cursor-pointer" onClick={() => setAvatarSelecionado(avatar)}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    
                    <div className={`relative bg-slate-950/80 backdrop-blur-xl border ${getCorBorda(avatar.raridade)} rounded-lg overflow-hidden group-hover:border-cyan-500/50 transition-all ${!avatar.vivo ? 'opacity-50' : ''}`}>
                      {/* Header */}
                      <div className={`p-2 text-center font-bold text-xs bg-gradient-to-r ${getCorRaridade(avatar.raridade)}`}>
                        {avatar.raridade.toUpperCase()}
                      </div>

                      {/* Badges */}
                      {!avatar.vivo && (
                        <div className="absolute top-10 right-2 bg-red-900 text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                          ☠️ MORTO
                        </div>
                      )}
                      {avatar.vivo && avatar.marca_morte && (
                        <div className="absolute top-10 left-2 bg-red-900/90 text-white text-[10px] font-bold px-2 py-1 rounded z-10 border border-red-500/50">
                          💀
                        </div>
                      )}

                      <div className="p-4">
                        {/* Avatar Visual */}
                        <div className={`bg-slate-900/50 rounded p-4 aspect-square border ${getCorBorda(avatar.raridade)} flex items-center justify-center mb-3`}>
                          <AvatarSVG avatar={avatar} tamanho={120} />
                        </div>

                        {/* Nome + Total Stats - NOVO */}
                        <div className="mb-3">
                          <h3 className="text-base font-bold text-cyan-400 mb-1 truncate">{avatar.nome}</h3>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-mono ${getCorElemento(avatar.elemento)}`}>
                              {getEmojiElemento(avatar.elemento)} {avatar.elemento}
                            </span>
                            <span className="text-cyan-400 text-xs font-bold">
                              ⚡ {totalStats}
                            </span>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-1 mb-3">
                          <div className="text-center">
                            <div className={`font-bold text-sm ${avatar.marca_morte ? 'text-red-400/70' : 'text-red-400'}`}>
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

                        {/* Info Row - MELHORADO */}
                        <div className="flex justify-between items-center text-[10px] text-slate-500 mb-3">
                          <span>Nv. {avatar.nivel}</span>
                          <span className={nivelExaustao.cor}>{nivelExaustao.emoji}</span>
                          <span>Vínculo: {avatar.vinculo}%</span>
                        </div>

                        {/* Botão Ativar */}
                        {!avatar.ativo && avatar.vivo && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Ativar ${avatar.nome}`);
                            }}
                            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-colors"
                          >
                            Ativar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
