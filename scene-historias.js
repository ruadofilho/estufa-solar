(() => {
  const scene = document.querySelector('.mission-art svg');
  const owl = scene?.querySelector('#scene-owl');
  if (!owl) return;
  const hatsStyle = document.createElement('style');
  hatsStyle.textContent = '.dog-party-hat{display:none} svg[data-owl-birthday="true"] .dog-party-hat{display:inline}';
  document.head.append(hatsStyle);
  const ns = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const group = (parent, art = '') => {
    const node = document.createElementNS(ns,'g');
    node.innerHTML = art;
    node.setAttribute('aria-hidden','true');
    parent.append(node);
    return node;
  };
  const show = (node, visible) => { node.style.display = visible ? '' : 'none'; };
  const move = (node,x,y) => node.setAttribute('transform','translate('+x+' '+y+')');
  const time = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'numeric',day:'numeric'});
  const birthdays = new Set(['02-11','02-27','03-12','03-30','06-20','09-13','10-18','01-14']);
  const party = group(scene);
  const foreground = group(scene);
  const sky = group(scene);
  const roof = scene.querySelector('#kiln-side');
  if (roof) scene.insertBefore(sky,roof);
  const vultures = Array.from({length:2},()=>group(sky,
    '<path fill="#262834" d="M-5-2h2v1h2v1h2v-1h2v-1h2v1H4v1H2v1H1v1h-2V1h-1V0h-2v-1h-1z"/>'));
  let heatTint;
  if (roof) {
    hatsStyle.textContent += ' #kiln-side #kiln-heat,#kiln-side #kiln-devil{display:none}';
    heatTint = group(roof,'<path fill="#ed403a" d="M110 89L188 130V197H110Z"/>');
    roof.insertBefore(heatTint,roof.querySelector('#kiln-wood'));
    show(heatTint,false);
  }
  const clock = scene.querySelector('.scene-clock');
  if (clock) for (const layer of [party,foreground]) scene.insertBefore(layer,clock);
  const ribbons = group(scene);
  if (clock) scene.insertBefore(ribbons,clock);
  const body = group(owl);
  const hat = '<path fill="#bd7191" d="M-8-25h16L1-39H-1z"/><path fill="#eed387" d="M-4-30h8v2h-8zm2-11h4v4h-4z"/>';
  const owlHat = group(body,hat);
  const umbrella = group(body,'<path fill="#69524c" d="M20-43h2v34h-6v-2h4z"/>'+
    '<path fill="#62506a" d="M1-32v-5h3v-4h4v-4h6v-3h14v3h6v4h4v4h3v5z"/>');
  const canopy = [[3,7,-37],[9,6,-43],[15,6,-46],[21,6,-46],[27,6,-43],[33,6,-37]];
  ['#bf6774','#de995f','#e5cc76','#88aa77','#73a9b4','#a58bb1'].forEach((color,i)=>{
    const [x,width,y] = canopy[i];
    umbrella.insertAdjacentHTML('beforeend','<rect fill="'+color+'" x="'+x+'" y="'+y+'" width="'+width+'" height="'+(-33-y)+'"/>');
  });
  const sweater = group(body,'<path fill="#759d9e" d="M-10-12h20v9h-20z"/><path fill="#c5dbc7" d="M-10-9h20v2h-20z"/>');
  const umbrellaWing = group(body,'<path fill="#8f6589" d="M8-13h5v2h4v-2h3v-3h4v6h-4v2h-5v2H9z"/>'+
    '<path fill="#c89db5" d="M9-12h4v2h4v-2h3v2h-2v2h-5v1H9z"/>');
  const sleep = group(body,'<text x="11" y="-23" fill="#fff1d4" stroke="#524150" stroke-width="1.3" paint-order="stroke" font-size="8" font-family="monospace">Zzz</text>');
  const fruit = group(body,'<path d="M-4-3h8v2h2v5H3v2h-6V4h-3v-5h2z" fill="#d9c473"/><path d="M0-3v-2h3v2z" fill="#6c8c59"/>');
  const ice = group(body,'<path fill="#c79869" d="M-4 0h8L0 8z"/><path fill="#e4a8ad" d="M-5 0v-5h2v-2h6v2h2v5z"/>');
  move(ice,12,-9);
  const sheltered = group(foreground,'<path d="M-5-6h10v7H-5z" fill="#8e697f"/><path d="M-4-5h3v2h-3zm5 0h3v2H1z" fill="#ffe4a2"/>');
  move(sheltered,347,183);
  const meteor = group(sky,'<path d="M-25-13l24 11" stroke="#ddd5ac" stroke-width="1"/><path d="M-4-3l4 2" stroke="#fff1be" stroke-width="3"/>');
  const witch = group(sky,'<path fill="#333049" d="M-8-5h13v2H-8zm2 7 6-6 5 5h4v3H-7zM-4-5l5-7 2 7z"/><path stroke="#856d66" d="M-12 5H14m-25-1v3h-5V4z"/>');

  function easter(year) {
    const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4;
    const f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30;
    const l=(32+2*e+2*Math.floor(c/4)-h-c%4)%7,m=Math.floor((a+11*h+22*l)/451);
    const n=h+l-7*m+114;
    return Date.UTC(year,Math.floor(n/31)-1,n%31+1);
  }
  const dayMs = 86400000;
  const sunday = (y,m,n) => 1+(7-new Date(Date.UTC(y,m-1,1)).getUTCDay())%7+(n-1)*7;
  function calendar(y,m,d) {
    const key = String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const beforeEaster = (easter(y)-Date.UTC(y,m-1,d))/dayMs;
    return {
      key,birthday:birthdays.has(key)||(key==='11-06'&&y>=2026),
      festival: (m===12&&d===31)||(m===1&&d===1)?'ano novo':
        m===12&&d>=18?'natal':beforeEaster>=0&&beforeEaster<=7?'páscoa':
        beforeEaster>=46&&beforeEaster<=49?'carnaval':m===11&&d<=2?'dia dos mortos':
        m===5&&Math.abs(d-sunday(y,5,2))<=1?'dia das mães':
        m===8&&Math.abs(d-sunday(y,8,2))<=1?'dia dos pais':
        m===7&&d>=12&&d<=16?'Nossa Senhora do Carmo':
        m===10&&d>=10&&d<=12?'dia das crianças':''
    };
  }

  const label = (x,y,words,size=5,color='#fff2d4') =>
    '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-family="monospace" font-size="'+size+'" fill="'+color+'">'+words+'</text>';
  function ribbon(lines) {
    const text = lines.length === 1 ? label(86,15,lines[0],8) :
      label(86,11,lines[0],7.5)+label(86,19,lines[1],6,'#f2d398');
    ribbons.insertAdjacentHTML('beforeend',
      '<g transform="translate(137 6)"><title>'+lines.join(' ')+'</title>'+
      '<path fill="#563747" d="M0 6h18v18H0l5-9zm172 0h-18v18h18l-5-9z"/>'+
      '<path fill="#784c66" d="M9 0h154v24H9z"/>'+
      '<path fill="#e2b97f" d="M11 2h150v1H11zm0 19h150v1H11z"/>'+
      '<path fill="#f1d294" d="M16 7h2v3h3v2h-3v3h-2v-3h-3v-2h3zm138 0h2v3h3v2h-3v3h-2v-3h-3v-2h3z"/>'+
      text+'</g>');
  }
  let lastDate, rocker, fireworks;
  function decorate(event) {
    party.replaceChildren();
    ribbons.replaceChildren();
    rocker = fireworks = null;
    const k = event.key;
    if (event.birthday || event.festival && event.festival!=='natal') {
      const colors = event.birthday?['#df9eb2','#e0c77a','#96bcb8']:['#e0ad79','#dfc884','#dba9ac'];
      for(let i=0;i<11;i++) {
        const x=255+i*10,y=68+(i*17)%49;
        party.insertAdjacentHTML('beforeend','<path d="M'+x+' '+y+'v9" stroke="#d8c4a0" stroke-width=".6"/><ellipse cx="'+x+'" cy="'+y+'" rx="3" ry="4" fill="'+colors[i%3]+'"/>');
      }
    }
    if(event.festival) ribbon([event.festival]);
    if(event.festival==='natal'){
      const christmas=group(party,
        '<path fill="#76512f" d="M305 38h3v-5h4v5h6v4h-4v7h-4v-4h-3v4h-4v-7h-4v-4z"/>'+
        '<path fill="#ffe493" d="M308 35h3v5h5v2h-5v5h-3v-5h-5v-2h5z"/>'+
        '<path fill="none" stroke="#e5bd75" stroke-width="1.4" d="M275 61h9v5h13v4h15v-2h14v-5M253 92h10v5h14v4h19v4h19v-5h16v-6h28M278 115h9v5h13v3h20v-4h9"/>');
      [[279,70],[300,58],[321,76],[257,98],[274,90],[290,110],[309,114],[339,87],[351,102],[319,128]].forEach(([x,y],i)=>{
        const color=['#e39392','#f4cf7f','#8bcaba'][i%3];
        group(christmas,'<path fill="'+color+'" d="M'+x+' '+y+'h5v2h1v4h-1v1h-5v-1h-1v-4h1z"/><path fill="#fff0be" d="M'+(x+1)+' '+(y+1)+'h2v2h-2z"/>');
      });
      [[268,193,18,'#aa666d'],[289,185,16,'#6b9c8b'],[308,191,17,'#b48357']].forEach(([x,y,w,color])=>{
        const gift=group(christmas,'<path fill="#55413c" d="M0-1h'+w+'v13H0z"/><path fill="'+color+'" d="M1 0h'+(w-2)+'v11H1z"/><path fill="#f2d18d" d="M0 3h'+w+'v2H0zM7-3H4v-3h4v2h2v-2h4v3h-4v15H7z"/>');
        move(gift,x,y);
      });
    }
    if(event.festival==='ano novo'){
      fireworks=group(sky);
      for(let i=0;i<3;i++)group(fireworks,
        '<path d="M0 0v13" stroke="#f6d888" stroke-width="1.5"/>'+
        Array.from({length:16},(_,j)=>'<path fill="'+['#ffe39b','#efa9bd','#a5e1cb'][i]+'" d="M-1-1h2v2h-2z" transform="rotate('+j*22.5+')"/>').join(''));
    }
    if(k==='10-18'){
      ribbon(['o Tinenem te amo,','ass: Bonnie']);
      for(let i=0;i<23;i++) {
        const x=15+i*16,y=204+i%3*4;
        party.insertAdjacentHTML('beforeend','<path stroke="#76975b" d="M'+x+' '+y+'v-5"/><path stroke="'+(i%2?'#e6a2ab':'#efd18b')+'" d="M'+(x-2)+' '+(y-5)+'h4m-2-2v4"/>');
      }
    }
    if(k==='09-13') ribbon(['Feliz Aniversário, Bruno']);
    if(k==='01-14'){
      rocker=group(party,'<path fill="#bcb0b4" d="M-7-27H5v12H-7z"/><path fill="#d2a285" d="M-5-23H7v10H-5z"/><path fill="#9a738d" d="M-6-13H7l6 9H-4z"/><path fill="none" stroke="#896449" stroke-width="2" d="M-12-23l5 23m-2-9h16L4 1m-19 0q12 8 27-1"/>');
    }
    if(k==='03-30') party.insertAdjacentHTML('beforeend','<path fill="#785443" d="M18 183h70v4H18zm4 4h4v16h-4zm58 0h4v16h-4z"/><path fill="#536363" d="M20 156h66v25H20z"/><path fill="#c1dbc1" d="M23 159h60v18H23z"/>'+label(53,170,'feliz aniversario Nera',4,'#293e3f'));
    if(k==='03-12') party.insertAdjacentHTML('beforeend','<path stroke="#806b5c" d="M26 178v23m43-27v26"/><path stroke="#c6a85b" stroke-width="3" d="M18 178h16m27-4h16"/><ellipse cx="49" cy="192" rx="19" ry="12" fill="#956f83" stroke="#d0a3aa"/>'+label(49,191,'Feliz aniversário',4)+label(49,197,'Cavér',5));
  }

  const tree = () => scene.querySelector('.guava-tree');
  let lastFruitTree;
  function colorTree(event,serial,eating) {
    const current = tree();
    const caju = event.key==='01-14';
    if(current) {
      current.style.display = caju?'none':'';
      if(caju&&!lastFruitTree?.isConnected) {
        lastFruitTree=group(current.parentNode,
          '<path fill="#93724e" d="M291 205v-12h7v-35h-13v-10h-18v-8h25v8h12v-20h13v-10h8v15h-11v25h-7v35h11v12z"/>'+
          '<path fill="#638a5e" d="M246 135v-18h12v-11h20V94h26v7h20v-9h20v12h16v24h-11v11h-27v-6h-28v8h-29v-6z"/>'+
          '<path fill="#91a669" d="M251 120h17v-11h21v-8h15v12h17v-7h28v17h-17v8h-32v-8h-21v9h-28z"/>'+
          [257,274,291,313,333,346].map((x,i)=>'<path transform="translate('+x+' '+(120+i%2*9)+')" fill="'+(i%2?'#e0a453':'#bc765a')+'" d="M-3 0h6v3h2v6H-4V3zm3 9h4v3H0z"/>').join(''));
      }
    }
    if(lastFruitTree)show(lastFruitTree,caju);
    scene.querySelectorAll('.guava-fruit').forEach((node,i)=>{
      show(node,!caju&&!(eating&&i===0));
      const ripe=(serial+i)%3===2;
      node.style.filter=ripe?'sepia(.4) saturate(1.35)':'';
    });
  }

  let frame, previous = -Infinity, event, serial, lastTree, lastEaten = false;
  function tick(now) {
    if(document.hidden){frame=0;return;}
    frame=requestAnimationFrame(tick);
    if(now-previous<80)return;
    previous=now;
    const override=window.ESTUFA_PREVIEW&&window.previewOwlDate;
    const date=override?new Date(override+'T12:00:00-03:00'):new Date();
    const parts=Object.fromEntries(time.formatToParts(date).map(({type,value})=>[type,Number(value)]));
    const dateKey=parts.year+'-'+parts.month+'-'+parts.day;
    if(dateKey!==lastDate) {
      lastDate=dateKey;
      event=calendar(parts.year,parts.month,parts.day);
      serial=Date.UTC(parts.year,parts.month-1,parts.day)/dayMs;
      if(fireworks)fireworks.remove();
      decorate(event);
    }
    scene.dataset.owlBirthday=String(event.birthday);
    const night=scene.dataset.day==='false';
    vultures.forEach((bird,i)=>{
      show(bird,!night);
      const phase=reduce.matches?i:now/7200+i*1.1;
      move(bird,155+i*47+24*Math.cos(phase),40+i*7+5*Math.sin(phase));
    });
    const wet=scene.dataset.weather==='rain';
    const storm=wet&&Number(scene.dataset.weatherCode)>=95;
    scene.dataset.owlShelter=String(storm);
    const telem=window.FabricaSceneTelemetry;
    if(heatTint){
      const internal=telem?.airValid&&Number.isFinite(telem.airT)?telem.airT:0;
      const hot=internal>50;
      show(heatTint,hot);
      if(hot)heatTint.setAttribute('opacity',Math.min(.62,.31+(internal-50)*.012));
    }
    const external=telem?.externalValid&&Number.isFinite(telem.externalT)?telem.externalT:undefined;
    scene.dataset.owlDayVisit=String(external>35||wet);
    const flight=owl.getAttribute('aria-label')?.includes('voando')||owl.getAttribute('aria-label')?.includes('chegando');
    const cycle=now%180000;
    const perched=!flight&&!storm&&(night||event.birthday||event.festival||external>35);
    const eating=perched&&!wet&&event.key!=='01-14'&&serial%3===2&&cycle>10000&&cycle<16500;
    if(lastTree!==tree()||lastEaten!==eating||lastDate!==colorTree.date){
      lastTree=tree();lastEaten=eating;colorTree.date=lastDate;colorTree(event,serial,eating);
    }
    show(sheltered,storm);
    show(owlHat,event.birthday&&!storm);
    show(umbrella,wet&&!storm);
    show(umbrellaWing,wet&&!storm);
    show(sweater,!storm&&(parts.month===7||night&&external<10));
    show(sleep,!night&&!storm&&!wet&&!(external>35)&&!flight);
    show(ice,perched&&external>35&&!wet&&!eating);
    show(fruit,eating);
    if(eating)fruit.setAttribute('transform','translate(11 -8) scale('+Math.max(.12,1-Math.floor((cycle-10000)/900)*.14)+')');
    const skyTime=now%720000;
    show(meteor,night&&!storm&&!reduce.matches&&skyTime>20000&&skyTime<22000);
    show(witch,night&&!storm&&!reduce.matches&&skyTime>330000&&skyTime<340000);
    if(skyTime>20000&&skyTime<22000)move(meteor,75+(skyTime-20000)*.14,28+(skyTime-20000)*.02);
    if(skyTime>330000&&skyTime<340000)move(witch,-20+(skyTime-330000)*.044,50+3*Math.sin(now/350));
    if(rocker)rocker.setAttribute('transform','translate(60 199) rotate('+(reduce.matches?0:7*Math.sin(now/390))+')');
    if(fireworks){
      show(fireworks,true);
      Array.from(fireworks.children).forEach((burst,i)=>{
        const phase=reduce.matches?1250:(now+i*870)%3100;
        const rising=phase<720;
        const fade=Math.max(0,1-(phase-720)/1450);
        const height=[42,56,42][i];
        move(burst,[104,178,246][i],rising?174-(174-height)*phase/720:height);
        burst.setAttribute('opacity',rising?1:fade);
        show(burst.firstElementChild,rising);
        Array.from(burst.children).slice(1).forEach((spark,j)=>{
          show(spark,!rising&&fade>0);
          const spread=(1-fade)*(25+j%3*6);
          spark.setAttribute('transform','rotate('+j*22.5+') translate(0 '+(-spread)+')');
        });
      });
    }
  }
  document.addEventListener('visibilitychange',()=>{
    if(frame)cancelAnimationFrame(frame);
    frame=document.hidden?0:requestAnimationFrame(tick);
  });
  if(!document.hidden)frame=requestAnimationFrame(tick);
})();
