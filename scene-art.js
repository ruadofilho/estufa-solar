/* Artwork layer: existing weather, animal and equipment state remains authoritative. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EstufaArt=api;})(globalThis,function(){
'use strict';
const OWL_ANCHORS=[[207,307],[207,308],[207,308],[206,308],[184,271],[188,268],[187,268],[188,263],[187,261],[191,263],[187,267],[188,268]];
function owlFrame({fly,age,time,state,shut,progress}){
 if(fly){
  if(state==='arrival'&&age>2030)return 4;
  if(state==='departure'&&age<130)return 4;
  return [4,5,6,7,8,9,10,11][Math.floor(age/82)%8];
 }
 if(shut)return 1;
 if(state==='eat'&&progress>.43&&progress<.53)return 3;
 if(state==='eat'&&progress>=.53)return Math.floor(time/180)%2?2:0;
 return time%13700>11600?2:0;
}
function frogFrame({hopping,fraction,phase,rest}){
 return hopping?(fraction<.58?2:3):(phase<105||rest-phase<135?1:0);
}
const api={owlFrame,frogFrame};
if(typeof window==='undefined')return api;
const NS='http://www.w3.org/2000/svg',source=window.ESTUFA_ASSETS||{};
const urls={garden:source.garden||'./art/estufa.webp',owl:source.owl||'./art/coruja.png',frog:source.frog||'./art/sapinho.png'};
const states=new WeakMap(),sprites=new WeakMap(),loaded={};
function node(tag,attrs={},parent){const el=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);parent?.append(el);return el;}
for(const[id,url]of Object.entries(urls)){const img=new Image();img.onload=()=>{loaded[id]={w:img.naturalWidth,h:img.naturalHeight};};img.src=url;}
api.mount=(svg,sky,garden)=>{
 const backdrop=node('image',{x:0,y:0,width:400,height:220,href:urls.garden,preserveAspectRatio:'none','aria-hidden':'true',visibility:'hidden'});
 svg.insertBefore(backdrop,sky);sky.classList.add('illustrated-legacy-sky');garden.classList.add('illustrated-legacy-garden');
 const side=svg.querySelector('#kiln-side'),wood=svg.querySelector('#kiln-wood'),screen=node('g',{class:'illustrated-wood-screen','aria-hidden':'true'});
 if(side&&wood){
  const defs=node('defs',{},screen),grad=node('linearGradient',{id:'illustrated-pane',x2:'1',y2:'1'},defs);
  const grain=node('pattern',{id:'illustrated-board',width:13,height:4,patternUnits:'userSpaceOnUse'},defs);
  node('rect',{width:13,height:4,fill:'#b77d4b'},grain);
  node('path',{d:'M0 1.2h4l2 .3h5m-10 1.3h6l2-.3h4',stroke:'#dfae72','stroke-width':.45,opacity:.7,fill:'none'},grain);
  node('stop',{'stop-color':'#544a35'},grad);node('stop',{offset:'1','stop-color':'#34382e'},grad);
  node('path',{d:'M88 154h48v41H88zM144 154h49v41h-49z',fill:'url(#illustrated-pane)'},screen);
  node('path',{d:'M90 155v39m4-39v39m5-39v39m4-39v39m6-39v39m7-39v39m8-39v39m7-39v39m15-39v39m6-39v39m7-39v39m6-39v39m6-39v39m8-39v39m8-39v39',stroke:'#c3b68d','stroke-width':.6,opacity:.14},screen);
  screen.style.display='none';side.insertBefore(screen,wood);
 }
 const css=document.createElement('style');
 css.textContent=`
 [data-illustrated] .illustrated-legacy-sky>rect,[data-illustrated] .illustrated-legacy-sky>path:not(.sky-moon):not(.sky-stars):not(.sky-sun):not(.sky-fog),
 [data-illustrated] .illustrated-legacy-garden>:not(.guava-fruit),[data-illustrated]>path[d^="M25 201h350"],
 [data-illustrated] #kiln-side>:not(#kiln-wood,#kiln-wind,#kiln-heat,#kiln-devil,.hatch-air-arrow,.illustrated-wood-screen),.illustrated-replaced{display:none!important}
 [data-illustrated] :is(.pixel-ridges,.pixel-day-haze,.pixel-field,.pixel-kiln-depth,.pixel-kiln-trim,.pixel-glass-light){display:none!important}
 [data-illustrated] .sky-clouds{opacity:.22}
 [data-illustrated] .rain-drop{stroke-width:.85;opacity:.75}
 [data-illustrated] .scene-clock .clock-frame{fill:#102928;stroke:#a1ae83;stroke-width:1}
 [data-illustrated] .illustrated-wood-screen{pointer-events:none}
 [data-illustrated] #kiln-wood g[fill="#dfa96d"]{fill:url(#illustrated-board);stroke:#654429}
 `;
 document.head.append(css);
 states.set(svg,{backdrop,screen,wood,side,ready:false,light:null});
};
api.light=(svg,now)=>{
 const s=states.get(svg);if(!s||!loaded.garden)return;
 if(!s.ready){
  s.ready=true;s.backdrop.style.transition='filter 900ms ease';svg.dataset.illustrated='true';s.backdrop.setAttribute('visibility','visible');
  const visibleLayers='#kiln-wood,#kiln-wind,#kiln-heat,#kiln-devil,.hatch-air-arrow,.illustrated-wood-screen';
  for(const layer of Array.from(s.side?.children||[])){
   if(!layer.matches(visibleLayers))layer.remove();
  }
  s.wood?.setAttribute('transform','translate(-87 4) scale(1.53 1)');
  svg.querySelector('#kiln-air-clip path')?.setAttribute('d','M86 114L194 150V195H86Z');
  const signal=svg.querySelector('#scene-esp');signal?.setAttribute('transform','translate(55 117) scale(.5)');
  const moon=svg.querySelector('.sky-moon');moon?.setAttribute('d','M65 23a13 13 0 1 0 3 25 14 14 0 0 1-3-25z');
 }
 const showLoad=!window.ESTUFA_PREVIEW||svg.dataset.previewLoad==='true';
 s.screen.style.display=showLoad?'':'none';
 const isDay=svg.dataset.day!=='false',light=Number(svg.dataset.light);
 const day=Number.isFinite(light)?light:isDay?1:0,wet=svg.dataset.weather==='rain';
 const filter='brightness('+(.48+.52*day-(wet ? .09 : 0)).toFixed(3)+') saturate('+(.66+.34*day).toFixed(3)+')';
 if(s.light!==filter){s.backdrop.style.filter=filter;s.light=filter;}
 const tint=svg.querySelector('#kiln-heat');if(tint&&!tint.dataset.illustrated){tint.dataset.illustrated='true';tint.setAttribute('d','M86 114L194 150V195H86Z');s.side?.insertBefore(tint,s.wood);}
 const arrows=s.side?.querySelector('.hatch-air-arrow');if(arrows&&!arrows.dataset.illustrated){arrows.dataset.illustrated='true';arrows.setAttribute('d','M69 117h17m-5-4 5 4-5 4M86 178H69m5-4-5 4 5 4');}
};
function sprite(host,kind,cols,rows){
 if(!loaded[kind])return null;
 let s=sprites.get(host);if(s)return s;
 const{w,h}=loaded[kind],holder=node('g',{'aria-hidden':'true','pointer-events':'none'});
 const viewport=node('svg',{overflow:'hidden',preserveAspectRatio:'xMidYMid meet'},holder);
 node('image',{x:0,y:0,width:w,height:h,href:urls[kind]},viewport);
 host.insertBefore(holder,host.firstChild);s={holder,viewport,w:w/cols,h:h/rows,cols,last:null,direction:1,x:null};sprites.set(host,s);return s;
}
function frame(s,index,width,ax,ay){
 const scale=width/s.w,height=s.h*scale;
 const key=[index,width,ax,ay].join(':');if(key===s.last)return;s.last=key;
 for(const[k,v]of Object.entries({x:-ax*width,y:-ay*height,width,height,viewBox:[(index%s.cols)*s.w,Math.floor(index/s.cols)*s.h,s.w,s.h].join(' ')}))s.viewport.setAttribute(k,v);
}
api.paintOwl=(host,props)=>{
 const s=sprite(host,'owl',4,3);if(!s)return;
 const pose=host.querySelector('.owl-head')?.parentNode;
 if(pose&&!pose.dataset.illustrated){pose.dataset.illustrated='true';Array.from(pose.children).filter(el=>el.id!=='owl-birthday-hat').forEach(el=>el.classList.add('illustrated-replaced'));pose.querySelector('#owl-birthday-hat')?.setAttribute('transform','translate(6 -4)');}
 const index=owlFrame(props),anchor=OWL_ANCHORS[index];
 frame(s,index,39,anchor[0]/362,anchor[1]/362);
 if(props.fly&&s.x!==null&&Math.abs(props.x-s.x)>.04)s.direction=props.x>s.x?1:-1;
 if(!props.fly)s.direction=1;s.x=props.x;
 s.holder.setAttribute('transform','scale('+s.direction+' 1)');
 if(index===3)host.querySelector('#owl-guava-snack').style.display='none';
};
api.paintFrog=(host,props)=>{
 const s=sprite(host,'frog',2,2);if(!s)return;
 for(const el of Array.from(host.children))if(el!==s.holder)el.classList.add('illustrated-replaced');
 const index=frogFrame(props),anchors=window.ESTUFA_FROG_ANCHORS||[[.52,.78],[.51,.77],[.52,.73],[.55,.75]];
 frame(s,index,45,anchors[index][0],anchors[index][1]);
 s.holder.setAttribute('transform','translate(0 5)');
};
return api;
});
