/**
 * Gestión de recursos diarios y estrategias oficiales para https://poke.idleworld.online
 * Adaptado a los sistemas reales: Daily Gift, 10 Ranked Tickets, Modo Siesta, Pokédex Kills,
 * Botánico, Streak Points y economía de Diamantes.
 */

export interface DailyTask {
  id: string;
  title: string;
  category: 'Rutina Diaria' | 'Combate & PvP' | 'Farm & Siesta' | 'Profesiones' | 'Economía & NPCs';
  description: string;
  reward: string;
  estimatedTime: string;
  importance: 'Crítica' | 'Alta' | 'Media';
  frequency: 'Diaria' | 'Por Sesión' | 'Continuo';
}

export const DAILY_TASKS: DailyTask[] = [
  {
    id: 'daily-gift-login',
    title: 'Reclamar Daily Gift (Idle Balls en Días Clave)',
    category: 'Rutina Diaria',
    description: 'Abre el panel del Daily Gift cada día. Además de oro y pociones, presta máxima atención a los días 3, 9, 18 y 27, los cuales otorgan 15, 30, 50 y 100 Idle Balls (la pokéball con x5 de probabilidad de captura).',
    reward: 'Oro, consumibles y hasta 100 Idle Balls',
    estimatedTime: '1 min',
    importance: 'Crítica',
    frequency: 'Diaria'
  },
  {
    id: 'ranked-tickets-pvp',
    title: 'Gastar los 10 Tickets de Clasificatoria (Ranked)',
    category: 'Combate & PvP',
    description: 'Cada día recibes 10 tickets de cola clasificatoria. Solo las partidas clasificatorias alteran el rating MMR y cuentan para la clasificación de temporada y recompensas de división. Los tickets se consumen únicamente cuando la batalla se disputa.',
    reward: 'MMR de temporada y puntos de ranking',
    estimatedTime: '8 min',
    importance: 'Alta',
    frequency: 'Diaria'
  },
  {
    id: 'offline-siesta-prep',
    title: 'Activar Modo Siesta (Zzz) con Muestra de 5 Minutos',
    category: 'Farm & Siesta',
    description: 'Antes de cerrar tu sesión de juego, ingresa a una zona de caza segura y haz clic en el botón Zzz (💤). Espera los 5 minutos de muestra en el servidor sin reconectarte para que comience a acumular hasta 24 horas de XP y loot offline.',
    reward: '50% de XP y loot offline (100% con Turbo de 2💎)',
    estimatedTime: '5 min de muestra',
    importance: 'Crítica',
    frequency: 'Por Sesión'
  },
  {
    id: 'pokedex-kill-milestone',
    title: 'Monitorear el Hito de 100 Bajas de Pokédex',
    category: 'Rutina Diaria',
    description: 'Revisa tu Pokédex en busca de especies que tengan entre 70 y 90 bajas. Completar las 100 bajas te otorga un botón para reclamar un bono ÚNICO equivalente al 25% de la barra de nivel de tu entrenador.',
    reward: '25% de nivel completo de XP gratis por especie',
    estimatedTime: '10 min',
    importance: 'Alta',
    frequency: 'Continuo'
  },
  {
    id: 'botanist-herb-harvest',
    title: 'Cosecha de Arbustos y Crafting de Berries (Botánico)',
    category: 'Profesiones',
    description: 'Si tienes la profesión de Botánico activa, camina cerca de los arbustos que brotan espontáneamente en las cacerías para recolectar Fresh Herbs y Wild Herbs. Úsalas para preparar Wild Rovia Berries (+80% curación) o bayas protectoras de elementos.',
    reward: 'Fresh Herbs, Wild Herbs y Berries de combate',
    estimatedTime: 'Durante las cazas',
    importance: 'Alta',
    frequency: 'Continuo'
  },
  {
    id: 'streak-points-exchange',
    title: 'Canjear Streak Points (1 Punto cada 1,000 Bajas)',
    category: 'Rutina Diaria',
    description: 'Por cada 1,000 bajas totales de la cuenta liberas un punto de racha. Paga el coste creciente en oro (25k, 50k, 75k...) y asígnalo a EXP (+0.1%), Loot (+0.1%) o Shiny (+0.1%). Es la progresión más sólida a largo plazo.',
    reward: '+0.1% acumulativo permanente a la cuenta',
    estimatedTime: '2 min',
    importance: 'Crítica',
    frequency: 'Por Sesión'
  },
  {
    id: 'game-pass-npc-tasks',
    title: 'Completar Tasks de NPC y Progresión de Game Pass',
    category: 'Rutina Diaria',
    description: 'Realiza las tareas de derrota/captura de los NPCs en las ciudades para obtener recompensas únicas de oro y XP. El progreso de bajas alimenta automáticamente los 60 tiers del Game Pass (tiers 1-30 gratuitos, 31-60 premium por 15 💎).',
    reward: 'Poké Balls, pociones, revives, boosts y oro',
    estimatedTime: '15 min',
    importance: 'Media',
    frequency: 'Diaria'
  },
  {
    id: 'fishing-skill-training',
    title: 'Entrenamiento de Habilidad de Pesca (Fishing)',
    category: 'Profesiones',
    description: 'Acércate al agua y lanza tu caña respetando el temporizador de cooldown. Subir tu habilidad de pesca desbloquea franjas de nivel más altas para capturar Pokémon acuáticos exclusivos que no aparecen en cazas terrestres.',
    reward: 'Aumento de habilidad de pesca y especies acuáticas',
    estimatedTime: '5 min',
    importance: 'Media',
    frequency: 'Diaria'
  },
  {
    id: 'merchant-inventory-clean',
    title: 'Venta de Loot a Mark y Venta de Especies a Heather',
    category: 'Economía & NPCs',
    description: 'Vacía tu mochila vendiendo los drops de categoría "loot" al NPC Mark en la ciudad. Si tienes Pokémon capturados repetidos o de baja calidad, acude con Heather para venderlos por su valor oficial (Sell Value) y financiar tus Evolution Stones.',
    reward: 'Monedas de oro líquidas para pociones y clanes',
    estimatedTime: '3 min',
    importance: 'Alta',
    frequency: 'Por Sesión'
  }
];

