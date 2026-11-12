(() => {
  const scene = document.querySelector('.mission-art svg');
  const clock = scene?.querySelector('.scene-clock');
  if (!clock) return;

  const svgNS = 'http://www.w3.org/2000/svg';
  const waitForWitch = 120_000;
  const repeatAfter = 2 * 60 * 60_000;
  const flightDuration = 2400;
  const flightAnchors = [[245, 460], [205, 450], [208, 416], [195, 393], [295, 405], [270, 447]];
  const buildFrames = [0, 1, 2, 3, 2, 3, 4, 5];
  const buildTimes = [850, 750, 450, 300, 450, 300, 700, 1000];
  const buildDuration = buildTimes.reduce((total, time) => total + time, 0);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const assets = window.ESTUFA_ASSETS || {};
  const builderUrl = assets.tableBuilder || './urubu-construindo-mesa.png';
  const witchUrl = assets.tableWitch || './bruxa-feitico-vassoura.png';
  const flightUrl = assets.tableFlight || './urubu-volta-ao-galho.png';

  function create(tag, attributes, parent) {
    const node = document.createElementNS(svgNS, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    parent.append(node);
    return node;
  }

  const layer = create('g', { id: 'scene-table-story', 'aria-hidden': 'true', 'pointer-events': 'none' }, scene);
  scene.insertBefore(layer, scene.querySelector('#scene-esp') || clock);
  const defs = create('defs', {}, layer);
  const witchMask = create('clipPath', { id: 'table-witch-actor' }, defs);
  create('path', { d: 'M0 0H443.5V298H302V443.5H0Z' }, witchMask);

  function atlas(url, width, height, cellWidth, cellHeight, columns, displayWidth) {
    const viewport = create('svg', {
      width: displayWidth, height: displayWidth * cellHeight / cellWidth, overflow: 'hidden'
    }, layer);
    const actor = create('g', {}, viewport);
    const image = create('image', { href: url, width, height }, actor);
    return {
      viewport, actor,
      frame(index) {
        viewport.setAttribute('viewBox', '0 0 ' + cellWidth + ' ' + cellHeight);
        image.setAttribute('x', -index % columns * cellWidth);
        image.setAttribute('y', -Math.floor(index / columns) * cellHeight);
      }
    };
  }

  const builder = atlas(builderUrl, 1536, 1024, 512, 512, 3, 84);
  const table = create('svg', { x: 248, y: 174, width: 41, height: 30, viewBox: '1258 785 235 172', overflow: 'hidden' }, layer);
  create('image', { href: builderUrl, width: 1536, height: 1024 }, table);
  const witch = atlas(witchUrl, 1774, 887, 443.5, 443.5, 4, 66);
  const flight = atlas(flightUrl, 1536, 1024, 512, 512, 3, 48);
  const flash = create('g', { transform: 'translate(268 188)' }, layer);
  const spark = create('path', {
    d: 'M0-16Q2-2 14 0Q2 2 0 16Q-2 2-14 0Q-2-2 0-16Z',
    fill: '#fff3ae', stroke: '#c592ff', 'stroke-width': 1.5
  }, flash);
  const smoke = create('ellipse', { rx: 12, ry: 5, fill: '#c592ff', opacity: .65 }, flash);

  const show = (node, visible) => { node.style.display = visible ? '' : 'none'; };
  for (const node of [builder.viewport, table, witch.viewport, flight.viewport, flash]) show(node, false);

  function position(viewport, x, y) {
    viewport.setAttribute('x', x);
    viewport.setAttribute('y', y);
  }

  function buildFrame(elapsed) {
    let index = 0;
    while (index < buildTimes.length - 1 && elapsed >= buildTimes[index]) elapsed -= buildTimes[index++];
    return buildFrames[index];
  }

  function drawReturn(elapsed) {
    const time = Math.min(elapsed, flightDuration);
    const perched = time >= flightDuration || reduceMotion.matches;
    const pose = perched ? 5 : time < 260 ? 0 : time >= 1850 ? 4 :
      [1, 2, 3, 2][Math.floor((time - 260) / 165) % 4];
    const progress = perched ? 1 : Math.max(0, (time - 260) / (flightDuration - 260));
    const smooth = progress * progress * (3 - 2 * progress);
    const [perchX, perchY] = scene.dataset.illustrated ? [254, 145] : [301, 48];
    const x = 230 + (perchX - 230) * smooth;
    const y = 203 + (perchY - 203) * smooth - 21 * Math.sin(Math.PI * progress);
    const [anchorX, anchorY] = flightAnchors[pose];
    flight.frame(pose);
    position(flight.viewport, x - anchorX * 48 / 512, y - anchorY * 48 / 512);
  }

  let start = Infinity;
  let next = Infinity;
  let sceneTime = 0;
  let previousFrame;
  let frameRequest = 0;

  function render() {
    const elapsed = sceneTime - start;
    const visit = elapsed - buildDuration - waitForWitch;
    const building = elapsed >= 0 && elapsed < buildDuration;
    const returning = elapsed >= buildDuration && visit < 0;
    const visiting = visit >= 0 && visit < 7400;
    const vanishing = visit >= 3450 && visit < 4900;
    const vulture = scene.querySelector('#scene-vulture');
    if (vulture) vulture.style.visibility = building || returning ? 'hidden' : '';
    show(builder.viewport, building);
    show(table, elapsed >= buildDuration && visit < 3850);
    show(witch.viewport, visiting);
    show(flight.viewport, returning);
    show(flash, vanishing);

    if (building) {
      builder.frame(reduceMotion.matches ? 5 : buildFrame(elapsed));
      position(builder.viewport, 207, 130);
    }
    if (returning) drawReturn(elapsed - buildDuration);
    if (visiting) {
      const arriving = visit < 1650;
      const leaving = visit >= 5700;
      let pose = arriving ? 0 : visit < 2050 ? 1 : visit < 3250 ? 2 :
        visit < 3850 ? 3 : visit < 4550 ? 4 : visit < 5200 ? 5 : leaving ? 7 : 6;
      if (reduceMotion.matches && (arriving || leaving)) pose = arriving ? 1 : 6;
      const fly = !reduceMotion.matches;
      const x = fly && arriving ? -68 + 263 * visit / 1650 :
        fly && leaving ? 195 + 220 * (visit - 5700) / 1700 : 195;
      const y = fly && arriving ? 64 + 81 * visit / 1650 :
        fly && leaving ? 145 - 85 * (visit - 5700) / 1700 : 145;
      witch.frame(pose);
      witch.actor.setAttribute('clip-path', pose >= 1 && pose <= 5 ? 'url(#table-witch-actor)' : '');
      position(witch.viewport, x, y);
    }
    if (vanishing) {
      const progress = reduceMotion.matches ? .45 : (visit - 3450) / 1450;
      flash.setAttribute('opacity', 1 - progress);
      spark.setAttribute('transform', 'scale(' + (.55 + progress) + ')');
      smoke.setAttribute('transform', 'translate(0 ' + (-12 * progress) + ') scale(' + (1 + progress) + ')');
    }
  }

  function tick(timestamp) {
    frameRequest = 0;
    if (document.hidden) return;
    if (previousFrame !== undefined) sceneTime += timestamp - previousFrame;
    previousFrame = timestamp;
    if (sceneTime >= next) {
      start = sceneTime;
      next = sceneTime + repeatAfter;
    }
    render();
    frameRequest = requestAnimationFrame(tick);
  }

  function resume() {
    if (frameRequest) cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    previousFrame = undefined;
    if (!document.hidden) frameRequest = requestAnimationFrame(tick);
  }

  const load = url => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = reject;
    image.src = url;
  });

  Promise.all([load(builderUrl), load(witchUrl), load(flightUrl)]).then(() => {
    if (!window.ESTUFA_PREVIEW) next = 12_000;
    const demo = document.getElementById('demo-table-story');
    const skip = document.getElementById('demo-table-witch');
    demo?.removeAttribute('disabled');
    skip?.removeAttribute('disabled');
    demo?.addEventListener('click', () => { start = sceneTime; render(); });
    skip?.addEventListener('click', () => { start = sceneTime - buildDuration - waitForWitch; render(); });
    document.addEventListener('visibilitychange', resume);
    resume();
  }).catch(() => { layer.remove(); });
})();
