import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#06070a] py-8 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="font-semibold text-slate-300">PokéIdle Compendium</span>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span>Enciclopedia y optimizador no oficial para poke.idleworld.online</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://poke.idleworld.online/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            Servidor Oficial del Juego
          </a>
          <span aria-hidden="true">·</span>
          <span>Pokémon es una marca registrada de Nintendo / Game Freak</span>
        </div>
      </div>
    </footer>
  );
};