export interface EconomyStrategy {
  title: string;
  resource: 'Oro' | 'Diamantes' | 'Piedras Evolutivas' | 'Idle Balls';
  priority: 'Prioridad 1 (Indispensable)' | 'Prioridad 2 (Acelerador)' | 'Prioridad 3 (Lujo / Opcional)';
  bestUsage: string;
  worstUsage: string;
  proTip: string;
}

export const ECONOMY_STRATEGIES: EconomyStrategy[] = [
  {
    title: 'Gestión Inteligente de Diamantes (💎)',
    resource: 'Diamantes',
    priority: 'Prioridad 1 (Indispensable)',
    bestUsage: '1) Activar Turbo en el Modo Siesta (solo 2💎 por duplicar hasta 24h de farm offline). 2) Desbloquear el pase Game Pass Premium (15💎 por tiers 31-60 con el doble de recompensas). 3) Cambiar de Clan cuando sea necesario.',
    worstUsage: 'Gastar gemas en cosméticos o skins de personaje antes de tener activado el Game Pass Premium.',
    proTip: '2 Diamantes en un Modo Siesta de 20+ horas genera más XP y loot que casi cualquier otro gasto del juego.'
  },
  {
    title: 'Inversión de Oro Líquido',
    resource: 'Oro',
    priority: 'Prioridad 1 (Indispensable)',
    bestUsage: '1) Comprar Small/Great Potions y Revives para que el Auto Helper nunca te deje morir en hunt. 2) Canjear Streak Points (25k * n). 3) Ahorrar para las Evolution Stones al evolucionar en Cerulean manteniendo el nivel.',
    worstUsage: 'Gastar oro saltando misiones de clan tempranas (1.5M a 6M de oro) en lugar de farmear los Pokémon requeridos.',
    proTip: 'Vende siempre todo el loot a Mark y los Pokémon duplicados a Heather tras cada sesión larga de caza.'
  },
  {
    title: 'Uso Táctico de Idle Balls (x5 Catch)',
    resource: 'Idle Balls',
    priority: 'Prioridad 2 (Acelerador)',
    bestUsage: 'Reservarlas exclusivamente para encuentros Shiny o Pokémon de Tier A/B con captureBase baja en cacerías de nivel alto.',
    worstUsage: 'Lanzarlas a Pokémon comunes de Tier E/D que puedes capturar fácilmente con Poké Balls o Great Balls comunes.',
    proTip: 'Acumula las Idle Balls gratuitas del Daily Gift (días 3, 9, 18 y 27) para cuando encuentres a tu primer Shiny o Altar boss.'
  },
  {
    title: 'Evolución: Sin Stones (Gratis) vs Con Stones',
    resource: 'Piedras Evolutivas',
    priority: 'Prioridad 2 (Acelerador)',
    bestUsage: 'Usar piedras evolutivas en tu Pokémon líder principal cuando tenga Calidad alta (Épica o Legendaria) y ya esté a nivel 40+ para no perder su progreso.',
    worstUsage: 'Gastar piedras caras (Fire, Water, Leaf, Crystal) en Pokémon de Calidad Débil o Común. Si la calidad es baja, evoluciona gratis volviendo a Nivel 1.',
    proTip: 'Recuerda que solo puedes evolucionar cuando estés en Ciudad Cerulean; durante una caza el botón queda inhabilitado.'
  }
];
