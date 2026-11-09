(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EstufaLive=api;})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 const endpoint='https://estufa-api.josequiriri132.workers.dev/api/estado';
 function valid(d){return !!d&&typeof d.sensor_ok==='boolean'&&typeof d.coolers_ligados==='boolean'&&typeof d.teste==='boolean'&&typeof d.stale==='boolean'&&Number.isFinite(d.age_seconds)&&d.age_seconds>=0&&Number.isSafeInteger(d.epoch)&&d.epoch>0&&Number.isFinite(Date.parse(d.received_at))&&(!d.sensor_ok||(Number.isFinite(d.temperatura)&&d.temperatura>=-40&&d.temperatura<=85&&Number.isFinite(d.umidade)&&d.umidade>=0&&d.umidade<=100&&Number.isFinite(d.idade_segundos)&&d.idade_segundos>=0&&d.idade_segundos<15));}
 function project(d,elapsed=0){
  if(!valid(d))return {status:'invalid',airValid:false};
  const age=d.age_seconds+Math.max(0,elapsed);
  const fresh=!d.stale&&age<=300;
  const externalValid=fresh&&d.externo_ok===true&&
   Number.isFinite(d.externo_t)&&d.externo_t>=-40&&d.externo_t<=85&&
   Number.isFinite(d.externo_ur)&&d.externo_ur>=0&&d.externo_ur<=100;
  const restartId=typeof d.restart_id==='string'&&/^[0-9a-f]{32}$/.test(d.restart_id)?d.restart_id:null;
  return {restartId,stateOnly:d.state_only===true,externalValid,externalT:d.externo_t,externalRH:d.externo_ur,status:fresh?'online':'stale',airValid:fresh&&d.sensor_ok,airT:d.temperatura,airRH:d.umidade,age,coolers:d.coolers_ligados,coolerMode:['on','off','auto'].includes(d.cooler_mode)?d.cooler_mode:null,coolerCommandId:typeof d.cooler_command_id==='string'?d.cooler_command_id:null,test:d.teste,epoch:d.epoch,receivedAt:d.received_at,woodTempValid:fresh&&d.wood_temperature_valid===true&&Number.isFinite(d.wood_temperature)&&d.wood_temperature>=0&&d.wood_temperature<=80,woodTemp:d.wood_temperature,woodValid:fresh&&d.wood_calibrated===true&&Number.isFinite(d.wood_moisture)&&d.wood_moisture>=1&&d.wood_moisture<=200,woodMC:d.wood_moisture,woodBatch:d.batch_id};
 }
 function create(onChange,fetcher=globalThis.fetch.bind(globalThis),clock=()=>performance.now()){
  let packet=null,received=0,busy=false,failed=false;
  const snapshot=()=>failed?{status:'unavailable',airValid:false}:packet?project(packet,(clock()-received)/1000):{status:'loading',airValid:false};
  function emit(){onChange(snapshot());}
  async function refresh(){
   if(busy)return;busy=true;const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
   try{const r=await fetcher(endpoint,{method:'GET',cache:'no-store',credentials:'omit',signal:controller.signal});if(!r.ok)throw Error('HTTP '+r.status);const d=await r.json();if(!valid(d))throw Error('Resposta inválida');packet=d;received=clock();failed=false;}
   catch(e){failed=true;}
   finally{clearTimeout(timeout);busy=false;emit();}
  }
  function offline(){failed=true;emit();}
  return {refresh,tick:emit,offline,snapshot};
 }
 return {endpoint,valid,project,create};
});
