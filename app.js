'use strict';
const KEY='estufa-laboratorio-v2',M=window.EstufaModel,P=window.EstufaPlanner,$$=id=>document.getElementById(id);
const n=(v,d=1)=>Number(v).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDate=t=>new Date(t-10800000).toISOString().slice(0,16);
const fmtDate=t=>new Date(t).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit'});
const seed=window.EstufaClimateSeed;
function go(name){abrir(name);history.replaceState(null,'','#'+name);}
let state={version:2,batches:[],selected:null,observations:[],climates:{[seed.id]:seed},telemetry:null},storageOK=true,locationChoice={id:seed.id,name:seed.name,state:seed.state,lat:seed.lat,lon:seed.lon};
let climateGeneration=0;
try{
 const raw=localStorage.getItem(KEY);
 if(raw){const s=JSON.parse(raw);if(s.version===2&&Array.isArray(s.batches)){state={...state,...s,climates:{...s.climates,[seed.id]:seed}};state.batches=state.batches.filter(b=>!M.validate(b).length);}}
 else {
 const old=JSON.parse(localStorage.getItem('estufa-laboratorio-v1')||'null');
 if(old?.version===1&&Array.isArray(old.batches)){
 state.batches=old.batches.filter(b=>!M.validate(b).length).map(b=>({...b,separator:15,direction:old.settings?.direction||'N',location:{...locationChoice}}));
 state.selected=old.selected; // Os cadastros são preservados; amostras sintéticas antigas não se tornam medições reais.
 }
 }
}catch(e){storageOK=false;}
function active(){return state.batches.find(b=>b.id===state.selected);}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){storageOK=false;}}
function say(s){$$('batch-message').textContent=s;}
function climateFor(b){return state.climates[b?.location?.id];}
function drawTimer(b,r){
 const main=$$('time-main'),sub=$$('time-caption'),meta=$$('time-meta');
 $$('time-remaining').className='arrival-clock '+(r?.status==='target'?'at-target':'');
 $$('time-meter-fill').style.width=(r?.progress||0)+'%';
 $$('time-goal').textContent=b?'META '+n(Number(b.target))+'%':'SUA PRÓXIMA CARGA';
 if(!b){main.textContent='--';sub.textContent='Cadastre a madeira para começar.';meta.textContent='Pinus elliottii · sua estufa, no seu ritmo';return;}
 meta.textContent=b.name+' · '+b.location.name+' · '+n(M.capacity(b).volume,4)+' m³';
 if(b.status==='closed'){main.textContent='Encerrado';sub.textContent='Esta fornada foi encerrada por você.';return;}
 if(r.status==='forecast'){
 main.innerHTML='<span class="days-digits">'+(r.high===0?'Hoje':r.low===r.high?r.high:r.low+'–'+r.high)+'</span><span class="days-unit">'+(r.high===0?'estimativa':r.high===1?'dia estimado':'dias estimados')+'</span>';
 sub.textContent='Janela prevista: '+fmtDate(r.earliest)+' a '+fmtDate(r.latest)+'. '+(r.initial?'Previsão inicial.':'Atualizada pela amostra.');
 }else if(r.status==='target'){main.textContent='Meta atingida';sub.textContent='A amostra atingiu a meta. Confira as demais tábuas.';}
 else if(r.status==='capacity'){main.textContent='Revisar carga';sub.textContent=r.message;}
 else if(r.status==='climate'){main.textContent='Buscando clima';sub.textContent=r.message;}
 else {main.textContent='Em atualização';sub.textContent=r.message||'Aguardando dados para calcular.';}
}
function render(){
 const b=active(),t=state.telemetry;
 const fresh=t?.status==='online',stamp=v=>new Date(v).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});
 $$('temperatura').textContent=t?.airValid?n(t.airT):'--';$$('umidade').textContent=t?.airValid?n(t.airRH):'--';
 $$('wood-temperature').textContent='--';$$('wood-moisture').textContent='--';
 $$('wood-status').textContent='Sonda de umidade a instalar';
 $$('badge').className='badge';$$('conexao').textContent=fresh?'ESTUFA CONECTADA':t?.status==='stale'?'LEITURA ANTIGA':t?.status==='loading'?'CONECTANDO':'SEM CONEXÃO';
 $$('modo').textContent=fresh?(t.test?'Teste':'Automático · 09h–18h'):'--';
 $$('hora-dispositivo').textContent=fresh?stamp(t.epoch*1000):'Aguardando leitura atual';
 $$('ultima').textContent=t?.receivedAt?'Recebida em '+stamp(t.receivedAt):'Nenhuma leitura atual recebida';
 $$('coolers').textContent=fresh?'Último comando: '+(t.coolers?'LIGADOS':'DESLIGADOS'):'Último comando: --';
 $$('coolers').nextElementSibling.textContent='O giro dos ventiladores não é monitorado.';
 $$('aviso').textContent=fresh?(t.airValid?'Temperatura e umidade do ar recebidas da estufa. Atualização a cada dois minutos.':'ESP32 conectada; sensor do ar sem leitura válida.') : t?.status==='stale'?'A última leitura tem mais de cinco minutos. Aguardando nova transmissão.':'Aguardando acesso ao receptor da estufa. Na nova conta, a conexão depende de liberar o novo endereço. O painel atual continua disponível no link acima.';
 $$('rodape-status').textContent=fresh?'LEITURA REAL · NOVAS SONDAS A INSTALAR':'AGUARDANDO LEITURA REAL';
 renderFornadaHistory();
 $$('close-batch').disabled=!b||b.status==='closed';
 $$('backup-status').textContent=storageOK?'Cadastros guardados neste navegador.':'O navegador não está guardando os cadastros. Salve uma cópia.';
 if(!b){drawTimer(null,null);$$('load-summary').textContent='Cadastre sua fornada na aba Fornada.';$$('batch-check').textContent='';$$('climate-note').textContent='O clima será escolhido automaticamente pelo local.';return;}
 const c=climateFor(b),r=P.forecast(b,c,state.observations);
 drawTimer(b,r);
 $$('load-summary').textContent=b.quantity+' tábuas de '+b.length+' × '+b.width+' × '+b.thickness+' mm · separadores de '+b.separator+' mm · início '+fmtDate(Date.parse(b.start+'-03:00'));
 const cap=M.capacity(b);
 $$('batch-check').textContent=cap.fits?'Carga dentro do arranjo de referência.':'Com estes separadores e dimensões, cabem até '+cap.max+' tábuas em '+cap.layers+' camadas. Revise a carga.';
 $$('batch-check').className=cap.fits?'muted':'notice';
 $$('climate-note').textContent=c?'Clima de '+b.location.name+' carregado automaticamente.':'Aguardando dados climáticos de '+b.location.name+'.';
 $$('source-note').textContent=c?'Temperatura, umidade e radiação: '+c.provider+' · '+c.period+'. '+(c.inmet?'Nebulosidade auxiliar: INMET, Sorocaba 83851, 1991–2020. ':'')+'Dados históricos médios, não previsão do tempo.':'Sem fonte climática disponível para este local.';
}

