// ==UserScript==
// @name         PokeIdleLab UI Adaptive
// @namespace    poke-idle-lab
// @version      1.0.31
// @description  Adapta el Pokemon Analyzer al tamaño de interfaz de Poke Idle World
// @match        https://poke.idleworld.online/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
(function(){"use strict";
const PANEL_ID="pokeidlelab-iv-panel",SCALE={small:.9,medium:1,large:1.1};
let lastMode=null,lastScale=1;
function modeOf(v){const s=String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();if(/^(pequeno|pequena|small|sm|s)$/.test(s))return"small";if(/^(medio|media|medium|md|m|normal|default)$/.test(s))return"medium";if(/^(grande|large|lg|l)$/.test(s))return"large";return null}
function selectedMode(){for(const el of document.querySelectorAll("button,[role=button],[role=tab],label")){const m=modeOf((el.textContent||"").replace(/\s+/g," "));if(!m)continue;const c=String(el.className||"");if(el.getAttribute("aria-pressed")==="true"||el.getAttribute("aria-selected")==="true"||/\b(active|selected|current|checked|seleccionad[oa])\b/i.test(c))return m}return null}
function apply(mode){const p=document.getElementById(PANEL_ID);if(!p||!SCALE[mode]||mode===lastMode)return;const r=p.getBoundingClientRect(),factor=SCALE[mode]/lastScale,maxW=Math.max(560,innerWidth-12),maxH=Math.max(520,innerHeight-12);p.style.width=Math.round(Math.max(560,Math.min(maxW,r.width*factor)))+"px";p.style.height=Math.round(Math.max(520,Math.min(maxH,r.height*factor)))+"px";lastMode=mode;lastScale=SCALE[mode]}
function scan(){const m=selectedMode();if(m)apply(m)}
document.addEventListener("click",e=>{const el=e.target?.closest?.("button,[role=button],[role=tab],label"),m=modeOf(el?.textContent);if(m){apply(m);setTimeout(scan,80);setTimeout(scan,300)}},true);
new MutationObserver(scan).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:["class","aria-pressed","aria-selected"]});
setInterval(scan,700);setTimeout(scan,500);setTimeout(scan,1500);
window.addEventListener("resize",()=>{const p=document.getElementById(PANEL_ID);if(!p)return;const w=Math.max(560,innerWidth-12),h=Math.max(520,innerHeight-12);if(p.offsetWidth>w)p.style.width=w+"px";if(p.offsetHeight>h)p.style.height=h+"px"});
})();
