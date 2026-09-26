// ==UserScript==
// @name         PokeIdleLab Calculator
// @namespace    poke-idle-lab
// @version      1.0.13
// @description  Calculadora de IV para Poke Idle World, integrada con PokeGrid
// @match        https://poke.idleworld.online/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
(function(){"use strict";
const CFG={panelId:"pokeidlelab-iv-panel",storageKey:"pokeidlelab-iv-panel-state",maxIV:32,maxTotal:192,exponents:{hp:.95,atk:.8,def:.8,spa:.8,spd:.8,vel:.95},statLabels:{hp:"HP",atk:"ATK",def:"DEF",spa:"SpA",spd:"SpD",vel:"VEL"},colors:{hp:"#55e6d3",atk:"#ff8c42",def:"#ffd84f",spa:"#5ca9ff",spd:"#55e6d3",vel:"#ff70b8"}};
let creatures=[],current=null,lastText="",lastPokemonTooltip=null,dragging=false,activeTab="iv",farmVip=true,farmDoubleXp=true;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/shiny/g,"").replace(/[^a-z0-9]+/g," ").trim();
function base(c,k){const a={hp:["hp","baseHp","baseHP"],atk:["atk","attack","baseAtk","baseAttack"],def:["def","defense","baseDef","baseDefense"],spa:["spa","spatk","spAtk","spAttack","specialAttack","baseSpA","baseSpecialAttack"],spd:["spd","spdef","spDef","spDefense","specialDefense","baseSpD","baseSpecialDefense"],vel:["vel","spe","speed","baseVel","baseSpeed"]};for(const x of a[k]||[]){if(c?.[x]!=null&&Number.isFinite(+c[x]))return+c[x];if(c?.stats?.[x]!=null&&Number.isFinite(+c.stats[x]))return+c.stats[x];if(c?.baseStats?.[x]!=null&&Number.isFinite(+c.baseStats[x]))return+c.baseStats[x]}return 0}
async function load(){try{const r=await fetch("/game/creatures.json");if(r.ok){const d=await r.json();creatures=Array.isArray(d?.creatures)?d.creatures:[]}}catch{}}
function parse(text){const raw=String(text||"");const lines=raw.split(/\n+/).map(x=>x.trim()).filter(Boolean);if(!lines.length)return null;
if(/(?:^|\n)\s*(?:LOOT|ITEM|RECURSO|POK[EÉ]\s*BALL|POK[EÉ]BALL)\b/i.test(raw)||/(?:\$\s*\d[\d.,]*|\d[\d.,]*\s*dollars?)\b/i.test(raw))return null;
const lm=raw.match(/(?:Lv\.?|Nivel|Nível)\s*(\d+)/i),qm=raw.match(/(?:×|x)\s*(\d+(?:[.,]\d+)?)/),im=raw.match(/IV\s*(\d+)\s*\/\s*(\d+)/i),pm=raw.match(/(?:Poder|Power)\s*[:\-]?\s*(\d+)/i);
const hasPokemonData=!!(lm||im||pm||/(?:Qualidade|Raridade|HP|Vida|ATK|Ataque|DEF|Defesa|SpA|SpD|VEL|Velocidade)\b/i.test(raw));if(!hasPokemonData)return null;
const nl=lines.find(x=>!/(?:Lv\.?\s*\d+|IV\s*\d+|Qualidade|Raridade|Poder|Power|×|x\s*\d)/i.test(x))||lines[0];
const name=nl.replace(/^(?:LOOT|ITEM|POK[EÉ] BALL|POK[EÉ]BALL|RECURSO)\s*/i,"").replace(/\s+(?:LOOT|ITEM|POK[EÉ] BALL|POK[EÉ]BALL|RECURSO)\s*$/i,"").replace(/\s+x\s*\d+\s*$/i,"").replace(/\s+×\s*\d+\s*$/i,"").trim();
if(!name||/^(?:LOOT|ITEM|RECURSO|POK[EÉ]\s*BALL|POK[EÉ]BALL)$/i.test(name)||!creatures.some(c=>norm(c.name)===norm(name)))return null;
const actuals={};for(const k of Object.keys(CFG.statLabels)){const lab={hp:"(?:HP|Vida)",atk:"(?:ATK|Atk|Ataque)",def:"(?:DEF|Def|Defesa)",spa:"(?:SpA|SPA|Sp\\.\\s*A|Ataque\\s*especial)",spd:"(?:SpD|SPD|Sp\\.\\s*D|Defesa\\s*especial)",vel:"(?:VEL|Vel|Speed|Velocidade)"}[k],m=raw.match(new RegExp(lab+"\\s*[:=]?\\s*(\\d+)","i"));if(m)actuals[k]=+m[1]}
return{name,level:lm?+lm[1]:1,quality:qm?+qm[1].replace(",","."):1,ivObserved:im?+im[1]:null,powerGame:pm?+pm[1]:0,actuals}}function calc(p){const c=creatures.find(x=>norm(x.name)===norm(p.name)),stats=p.actuals||{},ivs={};let sum=0;for(const k of Object.keys(CFG.statLabels)){const f=(p.level/100)*Math.pow(p.quality,CFG.exponents[k]);ivs[k]=base(c,k)&&stats[k]?Math.max(0,Math.min(32,((stats[k]/f)-base(c,k))/2)):0;sum+=ivs[k]}const total=p.ivObserved>0?p.ivObserved:Math.ceil(sum),pct=Math.min(100,total/192*100);return{...p,creature:c,bases:Object.fromEntries(Object.keys(CFG.statLabels).map(k=>[k,base(c,k)])),stats,ivs,total,pct,power:Object.values(stats).reduce((a,b)=>a+(+b||0),0)*p.quality}}
function panel(){
if(document.getElementById(CFG.panelId))return;
const s=document.createElement("style");
s.textContent=`
#${CFG.panelId}{position:fixed;z-index:2147483647;top:18px;right:18px;width:570px;max-height:calc(100vh - 36px);overflow:auto;background:#0a0d14;color:#f0f4f9;border:2px solid #f1c644;border-radius:24px;box-shadow:0 0 40px rgba(241,198,68,.15),0 24px 70px rgba(0,0,0,.65);font:13px Arial,sans-serif;display:none}
#${CFG.panelId} *{box-sizing:border-box}
#${CFG.panelId} .jp-head{display:flex;align-items:center;gap:14px;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08)}
#${CFG.panelId} .jp-sprite{width:72px;height:72px;object-fit:contain}
#${CFG.panelId} .jp-name{font-size:20px;font-weight:900}
#${CFG.panelId} .jp-sub{font-size:11px;color:#8392a7;margin-top:3px}
#${CFG.panelId} .jp-actions{margin-left:auto;display:flex;gap:6px}
#${CFG.panelId} button{font:inherit}
#${CFG.panelId} .jp-btn{width:32px;height:32px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#121824;color:#f0f4f9;cursor:pointer}
#${CFG.panelId} .jp-body{padding:16px}
#${CFG.panelId} .jp-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:14px;align-items:start}
#${CFG.panelId} .jp-card{background:#121824;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px}
#${CFG.panelId} .jp-card-title{font-size:12px;font-weight:800;color:#f0f4f9;margin-bottom:12px}
#${CFG.panelId} .jp-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px}
#${CFG.panelId} .jp-meta-box{background:#080b12;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px}
#${CFG.panelId} .jp-label{display:block;font-size:8px;text-transform:uppercase;letter-spacing:.6px;color:#8392a7;margin-bottom:3px}
#${CFG.panelId} .jp-value{font-size:15px;font-weight:900}
#${CFG.panelId} .jp-stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
#${CFG.panelId} .jp-stat{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px;text-align:center}
#${CFG.panelId} .jp-stat label{display:block;font-size:9px;font-weight:800;color:var(--c);margin-bottom:5px}
#${CFG.panelId} .jp-stat input{width:100%;padding:8px 6px;background:#080b12;border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#fff;text-align:center;font-weight:700;outline:none}
#${CFG.panelId} .jp-stat input:focus{border-color:#f1c644}
#${CFG.panelId} .jp-base{font-size:8px;color:#8392a7;margin-top:4px}
#${CFG.panelId} .jp-result{background:#080b12;border:1px solid rgba(85,230,211,.2);border-radius:16px;padding:16px;display:flex;flex-direction:column;align-items:center;text-align:center}
#${CFG.panelId} .jp-gauge{width:120px;height:120px;border-radius:50%;background:conic-gradient(#f1c644 calc(var(--score)*3.6deg),#1a2332 0deg);display:grid;place-items:center;position:relative;margin:2px 0 12px;box-shadow:0 0 20px rgba(241,198,68,.2)}
#${CFG.panelId} .jp-gauge:before{content:"";width:96px;height:96px;border-radius:50%;background:#080b12;position:absolute}
#${CFG.panelId} .jp-gauge span{position:relative;z-index:1;font-size:28px;font-weight:900}
#${CFG.panelId} .jp-result-title{font-size:16px;font-weight:900}
#${CFG.panelId} .jp-result-sub{font-size:10px;color:#8392a7;margin-top:3px}
#${CFG.panelId} .jp-bars{width:100%;display:flex;flex-direction:column;gap:8px;margin-top:14px}
#${CFG.panelId} .jp-bar-row{display:flex;align-items:center;gap:8px;font-size:11px}
#${CFG.panelId} .jp-bar-name{width:34px;font-weight:800;color:#8392a7;text-align:left}
#${CFG.panelId} .jp-track{flex:1;height:8px;background:#1a2332;border-radius:99px;overflow:hidden}
#${CFG.panelId} .jp-fill{height:100%;background:var(--c);border-radius:99px}
#${CFG.panelId} .jp-bar-val{width:43px;text-align:right;font-weight:800}
#${CFG.panelId} .jp-footer{display:flex;justify-content:space-between;color:#8392a7;font-size:9px;margin-top:12px}
@media(max-width:700px){#${CFG.panelId}{width:calc(100vw - 12px);right:6px;top:6px}.jp-grid{grid-template-columns:1fr}.jp-stat-grid{grid-template-columns:repeat(3,1fr)}}
`;
document.head.appendChild(s);
const p=document.createElement("div");
p.id=CFG.panelId;
p.innerHTML='<div class="jp-body" id="pil-content"></div>';
document.body.appendChild(p);
}
function render(p){
const d=calc(p),el=document.getElementById("pil-content"),box=document.getElementById(CFG.panelId);
if(!el||!box)return;
const type=(d.creature?.type||d.creature?.element||d.creature?.primaryType||"POKÉMON").toString().toUpperCase();
const stats=Object.keys(CFG.statLabels).map(k=>`<div class="jp-stat" style="--c:${CFG.colors[k]}"><label>${CFG.statLabels[k]}</label><input data-stat="${k}" type="number" value="${d.stats[k]??""}><div class="jp-base">base ${d.bases[k]||"?"}</div></div>`).join("");
const bars=Object.keys(CFG.statLabels).map(k=>`<div class="jp-bar-row"><span class="jp-bar-name">${CFG.statLabels[k]}</span><div class="jp-track"><div class="jp-fill" style="--c:${CFG.colors[k]};width:${Math.max(0,Math.min(100,d.ivs[k]/32*100))}%"></div></div><span class="jp-bar-val">${d.ivs[k].toFixed(1)}/32</span></div>`).join("");
const sprite=d.spriteSrc||"";
el.innerHTML=`<div class="jp-head"><img class="jp-sprite" src="${esc(sprite)}" alt="${esc(d.name)}"><div><div class="jp-name">${esc(d.name)}</div><div class="jp-sub">${esc(type)} · Nivel ${d.level}</div></div><div class="jp-actions"><button class="jp-btn" data-copy title="Copiar">⧉</button><button class="jp-btn" data-close title="Cerrar">×</button></div></div><div class="jp-grid"><div><div class="jp-meta"><div class="jp-meta-box"><span class="jp-label">Nivel</span><span class="jp-value">${d.level}</span></div><div class="jp-meta-box"><span class="jp-label">Qualidade</span><span class="jp-value">${d.quality.toFixed(2)}</span></div><div class="jp-meta-box"><span class="jp-label">IV Total</span><span class="jp-value" style="color:#55e6d3">${d.total}/192</span></div></div><div class="jp-card"><div class="jp-card-title">Stats del Pokémon</div><div class="jp-stat-grid">${stats}</div></div></div><div class="jp-result"><div class="jp-gauge" style="--score:${d.pct}"><span>${Math.round(d.pct)}%</span></div><div class="jp-result-title">Calidad IV estimada</div><div class="jp-result-sub">${d.total} / 192 · Poder ${Math.round(d.power)}</div><div class="jp-bars">${bars}</div></div></div><div class="jp-footer"><span>Poder en el juego: <b>${d.powerGame||Math.round(d.power)}</b></span><span>PokeIdleLab IV · v1.0.13</span></div>`;
el.querySelectorAll("[data-stat]").forEach(i=>i.addEventListener("input",()=>{if(current){current.actuals[i.dataset.stat]=Number(i.value)||0;render(current)}}));
el.querySelector("[data-close]")?.addEventListener("click",()=>{box.style.display="none"});
el.querySelector("[data-copy]")?.addEventListener("click",async()=>{const t=d.name+" · Nv "+d.level+" · IV "+d.total+"/192 · Calidad "+d.quality.toFixed(2)+" · Poder "+Math.round(d.power);try{await navigator.clipboard?.writeText(t)}catch{}});
box.style.display="block";
}
function scan(){const tips=[...document.querySelectorAll(".inv-tip")].filter(t=>{const s=getComputedStyle(t),r=t.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&+s.opacity>0&&r.width>0&&r.height>0});const tip=tips[0];if(!tip)return;const text=tip.innerText||"",p=parse(text);if(!p){document.getElementById(CFG.panelId)?.style.setProperty("display","none");return}p.spriteSrc=tip.querySelector("img")?.currentSrc||tip.querySelector("img")?.src||"";if(tip!==lastPokemonTooltip||text!==lastText){lastPokemonTooltip=tip;lastText=text;current=p;render(p)}}
new MutationObserver(scan).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true});document.addEventListener("mouseover",e=>{if(e.target.closest?.(".inv-tip"))setTimeout(scan,0)},true);setInterval(scan,250);panel();load();
})();
