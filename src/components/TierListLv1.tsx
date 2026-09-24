import React, { useMemo, useState } from 'react';
import { Search, Flame, Sparkles, Info } from 'lucide-react';
import { POKEMON_TIER_DATA as ALL_POKEMON, OfficialPokemon } from '../data/pokemonTierData';
import { getPokemonGeneration } from '../data/calculatorHelpers';

// De momento el servidor solo tiene la 1ª y 2ª generación
const POKEMON_TIER_DATA = ALL_POKEMON.filter((p) => getPokemonGeneration(p.id) <= 2);

/**
 * Tier List de daño a Nivel 1.
 * Para cada Pokémon se toma su mejor ataque disponible a Lv.1 (learnLevel <= 1, con poder > 0).
 * Índice de daño = poder × STAB (x1.5) × ataque ofensivo base (mejor entre Atk y Atk. Esp.) + 2×crecimiento.
 * A Lv.1 el nivel y la calidad son iguales para todos, así que el ranking depende solo de esos tres factores.
 */

const GROWTH = 15;
const TIERS = [
  { key: 'S+', min: 97, color: 'text-fuchsia-300 bg-fuchsia-500/15 border-fuchsia-500/40' },
  { key: 'S', min: 90, color: 'text-rose-300 bg-rose-500/15 border-rose-500/40' },
  { key: 'A', min: 80, color: 'text-amber-300 bg-amber-500/15 border-amber-500/40' },
  { key: 'B', min: 65, color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40' },
  { key: 'C', min: 40, color: 'text-sky-300 bg-sky-500/15 border-sky-500/40' },
  { key: 'D', min: 0, color: 'text-slate-300 bg-slate-500/15 border-slate-500/40' },
];

const TYPES = [
  'ALL', 'NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE', 'FIGHTING', 'POISON', 'GROUND',
  'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY',
];

interface Entry {
  pokemon: OfficialPokemon;
  moveName: string;
  moveType: string;
  power: number;
  isDisk: boolean;
  stab: boolean;
  offense: number;
  raw: number;
  others: { name: string; power: number; stab: boolean; isDisk: boolean }[];
  index: number;
  tier: string;
}

const spriteUrl = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

export const TierListLv1: React.FC = () => {
  const [includeDisks, setIncludeDisks] = useState(true);
  const [onlyStab, setOnlyStab] = useState(false);
  const [criterion, setCriterion] = useState<'withStat' | 'powerOnly'>('withStat');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const LIMIT = 30;

  // Todos los Pokémon con su mejor golpe a Lv.1 (el tier se calcula sobre el conjunto completo)
  const entries = useMemo<Entry[]>(() => {
    const list: Omit<Entry, 'index' | 'tier'>[] = [];
    POKEMON_TIER_DATA.forEach((p) => {
      const offense = Math.max(p.baseAtk, p.baseSpAtk) + 2 * GROWTH;
      const moves = p.attacks
        .filter((a) => a.learnLevel <= 1 && a.power > 0 && (includeDisks || !a.tm))
        .map((a) => {
          const stab = a.type === p.type1 || a.type === p.type2;
          const movePower = a.power * (stab ? 1.5 : 1);
          // 'withStat': poder × STAB × ataque base. 'powerOnly': solo poder × STAB (el ataque base solo desempata)
          const raw = criterion === 'withStat' ? movePower * offense : movePower * 1000 + offense;
          return { a, stab, movePower, raw };
        })
        .sort((x, y) => y.raw - x.raw);
      if (moves.length === 0) return;
      const b = moves[0];
      list.push({
        pokemon: p,
        moveName: b.a.name,
        moveType: b.a.type,
        power: b.a.power,
        isDisk: !!b.a.tm,
        stab: b.stab,
        offense,
        raw: b.raw,
        others: moves
          .slice(1, 3)
          .map((m) => ({ name: m.a.name, power: m.a.power, stab: m.stab, isDisk: !!m.a.tm })),
      });
    });
    const top = Math.max(1, ...list.map((e) => e.raw));
    return list
      .map((e) => {
        const index = (e.raw / top) * 100;
        const tier = TIERS.find((t) => index >= t.min)!.key;
        return { ...e, index, tier };
      })
      .sort((a, b) => b.raw - a.raw || a.pokemon.name.localeCompare(b.pokemon.name));
  }, [includeDisks, criterion]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (onlyStab && !e.stab) return false;
      if (tierFilter !== 'ALL' && e.tier !== tierFilter) return false;
      if (typeFilter !== 'ALL' && e.pokemon.type1 !== typeFilter && e.pokemon.type2 !== typeFilter) return false;
      if (q && !e.pokemon.name.toLowerCase().includes(q) && !e.moveName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [entries, onlyStab, tierFilter, typeFilter, query]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Flame className="h-6 w-6 text-amber-500" />
          Tier List de Daño a Nivel 1
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Cada Pokémon con su mejor ataque disponible a Lv. 1. El daño combina el poder del golpe, el bonus STAB
          (×1.5 si coincide con su tipo) y su ataque base. Los discos TM traen golpes en área de poder 600, por eso
          dominan la lista.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar Pokémon o ataque..."
            className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-8 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="ALL">Todos los tiers</option>
          {TIERS.map((t) => (
            <option key={t.key} value={t.key}>Tier {t.key}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>{t === 'ALL' ? 'Todos los tipos' : t}</option>
          ))}
        </select>
        <select
          value={criterion}
          onChange={(e) => setCriterion(e.target.value as 'withStat' | 'powerOnly')}
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          title="Cómo se calcula el índice de daño"
        >
          <option value="withStat">Índice: poder × STAB × ataque base</option>
          <option value="powerOnly">Índice: solo poder × STAB (mejor golpe)</option>
        </select>
        <div className="flex items-center gap-4 text-xs text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includeDisks} onChange={(e) => setIncludeDisks(e.target.checked)} className="accent-amber-500" />
            Incluir discos TM
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={onlyStab} onChange={(e) => setOnlyStab(e.target.checked)} className="accent-amber-500" />
            Solo STAB
          </label>
        </div>
      </div>

      {visible.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
          No hay Pokémon con esos filtros.
        </div>
      )}

      {TIERS.map((tier) => {
        const fullGroup = visible.filter((e) => e.tier === tier.key);
        if (fullGroup.length === 0) return null;
        const group = expanded[tier.key] ? fullGroup : fullGroup.slice(0, LIMIT);
        return (
          <section key={tier.key} className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-800">
              <span className={`px-2.5 py-0.5 rounded-md border font-mono font-bold text-sm ${tier.color}`}>{tier.key}</span>
              <span className="text-xs text-slate-400">
                {fullGroup.length} Pokémon · índice ≥ {tier.min}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px bg-slate-800/60">
              {group.map((e) => (
                <div key={e.pokemon.id} className="flex items-center gap-3 bg-[#0d1017] px-3 py-2.5">
                  <img
                    src={spriteUrl(e.pokemon.id)}
                    alt=""
                    loading="lazy"
                    className="h-10 w-10 shrink-0 [image-rendering:pixelated]"
                    onError={(ev) => ((ev.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-white truncate">{e.pokemon.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {e.pokemon.type1}{e.pokemon.type2 ? `/${e.pokemon.type2}` : ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 mt-0.5 text-[10px]">
                      <span className="text-slate-300 truncate">{e.moveName}</span>
                      <span className="px-1 rounded bg-slate-800 text-slate-300 font-mono">{e.moveType}</span>
                      <span className="px-1 rounded bg-slate-800 text-amber-300 font-mono">P{e.power}</span>
                      {e.stab && <span className="px-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">STAB</span>}
                      {e.isDisk && (
                        <span className="inline-flex items-center gap-0.5 px-1 rounded bg-sky-500/20 text-sky-300 font-bold">
                          <Sparkles className="h-2.5 w-2.5" />TM
                        </span>
                      )}
                    </div>
                    {e.others.length > 0 && (
                      <div className="mt-0.5 text-[10px] text-slate-500 truncate">
                        También a Lv.1:{' '}
                        {e.others.map((o) => `${o.name} P${o.power}${o.stab ? ' (STAB)' : ''}`).join(' · ')}
                      </div>
                    )}
                    <div className="mt-1.5 h-1 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${e.index}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono font-bold text-amber-400">{e.index.toFixed(0)}</div>
                    <div className="text-[9px] text-slate-500">ATK {e.offense}</div>
                  </div>
                </div>
              ))}
            </div>
            {fullGroup.length > LIMIT && (
              <button
                type="button"
                onClick={() => setExpanded((x) => ({ ...x, [tier.key]: !x[tier.key] }))}
                className="w-full py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 border-t border-slate-800"
              >
                {expanded[tier.key] ? 'Ver menos' : `Ver los ${fullGroup.length - LIMIT} restantes`}
              </button>
            )}
          </section>
        );
      })}

      <div className="flex items-start gap-2 text-[11px] text-slate-500 max-w-3xl">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <p>
          El índice es relativo (100 = el mejor de la lista). Usa el mejor entre Atk y Atk. Esp. de cada Pokémon y
          no distingue si el golpe es físico o especial, porque los datos no lo indican. La calidad y el nivel son
          iguales para todos a Lv. 1, así que no cambian el orden.
        </p>
      </div>
    </div>
  );
};
