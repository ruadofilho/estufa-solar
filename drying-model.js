/* v0.7.2: observador higrotérmico reduzido. Todas as umidades em base seca.
   Coeficientes não medidos permanecem cenários explícitos, nunca precisão certificada. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./model.js'):root.EstufaModel);if(typeof module==='object'&&module.exports)module.exports=api;else root.EstufaDrying=api;})(typeof globalThis==='object'?globalThis:this,function(M){
'use strict';
const DAY=86400000,HOUR=3600000,MAX_GAP=15*60000;
const DEFAULTS=Object.freeze({density:500,diffusivity:1.25e-10,activation:25000,fsp:30,freeMultiplier:4,solarFactor:.55,ua:M.C.ua,airVolume:.4743,openingIn:.01,openingOut:.01,freeArea:.5,openingHeight:.60,discharge:.60,circulation:100,exchangeFan:0,rateScale:1});
const bounds={density:[250,900],diffusivity:[1e-12,1e-8],activation:[0,80000],fsp:[20,40],freeMultiplier:[1,10],solarFactor:[.1,.95],ua:[1,30],airVolume:[.1,5],openingIn:[0,.05],openingOut:[0,.05],freeArea:[0,1],openingHeight:[.05,2],discharge:[.1,1],circulation:[0,1000],exchangeFan:[0,100],rateScale:[.1,10]};
function params(input={}){const p={...DEFAULTS};for(const [k,v] of Object.entries(input)){if(!(k in bounds))continue;if(!Number.isFinite(v)||v<bounds[k][0]||v>bounds[k][1])throw Error('Parâmetro inválido: '+k);p[k]=v;}return p;}
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function emc(t,rh){if(!Number.isFinite(t)||t<0||t>80||!Number.isFinite(rh)||rh<0||rh>100)return null;const h=Math.min(.999,rh/100),w=349+1.29*t+.0135*t*t,k=.805+.000736*t-.00000273*t*t,k1=6.27-.00938*t-.000303*t*t,k2=1.91+.0407*t-.000293*t*t,x=k*h;return 1800/w*(x/(1-x)+(k1*x+2*k1*k2*x*x)/(1+k1*x+k1*k2*x*x));}
function saturation(t){return 610.94*Math.exp(17.625*t/(t+243.04));}
function ratio(t,rh){const pv=clamp(rh,0,100)/100*saturation(t);return .62198*pv/(101325-pv);}
function rhFromRatio(t,w){return clamp(100*(101325*w/(.62198+w))/saturation(t),0,100);}
function latent(t){return 2501000-2361*t;}
function wetBulb(t,rh){const w=ratio(t,rh),h=1.006*t+w*(2501+1.86*t);let lo=-30,hi=t;for(let i=0;i<35;i++){const mid=(lo+hi)/2,hh=1.006*mid+ratio(mid,100)*(2501+1.86*mid);if(hh>h)hi=mid;else lo=mid;}return (lo+hi)/2;}
function fanSchedule(epoch){const h=new Date(epoch-3*HOUR).getUTCHours();return h>=9&&h<18;}
function geometry(b,p){const cap=M.capacity(b),layers=Math.ceil(Number(b.quantity)/Math.max(1,cap.perLayer));return {dryMass:cap.volume*p.density,surface:2*Number(b.length)*Number(b.width)*Number(b.quantity)/1e6,channels:Math.max(1,layers-1)*Number(b.separator??15)/1000*Number(b.length)/1000,thickness:Number(b.thickness)/1000};}
function exchange(t,out,p){const ai=p.openingIn*p.freeArea,ao=p.openingOut*p.freeArea;if(!ai||!ao)return p.exchangeFan||0;const aeq=1/Math.sqrt(1/ai**2+1/ao**2);return 3600*p.discharge*aeq*Math.sqrt(2*9.81*p.openingHeight*Math.abs(t-out)/(273.15+Math.max(t,out)))+p.exchangeFan;}
function kinetics(mc,b,e,p){
 if(!Number.isFinite(mc)||mc<0||!Number.isFinite(e.t)||e.t<0||e.t>80||!Number.isFinite(e.rh)||e.rh<0||e.rh>100)return null;
 const geo=geometry(b,p),woodT=Number.isFinite(e.woodT)?e.woodT:e.t;if(woodT<0||woodT>80)return null;
 const woodRH=clamp(e.rh*saturation(e.t)/saturation(woodT),0,100),eq=emc(woodT,woodRH);
 const velocity=(e.fans===true?p.circulation:0)/3600/geo.channels;
 const length=Number(b.length)/1000,nu=1.5e-5,dv=2.5e-5*((e.t+273.15)/298.15)**1.8,re=velocity*length/nu;
 const hm=dv/length*Math.max(1,.664*Math.sqrt(re)*Math.cbrt(nu/dv));
 const h=clamp(woodRH,.5,99.5),dmdh=(emc(woodT,h+.1)-emc(woodT,h-.1))/.002;
 const rhoV=saturation(woodT)/(461.5*(woodT+273.15));
 // dmdh está em pontos percentuais por fração de UR; M/100 é kg/kg.
 const kfilm=100*hm*geo.surface*rhoV/(geo.dryMass*Math.max(.01,dmdh));
 const diff=p.diffusivity*Math.exp(-p.activation/8.314*(1/(woodT+273.15)-1/298.15))*(mc>p.fsp?p.freeMultiplier:1);
 const kdiff=Math.PI**2*diff/geo.thickness**2;
 const k=3600*p.rateScale/(1/kdiff+1/kfilm);
 return {eq,k,velocity,hm,diff,geo,woodT};
}
function step(mc,b,e,hours,p,previous){
 const k=kinetics(mc,b,e,p);if(!k||hours<=0)return {mc,loss:0,gain:0,unusable:true};
 const next=k.eq+(mc-k.eq)*Math.exp(-k.k*hours);
 let delta=(mc-next)*k.geo.dryMass/100,limit='difusão/superfície';
 // Adsorção é permitida: o modelo nunca força queda em ar acima do equilíbrio.
 if(delta>0){
  const tw=wetBulb(e.t,e.rh),hc=k.hm*1.2*1005; // analogia calor/massa, Lewis ~1
  const heatCap=Math.max(0,hc*k.geo.surface*(e.t-tw))*hours*3600/latent(tw);
  const q=exchange(e.t,e.outT,p),rhoDry=(101325-e.rh/100*saturation(e.t))/(287.05*(273.15+e.t));
  const ventCap=Math.max(0,q*rhoDry*(ratio(e.t,e.rh)-ratio(e.outT,e.outRH)))*hours;
  const stored=previous?Math.max(0,p.airVolume*(rhoDry*ratio(e.t,e.rh)-previous.rhoV)):0;
  if(heatCap<delta){delta=heatCap;limit='transferência de calor';}
  // Com microclima imposto por leitura real, o fluxo da madeira é determinado
  // pela condição de contorno. Q e umidade externa inferidos não são medições
  // suficientes para impor um segundo limite: ventilação/condensação não estão identificadas.
  if(e.observedBoundary!==true&&ventCap+stored<delta){delta=ventCap+stored;limit='renovação/armazenamento no ar';}
 }
 return {mc:Math.max(0,mc-delta/k.geo.dryMass*100),loss:Math.max(0,delta),gain:Math.max(0,-delta),eq:k.eq,limit,k:k.k,velocity:k.velocity,temperature:k.woodT};
}
function monthEnv(c,epoch){const key=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][new Date(epoch).getUTCMonth()];return {outT:c?.parameter?.T2M?.[key],outRH:c?.parameter?.RH2M?.[key],source:'média mensal externa'};}
function outside(c,weather,epoch){const idx=Math.floor(epoch/HOUR),r=weather?.get?weather.get(idx):null;return r&&Number.isFinite(r.outT)&&Number.isFinite(r.outRH)?r:monthEnv(c,epoch);}
function normalize(rows,now=Infinity){const out=new Map();for(const r of rows||[]){const epoch=r.epoch,t=r.t,rh=r.rh??r.u;if(r.valid!==true||!['device','cloud','import'].includes(r.source)||!Number.isFinite(epoch)||epoch>now||!Number.isFinite(t)||t<0||t>80||!Number.isFinite(rh)||rh<0||rh>100)continue;out.set(epoch,{...r,epoch,t,rh});}return [...out.values()].sort((a,b)=>a.epoch-b.epoch);}
function woodReadings(rows,b,now){return (rows||[]).filter(r=>r.batch===b.id&&['device','manual'].includes(r.source)&&r.valid===true&&r.calibrated===true&&Number.isFinite(r.mc)&&r.mc>=1&&r.mc<=200&&Number.isFinite(r.epoch)&&r.epoch>=Date.parse(b.start+'-03:00')&&r.epoch<=now).sort((a,b)=>a.epoch-b.epoch);}
function integrate(b,c,rows,wood=[],options={}){
 const p=params(options.parameters),now=options.now??Date.now(),start=Date.parse(b.start+'-03:00'),air=normalize(rows,now),wr=woodReadings(wood,b,now);
 let mc=Number(b.initial),ref=start,loss=0,gain=0,covered=0,wi=0,last=null;const days={},failures=(rows||[]).filter(r=>r.valid===false&&Number.isFinite(r.epoch)).map(r=>r.epoch);
 const blocked=(a,z)=>failures.some(t=>t>a&&t<z);
 // Cada observação confiável ancora o estado; os totais de água continuam identificados como estimados.
 for(let i=0;i<air.length-1;i++){
  const a=air[i],z=air[i+1];if(z.epoch<=start||a.epoch>=now)continue;
  const rawDt=z.epoch-a.epoch;if(rawDt>MAX_GAP||rawDt<=0||blocked(a.epoch,z.epoch))continue;
  let left=Math.max(start,a.epoch),right=Math.min(now,z.epoch);
  while(wi<wr.length&&wr[wi].epoch<=left){mc=wr[wi].mc;ref=wr[wi].epoch;wi++;}
  while(left<right){
   const stop=Math.min(right,left+5*60000,wi<wr.length&&wr[wi].epoch>left?wr[wi].epoch:Infinity),mid=(left+stop)/2,f=(mid-a.epoch)/rawDt;
   const ext=outside(c,options.weather,mid);if(!Number.isFinite(ext.outT)||!Number.isFinite(ext.outRH)){left=stop;continue;}
   const e={t:a.t+(z.t-a.t)*f,rh:a.rh+(z.rh-a.rh)*f,...ext,observedBoundary:true,fans:typeof a.coolers==='boolean'?a.coolers:fanSchedule(mid),woodT:Number.isFinite(a.woodT)?a.woodT:undefined};
   const s=step(mc,b,e,(stop-left)/HOUR,p,last);if(!s.unusable){mc=s.mc;loss+=s.loss;gain+=s.gain;covered+=stop-left;last={...e,eq:s.eq,limit:s.limit,epoch:stop,rhoV:(101325-e.rh/100*saturation(e.t))/(287.05*(e.t+273.15))*ratio(e.t,e.rh)};
    const day=new Date(mid-3*HOUR).toISOString().slice(0,10);days[day]??={loss:0,gain:0,hours:0};days[day].loss+=s.loss;days[day].gain+=s.gain;days[day].hours+=(stop-left)/HOUR;
   }left=stop;
   if(wi<wr.length&&wr[wi].epoch===left){mc=wr[wi].mc;ref=wr[wi].epoch;wi++;}
  }
 }
 while(wi<wr.length){mc=wr[wi].mc;ref=wr[wi].epoch;wi++;}
 const anchor=wr.at(-1),horizon=air.at(-1)?.epoch??start;
 // Cobertura após a última medição da madeira: só esse trecho determina a continuidade do estado atual.
 let sinceAnchor=0;for(let i=0;i<air.length-1;i++){if(air[i+1].epoch-air[i].epoch<=MAX_GAP&&!blocked(air[i].epoch,air[i+1].epoch))sinceAnchor+=Math.max(0,Math.min(now,air[i+1].epoch)-Math.max(anchor?.epoch??start,air[i].epoch));}
 const duration=Math.max(0,now-(anchor?.epoch??start)),coverage=duration?Math.min(1,sinceAnchor/duration):1;
 return {mc,loss,gain,netLoss:loss-gain,coveredHours:covered/HOUR,elapsedHours:Math.max(0,now-start)/HOUR,coverage,days,last,anchor,horizon,parameters:p,air,reference:ref,wood:wr.at(-1),mass:geometry(b,p).dryMass};
}
// Cenário de futuro: resolve simultaneamente balanço sensível/latente, renovação e cinética.
function futureHour(mc,b,c,epoch,irradiance,p,weather,previousT){
 const ext=outside(c,weather,epoch);if(!Number.isFinite(ext.outT)||!Number.isFinite(ext.outRH))return null;
 const solar=Math.max(0,irradiance)*M.C.area*p.solarFactor;
 const fans=fanSchedule(epoch),geo=geometry(b,p);
 const heatCapacity=geo.dryMass*(1500+4180*mc/100)+p.airVolume*1.2*1005;
 const previous=Number.isFinite(previousT)?previousT:ext.outT;
 function evaluate(rate){let a=0,z=80;for(let i=0;i<30;i++){const t=(a+z)/2,q=exchange(t,ext.outT,p),balance=(p.ua+1.2*1005*q/3600)*(t-ext.outT)+heatCapacity*(t-previous)/3600+rate*latent(t)/3600-solar;if(balance>0)z=t;else a=t;}const t=(a+z)/2;
  const q=exchange(t,ext.outT,p),w=ratio(ext.outT,ext.outRH)+(q>0?rate/(1.2*q):rate>0?100:0),rh=rhFromRatio(t,w);
  const k=kinetics(mc,b,{t,rh,fans},p);if(!k)return null;
  const amount=(mc-(k.eq+(mc-k.eq)*Math.exp(-k.k)))*geo.dryMass/100;
  const vapourCap=q>0?Math.max(0,1.2*q*(ratio(t,100)-ratio(ext.outT,ext.outRH))):0;
  return {t,rh,rate:Math.min(Math.max(0,amount),vapourCap),eq:k.eq,k:k.k,source:ext.source};
 }
 let lo=0,hi=Math.min(5,geo.dryMass*mc/100),e=evaluate(0);if(!e)return null;
 if(e.eq>mc){return {mc:e.eq+(mc-e.eq)*Math.exp(-e.k),t:e.t,rh:e.rh,rate:0,eq:e.eq};}
 for(let i=0;i<22;i++){const mid=(lo+hi)/2,r=evaluate(mid);if(r&&r.rate>mid)lo=mid;else hi=mid;}
 const rate=(lo+hi)/2;e=evaluate(rate);return {...e,mc:Math.max(0,mc-rate/geo.dryMass*100),rate};
}
function solarAt(c,epoch,direction,irradiation){
 const date=new Date(epoch-3*HOUR),hour=date.getUTCHours()+.5,doy=(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())-Date.UTC(date.getUTCFullYear(),0,0))/DAY;
 const lat=c.lat*Math.PI/180,dec=.409*Math.sin(2*Math.PI*doy/365-1.39),daylight=24/Math.PI*Math.acos(clamp(-Math.tan(lat)*Math.tan(dec),-1,1)),rise=12-daylight/2;
 const x=(hour-rise)/daylight;if(x<=0||x>=1)return 0;
 return irradiation(c,epoch,direction)*1000*Math.PI/(2*daylight)*Math.sin(Math.PI*x);
}
function forecastFuture(mc,b,c,anchor,p,irradiation,weather,initialTemperature){if(mc<=Number(b.target))return {hours:0,days:0};let x=mc,temperature=initialTemperature;for(let h=0;h<24*180;h++){
 const t=anchor+h*HOUR,met=weather?.get?.(Math.floor(t/HOUR));
 const ratioDay=met&&Number.isFinite(met.solar)?irradiation(c,t,b.direction||'N')/Math.max(.1,c.parameter.ALLSKY_SFC_SW_DWN[['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][new Date(t).getUTCMonth()]]):1;
 const solar=met&&Number.isFinite(met.solar)?met.solar*ratioDay:solarAt(c,t,b.direction||'N',irradiation);
 const r=futureHour(x,b,c,t,solar,p,weather,temperature);if(!r)return {hours:null,days:null,reason:'clima indisponível'};x=r.mc;temperature=r.t;
 if(x<=Number(b.target))return {hours:h+1,days:Math.ceil((h+1)/24)};
 }return {hours:null,days:null,reason:'meta não alcançada em 180 dias no cenário'};}

// Projeção condicional: o microclima de um ciclo real é a referência, sem
// empilhar multiplicadores arbitrários de difusão, cobertura e ventilação.
function observedCycle(rows,c,weather,anchor,irradiation){
 const start=anchor-DAY,air=normalize(rows,anchor),bins=Array.from({length:24},()=>({ms:0,t:0,w:0,outT:0,outW:0,solar:0}));
 const failures=(rows||[]).filter(r=>r.valid===false&&Number.isFinite(r.epoch)).map(r=>r.epoch);
 let covered=0;
 for(let i=0;i<air.length-1;i++){
  const a=air[i],z=air[i+1],dt=z.epoch-a.epoch;
  if(dt<=0||dt>MAX_GAP||z.epoch<=start||a.epoch>=anchor||failures.some(t=>t>a.epoch&&t<z.epoch))continue;
  let left=Math.max(start,a.epoch),end=Math.min(anchor,z.epoch);
  while(left<end){const stop=Math.min(end,(Math.floor(left/HOUR)+1)*HOUR),mid=(left+stop)/2,f=(mid-a.epoch)/dt;
   const t=a.t+(z.t-a.t)*f,rh=a.rh+(z.rh-a.rh)*f,ext=outside(c,weather,mid);if(!Number.isFinite(ext.outT)||!Number.isFinite(ext.outRH)){left=stop;continue;}
   const met=weather?.get?.(Math.floor(mid/HOUR)),solar=met&&Number.isFinite(met.solar)?met.solar:(()=>{const month=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][new Date(mid).getUTCMonth()];const ratio=irradiation(c,mid,'N')/Math.max(.1,c.parameter.ALLSKY_SFC_SW_DWN[month]);return solarAt(c,mid,'N',irradiation)/Math.max(.1,ratio);})(),ms=stop-left,hour=new Date(mid-3*HOUR).getUTCHours(),b=bins[hour];
   b.ms+=ms;b.t+=t*ms;b.w+=ratio(t,rh)*ms;b.outT+=ext.outT*ms;b.outW+=ratio(ext.outT,ext.outRH)*ms;b.solar+=solar*ms;covered+=ms;left=stop;
  }
 }
 const coverage=covered/DAY;
 if(coverage<.9||bins.some(b=>b.ms<40*60000))return {valid:false,coverage,hours:covered/HOUR,reason:'Falta um ciclo diário com cobertura suficiente.'};
 return {valid:true,coverage,hours:covered/HOUR,start,end:anchor,bins:bins.map(b=>({t:b.t/b.ms,w:b.w/b.ms,outT:b.outT/b.ms,outW:b.outW/b.ms,solar:b.solar/b.ms}))};
}
function forecastObserved(mc,b,c,anchor,p,irradiation,weather,cycle){
 if(!cycle?.valid)return {hours:null,days:null,reason:'ciclo incompleto'};
 if(mc<=Number(b.target))return {hours:0,days:0};
 let x=mc;
 for(let h=0;h<24*180;h++){
  const epoch=anchor+(h+.5)*HOUR,hour=new Date(epoch-3*HOUR).getUTCHours(),base=cycle.bins[hour],ext=outside(c,weather,epoch);
  if(!Number.isFinite(ext.outT)||!Number.isFinite(ext.outRH))return {hours:null,days:null,reason:'clima indisponível'};
  const met=weather?.get?.(Math.floor(epoch/HOUR));
  // Ambos os valores são no plano horizontal; o fator diário transpõe só a diferença.
  const month=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][new Date(epoch).getUTCMonth()];
  const tiltRatio=irradiation(c,epoch,b.direction||'N')/Math.max(.1,c.parameter.ALLSKY_SFC_SW_DWN[month]);
  const futureSolar=met&&Number.isFinite(met.solar)?met.solar:solarAt(c,epoch,b.direction||'N',irradiation)/Math.max(.1,tiltRatio);
  const q=exchange(base.t,base.outT,p),loss=p.ua+1.2*1005*q/3600;
  const solarChange=(futureSolar-base.solar)*tiltRatio*M.C.area*p.solarFactor/loss;
  const t=clamp(base.t+(ext.outT-base.outT)+solarChange,0,80);
  const w=Math.max(0,base.w+ratio(ext.outT,ext.outRH)-base.outW),rh=rhFromRatio(t,w);
  const e={t,rh,...ext,observedBoundary:true,fans:fanSchedule(epoch)};
  const next=step(x,b,e,1,p);if(next.unusable)return {hours:null,days:null,reason:'condições fora do modelo'};
  x=next.mc;
  if(x<=Number(b.target))return {hours:h+1,days:Math.ceil((h+1)/24)};
 }
 return {hours:null,days:null,reason:'As condições projetadas não permitem atingir a meta no horizonte de cálculo.'};
}
function fitCalibration(b,c,rows,wood,parameters,weather){
 const valid=woodReadings(wood,b,Date.now());if(valid.length<2)return null;const first=valid[0],last=valid.at(-1);if(last.epoch-first.epoch<6*HOUR||first.mc-last.mc<.5)return null;
 const fitBatch={...b,start:new Date(first.epoch-3*HOUR).toISOString().slice(0,16),initial:first.mc};
 const pre=integrate(fitBatch,c,rows,[],{now:last.epoch,parameters,weather});if(pre.coverage<.9)return null;
 let lo=.1,hi=10;const predict=scale=>integrate(fitBatch,c,rows,[],{now:last.epoch,parameters:{...parameters,rateScale:scale},weather}).mc;
 const slow=predict(lo),fast=predict(hi);if(Math.abs(slow-fast)<.1)return {valid:false,message:'A cinética não é identificável nesse intervalo; a secagem foi limitada por calor ou renovação.'};if(last.mc>slow||last.mc<fast)return {valid:false,message:'Medições fora da faixa do modelo; revisar vazões, sensores e parâmetros.'};
 for(let i=0;i<22;i++){const mid=(lo+hi)/2;if(predict(mid)>last.mc)lo=mid;else hi=mid;}
 return {valid:true,rateScale:(lo+hi)/2,count:valid.length,start:first.epoch,end:last.epoch,scope:'ajuste na carga observada; não valida outras cargas'};
}
return {DEFAULTS,bounds,params,emc,saturation,ratio,rhFromRatio,wetBulb,kinetics,step,exchange,geometry,normalize,integrate,forecastFuture,observedCycle,forecastObserved,fitCalibration,fanSchedule,DAY,HOUR,MAX_GAP};
});
