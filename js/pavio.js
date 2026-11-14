/* ==========================================================
   pavio.js — Professor Pavio em 2.5D (arte PROVISÓRIA recortada da
   folha de referência). Mesma API do mascote da Nuvem:
     init(), mount(el, mode), setMood(emoção canônica), setActivity(a),
     setTalking(bool), play(gesto), activity, onTap
   Camadas por código: troca suave de expressão, boca que mexe na fala,
   vermelhidão de raiva, fumaça, tremor, respiração e brilhos.
   Para trocar pela arte definitiva, basta substituir os arquivos em
   icons/pavio/ (mesmos nomes) e ajustar MOUTH se precisar.
   ========================================================== */

const DIR = './icons/pavio/';
/* emoção -> arquivo */
const ART = {
  neutral: 'neutro', happy: 'alegre', excited: 'alegre', laughing: 'alegre', proud: 'alegre',
  celebrating: 'comemorando', sarcastic: 'debochado', impatient: 'impaciente', tired: 'impaciente',
  huffing: 'bufando', angry: 'bravo', furious: 'raivoso', surprised: 'surpreso',
  disappointed: 'decepcionado', calming: 'neutro', thinking: 'pensando', listening: 'neutro',
};
/* Onde fica a boca em cada arte (fração da imagem). null = sem boca animada (corpo inteiro). */
const MOUTH = {
  neutro: [0.55, 0.78], alegre: [0.55, 0.72], debochado: [0.55, 0.78], surpreso: [0.6, 0.82],
  pensando: [0.55, 0.76], impaciente: [0.5, 0.78], bravo: [0.56, 0.8], bufando: [0.55, 0.78],
  raivoso: [0.56, 0.8], decepcionado: [0.45, 0.82], comemorando: null,
};
const LABEL = {
  neutral: 'tranquilo', happy: 'alegre', excited: 'animado', laughing: 'rindo', proud: 'orgulhoso',
  celebrating: 'comemorando', sarcastic: 'debochado', impatient: 'sem paciência', tired: 'cansado',
  huffing: 'bufando', angry: 'bravo', furious: 'com o pavio estourado', surprised: 'surpreso',
  disappointed: 'decepcionado', calming: 'voltando à calma',
};
/* Intensidade da vermelhidão por emoção (a arte "raivoso" já é vermelha). */
const RED = { angry: 0.32, huffing: 0.42, calming: 0.45 };

const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
// "Pavio sempre animado" (Configurações) ignora o "reduzir movimento" do sistema só no personagem.
const reduced = () => reduceMQ.matches && document.documentElement.dataset.pavioMotion !== 'on';
const rand = (a, b) => a + Math.random() * (b - a);

const GESTURES = {
  jump: [[0, 0, 1], [0, 6, 1.04], [0, -22, 0.97], [0, 0, 1]],
  thumbs: [[0, 0, 1], [0, -10, 1.03], [0, 0, 1]],
  yes: [[0, 0, 1], [0, 6, 1], [0, -2, 1], [0, 6, 1], [0, 0, 1]],
  no: [[0, 0, 1], [-8, 0, 1], [8, 0, 1], [-6, 0, 1], [6, 0, 1], [0, 0, 1]],
  wag: [[0, 0, 1], [-5, 0, 1], [5, 0, 1], [-5, 0, 1], [0, 0, 1]],
  facepalm: [[0, 0, 1], [0, 8, 0.97], [0, 8, 0.97], [0, 0, 1]],
  shrug: [[0, 0, 1], [0, -8, 1.02], [0, 0, 1]],
  stomp: [[0, 0, 1], [0, -12, 1], [0, 4, 0.97], [0, 0, 1]],
  wave: [[0, 0, 1], [4, 0, 1], [-4, 0, 1], [0, 0, 1]],
  point: [[0, 0, 1], [10, -4, 1.03], [0, 0, 1]],
};

class Pavio {
  constructor() {
    this.ready = false; this.onTap = null;
    this.mood = 'neutral'; this.activity = null; this.talking = false;
    this.root = null; this.timers = {}; this.front = 0; this.shown = '';
  }

  async init() {
    if (this.ready) return;
    const files = [...new Set(Object.values(ART))];
    await Promise.all(files.map((f) => new Promise((ok, fail) => {
      const img = new Image();
      img.onload = ok;
      img.onerror = () => fail(new Error('Não carregou ' + f));
      img.src = DIR + f + '.jpg';
    })));
    this.build();
    this.ready = true;
  }

