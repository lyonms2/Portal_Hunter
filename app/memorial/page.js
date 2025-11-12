"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AvatarSVG from '../components/AvatarSVG';

export default function MemorialPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [avataresMarcados, setAvataresMarcados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarSelecionado, setAvatarSelecionado] = useState(null);

  useEffect(() => {
    const init = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        router.push("/login");
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      try {
        const response = await fetch(`/api/meus-avatares?userId=${parsedUser.id}`);
        const data = await response.json();
        
        if (response.ok) {
          // Filtrar apenas avatares com marca_morte
          const marcados = (data.avatares || []).filter(av => av.marca_morte);
          setAvataresMarcados(marcados);
        }
      } catch (error) {
        console.error("Erro ao carregar memorial:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const voltarParaAvatares = () => {
    router.push("/avatares");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-slate-950 flex items-center justify-center">
        <div className="text-gray-500 font-mono animate-pulse">Adentrando o memorial...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-slate-950 text-gray-100 relative overflow-hidden">
      {/* Névoa pesada */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[800px] h-[800px] bg-gray-900/20 rounded-full blur-[120px] top-0 left-1/4 animate-float-slow"></div>
        <div className="absolute w-[600px] h-[600px] bg-slate-900/20 rounded-full blur-[100px] bottom-0 right-1/4 animate-float-slower"></div>
      </div>

      {/* Chuva suave */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxsaW5lIHgxPSIxMCIgeTE9IjAiIHgyPSIxMCIgeTI9IjEwMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4zIi8+PC9zdmc+')] animate-rain"></div>
      </div>

      {/* Vinheta escura */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)] pointer-events-none"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        {/* Botão Voltar */}
        <button
          onClick={voltarParaAvatares}
          className="absolute top-8 left-8 text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-2 font-mono text-sm group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> 
          <span>SAIR DO MEMORIAL</span>
        </button>

        <div className="max-w-6xl w-full">
          {/* Cabeçalho */}
          <div className="text-center mb-16">
            <div className="relative inline-block mb-8">
              <div className="text-8xl opacity-20 blur-sm absolute -inset-4">🕯️</div>
              <div className="text-8xl relative animate-flicker">🕯️</div>
            </div>
            
            <h1 className="text-6xl font-black text-gray-400 mb-4 tracking-wider">
              MEMORIAL DOS CAÍDOS
            </h1>
            
            <div className="h-px w-96 mx-auto bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6"></div>
            
            <p className="text-gray-500 font-mono text-sm max-w-2xl mx-auto leading-relaxed">
              "Aqui descansam aqueles que desafiaram a morte e retornaram. 
              Suas almas carregam a Marca da Morte, um testemunho eterno de sua jornada além do véu. 
              Eles não podem mais ser chamados de volta, mas jamais serão esquecidos."
            </p>

            {avataresMarcados.length > 0 && (
              <div className="mt-6 text-gray-600 font-mono text-xs">
                {avataresMarcados.length} {avataresMarcados.length === 1 ? 'alma' : 'almas'} marcada{avataresMarcados.length === 1 ? '' : 's'} pela morte
              </div>
            )}
          </div>

          {/* Lista de Avatares Marcados */}
          {avataresMarcados.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-7xl mb-6 opacity-10">🪦</div>
              <h3 className="text-2xl font-bold text-gray-600 mb-3">Memorial Vazio</h3>
              <p className="text-gray-700 text-sm mb-8 max-w-md mx-auto">
                Nenhum de seus avatares carrega a Marca da Morte ainda. 
                Que assim permaneça por muito tempo...
              </p>
              <button
                onClick={voltarParaAvatares}
                className="text-gray-500 hover:text-gray-400 transition-colors font-mono text-sm"
              >
                Retornar aos Avatares
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {avataresMarcados.map((avatar) => (
                <div 
                  key={avatar.id} 
                  className="relative group cursor-pointer"
                  onClick={() => setAvatarSelecionado(avatar)}
                >
                  {/* Efeito de brilho sutil */}
                  <div className="absolute -inset-1 bg-gradient-to-b from-gray-800/10 to-transparent rounded-lg blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  <div className="relative bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur border border-gray-800/30 rounded-lg overflow-hidden group-hover:border-gray-700/50 transition-all duration-300">
                    {/* Lápide no topo */}
                    <div className="bg-gradient-to-b from-gray-900/80 to-gray-950/80 px-4 py-3 text-center border-b border-gray-800/50">
                      <div className="text-2xl mb-1 opacity-40">🪦</div>
                      <div className={`text-xs font-bold ${
                        avatar.raridade === 'Lendário' ? 'text-amber-600/70' :
                        avatar.raridade === 'Raro' ? 'text-purple-600/70' :
                        'text-gray-600'
                      }`}>
                        {avatar.raridade.toUpperCase()}
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Avatar (dessaturado e sombrio) */}
                      <div className="mb-6 opacity-30 grayscale hover:opacity-40 hover:grayscale-[70%] transition-all duration-500">
                        <AvatarSVG avatar={avatar} tamanho={180} />
                      </div>

                      {/* Informações */}
                      <div className="text-center space-y-3">
                        <h3 className="text-xl font-bold text-gray-400">
                          {avatar.nome}
                        </h3>
                        
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                          <span>{avatar.elemento}</span>
                          <span>•</span>
                          <span>Nível {avatar.nivel}</span>
                        </div>

                        {/* Marca da Morte */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/20 border border-red-900/20 rounded-full">
                          <span className="text-red-900/70">💀</span>
                          <span className="text-red-900/70 text-xs font-bold">MARCA DA MORTE</span>
                        </div>

                        {/* Status atual */}
                        <div className="pt-3 border-t border-gray-800/30 mt-4">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="text-gray-700 mb-1">Status</div>
                              <div className={`font-bold ${avatar.vivo ? 'text-green-800' : 'text-red-800'}`}>
                                {avatar.vivo ? 'Vivo' : 'Morto'}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-700 mb-1">Vínculo</div>
                              <div className="font-bold text-gray-600">{avatar.vinculo || 0}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rodapé com data (se disponível) */}
                    <div className="px-4 py-2 bg-gray-950/50 border-t border-gray-800/30 text-center">
                      <p className="text-gray-700 text-xs font-mono italic">
                        "Retornou do além, mas pagou o preço..."
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal de Detalhes */}
          {avatarSelecionado && (
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setAvatarSelecionado(null)}
            >
              <div 
                className="relative max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -inset-1 bg-gradient-to-b from-gray-800/30 to-transparent rounded-lg blur"></div>
                
                <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border border-gray-800 rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-b from-gray-900 to-gray-950 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl opacity-40">🪦</span>
                      <div>
                        <h2 className="text-2xl font-black text-gray-400">{avatarSelecionado.nome}</h2>
                        <p className="text-xs text-gray-600">Memorial Eterno</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAvatarSelecionado(null)}
                      className="text-gray-500 hover:text-gray-400 transition-colors text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="p-8">
                    {/* Avatar Grande */}
                    <div className="flex justify-center mb-8 opacity-40 grayscale">
                      <AvatarSVG avatar={avatarSelecionado} tamanho={250} />
                    </div>

                    {/* Marca da Morte Destaque */}
                    <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-6 mb-6">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="text-4xl">💀</span>
                        <div className="text-center">
                          <div className="text-red-900 font-black text-lg">MARCA DA MORTE</div>
                          <div className="text-red-950 text-xs">Cicatriz Eterna da Ressurreição</div>
                        </div>
                      </div>
                      <p className="text-center text-gray-600 text-sm font-mono italic">
                        "Este avatar desafiou a morte e retornou do vazio. Agora carrega uma marca que não pode ser apagada. 
                        A próxima morte será permanente."
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="bg-slate-900/50 rounded p-3 text-center border border-gray-800/30">
                        <div className="text-gray-700 text-xs mb-1">Força</div>
                        <div className="text-red-900 font-bold">{avatarSelecionado.forca}</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-3 text-center border border-gray-800/30">
                        <div className="text-gray-700 text-xs mb-1">Agilidade</div>
                        <div className="text-cyan-900 font-bold">{avatarSelecionado.agilidade}</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-3 text-center border border-gray-800/30">
                        <div className="text-gray-700 text-xs mb-1">Resistência</div>
                        <div className="text-green-900 font-bold">{avatarSelecionado.resistencia}</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-3 text-center border border-gray-800/30">
                        <div className="text-gray-700 text-xs mb-1">Foco</div>
                        <div className="text-purple-900 font-bold">{avatarSelecionado.foco}</div>
                      </div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-gray-700 text-xs mb-1">Nível</div>
                        <div className="text-gray-500 font-bold">{avatarSelecionado.nivel}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-700 text-xs mb-1">Vínculo</div>
                        <div className="text-gray-500 font-bold">{avatarSelecionado.vinculo || 0}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-700 text-xs mb-1">Status</div>
                        <div className={`font-bold text-sm ${avatarSelecionado.vivo ? 'text-green-800' : 'text-red-900'}`}>
                          {avatarSelecionado.vivo ? 'Vivo' : 'Permanentemente Morto'}
                        </div>
                      </div>
                    </div>

                    {/* Mensagem Final */}
                    <div className="bg-slate-950/50 border border-gray-800/50 rounded p-4 text-center">
                      <p className="text-gray-600 text-sm font-mono italic leading-relaxed">
                        "Que sua jornada além do véu não tenha sido em vão. 
                        Você será lembrado, {avatarSelecionado.nome}."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Velas flutuantes */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-950/50 to-transparent pointer-events-none"></div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-30px) translateX(20px);
          }
        }

        @keyframes float-slower {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(20px) translateX(-30px);
          }
        }

        @keyframes rain {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        @keyframes flicker {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }

        .animate-float-slower {
          animation: float-slower 25s ease-in-out infinite;
        }

        .animate-rain {
          animation: rain 3s linear infinite;
        }

        .animate-flicker {
          animation: flicker 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
