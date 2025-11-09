"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundEffects from "@/components/BackgroundEffects";

export default function NecromantePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [avataresMortos, setAvataresMortos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [avatarSelecionado, setAvatarSelecionado] = useState(null);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  // Custos por raridade
  const custos = {
    'Comum': { moedas: 500, fragmentos: 50 },
    'Raro': { moedas: 1000, fragmentos: 100 },
    'Lendário': { moedas: 1500, fragmentos: 150 }
  };

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
        // Buscar stats do jogador
        const statsResponse = await fetch("/api/inicializar-jogador", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: parsedUser.id }),
        });
        const statsData = await statsResponse.json();
        setStats(statsData.stats);

        // Buscar avatares mortos
        const avatarResponse = await fetch(`/api/meus-avatares?userId=${parsedUser.id}`);
        const avatarData = await avatarResponse.json();
        
        if (avatarResponse.ok) {
          const mortos = (avatarData.avatares || []).filter(av => !av.vivo);
          setAvataresMortos(mortos);
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const abrirModal = (avatar) => {
    setAvatarSelecionado(avatar);
    setModalConfirmar(true);
    setMensagem(null);
  };

  const ressuscitar = async () => {
    if (!avatarSelecionado) return;

    const custo = custos[avatarSelecionado.raridade];
    
    // Verificar recursos
    if (stats.moedas < custo.moedas || stats.fragmentos < custo.fragmentos) {
      setMensagem({
        tipo: 'erro',
        texto: `Recursos insuficientes! Necessário: ${custo.moedas} moedas e ${custo.fragmentos} fragmentos`
      });
      return;
    }

    setProcessando(true);

    try {
      const response = await fetch("/api/ressuscitar-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          avatarId: avatarSelecionado.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem({
          tipo: 'sucesso',
          texto: '⚰️ Ritual concluído! O avatar retornou do além...'
        });
        
        // Atualizar stats e lista
        setStats(data.stats);
        setAvataresMortos(prev => prev.filter(av => av.id !== avatarSelecionado.id));
        
        setTimeout(() => {
          setModalConfirmar(false);
          setAvatarSelecionado(null);
        }, 2000);
      } else {
        setMensagem({
          tipo: 'erro',
          texto: data.message || 'Erro ao ressuscitar avatar'
        });
      }
    } catch (error) {
      console.error("Erro:", error);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao realizar ritual'
      });
    } finally {
      setProcessando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-purple-400 font-mono animate-pulse">Adentrando as sombras...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-gray-100 relative overflow-hidden">
      <BackgroundEffects />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => router.push("/dashboard")}
            className="absolute left-4 top-4 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            ← Voltar
          </button>

          <div className="text-6xl mb-4">⚰️</div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-300 via-red-300 to-purple-300 bg-clip-text text-transparent mb-3">
            O NECROMANTE
          </h1>
          <p className="text-slate-400 font-mono text-sm max-w-2xl mx-auto">
            "Aqueles que cruzaram o véu podem retornar... mas a morte deixa cicatrizes eternas."
          </p>
        </div>

        {/* Recursos do Jogador */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="bg-slate-950/80 backdrop-blur border border-amber-500/30 rounded px-4 py-2">
            <span className="text-amber-400 font-bold">💰 {stats?.moedas || 0}</span>
          </div>
          <div className="bg-slate-950/80 backdrop-blur border border-purple-500/30 rounded px-4 py-2">
            <span className="text-purple-400 font-bold">💎 {stats?.fragmentos || 0}</span>
          </div>
        </div>

        {/* Lista de Avatares Mortos */}
        {avataresMortos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-50">☠️</div>
            <h3 className="text-xl font-bold text-slate-400 mb-2">Nenhuma alma perdida</h3>
            <p className="text-slate-500 text-sm">Todos os seus avatares ainda caminham entre os vivos...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {avataresMortos.map((avatar) => {
              const custo = custos[avatar.raridade];
              const podeRessuscitar = stats?.moedas >= custo.moedas && stats?.fragmentos >= custo.fragmentos;

              return (
                <div key={avatar.id} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-red-500/20 rounded-lg blur opacity-50"></div>
                  
                  <div className="relative bg-slate-950/90 backdrop-blur-xl border border-purple-900/50 rounded-lg overflow-hidden">
                    {/* Badge */}
                    <div className={`px-4 py-2 text-center font-bold text-sm ${
                      avatar.raridade === 'Lendário' ? 'bg-gradient-to-r from-amber-600 to-yellow-500' :
                      avatar.raridade === 'Raro' ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                      'bg-gradient-to-r from-slate-700 to-slate-600'
                    }`}>
                      {avatar.raridade.toUpperCase()} ☠️
                    </div>

                    <div className="p-4">
                      {/* SVG do Avatar (cinza/dessaturado) */}
                      <div className="mb-4 opacity-40 grayscale" dangerouslySetInnerHTML={{ __html: avatar.avatar_svg }} />

                      {/* Info */}
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-slate-300 mb-1">{avatar.nome}</h3>
                        <p className="text-xs text-slate-500">{avatar.elemento} • Nível {avatar.nivel}</p>
                      </div>

                      {/* Custo */}
                      <div className="bg-slate-900/50 rounded p-3 mb-3">
                        <div className="text-xs text-slate-500 mb-2 text-center">Custo do Ritual:</div>
                        <div className="flex justify-center gap-4">
                          <span className={`text-sm font-bold ${stats?.moedas >= custo.moedas ? 'text-amber-400' : 'text-red-400'}`}>
                            💰 {custo.moedas}
                          </span>
                          <span className={`text-sm font-bold ${stats?.fragmentos >= custo.fragmentos ? 'text-purple-400' : 'text-red-400'}`}>
                            💎 {custo.fragmentos}
                          </span>
                        </div>
                      </div>

                      {/* Botão */}
                      <button
                        onClick={() => abrirModal(avatar)}
                        disabled={!podeRessuscitar}
                        className={`w-full group/btn relative ${!podeRessuscitar ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-red-500 rounded blur opacity-50 group-hover/btn:opacity-75 transition-all"></div>
                        <div className="relative px-4 py-3 bg-slate-950 rounded border border-purple-500/50 transition-all">
                          <span className="font-bold text-purple-300">
                            {podeRessuscitar ? '⚰️ RESSUSCITAR' : '❌ SEM RECURSOS'}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Confirmação */}
      {modalConfirmar && avatarSelecionado && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !processando && setModalConfirmar(false)}
        >
          <div 
            className="max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/50 to-red-500/50 rounded-lg blur opacity-75"></div>
              
              <div className="relative bg-slate-950/95 backdrop-blur-xl border border-purple-900/50 rounded-lg overflow-hidden">
                {/* Header */}
                <div className="p-6 text-center bg-gradient-to-r from-purple-900/30 to-red-900/30 border-b border-purple-500/30">
                  <div className="text-4xl mb-2">⚰️</div>
                  <h2 className="text-2xl font-bold text-purple-300">RITUAL DE NECROMANCIA</h2>
                </div>

                <div className="p-6">
                  {/* Avisos */}
                  <div className="bg-red-950/30 border border-red-500/30 rounded p-4 mb-4">
                    <h3 className="text-red-400 font-bold mb-2 text-sm">⚠️ CONSEQUÊNCIAS DO RITUAL:</h3>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>• Stats reduzidos em 50%</li>
                      <li>• Vínculo resetado para 0%</li>
                      <li>• Marca da Morte (penalidade temporária)</li>
                      <li>• Avatar volta "diferente"</li>
                    </ul>
                  </div>

                  {/* Info do Avatar */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-slate-300">{avatarSelecionado.nome}</h3>
                    <p className="text-sm text-slate-500">{avatarSelecionado.elemento} • {avatarSelecionado.raridade}</p>
                  </div>

                  {/* Mensagem */}
                  {mensagem && (
                    <div className={`p-3 rounded mb-4 ${
                      mensagem.tipo === 'sucesso' 
                        ? 'bg-green-950/50 border border-green-500/30 text-green-400'
                        : 'bg-red-950/50 border border-red-500/30 text-red-400'
                    }`}>
                      <p className="text-sm text-center">{mensagem.texto}</p>
                    </div>
                  )}

                  {/* Botões */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModalConfirmar(false)}
                      disabled={processando}
                      className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={ressuscitar}
                      disabled={processando}
                      className="flex-1 group/btn relative disabled:opacity-50"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-red-500 rounded blur opacity-50 group-hover/btn:opacity-75 transition-all"></div>
                      <div className="relative px-4 py-3 bg-slate-950 rounded border border-purple-500/50 transition-all">
                        <span className="font-bold text-purple-300">
                          {processando ? 'REALIZANDO...' : '⚰️ RESSUSCITAR'}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
