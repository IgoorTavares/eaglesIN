/* ==========================================================
   learn.js — jornada CEFR: Aprender (níveis/unidades), aula em
   6 etapas, provas de unidade e finais, Avaliações, revisão
   espaçada (flashcards) e avaliação de retenção.
   As funções do app (voz, microfone, mascote, navegação) chegam
   por initLearn(ctx) para este módulo não depender do app.js.
   ========================================================== */
import { CEFR, SKILLS, WEEKLY, getLevel, getUnit, getLesson, parseVocab, unitVocab, totals } from './curriculum.js';
import {
  state, save, dayKey, PASS, updateSkill, recordLesson, lessonDone, recordUnitExam, bestUnitExam, recordFinal, finalPassed,
  getPack, putPack, dropPack, addHardWord,
} from './store.js';
import { addCard, dueCards, grade, boxCounts } from './srs.js';
import { buildLessonPrompt, buildExamPrompt, buildWritingPrompt } from './prompts.js';
import { generateLesson, generateExam, gradeWriting, AIError } from './ai.js';

let X; // contexto do app
export function initLearn(ctx) { X = ctx; }

const esc = (s) => X.esc(s);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
/* Aulas/provas guardadas dependem do professor e do modo (a voz dele está no conteúdo). */
const packTag = () => ':' + X.T().id + (X.S().polite ? ':p' : '');
const pctOf = (ok, n) => (n ? Math.round((ok / n) * 100) : 0);

/* ---------- falas da professora nos exercícios (personalidade intacta) ---------- */
const WRONG_RUDE = ['Errou, porra! Presta atenção.', 'Puta merda, que resposta foi essa?', 'Caralho, a gente acabou de ver isso!', 'Meu pai amado... errado.', 'Não acredito que você marcou isso. Sério.', 'Que merda foi essa? Lê a explicação!'];
const RIGHT_RUDE = ['Acertou. Milagre.', 'Tá, essa foi boa. Não se acostuma.', 'Olha só, o cérebro ligou!', 'Certo. Até que enfim.'];
const WRONG_POLITE = ['Quase! Veja a explicação.', 'Não foi dessa vez. Olha a resposta certa.'];
const RIGHT_POLITE = ['Muito bem!', 'Isso mesmo!', 'Excelente!'];
/* Reação a uma resposta: o motor de emoções (app) conta os erros seguidos e escolhe
   expressão e gesto; professores com falas próprias (Pavio) usam a fala do degrau. */
function react(ok, key) {
  const polite = X.S().polite;
  const r = X.reactAnswer(ok, key);
  if (r.line) X.bubble(r.line);
  if (X.S().speakPt) X.say([{ text: r.line || pick(ok ? (polite ? RIGHT_POLITE : RIGHT_RUDE) : (polite ? WRONG_POLITE : WRONG_RUDE)), lang: 'pt-BR' }]);
}

