(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EstufaLive=api;})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 const endpoint='https://estufa-api.josequiriri132.workers.dev/api/estado';
 function valid(d){return !!d&&typeof d.sensor_ok==='boolean'&&typeof d.coolers_ligados==='boolean'&&typeof d.teste==='boolean'&&typeof d.stale==='boolean'&&Number.isFinite(d.age_seconds)&&d.age_seconds>=0&&Number.isSafeInteger(d.epoch)&&d.epoch>0&&Number.isFinite(Date.parse(d.received_at))&&(!d.sensor_ok||(Number.isFinite(d.temperatura)&&d.temperatura>=-40&&d.temperatura<=85&&Number.isFinite(d.umidade)&&d.umidade>=0&&d.umidade<=100&&Number.isFinite(d.idade_segundos)&&d.idade_segundos>=0&&d.idade_segundos<15));}
 function project(d,elapsed=0){
  if(!valid(d))return {status:'invalid',airValid:false};
  const age=d.age_seconds+Math.max(0,elapsed);
  const fresh=!d.stale&&age<=300;
  return {status:fresh?'online':'stale',airValid:fresh&&d.sensor_ok,airT:d.temperatura,airRH:d.umidade,age,coolers:d.coolers_ligados,test:d.teste,epoch:d.epoch,receivedAt:d.received_at,woodTempValid:false,woodValid:false};
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
