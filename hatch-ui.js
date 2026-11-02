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
 .hatch-settings-body{padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:16px}
 .hatch-settings fieldset{margin:0;padding:13px;border:2px groove #faf9ff;min-width:0}
 .hatch-settings legend{padding:0 6px;font:700 12px 'Courier New',monospace;color:#433a89}
 .hatch-settings p{font-size:12px;line-height:1.6;margin:0 0 12px;color:#42445c}
 .hatch-settings .hatch-buttons{display:flex;gap:8px;flex-wrap:wrap}
 .hatch-settings button{font-size:12px;min-height:34px;padding:7px 11px;color:#302858;background:#eeedf3;border:2px solid;border-color:#fff #77738c #77738c #fff}
 .hatch-settings button:active{border-color:#77738c #fff #fff #77738c}
 .hatch-settings button[aria-pressed=true]{background:#c8d8ca;border-color:#77738c #fff #fff #77738c}
 #hatch-note{grid-column:1/-1;background:#eeecfa;border:2px solid;border-color:#85809e #fff #fff #85809e;padding:8px 10px;margin:0;min-height:34px}
 @media(max-width:720px){.hatch-status-stack{align-items:flex-start}.hatch-indicator{justify-content:flex-start}.hatch-settings-body{grid-template-columns:1fr;padding:12px;gap:12px}.hatch-settings .hatch-buttons button{flex:1}}
 `;
 document.head.append(style);
 const box=document.createElement('div');box.className='hatch-indicator';
 box.innerHTML='<strong role="status" id="hatch-action">ESCOTILHAS: MANTER</strong><button type="button" id="hatch-confirm" hidden>Confirmar execução</button>';
 const intro=document.querySelector('#painel .intro');
 const stack=document.createElement('div');stack.className='hatch-status-stack';
 const badge=intro?.querySelector('#badge');if(badge)stack.append(badge);stack.append(box);(intro||document.body).append(stack);
 const settings=document.createElement('article');settings.className='hatch-settings';settings.setAttribute('aria-labelledby','hatch-settings-title');
 settings.innerHTML='<h3 id="hatch-settings-title"><span class="hatch-window-icon" aria-hidden="true"></span>Escotilhas e avisos</h3><div class="hatch-settings-body"><fieldset><legend>Posição das escotilhas</legend><p>Confirme a posição real após o ajuste manual.</p><div class="hatch-buttons"><button type="button" id="hatch-open" aria-pressed="false">Abertas</button><button type="button" id="hatch-closed" aria-pressed="false">Fechadas</button></div></fieldset><fieldset><legend>Avisos neste aparelho</legend><p>Receba a orientação quando precisar intervir.</p><div class="hatch-buttons"><button type="button" id="hatch-push">Ativar avisos</button><button type="button" id="hatch-test">Testar aviso</button><button type="button" id="hatch-install" hidden>Instalar</button></div></fieldset><p id="hatch-note" role="status" aria-live="polite"></p></div>';
 (document.querySelector('#settings-content')||document.querySelector('#configuracoes')||document.body).prepend(settings);
 const $=id=>document.getElementById('hatch-'+id);let state={},token='',installEvent;
 const endpoint=window.FabricaHatchConfig?.endpoint;
 const note=text=>$('note').textContent=text;
 async function api(path,data){const r=await fetch(endpoint+path,{cache:'no-store',headers:data?{'Content-Type':'application/json','Authorization':'Bearer '+token}:{},...(data?{method:'POST',body:JSON.stringify(data)}:{})});if(!r.ok)throw Error(r.status===401?'Chave de operação inválida.':'Serviço indisponível ('+r.status+').');return r.json();}
 function key(){if(!token)token=prompt('Chave de operação das escotilhas (somente nesta sessão):')||'';return !!token;}
 async function refresh(){if(!endpoint){note('Monitoramento das escotilhas aguarda configuração do servidor.');return;}try{state=await api('/status');$('action').textContent='ESCOTILHAS: '+state.action;$('confirm').hidden=state.action==='MANTER'||state.position===state.action;$('open').setAttribute('aria-pressed',String(state.position==='ABRIR'));$('closed').setAttribute('aria-pressed',String(state.position==='FECHAR'));note(state.position?'Última posição confirmada: '+(state.position==='ABRIR'?'abertas':'fechadas')+'.':'Confirme a posição atual das escotilhas.');}catch(e){$('action').textContent='ESCOTILHAS: MANTER';$('confirm').hidden=true;note(e.message);}}
 async function confirm(position){if(!endpoint||!key())return;try{await api('/confirm',{position,revision:state.revision});await refresh();}catch(e){note(e.message);await refresh();}}
 $('confirm').onclick=()=>confirm(state.action);$('open').onclick=()=>confirm('ABRIR');$('closed').onclick=()=>confirm('FECHAR');
 let registration;
 try{if('serviceWorker'in navigator)registration=await navigator.serviceWorker.register('./hatch-sw.js',{scope:'./'});}catch{note('Este navegador não permitiu ativar os avisos.');}
 $('push').onclick=async()=>{if(!endpoint){note('Avisos aguardam configuração do servidor.');return;}if(!registration||!('PushManager'in window)||!('Notification'in window)){note('Avisos indisponíveis. No iPhone, adicione à Tela de Início e abra pelo ícone. A orientação permanece no site.');return;}if(!key())return;try{await refresh();if(!state.publicKey)throw Error('Servidor sem chave de notificações.');const permission=await Notification.requestPermission();if(permission!=='granted')throw Error('Avisos não autorizados. A orientação permanece no site.');const b=atob(state.publicKey.replace(/-/g,'+').replace(/_/g,'/'));const subscription=await registration.pushManager.getSubscription()||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:Uint8Array.from(b,c=>c.charCodeAt(0))});await api('/subscribe',subscription.toJSON());note('Avisos ativados.');}catch(e){note(e.message);}};
 $('test').onclick=async()=>{if(!endpoint||!key())return;try{await api('/test',{});note('Teste agendado para daqui a 1 minuto. Feche o site para conferir no celular.');}catch(e){note(e.message);}};
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e;$('install').hidden=false;});$('install').onclick=async()=>{if(installEvent){await installEvent.prompt();installEvent=null;$('install').hidden=true;}};
 await refresh();setInterval(()=>{if(!document.hidden)refresh();},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
