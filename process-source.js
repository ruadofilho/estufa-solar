/* Histórico de toda a fornada, independente da aba de gráficos. Apenas GET. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EstufaProcess=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';const BASE='https://estufa-api.josequiriri132.workers.dev',DAY=86400000;
function decode(data){if(!Array.isArray(data?.leituras)||data.leituras.length>5000)throw Error('Histórico inválido');const out=[];for(const r of data.leituras){if(!Number.isSafeInteger(r.epoch)||r.epoch<=0)continue;if(r.sensor_ok!==1){out.push({epoch:r.epoch*1000,valid:false,source:'cloud'});continue;}if(!Number.isFinite(r.temperatura)||!Number.isFinite(r.umidade))continue;out.push({epoch:r.epoch*1000,t:r.temperatura,rh:r.umidade,coolers:typeof r.coolers_ligados==='boolean'?r.coolers_ligados:[0,1].includes(r.coolers_ligados)?!!r.coolers_ligados:undefined,valid:true,source:'cloud'});}return out;}
function weatherDecode(d,source){if(!d?.hourly?.time)return [];const h=d.hourly,items=[];for(let i=0;i<h.time.length;i++){const epoch=typeof h.time[i]==='number'?h.time[i]*1000:Date.parse(h.time[i]+'Z'),outT=h.temperature_2m?.[i],outRH=h.relative_humidity_2m?.[i],solar=h.shortwave_radiation?.[i];if(!Number.isFinite(epoch)||!Number.isFinite(outT)||!Number.isFinite(outRH)||outT< -40||outT>60||outRH<0||outRH>100)continue;items.push([Math.floor(epoch/3600000),{outT,outRH,solar:Number.isFinite(solar)&&solar>=0?solar:undefined,source}]);}return items;}
function create(onChange,fetcher=globalThis.fetch.bind(globalThis),now=()=>Date.now()){
 let rows=new Map(),weather=new Map(),state={loading:false,error:null,weatherError:null},generation=0,busy=false,pending=null,lastRequest=null,sealedDays=new Set();
 async function json(url){const c=new AbortController(),timer=setTimeout(()=>c.abort(),15000);try{const r=await fetcher(url,{cache:'no-store',credentials:'omit',signal:c.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.json();}finally{clearTimeout(timer);}}
 const snapshot=()=>({...state,air:[...rows.values()].sort((a,b)=>a.epoch-b.epoch),weather});
 const emit=()=>onChange(snapshot());
 function addLive(t){if(t?.status!=='online'||rows.get(t.epoch*1000)?.source==='device')return;if(t.airValid!==true){rows.set(t.epoch*1000,{epoch:t.epoch*1000,valid:false,source:'device'});emit();return;}rows.set(t.epoch*1000,{epoch:t.epoch*1000,t:t.airT,rh:t.airRH,coolers:t.coolers,woodT:t.woodTempValid?t.woodTemp:undefined,valid:true,source:'device'});emit();}
 async function load(batch){if(!batch)return;lastRequest=batch;if(busy){pending=batch;return;}busy=true;const g=++generation;state={...state,loading:true,error:null};emit();
  try{const data=await json(BASE+'/api/dias');if(!Array.isArray(data.dias))throw Error('Índice de dias inválido');const start=batch.start.slice(0,10),end=new Date(now()-3*3600000).toISOString().slice(0,10);const days=[...new Set(data.dias)].filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)&&x>=start&&x<=end&&!sealedDays.has(x)).sort();let failures=0;
   for(let i=0;i<days.length;i+=4){const group=await Promise.allSettled(days.slice(i,i+4).map(async day=>{const d=await json(BASE+'/api/historico?dia='+day);if(d.dia!==day)throw Error('Dia divergente');const decoded=decode(d);const lo=Date.parse(day+'T00:00:00-03:00');if(decoded.some(r=>r.epoch<lo||r.epoch>=lo+DAY))throw Error('Amostra fora do dia solicitado');if(day<end)sealedDays.add(day);return decoded;}));for(const r of group)if(r.status==='fulfilled'){for(const x of r.value)if(!rows.has(x.epoch))rows.set(x.epoch,x);}else failures++;}
   state.error=failures?failures+' dia(s) de histórico indisponíveis':null;
  }catch(e){state.error='Histórico remoto indisponível: '+e.message;}
  try{const loc=batch.location;if(Number.isFinite(loc?.lat)&&Number.isFinite(loc?.lon)){
   const query='latitude='+loc.lat+'&longitude='+loc.lon+'&hourly=temperature_2m,relative_humidity_2m,shortwave_radiation&timeformat=unixtime&timezone=UTC';
   const from=batch.start.slice(0,10),today=new Date(now()).toISOString().slice(0,10);
   const requests=[json('https://api.open-meteo.com/v1/forecast?'+query+'&past_days=7&forecast_days=16').then(d=>weatherDecode(d,'Open-Meteo horário (modelo meteorológico)'))];
   if(Date.parse(today)-Date.parse(from)>7*DAY)requests.push(json('https://archive-api.open-meteo.com/v1/archive?'+query+'&start_date='+from+'&end_date='+new Date(now()-7*DAY).toISOString().slice(0,10)).then(d=>weatherDecode(d,'Open-Meteo arquivo (reanálise)')));
   const results=await Promise.allSettled(requests);weather=new Map();let failed=0;for(const r of results)if(r.status==='fulfilled')for(const x of r.value)weather.set(...x);else failed++;state.weatherError=failed?'Parte da meteorologia está indisponível; períodos faltantes usam médias mensais identificadas.':null;
  }}catch(e){state.weatherError='Meteorologia horária indisponível; cenário de médias mensais externas.';}
  state.loading=false;busy=false;if(g===generation)emit();if(pending){const next=pending;pending=null;if(next!==batch)load(next);}
 }
 function importRows(input){let count=0;for(const r of input){const row={epoch:r.epoch*1000,t:r.t,rh:r.u,valid:true,source:'import'};if(Number.isFinite(row.epoch)&&Number.isFinite(row.t)&&Number.isFinite(row.rh)){if(!rows.has(row.epoch)){rows.set(row.epoch,row);count++;}}}emit();return count;}
 function resetWeather(){weather=new Map();}
 return {load,addLive,importRows,snapshot,resetWeather,refresh:()=>lastRequest&&load(lastRequest)};
}
return {decode,weatherDecode,create};
});
