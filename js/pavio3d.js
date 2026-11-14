/* ==========================================================
   pavio3d.js — Professor Pavio em 3D em tempo real (Three.js).
   Mesma API dos outros personagens:
     init(), mount(el, mode), setMood(emoção), setActivity(a),
     setTalking(bool), play(gesto), activity, onTap

   Modelos, em ordem de preferência:
     1. pavio.glb com esqueleto e animações do Mixamo (ainda não existe);
     2. pavio-corpo.glb + pavio-rostos.glb (Tripo, sem esqueleto):
        corpo animado por código e 10 cabeças de expressão no busto;
     3. robô de teste (RobotExpressive, CC0), só se os outros falharem.

   Economia: o Three.js só é baixado quando o 3D é usado; o desenho
   para com a tela escondida e roda a no máximo 30 quadros/s.
   ========================================================== */

/* O Pavio de verdade: gerado pelo tools/blender_pavio_glb.py (animações do Mixamo
   com os nomes da lista NOMES do roteiro). Se o arquivo não existir, usa o robô. */
const MODEL_PAVIO = {
  url: './icons/pavio3d/pavio.glb',
  test: false,
  head: /(^|:|mixamorig\d*)Head$/i, // osso da cabeça do Mixamo
  skin: /skin|face|head|body|pele|rosto/i, // materiais que ficam vermelhos (se nenhum bater, todos)
  clips: {
    idle: 'Idle',
    happy: 'Clap', proud: 'Yes', excited: 'Wave', laughing: 'Laugh', tired: 'Tired',
    celebrating: { name: 'Dance', loop: true, ms: 3500 },
    sarcastic: 'No', impatient: 'Angry', angry: 'Angry', furious: 'Furious',
    surprised: 'Surprised', disappointed: 'Disappointed',
  },
  // estados reais do app que viram animação contínua (só quando ele está parado)
  activity: { thinking: 'Think', talking: 'Talk' },
  gestures: { jump: 'Jump', thumbs: 'Clap', yes: 'Yes', no: 'No', wag: 'No', facepalm: 'Disappointed', shrug: 'No', wave: 'Wave', point: 'Point', stomp: 'Angry' },
  face: {}, // modelos do Mixamo não têm morphs de rosto; um artista 3D pode acrescentar
};

/* O Pavio "estátua" (Tripo, sem esqueleto): corpo inteiro otimizado + 10 cabeças de expressão
   recortadas da folha de referência (tools/COMO-GERAR-PAVIO-3D.md explica como foram geradas).
   O movimento é todo por código: respira, balança, pula, treme, murcha. No busto (chat e aulas)
   aparece a cabeça com a expressão da emoção atual. */
const MODEL_STATIC = {
  url: './icons/pavio3d/pavio-corpo.glb',
  faces: './icons/pavio3d/pavio-rostos.glb',
  test: false,
  procedural: true,
  yaw: -0.45, // o modelo vem virado; assim ele fica de frente, apontando para quem olha
  clips: {}, gestures: {}, activity: {}, face: {},
  // emoção -> cabeça de expressão (nomes dos nós expr_* do pavio-rostos.glb)
  faceFor: {
    neutral: 'neutro', calming: 'neutro', happy: 'alegre', excited: 'alegre', laughing: 'alegre', celebrating: 'alegre',
    proud: 'debochado', sarcastic: 'debochado', impatient: 'impaciente', tired: 'impaciente',
    huffing: 'bufando', angry: 'bravo', furious: 'raivoso', surprised: 'surpreso', disappointed: 'decepcionado',
  },
  // Corpo inteiro por expressão (icons/pavio3d/corpos/<nome>.glb), baixado só quando aparece.
  // yaw = giro para ficar de frente (cada modelo veio virado de um jeito).
  bodies: {
    alegre: { yaw: 0 }, debochado: { yaw: 0 }, surpreso: { yaw: 0 }, pensando: { yaw: 0 }, impaciente: { yaw: 0 },
    bravo: { yaw: 0 }, bufando: { yaw: 0 }, raivoso: { yaw: 0 }, decepcionado: { yaw: 0 }, escutando: { yaw: 0 }, cansado: { yaw: 0 },
  },
  // emoção -> corpo (o que não estiver aqui usa a mesma chave de faceFor; 'neutro' é o pavio-corpo.glb)
  bodyFor: { tired: 'cansado' },
  // gesto -> duração (ms) e cabeça durante o gesto
  gestureFx: {
    jump: { ms: 800, face: 'alegre' }, thumbs: { ms: 900, face: 'alegre' }, yes: { ms: 900 }, wave: { ms: 1000, face: 'alegre' },
    point: { ms: 900 }, no: { ms: 900, face: 'debochado' }, wag: { ms: 1000, face: 'debochado' }, shrug: { ms: 900, face: 'debochado' },
    facepalm: { ms: 1700, face: 'decepcionado' }, stomp: { ms: 1000, face: 'bravo' },
  },
};

