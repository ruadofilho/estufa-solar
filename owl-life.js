(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else {root.EstufaOwl=api;api.mount();}
})(globalThis,function(){
 'use strict';
 const CONFIG={minInterval:120000,maxInterval:300000,hover:60000,transition:2400,storyDuration:16000,dayVisitChance:.08};
 const STORIES=['sono','inseto','pena','limpeza','objeto','madeira','ruido','ninho','pirata','marceneira','jardineira','oficina'];
 class Director{
  constructor(memory={},random=Math.random){this.random=random;this.memory={recent:[],nest:0,starts:0,project:0,buildStage:0,...memory};this.state='absent';this.time=0;this.since=0;this.night=null;this.coolers=null;this.hot=false;this.next=0;this.story=null;this.hatchUntil=0;}
  enter(state){this.state=state;this.since=this.time;this.story=null;}
  wait(){this.next=this.time+CONFIG.minInterval+this.random()*(CONFIG.maxInterval-CONFIG.minInterval);}
  play(id){if(!STORIES.includes(id))return;this.enter('story');this.story=id;}
  sensors({coolers,temperature,valid,hatch,rain,woodReady}={}){
   if(typeof woodReady==='boolean')this.woodReady=woodReady;
   if(typeof rain==='boolean'&&rain!==this.rain){this.rain=rain;if(rain&&this.night&&['idle','story'].includes(this.state))this.enter('shelter');else if(!rain&&this.state==='shelter'){this.enter(this.rain?'shelter':'idle');this.wait();}}
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
   if(['arrival','return','startle','suspicion'].includes(this.state)&&this.time-this.since>=CONFIG.transition){this.enter(this.rain?'shelter':'idle');this.wait();}
   if(this.state==='departure'&&age>=6000)this.enter('absent');
   if(this.state==='dayVisit'&&age>=9000)this.enter('absent');
   if(this.state==='story'&&age>=CONFIG.storyDuration){
    this.memory.recent=[this.story,...this.memory.recent].slice(0,3);
    if(this.story==='oficina'&&this.woodReady){this.memory.buildStage++;if(this.memory.buildStage>=3){this.memory.buildStage=0;this.memory.project=(this.memory.project+1)%6;}}
    if(this.story==='ninho')this.memory.nest=Math.min(3,this.memory.nest+1);
    this.enter('idle');this.wait();
   }
   if(this.state==='idle'&&this.time>=this.next&&night){
    const choices=STORIES.filter(id=>!this.memory.recent.includes(id));
    const weights=choices.map(id=>id==='oficina'?7:id==='madeira'?3:id==='ninho'&&this.memory.nest<3?2:1);
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
  owl.innerHTML='<path d="M-11-17Q-16-4-8 0L-5 3H5L10-1Q16-8 10-19Z" fill="#795036"/><path d="M-6-15Q0-20 6-15L7-2Q0 3-7-2Z" fill="#d2ae7b"/><path d="M-10-13L-9-3M10-13L9-3" stroke="#4a3327" stroke-width="3"/><path d="M-5 0v3m-3 0h6M5 0v3m-3 0h6" stroke="#bd9458" stroke-width="2"/><path d="M-4-10l2 2m3-2 2 2m-6 2 2 2m3-2 2 2" stroke="#8b6542"/><g class="owl-head"><path d="M-12-16L-11-29-5-25Q0-28 5-25L11-29 12-16Q9-11 0-12Q-9-11-12-16" fill="#88603e"/><path d="M0-21Q-10-29-10-20Q-10-13-2-15L0-18 2-15Q10-13 10-20Q10-29 0-21" fill="#e1c49a"/><path d="M-8-21h4v5h-4m12-5h4v5H4" fill="#b17a2d"/><path class="owl-pupils" d="M-7-21h2v5h-2m12-5h2v5H5" fill="#211f1b"/><path class="owl-blink" d="M-8-19h5m6 0h5" stroke="#59412e" stroke-width="2"/><path d="M-2-17h4l-2 5Z" fill="#bf9454"/><path d="M-10-24l6 1m8 0 6-1" stroke="#593b29" stroke-width="2"/></g><path d="M-10-15Q-22-29-25-17L-12-4M10-15Q22-29 25-17L12-4" fill="#795036" stroke="#4e3829"/>';
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
  const workshop=make('g',{'aria-hidden':'true'},svg);
  const bench=make('path',{d:'M213 189h48v5h-48zM217 194v12m40-12v12',fill:'#b58150',stroke:'#624a35','stroke-width':2},workshop);
  const blueprint=make('path',{d:'M216 184h28v5h-28zM220 185h18',fill:'#d6e4d5',stroke:'#7e9c9c'},workshop);
  const build=make('g',{},workshop);
  const chips=make('path',{d:'M0 0h2m4-3h2m-9-3h2',stroke:'#e1ba7b','stroke-width':1},workshop);
  const hammer=make('g',{},pose);
  hammer.innerHTML='<path d="M12-5l4-10" stroke="#bf9057" stroke-width="2"/><path d="M12-17l9 3-1 4-9-3z" fill="#9caaa8" stroke="#495655" stroke-width="1"/>';
  const projects=[
   ['casinha','M-14 0v-21h28V0Z','M-18-21L0-36 18-21Z','M-5 0v-14h10V0M-11-18h5v5h-5m17-5h5v5h-5'],
   ['mesa','M-15-14h30v4h-30Z','M-12-10V0m24-10V0','M-10-13H10'],
   ['guarda-roupa','M-13 0v-33h26V0Z','M-15-34h30v3h-30Z','M0-30V-2m-4-15h1m6 0h1'],
   ['pianinho','M-14 0v-23h28V0Z','M-16-15h32v5h-32Z','M-12-14h24m-22 0v3m4-3v3m4-3v3m4-3v3m4-3v3M-10-20h20'],
   ['cadeira','M-10-14h20v4h-20Z','M-10-14v-18h20v18','M-8-10V0m16-10V0M-8-28H8m-16 6H8'],
   ['porta','M-12 0v-34h24V0Z','M-15 0v-37h30V0','M-8-29H8v11H-8Zm0 15H8v10H-8Zm13-3h2']
  ];
  function drawProject(stage,index){
   const project=projects[index%projects.length];
   build.innerHTML='<path d="'+project[1]+'" fill="#b38352" stroke="#62452f" stroke-width="1.5"/>'+
    (stage>=1?'<path d="'+project[2]+'" fill="#84583c" stroke="#4e392b" stroke-width="1.5"/>':'')+
    (stage>=2?'<path d="'+project[3]+'" fill="#e1be83" stroke="#68492f" stroke-width="1.2"/>':'');
   build.setAttribute('transform','translate(239 184) scale(.7)');
  }
  const costume=make('g',{},pose);
  const umbrella=make('g',{},pose);
  umbrella.innerHTML='<path d="M12-38V-5q0 5-4 2" fill="none" stroke="#dbb77a" stroke-width="1.5"/><path d="M-7-32Q12-54 31-32Q25-36 19-32Q12-37 6-32Q0-36-7-32Z" fill="#b56949" stroke="#5c4033"/><path d="M12-44Q6-39 6-32M12-44Q19-39 19-32" fill="none" stroke="#e5b36d"/>';
  const witch=make('g',{'aria-hidden':'true'},svg);
  svg.insertBefore(witch,svg.querySelector('#kiln-side'));
  witch.innerHTML='<path d="M-14 3H17m-28-2-9-3v8l9-1M-4 0l3-9 6 1 3 8M-2-10l4-9 5 9H-5m6 1v4h5v-4M3-3l7 5 3-1" fill="#242b3b" stroke="#242b3b" stroke-width="1.5"/>';
  let witchNext=180000+Math.random()*420000,witchStart=null;
  let memory={};try{memory=JSON.parse(localStorage.getItem('estufa-owl-v1')||'{}');}catch{}
  const director=new Director(memory),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let last=0,frame=0,saved='',demo=null,position=[-25,80];
  const persist=()=>{if(demo)return;const value=JSON.stringify(director.memory);if(value!==saved){try{localStorage.setItem('estufa-owl-v1',value);saved=value;}catch{}}};
  function telemetry(t){if(demo)return;director.sensors({coolers:t?.status==='online'&&typeof t.coolers==='boolean'?t.coolers:undefined,temperature:t?.airT,valid:t?.airValid===true});}
  window.addEventListener('scene-wood',e=>{if(!demo)director.sensors({woodReady:e.detail?.ready===true});});
  director.sensors({woodReady:window.FabricaSceneWood?.ready===true});
  window.addEventListener('scene-telemetry',e=>telemetry(e.detail));
  window.addEventListener('hatch-state',e=>{if(!demo)director.sensors({hatch:e.detail?.position});});
  telemetry(window.FabricaSceneTelemetry);
  function render(dt){
   hammer.style.display='none';chips.style.display='none';
   drawProject(director.memory.buildStage,director.memory.project);
   const night=demo?demo.night:svg.dataset.day==='false';
   director.sensors({rain:demo?demo.rain===true:svg.dataset.weather==='rain'});
   if(night&&director.time>witchNext&&witchStart===null)witchStart=director.time;
   const witchAge=witchStart===null?Infinity:(director.time-witchStart)/14000;
   witch.style.display=night&&witchAge<1&&!reduced.matches?'':'none';
   if(witchAge<1)witch.setAttribute('transform','translate('+(-30+460*witchAge)+' '+(48+5*Math.sin(witchAge*Math.PI*2))+') scale(.6)');
   if(witchStart!==null&&witchAge>=1){witchStart=null;witchNext=director.time+300000+Math.random()*600000;}
   const v=director.step(dt,night),t=v.age/1000,p=Math.min(1,v.age/CONFIG.storyDuration);
   let x=107,y=80,angle=0,headAngle=0,eyeX=0,closed=false,fly=false,stretch=1;
   [object,insect,feather,shine].forEach(e=>e.style.display='none');
   nest.style.display=director.memory.nest?'':'none';
   costume.style.display='none';umbrella.style.display='none';
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
   if(v.state==='shelter'){
    umbrella.style.display='';
    const f=Math.min(1,t/1.4);
    umbrella.setAttribute('transform','translate(0 '+(8*(1-f))+') scale('+(.2+.8*f)+' 1)');
    headAngle=5*Math.sin(t*.8);closed=t>4&&t%12>7;
   }
   if(v.state==='idle'){closed=Math.floor(t/8)%3===1;headAngle=closed?4:7*Math.sin(t*.6);if(t%17>14)angle=4*Math.sin(t*5);}
   if(v.state==='story'){
    const id=v.story;
    if(id==='oficina'){
     const smooth=f=>{f=Math.max(0,Math.min(1,f));return f*f*(3-2*f);};
     // Inspect, decide, carry a plank, hammer, admire, return.
     let f=0;
     if(p<.22){f=smooth(p/.22);x=107+28*f;y=80+73*f;fly=p<.18;headAngle=22*f;}
     else if(p<.34){x=135;y=153;headAngle=15*Math.sin(t*3);object.style.display='';object.setAttribute('transform','translate(146 155) rotate(-25)');}
     else if(!director.woodReady){f=smooth((p-.34)/.66);x=135-28*f;y=153-73*f;fly=true;headAngle=-12*Math.sin(p*Math.PI);}
     else if(p<.5){f=smooth((p-.34)/.16);x=135+79*f;y=153+34*f;fly=true;object.style.display='';object.setAttribute('transform','translate('+(x+12)+' '+(y-5)+') rotate(-20) scale(3 1)');}
     else if(p<.82){x=214;y=187;headAngle=14;angle=2*Math.sin(t*8);
      hammer.style.display='';hammer.setAttribute('transform','rotate('+(-25+45*Math.sin(t*10))+' 10 -4)');
      chips.style.display=Math.sin(t*10)>.6?'':'none';chips.setAttribute('transform','translate(230 180)');
      drawProject(Math.min(2,director.memory.buildStage+(p>.7?1:0)),director.memory.project);
      costume.style.display='';costume.innerHTML='<path d="M-7-13H7V0H-7Z" fill="#58777b"/><path d="M-4-10h8v5h-8Z" fill="#c2a175"/>';
     }else if(p<.9){x=214;y=187;headAngle=-12;shine.style.display='';shine.setAttribute('transform','translate(254 162)');}
     else {f=smooth((p-.9)/.1);x=214-107*f;y=187-107*f;fly=true;}
    }
    if(['pirata','marceneira','jardineira'].includes(id)){
     costume.style.display=p>.12&&p<.92?'':'none';
     const phase=Math.max(0,Math.min(1,(p-.25)/.5));
     if(id==='pirata'){
      costume.innerHTML='<path d="M-14-26Q-9-36 0-30Q9-36 14-26L8-23H-8Z" fill="#302c29" stroke="#bc985b"/><path d="M-2-29h4v3h-4" fill="#e8dcc1"/><path d="M3-22h6v6H3Z" fill="#252623"/><path d="M-10-24L9-16" stroke="#252623"/><path d="M11-15h12v4H11Z" fill="#b39350"/>';
      headAngle=-12+20*Math.sin(phase*Math.PI);angle=3*Math.sin(t*2);
      if(p>.55&&p<.72){headAngle=-22;stretch=.94;}
     }else if(id==='marceneira'){
      costume.innerHTML='<path d="M-11-25v-4h5v-4H5v4h6v4Z" fill="#cfa250"/><path d="M-6-12H6V0H-6Z" fill="#56767b"/><path d="M-4-10h8v5h-8Z" fill="#b99568"/><path d="M9-8l6-8m-4-2 8 4" stroke="#b7b9ac" stroke-width="3"/>';
      angle=p>.25&&p<.7?4*Math.sin(t*9):0;
      object.style.display='';object.setAttribute('transform','translate(124 82)');
      if(p>.74){shine.style.display='';shine.setAttribute('transform','translate(124 77)');headAngle=10;}
     }else{
      costume.innerHTML='<path d="M-15-25H15v-3H8v-5H-7v5h-8Z" fill="#c8b375" stroke="#806b43"/><path d="M-7-12H7V0H-7Z" fill="#638258"/><path d="M11-7h7v7h-7m7-5 5-3" fill="#8da5a0" stroke="#506f70"/>';
      headAngle=12;angle=p>.3&&p<.7?8:0;
      if(p>.35&&p<.75){insect.style.display='';insect.setAttribute('transform','translate(132 '+(83+3*Math.sin(t*8))+')');}
      if(p>.8)headAngle=-10;
     }
    }
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
   button('Madeira pronta (simulação)',()=>director.sensors({woodReady:true}));button('Madeira ainda úmida',()=>director.sensors({woodReady:false}));
   button('Chuva',()=>{demo.rain=!demo.rain;});button('Bruxinha',()=>{witchNext=director.time;});
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
