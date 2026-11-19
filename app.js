/* ==========================================================
   app.js — EaglesIn
   Telas: início (plano do dia), temas, aula (o professor fala a
   frase, você repete, ele corrige), conversa, provas, revisão de
   palavras difíceis, progresso e configurações.
   ========================================================== */
import { THEMES, GROUPS, LEVELS, FREE_THEME, getTheme, genderize, LEVEL_TEST } from './content.js';
import {
  state, save, flush, PLANS, currentPlan, goalSeconds, addStudyTime, today, isTrainingDay, dayKey, lastDays,
  recordPhrase, recordNota, recordExam, themeStats, addHardWord, hardWords, removeHardWord, resetAll, exportData, importData,
} from './js/store.js';
import * as voice from './js/voice.js';
import * as recorder from './js/recorder.js';
import * as eleven from './js/eleven.js';
import * as mem from './js/memory.js';
import { chatReply, sessionSummary, judgePronunciation, testKey, AIError, DEFAULT_MODEL } from './js/ai.js';
import { buildSystemPrompt, buildSummaryPrompt, TEACHERS, getTeacher, CHAT_MODES, HUMOR, stateNote } from './js/prompts.js';
import { compare, tokenize, celebrateLine } from './js/pronunciation.js';
import { stage } from './js/mascot.js';
import { pavio } from './js/pavio.js';
import { pavio3d, webglOK } from './js/pavio3d.js';
import * as emo from './js/emotion.js';
import { CEFR, SKILLS, getLevel, getUnit, getConvo, parseVocab } from './js/curriculum.js';
import { streak, recordConvo, updateSkill, lessonDone, PASS, userLevel } from './js/store.js';
import { dueCards } from './js/srs.js';
import * as learn from './js/learn.js';
import * as onb from './js/onboarding.js';
import * as auth from './js/auth.js';

/* ---------------------------------------------------------- helpers */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const view = $('#view');
const S = () => state.settings;
/* Professor atual, já com a intensidade de humor escolhida para ele. */
const T = () => { const t = getTeacher(S().teacher); return { ...t, humor: S().humorBy?.[t.id] || 'grosseiro' }; };
const tx = (text) => genderize(text, T());
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (sec) => { sec = Math.max(0, Math.round(sec)); return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const cleanWord = (w) => w.replace(/[^\p{L}\p{N}'-]/gu, '');
const useGeminiEars = () => S().listenMode === 'gemini' && recorder.canRecord;
const canUseMic = () => useGeminiEars() || voice.canListen;
const isTalking = () => voice.isSpeaking() || eleven.isPlaying();

let toastTimer;
function toast(msg, ms = 2800) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}
function openModal(html) { $('#modalCard').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });

/* Ícone do conjunto embutido no index.html (fonte: icons/ui.svg, Lucide). */
const MODE_ICON = { livre: 'message-circle', simulacao: 'drama', desafio: 'trophy', pronuncia: 'audio-lines', debate: 'swords', guiada: 'compass', tema: 'clapperboard' };
const icon = (name, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

/* ---------------------------------------------------------- memória do aluno (Configurações) */
function memoryCard() {
  const m = mem.memoryData();
  const x = (attr, v) => `<button class="icon-btn sm" ${attr}="${esc(String(v))}" aria-label="Esquecer">${icon('x')}</button>`;
  return `<div class="card">
      <h2 class="set-h">${icon('brain')} Memória do aluno</h2>
      <div class="switch"><span><b>O professor lembra de você</b><br><span class="muted small">Fatos que você contou, erros que repete e como foram as últimas conversas. Fica só neste aparelho e vai junto para o Gemini nas conversas.</span></span><input type="checkbox" id="memOn" ${m.on ? 'checked' : ''} /></div>
      ${m.on ? `
      <h3 style="margin-top:12px">Sobre você</h3>
      ${m.facts.length ? m.facts.map((f, i) => `<div class="list-item"><span>${esc(f.t)}</span>${x('data-memfact', i)}</div>`).join('') : '<p class="muted small">Nada ainda. Conte sobre você nas conversas (trabalho, gostos, objetivo).</p>'}
      <h3 style="margin-top:12px">Erros que ele lembra</h3>
      ${m.errors.length ? m.errors.slice(0, 12).map((e) => `<div class="list-item"><span>${e.errado ? `<s>${esc(e.errado)}</s> → ` : ''}<b>${esc(e.certo)}</b> <span class="muted small">${e.n}x</span></span>${x('data-memerr', e.k)}</div>`).join('') : '<p class="muted small">Nenhum erro anotado.</p>'}
      ${m.sessions.length ? `<p class="muted small" style="margin-top:8px">Lembra das últimas ${m.sessions.length} conversas resumidas.</p>` : ''}
      <button class="btn sm outline danger" id="memClear" style="margin-top:10px">Apagar memória</button>` : ''}
    </div>`;
}

/* ---------------------------------------------------------- tema (escuro é o padrão) */
function applyTheme() {
  const light = S().uiTheme === 'light';
  if (light) document.documentElement.dataset.theme = 'light'; else delete document.documentElement.dataset.theme;
  document.documentElement.dataset.pavioMotion = S().pavioMotion === false ? 'off' : 'on';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#F5F7F5' : '#080B09');
}
applyTheme();

/* ---------------------------------------------------------- personagem 3D */
/* Cada professor tem seu renderer (mesma API): nuvem animada ou Pavio 2.5D.
   A Cláudia usa a nuvem até ganhar arte própria. */
const RENDERERS = { cloud: stage, pavio, pavio3d };
/* Pavio em 3D quando ligado nas Configurações e o aparelho tem WebGL; se o 3D falhar, volta para o 2.5D. */
const use3d = () => S().pavio3d && webglOK() && rState.get(pavio3d) !== false;
const R = () => { const id = getTeacher(S().teacher).renderer; return id === 'pavio' && use3d() ? pavio3d : RENDERERS[id] || stage; };
const rState = new Map(); // renderer -> true (pronto) | false (falhou)
const rOK = () => rState.get(R()) === true;
const STAGE_MODE = { home: 'full', chat: 'bust', lesson: 'full', exam: 'full', 'lesson-c': 'full', 'exam-c': 'full', welcome: 'full' };
/* Telas em modo foco: sem cabeçalho nem barra de abas (aula, prova, primeiro acesso, login). */
const FOCUS_ROUTES = new Set(['lesson-c', 'exam-c', 'welcome', 'login']);
/* Balão de fala do Pavio (aulas e primeiro acesso): mostra o que ele diz em português. */
function bubble(text) { const b = $('#pavioBubble'); if (!b) return; b.textContent = text || ''; b.classList.toggle('hidden', !text); if (text) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); } }
async function ensureStage() {
  const r = R();
  if (rState.has(r)) return rState.get(r);
  try { await r.init(); rState.set(r, true); }
  catch (e) {
    console.warn('Personagem indisponível:', e); rState.set(r, false);
    if (r === pavio3d) { toast('3D indisponível neste aparelho. Usando o Pavio 2.5D.'); return ensureStage(); }
  }
  return rState.get(r);
}
const stageHost = (mode, extra = '') => `<div class="stage-box ${mode} ${extra}" id="stageBox"></div>`;
function mountStage(mode) {
  const box = $('#stageBox'); if (!box) return;
  if (rOK()) R().mount(box, mode);
  else box.innerHTML = `<div class="stage-fallback">${T().faces.neutra}</div>`;
}
/* Recebe emoção canônica (emotion.js) ou nome antigo ("irritada"...) e entrega ao renderer do professor. */
function setMood(e) {
  const c = emo.toEmotion(e);
  if (rOK()) R().setMood(R() === stage ? emo.toCloud(c) : c);
  const fb = $('.stage-fallback'); if (fb) fb.textContent = T().faces[emo.toCloud(c)] || T().faces.neutra;
}
const gesture = (name) => { if (rOK()) R().play(name); };
/* Estado real do personagem: 'listening' enquanto o microfone grava, 'thinking' enquanto espera a IA. */
const activity = (a) => { setTalkState(a, true); if (rOK()) R().setActivity(a); };
const endActivity = (a) => { setTalkState(a, false); if (rOK() && R().activity === a) R().setActivity(null); };
/* Indicador da conversa (Ouvindo / Pensando / Falando / Sua vez) e cor do microfone. */
const talkState = { listening: false, thinking: false, speaking: false };
const TALK_LABEL = { listening: 'Ouvindo você…', thinking: 'Pensando…', speaking: 'Falando…', idle: 'Sua vez' };
function setTalkState(k, on) { if (k in talkState) { talkState[k] = !!on; paintTalkState(); } }
function paintTalkState() {
  const s = talkState.listening ? 'listening' : talkState.thinking ? 'thinking' : talkState.speaking ? 'speaking' : 'idle';
  const el = $('#chatStatus');
  if (el && el.dataset.state !== s) { el.dataset.state = s; el.querySelector('span').textContent = TALK_LABEL[s]; }
  $('#mic')?.classList.toggle('speaking', s === 'speaking');
}
/* Resposta corrigida (aula, exercício, conversa) -> escada de paciência -> emoção e fala do professor. */
function reactAnswer(ok, key) {
  const t = T(), res = emo.answer(ok, key);
  const e = emo.emotionFor(t, res, t.humor, S().polite);
  setMood(e);
  gesture(ok ? (e === 'celebrating' ? 'jump' : 'thumbs') : e === 'furious' ? 'stomp' : e === 'sarcastic' ? 'shrug' : 'wag');
  return { res, emotion: e, line: emo.lineFor(t, res, t.humor, S().polite) };
}

/* ---------------------------------------------------------- voz do professor */
let elevenOff = false; // vira true se o ElevenLabs ficar sem créditos ou recusar a chave
function stopAudio() { sayToken++; setTalkState('speaking', false); voice.stopSpeaking(); eleven.stop(); for (const r of Object.values(RENDERERS)) if (rState.get(r)) r.setTalking(false); }
let sayToken = 0;
/* Fala com o ElevenLabs usando o ID de voz colado nas Configurações (vale para todos os personagens).
   Se falhar, say() avisa e volta para a voz do aparelho. */
let libraryBlocked = false;
const elevenWarned = new Set(); // avisa cada tipo de falha só uma vez por sessão
let lastElevenVoice = ''; // nome da voz que tocou por último (para o "Testar a voz")
async function speakEleven(text, opts) {
  const id = eleven.voiceFor();
  await eleven.speak(text, { ...opts, voiceId: id });
  lastElevenVoice = S().eleven.voiceName || id;
}
/* parts: [{ text, lang?, mul? }]. Inglês e português usam o ElevenLabs se configurado (a mesma voz
   faz o inglês e a bronca); sem ele, ou se falhar, a voz do navegador. */
async function say(parts, mood, opts = {}) {
  const my = ++sayToken;
  if (mood) setMood(mood);
  { const pt = parts.filter((p) => p.text && p.lang === 'pt-BR').map((p) => p.text).join(' '); if (pt && !opts.noBubble) bubble(pt); }
  /* Preferência de áudio (primeiro acesso / Configurações): 'all' fala tudo; 'speech' só o inglês
     dos exercícios; 'off' nada. opts.force = a pessoa tocou em "Ouvir" (sempre toca). */
  const pref = opts.force ? 'all' : S().audioPref || 'all';
  if (pref === 'off') return;
  if (pref === 'speech') { parts = parts.filter((p) => (p.lang || 'en-US') !== 'pt-BR'); if (!parts.length) return; }
  setTalkState('speaking', true);
  if (rOK()) R().setTalking(true);
  try {
    for (const p of parts) {
      if (!p.text || my !== sayToken) continue;
      const lang = p.lang || 'en-US';
      const rate = lang === 'pt-BR' ? 1.05 : S().rate * (p.mul || 1);
      if (eleven.elevenReady() && !elevenOff) {
        try { await speakEleven(p.text, { lang, rate, alive: () => my === sayToken }); continue; }
        catch (e) {
          if (my !== sayToken) continue;
          if (['quota', 'badkey', 'voice', 'library'].includes(e.kind)) { elevenOff = true; toast(e.message + ' Usando a voz do navegador.', 5000); }
          else if (!elevenWarned.has(e.kind)) { elevenWarned.add(e.kind); toast(e.message + ' Usando a voz do navegador nesta fala.', 5000); }
        }
      }
      if (my !== sayToken) continue;
      await voice.speak(p.text, { lang, rate, voiceURI: S().voiceURI, voiceURIpt: S().voiceURIpt, male: T().g === 'm' });
    }
  } finally { if (my === sayToken) { setTalkState('speaking', false); if (rOK()) R().setTalking(false); } }
}

/* ---------------------------------------------------------- tempo de estudo e treino guiado */
let lastActivity = Date.now();
['pointerdown', 'keydown'].forEach((ev) => addEventListener(ev, () => (lastActivity = Date.now()), { passive: true }));
const STUDY_ROUTES = new Set(['lesson', 'exam', 'chat', 'review', 'drill']);
let pendingSec = 0;
setInterval(() => {
  if (document.visibilityState !== 'visible') return;
  const active = STUDY_ROUTES.has(currentRoute) && (Date.now() - lastActivity < 120000 || isTalking() || voice.isListening() || recorder.isRecording() || busy);
  if (active) { pendingSec++; if (train) train.elapsed++; }
  if (pendingSec >= 5) {
    const met = addStudyTime(pendingSec); pendingSec = 0;
    if (met) toast('🏁 Meta do dia batida!', 3500);
  }
  updateTrainbar();
}, 1000);
const flushTime = () => { if (pendingSec) { addStudyTime(pendingSec); pendingSec = 0; } flush(); };
addEventListener('pagehide', flushTime);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { flushTime(); stopAudio(); voice.stopListening(); recorder.stopRecording(); }
});

