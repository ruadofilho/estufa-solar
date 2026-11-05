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
for(let i=0;i<30;i++){
 const x=(i*53)%400,y=53+(i*31)%145;
 node("path",{d:"M"+x+" "+y+"l-5 11",class:"rain-drop"},precipitation);
 node("rect",{x,y,width:2,height:2,class:"snow-flake"},precipitation);
}
const fog=node("path",{class:"sky-fog",d:"M0 91h125m43 0h180m-90 17h142M0 124h186m40 0h174"},sky);
const clock=svg.querySelector('.scene-clock');
const garden=node('g',{'aria-hidden':'true'});
svg.insertBefore(garden,clock);
const seasons={
 'Primavera':{leaves:['#548764','#81a762'],marks:'#efa8bb',ground:'#8ab774',kind:'flower'},
 'Verão':{leaves:['#39745b','#5d9d62'],marks:'#e4bf66',ground:'#70a96d',kind:'berry'},
 'Outono':{leaves:['#80634f','#b28456'],marks:'#e4a86b',ground:'#bc985f',kind:'leaf'},
 'Inverno':{leaves:['#4e6b67','#658480'],marks:'#c2d5d8',ground:'#9bb4ad',kind:'dew'}
};
const dateFormat=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit'});
let season=null,weather=null,isNight=false,captionDate='';
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
  '<path fill="#58413e" d="M292 201h8V109h12v92h10v4h-30zM270 155h19v-4h7v-5h7v9h-7v5h-26zM310 145h8v-6h9v-5h8v6h-8v6h-9v6h-8z"/>'+
  '<path fill="#a07659" d="M302 127h4v72h-4zM272 155h17v2h-17z"/>'+
  '<path fill="'+leaves[0]+'" d="M291 48h29v7h14v9h11v13h9v26h-7v14h-14v9h-16v7h-29v-6h-17v-8h-14v-14h-8V83h9V69h13V58h20z"/>'+
  '<path fill="'+leaves[1]+'" d="M293 53h24v7h13v8h10v11h7v15h-13V83h-14V72h-29v7h-17v12h-16v-9h8V72h12V61h15zM265 101h11v7h15v7h23v8h-24v-5h-15v-7h-10z"/>';
 const points=[[21,209],[50,203],[82,213],[211,208],[254,202],[314,207],[342,197],[374,212]];
 for(const [x,y] of points){
  node('path',{d:'M'+x+' '+y+'v-5m0 3l-4-3m4 2l4-4',stroke:ground,fill:'none','stroke-width':2},garden);
 }
 const details=[[270,92],[282,73],[309,60],[326,82],[339,100],[298,106],[318,116],[32,204],[77,201],[337,201],[363,209]];
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
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let frame=0,last=-Infinity;
const offstage=[-30,44],branch=[276,155],roof=[107,80];
const flightMs=1700,branchMs=15*60000,roofMs=7*60000;
let owlVisitStart=null,owlPosition=offstage,owlOrigin=offstage,owlTarget=offstage,owlFlightStart=0;
function draw(now){
 drawGarden(now);
 const still=motion.matches;
 const wet=svg.dataset.weather==='rain'||svg.dataset.weather==='snow';
 const visiting=svg.dataset.day==='false'&&!wet;
 owlVisitStart=visiting?(owlVisitStart??now):null;
 const phase=(now-(owlVisitStart??now))%(branchMs+roofMs+2*flightMs);
 const target=visiting?(phase<branchMs+flightMs?branch:roof):offstage;
 if(target!==owlTarget){
  owlOrigin=owlPosition;
  owlTarget=target;
  owlFlightStart=now;
 }
 const progress=still?1:Math.min(1,Math.max(0,(now-owlFlightStart)/flightMs));
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
 const shut=!still&&!flying&&now%6700<170;
 pupils.setAttribute("opacity",shut?"0":"1");
 blink.setAttribute("opacity",shut?"1":"0");
 fireflies.forEach((g,i)=>{
  g.style.display=wet?'none':'';
  const u=still?0:now/1000,x0=[35,68,230,256,324,367][i];
  g.setAttribute('transform','translate('+(x0+9*Math.sin(u*.73+i)).toFixed(2)+' '+(180+(i%3)*9+8*Math.cos(u*.82+i*2)).toFixed(2)+')');
  g.setAttribute('opacity',still?(i%2?'0':'.65'):Math.pow(Math.max(0,Math.sin(u*(1.05+i*.08)+i*2.1)),4).toFixed(2));
 });
 if(wind.classList.contains('coolers-active'))gusts.forEach((g,i)=>{
  const {p,len}=routes[i%routes.length];
  const phase=((still?0:now/1000*(.20+(i%3)*.035))+(i+1)/7)%1,at=phase*len;
  const a=p.getPointAtLength(at),b=p.getPointAtLength((at+.9)%len),angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
  g.setAttribute('transform','translate('+a.x+' '+a.y+') rotate('+angle+')');
  g.setAttribute('opacity',still?'.8':(.56+.36*Math.sin(phase*2*Math.PI+i)).toFixed(2));
 });
}
function tick(time){frame=0;if(document.hidden)return;if(time-last>=32){last=time;draw(Date.now());}frame=requestAnimationFrame(tick);}
function sync(){if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;return;}draw(Date.now());if(!frame)frame=requestAnimationFrame(tick);}
document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);sync();

async function refreshWeather(){
 try{
  const res=await fetch('https://api.open-meteo.com/v1/forecast?latitude=-23.50&longitude=-47.46&current=weather_code,is_day&timezone=America%2FSao_Paulo',{signal:AbortSignal.timeout(10000)});
  if(!res.ok)return;
  const current=(await res.json()).current;
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
 }catch{}
}
refreshWeather();setInterval(()=>{if(!document.hidden)refreshWeather();},15*60000);
})();
