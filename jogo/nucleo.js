/* ==========================================================
   nucleo.js — peças compartilhadas do jogo:
   utilitários, efeitos sonoros, o boneco do Pavio, as falas
   (voz do aparelho ou ElevenLabs) e a chuva de moedas.
   ========================================================== */
import * as voz from '../js/voice.js';
import * as eleven from '../js/eleven.js';
import { vozGeminiPronta, falaGemini, prepara, esperaInicio } from '../js/vozgemini.js';
import { state as appState } from '../js/store.js';
export { prepara };

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const embaralha = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);

/* ---------- efeitos sonoros sintetizados (sem arquivos) ---------- */
let ac;
const prefJogo = (k) => appState.jogo?.pref?.[k] !== false;
/* Vibração curta nos erros e no BOOM (se o aparelho tiver e a pessoa deixar). */
export function vibra(padrao) { try { if (prefJogo('vibrar')) navigator.vibrate?.(padrao); } catch {} }
export function sfx(tipo) {
  if (!prefJogo('sons')) return;
  try {
    ac ||= new (window.AudioContext || window.webkitAudioContext)();
    const t = ac.currentTime;
    const tom = (f, d, tp = 'sine', v = 0.18, at = 0, f2) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = tp; o.frequency.setValueAtTime(f, t + at);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + at + d);
      g.gain.setValueAtTime(v, t + at); g.gain.exponentialRampToValueAtTime(0.001, t + at + d);
      o.connect(g).connect(ac.destination); o.start(t + at); o.stop(t + at + d);
    };
    const ruido = (d, v = 0.3, at = 0, corte = 1200) => {
      const b = ac.createBuffer(1, ac.sampleRate * d, ac.sampleRate), c = b.getChannelData(0);
      for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * (1 - i / c.length);
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      f.type = 'lowpass'; f.frequency.value = corte; g.gain.value = v;
      s.buffer = b; s.connect(f).connect(g).connect(ac.destination); s.start(t + at);
    };
    if (tipo === 'moeda') { tom(988, 0.08, 'square', 0.08); tom(1319, 0.25, 'square', 0.08, 0.08); }
    if (tipo === 'certo') { tom(523, 0.12, 'triangle', 0.2); tom(659, 0.12, 'triangle', 0.2, 0.1); tom(784, 0.3, 'triangle', 0.2, 0.2); }
    if (tipo === 'erro') { tom(220, 0.3, 'sawtooth', 0.12, 0, 110); }
    if (tipo === 'chiado') { ruido(0.7, 0.18, 0, 5000); }
    if (tipo === 'boom') { ruido(1.6, 0.9, 0, 500); tom(90, 1.2, 'sine', 0.5, 0, 30); }
    if (tipo === 'toque') { tom(660, 0.06, 'sine', 0.12); }
    if (tipo === 'peca') { tom(440, 0.05, 'square', 0.06); }
    if (tipo === 'bau') { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tom(f, 0.22, 'triangle', 0.14, i * 0.07)); ruido(0.3, 0.2, 0, 3000); }
    if (tipo === 'compra') { tom(784, 0.08, 'square', 0.08); tom(1175, 0.2, 'square', 0.08, 0.08); }
    if (tipo === 'carimbo') { ruido(0.18, 0.7, 0, 900); tom(120, 0.25, 'sine', 0.5, 0, 60); }
    if (tipo === 'chefe') { [196, 185, 175, 147].forEach((f, i) => tom(f, 0.4, 'sawtooth', 0.09, i * 0.22)); }
    if (tipo === 'vitoria') { [523, 659, 784, 1047].forEach((f, i) => tom(f, 0.35, 'triangle', 0.18, i * 0.12)); }
  } catch {}
}

/* ==========================================================
   PAVIO — boneco recortado com as poses renderizadas do 3D.
   Anima por transformações: respira, balança, pula, treme,
   "estica e achata" ao trocar de pose e quica ao falar.
   ========================================================== */
export const POSES = ['neutro', 'alegre', 'bravo', 'bufando', 'cansado', 'debochado', 'decepcionado', 'escutando', 'impaciente', 'pensando', 'raivoso', 'surpreso'];
export const ESCADA = ['surpreso', 'debochado', 'bravo', 'raivoso'];
const imgs = {};
POSES.forEach((p) => { const i = new Image(); i.src = new URL(`sprites/pavio-${p}.webp`, import.meta.url).href; imgs[p] = i; });