const MODEL_TEST = {
  url: './icons/pavio3d/teste-robo.glb',
  test: true, // true = boneco provisório (mostra o aviso "3D em teste")
  head: 'Head',
  activity: {},
  // emoção -> animação do corpo (loop = continua; senão toca uma vez e volta ao idle)
  clips: {
    idle: 'Idle',
    happy: 'ThumbsUp', proud: 'Yes', excited: 'Wave', laughing: 'Yes',
    celebrating: { name: 'Dance', loop: true, ms: 3200 },
    sarcastic: 'No', impatient: 'No', disappointed: 'No',
    angry: 'Punch', furious: 'Punch', surprised: 'Jump',
  },
  gestures: { jump: 'Jump', thumbs: 'ThumbsUp', yes: 'Yes', no: 'No', wag: 'No', facepalm: 'No', shrug: 'No', wave: 'Wave', point: 'Wave', stomp: 'Punch' },
  // emoção -> pesos dos morphs do rosto (nomes do modelo)
  face: {
    angry: { Angry: 0.7 }, furious: { Angry: 1 }, huffing: { Angry: 0.6 }, impatient: { Angry: 0.35 },
    surprised: { Surprised: 1 }, disappointed: { Sad: 0.9 }, tired: { Sad: 0.5 }, sarcastic: { Angry: 0.2, Sad: 0.25 },
  },
};
/* Vermelhidão por emoção (0..1), aplicada às cores dos materiais. */
const RED = { angry: 0.35, furious: 0.8, huffing: 0.5, calming: 0.4 };
const LABEL = {
  neutral: 'tranquilo', happy: 'alegre', excited: 'animado', laughing: 'rindo', proud: 'orgulhoso',
  celebrating: 'comemorando', sarcastic: 'debochado', impatient: 'sem paciência', tired: 'cansado',
  huffing: 'bufando', angry: 'bravo', furious: 'com o pavio estourado', surprised: 'surpreso',
  disappointed: 'decepcionado', calming: 'voltando à calma',
};

const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => reduceMQ.matches;
export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

class Pavio3D {
  constructor() {
    this.ready = false; this.onTap = null;
    this.mood = 'neutral'; this.activity = null; this.talking = false;
    this.root = null; this.timers = {}; this.red = 0; this.morph = {}; this.mode = 'bust';
  }

  async init() {
    if (this.ready) return;
    if (!webglOK()) throw new Error('Sem WebGL');
    const THREE = await import('three');
    const { GLTFLoader } = await import('./vendor/three/loaders/GLTFLoader.js');
    this.T = THREE;
    // Ordem: Pavio com esqueleto (Mixamo) -> Pavio estátua + cabeças -> robô de teste.
    let gltf;
    const loader = this.loader = new GLTFLoader();
    for (const M of [MODEL_PAVIO, MODEL_STATIC, MODEL_TEST]) {
      try {
        const [g, f] = await Promise.all([loader.loadAsync(M.url), M.faces ? loader.loadAsync(M.faces).catch(() => null) : null]);
        gltf = g; this.facesGltf = f; this.M = M; break;
      } catch (e) { if (M === MODEL_TEST) throw e; }
    }
    this.build(gltf);
    this.ready = true;
  }

  /* Coloca o objeto com a base em y=0 e o centro em x/z=0 (mantém escala/rotação próprias). */
  ground(obj) {
    const THREE = this.T;
    obj.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(obj), c = b.getCenter(new THREE.Vector3());
    obj.position.x -= c.x; obj.position.y -= b.min.y; obj.position.z -= c.z;
    obj.updateMatrixWorld(true);
  }

