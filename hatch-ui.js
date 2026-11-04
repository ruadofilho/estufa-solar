(async()=>{
 const style=document.createElement('style');
 style.textContent=`
 .hatch-status-stack{display:flex;flex-direction:column;align-items:flex-end;gap:9px;flex-shrink:0}
 .hatch-indicator{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}
 #hatch-action{font:700 11px 'Courier New',monospace;letter-spacing:.15px;color:#433a89;background:#eeecfa;border:2px solid;border-color:#85809e #fff #fff #85809e;padding:6px 9px;white-space:nowrap}
 #hatch-confirm{min-height:28px;padding:4px 8px;font-size:11px}
 .hatch-settings{padding:3px!important;background:#d9d6ee!important;border:3px solid!important;border-color:#fff #73708d #73708d #fff!important;box-shadow:3px 3px 0 #d5ccb6;margin:0 0 22px;min-width:0}
 .hatch-settings h3{margin:0;padding:9px 11px;color:#fff;background:#433a89;font:700 13px 'Courier New',monospace;display:flex;align-items:center;gap:9px}
 .hatch-window-icon{width:14px;height:12px;border:1px solid #fff;box-shadow:inset 0 3px #b8b5e5;display:inline-block;flex-shrink:0}
 .hatch-settings-body{padding:16px;display:grid;grid-template-columns:1fr;gap:12px}
 .hatch-settings #hatch-now{font-size:17px;color:#29205f;margin-bottom:4px}
 .hatch-settings #hatch-position{font-weight:bold;color:#29205f;margin-bottom:4px}
 .hatch-settings details>div{margin-top:10px}
 .hatch-settings .hatch-buttons button{min-height:40px}
 .hatch-settings fieldset{margin:0;padding:13px;border:2px groove #faf9ff;min-width:0}
 .hatch-settings legend{padding:0 6px;font:700 12px 'Courier New',monospace;color:#433a89}
 .hatch-settings p{font-size:12px;line-height:1.6;margin:0 0 12px;color:#42445c}
 .hatch-settings .hatch-buttons{display:flex;gap:8px;flex-wrap:wrap}
 .hatch-settings button{font-size:12px;min-height:34px;padding:7px 11px;color:#302858;background:#eeedf3;border:2px solid;border-color:#fff #77738c #77738c #fff}
 .hatch-settings button:active{border-color:#77738c #fff #fff #77738c}
 .hatch-settings button[aria-pressed=true]{background:#c8d8ca;border-color:#77738c #fff #fff #77738c}
 #hatch-note{grid-column:1/-1;margin:0}
 dialog.hatch-settings{margin:auto!important;width:min(640px,calc(100% - 24px));max-height:calc(100dvh - 32px);overflow:auto;color:#26304c}
 .hatch-settings::backdrop{background:#26304c66}
 .hatch-settings h3 #hatch-close{margin-left:auto;min-height:22px;padding:0 6px}
 #hatch-manage{font-size:11px;padding:4px 8px;min-height:28px}
 #hatch-panel-reason{max-width:340px;font-size:12px;line-height:1.5;color:#4f5868;margin:0;text-align:right}.hatch-quality-guide{grid-column:1/-1;padding:10px;background:#fffbed}.hatch-quality-guide summary{font:700 12px Courier New,monospace}.hatch-quality-guide p{margin:10px 0}.hatch-explanation{grid-column:1/-1;padding:10px;background:#fffbed;border:2px groove #faf9ff}.hatch-explanation p:last-child{margin-bottom:0}
 @media(max-width:720px){.hatch-status-stack{align-items:flex-start}#hatch-panel-reason{text-align:left}.hatch-indicator{justify-content:flex-start}.hatch-settings-body{grid-template-columns:1fr;padding:12px;gap:12px}.hatch-settings .hatch-buttons button{flex:1}}
 `;
 document.head.append(style);
 const box=document.createElement('div');box.className='hatch-indicator';
 box.innerHTML='<strong role="status" id="hatch-action">CONSULTANDO ESCOTILHAS</strong><button type="button" id="hatch-manage">Ver escotilhas</button>';
 const intro=document.querySelector('#painel .intro');
 const stack=document.createElement('div');stack.className='hatch-status-stack';
 const badge=intro?.querySelector('#badge');if(badge)stack.append(badge);stack.append(box);const panelReason=document.createElement('p');panelReason.id='hatch-panel-reason';panelReason.setAttribute('role','status');stack.append(panelReason);(intro||document.body).append(stack);
 const settings=document.createElement('article');settings.className='hatch-settings';settings.setAttribute('aria-labelledby','hatch-settings-title');
 settings.innerHTML='<h3 id="hatch-settings-title"><span class="hatch-window-icon" aria-hidden="true"></span>Escotilhas</h3><div class="hatch-settings-body"><div class="hatch-explanation"><p><b>1. O que fazer agora</b></p><p id="hatch-now" role="status">Consultando…</p><p id="hatch-reason"></p></div><fieldset><legend>2. Registrar a posição real</legend><p id="hatch-position">Posição registrada: consultando…</p><p>Mova as escotilhas na estufa e registre aqui a posição em que ficaram.</p><div class="hatch-buttons"><button type="button" id="hatch-open" aria-pressed="false" disabled>Registrar abertas</button><button type="button" id="hatch-closed" aria-pressed="false" disabled>Registrar fechadas</button></div></fieldset><p id="hatch-note" role="status" hidden></p><details class="hatch-quality-guide"><summary>Avisos neste aparelho</summary><div class="hatch-buttons"><button type="button" id="hatch-push">Ativar avisos</button><button type="button" id="hatch-test">Testar aviso</button><button type="button" id="hatch-install" hidden>Instalar</button></div></details><details class="hatch-quality-guide"><summary>Histórico e critérios da orientação</summary><p id="hatch-last" hidden></p><p id="hatch-benefit"></p><p><b>Abrir:</b> renovar o ar quando o exterior consegue retirar vapor da carga, evitando umidade acumulada que pode favorecer manchas e fungos. Umidade relativa sozinha não basta: o sistema compara a quantidade de água no ar e o equilíbrio com a madeira.</p><p><b>Fechar:</b> evitar chuva, resfriamento noturno, secagem superficial excessiva ou ventilação sem benefício claro. Fechar também retém vapor: calor maior não significa madeira melhor.</p><p><b>Manter:</b> pode indicar posição adequada, benefício insuficiente, espera pelo horário ou falta de dados. Confira sempre o motivo. Os limites são iniciais; não substituem medir a umidade das tábuas e conferir rachaduras, manchas e uniformidade da pilha.</p><p><a href="https://www.pubs.ext.vt.edu/420/420-030/420-030.html" target="_blank" rel="noopener">Referência: operação de estufa solar — Virginia Tech</a></p></details></div>';
 document.querySelector('#settings-content').prepend(settings);
 const $=id=>document.getElementById('hatch-'+id);let state={},token='',installEvent;
 window.addEventListener('fabrica-authorized',e=>{token=e.detail;});
 const endpoint=window.FabricaHatchConfig?.endpoint;
 const note=text=>{ $('note').textContent=text; $('note').hidden=!text; };
 async function api(path,data){const r=await fetch(endpoint+path,{cache:'no-store',headers:data?{'Content-Type':'application/json','Authorization':'Bearer '+token}:{},...(data?{method:'POST',body:JSON.stringify(data)}:{})});if(!r.ok){if(r.status===401)token='';throw Error(r.status===401?'Senha incorreta.':'Serviço indisponível ('+r.status+').');}return r.json();}
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
   $('action').textContent=matches?'ESCOTILHAS: POSIÇÃO CONFERIDA':'ESCOTILHAS: '+title;
   $('reason').textContent=$('panel-reason').textContent=reason;
   $('position').textContent='Última posição registrada: '+position+'.';
   $('benefit').textContent=state.qualityBenefit||'';
   const last=state.lastRecommendation;
   $('last').hidden=!last;
   $('last').textContent=last?'Orientação anterior ('+new Date(last.at).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'): '+last.action+' — '+last.reason:'';
   window.FabricaHatchState=state;
   window.dispatchEvent(new CustomEvent('hatch-state',{detail:state}));
  }catch(e){
   available=false;
   $('action').textContent='ESCOTILHAS: ORIENTAÇÃO INDISPONÍVEL';
   $('now').textContent='Orientação indisponível';
   $('reason').textContent=$('panel-reason').textContent=e.message;
   if(!state.position)$('position').textContent='Última posição registrada: indisponível.';
  }finally{updateButtons();}
 }
 async function confirm(position){
  if(!available||saving||!key())return;
  saving=true;
  updateButtons();
  note('Registrando posição…');
  try{
   await api('/confirm',{position,revision:state.revision});
   await refresh();
   note(position==='ABRIR'?'Posição registrada como abertas.':'Posição registrada como fechadas.');
  }catch(e){
   await refresh();
   note(e.message);
  }finally{saving=false;updateButtons();}
 }
 $('manage').onclick=()=>document.getElementById('tab-configuracoes').click();
 $('open').onclick=()=>confirm('ABRIR');
 $('closed').onclick=()=>confirm('FECHAR');
 let registration;
 try{if('serviceWorker'in navigator)registration=await navigator.serviceWorker.register('./hatch-sw.js',{scope:'./'});}catch{note('Este navegador não permitiu ativar os avisos.');}
 $('push').onclick=async()=>{if(!endpoint){note('Avisos aguardam configuração do servidor.');return;}if(!registration||!('PushManager'in window)||!('Notification'in window)){note('Avisos indisponíveis. No iPhone, adicione à Tela de Início e abra pelo ícone. A orientação permanece no site.');return;}if(!key())return;try{await refresh();if(!state.publicKey)throw Error('Servidor sem chave de notificações.');const permission=await Notification.requestPermission();if(permission!=='granted')throw Error('Avisos não autorizados. A orientação permanece no site.');const b=atob(state.publicKey.replace(/-/g,'+').replace(/_/g,'/'));const subscription=await registration.pushManager.getSubscription()||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:Uint8Array.from(b,c=>c.charCodeAt(0))});await api('/subscribe',subscription.toJSON());note('Avisos ativados.');}catch(e){note(e.message);}};
 $('test').onclick=async()=>{if(!endpoint||!key())return;try{await api('/test',{});note('Teste agendado para daqui a 1 minuto. Feche o site para conferir no celular.');}catch(e){note(e.message);}};
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e;$('install').hidden=false;});$('install').onclick=async()=>{if(installEvent){await installEvent.prompt();installEvent=null;$('install').hidden=true;}};
 await refresh();setInterval(()=>{if(!document.hidden)refresh();},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
