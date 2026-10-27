'use strict';
const KEY='estufa-laboratorio-v2',M=window.EstufaModel,P=window.EstufaPlanner,$$=id=>document.getElementById(id);
const n=(v,d=1)=>Number(v).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDate=t=>new Date(t-10800000).toISOString().slice(0,16);
const fmtDate=t=>new Date(t).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit'});
const seed=window.EstufaClimateSeed;
function go(name){abrir(name);history.replaceState(null,'','#'+name);}
let state={version:2,batches:[],selected:null,observations:[],climates:{[seed.id]:seed},telemetry:null},storageOK=true,locationChoice={id:seed.id,name:seed.name,state:seed.state,lat:seed.lat,lon:seed.lon};
let physicalRevision=0,physicalDirty=false,physicalBatch=null;
let climateGeneration=0,formMode='selected',processData={air:[],weather:new Map(),loading:false},lastProcessBatch='',modelResult=null;
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
let originalLocal=structuredClone(state);
try{const backup=JSON.parse(localStorage.getItem('estufa-local-antes-sync-v1')||'null');if(!originalLocal.batches.length&&Array.isArray(backup?.batches))originalLocal=backup;}catch{}
try{if(state.batches.length&&!localStorage.getItem('estufa-local-antes-sync-v1'))localStorage.setItem('estufa-local-antes-sync-v1',JSON.stringify(state));}catch{}
const cloud=window.FornadasShared.create();
let cloudReady=false,cloudBusy=false,cloudToken='',formRevision=0,syncStatus='Buscando a fornada compartilhada…',canonical=null,readBusy=false;
function cloudDocument(d){
 const retained=(state.observations||[]).filter(o=>o.source==='device');
 state.batches=structuredClone(d.batches);state.selected=d.selected;state.trash=structuredClone(d.trash);state.climates={...state.climates,...d.climates};
 const ids=new Set(state.batches.map(b=>b.id));
 state.observations=retained.filter(o=>ids.has(o.batch));
 for(const b of state.batches)for(const r of b.referenceReadings||[])if(r.source==='manual'&&r.valid===true&&r.calibrated===true&&Number.isFinite(r.mc)&&Number.isFinite(r.epoch))state.observations.push({...r,batch:b.id});
}
async function refreshCloud(){
 if(readBusy||cloudBusy)return;readBusy=true;
 try{const d=await cloud.load();const changed=!cloudReady||JSON.stringify(canonical)!==JSON.stringify(d.documento);canonical=structuredClone(d.documento);cloudReady=true;
  if(changed){cloudDocument(d.documento);save();if(!$$('batch-form').dataset.dirty){resetForm(formMode==='new');formRevision=cloud.revision;}const b=active();if(b){ensureClimate(b.location);if(lastProcessBatch!==b.id)refreshProcess();}}
  syncStatus=cloudToken?'Fornada sincronizada · edição liberada neste aparelho.':'Fornada sincronizada · igual nos seus aparelhos.';render();
 }catch{syncStatus='Sem acesso às fornadas compartilhadas. O cadastro local foi preservado; edição bloqueada até reconectar.';cloudReady=false;render();}
 finally{readBusy=false;render();}
}
async function changeCloud(action,expected=cloud.revision){
 if(!cloudReady||!cloudToken||cloudBusy||readBusy){say('Libere a edição e aguarde a sincronização antes de salvar.');return false;}
 if(expected!==cloud.revision){say('A fornada mudou em outro aparelho. Reabra Editar antes de salvar; seus campos atuais foram mantidos.');return false;}
 cloudBusy=true;syncStatus='Salvando nos seus aparelhos…';render();
 try{action();const d=await cloud.save(window.FornadasShared.pick(state),cloudToken);canonical=structuredClone(d.documento);cloudDocument(d.documento);save();if(active()&&lastProcessBatch!==active().id)refreshProcess();formRevision=cloud.revision;delete $$('batch-form').dataset.dirty;physicalDirty=false;physicalRevision=cloud.revision;syncStatus='Salvo na nuvem · os demais aparelhos atualizam em até 15 segundos.';return true;}
 catch(e){if(canonical)cloudDocument(canonical);if(e.status===401)cloudToken='';syncStatus=e.status===409?'Outra edição chegou primeiro. Reabra a fornada para conferir.':'Não foi possível salvar na nuvem. A alteração não foi aplicada.';say(syncStatus);return false;}
 finally{cloudBusy=false;render();}
}
function syncControls(){
 const can=cloudReady&&!!cloudToken&&!cloudBusy&&!readBusy;
 $$('sync-status').textContent=syncStatus;$$('sync-login').textContent=cloudToken?'Bloquear edição':'Liberar edição';
 $$('sync-migrate').hidden=!(cloudReady&&cloud.revision===0&&canonical?.batches.length===0&&originalLocal.batches.length);
 $$('sync-migrate').disabled=!can;
 for(const id of ['start-new','close-batch','undo-delete','import-simple'])$$ (id).disabled=!can||(id==='close-batch'&&(!active()||active().status==='closed'));
 for(const el of $$('batch-form').querySelectorAll('input,select,button'))el.disabled=!can;
 for(const el of $$('physical-parameters').querySelectorAll('input,button'))el.disabled=!can||formMode==='new'||!active();
 $$('backup-status').textContent='Fornadas guardadas na nuvem. Exportar uma cópia continua disponível.';
 for(const el of document.querySelectorAll('[data-pick],[data-edit],[data-delete]'))el.disabled=!can;
 if(!can&&$$('process-status'))$$('process-status').dataset.readonly='1';
}
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
 const upper=Number.isFinite(r.high)&&Number.isFinite(r.latest);
 main.innerHTML='<span class="days-digits">'+r.low+(!upper?' ou mais':r.low===r.high?'':'–'+r.high)+'</span><span class="days-unit">dias estimados</span>';
 sub.textContent='Calculado a partir de '+new Date(r.anchor).toLocaleString('pt-BR')+'. '+(!upper?'O cenário conservador não alcança a meta em 180 dias.':'Janela: '+fmtDate(r.earliest)+' a '+fmtDate(r.latest)+'.')+' Parâmetros de secagem provisórios.';
 }else if(r.status==='target'){main.textContent='Amostra na meta';sub.textContent=r.message;}
 else if(r.status==='estimatedTarget'){main.textContent='Conferir a madeira';sub.textContent=r.message;}
 else if(r.status==='capacity'){main.textContent='Revisar carga';sub.textContent=r.message;}
 else if(r.status==='climate'){main.textContent='Buscando clima';sub.textContent=r.message;}
 else {main.textContent=r.status==='history'?'Histórico incompleto':r.status==='stale'?'Sem atualização':r.status==='conditions'?'Rever condições':'Em atualização';sub.textContent=r.message||'Aguardando dados para calcular.';}

}
function render(){
 const b=active(),t=state.telemetry;
 const fresh=t?.status==='online',stamp=v=>new Date(v).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});
 $$('temperatura').textContent=t?.airValid?n(t.airT):'--';$$('umidade').textContent=t?.airValid?n(t.airRH):'--';
 $$('wood-temperature').textContent=t?.woodTempValid?n(t.woodTemp):'--';$$('wood-moisture').textContent=t?.woodValid?n(t.woodMC):'--';
 $$('wood-status').textContent=t?.woodValid?'Leitura da sonda calibrada':'Sem leitura direta da madeira; veja a estimativa abaixo.';
 $$('badge').className=fresh&&t.airValid?'badge online':'badge';$$('conexao').textContent=fresh?(t.airValid?'ESTUFA CONECTADA':'CONECTADA · SENSOR SEM LEITURA'):t?.status==='stale'?'LEITURA ANTIGA':t?.status==='loading'?'CONECTANDO':'SEM CONEXÃO';
 $$('modo').textContent=fresh?(t.test?'Teste':'Automático · 09h–18h'):'--';
 $$('hora-dispositivo').textContent=fresh?stamp(t.epoch*1000):'Aguardando leitura atual';
 $$('ultima').textContent=t?.receivedAt?'Recebida em '+stamp(t.receivedAt):'Nenhuma leitura atual recebida';
 $$('coolers').textContent=fresh?'Último comando: '+(t.coolers?'LIGADOS':'DESLIGADOS'):'Último comando: --';
 $$('coolers').nextElementSibling.textContent='O giro dos ventiladores não é monitorado.';
 $$('aviso').textContent=fresh?(t.airValid?'Temperatura e umidade do ar recebidas da estufa. Atualização a cada dois minutos.':'ESP32 conectada; sensor do ar sem leitura válida.') : t?.status==='stale'?'A última leitura tem mais de cinco minutos. Aguardando nova transmissão.':'Aguardando acesso ao receptor da estufa. Na nova conta, a conexão depende de liberar o novo endereço. O painel atual continua disponível no link acima.';
 $$('rodape-status').textContent=fresh?(t.airValid?'LEITURA REAL · NOVAS SONDAS A INSTALAR':'ESP32 CONECTADA · SENSOR DO AR SEM LEITURA VÁLIDA'):'AGUARDANDO LEITURA REAL';
 renderFornadaHistory();
 $$('close-batch').disabled=!b||b.status==='closed';
 syncControls();
 if(!cloudReady){$$('time-main').textContent='--';$$('time-caption').textContent='Aguardando a fornada compartilhada.';$$('time-meta').textContent='Os dados deste aparelho estão preservados.';$$('load-summary').textContent='';return;}
 if(!b){drawTimer(null,null);$$('load-summary').textContent='Cadastre sua fornada na aba Fornada.';$$('batch-check').textContent='';$$('climate-note').textContent='O clima será escolhido automaticamente pelo local.';return;}
 const c=climateFor(b),r=P.forecast(b,c,state.observations,cloud.serverNow()??Date.now(),processData);modelResult=r;renderProcess(b,r);
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
 for(const x of document.querySelectorAll('[data-pick]'))x.onclick=async()=>{if(await changeCloud(()=>{state.selected=x.dataset.pick;})){resetForm();refreshProcess();go('painel');}};
 for(const x of document.querySelectorAll('[data-edit]'))x.onclick=()=>edit(x.dataset.edit);
 for(const x of document.querySelectorAll('[data-delete]'))x.onclick=async()=>{
 const id=x.dataset.delete,editing=$$('batch-id').value===id;let removed;
 if(await changeCloud(()=>{removed=window.FornadaStore.remove(state,id);})){if(editing)resetForm();$$('history-message').textContent='Fornada excluída: '+removed.name+'. Você pode desfazer.';}
 };
 const trash=Array.isArray(state.trash)?state.trash:[];
 $$('undo-delete').hidden=trash.length===0;
 if(trash.length)$$('undo-delete').title='Restaurar '+trash.at(-1).batch.name;
}
$$('undo-delete').onclick=async()=>{
 let restored;if(await changeCloud(()=>{restored=window.FornadaStore.restore(state);})){resetForm();$$('history-message').textContent='Fornada restaurada: '+restored.name+'.';}
};
function fillForm(b){
 formRevision=cloud.revision;delete $$('batch-form').dataset.dirty;
 for(const k of ['length','width','thickness','quantity','separator','initial','target'])$$('b-'+k).value=b[k];
 $$('batch-id').value=b.id;$$('b-direction').value=b.direction||'N';locationChoice={...b.location};
 $$('city-query').value=b.location.name;$$('chosen-city').textContent=b.location.name+' / '+b.location.state;
 $$('city-results').replaceChildren();$$('form-title').textContent='DADOS DA FORNADA SALVA';
}
function resetForm(newForm=false){
 formMode=newForm?'new':'selected';formRevision=cloud.revision;delete $$('batch-form').dataset.dirty;
 const b=active();if(b&&!newForm){fillForm(b);return;}
 $$('batch-form').reset();$$('batch-id').value='';$$('form-title').textContent='CADASTRAR NOVA FORNADA';
 locationChoice=b?{...b.location}:{id:seed.id,name:seed.name,state:seed.state,lat:seed.lat,lon:seed.lon};
 $$('city-query').value=locationChoice.name;$$('chosen-city').textContent=locationChoice.name+' / '+locationChoice.state;
 $$('city-results').replaceChildren();$$('b-direction').value=b?.direction||'N';
}
function edit(id){
 const b=state.batches.find(x=>x.id===id);if(!b)return;
 formMode='edit';fillForm(b);$$('form-title').textContent='EDITAR ESTA FORNADA';go('fornada');$$('b-length').focus();
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
 state.climates[loc.id]=c;save();if(cloudReady&&cloudToken&&!canonical?.climates?.[loc.id])await changeCloud(()=>{});if(generation===climateGeneration)$$('chosen-city').textContent=loc.name+' / '+loc.state+' · clima pronto';
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
 const b={...(old||{}),species:'pinus_elliottii',id:old?.id||crypto.randomUUID(),name:old?.name||'Pinus · '+new Date().toLocaleDateString('pt-BR'),start:old?.start||localDate(cloud.serverNow()??Date.now()),created:old?.created||(cloud.serverNow()??Date.now()),status:old?.status||'open',location:{...locationChoice},direction:$$('b-direction').value};
 for(const k of ['length','width','thickness','quantity','separator','initial','target'])b[k]=Number($$('b-'+k).value);
 const errors=M.validate(b);if(errors.length){say(errors[0]);return;}
 if(await changeCloud(()=>{if(old)state.batches=state.batches.map(x=>x.id===b.id?b:x);else state.batches.push(b);state.selected=b.id;},formRevision)){
 resetForm();refreshProcess();say('Fornada salva e compartilhada.');go('painel');await ensureClimate(b.location);
 }
};
$$('start-new').onclick=()=>{resetForm(true);go('fornada');};
$$('timer-edit').onclick=()=>{const b=active();if(b)edit(b.id);else{resetForm();go('fornada');}};
$$('close-batch').onclick=async()=>{await changeCloud(()=>{const b=active();if(b)b.status='closed';});};
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
 if(!await changeCloud(()=>{state.batches.push(...newItems);state.selected=newItems[0]?.id||state.selected;}))return;resetForm();refreshProcess();say('Cópia importada e compartilhada. Seus cadastros anteriores foram mantidos.');
 const b=active();if(b)await ensureClimate(b.location);
 }catch(e){say('Não foi possível abrir a cópia: '+e.message);}
 e.target.value='';
};