  /* Pavio estátua: corpo num pivô (gira e balança a partir dos pés) e cabeças num pivô próprio. */
  buildStatic(gltf, faces) {
    const THREE = this.T;
    const body = new THREE.Group();
    this.scene.add(body);
    this.bodyPivot = body;
    this.bodies = { neutro: this.addBody(gltf, this.M.yaw) };
    this.bodyBox = new THREE.Box3().setFromObject(body);
    this.bodyNow = 'neutro'; this.bodyLoading = {};
    this.faces = {};
    if (faces) {
      const fp = new THREE.Group();
      for (const n of [...faces.scene.children]) {
        if (!n.name.startsWith('expr_')) continue;
        const holder = new THREE.Group(); holder.add(n); this.ground(n); fp.add(holder);
        this.faces[n.name.slice(5)] = holder;
      }
      if (this.faces.neutro) {
        this.faceBox = new THREE.Box3().setFromObject(this.faces.neutro);
        for (const h of Object.values(this.faces)) h.visible = false;
        this.scene.add(fp);
        this.facePivot = fp;
      }
    }
    this.pose = { x: 0, y: 0, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1 };
    this.faceNow = null; this.popAt = -9;
    this.model = body;
  }

  /* Põe um corpo no pivô (de frente, base no chão, centralizado). Começa escondido se não for o primeiro. */
  addBody(gltf, yaw = 0) {
    const holder = new this.T.Group();
    gltf.scene.rotation.y = yaw;
    holder.add(gltf.scene); this.ground(gltf.scene);
    holder.visible = !this.bodyPivot.children.length;
    this.bodyPivot.add(holder);
    return holder;
  }

  bodyKey() {
    const g = this.gest;
    if (g && performance.now() < g.end && g.face) return g.face;
    if (this.activity === 'thinking') return 'pensando';
    if (this.activity === 'listening') return 'escutando';
    return this.M.bodyFor[this.mood] || this.M.faceFor[this.mood] || 'neutro';
  }

  /* Troca o corpo inteiro pela expressão pedida. Se ainda não baixou, baixa agora e
     mantém o corpo atual até chegar (ou fica no atual se falhar). */
  setBody(key) {
    if (!this.M.bodies[key] && key !== 'neutro') key = 'neutro';
    const b = this.bodies[key];
    if (!b) {
      if (!this.bodyLoading[key]) {
        this.bodyLoading[key] = this.loader.loadAsync(`./icons/pavio3d/corpos/${key}.glb`)
          .then((g) => { this.bodies[key] = this.addBody(g, this.M.bodies[key].yaw); })
          .catch(() => { this.M.bodies[key] = null; }); // não tenta de novo
      }
      return;
    }
    if (this.bodyNow === key) return;
    for (const h of Object.values(this.bodies)) h.visible = h === b;
    this.bodyNow = key; this.popAt = this.clock.elapsedTime;
  }

  setFace(key) {
    const next = this.faces[key] || this.faces.neutro; if (!next) return;
    for (const h of Object.values(this.faces)) h.visible = h === next;
    if (this.faceNow && this.faceNow !== key) this.popAt = this.clock.elapsedTime;
    this.faceNow = key;
  }

  faceKey() {
    const g = this.gest;
    if (g && performance.now() < g.end && g.face) return g.face;
    if (this.activity === 'thinking') return 'pensando';
    return this.M.faceFor[this.mood] || 'neutro';
  }

  /* Pivô ativo: cabeças no busto (se carregaram), corpo no resto. */
  pivot() { return this.mode === 'bust' && this.facePivot ? this.facePivot : this.bodyPivot; }

  applyMode() {
    if (!this.M?.procedural) return;
    const p = this.pivot();
    this.bodyPivot.visible = p === this.bodyPivot;
    if (this.facePivot) this.facePivot.visible = p === this.facePivot;
  }

