/* Corujinha: versão simples. Só animação; não altera controles ou sensores. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else{root.CorujaHistorias=api;api.mount();}})(globalThis,function(){
'use strict';
const DAY=86400000,CONFIG={flight:2400,eatMin:720000,eatMax:1200000,skyInterval:9000000,skyDuration:10000,skySeparation:30000,fireworksInterval:300000};
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
class SkySchedule{
 constructor(next=Date.now()+CONFIG.skyInterval){this.next=next;this.start=null;}
 update(now,night){
  if(!night){this.start=null;return null;}
  if(this.start===null&&now>=this.next){this.start=now;this.next=now+CONFIG.skyInterval;}
  if(this.start===null)return null;
  const age=now-this.start;
  if(age<CONFIG.skyDuration)return{kind:'meteor',fraction:age/CONFIG.skyDuration};
  if(age>=CONFIG.skySeparation&&age<CONFIG.skySeparation+CONFIG.skyDuration)return{kind:'witch',fraction:(age-CONFIG.skySeparation)/CONFIG.skyDuration};
  if(age>=CONFIG.skySeparation+CONFIG.skyDuration)this.start=null;
  return null;
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
 const ns='http://www.w3.org/2000/svg',clockG=svg.querySelector('.scene-clock');
 const make=(tag,a={},parent=svg)=>{const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(a))e.setAttribute(k,v);parent.append(e);return e;};
 const group=(id,parent=svg)=>make('g',{id,'aria-hidden':'true','pointer-events':'none'},parent);
 const show=(el,on)=>el.style.display=on?'':'none';
 const move=(el,x,y,extra='')=>el.setAttribute('transform','translate('+x.toFixed(2)+' '+y.toFixed(2)+') '+extra);
 const back=group('owl-simple-sky');svg.insertBefore(back,svg.querySelector('#kiln-side'));
 const sky=group('owl-sky-event',back),fireworks=group('owl-new-year-fireworks',back);
 for(const[x,y,color]of[[48,58,'#edd295'],[165,48,'#dfb0cb'],[253,59,'#a6d0c1']]){
  const burst=make('g',{transform:'translate('+x+' '+y+')'},fireworks),rays=make('g',{},burst);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;make('path',{d:'M'+(Math.cos(a)*5)+' '+(Math.sin(a)*5)+'l'+(Math.cos(a)*12)+' '+(Math.sin(a)*12),stroke:color,'stroke-width':1},rays);}
 }
 const decorations=group('owl-tree-decorations');svg.insertBefore(decorations,owl);
 const balloons=group('owl-birthday-balloons',decorations),ornaments=group('owl-festival-ornaments',decorations);
 const pose=make('g',{},owl);while(owl.firstChild!==pose)pose.append(owl.firstChild);
 const head=pose.querySelector('.owl-head'),pupils=pose.querySelector('.owl-pupils'),blink=pose.querySelector('.owl-blink'),wings=pose.lastElementChild;
 const hat=group('owl-birthday-hat',pose);
 hat.innerHTML='<path d="M-7-25L0-39 8-25Z" fill="#d4b073" stroke="#aa8261"/><path d="M-4-30h8M-1-35h3" stroke="#a0b9b0"/><path d="M-1-40h3v2h-3Z" fill="#e5c195"/>';
 const snack=group('owl-guava-snack',owl),defs=make('defs'),clip=make('clipPath',{id:'owl-guava-bite-clip'},defs),bite=make('rect',{x:-6,y:-7,width:12,height:14},clip);
 make('g',{'clip-path':'url(#owl-guava-bite-clip)'},snack).innerHTML='<path d="M-4-6H4L6-2V4L2 7H-3L-6 2V-3Z" fill="#e2c75e" stroke="#927e3e"/><path d="M-2-4H3L4 3L0 5-3 2Z" fill="#edaa9b"/><path d="M0-2h1v1H0m-2 2h1v1h-1m3 0h1v1H1" fill="#986957"/>';
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),director=new Director();
 let persisted={};try{persisted=JSON.parse(localStorage.getItem('estufa-coruja-simples')||'{}')||{};}catch{}
 const schedule=new SkySchedule(Number.isFinite(persisted.nextSky)?persisted.nextSky:Date.now()+CONFIG.skyInterval);
 let lastSave='',demo=null,frame=0,last=0,acc=0,previous='',position=[-30,80],origin=position.slice(),dateKey='',ripe=[],fruits=[],eaten=new Set(),activeFruit=null;
 const save=()=>{if(demo)return;const value=JSON.stringify({nextSky:schedule.next});if(value!==lastSave){try{localStorage.setItem('estufa-coruja-simples',value);lastSave=value;}catch{}}};
 function decorate(d,ev){
  if(dateKey===d.key)return;dateKey=d.key;
  balloons.replaceChildren();ornaments.replaceChildren();eaten.clear();fruits=Array.from(svg.querySelectorAll('.guava-fruit'));ripe=[];
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
  decorate(d,ev);
  const eligible=ripe.filter(i=>!eaten.has(i));
  const v=director.step(dt,night,eligible),t=v.age/1000,p=Math.min(1,v.age/24000);
  if(v.state!==previous){
   if(previous==='eat'&&v.state==='perch'&&activeFruit!==null)eaten.add(activeFruit);
   if(previous==='eat'&&v.state==='departure')activeFruit=null;
   origin=position.slice();previous=v.state;
   if(v.state==='eat')activeFruit=director.fruit;
  }
  let x=276,y=155,fly=false,tilt=0,headAngle=3*Math.sin(director.time/1100),caption='Corujinha descansando no galho';
  show(snack,false);show(hat,ev.some(e=>e.birthday));show(owl,v.state!=='away');
  if(v.state==='arrival'||v.state==='departure'){
   const f=smooth(v.age/CONFIG.flight),target=v.state==='arrival'?[276,155]:[-30,75];
   x=origin[0]+(target[0]-origin[0])*f;y=origin[1]+(target[1]-origin[1])*f-32*Math.sin(Math.PI*f);fly=true;caption=v.state==='arrival'?'Coruja chegando ao pôr do sol':'Coruja saindo ao nascer do sol';
  }
  if(v.state==='eat'){
   const at=fruits[activeFruit]?.getAttribute('transform')?.match(/translate\(([-.\d]+) ([-.\d]+)/),fx=at?+at[1]:283,fy=at?+at[2]:69;
   if(p<.24){const f=smooth(p/.24);x=276+(fx-276)*f;y=155+(fy+20-155)*f;fly=true;}
   else if(p<.42){const f=smooth((p-.24)/.18);x=fx+(276-fx)*f;y=fy+20+(155-fy-20)*f;fly=true;}
   if(p>.24){show(snack,p<.93);move(snack,8,-10+(p>.42?Math.sin(t*5)*.7:0));bite.setAttribute('width',String(12-Math.max(0,Math.min(4,Math.floor((p-.42)/.12)))*2.7));if(p>.42)headAngle=3*Math.sin(t*5);}
   caption='Corujinha comendo uma goiaba madura';
  }
  if(motion.matches){x=276;y=155;fly=false;headAngle=0;}
  position=[x,y];move(owl,x,y);pose.setAttribute('transform','rotate('+tilt+')');head?.setAttribute('transform','rotate('+headAngle+' 0 -18)');
  const shut=director.time%6900<170;pupils?.setAttribute('opacity',shut?'0':'1');blink?.setAttribute('opacity',shut?'1':'0');show(wings,fly&&!motion.matches);wings?.setAttribute('transform','scale(1 '+(.7+.4*Math.sin(director.time/50))+')');owl.setAttribute('aria-label',caption);
  fruits.forEach((fruit,i)=>show(fruit,!eaten.has(i)&&!(v.state==='eat'&&p>.24&&i===activeFruit)));
  const event=schedule.update(now,night);show(sky,!!event&&!motion.matches);
  if(event&&!motion.matches){
   if(sky.dataset.kind!==event.kind){sky.dataset.kind=event.kind;sky.innerHTML=event.kind==='meteor'?'<path d="M-35-16L0 0" stroke="#d6e0d4"/><path d="M-18-8L0 0" stroke="#f4dfae" stroke-width="2"/><rect x="-1" y="-1" width="3" height="3" fill="#fff2c8"/>':'<path d="M-18 4H18m-30-2-10-3v8l10-2M-4 2l3-10 7 1 3 9M-2-10l5-11 5 11H-6M1-9v5h5v-5M3-2l9 7" fill="#303547" stroke="#303547" stroke-width="1.4"/>';}
   const f=event.fraction;if(event.kind==='meteor')move(sky,90+210*f,26+55*f);else move(sky,-25+450*f,64+5*Math.sin(f*Math.PI*2),'scale(.55)');sky.setAttribute('opacity',String(Math.min(1,f*10,(1-f)*10)));
  }
  const newYear=ev.some(e=>e.id==='ano-novo'),phase=(director.time%CONFIG.fireworksInterval)/1000;
  show(fireworks,newYear&&night&&phase<7&&!motion.matches);
  if(newYear&&night&&phase<7&&!motion.matches){
   Array.from(fireworks.children).forEach((burst,i)=>{const f=((phase+i*1.1)%3)/3;burst.setAttribute('opacity',String(1-f));burst.firstElementChild?.setAttribute('transform','scale('+(.2+.8*f)+')');});
  }
  save();
 }
 function tick(now){frame=0;if(document.hidden)return;const dt=last?Math.min(100,now-last):0;last=now;acc+=dt;if(acc>=(motion.matches?250:40)){draw(acc);acc=0;}frame=requestAnimationFrame(tick);}
 document.addEventListener('visibilitychange',()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=0;acc=0;if(!document.hidden)frame=requestAnimationFrame(tick);});
 // Optional demonstration remains separate from real weather and equipment.
 if(new URLSearchParams(location.search).get('owlDemo')==='1'){
  demo={now:Date.parse('2026-11-07T21:00:00-03:00'),night:true};
  const panel=document.createElement('details');panel.innerHTML='<summary>Demonstração simples da corujinha</summary>';panel.style.cssText='padding:10px;background:#fffbed;color:#264333';panel.open=true;
  const button=(name,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.style.cssText='margin:4px;padding:7px';b.onclick=()=>{fn();draw(0);};panel.append(b);};
  button('Pôr do sol',()=>{demo.night=true;director.night=false;});
  button('Nascer do sol',()=>demo.night=false);
  button('Goiaba',()=>{demo.night=true;director.night=true;director.fruit=ripe[0]??0;director.enter('eat');});
  button('Bruxinha e meteoro',()=>{demo.night=true;schedule.next=demo.now;schedule.start=null;});
  button('Chapéu e balões',()=>{demo.now=Date.parse('2026-11-06T21:00:00-03:00');demo.night=true;});
  button('Natal',()=>{demo.now=Date.parse('2026-12-25T21:00:00-03:00');demo.night=true;});
  button('Ano Novo',()=>{demo.now=Date.parse('2027-01-01T21:00:00-03:00');demo.night=true;director.time=0;});
  svg.closest('.mission-art').after(panel);
  window.CorujaDemo={director,schedule,set(options){Object.assign(demo,options);draw(0);},advance(ms){demo.now+=ms;draw(ms);}};
 }
 draw(0);frame=requestAnimationFrame(tick);
}
return{CONFIG,BIRTHDAYS,clock,easter,sunday,events,ripeness,Director,SkySchedule,mount};
});
