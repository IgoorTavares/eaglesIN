/* Mascote climático: duas nuvens (feliz com sol / brava com chuva e raios)
   feitas a partir dos PNGs originais, com camadas SVG animadas por cima:
   pálpebras (piscar), boca (fala), sol (raios de luz), chuva, relâmpago e pássaros.

   Mesma API da antiga nuvem 3D, usada pelo app.js:
     init(), mount(el, 'full'|'bust'), setMood(m), setTalking(bool), play(gesto), onTap
   E mais:
     setActivity('listening' | 'thinking' | null)  -> estado real de microfone / IA

   Humor -> clima:
     feliz, orgulhosa, neutra  -> nuvem feliz (sol)
     irritada, chocada         -> nuvem brava (chuva e raios)
     sem conexão (evento real do navegador) -> nuvem brava acinzentada
*/

const ART = {
  happy: { src: './icons/mascot/happy.png', w: 1067, h: 968 },
  storm: { src: './icons/mascot/storm.png', w: 1153, h: 1192 },
};
const STORM_MOODS = new Set(['irritada', 'chocada']);
const MOODS = new Set(['neutra', 'feliz', 'orgulhosa', 'irritada', 'chocada']);
const LABEL = {
  neutra: 'Nuvem tranquila', feliz: 'Nuvem feliz', orgulhosa: 'Nuvem orgulhosa',
  irritada: 'Nuvem brava, com chuva e raios', chocada: 'Nuvem chocada, com chuva e raios',
};

const SVGNS = 'http://www.w3.org/2000/svg';
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => reduceMQ.matches;
const rand = (a, b) => a + Math.random() * (b - a);

/* ---------- camadas de cada nuvem (coordenadas em pixels do PNG) ---------- */
function eyeLid(id, { cx, cy, rx, ry }, colors) {
  // Pálpebra: desce de cima do olho e cobre tudo; a linha dos cílios fica a 80% da altura.
  // A máscara tem borda degradê para a pálpebra se fundir com a pele da nuvem.
  const top = cy - ry, h = ry * 2, lash = top - h * 0.2;
  return `
    <radialGradient id="${id}-m"><stop offset=".8" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
    <mask id="${id}" maskUnits="userSpaceOnUse" x="${cx - rx - 10}" y="${top - 10}" width="${rx * 2 + 20}" height="${h + 20}">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx + 6}" ry="${ry + 6}" fill="url(#${id}-m)"/>
    </mask>
    <g mask="url(#${id})">
      <g class="m-lid" style="--lid:${Math.round(h + 12)}px">
        <rect x="${cx - rx - 8}" y="${top - h * 1.2 - 12}" width="${rx * 2 + 16}" height="${h * 1.2 + 6}" fill="url(#${id}-g)"/>
        <path d="M${cx - rx * 0.92} ${lash - 8} Q${cx} ${lash + 14} ${cx + rx * 0.92} ${lash - 8}" stroke="${colors[2]}" stroke-width="8" fill="none" stroke-linecap="round"/>
      </g>
    </g>
    <linearGradient id="${id}-g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/>
    </linearGradient>`;
}

function mouthCopy(id, src, w, h, m) {
  // Cópia da própria arte, mascarada na região da boca, que se estica para "falar".
  return `
    <radialGradient id="${id}-soft"><stop offset=".62" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
    <mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">
      <ellipse cx="${m.cx}" cy="${m.cy}" rx="${m.rx}" ry="${m.ry}" fill="url(#${id}-soft)"/>
    </mask>
    <g class="m-jaw" style="transform-origin:${m.cx}px ${m.top}px">
      <image href="${src}" width="${w}" height="${h}" mask="url(#${id})"/>
    </g>`;
}

