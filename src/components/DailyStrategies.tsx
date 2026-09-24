import React, { useState, useEffect, useMemo } from 'react';
import { CheckSquare, Square, Clock, Coins, ShieldAlert, Sparkles, Moon, Target, Award, RefreshCw, Zap, Gem, CheckCircle2, AlertTriangle, Compass } from 'lucide-react';
import { DAILY_TASKS, ECONOMY_STRATEGIES, DailyTask, EconomyStrategy } from '../data/dailyResourcesData';

export const DailyStrategies: React.FC = () => {
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pokeidle_daily_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  // Offline Siesta Simulator State
  const [siestaHours, setSiestaHours] = useState<number>(8);
  const [sampleXpPerMin, setSampleXpPerMin] = useState<number>(3200);
  const [sampleGoldPerMin, setSampleGoldPerMin] = useState<number>(850);

  // Daily UTC Reset timer calculation
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrowUTC = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
      );
      const diffMs = tomorrowUTC.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTask = (id: string) => {
    const next = completedTaskIds.includes(id)
      ? completedTaskIds.filter((t) => t !== id)
      : [...completedTaskIds, id];
    setCompletedTaskIds(next);
    try {
      localStorage.setItem('pokeidle_daily_tasks', JSON.stringify(next));
    } catch {}
  };

  const handleResetChecklist = () => {
    setCompletedTaskIds([]);
    try {
      localStorage.removeItem('pokeidle_daily_tasks');
    } catch {}
  };

  // Siesta Calculations
  const siestaMinutes = siestaHours * 60;
  const normalXp = Math.round(siestaMinutes * sampleXpPerMin * 0.5);
  const turboXp = Math.round(siestaMinutes * sampleXpPerMin * 1.0);
  const normalGold = Math.round(siestaMinutes * sampleGoldPerMin * 0.5);
  const turboGold = Math.round(siestaMinutes * sampleGoldPerMin * 1.0);

  const completedCount = completedTaskIds.length;

  return (
    <div className="space-y-8">
      {/* Clean Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Gestión Diaria & Estrategias
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              Rutina diaria de tickets, Daily Gift, optimización de Modo Siesta (offline) y uso de Diamantes.
            </p>
          </div>

          {/* Reset Timer */}
          <div className="shrink-0 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-center sm:text-right">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">
              Reset Diario (00:00 UTC)
            </span>
            <span className="text-base font-mono font-bold text-amber-400 block">
              {timeUntilReset || '--:--:--'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Daily Routine Checklist */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-amber-400" />
              <span>Rutina Diaria Recomendada ({completedCount}/{DAILY_TASKS.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Guarda automáticamente en tu navegador para que nunca olvides una tarea esencial.
            </p>
          </div>
          <button
            onClick={handleResetChecklist}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reiniciar Checklist</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${(completedCount / DAILY_TASKS.length) * 100}%` }}
          />
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {DAILY_TASKS.map((task) => {
            const isCompleted = completedTaskIds.includes(task.id);
            return (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isCompleted
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {task.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${
                        task.importance === 'Crítica' ? 'text-red-400' : task.importance === 'Alta' ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {task.importance}
                      </span>
                      <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-amber-500 border-amber-400 text-black'
                          : 'border-slate-700 bg-slate-800 group-hover:border-slate-500'
                      }`}>
                        {isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </div>

                  <h3 className={`mt-2.5 text-sm font-bold transition-colors ${
                    isCompleted ? 'line-through text-slate-500' : 'text-white group-hover:text-amber-300'
                  }`}>
                    {task.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {task.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-medium truncate max-w-[180px]">
                    🎁 {task.reward}
                  </span>
                  <span className="text-slate-500 shrink-0 font-mono">
                    ⏱ {task.estimatedTime}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Offline Siesta Farm Simulator (Interactive Tool) */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-6 space-y-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <Moon className="h-4 w-4" />
          <span>SIMULADOR OFICIAL DE MODO SIESTA (ZZZ / FARM OFFLINE)</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Calculadora de Rendimiento Offline (Hasta 24h)
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              El servidor graba una muestra exacta de 5 minutos en tu cacería actual. Luego calcula tu rendimiento offline durante hasta 24 horas: 50% gratis o 100% gastando 2 Diamantes (💎 Turbo).
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Horas de Siesta:</span>
              <span className="font-mono font-bold text-amber-300">{siestaHours} horas</span>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              value={siestaHours}
              onChange={(e) => setSiestaHours(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Máximo 24 horas acumulables</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <label className="text-slate-400 block mb-1">XP / minuto en la muestra:</label>
            <input
              type="number"
              min={500}
              max={20000}
              step={100}
              value={sampleXpPerMin}
              onChange={(e) => setSampleXpPerMin(Number(e.target.value))}
              className="w-full rounded bg-slate-800 border border-slate-700 p-1.5 font-mono text-white text-xs"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Depende de tu zona de caza activa</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <label className="text-slate-400 block mb-1">Oro / minuto en la muestra:</label>
            <input
              type="number"
              min={100}
              max={5000}
              step={50}
              value={sampleGoldPerMin}
              onChange={(e) => setSampleGoldPerMin(Number(e.target.value))}
              className="w-full rounded bg-slate-800 border border-slate-700 p-1.5 font-mono text-white text-xs"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Drops de oro de salvajes</span>
          </div>
        </div>

        {/* Comparison: Normal vs Turbo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Normal 50% */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-300 text-xs">Recolección Normal (Gratis)</span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                50% Eficiencia
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">XP Acumulada</span>
                <span className="font-mono font-bold text-slate-200 text-sm mt-0.5 block">
                  +{normalXp.toLocaleString()} XP
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Oro Estimado</span>
                <span className="font-mono font-bold text-amber-300 text-sm mt-0.5 block">
                  +{normalGold.toLocaleString()} oro
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Ideal para pausas cortas o si prefieres reservar tus diamantes.
            </p>
          </div>

          {/* Turbo 100% */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/30 to-blue-950/20 border border-cyan-800/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                <Gem className="h-3.5 w-3.5 text-cyan-400" />
                <span>Modo Turbo (Cuesta 2 💎)</span>
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-200">
                100% Eficiencia Doble
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-900/40">
                <span className="text-[10px] text-cyan-400 block">XP Acumulada (+100%)</span>
                <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
                  +{turboXp.toLocaleString()} XP
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-900/40">
                <span className="text-[10px] text-cyan-400 block">Oro Estimado (+100%)</span>
                <span className="font-mono font-bold text-amber-300 text-sm mt-0.5 block">
                  +{turboGold.toLocaleString()} oro
                </span>
              </div>
            </div>
            <p className="text-[11px] text-cyan-200/80">
              ⚡ Ganas <strong className="text-white font-mono">+{ (turboXp - normalXp).toLocaleString() } XP extra</strong> por solo 2 Diamantes. ¡La inversión de diamantes con mayor ROI del juego!
            </p>
          </div>
        </div>
      </div>

      {/* Resource Optimization Strategies */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-6 space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-400" />
            <span>Estrategias de Economía & Prioridad de Inversión</span>
          </h2>
          <p className="text-xs text-slate-400">
            Aprende qué recursos gastar de inmediato y cuáles guardar bajo llave para el late-game.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ECONOMY_STRATEGIES.map((strat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {strat.resource}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {strat.priority}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{strat.title}</h3>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-200">
                    <strong className="block text-emerald-400 mb-0.5">Uso Óptimo:</strong>
                    <span>{strat.bestUsage}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/40 text-red-200">
                    <strong className="block text-red-400 mb-0.5">Error Común a Evitar:</strong>
                    <span>{strat.worstUsage}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-amber-300/90 italic flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span>Consejo Pro: {strat.proTip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
