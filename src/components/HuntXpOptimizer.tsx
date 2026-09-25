import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Zap,
  Swords,
  Trophy,
  Search,
  Filter,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Moon,
  Crosshair,
  Award,
  Layers,
  Heart,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Lock,
  Unlock,
  Info,
  MapPin,
  Shield,
  Coins,
  DollarSign
} from 'lucide-react';
import { POKEMON_TIER_DATA, OfficialPokemon } from '../data/pokemonTierData';
import { ITEMS_DATA } from '../data/itemsData';
import {
  calculateStat,
  calculatePower,
  calculateXpToNextLevel,
  getQualityBand,
  getAmplifiedMultiplier,
  QUALITY_BANDS,
  HUNTING_ZONES,
  HuntingZone,
  SPECIAL_TYPES,
  getPokemonGeneration,
  GENERATION_OPTIONS
} from '../data/calculatorHelpers';

interface HuntXpOptimizerProps {
  savedTeam?: OfficialPokemon[];
  initialPokemon?: OfficialPokemon | null;
  initialPlayerLevel?: number;
}

export type SortField =
  | 'xpPerHour'
  | 'elementalMultiplier'
  | 'timeToKill'
  | 'lowestDefense'
  | 'lowestHp'
  | 'lowestBulk'
  | 'xpPerKill'
  | 'wildLevel'
  | 'potionSafety'
  | 'netProfit';

export type SortDirection = 'asc' | 'desc';