function happySVG(p) {
  const { src, w, h } = ART.happy;
  const sun = { cx: 700, cy: 300 };
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2, a2 = a + 0.13;
    const r = 640;
    return `M${sun.cx} ${sun.cy} L${sun.cx + Math.cos(a) * r} ${sun.cy + Math.sin(a) * r} L${sun.cx + Math.cos(a2) * r} ${sun.cy + Math.sin(a2) * r}Z`;
  }).join('');
  const bird = (x, y, s, d, delay) => `
    <g class="m-bird" style="--bx:${x}px;--by:${y}px;--bd:${d}s;--bdel:${delay}s">
      <g transform="scale(${s})"><path class="m-wing" d="M-22 0 Q-11 -12 0 0 Q11 -12 22 0" stroke="#34506f" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    </g>`;
  return `
  <svg class="m-svg" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="${p}-glow"><stop offset="0" stop-color="#ffe680" stop-opacity=".85"/><stop offset=".45" stop-color="#ffd23f" stop-opacity=".35"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></radialGradient>
      <radialGradient id="${p}-rays" cx="${sun.cx}" cy="${sun.cy}" r="640" gradientUnits="userSpaceOnUse"><stop offset=".3" stop-color="#fff2a8" stop-opacity=".55"/><stop offset="1" stop-color="#fff2a8" stop-opacity="0"/></radialGradient>
    </defs>
    <g class="m-sunfx">
      <path class="m-rays" d="${rays}" fill="url(#${p}-rays)" style="transform-origin:${sun.cx}px ${sun.cy}px"/>
      <circle class="m-glow" cx="${sun.cx}" cy="${sun.cy}" r="430" fill="url(#${p}-glow)" style="transform-origin:${sun.cx}px ${sun.cy}px"/>
    </g>
    <image href="${src}" width="${w}" height="${h}"/>
    ${mouthCopy(p + '-mouth', src, w, h, { cx: 490, cy: 702, rx: 150, ry: 108, top: 632 })}
    ${eyeLid(p + '-el', { cx: 361, cy: 557, rx: 73, ry: 57 }, ['#f6f6f7', '#dcdce0', '#4a3a33'])}
    ${eyeLid(p + '-er', { cx: 607, cy: 552, rx: 71, ry: 56 }, ['#f6f6f7', '#dcdce0', '#4a3a33'])}
    <g class="m-birds">${bird(-60, 120, 1, 11, 0)}${bird(-60, 190, .75, 13, 3.5)}${bird(-60, 70, .6, 15, 7)}</g>
  </svg>`;
}

function stormSVG(p) {
  const { src, w, h } = ART.storm;
  const drops = [
    [150, 720, 1.25, 0], [260, 760, 1.05, .45], [395, 700, 1.35, .2], [470, 820, 1.15, .8], [610, 760, 1.4, .1],
    [700, 700, 1.1, .6], [790, 800, 1.3, .35], [905, 720, 1.2, .9], [1010, 760, 1.05, .25], [330, 860, 1.3, 1.0], [860, 880, 1.2, .7],
  ].map(([x, y, d, del]) => `<path class="m-drop" style="--dx:${x}px;--dy:${y}px;--dd:${d}s;--ddel:${del}s"
      d="M0 -22 C7 -8 11 0 11 8 A11 11 0 0 1 -11 8 C-11 0 -7 -8 0 -22Z" fill="url(#${p}-drop)"/>`).join('');
  return `
  <svg class="m-svg" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="${p}-drop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9dcff"/><stop offset="1" stop-color="#3f86d6"/></linearGradient>
      <linearGradient id="${p}-boltfade" x1="0" y1="0" x2="0" y2="1"><stop offset=".5" stop-color="#000"/><stop offset=".6" stop-color="#fff"/></linearGradient>
      <mask id="${p}-bolts" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="url(#${p}-boltfade)"/></mask>
      <filter id="${p}-bright" x="-5%" y="-5%" width="110%" height="110%">
        <feComponentTransfer><feFuncR type="linear" slope="1.7"/><feFuncG type="linear" slope="1.7"/><feFuncB type="linear" slope="1.3"/></feComponentTransfer>
        <feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <radialGradient id="${p}-flash" cx="${w / 2}" cy="${h * 0.78}" r="${w * 0.6}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff6b0" stop-opacity=".9"/><stop offset="1" stop-color="#fff6b0" stop-opacity="0"/></radialGradient>
    </defs>
    <rect class="m-flash-bg" width="${w}" height="${h}" fill="url(#${p}-flash)"/>
    <g class="m-rain">${drops}</g>
    <image href="${src}" width="${w}" height="${h}"/>
    <g class="m-bolts"><image href="${src}" width="${w}" height="${h}" mask="url(#${p}-bolts)" filter="url(#${p}-bright)"/></g>
    ${mouthCopy(p + '-mouth', src, w, h, { cx: 598, cy: 552, rx: 150, ry: 62, top: 515 })}
    ${eyeLid(p + '-el', { cx: 455, cy: 425, rx: 93, ry: 83 }, ['#5c5f73', '#44475a', '#23252c'])}
    ${eyeLid(p + '-er', { cx: 741, cy: 422, rx: 89, ry: 85 }, ['#5c5f73', '#44475a', '#23252c'])}
  </svg>`;
}