function renderProcess(b,r){
 const h=r.history,el=id=>document.getElementById(id);
 el('estimated-mc').textContent=h?n(h.mc)+'%':'--';
 el('estimated-water').textContent=h?n(h.netLoss,3)+' kg':'--';
 el('equilibrium-mc').textContent=h?.last?n(h.last.eq)+'%':'--';
 const today=new Date(Date.now()-10800000).toISOString().slice(0,10),daily=h?.days?.[today];
 el('daily-water').textContent=daily?n(daily.loss-daily.gain,3)+' kg':'--';
 el('process-coverage').textContent=h?'Histórico usado: '+n(h.coveredHours,1)+' h de '+n(h.elapsedHours,1)+' h da carga. Cobertura desde a última referência: '+n(h.coverage*100,0)+'%. '+(h.anchor?'Referência: medição da madeira.':'Referência: umidade inicial informada.'):'Cadastre uma fornada.';
 el('process-source').textContent=(processData.loading?'Carregando histórico completo… ':'')+(processData.error||'')+' '+(processData.weatherError||'')+' '+(r.forecastSource||'');
 el('time-remaining').querySelector('.clock-actions small').textContent=h?.coveredHours?'Estimativa pelo histórico medido; confirme a meta na madeira.':'Cenário inicial sem histórico integrado; parâmetros provisórios.';
 el('process-status').textContent=h?'Umidade e água são estimativas do modelo nos intervalos cobertos. Água acumulada negativa indica reumidificação líquida. '+(b.calibration?'Coeficiente ajustado nesta carga; ainda requer verificação independente.':'Cinética e vazões provisórias; ajuste com medições de referência.'):'Aguardando dados.';
 const observed=h?.last;el('process-limit').textContent=observed?'Limitante na última integração: '+observed.limit+'.':'Aguardando pares de leituras para integrar a perda de água.';
 const tbody=el('daily-process');tbody.innerHTML=h?Object.entries(h.days).sort().slice(-30).map(([day,v])=>'<tr><td>'+esc(day)+'</td><td>'+n(v.hours,1)+'</td><td>'+n(v.loss,3)+'</td><td>'+n(v.gain,3)+'</td><td>'+n(v.loss-v.gain,3)+'</td></tr>').join(''):'';
 if(!tbody.innerHTML)tbody.innerHTML='<tr><td colspan="5">Sem intervalos de medição disponíveis.</td></tr>';
 el('wood-reading-time').value ||= localDate(Date.now());
 if(physicalDirty&&physicalBatch===b.id)return;
 physicalBatch=b.id;physicalDirty=false;physicalRevision=cloud.revision;
 const parameters=window.EstufaDrying.params(b.dryingParameters||{});
 for(const input of document.querySelectorAll('[data-physical]'))input.value=parameters[input.dataset.physical];
}
function refreshProcess(){const b=active();if(b){lastProcessBatch=b.id;processFeed.load(b);}}
const processFeed=window.EstufaProcess.create(data=>{processData=data;render();},fetch,( )=>cloud.serverNow()??Date.now());
window.addEventListener('process-csv-import',e=>processFeed.importRows(e.detail||[]));
document.getElementById('process-refresh').onclick=refreshProcess;
document.getElementById('physical-parameters').addEventListener('input',()=>{physicalDirty=true;physicalBatch=active()?.id;});
document.getElementById('save-physical').onclick=async()=>{const b=active();if(!b)return;try{const values={...(b.dryingParameters||{})};for(const input of document.querySelectorAll('[data-physical]')){if(!input.value.trim())throw Error('Preencha todos os parâmetros.');values[input.dataset.physical]=Number(input.value);}window.EstufaDrying.params(values);if(await changeCloud(()=>{const current=state.batches.find(x=>x.id===b.id);current.dryingParameters=values;current.calibration=null;},physicalRevision))document.getElementById('calibration-message').textContent='Parâmetros salvos e sincronizados para esta fornada.';}catch(e){document.getElementById('calibration-message').textContent=e.message;}};
document.getElementById('save-wood-reading').onclick=async()=>{const b=active();if(!b)return;const mc=Number(document.getElementById('wood-reading').value),epoch=Date.parse(document.getElementById('wood-reading-time').value+'-03:00');if(!Number.isFinite(mc)||mc<1||mc>200||!Number.isFinite(epoch)||epoch<Date.parse(b.start+'-03:00')||epoch>(cloud.serverNow()??Date.now())){document.getElementById('calibration-message').textContent='Confira a leitura e a data dentro desta fornada.';return;}const reading={source:'manual',calibrated:true,valid:true,mc,epoch};if(await changeCloud(()=>{const current=state.batches.find(x=>x.id===b.id);current.referenceReadings=[...(current.referenceReadings||[]).filter(x=>x.epoch!==epoch),reading];},physicalRevision))document.getElementById('calibration-message').textContent='Medição de referência registrada e compartilhada.';};
document.getElementById('fit-model').onclick=async()=>{const b=active();if(!b)return;const r=window.EstufaDrying.fitCalibration(b,climateFor(b),processData.air,state.observations,b.dryingParameters||{},processData.weather);if(!r?.valid){document.getElementById('calibration-message').textContent=r?.message||'São necessárias duas medições válidas, 6 h de intervalo, queda de 0,5 ponto e 90% de cobertura de ar.';return;}if(await changeCloud(()=>{const current=state.batches.find(x=>x.id===b.id);current.dryingParameters={...(current.dryingParameters||{}),rateScale:r.rateScale};current.calibration=r;},physicalRevision))document.getElementById('calibration-message').textContent='Cinética ajustada e compartilhada. Confira com medição independente.';};
// Somente leituras GET. A página não envia comandos à ESP32.
state.telemetry=null;
let liveSignature='';
const live=window.EstufaLive.create(t=>{
 const signature=JSON.stringify({...t,age:undefined});state.telemetry=t;
 if(typeof processFeed!=='undefined'&&t.status==='online'&&t.airValid){processFeed.addLive(t);const b=active();if(b&&t.woodValid&&t.woodBatch===b.id&&!state.observations.some(o=>o.source==='device'&&o.epoch===t.epoch*1000&&o.batch===b.id)){state.observations.push({batch:b.id,epoch:t.epoch*1000,source:'device',valid:true,calibrated:true,mc:t.woodMC});save();}}
 if(signature!==liveSignature){liveSignature=signature;render();}
});
window.addEventListener('live-refresh',()=>live.refresh());
window.addEventListener('offline',()=>live.offline());
window.addEventListener('online',()=>{live.refresh();refreshProcess();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshProcess();});
setInterval(()=>live.tick(),1000);
live.refresh();
save();resetForm();render();
if(active())ensureClimate(active().location);
setInterval(()=>{if(active())processFeed.refresh();},120000);
setInterval(render,60000);

