// ==UserScript==
// @name         PokeIdleLab Calculator
// @namespace    poke-idle-lab
// @version      1.0.14
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
#${CFG.panelId}{position:fixed;z-index:2147483647;top:50%;left:50%;transform:translate(-50%,-50%);width:min(880px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;background:linear-gradient(145deg,#09111b 0%,#0b121c 55%,#080d15 100%);color:#f0f4f9;border:1px solid #26384e;border-radius:24px;box-shadow:0 30px 90px rgba(0,0,0,.78),0 0 45px rgba(50,130,190,.08);font:14px Arial,sans-serif;display:none}
#${CFG.panelId} *{box-sizing:border-box}
#${CFG.panelId} .jp-wrap{padding:18px}
#${CFG.panelId} .jp-head{display:grid;grid-template-columns:325px 1fr;gap:18px;align-items:center;padding-bottom:16px}
#${CFG.panelId} .jp-visual{height:205px;border-radius:18px;position:relative;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 55%,rgba(255,55,65,.18),transparent 42%),linear-gradient(145deg,#101725,#080e16)}
#${CFG.panelId} .jp-visual:before{content:"";position:absolute;width:275px;height:48px;bottom:20px;border:3px solid #ff4855;border-radius:50%;box-shadow:0 0 18px rgba(255,60,75,.9),inset 0 0 12px rgba(255,60,75,.45)}
#${CFG.panelId} .jp-visual:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 20%,rgba(255,255,255,.12) 0 2px,transparent 3px),radial-gradient(circle at 80% 25%,rgba(255,70,80,.7) 0 2px,transparent 3px);pointer-events:none}
#${CFG.panelId} .jp-sprite{width:175px;height:175px;object-fit:contain;position:relative;z-index:1;filter:drop-shadow(0 12px 18px rgba(0,0,0,.6))}
#${CFG.panelId} .jp-info{min-width:0}
#${CFG.panelId} .jp-title-row{display:flex;align-items:baseline;gap:12px;margin-bottom:7px}
#${CFG.panelId} .jp-name{font-size:34px;font-weight:900;letter-spacing:-1px}
#${CFG.panelId} .jp-id{font-size:14px;color:#a8b5c6}
#${CFG.panelId} .jp-type{display:inline-flex;padding:8px 25px;border-radius:999px;background:#ff4b4b;color:#151b22;font-weight:900;font-size:14px;margin-bottom:14px}
#${CFG.panelId} .jp-actions{position:absolute;top:16px;right:16px;display:flex;gap:7px}
#${CFG.panelId} .jp-btn{width:42px;height:42px;border:1px solid #2b3b50;border-radius:12px;background:#111b28;color:#eaf0f7;cursor:pointer;font-size:20px}
#${CFG.panelId} .jp-meta{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}
#${CFG.panelId} .jp-meta-box{background:#0b131e;border:1px solid #26364a;border-radius:12px;padding:11px 12px}
#${CFG.panelId} .jp-label{display:block;font-size:10px;text-transform:uppercase;color:#a1afbf;margin-bottom:5px}
#${CFG.panelId} .jp-value{font-size:25px;font-weight:900}
#${CFG.panelId} .jp-muted{color:#8797aa;font-size:.7em}
#${CFG.panelId} .jp-rating{display:flex;align-items:center;gap:22px;background:linear-gradient(145deg,#0d1723,#0a121c);border:1px solid #293b51;border-radius:17px;padding:17px 22px;margin:0 0 17px}
#${CFG.panelId} .jp-gauge{width:92px;height:92px;flex:0 0 92px;border-radius:50%;background:conic-gradient(#f1c644 calc(var(--score)*3.6deg),#1d2a3a 0);display:grid;place-items:center;position:relative}
#${CFG.panelId} .jp-gauge:before{content:"";width:72px;height:72px;border-radius:50%;background:#0a121c;position:absolute}
#${CFG.panelId} .jp-gauge span{position:relative;z-index:1;font-size:21px;font-weight:900;color:#f1c644}
#${CFG.panelId} .jp-rating-title{font-size:26px;font-weight:900;color:#f1c644}
#${CFG.panelId} .jp-rating-sub{font-size:14px;color:#a9b7c9;margin-top:4px}
#${CFG.panelId} .jp-section{font-size:14px;font-weight:800;color:#9eafc4;text-transform:uppercase;letter-spacing:.5px;margin:10px 0 9px}
#${CFG.panelId} .jp-accent{color:#f1c644}
#${CFG.panelId} .jp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
#${CFG.panelId} .jp-stat{background:linear-gradient(145deg,#0d1722,#0a121c);border:1px solid #29394d;border-radius:15px;padding:13px 14px}
#${CFG.panelId} .jp-stat-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px}
#${CFG.panelId} .jp-stat-name{font-size:17px;font-weight:900;color:var(--c)}
#${CFG.panelId} .jp-iv{font-size:17px;font-weight:900;color:#59e5e0}
#${CFG.panelId} .jp-track{height:9px;background:#202d3c;border-radius:99px;overflow:hidden;margin-bottom:9px}
#${CFG.panelId} .jp-fill{height:100%;background:var(--c);border-radius:99px}
#${CFG.panelId} .jp-field{display:grid;grid-template-columns:45px 1fr;gap:6px;align-items:center;margin-top:5px;color:#9caabd;font-size:11px}
#${CFG.panelId} .jp-input{width:100%;padding:7px 9px;background:#0a111b;border:1px solid #314157;border-radius:7px;color:#eef4fb;font-size:13px}
#${CFG.panelId} .jp-base{color:#8b9aac;font-size:11px}
#${CFG.panelId} .jp-moves{display:flex;flex-direction:column;gap:5px}
#${CFG.panelId} .jp-move{display:grid;grid-template-columns:145px 1fr 55px;align-items:center;gap:10px;background:#0c141e;border:1px solid #243449;border-radius:9px;padding:7px 10px}
#${CFG.panelId} .jp-move-type{display:inline-flex;justify-content:center;padding:6px 12px;border-radius:999px;background:#668de5;color:#0d1420;font-weight:900;font-size:11px}
#${CFG.panelId} .jp-move-name{font-size:14px;font-weight:800}
#${CFG.panelId} .jp-move-level{font-size:12px;color:#8494a8;margin-left:8px}
#${CFG.panelId} .jp-move-power{font-size:14px;font-weight:900;color:#ff982d;text-align:right}
#${CFG.panelId} .jp-footer{display:flex;justify-content:space-between;color:#8493a5;font-size:11px;margin-top:12px}
@media(max-width:760px){#${CFG.panelId}{width:calc(100vw - 10px);max-height:calc(100vh - 10px)}#${CFG.panelId} .jp-head{grid-template-columns:1fr}#${CFG.panelId} .jp-visual{height:170px}#${CFG.panelId} .jp-grid{grid-template-columns:repeat(2,1fr)}#${CFG.panelId} .jp-meta{grid-template-columns:repeat(2,1fr)}}
@media(max-width:470px){#${CFG.panelId} .jp-grid{grid-template-columns:1fr}#${CFG.panelId} .jp-name{font-size:27px}#${CFG.panelId} .jp-move{grid-template-columns:95px 1fr 40px}}
`;
document.head.appendChild(s);
const p=document.createElement("div");p.id=CFG.panelId;
p.innerHTML='<div class="jp-wrap" id="pil-content"></div>';
document.body.appendChild(p);
}
function moveList(c){
const src=c?.moves||c?.attacks||c?.skills||c?.learnset||[];
const arr=Array.isArray(src)?src:Object.values(src||{});
return arr.map((m,i)=>typeof m==="string"?{name:m,level:null,type:"NORMAL",power:null}:{name:m?.name||m?.move||m?.attack||m?.id||"Move "+(i+1),level:m?.level??m?.learnLevel??m?.unlockLevel??null,type:m?.type||m?.element||"NORMAL",power:m?.power??m?.damage??null}).filter(m=>m.name).sort((a,b)=>(a.level??999)-(b.level??999));
}
function render(p){
const d=calc(p),el=document.getElementById("pil-content"),box=document.getElementById(CFG.panelId);if(!el||!box)return;
const c=d.creature||{},type=(c.type||c.element||c.primaryType||"POKÉMON").toString().toUpperCase();
const qualityLabel=d.quality>=1.5?"Épica":d.quality>=1.3?"Rara":d.quality>=1.15?"Incomum":"Común";
const rating=d.pct<25?"Muy bajo":d.pct<50?"Mediano":d.pct<75?"Bueno":d.pct<90?"Excelente":"Perfecto";
const stats=Object.keys(CFG.statLabels).map(k=>`<div class="jp-stat" style="--c:${CFG.colors[k]}"><div class="jp-stat-head"><span class="jp-stat-name">${CFG.statLabels[k]}</span><span class="jp-iv">${d.ivs[k].toFixed(1)}/32</span></div><div class="jp-track"><div class="jp-fill" style="width:${Math.max(0,Math.min(100,d.ivs[k]/32*100))}%"></div></div><div class="jp-field"><span>actual</span><input class="jp-input" data-stat="${k}" type="number" value="${d.stats[k]??""}"></div><div class="jp-field"><span>base</span><div class="jp-base">${d.bases[k]||"?"}</div></div></div>`).join("");
const moves=moveList(c);
const movesHtml=moves.length?moves.map(m=>`<div class="jp-move"><span class="jp-move-type">${esc(String(m.type).toUpperCase())}</span><div><span class="jp-move-name">${esc(m.name)}</span><span class="jp-move-level">${m.level!=null?"Nv "+m.level:""}</span></div><span class="jp-move-power">${m.power??"—"}</span></div>`).join(""):`<div class="jp-move"><span class="jp-move-type">INFO</span><div class="jp-move-name">No se encontraron golpes en creatures.json</div><span></span></div>`;
const bars=Object.keys(CFG.statLabels).map(k=>`<div class="jp-field" style="grid-template-columns:34px 1fr 43px"><span style="color:var(--c);font-weight:800">${CFG.statLabels[k]}</span><div class="jp-track" style="margin:0"><div class="jp-fill" style="width:${Math.max(0,Math.min(100,d.ivs[k]/32*100))}%"></div></div><span style="text-align:right">${d.ivs[k].toFixed(1)}</span></div>`).join("");
const sprite=d.spriteSrc||"";
el.innerHTML=`<div class="jp-head"><div class="jp-visual"><img class="jp-sprite" src="${esc(sprite)}" alt="${esc(d.name)}"></div><div class="jp-info"><div class="jp-title-row"><div class="jp-name">${esc(d.name)}</div><div class="jp-id">#${String(c.id??"").padStart(4,"0")}</div></div><span class="jp-type">${esc(type)}</span><div class="jp-meta"><div class="jp-meta-box"><span class="jp-label">Nivel</span><span class="jp-value">${d.level}</span></div><div class="jp-meta-box"><span class="jp-label">Calidad</span><span class="jp-value">${d.quality.toFixed(2).replace(".",",")}</span></div><div class="jp-meta-box"><span class="jp-label">IV Total</span><span class="jp-value" style="color:#55e6d3">${d.total}<span class="jp-muted">/192</span></span></div><div class="jp-meta-box"><span class="jp-label">Poder estimado</span><span class="jp-value" style="color:#f1c644">${Math.round(d.power)}</span></div></div></div><div class="jp-actions"><button class="jp-btn" data-copy title="Copiar">⧉</button><button class="jp-btn" data-close title="Cerrar">×</button></div></div><div class="jp-rating"><div class="jp-gauge" style="--score:${d.pct}"><span>${Math.round(d.pct)}%</span></div><div><div class="jp-rating-title">${rating}</div><div class="jp-rating-sub">Posee atributos equilibrados para uso general.</div></div></div><div class="jp-section">ATRIBUTOS E IV POR STAT <span class="jp-muted">(${d.pct.toFixed(1)}% · <span class="jp-accent">${qualityLabel} ×${d.quality.toFixed(2)}</span>)</span></div><div class="jp-grid">${stats}</div><div class="jp-section">⚔ GOLPES</div><div class="jp-moves">${movesHtml}</div><div class="jp-footer"><span>Poder en el juego: <b>${d.powerGame||Math.round(d.power)}</b></span><span>PokeIdleLab IV Calculator · v1.0.14</span></div>`;
el.querySelectorAll("[data-stat]").forEach(i=>i.addEventListener("input",()=>{if(current){current.actuals[i.dataset.stat]=Number(i.value)||0;render(current)}}));
el.querySelector("[data-close]")?.addEventListener("click",()=>{box.style.display="none"});
el.querySelector("[data-copy]")?.addEventListener("click",async()=>{const t=d.name+" · Nv "+d.level+" · IV "+d.total+"/192 · Calidad "+d.quality.toFixed(2)+" · Poder "+Math.round(d.power);try{await navigator.clipboard?.writeText(t)}catch{}});
box.style.display="block";
}
function scan(){const tips=[...document.querySelectorAll(".inv-tip")].filter(t=>{const s=getComputedStyle(t),r=t.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&+s.opacity>0&&r.width>0&&r.height>0});const tip=tips[0];if(!tip)return;const text=tip.innerText||"",p=parse(text);if(!p){document.getElementById(CFG.panelId)?.style.setProperty("display","none");return}p.spriteSrc=tip.querySelector("img")?.currentSrc||tip.querySelector("img")?.src||"";if(tip!==lastPokemonTooltip||text!==lastText){lastPokemonTooltip=tip;lastText=text;current=p;render(p)}}
new MutationObserver(scan).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true});document.addEventListener("mouseover",e=>{if(e.target.closest?.(".inv-tip"))setTimeout(scan,0)},true);setInterval(scan,250);panel();load();
})();