/* ---------- gestos (Web Animations API) ---------- */
const GESTURES = {
  wave: [[0, 0, 0, 1, 1], [0, 0, -7, 1, 1], [0, 0, 7, 1, 1], [0, 0, -5, 1, 1], [0, 0, 0, 1, 1]],
  point: [[0, 0, 0, 1, 1], [14, -4, 8, 1, 1], [14, -4, 8, 1, 1], [0, 0, 0, 1, 1]],
  facepalm: [[0, 0, 0, 1, 1], [0, 10, -4, 1.06, .9], [0, 10, -4, 1.06, .9], [0, 0, 0, 1, 1]],
  thumbs: [[0, 0, 0, 1, 1], [0, 6, 0, 1.06, .94], [0, -18, 0, .96, 1.06], [0, 0, 0, 1, 1]],
  jump: [[0, 0, 0, 1, 1], [0, 8, 0, 1.1, .88], [0, -38, 0, .93, 1.08], [0, 0, 0, 1.06, .94], [0, 0, 0, 1, 1]],
  no: [[0, 0, 0, 1, 1], [-12, 0, -3, 1, 1], [12, 0, 3, 1, 1], [-9, 0, -2, 1, 1], [9, 0, 2, 1, 1], [0, 0, 0, 1, 1]],
  yes: [[0, 0, 0, 1, 1], [0, 9, 0, 1, .97], [0, -3, 0, 1, 1], [0, 9, 0, 1, .97], [0, 0, 0, 1, 1]],
  wag: [[0, 0, 0, 1, 1], [0, 0, -6, 1, 1], [0, 0, 6, 1, 1], [0, 0, -6, 1, 1], [0, 0, 6, 1, 1], [0, 0, 0, 1, 1]],
  stomp: [[0, 0, 0, 1, 1], [0, -16, 0, .95, 1.05], [0, 6, 0, 1.12, .86], [-6, 4, 0, 1.05, .95], [6, 2, 0, 1, 1], [0, 0, 0, 1, 1]],
  shrug: [[0, 0, 0, 1, 1], [0, -10, -5, 1, 1.04], [0, -10, 5, 1, 1.04], [0, 0, 0, 1, 1]],
};
const GEST_MS = { wave: 900, point: 900, facepalm: 1100, thumbs: 700, jump: 750, no: 650, yes: 700, wag: 900, stomp: 800, shrug: 1000 };

class Mascot {
  constructor() {
    this.ready = false;
    this.onTap = null;
    this.mood = 'neutra';
    this.activity = null;
    this.talking = false;
    this.root = null;
    this.timers = {};
  }

