(async()=>{
 const style=document.createElement('style');
 style.textContent=`
 .hatch-status-stack{display:flex;flex-direction:column;align-items:flex-end;gap:9px;flex-shrink:0}
 .hatch-indicator{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}
 #hatch-action{font:700 11px 'Courier New',monospace;letter-spacing:.15px;color:#285541;background:#eef4e8;border:2px solid;border-color:#819684 #fff #fff #819684;padding:6px 9px;white-space:nowrap}
 #hatch-confirm{min-height:28px;padding:4px 8px;font-size:11px}
 .hatch-settings{padding:3px!important;background:#dae7d6!important;border:3px solid!important;border-color:#fff #718573 #718573 #fff!important;box-shadow:3px 3px 0 #d5ccb6;margin:0 0 22px;min-width:0}
 .hatch-settings h3{margin:0;padding:9px 11px;color:#fff;background:#285541;font:700 13px 'Courier New',monospace;display:flex;align-items:center;gap:9px}
 .hatch-window-icon{width:14px;height:12px;border:1px solid #fff;box-shadow:inset 0 3px #b1c9ab;display:inline-block;flex-shrink:0}
 .hatch-settings-body{padding:16px;display:grid;grid-template-columns:1fr;gap:12px}
 .hatch-settings #hatch-now{font-size:17px;color:#214330;margin-bottom:4px}
 .hatch-settings #hatch-position{font-weight:bold;color:#214330;margin-bottom:4px}
 .hatch-settings details>div{margin-top:10px}
 .hatch-settings .hatch-buttons button{min-height:40px}
 .hatch-settings fieldset{margin:0;padding:13px;border:2px groove #f8fbf4;min-width:0}
 .hatch-settings legend{padding:0 6px;font:700 12px 'Courier New',monospace;color:#285541}
 .hatch-settings p{font-size:12px;line-height:1.6;margin:0 0 12px;color:#3e5547}
 .hatch-settings .hatch-buttons{display:flex;gap:8px;flex-wrap:wrap}
 .hatch-settings button{font-size:12px;min-height:34px;padding:7px 11px;color:#254232;background:#edf3e9;border:2px solid;border-color:#fff #728877 #728877 #fff}
 .hatch-settings button:active{border-color:#728877 #fff #fff #728877}
 .hatch-settings button[aria-pressed=true]{background:#c8d8ca;border-color:#728877 #fff #fff #728877}
 #hatch-note{grid-column:1/-1;margin:0}
 dialog.hatch-settings{margin:auto!important;width:min(640px,calc(100% - 24px));max-height:calc(100dvh - 32px);overflow:auto;color:#233c30}
 .hatch-settings::backdrop{background:#233c3066}
 .hatch-settings h3 #hatch-close{margin-left:auto;min-height:22px;padding:0 6px}
 #hatch-manage{font-size:11px;padding:4px 8px;min-height:28px}
 #hatch-panel-reason{max-width:340px;font-size:12px;line-height:1.5;color:#4f5868;margin:0;text-align:right}.hatch-quality-guide{grid-column:1/-1;padding:10px;background:#fffbed}.hatch-quality-guide summary{font:700 12px Courier New,monospace}.hatch-quality-guide p{margin:10px 0}.hatch-explanation{grid-column:1/-1;padding:10px;background:#fffbed;border:2px groove #f8fbf4}.hatch-explanation p:last-child{margin-bottom:0}
 .hatch-check{margin-top:16px}
 .hatch-check #hatch-result{font-size:18px;font-weight:bold;margin-bottom:5px}
 .hatch-check #hatch-check{background:#285541;color:white;font-weight:bold}
 .hatch-check p:last-child{margin-bottom:0}
 @media(max-width:720px){.hatch-status-stack{align-items:flex-start}#hatch-panel-reason{text-align:left}.hatch-indicator{justify-content:flex-start}.hatch-settings-body{grid-template-columns:1fr;padding:12px;gap:12px}.hatch-settings .hatch-buttons button{flex:1}}
 `;
 document.head.append(style);
 const check=document.createElement('section');
 check.className='hatch-settings hatch-check';
 check.setAttribute('aria-labelledby','hatch-check-title');
 check.innerHTML=`
  <h3 id="hatch-check-title">Escotilhas · decisão de agora</h3>
  <div class="hatch-settings-body">
   <div class="hatch-buttons">
    <button type="button" id="hatch-check" disabled>Verificar agora</button>
   </div>
   <div class="hatch-explanation" aria-live="polite" aria-atomic="true">
    <p id="hatch-result"><b>Consulte antes de abrir ou fechar.</b></p>
    <p id="hatch-drying" hidden></p>
    <p id="hatch-opening" hidden></p>
    <p id="hatch-calculation">O cálculo usa as leituras recentes dos dois sensores e a previsão de chuva.</p>
   </div>
   <p>Consulte quando o tempo mudar ou antes de mexer nas escotilhas. Os avisos automáticos têm horários próprios. O ajuste é manual.</p>
  </div>`;

 const settings=document.createElement('article');settings.className='hatch-settings';settings.setAttribute('aria-labelledby','hatch-settings-title');
 settings.innerHTML='<h3 id="hatch-settings-title"><span class="hatch-window-icon" aria-hidden="true"></span>Escotilhas</h3><div class="hatch-settings-body"><div class="hatch-explanation"><p><b>Orientação dos avisos automáticos</b></p><p id="hatch-now" role="status">Consultando…</p><p id="hatch-reason"></p></div><fieldset><legend>Registrar a posição real</legend><p id="hatch-position">Posição registrada: consultando…</p><p>Mova as escotilhas na estufa e registre aqui a posição em que ficaram.</p><div class="hatch-buttons"><button type="button" id="hatch-open" aria-pressed="false" disabled>Registrar abertas</button><button type="button" id="hatch-closed" aria-pressed="false" disabled>Registrar fechadas</button></div></fieldset><p id="hatch-note" role="status" hidden></p><details class="hatch-quality-guide"><summary>Avisos neste aparelho</summary><div class="hatch-buttons"><button type="button" id="hatch-push">Ativar avisos</button><button type="button" id="hatch-test">Testar aviso</button><button type="button" id="hatch-install" hidden>Instalar</button></div></details><details class="hatch-quality-guide"><summary>Histórico e critérios da orientação</summary><p id="hatch-last" hidden></p><p id="hatch-benefit"></p><p><b>Abrir:</b> renovar o ar quando o exterior consegue retirar vapor da carga, evitando umidade acumulada que pode favorecer manchas e fungos. Umidade relativa sozinha não basta: o sistema compara a quantidade de água no ar e o equilíbrio com a madeira.</p><p><b>Fechar:</b> evitar chuva, resfriamento noturno, secagem superficial excessiva ou ventilação sem benefício claro. Fechar também retém vapor: calor maior não significa madeira melhor.</p><p><b>Manter:</b> pode indicar posição adequada, benefício insuficiente, espera pelo horário ou falta de dados. Confira sempre o motivo. Os limites são iniciais; não substituem medir a umidade das tábuas e conferir rachaduras, manchas e uniformidade da pilha.</p><p><a href="https://www.pubs.ext.vt.edu/420/420-030/420-030.html" target="_blank" rel="noopener">Referência: operação de estufa solar — Virginia Tech</a></p></details></div>';
 document.querySelector('#settings-content').prepend(check,settings);
 const $=id=>document.getElementById('hatch-'+id);let state={},token='',installEvent;
 window.addEventListener('fabrica-authorized',e=>{token=e.detail;});
 const endpoint=window.FabricaHatchConfig?.endpoint;
 $('check').disabled=!endpoint;
 const note=text=>{ $('note').textContent=text; $('note').hidden=!text; };
 async function api(path,data){const r=await fetch(endpoint+path,{cache:'no-store',headers:data?{'Content-Type':'application/json','Authorization':'Bearer '+token}:{},...(data?{method:'POST',body:JSON.stringify(data)}:{})});if(!r.ok){if(r.status===409)throw Error('A orientação mudou. Confira a posição e tente registrar novamente.');if(r.status===401)token='';throw Error(r.status===401?'Senha incorreta.':'Serviço indisponível ('+r.status+').');}return r.json();}
 function key(){if(!token)token=prompt('Senha de Configurações:')||'';return !!token;}
 let saving=false, available=false;
 function updateButtons(){
  for(const [id,position] of [['open','ABRIR'],['closed','FECHAR']]){
   $(id).disabled=saving||!available;
   $(id).setAttribute('aria-pressed',String(state.position===position));
  }
 }
 async function refresh(){
  try{
   if(!endpoint)throw Error('Serviço ainda não configurado.');
   state=await api('/status');
   available=true;
   const position=state.position==='ABRIR'?'Abertas':state.position==='FECHAR'?'Fechadas':'Ainda sem registro';
   const action=state.action;
   const change=action==='ABRIR'||action==='FECHAR';
   const matches=change&&action===state.position;
   const title=matches?'Posição já registrada conforme a orientação':action==='ABRIR'?'Abra as escotilhas':action==='FECHAR'?'Feche as escotilhas':action==='MANTER'?'Nenhum ajuste indicado agora':'Orientação indisponível';
   const reason=state.reason?.startsWith('Entre horários de intervenção')?'O painel está entre os horários programados de orientação.':state.reason||'Aguardando a próxima análise.';
   $('now').textContent=title;
   $('reason').textContent=reason;
   $('position').textContent='Última posição registrada: '+position+'.';
   $('benefit').textContent=state.qualityBenefit||'';
   const last=state.lastRecommendation;
   $('last').hidden=!last;
   $('last').textContent=last?'Orientação anterior ('+new Date(last.at).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'): '+last.action+' — '+last.reason:'';
   window.FabricaHatchState=state;
   window.dispatchEvent(new CustomEvent('hatch-state',{detail:state}));
  }catch(e){
   available=false;
   $('now').textContent='Orientação indisponível';
   $('reason').textContent=e.message;
   if(!state.position)$('position').textContent='Última posição registrada: indisponível.';
  }finally{updateButtons();}
 }
 async function confirm(position){
  if(!available||saving)return;
  saving=true;
  updateButtons();
  note('Registrando posição…');
  try{
   await api('/confirm',{position,revision:state.revision});
   await refresh();
   clearTimeout(checkExpiry);
   $('result').textContent='Posição atualizada. Verifique novamente quando precisar.';
   $('calculation').textContent='';
   clearExplanation();
   note(position==='ABRIR'?'Posição registrada como abertas.':'Posição registrada como fechadas.');
  }catch(e){
   await refresh();
   note(e.message);
  }finally{saving=false;updateButtons();}
 }
 let checkExpiry;
 function explainDrying(metrics,readings){
  const measured=(Array.isArray(readings)?readings:[])
   .filter(r=>r?.meter==='Extech MO230'&&r.valid===true&&Number.isFinite(r.mc)&&Number.isFinite(r.epoch))
   .sort((a,b)=>b.epoch-a.epoch);
  const latest=measured[0];
  const previous=latest?.woodGroup&&measured.find(r=>r.epoch<latest.epoch&&r.woodGroup===latest.woodGroup);
  const equilibrium=Number.isFinite(metrics.insideEMC)?metrics.insideEMC:null;
  let drying='Mesmo fechada, a estufa pode secar a madeira. O calor ajuda a retirar água das tábuas enquanto o ar interno estiver mais seco que o necessário para mantê-las na umidade atual.';
  if(equilibrium!==null){
   drying='Mesmo fechada, a estufa pode secar a madeira. Com o ar interno medido, as tábuas tenderiam a '+number.format(equilibrium)+'% se essas condições persistissem.';
   if(latest){
    const tendency=latest.mc>equilibrium?'O ar interno favorece a secagem.':latest.mc<equilibrium?'O ar interno pode favorecer a reabsorção de umidade.':'A última medição está no nível de equilíbrio estimado.';
    drying+=' A última medição do lote com o Extech foi '+number.format(latest.mc)+'%. '+tendency;
   }else drying+=' Para saber se o lote está secando, compare esse valor com uma medição do Extech.';
  }
  if(previous){
   const change=latest.mc-previous.mc;
   drying+=change<0?' Nas duas últimas leituras comparáveis, a umidade medida caiu '+number.format(-change)+' ponto(s) percentual(is).':change>0?' Nas duas últimas leituras comparáveis, a umidade medida subiu '+number.format(change)+' ponto(s) percentual(is).':' As duas últimas leituras comparáveis deram o mesmo valor.';
  }
  const incoming=number.format(metrics.incomingEMC);
  const exchange=metrics.insideAH>metrics.outsideAH?'O ar externo tem menos vapor e pode ajudar a retirar água da estufa. ':'Nesta consulta, o ar externo não tem menos vapor que o interno. ';
  const opening=exchange+'Ao entrar e aquecer, esse ar levaria a madeira a tender a '+incoming+'% de umidade. '+(metrics.incomingEMC<8?'Esse valor está abaixo do mínimo de 8% usado na regra de abertura. O ar muito seco pode fazer a superfície perder água mais rápido que o interior, aumentando o risco de rachaduras e empenamento.':'Esse valor descreve o potencial de secagem. A recomendação também depende da persistência das condições e da previsão de chuva.');
  return {drying,opening};
 }
 function clearExplanation(){
  for(const id of ['drying','opening']){$(id).hidden=true;$(id).textContent='';}
 }
 const number=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1});
 const time=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'});
 $('check').onclick=async()=>{
  clearTimeout(checkExpiry);
  $('check').disabled=true;
  $('result').textContent='Calculando…';
  clearExplanation();
  $('calculation').textContent='';
  try{
   const result=await api('/avaliar');
   const m=result.metrics;
   if(!m||![m.insideAH,m.outsideAH,m.incomingEMC].every(Number.isFinite)){
    $('result').textContent='Sem indicação segura para mudar a posição.';
    $('calculation').textContent=result.reason||'Aguardando leituras válidas.';
    return;
   }
   const position=result.position;
   const title=result.action==='ABRIR'?'Abra as escotilhas':result.action==='FECHAR'?'Feche as escotilhas':position==='ABRIR'?'Mantenha abertas':position==='FECHAR'?'Mantenha fechadas':'Nenhuma mudança indicada. Confira a posição na estufa.';
   const reason=result.action==='MANTER'&&result.reason==='Sem benefício significativo para alterar.'&&m.incomingEMC<8
    ?'O ar externo aquecido ficou abaixo do limite usado para abrir.':result.reason;
   $('result').textContent=title+'. '+reason;
   const lot=typeof active==='function'&&window.configLiberada?active():null;
   const explanation=explainDrying(m,lot?.referenceReadings);
   for(const id of ['drying','opening']){$(id).textContent=explanation[id];$(id).hidden=false;}
   const delta=m.insideAH-m.outsideAH;
   $('calculation').textContent='Leituras usadas: '+number.format(m.insideAH)+' g/m³ dentro − '+number.format(m.outsideAH)+' g/m³ fora = '+number.format(delta)+' g/m³. Equilíbrio estimado com o ar externo aquecido: '+number.format(m.incomingEMC)+'%. Amostra '+time.format(result.sampleAt)+' · cálculo '+time.format(result.at)+'.';
   checkExpiry=setTimeout(()=>{
    $('result').textContent='A orientação anterior expirou. Verifique de novo.';
    clearExplanation();
    $('calculation').textContent='';
   },300000);
  }catch{
   $('result').textContent='Não foi possível calcular agora.';
   $('calculation').textContent='Tente novamente em alguns minutos.';
  }finally{$('check').disabled=false;}
 };
 $('open').onclick=()=>confirm('ABRIR');
 $('closed').onclick=()=>confirm('FECHAR');
 let registration;
 try{if('serviceWorker'in navigator)registration=await navigator.serviceWorker.register('./hatch-sw.js',{scope:'./'});}catch{note('Este navegador não permitiu ativar os avisos.');}
 $('push').onclick=async()=>{if(!endpoint){note('Avisos aguardam configuração do servidor.');return;}if(!registration||!('PushManager'in window)||!('Notification'in window)){note('Avisos indisponíveis. No iPhone, adicione à Tela de Início e abra pelo ícone. A orientação permanece no site.');return;}if(!key())return;try{await refresh();if(!state.publicKey)throw Error('Servidor sem chave de notificações.');const permission=await Notification.requestPermission();if(permission!=='granted')throw Error('Avisos não autorizados. A orientação permanece no site.');const b=atob(state.publicKey.replace(/-/g,'+').replace(/_/g,'/'));const subscription=await registration.pushManager.getSubscription()||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:Uint8Array.from(b,c=>c.charCodeAt(0))});await api('/subscribe',subscription.toJSON());note('Avisos ativados.');}catch(e){note(e.message);}};
 $('test').onclick=async()=>{if(!endpoint||!key())return;try{await api('/test',{});note('Teste agendado para daqui a 1 minuto. Feche o site para conferir no celular.');}catch(e){note(e.message);}};
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e;$('install').hidden=false;});$('install').onclick=async()=>{if(installEvent){await installEvent.prompt();installEvent=null;$('install').hidden=true;}};
 await refresh();setInterval(()=>{if(!document.hidden)refresh();},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