  build() {
    const r = document.createElement('div');
    r.className = 'pavio';
    r.setAttribute('role', 'img');
    r.tabIndex = 0;
    r.innerHTML = `
      <div class="pv-card">
        <div class="pv-body">
          <img class="pv-img on" alt="" draggable="false"><img class="pv-img" alt="" draggable="false">
          <div class="pv-mouth"><img alt="" draggable="false"></div>
          <div class="pv-red"></div>
          <div class="pv-steam" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        </div>
      </div>
      <div class="pv-ring" aria-hidden="true"></div>
      <div class="pv-think" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="pv-offline" aria-hidden="true">sem conexão</div>
      <div class="pv-sparks" aria-hidden="true"></div>`;
    this.root = r;
    this.body = r.querySelector('.pv-body');
    this.imgs = [...r.querySelectorAll('.pv-img')];
    this.mouth = r.querySelector('.pv-mouth');
    this.mouthImg = this.mouth.querySelector('img');
    let down = null;
    r.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    r.addEventListener('pointerup', (e) => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 10) { this.play('jump'); this.onTap?.(); }
      down = null;
    });
    r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.play('jump'); this.onTap?.(); } });
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

  /* Emoção vinda do motor de emoções. "furious" estoura e volta à calma sozinho. */
  setMood(m) {
    const prev = this.mood;
    this.mood = ART[m] && m !== 'thinking' && m !== 'listening' ? m : 'neutral';
    clearTimeout(this.timers.seq1); clearTimeout(this.timers.seq2); clearTimeout(this.timers.seq3);
    if (this.mood === 'furious') {
      // O pavio estoura, ele bufa, respira e volta a sorrir.
      this.timers.seq1 = setTimeout(() => this.setMoodRaw('huffing'), 2400);
      this.timers.seq2 = setTimeout(() => this.setMoodRaw('calming'), 3800);
      this.timers.seq3 = setTimeout(() => this.setMoodRaw('neutral'), 5600);
    }
    this.apply();
    if ((this.mood === 'proud' || this.mood === 'celebrating') && prev !== this.mood) this.sparkle(this.mood === 'celebrating' ? 9 : 6);
  }
  setMoodRaw(m) { this.mood = m; this.apply(); }

  setActivity(a) { this.activity = a === 'listening' || a === 'thinking' ? a : null; this.apply(); }
  setTalking(on) { this.talking = !!on; this.apply(); }

  play(name) {
    const k = GESTURES[name];
    if (!k || !this.body?.animate || reduced()) return;
    this.body.animate(k.map(([x, y, s]) => ({ transform: `translate(${x}px, ${y}px) scale(${s})` })),
      { duration: 700, easing: 'cubic-bezier(.3,.7,.4,1)' });
  }

  /* ---------- estado visual ---------- */
  apply() {
    const r = this.root; if (!r) return;
    const offline = !navigator.onLine;
    // Pensando tem arte própria; ouvindo usa a cara atenta (neutro) com o anel.
    const key = this.activity === 'thinking' ? 'thinking' : this.activity === 'listening' ? 'listening' : this.mood;
    this.show(ART[key] || 'neutro');
    r.style.setProperty('--red', String(RED[this.mood] || 0));
    r.classList.toggle('is-furious', this.mood === 'furious');
    r.classList.toggle('is-steam', this.mood === 'furious' || this.mood === 'huffing');
    r.classList.toggle('is-calming', this.mood === 'calming');
    r.classList.toggle('is-offline', offline);
    r.classList.toggle('is-listening', this.activity === 'listening');
    r.classList.toggle('is-thinking', this.activity === 'thinking');
    r.classList.toggle('is-talking', this.talking);
    r.classList.toggle('reduced', reduced());
    let label = 'Professor Pavio ' + (offline ? 'sem conexão' : LABEL[this.mood] || 'tranquilo');
    if (this.activity === 'listening') label += ', ouvindo você';
    else if (this.activity === 'thinking') label += ', pensando';
    else if (this.talking) label += ', falando';
    r.setAttribute('aria-label', label);
    this.loops();
  }

  /* Troca de expressão com fade entre duas imagens. */
  show(file) {
    if (file === this.shown) return;
    this.shown = file;
    const src = DIR + file + '.jpg';
    const back = this.imgs[1 - this.front];
    back.src = src;
    back.classList.add('on'); this.imgs[this.front].classList.remove('on');
    this.front = 1 - this.front;
    this.root.classList.toggle('is-wide', file === 'comemorando');
    const m = MOUTH[file];
    this.mouth.style.display = m ? '' : 'none';
    if (m) {
      this.mouthImg.src = src;
      this.mouth.style.setProperty('--mx', m[0] * 100 + '%');
      this.mouth.style.setProperty('--my', m[1] * 100 + '%');
    }
  }

  sparkle(n) {
    const box = this.root?.querySelector('.pv-sparks'); if (!box || reduced()) return;
    box.innerHTML = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + rand(-0.3, 0.3), d = rand(40, 54);
      return `<i style="--sx:${(Math.cos(a) * d).toFixed(1)}%;--sy:${(Math.sin(a) * d - 6).toFixed(1)}%;--sd:${(i * 0.05).toFixed(2)}s">✦</i>`;
    }).join('');
    clearTimeout(this.timers.spark);
    this.timers.spark = setTimeout(() => { box.innerHTML = ''; }, 1600);
  }

  /* Boca: só roda com o personagem visível e falando. Com movimento reduzido a boca continua. */
  loops() {
    const visible = this.root?.isConnected && document.visibilityState === 'visible';
    const t = this.timers;
    const want = visible && this.talking;
    if (want && !t.jaw) {
      t.jaw = setInterval(() => this.mouth.style.setProperty('--jaw', (Math.random() < 0.25 ? 0 : rand(0.3, 1)).toFixed(2)), 110);
    } else if (!want && t.jaw) {
      clearInterval(t.jaw); t.jaw = null;
      this.mouth.style.setProperty('--jaw', '0');
    }
  }
}

export const pavio = new Pavio();