  async init() {
    if (this.ready) return;
    // Pré-carrega as duas artes; se falhar, o app cai no emoji.
    await Promise.all(Object.values(ART).map((a) => new Promise((ok, fail) => {
      const img = new Image();
      img.onload = ok; // decode() pode ficar pendente com a aba em segundo plano
      img.onerror = () => fail(new Error('Não carregou ' + a.src));
      img.src = a.src;
    })));
    this.build();
    this.ready = true;
  }

  build() {
    const uid = Math.random().toString(36).slice(2, 7); // IDs SVG únicos na página
    const r = document.createElement('div');
    r.className = 'mascot is-happy';
    r.setAttribute('role', 'img');
    r.tabIndex = 0;
    r.innerHTML = `
      <div class="m-shadow"></div>
      <div class="m-float"><div class="m-tilt"><div class="m-body">
        <div class="m-layer m-happy" style="--ar:${(ART.happy.w / ART.happy.h).toFixed(4)}">${happySVG('mh' + uid)}</div>
        <div class="m-layer m-storm" style="--ar:${(ART.storm.w / ART.storm.h).toFixed(4)}">${stormSVG('ms' + uid)}</div>
      </div></div></div>
      <div class="m-ring" aria-hidden="true"></div>
      <div class="m-think" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="m-alert" aria-hidden="true">!</div>
      <div class="m-offline" aria-hidden="true">sem conexão</div>
      <div class="m-sparks" aria-hidden="true"></div>`;
    this.root = r;
    this.body = r.querySelector('.m-body');
    this.tilt = r.querySelector('.m-tilt');
    this.jaws = [...r.querySelectorAll('.m-jaw')];

    // Toque / clique: pula e avisa o app.
    let down = null;
    r.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    r.addEventListener('pointerup', (e) => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 10) { this.play('jump'); this.onTap?.(); }
      down = null;
    });
    r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.play('jump'); this.onTap?.(); } });
    // Inclinação 3D seguindo o ponteiro.
    r.addEventListener('pointermove', (e) => {
      if (reduced() || e.pointerType === 'touch') return;
      const b = r.getBoundingClientRect();
      const x = ((e.clientX - b.left) / b.width - 0.5) * 2, y = ((e.clientY - b.top) / b.height - 0.5) * 2;
      this.tilt.style.setProperty('--ry', (x * 9).toFixed(1) + 'deg');
      this.tilt.style.setProperty('--rx', (-y * 7).toFixed(1) + 'deg');
    });
    r.addEventListener('pointerleave', () => { this.tilt.style.setProperty('--ry', '0deg'); this.tilt.style.setProperty('--rx', '0deg'); down = null; });

    addEventListener('online', () => this.apply());
    addEventListener('offline', () => this.apply());
    reduceMQ.addEventListener?.('change', () => this.apply());
    document.addEventListener('visibilitychange', () => this.loops());
    this.apply();
  }

  mount(el, mode = 'full') {
    if (!this.ready || !el) return false;
    this.root.classList.toggle('bust', mode === 'bust');
    el.appendChild(this.root);
    this.loops();
    return true;
  }

  get storm() { return STORM_MOODS.has(this.mood) || !navigator.onLine; }

  setMood(m) {
    const next = MOODS.has(m) ? m : 'neutra';
    const prev = this.mood;
    this.mood = next;
    this.apply();
    // Comemoração só quando o app confirma um resultado bom (ele chama setMood depois da resposta).
    if ((next === 'feliz' || next === 'orgulhosa') && prev !== next) this.sparkle(next === 'orgulhosa' ? 8 : 5);
  }

  setActivity(a) {
    this.activity = a === 'listening' || a === 'thinking' ? a : null;
    this.apply();
  }

  setTalking(on) {
    this.talking = !!on;
    this.apply();
  }

  play(name) {
    const k = GESTURES[name];
    if (!k || !this.body || reduced() || !this.body.animate) return;
    this.body.animate(k.map(([x, y, rot, sx, sy]) => ({ transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sx}, ${sy})` })),
      { duration: GEST_MS[name] || 800, easing: 'cubic-bezier(.3,.7,.4,1)', composite: 'replace' });
  }

  /* ---------- estado visual ---------- */
  apply() {
    const r = this.root; if (!r) return;
    const offline = !navigator.onLine;
    const storm = this.storm;
    r.classList.toggle('is-storm', storm);
    r.classList.toggle('is-happy', !storm);
    r.classList.toggle('is-offline', offline);
    r.classList.toggle('is-shocked', this.mood === 'chocada' && !offline);
    r.classList.toggle('is-listening', this.activity === 'listening');
    r.classList.toggle('is-thinking', this.activity === 'thinking');
    r.classList.toggle('is-talking', this.talking);
    r.classList.toggle('reduced', reduced());
    let label = offline ? 'Nuvem brava: sem conexão' : LABEL[this.mood];
    if (this.activity === 'listening') label += ', ouvindo você';
    else if (this.activity === 'thinking') label += ', pensando';
    else if (this.talking) label += ', falando';
    r.setAttribute('aria-label', label);
    this.loops();
  }

  sparkle(n) {
    const box = this.root?.querySelector('.m-sparks'); if (!box || reduced()) return;
    box.innerHTML = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + rand(-.3, .3), d = rand(38, 52);
      return `<i style="--sx:${(Math.cos(a) * d).toFixed(1)}%;--sy:${(Math.sin(a) * d - 8).toFixed(1)}%;--sd:${(i * 0.06).toFixed(2)}s">✦</i>`;
    }).join('');
    clearTimeout(this.timers.spark);
    this.timers.spark = setTimeout(() => { box.innerHTML = ''; }, 1600);
  }

  /* Timers só rodam com o mascote visível na tela. Com "movimento reduzido" ficam só
     os movimentos pequenos (piscar e boca); somem relâmpagos, flutuação, chuva e pássaros. */
  loops() {
    const visible = this.root?.isConnected && document.visibilityState === 'visible';
    const live = visible && !reduced();
    const t = this.timers;
    // Piscar
    if (visible && !t.blink) {
      const blink = () => {
        this.root.classList.add('blink');
        setTimeout(() => this.root.classList.remove('blink'), 150);
        if (Math.random() < 0.2) setTimeout(() => { this.root.classList.add('blink'); setTimeout(() => this.root.classList.remove('blink'), 140); }, 300);
        t.blink = setTimeout(blink, rand(2600, 5200));
      };
      t.blink = setTimeout(blink, rand(1200, 3000));
    } else if (!visible && t.blink) { clearTimeout(t.blink); t.blink = null; }
    // Relâmpagos (só na nuvem brava)
    const wantBolt = live && this.storm;
    if (wantBolt && !t.bolt) {
      const strike = () => {
        this.root.classList.remove('flash'); void this.root.offsetWidth; this.root.classList.add('flash');
        t.bolt = setTimeout(strike, rand(2200, 5200));
      };
      t.bolt = setTimeout(strike, rand(300, 900));
    } else if (!wantBolt && t.bolt) { clearTimeout(t.bolt); t.bolt = null; this.root?.classList.remove('flash'); }
    // Boca enquanto fala: abre e fecha em ritmo irregular, como sílabas.
    const wantJaw = visible && this.talking;
    if (wantJaw && !t.jaw) {
      t.jaw = setInterval(() => {
        const v = Math.random() < 0.18 ? 0 : rand(0.25, 1);
        this.jaws.forEach((j) => j.style.setProperty('--jaw', v.toFixed(2)));
      }, 110);
    } else if (!wantJaw && t.jaw) {
      clearInterval(t.jaw); t.jaw = null;
      this.jaws.forEach((j) => j.style.setProperty('--jaw', '0'));
    }
  }
}

export const stage = new Mascot();
