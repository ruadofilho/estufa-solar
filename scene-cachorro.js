(() => {
  'use strict';
  const scene = document.querySelector('.mission-art svg');
  const clock = scene?.querySelector('.scene-clock');
  if (!clock) return;
  const ns = 'http://www.w3.org/2000/svg';
  const add = (tag, attrs, parent) => {
    const el = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    parent.append(el);
    return el;
  };

  const yard = add('g', { role:'img', 'aria-label':'Pastor-alemão e casinha de madeira', 'shape-rendering':'crispEdges' }, scene);
  scene.insertBefore(yard, scene.querySelector('.sky-precipitation') || clock);
  const house = add('g', { transform:'translate(358 201)' }, yard);
  house.innerHTML = '<path fill="#4d4036" d="M-20 0v-24l12-15h21l16 15V0z"/><path fill="#906b50" d="M-1-23h27v21H-1z"/><path fill="#ad805e" d="M-19-23l11-13L1-23V-2h-20z"/><path fill="#765740" d="M1-18h25v2H1zm0 7h25v2H1zm0 7h25v2H1z"/><path fill="#77635b" d="M-8-39h22l16 15H2z"/><path fill="#66534a" d="M-21-25l12-15h3L5-24H1L-8-35l-10 13h-3zM3-24h27v3H3z"/><path fill="#493d35" d="M-17-2v-18h3v-4h9v4h3v18z"/><path fill="#76604b" d="M-19-2h19v2h-19z"/>';

  const dog = add('g', {transform:'translate(331 201)'}, yard);
  const tail = add('path', {fill:'#544741'}, dog);
  dog.insertAdjacentHTML('beforeend','<path fill="#53443c" d="M-10-13v-5h3v-8h3v3h3v-2h3v8h3v5h4v4h3V0H-9v-6h2v-7z"/><path fill="#ad8058" d="M-8-15h1v-3h5v4h4v4h-2V0h-8v-3h2v-9h-2zm12 7h4v3h2v5H2v-2h2z"/><path fill="#d5ac7a" d="M-7-12h5v4h-2v6h-2v-7h-1zM-5-2h4v2h-4z"/><path fill="#e4bc89" d="M-7-20h2v5h-2z"/><path fill="#fcf0ca" d="M-7-17h3v2h-3z"/><path fill="#363632" d="M-7-17h1v2h-1zm-4 4h3v2h-3z"/><path fill="#413633" d="M-8-10h5v1h-5z"/>');
  const bark = add('path', {d:'M-13-16h-4v-2h-3v-2m7 7h-7m7 3h-4v2h-3',stroke:'#f2d5a1','stroke-width':2,fill:'none'}, dog);
  const eyes = add('path', {d:'M-14-15h3v1h-3zm6 0h3v1h-3z',fill:'#d5ac7a'}, house);
  const walker = add('g', { 'aria-hidden':'true' }, yard);
  const legs = [[-7,'#85634c'],[8,'#85634c'],[-8,'#d5ac7a'],[7,'#ad8058']].map(([x,fill])=>{
    const joint = add('g',{transform:'translate('+x+' -7)'},walker);
    const leg = add('path',{fill},joint);
    return leg;
  });
  walker.insertAdjacentHTML('beforeend','<path fill="#53443c" d="M-13-9v-6h3v-8h3v3h3v-2h2v7h4v2h11v-2h4v-2h3v2h-2v3h-4v5H-9v-2z"/><path fill="#ad8058" d="M-11-12h3v-5h4v4h4v4h12v2H-9v-3h-2z"/><path fill="#d5ac7a" d="M-9-15h3v2h-3z"/><path fill="#363632" d="M-9-15h1v1h-1zm-5 3h3v2h-3z"/>');
  const steps = ['M-1-3h3v6h1v4h-3V4h-1z','M-1-3h3v4h2v4h-3V3h-2z','M-1-3h3v5H1v5h-3V3h1z','M-1-3h3v5H0v3h-3V1h2z'];
  const drinking = add('g', {'aria-hidden':'true',transform:'translate(370 216) scale(1.18)'}, yard);
  drinking.innerHTML = '<path fill="#53443c" d="M-20-4v-3h3v-6h6v3l5-3H8v-2h4v-3h3v4h-2v3h-4v7H5v-4H-6v3h-9v1z"/><path fill="#ad8058" d="M-17-9h5v3h5v-4H8v3H3v7H0v-7h-6l-3 7h-4l3-6h-7z"/><path fill="#363632" d="M-20-5h3v2h-3zm5-4h2v1h-2z"/>';
  const tongue = add('path',{d:'M-19-3h3v3h-2v-2h-1z',fill:'#ce9a97'},drinking);
  const water = add('g', {'aria-hidden':'true','shape-rendering':'geometricPrecision'},yard);
  const ripple = add('ellipse',{fill:'none',stroke:'#daeeeb','stroke-width':1},water);
  const drops = Array.from({length:12},(_,i)=>add('ellipse',{
    rx:1.05+i%3*.32,ry:1.65+i%3*.42,fill:i%3===0?'#e6f6ef':'#9cd4e0',
    stroke:'#548596','stroke-width':.45
  },water));
  const rainInterval = 180000, visitDuration = 9800;
  let nextPuddle, puddleStart;
  const barkInterval = 10000;
  const barkSpacing = 270;
  let daytime, changed = 0, frame = 0;
  let barkCycleStart, lastBark = -1;
  let coolersOn = window.FabricaSceneTelemetry?.status === 'online'
    && window.FabricaSceneTelemetry.coolers === true;
  let audio;

  // Browser audio becomes available after the visitor interacts with the page.
  document.addEventListener('pointerdown', () => {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audio ||= new Audio();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
    } catch {}
  }, {passive:true});

  function playBark() {
    if (audio?.state !== 'running') return;
    const time = audio.currentTime;
    const voice = audio.createOscillator(), volume = audio.createGain();
    voice.type = 'triangle';
    voice.frequency.setValueAtTime(220, time);
    voice.frequency.exponentialRampToValueAtTime(75, time + .14);
    volume.gain.setValueAtTime(.001, time);
    volume.gain.linearRampToValueAtTime(.08, time + .022);
    volume.gain.exponentialRampToValueAtTime(.001, time + .16);
    voice.connect(volume).connect(audio.destination);
    voice.onended = () => { voice.disconnect(); volume.disconnect(); };
    voice.start(time);
    voice.stop(time + .17);
  }

  window.addEventListener('scene-telemetry', ({detail}) => {
    coolersOn = detail?.status === 'online' && detail.coolers === true;
    if (!coolersOn) barkCycleStart = undefined;
  });

  function drawBarks(now, enabled) {
    if (!enabled) {
      barkCycleStart = undefined;
      return false;
    }
    if (barkCycleStart === undefined) {
      barkCycleStart = now;
      lastBark = -1;
    }
    const elapsed = now - barkCycleStart;
    const phase = elapsed % barkInterval;
    const pulse = Math.floor(phase / barkSpacing);
    if (pulse >= 3 || phase % barkSpacing >= 165) return false;
    const barkNumber = Math.floor(elapsed / barkInterval) * 3 + pulse;
    if (lastBark !== barkNumber) {
      lastBark = barkNumber;
      playBark();
    }
    return true;
  }

  function puddleTime(now, raining) {
    if (!raining) {
      nextPuddle = puddleStart = undefined;
      return -1;
    }
    nextPuddle ??= now + rainInterval;
    if (now >= nextPuddle) {
      puddleStart = now;
      nextPuddle = now + rainInterval;
    }
    return puddleStart === undefined ? -1 : now - puddleStart;
  }

  function spray(x,y,age,strength) {
    const progress = age / 650;
    water.style.display = '';
    ripple.setAttribute('cx',x);
    ripple.setAttribute('cy',y);
    ripple.setAttribute('rx',3+16*progress*strength);
    ripple.setAttribute('ry',.8+3*progress);
    water.setAttribute('opacity',1-progress);
    drops.forEach((drop,i)=>{
      drop.style.display = strength < .4 ? 'none' : '';
      const dx = (i%2 ? 1 : -1)*(4+(17+i%5*3)*progress)*strength;
      const dy = -(12+i%4*6)*Math.sin(Math.PI*progress)*strength;
      drop.setAttribute('transform','translate('+(x+dx)+' '+(y+dy)+') rotate('+(dx*2)+')');
    });
  }

  function drawWalk(x, y, direction, age, jump = false) {
    walker.style.display = '';
    walker.setAttribute('transform','translate('+Math.round(x)+' '+Math.round(y)+') scale('+(direction*1.18)+' 1.18)');
    const step = Math.floor(age/105);
    legs.forEach((leg,i)=>leg.setAttribute('d',steps[jump ? (i<2?1:3) : (step+[0,2,2,0][i])%4]));
  }

  function drawPuddleVisit(age, day) {
    const home = day ? 331 : 358;
    if (age < 1750) {
      const p = age/1750;
      drawWalk(home+(366-home)*p,201+15*p,day?-1:1,age);
    } else if (age < 3900) {
      drinking.style.display = '';
      tongue.style.display = Math.floor(age/140)%2 ? '' : 'none';
      spray(347,217,(age-1750)%620,.32);
    } else if (age < 6500) {
      const play = age-3900;
      const leap = Math.min(1,(play%1300)/720);
      const direction = play < 1300 ? 1 : -1;
      const x = play < 1300 ? 366-17*leap : 349+17*leap;
      drawWalk(x,216-(20*Math.sin(Math.PI*leap)),direction,play,leap<1);
      if (leap === 1) spray(x,216,(play%1300)-720,1);
    } else if (age < 8100) {
      const p = (age-6500)/1600;
      drawWalk(366-35*p,216-15*p,1,age);
    } else if (age < 9800) {
      const shake = age-8100;
      const tilt = Math.sin(shake/47)*7*(1-shake/1700);
      dog.style.display = '';
      dog.setAttribute('transform','translate(331 201) rotate('+tilt+') scale(1.18)');
      spray(331,186,shake%450,.67);
    } else {
      const p = (age-9800)/1600;
      drawWalk(331+27*p,201,-1,age);
    }
  }

  function draw(now) {
    frame = 0;
    const day = scene.dataset.day !== 'false';
    if (daytime === undefined) changed = now - 1800;
    else if (day !== daytime) changed = now;
    daytime = day;
    const progress = Math.max(0,Math.min(1,(now-changed)/1800));
    const walking = progress < 1;
    const age = puddleTime(now,scene.dataset.weather==='rain');
    const visiting = age >= 0 && age < visitDuration+(day?0:1600);
    const barking = drawBarks(now, !day && !walking && coolersOn && !document.hidden);
    const x = walking ? (day ? 358-27*progress : 331+27*progress) : day ? 331 : 356;
    walker.style.display = walking ? '' : 'none';
    if (walking) {
      drawWalk(x,201,day?1:-1,now-changed);
    }
    dog.style.display = !walking && (day || barking) ? '' : 'none';
    dog.setAttribute('transform','translate('+x+' 201) scale(1.18)');
    const wag = Math.floor(now/165)%2;
    tail.setAttribute('d',wag ? 'M7-4h5v-2h4v-3h3v4h-2v3h-4v2H8z' : 'M7-4h5v2h7v2H9z');
    bark.style.display = barking ? '' : 'none';
    eyes.style.display = !day && !walking && !barking ? '' : 'none';
    drinking.style.display = water.style.display = 'none';
    if (visiting) {
      walker.style.display = dog.style.display = eyes.style.display = 'none';
      drawPuddleVisit(age,day);
    }
    if (!document.hidden) frame = requestAnimationFrame(draw);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) barkCycleStart = undefined;
    if (frame) cancelAnimationFrame(frame);
    frame = document.hidden ? 0 : requestAnimationFrame(draw);
  });
  if (!document.hidden) frame = requestAnimationFrame(draw);
  if (window.ESTUFA_PREVIEW) document.getElementById('demo-puddle')?.addEventListener('click',()=>{
    scene.dataset.weather = 'rain';
    puddleStart = performance.now();
    nextPuddle = puddleStart + rainInterval;
  });
})();
