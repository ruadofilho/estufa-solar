(()=>{
'use strict';
const art=document.querySelector('.mission-art'),svg=art?.querySelector('svg'),caption=document.getElementById('sky-caption');
if(!svg||!caption)return;
const ns='http://www.w3.org/2000/svg',layer=document.createElementNS(ns,'g');svg.append(layer);
let data=null,busy=false;
function draw(){
 const now=Date.now(),today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(now);
 const valid=data&&Math.abs(now-data.current.time*1000)<90*60000;
 const index=valid?data.daily.time.findIndex(t=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(t*1000)===today):-1;
 const rise=index>=0?data.daily.sunrise[index]*1000:NaN,set=index>=0?data.daily.sunset[index]*1000:NaN;
 const day=valid&&Number.isFinite(rise)&&Number.isFinite(set)?now>=rise&&now<set:null;
 const code=valid?data.current.weather_code:null;
 const rain=code!==null&&((code>=51&&code<=67)||(code>=80&&code<=82)||code>=95);
 const snow=code!==null&&((code>=71&&code<=77)||code===85||code===86);
 const fog=code===45||code===48,cloud=code===2||code===3||rain||snow||fog;
 let label=!valid?'Clima indisponível':code>=95?'Trovoadas':snow?'Neve':rain?'Chuva':fog?'Neblina':code===3?'Nublado':code===2?'Parcialmente nublado':day===false?'Céu limpo':'Ensolarado';
 art.style.background=day===false?'#303a60':cloud?'#b9c8d5':'#a8dded';
 svg.querySelectorAll('.sky-sun').forEach(e=>e.style.display=day===true&&(!cloud||code===2)?'':'none');
 let shapes='';
 if(day===false){shapes+='<path fill="#fff2bc" d="M72 15h30v8H88v24h22v8H72V15Z"/>';if(!cloud)shapes+='<path fill="#f9edbf" d="M155 20h4v4h-4zm100 20h4v4h-4zm80-20h4v4h-4z"/>';}
 if(cloud)shapes+='<path class="cloud-drift" fill="'+(rain?'#71849d':'#f3f4ed')+'" stroke="#697d94" stroke-width="2" d="M45 40h15V26h28V18h28v10h26v14h17v20H45zm175-10h20V16h30v8h27v14h23v22H220z"/>';
 if(rain)shapes+='<path stroke="#4b7fba" stroke-width="4" d="M59 67l-5 12m29-12-5 12m29-12-5 12m133-12-5 12m29-12-5 12m29-12-5 12"/>';
 if(code>=95)shapes+='<path fill="#ffe078" d="M120 59h16l-9 13h9l-19 19 5-17h-9z"/>';
 if(fog)shapes+='<path stroke="#edf2ed" stroke-width="5" d="M30 69h140m50 0h100M40 80h120"/>';
 if(snow)shapes+='<path fill="#fff" d="M60 70h5v5h-5zm30 7h5v5h-5zm160-7h5v5h-5zm30 9h5v5h-5z"/>';
 layer.innerHTML=shapes;
 const stamp=new Date(now).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
 caption.textContent='Sorocaba · '+stamp+' · '+(day===false?'Noite · ':'')+label+(valid?' · Clima externo estimado por Open-Meteo.':' · Aguardando meteorologia externa.');
 svg.setAttribute('aria-label','Estufa solar em pixels. '+caption.textContent);
 const sun=svg.querySelector('.sky-sun');if(sun&&day===true){const fraction=Math.max(0,Math.min(1,(now-rise)/(set-rise)));sun.setAttribute('transform','translate('+(fraction*220-45)+' '+(18-Math.sin(fraction*Math.PI)*18)+')');}
}
async function refresh(){if(busy)return;busy=true;try{const response=await fetch('https://api.open-meteo.com/v1/forecast?latitude=-23.50&longitude=-47.46&current=weather_code,is_day&daily=sunrise,sunset&timezone=America%2FSao_Paulo&timeformat=unixtime&forecast_days=2',{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error();const next=await response.json();if(!Number.isFinite(next.current?.time)||!Number.isFinite(next.current?.weather_code)||!Array.isArray(next.daily?.sunrise))throw Error();data=next;}catch(e){}finally{busy=false;draw();}}
draw();refresh();setInterval(()=>{if(!document.hidden)refresh();},15*60000);setInterval(()=>{if(!document.hidden)draw();},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){draw();refresh();}});
})();