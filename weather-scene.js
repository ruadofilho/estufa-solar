(()=>{
'use strict';
const art=document.querySelector('.mission-art'),svg=art?.querySelector('svg'),caption=document.getElementById('sky-caption');
if(!svg||!caption)return;
const ns='http://www.w3.org/2000/svg',layer=document.createElementNS(ns,'g'),ground=document.createElementNS(ns,'g');svg.insertBefore(layer,svg.firstChild);svg.append(ground);window.EstufaArtwork.install(svg);
let data=null,busy=false;
function draw(){
 const now=Date.now(),today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(now);
 const valid=data&&Math.abs(now-data.current.time*1000)<90*60000;
 const index=data?data.daily.time.findIndex(t=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(t*1000)===today):-1;
 const rise=index>=0?data.daily.sunrise[index]*1000:NaN,set=index>=0?data.daily.sunset[index]*1000:NaN;
 svg.dataset.sunrise=Number.isFinite(rise)?String(rise):'';svg.dataset.sunset=Number.isFinite(set)?String(set):'';
 const day=Number.isFinite(rise)&&Number.isFinite(set)?now>=rise&&now<set:null;
 const code=valid?data.current.weather_code:null;
 const rain=code!==null&&((code>=51&&code<=67)||(code>=80&&code<=82)||code>=95);
 const snow=code!==null&&((code>=71&&code<=77)||code===85||code===86);
 const fog=code===45||code===48,cloud=code===2||code===3||rain||snow||fog;
 let label=!valid?'Clima indisponível':code>=95?'Trovoadas':snow?'Neve':rain?'Chuva':fog?'Neblina':code===3?'Nublado':code===2?'Parcialmente nublado':day===false?'Céu limpo':'Ensolarado';
 art.style.background=day===false?'#303a60':cloud?'#b9c8d5':'#a8dded';
 svg.querySelectorAll('.sky-sun').forEach(e=>e.style.display=day!==false&&(!cloud||code===2)?'':'none');
 let shapes='';
 shapes+=window.EstufaArtwork.sky({night:day===false,cloud,rain,clear:valid&&!cloud});
 if(ground.dataset.rain!==String(rain)){ground.innerHTML=window.EstufaArtwork.ground(rain);ground.dataset.rain=String(rain);}
 if(rain)shapes+='<path stroke="#4b7fba" stroke-width="4" d="M59 67l-5 12m29-12-5 12m29-12-5 12m133-12-5 12m29-12-5 12m29-12-5 12"/>';
 if(code!==null&&code>=95)shapes+='<path fill="#ffe078" d="M120 59h16l-9 13h9l-19 19 5-17h-9z"/>';
 if(fog)shapes+='<path stroke="#edf2ed" stroke-width="5" d="M30 69h140m50 0h100M40 80h120"/>';
 if(snow)shapes+='<path fill="#fff" d="M60 70h5v5h-5zm30 7h5v5h-5zm160-7h5v5h-5zm30 9h5v5h-5z"/>';
 const shapeKey=[day,valid,code].join(':');if(layer.dataset.key!==shapeKey){layer.innerHTML=shapes;layer.dataset.key=shapeKey;}
 const stamp=new Date(now).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
 caption.textContent='Sorocaba · '+stamp+' · '+(day===false?'Noite · ':'')+label+(valid?' · Clima externo estimado por Open-Meteo.':' · Aguardando meteorologia externa.');
 svg.setAttribute('aria-label','Estufa solar em pixels. '+caption.textContent);
 const sun=svg.querySelector('.sky-sun');if(sun&&day===true){const fraction=Math.max(0,Math.min(1,(now-rise)/(set-rise)));sun.setAttribute('transform','translate('+(fraction*220-45)+' '+(18-Math.sin(fraction*Math.PI)*18)+')');}
}
async function refresh(){if(busy)return;busy=true;try{const response=await fetch('https://api.open-meteo.com/v1/forecast?latitude=-23.50&longitude=-47.46&current=weather_code,is_day&daily=sunrise,sunset&timezone=America%2FSao_Paulo&timeformat=unixtime&forecast_days=2',{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error();const next=await response.json();if(!Number.isFinite(next.current?.time)||!Number.isFinite(next.current?.weather_code)||!Array.isArray(next.daily?.sunrise))throw Error();data=next;}catch(e){}finally{busy=false;draw();}}
draw();refresh();setInterval(()=>{if(!document.hidden)refresh();},15*60000);setInterval(()=>{if(!document.hidden)draw();},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){draw();refresh();}});
})();