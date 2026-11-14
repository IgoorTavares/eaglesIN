/* ==========================================================
   exercises.js — mini-exercícios gerados localmente (sem IA):
   completar frase, ouvir e escrever, ordenar palavras, traduzir.
   ========================================================== */
import { tokenize } from './pronunciation.js';

const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* Gera N exercícios variados a partir de frases e palavras {en, pt}. */
export function buildExercises({ phrases = [], words = [] }, n = 5) {
  const out = [];
  const types = ['cloze', 'listen', 'order', 'translate'];
  const pool = shuffle(phrases.filter((p) => p.en.split(' ').length >= 3));
  const allWords = [...new Set([...words.map((w) => w.en), ...phrases.flatMap((p) => p.en.split(/\s+/))].map((w) => w.replace(/[.,!?]/g, '')).filter((w) => w.length > 2))];
  for (let i = 0; i < n && pool.length; i++) {
    const p = pool[i % pool.length];
    const type = types[i % types.length];
    if (type === 'cloze') {
      const tokens = p.en.split(/\s+/);
      // escolhe a palavra mais longa como lacuna
      let idx = 0; tokens.forEach((t, k) => { if (t.replace(/\W/g, '').length > tokens[idx].replace(/\W/g, '').length) idx = k; });
      const answer = tokens[idx].replace(/[.,!?]/g, '');
      const distract = shuffle(allWords.filter((w) => w.toLowerCase() !== answer.toLowerCase())).slice(0, 3);
      out.push({ type, prompt: tokens.map((t, k) => (k === idx ? '_____' + t.replace(/[^.,!?]/g, '') : t)).join(' '), hint: p.pt, answer, options: shuffle([answer, ...distract]) });
    } else if (type === 'listen') {
      out.push({ type, text: p.en, hint: p.pt });
    } else if (type === 'order') {
      const tokens = p.en.replace(/[.,!?]/g, '').split(/\s+/);
      out.push({ type, hint: p.pt, answer: tokens.join(' '), tiles: shuffle(tokens.map((t, k) => ({ t, k }))) });
    } else {
      const others = shuffle(phrases.filter((q) => q.en !== p.en)).slice(0, 3).map((q) => q.en);
      out.push({ type, prompt: p.pt, answer: p.en, options: shuffle([p.en, ...others]) });
    }
  }
  // Se faltar frase, completa com palavras (tradução de vocabulário)
  const ws = shuffle(words);
  for (let i = 0; out.length < n && i < ws.length; i++) {
    const w = ws[i];
    const others = shuffle(words.filter((x) => x.en !== w.en)).slice(0, 3).map((x) => x.pt);
    out.push({ type: 'vocab', prompt: w.en, answer: w.pt, options: shuffle([w.pt, ...others]) });
  }
  return out;
}

const TITLES = { cloze: 'Complete a frase', listen: 'Ouça e escreva', order: 'Coloque em ordem', translate: 'Traduza para o inglês', vocab: 'O que significa?' };

/* Renderiza um exercício no container. onDone(correct, expected) é chamado ao responder.
   ctx.speak(text) é usado no "ouvir e escrever". */
export function renderExercise(el, ex, ctx, onDone) {
  let answered = false;
  const finish = (ok, fbText) => {
    if (answered) return;
    answered = true;
    const fb = el.querySelector('.feedback');
    fb.className = 'feedback ' + (ok ? 'good' : 'badf');
    fb.innerHTML = ok ? '✅ ' + esc(ctx.praise()) : '❌ Resposta: <b>' + esc(fbText) + '</b>';
    el.querySelector('.next').classList.remove('hidden');
    onDone(ok);
  };

  let body = '';
  if (ex.type === 'cloze' || ex.type === 'translate' || ex.type === 'vocab') {
    body = `<div class="ex-prompt">${esc(ex.prompt)}</div>${ex.hint ? `<p class="muted small">${esc(ex.hint)}</p>` : ''}
      <div class="options">${ex.options.map((o) => `<button class="btn" data-opt="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
  } else if (ex.type === 'listen') {
    body = `<div class="row"><button class="btn primary" data-play>🔊 Ouvir</button><button class="btn" data-slow>🐢 Devagar</button></div>
      <p class="muted small" style="margin-top:8px">Escreva o que ouviu:</p>
      <div class="textbox"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Digite aqui..." /><button class="btn primary" data-check>OK</button></div>`;
  } else if (ex.type === 'order') {
    body = `<p class="muted small">${esc(ex.hint)}</p><div class="wordbank" data-built></div>
      <div class="wordbank" data-bank>${ex.tiles.map((x) => `<button class="btn" data-k="${x.k}">${esc(x.t)}</button>`).join('')}</div>
      <div class="row"><button class="btn ghost" data-clear>Limpar</button><button class="btn primary grow" data-check>Verificar</button></div>`;
  }
  el.innerHTML = `<div class="tag accent">${TITLES[ex.type]}</div><div style="margin-top:10px">${body}</div>
    <div class="feedback"></div><button class="btn primary block next hidden" style="margin-top:12px">Continuar ›</button>`;

  el.querySelector('.next').onclick = () => ctx.next();

  if (ex.options) {
    el.querySelectorAll('[data-opt]').forEach((b) => (b.onclick = () => {
      if (answered) return;
      const ok = b.dataset.opt === ex.answer;
      b.classList.add(ok ? 'right' : 'wrong');
      el.querySelectorAll('[data-opt]').forEach((x) => { if (x.dataset.opt === ex.answer) x.classList.add('right'); });
      finish(ok, ex.answer);
    }));
  }
  if (ex.type === 'listen') {
    const input = el.querySelector('input');
    el.querySelector('[data-play]').onclick = () => ctx.speak(ex.text, 1);
    el.querySelector('[data-slow]').onclick = () => ctx.speak(ex.text, 0.65);
    const check = () => {
      const a = tokenize(input.value), b = tokenize(ex.text);
      const hits = b.filter((w, i) => a[i] === w).length;
      finish(hits / b.length >= 0.85, ex.text);
    };
    el.querySelector('[data-check]').onclick = check;
    input.onkeydown = (e) => { if (e.key === 'Enter') check(); };
    setTimeout(() => ctx.speak(ex.text, 1), 300);
  }
  if (ex.type === 'order') {
    const built = el.querySelector('[data-built]'), bank = el.querySelector('[data-bank]');
    bank.onclick = (e) => { const b = e.target.closest('button'); if (b && !answered) built.appendChild(b); };
    built.onclick = (e) => { const b = e.target.closest('button'); if (b && !answered) bank.appendChild(b); };
    el.querySelector('[data-clear]').onclick = () => { if (!answered) [...built.children].forEach((b) => bank.appendChild(b)); };
    el.querySelector('[data-check]').onclick = () => {
      const got = [...built.children].map((b) => b.textContent).join(' ');
      finish(tokenize(got).join(' ') === tokenize(ex.answer).join(' '), ex.answer);
    };
  }
}