  /* Movimento por código, por emoção, atividade, fala e gesto. */
  updateStatic(dt) {
    const P = this.pivot();
    if (this.facePivot && P === this.facePivot) { const k = this.faceKey(); if (k !== this.faceNow) this.setFace(k); }
    else { const k = this.bodyKey(); if (k !== this.bodyNow) this.setBody(k); }
    if (reduced()) { P.position.set(0, 0, 0); P.rotation.set(0, 0, 0); P.scale.set(1, 1, 1); return; }
    const t = this.clock.elapsedTime, H = (P === this.facePivot ? this.faceBox : this.bodyBox).getSize(this.tmpV ??= new this.T.Vector3()).y;
    const s = Math.sin, abs = Math.abs;
    // alvo suave (q) + tremidas rápidas que não passam pelo amortecimento (j)
    const q = { x: 0, y: 0, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1 }, j = { x: 0, y: 0, rx: 0, rz: 0, sy: 0 };
    const br = s(t * 2.1); q.sy += br * 0.012; q.sx -= br * 0.006; // respiração
    q.rz += s(t * 0.9) * 0.015; q.ry += s(t * 0.55) * 0.05; // balanço leve
    switch (this.mood) {
      case 'happy': j.y += abs(s(t * 4)) * 0.012 * H; q.rz += s(t * 4) * 0.02; break;
      case 'excited': j.y += abs(s(t * 6)) * 0.025 * H; break;
      case 'laughing': j.y += abs(s(t * 9)) * 0.015 * H; q.rx -= 0.05; j.sy += s(t * 18) * 0.01; break;
      case 'celebrating': j.y += abs(s(t * 5.5)) * 0.07 * H; j.rz += s(t * 5.5) * 0.08; q.ry += s(t * 2.7) * 0.3; break;
      case 'proud': q.rx -= 0.07; q.sy += 0.02; q.sx += 0.02; break;
      case 'sarcastic': q.rz += 0.1; q.ry += 0.25; q.rx += s(t * 1.5) * 0.02; break;
      case 'impatient': j.y += Math.max(0, s(t * 7)) * 0.006 * H; q.rz += s(t * 3.5) * 0.03; break;
      case 'tired': q.rx += 0.08; q.sy -= 0.02; break;
      case 'huffing': { const p = Math.max(0, s(t * 3)); j.sy += p * 0.025; q.sx += p * 0.02; q.rx += 0.04; break; }
      case 'angry': q.rx += 0.09; j.rz += s(t * 31) * 0.008; break;
      case 'furious': q.rx += 0.1; q.sy += 0.02; j.rz += s(t * 47) * 0.025; j.x += s(t * 53) * 0.006 * H; break;
      case 'surprised': q.rx -= 0.12; q.sy += 0.04; q.y += 0.01 * H; break;
      case 'disappointed': q.rx += 0.14; q.sy -= 0.04; q.y -= 0.005 * H; break;
      case 'calming': q.sy += s(t * 1.2) * 0.02; break;
    }
    if (this.activity === 'listening') { q.rz += 0.12; q.rx += 0.05; }
    else if (this.activity === 'thinking') { q.rz -= 0.09; q.ry -= 0.15; q.rx += s(t * 1.3) * 0.02; }
    if (this.talking) { j.rx += s(t * 10) * 0.03; j.sy += abs(s(t * 10)) * 0.015; }
    const g = this.gest;
    if (g) {
      const k = (performance.now() - g.start) / (g.end - g.start);
      if (k >= 1) this.gest = null;
      else {
        const env = s(Math.PI * k);
        switch (g.name) {
          case 'jump': j.y += env * 0.12 * H; break;
          case 'thumbs': case 'yes': j.rx += s(k * Math.PI * 4) * 0.08 * env; break;
          case 'no': case 'wag': case 'shrug': j.rz += s(k * Math.PI * 6) * 0.06 * env; q.ry += s(k * Math.PI * 6) * 0.25 * env; break;
          case 'facepalm': q.rx += 0.15 * env; break;
          case 'wave': case 'point': j.rz += s(k * Math.PI * 6) * 0.08 * env; break;
          case 'stomp': j.y += abs(s(k * Math.PI * 8)) * 0.03 * H * env; break;
        }
      }
    }
    const c = this.pose, a = Math.min(1, dt * 8);
    for (const key of Object.keys(c)) c[key] += (q[key] - c[key]) * a;
    // "pop" ao trocar de expressão
    const pop = Math.exp(-(t - this.popAt) * 9) * 0.07;
    P.position.set(c.x + j.x, c.y + j.y, 0);
    P.rotation.set(c.rx + j.rx, c.ry, c.rz + j.rz);
    P.scale.set(c.sx * (1 - pop * 0.4), c.sy * (1 + pop) + j.sy, c.sx * (1 - pop * 0.4));
  }

