(()=>{
 const digits=document.getElementById('scene-clock-digits'),clock=document.querySelector('.scene-clock');if(!digits||!clock)return;
 const format=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function update(){const p=Object.fromEntries(format.formatToParts(new Date()).map(x=>[x.type,x.value]));
 clock.classList.toggle('clock-night',Number(p.hour)>=18||Number(p.hour)<6);
 digits.textContent=p.hour+(reduced.matches||Number(p.second)%2===0?':':' ')+p.minute;
 const label='Brasília: '+p.hour+':'+p.minute;clock.setAttribute('aria-label',label);document.getElementById('scene-clock-title').textContent=label;
 }
 update();setInterval(()=>{if(!document.hidden)update();},1000);document.addEventListener('visibilitychange',update);
})();