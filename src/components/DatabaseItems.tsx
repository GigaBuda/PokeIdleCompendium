import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, MapPin, Tag, Lightbulb, Compass, Coins, Shield, Package, Check, ChevronRight, Swords } from 'lucide-react';
import { ITEMS_DATA, OfficialItem } from '../data/itemsData';

export const DatabaseItems: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [onlyRare, setOnlyRare] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'droppers'>('name');
  const [activeItemModal, setActiveItemModal] = useState<OfficialItem | null>(null);

  const categories = [
    { id: 'TODOS', label: 'Todos' },
    { id: 'held', label: 'Held Items (88)' },
    { id: 'berry', label: 'Bayas / Berries (40)' },
    { id: 'card', label: 'Shiny Cards (52)' },
    { id: 'stone', label: 'Piedras Evolutivas (20)' },
    { id: 'tm', label: 'Discos TM / AoE (19)' },
    { id: 'clan', label: 'Objetos de Clan (17)' },
    { id: 'loot', label: 'Loot de Caza (391)' },
    { id: 'heal', label: 'Pociones' },
    { id: 'revive', label: 'Revives' },
    { id: 'addon', label: 'Addons / Trajes' },
    { id: 'misc', label: 'Coleccionables' },
  ];

  const filteredItems = useMemo(() => {
    return ITEMS_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'TODOS' || item.category === selectedCategory;
      const matchesRare = !onlyRare || item.rare;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.droppedBy.some((d) => d.pokemon.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesRare && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return (b.npcPrice || 0) - (a.npcPrice || 0);
      if (sortBy === 'droppers') return b.droppedBy.length - a.droppedBy.length;
      return 0;
    });
  }, [searchQuery, selectedCategory, onlyRare, sortBy]);

  const getItemIconUrl = (iconPath: string) => {
    if (!iconPath) return '';
    if (iconPath.startsWith('http')) return iconPath;
    if (iconPath.startsWith('/')) return `https://poke.idleworld.online${iconPath}`;
    return `https://poke.idleworld.online/assets/items/${iconPath}`;
  };

  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'held':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/50';
      case 'berry':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50';
      case 'card':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/50';
      case 'stone':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50';
      case 'tm':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50';
      case 'clan':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/50';
      case 'heal':
      case 'revive':
        return 'bg-blue-950/80 text-blue-300 border-blue-700/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Clean Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Base de Datos de Objetos & Drops
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              667 objetos oficiales de poke.idleworld.online: precios de venta al NPC Mark, efectos de held items, bayas y tabla de drops.
            </p>
          </div>
          <div className="shrink-0 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2">
            <Package className="h-4 w-4 text-amber-400" />
            <div>
              <span className="font-bold text-white">{filteredItems.length}</span>
              <span className="text-slate-500 text-[11px] ml-1">objetos</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar objeto, efecto o Pokémon que lo dropea..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium shrink-0">Categoría:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium shrink-0">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="name">Nombre Alfabético</option>
              <option value="price">Precio de Venta NPC (Mayor a menor)</option>
              <option value="droppers">Cantidad de Pokémon que lo dropean</option>
            </select>
          </div>

          {/* Only Rare Toggle */}
          <div className="flex items-center justify-between sm:justify-start gap-2 px-2 py-1 bg-slate-900 rounded-lg border border-slate-800">
            <label className="text-slate-300 font-medium cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={onlyRare}
                onChange={(e) => setOnlyRare(e.target.checked)}
                className="h-4 w-4 accent-amber-500 rounded"
              />
              <span>Solo Drops Raros</span>
            </label>
          </div>
        </div>

        {/* Category quick buttons */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-2.5 py-1 rounded-md border whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-amber-500 text-black font-bold border-amber-400'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.slice(0, 90).map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItemModal(item)}
            className="rounded-xl border border-slate-800/80 bg-[#0d1017] hover:border-slate-700 transition-all p-4 flex flex-col justify-between cursor-pointer group shadow-sm"
          >
            <div>
              {/* Top row: Category, Rarity and ID */}
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeStyle(item.category)}`}>
                  {item.category}
                </span>
                <div className="flex items-center gap-1.5">
                  {item.rare && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      RARO
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-slate-600">ID #{item.id}</span>
                </div>
              </div>

              {/* Icon and Name */}
              <div className="mt-3 flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden group-hover:border-slate-700">
                  {item.icon ? (
                    <img
                      src={getItemIconUrl(item.icon)}
                      alt={item.name}
                      className="w-10 h-10 object-contain image-rendering-pixelated group-hover:scale-110 transition-transform"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Package className="h-6 w-6 text-slate-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                    {item.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description || (item.category === 'loot' ? 'Objeto de botín para venta al PNJ Mark.' : 'Sin descripción.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom info: Price & Droppers count */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  Mark: <strong className="text-amber-300 font-mono">{item.npcPrice ? `${item.npcPrice.toLocaleString()}g` : 'No compra'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                {item.droppedBy.length > 0 ? (
                  <span className="text-emerald-400 font-medium">
                    {item.droppedBy.length} droppers
                  </span>
                ) : (
                  <span>Tienda / Especial</span>
                )}
                <ChevronRight className="h-3 w-3 text-slate-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length > 90 && (
        <div className="text-center py-4 text-xs text-slate-500">
          Mostrando 90 de {filteredItems.length} objetos. Usa los filtros de categoría o búsqueda para explorar el catálogo completo.
        </div>
      )}

      {/* Item Detail Modal */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0d1017] p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shrink-0">
                  {activeItemModal.icon ? (
                    <img
                      src={getItemIconUrl(activeItemModal.icon)}
                      alt={activeItemModal.name}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-slate-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeStyle(activeItemModal.category)}`}>
                      {activeItemModal.category}
                    </span>
                    {activeItemModal.rare && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        RARO
                      </span>
                    )}
                    <span className="font-mono text-xs text-slate-500">ID #{activeItemModal.id}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white mt-1">{activeItemModal.name}</h2>
                </div>
              </div>
              <button
                onClick={() => setActiveItemModal(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Description & Effect */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Descripción Oficial del Juego:
              </span>
              <p className="text-slate-200 leading-relaxed">
                {activeItemModal.description || 'Objeto estándar registrado en el inventario de poke.idleworld.online.'}
              </p>
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Venta en Mark (NPC):</span>
                  <span className="font-mono font-bold text-amber-400">
                    {activeItemModal.npcPrice ? `${activeItemModal.npcPrice.toLocaleString()} oro` : 'No comprable'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Compra en Tienda:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {activeItemModal.priceGold ? `${activeItemModal.priceGold.toLocaleString()} oro` : 'Solo por Caza / Drop'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dropped By List */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Pokémon que lo Dropean en Caza:</span>
                <span className="font-mono text-emerald-400">{activeItemModal.droppedBy.length} especies</span>
              </h4>
              {activeItemModal.droppedBy.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeItemModal.droppedBy.map((d, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-500">#{String(d.id).padStart(3, '0')}</span>
                        <span className="font-bold text-slate-200">{d.pokemon}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-amber-400">{d.chance}% probabilidad</span>
                        <span className="block text-[10px] text-slate-500 font-mono">({d.min}-{d.max} unidades)</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-500 text-center">
                  Este objeto no se obtiene mediante drop salvaje directo (se consigue en tiendas de NPCs, eventos, o es una recompensa especial).
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveItemModal(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
