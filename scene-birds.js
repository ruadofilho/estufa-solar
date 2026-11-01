/* Pixel neighbours, animated locally using Brasilia's clock. */
(()=>{
 'use strict';
 const svg=document.querySelector('.mission-art svg');if(!svg)return;
 const ns='http://www.w3.org/2000/svg',layer=document.createElementNS(ns,'g');layer.id='scene-birds';
 layer.innerHTML=`<title>Uma corujinha no topo da estufa à noite</title>
 <g id="scene-owl" role="img" aria-label="Corujinha no topo da estufa">
 <path d="M-9-19v-7l6 4h6l6-4v7l3 4v12H-12v-12z" fill="#b98eac"/><path d="M-8-17h16v15H-8z" fill="#edcebf"/><path d="M-12-12h4v10h-4zM8-12h4v10H8z" fill="#8c709e"/>
 <g class="owl-eyes"><path d="M-8-17h6v6h-6zM2-17h6v6H2z" fill="#fff4d8"/><path d="M-6-16h2v4h-2zM4-16h2v4H4z" fill="#344057"/></g>
 <path class="owl-closed" d="M-8-14h6v2h-6zM2-14h6v2H2z" fill="#344057"/><path d="M-2-10h4l-2 4z" fill="#efb86c"/><path d="M-6-1h4v3h-4zM2-1h4v3H2z" fill="#efb86c"/>
 <path class="owl-flying" d="M-11-16l-16-8v7l16 13zM11-16l16-8v7L11-4z" fill="#b98eac"/>
 </g>
`;
 svg.appendChild(layer);
 const owl=layer.querySelector('#scene-owl');
 const eyes=layer.querySelector('.owl-eyes'),closed=layer.querySelector('.owl-closed'),owlWings=layer.querySelector('.owl-flying');
 let wasNight=false,arrival=0;
 function render(){
  const now=Date.now();let rise=Number(svg.dataset.sunrise),set=Number(svg.dataset.sunset);
  const preview=['127.0.0.1','localhost'].includes(location.hostname)?new URLSearchParams(location.search).get('aves'):null;
  if(preview==='noite'){rise=now-12*3600000;set=now-3600000;}
  if(preview==='dia'){rise=now-3600000;set=now+3600000;}
  if(preview==='partida'){rise=now-((now/1000)%10)*1000;set=now+3600000;}
  if(!rise||!set){owl.style.display='none';return;}
  const night=now<rise||now>=set,leaving=!night&&now-rise<8000;
  if(night&&!wasNight)arrival=now;
  wasNight=night;
  const arriving=night&&now-arrival<8000;
  owl.style.display=night||leaving?'inline':'none';
  const blink=Math.floor(now/1000)%7===0;eyes.style.display=blink?'none':'inline';closed.style.display=blink?'inline':'none';
  owlWings.style.display=leaving||arriving?'inline':'none';
  owlWings.setAttribute('transform','scale(1 '+(0.65+0.35*Math.sin(now/120)).toFixed(2)+')');
  let ox=107,oy=80;
  if(arriving){const t=(now-arrival)/8000;ox=430+(107-430)*t;oy=30+50*t-Math.sin(t*Math.PI)*15;}
  if(leaving){const t=(now-rise)/8000;ox+=t*330;oy-=t*110;}
  owl.setAttribute('aria-label',arriving?'Corujinha chegando ao pôr do sol':leaving?'Corujinha partindo ao nascer do sol':'Corujinha no ponto mais alto do telhado');
  owl.setAttribute('transform',`translate(${ox} ${oy})`);
 }
 render();setInterval(()=>{if(!document.hidden)render();},100);document.addEventListener('visibilitychange',render);
})();
