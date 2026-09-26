// ==UserScript==
// @name         PokeIdleLab Calculator
// @namespace    poke-idle-lab
// @version      1.0.9
// @description  Calculadora de IV para Poke Idle World, integrada con PokeGrid
// @match        https://poke.idleworld.online/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const CFG = {
    panelId: "pokeidlelab-iv-panel",
    storageKey: "pokeidlelab-iv-panel-state",
    maxIV: 32,
    maxTotal: 192,
    exponents: { hp: 0.95, atk: 0.80, def: 0.80, spa: 0.80, spd: 0.80, vel: 0.95 },
    statLabels: { hp: "HP", atk: "ATK", def: "DEF", spa: "SpA", spd: "SpD", vel: "VEL" },
    colors: { hp: "#55e6d3", atk: "#ff8c42", def: "#ffd84f", spa: "#5ca9ff", spd: "#55e6d3", vel: "#ff70b8" }
  };

  let creatures = [];
  let current = null;
  let lastText = "";
  let dragging = false;
  let lastPokemonTooltip = null;
  let activeTab = "iv";
  let farmVip = true;
  let farmDoubleXp = true;

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const num = v => Number(String(v ?? "").replace(",", ".").replace(/[^\d.-]/g, ""));
  const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/shiny/g, "").replace(/[^a-z0-9]+/g, " ").trim();

  function estimateIV(actual, base, level, quality, exponent) {
    const factor = (level / 100) * Math.pow(quality, exponent);
    if (!factor || !Number.isFinite(actual) || !Number.isFinite(base)) return 0;
    return Math.max(0, Math.min(32, ((actual / factor) - base) / 2));
  }

  function finalStat(base, iv, level, quality, exponent) {
    return Math.round((base + 2 * iv) * (level / 100) * Math.pow(quality, exponent));
  }

  function classify(pct) {
    if (pct >= 95) return ["Excepcional", "#61f6a4"];
    if (pct >= 85) return ["Excelente", "#55e6d3"];
    if (pct >= 72) return ["Muito Bom", "#5ed7b9"];
    if (pct >= 58) return ["Bom", "#69b7ff"];
    if (pct >= 42) return ["Mediano", "#f1c644"];
    return ["Fraco", "#f05a62"];
  }

  function findCreature(name) {
    const n = norm(name);
    return creatures.find(c => norm(c.name) === n)
      || creatures.find(c => norm(c.name).includes(n) || n.includes(norm(c.name)))
      || null;
  }

  function creatureBase(c, key) {
    if (!c) return 0;
    const aliases = {
      hp: ["hp", "baseHp", "baseHP"],
      atk: ["atk", "attack", "baseAtk", "baseAttack"],
      def: ["def", "defense", "baseDef", "baseDefense"],
      spa: ["spa", "spatk", "spAtk", "spAttack", "specialAttack", "special-attack", "special_attack", "baseSpA", "baseSpa", "baseSpAtk", "baseSpAttack", "baseSpecialAttack"],
      spd: ["spd", "spdef", "spDef", "spDefense", "specialDefense", "special-defense", "special_defense", "baseSpD", "baseSpd", "baseSpDef", "baseSpDefense", "baseSpecialDefense"],
      vel: ["vel", "spe", "speed", "baseVel", "baseSpe", "baseSpeed"]
    };
    for (const k of aliases[key] || []) {
      if (c?.[k] != null && Number.isFinite(+c[k])) return +c[k];
      if (c?.stats?.[k] != null && Number.isFinite(+c.stats[k])) return +c.stats[k];
      if (c?.baseStats?.[k] != null && Number.isFinite(+c.baseStats[k])) return +c.baseStats[k];
    }
    return 0;
  }

  async function load() {
    try {
      const r = await fetch("/game/creatures.json");
      if (r.ok) {
        const d = await r.json();
        creatures = Array.isArray(d?.creatures) ? d.creatures : [];
      }
    } catch {}
  }

  function parse(text) {
    const lines = String(text || "").split(/\n+/).map(x => x.trim()).filter(Boolean);
    if (!lines.length) return null;
    const lm = text.match(/(?:Lv\.?|Nivel|Nível)\s*(\d+)/i), qm = text.match(/(?:×|x)\s*(\d+(?:[.,]\d+)?)/), im = text.match(/IV\s*(\d+)\s*\/\s*(\d+)/i), pm = text.match(/(?:Poder|Power)\s*[:\-]?\s*(\d+)/i);
    const nl = lines.find(x => !/(?:Lv\.?\s*\d+|IV\s*\d+|Qualidade|Raridade|Poder|Power|×|x\s*\d)/i.test(x)) || lines[0];
    const name = nl.replace(/^(?:LOOT|ITEM|POK[EÉ] BALL|POK[EÉ]BALL|RECURSO)\s*/i, "").replace(/\s+(?:LOOT|ITEM|POK[EÉ] BALL|POK[EÉ]BALL|RECURSO)\s*$/i, "").replace(/\s+x\s*\d+\s*$/i, "").trim();
    if (!creatures.some(c => norm(c.name) === norm(name))) return null;
    const actuals = {};
    for (const k of Object.keys(CFG.statLabels)) {
      const lab = { hp:"(?:HP|Vida)", atk:"(?:ATK|Atk|Ataque)", def:"(?:DEF|Def|Defesa)", spa:"(?:SpA|SPA|Sp\\.\\s*A|Ataque\\s*especial)", spd:"(?:SpD|SPD|Sp\\.\\s*D|Defesa\\s*especial)", vel:"(?:VEL|Vel|Speed|Velocidade)" }[k], m = text.match(new RegExp(lab + "\\s*[:=]?\\s*(\\d+)", "i"));
      if (m) actuals[k] = +m[1];
    }
    return { name, level: lm ? +lm[1] : 1, quality: qm ? +qm[1].replace(",", ".") : 1, ivObserved: im ? +im[1] : null, powerGame: pm ? +pm[1] : 0, actuals };
  }

  function calculate(p) {
    const c = findCreature(p.name);
    const bases = {}, ivs = {}, stats = {};
    let sum = 0;
    for (const k of Object.keys(CFG.statLabels)) {
      bases[k] = creatureBase(c, k);
      stats[k] = Number(p.actuals[k] ?? 0);
      ivs[k] = bases[k] && stats[k] ? estimateIV(stats[k], bases[k], p.level, p.quality, CFG.exponents[k]) : 0;
      sum += ivs[k];
    }
    const total = Number.isFinite(p.ivObserved) && p.ivObserved > 0 ? p.ivObserved : Math.ceil(sum);
    const pct = Math.max(0, Math.min(100, (total / CFG.maxTotal) * 100));
    const [classification, classColor] = classify(pct);
    const power = Object.keys(CFG.statLabels).reduce((s, k) => s + stats[k], 0) * p.quality;
    const moves = [];
    const rawMoves = c && (c.moves || c.attacks || c.skills || c.spells);
    if (Array.isArray(rawMoves)) {
      rawMoves.forEach(m => {
        if (typeof m === "string") moves.push({ name: m, level: null });
        else if (m) moves.push({ name: m.name || m.moveName || m.move || m.id || "?", power: m.power ?? m.basePower ?? m.damage ?? null, type: m.type || m.element || "", level: m.learnLevel ?? m.learn_level ?? m.level ?? m.lvl ?? null });
      });
      moves.forEach((m, index) => { m._order = index; });
      moves.sort((a, b) => {
        const la = Number(a.level), lb = Number(b.level);
        const va = Number.isFinite(la) ? la : Number.POSITIVE_INFINITY;
        const vb = Number.isFinite(lb) ? lb : Number.POSITIVE_INFINITY;
        return (va - vb) || (a._order - b._order);
      });
      moves.forEach(m => delete m._order);
      moves.splice(12);
    }
    const sprites = spriteUrls(c, p);
    const cachedId = Number(c?.id ?? c?.dexId ?? c?.nationalId ?? 0) || getCachedSpriteId(p.name);
    const cachedSprites = cachedId ? spriteUrls({ id: cachedId }, p) : { anim: "", still: "" };
    return { ...p, creature: c, bases, stats, ivs, total, pct, classification, classColor, power: Math.round(power), moves, type: typeName(c), spriteAnim: sprites.anim || cachedSprites.anim, spriteStill: sprites.still || cachedSprites.still };
  }

  function createPanel() {
    if (document.getElementById(CFG.panelId)) return;
    const style = document.createElement("style");
    style.textContent = `
      #${CFG.panelId}{position:fixed;z-index:2147483647;top:20px;right:10px;width:555px;max-height:calc(100vh - 28px);overflow:auto;background:#0c121a;color:#e9eef5;border:1px solid rgba(255,255,255,.08);border-radius:10px;box-shadow:0 22px 65px rgba(0,0,0,.72),0 0 0 1px rgba(255,90,50,.05);font:12px Arial,sans-serif;display:none}
      #${CFG.panelId} *{box-sizing:border-box}
      #${CFG.panelId} .pil-head{display:none}
      #${CFG.panelId} .pil-body{padding:0 12px 10px}
      #${CFG.panelId} .pil-hero{display:grid;grid-template-columns:66px 1fr auto;gap:10px;align-items:center;min-height:82px;padding:8px 2px 9px;border-bottom:1px solid rgba(255,255,255,.08)}
      #${CFG.panelId} .pil-sprite-wrap{width:66px;height:66px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
      #${CFG.panelId} .pil-sprite{position:relative;z-index:2;width:70px;height:70px;object-fit:contain;filter:drop-shadow(0 5px 7px rgba(0,0,0,.55));animation:pil-float 2.4s ease-in-out infinite}
      #${CFG.panelId} .pil-name-row{display:flex;align-items:baseline;gap:8px;min-width:0;margin-bottom:4px}
      #${CFG.panelId} .pil-name{font-size:18px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #${CFG.panelId} .pil-id{color:#7f8b9b;font-size:10px;white-space:nowrap}
      #${CFG.panelId} .pil-type-badge{display:inline-flex;padding:4px 11px;border-radius:999px;background:#f07b2d;color:#10151b;font-size:10px;font-weight:900;margin-top:1px}
      #${CFG.panelId} .pil-head-actions{display:flex;gap:6px}
      #${CFG.panelId} .pil-head-btn{width:30px;height:30px;border:1px solid rgba(255,255,255,.12);background:#111922;color:#cdd6e0;border-radius:8px;cursor:pointer;font-size:14px}
      #${CFG.panelId} .pil-head-btn:hover{background:#17212d}
      #${CFG.panelId} .pil-top{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:10px}
      #${CFG.panelId} .pil-box{background:#0e151e;border:1px solid rgba(255,255,255,.09);border-radius:9px;padding:8px 9px;min-width:0}
      #${CFG.panelId} .pil-label{font-size:8px;text-transform:uppercase;color:#7f8b9b;letter-spacing:.6px}
      #${CFG.panelId} .pil-value{font-size:16px;font-weight:900;margin-top:4px}
      #${CFG.panelId} .pil-rating{display:flex;gap:13px;align-items:center;margin:10px 0;padding:10px 12px;background:#101820;border:1px solid rgba(255,255,255,.09);border-radius:9px}
      #${CFG.panelId} .pil-ring{width:54px;height:54px;flex:0 0 54px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--c) calc(var(--p)*1%),#27313d 0);position:relative}
      #${CFG.panelId} .pil-ring:after{content:"";width:42px;height:42px;background:#101820;border-radius:50%;position:absolute}
      #${CFG.panelId} .pil-ring span{position:relative;z-index:1;font-weight:900;font-size:12px}
      #${CFG.panelId} .pil-rating-title{font-size:11px;font-weight:800}
      #${CFG.panelId} .pil-rating-sub{font-size:10px;color:#8390a0;margin-top:4px}
      #${CFG.panelId} .pil-section{font-size:9px;color:#7f8b9b;text-transform:uppercase;letter-spacing:.8px;margin:12px 1px 7px}
      #${CFG.panelId} .pil-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
      #${CFG.panelId} .pil-stat{background:#0e151e;border:1px solid rgba(255,255,255,.09);border-radius:9px;padding:8px}
      #${CFG.panelId} .pil-stat-head{display:flex;justify-content:space-between;align-items:center}
      #${CFG.panelId} .pil-stat-name{font-weight:900;color:var(--c)}
      #${CFG.panelId} .pil-iv{font-size:13px;font-weight:900;color:var(--c)}
      #${CFG.panelId} .pil-bar{height:5px;border-radius:999px;background:#202a34;margin:6px 0 7px;overflow:hidden}
      #${CFG.panelId} .pil-bar>i{display:block;height:100%;width:var(--w);background:var(--c);border-radius:inherit}
      #${CFG.panelId} .pil-input{width:100%;background:#101820;color:#edf2f7;border:1px solid rgba(255,255,255,.12);border-radius:6px;padding:5px;font-size:11px}
      #${CFG.panelId} .pil-base{font-size:9px;color:#7f8b9b;margin-top:4px}
      #${CFG.panelId} .pil-move{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 9px;border-radius:8px;background:#10171f;border:1px solid rgba(255,255,255,.08);margin-bottom:5px}
      #${CFG.panelId} .pil-move-main{display:flex;align-items:center;min-width:0}
      #${CFG.panelId} .pil-move-main b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #${CFG.panelId} .pil-type{font-size:9px;padding:3px 8px;border-radius:999px;background:#3a3f2e;color:#f4e7a7;margin-right:7px;font-weight:900}
      #${CFG.panelId} .pil-move-power{color:#ffad35;font-weight:900;min-width:32px;text-align:right}
      #${CFG.panelId} .pil-muted{color:#8390a0}
      #${CFG.panelId} .pil-footer{display:flex;justify-content:space-between;color:#778493;font-size:10px;padding:7px 2px 0}
      #${CFG.panelId} .pil-tabs{display:flex;gap:6px;padding:8px 0 0}
      #${CFG.panelId} .pil-tab{flex:1;border:1px solid rgba(255,255,255,.1);background:#111a24;color:#8e9bae;border-radius:7px;padding:7px 10px;font-weight:800;cursor:pointer}
      #${CFG.panelId} .pil-tab.active{color:#fff;border-color:#35ddd5;box-shadow:inset 0 0 0 1px rgba(53,221,213,.15)}
      #${CFG.panelId} .pil-farm-hero{padding:12px;background:#101820;border:1px solid rgba(85,230,211,.16);border-radius:10px;margin-top:9px}
      #${CFG.panelId} .pil-farm-title{font-size:16px;font-weight:900}.pil-farm-sub{color:#8e9bae;margin-top:3px;font-size:10px}
      #${CFG.panelId} .pil-farm-options{display:flex;gap:6px;margin:8px 0;flex-wrap:wrap}.pil-farm-opt{border:1px solid rgba(255,255,255,.1);background:#101925;color:#8e9bae;border-radius:999px;padding:5px 8px;font-size:10px;font-weight:800;cursor:pointer}.pil-farm-opt.on{color:#fff;border-color:#55e6d3;background:#12312f}
      #${CFG.panelId} .pil-farm-row{display:grid;grid-template-columns:28px 1fr auto;gap:8px;align-items:center;padding:8px;background:#0b1019;border:1px solid rgba(255,255,255,.06);border-radius:9px;margin-bottom:5px}
      #${CFG.panelId} .pil-farm-rank{font-weight:900;color:#55e6d3}.pil-farm-name{font-weight:900}.pil-farm-tag{margin-left:6px;color:#7f8b9b;font-size:9px}.pil-farm-meta{color:#8392a7;font-size:9px;margin-top:2px}.pil-farm-xp{text-align:right;font-weight:900;color:#55e6d3}.pil-farm-xp small{display:block;color:#8392a7;font-size:8px}
      @keyframes pil-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
      @media(max-width:700px){#${CFG.panelId}{width:calc(100vw - 12px);right:6px}.pil-grid{grid-template-columns:repeat(2,1fr)}.pil-top{grid-template-columns:repeat(2,1fr)}}
    `;
    document.head.appendChild(style);
    const p = document.createElement("div");
    p.id = CFG.panelId;
    p.innerHTML = '<div class="pil-head" id="pil-drag"><div class="pil-title">🧮 PokeIdleLab Calculator</div><button class="pil-close">×</button></div><div class="pil-body" id="pil-content"></div>';
    document.body.appendChild(p);
    const h = p.querySelector("#pil-drag");
    h.onmousedown = e => {
      dragging = true;
      const r = p.getBoundingClientRect();
      p.dataset.dx = e.clientX - r.left;
      p.dataset.dy = e.clientY - r.top;
      p.style.right = "auto";
    };
    document.addEventListener("mousemove", e => {
      if (dragging) { p.style.left = Math.max(0, e.clientX - p.dataset.dx) + "px"; p.style.top = Math.max(0, e.clientY - p.dataset.dy) + "px"; }
    });
    document.addEventListener("mouseup", () => dragging = false);
  }

  function render(p) {
    const data = calculate(p);
    current = data;
    const content = document.getElementById("pil-content");
    const panel = document.getElementById(CFG.panelId);
    if (!content || !panel) return;
    panel.style.display = "block";
    let farmRows = [];
    try { farmRows = optimizeFarm(data); } catch (err) { console.warn("[PokeIdleLab IV] Farm optimizer error:", err); }
    const farmHtml = farmRows.length ? farmRows.map((r,i) => '<div class="pil-farm-row"><div class="pil-farm-rank">#' + (i + 1) + '</div><div><div class="pil-farm-name">' + esc(r.target.name) + '<span class="pil-farm-tag">Hunt ' + r.huntLevel + '</span></div><div class="pil-farm-meta">' + esc(r.move.name) + ' · ' + r.hits + ' golpe' + (r.hits === 1 ? "" : "s") + ' · ' + r.cycle.toFixed(1) + 's/ciclo · x' + r.eff + (r.source === "real" ? " · calibrado" : "") + '</div></div><div class="pil-farm-xp">+' + Math.round(r.xpHour).toLocaleString() + '<small>XP/h · ' + Math.round(r.killsPerHour).toLocaleString() + ' kills/h</small></div></div>').join("") : '<div class="pil-muted">No hay hunts compatibles con este Pokémon y su nivel.</div>';
    const farmControls = '<div class="pil-farm-options"><button class="pil-farm-opt ' + (farmVip ? "on" : "") + '" data-farm-toggle="vip">VIP +50% XP</button><button class="pil-farm-opt ' + (farmDoubleXp ? "on" : "") + '" data-farm-toggle="double">Evento XP ×2</button></div>';
    const statCards = Object.keys(CFG.statLabels).map(k => '<div class="pil-stat" style="--c:' + CFG.colors[k] + '"><div class="pil-stat-head"><span class="pil-stat-name">' + CFG.statLabels[k] + '</span><span class="pil-iv">' + data.ivs[k].toFixed(1) + '/32</span></div><div class="pil-bar"><i style="--w:' + Math.max(0, Math.min(100, data.ivs[k] / 32 * 100)) + '%"></i></div><input class="pil-input" data-stat="' + k + '" type="number" value="' + (data.stats[k] || "") + '" /><div class="pil-base">base ' + (data.bases[k] || "?") + '</div></div>').join("");
    const moves = data.moves.length ? data.moves.map(m => '<div class="pil-move"><div class="pil-move-main"><span class="pil-type">' + esc((m.type || "NORMAL").toUpperCase()) + '</span><b>' + esc(m.name) + '</b></div><div><span class="pil-muted">' + (m.level != null ? "Nv " + m.level : "") + '</span> <span class="pil-move-power">' + (m.power != null ? m.power : "—") + '</span></div></div>').join("") : '<div class="pil-muted">No se encontraron golpes en creatures.json.</div>';
    const sprite = data.spriteAnim || data.spriteStill || data.spriteSrc || "";
    const hero = '<div class="pil-hero" id="pil-drag"><div class="pil-sprite-wrap"><img class="pil-sprite" src="' + esc(sprite) + '" data-fallback="' + esc(data.spriteStill || data.spriteSrc || "") + '" alt="' + esc(data.name) + '" onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback}else{this.style.display=\'none\'}"></div><div><div class="pil-name-row"><div class="pil-name">' + esc(data.name) + '</div><div class="pil-id">' + (data.creature?.id ? "#" + String(data.creature.id).padStart(4,"0") : "") + '</div></div><div class="pil-type-badge">' + esc((data.type || "POKÉMON").toUpperCase()) + '</div></div><div class="pil-head-actions"><button class="pil-head-btn" data-pil-copy title="Copiar datos">⧉</button><button class="pil-head-btn" data-pil-close title="Cerrar">×</button></div></div>';
    const tabs = '<div class="pil-tabs"><button class="pil-tab ' + (activeTab === "iv" ? "active" : "") + '" data-pil-tab="iv">📊 IV / Stats</button><button class="pil-tab ' + (activeTab === "farm" ? "active" : "") + '" data-pil-tab="farm">⚔️ Farmear XP</button></div>';
    const ivHtml = '<div class="pil-top"><div class="pil-box"><div class="pil-label">Nivel</div><div class="pil-value">' + data.level + '</div></div><div class="pil-box"><div class="pil-label">Calidad</div><div class="pil-value">' + data.quality.toFixed(2).replace(".", ",") + '</div></div><div class="pil-box"><div class="pil-label">IV Total</div><div class="pil-value" style="color:#32e2dc">' + data.total + '<span class="pil-muted">/192</span></div></div><div class="pil-box"><div class="pil-label">Poder estimado</div><div class="pil-value" style="color:#ffc52f">' + data.power.toLocaleString() + '</div></div></div><div class="pil-rating"><div class="pil-ring" style="--p:' + data.pct + ';--c:' + data.classColor + '"><span>' + Math.round(data.pct) + '%</span></div><div><div class="pil-rating-title">' + data.classification + '</div><div class="pil-rating-sub">' + data.total + ' / 192 · Poder ' + data.power + '</div></div></div><div class="pil-section">Atributos e IV por stat <span class="pil-muted">(' + data.pct.toFixed(1) + '%)</span></div><div class="pil-grid">' + statCards + '</div><div class="pil-section">⚔ Golpes</div><div>' + moves + '</div><div class="pil-footer"><span>Poder en el juego: <b>' + (data.powerGame || data.power) + '</b></span><span>PokeIdleLab IV Calculator · v1.0.9</span></div>';
    const farmView = '<div class="pil-farm-hero"><div class="pil-farm-title">⚔️ Mejor sitio para farmear con ' + esc(data.name) + '</div><div class="pil-farm-sub">Mismo criterio del optimizador de PokeIdleLab: XP/h, golpes completos, debilidad elemental y hunts desbloqueadas.</div>' + farmControls + '</div><div class="pil-section">Ranking de presas</div><div>' + farmHtml + '</div><div class="pil-footer"><span>Jugador: <b>Nv ' + data.level + '</b> · IV ' + data.total + '/192 · Calidad ' + data.quality.toFixed(2) + '</span><span>PokeIdleLab Farm Optimizer · v1.0.9</span></div>';
    content.innerHTML = hero + tabs + (activeTab === "iv" ? ivHtml : farmView);
    content.querySelectorAll("[data-pil-tab]").forEach(button => button.addEventListener("click", () => { activeTab = button.dataset.pilTab === "farm" ? "farm" : "iv"; render(current); }));
    content.querySelectorAll("[data-farm-toggle]").forEach(button => button.addEventListener("click", () => { if (button.dataset.farmToggle === "vip") farmVip = !farmVip; if (button.dataset.farmToggle === "double") farmDoubleXp = !farmDoubleXp; render(current); }));
    content.querySelectorAll("[data-stat]").forEach(input => input.addEventListener("input", () => { const k = input.dataset.stat; current.stats[k] = Number(input.value) || 0; render(current); }));
    content.querySelector("[data-pil-close]")?.addEventListener("click", () => { panel.style.display = "none"; });
    content.querySelector("[data-pil-copy]")?.addEventListener("click", async () => { const text = data.name + " · Nv " + data.level + " · IV " + data.total + "/192 · Calidad " + data.quality.toFixed(2) + " · Poder " + data.power; try { await navigator.clipboard?.writeText(text); } catch {} });
    content.querySelector("#pil-drag").onmousedown = e => { if (e.target.closest("button")) return; dragging = true; const r = panel.getBoundingClientRect(); panel.dataset.dx = e.clientX - r.left; panel.dataset.dy = e.clientY - r.top; panel.style.right = "auto"; };
    exposeToPokeGrid(data);
    if (!data.spriteAnim && !data.spriteStill) resolveSpriteData(data);
  }

  function scan() {
    const tips = [...document.querySelectorAll(".inv-tip")].filter(t => { const s = getComputedStyle(t), r = t.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && +s.opacity > 0 && r.width > 0 && r.height > 0; });
    const tip = tips[0];
    if (!tip) return;
    const text = tip.innerText || "", p = parse(text);
    if (!p) { document.getElementById(CFG.panelId)?.style.setProperty("display", "none"); return; }
    p.spriteSrc = tip.querySelector("img")?.currentSrc || tip.querySelector("img")?.src || "";
    if (tip !== lastPokemonTooltip || text !== lastText) { lastPokemonTooltip = tip; lastText = text; current = p; render(p); }
  }

  new MutationObserver(scan).observe(document.body, { childList:true, subtree:true, characterData:true, attributes:true });
  document.addEventListener("mouseover", e => { if (e.target.closest?.(".inv-tip")) setTimeout(scan, 0); }, true);
  setInterval(scan, 250);
  createPanel();
  load();
})();
