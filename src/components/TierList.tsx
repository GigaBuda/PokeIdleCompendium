import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Check,
  Swords,
  Trophy,
  Users,
  Server,
  Shield,
  Zap,
  Sparkles,
  ExternalLink,
  Flame,
  Crosshair,
  ArrowRight,
  Activity,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { POKEMON_TIER_DATA, OfficialPokemon } from '../data/pokemonTierData';
import {
  QUALITY_BANDS,
  getQualityBand
} from '../data/calculatorHelpers';
import { TierListLv1 } from './TierListLv1';

interface TierListProps {
  onSelectForCalculator?: (pokemon: OfficialPokemon, level?: number) => void;
  onSelectForHuntOptimizer: (pokemon: OfficialPokemon, level?: number) => void;
  savedTeam: OfficialPokemon[];
  onToggleTeamMember: (pokemon: OfficialPokemon) => void;
}

export const TierList: React.FC<TierListProps> = ({
  onSelectForCalculator,
  onSelectForHuntOptimizer,
  savedTeam,
  onToggleTeamMember,
}) => {
  const [tierListMode, setTierListMode] = useState<'playerMeta' | 'serverRaw' | 'level1Strongest'>('playerMeta');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'tier' | 'statScore' | 'totalStats' | 'quality' | 'baseHp' | 'baseAtk' | 'baseDef' | 'baseSpAtk' | 'baseSpDef' | 'baseSpeed'
  >('tier');
  const [selectedQualityBand, setSelectedQualityBand] = useState<string>('ALL');
  const [showQualityModal, setShowQualityModal] = useState<boolean>(false);
  const [showSpeedInfo, setShowSpeedInfo] = useState<boolean>(false);
  const [activeModalPokemon, setActiveModalPokemon] = useState<OfficialPokemon | null>(null);

  const playerMetaTiers = ['ALL', 'S+', 'S', 'A', 'B', 'C', 'D'];
  const serverTiers = ['ALL', 'S', 'A', 'B', 'C', 'D', 'E'];
  const activeTiersList = tierListMode === 'playerMeta' ? playerMetaTiers : serverTiers;

  const types = [
    'ALL', 'NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE',
    'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG',
    'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY'
  ];

  const metaTierOrder: Record<string, number> = { 'S+': 1, S: 2, A: 3, B: 4, C: 5, D: 6 };
  const serverTierOrder: Record<string, number> = { S: 1, A: 2, B: 3, C: 4, D: 5, E: 6 };

  const filteredPokemon = useMemo(() => {
    return POKEMON_TIER_DATA.filter((p) => {
      const currentTier = tierListMode === 'playerMeta' ? p.playerMetaTier : p.serverTier;
      const matchesTier = selectedTier === 'ALL' || currentTier === selectedTier;
      const matchesType = selectedType === 'ALL' || p.type1.toUpperCase() === selectedType || p.type2?.toUpperCase() === selectedType;
      const matchesQuality = selectedQualityBand === 'ALL' || getQualityBand(p.qualityMult).name === selectedQualityBand;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.type1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.type2 && p.type2.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTier && matchesType && matchesQuality && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'tier') {
        const orderMap = tierListMode === 'playerMeta' ? metaTierOrder : serverTierOrder;
        const tierA = tierListMode === 'playerMeta' ? a.playerMetaTier : a.serverTier;
        const tierB = tierListMode === 'playerMeta' ? b.playerMetaTier : b.serverTier;
        const diff = (orderMap[tierA] || 99) - (orderMap[tierB] || 99);
        if (diff !== 0) return diff;
        return tierListMode === 'playerMeta' ? b.statScore - a.statScore : b.totalStats - a.totalStats;
      }
      if (sortBy === 'statScore') return b.statScore - a.statScore;
      if (sortBy === 'totalStats') return b.totalStats - a.totalStats;
      if (sortBy === 'quality') return b.qualityMult - a.qualityMult;
      if (sortBy === 'baseHp') return b.baseHp - a.baseHp;
      if (sortBy === 'baseAtk') return b.baseAtk - a.baseAtk;
      if (sortBy === 'baseDef') return b.baseDef - a.baseDef;
      if (sortBy === 'baseSpAtk') return b.baseSpAtk - a.baseSpAtk;
      if (sortBy === 'baseSpDef') return b.baseSpDef - a.baseSpDef;
      if (sortBy === 'baseSpeed') return b.baseSpeed - a.baseSpeed;
      return 0;
    });
  }, [selectedTier, selectedType, selectedQualityBand, searchQuery, sortBy, tierListMode]);

  const getQualityBadgeStyle = (quality: number) => {
    const band = getQualityBand(quality);
    switch (band.name) {
      case 'Divina':
        return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40';
      case 'Anciana':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Mítica':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Legendaria':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
      case 'Épica':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Rara':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Poco común':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'S+':
        return 'bg-amber-400 text-black border-amber-300 font-extrabold shadow-sm';
      case 'S':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
      case 'A':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold';
      case 'B':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-semibold';
      case 'C':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'D':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-stone-900 text-stone-500 border-stone-800';
    }
  };

  const getTypeBadgeStyle = (type: string) => {
    const colors: Record<string, string> = {
      FIRE: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      WATER: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      GRASS: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      ELECTRIC: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      ICE: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      FIGHTING: 'bg-red-500/20 text-red-300 border-red-500/30',
      POISON: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      GROUND: 'bg-amber-600/20 text-amber-300 border-amber-600/30',
      FLYING: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      PSYCHIC: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      BUG: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
      ROCK: 'bg-stone-600/20 text-stone-300 border-stone-500/30',
      GHOST: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      DRAGON: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      DARK: 'bg-neutral-600/20 text-neutral-300 border-neutral-500/30',
      STEEL: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
      FAIRY: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      NORMAL: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    };
    return colors[type.toUpperCase()] || 'bg-slate-800 text-slate-400 border-slate-700';
  };

  const getPokemonSprite = (id: number) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  };

  return (
    <div className="space-y-5">
      {/* Clean Control Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Tier List
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {tierListMode === 'playerMeta'
                ? 'Rendimiento estadístico real: Bulk anti-daño ×1.8, DPS, AoE y Calidad farmable.'
                : tierListMode === 'level1Strongest'
                ? 'Mejor ataque disponible de cada Pokémon a Lv. 1 (poder × STAB × ataque base).'
                : 'Clasificación nativa por suma de estadísticas base en creatures.json.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              onClick={() => setShowQualityModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all shadow-sm"
              title="Ver sistema oficial de calidades de poke.idleworld.online"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Sistema de Calidades</span>
            </button>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
              <button
                onClick={() => {
                  setTierListMode('playerMeta');
                  setSelectedTier('ALL');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  tierListMode === 'playerMeta'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Meta Jugadores</span>
              </button>

              <button
                onClick={() => {
                  setTierListMode('level1Strongest');
                  setSelectedTier('ALL');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  tierListMode === 'level1Strongest'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>Pokémon más fuertes Lv.1</span>
              </button>

              <button
                onClick={() => {
                  setTierListMode('serverRaw');
                  setSelectedTier('ALL');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  tierListMode === 'serverRaw'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server className="h-3.5 w-3.5" />
                <span>Servidor Raw</span>
              </button>
            </div>
          </div>
        </div>

        {/* Level 1 Damage Specialized Toolbar OR Standard Filter Controls */}
        {tierListMode === 'level1Strongest' ? null : (
          /* Standard Player Meta / Server Raw Controls */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-3 border-t border-slate-800 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar Pokémon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Tier Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {activeTiersList.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTier(t)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors shrink-0 ${
                    selectedTier === t
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500/60"
              >
                {types.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp === 'ALL' ? 'Todos los tipos' : tp}
                  </option>
                ))}
              </select>
            </div>

            {/* Quality Band Filter */}
            <div>
              <select
                value={selectedQualityBand}
                onChange={(e) => setSelectedQualityBand(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500/60"
              >
                <option value="ALL">Todas las Calidades</option>
                <option value="Divina">Divina (4.0+)</option>
                <option value="Anciana">Anciana (3.0–4.0)</option>
                <option value="Mítica">Mítica (2.0–3.0 · ej. 2.40x)</option>
                <option value="Legendaria">Legendaria (1.7–2.0 · Top Salvaje)</option>
                <option value="Épica">Épica (1.5–1.7)</option>
                <option value="Rara">Rara (1.3–1.5)</option>
                <option value="Poco común">Poco común (1.1–1.3)</option>
                <option value="Común">Común (1.0–1.1)</option>
                <option value="Débil">Débil (&lt; 1.0)</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500/60"
              >
                <option value="tier">Por Tier</option>
                {tierListMode === 'playerMeta' && <option value="statScore">Score de Combate</option>}
                <option value="quality">Calidad Base Meta</option>
                <option value="totalStats">Total Stats Base (BST)</option>
                <option value="baseHp">Puntos de Salud (HP)</option>
                <option value="baseAtk">Ataque Físico (ATK)</option>
                <option value="baseSpAtk">Ataque Especial (SP.ATK)</option>
                <option value="baseDef">Defensa Física (DEF)</option>
                <option value="baseSpDef">Defensa Especial (SP.DEF)</option>
                <option value="baseSpeed">Velocidad (VEL)</option>
              </select>
            </div>
          </div>
        )}

        {/* Speed & Mechanics Info Banner */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>¿Cómo funciona la Velocidad (VEL)?</strong> Afecta <em>al caminar</em> (movimiento entre casillas del hunt) y <em>al atacar</em> (cadencia e intervalo de golpes).
            </span>
          </div>
          <button
            onClick={() => setShowSpeedInfo(!showSpeedInfo)}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-medium underline self-start sm:self-auto"
          >
            {showSpeedInfo ? 'Ocultar detalles' : 'Ver impacto en stats'}
          </button>
        </div>

        {showSpeedInfo && (
          <div className="p-3 rounded-lg bg-slate-900/90 border border-amber-500/20 text-xs text-slate-300 space-y-2 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-amber-300 block mb-0.5">1. Al Caminar (Tiles):</span>
                <span>Determina el retraso en milisegundos entre casillas. Mayor VEL = el Pokémon corre hacia los grupos de monstruos más rápido.</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-amber-300 block mb-0.5">2. Al Atacar (Cadencia):</span>
                <span>Reduce el cooldown mínimo entre auto-ataques básicos, encadenando golpes con mayor frecuencia entre recargas de habilidades.</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-amber-300 block mb-0.5">3. En el Power Global:</span>
                <span>Suma 1:1 junto al resto de stats en la fórmula oficial: <code className="text-amber-400 font-mono">Power = (HP+Atk+Def+SpAtk+SpDef+Vel) × Calidad</code>.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Level 1 Damage Leaderboard View OR Standard Grid of Pokemon Cards */}
      {tierListMode === 'level1Strongest' ? (
        <TierListLv1 />
      ) : (
        /* Standard Grid of Pokemon Cards */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPokemon.slice(0, 90).map((pokemon) => {
              const isInTeam = savedTeam.some((m) => m.id === pokemon.id);
              const displayTier = tierListMode === 'playerMeta' ? pokemon.playerMetaTier : pokemon.serverTier;

              return (
                <div
                  key={pokemon.id}
                  onClick={() => setActiveModalPokemon(pokemon)}
                  className="rounded-xl border border-slate-800/80 bg-[#0d1017] hover:border-slate-700 p-3.5 flex flex-col justify-between transition-colors cursor-pointer group"
                >
                  <div>
                    {/* Header: Tier + ShortTag + Score/BST + ID */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs border ${getTierBadgeStyle(displayTier)}`}>
                          Tier {displayTier}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {pokemon.shortTag}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                          {tierListMode === 'playerMeta' ? `Score ${pokemon.statScore}` : `BST ${pokemon.totalStats}`}
                        </span>
                      </div>

                      <span className="font-mono text-[11px] text-slate-500 shrink-0">#{String(pokemon.id).padStart(3, '0')}</span>
                    </div>

                    {/* Sprite + Info */}
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="w-13 h-13 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shrink-0 group-hover:border-slate-700">
                        <img
                          src={getPokemonSprite(pokemon.id)}
                          alt={pokemon.name}
                          className="w-12 h-12 object-contain"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-400 truncate">
                          {pokemon.name}
                        </h3>

                        <div className="mt-1 flex items-center gap-1 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded font-bold border ${getTypeBadgeStyle(pokemon.type1)}`}>
                            {pokemon.type1}
                          </span>
                          {pokemon.type2 && (
                            <span className={`px-1.5 py-0.5 rounded font-bold border ${getTypeBadgeStyle(pokemon.type2)}`}>
                              {pokemon.type2}
                            </span>
                          )}
                          <span className="text-slate-500 font-mono ml-auto">Nv.{pokemon.huntLevel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Bar (6 stats completos: HP, ATK, DEF, SP.ATK, SP.DEF, VEL) */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-6 gap-1 text-center font-mono text-[10px]">
                      <div className="bg-slate-900/80 rounded py-1">
                        <span className="text-slate-500 block text-[9px]">HP</span>
                        <span className="text-slate-200 font-bold">{pokemon.baseHp}</span>
                      </div>
                      <div className={`rounded py-1 ${pokemon.baseAtk >= 110 ? 'bg-amber-950/40 text-amber-300 font-bold border border-amber-800/30' : 'bg-slate-900/80 text-slate-200'}`}>
                        <span className="text-slate-500 block text-[9px]">ATK</span>
                        <span className="font-bold">{pokemon.baseAtk}</span>
                      </div>
                      <div className={`rounded py-1 ${pokemon.baseDef >= 110 ? 'bg-emerald-950/40 text-emerald-300 font-bold border border-emerald-800/30' : 'bg-slate-900/80 text-slate-200'}`}>
                        <span className="text-slate-500 block text-[9px]">DEF</span>
                        <span className="font-bold">{pokemon.baseDef}</span>
                      </div>
                      <div className={`rounded py-1 ${pokemon.baseSpAtk >= 110 ? 'bg-purple-950/40 text-purple-300 font-bold border border-purple-800/30' : 'bg-slate-900/80 text-slate-200'}`}>
                        <span className="text-slate-500 block text-[9px]">SP.ATK</span>
                        <span className="font-bold">{pokemon.baseSpAtk}</span>
                      </div>
                      <div className={`rounded py-1 ${pokemon.baseSpDef >= 110 ? 'bg-blue-950/40 text-blue-300 font-bold border border-blue-800/30' : 'bg-slate-900/80 text-slate-200'}`}>
                        <span className="text-slate-500 block text-[9px]">SP.DEF</span>
                        <span className="font-bold">{pokemon.baseSpDef}</span>
                      </div>
                      <div className={`rounded py-1 ${pokemon.baseSpeed >= 100 ? 'bg-cyan-950/40 text-cyan-300 font-bold border border-cyan-800/30' : 'bg-slate-900/80 text-slate-200'}`}>
                        <span className="text-slate-500 block text-[9px]">VEL</span>
                        <span className="font-bold">{pokemon.baseSpeed}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Clan, Quality & Actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span className="text-[10px] text-slate-400 truncate max-w-[95px]" title={`Clan recomendado: ${pokemon.recommendedClan}`}>
                        {pokemon.recommendedClan}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border ${getQualityBadgeStyle(pokemon.qualityMult)}`}
                        title={`Calidad de referencia meta: ${pokemon.qualityMult}x (${getQualityBand(pokemon.qualityMult).name})`}
                      >
                        {pokemon.qualityMult.toFixed(2)}x · {getQualityBand(pokemon.qualityMult).name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectForHuntOptimizer(pokemon)}
                        className="p-1 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 text-amber-400 transition-colors"
                        title="Optimizar EXP / Hora en Hunts"
                      >
                        <Zap className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => onToggleTeamMember(pokemon)}
                        className={`p-1 rounded border transition-colors ${
                          isInTeam
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                            : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title={isInTeam ? 'En tu equipo' : 'Añadir al equipo'}
                      >
                        {isInTeam ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPokemon.length > 90 && (
            <div className="text-center py-3 text-xs text-slate-500">
              Mostrando 90 de {filteredPokemon.length} Pokémon. Usa los filtros para afinar la búsqueda.
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {activeModalPokemon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-[#0d1017] p-5 shadow-xl text-slate-200 max-h-[85vh] overflow-y-auto space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shrink-0">
                  <img
                    src={getPokemonSprite(activeModalPokemon.id)}
                    alt={activeModalPokemon.name}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs border ${getTierBadgeStyle(activeModalPokemon.playerMetaTier)}`}>
                      Meta: {activeModalPokemon.playerMetaTier}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-900 border border-slate-800 font-mono text-slate-400">
                      Servidor: {activeModalPokemon.serverTier}
                    </span>
                    <span className="font-mono text-xs text-slate-500">#{String(activeModalPokemon.id).padStart(3, '0')}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-0.5">{activeModalPokemon.name}</h2>
                </div>
              </div>

              <button
                onClick={() => setActiveModalPokemon(null)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Metrics Table */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">HP</span>
                <span className="font-bold text-white">{activeModalPokemon.baseHp}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">ATK</span>
                <span className="font-bold text-white">{activeModalPokemon.baseAtk}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">DEF</span>
                <span className="font-bold text-white">{activeModalPokemon.baseDef}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">SP.ATK</span>
                <span className="font-bold text-white">{activeModalPokemon.baseSpAtk}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">SP.DEF</span>
                <span className="font-bold text-white">{activeModalPokemon.baseSpDef}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">VEL</span>
                <span className="font-bold text-white">{activeModalPokemon.baseSpeed}</span>
              </div>
            </div>

            {/* Key stats summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Score Combate</span>
                <span className="font-bold text-amber-400">{activeModalPokemon.statScore}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Bulk Efectivo</span>
                <span className="font-bold text-emerald-400">{activeModalPokemon.bulk}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">DPS Base</span>
                <span className="font-bold text-cyan-400">{activeModalPokemon.dps}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Calidad Meta</span>
                <span className="font-bold text-white flex items-center gap-1">
                  {activeModalPokemon.qualityMult.toFixed(2)}x
                  <span className={`text-[9px] px-1 py-0.2 rounded border ${getQualityBadgeStyle(activeModalPokemon.qualityMult)}`}>
                    {getQualityBand(activeModalPokemon.qualityMult).name}
                  </span>
                </span>
              </div>
            </div>

            {/* Attacks List */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Ataques Oficiales ({activeModalPokemon.attacks.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                {activeModalPokemon.attacks.map((att, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-200 font-semibold">{att.name}</span>
                      <span className="text-[10px] text-slate-500 block">Nv.{att.learnLevel} {att.tm && `· TM ${att.tm}`}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-amber-400 font-bold">{att.power} Pot.</span>
                      <span className={`text-[9px] px-1 py-0.5 rounded ml-1 font-bold border ${getTypeBadgeStyle(att.type)}`}>
                        {att.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <button
                onClick={() => {
                  onSelectForHuntOptimizer(activeModalPokemon);
                  setActiveModalPokemon(null);
                }}
                className="rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-black flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Zap className="h-4 w-4" />
                <span>Optimizar EXP / Hora</span>
              </button>

              <button
                onClick={() => setActiveModalPokemon(null)}
                className="rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quality System Modal (pokepedia/systems/quality) */}
      {showQualityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-[#0d1017] p-5 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Sistema Oficial de Calidad (Quality)
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Documentación y rangos oficiales sincronizados con la Poképedia del juego.
                </p>
              </div>
              <button
                onClick={() => setShowQualityModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Official Link Badge */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-300">
                Fuente oficial del sistema: <span className="text-amber-400 font-mono">pokepedia/systems/quality</span>
              </span>
              <a
                href="https://poke.idleworld.online/pokepedia/systems/quality"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold underline self-start sm:self-auto"
              >
                <span>Abrir en Poképedia</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Formulas & Double Multiplier Explanation */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>¿Cómo funciona la Calidad y por qué pesa más que los IVs?</span>
              </h4>
              <p className="text-slate-300 leading-relaxed">
                A diferencia de los juegos tradicionales, en <em>poke.idleworld.online</em> la Calidad es un multiplicador global que entra <strong>dos veces</strong> en los cálculos de poder:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">1. En cada Estadística individual:</span>
                  <p className="text-slate-300">
                    Stat = round((Base + 2 × (IV/6)) × Nivel/100 × Calidad)
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">2. En el Power global:</span>
                  <p className="text-slate-300">
                    Power = (HP + ATK + DEF + SP.ATK + SP.DEF + VEL) × Calidad
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
                💡 <strong>Regla de oro:</strong> Un Pokémon con <strong>Calidad Legendaria (1.70x+)</strong> y con IVs promedio (ej. 80/192) supera en combate real a un Pokémon con <strong>Calidad Común (1.10x)</strong> que tenga 192/192 de IVs. La Calidad es inmutable (no cambia al evolucionar).
              </p>
            </div>

            {/* Quality Bands Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Tabla Oficial del Sistema de Calidades (Poképedia)</h4>
                <span className="text-[11px] text-amber-400 font-mono">pokepedia/systems/quality</span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-300 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-2.5 font-bold tracking-wider text-amber-400">CALIDAD</th>
                      <th className="p-2.5 font-bold tracking-wider text-slate-300">ETIQUETA</th>
                      <th className="p-2.5 font-bold tracking-wider text-slate-300">ORIGEN</th>
                      <th className="p-2.5 font-bold tracking-wider text-slate-300">IMPACTO EN COMBATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                    {QUALITY_BANDS.map((band, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-2.5 font-mono font-bold text-slate-200">
                          {band.rangeLabel}
                        </td>
                        <td className="p-2.5 font-sans font-semibold">
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${getQualityBadgeStyle(band.min + 0.05)}`}>
                            {band.name}
                          </span>
                        </td>
                        <td className="p-2.5">
                          {band.isWild ? (
                            <span className="text-emerald-400 font-sans text-[11px] font-medium">Captura Salvaje</span>
                          ) : (
                            <span className="text-purple-400 font-sans text-[11px] font-medium">Cría / Shinies</span>
                          )}
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-400 font-sans">
                          {band.name === 'Divina'
                            ? 'Techo supremo absoluto (4.0+). Potencial destructivo inigualable reservado a Shinies perfectos.'
                            : band.name === 'Anciana'
                            ? 'Calidad celestial (3.0–4.0). Multiplica de forma brutal el Power del Pokémon.'
                            : band.name === 'Mítica'
                            ? 'Gran salto de tier (2.0–3.0, ej. 2.40x meta base). Duplica con creces la efectividad sobre capturas salvajes.'
                            : band.name === 'Legendaria'
                            ? 'Tope máximo de calidad obtenible en estado salvaje (1.7–2.0).'
                            : band.name === 'Épica'
                            ? 'Excelente calidad para superar gimnasios y farmear hunts de alto nivel (1.5–1.7).'
                            : band.name === 'Rara'
                            ? 'Calidad competitiva muy sólida para progresión media (1.3–1.5).'
                            : band.name === 'Poco común'
                            ? 'Ligeramente superior al promedio estándar (1.1–1.3).'
                            : band.name === 'Común'
                            ? 'Estándar base del ecosistema salvaje (1.0–1.1).'
                            : 'Pokémon con estadísticas mermadas por debajo de la norma (< 1.0).'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Close */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowQualityModal(false)}
                className="rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-1.5 text-xs font-bold text-black transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
