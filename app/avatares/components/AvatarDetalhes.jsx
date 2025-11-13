import AvatarSVG from '../../components/AvatarSVG';

const calcularXPNecessario = (nivel) => {
  const XP_BASE = 100;
  const MULTIPLICADOR = 1.15;
  return Math.floor(XP_BASE * Math.pow(MULTIPLICADOR, nivel - 1));
};

const getInfoExaustao = (exaustao) => {
  if (exaustao >= 100) {
    return { emoji: '💀💀', cor: 'text-gray-400', nome: 'COLAPSADO' };
  } else if (exaustao >= 80) {
    return { emoji: '💀', cor: 'text-red-600', nome: 'COLAPSO IMINENTE' };
  } else if (exaustao >= 60) {
    return { emoji: '🔴', cor: 'text-red-400', nome: 'EXAUSTO' };
  } else if (exaustao >= 40) {
    return { emoji: '🟠', cor: 'text-orange-400', nome: 'CANSADO' };
  } else if (exaustao >= 20) {
    return { emoji: '💛', cor: 'text-yellow-400', nome: 'ALERTA' };
  } else {
    return { emoji: '💚', cor: 'text-green-400', nome: 'DESCANSADO' };
  }
};

const BarraExaustao = ({ exaustao }) => {
  const info = getInfoExaustao(exaustao || 0);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 uppercase">Exaustão</span>
        <span className={`text-xs font-bold ${info.cor}`}>
          {info.emoji} {exaustao || 0}/100
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full ${
            exaustao >= 80 ? 'bg-red-500' :
            exaustao >= 60 ? 'bg-orange-500' :
            exaustao >= 40 ? 'bg-yellow-500' :
            exaustao >= 20 ? 'bg-green-400' :
            'bg-green-500'
          } transition-all`}
          style={{width: `${Math.min(exaustao || 0, 100)}%`}}
        ></div>
      </div>
      {exaustao >= 80 && (
        <p className="text-[10px] text-red-400 font-mono">
          ⚠️ Não pode lutar! Necessita descanso.
        </p>
      )}
      {exaustao >= 60 && exaustao < 80 && (
        <p className="text-[10px] text-orange-400 font-mono">
          ⚠️ Risco alto! Penalidades severas.
        </p>
      )}
    </div>
  );
};

export default function AvatarDetalhes({
  avatar,
  onClose,
  onDescansar,
  getCorRaridade,
  getCorBorda,
  getCorElemento,
  getEmojiElemento
}) {
  if (!avatar) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto p-4"
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center py-8">
        <div 
          className="max-w-4xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-lg blur opacity-75"></div>
            
            <div className="relative bg-slate-950/95 backdrop-blur-xl border border-cyan-900/30 rounded-lg overflow-hidden">
              {/* Header com raridade */}
              <div className={`p-3 text-center font-bold text-lg bg-gradient-to-r ${getCorRaridade(avatar.raridade)} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                <span className="relative">{avatar.raridade.toUpperCase()}</span>
              </div>
    
              {/* Botão Fechar */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 bg-slate-900/80 hover:bg-red-900/80 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all z-20 border border-slate-700/50 hover:border-red-500/50"
              >
                ✕
              </button>
    
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Coluna Esquerda - Imagem + Lore */}
                  <div className="space-y-4">
                    {/* Avatar em destaque */}
                    <div className={`bg-slate-900/70 rounded-lg p-6 aspect-square border-2 ${getCorBorda(avatar.raridade)} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5"></div>
                      <div className="relative">
                        <AvatarSVG avatar={avatar} tamanho={240} />
                      </div>
                    </div>
    
                    {/* Nome e Elemento */}
                    <div className="text-center">
                      <h3 className="text-2xl font-black mb-2 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                        {avatar.nome}
                      </h3>
                      
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className={`inline-block px-3 py-1 bg-slate-800 rounded-full text-sm font-mono ${getCorElemento(avatar.elemento)}`}>
                          {getEmojiElemento(avatar.elemento)} {avatar.elemento}
                        </span>
                        
                        {avatar.marca_morte && (
                          <span className="inline-block px-2 py-1 bg-red-900/80 border border-red-500/50 rounded-full text-xs font-bold text-white">
                            💀
                          </span>
                        )}
                      </div>
                    </div>
    
                    {/* Descrição/Lore */}
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                      <div className="text-xs text-cyan-400 font-bold uppercase mb-2 tracking-wider">Lore</div>
                      <p className="text-slate-300 text-sm leading-relaxed italic">
                        "{avatar.descricao}"
                      </p>
                    </div>

                    {/* Habilidades */}
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                      <div className="text-xs text-cyan-400 font-bold uppercase mb-3 tracking-wider">Habilidades</div>
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                        {avatar.habilidades.map((hab, index) => (
                          <div key={index} className="bg-slate-800/50 rounded p-2 border border-slate-700/20">
                            <div className="font-bold text-purple-400 text-xs mb-1">{hab.nome}</div>
                            <div className="text-slate-400 text-[11px] leading-relaxed">{hab.descricao}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
    
                  {/* Coluna Direita - Stats e Progresso */}
                  <div className="space-y-4">
                    {/* Stats Principais */}
                    <div>
                      <h4 className="text-cyan-400 font-bold text-xs uppercase tracking-wider mb-3">Atributos</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-red-500/20">
                          <div className="text-xs text-slate-500 uppercase mb-1">Força</div>
                          <div className="text-2xl font-bold text-red-400">{avatar.forca}</div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-green-500/20">
                          <div className="text-xs text-slate-500 uppercase mb-1">Agilidade</div>
                          <div className="text-2xl font-bold text-green-400">{avatar.agilidade}</div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-blue-500/20">
                          <div className="text-xs text-slate-500 uppercase mb-1">Resistência</div>
                          <div className="text-2xl font-bold text-blue-400">{avatar.resistencia}</div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-purple-500/20">
                          <div className="text-xs text-slate-500 uppercase mb-1">Foco</div>
                          <div className="text-2xl font-bold text-purple-400">{avatar.foco}</div>
                        </div>
                      </div>
                    </div>
    
                    {/* Progresso Compacto */}
                    <div>
                      <h4 className="text-cyan-400 font-bold text-xs uppercase tracking-wider mb-3">Progresso</h4>
                      <div className="space-y-3">
                        {/* Nível */}
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-500 uppercase">Nível</span>
                            <span className="text-lg font-bold text-cyan-400">{avatar.nivel}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
                            <div 
                              className="bg-cyan-400 h-1.5 rounded-full transition-all" 
                              style={{width: `${((avatar.experiencia || 0) / calcularXPNecessario(avatar.nivel)) * 100}%`}}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-500">
                            <span>{avatar.experiencia || 0} XP</span>
                            <span>{calcularXPNecessario(avatar.nivel)} XP</span>
                          </div>
                        </div>

                        {/* Vínculo */}
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-500 uppercase">Vínculo</span>
                            <span className="text-lg font-bold text-purple-400">{avatar.vinculo}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5">
                            <div 
                              className="bg-purple-400 h-1.5 rounded-full transition-all" 
                              style={{width: `${avatar.vinculo || 0}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exaustão */}
                    <div>
                      <h4 className="text-cyan-400 font-bold text-xs uppercase tracking-wider mb-3">Condição Física</h4>
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <BarraExaustao exaustao={avatar.exaustao} />

                        {/* Botão Descansar */}
                        {avatar.vivo && (avatar.exaustao || 0) > 0 && (
                          <button
                            onClick={() => onDescansar(avatar.id)}
                            className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            💤 Descansar (1 hora)
                          </button>
                        )}

                        {avatar.vivo && (avatar.exaustao || 0) === 0 && (
                          <div className="mt-3 text-center text-xs text-green-400 font-mono">
                            ✨ Totalmente descansado!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total de Poder */}
                    <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-lg p-4 border border-cyan-500/30">
                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase mb-1">Poder Total</div>
                        <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {(avatar.forca || 0) + (avatar.agilidade || 0) + (avatar.resistencia || 0) + (avatar.foco || 0)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {avatar.raridade}
                        </div>
                      </div>
                    </div>                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
      
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 3px;
        }
      
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 3px;
        }
      
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
        }
      `}</style>
    </div>
  );
}
