(() => {
  'use strict';

  const scene = document.querySelector('.mission-art svg');
  const kiln = scene?.querySelector('#kiln-side');
  if (!kiln || scene.dataset.pixelDetails) return;
  scene.dataset.pixelDetails = 'true';

  const ns = 'http://www.w3.org/2000/svg';
  function add(parent, artwork, before = null, tag = 'g') {
    const layer = document.createElementNS(ns, tag);
    layer.setAttribute('aria-hidden', 'true');
    layer.setAttribute('pointer-events', 'none');
    layer.innerHTML = artwork;
    parent.insertBefore(layer, before);
    return layer;
  }

  add(scene, `
    <linearGradient id="pixel-glass" x2="0" y2="1">
      <stop class="pixel-glass-top" stop-color="#ecf8de"/>
      <stop class="pixel-glass-mid" offset=".54" stop-color="#c0ddd3"/>
      <stop class="pixel-glass-bottom" offset="1" stop-color="#80a59b"/>
    </linearGradient>
    <linearGradient id="pixel-haze" x2="0" y2="1">
      <stop stop-color="#fff2c3" stop-opacity="0"/>
      <stop offset=".72" stop-color="#f9dbb2" stop-opacity=".16"/>
      <stop offset="1" stop-color="#fff0b8" stop-opacity=".68"/>
    </linearGradient>
    <linearGradient id="pixel-roof-plane" x2=".16" y2="1">
      <stop stop-color="#9bbfba"/>
      <stop offset=".42" stop-color="#6e9d9f"/>
      <stop offset="1" stop-color="#436b76"/>
    </linearGradient>
    <radialGradient id="pixel-lunar-halo">
      <stop stop-color="#e8e2b4" stop-opacity=".22"/>
      <stop offset=".58" stop-color="#c7c6b6" stop-opacity=".10"/>
      <stop offset="1" stop-color="#d7e2c6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="pixel-screen-halo">
      <stop stop-color="#a7d484" stop-opacity=".20"/>
      <stop offset="1" stop-color="#75bba3" stop-opacity="0"/>
    </radialGradient>
    <filter id="pixel-night-garden" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values=".75 0 0 0 0  0 .83 0 0 0  0 0 .98 0 .018  0 0 0 1 0"/>
    </filter>
    <linearGradient id="pixel-sun" x2="0" y2="1">
      <stop stop-color="#fff4b5"/><stop offset=".52" stop-color="#ffe49a"/>
      <stop offset="1" stop-color="#ebad61"/>
    </linearGradient>
    <linearGradient id="pixel-moon" x2="0" y2="1">
      <stop stop-color="#fff6cb"/><stop offset=".6" stop-color="#e8d3a7"/>
      <stop offset="1" stop-color="#b9a393"/>
    </linearGradient>
    <pattern id="pixel-wood" width="23" height="7" patternUnits="userSpaceOnUse">
      <path fill="#cf945d" d="M0 0h23v7H0z"/>
      <path fill="#f0bf82" d="M0 0h23v1H0zM2 2h7v1H2zM15 3h6v1h-6zM4 5h5v1H4z"/>
      <path fill="#a9714c" d="M0 6h23v1H0zM8 3h6v1H8zM10 4h2v1h-2zM18 1h4v1h-4z"/>
      <path fill="#ffe0a4" d="M3 1h2v1H3zM17 4h2v1h-2z"/>
    </pattern>
    <pattern id="pixel-earth" width="23" height="13" patternUnits="userSpaceOnUse">
      <path fill="#243c36" opacity=".35" d="M2 3h4v1H2zM15 10h3v1h-3zM7 7h2v2H7zM19 2h2v1h-2z"/>
      <path fill="#c2b880" opacity=".45" d="M0 11h2v1H0zM6 5h2v1H6zM13 4h3v1h-3zM20 8h2v1h-2z"/>
    </pattern>
    <style>
      #kiln-wood > g:not(.wood-spacers) > rect { fill: url(#pixel-wood); }
      .pixel-night-points, .pixel-moonlight { display: none; }
      [data-day="false"] .pixel-night-points, [data-day="false"] .pixel-moonlight { display: inline; }
      [data-day="false"][data-weather="rain"] .pixel-night-points,
      [data-day="false"][data-weather="cloudy"] .pixel-night-points,
      [data-day="false"][data-weather="snow"] .pixel-night-points,
      [data-day="false"][data-weather="fog"] .pixel-night-points { opacity: .19; }
      [data-day="false"] .pixel-day-haze { opacity: .19; }
      [data-day="false"] .pixel-ridges { opacity: .58; }
      [data-day="false"] .pixel-field { opacity: .63; }
      [data-day="false"] .pixel-canopy-light { opacity: .32; }
      [data-day="false"] .pixel-garden { filter: url(#pixel-night-garden); }
      [data-day="false"] .pixel-glass-light { opacity: .35; }
      [data-day="false"] .pixel-glass-top { stop-color: #a3c9c6; }
      [data-day="false"] .pixel-glass-mid { stop-color: #729ba1; }
      [data-day="false"] .pixel-glass-bottom { stop-color: #426776; }
    </style>`, scene.firstElementChild, 'defs');

  const sky = scene.querySelector('.sky-top')?.closest('g');
  const horizon = sky?.querySelector('path[fill="#464f72"]');
  if (horizon) {
    add(sky, `
      <rect class="pixel-day-haze" x="0" y="60" width="400" height="139" fill="url(#pixel-haze)"/>
      <circle class="pixel-moonlight" cx="56" cy="35" r="37" fill="url(#pixel-lunar-halo)" shape-rendering="auto"/>
      <g class="pixel-ridges">
        <path fill="#91b1af" opacity=".78" d="M0 162h8v-6h11v-7h9v-5h13v-7h14v-4h12v4h12v5h11v7h13v4h13v8h15v7h13v12H0zM186 174h13v-6h11v-6h12v-7h12v-8h17v-4h13v3h15v5h12v7h13v6h14v-7h15v-8h11v-6h13v-5h12v4h11v6h11v7h9v25H186z"/>
        <path fill="#c1c8ac" opacity=".54" d="M19 151h10v-5h13v-7h13v-4h11v4H55v5H43v5H29v4H19zM229 155h8v-6h13v-4h14v3h-14v4h-14v5h-7zM342 151h8v-6h9v-5h9v3h-8v5h-10v5h-8z"/>
        <path fill="#618f91" opacity=".66" d="M0 174h10v-4h17v-4h10v-5h9v-5h12v-5h18v5h15v5h10v4h14v6h16v11H0zM198 180v-7h17v-5h14v-5h14v-5h9v-5h18v5h15v5h12v4h16v11zM326 182v-10h15v-5h10v-5h12v-4h14v3h12v4h11v17z"/>
        <path fill="#e4dfba" opacity=".51" d="M3 170h16v-2h13v1H20v2H3zM60 158h15v2h-8v1h-7zM201 172h25v-2h21v1h-21v2h-25zM354 164h26v1h-26z"/>
        <path fill="#4d7883" opacity=".46" d="M6 178h34v-2h14v2H42v2H6zM217 179h31v-2h12v2h-12v2h-31zM340 172h8v-2h18v2h-17v2h-9z"/>
      </g>
      <path class="pixel-night-points" fill="#ece3bc" opacity=".75" d="M20 44h1v1h-1zM83 30h1v1h-1zM98 61h1v1h-1zM143 45h2v1h-2zM172 24h1v1h-1zM190 75h1v1h-1zM229 51h2v1h-2zM246 23h1v1h-1zM265 62h1v1h-1zM299 21h1v1h-1zM317 39h2v1h-2zM355 65h1v1h-1zM384 40h1v1h-1z"/>
      <path class="pixel-night-points" fill="#b0c9dc" opacity=".52" d="M18 15h1v1h-1zM28 82h1v1h-1zM70 53h1v1h-1zM99 22h1v1h-1zM128 67h1v1h-1zM149 25h1v1h-1zM181 48h1v1h-1zM203 31h1v1h-1zM221 73h1v1h-1zM251 53h1v1h-1zM279 18h1v1h-1zM304 71h1v1h-1zM333 46h1v1h-1zM365 36h1v1h-1zM393 77h1v1h-1z"/>
    `, horizon);
    const woods = add(sky, '', horizon.nextElementSibling);
    woods.setAttribute('class', 'pixel-ridges');
    const broadleafTrees = [
      [8, 193, .66, '#5d8476'], [23, 191, .98, '#527e71'],
      [43, 189, .81, '#668979'], [61, 185, .96, '#5f8274'], [80, 189, .66, '#648d7e'],
      [218, 191, .72, '#608579'], [237, 190, 1.02, '#527e71'], [256, 191, .72, '#698b7b'],
      [328, 191, .76, '#62897b'], [347, 190, .83, '#537c72'],
      [367, 188, .99, '#648b7b'], [391, 192, .88, '#547f71']
    ];
    for (const [x, y, scale, foliage] of broadleafTrees) {
      const tree = add(woods, `
        <path d="M-2 0v-9h-3v-4h2v3h3v-6h2v7h3v-3h2v4H3v8z" fill="#697b66"/>
        <path d="M-15-12v-4h3v-4h5v-2h5v-2h7v2h6v3h4v4h3v4h-3v3H8v2H-3v-1h-9v-2h-4v-3z" fill="${foliage}"/>
        <path d="M-12-15h3v-4h6v-2h7v1h6v3h3v3H9v-2H4v-2H-1v2h-6v2h-5z" fill="#a2b795" opacity=".42"/>
        <path d="M-11-10h6v2h8v-2h7v-2h5v3H8v2H-3v-1h-8z" fill="#3f6d65" opacity=".5"/>
      `);
      tree.setAttribute('transform', `translate(${x} ${y}) scale(${scale})`);
    }
  }
  scene.querySelector('.sky-sun')?.setAttribute('fill', 'url(#pixel-sun)');
  scene.querySelector('.sky-moon')?.setAttribute('fill', 'url(#pixel-moon)');
  for (const cloud of scene.querySelectorAll('.sky-clouds > g')) {
    add(cloud, `
      <path d="M5 19h12v-6h15V7h17v3h13v3H43v-3h-9v6H20v5H5z" fill="#fff6e4" opacity=".37"/>
      <path d="M13 23h18v-2h24v-3h19v2H57v3H35v2H13z" fill="#778da0" opacity=".27"/>
      <path d="M42 14h8v1h-8zM56 15h10v1H56zM25 18h7v1h-7z" fill="#f6f4ef" opacity=".43"/>
      <path d="M0 24h16v2H0zM23 24h21v2H23zM58 23h22v2H58zM32 12h4v2h-4zM51 9h4v2h-4zM19 16h4v2h-4zM70 18h5v2h-5z" fill="#93a4b1" opacity=".43"/>
      <path d="M12 17h7v1h-7zM34 7h13v1H34zM51 13h6v1h-6zM67 16h5v1h-5z" fill="#fff9e9" opacity=".62"/>
    `);
  }

  // Give the roof and far wall depth while keeping the cutaway readable.
  add(scene, `
    <path fill="#335752" stroke="#2d4649" stroke-width="2" d="M190 128l15-7v71l-15 9z"/>
    <path fill="#557e76" d="M193 132l9-5v61l-9 6z"/>
    <path fill="#98b4a0" opacity=".53" d="M194 132l3-2v60l-3 2z"/>
    <path fill="url(#pixel-roof-plane)" stroke="#2b474d" stroke-width="2" d="M107 80l14-9 86 47-16 10z"/>
    <path d="M122 74l81 44-3 2-81-44z" fill="#d6e6c8" opacity=".65"/>
    <path d="M125 77l-10 7m24 0-11 8m25 0-11 8m25 0-11 8m25 0-11 8m24 0-11 7" fill="none" stroke="#406474" stroke-width="1" opacity=".83"/>
    <path fill="#c0dbbd" opacity=".62" d="M130 81l9 5-2 2-9-5zM157 96l10 5-2 2-10-5zM184 111l9 5-2 2-9-5z"/>
  `, kiln);

  // Lay the reflections under the load and the animated air paths.
  kiln.firstElementChild.setAttribute('fill', 'url(#pixel-glass)');
  const glass = add(kiln, `
    <path fill="#6d9b98" opacity=".24" d="M181 128l6 3v65h-6zM111 191h76v6h-76z"/>
    <path fill="#f6ffe7" opacity=".41" d="M113 95l24 13-24 31zM144 112l9 5-35 50h-4zM156 119l5 3-21 29h-4z"/>
    <path fill="none" stroke="#f5fff0" stroke-width="1" opacity=".7" d="M113 147v31m1 4v6M184 136v35"/>
    <path fill="#4a6655" d="M111 195h76v2h-76z"/>
    <path fill="#abcbb4" d="M115 194h7v1h-7zm15 0h7v1h-7zm15 0h7v1h-7zm15 0h7v1h-7zm15 0h7v1h-7z"/>
    <path d="M110 151h77m-77 24h77" stroke="#335d63" stroke-width="1" opacity=".13"/>
    <path d="M111 182h25v1h-25zm21 5h17v1h-17zm19-22h13v1h-13zm13-13h23v1h-23z" fill="#fbffe8" opacity=".42"/>
  `, kiln.querySelector('#kiln-wood'));
  glass.setAttribute('class', 'pixel-glass-light');
  add(kiln, `
    <path fill="none" stroke="#b2d7cf" stroke-width="1" d="M109 79l81 44"/>
    <path fill="none" stroke="#507b84" stroke-width="1" d="M109 85l81 44"/>
    <path fill="#97b7aa" d="M108 100h2v2h-2zm0 21h2v2h-2zm0 22h2v2h-2zm0 25h2v2h-2zm0 22h2v2h-2zm81-50h2v2h-2zm0 25h2v2h-2zm0 25h2v2h-2z"/>
    <path fill="#edcca1" d="M126 101h2v5h-1v5h-1z"/>
    <path fill="#77968e" d="M107 197h84v1h-84zM188 130h1v65h-1z"/>
  `, kiln.querySelector('#kiln-wind'));

  const field = add(scene, `
    <path fill="#294b43" opacity=".5" d="M101 201h92l10 3h-11l-5 2h-76l-7-2h-9zM290 201h22l11 3h-7l8 2h-34l-9-2z"/>
    <path fill="#447d5c" d="M3 209h20v-2h8v3h13v2H3zM55 207h12v-2h18v2h10v2H55zM223 209h15v-2h12v3h18v2h-45zM345 208h16v-2h13v3h23v2h-52z"/>
    <path fill="#365f50" d="M0 216h29v-2h19v2h23v4H0zM127 218h39v-2h21v2h23v2h-83zM255 216h29v-2h29v2h25v4h-83zM368 216h32v4h-32z"/>
    <path fill="#a5bd79" d="M12 205h5v1h-5zm27 0h7v1h-7zm32-3h6v1h-6zm12 7h8v1h-8zm134-6h4v1h-4zm38 1h7v1h-7zm14 5h8v1h-8zm60-8h5v1h-5zm18 4h6v1h-6zm36 0h6v1h-6z"/>
    <path fill="#cfab88" d="M28 208h3v2h-3zm44 4h3v2h-3zm150-1h4v2h-4zm116 0h4v2h-4zm39 3h3v1h-3z"/>
    <path fill="#e9cc94" d="M19 202h2v3h-2zm29 4h2v2h-2zm180-4h2v2h-2zm112 0h2v2h-2zm28 4h2v2h-2z"/>
    <path fill="url(#pixel-earth)" d="M0 204h85v16H0zM97 209h114v11H97zM222 204h178v16H222z"/>
    <path fill="#305c4d" d="M0 209h8v-3h7v-4h8v3h7v3h8v7H0zM45 214v-4h8v-3h11v4h5v5H45zM344 213h6v-4h7v-4h10v2h8v-5h11v4h8v3h6v11h-56z"/>
    <path fill="#588a62" d="M1 209h8v-2h7v-4h7v2h7v2H17v3H1zM47 212h9v-3h8v2h-7v2H47zM351 210h8v-4h8v2h9v-4h9v2h9v2h-12v2h-24v2h-7z"/>
    <path fill="#a8b877" d="M7 204h1v4H7zM15 201h1v5h-1zM22 202h2v2h-2zM54 209h1v3h-1zM360 205h1v4h-1zM376 203h1v4h-1zM386 201h2v3h-2z"/>
  `, scene.querySelector('#scene-esp'));
  field.setAttribute('class', 'pixel-field');
  const wildflowers = [
    [10, 214, '#f1b4ad'], [22, 217, '#f1d990'], [36, 213, '#cfb9dc'],
    [59, 217, '#f2cb9a'], [76, 213, '#efada5'], [230, 216, '#f1d990'],
    [249, 212, '#d6c1e2'], [267, 216, '#efa9a5'], [326, 214, '#f2ca99'],
    [352, 217, '#f3d68d'], [373, 215, '#dab4dc'], [389, 217, '#edafa6']
  ];
  for (const [x, y, petals] of wildflowers) {
    const flower = add(field, `
      <path fill="#274f40" d="M-1-5h2v5h-2zM-3-3h2v1h-2zM1-2h2v1H1z"/>
      <path fill="#91a66b" d="M0-4h1v3H0z"/>
      <path fill="${petals}" d="M-1-8h2v1h2v2H1v1h-2v-1h-2v-2h2z"/>
      <path fill="#f9e6a6" d="M-1-7h2v2h-2z"/>
    `);
    flower.setAttribute('transform', `translate(${x} ${y})`);
  }

  function decorateTree() {
    const tree = scene.querySelector('.guava-tree');
    if (!tree || tree.querySelector('.pixel-canopy-light')) return;
    add(tree, `
      <path fill="#3c4336" opacity=".28" d="M302 162h2v36h-2zm-4-19h2v15h-2zm14-26h2v15h-2zm-34 35h11v2h-11zm43-13h2v7h-2z"/>
      <path fill="#efd1a0" opacity=".51" d="M299 170h1v9h-1zm0 16h1v8h-1zm7-45h1v10h-1zm-15-18h1v8h-1zm29 24h3v1h-3z"/>
      <path fill="#223e31" opacity=".21" d="M276 74h12v4h15v-6h18v-4h6v7h-22v8h-20v-5h-9zM244 102h15v5h17v-4h12v5h-16v9h-21v-7h-7zM321 104h15v6h19v-5h8v5h-18v6h-22zM279 122h15v7h22v-5h8v8h-24v-5h-15z"/>
    `);
    const leaves = add(tree, `
      <path fill="#d9de9c" opacity=".58" d="M281 59h7v2h-7zm10 4h4v2h-4zm9-12h12v2h-12zm16 8h6v2h-6zm-59 32h8v2h-8zm11-7h10v2h-10zm7 14h5v2h-5zm7 13h8v2h-8zm14 5h5v2h-5zm9-10h7v2h-7zm11 11h4v2h-4zm16-31h8v2h-8zm10-8h8v2h-8zm9 13h8v2h-8zm-17 7h5v2h-5z"/>
      <path fill="#f1e9aa" opacity=".55" d="M284 62h2v1h-2zm22-9h2v1h-2zm12 8h2v1h-2zm-59 33h2v1h-2zm16-6h2v1h-2zm14 29h2v1h-2zm20-7h2v1h-2zm31-22h2v1h-2zm11-7h2v1h-2z"/>
    `);
    leaves.setAttribute('class', 'pixel-canopy-light');
    const leafGroups = [
      [276,66], [286,58], [297,63], [307,53], [319,61], [309,72],
      [253,99], [262,91], [273,86], [283,94], [266,108],
      [284,115], [296,110], [305,118], [318,112], [313,127],
      [326,95], [337,86], [348,80], [357,91], [344,103], [358,102]
    ];
    for (const [x, y] of leafGroups) {
      const leaf = add(leaves, `
        <path d="M-5 0h2v-2h5v1h2v2H1v2h-4V2h-2z" fill="#bad37d" opacity=".31"/>
        <path d="M-2-1h3v1h-3zM2 0h1v1H2z" fill="#e5e5a7" opacity=".69"/>
        <path d="M-3 2h5v1h-5zM0 3h3v1H0z" fill="#354f3e" opacity=".38"/>
      `);
      leaf.setAttribute('transform', `translate(${x} ${y})`);
    }
    for (const fruit of tree.parentNode.querySelectorAll('.guava-fruit')) {
      add(fruit, '<path d="M-2-3h2v1h-2zM-3-1h1v2h-1z" fill="#fff1ae" opacity=".76"/><path d="M0 2h3v1H2v2H0z" fill="#8c7848" opacity=".53"/><path d="M1-5h2v1H1z" fill="#50774d"/><path d="M2 0h1v1H2zM1 2h1v1H1z" fill="#998a52" opacity=".65"/>');
    }
  }
  const garden = scene.querySelector('.guava-tree')?.parentNode;
  if (garden) {
    garden.classList.add('pixel-garden');
    decorateTree();
    new MutationObserver(decorateTree).observe(garden, { childList: true });
  }

  const esp = scene.querySelector('#scene-esp');
  if (esp) {
    add(esp, `
      <path fill="#a9d2ac" d="M320 135h37v2h-34v35h-3z"/>
      <path fill="none" stroke="#487d69" stroke-width="1.5" d="M323 140h4v5m-4 7h4m-3 12v5h10m13-3v5h8v-7m-1-22h4v8h-4"/>
      <path fill="#c5d0ba" d="M332 144h15v2h-15zm0 13h2v2h-2zm13 0h2v2h-2z"/>
      <path fill="#435960" d="M334 148h13v7h-13z"/>
      <path fill="#f6c66d" d="M323 139h2v2h-2zm30 1h3v2h-3zm2 17h3v2h-3zm-24 14h3v2h-3z"/>
    `, esp.querySelector('.esp-signal'));
  }
  const clock = scene.querySelector('.scene-clock');
  if (clock) {
    add(clock, `
      <path fill="#415b61" d="M323 8h66v2h-65v17h-1z"/>
      <path fill="#172831" d="M325 11h62v16h-62z"/>
      <rect x="325" y="11" width="62" height="16" fill="url(#pixel-screen-halo)"/>
      <path fill="#8ca99a" d="M324 8h42v1h-42zM387 10h2v2h-2z"/>
      <path fill="#2e464e" d="M328 12h57v1h-57zM328 25h57v1h-57zM389 14h1v11h-1z"/>
      <path fill="#83b887" d="M327 24h2v2h-2z"/>
    `, clock.querySelector('#scene-clock-digits'));
  }

  const owl = scene.querySelector('#scene-owl');
  const owlHead = owl?.querySelector('.owl-head');
  if (owlHead) {
    add(owlHead.parentNode, '<path d="M-5-9h2v1h-2zm6 0h2v1H1zm-4 3h2v1h-2zm5 1h2v1H2zm-2 2h2v1H0z" fill="#bb8f9b" opacity=".7"/>', owlHead);
    add(owlHead, '<path d="M-9-23h2v1h-2zm2 1h3v1h-3zm11 0h3v1H4zm3-1h2v1H7z" fill="#f3c6d7"/><path d="M-8-16h2v1h-2zm14 0h2v1H6z" fill="#e5a6a8"/><path d="M-7-13h3v1h-3zm11 0h3v1H4z" fill="#a66c97"/>');
  }
  const vulture = scene.querySelector('#scene-vulture');
  if (vulture) {
    add(vulture, '<path d="M-5-13h3v1h-3zm6 1h3v1H1zm-5 3h2v1h-2zm6 2h2v1H2z" fill="#a1a7aa" opacity=".58"/><path d="M-5-20h2v2h-2zm6 0h2v2H1z" fill="#fff1d5"/><path d="M-7-27h2v1h-2zm10-2h2v1H3zM-1-21h3v1h-3z" fill="#e1bdad"/><path d="M-7-5h3v1h-3zm11 0h3v1H4z" fill="#273740"/>');
    const wings = vulture.querySelector('.vulture-wings');
    if (wings) add(wings, '<path d="M-31-18h5v1h-5zm5 4h5v1h-5zm5 4h5v1h-5zm47-8h5v1h-5zm-5 4h5v1h-5zm-5 4h5v1h-5z" fill="#acb4b8" opacity=".62"/>');
  }
  const frog = scene.querySelector('#scene-frog');
  if (frog) {
    add(frog, '<path d="M-7-4h2v1h-2zm12 0h2v1H5zm-4-3h2v1H1z" fill="#c1d784"/><path d="M-4 0h8v1h-8z" fill="#b1be75"/>');
  }
  const puddles = scene.querySelector('#garden-puddles');
  if (puddles) {
    add(puddles, '<path d="M49 212h9m5 1h10m164-2h8m6 1h12m84 4h8m7 0h12" fill="none" stroke="#f0f7e5" opacity=".55"/>');
  }
})();
