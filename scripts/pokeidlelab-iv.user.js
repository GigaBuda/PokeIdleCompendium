// ==UserScript==
// @name         PokeIdleLab Calculator
// @namespace    poke-idle-lab
// @version      1.0.10
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
function parse(text){const lines=String(text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);if(!lines.length)return null;const lm=text.match(/(?:Lv\.?|Nivel|Nível)\s*(\d+)/i),qm=text.match(/(?:×|x)\s*(\d+(?:[.,]\d+)?)/),im=text.match(/IV\s*(\d+)\s*\/\s*(\d+)/i),pm=text.match(/(?:Poder|Power)\s*[:\-]?\s*(\d+)/i);const nl=lines.find(x=>!/(?:Lv\.?\s*\d+|IV\s*\d+|Qualidade|Raridade|Poder|Power|×|x\s*\d)/i.test(x))||lines[0];const name=nl.replace(/^(?:LOOT|ITEM|POK[EÉ] BALL|POK[EÉ]BALL|RECURSO)\s*/i,"").replace(/\s+(?:LOOT|ITEM|POK[EÉ] BALL|POK[EÉ]BALL|RECURSO)\s*$/i,"").replace(/\s+x\s*\d+\s*$/i,"").trim();if(!creatures.some(c=>norm(c.name)===norm(name)))return null;const actuals={};for(const k of Object.keys(CFG.statLabels)){const lab={hp:"(?:HP|Vida)",atk:"(?:ATK|Atk|Ataque)",def:"(?:DEF|Def|Defesa)",spa:"(?:SpA|SPA|Sp\\.\\s*A|Ataque\\s*especial)",spd:"(?:SpD|SPD|Sp\\.\\s*D|Defesa\\s*especial)",vel:"(?:VEL|Vel|Speed|Velocidade)"}[k],m=text.match(new RegExp(lab+"\\s*[:=]?\\s*(\\d+)","i"));if(m)actuals[k]=+m[1]}return{name,level:lm?+lm[1]:1,quality:qm?+qm[1].replace(",","."):1,ivObserved:im?+im[1]:null,powerGame:pm?+pm[1]:0,actuals}}
function calc(p){const c=creatures.find(x=>norm(x.name)===norm(p.name)),stats=p.actuals||{},ivs={};let sum=0;for(const k of Object.keys(CFG.statLabels)){const f=(p.level/100)*Math.pow(p.quality,CFG.exponents[k]);ivs[k]=base(c,k)&&stats[k]?Math.max(0,Math.min(32,((stats[k]/f)-base(c,k))/2)):0;sum+=ivs[k]}const total=p.ivObserved>0?p.ivObserved:Math.ceil(sum),pct=Math.min(100,total/192*100);return{...p,creature:c,bases:Object.fromEntries(Object.keys(CFG.statLabels).map(k=>[k,base(c,k)])),stats,ivs,total,pct,power:Object.values(stats).reduce((a,b)=>a+(+b||0),0)*p.quality}}
function panel(){
if(document.getElementById(CFG.panelId))return;
const s=document.createElement("style");
s.textContent=\`
#\${CFG.panelId}{position:fixed;z-index:2147483647;top:0;right:10px;width:555px;max-height:calc(100vh - 2px);overflow:auto;background:#0d1219;color:#eef3f8;border:1px solid #ff3b20;border-top-width:2px;border-radius:10px;box-shadow:0 22px 65px rgba(0,0,0,.72);font:12px Arial,sans-serif;display:none}
#\${CFG.panelId} *{box-sizing:border-box}
#\${CFG.panelId} .pil-body{padding:0 9px 8px}
#\${CFG.panelId} .pil-hero{display:grid;grid-template-columns:64px 1fr auto;gap:10px;align-items:center;padding:7px 5px 8px;border-bottom:1px solid #242c35}
#\${CFG.panelId} .pil-sprite{width:64px;height:64px;object-fit:contain;filter:drop-shadow(0 4px 5px rgba(0,0,0,.55))}
#\${CFG.panelId} .pil-name-row{display:flex;align-items:baseline;gap:8px;margin-bottom:3px}
#\${CFG.panelId} .pil-name{font-size:17px;font-weight:900;white-space:nowrap}
#\${CFG.panelId} .pil-id{font-size:10px;color:#7d8792}
#\${CFG.panelId} .pil-type{display:inline-block;background:#f57d24;color:#171b20;border-radius:999px;padding:4px 11px;font-size:10px;font-weight:900}
#\${CFG.panelId} .pil-actions{display:flex;gap:6px}
#\${CFG.panelId} .pil-action{width:30px;height:30px;border-radius:8px;border:1px solid #33404d;background:#111922;color:#dce3ea;cursor:pointer}
#\${CFG.panelId} .pil-top{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:9px}
#\${CFG.panelId} .pil-box,#\${CFG.panelId} .pil-rating,#\${CFG.panelId} .pil-stat,#\${CFG.panelId} .pil-move{background:#0f151d;border:1px solid #252f3a;border-radius:9px}
#\${CFG.panelId} .pil-box{padding:8px 9px}
#\${CFG.panelId} .pil-label{font-size:8px;text-transform:uppercase;color:#778391;letter-spacing:.5px}
#\${CFG.panelId} .pil-value{font-size:16px;font-weight:900;margin-top:3px}
#\${CFG.panelId} .pil-rating{display:flex;align-items:center;gap:12px;padding:9px 11px;margin:9px 0}
#\${CFG.panelId} .pil-ring{width:55px;height:55px;flex:0 0 55px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#55a9ff calc(var(--p)*1%),#26303b 0);position:relative}
#\${CFG.panelId} .pil-ring:after{content:"";position:absolute;width:43px;height:43px;border-radius:50%;background:#0f151d}
#\${CFG.panelId} .pil-ring span{position:relative;z-index:1;font-size:12px;font-weight:900}
#\${CFG.panelId} .pil-rating-title{font-size:12px;font-weight:900}
#\${CFG.panelId} .pil-rating-sub{font-size:10px;color:#7e8996;margin-top:3px}
#\${CFG.panelId} .pil-section{font-size:9px;color:#7b8794;text-transform:uppercase;letter-spacing:.7px;margin:11px 1px 6px}
#\${CFG.panelId} .pil-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
#\${CFG.panelId} .pil-stat{padding:8px}
#\${CFG.panelId} .pil-stat-head{display:flex;justify-content:space-between;align-items:center}
#\${CFG.panelId} .pil-stat-name{font-weight:900;color:var(--c)}
#\${CFG.panelId} .pil-iv{font-weight:900;color:var(--c)}
#\${CFG.panelId} .pil-bar{height:5px;border-radius:99px;background:#222b35;margin:6px 0 7px;overflow:hidden}
#\${CFG.panelId} .pil-bar i{display:block;height:100%;width:var(--w);background:var(--c);border-radius:99px}
#\${CFG.panelId} .pil-input{width:100%;background:#111922;color:#eaf0f5;border:1px solid #34404d;border-radius:6px;padding:5px;font-size:11px}
#\${CFG.panelId} .pil-base{font-size:9px;color:#7c8794;margin-top:4px}
#\${CFG.panelId} .pil-move{display:flex;justify-content:space-between;align-items:center;padding:7px 9px;margin-bottom:5px}
#\${CFG.panelId} .pil-move-main{display:flex;align-items:center;gap:7px;min-width:0}
#\${CFG.panelId} .pil-move-type{font-size:9px;font-weight:900;padding:3px 8px;border-radius:999px;background:#3d3f30;color:#f4e7a7}
#\${CFG.panelId} .pil-move-name{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#\${CFG.panelId} .pil-move-meta{font-size:9px;color:#7e8996}
#\${CFG.panelId} .pil-power{color:#ff9b2f;font-weight:900}
#\${CFG.panelId} .pil-footer{display:flex;justify-content:space-between;color:#788492;font-size:10px;padding:7px 1px 0}
@media(max-width:700px){#\${CFG.panelId}{width:calc(100vw - 8px);right:4px}.pil-grid{grid-template-columns:repeat(2,1fr)}.pil-top{grid-template-columns:repeat(2,1fr)}}
\`;
document.head.appendChild(s);
const p=document.createElement("div");
p.id=CFG.panelId;
p.innerHTML='<div class="pil-body" id="pil-content"></div>';
document.body.appendChild(p);
}

function render(p){
const d=calc(p),el=document.getElementById("pil-content"),box=document.getElementById(CFG.panelId);
iffunction findVisibleTooltip(){
const selectors=['.inv-tip','[role="tooltip"]','[class*="tooltip"]','[class*="popover"]'];
const candidates=[];
for(const sel of selectors){try{document.querySelectorAll(sel).forEach(x=>candidates.push(x))}catch{}}
const visible=candidates.filter(t=>{
const s=getComputedStyle(t),r=t.getBoundingClientRect(),txt=(t.innerText||"").trim();
return s.display!=="none"&&s.visibility!=="hidden"+""&&+s.opacity>0&&r.width>0&&r.height>0&&txt.length>0;
});
visible.sort((a,b)=>b.getBoundingClientRect().width*b.getBoundingClientRect().height-a.getBoundingClientRect().width*a.getBoundingClientRect().height);
return visible.find(t=>{const tx=norm(t.innerText||"");return creatures.some(c=>tx.includes(norm(c.name)))})||null;
}

function scan(){
const tip=findVisibleTooltip();
if(!tip)return;
const text=tip.innerText||"",p=parse(text);
if(!p)return;
p.spriteSrc=tip.querySelector("img")?.currentSrc||tip.querySelector("img")?.src||"";
if(tip!==lastPokemonTooltip||text!==lastText){
lastPokemonTooltip=tip;lastText=text;current=p;render(p);
}
}

function scanSoon(){
scan();
setTimeout(scan,40);
setTimeout(scan,120);
setTimeout(scan,250);
}
new MutationObserver(scanSoon).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true});
document.addEventListener("mouseover",e=>{scanSoon()},true);
document.addEventListener("pointerover",e=>{scanSoon()},true);
setInterval(scan,250);
panel();
load();