export class Pavio {
  constructor(el) {
    this.el = el;
    el.innerHTML = `<div class="pv-sombra"></div><div class="pv-corpo"><img alt="Professor Pavio" draggable="false"></div><div class="pv-fumaca"></div>`;
    this.corpo = $('.pv-corpo', el); this.img = $('img', el);
    this.pose('neutro', false);
    palco.pavio = this;
  }
  pose(p, pop = true) {
    if (!imgs[p] || this.atual === p) return;
    this.atual = p; this.img.src = imgs[p].src;
    this.el.dataset.pose = p;
    if (pop) this.acao('pop');
  }
  acao(nome) {
    this.corpo.classList.remove('pop', 'pulo', 'treme', 'surto');
    void this.corpo.offsetWidth; // reinicia a animação
    this.corpo.classList.add(nome);
  }
  falando(on) { this.el.classList.toggle('falando', !!on); }
}
/* O Pavio da tela atual (as falas mexem a boca dele). */
export const palco = { pavio: null };

/* ---------- falas (balões + voz) ----------
   Padrão: voz do aparelho para todos. ElevenLabs só se a pessoa colou chave + ID da voz. */
let falaId = 0;
export const vozEstado = { elevenFalhou: '' };

/* Botão "Pular": corta só a fala atual (o jogo segue normalmente, o texto fica no balão). */
let puloN = 0, acordaPulo = null, pularBtn = null;
export function pularFala() { puloN++; acordaPulo?.(); voz.stopSpeaking(); eleven.stop(); botaoPular(false); }
function botaoPular(on) {
  if (!pularBtn) {
    pularBtn = document.createElement('button');
    pularBtn.type = 'button'; pularBtn.className = 'pular-fala';
    pularBtn.setAttribute('aria-label', 'Pular esta fala');
    pularBtn.innerHTML = 'Pular <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 5l9 7-9 7zM15 5l7 7-7 7z" fill="currentColor"/></svg>';
    pularBtn.addEventListener('click', (e) => { e.stopPropagation(); pularFala(); });
    document.body.appendChild(pularBtn);
  }
  pularBtn.classList.toggle('on', !!on);
}

export async function falar(quem, texto, { lang, balao } = {}) {
  const id = ++falaId;
  const meuPulo = puloN;
  const vivo = () => id === falaId && meuPulo === puloN; // false se calou ou pulou
  const pulou = new Promise((r) => { acordaPulo = r; });
  const pt = lang === 'pt-BR';
  const prefSom = appState.settings.audioPref || 'all';
  const semSom = prefSom === 'off' || (prefSom === 'speech' && pt);
  const vaiGemini = !semSom && !(eleven.elevenReady() && !vozEstado.elevenFalhou) && vozGeminiPronta();
  if (!semSom) botaoPular(true);
  if (balao && vaiGemini) {
    // Texto e voz juntos: "digitando…" até o começo da fala ficar pronto (no máximo 3,5 s).
    balao.innerHTML = '<span class="digitando"><i></i><i></i><i></i></span>'; balao.hidden = false;
    await Promise.race([esperaInicio(texto, { quem: quem === 'pavio' ? 'pavio' : 'npc', lang: lang || 'en-US' }, 3500), pulou]);
    if (id !== falaId) return false;
  }
  if (balao) { balao.innerHTML = texto; balao.hidden = false; balao.classList.remove('entra'); void balao.offsetWidth; balao.classList.add('entra'); }
  const ator = quem === 'pavio' ? palco.pavio : null;
  ator?.falando(true);
  if (quem === 'npc') $('.npc')?.classList.add('falando');
  const limpo = texto.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  const opts = { lang: lang || 'en-US', rate: pt ? 1.08 : 0.92 };
  const pref = appState.settings.audioPref || 'all';
  let foi = pref === 'off' || (pref === 'speech' && pt);
  if (!foi && vivo() && eleven.elevenReady() && !vozEstado.elevenFalhou) {
    try { await eleven.speak(limpo, { ...opts, alive: vivo }); foi = true; }
    catch (e) { if (['quota', 'badkey', 'voice', 'library'].includes(e.kind)) vozEstado.elevenFalhou = e.message; }
  }
  // Voz natural do Gemini (padrão desde 2026-11-19); se falhar, cai para a voz do aparelho.
  let falta = limpo;
  if (!foi && vivo() && vozGeminiPronta()) {
    try { await falaGemini(limpo, { quem: quem === 'pavio' ? 'pavio' : 'npc', lang: opts.lang, alive: vivo }); foi = true; }
    catch (e) { if (e?.resto) falta = e.resto; } // a 1ª frase já tocou: o aparelho fala só o resto
  }
  // Voz da Nuvem para todos (pedido do usuário, 2026-11-19): a voz padrão do aparelho, sem engrossar o Pavio.
  if (!foi && vivo()) await voz.speak(falta, { ...opts, male: false, voiceURI: appState.settings.voiceURI, voiceURIpt: appState.settings.voiceURIpt });
  else if (foi && (pref === 'off' || (pref === 'speech' && pt))) await sleep(Math.min(4000, 600 + limpo.length * 35)); // sem áudio: tempo de leitura
  if (id === falaId) { botaoPular(false); ator?.falando(false); if (quem === 'npc') $('.npc')?.classList.remove('falando'); }
  return id === falaId;
}
export function calar() { botaoPular(false); falaId++; voz.stopSpeaking(); voz.stopListening(); eleven.stop(); palco.pavio?.falando(false); $('.npc')?.classList.remove('falando'); }

