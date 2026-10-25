(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.EstufaHistory=api;api.start();}})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 const base='https://estufa-api.josequiriri132.workers.dev';
 function validDay(d){return typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;}
 function decode(data,day){
  if(!validDay(day)||data?.dia!==day||!Array.isArray(data.leituras)||data.leituras.length>5000)throw Error('Histórico inválido.');
  const start=Date.parse(day+'T00:00:00-03:00')/1000,seen=new Set(),rows=[];let failures=0;
  for(const r of data.leituras){
   if(!Number.isSafeInteger(r.epoch)||r.epoch<start||r.epoch>=start+86400||![0,1].includes(r.sensor_ok))throw Error('Leitura inválida no histórico.');
   if(seen.has(r.epoch))continue;seen.add(r.epoch);
   if(!r.sensor_ok){failures++;continue;}
   if(!Number.isFinite(r.temperatura)||r.temperatura< -40||r.temperatura>85||!Number.isFinite(r.umidade)||r.umidade<0||r.umidade>100)throw Error('Valor inválido no histórico.');
   rows.push({dia:day,hora:Math.floor((r.epoch-start)/3600),t:r.temperatura,u:r.umidade,epoch:r.epoch});
  }
  return {rows:rows.sort((a,b)=>a.epoch-b.epoch),failures};
 }
 function csv(rows){return 'data_hora_Brasilia,epoch,temperatura_C,umidade_relativa_pct\n'+rows.map(r=>new Date(r.epoch*1000-10800000).toISOString().slice(0,19).replace('T',' ')+','+r.epoch+','+r.t+','+r.u).join('\n');}
 function start(){
  const el=id=>document.getElementById(id);let busy=false,downloadURL=null;
  async function json(path){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);try{const r=await fetch(base+path,{method:'GET',cache:'no-store',credentials:'omit',signal:controller.signal});if(!r.ok){const e=new Error('HTTP '+r.status);e.status=r.status;throw e;}return await r.json();}finally{clearTimeout(timeout);}}
  function clearDownload(){if(downloadURL)URL.revokeObjectURL(downloadURL);downloadURL=null;el('baixar-csv').hidden=true;el('baixar-csv').removeAttribute('href');}
  async function loadDay(day,g){
   if(!day)return;
   const data=await json('/api/historico?dia='+encodeURIComponent(day));
   const decoded=decode(data,day);if(g!==geracao)return;
   registros=decoded.rows;fonte='cloud';renderizar(agrupar(registros));clearDownload();
   if(registros.length){downloadURL=URL.createObjectURL(new Blob([csv(registros)],{type:'text/csv;charset=utf-8'}));el('baixar-csv').href=downloadURL;el('baixar-csv').download='estufa-'+day+'.csv';el('baixar-csv').hidden=false;}
   el('mensagem-csv').textContent=registros.length?registros.length+' leituras de temperatura e umidade do ar. Horário de Brasília. Atualização automática a cada dois minutos enquanto esta aba estiver aberta.':'Ainda não há leituras válidas neste dia.';
   if(decoded.failures)el('mensagem-csv').textContent+=' '+decoded.failures+' registros de falha do sensor não entram nas médias.';
  }
  function error(e,g){if(g!==geracao)return;el('mensagem-csv').textContent=([404,503].includes(e.status)?'O histórico ainda não está disponível no receptor. Após configurar o banco e publicar o novo código, as leituras começarão a aparecer.':'Não foi possível atualizar o histórico. Tente novamente. Os gráficos anteriores, se houver, foram mantidos.')+' O painel ao vivo continua independente.';}
  async function refresh(){
   if(busy)return;busy=true;const g=++geracao;el('mensagem-csv').textContent='Consultando histórico da estufa…';
   try{
    const data=await json('/api/dias');if(g!==geracao)return;
    if(!Array.isArray(data.dias)||data.dias.length>366||!data.dias.every(validDay))throw Error('Dias inválidos.');
    const days=[...new Set(data.dias)].sort().reverse(),previous=fonte==='cloud'?el('dia').value:'';
    escolherDias(days,previous);fonte='cloud';
    if(!days.length){registros=[];clearDownload();renderizar(Array(24).fill(null));el('mensagem-csv').textContent='O armazenamento está pronto. Aguardando a próxima transmissão da ESP32.';return;}
    await loadDay(el('dia').value,g);
   }catch(e){error(e,g);}finally{busy=false;}
  }
  window.addEventListener('history-day',async()=>{if(fonte==='csv'){exibirCSV();return;}const g=++geracao;clearDownload();renderizar(Array(24).fill(null));el('mensagem-csv').textContent='Carregando o dia selecionado…';try{await loadDay(el('dia').value,g);}catch(e){error(e,g);}});
  el('usar-esp').addEventListener('click',refresh);
  el('tab-historico').addEventListener('click',()=>{if(fonte!=='csv'||!registros.length)refresh();});
  el('arquivo').addEventListener('change',clearDownload);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!el('historico').hidden&&fonte==='cloud')refresh();});
  setInterval(()=>{if(!document.hidden&&!el('historico').hidden&&fonte==='cloud')refresh();},120000);
  fonte='cloud';if(!el('historico').hidden)refresh();
 }
 return {validDay,decode,csv,start};
});
