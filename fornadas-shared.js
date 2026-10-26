(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FornadasShared=api;})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 const empty=()=>({version:1,batches:[],selected:null,trash:[],climates:{}});
 const str=(x,max)=>typeof x==='string'&&x.length>0&&x.length<=max;
 function batch(b){
  if(!b||!str(b.id,100)||!str(b.name,80)||b.species!=='pinus_elliottii'||!['open','closed'].includes(b.status)||!['N','S','L','O'].includes(b.direction)||!str(b.start,30)||!Number.isFinite(Date.parse(b.start+'-03:00')))return false;
  for(const [k,min,max] of [['length',1,10000],['width',1,2000],['thickness',1,500],['quantity',1,10000],['initial',1,200],['target',7,30],['separator',5,100]])if(!Number.isFinite(b[k])||b[k]<min||b[k]>max)return false;
  if(!Number.isInteger(b.quantity)||b.initial<=b.target)return false;
  const l=b.location;return l&&str(l.id,100)&&str(l.name,100)&&str(l.state,100)&&Number.isFinite(l.lat)&&Math.abs(l.lat)<=90&&Number.isFinite(l.lon)&&Math.abs(l.lon)<=180;
 }
 function climate(c){
  if(!c||!Number.isFinite(c.lat)||!Number.isFinite(c.lon)||!str(c.provider,100)||!str(c.period,250)||!c.parameter)return false;
  return ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'].every(k=>{
   const p=c.parameter,g=p.ALLSKY_SFC_SW_DWN?.[k],d=p.ALLSKY_SFC_SW_DIFF?.[k],t=p.T2M?.[k],u=p.RH2M?.[k];
   return Number.isFinite(g)&&g>=0&&g<=15&&Number.isFinite(d)&&d>=0&&d<=g&&Number.isFinite(t)&&t>=-50&&t<=55&&Number.isFinite(u)&&u>=0&&u<=100;
  });
 }
 function validate(d){
  if(!d||d.version!==1||!Array.isArray(d.batches)||d.batches.length>500||!d.batches.every(batch)||!Array.isArray(d.trash)||d.trash.length>500||!d.trash.every(x=>batch(x.batch)&&Number.isSafeInteger(x.index)&&x.index>=0&&Number.isFinite(x.deletedAt)))return false;
  const ids=d.batches.map(x=>x.id),all=ids.concat(d.trash.map(x=>x.batch.id));if(new Set(all).size!==all.length)return false;
  if(d.selected!==null&&!ids.includes(d.selected))return false;
  if(!d.climates||Array.isArray(d.climates)||typeof d.climates!=='object'||Object.keys(d.climates).length>100||!Object.values(d.climates).every(climate))return false;
  return true;
 }
 function pick(state){
  const ids=new Set(state.batches.map(b=>b.location.id));
  const climates=Object.fromEntries(Object.entries(state.climates||{}).filter(([id,c])=>ids.has(id)&&climate(c)));
  return {version:1,batches:structuredClone(state.batches),selected:state.selected??null,trash:structuredClone(state.trash||[]).map(x=>({...x,observations:[]})),climates};
 }
 function create({fetcher=globalThis.fetch.bind(globalThis),now=()=>performance.now()}={}){
  const endpoint='https://estufa-api.josequiriri132.workers.dev/api/fornadas';let revision=0,clockBase=0,serverBase=null;
  async function request(path,options={}){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);try{const r=await fetcher(endpoint+path,{cache:'no-store',credentials:'omit',...options,signal:controller.signal});const d=await r.json();if(!r.ok){const e=new Error(d.error||'HTTP '+r.status);e.status=r.status;throw e;}return d;}finally{clearTimeout(timeout);}}
  function accept(d){if(!Number.isSafeInteger(d.revisao)||d.revisao<0||!validate(d.documento)||!Number.isFinite(Date.parse(d.server_time)))throw Error('Resposta de fornadas inválida');revision=d.revisao;serverBase=Date.parse(d.server_time);clockBase=now();return d;}
  async function load(){return accept(await request(''));}
  async function unlock(token){await request('/acesso',{method:'POST',headers:{Authorization:'Bearer '+token}});}
  async function save(documento,token){if(!validate(documento))throw Error('Cadastro inválido');return accept(await request('',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({revisao:revision,documento})}));}
  return {load,save,unlock,get revision(){return revision;},serverNow:()=>serverBase===null?null:serverBase+Math.max(0,now()-clockBase)};
 }
 return {empty,validate,pick,create};
});