  build(gltf) {
    const THREE = this.T;
    const r = document.createElement('div');
    r.className = 'pavio pv3d';
    r.setAttribute('role', 'img');
    r.tabIndex = 0;
    r.innerHTML = `
      <div class="pv3-stage"></div>
      <div class="pv-steam pv3-steam" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div class="pv3-ring" aria-hidden="true"></div>
      <div class="pv-think" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="pv-offline" aria-hidden="true">sem conexão</div>
      ${this.M.test ? '<div class="pv3-test">3D em teste · boneco provisório</div>' : ''}`;
    this.root = r;
    this.stageEl = r.querySelector('.pv3-stage');

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.stageEl.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    // Luz neutra: o personagem mantém as cores originais (a cor da marca fica só na interface).
    scene.add(new THREE.HemisphereLight(0xffffff, 0x3c403d, 2.2));
    const key = new THREE.DirectionalLight(0xfff8f0, 2.2); key.position.set(2, 4, 3); scene.add(key);
    const rim = new THREE.DirectionalLight(0xeaf7ee, 1.1); rim.position.set(-3, 2, -2); scene.add(rim);
    this.scene = scene;

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
    this.clock = new THREE.Clock();
    if (this.M.procedural) { this.buildStatic(gltf, this.facesGltf); this.facesGltf = null; this.bindEvents(); return; }
    const model = gltf.scene;
    scene.add(model);
    this.model = model;

    // Enquadramento: caixa do modelo -> câmera para corpo inteiro ou busto.
    const box = new THREE.Box3().setFromObject(model);
    this.size = box.getSize(new THREE.Vector3());
    this.center = box.getCenter(new THREE.Vector3());

    // Materiais: guarda a cor original para aplicar a vermelhidão.
    this.mats = [];
    this.morphMeshes = [];
    model.traverse((o) => {
      if (o.isMesh) {
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach((m) => { if (m.color && !this.mats.some((x) => x.m === m)) this.mats.push({ m, base: m.color.clone() }); });
        if (o.morphTargetDictionary) this.morphMeshes.push(o);
      }
    });
    const h = this.M.head;
    this.head = typeof h === 'string' ? model.getObjectByName(h) : null;
    if (!this.head && h instanceof RegExp) model.traverse((o) => { if (!this.head && o.isBone && h.test(o.name)) this.head = o; });
    // Vermelhidão só na pele, se os materiais tiverem nomes reconhecíveis.
    const skin = this.M.skin && this.mats.filter(({ m }) => this.M.skin.test(m.name || ''));
    if (skin?.length) this.mats = skin;
    this.redColor = new THREE.Color(0xff3020);

    // Animações
    this.mixer = new THREE.AnimationMixer(model);
    this.actions = {};
    for (const clip of gltf.animations) this.actions[clip.name] = this.mixer.clipAction(clip);
    this.current = this.actions[this.M.clips.idle];
    this.current?.play();
    this.mixer.addEventListener('finished', () => this.toIdle());
    this.bindEvents();
  }

