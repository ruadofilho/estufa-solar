(()=>{
'use strict';
const svg=document.querySelector('.mission-art svg'), wind=document.getElementById('kiln-wind');
if(!svg||!wind)return;
const ns='http://www.w3.org/2000/svg';
function node(tag,attrs={},parent){const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(parent)parent.append(e);return e;}
const sky=node('g',{'aria-hidden':'true'});
sky.innerHTML='<defs><linearGradient id="garden-sky" x2="0" y2="1"><stop class="sky-top" stop-color="#263157"/><stop class="sky-bottom" offset="1" stop-color="#55587d"/></linearGradient><filter id="firefly-glow"><feGaussianBlur stdDeviation="2"/></filter></defs><rect width="400" height="220" fill="url(#garden-sky)"/><path class="sky-moon" fill="#e4cc99" d="M55 24h10v3h-6v4h-4v9h4v4h6v3H55v-3h-6v-4h-3v-9h3v-4h6z"/><path class="sky-stars" fill="#e5d3a9" d="M25 61h2v2h-2zm95-35h2v2h-2zm42 31h2v2h-2zm53-36h2v2h-2zm63 30h2v2h-2zm38 24h2v2h-2zm63-25h2v2h-2z"/><path class="sky-sun" fill="#ffe39b" d="M48 29h15v4h5v15h-5v4H48v-4h-5V33h5z"/><path fill="#464f72" d="M0 187h29v-12h22v-9h39v10h28v44H0zm187 0h32v-12h31v-10h29v7h30v-13h32v8h30v11h29v42H187z"/><path fill="#456c64" d="M0 201h400v19H0z"/><path fill="#628675" d="M0 201h400v4H0z"/>';
svg.prepend(sky);
const clouds=node("g",{class:"sky-clouds"},sky);
const cloudShape="M0 25v-8h12v-7h15V4h24v5h17v7h17v9z";
for(const [x,y,scale] of [[5,25,1],[135,37,1.25],[280,18,1.1],[375,45,1.15],[520,25,1],[650,37,1.25],[795,18,1.1],[890,45,1.15]]){
 const group=node("g",{transform:"translate("+x+" "+y+") scale("+scale+")"},clouds);
 node("path",{d:cloudShape},group);
 node("path",{d:"M0 23h85v2H0z",class:"cloud-shadow"},group);
}
const precipitation=node("g",{class:"sky-precipitation"},sky);
const rainDrops=[];
for(let i=0;i<78;i++){
 const x=(i*53)%400,y=(i*31)%220;
 const seed=Math.sin((i+1)*127.1)*43758.5453;
 const verticalSeed=Math.sin((i+1)*311.7)*96453.9127;
 rainDrops.push({
  drop:node("path",{d:"M0 0l-4 12",class:"rain-drop"},precipitation),
  x:(seed-Math.floor(seed))*420,
  y:(verticalSeed-Math.floor(verticalSeed))*245
 });
 node("rect",{x,y,width:2,height:2,class:"snow-flake"},precipitation);
}
const fog=node("path",{class:"sky-fog",d:"M0 91h125m43 0h180m-90 17h142M0 124h186m40 0h174"},sky);
const clock=svg.querySelector('.scene-clock');
const garden=node('g',{'aria-hidden':'true'});
svg.insertBefore(garden,clock);
const puddles=node('g',{id:'garden-puddles','aria-hidden':'true'});
svg.insertBefore(puddles,clock);
for(const [x,y,width] of [[47,211,30],[232,210,31],[341,214,37]]){
 node('path',{d:'M'+x+' '+y+'h'+width+'v2h4v2h-4v2h-'+width+'v-2h-4v-2h4z',fill:'#80b8bf',stroke:'#547f93','stroke-width':1},puddles);
 node('path',{d:'M'+(x+4)+' '+(y+2)+'h'+(width-8),stroke:'#d5ebdf','stroke-width':1},puddles);
}
const frog=node('g',{id:'scene-frog',role:'img','aria-label':'Sapinho descansando na chuva'});
frog.innerHTML=
 '<path fill="#416947" d="M-10-3h20v5h4v3H5V3H-5v2h-9V2h4z"/>'+
 '<path fill="#83ae5b" d="M-8-9h5v-3h5v3h6v-3h5v7h3v5H-9V-5h1z"/>'+
 '<path fill="#d4df91" d="M-5-2H5v4H-5z"/>'+
 '<path fill="#fff4ce" d="M-6-9h4v4h-4zm10 0h4v4H4z"/>'+
 '<path fill="#263e35" d="M-4-8h2v2h-2zm8 0h2v2H4zM-3-3h6v1h-6z"/>'+
 '<path class="frog-feet" fill="#699149" d="M-12 2h8v3h-8zm16 0h8v3H4z"/>';
svg.insertBefore(frog,clock);
const wren=node('g',{id:'scene-wren',role:'img','aria-label':'Corruíra passeando pelos galhos'});
wren.innerHTML=
 '<path fill="#664734" d="M-7-8l-7-9v-4l5 3 7 9z"/>'+
 '<path fill="#a77a50" d="M-7-10h12v-5h7v3h3v8h-4v4H-4v-3h-4z"/>'+
 '<path fill="#ddbd86" d="M-4-5h12v5H-2z"/>'+
 '<path fill="#775338" d="M-7-8H3v4H-5z"/>'+
 '<path fill="#f2ddb1" d="M6-12h6v1H6z"/>'+
 '<path fill="#26362d" d="M10-11h2v2h-2z"/>'+
 '<path fill="#c8a46c" d="M15-10h4l-4 3z"/>'+
 '<path stroke="#70513c" stroke-width="1.5" d="M-1 0v3m5-3v3"/>';
svg.insertBefore(wren,clock);
// Rain falls in front of the garden and equipment, behind the clock.
svg.insertBefore(precipitation,clock);
const splash=node('g',{'aria-hidden':'true'});
svg.insertBefore(splash,frog);
const spray=Array.from({length:12},()=>node('rect',{width:2,height:2,fill:'#d5f5ff'},splash));
let rainStarted=null,rainStopped=null,previousRain=false;
function drawRainVisitors(now){
 const raining=svg.dataset.weather==='rain';
 if(raining&&!previousRain){rainStarted=now;rainStopped=null;}
 if(!raining&&previousRain)rainStopped=now;
 previousRain=raining;
 const rainAge=rainStarted===null?0:Math.max(0,now-rainStarted);
 const water=raining?Math.min(1,rainAge/30000):rainStopped===null?0:Math.max(0,1-(now-rainStopped)/120000);
 puddles.style.display=water>0?'':'none';
 puddles.setAttribute('opacity',water.toFixed(2));
 frog.style.display=raining?'':'none';
 if(!raining)splash.style.display='none';
 if(raining){
  const stops=[[247,206,2400],[300,204,900],[359,210,2200],[300,204,800],[247,206,1800],[190,205,700],[130,205,900],[62,207,2300],[120,205,800],[185,205,700]];
  const hopMs=720;
  const cycleMs=stops.reduce((sum,stop)=>sum+stop[2]+hopMs,0);
  let phase=rainAge%cycleMs,leg=0;
  while(phase>=stops[leg][2]+hopMs){phase-=stops[leg][2]+hopMs;leg++;}
  const from=stops[leg],to=stops[(leg+1)%stops.length];
  const hopping=phase>=from[2];
  const fraction=hopping?(phase-from[2])/hopMs:0;
  const arc=Math.sin(Math.PI*fraction);
  const direction=to[0]>=from[0]?1:-1;
  const x=from[0]+(to[0]-from[0])*fraction;
  const y=from[1]+(to[1]-from[1])*fraction-26*arc;
  const landed=stops[leg];
  const inPuddle=[62,247,359].includes(landed[0]);
  const splashAge=phase/650;
  splash.style.display=inPuddle&&splashAge<1?'':'none';
  spray.forEach((drop,i)=>{
   const angle=Math.PI*(.08+.84*i/11);
   const dx=Math.cos(angle)*38*splashAge;
   const dy=-Math.sin(angle)*30*splashAge+25*splashAge*splashAge;
   drop.setAttribute('x',landed[0]+dx);
   drop.setAttribute('y',landed[1]+3+dy);
   drop.setAttribute('opacity',1-splashAge);
  });
  frog.setAttribute('transform','translate('+x+' '+y+') scale('+direction*(1+.12*arc)+' '+(1-.1*arc)+')');
  frog.setAttribute('aria-label',hopping?'Sapinho pulando pelo jardim e pelas poças':'Sapinho descansando entre os pulos');
 }
 const wrenVisit=svg.dataset.day==='true'&&!raining&&now%240000<30000;
 wren.style.display=wrenVisit?'':'none';
 if(wrenVisit){
  const perches=[[328,138],[312,112],[276,155]];
  const age=now%240000;
  const leg=Math.floor(age/10000);
  const phase=age%10000;
  const from=perches[leg%perches.length],to=perches[(leg+1)%perches.length];
  const hopping=phase>=8500;
  const fraction=hopping?(phase-8500)/1500:0;
  const x=from[0]+(to[0]-from[0])*fraction;
  const y=from[1]+(to[1]-from[1])*fraction-12*Math.sin(Math.PI*fraction);
  const direction=to[0]>=from[0]?1:-1;
  wren.setAttribute('transform','translate('+x+' '+y+') scale('+direction+' 1)');
 }
}
const seasons={
 'Primavera':{leaves:['#548764','#81a762'],marks:'#efa8bb',ground:'#8ab774',kind:'flower'},
 'Verão':{leaves:['#39745b','#5d9d62'],marks:'#e4bf66',ground:'#70a96d',kind:'berry'},
 'Outono':{leaves:['#80634f','#b28456'],marks:'#e4a86b',ground:'#bc985f',kind:'leaf'},
 'Inverno':{leaves:['#4e6b67','#658480'],marks:'#c2d5d8',ground:'#9bb4ad',kind:'dew'}
};
const dateFormat=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit'});
let season=null,weather=null,isNight=false,captionDate='';
let solarDays=[],lastLightingSecond=-1;
function blendColor(a,b,fraction){
 const channels=a.map((channel,index)=>Math.round(channel+(b[index]-channel)*fraction));
 return 'rgb('+channels.join(',')+')';
}
function updateDaylight(now){
 const second=Math.floor(now/1000);
 if(second===lastLightingSecond)return;
 lastLightingSecond=second;
 const day=solarDays.find(day=>now>=day.start&&now<day.start+86400000);
 if(!day)return;
 const minute=60000;
 const dawn=Math.max(0,Math.min(1,(now-day.rise+45*minute)/(80*minute)));
 const dusk=Math.max(0,Math.min(1,(day.set+45*minute-now)/(80*minute)));
 const light=Math.min(dawn,dusk);
 const cloudy=!['clear','partly'].includes(svg.dataset.weather);
 const top=cloudy?[159,177,190]:[97,157,193];
 const bottom=cloudy?[214,222,225]:[184,215,223];
 const twilight=4*light*(1-light);
 const horizon=bottom.map((value,index)=>Math.round(value+( [224,158,137][index]-value)*twilight*.5));
 sky.querySelector('.sky-top').style.stopColor=blendColor([38,49,87],top,light);
 sky.querySelector('.sky-bottom').style.stopColor=blendColor([65,70,105],horizon,light);
 svg.closest('.mission-art').style.background=blendColor([48,58,96],top,light);
 clouds.style.fill=blendColor([104,112,140],[213,219,225],light);
 sky.querySelector('path[fill="#464f72"]').style.fill=blendColor([70,79,114],[119,151,139],light);
 sky.querySelector('.sky-moon').style.opacity=String(1-light);
 sky.querySelector('.sky-stars').style.opacity=String((1-light)*(cloudy?.12:1));
 const daytime=now>=day.rise&&now<day.set;
 svg.dataset.day=String(daytime);
 const nextNight=!daytime;
 if(nextNight!==isNight){isNight=nextNight;caption();}
 const sun=sky.querySelector('.sky-sun');
 const progress=Math.max(0,Math.min(1,(now-day.rise)/(day.set-day.rise)));
 sun.setAttribute('transform','translate('+(30+340*progress-55)+' '+(157-119*Math.sin(Math.PI*progress)-40)+')');
 sun.style.display=daytime&&!cloudy?'inline':'none';
 sun.style.opacity=String(Math.min(1,light*1.4));
}
function seasonAt(monthDay){
 // Approximate seasonal transitions for the Southern Hemisphere.
 return monthDay>=1221||monthDay<320?'Verão':monthDay<621?'Outono':monthDay<922?'Inverno':'Primavera';
}
function caption(){
 const conditions=weather
  ?(isNight?'Noite · ':'')+weather+' · Clima externo estimado por Open-Meteo.'
  :'Aguardando meteorologia externa.';
 document.getElementById('sky-caption').textContent='Sorocaba · '+captionDate+' · '+conditions;
}
function drawGarden(now){
 // Calendar time keeps the three-day ripening cycle consistent after reloads.
 const ripeness=((now-Date.UTC(2026,0,1))%(3*86400000))/(3*86400000);
 const fruitSeason=seasonAt(Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',month:'2-digit',day:'2-digit'}).format(new Date(now)).replace('/','')));
 const ripe=fruitSeason==='Outono'?[236,180,73]:fruitSeason==='Inverno'?[190,184,104]:fruitSeason==='Primavera'?[218,211,88]:[247,215,83];
 garden.querySelectorAll('.guava-fruit').forEach((fruit,i)=>{
  const f=(ripeness+i*.07)%1;
  const color=blendColor([91,151,68],ripe,f);
  fruit.querySelector('path').setAttribute('fill',color);
  fruit.querySelectorAll('path')[1].setAttribute('fill',blendColor([139,183,89],[255,232,137],f));
  fruit.setAttribute('aria-label','Goiaba amadurecendo · '+Math.round(f*100)+'%');
 });

 const p=Object.fromEntries(dateFormat.formatToParts(new Date(now)).map(x=>[x.type,x.value]));
 const date=p.day+'/'+p.month;
 if(date!==captionDate){captionDate=date;caption();}
 const key=seasonAt(Number(p.month)*100+Number(p.day));
 if(season===key)return;season=key;
 const {leaves,marks,ground,kind}=seasons[key];
 garden.innerHTML=
  '<g class="guava-tree"><title>Goiabeira com frutos no jardim da estufa</title>'+
  '<path fill="#85694c" d="M292 204v-5h7v-33h-4v-25h-8v-18h-9v-17h7v13h10v18h8v-25h9V88h6v27h-8v26h-5v25h4v33h7v5zM270 155h18v-5h10v7h-9v3h-19zM307 150h10v-10h11v-18h6v21h-11v13h-16z"/>'+
  '<path fill="#c1a37b" d="M301 166h4v32h-4zM297 141h4v24h-4zM289 124h4v14h-4zM307 115h3v23h-3zM272 155h16v2h-16z"/>'+
  '<path fill="'+leaves[0]+'" d="M275 56h23v-9h24v7h13v12h-7v9h-24v8h-19v-8h-18V63h8zM251 84h16v-9h19v7h14v13h-6v15h-22v8h-21v-8h-10V95h10zM319 83h15V72h22v8h13v13h-5v16h-18v7h-25v-10h-9V91h7zM278 108h21v-8h19v8h15v15h-8v11h-24v-6h-24v-10h-8v-7h9z"/>'+
  '<path fill="'+leaves[1]+'" d="M280 58h17v-5h23v7h8v8h-19v7h-20v-7h-15V61h6zM254 89h16v-7h13v7h10v8h-18v8h-22V99h-6v-5h7zM328 85h14v-7h11v8h10v9h-19v8h-22v-9h6zM283 111h18v-6h14v8h10v8h-18v5h-19v-7h-11v-5h6z"/>'+
  '<path fill="#9bb06c" d="M284 77h8v3h-5v3h-3zM260 105h8v3h-5v3h-3zM342 105h8v3h-5v3h-3z"/></g>';
 for(const [x,y] of [[283,69],[262,97],[290,102],[344,91],[311,120]]){
  const fruit=node('g',{class:'guava-fruit',transform:'translate('+x+' '+y+')'},garden);
  node('path',{d:'M-2-4h4v2h2v5H2v2h-4V3h-2v-5h2z',fill:'#b5c66b'},fruit);
  node('path',{d:'M-2-1h2v4h-2z',fill:'#e1d77c'},fruit);
  node('path',{d:'M0-5v2m-1 7h2',stroke:'#58663b','stroke-width':1},fruit);
 }
 const points=[[21,209],[50,203],[82,213],[211,208],[254,202],[314,207],[342,197],[374,212]];
 for(const [x,y] of points){
  node('path',{d:'M'+x+' '+y+'v-5m0 3l-4-3m4 2l4-4',stroke:ground,fill:'none','stroke-width':2},garden);
 }
 const details=[[32,204],[77,201],[337,201],[363,209]];
 for(const [x,y] of details){
  const mark=node('g',{transform:'translate('+x+' '+y+')',fill:marks},garden);
  if(kind==='flower'){node('path',{d:'M-1-3h2v2h2v2H1v2h-2V1h-2v-2h2z'},mark);node('rect',{x:-1,y:-1,width:2,height:2,fill:'#ffde85'},mark);}
  else if(kind==='leaf')node('path',{d:'M-3 1h2v-3h5v3H2v2h-5z'},mark);
  else if(kind==='dew')node('path',{d:'M0-3h1v2h2v1H1v2H0V0h-2v-1h2z'},mark);
  else node('path',{d:'M-3 0h3v3h-3zM1-2h2v2H1z'},mark);
 }
 caption();
}
const fireflies=Array.from({length:6},(_,i)=>{
 const g=node('g',{'aria-hidden':'true','class':'garden-firefly'});
 svg.insertBefore(g,clock);
 node('circle',{r:5,fill:'#ffea8d',filter:'url(#firefly-glow)',opacity:.7},g);
 node('rect',{x:-1,y:-1,width:2,height:2,fill:'#fff1a6'},g);
 return g;
});
const owl=node('g',{id:'scene-owl',role:'img','aria-label':'Coruja pousada no telhado',transform:'translate(107 80)'});
svg.insertBefore(owl,clock);
owl.innerHTML='<path d="M-11-14H11V-2H8v3H-8v-3h-3z" fill="#b98eac"/><path d="M-6-10H6v9H-6z" fill="#efccbd"/><path d="M-7-1h5v3h-5zm9 0h5v3H2z" fill="#efb86c"/><g class="owl-head"><path d="M-10-15v-11l6 4h8l6-4v11l-3 3H-7z" fill="#c79cb8"/><path d="M-8-21H8v7H-8z" fill="#fff4d8"/><path class="owl-pupils" d="M-6-20h2v4h-2zm10 0h2v4H4z" fill="#344057"/><path class="owl-blink" d="M-7-18h5v1h-5zm9 0h5v1H2z" fill="#344057"/><path d="M-2-15h4l-2 3z" fill="#eaa658"/></g>';
const pupils=owl.querySelector('.owl-pupils'),blink=owl.querySelector('.owl-blink');
const wings=node('path',{d:'M-10-13l-16-8v7l16 9zm20 0l16-8v7l-16 9z',fill:'#ab82a9'},owl);
const routes=[
 'M116 108Q121 95 131 104L175 129Q185 134 182 150Q173 162 152 149L121 132Q111 126 116 108Z',
 'M116 148Q130 135 147 145L176 157Q186 163 183 179Q179 189 162 186L125 178Q113 173 116 148Z',
 'M120 187L165 192Q181 193 182 177L181 139Q180 130 169 134L128 146Q115 150 115 165Q114 178 120 187Z'
].map(d=>{const p=node('path',{d,fill:'none',stroke:'none'},wind);return {p,len:p.getTotalLength()};});
const gusts=Array.from({length:7},(_,i)=>{
 const g=node('g',{class:'air-gust',fill:'none',stroke:i%2?'#26758a':'#3d879a','stroke-width':1.6,'stroke-linecap':'round'},wind);
 node('path',{d:'M-6-2h8q3 0 3-2m-13 5h10m-7 3h8l2-2'},g);
 return g;
});
let frame=0,last=-Infinity;
const offstage=[-30,44],branch=[276,155],roof=[107,80];
const flightMs=1700,branchMs=15*60000,roofMs=7*60000;
let owlVisitStart=null,owlPosition=offstage,owlOrigin=offstage,owlTarget=offstage,owlFlightStart=0;
function draw(now){
 drawGarden(now);
 updateDaylight(now);
 clouds.setAttribute('transform','translate('+(-515*((now%105000)/105000))+' 0)');
 rainDrops.forEach(({drop,x:originX,y:originY})=>{
  const x=((originX-now/55)%420+420)%420;
  const y=((originY+now/7)%245)-15;
  drop.setAttribute('transform','translate('+x+' '+y+')');
 });
 drawRainVisitors(now);
 const wifi=svg.querySelector('#scene-esp .esp-signal');
 if(wifi){
  const connected=svg.querySelector('#scene-esp').classList.contains('esp-online');
  wifi.style.opacity=connected?String(.25+.75*(.5+.5*Math.sin(now/240))):'.18';
 }
 const wet=svg.dataset.weather==='rain'||svg.dataset.weather==='snow';
 const visiting=svg.dataset.day==='false'&&!wet;
 owlVisitStart=visiting?(owlVisitStart??now):null;
 const phase=(now-(owlVisitStart??now))%(branchMs+roofMs+2*flightMs);
 const target=visiting?branch:offstage;
 if(target!==owlTarget){
  owlOrigin=owlPosition;
  owlTarget=target;
  owlFlightStart=now;
 }
 const progress=Math.min(1,Math.max(0,(now-owlFlightStart)/flightMs));
 const flying=owlOrigin!==owlTarget&&progress<1;
 owlPosition=flying?[
  owlOrigin[0]+(owlTarget[0]-owlOrigin[0])*progress,
  owlOrigin[1]+(owlTarget[1]-owlOrigin[1])*progress-38*Math.sin(Math.PI*progress)
 ]:owlTarget;
 const [x,y]=owlPosition;
 owl.style.display=flying||target!==offstage?'':'none';
 owl.setAttribute('transform','translate('+x+' '+y+')');
 wings.style.display=flying?'':'none';
 wings.setAttribute('transform','scale(1 '+(.7+.45*Math.sin(now/37))+')');
 const label=flying
  ?(target===offstage?'Coruja voando para longe':'Coruja chegando ao '+(target===branch?'galho':'telhado'))
  :(target===branch?'Coruja pousada no galho':'Coruja pousada no telhado');
 if(owl.getAttribute('aria-label')!==label)owl.setAttribute('aria-label',label);
 const shut=!flying&&now%6700<170;
 pupils.setAttribute("opacity",shut?"0":"1");
 blink.setAttribute("opacity",shut?"1":"0");
 fireflies.forEach((g,i)=>{
  g.style.display=wet||svg.dataset.day!=='false'?'none':'';
  const u=now/1000,x0=[35,68,230,256,324,367][i];
  g.setAttribute('transform','translate('+(x0+9*Math.sin(u*.73+i)).toFixed(2)+' '+(180+(i%3)*9+8*Math.cos(u*.82+i*2)).toFixed(2)+')');
  g.setAttribute('opacity',Math.pow(Math.max(0,Math.sin(u*(1.05+i*.08)+i*2.1)),4).toFixed(2));
 });
 if(wind.classList.contains('coolers-active'))gusts.forEach((g,i)=>{
  const {p,len}=routes[i%routes.length];
  const phase=(now/1000*(.20+(i%3)*.035)+(i+1)/7)%1,at=phase*len;
  const a=p.getPointAtLength(at),b=p.getPointAtLength((at+.9)%len),angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
  g.setAttribute('transform','translate('+a.x+' '+a.y+') rotate('+angle+')');
  g.setAttribute('opacity',(.56+.36*Math.sin(phase*2*Math.PI+i)).toFixed(2));
 });
}
function tick(time){frame=0;if(document.hidden)return;if(time-last>=32){last=time;draw(Date.now());}frame=requestAnimationFrame(tick);}
function sync(){if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;return;}draw(Date.now());if(!frame)frame=requestAnimationFrame(tick);}
document.addEventListener('visibilitychange',sync);
window.addEventListener('pageshow',sync);
window.addEventListener('focus',sync);
sync();

async function refreshWeather(){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),10000);
 try{
  const res=await fetch('https://api.open-meteo.com/v1/forecast?latitude=-23.50&longitude=-47.46&current=weather_code,is_day&daily=sunrise,sunset&timeformat=unixtime&forecast_days=3&timezone=America%2FSao_Paulo',{signal:controller.signal});
  if(!res.ok)return;
  const data=await res.json(),current=data.current;
  if(Array.isArray(data.daily?.time)){
   solarDays=data.daily.time.map((start,index)=>({
    start:start*1000,rise:data.daily.sunrise?.[index]*1000,set:data.daily.sunset?.[index]*1000
   })).filter(day=>Number.isFinite(day.start)&&Number.isFinite(day.rise)&&Number.isFinite(day.set)&&day.set>day.rise);
  }
  const code=current?.weather_code;
  isNight=current?.is_day===0;
  weather=!Number.isFinite(code)?null:code===0?'Céu limpo':code<=2?'Parcialmente nublado':code===3?'Nublado':code<=48?'Neblina':code>=95?'Trovoadas':code>=71&&code<=77?'Neve':'Chuva';
  if(Number.isFinite(code)){
   const snow=(code>=71&&code<=77)||code===85||code===86;
   const condition=code===0?"clear":code===1||code===2?"partly":code===3?"cloudy":code===45||code===48?"fog":snow?"snow":"rain";
   svg.dataset.weather=condition;
   svg.dataset.day=current.is_day===1?"true":"false";
   if(snow)weather="Neve";
  }
  caption();
  lastLightingSecond=-1;
  updateDaylight(Date.now());
 }catch{}finally{clearTimeout(timeout);}
}
refreshWeather();setInterval(()=>{if(!document.hidden)refreshWeather();},15*60000);
})();