$$('batch-form').addEventListener('input',()=>{$$('batch-form').dataset.dirty='1';});
$$('sync-login').onclick=()=>{if(cloudToken){if($$('batch-form').dataset.dirty||physicalDirty){say('Há alterações não salvas. Salve a fornada antes de bloquear a edição.');go('fornada');return;}cloudToken='';resetForm();syncStatus='Edição bloqueada neste aparelho.';render();return;}$$('sync-password').value='';$$('sync-auth-message').textContent='';$$('sync-auth').showModal();$$('sync-password').focus();};
$$('sync-auth-cancel').onclick=()=>{$$('sync-password').value='';$$('sync-auth').close();};
$$('sync-auth-form').onsubmit=async e=>{e.preventDefault();const token=$$('sync-password').value;$$('sync-auth-submit').disabled=true;
 try{await cloud.unlock(token);cloudToken=token;$$('sync-password').value='';$$('sync-auth').close();await refreshCloud();}
 catch(e){$$('sync-auth-message').textContent=e.status===401?'Senha incorreta.':e.status===503?'A edição ainda não foi configurada no receptor.':'Não foi possível liberar a edição. Tente novamente.';}
 finally{$$('sync-auth-submit').disabled=false;}
};
$$('sync-auth').addEventListener('close',()=>{$$('sync-password').value='';});
$$('sync-migrate').onclick=async()=>{if(cloud.revision!==0||canonical?.batches.length)return;
 if(await changeCloud(()=>{state.batches=structuredClone(originalLocal.batches);state.selected=originalLocal.selected||originalLocal.batches[0]?.id||null;state.trash=structuredClone(originalLocal.trash||[]);state.climates={...state.climates,...originalLocal.climates};})){resetForm();go('painel');say('Cadastro deste aparelho publicado. Os outros aparelhos já podem consultá-lo.');}
};
window.addEventListener('online',refreshCloud);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshCloud();});
setInterval(()=>{if(!document.hidden&&!$$('sync-auth').open)refreshCloud();},15000);
refreshCloud();
