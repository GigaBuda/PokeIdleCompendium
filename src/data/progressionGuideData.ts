/**
 * Guía de progresión oficial y verificada para https://poke.idleworld.online
 * Basada 100% en las mecánicas, fórmulas y sistemas reales del motor del juego.
 */

export interface GuideChapter {
  id: string;
  order: string;
  title: string;
  summary: string;
  readingTime: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  content: {
    heading: string;
    text: string;
    proTips?: string[];
    formula?: string;
    warning?: string;
  }[];
}

export const PROGRESSION_GUIDES: GuideChapter[] = [
  {
    id: 'hunt-combat-basics',
    order: '01',
    title: 'Combate en la Caza (Hunt) y Supervivencia',
    summary: 'Aprende cómo funcionan los salvajes reforzados, la amplificación elemental del 50% y la configuración gratuita de Auto Helper.',
    readingTime: '5 min',
    difficulty: 'Principiante',
    content: [
      {
        heading: 'Salvajes Reforzados: HP ×5 y Daño ×1.8',
        text: 'En poke.idleworld.online, los Pokémon salvajes de las cacerías (hunts) no tienen las estadísticas base de los juegos tradicionales de consola: cuentan con HP multiplicado por 5 (HP ×5) y su daño por golpe está aumentado a ×1.8. Por esta razón, el juego castiga severamente entrar a cazas sin ventaja elemental o sin consumibles configurados.',
        warning: 'Todo nuevo entrenador comienza con 100 Small Potions y 100 Poké Balls. No malgastes las pociones manualmente: configura los umbrales automáticos.',
        proTips: [
          'La defensa y la vida tienen un peso crucial en este juego: un Pokémon que soporte dos golpes salvajes te ahorrará miles de monedas en pociones.',
          'Si tu Pokémon líder se debilita y no tienes Revives en la mochila, volverás automáticamente a la ciudad, donde la Enfermera Joy te curará de forma gratuita.'
        ]
      },
      {
        heading: 'Ventaja Elemental Amplificada (+50% en ambas direcciones)',
        text: 'Las afinidades elementales son un 50% más pronunciadas tanto para el daño que haces como para el que recibes. Las ventajas estándar se convierten en multiplicadores devastadores: x1.5 pasa a x1.75, x2 pasa a x2.5, y una doble debilidad x4 sube hasta un letal x5.5. Por otro lado, las resistencias se dividen por 1.5 (un x0.5 pasa a x0.33). Las inmunidades (x0) y neutrales (x1) se mantienen.',
        formula: 'Ventaja x2.0 → x2.50 (+50%) | Ventaja x4.0 → x5.50 (+50%) | Resistencia x0.5 → x0.33 (/1.5)',
        proTips: [
          'Llevar el tipo adecuado a la caza importa más que el nivel bruto o los IVs.',
          'Consulta la tabla de efectividad del Pokémon salvaje antes de elegir tu zona de farmeo.'
        ]
      },
      {
        heading: 'Auto Helper: Auto-Potion y Auto-Revive Gratuitos',
        text: 'El panel de Auto Helper no requiere suscripción VIP: es completamente libre para todos los jugadores. Puedes configurar el porcentaje de salud (por ejemplo, por debajo del 40% de HP) para que tu líder consuma pociones de forma automática sin interrumpir el combate. El Auto-Revive levantará a tu Pokémon de inmediato si cae en combate.',
        proTips: [
          'Mantén siempre una reserva de Small Potions (50 de oro) o Great Potions (150 de oro) compradas a Mark en la ciudad.',
          'La función de Auto-Catch (lanzar Poké Balls automáticamente con filtro por nombre) sí es exclusiva de la membresía VIP.'
        ]
      }
    ]
  },
  {
    id: 'xp-infinite-curve',
    order: '02',
    title: 'Curva de XP, Nivel Infinito y Pokédex Milestone',
    summary: 'Comprende la fórmula cúbica real de experiencia, la independencia de niveles de entrenador/líder y el bono de 100 bajas.',
    readingTime: '6 min',
    difficulty: 'Principiante',
    content: [
      {
        heading: 'Fórmula Cúbica de Nivel y Ausencia de Techo',
        text: 'En poke.idleworld.online no existe un tope de nivel tradicional (como Lv.100). El nivel es infinito y la experiencia requerida por nivel escala mediante una fórmula cúbica estricta. A mayor nivel, la barra se encarece progresivamente.',
        formula: 'XP total para nivel L = round( 50/3 × (L³ − 6L² + 17L − 12) )',
        proTips: [
          'Cada baja (kill) otorga un valor fijo de XP simultáneamente al ENTRENADOR y al POKÉMON ACTIVO. Sus niveles progresan de forma completamente independiente.',
          'Los multiplicadores de XP (Membresía VIP, XP Boost de 1 hora de +50% y Streak Points a razón de +0.1%/punto) se suman directamente sobre el XP base de la baja.'
        ]
      },
      {
        heading: 'El Gran Secreto: Bono Único de Pokédex (25% de Nivel)',
        text: 'Cada vez que alcances exactamente 100 bajas de cualquier especie registrada en tu Pokédex, desbloquearás un botón para reclamar un bono ÚNICO de experiencia equivalente al 25% de todo un nivel tuyo actual.',
        warning: 'Reclama este bono con inteligencia: al ser un porcentaje relativo a tu nivel actual (25%), farmear las 100 bajas de especies débiles (Rattata, Pidgey, Caterpie) a niveles altos te concederá millones de XP de golpe.',
        proTips: [
          'Apunta a completar las 100 bajas de cada especie que encuentres mientras avanzas por las zonas de caza.',
          'Llevar un recuento de especies con 90+ bajas te permite dar un salto masivo de varios niveles durante eventos de XP.'
        ]
      }
    ]
  },
  {
    id: 'evolution-cerulean-system',
    order: '03',
    title: 'Evolución en Cerulean: Gratis vs Evolution Stones',
    summary: 'Aprende los dos caminos evolutivos, por qué solo funciona en Cerulean y cómo planificar las Evolution Stones.',
    readingTime: '5 min',
    difficulty: 'Intermedio',
    content: [
      {
        heading: 'La Regla de Cerulean City',
        text: 'La evolución de Pokémon SOLO funciona cuando estás en Ciudad Cerulean. Durante una cacería (hunt), el botón de evolución en el HUD del equipo y en la Poképedia queda completamente bloqueado. Debes salir de la caza y volver a la ciudad para procesar cualquier evolución.',
        proTips: [
          'Ditto nunca evoluciona. Eevee posee su propio árbol de stones elementales.',
          'Al evolucionar, el apodo, la posición en el equipo, el Growth (IVs) y la Calidad se MANTIENEN intactos; únicamente se recalculan los stats base con la nueva especie.'
        ]
      },
      {
        heading: 'Los Dos Caminos: Sin Stones (Gratis) vs Con Stones',
        text: 'El juego te permite elegir entre dos rutas para evolucionar a tu Pokémon:',
        proTips: [
          'Camino 1 - Sin Stones (Gratis): El Pokémon evoluciona a coste cero de objetos, pero su nivel vuelve a Nivel 1. Es útil si no tienes piedras y quieres subirlo rápido aprovechando el bono de stats de la etapa final.',
          'Camino 2 - Con Evolution Stones: El Pokémon evoluciona MANTENIENDO su nivel actual íntegro, consumiendo las piedras correspondientes a su receta.',
          'Costo de Piedras: Especies de cazas hasta Lv.39 piden 1 piedra de cada tipo de su receta. Especies de cazas Lv.40+ piden 4 stones en total divididas en combos (ej. Ivysaur = 4x Leaf Stone; Charmeleon = 2x Fire + 2x Feather Stone).'
        ],
        warning: 'Las versiones Shiny evolucionan únicamente por su propia ruta: requieren las piedras normales de la línea más la exclusiva Piedra de Shiny de esa especie.'
      }
    ]
  },
  {
    id: 'quality-ivs-power-myth',
    order: '04',
    title: 'Power Real, Calidad vs IVs (Growth) y el Mito del Tier × IV',
    summary: 'Desmontando el falso cálculo de tier por IV: descubre por qué la Calidad aparece dos veces en la fórmula y domina las bandas.',
    readingTime: '7 min',
    difficulty: 'Avanzado',
    content: [
      {
        heading: 'El Mito del "Tier × IV" y Cómo Funciona Realmente el Power',
        text: 'Muchos jugadores cometen el grave error de calcular la fuerza de un Pokémon multiplicando su "tier por su IV". Esa fórmula es completamente falsa y engaña. El Power y los stats de poke.idleworld.online nacen de tres factores: la Especie (stats base), el IV Total (de 0 a 192, distribuido en 0 a 32 por cada uno de los 6 stats) y la Calidad (Quality).',
        formula: 'stat = round( (base + 2 × (IV_total / 6)) × nivel/100 × Calidad^exp ) | Power = (HP + Atk + Def + SpAtk + SpDef + Vel) × Calidad',
        warning: '¡La Calidad aparece DOS VECES en los cálculos (dentro de cada stat individual y multiplicando de nuevo el Power final)! Por eso la Calidad pesa mucho más que tener 192/192 de IVs.',
        proTips: [
          'En el juego, la ficha del Pokémon muestra los IVs en una escala de 0 a 192 (donde 192/192 es el 100% perfecto, equivalente a 32 en cada uno de los 6 stats: HP, Atk, Def, SpAtk, SpDef, Vel).',
          'Un Pokémon de Calidad Legendaria (1.70) con IVs bajos (ej. 60/192) casi siempre superará en Power a un Pokémon de Calidad Común (1.10) con IVs perfectos (192/192).',
          'Solo cuando compares dos Pokémon de la misma especie con Calidad idéntica, el desempate dependerá de quién tenga mayor IV hacia 192.'
        ]
      },
      {
        heading: 'Bandas de Calidad Oficiales (Poképedia)',
        text: 'La Calidad es sorteada en el instante de la captura y es fija e inmutable (no cambia al evolucionar). Las bandas oficiales son:',
        proTips: [
          'Bandas oficiales: Débil (< 1.0), Común (1.0–1.1), Poco común (1.1–1.3), Rara (1.3–1.5), Épica (1.5–1.7), Legendaria (1.7–2.0), Mítica (2.0–3.0), Anciana (3.0–4.0) y Divina (4.0+).',
          'Calidad Salvaje: Las capturas estándar llegan hasta Legendaria (tope 2.0). Solo una fracción mínima alcanza el rango alto.',
          'Calidades Mítica (2.0–3.0, ej. 2.40x meta base), Anciana (3.0–4.0) y Divina (4.0+): Calidades excepcionales de endgame, reservadas a Shinies y cría avanzada.'
        ]
      }
    ]
  },
  {
    id: 'sleep-mode-offline-farm',
    order: '05',
    title: 'Modo Siesta (Farm Offline / Zzz): Reglas de Muestra',
    summary: 'Aprende a activar correctamente el farm offline de 24 horas, la muestra de 5 minutos y el uso óptimo del Turbo.',
    readingTime: '5 min',
    difficulty: 'Principiante',
    content: [
      {
        heading: 'Cómo Funciona la Muestra de 5 Minutos',
        text: 'El farm offline de poke.idleworld.online solo se activa mediante el botón Zzz (💤) dentro de una cacería. Si simplemente cierras la pestaña del navegador, NO generarás recompensas.',
        warning: 'Al pulsar Zzz, tu personaje sale del juego y la caza continúa simulándose en el servidor durante exactamente 5 minutos de prueba (la muestra). Durante esa muestra, el combate, el XP ganado, el loot y el uso de Auto-Potion/Revive funcionan de forma real (lo único que no se lanzan son Poké Balls).',
        proTips: [
          'Si vuelves a iniciar sesión dentro de esos primeros 5 minutos, la siesta se CANCELARÁ por completo y no se generará farm offline.',
          'Asegúrate de que tu líder tenga suficientes pociones y revives al momento de iniciar la siesta: si se debilita durante los 5 minutos sin revives, la muestra se detendrá y tu rendimiento offline será nulo.'
        ]
      },
      {
        heading: 'Rendimiento Estándar vs Modo Turbo (2 Diamantes)',
        text: 'Tras completarse los 5 minutos de muestra, el servidor calcula tu tasa por minuto y acumula recompensas hasta un máximo de 24 horas:',
        proTips: [
          'Recolección Normal: 50% de la tasa de XP y loot de la muestra (completamente gratis).',
          'Recolección Turbo (2 💎): 100% de la tasa de la muestra. Por solo 2 Diamantes duplicas la eficiencia completa de hasta 24 horas de desconexión. Es una de las mejores inversiones de gemas del juego.'
        ]
      }
    ]
  },
  {
    id: 'streak-points-permanent-buffs',
    order: '06',
    title: 'Streak Points: Bonos Permanentes Cada 1,000 Bajas',
    summary: 'Convierte tus bajas en incrementos porcentuales eternos de EXP, Loot o Shiny sin reinicio de cuenta.',
    readingTime: '4 min',
    difficulty: 'Intermedio',
    content: [
      {
        heading: 'Mecánica de Puntos y Coste Escalonado en Oro',
        text: 'Cada 1,000 bajas totales que acumules en tu cuenta, desbloquearás 1 Streak Point permanente. Estos puntos nunca se reinician, formando la columna vertebral de la progresión a largo plazo.',
        formula: 'Coste en Oro = 25.000 × número del punto (1º = 25.000 oro, 2º = 50.000 oro, 10º = 250.000 oro...)',
        proTips: [
          'Cada punto se invierte en una de tres vías exclusivas: EXP (+0.1%), Loot (+0.1%) o Shiny (+0.1%).',
          'Estrategia recomendada: Durante los primeros 50 puntos, invierte un 60% en EXP para acelerar tu llegada al nivel 80 (desbloqueo de Clanes) y un 40% en Loot para maximizar las piedras evolutivas y drops de venta a Mark.'
        ]
      }
    ]
  },
  {
    id: 'official-clans-system',
    order: '07',
    title: 'Los 10 Clanes Oficiales y el Bono del 30%',
    summary: 'Todo sobre el nivel 80, las misiones de rango y los 10 clanes que gobiernan cada elemento del juego.',
    readingTime: '6 min',
    difficulty: 'Avanzado',
    content: [
      {
        heading: 'Desbloqueo a Nivel 80 y Bonos de Combate',
        text: 'Al alcanzar el nivel 80 de entrenador, desbloquearás el sistema de Clanes. La primera adhesión a un clan es completamente gratuita en el Rango 1. Los Rangos 2, 3, 4 y 5 se desbloquean en los niveles 90, 100, 110 y 120 respectivamente.',
        formula: 'Bono de combate: +6% por rango en ATQ, ATQ Esp., DEF y DEF Esp. para los tipos del clan (Rank 5 = +30% total)',
        proTips: [
          'Para subir de rango, debes completar misiones de clan (derrotar N Pokémon de los tipos afines, entregar objetos consumibles de clan como Big Bug Gosme o Big Poison Bottle, o capturar especies objetivo).',
          'Alternativa: Si no deseas recolectar los objetos, puedes saltar el requisito pagando oro (1.5KK, 3KK, 4.5KK, 6KK según el rango).'
        ]
      },
      {
        heading: 'La Lista Oficial de los 10 Clanes',
        text: 'Cada clan gobierna sobre elementos específicos:',
        proTips: [
          'Ironhard: Metal y Cristal (+28% ATQ y DEF en Rank 5). Ranks: Smither, Forge, Hammer, Metal, Titan.',
          'Naturia: Planta e Inseto (+30% ATQ y DEF en Rank 5). Ranks: Seed, Sprout, Webhead, Woodtrunk, Keeper.',
          'Seavell: Agua y Hielo (+30% ATQ y DEF en Rank 5). Ranks: Drop, Icelake, Waterfall, Frost, Master.',
          'Malefic: Fantasma, Veneno y Siniestro (+30% ATQ y DEF en Rank 5). Ranks: Troublemaker, Venomancer, Spectre, Nightwalker, Lord.',
          'Orebound: Tierra y Roca (+30% ATQ y DEF en Rank 5). Ranks: Sand, Rock, Solid, Hardskin, Hero.',
          'Psycraft: Psíquico y Hada (+30% ATQ y DEF en Rank 5). Ranks: Mind, Brain, Scholar, Telepath, Medium.',
          'Raibolt: Eléctrico (+28% ATQ y DEF en Rank 5). Ranks: Shock, Watt, Electrician, Overcharge, Legend.',
          'Volcanic: Fuego (+28% ATQ y DEF en Rank 5). Ranks: Spark, Flame, Firetamer, Pyromancer, Master.',
          'Gardestrike: Luchador y Normal (+30% ATQ y DEF en Rank 5).',
          'Wingeon: Volador y Dragón (+30% ATQ y DEF en Rank 5).'
        ]
      }
    ]
  },
  {
    id: 'professions-botanist-prestige',
    order: '08',
    title: 'Profesiones: Botánico, Berries y Entrenador de Prestigio',
    summary: 'Recolecta hierbas para fabricar bayas de combate con Botánico, o fotografía shinies con Prestigio para multiplicar tu tasa de captura.',
    readingTime: '6 min',
    difficulty: 'Avanzado',
    content: [
      {
        heading: 'Botánico: Cosecha de Arbustos y Crafting de Berries',
        text: 'La profesión de Botánico es especialista en recursos naturales. Mientras cazas, brotan arbustos por el suelo de la caza; al pasar cerca, los cosechas automáticamente obteniendo Fresh Herbs y Wild Herbs.',
        proTips: [
          'Con estas hierbas puedes craftear Berries especiales de combate: Wild Rovia Berry (+80% de curación de poções), Wild Babiri Berry (-10% de daño de tipo Acero), Wild Chilan Berry (-10% daño Normal), etc.',
          'Cuenta con un árbol de talentos propio (Botanist Talents) donde puedes desbloquear bayas protectoras de cada elemento y chips de sanación neutral.',
          'Rangos de Botánico: E (Aprendiz), D (Cultivador), C (Especialista), B (Naturalista), A (Herborista), S (Gran Botánico).'
        ]
      },
      {
        heading: 'Entrenador de Prestigio: Fotos de Shinies y Multiplicador de Captura',
        text: 'El Entrenador de Prestigio cuenta con una mecánica única: cada vez que un Pokémon Shiny aparece en tu cacería, le tomas automáticamente una fotografía y recibes 1 "Rare Pokémon Picture", el objeto exclusivo para subir de rango.',
        formula: 'Bono directo de captura: Cada rango aumenta el multiplicador directo de captura en +3% acumulativo (hasta ×1.18 en rango S).',
        proTips: [
          'Rangos de Prestigio: E (Aprendiz), D (Aventurero), C (Especialista), B (Élite), A (Campeón), S (Maestro Pokémon).',
          'Las profesiones de Científico e Investigador Pokémon están actualmente en desarrollo por el equipo del juego.'
        ]
      }
    ]
  },
  {
    id: 'tms-aoe-ditto-shiny',
    order: '09',
    title: 'Discos TM, AoE TM Disk, Ditto y Shiny Cards',
    summary: 'Aprende cómo funciona el golpe de área de 12×12, las reglas de transformación de Ditto y el sacrificio en el Altar.',
    readingTime: '5 min',
    difficulty: 'Avanzado',
    content: [
      {
        heading: 'AoE TM Disk: Splash en Cuadrícula 12×12',
        text: 'El AoE TM Disk es uno de los objetos más codiciados del juego: no enseña un golpe nuevo, sino que hace que TODOS los golpes normales del Pokémon salpiquen a cada salvaje dentro del cuadro de 12×12 alrededor del líder.',
        proTips: [
          'Cualquier Pokémon de etapa final puede aprenderlo.',
          'NO disputa el slot del TM elemental: un mismo Pokémon puede llevar equipado el nuke elemental en área y el AoE splash al mismo tiempo.'
        ]
      },
      {
        heading: 'Ditto Normal vs Shiny Ditto',
        text: 'Ditto se une al equipo a Nivel 1 con estadísticas FIJAS para todos los jugadores: IVs 15/15/15/15/14/15 (total 89) y Calidad 1.4.',
        proTips: [
          'Ditto Normal: Al colocarlo como líder, puede transformarse en casi cualquier especie durante 12 horas. Tiene una penalización de -25% de ATQ, Sp.Atk, DEF y Sp.Def (Vida y Velocidad intactas). No puede copiar legendarios ni usar TMs.',
          'Shiny Ditto: ¡La transformación es PERMANENTE y puedes alternarla cuando quieras! Además, cuenta con una penalización reducida (-20% ATQ/Sp.Atk y -25% HP/DEF/Sp.Def).'
        ]
      },
      {
        heading: 'Shiny Cards y el Altar',
        text: 'Al derrotar a un Shiny salvaje en las cazas, existe una probabilidad de que dropee el Shiny Card de su especie. Sacrificar ese Card en el Altar te permite invocar la versión Shiny de la especie para librar un combate e intentar su captura directa.',
        warning: 'El Card se consume en el sacrificio incluso si el Shiny resiste la Poké Ball o escapa.'
      }
    ]
  }
];
