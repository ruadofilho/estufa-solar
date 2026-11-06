(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else {root.EstufaOwl=api;api.mount();}
})(globalThis,function(){
 'use strict';
 const CONFIG={minInterval:120000,maxInterval:300000,hover:60000,transition:2400,storyDuration:16000,dayVisitChance:.08};
 const STORIES=['sono','inseto','pena','limpeza','objeto','madeira','ruido','ninho'];
 class Director{
  constructor(memory={},random=Math.random){this.random=random;this.memory={recent:[],nest:0,starts:0,...memory};this.state='absent';this.time=0;this.since=0;this.night=null;this.coolers=null;this.hot=false;this.next=0;this.story=null;this.hatchUntil=0;}
  enter(state){this.state=state;this.since=this.time;this.story=null;}
  wait(){this.next=this.time+CONFIG.minInterval+this.random()*(CONFIG.maxInterval-CONFIG.minInterval);}
  play(id){if(!STORIES.includes(id))return;this.enter('story');this.story=id;}
  sensors({coolers,temperature,valid,hatch}={}){
   if(valid&&Number.isFinite(temperature))this.hot=this.hot?temperature>48:temperature>50;
   if(hatch!==undefined&&hatch!==this.hatch){this.hatch=hatch;this.hatchUntil=this.time+2600;}
   if(typeof coolers==='boolean'){
    const start=this.coolers===false&&coolers;
    this.coolers=coolers;
    if(start&&this.night){
     this.memory.starts++;
     this.enter(this.memory.starts===1||this.random()<.22?'hover':this.memory.starts%2?'suspicion':'startle');
    }
    if(!coolers&&this.state==='hover')this.enter('return');
   }
  }
  step(dt,night){
   this.time+=dt;
   if(night!==this.night){
    const first=this.night===null;this.night=night;
    if(night){if(this.state!=='hover')this.enter('arrival');}
    else if(!first&&this.state!=='absent')this.enter('departure');
    else this.enter('absent');
    this.wait();
   }
   const age=this.time-this.since;
   if(this.state==='hover'&&age>=CONFIG.hover)this.enter('return');
   if(['arrival','return','startle','suspicion'].includes(this.state)&&this.time-this.since>=CONFIG.transition){this.enter('idle');this.wait();}
   if(this.state==='departure'&&age>=6000)this.enter('absent');
   if(this.state==='dayVisit'&&age>=9000)this.enter('absent');
   if(this.state==='story'&&age>=CONFIG.storyDuration){
    this.memory.recent=[this.story,...this.memory.recent].slice(0,3);
    if(this.story==='ninho')this.memory.nest=Math.min(3,this.memory.nest+1);
    this.enter('idle');this.wait();
   }
   if(this.state==='idle'&&this.time>=this.next&&night){
    const choices=STORIES.filter(id=>!this.memory.recent.includes(id));
    const weights=choices.map(id=>id==='ninho'&&this.memory.nest<3?2:1);
    let pick=this.random()*weights.reduce((a,b)=>a+b,0),index=0;
    while(index<weights.length-1&&pick>=weights[index])pick-=weights[index++];
    this.play(choices[index]);
   }
   if(this.state==='absent'&&!night&&this.time>=this.next){
    if(this.random()<CONFIG.dayVisitChance)this.enter('dayVisit');
    this.wait();
   }
   return {state:this.state,story:this.story,age:this.time-this.since};
  }
 }
 function mount(){
  const svg=document.querySelector('.mission-art svg'),owl=document.getElementById('scene-owl');
  if(!svg||!owl)return;
  const ns='http://www.w3.org/2000/svg',make=(tag,a,parent)=>{const e=document.createElementNS(ns,tag);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));parent.append(e);return e;};
  const pose=make('g',{},owl);
  while(owl.firstChild!==pose)pose.append(owl.firstChild);
  const head=pose.querySelector('.owl-head'),pupils=pose.querySelector('.owl-pupils'),blink=pose.querySelector('.owl-blink');
  const wings=pose.lastElementChild;
  const props=make('g',{'aria-hidden':'true','pointer-events':'none'},svg);
  const nest=make('path',{d:'M93 81l4-3 6 3 8-3 8 3-4 3H97z',fill:'none',stroke:'#bc966a','stroke-width':2},props);
  const object=make('path',{d:'M-3-2h6v4h-6z',fill:'#e1b770'},props);
  const insect=make('g',{},props);
  make('path',{d:'M-3-2h2v2h2v-2h2v3H-3z',fill:'#e2f4b6'},insect);
  const feather=make('path',{d:'M0 0l-4-8 2-4 4 5z',fill:'#edcfbe'},props);
  const shine=make('path',{d:'M0-4v8m-4-4h8',stroke:'#fff4b8'},props);
  let memory={};try{memory=JSON.parse(localStorage.getItem('estufa-owl-v1')||'{}');}catch{}
  const director=new Director(memory),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let last=0,frame=0,saved='',demo=null,position=[-25,80];
  const persist=()=>{if(demo)return;const value=JSON.stringify(director.memory);if(value!==saved){try{localStorage.setItem('estufa-owl-v1',value);saved=value;}catch{}}};
  function telemetry(t){if(demo)return;director.sensors({coolers:t?.status==='online'&&typeof t.coolers==='boolean'?t.coolers:undefined,temperature:t?.airT,valid:t?.airValid===true});}
  window.addEventListener('scene-telemetry',e=>telemetry(e.detail));
  window.addEventListener('hatch-state',e=>{if(!demo)director.sensors({hatch:e.detail?.position});});
  telemetry(window.FabricaSceneTelemetry);
  function render(dt){
   const night=demo?demo.night:svg.dataset.day==='false';
   const v=director.step(dt,night),t=v.age/1000,p=Math.min(1,v.age/CONFIG.storyDuration);
   let x=107,y=80,angle=0,headAngle=0,eyeX=0,closed=false,fly=false,stretch=1;
   [object,insect,feather,shine].forEach(e=>e.style.display='none');
   nest.style.display=director.memory.nest?'':'none';
   if(v.state==='absent'){owl.style.display='none';return;}
   owl.style.display='';
   if(v.state==='arrival'){const f=Math.min(1,v.age/CONFIG.transition);x=-25+132*f;y=80-22*Math.sin(Math.PI*f);fly=true;}
   if(v.state==='return'){const f=Math.min(1,v.age/CONFIG.transition);x=position[0]+(107-position[0])*f;y=position[1]+(80-position[1])*f;fly=f<1;}
   if(v.state==='hover'){x=107+8*Math.sin(t*2);y=48+3*Math.sin(t*3);fly=true;}
   if(v.state==='departure'){
    if(t<2){stretch=1+.15*Math.sin(t*Math.PI/2);headAngle=12*Math.sin(t*5);}
    else {const f=Math.min(1,(t-2)/4);x=107-140*f;y=80-30*Math.sin(f*Math.PI/2);fly=true;}
   }
   if(v.state==='dayVisit'){const f=t<2?t/2:t>7?(9-t)/2:1;x=-25+132*f;y=80-12*Math.sin(Math.PI*f);fly=t<2||t>7;closed=t>3&&t<6;object.style.display='';object.setAttribute('transform','translate('+(x+8)+' '+(y-7)+')');}
   if(v.state==='startle'){y-=10*Math.sin(Math.PI*Math.min(1,t/2.4));fly=t<1;}
   if(v.state==='suspicion')headAngle=-18*Math.sin(Math.PI*Math.min(1,t/2.4));
   if(v.state==='idle'){closed=Math.floor(t/8)%3===1;headAngle=closed?4:7*Math.sin(t*.6);if(t%17>14)angle=4*Math.sin(t*5);}
   if(v.state==='story'){
    const id=v.story;
    if(id==='sono'){closed=p<.45;angle=p<.5?18*Math.pow(Math.sin(p*Math.PI),4):p<.65?-12*Math.sin((p-.5)/.15*Math.PI):0;headAngle=p>.7?-10:0;}
    if(id==='inseto'){insect.style.display='';const f=Math.min(1,p/.65);insect.setAttribute('transform','translate('+(107+24*(1-f)*Math.cos(t*2))+' '+(61+12*(1-f)*Math.sin(t*2))+')');eyeX=p<.65?2*Math.cos(t*2):0;headAngle=p>.8?12*Math.sin(t*6):0;if(p>.9)insect.style.display='none';pupils.setAttribute('transform',p>.65&&p<.8?'translate(-1 0) scale(.7 1)':'');}
    if(id==='pena'){feather.style.display='';feather.setAttribute('transform','translate('+(p<.3?119:107)+' '+(p<.3?77:54)+') rotate('+(p>.7?20:Math.sin(t*2)*18)+')');headAngle=p>.35?12*Math.sin(t*2):12;if(p>.92)feather.style.display='none';}
    if(id==='limpeza'){x+=p<.75?20*Math.sin(p/.75*Math.PI):0;angle=p<.65?8*Math.sin(t*6):0;if(p>.65){shine.style.display='';shine.setAttribute('transform','translate(124 84)');headAngle=12;}}
    if(id==='objeto'||id==='ruido'){
     const drop=Math.min(1,p/.25);object.style.display='';object.setAttribute('transform','translate(126 '+(80+115*drop)+')');
     if(id==='ruido'&&p<.45)headAngle=25*Math.sin(t*2);
     const start=id==='ruido'?.45:.3;
     if(p>start&&p<.85){const f=(p-start)/(.85-start);x+=19*Math.sin(f*Math.PI);y+=115*Math.sin(f*Math.PI);fly=true;if(f>.5)object.setAttribute('transform','translate('+(x+8)+' '+y+')');}
     if(p>=.85){object.setAttribute('transform','translate(116 79)');headAngle=-10;}
    }
    if(id==='madeira'){x+=24*Math.sin(Math.PI*p);y+=24*Math.sin(Math.PI*p);headAngle=25*Math.sin(Math.PI*p);eyeX=2;}
    if(id==='ninho'){nest.style.display='';nest.setAttribute('stroke-dasharray',p<.3?'3 4':p<.6?'7 2':'');object.style.display=p<.6?'':'none';object.setAttribute('transform','translate('+(99+16*p)+' 80) rotate('+Math.sin(t*4)*30+')');y+=p>.6?2:Math.sin(t*4);closed=p>.8;}
   }
   if(v.state!=='story'||v.story!=='inseto')pupils.removeAttribute('transform');
   if(director.time<director.hatchUntil)headAngle=18*Math.sin((director.hatchUntil-director.time)/500);
   if(director.hot&&v.state==='idle'){fly=true;y=67;headAngle=-12;}
   if(reduced.matches){x=107;y=80;angle=0;headAngle=0;fly=false;stretch=1;props.style.display='none';}else props.style.display='';
   position=[x,y];
   owl.setAttribute('transform','translate('+x+' '+y+')');
   pose.setAttribute('transform','rotate('+angle+') scale(1 '+stretch+')');
   head.setAttribute('transform','rotate('+headAngle+' 0 -16)');
   if(!(v.state==='story'&&v.story==='inseto'))pupils.setAttribute('transform','translate('+eyeX+' 0)');
   const shut=closed||director.time%6300<140;
   pupils.setAttribute('opacity',shut?'0':'1');blink.setAttribute('opacity',shut?'1':'0');
   wings.style.display=fly?'':'none';wings.setAttribute('transform','scale(1 '+(.7+.4*Math.sin(t*24))+')');
   owl.setAttribute('aria-label','Coruja · '+(v.story||v.state));
   persist();
  }
  function tick(now){frame=0;if(document.hidden)return;const dt=last?Math.min(100,now-last):0;last=now;render(dt);frame=requestAnimationFrame(tick);}
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);last=0;if(!document.hidden)frame=requestAnimationFrame(tick);});
  frame=requestAnimationFrame(tick);
  // Explicit opt-in; simulations never emit telemetry or write equipment state.
  if(new URLSearchParams(location.search).get('owlDemo')==='1'){
   demo={night:true};
   const controls=document.createElement('details');controls.innerHTML='<summary>Demonstração da coruja</summary>';
   const button=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.type='button';b.onclick=fn;controls.append(b);};
   STORIES.forEach(id=>button(id,()=>{director.night=true;demo.night=true;director.play(id);}));
   button('Noite',()=>demo.night=true);button('Amanhecer',()=>demo.night=false);
   button('Coolers ligar',()=>{director.sensors({coolers:false});director.sensors({coolers:true});});
   button('Coolers desligar',()=>director.sensors({coolers:false}));
   button('Calor',()=>director.sensors({temperature:55,valid:true}));
   button('Esfriar',()=>director.sensors({temperature:47,valid:true}));
   button('Escotilhas',()=>director.sensors({hatch:director.hatch==='ABRIR'?'FECHAR':'ABRIR'}));
   button('Visita diurna',()=>{demo.night=false;director.night=false;director.enter('dayVisit');});
   controls.style.cssText='padding:12px;background:#fffbed;color:#233c30';svg.closest('.mission-art').after(controls);
  }
 }
 return {CONFIG,STORIES,Director,mount};
});
