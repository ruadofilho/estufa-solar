/* Histórias originais; somente apresentação, sem comandos ou leituras inventadas. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else{root.CorujaHistorias=api;api.mount();}})(globalThis,function(){
'use strict';
const DAY=86400000,CONFIG={storyMin:120000,storyMax:300000,thoughtGap:480000,flight:2200,inspectionDelay:20000,skyMin:180000,skyMax:600000};
const DUR={idle:0,home:0,shelter:0,umbrella:0,nap:26000,dream:28000,thought:16000,frog:18000,skate:26000,fruit:24000,inspect:34000,icecream:22000,holiday:20000};
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
class Director{
 constructor(memory={},random=Math.random){this.random=random;this.memory={inspectionDay:typeof memory.inspectionDay==='string'?memory.inspectionDay:'',fruitDay:typeof memory.fruitDay==='string'?memory.fruitDay:'',fruitIndex:Number.isInteger(memory.fruitIndex)?memory.fruitIndex:-1,icecreamDay:typeof memory.icecreamDay==='string'?memory.icecreamDay:'',recent:Array.isArray(memory.recent)?memory.recent.filter(s=>Object.hasOwn(DUR,s)).slice(0,3):[],lastThought:Number.isInteger(memory.lastThought)&&memory.lastThought>=0&&memory.lastThought<5?memory.lastThought:-1};this.time=0;this.since=0;this.state='home';this.next=10000;this.thoughtAt=-Infinity;this.returnUntil=0;this.demo=false;this.nextSky=CONFIG.skyMin+random()*(CONFIG.skyMax-CONFIG.skyMin);this.sky=null;this.env={date:clock(),night:false,rain:false,storm:false,temp:null,events:[],ripe:[]};}
 enter(s){this.state=s;this.since=this.time;}
 wait(){this.next=this.time+CONFIG.storyMin+this.random()*(CONFIG.storyMax-CONFIG.storyMin);}
 start(s){if(s==='dream')this.thoughtAt=this.time;if(s==='thought'){this.thoughtAt=this.time;this.thought=(this.memory.lastThought+1+Math.floor(this.random()*4))%5;}if(s==='fruit')this.fruit=this.env.ripe[Math.floor(this.random()*this.env.ripe.length)]??0;this.enter(s);}
 step(dt,env){
  this.env={...this.env,...env};this.time+=dt;const e=this.env;
  if(this.sky&&this.time-this.sky.start>this.sky.duration)this.sky=null;
  if(e.night&&!e.storm&&!this.sky&&this.time>=this.nextSky){this.sky={kind:this.random()<.55?'meteor':'witch',start:this.time,duration:12000};this.nextSky=this.time+CONFIG.skyMin+this.random()*(CONFIG.skyMax-CONFIG.skyMin);}
  if(!e.night||e.storm)this.sky=null;
  if(e.storm){if(this.state!=='shelter')this.enter('shelter');return this.view();}
  if(e.rain){if(this.state!=='umbrella')this.enter('umbrella');return this.view();}
  if(['shelter','umbrella'].includes(this.state)){this.enter(e.night||e.events.length?'idle':'home');this.wait();}
  const duration=DUR[this.state];
  if(duration&&this.time-this.since>=duration){
   const done=this.state;
   if(done==='inspect'){this.memory.inspectionDay=e.date.key;this.returnUntil=this.time+20000;}
   if(done==='icecream')this.memory.icecreamDay=e.date.key;
   if(done==='fruit'){this.memory.fruitDay=e.date.key;this.memory.fruitIndex=this.fruit;}
   if(done==='thought')this.memory.lastThought=this.thought;
   this.memory.recent=[done,...this.memory.recent].slice(0,3);
   this.enter(done==='inspect'?'home':e.night||e.events.length?'idle':'home');this.wait();
  }
  if(!this.demo&&['home','idle','nap'].includes(this.state)&&this.time>=CONFIG.inspectionDelay&&this.memory.inspectionDay!==e.date.key){this.start('inspect');return this.view();}
  if(!e.night&&!e.events.length&&['idle','nap','dream'].includes(this.state))this.enter('home');
  if(this.state==='home'&&(e.night||e.events.length)&&this.time>this.returnUntil){this.enter('idle');this.wait();}
  if(e.events.some(x=>['drums','computer'].includes(x.special))&&['idle','home','nap'].includes(this.state)&&this.time>this.returnUntil)this.enter('holiday');
  if(this.state==='home'&&!e.night&&!e.events.length){if(e.temp!==null&&e.temp>35&&this.memory.icecreamDay!==e.date.key&&this.time>CONFIG.inspectionDelay+60000)this.start('icecream');return this.view();}
  if(this.state==='idle'&&this.time>=this.next){
   let options=['nap','nap','frog'];
   if(e.events.length)options.push('holiday');
   if(this.time-this.thoughtAt>=CONFIG.thoughtGap&&!['thought','dream'].includes(this.memory.recent[0]))options.push('thought','dream');
   if(e.night)options.push('skate');
   if(e.ripe.length&&this.memory.fruitDay!==e.date.key)options.push('fruit','fruit');
   if(e.temp!==null&&e.temp>35)options.push('icecream','icecream','icecream');
   options=options.filter(s=>!this.memory.recent.slice(0,2).includes(s));
   this.start(options.length?options[Math.floor(this.random()*options.length)]:'nap');
  }
  if(this.state==='icecream'&&(e.temp===null||e.temp<34)){this.enter('idle');this.wait();}
  return this.view();
 }
 view(){return{state:this.state,age:this.time-this.since,sky:this.sky};}
}
const ICONS=[
'<path d="M-15-5h30v5h-30zM-11 0v12m22-12v12" fill="#bd8955" stroke="#704c32" stroke-width="2"/>',
'<path d="M-15-14h30v27h-30z" fill="#704b38"/><path d="M-14 0h28v6h-28z" fill="#fff3d5"/><path d="M-10 0v4m5-4v4m5-4v4m5-4v4m5-4v4" stroke="#353333" stroke-width="2"/><path d="M-10-9h20" stroke="#d7ad69" stroke-width="2"/>',
'<path d="M-9 0v-16H9V0m-20 0h22v4h-22zM-8 4v10m16-10v10M-8-10H8" fill="#be8d5d" stroke="#765437" stroke-width="2"/>',
'<path d="M-12-15H12V9H-12Z" fill="#bb945c" stroke="#755632" stroke-width="2"/><path d="M-8-11H8V5H-8Z" fill="#b5d6d6"/><path d="M-6 2l9-10M-3 10v5m6-5v5m-11 0H8" stroke="#f3e5c5" stroke-width="2"/>',
'<path d="M-14-2V14H14V-2Z" fill="#b48554" stroke="#704b33"/><path d="M-18-2L0-18 18-2Z" fill="#93644c"/><path d="M-4 14V3H4V14" fill="#654b36"/><path d="M-11 1h4v4h-4m14-4h4v4H3" fill="#efd68a"/>'];
const HUMAN='<path d="M-22 13h44v3h-44z" fill="#bbac87"/><path d="M-18-5v18m-3-18h7m-3-2v-7" stroke="#6b8063" stroke-width="3"/><path d="M-2-9q0-7 6-7t5 7v3H-2Z" fill="#664f43"/><path d="M0-10h7v7H0Z" fill="#d8b797"/><path d="M0-3h7l4 12H-3Z" fill="#a77d80"/><path d="M1 9v5m5-5v5M-1-1l-6 5m14-5 6 4" stroke="#785e51" stroke-width="2"/>';
function mount(){
 const svg=document.querySelector('.mission-art svg'),owl=document.getElementById('scene-owl');if(!svg||!owl||svg.dataset.owlStories)return;svg.dataset.owlStories='true';
 const ns='http://www.w3.org/2000/svg',clockG=svg.querySelector('.scene-clock');
 function make(tag,a={},parent=svg){const e=document.createElementNS(ns,tag);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));parent.append(e);return e;}
 const group=(id,parent=svg)=>make('g',{id,'pointer-events':'none','aria-hidden':'true'},parent);
 const show=(g,on)=>g.style.display=on?'':'none';
 const move=(g,x,y,extra='')=>g.setAttribute('transform','translate('+x.toFixed(2)+' '+y.toFixed(2)+') '+extra);
 const back=group('owl-story-background');svg.insertBefore(back,svg.querySelector('#kiln-side'));
 const sky=group('owl-sky-event',back),cashew=group('owl-cashew-tree',back);
 cashew.innerHTML='<path d="M300 202v-57l-23-25m23 40 34-35m-34 20 2-43" fill="none" stroke="#856449" stroke-width="9"/><path d="M248 105h14V86h28V75h35v12h27v15h17v24h-16v15h-30v-8h-33v7h-35v-15h-15z" fill="#4e7b57"/><path d="M257 100h24V88h32v9h29v12h17v14h-33v-8h-30v11h-36z" fill="#799d62"/>';
 for(const [x,y] of [[265,113],[286,93],[315,109],[345,116],[299,127],[326,87],[279,129]]){const f=make('g',{transform:'translate('+x+' '+y+')'},cashew);f.innerHTML='<path d="M-3-5h6l2 8-5 4-5-4Z" fill="#edaa47"/><path d="M-3-4h3v7h-2" fill="#f8d16b"/><path d="M0 7q6 0 3 4q-5 3-4-2" fill="#a8956c"/>';}
 const world=group('owl-story-world');svg.insertBefore(world,owl);
 const house=group('owl-wooden-house',world);
 house.innerHTML='<path d="M315 185h34v3h-34z" fill="#77563e"/><path d="M317 154h30v30h-30z" fill="#ae7e52" stroke="#614c39" stroke-width="1.3"/><path d="M314 154l18-16 18 16z" fill="#785742" stroke="#594334" stroke-width="1.5"/><path d="M320 153l12-10 12 10M320 160h24m-24 6h24m-24 6h24m-24 6h24" fill="none" stroke="#d0a475"/><path d="M325 162h14v20h-14z" fill="#423c31"/><path d="M303 176h14m-14 10 14-10M346 176h9m-1-2v9" stroke="#785742" stroke-width="2"/>';
 const hollow=group('owl-tree-hollow',world);hollow.innerHTML='<path d="M294 169v-14q7-12 14 0v14z" fill="#423b30" stroke="#886846" stroke-width="2"/>';
 const shelterEyes=group('owl-shelter-eyes',world);shelterEyes.innerHTML='<path d="M297 157h3v3h-3m6-3h3v3h-3" fill="#ffe49b"/><path d="M298 157h1v3h-1m6-3h1v3h-1" fill="#242d2c"/>';
 const dayEyes=group('owl-house-eyes',world);dayEyes.innerHTML='<path d="M328 170h3v2h-3m5-2h3v2h-3" fill="#f7dfac"/>';
 const decor=group('owl-calendar-decoration',world),stage=group('owl-calendar-stage',world),banner=group('owl-calendar-banner',world),props=group('owl-story-props',world);
 const plank=group('owl-inspection-plank',props);plank.innerHTML='<path d="M-14-3h28v6h-28Z" fill="#d9a268" stroke="#775037"/><path d="M-10 0h14m3 0h3" stroke="#af7948"/>';
 const meter=group('owl-moisture-meter',props);meter.innerHTML='<path d="M-3-6v-4m6 4v-4" stroke="#c8d3d0"/><path d="M-5-6H5V5H-5Z" fill="#576b63" stroke="#2e453c"/><path d="M-3-4H3V0H-3Z" fill="#cde49b"/>';
 const rearDoor=group('owl-fictional-rear-door',props);rearDoor.innerHTML='<path d="M187 156h15v39h-15Z" fill="#6f9580" stroke="#344d3d"/><path d="M190 158l12-6v39l-12 4Z" fill="#aed4b3" stroke="#486a50"/>';
 const pose=make('g',{},owl);while(owl.firstChild!==pose)pose.append(owl.firstChild);
 const head=pose.querySelector('.owl-head'),pupils=pose.querySelector('.owl-pupils'),blink=pose.querySelector('.owl-blink'),wings=pose.lastElementChild;
 const garment=group('owl-accessories',pose),umbrella=group('owl-rainbow-umbrella',owl);
 umbrella.innerHTML='<path d="M8-30V-2q0 5-4 3" fill="none" stroke="#e5ca92" stroke-width="1.5"/><path d="M-16-30Q8-57 32-30Z" fill="#db7c83" stroke="#5d5c63"/><path d="M-16-30Q-10-44-4-43L0-30Z" fill="#e99353"/><path d="M-4-43Q1-49 8-46V-30H0Z" fill="#f1ce6b"/><path d="M8-46Q15-47 20-41L16-30H8Z" fill="#8ab77c"/><path d="M20-41Q26-39 32-30H24L16-30Z" fill="#7cb6cf"/><path d="M24-30l-4-11q8 4 12 11Z" fill="#a28bc3"/><path d="M-16-30q4-3 8 0q4-3 8 0q4-3 8 0q4-3 8 0q4-3 8 0q4-3 8 0" fill="none" stroke="#6c6370" stroke-width=".8"/>';
 const snack=group('owl-guava-snack',owl),defs=make('defs'),clip=make('clipPath',{id:'owl-guava-bite-clip'},defs),bite=make('rect',{x:-6,y:-7,width:12,height:14},clip),fruitBody=make('g',{'clip-path':'url(#owl-guava-bite-clip)'},snack);
 fruitBody.innerHTML='<path d="M-4-6H4L6-2V4L2 7H-3L-6 2V-3Z" fill="#e2c75e" stroke="#927e3e"/><path d="M-2-4H3L4 3L0 5-3 2Z" fill="#edaa9b"/><path d="M0-2h1v1H0m-2 2h1v1h-1m3 0h1v1H1" fill="#986957"/>';
 const bubble=group('owl-thought-bubble');svg.insertBefore(bubble,clockG);
 bubble.innerHTML='<circle cx="-27" cy="25" r="2" fill="#fff6db"/><circle cx="-23" cy="20" r="3" fill="#fff6db"/><path d="M-27 8q-12-8-3-15q-2-12 11-12q7-10 18-4q12-6 19 4q13-1 12 12q10 10-3 16q-4 9-15 5q-10 6-20 0q-13 5-19-6Z" fill="#fff7e3" stroke="#a19e83"/>';
 const bubbleIcon=make('g',{transform:'translate(0 -2)'},bubble);
 let memory={};try{memory=JSON.parse(localStorage.getItem('estufa-coruja-v2')||'{}')||{};}catch{}
 const director=new Director(memory),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let telemetry=window.FabricaSceneTelemetry,demo=null,last=0,frame=0,acc=0,lastDecor='',lastDate='',lastSave='',previous='',from=[332,179],position=[332,179],thoughtKey='',ripe=[];
 window.addEventListener('scene-telemetry',e=>{telemetry=e.detail;});
 function text(value,x,y,parent,size=5,fill='#f9edcf'){const t=make('text',{x,y,'text-anchor':'middle','font-family':'Courier New,monospace','font-size':size,'font-weight':'bold',fill},parent);t.textContent=value;return t;}
 function decorations(d,ev){
  const key=d.key+':'+ev.map(e=>e.id).join(',');if(key===lastDecor)return;lastDecor=key;
  decor.replaceChildren();stage.replaceChildren();banner.replaceChildren();
  const special=ev.find(e=>e.special),main=ev[0];show(cashew,special?.special==='cashew');if(!main)return;
  make('path',{d:'M42 33h222v15H42l-6-7Z',fill:main.id==='madelaine'?'#d69ca7':'#c4d5ae',stroke:'#637963'},banner);
  text(main.label,153,43,banner,main.label.length>35?4:5,'#304b38');
  if(main.birthday){
   const cake=make('g',{transform:'translate(267 153)'},decor);cake.innerHTML='<path d="M-9-4H9V3H-9Z" fill="#d8978e"/><path d="M-10-6H10V-3H-10Z" fill="#ffedc8"/><path d="M-5-6v-5m5 5v-5m5 5v-5" stroke="#dfb260"/><path d="M-5-13h1v2h-1m5-2h1v2H0m5-2h1v2H5" fill="#fff2a3"/>';
   if(main.id==='coruja')text(Math.max(0,d.year-2026)+' ano'+(d.year-2026===1?'':'s'),267,163,decor,4);
   for(const [x,y,color] of [[244,90,'#d99ca4'],[265,82,'#d9bf6e'],[283,92,'#94bdba']]){make('path',{d:'M'+x+' '+y+'v23',stroke:'#d6cfb6','stroke-width':.6},decor);make('ellipse',{cx:x,cy:y,rx:4,ry:6,fill:color},decor);}
  }
  if(special?.special==='flowers'||ev.some(e=>['maes','mortos'].includes(e.id)))for(let i=0;i<25;i++){const x=14+(i*43)%374,y=199+(i%3)*4;make('path',{d:'M'+x+' '+y+'v-7',stroke:'#5e8054'},decor);make('path',{d:'M-1-4h2v2h2v2H1v2h-2V0h-2v-2h2Z',transform:'translate('+x+' '+(y-6)+')',fill:['#e9afbb','#e5cc77','#c4afd0'][i%3]},decor);}
  if(special?.special==='cashew'){
   const granny=make('g',{transform:'translate(277 146)'},stage);
   granny.innerHTML='<path d="M-4-19q-5-11 3-13q9-3 11 7v6Z" fill="#d6d3c3"/><path d="M-2-25h8v8h-8Z" fill="#dcb99b"/><path d="M-3-17h10l4 17H-7Z" fill="#af94ad"/><path d="M-5-14l-7 9m17-8 9 5M-3 0v7m8-7v7" stroke="#876f60" stroke-width="2"/><path d="M-1-22h2m3 0h2" stroke="#62564d"/><path d="M0-19h4" stroke="#ae7c6b"/><path d="M-8 2h22" stroke="#927353" stroke-width="2"/>';
  }
  if(special?.special==='davi'){
   const boy=make('g',{id:'owl-davi',transform:'translate(48 203)'},stage);
   boy.innerHTML='<path d="M-5-25v-5h10v5" fill="#66513d"/><path d="M-4-26H4v9H-4Z" fill="#e7bc91"/><path d="M-3-24h1m3 0h1M-2-20q2 2 4 0" fill="none" stroke="#6b5041"/><path d="M-5-17H5l3 10H-8Z" fill="#9cbdb1"/><path d="M-5-15l-5 6m15-6 6 5" stroke="#dfb48d" stroke-width="2"/><path d="M-6-7H6V-2H-6Z" fill="#6e8a9e"/><path d="M-4-2v5" stroke="#e3b895" stroke-width="3"/><path id="owl-davi-leg" d="M3-2l5 5" stroke="#e3b895" stroke-width="3"/>';
   const ball=make('g',{id:'owl-davi-ball'},stage);ball.innerHTML='<circle r="4" fill="#eee8cc" stroke="#6c7b70"/><path d="M-2-2h3l1 3-3 1z" fill="#6d8075"/>';
  }
  if(special?.special==='computer'){
   stage.innerHTML='<path d="M346 190h42v4h-42m3 0v12m36-12v12" fill="#997249" stroke="#694f38"/><path d="M345 168h46v21h-46z" fill="#586f68" stroke="#324e44"/><path d="M348 171h40v15h-40z" fill="#d0e0b2"/>';
   text('Feliz aniversário',368,177,stage,3.4,'#304c3b');text('Nera',368,183,stage,4,'#304c3b');
  }
  if(special?.special==='drums')stage.innerHTML='<path d="M343 202v-11m-6 3h13m19 8v-13m-6 2h13M357 188v17" stroke="#b4b8aa" stroke-width="1.5"/><path d="M338 187h12v8h-12m17-11h12v9h-12" fill="#b57560" stroke="#e4c298"/><circle cx="356" cy="199" r="9" fill="#b37860" stroke="#dfc7a3" stroke-width="2"/><circle cx="356" cy="199" r="6" fill="#e1d5b8"/><path d="M330 181h18m22 1h18" stroke="#d2b96b" stroke-width="2"/><path d="M339 182v21m40-20v20" stroke="#a5b6ab"/>';
  for(const evnt of ev){
   if(evnt.id==='natal')make('g',{transform:'translate(224 199)'},decor).innerHTML='<path d="M-2-4h4v8h-4" fill="#926b49"/><path d="M0-35l-12 15h6l-10 13h32L6-20h6Z" fill="#477860"/><path d="M-7-12h3m5-13h3m2 14h3" stroke="#d2a266" stroke-width="2"/><path d="M-1-40h2v5h-2m-2-3h6" fill="#f2d885"/>';
   if(evnt.id==='pascoa')make('g',{},decor).innerHTML='<path d="M226 201v-7m12 7v-7" stroke="#b79268"/><ellipse cx="232" cy="196" rx="9" ry="6" fill="#c6a278"/><path d="M226 194h4v-5h-4m7 5h4v-6h-4" fill="#d4a6ba"/>';
   if(evnt.id==='ano-novo')for(let i=0;i<3;i++)make('path',{d:'M-8 0H8M0-8V8M-5-5L5 5M5-5L-5 5',transform:'translate('+(75+i*76)+' '+(64+i%2*15)+')',stroke:['#e5c67c','#d4a6be','#a4c9c0'][i],'stroke-width':.8},decor);
   if(evnt.id==='carmo')make('g',{},decor).innerHTML='<path d="M230 192h12v10h-12z" fill="#ad8966"/><path d="M236 195v5m-2-3h4" stroke="#e9d6a9"/>';
  }
 }
 function environment(){
  const d=clock(demo?.now??Date.now()),ev=events(d);
  if(lastDate!==d.key){
   lastDate=d.key;ripe=[];
   svg.querySelectorAll('.guava-fruit').forEach((fruit,i)=>{const r=ripeness(d.serial,i),mix=(a,b)=>Math.round(a+(b-a)*r);if(r>=.8)ripe.push(i);fruit.querySelector('path')?.setAttribute('fill','rgb('+[mix(116,230),mix(158,204),mix(74,94)].join(',')+')');});
  }
  decorations(d,ev);
  const night=demo?demo.night:svg.dataset.day?svg.dataset.day==='false':d.hour<6||d.hour>=18;
  return{date:d,events:ev,night,rain:demo?['rain','storm'].includes(demo.weather):svg.dataset.weather==='rain',storm:demo?demo.weather==='storm':svg.dataset.storm==='true',temp:demo?demo.temp:telemetry?.status==='online'&&telemetry.externalValid&&Number.isFinite(telemetry.externalT)?telemetry.externalT:null,ripe:ev.some(e=>e.special==='cashew')?[]:ripe};
 }
 function draw(dt){
  const e=environment(),v=director.step(dt,e),t=v.age/1000,p=Math.min(1,v.age/(DUR[v.state]||1));
  if(previous!==v.state){from=position.slice();previous=v.state;}
  const target=v.state==='home'?[332,179]:v.state==='shelter'?[301,164]:[276,155];
  let x=target[0],y=target[1],fly=false,headAngle=0,tilt=0,closed=false,eyeX=0,custom=false,caption='Corujinha observando o jardim';
  [umbrella,snack,bubble,plank,meter,rearDoor,shelterEyes,dayEyes].forEach(g=>show(g,false));garment.replaceChildren();
  if(e.date.month===7||e.night&&e.temp!==null&&e.temp<10)garment.innerHTML='<path d="M-12-12H12V-2H-12Z" fill="#739393"/><path d="M-10-9h20m-20 4h20" stroke="#d5d5b1"/><path d="M-12-12l-4 5m28-5 4 5" stroke="#739393" stroke-width="4"/>';
  if(v.state==='home'){show(dayEyes,true);closed=true;caption='Corujinha descansando na casinha';}
  if(v.state==='shelter'){show(shelterEyes,true);shelterEyes.setAttribute('opacity',director.time%6100<200?'0':'1');caption='Corujinha protegida da tempestade dentro da árvore';}
  if(v.state==='umbrella'){
   show(umbrella,true);const f=motion.matches?1:smooth(v.age/1300);umbrella.setAttribute('transform','translate(0 '+(5*(1-f))+') scale('+(.25+.75*f)+' 1)');headAngle=7*Math.sin(t*.5);closed=t%30>22;caption='Corujinha esperando a chuva passar com guarda-chuva arco-íris';
  }
  if(['nap','dream'].includes(v.state)){closed=true;headAngle=4;tilt=2*Math.sin(t*.6);caption=v.state==='dream'?'Sonho da corujinha: uma vida passada humana':'Corujinha cochilando';}
  if(['thought','dream'].includes(v.state)){
   const key=v.state==='dream'?'human':String(director.thought??0);
   if(thoughtKey!==key){bubbleIcon.innerHTML=key==='human'?HUMAN:ICONS[Number(key)];thoughtKey=key;}
   show(bubble,true);move(bubble,225,98);bubble.setAttribute('opacity',motion.matches?'1':String(Math.min(1,p*8,(1-p)*8)));
   if(v.state==='thought'){headAngle=-15;caption='Corujinha olhando a estufa e imaginando um móvel';}
  }
  if(v.state==='frog'){
   const match=svg.querySelector('#scene-frog')?.getAttribute('transform')?.match(/translate\(([-.\d]+)/),fx=match?+match[1]:200+80*Math.sin(t*.5);
   headAngle=Math.max(-18,Math.min(18,(fx-276)/6));eyeX=fx<276?-1:1;caption='Corujinha acompanhando o sapinho';
  }
  if(v.state==='skate'){
   custom=true;const enter=smooth(p/.16),exit=smooth((p-.84)/.16);
   x=p<.16?276-36*enter:p>.84?240+36*exit:240+120*Math.sin((p-.16)/.68*Math.PI*2);
   y=p<.16?155+46*enter:p>.84?201-46*exit:201;fly=p<.16||p>.84;tilt=fly?0:5*Math.sin(t*.7);
   make('g',{},garment).innerHTML='<path d="M-10 2h7v3h-7m13-3h7v3H3" fill="#b57a81"/><path d="M-10 6h2m3 0h2m6 0h2m3 0h2" stroke="#e7d9ab" stroke-width="2"/>';caption='Corujinha de patins no chão seco';
  }
  if(v.state==='icecream'){make('g',{},garment).innerHTML='<path d="M10-3l4 9 4-9Z" fill="#c69b64"/><path d="M9-3v-4l3-3h4l3 3v4Z" fill="#efc1b7"/>';headAngle=8*Math.sin(t*1.7);caption='Corujinha tomando sorvete no calor';}
  if(v.state==='fruit'){
   const fruit=svg.querySelectorAll('.guava-fruit')[director.fruit??0],at=fruit?.getAttribute('transform')?.match(/translate\(([-.\d]+) ([-.\d]+)/),fx=at?+at[1]:283,fy=at?+at[2]:69;
   if(p<.24){custom=true;const f=smooth(p/.24);x=276+(fx-276)*f;y=155+(fy+20-155)*f;fly=true;}
   else if(p<.42){custom=true;const f=smooth((p-.24)/.18);x=fx+(276-fx)*f;y=fy+20+(155-fy-20)*f;fly=true;}
   if(p>.24){show(snack,p<.92);move(snack,8,-10+(p>.42?Math.sin(t*5)*.8:0));bite.setAttribute('width',String(12-Math.max(0,Math.min(4,Math.floor((p-.42)/.12)))*2.7));if(p>.42)headAngle=3*Math.sin(t*5);}
   caption='Corujinha comendo uma goiaba madura, mordida por mordida';
  }
  if(v.state==='inspect'){
   custom=true;const points=[[0,332,179],[.16,198,183],[.25,198,183],[.38,231,196],[.63,231,196],[.76,198,183],[.84,198,183],[1,332,179]];
   let j=0;while(j<points.length-2&&p>points[j+1][0])j++;const a=points[j],b=points[j+1],f=smooth((p-a[0])/(b[0]-a[0]));
   x=a[1]+(b[1]-a[1])*f;y=a[2]+(b[2]-a[2])*f-12*Math.sin(Math.PI*f);fly=Math.abs(b[1]-a[1])>40;
   show(rearDoor,p>.16&&p<.84);show(plank,p>.25&&p<.76);move(plank,x+14,y-3);show(meter,p>.4&&p<.63);move(meter,244,183);
   if(p>.4&&p<.63){headAngle=15;tilt=2*Math.sin(t*4);}caption='Encenação: medir uma tábua, devolver e fechar a estufa';
  }
  const special=e.events.find(ev=>['drums','computer'].includes(ev.special));
  if(v.state==='holiday'){
   caption='Corujinha comemorando '+(e.events[0]?.label||'');
   if(special?.special==='drums'){custom=true;x=356;y=189;tilt=2*Math.sin(t*5);const g=make('g',{transform:'rotate('+(motion.matches?0:8*Math.sin(t*13))+')'},garment);g.innerHTML='<path d="M-11-10l-10-7m32 7 10-7" stroke="#dfbd8a" stroke-width="1.5"/>';caption='Corujinha tocando bateria para Cavernosa';}
   if(special?.special==='computer'){custom=true;x=337;y=190;headAngle=15;tilt=Math.sin(t*3);make('g',{},garment).innerHTML='<path d="M8-5h12m-10 3h12" stroke="#e0c198" stroke-width="2"/>';caption='Corujinha no computador: Feliz aniversário, Nera';}
  }
  if(e.events.length&&!['home','shelter'].includes(v.state)){
   if(e.events[0].birthday)make('g',{},garment).innerHTML='<path d="M-6-25L1-39 8-25Z" fill="#d5ac70" stroke="#ae7b62"/><path d="M-3-31h6M0-36h2" stroke="#9fb9b1"/>';
   if(e.events.some(ev=>ev.id==='natal'))make('g',{},garment).innerHTML='<path d="M-9-25l12-16 9 15Z" fill="#b77b70"/><path d="M-10-25h23" stroke="#eee2bf" stroke-width="3"/>';
   if(e.events.some(ev=>ev.id==='carnaval'))make('g',{},garment).innerHTML='<path d="M-9-21h18v5H-9Z" fill="#7fa9a8"/><path d="M-5-20h2v2h-2m8-2h2v2H3" fill="#354b49"/><path d="M-9-22l-5-8m5 6-1-9m19 11 5-8" stroke="#caa678" stroke-width="2"/>';
  }
  if(!custom){const f=motion.matches?1:smooth(v.age/CONFIG.flight);x=from[0]+(target[0]-from[0])*f;y=from[1]+(target[1]-from[1])*f;fly=f<1&&Math.hypot(target[0]-from[0],target[1]-from[1])>8;if(fly)y-=14*Math.sin(Math.PI*f);}
  if(motion.matches){x=target[0];y=target[1];fly=false;tilt=0;headAngle=0;}
  position=[x,y];move(owl,x,y);pose.setAttribute('transform','rotate('+tilt+')');head?.setAttribute('transform','rotate('+headAngle+' 0 -18)');pupils?.setAttribute('transform','translate('+eyeX+' 0)');
  const shut=closed||director.time%6800<170;pupils?.setAttribute('opacity',shut?'0':'1');blink?.setAttribute('opacity',shut?'1':'0');show(wings,fly&&!motion.matches);wings?.setAttribute('transform','scale(1 '+(.7+.4*Math.sin(director.time/50))+')');
  show(owl,!(['home','shelter'].includes(v.state)&&v.age>CONFIG.flight));if(v.state==='home')dayEyes.setAttribute('opacity',director.time%9000<250?'0':'.7');owl.setAttribute('aria-label',caption);
  if(e.events.some(ev=>ev.special==='davi')){stage.querySelector('#owl-davi-leg')?.setAttribute('transform','rotate('+(motion.matches?0:25*Math.sin(director.time/600))+' 3 -2)');const ball=stage.querySelector('#owl-davi-ball');if(ball)move(ball,69+(motion.matches?0:14*(.5+.5*Math.sin(director.time/900))),201-(motion.matches?0:4*Math.abs(Math.sin(director.time/450))));}
  show(sky,!!v.sky&&!motion.matches);
  if(v.sky&&!motion.matches){
   const f=(director.time-v.sky.start)/v.sky.duration;if(sky.dataset.kind!==v.sky.kind){sky.dataset.kind=v.sky.kind;sky.innerHTML=v.sky.kind==='meteor'?'<path d="M-35-16L0 0" stroke="#d6e0d4"/><path d="M-18-8L0 0" stroke="#f4dfae" stroke-width="2"/><rect x="-1" y="-1" width="3" height="3" fill="#fff2c8"/>':'<path d="M-18 4H18m-30-2-10-3v8l10-2M-4 2l3-10 7 1 3 9M-2-10l5-11 5 11H-6M1-9v5h5v-5M3-2l9 7" fill="#303547" stroke="#303547" stroke-width="1.4"/>';}
   if(v.sky.kind==='meteor')move(sky,90+210*f,26+55*f);else move(sky,-25+450*f,64+5*Math.sin(f*Math.PI*2),'scale(.55)');sky.setAttribute('opacity',String(Math.min(1,f*10,(1-f)*10)));
  }
  const isCaju=e.events.some(ev=>ev.special==='cashew');svg.querySelector('.guava-tree')?.setAttribute('visibility',isCaju?'hidden':'visible');
  svg.querySelectorAll('.guava-fruit').forEach((fruit,i)=>show(fruit,!isCaju&&!(director.memory.fruitDay===e.date.key&&director.memory.fruitIndex===i)&&!(v.state==='fruit'&&p>.24&&i===director.fruit)));
  if(!demo){const value=JSON.stringify(director.memory);if(value!==lastSave){try{localStorage.setItem('estufa-coruja-v2',value);lastSave=value;}catch{}}}
 }
 function tick(now){frame=0;if(document.hidden)return;const dt=last?Math.min(100,now-last):0;last=now;acc+=dt;if(acc>=(motion.matches?250:40)){draw(acc);acc=0;}frame=requestAnimationFrame(tick);}
 document.addEventListener('visibilitychange',()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=0;acc=0;if(!document.hidden)frame=requestAnimationFrame(tick);});
 if(new URLSearchParams(location.search).get('owlDemo')==='1'){
  demo={now:Date.parse('2026-11-07T21:00:00-03:00'),night:true,weather:'clear',temp:24};director.demo=true;director.enter('idle');director.wait();
  const panel=document.createElement('details');panel.open=true;panel.className='owl-demo';panel.style.cssText='padding:12px;background:#fffbed;color:#264333;border:2px solid #83987b;margin:12px 0';panel.innerHTML='<summary>Demonstração da corujinha · sem alterar sensores</summary>';
  const row=document.createElement('div');row.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin:10px 0';panel.append(row);
  const button=(name,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.style.cssText='font:12px Courier New;padding:7px';b.onclick=()=>{fn();lastDate='';lastDecor='';draw(0);};row.append(b);};
  const dateInput=document.createElement('input');dateInput.type='date';dateInput.value='2026-11-07';dateInput.setAttribute('aria-label','Data de demonstração');dateInput.onchange=()=>{if(dateInput.value){demo.now=Date.parse(dateInput.value+'T21:00:00-03:00');lastDate='';lastDecor='';draw(0);}};row.append(dateInput);
  button('Noite',()=>{demo.night=true;director.enter('idle');director.wait();});button('Dia',()=>{demo.night=false;director.enter('home');});button('Chuva',()=>demo.weather='rain');button('Tempestade',()=>demo.weather='storm');button('Céu limpo',()=>demo.weather='clear');button('Calor 36 °C',()=>{demo.temp=36;director.start('icecream');});button('Frio 8 °C',()=>demo.temp=8);
  for(const [id,name]of[['thought','Imaginar móvel'],['dream','Sonho humano'],['frog','Olhar sapinho'],['skate','Patins'],['fruit','Comer goiaba'],['inspect','Medir madeira'],['nap','Cochilar'],['holiday','Comemorar']])button(name,()=>{demo.weather='clear';demo.night=true;director.env.ripe=ripe;director.start(id);});
  button('Meteoro',()=>{demo.night=true;director.sky={kind:'meteor',start:director.time,duration:12000};});button('Bruxinha',()=>{demo.night=true;director.sky={kind:'witch',start:director.time,duration:14000};});
  svg.closest('.mission-art').after(panel);
  window.CorujaDemo={director,set(options){Object.assign(demo,options);lastDate='';lastDecor='';draw(0);},play(id){director.start(id);draw(0);},advance(ms){draw(ms);},state:()=>({mode:director.state,events:director.env.events,date:director.env.date})};
 }
 draw(0);frame=requestAnimationFrame(tick);
}
return{CONFIG,DUR,BIRTHDAYS,clock,easter,sunday,events,ripeness,Director,mount};
});
