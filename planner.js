/* Planejador automático v0.2: estimativa energética preliminar, não modelo cinético validado. */
(function(root){
const M=typeof module!=='undefined'&&module.exports?require('./model.js'):root.EstufaModel;
const DAY=86400000,MONTHS=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
function climateValid(c){
 if(!c||!Number.isFinite(c.lat)||!Number.isFinite(c.lon)||!c.parameter)return false;
 return MONTHS.every(k=>{
 const p=c.parameter,g=p.ALLSKY_SFC_SW_DWN?.[k],d=p.ALLSKY_SFC_SW_DIFF?.[k],t=p.T2M?.[k],u=p.RH2M?.[k];
 return Number.isFinite(g)&&g>=0&&g<=15&&Number.isFinite(d)&&d>=0&&d<=g&&Number.isFinite(t)&&t>=-50&&t<=55&&Number.isFinite(u)&&u>=0&&u<=100;});
}
const cache=new Map();
function irradiation(c,epoch,direction){
 const date=new Date(epoch).toISOString().slice(0,10),month=MONTHS[new Date(epoch).getUTCMonth()];
 const key=c.lat+','+c.lon+','+date+','+direction;
 if(cache.has(key))return cache.get(key);
 const ghi=c.parameter.ALLSKY_SFC_SW_DWN[month],dhi=c.parameter.ALLSKY_SFC_SW_DIFF[month],b=28*Math.PI/180;
 const horizontal=M.solar(date,c.lat,c.lon,'N',0,1,0);
 const tilted=M.solar(date,c.lat,c.lon,direction,28,1,0);
 const ratio=horizontal>1e-9?tilted/horizontal:0;
 const h=(ghi-dhi)*ratio+dhi*(1+Math.cos(b))/2+.2*ghi*(1-Math.cos(b))/2;
 cache.set(key,h);return h;
}
function forecast(b,c,obs=[],now=Date.now()){
 const errors=M.validate(b);if(errors.length)return {status:'invalid',message:errors[0]};
 const cap=M.capacity(b);if(!cap.fits)return {status:'capacity',cap,message:'Ajuste a quantidade ou os separadores.'};
 if(!climateValid(c))return {status:'climate',cap,message:'Aguardando os dados climáticos deste local.'};
 const start=Date.parse(b.start+'-03:00');
 const valid=obs.filter(o=>o.batch===b.id&&o.source==='device'&&o.valid===true&&Number.isFinite(o.mc)&&o.mc>=7&&o.mc<=18&&o.epoch>=start&&o.epoch<=now).sort((a,b)=>a.epoch-b.epoch);
 const last=valid.at(-1),fresh=last&&now-last.epoch<=15*60000;
 const current=last?last.mc:Number(b.initial),reference=last?last.epoch:start;
 if(fresh&&current<=Number(b.target))return {status:'target',cap,current,message:'A amostra atingiu a meta.'};
 if(last&&current<=Number(b.target)&&!fresh)return {status:'stale',cap,message:'Aguardando uma leitura recente.'};
 const mass=cap.volume*M.C.density,water=Math.max(0,mass*(current-Number(b.target))/100),energy=water*M.C.latent;
 const g=.82,eff=.25; // Pendentes da ficha da chapa e ajuste por dados reais.
 function project(mult){
  let remaining=energy,days=0;
  for(let i=0;i<730;i++){
   const daily=irradiation(c,reference+i*DAY,b.direction||'N')*M.C.area*g*eff*mult;
   if(daily>0&&remaining<=daily)return reference+(days+remaining/daily)*DAY;
   remaining-=daily;days++;
  }return null;
 }
 const earliest=project(1.5),latest=project(.5);
 if(earliest===null||latest===null)return {status:'pending',cap,message:'Energia insuficiente para estimar o prazo.'};
 if(now>latest)return {status:'overdue',cap,earliest,latest,message:'A previsão precisa de novas leituras.'};
 const low=Math.max(0,Math.ceil((earliest-now)/DAY)),high=Math.max(0,Math.ceil((latest-now)/DAY));
 return {status:'forecast',cap,water,energy,earliest,latest,low,high,current,reference,fresh:!!fresh,progress:last?Math.min(100,Math.max(0,(Number(b.initial)-current)/(Number(b.initial)-Number(b.target))*100)):0,initial:!last};
}
const api={climateValid,irradiation,forecast};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EstufaPlanner=api;
})(typeof window!=='undefined'?window:globalThis);