let train = null; // { idx, elapsed, theme }
function startTrain() { train = { idx: 0, elapsed: 0, theme: nextTheme() }; goStage(); }
function goStage() {
  const st = train && currentPlan().stages[train.idx];
  if (!st) { train = null; updateTrainbar(); toast('🏁 Treino de hoje concluído!', 3500); return go('home'); }
  const nl = learn.nextLesson(), cv = learn.nextConvo();
  const map = { review: 'review', repeat: nl ? 'lesson-c/' + nl.id : 'exams', chat: 'chat/' + cv.id, exercises: 'srs', summary: 'chat/__summary' };
  toast(`▶️ ${st.name} (${st.min} min)`);
  go(map[st.id] || 'home');
  updateTrainbar();
}
function nextStage() { if (!train) return; train.idx++; train.elapsed = 0; goStage(); }
function updateTrainbar() {
  const bar = $('#trainbar');
  const st = train && currentPlan().stages[train.idx];
  if (!st) { bar.classList.add('hidden'); return; }
  bar.classList.remove('hidden');
  const left = st.min * 60 - train.elapsed;
  $('#trainStage').textContent = `${train.idx + 1}/${currentPlan().stages.length} · ${st.name}`;
  $('#trainClock').textContent = left > 0 ? fmt(left) : '⏰ 00:00';
  $('#trainProgress').style.width = Math.min(100, ((today().seconds + pendingSec) / goalSeconds()) * 100) + '%';
  $('#trainSkip').textContent = left > 0 ? 'pular etapa ›' : 'próxima etapa ›';
}
$('#trainSkip').onclick = nextStage;
$('#trainStop').onclick = () => { train = null; updateTrainbar(); toast('Treino pausado. O tempo estudado continua contando.'); };
const nextStageBtn = () => (train ? `<button class="btn primary block" data-nextstage style="margin-top:12px">Próxima etapa ›</button>` : '');
document.addEventListener('click', (e) => { if (e.target.closest('[data-nextstage]')) nextStage(); });

/* ---------------------------------------------------------- tema sugerido */
function nextTheme(level = S().level) {
  let best = THEMES[0], bestN = Infinity;
  for (const t of THEMES) { const n = themeStats(level, t.id).practiced; if (n < bestN) { bestN = n; best = t; } }
  return best.id;
}

/* ---------------------------------------------------------- roteador */
let currentRoute = 'home';
let cleanups = [];
let busy = false;
let routeSeq = 0;
/* Devolve uma função que diz se a tela atual ainda é a mesma (para cortar tarefas assíncronas). */
const liveCheck = () => { const s = routeSeq; return () => s === routeSeq; };
const modoClassico = () => { try { return sessionStorage.getItem('eaglesin-classico') === '1'; } catch { return false; } };
function go(hash) { closeModal(); if (location.hash === '#' + hash) route(); else location.hash = hash; }
function route() {
  routeSeq++;
  cleanups.forEach((f) => { try { f(); } catch {} });
  cleanups = [];
  voice.stopListening(); recorder.stopRecording(); stopAudio(); activity(null); setMood('neutra');
  let [name, ...args] = (location.hash.slice(1) || 'home').split('/').map(decodeURIComponent);
  // Primeiro acesso: a apresentação do Pavio vem antes de tudo (menos do login).
  if (onb.needsOnboarding() && name !== 'login') { name = 'welcome'; args = []; }
  // Desde a G2 (2026-11-18) o jogo é a entrada do EaglesIn: o Início abre o jogo,
  // a menos que a pessoa tenha escolhido o modo clássico nesta sessão (botão no jogo).
  if (name === 'home' && !modoClassico()) { location.replace('jogo/'); return; }
  const map = {
    home: renderHome, learn: learn.renderLearn, unit: learn.renderUnit, 'lesson-c': learn.renderLessonC, 'exam-c': learn.renderExamC,
    exams: learn.renderExams, srs: learn.renderSrs, retention: learn.renderRetention, talk: renderTalk,
    trail: renderTrail, theme: renderTheme, lesson: renderLesson, exam: renderExam, drill: renderDrill, chat: renderChat,
    review: renderReview, progress: renderProgress, settings: renderSettings, welcome: onb.renderWelcome, login: renderLogin,
  };
  currentRoute = map[name] ? name : 'home';
  const tab = {
    unit: 'learn', 'lesson-c': 'learn', 'exam-c': 'exams', retention: 'exams', trail: 'talk', theme: 'talk', lesson: 'talk', exam: 'talk',
    chat: 'talk', drill: 'review', srs: 'review', settings: '',
  }[currentRoute] ?? currentRoute;
  $$('.tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.go === tab));
  document.body.classList.toggle('focus', FOCUS_ROUTES.has(currentRoute));
  updateChips();
  view.scrollTop = 0;
  map[currentRoute](...args);
  updateTrainbar();
  const mode = STAGE_MODE[currentRoute];
  if (mode) ensureStage().then(() => { if ($('#stageBox')) { mountStage(mode); if (currentRoute === 'welcome') onb.onStageReady(); } });
}
window.addEventListener('hashchange', route);
document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]');
  if (g) { e.preventDefault(); go(g.dataset.go === 'chat' ? 'chat/' + learn.nextConvo().id : g.dataset.go); return; }
  const s = e.target.closest('[data-say]');
  if (s) { say([{ text: s.dataset.say }], undefined, { force: true }); }
});

/* ==========================================================
   INÍCIO
   ========================================================== */
function updateChips() {
  $('#chipStreak').innerHTML = `${icon('flame')}${streak()}`;
  $('#chipStreak').title = 'Dias consecutivos com a meta batida';
  $('#chipXp').innerHTML = `${icon('graduation-cap')}${esc(S().cefr)}`;
  $('#chipXp').title = 'Seu nível CEFR';
}

/* ---------------------------------------------------------- instalar o app (PWA)
   Android e computador: o navegador avisa (beforeinstallprompt) e o botão abre a instalação.
   iPhone: não existe esse aviso; o botão mostra o passo a passo do Safari. */
let installEvt = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOSDevice = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const canOfferInstall = () => !isStandalone() && (!!installEvt || isIOSDevice);
function refreshInstallUI() { $$('[data-install]').forEach((el) => el.classList.toggle('hidden', !canOfferInstall() || (el.dataset.install === 'home' && S().installDismissed))); }
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; refreshInstallUI(); });
addEventListener('appinstalled', () => { installEvt = null; refreshInstallUI(); toast('EaglesIn instalado. Abra pelo ícone do Pavio.'); });
async function installApp() {
  if (installEvt) {
    installEvt.prompt();
    const { outcome } = await installEvt.userChoice.catch(() => ({}));
    installEvt = null; refreshInstallUI();
    if (outcome === 'accepted') toast('Instalando o EaglesIn…');
    return;
  }
  if (!isIOSDevice) {
    openModal(`<h2>${icon('download')} Instalar o EaglesIn</h2>
      <p>No menu do navegador (<b>⋮</b> ou <b>…</b>), toque em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</p>
      <p class="muted small">No Firefox do computador não existe essa opção; use Chrome ou Edge.</p>
      <button class="btn primary block" id="instOk">Entendi</button>`);
    $('#instOk').onclick = closeModal; return;
  }
  const safari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
  openModal(`
    <h2>${icon('download')} Instalar no iPhone</h2>
    ${safari ? '' : '<p class="muted small">Se não aparecer a opção, abra este site no Safari.</p>'}
    <ol class="install-steps">
      <li>Toque em <b>Compartilhar</b> <span class="muted">(o quadrado com a seta para cima, na barra do navegador)</span>.</li>
      <li>Role e toque em <b>Adicionar à Tela de Início</b>.</li>
      <li>Toque em <b>Adicionar</b>. O EaglesIn aparece com o ícone do Pavio.</li>
    </ol>
    <button class="btn primary block" id="instOk">Entendi</button>`);
  $('#instOk').onclick = closeModal;
}
const installCardHTML = () => `<div class="card install-card" data-install="home">
    <img src="icons/pavio-marca.png" alt="" width="40" height="40" />
    <div class="grow"><b>Instale o app</b><span class="muted small">Tela cheia, com o ícone do Pavio.</span></div>
    <button class="btn sm primary" data-install-go>${icon('download')} Instalar</button>
    <button class="icon-btn sm" data-install-x aria-label="Dispensar">${icon('x')}</button>
  </div>`;
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-install-go]')) installApp();
  else if (e.target.closest('[data-install-x]')) { S().installDismissed = true; save(); refreshInstallUI(); }
});

/* ---------------------------------------------------------- privacidade e login */
function showPrivacy() {
  openModal(`<h2>${icon('lock')} Privacidade</h2>
    <ul class="install-steps">
      <li>Seu progresso, suas respostas e as chaves ficam <b>neste aparelho</b>.</li>
      <li>Nas conversas e aulas, o texto e o áudio vão para o <b>Google Gemini</b>; a voz natural usa o <b>ElevenLabs</b>.</li>
      <li>O reconhecimento de voz é do seu navegador, que pode enviar o áudio ao serviço dele.</li>
      <li>O EaglesIn não guarda gravações. Você pode apagar tudo em Configurações.</li>
    </ul>
    <button class="btn primary block" id="privOk">Entendi</button>`);
  $('#privOk').onclick = closeModal;
}
function renderLogin() {
  const acc = state.account;
  view.innerHTML = `
    <div class="focus-bar"><button class="icon-btn sm" data-go="home" aria-label="Fechar">${icon('x')}</button><span class="grow"></span></div>
    <div class="login-wrap">
      <img class="login-mark" src="icons/pavio-marca.png" alt="" width="96" height="96" />
      <h1 class="ob-title">${acc ? 'Você está conectado' : 'Entre no EaglesIn'}</h1>
      <p class="ob-text">${acc ? esc(acc.name || acc.email || 'Conta Google') : 'Entre com a sua conta Google. Por enquanto, o progresso continua guardado neste aparelho.'}</p>
      ${acc ? `<button class="btn block outline" id="logout">Sair da conta</button>`
        : `<button class="btn block google-btn" id="gLogin"><svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z"/></svg> Entrar com o Google</button>
        <p class="muted small center" id="loginInfo">${auth.configured() ? '' : 'O login com Google ainda está sendo configurado. Por enquanto, seu progresso fica neste aparelho.'}</p>`}
      <button class="link ob-alt" data-go="home">${acc ? 'Voltar para o app' : 'Continuar sem conta'}</button>
      <p class="muted small center"><a href="#privacy" id="loginPriv">Privacidade</a></p>
    </div>`;
  $('#loginPriv').onclick = (e) => { e.preventDefault(); showPrivacy(); };
  if ($('#logout')) $('#logout').onclick = async () => { await auth.signOut(); delete state.account; save(); toast('Você saiu da conta.'); route(); };
  if ($('#gLogin')) $('#gLogin').onclick = async () => {
    if (!auth.configured()) return toast('O login com Google ainda não está ligado. Use "Continuar sem conta".', 4500);
    const b = $('#gLogin'); b.disabled = true;
    try {
      const u = await auth.signInWithGoogle();
      state.account = { uid: u.uid, name: u.name, email: u.email, at: Date.now() }; save();
      toast('Bem-vindo, ' + (u.name || 'aluno') + '!'); go('home');
    } catch (e) { toast('Não deu para entrar: ' + (e.message || e), 5000); if ($('#gLogin')) $('#gLogin').disabled = false; }
  };
}

function renderHome() {
  const t = today(), plan = currentPlan();
  const pct = Math.min(100, (t.seconds / goalSeconds()) * 100);
  const lv = learn.currentLevel(), lp = learn.levelProgress(lv);
  const nl = learn.nextLesson(lv), cu = learn.currentUnit(lv);
  const srsDue = dueCards(99).length, hard = hardWords().length;
  const wd = learn.weekday();
  const rec = learn.recommendation();
  const wdAction = { free: ['Conversa livre', 'free'], review: ['Treinar pronúncia', 'review'], lesson: [nl ? 'Próxima aula' : 'Avaliações', nl ? 'lesson-c/' + nl.id : 'exams'], convo: ['Conversa guiada', 'convo'], srs: ['Revisão + prova', 'srs'] }[wd.action];
  const st = streak(), xp = state.xp || 0, ul = userLevel(xp);
  const lessonPct = Math.round((lp.done / lp.total) * 100);
  const can3d = T().renderer === 'pavio' && webglOK();
  const dateLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  view.innerHTML = `
    <a class="banner jogo-banner" href="jogo/" onclick="try{sessionStorage.removeItem('eaglesin-classico')}catch(e){}">🎮 <b>Voltar ao jogo</b>: a viagem com o Pavio continua de onde você parou.</a>
    ${!S().apiKey ? `<div class="banner">🔑 Cole sua chave do Gemini em Configurações para o professor falar e te ouvir. <a href="#settings">Configurar</a></div>` : ''}
    ${!canUseMic() ? `<div class="banner info">🎙️ Microfone indisponível neste navegador. Use Chrome ou Safari em HTTPS.</div>` : ''}
    <section class="home-hero">
      <div class="home-stage-wrap">
        ${stageHost('full', 'home-stage')}
        <div class="stage-floor" aria-hidden="true"></div>
        ${can3d ? `<button class="stage-toggle" id="stage3d" aria-pressed="${S().pavio3d ? 'true' : 'false'}" title="${S().pavio3d ? 'Voltar para o 2D' : 'Ver o Pavio de corpo inteiro em 3D'}">${S().pavio3d ? '2D' : '3D'}</button>` : ''}
      </div>
      <div class="home-hero-text">
        <span class="eyebrow">${esc(dateLabel)}</span>
        <h1 class="home-title">${esc(greeting())}</h1>
        <p class="home-sub">${isTrainingDay() ? 'Hoje é dia de treino.' : 'Hoje é folga, mas uma aula rápida não mata ninguém.'}</p>
        <button class="btn primary block home-cta" id="ctaGo">${icon('play')} Continuar aprendendo</button>
        <p class="home-next">${nl ? `Aula ${nl.n} · ${esc(nl.title)} <span>· ${esc(nl.pt)}</span>` : `Prova final do ${lv.id}`}</p>
      </div>
    </section>

    <div class="goal-line" role="img" aria-label="Meta de hoje: ${Math.round(pct)}%">
      <span>Meta de hoje</span><span class="progress"><i style="width:${pct}%"></i></span><b>${Math.round(pct)}%</b>
    </div>

    <div class="home-list">
      <button class="home-row" data-go="talk"><span class="mini-ico">${icon('mic')}</span><span class="grow"><b>Conversar com ${T().g === 'm' ? 'o' : 'a'} ${esc(T().name.replace('Professor ', ''))}</b><span class="muted small">Por voz ou texto</span></span>${icon('chevron-right', 'ic-muted')}</button>
      <button class="home-row" id="startTrain"><span class="mini-ico">${icon('target')}</span><span class="grow"><b>Treino do dia</b><span class="muted small">${fmt(t.seconds)} de ${fmt(plan.total * 60)}</span></span>${icon('chevron-right', 'ic-muted')}</button>
      <button class="home-row" data-go="srs"><span class="mini-ico">${icon('repeat')}</span><span class="grow"><b>Revisar</b><span class="muted small">${srsDue ? srsDue + (srsDue === 1 ? ' cartão para hoje' : ' cartões para hoje') : 'Nada pendente'}${hard ? ' · ' + hard + (hard === 1 ? ' palavra difícil' : ' palavras difíceis') : ''}</span></span>${icon('chevron-right', 'ic-muted')}</button>
      ${!state.testDone ? `<button class="home-row" id="levelBtn"><span class="mini-ico">${icon('sparkles')}</span><span class="grow"><b>Teste de nível</b><span class="muted small">Opcional, para começar no nível certo</span></span>${icon('chevron-right', 'ic-muted')}</button>` : ''}
    </div>

    ${installCardHTML()}`;
  refreshInstallUI();
  $('#ctaGo').onclick = () => go(nl ? 'lesson-c/' + nl.id : 'exam-c/final/' + lv.id);
  if ($('#stage3d')) $('#stage3d').onclick = () => {
    stopAudio(); S().pavio3d = !S().pavio3d; save();
    toast(S().pavio3d ? 'Pavio em 3D, de corpo inteiro.' : 'Pavio 2D de volta.');
    route();
  };
  $('#startTrain').onclick = () => (train ? goStage() : startTrain());
  const act = (a) => {
    if (a === 'free') return askFreeTopic();
    if (a === 'convo') return startConvo(learn.nextConvo().id);
    if (a === 'lesson') return go(nl ? 'lesson-c/' + nl.id : 'exams');
    if (a === 'exam') return go('exam-c/unit/' + cu.id);
    go(a);
  };
  if ($('#wdBtn')) $('#wdBtn').onclick = () => act(wd.action === 'lesson' ? 'lesson' : wdAction[1]);
  if ($('#recBtn')) $('#recBtn').onclick = () => act(rec.action);
  if ($('#levelBtn')) $('#levelBtn').onclick = renderLevelTest;
}

