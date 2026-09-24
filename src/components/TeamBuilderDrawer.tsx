import React from 'react';
import { X, Trash2, Swords, Shield, Zap, Sparkles, Plus, AlertCircle, Heart } from 'lucide-react';
import { OfficialPokemon } from '../data/pokemonTierData';

interface TeamBuilderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  team: OfficialPokemon[];
  onRemoveFromTeam: (pokemonId: number) => void;
  onClearTeam: () => void;
  onLoadInCalculator: (pokemon: OfficialPokemon) => void;
}

export const TeamBuilderDrawer: React.FC<TeamBuilderDrawerProps> = ({
  isOpen,
  onClose,
  team,
  onRemoveFromTeam,
  onClearTeam,
  onLoadInCalculator,
}) => {
  if (!isOpen) return null;

  const totalBaseHp = team.reduce((acc, p) => acc + p.baseHp, 0);
  const totalBaseAtk = team.reduce((acc, p) => acc + p.baseAtk, 0);
  const totalBaseSpAtk = team.reduce((acc, p) => acc + p.baseSpAtk, 0);
  const avgSpeed = team.length > 0 ? Math.round(team.reduce((acc, p) => acc + p.baseSpeed, 0) / team.length) : 0;

  // Types covered
  const coveredTypes = Array.from(new Set(team.flatMap((p) => [p.type1, p.type2].filter(Boolean) as string[])));

  const getSprite = (id: number) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-slate-800 bg-[#0d1017] p-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-6 overflow-y-auto pr-1">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Mi Equipo de Caza</span>
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {team.length}/6
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Escuadrón activo para cacerías y simulación de daño
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Team Overview Stats */}
            <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">HP Base Total:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
                  {totalBaseHp}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Ataque / Sp.Atk:</span>
                <span className="font-mono font-bold text-amber-400 text-sm mt-0.5 block">
                  {totalBaseAtk} / {totalBaseSpAtk}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Elementos Cubiertos:</span>
                <span className="font-mono font-bold text-slate-200">{coveredTypes.length} tipos</span>
              </div>
            </div>

            {/* Element Badges */}
            {coveredTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {coveredTypes.map((type) => (
                  <span
                    key={type}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300"
                  >
                    {type}
                  </span>
                ))}
              </div>
            )}

            {/* Team List */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Miembros Seleccionados:
              </span>

              {team.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500 space-y-2">
                  <p>Aún no has agregado Pokémon a tu equipo.</p>
                  <p className="text-[11px] text-slate-600">
                    Navega a la <strong>Tier List</strong> y presiona el botón <span className="text-amber-400 font-bold">+</span> en hasta 6 especies oficiales.
                  </p>
                </div>
              ) : (
                team.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={getSprite(pokemon.id)}
                        alt={pokemon.name}
                        className="w-10 h-10 object-contain"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-slate-500">#{String(pokemon.id).padStart(3, '0')}</span>
                          <span className="font-bold text-xs text-white">{pokemon.name}</span>
                          <span className="text-[10px] font-mono font-bold text-amber-400 px-1 rounded bg-slate-800">
                            T{pokemon.tier}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                          <span>{pokemon.type1}</span>
                          {pokemon.type2 && <span>/ {pokemon.type2}</span>}
                          <span>· {pokemon.recommendedClan}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onLoadInCalculator(pokemon);
                          onClose();
                        }}
                        className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700 text-xs"
                        title="Optimizar EXP / Hora"
                      >
                        <Zap className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveFromTeam(pokemon.id)}
                        className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 text-xs"
                        title="Remover"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Drawer Footer */}
          {team.length > 0 && (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={onClearTeam}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                Vaciar Equipo
              </button>
              <button
                onClick={onClose}
                className="rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-black transition-colors"
              >
                Listo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
