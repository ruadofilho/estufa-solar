(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.EstufaSceneEffects=api;api.mount();}})(globalThis,function(){
 'use strict';
 function heat(t,valid){return valid&&Number.isFinite(t)?Math.min(.28,Math.max(0,(t-50)/35)*.28):0;}
 function flight(){let previous=null,until=0;return {update(value,night,now){if(!night||value!==true)until=0;if(night&&previous===false&&value===true)until=now+60000;if(typeof value==='boolean')previous=value;return night&&value===true&&now<until;},remaining:()=>until};}
 function mount(){const svg=document.querySelector('.mission-art svg'),side=svg?.querySelector('#kiln-side');if(!side)return;
 const ns='http://www.w3.org/2000/svg',make=(tag,attrs)=>{const el=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);return el;};
 const tint=make('path',{d:'M110 88L188 129V197H110Z',fill:'#e74b45',opacity:'0','pointer-events':'none'});tint.id='kiln-heat';side.insertBefore(tint,side.children[1]);
 const devil=make('g',{id:'kiln-devil',transform:'translate(179 150) scale(.6)',opacity:'0','pointer-events':'none'});
 devil.innerHTML='<path d="M-9-13v-9l6 6h6l6-6v9l3 4v14H-12V-9z" fill="#b95765"/><path d="M-8-11H8V2H-8z" fill="#f2a087"/><path d="M-7-10h5v5h-5zm9 0h5v5H2z" fill="#fff4d8"/><path d="M-5-9h2v3h-2zm8 0h2v3H3zM-5-2h2v2h6v-2h2v4H-5z" fill="#344057"/><path d="M-6 5h4v3h-4zm8 0h4v3H2z" fill="#8c5068"/><path d="M11 2h8v-9h-3l5-6 5 6h-3V6H11z" fill="#b95765"/>';
 side.append(devil);
 const arrows=side.querySelector('path[d^="M91 108"]');arrows?.classList.add('hatch-air-arrow');
 const style=document.createElement('style');style.textContent=`#kiln-heat,#kiln-devil{transition:opacity 1.5s ease-in-out}.mission-art svg:not([data-hatches="ABRIR"]) .hatch-air-arrow,.mission-art svg:not([data-hatches="ABRIR"]) #kiln-wind{display:none!important}.mission-art svg[data-hatches="ABRIR"] #kiln-wind{display:inline!important;opacity:1!important}.mission-art svg[data-hatches="ABRIR"] .wind-line{opacity:1!important}@media(prefers-reduced-motion:reduce){#kiln-heat,#kiln-devil{transition:none}}`;
 document.head.append(style);
 function hatches(e){svg.dataset.hatches=['ABRIR','FECHAR'].includes(e.detail?.position)?e.detail.position:'unknown';}
 window.addEventListener('hatch-state',hatches);if(window.FabricaHatchState)hatches({detail:window.FabricaHatchState});
 const fanStyle=document.createElement('style');fanStyle.textContent=`html[data-scene-coolers="on"] .fan>path{animation:scene-fan-spin 1.2s linear infinite;transform-origin:32px 32px}@keyframes scene-fan-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.fan>path{animation:none!important}}`;document.head.append(fanStyle);
 const telemetry=t=>{const level=heat(t?.airT,t?.airValid===true);tint.setAttribute('opacity',level);devil.setAttribute('opacity',level>0?'1':'0');document.documentElement.dataset.sceneCoolers=t?.status==='online'&&t.coolers===true?'on':'off';};
 window.addEventListener('scene-telemetry',e=>telemetry(e.detail));telemetry(window.FabricaSceneTelemetry);
 }
 return {heat,flight,mount};
});