  bindEvents() {
    const r = this.root;
    // Toque: pula (ou acena) e avisa o app.
    let down = null;
    r.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    r.addEventListener('pointerup', (e) => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 10) { this.play('jump'); this.onTap?.(); }
      down = null;
    });
    addEventListener('online', () => this.apply());
    addEventListener('offline', () => this.apply());
    reduceMQ.addEventListener?.('change', () => this.apply());
    document.addEventListener('visibilitychange', () => this.loop());
    new ResizeObserver(() => this.resize()).observe(this.stageEl);
    this.apply();
  }

  mount(el, mode = 'full') {
    if (!this.ready || !el) return false;
    this.mode = mode;
    this.root.classList.toggle('bust', mode === 'bust');
    this.applyMode();
    el.appendChild(this.root);
    this.resize();
    this.loop();
    return true;
  }

  resize() {
    const w = this.stageEl.clientWidth, h = this.stageEl.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    if (this.M.procedural) { this.frameStatic(w / h); return; }
    // Busto: enquadra a parte de cima; corpo inteiro: o modelo todo.
    const bust = this.mode === 'bust';
    const viewH = bust ? this.size.y * 0.8 : this.size.y * 1.14;
    const lookY = bust ? this.center.y + this.size.y * 0.16 : this.center.y;
    // Distância medida a partir da FRENTE do modelo (senão a perspectiva corta os pés no corpo inteiro).
    const dist = (viewH / 2) / Math.tan((this.camera.fov * Math.PI) / 360) + (bust ? 0 : this.size.z / 2);
    this.camera.position.set(this.center.x, lookY, this.center.z + dist);
    this.camera.lookAt(this.center.x, lookY, this.center.z);
    this.camera.updateProjectionMatrix();
    this.draw();
  }

  /* Enquadramento do Pavio estátua: a cabeça inteira no busto, o corpo inteiro no resto.
     Folga em cima para pulos e no lado para a inclinação; respeita telas estreitas. */
  frameStatic(aspect) {
    const THREE = this.T, faces = this.pivot() === this.facePivot;
    const box = faces ? this.faceBox : this.bodyBox;
    const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const bustBody = this.mode === 'bust' && !faces; // sem cabeças: parte de cima do corpo
    let viewH = bustBody ? size.y * 0.55 : size.y * (faces ? 1.22 : 1.18);
    // largura: as expressões de corpo abrem os braços (alegre chega a ~1× a altura)
    const wide = faces ? size.x : Math.max(size.x, size.y * 0.9);
    viewH = Math.max(viewH, (wide * 1.3) / aspect);
    const lookY = bustBody ? size.y * 0.72 : c.y + size.y * 0.04;
    const dist = (viewH / 2) / Math.tan((this.camera.fov * Math.PI) / 360) + size.z / 2;
    this.camera.near = dist / 50; this.camera.far = dist * 10;
    this.camera.position.set(c.x, lookY, c.z + dist);
    this.camera.lookAt(c.x, lookY, c.z);
    this.camera.updateProjectionMatrix();
    this.draw();
  }

  /* ---------- emoções ---------- */
  setMood(m) {
    this.mood = LABEL[m] ? m : 'neutral';
    ['seq1', 'seq2', 'seq3'].forEach((k) => clearTimeout(this.timers[k]));
    if (this.mood === 'furious') {
      this.timers.seq1 = setTimeout(() => this.setMoodRaw('huffing'), 2400);
      this.timers.seq2 = setTimeout(() => this.setMoodRaw('calming'), 3800);
      this.timers.seq3 = setTimeout(() => this.setMoodRaw('neutral'), 5600);
    }
    const c = this.M.clips[this.mood];
    if (c) this.playClip(c);
    this.apply();
  }
  setMoodRaw(m) { this.mood = m; this.apply(); }
  setActivity(a) { this.activity = a === 'listening' || a === 'thinking' ? a : null; this.busyClip('thinking', this.activity === 'thinking'); this.apply(); }
  setTalking(on) { this.talking = !!on; this.busyClip('talking', this.talking); this.apply(); }
  /* Animação contínua de um estado real (pensando, falando), só se ele estiver parado. */
  busyClip(kind, on) {
    const name = this.M?.activity?.[kind]; if (!name || !this.actions?.[name]) return;
    const idle = this.actions[this.M.clips.idle];
    if (on && this.current === idle) this.playClip({ name, loop: true });
    else if (!on && this.current === this.actions[name]) this.toIdle();
  }
  play(name) {
    if (this.M.procedural) {
      const fx = this.M.gestureFx[name]; if (!fx) return;
      const now = performance.now();
      this.gest = { name, face: fx.face, start: now, end: now + (reduced() ? Math.min(fx.ms, 900) : fx.ms) };
      this.loop(); return;
    }
    const c = this.M.gestures[name]; if (c) this.playClip(c);
  }

  /* Toca uma animação com transição suave. Com movimento reduzido, só o idle. */
  playClip(c) {
    if (reduced()) return;
    const spec = typeof c === 'string' ? { name: c } : c;
    const next = this.actions[spec.name]; if (!next || !this.mixer) return;
    const THREE = this.T;
    next.reset();
    next.setLoop(spec.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    next.clampWhenFinished = !spec.loop;
    next.enabled = true;
    if (this.current && this.current !== next) next.crossFadeFrom(this.current, 0.3, false);
    next.play();
    this.current = next;
    clearTimeout(this.timers.loopEnd);
    if (spec.loop && spec.ms) this.timers.loopEnd = setTimeout(() => this.toIdle(), spec.ms);
    this.loop();
  }
  toIdle() {
    const idle = this.actions[this.M.clips.idle];
    if (!idle || this.current === idle) return;
    idle.reset().setLoop(this.T.LoopRepeat, Infinity); idle.enabled = true;
    idle.crossFadeFrom(this.current, 0.4, false).play();
    this.current = idle;
  }

  apply() {
    const r = this.root; if (!r) return;
    const offline = !navigator.onLine;
    r.classList.toggle('is-steam', this.mood === 'furious' || this.mood === 'huffing');
    r.classList.toggle('is-offline', offline);
    r.classList.toggle('is-listening', this.activity === 'listening');
    r.classList.toggle('is-thinking', this.activity === 'thinking');
    r.classList.toggle('reduced', reduced());
    let label = 'Professor Pavio em 3D, ' + (offline ? 'sem conexão' : LABEL[this.mood]);
    if (this.activity === 'listening') label += ', ouvindo você';
    else if (this.activity === 'thinking') label += ', pensando';
    else if (this.talking) label += ', falando';
    r.setAttribute('aria-label', label);
    this.loop();
  }

  /* ---------- desenho ---------- */
  loop() {
    const visible = this.root?.isConnected && document.visibilityState === 'visible';
    if (visible && !this.raf) {
      this.clock.getDelta();
      let acc = 0;
      const tick = () => {
        this.raf = requestAnimationFrame(tick);
        if (!this.root.isConnected || document.visibilityState !== 'visible') { cancelAnimationFrame(this.raf); this.raf = 0; return; }
        acc += this.clock.getDelta();
        if (acc < 1 / 30) return; // máx. 30 quadros por segundo
        this.update(Math.min(acc, 0.1)); acc = 0;
        this.draw();
      };
      this.raf = requestAnimationFrame(tick);
    }
  }

  update(dt) {
    if (this.M.procedural) { this.updateStatic(dt); return; }
    const t = this.clock.elapsedTime;
    const red = reduced() ? 0.6 : 1;
    // Desfaz o ajuste de cabeça do quadro anterior (a animação pode não controlar a cabeça).
    if (this.head && this.headOff) { this.head.rotation.x -= this.headOff.x; this.head.rotation.z -= this.headOff.z; }
    if (!reduced() || this.current === this.actions[this.M.clips.idle]) this.mixer.update(reduced() ? dt * 0.5 : dt);
    // Vermelhidão sobe rápido e desce devagar (voltando à calma).
    const target = (RED[this.mood] || 0);
    this.red += (target - this.red) * Math.min(1, dt * (target > this.red ? 4 : 1.2));
    for (const { m, base } of this.mats) m.color.copy(base).lerp(this.redColor, this.red * 0.65);
    // Rosto (morphs) com transição suave.
    const want = this.M.face[this.mood] || {};
    for (const mesh of this.morphMeshes) {
      for (const [name, idx] of Object.entries(mesh.morphTargetDictionary)) {
        const cur = mesh.morphTargetInfluences[idx];
        mesh.morphTargetInfluences[idx] = cur + ((want[name] || 0) - cur) * Math.min(1, dt * 6);
      }
    }
    // Cabeça: acena ao falar, inclina ao ouvir/pensar, treme no surto.
    if (this.head) {
      const talk = this.talking ? Math.sin(t * 11) * 0.06 * red : 0;
      const tilt = this.activity === 'listening' ? 0.18 : this.activity === 'thinking' ? -0.15 : 0;
      const shake = this.mood === 'furious' && !reduced() ? Math.sin(t * 60) * 0.04 : 0;
      this.headOff = { x: talk, z: tilt * 0.6 + shake };
      this.head.rotation.x += this.headOff.x;
      this.head.rotation.z += this.headOff.z;
    }
  }

  draw() { if (this.renderer) this.renderer.render(this.scene, this.camera); }
}

export const pavio3d = new Pavio3D();
