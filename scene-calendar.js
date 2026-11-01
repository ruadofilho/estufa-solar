/* Small seasonal pixel decorations. Dates follow Brasilia, including movable feasts. */
(function(root){
 const DAY=86400000;
 function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;return new Date(Date.UTC(y,Math.floor(n/31)-1,n%31+1));}
 function occasion(y,m,d){
  const key=m+'-'+d;
  if(key==='2-11')return 'birthday';
  if(key==='10-18')return 'wife';
  if(key==='10-12')return 'children';
  if(m===11&&d<=2)return 'skulls';
  if(m===12&&d>=20&&d<=26)return 'christmas';
  if(key==='12-31'||key==='1-1')return 'newyear';
  const delta=Math.round((Date.UTC(y,m-1,d)-easter(y).getTime())/DAY);
  if(delta>=-50&&delta<=-47)return 'carnival';
  if(delta>=-2&&delta<=0)return 'easter';
  if(key==='6-24')return 'junina';
  return '';
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={easter,occasion};
 if(typeof document==='undefined')return;
 const clock=document.querySelector('.scene-clock');if(!clock)return;
 const ns='http://www.w3.org/2000/svg',party=document.createElementNS(ns,'g');party.id='scene-clock-party';clock.appendChild(party);
 const rect=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
 const group=(x,y,s,art)=>`<g transform="translate(${x} ${y}) scale(${s})">${art}</g>`;
 const skull=rect(2,0,14,3,'#fff5dc')+rect(0,3,18,12,'#fff5dc')+rect(4,15,10,5,'#fff5dc')+rect(3,6,4,4,'#854b9d')+rect(11,6,4,4,'#854b9d')+rect(8,11,2,2,'#d4759d')+rect(5,16,2,2,'#b887ad')+rect(11,16,2,2,'#b887ad')+rect(0,11,3,3,'#f3a0ae')+rect(15,11,3,3,'#f3a0ae')+rect(7,-4,4,4,'#ffbe4c')+rect(4,-2,10,2,'#ffbe4c');
 const gift=rect(0,4,15,13,'#ef91ad')+rect(-1,3,17,4,'#ef7197')+rect(6,3,3,14,'#ffe79c')+`<path d="M7 3C-2-5 1-7 7 0C13-7 17-4 9 3" fill="none" stroke="#ffe79c" stroke-width="2"/>`;
 const balloon=`<path d="M7 16v12l3 4" fill="none" stroke="#775f91"/>`+rect(2,0,10,3,'#ffbed1')+rect(0,3,14,10,'#f18eb4')+rect(3,13,8,3,'#f18eb4')+rect(6,16,3,2,'#f18eb4')+rect(3,3,3,4,'#ffe9d9');
 const bunny=rect(2,-8,4,12,'#fff4df')+rect(11,-8,4,12,'#fff4df')+rect(3,-6,2,7,'#f6acc0')+rect(12,-6,2,7,'#f6acc0')+rect(0,3,18,12,'#fff4df')+rect(3,7,2,2,'#34425b')+rect(13,7,2,2,'#34425b')+rect(8,10,3,2,'#e899b0')+rect(2,11,3,2,'#f6c1cd')+rect(13,11,3,2,'#f6c1cd');
 const star=`<path d="M7 0l2 5h5l-4 3 2 6-5-3-5 3 2-6-4-3h5z" fill="#ffe79c"/>`;
 const hat=`<path d="M0 20L12 0l12 20z" fill="#ee899c"/>`+rect(-2,19,28,4,'#fff5dc')+rect(10,-2,5,5,'#fff5dc');
 const names={birthday:'Feliz aniversário!',wife:'Feliz aniversário para sua esposa!',children:'Feliz Dia das Crianças!',skulls:'Dia dos Mortos',christmas:'Feliz Natal!',newyear:'Feliz Ano Novo!',carnival:'Bom Carnaval!',easter:'Feliz Páscoa!',junina:'Viva São João!'};
 function confetti(){return [[290,133,'#ffd369'],[308,126,'#f49bb8'],[347,132,'#93d2ca'],[366,127,'#c0b0ee'],[278,149,'#ffd369'],[377,147,'#f49bb8']].map(([x,y,c],i)=>rect(x,y,3,i%2?5:3,c)).join('');}
 function draw(theme){let art='';
  if(theme==='skulls')art=group(290,134,.8,skull)+group(348,134,.8,skull)+group(323,138,.6,star);
  else if(theme==='easter')art=group(294,137,.9,bunny)+group(347,138,.85,bunny)+rect(326,144,5,7,'#f2b4cf');
  else if(theme==='christmas')art=group(308,133,.85,hat)+group(272,181,.65,gift)+group(373,181,.65,gift)+group(351,136,.65,star);
  else if(theme==='birthday'||theme==='wife')art=group(277,126,.75,balloon)+group(364,123,.75,balloon)+group(318,137,.8,gift)+confetti();
  else if(theme==='children')art=group(279,124,.8,balloon)+group(361,124,.8,balloon)+group(319,137,.75,gift)+confetti();
  else if(theme==='carnival')art=confetti()+`<path d="M305 139h39v10l-8 5-11-5-10 5-10-5z" fill="#c199e7"/>`+rect(311,143,7,4,'#fff0bc')+rect(332,143,7,4,'#fff0bc');
  else if(theme==='newyear')art=confetti()+group(296,134,.8,star)+group(350,131,.8,star)+group(325,139,.6,star);
  else if(theme==='junina')art=`<path d="M281 131q46 10 92 0" fill="none" stroke="#725f8c"/>`+[0,1,2,3,4].map((n)=>`<path d="M${285+n*18} 134h12v12l-6-3-6 3z" fill="${['#f29fb3','#f5d270','#91cbb3'][n%3]}"/>`).join('');
  party.innerHTML=theme?'<title>'+names[theme]+'</title>'+art:'';
  party.setAttribute('aria-label',names[theme]||'');clock.dataset.celebration=theme;
 }
 const dateFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'numeric',day:'numeric'});
 let last;
 function update(){const p=Object.fromEntries(dateFormat.formatToParts(new Date()).map(v=>[v.type,v.value]));let theme=occasion(+p.year,+p.month,+p.day);
  if(['localhost','127.0.0.1'].includes(location.hostname)){const demo=new URLSearchParams(location.search).get('celebracao');if(Object.hasOwn(names,demo))theme=demo;}
  if(last!==theme){draw(theme);last=theme;}
 }
 update();setInterval(update,60000);document.addEventListener('visibilitychange',update);
})(typeof globalThis!=='undefined'?globalThis:this);