const normalize = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Selector de Pokémon con búsqueda (igual que en la Calculadora de Poder) */
const SpeciesSelect: React.FC<{ value: number; onChange: (id: number) => void }> = ({ value, onChange }) => {
  const list = useMemo(() => [...POKEMON_TIER_DATA].sort((a, b) => a.id - b.id), []);
  const selected = list.find((p) => p.id === value) || list[0];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const results = useMemo(() => {
    const q = normalize(query.trim().replace(/^#/, ''));
    if (!q) return list;
    const starts: OfficialPokemon[] = [];
    const contains: OfficialPokemon[] = [];
    list.forEach((p) => {
      const n = normalize(p.name);
      if (n.startsWith(q) || String(p.id).startsWith(q)) starts.push(p);
      else if (n.includes(q)) contains.push(p);
    });
    return [...starts, ...contains];
  }, [query, list]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (open && activeRef.current) activeRef.current.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const choose = (p: OfficialPokemon) => {
    onChange(p.id);
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && results[active]) choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
      <input
        type="text"
        value={open ? query : `#${selected.id} ${selected.name}`}
        placeholder="Escribe el nombre del Pokémon..."
        onFocus={(e) => {
          setOpen(true);
          setQuery('');
          setActive(0);
          e.currentTarget.select();
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-8 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
      />
      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 shadow-xl">
          {results.length === 0 && <div className="px-3 py-2 text-xs text-slate-500">Sin resultados</div>}
          {results.map((p, i) => (
            <button
              key={p.id}
              type="button"
              ref={i === active ? activeRef : undefined}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(p)}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${
                i === active ? 'bg-amber-500/15 text-amber-200' : 'text-slate-300'
              } ${p.id === selected.id ? 'font-bold' : ''}`}
            >
              <span className="font-mono text-slate-500 w-9">#{p.id}</span>
              <span>{p.name}</span>
              <span className="ml-auto text-[10px] text-slate-500">{p.playerMetaTier}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const HuntXpOptimizer: React.FC<HuntXpOptimizerProps> = ({
  savedTeam = [],
  initialPokemon = null,
  initialPlayerLevel
}) => {
  // Attacker configuration (calibrated with user Typhlosion profile by default)
  const [selectedAttackerId, setSelectedAttackerId] = useState<number>(
    initialPokemon?.id || (savedTeam.length > 0 ? savedTeam[0].id : 157) // Default to Typhlosion
  );
  const [playerLevel, setPlayerLevel] = useState<number>(initialPlayerLevel || 20);
  const [playerTotalIv, setPlayerTotalIv] = useState<number>(129); // 0-192 (calibrado a 129)
  const [playerQuality, setPlayerQuality] = useState<number>(1.29); // Quality (calibrado a 1.29x)
  const [clanRank, setClanRank] = useState<number>(0); // Rank 0 (sin rango de clan)
  const [hasAoeBonus, setHasAoeBonus] = useState<boolean>(true); // Multi-target bonus
  const [isVipBonus, setIsVipBonus] = useState<boolean>(false); // Cuenta VIP: +50% EXP
  const [huntCadenceMode, setHuntCadenceMode] = useState<'real' | 'fast'>('real'); // 'real' = 5.5s delay cueva (~373/h), 'fast' = 1.3s teórico

  // Level Restriction Rule: Player level restricts hunts accessible
  const [restrictToPlayerLevel, setRestrictToPlayerLevel] = useState<boolean>(true);

  // Generation filter: Gen 1, Gen 2, Gen 3, Gen 4+
  // Default to Gen 1 and 2 only (the ones currently implemented on live server)
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([1, 2]);

  const toggleGeneration = (genId: number) => {
    setSelectedGenerations((prev) => {
      if (prev.includes(genId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== genId);
      } else {
        return [...prev, genId].sort((a, b) => a - b);
      }
    });
  };

  // Hunting Zone selector state (Zona de Caza)
  const [selectedHuntingZone, setSelectedHuntingZone] = useState<string>('ALL');

  // Expanded row ID for inspection
  const [expandedTargetId, setExpandedTargetId] = useState<number | null>(null);

  const attackerPokemon = useMemo(() => {
    return POKEMON_TIER_DATA.find((p) => p.id === selectedAttackerId) || POKEMON_TIER_DATA[0];
  }, [selectedAttackerId]);

  // Selected move & custom power
  const [selectedMoveName, setSelectedMoveName] = useState<string>('');
  const [customMovePower, setCustomMovePower] = useState<number>(50);
  const [selectedMoveType, setSelectedMoveType] = useState<string>(attackerPokemon.type1);

  // Available attacks learned by attacker
  const availableAttacks = useMemo(() => {
    const list = attackerPokemon.attacks || [];
    return [...list].sort((a, b) => a.learnLevel - b.learnLevel || b.power - a.power);
  }, [attackerPokemon]);

  // Active attack move being calculated
  const currentMove = useMemo(() => {
    if (selectedMoveName === 'custom') {
      return {
        name: 'Ataque Personalizado',
        type: selectedMoveType,
        power: customMovePower,
        learnLevel: 1,
        tm: null,
        isCustom: true
      };
    }
    const found = availableAttacks.find((a) => a.name === selectedMoveName);
    if (found) {
      return { ...found, isCustom: false };
    }
    // Auto-select smartest attack unlocked up to playerLevel:
    // If the attacker specializes in Special Attack (baseSpAtk > baseAtk),
    // prioritize Special moves (and STAB) so it exploits enemies with lower Def.Es.
    // If the attacker specializes in Physical Attack, prioritize Physical moves (and STAB).
    const isSpecialAttacker = attackerPokemon.baseSpAtk > attackerPokemon.baseAtk;
    const learned = availableAttacks.filter((a) => a.learnLevel <= playerLevel && a.power > 0 && !a.tm);
    const candidateList = learned.length > 0 ? learned : availableAttacks.filter((a) => a.power > 0 && !a.tm);

    if (candidateList.length > 0) {
      const sortedCandidates = [...candidateList].sort((a, b) => {
        const aIsSpecial = SPECIAL_TYPES.includes(a.type.toUpperCase());
        const bIsSpecial = SPECIAL_TYPES.includes(b.type.toUpperCase());

        const aHasStab = a.type.toUpperCase() === attackerPokemon.type1.toUpperCase() ||
          (attackerPokemon.type2 ? a.type.toUpperCase() === attackerPokemon.type2.toUpperCase() : false);
        const bHasStab = b.type.toUpperCase() === attackerPokemon.type1.toUpperCase() ||
          (attackerPokemon.type2 ? b.type.toUpperCase() === attackerPokemon.type2.toUpperCase() : false);

        // Effective offense scaling for move
        const aOffense = aIsSpecial ? attackerPokemon.baseSpAtk : attackerPokemon.baseAtk;
        const bOffense = bIsSpecial ? attackerPokemon.baseSpAtk : attackerPokemon.baseAtk;

        // Synergy bonus if move category matches attacker specialty
        const aSynergy = (isSpecialAttacker === aIsSpecial) ? 1.25 : 1.0;
        const bSynergy = (isSpecialAttacker === bIsSpecial) ? 1.25 : 1.0;

        const aScore = a.power * (aHasStab ? 1.5 : 1.0) * (aOffense / 100) * aSynergy;
        const bScore = b.power * (bHasStab ? 1.5 : 1.0) * (bOffense / 100) * bSynergy;

        return bScore - aScore;
      });
      return { ...sortedCandidates[0], isCustom: false };
    }
    return availableAttacks[0] || { name: 'Tackle', type: 'NORMAL', power: 40, learnLevel: 1, tm: null, isCustom: false };
  }, [selectedMoveName, availableAttacks, playerLevel, selectedMoveType, customMovePower, attackerPokemon]);

  // Sync if initialPokemon or initialPlayerLevel changes
  React.useEffect(() => {
    if (initialPokemon) {
      setSelectedAttackerId(initialPokemon.id);
      setSelectedMoveType(initialPokemon.type1);
      setSelectedMoveName('');
    }
  }, [initialPokemon]);

  React.useEffect(() => {
    if (initialPlayerLevel) {
      setPlayerLevel(initialPlayerLevel);
    }
  }, [initialPlayerLevel]);

  // Sync move when attacker changes
  const handleAttackerChange = (id: number) => {
    setSelectedAttackerId(id);
    setSelectedMoveName('');
    const mon = POKEMON_TIER_DATA.find((p) => p.id === id);
    if (mon) {
      setSelectedMoveType(mon.type1);
    }
  };

  // Filter & Search Controls for Hunt Targets
  const [huntRangeFilter, setHuntRangeFilter] = useState<string>('ALL');
  const [specificHuntLevel, setSpecificHuntLevel] = useState<string>('ALL');
  const [searchTarget, setSearchTarget] = useState<string>('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('ALL');

  // Tipo del Día: +20% XP y +20% loot en Pokémon de ese tipo (cambia cada 24h)
  const [dailyTypeBonus, setDailyTypeBonus] = useState<string>('NONE');

  // Sorting: Field & Direction (Ascending / Descending)
  const [sortBy, setSortBy] = useState<SortField>('xpPerHour');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [maxResults, setMaxResults] = useState<number>(30);

  const typesList = [
    'ALL', 'NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE',
    'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG',
    'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY'
  ];

  const dailyBonusTypes = [
    'NONE', 'NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE',
    'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG',
    'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY'
  ];

  const huntLevelsList = ['ALL', '1', '10', '20', '30', '40', '50', '60', '70', '80', '100', '120', '150', '200', '600'];

  // Handle column header clicks to toggle sort & direction
  const handleColumnSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      if (
        field === 'timeToKill' ||
        field === 'potionSafety' ||
        field === 'lowestDefense' ||
        field === 'lowestHp' ||
        field === 'lowestBulk'
      ) {
        // Menos tiempo, menos pociones, menor defensa/HP/bulk = más fácil de matar → empezar ascendente
        setSortDirection('asc');
      } else {
        setSortDirection('desc');
      }
    }
  };

  const playerStats = useMemo(() => {
    const statGrowth = playerTotalIv / 6;
    const clanBonusMultiplier = 1 + clanRank * 0.02;
    const pHp = calculateStat(attackerPokemon.baseHp, statGrowth, playerLevel, playerQuality);
    const pAtk = Math.round(calculateStat(attackerPokemon.baseAtk, statGrowth, playerLevel, playerQuality) * clanBonusMultiplier);
    const pDef = Math.round(calculateStat(attackerPokemon.baseDef, statGrowth, playerLevel, playerQuality) * clanBonusMultiplier);
    const pSpAtk = Math.round(calculateStat(attackerPokemon.baseSpAtk, statGrowth, playerLevel, playerQuality) * clanBonusMultiplier);
    const pSpDef = Math.round(calculateStat(attackerPokemon.baseSpDef, statGrowth, playerLevel, playerQuality) * clanBonusMultiplier);
    const pSpeed = calculateStat(attackerPokemon.baseSpeed, statGrowth, playerLevel, playerQuality);
    const power = calculatePower(pHp, pAtk, pDef, pSpAtk, pSpDef, pSpeed, playerQuality);
    return { pHp, pAtk, pDef, pSpAtk, pSpDef, pSpeed, power };
  }, [attackerPokemon, playerTotalIv, playerLevel, playerQuality, clanRank]);

  const xpToNextLevel = useMemo(() => calculateXpToNextLevel(playerLevel), [playerLevel]);

  const zones = useMemo(() => HUNTING_ZONES, []);

  const filteredPokemon = useMemo(() => {
    const q = normalize(searchTarget.trim());
    return POKEMON_TIER_DATA.filter((p) => {
      const matchesGeneration = selectedGenerations.includes(getPokemonGeneration(p.id));
      const matchesZone = selectedHuntingZone === 'ALL' || p.huntingZone === selectedHuntingZone;
      const matchesType = targetTypeFilter === 'ALL' || p.type1 === targetTypeFilter || p.type2 === targetTypeFilter;
      const matchesSearch = !q || normalize(p.name).includes(q) || String(p.id).includes(q);
      const matchesLevel = specificHuntLevel === 'ALL' || String(p.level) === specificHuntLevel;
      const matchesRange = huntRangeFilter === 'ALL' || p.huntRange === huntRangeFilter;
      const matchesPlayerLevel = !restrictToPlayerLevel || p.level <= playerLevel;
      return matchesGeneration && matchesZone && matchesType && matchesSearch && matchesLevel && matchesRange && matchesPlayerLevel;
    });
  }, [searchTarget, selectedGenerations, selectedHuntingZone, targetTypeFilter, specificHuntLevel, huntRangeFilter, restrictToPlayerLevel, playerLevel]);

  const rankedPokemon = useMemo(() => {
    const rows = filteredPokemon.map((target) => {
      const defense = target.baseDef;
      const hp = target.baseHp;
      const bulk = hp * defense;
      const xpPerKill = target.experience * (isVipBonus ? 1.5 : 1) * (dailyTypeBonus !== 'NONE' && (target.type1 === dailyTypeBonus || target.type2 === dailyTypeBonus) ? 1.2 : 1) * 0.9950338876;
      const elementalMultiplier = currentMove.type === target.weakness ? 2 : 1;
      const damage = Math.max(1, Math.round(currentMove.power * elementalMultiplier * (attackerPokemon.baseAtk > attackerPokemon.baseSpAtk ? playerStats.pAtk : playerStats.pSpAtk) / Math.max(1, defense)));
      const timeToKill = Math.max(1, Math.ceil(hp / damage));
      const xpPerHour = xpPerKill * 3600 / (timeToKill * (huntCadenceMode === 'real' ? 8.7672688629 : 1.3));
      const potionSafety = Math.max(0, Math.round(100 - timeToKill * 2));
      const netProfit = xpPerHour - timeToKill;
      return { ...target, xpPerKill, elementalMultiplier, timeToKill, xpPerHour, potionSafety, netProfit, lowestDefense: defense, lowestHp: hp, lowestBulk: bulk };
    });
    return [...rows].sort((a, b) => {
      const av = a[sortBy] as number;
      const bv = b[sortBy] as number;
      return sortDirection === 'asc' ? av - bv : bv - av;
    }).slice(0, maxResults);
  }, [filteredPokemon, isVipBonus, dailyTypeBonus, currentMove, attackerPokemon, playerStats, huntCadenceMode, sortBy, sortDirection, maxResults]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-slate-400 font-medium text-xs">Pokémon atacante</label>
            <span className="text-xs text-slate-500">{attackerPokemon.name}</span>
          </div>
          <SpeciesSelect value={selectedAttackerId} onChange={handleAttackerChange} />
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
          <div className="flex items-center justify-between"><label className="text-slate-400 font-medium text-xs">Nivel</label><span className="font-mono text-white font-bold text-xs">{playerLevel}</span></div>
          <input type="range" min="1" max="600" step={1} value={playerLevel} onChange={(e) => setPlayerLevel(Number(e.target.value))} className="w-full accent-amber-500" />
        </div>
      </div>

      {/* Quality & Clan */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-slate-400 font-medium text-xs">Calidad (Quality)</label>
          <span className="font-mono text-white font-bold text-xs">
            {playerQuality.toFixed(2)}x · {getQualityBand(playerQuality).name} ({getQualityBand(playerQuality).rangeLabel})
          </span>
        </div>
        <input
          type="range"
          min="0.8"
          max="4.5"
          step="0.01"
          value={playerQuality}
          onChange={(e) => setPlayerQuality(Number(e.target.value))}
          className="w-full accent-amber-500"
        />
      </div>
    </div>
  );
};
