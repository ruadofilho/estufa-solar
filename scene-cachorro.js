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
  const house = add('g', { transform:'translate(368 201)' }, yard);
  house.innerHTML = '<path fill="#57483c" d="M-16 0v-21h5v-5h5v-5H5v5h6v5h5V0z"/><path fill="#ac825d" d="M-13-1v-19h4v-4h5v-4h8v4h5v4h4v19z"/><path fill="#8d694f" d="M-13-17h26v2h-26zm0 8h26v2h-26z"/><path fill="#635750" d="M-19-19v-4h5v-4h5v-4h5v-4h8v4h5v4h5v4h5v4h-6v-4H8v-4H3v-4h-6v4h-5v4h-5v4z"/><path fill="#493d35" d="M-9 0v-16h3v-3H6v3h3V0z"/><path fill="#76604b" d="M-10 0h20v2h-20z"/>';

  const dog = add('g', {transform:'translate(331 201)'}, yard);
  const tail = add('path', {fill:'#544741'}, dog);
  dog.insertAdjacentHTML('beforeend','<path fill="#53443c" d="M-10-13v-5h3v-8h3v3h3v-2h3v8h3v5h4v4h3V0H-9v-6h2v-7z"/><path fill="#ad8058" d="M-8-15h1v-3h5v4h4v4h-2V0h-8v-3h2v-9h-2zm12 7h4v3h2v5H2v-2h2z"/><path fill="#d5ac7a" d="M-7-12h5v4h-2v6h-2v-7h-1zM-5-2h4v2h-4z"/><path fill="#e4bc89" d="M-7-20h2v5h-2z"/><path fill="#fcf0ca" d="M-7-17h3v2h-3z"/><path fill="#363632" d="M-7-17h1v2h-1zm-4 4h3v2h-3z"/><path fill="#413633" d="M-8-10h5v1h-5z"/>');
  const bark = add('path', {d:'M-13-16h-4v-2h-3v-2m7 7h-7m7 3h-4v2h-3',stroke:'#f2d5a1','stroke-width':2,fill:'none'}, dog);
  const eyes = add('path', {d:'M-5-13h3v1h-3zm6 0h3v1H1z',fill:'#d5ac7a'}, house);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let daytime, changed = 0, barkUntil = 0, frame = 0;
  let previousCoolers = window.FabricaSceneTelemetry?.status === 'online'
    ? window.FabricaSceneTelemetry.coolers : undefined;
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
    for (const delay of [0, .27]) {
      const time = audio.currentTime + delay;
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
  }

  window.addEventListener('scene-telemetry', ({detail}) => {
    if (detail?.status !== 'online' || typeof detail.coolers !== 'boolean') {
      previousCoolers = undefined;
      return;
    }
    if (previousCoolers === false && detail.coolers && scene.dataset.day === 'false' && !document.hidden) {
      barkUntil = performance.now() + 1000;
      playBark();
    }
    previousCoolers = detail.coolers;
  });

  function draw(now) {
    frame = 0;
    const day = scene.dataset.day !== 'false';
    if (daytime === undefined) changed = now - 1800;
    else if (day !== daytime) changed = now;
    daytime = day;
    const progress = motion.matches ? 1 : Math.max(0,Math.min(1,(now-changed)/1800));
    const walking = progress < 1;
    const barking = !day && now < barkUntil;
    const x = walking ? (day ? 368-37*progress : 331+37*progress) : day ? 331 : 356;
    const hop = walking ? Math.round(Math.abs(Math.sin(progress*5*Math.PI))*2) : 0;
    dog.style.display = day || walking || barking ? '' : 'none';
    dog.setAttribute('transform','translate('+Math.round(x)+' '+(201-hop)+') scale('+(walking&&!day?-1:1)+' 1)');
    const wag = !motion.matches && Math.floor(now/165)%2;
    tail.setAttribute('d',wag ? 'M7-4h5v-2h4v-3h3v4h-2v3h-4v2H8z' : 'M7-4h5v2h7v2H9z');
    bark.style.display = barking ? '' : 'none';
    eyes.style.display = !day && !walking && !barking ? '' : 'none';
    if (!document.hidden) frame = requestAnimationFrame(draw);
  }

  document.addEventListener('visibilitychange', () => {
    if (frame) cancelAnimationFrame(frame);
    frame = document.hidden ? 0 : requestAnimationFrame(draw);
  });
  if (!document.hidden) frame = requestAnimationFrame(draw);
})();
