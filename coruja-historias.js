/* Bichos da cena da estufa e visitas ao céu noturno. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else{root.CorujaHistorias=api;api.mount();}})(globalThis,function(){
'use strict';
const MINUTE=60000,DAY=86400000;
const CONFIG={
 flight:2400,eatMin:12*MINUTE,eatMax:20*MINUTE,
 skyMin:35*MINUTE,skyMax:85*MINUTE,skyDuration:10000,
 perchMin:6*MINUTE,perchMax:12*MINUTE,dryTime:60*MINUTE,fireworksInterval:300000
};
const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'});
function clock(now=Date.now()){const p=Object.fromEntries(fmt.formatToParts(new Date(now)).map(x=>[x.type,x.value]));return{year:+p.year,month:+p.month,day:+p.day,hour:+p.hour,key:p.year+'-'+p.month+'-'+p.day,serial:Date.UTC(+p.year,+p.month-1,+p.day)/DAY};}
function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=(h+l-7*m+114)%31+1;return Date.UTC(y,month-1,day)/DAY;}
function sunday(y,m,n){return 1+(7-new Date(Date.UTC(y,m-1,1)).getUTCDay())%7+7*(n-1);}
const BIRTHDAYS={
'01-14':{id:'avo',label:'Aniversário da vovó do Piauí',special:'cashew'},
'02-11':{id:'voce',label:'Feliz aniversário!'},
'02-27':{id:'pai',label:'Feliz aniversário, pai!'},
'03-12':{id:'cavernosa',label:'Feliz aniversário, Cavernosa!',special:'drums'},
'03-30':{id:'nera',label:'Feliz aniversário, Nera',special:'computer'},
'06-20':{id:'familia',label:'Mãe, tia Fran e bisavó · feliz aniversário!'},
'09-13':{id:'bruno',label:'Feliz aniversário, Bruno!',special:'davi'},
'10-18':{id:'madelaine',label:'Tinenem te amo, ass: Bonnie',special:'flowers'},
'11-06':{id:'coruja',label:'Aniversário da corujinha',since:2026}};
function events(d){
 const md=String(d.month).padStart(2,'0')+'-'+String(d.day).padStart(2,'0'),out=[],b=BIRTHDAYS[md];
 if(b&&(!b.since||d.year>=b.since))out.push({...b,birthday:true});
 const delta=d.serial-easter(d.year),add=(test,id,label)=>{if(test)out.push({id,label});};
 add(d.month===12&&d.day>=15&&d.day<=26,'natal','Feliz Natal!');
 add(d.month===12&&d.day>=27||d.month===1&&d.day<=3,'ano-novo','Feliz Ano Novo!');
 add(delta>=-3&&delta<=1,'pascoa','Feliz Páscoa!');
 add(delta>=-51&&delta<=-46,'carnaval','Carnaval');
 add(d.month===11&&d.day<=3,'mortos','Dia dos Mortos · carinho e memória');
 add(d.month===7&&d.day>=11&&d.day<=17,'carmo','Nossa Senhora do Carmo · 14 de julho');
 add(d.month===5&&Math.abs(d.day-sunday(d.year,5,2))<=3,'maes','Feliz Dia das Mães!');
 add(d.month===8&&Math.abs(d.day-sunday(d.year,8,2))<=3,'pais','Feliz Dia dos Pais!');
 return out;
}
const smooth=n=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n);};
function ripeness(serial,index){return((serial+index)%3+.8)/3;}
const fruitCycle=(serial,index)=>Math.floor((serial+index)/3);
const between=(min,max,random)=>min+random()*(max-min);
const skyKinds=['witch','fairy','meteor'];
class SkySchedule{
 constructor(next,lastKind,random=Math.random){
  this.random=random;
  this.next=Number.isFinite(next)?next:Date.now()+this.delay();
  this.kind=skyKinds.includes(lastKind)?lastKind:null;
  this.start=null;
 }
 delay(){return between(CONFIG.skyMin,CONFIG.skyMax,this.random);}
 update(now,night){
  if(!night){this.start=null;return null;}
  if(this.start===null&&now>=this.next){
   const choices=skyKinds.filter(kind=>kind!==this.kind);
   this.kind=choices[Math.floor(this.random()*choices.length)];
   this.start=now;
   this.next=now+this.delay();
  }
  if(this.start===null)return null;
  const age=now-this.start;
  if(age>=0&&age<CONFIG.skyDuration)return{kind:this.kind,fraction:age/CONFIG.skyDuration};
  this.start=null;
  return null;
 }
}
const perches={roof:[107,80],tree:[301,48],away:[-35,68]};
const skyArt={
 meteor:'<path d="M-35-16L0 0" stroke="#d6e0d4"/><path d="M-18-8L0 0" stroke="#f4dfae" stroke-width="2"/><rect x="-1" y="-1" width="3" height="3" fill="#fff2c8"/>',
 witch:'<path d="M-19 6H18" stroke="#d2a877" stroke-width="2"/><path d="m-20 4-12-4v11l12-3z" fill="#b18363"/><path d="M-10 5l7-14 7 2 5 12z" fill="#4d376a"/><path d="M-3-11H7v5H1z" fill="#e5b69d"/><path d="m-8-12 7-1 4-11 6 11 5 1v2H-8z" fill="#50386b"/><path d="M3-4l11 7" stroke="#e5b69d" stroke-width="2"/>',
 fairy:'<path d="M-2 0-18-15v10l6 7-5 3 3 5 12-6M2 0l16-15v10l-6 7 5 3-3 5L2 4" fill="#d5ccfa" stroke="#f2dfff" opacity=".95"/><path d="M-5 2h10l6 10H-10z" fill="#e58bb9"/><path d="M-4-10h8v9h-8z" fill="#fbd4bd"/><path d="M-5-11h10v3H-2v3h-3z" fill="#edc571"/><path d="M4 3l11-8" stroke="#fbd4bd" stroke-width="2"/><path d="M16-11v9m-4-5h9M-21 2v5m-2-2h5M22 5v5m-2-2h5" stroke="#fff3b2"/>'
};
const illustratedPerches={roof:[82,87],tree:[254,145],away:perches.away};
class Vulture{
 constructor(rain={},random=Math.random){
  this.random=random;
  this.raining=Number.isFinite(rain.lastSeen)&&Date.now()-rain.lastSeen<30*MINUTE;
  this.lastRainSeen=this.raining?rain.lastSeen:null;
  this.dryUntil=Number.isFinite(rain.dryUntil)?rain.dryUntil:0;
  this.target=null;
 }
 updateRain(now,weather){
  if(!weather)return;
  if(weather==='rain'){
   if(!this.raining||now-this.lastRainSeen>=5*MINUTE)this.lastRainSeen=now;
   this.raining=true;
   this.dryUntil=0;
  }else if(this.raining){
   this.raining=false;
   this.lastRainSeen=null;
   this.dryUntil=now+CONFIG.dryTime;
  }
 }
 travel(target,now,from){
  this.target=target;
  this.from=from;
  this.started=now;
  this.next=now+CONFIG.flight+between(CONFIG.perchMin,CONFIG.perchMax,this.random);
 }
 position(now,instant){
  const end=(this.perches||perches)[this.target];
  if(!this.from||instant)return{x:end[0],y:end[1],flying:false};
  const fraction=smooth((now-this.started)/CONFIG.flight);
  return{
   x:this.from.x+(end[0]-this.from.x)*fraction,
   y:this.from.y+(end[1]-this.from.y)*fraction-26*Math.sin(Math.PI*fraction),
   flying:fraction<1
  };
 }
 step(now,day,weather,instant=false){
  this.updateRain(now,weather);
  const drying=day&&!this.raining&&now<this.dryUntil;
  if(this.target===null)this.travel(day?drying?'roof':'tree':'away',now,null);
  let target=this.target;
  if(!day)target='away';
  else if(drying||target==='away')target='roof';
  else if(now>=this.next)target=target==='roof'?'tree':'roof';
  if(target!==this.target)this.travel(target,now,this.position(now,instant));
  const pose=this.position(now,instant);
  return{
   ...pose,visible:target!=='away'||pose.flying,
   drying:drying&&!pose.flying,perch:target
  };
 }
}
class Director{
 constructor(random=Math.random){this.random=random;this.state='away';this.time=0;this.since=0;this.night=null;this.nextEat=0;}
 enter(state){this.state=state;this.since=this.time;}
 wait(){this.nextEat=this.time+CONFIG.eatMin+this.random()*(CONFIG.eatMax-CONFIG.eatMin);}
 step(dt,night,ripe=[]){
  this.time+=dt;
  if(night!==this.night){this.night=night;this.enter(night?'arrival':this.state==='away'?'away':'departure');this.wait();}
  const age=this.time-this.since;
  if(this.state==='arrival'&&age>=CONFIG.flight)this.enter('perch');
  if(this.state==='departure'&&age>=CONFIG.flight)this.enter('away');
  if(this.state==='eat'&&age>=24000){this.enter('perch');this.wait();}
  if(this.state==='perch'&&this.time>=this.nextEat){
   if(ripe.length){this.fruit=ripe[Math.floor(this.random()*ripe.length)];this.enter('eat');}else this.wait();
  }
  return{state:this.state,age:this.time-this.since};
 }
}
function mount(){
 const svg=document.querySelector('.mission-art svg'),owl=document.getElementById('scene-owl');
 if(!svg||!owl||svg.dataset.owlStories)return;svg.dataset.owlStories='simple';
 const ns='http://www.w3.org/2000/svg';
 const make=(tag,a={},parent=svg)=>{const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(a))e.setAttribute(k,v);parent.append(e);return e;};
 const group=(id,parent=svg)=>make('g',{id,'aria-hidden':'true','pointer-events':'none'},parent);
 const show=(el,on)=>el.style.display=on?'':'none';
 const move=(el,x,y,extra='')=>el.setAttribute('transform','translate('+x.toFixed(2)+' '+y.toFixed(2)+') '+extra);
 const back=group('owl-simple-sky');svg.insertBefore(back,svg.querySelector('#kiln-side'));
 const sky=group('owl-sky-event',back),fireworks=group('owl-new-year-fireworks',back);
 const witchUrl=window.ESTUFA_ASSETS?.witch||'./bruxinha.png';
 const witchArt=new Image();
 let witchReady=false;
 witchArt.onload=()=>{witchReady=true;};
 witchArt.src=witchUrl;
 for(const[x,y,color]of[[48,58,'#edd295'],[165,48,'#dfb0cb'],[253,59,'#a6d0c1']]){
  const burst=make('g',{transform:'translate('+x+' '+y+')'},fireworks),rays=make('g',{},burst);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;make('path',{d:'M'+(Math.cos(a)*5)+' '+(Math.sin(a)*5)+'l'+(Math.cos(a)*12)+' '+(Math.sin(a)*12),stroke:color,'stroke-width':1},rays);}
 }
 const decorations=group('owl-tree-decorations');svg.insertBefore(decorations,owl);
 const vulture=make('g',{id:'scene-vulture',role:'img','shape-rendering':'crispEdges'});
 svg.insertBefore(vulture,owl);
 vulture.innerHTML=`
  <g class="vulture-wings">
   <path d="M-10-16l-11-9h-15v5h4v5h5v4h5v4l12 4zm20 0 11-9h15v5h-4v5h-5v4h-5v4l-12 4z" fill="#37434d"/>
   <path d="M-14-14l-9-7h-9m7 6 9 6m30-5 9-7h9m-7 6-9 6" fill="none" stroke="#78828b" stroke-width="2"/>
  </g>
  <path d="M-8-5h16v6H-8z" fill="#313b45"/>
  <path d="M-8-18H8v3h4v9H8v4H-8v-4h-4v-9h4z" fill="#414c56"/>
  <path d="M-6-14H6v10H-6z" fill="#64717c"/>
  <path d="M-8-20H8v3H5v2H-5v-2h-3z" fill="#f0dec6"/>
  <path d="M-6-29H6v2h2v6H6v3H-6v-3h-2v-6h2z" fill="#a3a0ac"/>
  <path d="M-5-27H5v2H-5z" fill="#c4bbc4"/>
  <path d="M-7-22h2v2h-2zm12 0h2v2H5z" fill="#cb97a6"/>
  <path class="vulture-eyes" d="M-5-25h3v3h-3zm7 0h3v3H2z" fill="#26333c"/>
  <path class="vulture-blink" d="M-6-23h4v1h-4zm8 0h4v1H2z" fill="#26333c"/>
  <path d="M-2-22h5v4H1v2h-2v-3h-1z" fill="#ebba7f"/>
  <path d="M-7-2h5v3h-5zm9 0h5v3H2z" fill="#c6a483"/>`;
 const vultureWings=vulture.querySelector('.vulture-wings');
 const vultureEyes=vulture.querySelector('.vulture-eyes');
 const vultureBlink=vulture.querySelector('.vulture-blink');
 const vultureFallback=Array.from(vulture.children);
 const vultureSprite=make('svg',{width:48,height:48,x:-24,y:-42,overflow:'hidden','image-rendering':'pixelated'});
 const vultureUrl=window.ESTUFA_ASSETS?.vulture||'./urubu-sprites.png?v=1';
 const vultureAtlas=make('image',{href:vultureUrl,'image-rendering':'pixelated'});
 vultureSprite.append(vultureAtlas);
 vulture.append(vultureSprite);
 show(vultureSprite,false);
 const vultureArt=new Image();
 let vultureFrame=-1;
 let vultureDirection=1;
 let lastVultureX=null;
 vultureArt.onload=()=>{
  vultureAtlas.setAttribute('width',vultureArt.naturalWidth);
  vultureAtlas.setAttribute('height',vultureArt.naturalHeight);
  vultureFallback.forEach(part=>part.setAttribute('visibility','hidden'));
  vultureSprite.setAttribute('viewBox',[0,0,vultureArt.naturalWidth/3,vultureArt.naturalHeight/2].join(' '));
  show(vultureSprite,true);
 };
 vultureArt.src=vultureUrl;
 const wetUrl=window.ESTUFA_ASSETS?.wetVulture||'./urubu-molhado.png';
 const wetSprite=make('svg',{width:48,height:48,x:-24,y:-42,overflow:'hidden','image-rendering':'pixelated'},vulture);
 const wetAtlas=make('image',{href:wetUrl},wetSprite);
 const splash=make('g',{'aria-hidden':'true','pointer-events':'none'},vulture);
 const drops=Array.from({length:10},()=>make('rect',{width:1.3,height:1.3,fill:'#d7f2ff'},splash));
 show(wetSprite,false);
 show(splash,false);
 const wetArt=new Image();
 let wetReady=false;
 let wetSince=null;
 wetArt.onload=()=>{
  wetAtlas.setAttribute('width',wetArt.naturalWidth);
  wetAtlas.setAttribute('height',wetArt.naturalHeight);
  wetReady=true;
 };
 wetArt.src=wetUrl;
 const frontUrl=window.ESTUFA_ASSETS?.frontVulture||'./urubu-de-frente.png';
 const frontSprite=make('svg',{width:42,height:42,x:-21,y:-40,overflow:'hidden','image-rendering':'pixelated'},vulture);
 const frontAtlas=make('image',{href:frontUrl,'image-rendering':'pixelated'},frontSprite);
 show(frontSprite,false);
 const frontArt=new Image();
 let frontReady=false;
 let frontPerchedAt=null;
 frontArt.onload=()=>{
  frontAtlas.setAttribute('width',frontArt.naturalWidth);
  frontAtlas.setAttribute('height',frontArt.naturalHeight);
  frontReady=true;
 };
 frontArt.src=frontUrl;
 function drawFrontVulture(now,pose,raining,still){
  const canLook=pose.visible&&!pose.flying&&!pose.drying&&!raining;
  if(!canLook)frontPerchedAt=null;
  else if(frontPerchedAt===null||now<frontPerchedAt)frontPerchedAt=now;
  const cycle=canLook?(now-frontPerchedAt)%24000:0;
  const looking=canLook&&frontReady&&cycle>=2800&&cycle<6100;
  show(frontSprite,looking);
  if(looking){
   show(vultureSprite,false);
   const blink=!still&&cycle>=4350&&cycle<4520;
   const width=frontArt.naturalWidth/2;
   frontSprite.setAttribute('viewBox',[blink?width:0,0,width,frontArt.naturalHeight].join(' '));
  }
  return looking;
 }
 function drawWetVulture(now,pose,raining,still){
  const wet=pose.visible&&!pose.flying&&raining;
  if(!wet)wetSince=null;
  else if(wetSince===null||now<wetSince)wetSince=now;
  const useWet=wet&&wetReady;
  show(wetSprite,useWet);
  show(vultureSprite,!useWet&&!!vultureArt.naturalWidth);
  const cycle=wet?(now-wetSince)%18000:0;
  const shake=useWet&&!still&&cycle>=1000&&cycle<1850;
  const elapsed=cycle-1000;
  show(splash,shake);
  if(!useWet)return false;
  const frame=shake?[1,2,3,2,3,1,0][Math.min(6,Math.floor(elapsed/120))]:0;
  const width=wetArt.naturalWidth/2,height=wetArt.naturalHeight/2;
  wetSprite.setAttribute('viewBox',[frame%2*width,Math.floor(frame/2)*height,width,height].join(' '));
  wetSprite.setAttribute('transform','scale('+vultureDirection+' 1)');
  if(shake){
   const progress=elapsed/850;
   drops.forEach((drop,i)=>{
    const side=i%2?-1:1;
    drop.setAttribute('x',side*(4+(12+i%5*2)*progress));
    drop.setAttribute('y',-15-i%5*2-19*progress+31*progress*progress);
    drop.setAttribute('opacity',1-progress);
   });
  }
  return shake;
 }
 function drawVultureSprite(now,pose,still){
  if(lastVultureX!==null&&pose.flying&&Math.abs(pose.x-lastVultureX)>.02){
   vultureDirection=pose.x>lastVultureX?1:-1;
  }
  lastVultureX=pose.x;
  if(!vultureArt.naturalWidth)return;
  let next=0;
  if(pose.flying&&!still)next=[3,4,5,4][Math.floor(now/120)%4];
  else if(pose.drying)next=2;
  else if(!still&&now%6700<160)next=1;
  if(next!==vultureFrame){
   vultureFrame=next;
   const width=vultureArt.naturalWidth/3;
   const height=vultureArt.naturalHeight/2;
   vultureSprite.setAttribute('viewBox',[next%3*width,Math.floor(next/3)*height,width,height].join(' '));
  }
  vultureSprite.setAttribute('transform','scale('+vultureDirection+' 1)');
 }
 const balloons=group('owl-birthday-balloons',decorations),ornaments=group('owl-festival-ornaments',decorations);
 const pose=make('g',{},owl);while(owl.firstChild!==pose)pose.append(owl.firstChild);
 const head=pose.querySelector('.owl-head'),pupils=pose.querySelector('.owl-pupils'),blink=pose.querySelector('.owl-blink'),wings=pose.lastElementChild;
 const hat=group('owl-birthday-hat',pose);
 hat.innerHTML='<path d="M-7-25L0-39 8-25Z" fill="#d4b073" stroke="#aa8261"/><path d="M-4-30h8M-1-35h3" stroke="#a0b9b0"/><path d="M-1-40h3v2h-3Z" fill="#e5c195"/>';
 const snack=group('owl-guava-snack',owl),defs=make('defs'),clip=make('clipPath',{id:'owl-guava-bite-clip'},defs),bite=make('rect',{x:-6,y:-7,width:12,height:14},clip);
 make('g',{'clip-path':'url(#owl-guava-bite-clip)'},snack).innerHTML='<path d="M-4-6H4L6-2V4L2 7H-3L-6 2V-3Z" fill="#e2c75e" stroke="#927e3e"/><path d="M-2-4H3L4 3L0 5-3 2Z" fill="#edaa9b"/><path d="M0-2h1v1H0m-2 2h1v1h-1m3 0h1v1H1" fill="#986957"/>';
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),director=new Director();
 let persisted={};
 try{persisted=JSON.parse(localStorage.getItem('estufa-coruja-simples')||'{}')||{};}catch{}
 const schedule=new SkySchedule(persisted.nextSky,persisted.skyKind);
 const bird=new Vulture(persisted.rain||{});
 const picked=Array.isArray(persisted.picked)?persisted.picked.slice(0,5):[];
 let lastSave='',demo=null,frame=0,last=0,acc=0,previous='',position=[-30,80],origin=position.slice(),dateKey='',ripe=[],fruits=[],activeFruit=null,activeCycle=null;
 const save=()=>{
  if(demo)return;
  const rain={lastSeen:bird.lastRainSeen,dryUntil:bird.dryUntil};
  const value=JSON.stringify({nextSky:schedule.next,skyKind:schedule.kind,picked,rain});
  if(value===lastSave)return;
  lastSave=value;
  try{localStorage.setItem('estufa-coruja-simples',value);}catch{}
 };
 function decorate(d,ev){
  if(dateKey===d.key)return;dateKey=d.key;
  balloons.replaceChildren();ornaments.replaceChildren();fruits=Array.from(svg.querySelectorAll('.guava-fruit'));ripe=[];
  fruits.forEach((fruit,i)=>{const r=ripeness(d.serial,i),mix=(a,b)=>Math.round(a+(b-a)*r);if(r>=.8)ripe.push(i);fruit.querySelector('path')?.setAttribute('fill','rgb('+[mix(116,230),mix(158,204),mix(74,94)].join(',')+')');show(fruit,true);});
  const birthday=ev.some(e=>e.birthday),festivals=ev.filter(e=>!e.birthday);
  if(birthday)for(const[x,y,color]of[[267,80,'#d5a0af'],[289,72,'#e2c37b'],[344,78,'#a1bfbc']]){
   make('path',{d:'M'+x+' '+y+'v24',stroke:'#c6c0a6','stroke-width':.7},balloons);
   make('ellipse',{cx:x,cy:y,rx:4,ry:6,fill:color},balloons);
  }
  if(!festivals.length)return;
  const ids=festivals.map(e=>e.id),colors=ids.includes('natal')?['#b97f73','#e6c882','#b6c4a1']:ids.includes('mortos')?['#e1ac69','#c8a1bb','#deb96b']:['#c9afcf','#a2c9c1','#e4ca87'];
  make('path',{d:'M265 88q35 27 83 5M279 64q29 22 61 18M275 117q31 27 71 5',fill:'none',stroke:'#bfa97b','stroke-width':.9},ornaments);
  for(let i=0;i<14;i++){
   const x=267+(i*19)%77,y=67+(i*23)%62,color=colors[i%colors.length];
   if(ids.includes('pascoa'))make('ellipse',{cx:x,cy:y,rx:2,ry:3,fill:color},ornaments);
   else if(ids.includes('maes')||ids.includes('mortos'))make('path',{d:'M-1-3h2v2h2v2H1v2h-2V1h-2v-2h2Z',transform:'translate('+x+' '+y+')',fill:color},ornaments);
   else make('path',{d:'M-1-3h2v2h2v2H1v2h-2V1h-2v-2h2Z',transform:'translate('+x+' '+y+')',fill:color},ornaments);
  }
  if(ids.includes('carmo'))make('g',{},ornaments).innerHTML='<path d="M286 127h8v10h-8z" fill="#b18b65"/><path d="M290 129v6m-2-4h4" stroke="#edd6a5"/>';
  if(ids.includes('pais'))make('path',{d:'M337 125l5 5-3 8-4-8Z',fill:'#839eae'},ornaments);
 }
 function draw(dt){
  const now=demo?.now??Date.now(),d=clock(now),ev=events(d);
  const night=demo?demo.night:svg.dataset.day?svg.dataset.day==='false':d.hour<6||d.hour>=18;
  bird.perches=svg.dataset.illustrated?illustratedPerches:perches;
  const birdPose=bird.step(now,!night,demo?demo.weather:svg.dataset.weather,motion.matches);
  show(vulture,birdPose.visible);
  move(vulture,birdPose.x,birdPose.y);
  show(vultureWings,birdPose.drying||birdPose.flying);
  const eyesShut=now%6700<150;
  show(vultureEyes,!eyesShut);
  show(vultureBlink,eyesShut);
  drawVultureSprite(now,birdPose,motion.matches);
  const raining=(demo?demo.weather:svg.dataset.weather)==='rain';
  const shaking=drawWetVulture(now,birdPose,raining,motion.matches);
  const looking=drawFrontVulture(now,birdPose,raining,motion.matches);
  const vultureLabel=shaking?'Urubu sacudindo a água das penas':looking?'Urubu olhando de frente':birdPose.drying?'Urubu secando as asas no telhado':birdPose.flying?'Urubu voando':birdPose.perch==='roof'?'Urubu pousado na estufa':'Urubu pousado na goiabeira';
  if(vulture.getAttribute('aria-label')!==vultureLabel)vulture.setAttribute('aria-label',vultureLabel);
  const sceneLabel=night?'Estufa solar com corujinha e goiabeira à noite.':'Estufa solar com urubu e goiabeira durante o dia.';
  if(svg.getAttribute('aria-label')!==sceneLabel)svg.setAttribute('aria-label',sceneLabel);
  decorate(d,ev);
  const eligible=ripe.filter(i=>picked[i]!==fruitCycle(d.serial,i));
  const v=director.step(dt,night&&!birdPose.visible,eligible),t=v.age/1000,p=Math.min(1,v.age/24000);
  if(v.state!==previous){
   if(previous==='eat')activeFruit=null;
   origin=position.slice();previous=v.state;
   if(v.state==='eat'){
    activeFruit=director.fruit;
    activeCycle=fruitCycle(d.serial,activeFruit);
   }
  }
  const perchY=svg.dataset.illustrated?143:155;
  let x=276,y=perchY,fly=false,tilt=0,headAngle=3*Math.sin(director.time/1100),caption='Corujinha descansando no galho';
  show(snack,false);show(hat,ev.some(e=>e.birthday));show(owl,v.state!=='away');
  if(v.state==='arrival'||v.state==='departure'){
   const f=smooth(v.age/CONFIG.flight),target=v.state==='arrival'?[276,perchY]:[-30,75];
   x=origin[0]+(target[0]-origin[0])*f;y=origin[1]+(target[1]-origin[1])*f-32*Math.sin(Math.PI*f);fly=true;caption=v.state==='arrival'?'Coruja chegando ao pôr do sol':'Coruja saindo ao nascer do sol';
  }
  if(v.state==='eat'){
   const at=fruits[activeFruit]?.getAttribute('transform')?.match(/translate\(([-.\d]+) ([-.\d]+)/),fx=at?+at[1]:283,fy=at?+at[2]:69;
   if(p<.24){const f=smooth(p/.24);x=276+(fx-276)*f;y=perchY+(fy+20-perchY)*f;fly=true;}
   else if(p<.42){const f=smooth((p-.24)/.18);x=fx+(276-fx)*f;y=fy+20+(perchY-fy-20)*f;fly=true;}
   if(p>=.24){
    if(activeFruit!==null)picked[activeFruit]=activeCycle;
    show(snack,p<.93);move(snack,7,(svg.dataset.illustrated?-15:-10)+(p>.42?Math.sin(t*5)*.7:0));
    bite.setAttribute('width',String(12-Math.max(0,Math.min(4,Math.floor((p-.42)/.12)))*2.7));
    if(p>.42)headAngle=3*Math.sin(t*5);
   }
   caption='Corujinha comendo uma goiaba madura';
  }
  if(motion.matches){x=276;y=perchY;fly=false;headAngle=0;}
  if(v.state==='away'){x=-30;y=75;}
  position=[x,y];move(owl,x,y);pose.setAttribute('transform','rotate('+tilt+')');head?.setAttribute('transform','rotate('+headAngle+' 0 -18)');
  const shut=director.time%6900<170;pupils?.setAttribute('opacity',shut?'0':'1');blink?.setAttribute('opacity',shut?'1':'0');show(wings,fly&&!motion.matches);wings?.setAttribute('transform','scale(1 '+(.7+.4*Math.sin(director.time/50))+')');owl.setAttribute('aria-label',caption);
  window.EstufaArt?.paintOwl(owl,{fly,age:v.age,time:director.time,state:v.state,shut,progress:p,x});
  fruits.forEach((fruit,i)=>show(fruit,picked[i]!==fruitCycle(d.serial,i)));
  const event=schedule.update(now,night);show(sky,!!event&&!motion.matches);
  if(event&&!motion.matches){
   const illustratedWitch=event.kind==='witch'&&witchReady;
   const artwork=illustratedWitch?'witch-illustrated':event.kind;
   if(sky.dataset.kind!==artwork){
    sky.dataset.kind=artwork;
    sky.replaceChildren();
    if(illustratedWitch){
     make('image',{href:witchUrl,x:-36,y:-23,width:72,height:46,'image-rendering':'pixelated','aria-hidden':'true'},sky);
    }else{
     sky.innerHTML=skyArt[event.kind];
    }
   }
   const f=event.fraction;
   if(event.kind==='meteor'){
    move(sky,90+210*f,26+55*f);
   }else{
    const tilt=illustratedWitch?4*Math.sin(f*4*Math.PI):0;
    move(sky,-25+450*f,64+5*Math.sin(f*Math.PI*2),'rotate('+tilt+') scale(.55)');
   }
   sky.setAttribute('opacity',String(Math.min(1,f*10,(1-f)*10)));
  }
  const newYear=ev.some(e=>e.id==='ano-novo'),phase=(director.time%CONFIG.fireworksInterval)/1000;
  show(fireworks,newYear&&night&&phase<7&&!motion.matches);
  if(newYear&&night&&phase<7&&!motion.matches){
   Array.from(fireworks.children).forEach((burst,i)=>{const f=((phase+i*1.1)%3)/3;burst.setAttribute('opacity',String(1-f));burst.firstElementChild?.setAttribute('transform','scale('+(.2+.8*f)+')');});
  }
  save();
 }
 function tick(now){frame=0;if(document.hidden)return;const dt=last?Math.min(100,now-last):0;last=now;acc+=dt;if(acc>=(motion.matches?250:40)){if(demo)demo.now+=acc;draw(acc);acc=0;}frame=requestAnimationFrame(tick);}
 document.addEventListener('visibilitychange',()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=0;acc=0;if(!document.hidden)frame=requestAnimationFrame(tick);});
 // Optional demonstration remains separate from real weather and equipment.
 if(window.ESTUFA_PREVIEW||new URLSearchParams(location.search).get('owlDemo')==='1'){
  demo={now:Date.parse('2026-11-07T15:00:00-03:00'),night:false,weather:'clear'};
  picked.length=0;
  const panel=document.createElement('details');panel.innerHTML='<summary>Demonstração dos bichos da estufa</summary>';panel.style.cssText='padding:10px;background:#fffbed;color:#264333';panel.open=true;
  const button=(name,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.style.cssText='margin:4px;padding:7px';b.onclick=()=>{fn();draw(0);};panel.append(b);};
  button('Pôr do sol',()=>{demo.night=true;});
  button('Nascer do sol',()=>demo.night=false);
  button('Chuva',()=>{demo.night=false;demo.weather='rain';});
  button('Fim da chuva',()=>{demo.night=false;demo.weather='clear';});
  button('Goiaba',()=>{
   const fruit=ripe.find(i=>picked[i]!==fruitCycle(clock(demo.now).serial,i));
   if(demo.night&&director.night&&fruit!==undefined){director.fruit=fruit;director.enter('eat');}
  });
  for(const [kind,label] of [['witch','Bruxa'],['fairy','Fada'],['meteor','Meteoro']]){
   button(label,()=>{demo.night=true;schedule.kind=kind;schedule.start=demo.now;schedule.next=demo.now+schedule.delay();});
  }
  button('Chapéu e balões',()=>{demo.now=Date.parse('2026-11-06T21:00:00-03:00');demo.night=true;});
  button('Natal',()=>{demo.now=Date.parse('2026-12-25T21:00:00-03:00');demo.night=true;});
  button('Ano Novo',()=>{demo.now=Date.parse('2027-01-01T21:00:00-03:00');demo.night=true;director.time=0;});
  if(!window.ESTUFA_PREVIEW)svg.closest('.mission-art').after(panel);
  window.CorujaDemo={director,schedule,set(options){Object.assign(demo,options);draw(0);},advance(ms){demo.now+=ms;draw(ms);}};
 }
 draw(0);frame=requestAnimationFrame(tick);
}
 return{CONFIG,BIRTHDAYS,clock,easter,sunday,events,ripeness,fruitCycle,Director,SkySchedule,Vulture,mount};
});