function renderFornadaHistory(){
 const items=[...state.batches].sort((a,b)=>(b.created||Date.parse(b.start+'-03:00'))-(a.created||Date.parse(a.start+'-03:00')));
 $$('fornada-count').textContent=items.length+' '+(items.length===1?'fornada':'fornadas');
 $$('fornada-history-body').innerHTML=items.length?items.map(v=>{
 const date=new Date(Date.parse(v.start+'-03:00')).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'2-digit'});
 return '<tr'+(v.id===state.selected?' class="selected-fornada"':'')+'><td>'+esc(date)+'</td><td class="fornada-name" title="'+esc(v.name)+'">'+esc(v.name)+'</td><td class="fornada-place">'+esc(v.location.name)+'</td><td>'+v.quantity+' · '+n(M.capacity(v).volume,4)+' m³</td><td>'+n(Number(v.target))+'%</td><td>'+(v.status==='closed'?'Encerrada':'Em andamento')+'</td><td class="fornada-actions"><button type="button" data-pick="'+esc(v.id)+'" aria-label="Ver '+esc(v.name)+' no painel">Ver</button><button type="button" data-edit="'+esc(v.id)+'" aria-label="Editar '+esc(v.name)+'">Editar</button><button type="button" data-delete="'+esc(v.id)+'" aria-label="Excluir '+esc(v.name)+'">Excluir</button></td></tr>';
 }).join(''):'<tr><td colspan="7" class="history-empty">Nenhuma fornada no histórico.</td></tr>';
 for(const x of document.querySelectorAll('[data-pick]'))x.onclick=()=>{state.selected=x.dataset.pick;save();render();go('painel');};
 for(const x of document.querySelectorAll('[data-edit]'))x.onclick=()=>edit(x.dataset.edit);
 for(const x of document.querySelectorAll('[data-delete]'))x.onclick=()=>{
 const id=x.dataset.delete,editing=$$('batch-id').value===id;
 const removed=window.FornadaStore.remove(state,id);if(!removed)return;
 if(editing)resetForm();
 save();render();
 $$('history-message').textContent='Fornada excluída do histórico: '+removed.name+'.';
 $$('undo-delete').focus();
 };
 const trash=Array.isArray(state.trash)?state.trash:[];
 $$('undo-delete').hidden=trash.length===0;
 if(trash.length)$$('undo-delete').title='Restaurar '+trash.at(-1).batch.name;
}
$$('undo-delete').onclick=()=>{
 const restored=window.FornadaStore.restore(state);if(!restored)return;
 save();render();$$('history-message').textContent='Fornada restaurada: '+restored.name+'.';
};
function resetForm(){
 $$('batch-form').reset();$$('batch-id').value='';$$('form-title').textContent='O QUE VAI ENTRAR NA ESTUFA';
 const b=active();locationChoice=b?{...b.location}:{id:seed.id,name:seed.name,state:seed.state,lat:seed.lat,lon:seed.lon};
 $$('city-query').value=locationChoice.name;$$('chosen-city').textContent=locationChoice.name+' / '+locationChoice.state;
 $$('city-results').replaceChildren();$$('b-direction').value=b?.direction||'N';
}
function edit(id){
 const b=state.batches.find(x=>x.id===id);if(!b)return;
 for(const k of ['length','width','thickness','quantity','separator','initial','target'])$$('b-'+k).value=b[k];
 $$('batch-id').value=b.id;$$('b-direction').value=b.direction||'N';locationChoice={...b.location};
 $$('city-query').value=b.location.name;$$('chosen-city').textContent=b.location.name+' / '+b.location.state;
 $$('form-title').textContent='EDITAR ESTA FORNADA';go('fornada');$$('b-length').focus();
}
async function fetchJSON(url){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
 try{const r=await fetch(url,{signal:controller.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.json();}finally{clearTimeout(timeout);}
}
async function ensureClimate(loc){
 if(P.climateValid(state.climates[loc.id]))return state.climates[loc.id];
 const generation=++climateGeneration;
 $$('chosen-city').textContent=loc.name+' / '+loc.state+' · buscando clima…';
 try{
 const u='https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DIFF,T2M,RH2M&community=RE&latitude='+encodeURIComponent(loc.lat)+'&longitude='+encodeURIComponent(loc.lon)+'&format=JSON';
 const data=await fetchJSON(u),c={...loc,provider:'NASA POWER',parameter:data.properties?.parameter,period:data.header?.range||'Climatologia mensal',retrieved:new Date().toISOString()};
 if(!P.climateValid(c))throw Error('Dados incompletos');
 state.climates[loc.id]=c;save();if(generation===climateGeneration)$$('chosen-city').textContent=loc.name+' / '+loc.state+' · clima pronto';
 render();return c;
 }catch(e){if(generation===climateGeneration)$$('chosen-city').textContent=loc.name+' / '+loc.state+' · clima temporariamente indisponível';render();return null;}
}
$$('find-city').onclick=async()=>{
 const q=$$('city-query').value.trim();if(q.length<3){$$('chosen-city').textContent='Digite pelo menos três letras.';return;}
 if(q.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()==='sorocaba'){
 locationChoice={id:seed.id,name:seed.name,state:seed.state,lat:seed.lat,lon:seed.lon};$$('chosen-city').textContent='Sorocaba / São Paulo · clima pronto';$$('city-results').replaceChildren();return;
 }
 $$('chosen-city').textContent='Procurando cidades no Brasil…';
 try{
 const data=await fetchJSON('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(q)+'&count=10&language=pt&format=json');
 const cities=(data.results||[]).filter(c=>c.country_code==='BR'&&Number.isFinite(c.latitude)&&Number.isFinite(c.longitude)&&!['AIRP','AIRF'].includes(c.feature_code));
 $$('city-results').replaceChildren();if(!cities.length){$$('chosen-city').textContent='Cidade não encontrada. Tente o nome completo.';return;}
 for(const c of cities){
 const button=document.createElement('button');button.type='button';button.textContent=c.name+' / '+(c.admin1||'Brasil');
 button.onclick=()=>{locationChoice={id:String(c.id),name:c.name,state:c.admin1||'Brasil',lat:c.latitude,lon:c.longitude};$$('city-results').replaceChildren();$$('city-query').value=c.name;ensureClimate(locationChoice);};
 $$('city-results').append(button);
 }
 $$('chosen-city').textContent='Escolha a cidade abaixo:';
 }catch(e){$$('chosen-city').textContent='Busca indisponível. Tente novamente com internet. O local confirmado foi mantido.';}
};
$$('batch-form').onsubmit=async e=>{
 e.preventDefault();
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
 if(normalize($$('city-query').value)!==normalize(locationChoice.name)){say('Clique em Buscar cidade e confirme o local antes de salvar.');return;}
 const old=state.batches.find(x=>x.id===$$('batch-id').value);
 const b={species:'pinus_elliottii',id:old?.id||crypto.randomUUID(),name:old?.name||'Pinus · '+new Date().toLocaleDateString('pt-BR'),start:old?.start||localDate(Date.now()),created:old?.created||Date.now(),status:old?.status||'open',location:{...locationChoice},direction:$$('b-direction').value};
 for(const k of ['length','width','thickness','quantity','separator','initial','target'])b[k]=Number($$('b-'+k).value);
 const errors=M.validate(b);if(errors.length){say(errors[0]);return;}
 if(old)state.batches=state.batches.map(x=>x.id===b.id?b:x);else state.batches.push(b);
 state.selected=b.id;save();render();say('Fornada salva. Acompanhe o tempo no Painel.');go('painel');
 await ensureClimate(b.location);
};
$$('start-new').onclick=()=>{resetForm();go('fornada');};
$$('timer-edit').onclick=()=>{const b=active();if(b)edit(b.id);else{resetForm();go('fornada');}};
$$('close-batch').onclick=()=>{const b=active();if(b){b.status='closed';save();render();}};
function download(name,text){const u=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);}
$$('export-simple').onclick=()=>download('minhas-cargas-estufa.json',JSON.stringify(state,null,2));
$$('import-simple').onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{
 if(f.size>3000000)throw Error('Arquivo muito grande.');
 const s=JSON.parse(await f.text());if(![1,2].includes(s.version)||!Array.isArray(s.batches)||s.batches.length>500)throw Error('Arquivo não reconhecido.');
 const newItems=s.batches.map(b=>({...b,id:crypto.randomUUID(),separator:b.separator??15,location:b.location||{id:seed.id,name:seed.name,state:seed.state,lat:seed.lat,lon:seed.lon},direction:b.direction||'N'}));
 if(newItems.some(b=>M.validate(b).length||!b.location.name||!Number.isFinite(b.location.lat)||!Number.isFinite(b.location.lon)))throw Error('Alguma carga está incompleta.');
 for(const [key,c] of Object.entries(s.climates||{}))if(P.climateValid(c))state.climates[key]=c;
 state.batches.push(...newItems);state.selected=newItems[0]?.id||state.selected;save();render();say('Cópia importada. Seus cadastros anteriores foram mantidos.');
 const b=active();if(b)await ensureClimate(b.location);
 }catch(e){say('Não foi possível abrir a cópia: '+e.message);}
 e.target.value='';
};
// Somente leituras GET. A página não envia comandos à ESP32.
state.telemetry=null;
let liveSignature='';
const live=window.EstufaLive.create(t=>{
 const signature=JSON.stringify({...t,age:undefined});state.telemetry=t;
 if(signature!==liveSignature){liveSignature=signature;render();}
});
window.addEventListener('live-refresh',()=>live.refresh());
window.addEventListener('offline',()=>live.offline());
window.addEventListener('online',()=>live.refresh());
setInterval(()=>live.tick(),1000);
live.refresh();
save();resetForm();render();
if(active())ensureClimate(active().location);
setInterval(render,60000);
