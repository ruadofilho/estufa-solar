(()=>{
 const digits=document.getElementById('scene-clock-digits'),clock=document.querySelector('.scene-clock');if(!digits||!clock)return;
 const format=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 const hours=document.getElementById('scene-clock-hours'),minutes=document.getElementById('scene-clock-minutes'),colon=document.getElementById('scene-clock-colon');
 function update(){const p=Object.fromEntries(format.formatToParts(new Date()).map(x=>[x.type,x.value]));
 clock.classList.toggle('clock-night',Number(p.hour)>=18||Number(p.hour)<6);
 if(hours&&minutes&&colon){hours.textContent=p.hour;minutes.textContent=p.minute;colon.style.opacity=Number(p.second)%2===0?'1':'0';}else{digits.textContent=p.hour+(Number(p.second)%2===0?':':' ')+p.minute;}
 const label='Brasília: '+p.hour+':'+p.minute;clock.setAttribute('aria-label',label);document.getElementById('scene-clock-title').textContent=label;
 }
 update();setInterval(()=>{if(!document.hidden)update();},1000);document.addEventListener('visibilitychange',update);
})();