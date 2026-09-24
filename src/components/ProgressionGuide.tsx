import React, { useState } from 'react';
import { BookOpen, Sparkles, AlertTriangle, CheckCircle2, ChevronRight, Award, Compass, Zap, Shield, Swords, Trees, Trophy, Clock } from 'lucide-react';
import { PROGRESSION_GUIDES, GuideChapter } from '../data/progressionGuideData';

interface ProgressionGuideProps {
  onGoToCalculators: () => void;
}

export const ProgressionGuide: React.FC<ProgressionGuideProps> = ({ onGoToCalculators }) => {
  const [activeChapterId, setActiveChapterId] = useState<string>(PROGRESSION_GUIDES[0].id);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('pokeidle_guide_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleStep = (stepKey: string) => {
    const updated = { ...completedSteps, [stepKey]: !completedSteps[stepKey] };
    setCompletedSteps(updated);
    try {
      localStorage.setItem('pokeidle_guide_progress', JSON.stringify(updated));
    } catch {}
  };

  const activeChapter = PROGRESSION_GUIDES.find((c) => c.id === activeChapterId) || PROGRESSION_GUIDES[0];

  const milestones = [
    { id: 'm1', label: 'Configurar Auto-Potion y Auto-Revive en el panel Auto Helper (gratuito para todos)' },
    { id: 'm2', label: 'Aprovechar la ventaja elemental amplificada (+50%: x2.0 pasa a x2.50, x4.0 pasa a x5.50)' },
    { id: 'm3', label: 'Completar 100 bajas de una especie y reclamar el bono de Pokédex (+25% de nivel de XP)' },
    { id: 'm4', label: 'Viajar a Ciudad Cerulean para evolucionar (Gratis a Lv.1 o con Evolution Stones)' },
    { id: 'm5', label: 'Activar tu primer Modo Siesta (💤) con la muestra de 5 min antes de desconectarte' },
    { id: 'm6', label: 'Canjear tus primeros Streak Points (1 cada 1000 bajas) por EXP, Loot o Shiny permanente' },
    { id: 'm7', label: 'Alcanzar el Nivel 80 y unirte de forma gratuita al Rango 1 de uno de los 10 Clanes' },
    { id: 'm8', label: 'Elegir tu Profesión: Botánico (hierbas y Berries) o Entrenador de Prestigio (fotos de Shinies)' },
    { id: 'm9', label: 'Equipar el AoE TM Disk para convertir todos tus ataques normales en daño de área 12×12' },
    { id: 'm10', label: 'Dropear una Shiny Card en hunt y sacrificarla en el Altar para librar combate Shiny' },
  ];

  const completedCount = milestones.filter((m) => completedSteps[m.id]).length;

  return (
    <div className="space-y-8">
      {/* Clean Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Guía de Progresión & Mecánicas
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              Mecánicas oficiales de poke.idleworld.online: combate salvaje con HP ×5 y daño ×1.8, evolución en Cerulean, 10 clanes elementales y optimización offline.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onGoToCalculators}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-black transition-colors"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Optimizador EXP/h</span>
            </button>
            <a
              href="https://poke.idleworld.online/pokepedia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition-colors"
            >
              <Compass className="h-3.5 w-3.5 text-slate-400" />
              <span>Poképedia ↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Container: Chapters Nav + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (Desktop 4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                <span>Capítulos ({PROGRESSION_GUIDES.length})</span>
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {PROGRESSION_GUIDES.map((chapter) => {
                const isActive = chapter.id === activeChapterId;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => setActiveChapterId(chapter.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-start justify-between gap-3 text-xs ${
                      isActive
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                        <span>CAP. {chapter.order}</span>
                        <span>·</span>
                        <span>{chapter.difficulty}</span>
                      </div>
                      <div className="mt-0.5 font-bold line-clamp-1 text-slate-200">{chapter.title}</div>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'rotate-90 text-amber-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Player Checklist */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-amber-400" />
                <span>Hitos de Progresión</span>
              </span>
              <span className="font-mono text-xs font-bold text-amber-400">
                {completedCount}/{milestones.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${(completedCount / milestones.length) * 100}%` }}
              />
            </div>

            <div className="mt-4 space-y-2.5">
              {milestones.map((m) => {
                const isChecked = !!completedSteps[m.id];
                return (
                  <label
                    key={m.id}
                    onClick={() => toggleStep(m.id)}
                    className="flex items-start gap-2.5 text-xs cursor-pointer group text-slate-300"
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        isChecked
                          ? 'bg-amber-500 border-amber-400 text-black'
                          : 'border-slate-700 bg-slate-900 group-hover:border-slate-500'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                    <span className={`leading-relaxed ${isChecked ? 'line-through text-slate-500' : 'group-hover:text-white'}`}>
                      {m.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chapter Reader View (Desktop 8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-[#0d1017] p-6 sm:p-8 space-y-8">
          {/* Chapter Meta */}
          <div className="border-b border-slate-800 pb-5">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase">
              <span>Capítulo {activeChapter.order}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {activeChapter.readingTime} de lectura
              </span>
              <span>·</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{activeChapter.difficulty}</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeChapter.title}
            </h2>
            <p className="mt-2 text-sm text-slate-400 italic">
              "{activeChapter.summary}"
            </p>
          </div>

          {/* Chapter Content Sections */}
          <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
            {activeChapter.content.map((sec, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 inline-block"></span>
                  <span>{sec.heading}</span>
                </h3>
                <p className="text-slate-300">{sec.text}</p>

                {sec.formula && (
                  <div className="my-3 p-3.5 rounded-lg bg-slate-900/90 border border-amber-500/20 text-xs font-mono text-amber-300 overflow-x-auto">
                    <span className="text-slate-500 block text-[10px] uppercase font-sans mb-1">Fórmula Oficial del Motor:</span>
                    {sec.formula}
                  </div>
                )}

                {sec.warning && (
                  <div className="my-3 p-3.5 rounded-lg bg-red-950/30 border border-red-900/50 text-xs text-red-200 flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                    <div>
                      <strong className="block text-red-300 font-semibold mb-0.5">Nota Crítica:</strong>
                      <span>{sec.warning}</span>
                    </div>
                  </div>
                )}

                {sec.proTips && sec.proTips.length > 0 && (
                  <div className="my-3 p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Consejos de Eficiencia (Pro Tips)</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {sec.proTips.map((tip, tipIdx) => (
                        <li key={tipIdx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chapter Navigation Buttons */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            {(() => {
              const curIdx = PROGRESSION_GUIDES.findIndex((c) => c.id === activeChapterId);
              const prev = curIdx > 0 ? PROGRESSION_GUIDES[curIdx - 1] : null;
              const next = curIdx < PROGRESSION_GUIDES.length - 1 ? PROGRESSION_GUIDES[curIdx + 1] : null;

              return (
                <>
                  {prev ? (
                    <button
                      onClick={() => setActiveChapterId(prev.id)}
                      className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      ← Cap. {prev.order}: {prev.title}
                    </button>
                  ) : <div />}
                  {next ? (
                    <button
                      onClick={() => setActiveChapterId(next.id)}
                      className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      Cap. {next.order}: {next.title} →
                    </button>
                  ) : <div />}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
