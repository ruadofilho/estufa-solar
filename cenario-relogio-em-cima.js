(()=>{
'use strict';
const svg=document.querySelector('.mission-art svg'), wind=document.getElementById('kiln-wind');
if(!svg||!wind)return;
const ns='http://www.w3.org/2000/svg';
function node(tag,attrs={},parent){const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(parent)parent.append(e);return e;}
const sky=node('g',{'aria-hidden':'true'});
sky.innerHTML='<defs><linearGradient id="garden-sky" x2="0" y2="1"><stop class="sky-top" stop-color="#263157"/><stop class="sky-bottom" offset="1" stop-color="#55587d"/></linearGradient><filter id="firefly-glow"><feGaussianBlur stdDeviation="2"/></filter></defs><rect width="400" height="220" fill="url(#garden-sky)"/><path class="sky-moon" fill="#e4cc99" d="M55 24h10v3h-6v4h-4v9h4v4h6v3H55v-3h-6v-4h-3v-9h3v-4h6z"/><path class="sky-stars" fill="#e5d3a9" d="M25 61h2v2h-2zm95-35h2v2h-2zm42 31h2v2h-2zm53-36h2v2h-2zm63 30h2v2h-2zm38 24h2v2h-2zm63-25h2v2h-2z"/><path class="sky-sun" fill="#ffe39b" d="M48 29h15v4h5v15h-5v4H48v-4h-5V33h5z"/><path fill="#464f72" d="M0 187h29v-12h22v-9h39v10h28v44H0zm187 0h32v-12h31v-10h29v7h30v-13h32v8h30v11h29v42H187z"/><path fill="#456c64" d="M0 201h400v19H0z"/><path fill="#628675" d="M0 201h400v4H0z"/>';
svg.prepend(sky);
svg.dataset.weather='clear';
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
svg.insertBefore(precipitation,clock);
const seasons={
 'Primavera':{leaves:['#548764','#81a762'],marks:'#efa8bb',ground:'#8ab774',kind:'flower'},
 'Verão':{leaves:['#39745b','#5d9d62'],marks:'#e4bf66',ground:'#70a96d',kind:'berry'},
 'Outono':{leaves:['#80634f','#b28456'],marks:'#e4a86b',ground:'#bc985f',kind:'leaf'},
 'Inverno':{leaves:['#4e6b67','#658480'],marks:'#c2d5d8',ground:'#9bb4ad',kind:'dew'}
};
const dateFormat=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit'});
let season=null,weather=null,isNight=false,captionDate='';
const localHour=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',hourCycle:'h23'});
let solarDays=[],lastLightingSecond=-1;
function blendColor(a,b,fraction){
 const channels=a.map((channel,index)=>Math.round(channel+(b[index]-channel)*fraction));
 return 'rgb('+channels.join(',')+')';
}
function updateDaylight(now){
 const second=Math.floor(now/1000);
 if(second===lastLightingSecond)return;
 lastLightingSecond=second;
 let day=solarDays.find(day=>now>=day.start&&now<day.start+86400000);
 if(!day){
  const hour=Number(localHour.format(now));
  const start=now-(now%3600000)-(hour-6)*3600000;
  day={rise:start,set:start+12*3600000};
 }
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
// Each route enters at the upper hatch and returns through the boards to the lower hatch.
const airflow=node('g',{class:'kiln-airflow',visibility:'hidden','shape-rendering':'geometricPrecision'},wind);
wind.removeAttribute('clip-path');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const airflowStyle=document.createElement('style');
airflowStyle.textContent=`
 .mission-art svg[data-hatches="ABRIR"] #kiln-wind{display:inline;opacity:.95}
 .mission-art svg:not([data-hatches="ABRIR"]) #kiln-wind{display:none}
 @media(max-width:600px){.kiln-airflow .air-outline{stroke-width:5}.kiln-airflow .air-core{stroke-width:2.9}}
 @keyframes shepherd-wag{from{transform:rotate(-18deg)}to{transform:rotate(25deg)}}
 .shepherd-tail{transform-origin:0 0;animation:shepherd-wag .34s ease-in-out infinite alternate}
 @media(prefers-reduced-motion:reduce){.shepherd-tail{animation:none}}
`;
document.head.append(airflowStyle);
const routes=[
 ['M90 108H112C126 108 135 119 145 131S166 147 169 158C173 176 149 181 127 181H93',
  'M68 117H86C104 117 116 123 132 134S169 145 176 157C184 177 154 178 128 178H69'],
 ['M90 108H110C127 108 133 119 143 134S157 151 152 163C147 174 129 181 109 181H93',
  'M68 117H86C104 117 114 125 123 136S145 148 147 159C151 174 128 178 109 178H69']
].map(([base,illustrated])=>({base,illustrated,p:node('path',{d:base,fill:'none',stroke:'none'},airflow),len:0}));
let illustratedAirflow;
const gusts=Array.from({length:8},()=>{
 const g=node('g',{fill:'none','stroke-linecap':'round','stroke-linejoin':'round'},airflow);
 const d='M-6 0H5M1-3.5L5 0L1 3.5';
 node('path',{d,class:'air-outline',stroke:'#234a54','stroke-width':3.4},g);
 node('path',{d,class:'air-core',stroke:'#8be4ff','stroke-width':1.8},g);
 return g;
});
function drawAirflow(now){
 const open=svg.dataset.hatches==='ABRIR';
 airflow.setAttribute('visibility',open?'visible':'hidden');
 if(!open)return;
 const illustrated=svg.dataset.illustrated==='true';
 if(illustrated!==illustratedAirflow){
  illustratedAirflow=illustrated;
  for(const route of routes){
   route.p.setAttribute('d',illustrated?route.illustrated:route.base);
   route.len=route.p.getTotalLength();
  }
 }
 const period=wind.classList.contains('coolers-active')?4400:6800;
 gusts.forEach((g,i)=>{
  const {p,len}=routes[i%routes.length];
  const offset=(i+.5)/gusts.length;
  const phase=motion.matches?offset:(now/period+offset)%1;
  const at=phase*len,a=p.getPointAtLength(at);
  const before=p.getPointAtLength(Math.max(0,at-1)),after=p.getPointAtLength(Math.min(len,at+1));
  const angle=Math.atan2(after.y-before.y,after.x-before.x)*180/Math.PI;
  g.setAttribute('transform','translate('+a.x+' '+a.y+') rotate('+angle+')');
  g.setAttribute('opacity',Math.min(1,phase*18,(1-phase)*18).toFixed(2));
 });
}
const shepherd=node('g',{role:'img','aria-label':'Pastor-alemão sentado abanando o rabo',transform:'translate(361 207)'});
svg.insertBefore(shepherd,precipitation);
const tailMount=node('g',{transform:'translate(9 -9)'},shepherd);
const tail=node('g',{class:'shepherd-tail'},tailMount);
node('path',{fill:'#352725',d:'M-2 0H4V-1H9V-3H13V-5H16V-2H15V1H13V3H9V5H3L-2 3Z'},tail);
node('path',{fill:'#9c6238',d:'M1 2H6V1H10V-1H13V1H11V3H8V4H2Z'},tail);
const shepherdUrl=window.ESTUFA_ASSETS?.shepherd||'./pastor-alemao.png';
const shepherdImage=node('image',{href:shepherdUrl,x:-21,y:-43,width:42,height:44},shepherd);
shepherdImage.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',shepherdUrl);
shepherd.setAttribute('visibility','hidden');
const shepherdArt=new Image();
shepherdArt.onload=()=>shepherd.removeAttribute('visibility');
shepherdArt.src=shepherdUrl;
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
 puddles.style.display=svg.dataset.weather==='rain'?'':'none';
 const wifi=svg.querySelector('#scene-esp .esp-signal');
 if(wifi){
  const connected=svg.querySelector('#scene-esp').classList.contains('esp-online');
  wifi.style.opacity=connected?String(.25+.75*(.5+.5*Math.sin(now/240))):'.18';
 }
 const wet=svg.dataset.weather==='rain'||svg.dataset.weather==='snow';
 const visiting=svg.dataset.day==='false';
 owlVisitStart=visiting?(owlVisitStart??now):null;
 const phase=(now-(owlVisitStart??now))%(branchMs+roofMs+2*flightMs);
 const target=visiting?(phase<branchMs+flightMs?branch:roof):offstage;
 if(target!==owlTarget){
  owlOrigin=owlPosition;
  owlTarget=target;
  owlFlightStart=now;
 }
 const progress=Math.min(1,Math.max(0,(now-owlFlightStart)/flightMs));
 const flying=!motion.matches&&owlOrigin!==owlTarget&&progress<1;
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
 const shut=!motion.matches&&!flying&&now%6700<170;
 pupils.setAttribute("opacity",shut?"0":"1");
 blink.setAttribute("opacity",shut?"1":"0");
 fireflies.forEach((g,i)=>{
  g.style.display=wet||svg.dataset.day!=='false'?'none':'';
  const u=now/1000,x0=[35,68,230,256,324,367][i];
  g.setAttribute('transform','translate('+(x0+9*Math.sin(u*.73+i)).toFixed(2)+' '+(180+(i%3)*9+8*Math.cos(u*.82+i*2)).toFixed(2)+')');
  g.setAttribute('opacity',Math.pow(Math.max(0,Math.sin(u*(1.05+i*.08)+i*2.1)),4).toFixed(2));
 });
 drawAirflow(now);
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