/* ---------- utilidades ---------- */
const CONTR = { "i'm": 'i am', "you're": 'you are', "he's": 'he is', "she's": 'she is', "it's": 'it is', "we're": 'we are', "they're": 'they are', "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "can't": 'cannot', "won't": 'will not', "i'll": 'i will', "i'd": 'i would', "haven't": 'have not', "hasn't": 'has not', "what's": 'what is', "where's": 'where is', "that's": 'that is', "let's": 'let us' };
export function normAnswer(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’‘`]/g, "'")
    .replace(/[^\p{L}\p{N}' ]/gu, ' ').split(/\s+/).filter(Boolean).map((w) => CONTR[w] || w).join(' ').replace(/\bcan not\b/g, 'cannot').trim();
}
const isRight = (item, answer) => [item.resposta, ...(item.aceitas || [])].some((r) => normAnswer(r) === normAnswer(answer));

export const currentLevel = () => getLevel(X.S().cefr);
export function setLevel(id) {
  const lv = getLevel(id);
  X.S().cefr = lv.id; X.S().level = lv.legacy; save();
}
export function levelProgress(lv) {
  const lessons = lv.units.flatMap((u) => u.lessons);
  const done = lessons.filter((l) => lessonDone(l.id)).length;
  const exams = lv.units.filter((u) => (bestUnitExam(u.id) ?? 0) >= PASS.advance).length;
  return { done, total: lessons.length, exams, units: lv.units.length, final: finalPassed(lv.id) };
}
export function nextLesson(lv = currentLevel()) {
  for (const u of lv.units) for (const l of u.lessons) if (!lessonDone(l.id)) return l;
  return null;
}
/* Unidade atual: a primeira sem prova aprovada. */
export function currentUnit(lv = currentLevel()) {
  return lv.units.find((u) => (bestUnitExam(u.id) ?? 0) < PASS.advance) || lv.units[lv.units.length - 1];
}
export function nextConvo(lv = currentLevel()) {
  const u = currentUnit(lv);
  return u.convos.find((c) => !state.curr.convos[c.id]) || u.convos[0];
}
export function skillProfile() {
  return Object.entries(SKILLS).map(([k, name]) => ({ k, name, v: state.skills[k]?.v ?? null, n: state.skills[k]?.n || 0 }));
}
/* Recomendação simples a partir do perfil de habilidades. */
export function recommendation() {
  const prof = skillProfile().filter((s) => s.v !== null);
  if (prof.length < 2) return { text: 'Faça algumas aulas e uma conversa para eu montar seu perfil de habilidades.', action: null };
  const weak = prof.sort((a, b) => a.v - b.v)[0];
  const strong = prof[prof.length - 1];
  const map = {
    conversacao: { what: '15 minutos de conversa guiada', go: 'convo' },
    escuta: { what: 'uma aula com foco em escuta (ouça sem ler primeiro)', go: 'lesson' },
    vocabulario: { what: 'uma rodada de revisão espaçada', go: 'srs' },
    gramatica: { what: 'refazer a verificação da última aula', go: 'lesson' },
    leitura: { what: 'uma aula e a leitura da prova da unidade', go: 'lesson' },
    escrita: { what: 'treinar as tarefas de escrita da prova da unidade', go: 'exam' },
  }[weak.k];
  const rude = !X.S().polite;
  return {
    text: `${rude ? 'Seu' : 'Você vai bem em'} ${strong.name.toLowerCase()} ${rude ? 'até que tá ok' : ''} (${strong.v}%), mas ${weak.name.toLowerCase()} está em ${weak.v}%${rude ? '. Vergonhoso.' : '.'} Próximo passo: ${map.what}.`,
    action: map.go,
  };
}
export const weekday = () => WEEKLY[new Date().getDay()];

/* ==========================================================
   APRENDER — níveis, unidades e cronograma
   ========================================================== */
export function renderLearn(levelId) {
  const lv = getLevel(levelId || X.S().cefr);
  const t = totals();
  const p = levelProgress(lv), mine = lv.id === X.S().cefr, cur = currentUnit(lv);
  X.view.innerHTML = `
    <header class="page-head"><h1>Aprender</h1>
      <p class="muted small">${t.levels} níveis · ${t.units} unidades · ${t.lessons} aulas · ${t.units} provas de unidade · ${t.levels} provas finais · ${t.convos} conversas guiadas</p></header>
    <div class="level-tabs seg" role="tablist" aria-label="Níveis">${CEFR.map((l) => `<button role="tab" aria-selected="${l.id === lv.id}" class="${l.id === lv.id ? 'on' : ''} ${l.id === X.S().cefr ? 'mine' : ''}" data-lv="${l.id}">${l.id}${finalPassed(l.id) ? icon('check') : ''}</button>`).join('')}</div>
    <section class="card level-card level-hero">
      <div class="level-hero-top">
        <span class="lvl-badge">${lv.id}</span>
        <div class="grow"><b class="level-name">${esc(lv.name)}</b><span class="tag accent">${esc(lv.tagline)}</span></div>
        <div class="ring" style="--p:${pctOf(p.done, p.total)}"><b>${pctOf(p.done, p.total)}%</b></div>
      </div>
      <p class="muted small">${esc(lv.aim)}</p>
      ${progressBar(p)}
      <p class="small muted level-meta">${icon('history')} ${lv.months}${lv.id === 'C2' ? '+' : ''} meses planejados · objetivo: ${esc(lv.target)}</p>
      ${mine ? `<span class="tag ok">${icon('target')} Seu nível atual</span>` : `<button class="btn sm outline" id="setLv">Estudar o ${lv.id} agora</button>`}
    </section>
    <div class="section-head"><h2>Unidades</h2><span class="muted small">${p.exams}/${p.units} concluídas</span></div>
    <div class="unit-list">${lv.units.map((u) => unitCard(u, mine && u.id === cur.id)).join('')}</div>
    <section class="card final-card">
      <div class="guided-head"><span class="mini-ico">${icon('graduation-cap')}</span><div class="grow"><b>Prova final do ${lv.id}</b><span class="muted small">${esc(lv.final)}</span></div></div>
      <p class="small">${finalPassed(lv.id) ? `<span class="tag ok">${icon('check')} Aprovado</span>` : `Para passar: ${PASS.advance}% no geral e pelo menos ${PASS.finalSkillMin}% em escuta, fala, leitura e escrita.`}</p>
      <button class="btn primary block" data-go="exam-c/final/${lv.id}">Fazer a prova final</button>
    </section>
    <details class="card plan-card"><summary><b>${icon('compass')} Cronograma e rotina</b></summary>
      <p class="small muted">Referência: 45 a 60 min por dia, 6 dias por semana. Prazos são metas de planejamento, não garantia de proficiência.</p>
      ${CEFR.map((l) => `<div class="list-item"><span>${l.id} · ${esc(l.name)}</span><span class="muted small">${l.months}${l.id === 'C2' ? '+' : ''} meses · ${esc(l.target)}</span></div>`).join('')}
      <p class="small" style="margin-top:8px">Total de referência partindo do zero: ~43 meses ou mais.</p>
      <h3>Semana</h3>
      ${WEEKLY.slice(1).concat(WEEKLY[0]).map((w) => `<div class="list-item"><span>${w.day}</span><span class="muted small">${w.focus}</span></div>`).join('')}
      <h3>Sessão de 50 minutos</h3>
      <p class="small">10′ vocabulário · 10′ gramática · 15′ conversação · 10′ escuta/leitura · 5′ revisão. Escolha o plano "Completo (50 min)" em Configurações.</p>
    </details>`;
  X.$$('[data-lv]').forEach((b) => (b.onclick = () => renderLearn(b.dataset.lv)));
  const s = X.$('#setLv'); if (s) s.onclick = () => { setLevel(lv.id); X.toast(`Nível ${lv.id} definido.`); renderLearn(lv.id); };
}
function progressBar(p) {
  return `<div class="small lp-row"><span>${p.done}/${p.total} aulas</span><span>${p.exams}/${p.units} provas de unidade</span></div>
    <div class="progress" style="margin-top:6px"><i style="width:${pctOf(p.done, p.total)}%"></i></div>`;
}
const icon = (name, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
function unitCard(u, current = false) {
  const done = u.lessons.filter((l) => lessonDone(l.id)).length;
  const best = bestUnitExam(u.id);
  const passed = best !== null && best >= PASS.advance;
  const status = best === null ? '' : passed ? `<span class="tag ok">${icon('check')} prova ${best}%</span>` : `<span class="tag warn">prova ${best}%</span>`;
  return `<button class="card unit-card ${current ? 'current' : ''} ${passed ? 'passed' : ''}" data-go="unit/${u.id}">
    <span class="unit-n">${passed ? icon('check') : u.n}</span>
    <span class="grow"><span class="unit-title"><b>${esc(u.title)}</b>${current ? '<span class="tag accent">Atual</span>' : ''}</span>
      <span class="muted small">${esc(u.topics)}</span>
      <span class="unit-prog"><span class="progress"><i style="width:${pctOf(done, 6)}%"></i></span><span class="small muted">${done}/6</span></span>
      ${status ? `<span class="unit-status">${status}</span>` : ''}</span>
    ${icon('chevron-right', 'ic-muted')}
  </button>`;
}

export function renderUnit(unitId) {
  const u = getUnit(unitId);
  if (!u) return X.go('learn');
  const lv = getLevel(u.level);
  const best = bestUnitExam(u.id);
  const done = u.lessons.filter((l) => lessonDone(l.id)).length;
  const nextL = u.lessons.find((l) => !lessonDone(l.id));
  X.view.innerHTML = `
    <button class="link back-link" data-go="learn/${lv.id}">${icon('chevron-left')} ${lv.id} · ${esc(lv.name)}</button>
    <header class="page-head unit-head">
      <span class="eyebrow">${lv.id} · Unidade ${u.n}</span>
      <h1>${esc(u.title)}</h1>
      <p class="muted small">${esc(u.topics)}</p>
      <div class="unit-meta">
        <div class="ring" style="--p:${pctOf(done, 6)}"><b>${done}/6</b></div>
        <span class="small muted">6 aulas · 2 conversas · 1 prova</span>
        ${nextL ? `<button class="btn primary sm" data-go="lesson-c/${nextL.id}">${icon('play')} Aula ${nextL.n}</button>` : ''}
      </div>
    </header>
    <div class="section-head"><h2>Aulas</h2></div>
    <div class="card lesson-list">
      ${u.lessons.map((l) => {
        const r = state.curr.lessons[l.id], ok = lessonDone(l.id);
        return `<button class="lesson-row ${nextL && l.id === nextL.id ? 'next' : ''}" data-go="lesson-c/${l.id}">
          <span class="dot ${ok ? 'ok' : r ? 'warn' : ''}">${ok ? icon('check') : l.n}</span>
          <span class="grow"><b>${esc(l.title)}</b><span class="muted small">${esc(l.pt)}</span></span>
          ${r ? `<span class="tag ${ok ? 'ok' : 'warn'}">${r.best}%</span>` : ''}${icon('chevron-right', 'ic-muted')}</button>`;
      }).join('')}
    </div>
    <div class="section-head"><h2>Conversas com IA</h2></div>
    <div class="card lesson-list">
    ${u.convos.map((c) => `<button class="lesson-row" data-convo="${c.id}"><span class="mini-ico">${icon('compass')}</span>
      <span class="grow"><b>${esc(c.title)}</b><span class="muted small">${esc(c.goal)}</span></span>
      ${state.curr.convos[c.id] ? `<span class="tag">${Number(state.curr.convos[c.id].nota).toFixed(1)}/10</span>` : ''}${icon('chevron-right', 'ic-muted')}</button>`).join('')}
    </div>
    <div class="section-head"><h2>Prova da unidade</h2></div>
    <section class="card">
      <div class="guided-head"><span class="mini-ico">${icon('clipboard-check')}</span><div class="grow"><b>${best === null ? 'Ainda não feita' : `Melhor nota: ${best}%`}</b>
        <span class="muted small">${best === null ? 'Compreensão, escrita e fala.' : best >= PASS.advance ? 'Aprovado' : best >= PASS.retry ? 'Revise os pontos fracos e tente de novo' : 'Reforce o conteúdo antes de repetir'}</span></div>
        ${best !== null ? `<span class="tag ${best >= PASS.advance ? 'ok' : 'warn'}">${best >= PASS.advance ? icon('check') : ''}${best}%</span>` : ''}</div>
      <p class="muted small">${PASS.advance}%+ avança sem reforço; ${PASS.retry}–${PASS.advance - 1}% pede revisão direcionada; abaixo de ${PASS.retry}% pede reforço.</p>
      <button class="btn primary block" data-go="exam-c/unit/${u.id}">Fazer a prova da unidade</button>
    </section>`;
  X.$$('[data-convo]').forEach((b) => (b.onclick = () => X.startConvo(b.dataset.convo)));
}

/* ==========================================================
   EXERCÍCIOS (motor comum de aula, verificação e prova)
   ========================================================== */
function itemHTML(it, i, n, reading) {
  const head = `<div class="ex-count">${i + 1} de ${n}</div>`;
  const read = it.habilidade === 'leitura' && reading ? `<details class="reading" open><summary>${icon('book-open')} Texto</summary><p>${esc(reading)}</p></details>` : '';
  const audio = it.audio ? `<div class="row" style="margin:8px 0"><button class="btn sm outline" data-play>${icon('volume-2')} Ouvir</button><button class="btn sm ghost" data-slow>${icon('turtle')} Devagar</button></div>` : '';
  let body = '';
  if (it.tipo === 'escolha') body = `<div class="options">${it.opcoes.map((o, k) => `<button class="btn" data-opt="${k}">${esc(o)}</button>`).join('')}</div>`;
  else if (it.tipo === 'ordenar') body = `<div class="order-line" id="orderLine"></div><div class="chips" id="chips">${it.opcoes.map((w, k) => `<button class="chip-btn" data-w="${k}">${esc(w)}</button>`).join('')}</div><button class="btn primary block" id="checkBtn" disabled>Conferir</button>`;
  else body = `<input type="text" id="ansInput" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Escreva aqui..." /><button class="btn primary block" id="checkBtn" style="margin-top:8px">Conferir</button>`;
  return `${head}${read}<div class="ex-prompt">${esc(it.pergunta)}</div>${audio}${body}<div id="exFb"></div>`;
}

/* Roda uma lista de itens dentro de "box". Feedback imediato por item.
   Devolve [{ item, ok, answer }]. */
export function runItems(box, items, { reading = '', live, onEach } = {}) {
  return new Promise((resolve) => {
    const results = [];
    let i = 0;
    X.resetRun(); // escada de paciência zera a cada bloco de exercícios
    const next = () => {
      if (!live()) return;
      if (i >= items.length) return resolve(results);
      const it = items[i];
      box.innerHTML = `<div class="card ex-card">${itemHTML(it, i, items.length, reading)}</div>`;
      const play = (mul) => X.say([{ text: it.audio, mul }]);
      if (it.audio) { X.$('[data-play]', box).onclick = () => play(1); X.$('[data-slow]', box).onclick = () => play(0.7); play(1); }
      const done = (answer) => {
        const ok = isRight(it, answer);
        results.push({ item: it, ok, answer });
        onEach?.(it, ok);
        react(ok, it.resposta);
        box.querySelectorAll('button[data-opt], .chip-btn, #checkBtn').forEach((b) => (b.disabled = true));
        const inp = X.$('#ansInput', box); if (inp) inp.disabled = true;
        if (it.tipo === 'escolha') box.querySelectorAll('[data-opt]').forEach((b) => {
          const txt = it.opcoes[+b.dataset.opt];
          if (normAnswer(txt) === normAnswer(it.resposta)) b.classList.add('right');
          else if (txt === answer) b.classList.add('wrong');
        });
        X.$('#exFb', box).innerHTML = `<div class="feedback ${ok ? 'okf' : 'badf'}">${ok ? `<span class="fb-head">${icon('check')} Certo!</span>` : `<span class="fb-head">${icon('x')} Resposta: <b>${esc(it.resposta)}</b></span>`}
          ${it.audio ? `<div class="small muted">Áudio: "${esc(it.audio)}"</div>` : ''}<div class="small">${esc(it.explicacao)}</div></div>
          <button class="btn primary block" id="nextEx" style="margin-top:10px">${i + 1 < items.length ? 'Continuar' : 'Ver resultado'}</button>`;
        X.$('#nextEx', box).onclick = () => { X.stopAudio(); i++; next(); };
        X.$('#nextEx', box).focus();
      };
      if (it.tipo === 'escolha') box.querySelectorAll('[data-opt]').forEach((b) => (b.onclick = () => done(it.opcoes[+b.dataset.opt])));
      else if (it.tipo === 'ordenar') {
        const picked = [];
        const line = X.$('#orderLine', box), check = X.$('#checkBtn', box);
        const draw = () => {
          line.innerHTML = picked.length ? picked.map((k, p) => `<button class="chip-btn on" data-p="${p}">${esc(it.opcoes[k])}</button>`).join('') : '<span class="muted small">Toque nas palavras na ordem certa</span>';
          box.querySelectorAll('[data-w]').forEach((b) => (b.style.visibility = picked.includes(+b.dataset.w) ? 'hidden' : 'visible'));
          line.querySelectorAll('[data-p]').forEach((b) => (b.onclick = () => { picked.splice(+b.dataset.p, 1); draw(); }));
          check.disabled = picked.length !== it.opcoes.length;
        };
        box.querySelectorAll('[data-w]').forEach((b) => (b.onclick = () => { picked.push(+b.dataset.w); draw(); }));
        check.onclick = () => done(picked.map((k) => it.opcoes[k]).join(' '));
        draw();
      } else {
        const inp = X.$('#ansInput', box);
        const go = () => { if (inp.value.trim()) done(inp.value.trim()); };
        X.$('#checkBtn', box).onclick = go;
        inp.onkeydown = (e) => { if (e.key === 'Enter') go(); };
        setTimeout(() => inp.focus(), 50);
      }
    };
    next();
  });
}

/* Pontuação por habilidade a partir dos resultados. */
function bySkill(results) {
  const acc = {};
  for (const r of results) { const k = r.item.habilidade; (acc[k] ??= { ok: 0, n: 0 }); acc[k].n++; if (r.ok) acc[k].ok++; }
  return Object.fromEntries(Object.entries(acc).map(([k, v]) => [k, pctOf(v.ok, v.n)]));
}

/* Fala: o professor diz a frase, o aluno repete. Devolve notas 0-10 (null = sem microfone/pulou). */
function runSpeaking(box, phrases, { live, tries = 2, title = 'Prática oral' }) {
  return new Promise((resolve) => {
    const notas = [];
    let i = 0, attempt = 0;
    const show = () => {
      if (!live()) return;
      if (i >= phrases.length) return resolve(notas);
      const p = phrases[i];
      box.innerHTML = `<div class="card ex-card center">
        <div class="ex-count">${title} · ${i + 1} de ${phrases.length}</div>
        <div class="target" style="margin:12px 0">${esc(p.en)}</div>
        <div class="muted small">${esc(p.pt || '')}</div>
        <div class="heard" id="heard"></div><div class="interim" id="interim"></div>
        <div class="dock-row" style="margin-top:12px">
          <button class="round" id="sListen" title="Ouvir" aria-label="Ouvir">${icon('volume-2')}</button>
          <button class="mic" id="sMic" ${X.canUseMic() ? '' : 'disabled'} aria-label="Repetir">${icon('mic')}</button>
          <button class="round" id="sSkip" title="Pular" aria-label="Pular">${icon('chevron-right')}</button>
        </div>
        <div class="muted small">${X.canUseMic() ? 'Ouça, toque no microfone e repita' : 'Sem microfone: ouça e repita em voz alta'}</div>
      </div>`;
      X.$('#sListen', box).onclick = () => X.say([{ text: p.en }]);
      X.$('#sSkip', box).onclick = () => { X.stopAudio(); notas.push(null); i++; attempt = 0; show(); };
      let busy = false;
      X.$('#sMic', box).onclick = async () => {
        if (busy) return X.stopRecording();
        X.stopAudio(); busy = true;
        const mic = X.$('#sMic', box); mic.classList.add('listening');
        const res = await X.hear(p.en);
        busy = false; mic?.classList.remove('listening');
        if (!live() || !res) return;
        const nota = Math.max(0, Math.min(10, res.nota));
        attempt++;
        (res.erradas || []).forEach((w) => addHardWord(w, res.dica || ''));
        const h = X.$('#heard', box);
        if (h) h.innerHTML = `Ouvi: "${esc(res.transcricao || '')}" · <b>${nota.toFixed(1)}/10</b>${res.dica ? `<div class="small">${icon('lightbulb')} ${esc(res.dica)}</div>` : ''}`;
        if (nota >= 7 || attempt >= tries) {
          notas.push(nota);
          X.setMood(nota >= 9 ? 'orgulhosa' : nota >= 7 ? 'feliz' : 'irritada');
          X.gesture(nota >= 7 ? 'thumbs' : 'facepalm');
          await X.say([{ text: nota >= 7 ? pick(X.S().polite ? RIGHT_POLITE : RIGHT_RUDE) : pick(X.S().polite ? WRONG_POLITE : ['Passa. Mas essa pronúncia vai me assombrar.', 'Puta que pariu, vamos seguir antes que eu chore.']), lang: 'pt-BR' }]);
          if (!live()) return;
          i++; attempt = 0; show();
        } else {
          X.setMood('irritada'); X.gesture('wag');
          await X.say([{ text: X.S().polite ? 'Tenta de novo, devagar.' : 'Que porra foi essa? De novo!', lang: 'pt-BR' }, { text: p.en, mul: 0.8 }]);
        }
      };
      X.say([{ text: p.en }]);
    };
    show();
  });
}

/* ---------- carregar pacote da IA com tela de espera ---------- */
async function loadPack(box, id, build, gen, live, label) {
  const cached = getPack(id);
  if (cached) return cached;
  box.innerHTML = `<div class="card center loading-card"><span class="mini-ico big-ico spin-soft">${icon('sparkles')}</span><p><b>${label}</b></p><span class="typing"><i></i><i></i><i></i></span>
    <p class="muted small">A IA está montando o conteúdo a partir do currículo. Leva uns segundos.</p></div>`;
  X.activity('thinking');
  try {
    const pack = await gen(build());
    if (!live()) return null;
    putPack(id, pack);
    return pack;
  } catch (e) {
    if (!live()) return null;
    X.setMood('chocada');
    box.innerHTML = `<div class="card center"><p>⚠️ ${esc(e.message || String(e))}</p><button class="btn primary" id="retryPack">Tentar de novo</button>
      ${e instanceof AIError && ['nokey', 'badkey', 'model'].includes(e.kind) ? '<p><a href="#settings">Abrir configurações</a></p>' : ''}</div>`;
    return new Promise((res) => { X.$('#retryPack', box).onclick = () => res(loadPack(box, id, build, gen, live, label)); });
  } finally { X.endActivity('thinking'); }
}

/* ==========================================================
   AULA EM 6 ETAPAS
   ========================================================== */
const STEPS = ['Introdução', 'Vocabulário', 'Explicação', 'Prática', 'Oral', 'Verificação'];
/* Modo foco (aula e prova): só fechar, uma barra de progresso e a contagem.
   O Pavio fica de corpo inteiro no palco, e o que ele fala em português aparece no balão. */
const focusBar = (back, steps) => `<div class="focus-bar">
    <button class="icon-btn sm" data-go="${back}" aria-label="Sair">${icon('x')}</button>
    <div class="stepper steps-${steps.length}" id="stepper" role="img" aria-label="Progresso">${steps.map((s, k) => `<span data-k="${k}" title="${s}"></span>`).join('')}</div>
    <span class="focus-count" id="stepCount">1/${steps.length}</span>
  </div>`;
const pavioStage = () => `<div class="pavio-stage">${X.stageHost('full', 'lesson-stage')}<div class="pavio-bubble hidden" id="pavioBubble" aria-live="polite"></div></div>`;
function setFocusStep(k, steps) {
  X.$$('#stepper span').forEach((s, i) => { s.classList.toggle('on', i === k); s.classList.toggle('done', i < k); });
  const c = X.$('#stepCount'); if (c) c.textContent = `${k + 1}/${steps.length}`;
  X.$('#stepper')?.setAttribute('aria-label', `Etapa ${k + 1} de ${steps.length}: ${steps[k]}`);
}
const exampleRow = (e) => `<button class="example-row" data-say="${esc(e.en)}"><span class="ex-play">${icon('volume-2')}</span><span class="grow"><b lang="en">${esc(e.en)}</b><span class="muted small">${esc(e.pt)}</span></span></button>`;
export function renderLessonC(lessonId) {
  const lesson = getLesson(lessonId);
  if (!lesson) return X.go('learn');
  const unit = getUnit(lesson.unit), level = getLevel(lesson.level);
  const live = X.liveCheck();
  const vocab = lesson.title === 'Practice' ? unitVocab(unit).sort(() => Math.random() - 0.5).slice(0, 12) : parseVocab(lesson.vocab);
  X.view.innerHTML = `${focusBar('unit/' + unit.id, STEPS)}${pavioStage()}<div id="stepBox"></div>`;
  const box = X.$('#stepBox');
  const setStep = (k) => setFocusStep(k, STEPS);

  (async () => {
    const pack = await loadPack(box, 'lesson:' + lesson.id + packTag(),
      () => buildLessonPrompt({ teacher: X.T(), polite: X.S().polite, level, unit, lesson, vocab }), generateLesson, live, 'Preparando a aula…');
    if (!pack || !live()) return;
    const nextBtn = (label = 'Próximo') => new Promise((res) => {
      box.insertAdjacentHTML('beforeend', `<button class="btn primary block" id="stepNext" style="margin-top:12px">${label}</button>`);
      X.$('#stepNext', box).onclick = () => { X.stopAudio(); res(); };
    });

    // 1. Introdução
    setStep(0); X.setMood('neutra');
    box.innerHTML = `<div class="step-card step-plain"><span class="eyebrow">${level.id} · Aula ${lesson.n}</span><h1 class="step-title">${esc(lesson.title)}</h1><p class="muted">${esc(lesson.pt)}</p>
      ${pack.exemplos.slice(0, 2).map(exampleRow).join('')}</div>`;
    X.say([{ text: pack.intro, lang: 'pt-BR' }], 'neutra');
    await nextBtn('Começar'); if (!live()) return;

    // 2. Vocabulário
    setStep(1);
    box.innerHTML = `<div class="card step-card"><div class="step-row"><h3 class="step-h">${icon('book-open')} Vocabulário <span class="muted">(${pack.vocab.length})</span></h3><button class="btn sm outline" id="playAll">${icon('volume-2')} Ouvir todas</button></div>
      <p class="muted small">Toque numa palavra para ouvir.</p>
      <div class="vocab-grid">${pack.vocab.map((v) => `<button class="vocab-card" data-say="${esc(v.en)}"><b lang="en">${esc(v.en)}</b><span>${esc(v.pt)}</span>${v.exemplo ? `<i lang="en">${esc(v.exemplo)}</i>` : ''}</button>`).join('')}</div></div>`;
    X.$('#playAll', box).onclick = async () => { for (const v of pack.vocab) { if (!live() || !X.$('#playAll')) break; await X.say([{ text: v.en }]); } };
    await nextBtn(); if (!live()) return;

    // 3. Explicação
    setStep(2);
    box.innerHTML = `<div class="card step-card"><h3 class="step-h">${icon('lightbulb')} Explicação</h3>${pack.explicacao.split(/\n+/).map((l) => `<p>${esc(l)}</p>`).join('')}
      <h3 class="step-h">${icon('message-circle')} Exemplos</h3>${pack.exemplos.map(exampleRow).join('')}</div>`;
    await nextBtn('Praticar'); if (!live()) return;

    // 4. Prática interativa (feedback imediato, não reprova)
    setStep(3);
    const prat = await runItems(box, pack.pratica, { live });
    if (!live()) return;
    Object.entries(bySkill(prat)).forEach(([k, v]) => updateSkill(k, v));

    // 5. Prática oral e auditiva
    setStep(4);
    if (pack.fala.length) {
      const notas = await runSpeaking(box, pack.fala, { live });
      if (!live()) return;
      const valid = notas.filter((n) => n !== null);
      if (valid.length) updateSkill('conversacao', (valid.reduce((a, b) => a + b, 0) / valid.length) * 10);
    }

    // 6. Verificação
    setStep(5);
    box.innerHTML = `<div class="card center step-card"><span class="mini-ico big-ico">${icon('clipboard-check')}</span><h3>Verificação</h3><p class="muted">${pack.quiz.length} questões rápidas. Erros vão para a sua revisão.</p></div>`;
    await nextBtn('Começar verificação'); if (!live()) return;
    const quiz = await runItems(box, pack.quiz, { live });
    if (!live()) return;
    const ok = quiz.filter((r) => r.ok).length, pct = pctOf(ok, quiz.length);
    recordLesson(lesson.id, pct);
    Object.entries(bySkill(quiz)).forEach(([k, v]) => updateSkill(k, v));
    pack.vocab.forEach((v) => addCard(v.en, v.pt));
    quiz.filter((r) => !r.ok).forEach((r) => addCard(r.item.resposta, r.item.explicacao, { failed: true }));
    lessonResult(box, { lesson, unit, pct, quiz });
  })();
}

function lessonResult(box, { lesson, unit, pct, quiz }) {
  const polite = X.S().polite;
  const verdict = pct >= PASS.advance ? (polite ? 'Aula concluída. Muito bem!' : `Passou. Tô quase ${X.T().g === 'm' ? 'orgulhoso' : 'orgulhosa'}.`)
    : pct >= PASS.retry ? (polite ? 'Concluída, mas revise os erros.' : 'Passou raspando. Revisa essa merda.')
    : (polite ? 'Vamos refazer esta aula.' : 'Reprovou, caralho. Refaz essa aula.');
  X.setMood(pct >= 90 ? 'proud' : pct >= PASS.retry ? 'happy' : 'disappointed');
  X.gesture(pct >= PASS.retry ? 'jump' : 'facepalm');
  const nxt = unit.lessons[lesson.n] || null;
  const wrong = quiz.filter((r) => !r.ok);
  box.innerHTML = `<div class="card center result-card">
    <div class="ring result-ring ${pct >= PASS.advance ? '' : pct >= PASS.retry ? 'mid' : 'low'}" style="--p:${pct}"><b>${pct}%</b><span class="small muted">verificação</span></div>
    <p class="result-verdict">${esc(verdict)}</p>
    ${wrong.length ? `<div style="text-align:left"><h3 class="step-h">${icon('repeat')} Para revisar</h3>${wrong.map((r) => `<div class="correction"><b>${esc(r.item.pergunta)}</b><div>${icon('check')} ${esc(r.item.resposta)}</div><div class="small">${esc(r.item.explicacao)}</div></div>`).join('')}</div>` : ''}
    <div class="result-actions">
      ${nxt ? `<button class="btn primary block" data-go="lesson-c/${nxt.id}">Próxima aula ${icon('chevron-right')}</button>` : `<button class="btn primary block" data-go="exam-c/unit/${unit.id}">Prova da unidade ${icon('chevron-right')}</button>`}
      <button class="btn outline block" id="redo" title="Gera uma aula nova sobre o mesmo tema">${icon('rotate-ccw')} Refazer com aula nova</button>
    </div>
    <button class="btn ghost block" data-go="unit/${unit.id}" style="margin-top:8px">Voltar à unidade</button>
    ${X.nextStageBtn()}
  </div>`;
  X.say([{ text: `${pct} por cento. ${verdict}`, lang: 'pt-BR' }]);
  X.$('#redo', box).onclick = () => { dropPack('lesson:' + lesson.id + packTag()); X.route(); };
}

/* ==========================================================
   PROVAS: unidade e final de nível
   ========================================================== */
export function renderExamC(kind, id) {
  const final = kind === 'final';
  const level = getLevel(final ? id : String(id).slice(0, 2));
  const unit = final ? null : getUnit(id);
  if (!final && !unit) return X.go('exams');
  const live = X.liveCheck();
  const packId = `exam:${final ? 'final:' + level.id : unit.id}${packTag()}`;
  const ESTEPS = ['Compreensão', 'Escrita', 'Fala', 'Resultado'];
  X.view.innerHTML = `${focusBar(final ? 'learn/' + level.id : 'unit/' + unit.id, ESTEPS)}${pavioStage()}<div id="stepBox"></div>`;
  const box = X.$('#stepBox');
  const setStep = (k) => setFocusStep(k, ESTEPS);

  (async () => {
    const pack = await loadPack(box, packId, () => buildExamPrompt({ teacher: X.T(), polite: X.S().polite, level, unit, final }),
      (sys) => generateExam(sys, final ? 18 : 15), live, 'Montando a prova…');
    if (!pack || !live()) return;
    box.innerHTML = `<div class="card step-card"><span class="eyebrow">${final ? `Prova final · ${level.id}` : `Prova · ${level.id} · Unidade ${unit.n}`}</span><h1 class="step-title">${final ? `Prova final do ${level.id}` : esc(unit.title)}</h1>
      <div class="exam-parts">
        <div><span class="mini-ico">${icon('book-open')}</span><b>${pack.itens.length}</b><span class="muted small">questões</span></div>
        <div><span class="mini-ico">${icon('pencil')}</span><b>${pack.escrita.length}</b><span class="muted small">de escrita</span></div>
        <div><span class="mini-ico">${icon('audio-lines')}</span><b>${pack.fala.length}</b><span class="muted small">para falar</span></div>
      </div>
      <p class="muted small center">Sem consulta, uma tentativa por questão.</p>
      <button class="btn primary block" id="startExam">${icon('play')} Começar a prova</button></div>`;
    X.say([{ text: pack.abertura, lang: 'pt-BR' }], 'neutra');
    await new Promise((r) => (X.$('#startExam', box).onclick = r)); if (!live()) return;
    X.stopAudio();

    setStep(0);
    const results = await runItems(box, pack.itens, { reading: pack.texto_leitura, live });
    if (!live()) return;

    setStep(1);
    box.innerHTML = `<div class="card step-card"><h3 class="step-h">${icon('pencil')} Escrita</h3>${pack.escrita.map((t, i) => `<div class="write-task"><label for="w${i}"><b>${i + 1}. ${esc(t.pergunta)}</b></label><textarea id="w${i}" rows="4" placeholder="Escreva em inglês..." lang="en"></textarea></div>`).join('')}
      <button class="btn primary block" id="sendW" style="margin-top:12px">${icon('send-horizontal')} Entregar escrita</button></div>`;
    await new Promise((r) => (X.$('#sendW', box).onclick = r)); if (!live()) return;
    const tasks = pack.escrita.map((t, i) => ({ ...t, answer: X.$('#w' + i, box)?.value.trim() || '' }));

    setStep(2);
    const fala = await runSpeaking(box, pack.fala, { live, tries: 1, title: 'Fala' });
    if (!live()) return;

    setStep(3);
    box.innerHTML = `<div class="card center loading-card"><span class="mini-ico big-ico spin-soft">${icon('pencil')}</span><p><b>Corrigindo a escrita…</b></p><span class="typing"><i></i><i></i><i></i></span></div>`;
    X.activity('thinking');
    let written = null, wErr = '';
    try { written = await gradeWriting(buildWritingPrompt({ teacher: X.T(), polite: X.S().polite, levelId: level.id }), tasks); }
    catch (e) { wErr = e.message || String(e); }
    finally { X.endActivity('thinking'); }
    if (!live()) return;

    const skills = bySkill(results);
    if (written) skills.escrita = Math.round((written.reduce((a, r) => a + r.nota, 0) / written.length) * 10);
    const spoken = fala.filter((n) => n !== null);
    if (spoken.length) skills.conversacao = Math.round((spoken.reduce((a, b) => a + b, 0) / spoken.length) * 10);
    const objPct = pctOf(results.filter((r) => r.ok).length, results.length);
    const parts = [[objPct, 0.6]];
    if (skills.escrita !== undefined) parts.push([skills.escrita, 0.2]);
    if (skills.conversacao !== undefined) parts.push([skills.conversacao, 0.2]);
    const score = Math.round(parts.reduce((a, [v, w]) => a + v * w, 0) / parts.reduce((a, [, w]) => a + w, 0));
    Object.entries(skills).forEach(([k, v]) => updateSkill(k, v));
    results.filter((r) => !r.ok).forEach((r) => addCard(r.item.resposta, r.item.explicacao, { failed: true }));

    const need = ['escuta', 'leitura', 'escrita', 'conversacao'];
    const missing = final ? need.filter((k) => skills[k] === undefined) : [];
    const weak = need.filter((k) => skills[k] !== undefined && skills[k] < PASS.finalSkillMin);
    const passed = final ? score >= PASS.advance && !weak.length && !missing.length : score >= PASS.advance;
    if (final) recordFinal(level.id, score, skills, passed); else recordUnitExam(unit.id, score, skills);
    dropPack(packId); // próxima tentativa recebe uma prova nova

    examResult(box, { final, level, unit, score, skills, passed, weak, missing, results, written, tasks, wErr });
  })();
}

function examResult(box, { final, level, unit, score, skills, passed, weak, missing, results, written, tasks, wErr }) {
  const polite = X.S().polite;
  const band = score >= PASS.advance ? 'ok' : score >= PASS.retry ? 'mid' : 'low';
  let verdict;
  if (final) verdict = passed ? (polite ? `Aprovado no ${level.id}! Parabéns.` : `Aprovado no ${level.id}, porra! Não acredito. Tô chorando de raiva e orgulho.`)
    : (polite ? 'Ainda não foi desta vez.' : 'Reprovado. Volta pro treino, criatura.');
  else verdict = band === 'ok' ? (polite ? 'Unidade aprovada!' : 'Aprovado. Milagres acontecem.')
    : band === 'mid' ? (polite ? 'Quase. Revise os pontos fracos e tente de novo.' : 'Quase, mas quase não conta. Revisa e volta.')
    : (polite ? 'Vamos reforçar o conteúdo antes de repetir.' : 'Que vergonha. Refaz as aulas antes de pensar em prova.');
  X.setMood(passed ? 'celebrating' : band === 'mid' ? 'neutral' : 'disappointed');
  X.gesture(passed ? 'jump' : 'facepalm');
  const order = ['vocabulario', 'gramatica', 'escuta', 'leitura', 'escrita', 'conversacao'];
  const nextLv = CEFR[CEFR.findIndex((l) => l.id === level.id) + 1];
  const weakLessons = !final && !passed ? unit.lessons.filter((l) => (state.curr.lessons[l.id]?.best ?? 0) < PASS.advance) : [];
  const warn = (t) => `<p class="small exam-warn">${icon('life-buoy')} ${t}</p>`;
  box.innerHTML = `<div class="card center result-card">
      <div class="ring result-ring ${band === 'ok' ? '' : band}" style="--p:${score}"><b>${score}%</b><span class="small muted">${final ? 'prova final' : 'prova'}</span></div>
      <span class="tag ${passed ? 'ok' : band === 'mid' ? 'warn' : 'bad'}">${passed ? `${icon('check')} Aprovado` : band === 'mid' ? 'Quase lá' : 'Reprovado'}</span>
      <p class="result-verdict">${esc(verdict)}</p>
      <div class="skill-bars" style="text-align:left">${order.filter((k) => skills[k] !== undefined).map((k) => skillBar(SKILLS[k], skills[k], final && k !== 'vocabulario' && k !== 'gramatica')).join('')}</div>
      ${final ? '<p class="muted small" style="text-align:left;margin-bottom:0">* obrigatória para passar de nível</p>' : ''}
      ${missing.length ? warn(`Sem nota em: ${missing.map((k) => SKILLS[k]).join(', ')}. A prova final exige todas as habilidades${missing.includes('conversacao') ? ' (use um navegador com microfone)' : ''}.`) : ''}
      ${weak.length ? warn(`Abaixo de ${PASS.finalSkillMin}%: ${weak.map((k) => SKILLS[k]).join(', ')}.`) : ''}
      ${wErr ? warn(`A escrita não foi corrigida: ${esc(wErr)}`) : ''}
    </div>
    ${written ? `<div class="card"><h3 class="step-h">${icon('pencil')} Correção da escrita</h3>${tasks.map((t, i) => `<div class="correction"><b>${esc(t.pergunta)}</b><div class="small muted">Você: ${esc(t.answer || '(vazio)')}</div>${written[i].correcao ? `<div>${icon('check')} ${esc(written[i].correcao)}</div>` : ''}<div class="small"><b>${written[i].nota.toFixed(1)}/10</b> · ${esc(written[i].comentario)}</div></div>`).join('')}</div>` : ''}
    ${results.some((r) => !r.ok) ? `<details class="card plan-card"><summary><b>${icon('x')} Questões erradas (${results.filter((r) => !r.ok).length})</b></summary>${results.filter((r) => !r.ok).map((r) => `<div class="correction"><b>${esc(r.item.pergunta)}</b>${r.item.audio ? `<div class="small muted">Áudio: "${esc(r.item.audio)}"</div>` : ''}<div class="small muted">Você: ${esc(r.answer)}</div><div>${icon('check')} ${esc(r.item.resposta)}</div><div class="small">${esc(r.item.explicacao)}</div></div>`).join('')}</details>` : ''}
    ${weakLessons.length ? `<div class="card"><h3 class="step-h">${icon('target')} Revisão direcionada</h3><div class="lesson-list">${weakLessons.map((l) => `<button class="lesson-row" data-go="lesson-c/${l.id}"><span class="dot">${l.n}</span><span class="grow"><b>${esc(l.title)}</b><span class="muted small">${esc(l.pt)}</span></span>${icon('chevron-right', 'ic-muted')}</button>`).join('')}</div></div>` : ''}
    <div class="result-actions">
      ${final && passed && nextLv ? `<button class="btn primary block" id="advance">Avançar para o ${nextLv.id} ${icon('chevron-right')}</button>` : ''}
      ${!final && passed ? `<button class="btn primary block" data-go="learn/${level.id}">Próxima unidade ${icon('chevron-right')}</button>` : ''}
      <button class="btn outline block" id="again">${icon('rotate-ccw')} Nova tentativa</button>
    </div>
    ${X.nextStageBtn()}`;
  X.say([{ text: `${score} por cento. ${verdict}`, lang: 'pt-BR' }]);
  X.$('#again', box).onclick = () => X.route();
  const adv = X.$('#advance', box); if (adv) adv.onclick = () => { setLevel(nextLv.id); X.toast(`Bem-vindo ao ${nextLv.id}!`); X.go('learn/' + nextLv.id); };
}
function skillBar(name, v, required) {
  const cls = v >= PASS.advance ? 'ok' : v >= PASS.retry ? 'mid' : 'low';
  return `<div class="skill-row"><span>${esc(name)}${required ? ' *' : ''}</span><span class="bar"><i class="${cls}" style="width:${v}%"></i></span><b>${v}%</b></div>`;
}
export const skillBars = (list) => list.map((s) => s.v === null ? `<div class="skill-row"><span>${esc(s.name)}</span><span class="bar"></span><b class="muted">—</b></div>` : skillBar(s.name, s.v)).join('');

/* ==========================================================
   AVALIAÇÕES (hub)
   ========================================================== */
export function renderExams() {
  const lv = currentLevel();
  const due = Object.keys(state.srs).length;
  const hist = [
    ...Object.entries(state.curr.unitExams).flatMap(([id, l]) => l.map((e) => ({ ...e, name: `${id.replace('-U', ' · Unidade ')}` }))),
    ...Object.entries(state.curr.finals).flatMap(([id, l]) => l.map((e) => ({ ...e, name: `Prova final ${id}${e.passed ? ' (aprovado)' : ''}` }))),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15);
  const passedUnits = lv.units.filter((u) => (bestUnitExam(u.id) ?? 0) >= PASS.advance).length;
  const nextU = lv.units.find((u) => (bestUnitExam(u.id) ?? 0) < PASS.advance);
  const fp = finalPassed(lv.id);
  X.view.innerHTML = `
    <header class="page-head"><h1>Avaliações</h1>
      <p class="muted small">O app não aprova só por concluir aulas: você precisa demonstrar o que aprendeu.</p></header>
    <section class="card exam-hero">
      <div class="level-hero-top">
        <span class="lvl-badge">${lv.id}</span>
        <div class="grow"><b class="level-name">${passedUnits}/${lv.units.length} provas de unidade</b><span class="muted small">${fp ? 'Prova final aprovada' : 'Aprove as unidades e depois a prova final'}</span></div>
        <div class="ring" style="--p:${pctOf(passedUnits, lv.units.length)}"><b>${pctOf(passedUnits, lv.units.length)}%</b></div>
      </div>
      ${nextU ? `<button class="btn primary block" data-go="exam-c/unit/${nextU.id}">${icon('clipboard-check')} Próxima: Unidade ${nextU.n} · ${esc(nextU.title)}</button>` : ''}
    </section>
    <div class="section-head"><h2>Provas de unidade · ${lv.id}</h2></div>
    <div class="card lesson-list">
      ${lv.units.map((u) => { const b = bestUnitExam(u.id), ok = b !== null && b >= PASS.advance; return `<button class="lesson-row" data-go="exam-c/unit/${u.id}"><span class="dot ${b === null ? '' : ok ? 'ok' : 'warn'}">${ok ? icon('check') : u.n}</span><span class="grow"><b>${esc(u.title)}</b><span class="muted small">Unidade ${u.n}</span></span>${b === null ? '<span class="muted small">não feita</span>' : `<span class="tag ${ok ? 'ok' : b >= PASS.retry ? 'warn' : 'bad'}">${b}%</span>`}${icon('chevron-right', 'ic-muted')}</button>`; }).join('')}
    </div>
    <section class="card final-card exam-final">
      <div class="guided-head"><span class="mini-ico">${icon('graduation-cap')}</span><div class="grow"><b>Prova final do ${lv.id}</b><span class="muted small">${esc(lv.final)}</span></div>${fp ? `<span class="tag ok">${icon('check')} Aprovado</span>` : ''}</div>
      <button class="btn ${fp ? 'outline' : 'primary'} block" data-go="exam-c/final/${lv.id}">${fp ? 'Refazer (já aprovado)' : 'Fazer a prova final'}</button>
    </section>
    <div class="mode-grid">
      <button class="mode-card" data-go="retention"><span class="mini-ico">${icon('repeat')}</span><b>Avaliação de retenção</b><span class="muted small">${due} itens estudados</span></button>
      <button class="mode-card" id="lvlTest"><span class="mini-ico">${icon('compass')}</span><b>Teste de nível</b><span class="muted small">Nivelamento rápido</span></button>
    </div>
    <details class="card plan-card"><summary><b>${icon('target')} Critérios de aprovação</b></summary>
      <ul class="small crit-list">
        <li><span class="tag ok">${PASS.advance}%+</span> na prova de unidade: avança sem reforço.</li>
        <li><span class="tag warn">${PASS.retry}–${PASS.advance - 1}%</span> revisão direcionada dos pontos fracos e nova tentativa.</li>
        <li><span class="tag bad">&lt; ${PASS.retry}%</span> reforço do conteúdo antes de repetir.</li>
        <li>Para passar de nível: ${PASS.advance}% no geral e pelo menos ${PASS.finalSkillMin}% em escuta, fala, leitura e escrita.</li>
      </ul>
      <p class="muted small">Regras internas do app, não são critérios oficiais de certificação CEFR. A nota de fala depende da qualidade do áudio e do reconhecimento automático.</p></details>
    <div class="section-head"><h2>Histórico</h2></div>
    <div class="card">${hist.length ? hist.map((e) => `<div class="list-item hist-item"><span class="grow"><b>${esc(e.name)}</b><span class="muted small">${e.date}</span></span><span class="tag ${e.score >= PASS.advance ? 'ok' : e.score >= PASS.retry ? 'warn' : 'bad'}">${e.score}%</span></div>`).join('') : `<p class="muted center empty">${icon('clipboard-check')}<br>Nenhuma prova feita ainda.</p>`}</div>`;
  X.$('#lvlTest').onclick = X.levelTest;
}

/* ==========================================================
   REVISÃO ESPAÇADA (flashcards) e AVALIAÇÃO DE RETENÇÃO
   ========================================================== */
/* Caixas da revisão espaçada (1 = revisa logo, 5 = bem guardado). */
const boxesHTML = (counts) => `<div class="srs-boxes" aria-label="Cartões por caixa">${counts.map((c, i) => `<div><b>${c}</b><span class="muted small">caixa ${i + 1}</span></div>`).join('')}</div>`;
export function renderSrs() {
  const cards = dueCards(25);
  const counts = boxCounts();
  if (!cards.length) {
    X.view.innerHTML = `<button class="link back-link" data-go="review">${icon('chevron-left')} Revisar</button>
      <header class="page-head"><h1>Revisão espaçada</h1></header>
      <div class="card center empty-card"><span class="mini-ico big-ico">${icon('check')}</span><p><b>Nada para revisar hoje.</b> ${X.S().polite ? '' : 'Aproveita que é raro.'}</p>
      ${boxesHTML(counts)}
      <button class="btn primary block" data-go="learn">${icon('book-open')} Ir para as aulas</button> ${X.nextStageBtn()}</div>`;
    return;
  }
  let i = 0, ok = 0;
  const show = () => {
    if (i >= cards.length) {
      updateSkill('vocabulario', pctOf(ok, cards.length));
      X.setMood(ok / cards.length >= 0.8 ? 'feliz' : 'irritada');
      const pct = pctOf(ok, cards.length);
      X.view.innerHTML = `<header class="page-head"><h1>Revisão espaçada</h1></header><div class="card center result-card">
        <div class="ring result-ring ${pct >= PASS.advance ? '' : pct >= PASS.retry ? 'mid' : 'low'}" style="--p:${pct}"><b>${ok}/${cards.length}</b><span class="small muted">acertos</span></div>
        <p>Os que você errou voltam amanhã; os que acertou vão para mais longe.</p>
        <button class="btn primary block" data-go="review">Concluir</button> ${X.nextStageBtn()}</div>`;
      return;
    }
    const c = cards[i];
    X.view.innerHTML = `<button class="link back-link" data-go="review">${icon('chevron-left')} Revisar</button>
      <header class="page-head"><h1>Revisão espaçada</h1></header>
      <div class="ex-head"><span class="tag">${icon('repeat')} Caixa ${c.box}</span><span class="muted small">${i + 1}/${cards.length}</span></div>
      <div class="progress ex-prog"><i style="width:${Math.round((i / cards.length) * 100)}%"></i></div>
      <div class="card flash center">
        <span class="eyebrow flash-side">Inglês</span>
        <div class="target" lang="en">${esc(c.en)}</div>
        <button class="btn sm outline" id="fPlay">${icon('volume-2')} Ouvir</button>
        <div id="back" class="hidden flash-back"><span class="eyebrow flash-side">Português</span><p>${esc(c.pt || '—')}</p></div>
        <button class="btn primary block" id="reveal" style="margin-top:16px">Mostrar resposta</button>
        <div class="grade-row hidden" id="gradeRow"><button class="btn outline grow miss" id="miss">${icon('x')} Errei</button><button class="btn primary grow" id="hit">${icon('check')} Acertei</button></div>
      </div>`;
    X.say([{ text: c.en }]);
    X.$('#fPlay').onclick = () => X.say([{ text: c.en }]);
    X.$('#reveal').onclick = () => { X.$('#back').classList.remove('hidden'); X.$('#gradeRow').classList.remove('hidden'); X.$('#reveal').classList.add('hidden'); };
    X.$('#miss').onclick = () => { grade(c.en, false); react(false); i++; show(); };
    X.$('#hit').onclick = () => { grade(c.en, true); ok++; i++; show(); };
  };
  show();
}

/* Avaliação de retenção: múltipla escolha montada com o que você já estudou (sem IA). */
export function renderRetention() {
  const all = Object.values(state.srs).filter((c) => c.pt && c.pt.length < 80);
  const live = X.liveCheck();
  X.view.innerHTML = `<button class="link back-link" data-go="exams">${icon('chevron-left')} Avaliações</button>
    <header class="page-head"><h1>Avaliação de retenção</h1>
    <p class="muted small">Revisão cumulativa do que você estudou, para ver se ainda lembra.</p></header><div id="stepBox"></div>`;
  const box = X.$('#stepBox');
  if (all.length < 6) { box.innerHTML = `<div class="card center empty-card"><span class="mini-ico big-ico">${icon('lock')}</span><p>Estude pelo menos uma aula completa para liberar esta avaliação.</p><button class="btn primary" data-go="learn">${icon('book-open')} Ir para as aulas</button></div>`; return; }
  // Prioriza os mais antigos e os que já caíram de caixa.
  const pool = all.sort((a, b) => (a.box - b.box) || String(a.added).localeCompare(String(b.added))).slice(0, 30).sort(() => Math.random() - 0.5).slice(0, 10);
  const items = pool.map((c) => {
    const wrong = all.filter((x) => x.pt !== c.pt).sort(() => Math.random() - 0.5).slice(0, 3).map((x) => x.pt);
    const listen = Math.random() < 0.4;
    return {
      tipo: 'escolha', habilidade: listen ? 'escuta' : 'vocabulario', audio: listen ? c.en : null,
      pergunta: listen ? 'O que você ouviu significa:' : `O que significa "${c.en}"?`,
      opcoes: [c.pt, ...wrong].sort(() => Math.random() - 0.5), resposta: c.pt, aceitas: [], explicacao: `${c.en} = ${c.pt}`, _card: c,
    };
  });
  (async () => {
    const res = await runItems(box, items, { live, onEach: (it, ok) => grade(it._card.en, ok) });
    if (!live()) return;
    const pct = pctOf(res.filter((r) => r.ok).length, res.length);
    Object.entries(bySkill(res)).forEach(([k, v]) => updateSkill(k, v));
    X.setMood(pct >= PASS.advance ? 'orgulhosa' : pct >= PASS.retry ? 'neutra' : 'irritada');
    box.innerHTML = `<div class="card center result-card"><div class="ring result-ring ${pct >= PASS.advance ? '' : pct >= PASS.retry ? 'mid' : 'low'}" style="--p:${pct}"><b>${pct}%</b><span class="small muted">retenção</span></div>
      <p class="result-verdict">${pct >= PASS.advance ? 'Memória em dia.' : X.S().polite ? 'Vale revisar mais vezes.' : 'Esqueceu tudo, né? Revisão espaçada todo dia, porra.'}</p>
      <button class="btn primary block" data-go="srs">${icon('repeat')} Revisão espaçada</button></div>`;
  })();
}