/* ==========================================================
   CONVERSAR (hub com as 6 modalidades)
   ========================================================== */
const SIM_ROLES = ['Recepcionista de hotel', 'Garçom de restaurante', 'Agente de imigração no aeroporto', 'Cliente irritado', 'Entrevistador de emprego', 'Médico', 'Vendedor de loja', 'Motorista de Uber'];
const CHALLENGES = [
  { t: 'Consiga um desconto', g: 'Convencer o vendedor a dar 20% de desconto num tênis.', r: 'Você é um vendedor de loja que odeia dar desconto.' },
  { t: 'Troque o quarto', g: 'Conseguir trocar de quarto de hotel sem pagar a mais.', r: 'Você é um recepcionista de hotel que diz que está tudo lotado.' },
  { t: 'Descubra o segredo', g: 'Descobrir a profissão da pessoa sem perguntar diretamente "what do you do?".', r: 'Você é uma pessoa misteriosa numa festa que evita falar do trabalho.' },
  { t: 'Desmarque sem brigar', g: 'Desmarcar um compromisso e remarcar para outro dia, mantendo a amizade.', r: 'Você é um amigo carente que fica ofendido fácil.' },
  { t: 'Reembolso', g: 'Conseguir o reembolso de um produto com defeito sem nota fiscal.', r: 'Você é um atendente que segue as regras ao pé da letra.' },
  { t: 'Convença a ficar', g: 'Convencer um colega a não pedir demissão.', r: 'Você é um colega decidido a pedir demissão amanhã.' },
];
const DEBATES = ['Home office é melhor que trabalho presencial', 'Redes sociais fazem mais mal do que bem', 'Inteligência artificial vai acabar com empregos', 'Pizza com abacaxi é aceitável', 'Séries são melhores que filmes', 'Rap é a melhor forma de poesia moderna'];

function renderTalk() {
  const lv = learn.currentLevel(), cu = learn.currentUnit(lv);
  const t = T(), art = t.g === 'm' ? 'O' : 'A';
  view.innerHTML = `
    <header class="page-head">
      <h1>Conversar</h1>
      <p class="muted">Por voz ou texto. ${art} ${esc(t.name)} adapta vocabulário, velocidade e perguntas ao seu nível (${lv.id}).</p>
    </header>
    ${state.chat?.messages?.length ? `<button class="card resume-card" data-go="chat/${esc(state.chat.themeId)}">
      <span class="mini-ico">${icon('history')}</span>
      <span class="grow"><b>Voltar à última conversa</b><span class="muted small">${esc(chatInfo(state.chat).name)}</span></span>${icon('chevron-right', 'ic-muted')}</button>` : ''}
    <section class="card guided-card">
      <div class="guided-head"><span class="mini-ico">${icon('compass')}</span>
        <div class="grow"><b>Conversas guiadas</b><span class="muted small">Unidade ${cu.n} · ${esc(cu.title)}</span></div></div>
      <div class="guided-list">
        ${cu.convos.map((c) => `<button class="lesson-row" data-convo="${c.id}"><span class="dot ${state.curr.convos[c.id] ? 'ok' : ''}">${state.curr.convos[c.id] ? icon('check') : c.n}</span><span class="grow"><b>${esc(c.title)}</b><span class="muted small">${esc(c.goal)}</span></span>${icon('chevron-right', 'ic-muted')}</button>`).join('')}
      </div>
      <button class="btn sm outline" data-go="learn/${lv.id}">Ver as 72 conversas por unidade</button>
    </section>
    <div class="section-head"><h2>Modalidades</h2></div>
    <div class="mode-grid">
      ${['livre', 'simulacao', 'desafio', 'pronuncia', 'debate'].map((m) => `<button class="mode-card" data-mode="${m}"><span class="mini-ico">${icon(MODE_ICON[m])}</span><b>${CHAT_MODES[m].name}</b><span class="muted small">${CHAT_MODES[m].desc}</span></button>`).join('')}
      <button class="mode-card" data-go="trail"><span class="mini-ico">${icon('clapperboard')}</span><b>Séries, filmes e rap</b><span class="muted small">Friends, Marvel, gírias…</span></button>
    </div>`;
  $$('[data-convo]').forEach((b) => (b.onclick = () => startConvo(b.dataset.convo)));
  $$('[data-mode]').forEach((b) => (b.onclick = () => startMode(b.dataset.mode)));
}

