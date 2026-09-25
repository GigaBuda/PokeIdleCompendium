// ==UserScript==
// @name         PokeIdleLab IV Calculator
// @namespace    poke-idle-lab
// @version      1.0.1
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
      spa: ["spa", "specialAttack", "special-attack", "baseSpA", "baseSpecialAttack"],
      spd: ["spd", "specialDefense", "special-defense", "baseSpD", "baseSpecialDefense"],
      vel: ["vel", "speed", "baseVel", "baseSpeed"]
    };
    for (const k of aliases[key] || []) {
      if (c[k] != null && Number.isFinite(Number(c[k]))) return Number(c[k]);
      if (c.stats && c.stats[k] != null && Number.isFinite(Number(c.stats[k]))) return Number(c.stats[k]);
      if (c.baseStats && c.baseStats[k] != null && Number.isFinite(Number(c.baseStats[k]))) return Number(c.baseStats[k]);
    }
    return 0;
  }

  async function loadCreatures() {
    try {
      const r = await fetch("/game/creatures.json");
      if (!r.ok) return;
      const d = await r.json();
      creatures = Array.isArray(d?.creatures) ? d.creatures : [];
    } catch {}
  }

  function parseTooltip(text) {
    const lines = String(text || "").split(/\n+/).map(s => s.trim()).filter(Boolean);
    if (!lines.length) return null;

    const levelMatch = text.match(/(?:Lv\.?|Nivel|Nível)\s*(\d+)/i);
    const qualityMatch = text.match(/(?:×|x)\s*(\d+(?:[.,]\d+)?)/);
    const ivMatch = text.match(/(?:IV)\s*(\d+)\s*\/\s*(\d+)/i);
    const powerMatch = text.match(/(?:Poder|Power)\s*[:\-]?\s*(\d+)/i);

    const nameLine = lines.find(x => !/(?:Lv\.?\s*\d+|IV\s*\d+|Qualidade|Raridade|Poder|Power|×|x\s*\d)/i.test(x));
    const name = nameLine || lines[0];
    const level = levelMatch ? Number(levelMatch[1]) : 1;
    const quality = qualityMatch ? Number(qualityMatch[1].replace(",", ".")) : 1;

    const keys = ["hp", "atk", "def", "spa", "spd", "vel"];
    const actuals = {};
    for (const k of keys) {
      const label = {
        hp: "(?:HP|Vida)",
        atk: "(?:ATK|Atk|Ataque)",
        def: "(?:DEF|Def|Defesa)",
        spa: "(?:SpA|SPA|Sp\.\s*A|Ataque\s*especial)",
        spd: "(?:SpD|SPD|Sp\.\s*D|Defesa\s*especial)",
        vel: "(?:VEL|Vel|Speed|Velocidade)"
      }[k];
      const m = text.match(new RegExp(label + "\\s*[:=]?\\s*(\\d+)", "i"));
      if (m) actuals[k] = Number(m[1]);
    }

    // Fallback: many game tooltips expose six stat numbers in order.
    if (Object.keys(actuals).length < 6) {
      const statRows = Array.from(document.querySelectorAll(".inv-tip .stat, .inv-tip [class*='stat']")).map(e => e.textContent || "");
      const found = statRows.map(s => s.match(/(\d+)/)?.[1]).filter(Boolean).map(Number);
      if (found.length >= 6) keys.forEach((k, i) => { if (actuals[k] == null) actuals[k] = found[i]; });
    }

    if (!name || !Number.isFinite(level)) return null;
    return {
      name: name.replace(/\s+(?:Lv\.?\s*\d+).*$/i, "").trim(),
      level, quality,
      ivObserved: ivMatch ? Number(ivMatch[1]) : null,
      ivMax: ivMatch ? Number(ivMatch[2]) : 192,
      powerGame: powerMatch ? Number(powerMatch[1]) : 0,
      actuals
    };
  }


  function spriteUrls(creature, pokemon) {
    const rawId = Number(creature?.id ?? creature?.dexId ?? creature?.nationalId ?? 0);
    if (!rawId) return { anim: pokemon?.spriteSrc || "", still: pokemon?.spriteSrc || "" };
    const id = rawId >= 13000 && rawId < 14000 ? rawId - 13000 : rawId;
    const shiny = /shiny/i.test(pokemon?.name || "") || Number(pokemon?.quality) > 1.8;
    const folder = shiny ? "shiny/" : "";
    const base = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
    return {
      anim: `${base}/versions/generation-v/black-white/animated/${folder}${id}.gif`,
      still: `${base}/${folder}${id}.png`
    };
  }

  function typeName(creature) {
    const value = creature?.type ?? creature?.types ?? creature?.element ?? "";
    if (Array.isArray(value)) return String(value[0] || "");
    return String(value || "").split(/[\\/,]/)[0].trim();
  }

  function calculate(p) {
    const c = findCreature(p.name);
    const bases = {};
    const ivs = {};
    const stats = {};
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
      rawMoves.slice(0, 12).forEach(m => {
        if (typeof m === "string") moves.push({ name: m });
        else if (m) moves.push({
          name: m.name || m.moveName || m.move || m.id || "?",
          power: m.power ?? m.basePower ?? m.damage ?? null,
          type: m.type || m.element || "",
          level: m.learnLevel ?? m.level ?? m.lvl ?? null
        });
      });
    }

    const sprites = spriteUrls(c, p);
    return {
      ...p, creature: c, bases, stats, ivs, total, pct, classification, classColor,
      power: Math.round(power), moves, type: typeName(c), spriteAnim: sprites.anim, spriteStill: sprites.still
    };
  }

  function createPanel() {
    if (document.getElementById(CFG.panelId)) return;
    const style = document.createElement("style");
    style.textContent = `
      #${CFG.panelId}{position:fixed;z-index:2147483647;top:80px;right:18px;width:390px;max-height:calc(100vh - 100px);overflow:auto;background:#101622;color:#f0f4f9;border:1px solid rgba(255,255,255,.09);border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.55);font:12px Arial,sans-serif;display:none}
      #${CFG.panelId} *{box-sizing:border-box} .pil-head{position:sticky;top:0;z-index:2;background:#101622;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:space-between;cursor:move}
      .pil-title{font-size:16px;font-weight:800}.pil-close{border:1px solid rgba(255,255,255,.12);background:#151d2a;color:#dce5ef;border-radius:8px;width:28px;height:28px;cursor:pointer}
      .pil-body{padding:12px}.pil-top{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px}.pil-box{background:#0b1019;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:9px}.pil-label{font-size:8px;text-transform:uppercase;color:#8392a7;letter-spacing:.6px}.pil-value{font-size:17px;font-weight:900;margin-top:3px}
      .pil-rating{display:flex;gap:12px;align-items:center;margin:10px 0;padding:10px;background:#0b1019;border:1px solid rgba(255,255,255,.07);border-radius:10px}.pil-ring{width:55px;height:55px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--c) calc(var(--p)*1%),#202938 0)}.pil-ring:after{content:"";width:43px;height:43px;background:#0b1019;border-radius:50%;position:absolute}.pil-ring span{position:relative;z-index:1;font-weight:900}
      .pil-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.pil-stat{background:#0b1019;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:8px}.pil-stat-name{font-weight:900;color:var(--c)}.pil-iv{font-size:17px;font-weight:900;margin:3px 0}.pil-input{width:100%;background:#121a27;color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:5px}.pil-base{font-size:9px;color:#8392a7;margin-top:4px}
      .pil-section{font-size:9px;color:#8392a7;text-transform:uppercase;letter-spacing:1px;margin:13px 0 7px}.pil-move{display:flex;justify-content:space-between;align-items:center;padding:7px 8px;border-radius:8px;background:#0b1019;border:1px solid rgba(255,255,255,.06);margin-bottom:5px}.pil-type{font-size:9px;padding:2px 6px;border-radius:8px;background:#283449;color:#fff;margin-right:6px}.pil-muted{color:#8392a7}
    `;
    style.textContent += "\n      #pokeidlelab-iv-panel{width:540px;top:48px;background:linear-gradient(180deg,#0d141f 0%,#09101a 100%);box-shadow:0 24px 70px rgba(0,0,0,.65),0 0 0 1px rgba(70,150,255,.04)}\n      #pokeidlelab-iv-panel .pil-hero{display:grid;grid-template-columns:160px 1fr;gap:12px;align-items:center;min-height:150px}\n      #pokeidlelab-iv-panel .pil-sprite-wrap{height:150px;border-radius:14px;background:radial-gradient(circle at 50% 55%,rgba(255,65,55,.20),transparent 55%),linear-gradient(180deg,#111a28,#09101a);border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}\n      #pokeidlelab-iv-panel .pil-sprite-wrap:after{content:\"\";position:absolute;width:112px;height:20px;bottom:18px;border-radius:50%;background:radial-gradient(ellipse,rgba(255,72,72,.65),rgba(255,72,72,0) 70%);filter:blur(5px)}\n      #pokeidlelab-iv-panel .pil-sprite{position:relative;z-index:2;width:128px;height:128px;object-fit:contain;filter:drop-shadow(0 8px 10px rgba(0,0,0,.55));animation:pil-float 2.1s ease-in-out infinite}\n      #pokeidlelab-iv-panel .pil-name-row{display:flex;align-items:center;gap:8px;margin-bottom:7px}\n      #pokeidlelab-iv-panel .pil-name{font-size:23px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n      #pokeidlelab-iv-panel .pil-id{margin-left:auto;color:#7e8ba0;font-size:12px}\n      #pokeidlelab-iv-panel .pil-type-badge{display:inline-flex;padding:4px 12px;border-radius:999px;background:#ef3f39;color:#fff;font-size:10px;font-weight:900;margin-bottom:9px}\n      #pokeidlelab-iv-panel .pil-stat-head{display:flex;justify-content:space-between;align-items:center}\n      #pokeidlelab-iv-panel .pil-bar{height:6px;border-radius:999px;background:#202a38;margin:6px 0 7px;overflow:hidden}\n      #pokeidlelab-iv-panel .pil-bar>i{display:block;height:100%;width:var(--w);background:var(--c);border-radius:inherit}\n      #pokeidlelab-iv-panel .pil-footer{display:flex;justify-content:space-between;color:#8391a5;font-size:10px;padding:8px 2px 1px}\n      #pokeidlelab-iv-panel .pil-footer b{color:#e6ebf1;font-size:12px}\n      @keyframes pil-float{0%,100%{transform:translateY(2px)}50%{transform:translateY(-7px)}}\n";
    document.head.appendChild(style);

    const panel = document.createElement("div");
    panel.id = CFG.panelId;
    panel.innerHTML = `
      <div class="pil-head" id="pil-drag"><div class="pil-title">🧮 PokeIdleLab IV</div><button class="pil-close">×</button></div>
      <div class="pil-body" id="pil-content"></div>`;
    document.body.appendChild(panel);
    panel.querySelector(".pil-close").onclick = () => panel.style.display = "none";

    const head = panel.querySelector("#pil-drag");
    head.addEventListener("mousedown", e => {
      if (e.target.closest("button")) return;
      dragging = true;
      const r = panel.getBoundingClientRect();
      panel.dataset.dx = String(e.clientX - r.left);
      panel.dataset.dy = String(e.clientY - r.top);
      panel.style.right = "auto";
      panel.style.left = r.left + "px";
      panel.style.top = r.top + "px";
      e.preventDefault();
    });
    document.addEventListener("mousemove", e => {
      if (!dragging) return;
      panel.style.left = Math.max(0, Math.min(innerWidth - panel.offsetWidth, e.clientX - Number(panel.dataset.dx))) + "px";
      panel.style.top = Math.max(0, Math.min(innerHeight - 50, e.clientY - Number(panel.dataset.dy))) + "px";
    });
    document.addEventListener("mouseup", () => { dragging = false; saveState(); });
    restoreState();
  }

  function render(p) {
    const data = calculate(p);
    current = data;
    const content = document.getElementById("pil-content");
    const panel = document.getElementById(CFG.panelId);
    if (!content || !panel) return;

    const statCards = Object.keys(CFG.statLabels).map(k => `
      <div class="pil-stat" style="--c:${CFG.colors[k]}">
        <div class="pil-stat-head"><span class="pil-stat-name">${CFG.statLabels[k]}</span><span class="pil-iv">${data.ivs[k].toFixed(1)}/32</span></div>
        <div class="pil-bar"><i style="--w:${Math.max(0, Math.min(100, data.ivs[k] / 32 * 100))}%"></i></div>
        <input class="pil-input" data-stat="${k}" type="number" value="${data.stats[k] || ""}" />
        <div class="pil-base">base ${data.bases[k] || "?"}</div>
      </div>`).join("");

    const moves = data.moves.length ? data.moves.map(m => `
      <div class="pil-move"><div><span class="pil-type">${esc(m.type || "—")}</span><b>${esc(m.name)}</b></div><div><span class="pil-muted">${m.level != null ? "Nv " + m.level : ""}</span> <b>${m.power != null ? m.power : "—"}</b></div></div>`).join("") : '<div class="pil-muted">No se encontraron golpes en creatures.json.</div>';

    content.innerHTML = `
      <div class="pil-hero">
        <div class="pil-sprite-wrap">
          <img class="pil-sprite" src="${esc(data.spriteAnim || data.spriteSrc || "")}" data-fallback="${esc(data.spriteStill || data.spriteSrc || "")}" alt="${esc(data.name)}" onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback}else{this.style.display='none'}">
        </div>
        <div>
          <div class="pil-name-row"><div class="pil-name">${esc(data.name)}</div><div class="pil-id">${data.creature?.id ? "#" + String(data.creature.id).padStart(4,"0") : ""}</div></div>
          <div class="pil-type-badge">${esc((data.type || "POKÉMON").toUpperCase())}</div>
          <div class="pil-top">
            <div class="pil-box"><div class="pil-label">Nivel</div><div class="pil-value">${data.level}</div></div>
            <div class="pil-box"><div class="pil-label">Calidad</div><div class="pil-value">${data.quality.toFixed(2).replace(".", ",")}</div></div>
            <div class="pil-box"><div class="pil-label">IV Total</div><div class="pil-value" style="color:#32e2dc">${data.total}<span class="pil-muted">/192</span></div></div>
          </div>
          <div class="pil-box" style="margin-top:7px"><div class="pil-label">Poder estimado</div><div class="pil-value" style="color:#ffc52f">${data.power}</div></div>
        </div>
      </div>
      <div class="pil-rating">
        <div class="pil-ring" style="--p:${data.pct};--c:${data.classColor}"><span>${Math.round(data.pct)}%</span></div>
        <div><div style="font-size:18px;font-weight:900;color:${data.classColor}">${data.classification}</div><div class="pil-muted">${data.total} / 192 · Poder ${data.power}</div></div>
      </div>
      <div class="pil-section">Atributos e IV por stat <span class="pil-muted">(${data.pct.toFixed(1)}%)</span></div>
      <div class="pil-grid">${statCards}</div>
      <div class="pil-section">Golpes</div>
      <div>${moves}</div>
      <div class="pil-footer"><span>Poder en el juego: <b>${data.powerGame || data.power}</b></span><span>PokeIdleLab IV Calculator&nbsp; v1.0.1</span></div>`;

    content.querySelectorAll("[data-stat]").forEach(input => input.addEventListener("input", () => {
      const k = input.dataset.stat;
      current.stats[k] = Number(input.value) || 0;
      render(current);
    }));
    panel.style.display = "block";
    exposeToPokeGrid(data);
  }

  function exposeToPokeGrid(data) {
    try {
      window.__pgIv = window.__pgIv || {};
      window.__pgIv.calc = async () => ({
        nome: data.name, nivel: data.level, qualidade: data.quality,
        ivs: data.ivs, ivTotal: data.total, ivMax: 192, percentual: data.pct,
        classificacao: data.classification, poder: data.power, poderJogo: data.powerGame,
        bases: data.bases, atuais: data.stats,
        golpes: data.moves
      });
      window.__pgIv.reportar = async () => console.log("__PGIV__" + JSON.stringify(await window.__pgIv.calc()));
      window.__pgIv.reportar();
    } catch {}
  }

  function saveState() {
    try {
      const p = document.getElementById(CFG.panelId);
      if (!p) return;
      localStorage.setItem(CFG.storageKey, JSON.stringify({ left:p.style.left, top:p.style.top, right:p.style.right }));
    } catch {}
  }

  function restoreState() {
    try {
      const s = JSON.parse(localStorage.getItem(CFG.storageKey) || "null");
      const p = document.getElementById(CFG.panelId);
      if (!p || !s) return;
      if (s.left) p.style.left = s.left;
      if (s.top) p.style.top = s.top;
      if (s.right) p.style.right = s.right;
    } catch {}
  }

  function observeTooltips() {
    const hide = () => {
      const panel = document.getElementById(CFG.panelId);
      if (panel) panel.style.display = "none";
      lastPokemonTooltip = null;
      lastText = "";
    };

    const scan = () => {
      const tips = Array.from(document.querySelectorAll(".inv-tip"));
      // A calculadora só existe enquanto existe um tooltip de Pokémon.
      // Se o tooltip for de item/recurso, parseTooltip() devolve null.
      let found = false;

      for (const tip of tips) {
        const text = tip.innerText || "";
        if (!text) continue;

        const parsed = parseTooltip(text);
        if (!parsed) continue;

        const img = tip.querySelector("img");
        parsed.spriteSrc = img?.currentSrc || img?.src || "";

        found = true;
        if (tip !== lastPokemonTooltip || text !== lastText) {
          lastPokemonTooltip = tip;
          lastText = text;
          render(parsed);
        }
        break;
      }

      if (!found) hide();
    };

    new MutationObserver(scan).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });

    // O tooltip é criado/destruído pelo jogo quando o mouse entra/sai
    // do Pokémon. Não deixamos o painel persistir depois que o mouse saiu.
    document.addEventListener("mouseover", e => {
      const tip = e.target.closest && e.target.closest(".inv-tip");
      if (tip) setTimeout(scan, 0);
    }, true);

    document.addEventListener("mouseout", e => {
      const tip = e.target.closest && e.target.closest(".inv-tip");
      if (tip && (!e.relatedTarget || !tip.contains(e.relatedTarget))) {
        setTimeout(scan, 30);
      }
    }, true);

    setInterval(scan, 150);
  }

  async function init() {
    createPanel();
    await loadCreatures();
    observeTooltips();
    console.log("[PokeIdleLab IV] addon cargado");
  }

  init();
})();