/* ---------- comparar o que o aluno falou com uma frase ---------- */
const norm = (t) => String(t).toLowerCase().replace(/[’']/g, "'")
  .replace(/\bi'm\b/g, 'i am').replace(/\bhere's\b/g, 'here is').replace(/\byou're\b/g, 'you are').replace(/\bit's\b/g, 'it is').replace(/\bdon't\b/g, 'do not').replace(/\bcan't\b/g, 'can not')
  .replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);
export const palavras = norm;
export function parecido(dito, frase) {
  const a = norm(dito), b = norm(frase);
  if (!a.length || !b.length) return 0;
  const sa = new Set(a); const hit = b.filter((w) => sa.has(w)).length;
  return hit / Math.max(b.length, a.length * 0.8);
}
export const faltando = (dito, frase) => { const sa = new Set(norm(dito)); return norm(frase).filter((w) => !sa.has(w)); };

/* ---------- moedas voando até o contador ---------- */
export function chuvaDeMoedas(qtd, de) {
  const alvo = $('.hud-moedas')?.getBoundingClientRect();
  const r = de.getBoundingClientRect();
  for (let i = 0; i < Math.min(qtd, 8); i++) {
    const m = document.createElement('div');
    m.className = 'moeda-voa';
    m.style.left = r.left + r.width / 2 + 'px'; m.style.top = r.top + r.height / 2 + 'px';
    document.body.appendChild(m);
    const dx = (alvo ? alvo.left + 12 : innerWidth - 40) - (r.left + r.width / 2);
    const dy = (alvo ? alvo.top + 12 : 20) - (r.top + r.height / 2);
    m.animate([
      { transform: 'translate(0,0) scale(.6)', opacity: 1 },
      { transform: `translate(${(Math.random() - 0.5) * 120}px, ${-60 - Math.random() * 60}px) scale(1.1)`, opacity: 1, offset: 0.35 },
      { transform: `translate(${dx}px, ${dy}px) scale(.7)`, opacity: 0.9 },
    ], { duration: 900 + i * 70, easing: 'cubic-bezier(.3,.7,.4,1)' }).onfinish = () => { m.remove(); sfx('moeda'); };
  }
}

/* ---------- ícones ---------- */
export const ICO = {
  engrenagem: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  combustivel: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c3 4 6 7 6 11a6 6 0 0 1-12 0c0-2 1-4 2-5 0 2 1 3 2 3 0-4 1-6 2-9z"/></svg>',
  globo: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  livro: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM8 7h7"/></svg>',
  voltar: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  loja: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h16l-1.5 11h-13zM8 9V6a4 4 0 0 1 8 0v3"/></svg>',
  balao: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>',
  enviar: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l16-8-6 16-2.5-6.5z"/></svg>',
};

/* Baú do tesouro desenhado (fechado ou aberto). */
export const bauSVG = (aberto = false) => `<svg viewBox="0 0 120 100" class="bau-svg" aria-hidden="true">
  <ellipse cx="60" cy="94" rx="46" ry="6" fill="#000" opacity=".2"/>
  <rect x="14" y="46" width="92" height="44" rx="6" fill="#9a5a24" stroke="#4a2a10" stroke-width="4"/>
  <rect x="14" y="60" width="92" height="8" fill="#e8b23a" stroke="#4a2a10" stroke-width="3"/>
  ${aberto
    ? '<path d="M14 46 L22 12 H98 L106 46 Z" fill="#7a4418" stroke="#4a2a10" stroke-width="4"/><ellipse cx="60" cy="48" rx="40" ry="8" fill="#ffd54a"/><circle cx="44" cy="44" r="7" fill="#ffd54a" stroke="#b8860b" stroke-width="2"/><circle cx="62" cy="40" r="7" fill="#ffd54a" stroke="#b8860b" stroke-width="2"/><circle cx="78" cy="45" r="7" fill="#ffd54a" stroke="#b8860b" stroke-width="2"/>'
    : '<path d="M14 46 Q14 18 60 18 Q106 18 106 46 Z" fill="#b06a2c" stroke="#4a2a10" stroke-width="4"/><path d="M52 18 v28 M68 18 v28" stroke="#e8b23a" stroke-width="6"/>'}
  <rect x="50" y="56" width="20" height="20" rx="3" fill="#ffd54a" stroke="#4a2a10" stroke-width="3"/><circle cx="60" cy="65" r="3" fill="#4a2a10"/>
</svg>`;