function startConvo(id) {
  const c = getConvo(id); if (!c) return;
  const u = getUnit(c.unit);
  newChat(c.id, '', {
    mode: 'guiada', cefr: c.level, convoId: c.id,
    scenario: { title: c.title, role: c.role, goal: c.goal, topics: u.topics, vocab: u.lessons.flatMap((l) => parseVocab(l.vocab)).slice(0, 20).map((v) => v.en).join(', ') },
  });
  go('chat/' + c.id);
}
function startMode(mode) {
  const begin = (scenario) => { closeModal(); newChat('modo:' + mode, scenario?.topicFree || '', { mode, cefr: S().cefr, scenario: scenario?.topicFree ? null : scenario }); go('chat/modo:' + mode); };
  if (mode === 'livre') return askFreeTopic();
  if (mode === 'pronuncia') {
    if (!canUseMic()) return toast('Essa modalidade precisa de microfone.');
    return begin({ title: 'Treino de pronúncia', role: 'Você é uma fonoaudióloga exigente de sotaque americano.', goal: 'Dizer 6 frases com nota 8 ou mais.' });
  }
  if (mode === 'desafio') {
    const ch = pick(CHALLENGES);
    return begin({ title: ch.t, role: ch.r, goal: ch.g });
  }
  const isSim = mode === 'simulacao';
  const opts = isSim ? SIM_ROLES : DEBATES;
  openModal(`
    <h2>${CHAT_MODES[mode].emoji} ${CHAT_MODES[mode].name}</h2>
    <p class="muted">${isSim ? 'Quem a IA vai interpretar?' : 'Qual o tema do debate? Você escolhe seu lado.'}</p>
    <input type="text" id="modeIn" placeholder="${isSim ? 'Ex: atendente de banco' : 'Ex: videogame é esporte'}" />
    <div class="row wrap" style="margin:10px 0">${opts.map((s) => `<button class="btn sm" data-opt="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    <button class="btn primary block" id="modeGo">Começar</button>`);
  const input = $('#modeIn');
  $$('[data-opt]').forEach((b) => (b.onclick = () => (input.value = b.dataset.opt)));
  $('#modeGo').onclick = () => {
    const v = input.value.trim() || pick(opts);
    begin(isSim
      ? { title: v, role: `Você interpreta: ${v}. Crie uma situação realista e típica desse papel, com um pequeno problema para o aluno resolver.`, goal: 'Resolver a situação do começo ao fim em inglês.' }
      : { title: v, role: `Debate sobre: "${v}". Pergunte primeiro a posição do aluno e defenda a oposta.`, goal: 'Sustentar a posição com pelo menos 3 argumentos e responder às objeções.' });
  };
  setTimeout(() => input.focus(), 100);
}
function greeting() {
  const h = new Date().getHours();
  if (S().polite) return h < 12 ? 'Bom dia! Pronto pra praticar?' : 'Oi! Vamos treinar um pouco?';
  return pick(['Olha quem apareceu. Bora pro treino?', 'Seu inglês tá pedindo socorro. Vamos?', 'Hoje eu não vou pegar leve, hein.']);
}

/* ==========================================================
   TEMAS (trilha por grupo, sem cadeado)
   ========================================================== */
function renderTrail() {
  const level = S().level;
  view.innerHTML = `
    <button class="link back-link" data-go="talk">${icon('chevron-left')} Conversar</button>
    <header class="page-head"><h1>Séries, filmes e rap</h1><p class="muted small">Aula de repetição, prova e conversa com o vocabulário de cada tema.</p></header>
    <div class="level-tabs seg seg-3" role="tablist" aria-label="Dificuldade">${Object.values(LEVELS).map((l) => `<button role="tab" aria-selected="${l.id === level}" class="${l.id === level ? 'on' : ''}" data-level="${l.id}">${l.name}</button>`).join('')}</div>
    ${GROUPS.map((g) => `
      <div class="section-head"><h2>${g.name}</h2></div>
      <div class="theme-grid">
        ${THEMES.filter((t) => t.group === g.id).map((t) => {
          const s = themeStats(level, t.id);
          return `<button class="card theme-card" data-go="theme/${t.id}">
            <span class="emoji">${t.emoji}</span>
            <b>${esc(t.name)}</b>
            <span class="muted small">${s.practiced} frases · ${s.avg !== null ? 'média ' + s.avg.toFixed(1) : 'não praticado'}${s.bestExam !== null ? ' · prova ' + s.bestExam.toFixed(1) : ''}</span>
          </button>`;
        }).join('')}
      </div>`).join('')}
    <button class="card theme-card" data-go="chat/livre" style="margin-top:12px">
      <span class="emoji">${FREE_THEME.emoji}</span><b>${FREE_THEME.name}</b><span class="muted small">você escolhe o assunto</span></button>`;
  $$('[data-level]').forEach((b) => (b.onclick = () => { S().level = b.dataset.level; save(); renderTrail(); }));
  $$('[data-go="chat/livre"]').forEach((b) => (b.onclick = (e) => { e.preventDefault(); askFreeTopic(); }));
}

function renderTheme(id) {
  const th = getTheme(id);
  if (!th) return go('trail');
  const level = S().level, c = th[level];
  const s = themeStats(level, id);
  const sayRow = (en, pt) => `<button class="example-row" data-say="${esc(en)}"><span class="ex-play">${icon('volume-2')}</span><span class="grow"><b lang="en">${esc(en)}</b><span class="muted small">${esc(pt)}</span></span></button>`;
  view.innerHTML = `
    <button class="link back-link" data-go="trail">${icon('chevron-left')} Temas</button>
    <header class="page-head unit-head">
      <span class="eyebrow">${LEVELS[level].name} · ${LEVELS[level].cefr}</span>
      <h1><span aria-hidden="true">${th.emoji}</span> ${esc(th.name)}</h1>
      <p class="muted small">${s.practiced} frases praticadas${s.avg !== null ? ` · média ${s.avg.toFixed(1)}/10` : ''}${s.bestExam !== null ? ` · melhor prova ${s.bestExam.toFixed(1)}/10` : ''}</p>
    </header>
    <div class="card step-card">
      <h3 class="step-h">${icon('target')} Meta</h3><p>${esc(tx(c.goal))}</p>
      <h3 class="step-h">${icon('drama')} Cenário</h3><p class="muted">${esc(tx(c.roleplay))}</p>
    </div>
    <div class="mode-grid">
      <button class="mode-card" data-go="lesson/${id}"><span class="mini-ico">${icon('audio-lines')}</span><b>Aula</b><span class="muted small">Repete depois de mim</span></button>
      <button class="mode-card" data-go="exam/${id}"><span class="mini-ico">${icon('clipboard-check')}</span><b>Prova</b><span class="muted small">5 frases, nota final</span></button>
    </div>
    <button class="btn primary block" data-go="chat/${id}" style="margin:12px 0">${icon('message-circle')} Conversa sobre ${esc(th.name)}</button>
    <div class="card">
      <details class="plan-card"><summary><b>${icon('book-open')} Palavras-chave (${c.words.length})</b></summary>
        ${c.words.map((w) => sayRow(w.en, w.pt)).join('')}
      </details>
      <details class="plan-card" style="margin-top:10px"><summary><b>${icon('message-circle')} Frases úteis (${c.phrases.length})</b></summary>
        ${c.phrases.map((p) => sayRow(p.en, p.pt)).join('')}
      </details>
      <button class="btn sm outline" id="addWords" style="margin-top:12px">${icon('pin')} Mandar palavras pra lista de difíceis</button>
    </div>`;
  $('#addWords').onclick = () => { c.words.forEach((w) => addHardWord(w.en, w.pt)); toast(`${c.words.length} palavras na lista de revisão.`); };
}

/* ==========================================================
   AULA: o professor fala, você repete, ele corrige.
   Também serve para a PROVA (sem repetição) e para treino de palavra.
   ========================================================== */
const BRONCA_RUDE = ['Que porra foi essa no "{w}"? Repete!', 'Caramba, o "{w}" tá morrendo aqui. De novo!', 'Pelo amor de Deus, "{w}"! Devagar, criatura.'];
const BRONCA_POLITE = ['Quase! Tenta de novo a palavra "{w}".', 'Boa tentativa! Repete o "{w}" devagar.'];
const OK_RUDE = ['Tá, foi bom. Não se acostuma.', 'Uau, acertou. Quem é você e o que fez com o aluno?'];
const TOP_RUDE = ['Perfeito! Até eu fiquei orgulhoso, não conta pra ninguém.', 'Isso aí! Pronúncia de quem assiste série sem legenda.'];
const OK_POLITE = ['Muito bem!', 'Excelente, parabéns!'];

function renderLesson(id) {
  const th = getTheme(id);
  if (!th) return go('trail');
  const level = S().level;
  runSession({
    title: `${th.emoji} ${th.name} · Aula`, themeId: id, mode: 'lesson',
    items: th[level].targets, goal: tx(th[level].goal),
  });
}
function renderExam(id) {
  const th = getTheme(id);
  if (!th) return go('trail');
  const level = S().level;
  runSession({
    title: `${th.emoji} ${th.name} · Prova`, themeId: id, mode: 'exam',
    items: th[level].phrases.slice(0, 5), goal: 'Prova: uma tentativa por frase. A nota final vai para o seu progresso.',
  });
}
function renderDrill(word) {
  runSession({ title: 'Treino de palavra', themeId: null, mode: 'drill', items: [{ en: word, pt: '' }], goal: 'Repita a palavra até acertar.' });
}

/* Roda uma sessão de frases. */
function runSession({ title, themeId, mode, items, goal }) {
  const polite = S().polite, level = S().level;
  const MAX_TRIES = mode === 'lesson' ? 3 : 1;
  let idx = 0, tries = 0, scores = [], finished = false;

  view.innerHTML = `
    <button class="link back-link" id="back">${icon('chevron-left')} Voltar</button>
    <header class="lesson-head"><h1>${esc(title)}</h1><p class="muted small">${esc(goal)}</p></header>
    <div class="progress" style="margin:10px 0"><i id="sProg"></i></div>
    ${!canUseMic() ? `<div class="banner">Sem microfone aqui: você ouve o professor, mas a nota não é calculada.</div>` : ''}
    <div class="card lesson-card">
      ${stageHost('full')}
      <div class="target" id="target"></div>
      <div class="muted small" id="targetPt"></div>
      <div class="heard" id="heard"></div>
      <div class="feedback-line" id="fbLine"></div>
    </div>
    <div class="interim" id="interim"></div>
    <div class="dock">
      <div class="dock-row">
        <button class="round" id="listenBtn" title="Ouvir de novo" aria-label="Ouvir de novo">${icon('volume-2')}</button>
        <button class="mic" id="mic" ${canUseMic() ? '' : 'disabled'} aria-label="Repetir">${icon('mic')}</button>
        <button class="round" id="skipBtn" title="Pular" aria-label="Pular" ${mode === 'exam' ? 'disabled' : ''}>${icon('chevron-right')}</button>
      </div>
      <div class="muted small" id="micHint">Toque, repita a frase e espere a nota</div>
    </div>`;
  $('#back').onclick = () => history.back();

  const cur = () => items[idx];
  const setProgress = () => { $('#sProg').style.width = (idx / items.length) * 100 + '%'; };
  function showTarget(words) {
    const display = words || cur().en.split(/\s+/).map((t) => ({ text: t, ok: null }));
    $('#target').innerHTML = display.map((w) => `<span class="w ${w.ok === true ? 'ok' : w.ok === false ? 'bad' : ''}">${esc(w.text)}</span>`).join(' ');
    $('#targetPt').textContent = cur().pt || '';
    setProgress();
  }
  const hint = (t) => { const h = $('#micHint'); if (h) h.textContent = t; };
  const fb = (t, cls = '') => { const f = $('#fbLine'); if (f) { f.textContent = t; f.className = 'feedback-line ' + cls; } };

  async function introduce() {
    tries = 0;
    showTarget();
    fb('');
    setMood('neutra');
    await say([{ text: cur().en }], 'neutra');
  }

  function finish() {
    finished = true;
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    if (mode === 'exam' && themeId) recordExam({ themeId, level, kind: 'prova', score: avg });
    const good = avg >= 7;
    setMood(avg >= 9 ? 'orgulhosa' : good ? 'feliz' : 'irritada');
    gesture(good ? 'thumbs' : 'facepalm');
    view.querySelector('.card.lesson-card').innerHTML = `
      <div class="center">
        <div class="ring result-ring ${good ? '' : avg >= 5 ? 'mid' : 'low'}" style="--p:${Math.round(avg * 10)}"><b>${avg.toFixed(1)}</b><span class="small muted">${mode === 'exam' ? 'nota da prova' : 'aula concluída'}</span></div>
        <p class="muted">${good
          ? (polite ? 'Muito bem! Continue assim.' : 'Tá, até que você se virou. Não se acostuma.')
          : (polite ? 'Continue praticando as palavras que pedimos.' : 'Isso foi um desastre. Vamos revisar as palavras difíceis.')}</p>
        ${stageHost('full')}
        <div class="result-actions">
          ${themeId && mode === 'lesson' ? `<button class="btn primary block" data-go="exam/${themeId}">Fazer a prova ${icon('chevron-right')}</button>` : ''}
          <button class="btn outline block" id="again">${icon('rotate-ccw')} Repetir</button>
          ${themeId ? `<button class="btn ghost block" data-go="theme/${themeId}">Voltar ao tema</button>` : `<button class="btn ghost block" data-go="review">Revisão</button>`}
        </div>
        ${nextStageBtn()}
      </div>`;
    if (rOK()) mountStage('full');
    $('#again').onclick = () => route();
    $('#mic') && ($('#mic').disabled = true);
    hint('');
    say([{ text: `${avg.toFixed(1)} de 10. ${good ? (polite ? 'Muito bem.' : 'Não se acostuma.') : (polite ? 'Dá pra melhorar.' : 'Você ainda tem muito o que aprender.')}`, lang: 'pt-BR' }]);
  }

  function advance() {
    idx++; tries = 0;
    if (idx >= items.length) return finish();
    setTimeout(() => { if ($('#target')) introduce(); }, 900);
  }

  async function onMic() {
    if (finished || busy) return;
    if (recorder.isRecording()) return recorder.stopRecording();
    if (voice.isListening()) return voice.stopListening();
    stopAudio();
    busy = true;
    const mic = $('#mic'); mic.classList.add('listening');
    let res;
    try { res = await hear(cur().en); }
    finally { busy = false; mic.classList.remove('listening'); }
    if (!$('#target') || !res) return;

    const nota = Math.max(0, Math.min(10, res.nota));
    if (res.transcricao) $('#heard').textContent = `Ouvi: "${res.transcricao}" · nota ${nota.toFixed(1)}/10`;
    tries++;
    const bad = [...new Set((res.erradas || []).map((w) => cleanWord(w)).filter(Boolean))];
    if (mode !== 'drill') recordPhrase(level, themeId, cur().en, nota);
    else recordNota(nota);
    bad.forEach((w) => addHardWord(w, res.dica || ''));
    if (res.dica && bad.length === 0 && nota < 7) fb('Dica: ' + res.dica);

    // Palavras marcadas em vermelho na frase
    const badSet = new Set(bad.flatMap((w) => tokenize(w)));
    const words = cur().en.split(/\s+/).filter(Boolean).map((text) => ({ text, ok: !tokenize(text).some((k) => badSet.has(k)) }));
    showTarget(words);

    if (nota >= 7 || mode === 'exam' || tries >= MAX_TRIES) {
      if (nota >= 7 || mode === 'exam') scores.push(nota);
      else scores.push(nota);
      if (nota >= 9) { gesture('jump'); setMood('orgulhosa'); await say([{ text: celebrateLine(polite, false), lang: 'pt-BR' }], 'orgulhosa'); }
      else if (nota >= 7) { gesture('thumbs'); setMood('feliz'); await say([{ text: pick(polite ? OK_POLITE : OK_RUDE), lang: 'pt-BR' }], 'feliz'); }
      else {
        gesture(mode === 'exam' ? 'no' : 'facepalm'); setMood('irritada');
        const line = pick(polite ? BRONCA_POLITE : BRONCA_RUDE).replaceAll('{w}', bad[0] || cur().en);
        await say([{ text: line, lang: 'pt-BR' }], 'irritada');
        if (mode !== 'exam' && tries >= MAX_TRIES) { fb(`Passamos adiante. Frase: ${cur().en}`, 'badf'); }
      }
      if (nota < 7 && mode === 'exam') fb(`Frase: ${cur().en}`, 'badf');
      return advance();
    }

    // Erro na aula: ele corrige e pede para repetir.
    gesture('wag'); setMood('irritada');
    const w = bad[0] || cur().en.split(' ')[0];
    await say([{ text: pick(polite ? BRONCA_POLITE : BRONCA_RUDE).replaceAll('{w}', w), lang: 'pt-BR' }], 'irritada');
    await say([{ text: cur().en, mul: 0.8 }]);
    fb(`Tentativa ${tries}/${MAX_TRIES}. Repete a frase.`);
  }

  $('#mic').onclick = onMic;
  $('#listenBtn').onclick = () => say([{ text: cur().en }]);
  $('#skipBtn').onclick = () => { stopAudio(); if (mode !== 'exam') { scores.push(0); advance(); } };
  introduce();
}

/* Ouve o aluno e devolve { nota 0-10, erradas, dica, transcricao } ou null. */
async function hear(expected) {
  const interim = () => $('#interim');
  try {
    activity('listening');
    if (useGeminiEars()) {
      const audio = await recorder.record({ onLevel: (l) => { const i = interim(); if (i) i.innerHTML = `<span class="meter"><i style="width:${Math.round(l * 100)}%"></i></span>`; }, maxMs: 15000 });
      if (!audio) { toast('Não ouvi nada. Fala mais alto!'); return null; }
      const i = interim(); if (i) i.innerHTML = '';
      activity('thinking');
      const j = await judgePronunciation(expected, audio);
      return { nota: j.nota, erradas: j.erradas, dica: j.dica, transcricao: j.transcricao };
    }
    const r = await voice.listen({ onInterim: (t) => { const i = interim(); if (i) i.textContent = t; } });
    if (!r.text) { toast('Não ouvi nada. Fala mais alto!'); return null; }
    const res = compare(expected, [r.text, ...r.alternatives], r.confidence);
    return { nota: res.score * 10, erradas: res.words.filter((w) => !w.ok).map((w) => w.text), dica: '', transcricao: r.text };
  } catch (e) {
    const m = e instanceof AIError ? e.message : e.name === 'NotAllowedError' ? 'Permissão do microfone negada.' : voice.listenErrorMsg(e);
    if (m) toast(m, 4000);
    if (e instanceof AIError) setMood('chocada');
    return null;
  } finally { activity(null); const i = interim(); if (i) i.textContent = ''; }
}

/* ==========================================================
   CONVERSA
   ========================================================== */
let lastAudio = null;

function newChat(themeId, freeTopic = '', extra = {}) {
  // Conversas de tema pop usam o nível antigo; as do currículo, o CEFR.
  const isPop = !!getTheme(themeId);
  state.chat = { themeId, freeTopic, level: S().level, cefr: isPop ? null : S().cefr, mode: isPop ? 'tema' : 'livre', messages: [], goalDone: false, ...extra };
  emo.resetRun(); // escada de paciência começa do zero em cada conversa
  save();
}
/* Cabeçalho (emoji, nome e meta) da conversa atual. */
function chatInfo(chat) {
  if (chat.mode === 'tema') {
    const th = getTheme(chat.themeId) || FREE_THEME;
    return { emoji: th.emoji, name: th.name, goal: th[chat.level] ? tx(th[chat.level].goal) : '' };
  }
  const m = CHAT_MODES[chat.mode] || CHAT_MODES.livre;
  if (chat.scenario) return { emoji: m.emoji, name: `${m.name}: ${chat.scenario.title}`, goal: chat.scenario.goal };
  return { emoji: FREE_THEME.emoji, name: FREE_THEME.name + (chat.freeTopic ? ': ' + chat.freeTopic : ''), goal: '' };
}
function chatSystem(chat) {
  const t = T();
  const memo = mem.memoryNote();
  // Abertura: o aluno ainda não respondeu, então não há erro para reagir.
  const opening = !chat.messages.some((m) => m.role === 'user')
    ? `ABERTURA DA CONVERSA: o aluno ainda não disse nada, então NÃO existe erro para reagir (nada de "calma aí, vem que eu te explico"). Só cumprimente no seu estilo e puxe assunto${memo ? ', mostrando que LEMBRA dele: cite 1 coisa da MEMÓRIA DO ALUNO (em "comentario_pt" ou na pergunta da "fala")' : ''}.`
    : '';
  const extra = [memo, stateNote({ teacher: t, wrong: emo.currentRun().wrong, help: !!chat.help, polite: S().polite, humor: t.humor }), opening].filter(Boolean).join('\n\n');
  if (chat.mode === 'tema') {
    const th = getTheme(chat.themeId);
    return buildSystemPrompt({ level: chat.level, theme: th, levelContent: th?.[chat.level], freeTopic: chat.freeTopic, polite: S().polite, teacher: t, extra });
  }
  return buildSystemPrompt({ level: chat.level, freeTopic: chat.freeTopic, polite: S().polite, teacher: t, cefr: getLevel(chat.cefr || S().cefr), mode: chat.mode, scenario: chat.scenario, extra });
}
function askFreeTopic() {
  openModal(`
    <h2>💬 Conversa livre</h2><p class="muted">Sobre o que você quer conversar?</p>
    <input type="text" id="freeTopic" placeholder="Ex: meu cachorro, games, academia..." />
    <div class="row wrap" style="margin:10px 0">${['Games', 'Academia', 'Tecnologia', 'Fim de semana', 'Animais', 'Fofoca', 'Sonhos'].map((s) => `<button class="btn sm" data-topic="${s}">${s}</button>`).join('')}</div>
    <button class="btn primary block" id="freeGo">Bora conversar</button>`);
  const input = $('#freeTopic');
  $$('[data-topic]').forEach((b) => (b.onclick = () => (input.value = b.dataset.topic)));
  const goFree = () => { closeModal(); newChat('livre', input.value.trim() || 'conversa casual', { mode: 'livre' }); go('chat/livre'); };
  $('#freeGo').onclick = goFree;
  input.onkeydown = (e) => { if (e.key === 'Enter') goFree(); };
  setTimeout(() => input.focus(), 100);
}

function renderChat(arg) {
  if (arg && arg !== '__summary' && arg !== state.chat?.themeId) {
    if (getConvo(arg)) return startConvo(arg);
    if (String(arg).startsWith('modo:')) return go('talk');
    newChat(arg, arg === 'livre' ? (state.chat?.freeTopic || '') : '', arg === 'livre' ? { mode: 'livre' } : {});
  }
  if (!state.chat) return startConvo(learn.nextConvo().id);
  const chat = state.chat;
  chat.mode ??= getTheme(chat.themeId) ? 'tema' : 'livre'; // conversas salvas por versões antigas
  const info = chatInfo(chat);

  view.innerHTML = `
    <div class="chat-wrap">
      <div class="chat-hero">
        <div class="chat-top">
          <button class="icon-btn" data-go="talk" aria-label="Voltar">${icon('chevron-left')}</button>
          <div class="grow chat-title"><b>${esc(T().name)}</b><span class="muted small">${icon(MODE_ICON[chat.mode] || 'message-circle')} ${esc(info.name)} · ${chat.cefr ? esc(chat.cefr) : LEVELS[chat.level].name}</span></div>
          <button class="icon-btn help-btn" id="helpBtn" title="Pedir ajuda: explicação com calma, sem bronca" aria-label="Pedir ajuda">${icon('life-buoy')}</button>
          <button class="icon-btn" id="newChat" title="Recomeçar a conversa" aria-label="Recomeçar a conversa">${icon('rotate-ccw')}</button>
          <button class="btn sm dark" id="endSession" title="Encerrar e ver o relatório" aria-label="Encerrar e ver o relatório">${icon('flag')}<span class="end-label"> Encerrar</span></button>
        </div>
        <div class="chat-stage-card">
          ${stageHost('bust', 'chat-stage')}
          <div class="talk-status" id="chatStatus" data-state="idle" role="status" aria-live="polite"><i aria-hidden="true"></i><span>Sua vez</span></div>
        </div>
      </div>
      ${info.goal ? `<div class="goal">${icon('target')}<span><b>Meta:</b> ${esc(info.goal)}</span></div>` : ''}
      <div class="messages" id="msgs"></div>
      <div class="interim" id="interim"></div>
      <div class="dock">
        <div class="textbox ${canUseMic() ? 'hidden' : ''}" id="textbox">
          <input type="text" id="textInput" placeholder="Escreva em inglês..." autocomplete="off" enterkeyhint="send" />
          <button class="btn primary" id="sendBtn" aria-label="Enviar">${icon('send-horizontal')}</button>
        </div>
        <div class="dock-row">
          <button class="round" id="kbBtn" title="Teclado" aria-label="Escrever">${icon('keyboard')}</button>
          <button class="mic" id="mic" ${canUseMic() ? '' : 'disabled'} aria-label="Falar">${icon('mic')}</button>
          <button class="round" id="stopBtn" title="Parar" aria-label="Parar">${icon('square')}</button>
        </div>
        <div class="muted small" id="micHint">${micHintText()}</div>
      </div>
    </div>`;
  renderMessages(false);
  paintTalkState();

  $('#mic').onclick = () => {
    if (recorder.isRecording()) recorder.stopRecording();
    else if (voice.isListening()) voice.stopListening();
    else if (isTalking()) stopAudio();
    else if (useGeminiEars()) recordTurn();
    else startListening();
  };
  $('#stopBtn').onclick = () => { stopAudio(); voice.stopListening(); recorder.stopRecording(); };
  $('#kbBtn').onclick = () => { $('#textbox').classList.toggle('hidden'); $('#textInput').focus(); };
  const sendText = () => { const i = $('#textInput'); sendUser(i.value); i.value = ''; };
  $('#sendBtn').onclick = sendText;
  $('#textInput').onkeydown = (e) => { if (e.key === 'Enter') sendText(); };
  $('#newChat').onclick = () => {
    if (chat.mode === 'livre') return askFreeTopic();
    if (chat.convoId) return startConvo(chat.convoId);
    if (chat.mode !== 'tema') return startMode(chat.mode);
    newChat(chat.themeId); renderChat();
  };
  $('#endSession').onclick = endSession;
  $('#helpBtn').onclick = () => {
    if (busy) return;
    emo.calmDown(); chat.help = true; setMood('neutral');
    sendUser(S().polite ? 'Pode me ajudar? Não entendi.' : 'Me ajuda, não entendi.');
  };
  $('#msgs').onclick = (e) => {
    const dr = e.target.closest('[data-drill]');
    if (dr) return go('drill/' + encodeURIComponent(dr.dataset.drill));
    const b = e.target.closest('button'); if (!b) return;
    const m = chat.messages[+(b.dataset.replay ?? b.dataset.slow ?? b.dataset.tr)];
    if (b.dataset.replay) speakReply(m.data);
    else if (b.dataset.slow) say([{ text: m.data.fala, mul: 0.7 }]);
    else if (b.dataset.tr) { m.showTr = !m.showTr; save(); renderMessages(false); }
    else if (b.hasAttribute('data-retry')) askAI(lastAudio);
  };

  if (!chat.messages.length) askAI();
  if (arg === '__summary') endSession();
}

const micHintText = () => !canUseMic() ? 'Microfone indisponível: use o teclado'
  : useGeminiEars() ? `Toque e fale em inglês. ${T().name} ouve sua pronúncia.` : 'Toque no microfone e fale em inglês';

function userBubble(m) {
  if (m.pendingAudio) return `<div class="bubble me">${icon('mic')} <span class="typing"><i></i><i></i><i></i></span></div>`;
  const p = m.pron;
  if (!p) return `<div class="bubble me">${esc(m.text)}</div>`;
  const bad = new Map();
  for (const w of p.palavras) for (const tok of [...tokenize(w.palavra), ...tokenize(w.como_soou || '')]) bad.set(tok, w.palavra);
  const text = m.text.split(/(\s+)/).map((tok) => {
    const k = tokenize(tok)[0];
    return k && bad.has(k) ? `<span class="badw" data-drill="${esc(bad.get(k))}">${esc(tok)}</span>` : esc(tok);
  }).join('');
  const n = Math.round(p.nota);
  return `<div class="bubble me">${text}
    <div class="pron"><b>Pronúncia ${n}/10</b>
      ${p.palavras.map((w) => `<div class="pw" data-drill="${esc(w.palavra)}">${icon('audio-lines')} <b>${esc(w.palavra)}</b>${w.como_soou ? ` <span class="snd">(soou "${esc(w.como_soou)}")</span>` : ''} — ${esc(w.dica)} <u>treinar</u></div>`).join('')}
    </div></div>`;
}
function bubbleHTML(m, i) {
  if (m.role === 'user') return userBubble(m);
  if (m.role === 'sys') return `<div class="bubble sys">${esc(m.text)}${m.retry ? ` <button class="btn sm" data-retry>Tentar de novo</button>` : ''}${m.settings ? ` <a href="#settings">Abrir configurações</a>` : ''}</div>`;
  const d = m.data || { fala: m.text };
  return `<div class="bubble ai">
    <div class="fala" lang="en">${esc(d.fala)}</div>
    ${d.comentario_pt ? `<div class="pt">${esc(d.comentario_pt)}</div>` : ''}
    ${d.correcao ? `<div class="correction"><span class="note-head">${icon('pencil')} Correção</span>${d.correcao.errado ? `<s>${esc(d.correcao.errado)}</s> → ` : ''}<b>${esc(d.correcao.certo)}</b><div class="small">${esc(d.correcao.explicacao)}</div></div>` : ''}
    ${d.pronuncia_suspeita ? `<div class="suspect"><span class="note-head">${icon('ear')} Você quis dizer "<b>${esc(d.pronuncia_suspeita.quis_dizer)}</b>"?</span><button class="btn sm" data-drill="${esc(d.pronuncia_suspeita.quis_dizer)}">${icon('audio-lines')} Treinar essa palavra</button></div>` : ''}
    ${m.showTr ? `<div class="tr">${icon('languages')} ${esc(d.traducao_pt)}</div>` : ''}
    ${d.palavras_novas?.length ? `<div class="newwords">${d.palavras_novas.map((w) => `<span class="tag">${icon('pin')} ${esc(w.en)} = ${esc(w.pt)}</span>`).join('')}</div>` : ''}
    <div class="actions">
      <button class="btn sm ghost" data-replay="${i}">${icon('volume-2')} Ouvir</button>
      <button class="btn sm ghost" data-slow="${i}" aria-label="Ouvir devagar">${icon('turtle')} Devagar</button>
      ${d.traducao_pt ? `<button class="btn sm ghost" data-tr="${i}">${icon('languages')} ${m.showTr ? 'Ocultar' : 'Traduzir'}</button>` : ''}
    </div>
  </div>`;
}
function renderMessages(scroll = true) {
  const box = $('#msgs'); if (!box || !state.chat) return;
  box.innerHTML = state.chat.messages.map(bubbleHTML).join('') + (busy ? `<div class="bubble ai"><span class="typing"><i></i><i></i><i></i></span></div>` : '');
  if (scroll) requestAnimationFrame(() => (view.scrollTop = view.scrollHeight));
}

async function startListening() {
  if (busy) return;
  stopAudio();
  const mic = $('#mic'), interim = $('#interim');
  mic?.classList.add('listening');
  activity('listening');
  try {
    const r = await voice.listen({ onInterim: (t) => { if (interim) interim.textContent = t; } });
    endActivity('listening');
    if (r.text) sendUser(r.text); else toast('Não ouvi nada. Tenta de novo!');
  } catch (e) {
    const msg = voice.listenErrorMsg(e); if (msg) toast(msg, 3500);
  } finally { endActivity('listening'); mic?.classList.remove('listening'); if (interim) interim.textContent = ''; }
}
async function recordTurn() {
  if (busy) return;
  stopAudio();
  const mic = $('#mic'), interim = $('#interim');
  mic?.classList.add('listening');
  activity('listening');
  try {
    const audio = await recorder.record({ onLevel: (l) => { if (interim) interim.innerHTML = `<span class="meter"><i style="width:${Math.round(l * 100)}%"></i></span>`; } });
    endActivity('listening');
    if (!audio) return toast(S().polite ? 'Não ouvi nada. Tente de novo.' : 'Não ouvi nada. Fala mais perto!');
    if (currentRoute === 'chat') sendAudio(audio);
  } catch (e) {
    toast(e.name === 'NotAllowedError' ? 'Permissão do microfone negada.' : 'Erro no microfone: ' + (e.message || e.name), 4000);
    $('#textbox')?.classList.remove('hidden');
  } finally { endActivity('listening'); mic?.classList.remove('listening'); if (interim) interim.textContent = ''; }
}
function sendAudio(audio) {
  const chat = state.chat;
  chat.messages = chat.messages.filter((m) => !m.pendingAudio);
  chat.messages.push({ role: 'user', text: '🎤', pendingAudio: true });
  lastAudio = audio;
  (state.stats ??= {}).messages = (state.stats.messages || 0) + 1;
  save(); renderMessages(); askAI(audio);
}
function sendUser(text) {
  text = (text || '').trim();
  if (!text || busy) return;
  const chat = state.chat;
  chat.messages = chat.messages.filter((m) => !m.pendingAudio);
  chat.messages.push({ role: 'user', text });
  save(); renderMessages(); askAI();
}

async function askAI(audio = null) {
  if (busy) return;
  const chat = state.chat;
  chat.messages = chat.messages.filter((m) => !(m.role === 'sys' && (m.retry || m.settings)));
  if (!audio) chat.messages = chat.messages.filter((m) => !m.pendingAudio);
  busy = true; $('#mic')?.classList.add('busy'); renderMessages();
  activity('thinking');
  try {
    const system = chatSystem(chat);
    const history = chat.messages.filter((m) => m.role !== 'sys' && !m.pendingAudio).slice(-30);
    const data = await chatReply(system, history, audio);
    if (state.chat !== chat) return;
    // Desafio = sem ajuda: o modelo às vezes ignora a regra, então o app garante.
    if (chat.mode === 'desafio') { data.palavras_novas = []; data.traducao_pt = ''; }
    if (audio) {
      const um = chat.messages.find((m) => m.pendingAudio);
      if (um) { um.text = data.transcricao || '(não entendi o áudio)'; um.pron = data.pronuncia || null; delete um.pendingAudio; }
      lastAudio = null;
    }
    chat.messages.push({ role: 'ai', text: data.fala, data });
    busy = false; endActivity('thinking');
    handleReply(chat, data);
    renderMessages(); save();
    await speakReply(data);
  } catch (e) {
    const err = e instanceof AIError ? e : new AIError('x', e.message || String(e));
    chat.messages.push({ role: 'sys', text: '⚠️ ' + err.message, retry: !['nokey', 'badkey', 'model'].includes(err.kind), settings: ['nokey', 'badkey', 'model'].includes(err.kind) });
    setMood('chocada'); save();
  } finally { busy = false; endActivity('thinking'); $('#mic')?.classList.remove('busy'); renderMessages(); }
}

function handleReply(chat, d) {
  // Escada de paciência: o app conta os erros seguidos (correção ou pronúncia ruim).
  const helped = chat.help; chat.help = false;
  const answered = chat.messages[chat.messages.length - 2]?.role === 'user';
  const t = T();
  if (answered && !helped) {
    const bad = !!d.correcao || (d.pronuncia && d.pronuncia.nota < 5);
    // Erro que a memória já conhecia (de outra conversa) conta como reincidência.
    const known = !!d.correcao && mem.knownError(d.correcao.certo);
    const res = emo.answer(!bad, d.correcao?.certo || d.pronuncia?.palavras?.[0]?.palavra, known);
    // Professor com escada própria (Pavio): o degrau vale mais que a emoção sugerida pela IA.
    if (t.ladder) d.mood = bad ? emo.emotionFor(t, res, t.humor, S().polite) : res.comeback ? 'celebrating' : emo.toEmotion(d.emocao);
  }
  const mood = d.mood || d.emocao;
  setMood(mood);
  const c = emo.toCloud(mood);
  if (mood === 'furious') gesture('stomp');
  else if (c === 'irritada') gesture('wag');
  else if (c === 'feliz' || c === 'orgulhosa') gesture(mood === 'celebrating' ? 'jump' : 'thumbs');
  else if (c === 'chocada') gesture('shrug');
  if (d.pronuncia) {
    d.pronuncia.palavras.forEach((w) => addHardWord(w.palavra, w.dica));
    recordNota(d.pronuncia.nota);
  }
  // Memória do aluno: erros de gramática e fatos que ele contou (simulação é papel, não conta).
  if (d.correcao) mem.recordError(d.correcao);
  if (answered && d.fato_aluno && chat.mode !== 'simulacao' && mem.addFact(d.fato_aluno)) toast('🧠 Anotei: ' + d.fato_aluno, 3000);
  const userTurns = chat.messages.filter((m) => m.role === 'user').length;
  if (!chat.goalDone && (d.meta_cumprida && userTurns > 0 || (chat.themeId === 'livre' && userTurns >= 6))) {
    chat.goalDone = true;
    toast('🎯 Meta da conversa cumprida!');
  }
}
function speakReply(d) {
  if (!d) return Promise.resolve();
  const parts = [];
  if (S().speakPt && d.comentario_pt) parts.push({ text: d.comentario_pt, lang: 'pt-BR' });
  parts.push({ text: d.fala });
  return say(parts, d.mood || d.emocao);
}

async function endSession() {
  const chat = state.chat;
  const userMsgs = chat?.messages.filter((m) => m.role === 'user').length || 0;
  const leaving = () => { if (train && currentPlan().stages[train.idx]?.id === 'summary') nextStage(); };
  if (userMsgs < 2) { toast('Conversa curta demais pra resumir. Fala mais primeiro!'); leaving(); return; }
  stopAudio();
  openModal(`<div class="center"><div class="stage-fallback" style="font-size:3rem">${T().faces.neutra}</div><p>Analisando sua conversa…</p><span class="typing"><i></i><i></i><i></i></span></div>`);
  try {
    const sum = await sessionSummary(buildSummaryPrompt({ level: chat.level, polite: S().polite, teacher: T(), cefr: chat.cefr }), chat.messages.filter((m) => m.role !== 'sys' && !m.pendingAudio).slice(-40));
    (sum.erros_comuns || []).forEach((e) => addHardWord(e.certo, e.dica));
    const nota = Math.max(0, Math.min(10, Number(sum.nota) || 0));
    if (chat.convoId) recordConvo(chat.convoId, nota);
    mem.recordSession({ nota, foco: sum.melhorias?.[0] || sum.erros_comuns?.[0]?.dica });
    updateSkill('conversacao', nota * 10);
    if (Number.isFinite(Number(sum.compreensao))) updateSkill('escuta', Number(sum.compreensao) * 10);
    const sub = (n, label) => (Number.isFinite(Number(n)) ? `<div class="rep-sub"><b>${Number(n).toFixed(0)}<small>/10</small></b><span class="muted small">${label}</span></div>` : '');
    const sec = (ic, title) => `<h3 class="rep-h">${icon(ic)} ${title}</h3>`;
    openModal(`
      <div class="report">
      <h2 class="rep-title">${icon('clipboard-check')} Relatório da conversa</h2>
      <div class="rep-scores">
        <div class="ring rep-ring" style="--p:${nota * 10}"><b>${nota.toFixed(1)}</b><span class="small muted">nota</span></div>
        <div class="rep-subs">${sub(sum.fluidez, 'Fluidez')}${sub(sum.compreensao, 'Compreensão')}</div>
      </div>
      <p class="rep-open">${esc(sum.abertura)}</p>
      ${sum.erros_comuns?.length ? `${sec('x', 'Erros identificados')}${sum.erros_comuns.map((e) => `<div class="correction"><s>${esc(e.erro)}</s> → <b>${esc(e.certo)}</b><div class="small">${esc(e.dica)}</div></div>`).join('')}` : ''}
      ${sum.alternativas?.length ? `${sec('repeat', 'Frases alternativas')}${sum.alternativas.map((a) => `<div class="correction"><span class="muted">${esc(a.seu)}</span><div>${icon('sparkles')} <b>${esc(a.melhor)}</b></div></div>`).join('')}` : ''}
      ${sum.melhorias?.length ? `${sec('target', 'Pontos de melhoria')}<ul class="small rep-list">${sum.melhorias.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>` : ''}
      ${sum.vocabulario?.length ? `${sec('pin', 'Vocabulário novo')}<div class="newwords">${sum.vocabulario.map((w) => `<span class="tag">${esc(w.en)} = ${esc(w.pt)}</span>`).join('')}</div>` : ''}
      ${sum.exercicios?.length ? `${sec('lightbulb', 'Exercícios')}${sum.exercicios.slice(0, 5).map((x, i) => `<details class="rep-ex"><summary>${i + 1}. ${esc(x.pergunta)}</summary><p>${icon('check')} ${esc(x.resposta)}</p></details>`).join('')}` : ''}
      <p class="muted small" style="margin-top:12px">Os erros entraram na sua lista de palavras difíceis. A nota de pronúncia depende da qualidade do áudio e do reconhecimento automático.</p>
      <div class="row" style="margin-top:12px"><button class="btn outline grow" id="sumClose">Fechar</button><button class="btn primary grow" id="sumNew">Nova conversa</button></div>
      </div>`);
    say([{ text: sum.abertura, lang: 'pt-BR' }], 'neutra');
    $('#sumClose').onclick = () => { closeModal(); stopAudio(); leaving(); };
    $('#sumNew').onclick = () => {
      closeModal(); stopAudio();
      if (train && currentPlan().stages[train.idx]?.id === 'summary') return leaving();
      if (chat.convoId) return startConvo(chat.convoId);
      if (chat.mode && !['tema', 'livre'].includes(chat.mode)) return startMode(chat.mode);
      newChat(chat.themeId, chat.freeTopic, { mode: chat.mode }); renderChat();
    };
  } catch (e) {
    openModal(`<p>⚠️ ${esc(e.message)}</p><button class="btn block" id="sumClose">Fechar</button>`);
    $('#sumClose').onclick = () => { closeModal(); leaving(); };
  }
}

/* ==========================================================
   REVISÃO DE PALAVRAS DIFÍCEIS
   ========================================================== */
function renderReview() {
  const words = hardWords();
  const due = dueCards(99).length, learned = Object.keys(state.srs).length;
  view.innerHTML = `
    <header class="page-head"><h1>Revisar</h1><p class="muted small">Revisão espaçada e as palavras que você mais erra.</p></header>
    <button class="card review-hero ${due ? '' : 'calm'}" data-go="srs">
      <span class="mini-ico">${icon('repeat')}</span>
      <span class="grow"><b>${due ? `${due} ${due === 1 ? 'cartão' : 'cartões'} para hoje` : 'Nada para revisar hoje'}</b><span class="muted small">Flashcards · revisão espaçada</span></span>
      ${due ? `<span class="btn sm primary">${icon('play')} Revisar</span>` : icon('chevron-right', 'ic-muted')}
    </button>
    <div class="mode-grid">
      <button class="mode-card" data-go="retention"><span class="mini-ico">${icon('brain')}</span><b>Retenção</b><span class="muted small">${learned} palavras aprendidas</span></button>
      <button class="mode-card" data-go="srs"><span class="mini-ico">${icon('book-open')}</span><b>Flashcards</b><span class="muted small">${due} para hoje</span></button>
    </div>
    <div class="section-head"><h2>Pronúncia: palavras difíceis</h2>${words.length ? `<span class="tag">${words.length}</span>` : ''}</div>
    <p class="muted small">Tudo que você errou na aula, na prova e na conversa. Treine até sair da lista.</p>
    ${words.length ? `<button class="btn primary block" id="trainAll" style="margin:10px 0">${icon('audio-lines')} Treinar todas (${words.length})</button>` : ''}
    <div class="card hard-list">
      ${words.length ? words.map((w) => `<div class="hard-row">
          <button class="ex-play" data-say="${esc(w.word)}" aria-label="Ouvir ${esc(w.word)}">${icon('volume-2')}</button>
          <span class="grow"><b lang="en">${esc(w.word)}</b>${w.dica ? `<span class="muted small">${esc(w.dica)}</span>` : ''}</span>
          <span class="hard-actions"><span class="tag ${w.count >= 3 ? 'bad' : w.count >= 2 ? 'warn' : ''}" title="Vezes que errou">errou ${w.count}×</span>
          <button class="btn sm outline" data-go="drill/${encodeURIComponent(w.word)}">Treinar</button>
          <button class="icon-btn sm" data-remove="${esc(w.word)}" aria-label="Remover ${esc(w.word)}">${icon('x')}</button></span></div>`).join('')
        : `<p class="muted center empty">${icon('sparkles')}<br>Nenhuma palavra difícil. ${S().polite ? '' : 'Ou você nem tentou ainda.'}</p>`}
    </div>`;
  $$('[data-remove]').forEach((b) => (b.onclick = () => { removeHardWord(b.dataset.remove); renderReview(); }));
  if ($('#trainAll')) $('#trainAll').onclick = () => {
    runSession({ title: 'Palavras difíceis', themeId: null, mode: 'drill', items: words.map((w) => ({ en: w.word, pt: w.dica || '' })), goal: 'Repita cada palavra. Você tem 3 tentativas.' });
  };
}

/* ==========================================================
   PROGRESSO (acompanhamento)
   ========================================================== */
function renderProgress() {
  const plan = currentPlan();
  const days = lastDays(7);
  const max = Math.max(plan.total, ...days.map((d) => d.minutes), 1);
  const W = 320, H = 150, bw = 30, gap = (W - 7 * bw) / 8;
  const y = (v) => H - 22 - (v / max) * (H - 40);
  const chart = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Minutos estudados por dia">
    <line x1="0" x2="${W}" y1="${y(plan.total)}" y2="${y(plan.total)}" stroke="var(--muted)" stroke-dasharray="4 4" />
    <text x="${W - 4}" y="${y(plan.total) - 4}" text-anchor="end">meta ${plan.total}′</text>
    ${days.map((d, i) => { const x = gap + i * (bw + gap); return `<rect x="${x}" y="${y(d.minutes)}" width="${bw}" height="${Math.max(0, H - 22 - y(d.minutes))}" rx="6" fill="${d.met ? 'var(--green-bright)' : 'var(--green-deep)'}" ${d.isToday ? 'stroke="var(--green-bright)" stroke-width="2"' : ''} />
      <text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${d.label}</text>${d.minutes ? `<text x="${x + bw / 2}" y="${y(d.minutes) - 4}" text-anchor="middle">${d.minutes}</text>` : ''}`; }).join('')}
  </svg>`;
  const trained = days.filter((d) => d.met).length;
  const minsWeek = days.reduce((a, d) => a + d.minutes, 0);
  const notas = days.filter((d) => d.nota !== null);
  const notaWeek = notas.length ? notas.reduce((a, d) => a + d.nota, 0) / notas.length : null;
  const exams = state.exams.slice().reverse().slice(0, 10);
  const themes = THEMES.map((t) => ({ t, s: themeStats(S().level, t.id) })).filter((x) => x.s.practiced || x.s.bestExam !== null);
  const lv = learn.currentLevel();
  const rec = learn.recommendation();
  const lvp = learn.levelProgress(lv);
  const kpi = (ic, v, label) => `<div class="kpi">${icon(ic)}<b>${v}</b><span>${label}</span></div>`;
  view.innerHTML = `
    <header class="page-head"><h1>Meu progresso</h1><p class="muted small">Seu nível, sua semana e onde focar agora.</p></header>
    <button class="card level-card-home prog-hero" data-go="learn/${lv.id}">
      <span class="lvl-badge">${lv.id}</span>
      <span class="grow"><b>${esc(lv.name)}</b><span class="muted small">${lvp.done}/${lvp.total} aulas do nível</span>
        <span class="progress"><i style="width:${(lvp.done / lvp.total) * 100}%"></i></span></span>
      ${icon('chevron-right', 'ic-muted')}
    </button>
    <div class="kpis prog-kpis">
      ${kpi('flame', streak(), 'dias seguidos')}
      ${kpi('target', `${trained}/7`, 'dias com meta')}
      ${kpi('history', `${minsWeek}′`, 'nos últimos 7 dias')}
      ${kpi('book-open', Object.keys(state.curr.lessons).length, 'aulas feitas')}
      ${kpi('brain', Object.keys(state.srs).length, 'palavras praticadas')}
      ${kpi('audio-lines', notaWeek !== null ? notaWeek.toFixed(1) : '—', 'pronúncia da semana')}
    </div>
    <div class="section-head"><h2>Últimos 7 dias</h2><span class="muted small">minutos por dia</span></div>
    <div class="card chart-card">${chart}
      <div class="chart-legend small muted"><span><i class="lg met"></i>meta batida</span><span><i class="lg"></i>abaixo da meta</span><span><i class="lg goal"></i>meta diária</span></div></div>
    <div class="section-head"><h2>Habilidades</h2></div>
    <div class="card"><div class="skill-bars">${learn.skillBars(learn.skillProfile())}</div>
      <div class="tip">${icon('lightbulb')}<span>${esc(rec.text)}</span></div></div>
    ${hardWords().length ? `<button class="card resume-card" data-go="review"><span class="mini-ico">${icon('audio-lines')}</span><span class="grow"><b>${hardWords().length} palavras difíceis</b><span class="muted small">Treine a pronúncia em Revisar</span></span>${icon('chevron-right', 'ic-muted')}</button>` : ''}
    <div class="section-head"><h2>Jornada CEFR</h2></div>
    <div class="card lesson-list">${CEFR.map((l) => { const p = learn.levelProgress(l); return `<button class="lesson-row ${l.id === lv.id ? 'next' : ''}" data-go="learn/${l.id}"><span class="dot ${p.final ? 'ok' : ''}">${p.final ? icon('check') : l.id}</span><span class="grow"><b>${l.id} · ${esc(l.name)}</b><span class="progress" style="margin-top:6px"><i style="width:${(p.done / p.total) * 100}%"></i></span></span><span class="muted small">${p.done}/${p.total}</span>${p.final ? `<span class="tag ok">${icon('graduation-cap')}</span>` : ''}</button>`; }).join('')}</div>
    <div class="section-head"><h2>Temas pop</h2><span class="muted small">${LEVELS[S().level].name}</span></div>
    <div class="card">
      ${themes.length ? themes.map(({ t, s }) => `<div class="list-item"><span>${t.emoji} ${esc(t.name)}</span><span class="muted small">${s.practiced} frases${s.avg !== null ? ' · média ' + s.avg.toFixed(1) : ''}${s.bestExam !== null ? ' · prova ' + s.bestExam.toFixed(1) : ''}</span></div>`).join('') : `<p class="muted center empty">${icon('clapperboard')}<br>Nenhum tema praticado ainda.</p>`}
    </div>
    <div class="section-head"><h2>Provas dos temas</h2></div>
    <div class="card">
      ${exams.length ? exams.map((e) => `<div class="list-item hist-item"><span class="grow"><b>${esc((THEMES.find((t) => t.id === e.themeId) || {}).name || e.themeId)}</b><span class="muted small">${e.date}</span></span><span class="tag ${e.score >= 7 ? 'ok' : e.score >= 5 ? 'warn' : 'bad'}">${e.score.toFixed(1)}/10</span></div>`).join('') : `<p class="muted center empty">${icon('clipboard-check')}<br>Faça uma prova em um tema para ver a nota aqui.</p>`}
    </div>
    <p class="muted small center" style="margin-top:var(--sp-4)">${icon('settings')} Dias de treino em Configurações → Plano. Dias de folga não contam como falta.</p>`;
}

/* ==========================================================
   TESTE DE NÍVEL
   ========================================================== */
function renderLevelTest() {
  let i = 0, score = 0;
  const step = () => {
    if (i >= LEVEL_TEST.length) {
      const lvl = getLevel(['A1', 'A1', 'A2', 'B1', 'B2', 'C1'][Math.min(score, 5)]);
      view.innerHTML = `<header class="page-head"><h1>Teste de nível</h1><p class="muted small">Resultado</p></header><div class="card center result-card">
        <div class="ring result-ring" style="--p:${Math.round((score / LEVEL_TEST.length) * 100)}"><b>${score}/${LEVEL_TEST.length}</b><span class="small muted">acertos</span></div>
        <p>Sugestão: começar no</p>
        <div class="lt-level"><span class="lvl-badge">${lvl.id}</span><b>${esc(lvl.name)}</b></div>
        <p class="muted small">É só uma estimativa rápida. A prova final de cada nível confirma de verdade.</p>
        <div class="result-actions">
          <button class="btn primary block" id="useLvl">Começar no ${lvl.id} ${icon('chevron-right')}</button>
          <button class="btn outline block" id="keepLvl">Manter ${esc(S().cefr)}</button>
        </div></div>`;
      $('#useLvl').onclick = () => { learn.setLevel(lvl.id); state.testDone = true; save(); go('learn/' + lvl.id); };
      $('#keepLvl').onclick = () => { state.testDone = true; save(); go('home'); };
      return;
    }
    const q = LEVEL_TEST[i];
    view.innerHTML = `<header class="page-head"><h1>Teste de nível</h1><p class="muted small">Nivelamento rápido: escolha a resposta certa.</p></header>
      <div class="card ex-card"><div class="ex-head"><span class="tag">${icon('compass')} Nivelamento</span><span class="muted small">${i + 1}/${LEVEL_TEST.length}</span></div>
      <div class="progress ex-prog"><i style="width:${(i / LEVEL_TEST.length) * 100}%"></i></div>
      <div class="ex-prompt">${esc(q.q)}</div><div class="options">${q.options.map((o, k) => `<button class="btn" data-k="${k}">${esc(o)}</button>`).join('')}</div></div>`;
    $$('[data-k]').forEach((b) => (b.onclick = () => {
      const ok = +b.dataset.k === q.a;
      if (ok) score++;
      b.classList.add(ok ? 'right' : 'wrong');
      $$('[data-k]').forEach((x) => { x.disabled = true; if (+x.dataset.k === q.a) x.classList.add('right'); });
      setTimeout(() => { i++; step(); }, 800);
    }));
  };
  step();
}

/* ==========================================================
   CONFIGURAÇÕES
   ========================================================== */
function renderSettings() {
  const s = S();
  view.innerHTML = `
    <header class="page-head"><h1>Configurações</h1><p class="muted small">Tudo fica salvo só neste aparelho.</p></header>

    <div class="card">
      <h2 class="set-h">${icon('sparkles')} Gemini (IA)</h2>
      <label class="field"><span>Chave (fica só neste aparelho)</span>
        <div class="row"><input type="password" id="apiKey" value="${esc(s.apiKey)}" placeholder="AQ... ou AIza..." autocomplete="off" /><button class="btn sm outline" id="showKey" aria-label="Mostrar ou ocultar a chave">Mostrar</button></div></label>
      <label class="field"><span>Modelo</span>
        <input type="text" id="model" list="models" value="${esc(s.model)}" />
        <datalist id="models"><option value="gemini-3.5-flash-lite"><option value="gemini-3.5-flash"><option value="gemini-3.8-flash"><option value="gemini-flash-latest"></datalist></label>
      <button class="btn block" id="testKey">Testar chave</button>
      <details class="howto" style="margin-top:12px"><summary>Como gerar a chave?</summary>
        <ol><li>Entre em <b>aistudio.google.com</b> com sua conta Google.</li><li><b>Get API key</b> → <b>Create API key</b>.</li><li>Copie e cole aqui. Clique em <b>Testar chave</b>.</li></ol>
        <p class="muted small">No plano grátis o Google pode usar as conversas e os áudios para treinar modelos. Não fale dados sensíveis.</p></details>
    </div>

    <div class="card">
      <h2 class="set-h">${icon('graduation-cap')} Professor e escuta</h2>
      <label class="field"><span>Professor</span><select id="teacher">${Object.values(TEACHERS).map((t) => `<option value="${t.id}" ${t.id === T().id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label>
      <label class="field"><span>Intensidade do humor${s.polite ? ' <span class="muted small">(desligada no Modo educado)</span>' : ''}</span><select id="humor" ${s.polite ? 'disabled' : ''}>${Object.entries(HUMOR).map(([k, h]) => `<option value="${k}" ${k === T().humor ? 'selected' : ''}>${esc(h.name)}</option>`).join('')}</select></label>
      ${T().renderer === 'pavio' ? `<div class="switch"><span><b>Pavio em 3D</b><br><span class="muted small">${webglOK() ? 'Corpo inteiro no início, com uma pose para cada emoção, e a cabeça com a cara da emoção no chat e nas aulas. Gasta mais bateria; cada pose é baixada (uns 4 MB) na primeira vez que aparece.' : 'Este aparelho não suporta 3D (WebGL).'}</span></span><input type="checkbox" id="pavio3d" ${s.pavio3d ? 'checked' : ''} ${webglOK() ? '' : 'disabled'} /></div>` : ''}
      ${T().renderer === 'pavio' ? `<div class="switch"><span><b>Pavio sempre animado</b><br><span class="muted small">${matchMedia('(prefers-reduced-motion: reduce)').matches ? 'Seu aparelho pede para reduzir animações. Ligado, só o Pavio continua se mexendo; o resto do app fica parado.' : 'Desligue para o Pavio ficar parado, só trocando de expressão.'}</span></span><input type="checkbox" id="pavioMotion" ${s.pavioMotion !== false ? 'checked' : ''} /></div>` : ''}
      <div class="switch"><span><b>Modo educado</b><br><span class="muted small">Sem palavrões nem deboche</span></span><input type="checkbox" id="polite" ${s.polite ? 'checked' : ''} /></div>
      <label class="field"><span>Como ele te ouve</span><select id="listenMode">
        <option value="gemini" ${s.listenMode === 'gemini' ? 'selected' : ''}>IA ouve meu áudio (avalia a pronúncia de verdade)</option>
        <option value="browser" ${s.listenMode !== 'gemini' ? 'selected' : ''}>Transcrição do navegador (mais leve, menos rigoroso)</option>
      </select></label>
      <label class="field"><span>Seu nível (CEFR)</span><select id="level">${CEFR.map((l) => `<option value="${l.id}" ${l.id === s.cefr ? 'selected' : ''}>${l.id} · ${esc(l.name)}</option>`).join('')}</select></label>
      <button class="btn block" id="levelTest">Fazer teste de nível</button>
    </div>

    <div class="card">
      <h2 class="set-h">${icon('target')} Plano de estudo</h2>
      <label class="field"><span>Plano</span><select id="plan">${Object.entries(PLANS).map(([k, p]) => `<option value="${k}" ${k === s.plan ? 'selected' : ''}>${p.name}</option>`).join('')}</select></label>
      <div id="planMins">${currentPlan().stages.map((st) => `<label class="field"><span>${st.name} (min)</span><input type="number" min="0" max="120" data-stage="${st.id}" value="${st.min}" /></label>`).join('')}</div>
      <p class="muted small">Total: <b id="planTotal">${currentPlan().total}</b> min/dia</p>
      <span class="muted small">Dias de treino</span>
      <div class="days" style="margin-top:6px">${'DSTQQSS'.split('').map((d, i) => `<label><input type="checkbox" data-day="${i}" ${s.days[i] ? 'checked' : ''} /><span>${d}</span></label>`).join('')}</div>
      <div class="switch"><span>Lembrete diário</span><input type="checkbox" id="remOn" ${s.reminder.enabled ? 'checked' : ''} /></div>
      <label class="field"><span>Horário do lembrete</span><input type="time" id="remTime" value="${esc(s.reminder.time)}" /></label>
    </div>

    <div class="card">
      <h2 class="set-h">${icon('volume-2')} Voz</h2>
      <label class="field"><span>Velocidade: <b id="rateVal">${s.rate.toFixed(2)}x</b></span><input type="range" id="rate" min="0.7" max="1.2" step="0.05" value="${s.rate}" /></label>
      <label class="field"><span>Quando o professor fala</span><select id="audioPref">
        <option value="all" ${(s.audioPref || 'all') === 'all' ? 'selected' : ''}>Fala tudo (inglês e comentários)</option>
        <option value="speech" ${s.audioPref === 'speech' ? 'selected' : ''}>Só o inglês dos exercícios</option>
        <option value="off" ${s.audioPref === 'off' ? 'selected' : ''}>Sem áudio (só o botão Ouvir)</option>
      </select></label>
      <p class="muted small">Por padrão, todos os personagens falam com a voz do aparelho (grátis).</p>
      <label class="field"><span>Voz do aparelho em inglês</span><select id="voiceSel"></select></label>
      <label class="field"><span>Voz do aparelho em português</span><select id="voiceSelPt"></select></label>
      <button class="btn block" id="testVoice">Testar voz</button>
      <div class="switch"><span>Ler a bronca em português em voz alta</span><input type="checkbox" id="speakPt" ${s.speakPt ? 'checked' : ''} /></div>
      <div class="switch"><span>Abrir o microfone sozinho depois da fala do professor</span><input type="checkbox" id="autoListen" ${s.autoListen ? 'checked' : ''} /></div>

      <h3 class="set-h" style="margin-top:18px">${icon('audio-lines')} Voz do ElevenLabs <span class="tag ${eleven.elevenReady() ? 'accent' : ''}">${eleven.elevenReady() ? 'ativa' : 'opcional'}</span></h3>
      <p class="muted small">Quer outra voz? Cole sua chave e o <b>ID da voz</b> do ElevenLabs. Ela passa a valer para todos os personagens. Deixe o ID em branco para voltar à voz do aparelho.</p>
      <label class="field"><span>Chave do ElevenLabs (só neste aparelho)</span>
        <div class="row"><input type="password" id="elKey" value="${esc(s.eleven.key)}" placeholder="sk_..." autocomplete="off" /><button class="btn sm" id="elLoad">Carregar vozes</button></div></label>
      <label class="field"><span>ID da voz</span><input type="text" id="elVoiceId" value="${esc(s.eleven.voiceId)}" placeholder="ex.: pNInz6obpgDQGcFmaJgB" autocomplete="off" /></label>
      <label class="field"><span>…ou escolha uma voz da sua conta</span><select id="elVoice">
        <option value="">— nenhuma (voz do aparelho) —</option>
        ${s.eleven.voiceId ? `<option value="${esc(s.eleven.voiceId)}" selected>${esc(s.eleven.voiceName || 'Voz colada pelo ID')}</option>` : ''}
      </select></label>
      <p class="muted small">Todas as vozes falam inglês e português. Vozes da biblioteca do ElevenLabs só funcionam no plano pago; se a voz falhar, o app volta para a voz do aparelho.</p>
      <div class="row"><button class="btn sm outline" id="elTest">${icon('volume-2')} Testar a voz</button></div>
      <p class="muted small" id="elInfo">Cada fala gasta créditos. Repetir o áudio não gasta de novo.</p>
    </div>

    <div class="card">
      <h2 class="set-h">${icon('sparkles')} Conta e apresentação</h2>
      <p class="muted small">${state.account ? 'Conectado como ' + esc(state.account.name || state.account.email || 'conta Google') + '.' : 'Sem conta: seu progresso fica só neste aparelho.'}</p>
      <div class="row wrap"><button class="btn sm" data-go="login">${state.account ? 'Minha conta' : 'Entrar com o Google'}</button><button class="btn sm outline" id="redoOb">Ver a apresentação do Pavio de novo</button></div>
    </div>

    <div class="card">
      <h2 class="set-h">${icon('download')} Instalar o app</h2>
      ${isStandalone() ? '<p class="muted small">Você já está usando o EaglesIn instalado.</p>'
        : `<p class="muted small">Coloca o EaglesIn na tela inicial, com o ícone do Pavio, abrindo em tela cheia.</p>
      <button class="btn primary block" data-install-go>${icon('download')} Instalar o EaglesIn</button>
      <p class="muted small" data-install-none>${isIOSDevice ? '' : 'Se o botão não abrir nada, use o menu do navegador (⋮) → <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.'}</p>`}
    </div>

    ${memoryCard()}

    <div class="card">
      <h2 class="set-h">${icon('star')} Aparência</h2>
      <label class="field"><span>Tema</span><select id="themeSel">
        <option value="dark" ${s.uiTheme !== 'light' ? 'selected' : ''}>Escuro (padrão)</option>
        <option value="light" ${s.uiTheme === 'light' ? 'selected' : ''}>Claro</option>
      </select></label>
    </div>

    <div class="card">
      <h2 class="set-h">${icon('history')} Dados</h2>
      <div class="row wrap"><button class="btn sm outline" id="exp">Exportar backup</button><button class="btn sm outline" id="imp">Importar backup</button><button class="btn sm outline danger" id="reset">Apagar tudo</button></div>
      <input type="file" id="impFile" accept="application/json" class="hidden" />
    </div>
    <p class="muted small center">EaglesIn · uso pessoal</p>`;

  const bind = (id, ev, fn) => $('#' + id).addEventListener(ev, fn);
  bind('apiKey', 'change', (e) => { s.apiKey = e.target.value.trim(); save(); toast('Chave salva.'); });
  bind('showKey', 'click', () => { const i = $('#apiKey'); i.type = i.type === 'password' ? 'text' : 'password'; });
  bind('model', 'change', (e) => { s.model = e.target.value.trim() || DEFAULT_MODEL; save(); });
  bind('testKey', 'click', async () => {
    s.apiKey = $('#apiKey').value.trim(); s.model = $('#model').value.trim() || DEFAULT_MODEL; save();
    const b = $('#testKey'); b.disabled = true; b.textContent = 'Testando…';
    try { const m = await testKey(); toast(`✅ Chave funcionando (${m || s.model}).`, 3500); }
    catch (e) { toast('❌ ' + e.message, 5000); }
    finally { b.disabled = false; b.textContent = 'Testar chave'; }
  });
  bind('teacher', 'change', (e) => { stopAudio(); s.teacher = e.target.value; save(); renderSettings(); });
  bind('pavio3d', 'change', (e) => { stopAudio(); s.pavio3d = e.target.checked; save(); toast(s.pavio3d ? 'Pavio em 3D ligado.' : 'Pavio 2.5D de volta.'); });
  bind('humor', 'change', (e) => { (s.humorBy ??= {})[T().id] = e.target.value; save(); toast(`Humor: ${HUMOR[e.target.value].name}`); });
  bind('polite', 'change', (e) => { s.polite = e.target.checked; save(); toast(s.polite ? 'Modo educado ligado.' : 'Modo debochado de volta.'); const h = $('#humor'); if (h) h.disabled = s.polite; });
  bind('listenMode', 'change', (e) => { s.listenMode = e.target.value; save(); });
  bind('level', 'change', (e) => { learn.setLevel(e.target.value); updateChips(); toast('Nível: ' + s.cefr); });
  bind('levelTest', 'click', renderLevelTest);
  bind('plan', 'change', (e) => { s.plan = e.target.value; save(); renderSettings(); });
  $$('[data-stage]').forEach((inp) => inp.addEventListener('change', () => {
    (s.planMinutes[s.plan] ??= {})[inp.dataset.stage] = Math.max(0, Math.min(120, Number(inp.value) || 0));
    save(); $('#planTotal').textContent = currentPlan().total;
  }));
  $$('[data-day]').forEach((c) => c.addEventListener('change', () => { s.days[+c.dataset.day] = c.checked; save(); }));
  bind('remOn', 'change', async (e) => {
    s.reminder.enabled = e.target.checked; save();
    if (e.target.checked && 'Notification' in window && (await Notification.requestPermission()) !== 'granted') toast('Permissão de notificação negada.');
  });
  bind('remTime', 'change', (e) => { s.reminder.time = e.target.value || '19:00'; state.lastReminder = ''; save(); });
  bind('rate', 'input', (e) => { s.rate = Number(e.target.value); $('#rateVal').textContent = s.rate.toFixed(2) + 'x'; save(); });
  bind('testVoice', 'click', () => say([
    { text: `Hi! I am ${T().name}, and your accent is... interesting.` },
    ...(s.speakPt ? [{ text: s.polite ? 'Vamos praticar juntos?' : 'Rapaz, bora treinar que esse sotaque tá de sacanagem!', lang: 'pt-BR' }] : []),
  ]));
  bind('speakPt', 'change', (e) => { s.speakPt = e.target.checked; save(); });
  bind('themeSel', 'change', (e) => { s.uiTheme = e.target.value; save(); applyTheme(); });
  bind('memOn', 'change', (e) => { mem.setMemoryOn(e.target.checked); toast(e.target.checked ? 'Memória ligada.' : 'Memória desligada: o professor não lembra nem anota nada.'); renderSettings(); });
  $$('[data-memfact]').forEach((b) => (b.onclick = () => { mem.removeFact(Number(b.dataset.memfact)); renderSettings(); }));
  $$('[data-memerr]').forEach((b) => (b.onclick = () => { mem.removeError(b.dataset.memerr); renderSettings(); }));
  $('#memClear')?.addEventListener('click', () => { if (confirm('Apagar tudo o que o professor lembra de você? (Progresso e notas continuam.)')) { mem.clearMemory(); toast('Memória apagada.'); renderSettings(); } });
  bind('autoListen', 'change', (e) => { s.autoListen = e.target.checked; save(); });

  bind('audioPref', 'change', (e) => { s.audioPref = e.target.value; save(); if (s.audioPref === 'off') stopAudio(); });
  bind('redoOb', 'click', () => { if (confirm('Rever a apresentação? Seu progresso nas aulas não muda.')) onb.restartOnboarding(); });
  bind('pavioMotion', 'change', (e) => {
    s.pavioMotion = e.target.checked; save(); applyTheme();
    for (const r of Object.values(RENDERERS)) if (rState.get(r)) r.apply?.();
    toast(s.pavioMotion ? 'Pavio animado.' : 'Pavio parado, só trocando de expressão.');
  });
  bind('elKey', 'change', (e) => { s.eleven.key = e.target.value.trim(); elevenOff = false; libraryBlocked = false; save(); });
  /* Testa a voz de verdade e mostra o motivo exato se falhar (sem cair para a voz do navegador). */
  bind('elTest', 'click', async () => {
    s.eleven.key = $('#elKey').value.trim(); save(); elevenOff = false;
    if (!s.eleven.key) return toast('Cole a chave do ElevenLabs primeiro.');
    if (!s.eleven.voiceId) return toast('Cole o ID da voz (ou escolha uma voz da conta) primeiro.');
    const b = $('#elTest'), info = $('#elInfo'); b.disabled = true;
    stopAudio(); setTalkState('speaking', true);
    try {
      await speakEleven('Hello! Ready to train your English? Bora!', { lang: 'en-US', rate: S().rate });
      info.textContent = `✅ ElevenLabs funcionando, com a voz ${lastElevenVoice}.`;
    } catch (e) { info.textContent = '❌ ' + e.message; toast('❌ ' + e.message, 6000); }
    finally { b.disabled = false; setTalkState('speaking', false); }
  });
  bind('elVoiceId', 'change', (e) => { s.eleven.voiceId = e.target.value.trim(); s.eleven.voiceName = ''; elevenOff = false; libraryBlocked = false; save(); renderSettings(); });
  bind('elVoice', 'change', (e) => { const o = e.target.selectedOptions[0]; s.eleven.voiceId = e.target.value; s.eleven.voiceName = e.target.value ? o.textContent.replace(/ \(.*\)$/, '') : ''; elevenOff = false; libraryBlocked = false; save(); renderSettings(); });
  /* Lista as vozes da conta (não gasta créditos). Abre sozinha quando já há chave. */
  const loadElVoices = async (quiet) => {
    s.eleven.key = $('#elKey').value.trim(); save();
    if (!s.eleven.key) return quiet || toast('Cole a chave do ElevenLabs primeiro.');
    const b = $('#elLoad'); b.disabled = true; b.textContent = 'Carregando…';
    try {
      const [list, credits] = await Promise.all([eleven.listVoices(), eleven.creditsLeft()]);
      const sel = $('#elVoice'); if (!sel) return;
      const own = s.eleven.voiceId && !list.some((v) => v.id === s.eleven.voiceId)
        ? `<option value="${esc(s.eleven.voiceId)}" selected>${esc(s.eleven.voiceName || 'Voz colada pelo ID')}</option>` : '';
      sel.innerHTML = `<option value="">— nenhuma (voz do aparelho) —</option>${own}` + list.map((v) => `<option value="${esc(v.id)}" ${v.id === s.eleven.voiceId ? 'selected' : ''}>${esc(v.name)}${v.info ? ' (' + esc(v.info) + ')' : ''}</option>`).join('');
      if (s.eleven.voiceId && !s.eleven.voiceName) { const f = list.find((v) => v.id === s.eleven.voiceId); if (f) { s.eleven.voiceName = f.name; save(); } }
      if (credits) $('#elInfo').textContent = `Créditos usados neste mês: ${credits.used.toLocaleString('pt-BR')} de ${credits.limit.toLocaleString('pt-BR')}.`;
      if (!quiet) toast(`✅ ${list.length} vozes carregadas.`);
    } catch (e) { if (!quiet) toast('❌ ' + e.message, 5000); else $('#elInfo').textContent = '❌ ' + e.message; }
    finally { if ($('#elLoad')) { $('#elLoad').disabled = false; $('#elLoad').textContent = 'Carregar vozes'; } }
  };
  bind('elLoad', 'click', () => loadElVoices(false));
  if (s.eleven.key) loadElVoices(true);

  bind('exp', 'click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([exportData()], { type: 'application/json' }));
    a.download = `eaglesin-backup-${dayKey()}.json`; a.click();
  });
  bind('imp', 'click', () => $('#impFile').click());
  bind('impFile', 'change', async (e) => { const f = e.target.files[0]; if (!f) return; try { importData(await f.text()); } catch { toast('Arquivo inválido.'); } });
  bind('reset', 'click', () => { if (confirm('Apagar TODO o progresso e as configurações? Não dá pra desfazer.')) resetAll(); });

  const fillVoices = () => {
    for (const [id, lang, key] of [['voiceSel', 'en-US', 'voiceURI'], ['voiceSelPt', 'pt-BR', 'voiceURIpt']]) {
      const sel = $('#' + id); if (!sel) return;
      const list = voice.listVoices(lang);
      sel.innerHTML = `<option value="">Automática (melhor disponível)</option>` + list.map((v) => `<option value="${esc(v.voiceURI)}" ${v.voiceURI === s[key] ? 'selected' : ''}>${esc(v.name)} (${v.lang})</option>`).join('');
      sel.onchange = () => { s[key] = sel.value; save(); };
    }
  };
  fillVoices();
  // o iPhone entrega a lista de vozes com atraso
  const t = setTimeout(fillVoices, 700), t2 = setTimeout(fillVoices, 2500); cleanups.push(() => { clearTimeout(t); clearTimeout(t2); });
}

/* ==========================================================
   LEMBRETE (notificação local, se o navegador permitir)
   ========================================================== */
async function checkReminder() {
  const r = S().reminder;
  if (!r.enabled || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date();
  const [h, m] = (r.time || '19:00').split(':').map(Number);
  if (!isTrainingDay(now) || today().goalMet || state.lastReminder === dayKey()) return;
  if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
  state.lastReminder = dayKey(); save();
  const opts = { body: S().polite ? 'Hora de praticar inglês!' : 'Cadê você? Seu inglês não vai melhorar sozinho!', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'nuvem-reminder' };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) reg.showNotification('EaglesIn', opts); else new Notification('EaglesIn', opts);
  } catch {}
}
setInterval(checkReminder, 60000);

/* ==========================================================
   BOOT
   ========================================================== */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  // Versão nova chegou: recarrega sozinho. No meio de aula, prova ou conversa, espera trocar de tela.
  const tinha = !!navigator.serviceWorker.controller;
  let atualizar = false;
  const ocupado = () => /^#(lesson|exam|chat|drill|welcome|login)/.test(location.hash);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!tinha || atualizar) return;
    atualizar = true;
    if (!ocupado()) location.reload();
  });
  addEventListener('hashchange', () => { if (atualizar && !ocupado()) location.reload(); });
  navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW:', e));
}

