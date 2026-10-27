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
function forecast(b,c,obs=[],now=Date.now(),environment={}){
 const errors=M.validate(b);if(errors.length)return {status:'invalid',message:errors[0]};
 const cap=M.capacity(b);if(!cap.fits)return {status:'capacity',cap,message:'Revise o empilhamento e os separadores.'};
 if(!climateValid(c))return {status:'climate',cap,message:'Aguardando clima do local.'};
 const D=typeof module!=='undefined'&&module.exports?require('./drying-model.js'):root.EstufaDrying;
 let parameters;try{parameters=D.params(b.dryingParameters||{});}catch(e){return {status:'invalid',message:e.message};}
 const history=D.integrate(b,c,environment.air||[],obs,{now,parameters,weather:environment.weather});
 const measurement=history.wood;
 const freshWood=measurement&&now-measurement.epoch<=15*60000;
 if(freshWood&&measurement.mc<=Number(b.target))return {status:'target',cap,current:measurement.mc,history,message:'Amostra medida na meta; conferir o restante da carga.'};
 const geo=D.geometry(b,parameters),common={cap,history,current:history.mc,water:Math.max(0,geo.dryMass*(history.mc-Number(b.target))/100),energy:Math.max(0,geo.dryMass*(history.mc-Number(b.target))/100)*M.C.latent,initial:!measurement,fresh:!!freshWood,progress:Math.max(0,Math.min(100,(Number(b.initial)-history.mc)/(Number(b.initial)-Number(b.target))*100))};
 const start=Date.parse(b.start+'-03:00'),last=history.air.at(-1);
 if(now-start>15*60000&&history.coverage<.9)return {...common,status:'history',message:'Histórico cobre '+Math.round(history.coverage*100)+'% desde a referência. Prazo suspenso nas lacunas.'};
 if(now-start>15*60000&&(!last||now-last.epoch>5*60000))return {...common,status:'stale',message:'Sem leitura recente do ar. Estimativa parada na última amostra.'};
 if(history.mc<=Number(b.target))return {...common,status:'estimatedTarget',message:'Meta estimada pelo modelo; confirmar na madeira.'};
 // O relógio é ancorado nos dados, não reduz horas com o mero passar do calendário.
 const anchor=Math.max(start,last?.epoch??start,measurement?.epoch??start);
 const lowP={...parameters,diffusivity:parameters.diffusivity*2,solarFactor:Math.min(.95,parameters.solarFactor*1.49),circulation:Math.min(1000,parameters.circulation*2)};
 const highP={...parameters,diffusivity:parameters.diffusivity*.5,solarFactor:Math.max(.1,parameters.solarFactor*.436),circulation:parameters.circulation*.5};
 const optimistic=D.forecastFuture(history.mc,b,c,anchor,lowP,irradiation,environment.weather,history.last?.t);
 const conservative=D.forecastFuture(history.mc,b,c,anchor,highP,irradiation,environment.weather,history.last?.t);
 const central=D.forecastFuture(history.mc,b,c,anchor,parameters,irradiation,environment.weather,history.last?.t);
 if(!Number.isFinite(optimistic.hours))return {...common,status:'conditions',message:'A meta não é alcançada em 180 dias no cenário atual. Revise as condições de secagem.'};
 const low=Math.ceil(optimistic.hours/24),high=Number.isFinite(conservative.hours)?Math.ceil(conservative.hours/24):null;
 return {...common,status:'forecast',low,high,central:Number.isFinite(central.hours)?Math.ceil(central.hours/24):null,anchor,earliest:anchor+optimistic.hours*D.HOUR,latest:Number.isFinite(conservative.hours)?anchor+conservative.hours*D.HOUR:null,provisional:true,forecastSource:environment.weather?.size?'Meteorologia horária disponível; médias mensais fora da cobertura':'Cenário de médias mensais externas',message:'Estimativa pelo histórico do ar; cinética e vazões ainda não calibradas.'};
}
const api={climateValid,irradiation,forecast};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EstufaPlanner=api;
})(typeof window!=='undefined'?window:globalThis);