try {
  const cfg = await import('./config.local.js');
  if (cfg.GEMINI_API_KEY && !S().apiKey) { S().apiKey = cfg.GEMINI_API_KEY; save(); }
  if (cfg.ELEVENLABS_API_KEY && !S().eleven.key) { S().eleven.key = cfg.ELEVENLABS_API_KEY; save(); }
  if (cfg.ELEVENLABS_VOICE_ID && !S().eleven.voiceId) { S().eleven.voiceId = cfg.ELEVENLABS_VOICE_ID; save(); }
} catch { /* sem arquivo local: a chave é colada nas Configurações */ }

onb.initOnboarding({
  view, $, $, esc, icon, toast, go, say, stopAudio, setMood, gesture, activity, endActivity, stageHost, bubble,
  applyPrefs: applyTheme, showPrivacy,
  preload: (m) => { if (rOK()) R().preloadMood?.(emo.toEmotion(m)); },
});
learn.initLearn({
  view, $, $$, esc, toast, go, route, say, hear, setMood, gesture, stageHost, stopAudio, canUseMic, activity, endActivity, liveCheck,
  S, T, nextStageBtn, startConvo, levelTest: renderLevelTest, stopRecording: () => recorder.stopRecording(),
  reactAnswer, resetRun: emo.resetRun, bubble,
});
route();
checkReminder();
