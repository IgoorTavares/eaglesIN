/* ==========================================================
   onboarding.js — primeiro acesso com o Professor Pavio.

   Máquina de estados simples: uma lista de etapas (STEPS), cada uma com
   id, estado (welcome, introduction, audio-preference, self-assessment,
   microphone-permission/recording/processing/feedback, achievement, goals,
   personalization, personality, demo-lesson, registration), dados e regra
   de avanço. O Pavio fica fixo no palco; só o painel de baixo troca.

   Sem servidor: nada aqui chama IA paga.
   - Voz do Pavio: a do aparelho (ou o ElevenLabs, se o dono do aparelho
     já tiver colado uma chave). Só fala depois do primeiro toque.
   - Desafio de fala e conversa de demonstração: reconhecimento de voz do
     navegador + comparação de TEXTO. Não é avaliação de pronúncia.
   - Respostas ficam em state.onboarding (neste aparelho), sem áudio, e
     expiram em 7 dias se a apresentação não for concluída.
   ========================================================== */
import { state, save } from './store.js';
import * as voice from './voice.js';
import * as mem from './memory.js';

let X; // contexto do app
export function initOnboarding(ctx) { X = ctx; }

const TTL = 7 * 24 * 3600 * 1000;
const fresh = () => ({ done: false, step: 'welcome', answers: {}, startedAt: Date.now(), spoke: false });
/* Estado salvo. Quem já usava o app (tem progresso ou chave) não refaz a apresentação. */
export function ob() {
  if (!state.onboarding) {
    const used = (state.xp || 0) > 0 || Object.keys(state.history || {}).length > 0 || state.testDone
      || Object.keys(state.curr?.lessons || {}).length > 0 || !!state.settings.apiKey;
    state.onboarding = used ? { done: true } : fresh();
    save();
  }
  const o = state.onboarding;
  if (!o.done && Date.now() - (o.startedAt || 0) > TTL) { state.onboarding = fresh(); save(); } // visita antiga: limpa
  return state.onboarding;
}
export const needsOnboarding = () => !ob().done;
export function restartOnboarding() { state.onboarding = fresh(); save(); X.go('welcome'); }

/* ---------- conteúdo das etapas ---------- */
const PHRASE = "I'd like a glass of water, please.";
const LEVELS = [
  ['none', 'Nunca estudei.'], ['words', 'Sei algumas palavras.'], ['phrases', 'Consigo formar frases simples.'],
  ['talk', 'Consigo manter uma conversa.'], ['fluent', 'Converso sobre diversos assuntos.'],
];
const WHY = [['travel', 'Viagens'], ['work', 'Trabalho'], ['study', 'Estudos'], ['people', 'Conversar com outras pessoas'], ['fun', 'Filmes, séries e jogos'], ['self', 'Desenvolvimento pessoal']];
const BLOCK = [['shame', 'Vergonha de errar'], ['blank', 'Não saber o que responder'], ['listen', 'Dificuldade para entender'], ['practice', 'Falta de prática'], ['forget', 'Esquecer palavras'], ['pron', 'Pronúncia']];
const TOPICS = [['travel', 'Viagens'], ['job', 'Profissão'], ['shows', 'Séries e filmes'], ['daily', 'Cotidiano'], ['interview', 'Entrevistas'], ['tech', 'Tecnologia'], ['sports', 'Esportes'], ['music', 'Música']];
const MIN = [[5, '5 minutos'], [10, '10 minutos'], [15, '15 minutos'], [30, '30 minutos'], [45, '45 minutos ou mais']];
const TIME = [['1m', '1 mês'], ['3m', '3 meses'], ['6m', '6 meses'], ['1y', '1 ano']];
const label = (list, v) => (list.find((o) => o[0] === v) || [, '—'])[1];

const STEPS = [
  { id: 'welcome', state: 'welcome', mood: 'happy', gesture: 'wave', kind: 'info',
    title: 'OPA! EU SOU O PROFESSOR PAVIO!', text: 'Seu novo professor de inglês. Tenho muita paciência... até você testar os limites dela!',
    cta: 'Bora aprender!', alt: ['Já tenho conta', 'login'] },
  { id: 'method', state: 'introduction', mood: 'excited', gesture: 'point', kind: 'info',
    title: 'Chega de decorar inglês e travar na hora de falar!', text: 'Aqui você aprende praticando conversas, recebendo correções e falando inglês de verdade.',
    say: 'Chega de decorar lista de verbo e travar na hora de falar! Aqui a gente aprende conversando.' },
  { id: 'teacher', state: 'introduction', mood: 'neutral', kind: 'react',
    title: 'Um professor de IA para praticar com você.', text: 'Converse, tire dúvidas e treine no seu ritmo, sempre que quiser.',
    say: 'Pode perguntar o que quiser, a hora que quiser. Eu não durmo mesmo.' },
  { id: 'emotions', state: 'introduction', mood: 'happy', kind: 'temper',
    title: 'Eu explico quantas vezes precisar.', text: 'Só não estranhe quando meu pavio ficar curto!',
    say: 'Eu explico quantas vezes precisar. Só não estranha quando meu pavio ficar curto!' },
  { id: 'audio', state: 'audio-preference', mood: 'neutral', kind: 'single', key: 'audio',
    title: 'Como você prefere me escutar?', say: 'Como você prefere me escutar?',
    options: [['all', 'Pode falar à vontade.'], ['speech', 'Só durante os exercícios de fala.'], ['off', 'Prefiro começar sem áudio.']],
    note: 'Dá para mudar depois nas Configurações.' },
  { id: 'level', state: 'self-assessment', mood: 'neutral', gesture: 'point', kind: 'single', key: 'level',
    title: 'Quanto inglês você já sabe?', say: 'Me conta: quanto inglês você já sabe?', options: LEVELS,
    note: 'É só a sua opinião, não um teste.' },
  { id: 'speak', state: 'microphone-permission', mood: 'happy', kind: 'speak',
    title: 'Agora quero ouvir seu inglês!', text: 'Repete comigo:', say: 'Agora quero ouvir seu inglês! Repete comigo.' },
  { id: 'achievement', state: 'achievement', mood: 'celebrating', gesture: 'jump', kind: 'info', only: (o) => o.spoke,
    title: 'PRIMEIRA FRASE PRATICADA!', text: 'Você acabou de falar inglês em voz alta. Muita gente trava bem antes disso.',
    say: 'Aí sim! Primeira frase praticada. Tá vendo que não dói?', badge: true },
  { id: 'timeline', state: 'goals', mood: 'neutral', kind: 'single', key: 'timeline',
    title: 'Em quanto tempo você gostaria de perceber evolução no seu inglês?', say: 'Em quanto tempo você quer sentir que evoluiu?', options: TIME,
    note: 'Serve para ajustar o ritmo. Ninguém aqui promete fluência com data marcada.' },
  { id: 'minutes', state: 'goals', mood: 'neutral', kind: 'single', key: 'minutes',
    title: 'Quanto tempo você consegue estudar por dia?', say: 'E quanto tempo por dia você consegue estudar? Seja sincero.', options: MIN },
  { id: 'why', state: 'personalization', mood: 'happy', kind: 'single', key: 'why',
    title: 'Por que você quer aprender inglês?', say: 'Por que você quer aprender inglês?', options: WHY },
  { id: 'blocker', state: 'personalization', mood: 'neutral', kind: 'single', key: 'blocker',
    title: 'O que mais te atrapalha hoje?', say: 'E o que mais te atrapalha hoje?', options: BLOCK },
  { id: 'topics', state: 'personalization', mood: 'happy', kind: 'multi', key: 'topics',
    title: 'Sobre o que você gostaria de conversar em inglês?', say: 'Sobre o que você quer conversar? Pode marcar vários.', options: TOPICS },
  { id: 'plan', state: 'personalization', mood: 'proud', gesture: 'thumbs', kind: 'plan',
    title: 'Seu plano está pronto.', say: 'Gostei. Montei um plano com a sua cara.' },
  { id: 'humor', state: 'personality', mood: 'sarcastic', kind: 'single', key: 'humor',
    title: 'Agora me diz: aguenta minhas brincadeiras?', say: 'Agora me diz: aguenta minhas brincadeiras?',
    options: [
      ['calm', 'Professor tranquilo', 'Explicações gentis, sem provocações.'],
      ['original', 'Pavio original', 'Brincadeiras, palavrão e explosões teatrais.'],
      ['raw', 'Pavio sem filtro', 'Humor mais intenso. O alvo é sempre o erro, nunca você.'],
    ], note: 'Dá para mudar depois nas Configurações.' },
  { id: 'demo', state: 'demo-lesson', mood: 'happy', kind: 'demo', title: 'Sua primeira conversa' },
  { id: 'join', state: 'registration', mood: 'celebrating', gesture: 'jump', kind: 'join',
    title: 'Tá vendo? Você já começou!', text: 'Agora cria sua conta e vamos continuar de onde paramos.',
    say: 'Tá vendo? Você já começou! Agora cria sua conta e vamos continuar de onde paramos.' },
];
const visible = () => STEPS.filter((s) => !s.only || s.only(ob()));
const stepNow = () => visible().find((s) => s.id === ob().step) || STEPS[0];

/* Conversa de demonstração: roteiro fixo (sem IA), escolhido pelas respostas. */
const SCENES = {
  airport: { name: 'No aeroporto', intro: 'Você acabou de pousar. Eu sou o agente da imigração. Responde em inglês!', turns: [
    { en: 'Good morning! What is your name?', pt: 'Bom dia! Qual é o seu nome?', hint: 'My name is Ana.', ok: /\b(my name|i am|i'm|name is)\b/i },
    { en: 'Where are you from?', pt: 'De onde você é?', hint: 'I am from Brazil.', ok: /\b(from|brazil|brasil)\b/i },
    { en: 'How long will you stay?', pt: 'Quanto tempo você vai ficar?', hint: 'Two weeks.', ok: /\b(day|days|week|weeks|month|months|one|two|three|four|five|ten)\b/i },
  ] },
  restaurant: { name: 'No restaurante', intro: 'Você sentou num restaurante. Eu sou o garçom. Responde em inglês!', turns: [
    { en: 'Hi! A table for how many people?', pt: 'Oi! Mesa para quantas pessoas?', hint: 'A table for two, please.', ok: /\b(one|two|three|four|five|six|table|for)\b/i },
    { en: 'What would you like to drink?', pt: 'O que você gostaria de beber?', hint: "I'd like a glass of water, please.", ok: /\b(water|juice|coffee|soda|beer|wine|tea|coke|like|want)\b/i },
    { en: 'Anything else?', pt: 'Mais alguma coisa?', hint: 'No, thank you.', ok: /\b(no|yes|thank|thanks|please)\b/i },
  ] },
  intro: { name: 'Apresentação pessoal', intro: 'A gente acabou de se conhecer numa festa. Responde em inglês!', turns: [
    { en: 'Hi! What is your name?', pt: 'Oi! Qual é o seu nome?', hint: 'My name is Ana.', ok: /\b(my name|i am|i'm|name is)\b/i },
    { en: 'Nice to meet you! Where do you live?', pt: 'Prazer! Onde você mora?', hint: 'I live in São Paulo.', ok: /\b(live|in|from)\b/i },
    { en: 'What do you like to do?', pt: 'O que você gosta de fazer?', hint: 'I like music and movies.', ok: /\b(like|love|enjoy|play|watch|listen)\b/i },
  ] },
  interview: { name: 'Entrevista de emprego', intro: 'Você está numa entrevista de emprego. Eu sou o entrevistador. Responde em inglês!', turns: [
    { en: 'Welcome! Tell me your name, please.', pt: 'Bem-vindo! Diga seu nome, por favor.', hint: 'My name is Ana.', ok: /\b(my name|i am|i'm|name is)\b/i },
    { en: 'What do you do?', pt: 'O que você faz?', hint: 'I am a teacher.', ok: /\b(i am|i'm|work|job|student|study)\b/i },
    { en: 'Why do you want this job?', pt: 'Por que você quer este emprego?', hint: 'Because I like to learn.', ok: /\b(because|like|want|love|learn|grow)\b/i },
  ] },
};
function sceneFor(a) {
  const t = a.topics || [];
  if (a.why === 'travel' || t.includes('travel')) return SCENES.airport;
  if (a.why === 'work' || t.includes('interview') || t.includes('job')) return SCENES.interview;
  if (t.includes('daily')) return SCENES.restaurant;
  return SCENES.intro;
}

/* ---------- utilidades ---------- */
const esc = (s) => X.esc(s);
const icon = (n, c) => X.icon(n, c);
const body = () => X.$('#obBody');
let unlocked = false; // o Pavio só fala depois do primeiro toque (regra dos navegadores)
let token = 0; // invalida temporizadores e escutas da etapa anterior
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function speak(text, mood) {
  X.bubble(text);
  if (mood) X.setMood(mood);
  if (unlocked && text) X.say([{ text, lang: 'pt-BR' }]); // o app respeita a preferência de áudio
}
const CONTR = { "i'd": 'i would', "i'm": 'i am', "it's": 'it is', "don't": 'do not', "i'll": 'i will' };
const words = (s) => String(s || '').toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean).flatMap((w) => (CONTR[w] || w).split(' '));

/* Escuta pelo reconhecimento de voz do navegador. Devolve { text } ou { error }. */
async function listenOnce(onInterim) {
  if (!voice.canListen) return { error: 'unsupported' };
  X.stopAudio();
  X.activity('listening');
  try { const r = await voice.listen({ onInterim, lang: 'en-US' }); return { text: r.text }; }
  catch (e) { return { error: String(e?.message || e) }; }
  finally { X.endActivity('listening'); }
}

/* ---------- navegação ---------- */
function goStep(id) {
  token++;
  X.stopAudio(); voice.stopListening();
  ob().step = id; save();
  paint();
}
function next() {
  const v = visible(), i = v.findIndex((s) => s.id === ob().step);
  if (i < 0 || i >= v.length - 1) return finish('home');
  goStep(v[i + 1].id);
}
function back() {
  const v = visible(), i = v.findIndex((s) => s.id === ob().step);
  if (i > 0) goStep(v[i - 1].id);
}
/* Conclui: aplica as preferências ao app e libera as outras telas. */
function finish(to) {
  const o = ob(), a = o.answers;
  const S = state.settings;
  if (a.audio) S.audioPref = a.audio;
  if (a.humor) { S.polite = a.humor === 'calm'; S.humorBy = { ...(S.humorBy || {}), pavio: a.humor === 'raw' ? 'caotico' : 'grosseiro' }; }
  const PLAN = { 5: ['basico', { review: 1, repeat: 3, chat: 1 }], 10: ['basico', null], 15: ['medio', { review: 2, repeat: 6, chat: 5, exercises: 2 }],
    30: ['medio', { review: 4, repeat: 12, chat: 10, exercises: 4 }], 45: ['cefr50', { repeat: 18, chat: 14, review: 5, exercises: 8 }] }[a.minutes];
  if (PLAN) { S.plan = PLAN[0]; if (PLAN[1]) S.planMinutes = { ...S.planMinutes, [PLAN[0]]: PLAN[1] }; }
  state.profile = { level: a.level, timeline: a.timeline, why: a.why, blocker: a.blocker, topics: a.topics || [], at: Date.now() };
  // Vira memória do aluno (o Pavio usa nas conversas). Só o que a pessoa escolheu contar.
  if (mem.memoryOn()) {
    if (a.why) mem.addFact(`Quer aprender inglês para: ${label(WHY, a.why).toLowerCase()}.`);
    if (a.blocker) mem.addFact(`Maior dificuldade com o inglês: ${label(BLOCK, a.blocker).toLowerCase()}.`);
    if (a.topics?.length) mem.addFact(`Gosta de conversar sobre: ${a.topics.map((t) => label(TOPICS, t).toLowerCase()).join(', ')}.`);
  }
  state.onboarding = { done: true, finishedAt: Date.now(), spoke: !!o.spoke };
  save(); X.applyPrefs?.();
  token++; X.stopAudio();
  X.go(to);
}

/* O personagem terminou de carregar: aplica a emoção da etapa atual. */
export function onStageReady() { if (needsOnboarding()) { const s = stepNow(); X.setMood(s.mood || 'neutral'); } }

/* ---------- telas ---------- */
export function renderWelcome() {
  if (!needsOnboarding()) return X.go('home');
  X.view.innerHTML = `
    <div class="focus-bar ob-bar">
      <button class="icon-btn sm" id="obBack" aria-label="Voltar">${icon('chevron-left')}</button>
      <div class="progress ob-progress" role="img" aria-label="Progresso da apresentação"><i id="obProg" style="width:0%"></i></div>
      <button class="link ob-skip" id="obSkip">Pular</button>
    </div>
    <div class="pavio-stage ob-stage">${X.stageHost('full', 'lesson-stage ob-pavio')}<div class="pavio-bubble hidden" id="pavioBubble" aria-live="polite"></div></div>
    <div id="obBody" class="ob-body"></div>`;
  X.$('#obBack').onclick = back;
  X.$('#obSkip').onclick = () => { if (confirm('Pular a apresentação? Você pode ver de novo nas Configurações.')) finish('home'); };
  paint();
}

function paint() {
  const s = stepNow(), v = visible(), i = v.findIndex((x) => x.id === s.id), o = ob();
  const my = token;
  X.$('#obProg').style.width = `${Math.round(((i + 1) / v.length) * 100)}%`;
  X.$('#obBack').style.visibility = i > 0 ? 'visible' : 'hidden';
  X.$('#obSkip').style.visibility = s.kind === 'join' ? 'hidden' : 'visible';
  X.setMood(s.mood || 'neutral');
  if (s.gesture) setTimeout(() => { if (my === token) X.gesture(s.gesture); }, 350);
  const nx = v[i + 1]; if (nx?.mood) X.preload?.(nx.mood); // baixa a próxima pose sem travar a tela
  X.bubble('');
  // A fala de abertura repete o título da tela: toca o áudio sem balão. O balão fica para as reações.
  if (s.say && unlocked) X.say([{ text: s.say, lang: 'pt-BR' }], undefined, { noBubble: true });
  const head = `<h1 class="ob-title">${esc(s.title)}</h1>${s.text ? `<p class="ob-text">${esc(s.text)}</p>` : ''}`;
  const b = body(); b.dataset.step = s.id; b.dataset.state = s.state;
  b.classList.remove('ob-in'); void b.offsetWidth; b.classList.add('ob-in');

  if (s.kind === 'info') {
    b.innerHTML = `${s.badge ? `<div class="ob-badge">${icon('trophy')}</div>` : ''}${head}
      <button class="btn primary block ob-cta" id="obNext">${esc(s.cta || 'Continuar')}</button>
      ${s.alt ? `<button class="link ob-alt" id="obAlt">${esc(s.alt[0])}</button>` : ''}`;
    X.$('#obNext').onclick = () => { unlocked = true; next(); };
    if (s.alt) X.$('#obAlt').onclick = () => X.go(s.alt[1]);
  } else if (s.kind === 'react') {
    // Mostra o Pavio reagindo a uma pergunta de aluno (demonstração, sem IA).
    b.innerHTML = `${head}<div class="ob-chat"><div class="msg user ob-q">How do I say "saudade" in English?</div><div class="msg ob-a hidden" id="obA"></div></div>
      <button class="btn primary block ob-cta" id="obNext">Continuar</button>`;
    X.$('#obNext').onclick = next;
    (async () => {
      await wait(900); if (my !== token) return; X.activity('thinking');
      await wait(1300); if (my !== token) return; X.endActivity('thinking'); X.setMood('surprised');
      const a = X.$('#obA'); if (a) { a.classList.remove('hidden'); a.textContent = 'Boa pergunta! Não tem uma palavra só. A gente diz "I miss you".'; }
      await wait(1400); if (my !== token) return; X.setMood('happy');
    })();
  } else if (s.kind === 'temper') {
    b.innerHTML = `${head}<button class="btn primary block ob-cta" id="obNext">Entendi</button>`;
    X.$('#obNext').onclick = next;
    (async () => {
      await wait(1700); if (my !== token) return; X.setMood('impatient'); X.gesture('wag');
      await wait(1500); if (my !== token) return; X.setMood('angry');
      await wait(1100); if (my !== token) return; X.setMood('happy'); X.gesture('thumbs');
    })();
  } else if (s.kind === 'single' || s.kind === 'multi') {
    const multi = s.kind === 'multi', cur = o.answers[s.key];
    const on = (v) => (multi ? (cur || []).includes(v) : cur === v);
    b.innerHTML = `${head}<div class="ob-options ${multi ? 'multi' : ''} ${s.options.length > 5 ? 'two' : ''}" role="${multi ? 'group' : 'radiogroup'}">
      ${s.options.map(([v, t, sub]) => `<button class="ob-opt ${on(v) ? 'on' : ''}" data-v="${v}" role="${multi ? 'checkbox' : 'radio'}" aria-checked="${on(v)}"><b>${esc(t)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</button>`).join('')}</div>
      ${s.note ? `<p class="muted small center">${esc(s.note)}</p>` : ''}
      ${multi ? `<button class="btn primary block ob-cta" id="obNext" ${cur?.length ? '' : 'disabled'}>Continuar</button>` : ''}`;
    b.querySelectorAll('.ob-opt').forEach((el) => (el.onclick = () => {
      unlocked = true;
      const raw = el.dataset.v, v = s.options.find((op) => String(op[0]) === raw)[0];
      if (multi) {
        const list = new Set(o.answers[s.key] || []); list.has(v) ? list.delete(v) : list.add(v);
        o.answers[s.key] = [...list]; save();
        el.classList.toggle('on', list.has(v)); el.setAttribute('aria-checked', list.has(v));
        X.$('#obNext').disabled = !list.size;
      } else {
        o.answers[s.key] = v; save();
        if (s.key === 'audio') { state.settings.audioPref = v; save(); if (v === 'off') X.stopAudio(); }
        b.querySelectorAll('.ob-opt').forEach((x) => x.classList.toggle('on', x === el));
        X.gesture('yes');
        setTimeout(() => { if (my === token) next(); }, 320);
      }
    }));
    if (multi) X.$('#obNext').onclick = next;
  } else if (s.kind === 'speak') paintSpeak(s, head, my);
  else if (s.kind === 'plan') paintPlan(s, head);
  else if (s.kind === 'demo') paintDemo(s, my);
  else if (s.kind === 'join') {
    b.innerHTML = `${head}
      <button class="btn primary block ob-cta" id="obCreate">Criar minha conta</button>
      <button class="btn block outline" id="obHave">Já tenho conta</button>
      <button class="link ob-alt" id="obLater">Continuar sem conta por enquanto</button>
      <p class="muted small center">Sem conta, seu progresso fica só neste aparelho. <a href="#privacy" id="obPriv">Privacidade</a></p>`;
    X.$('#obCreate').onclick = () => finish('login');
    X.$('#obHave').onclick = () => finish('login');
    X.$('#obLater').onclick = () => finish('home');
    X.$('#obPriv').onclick = (e) => { e.preventDefault(); X.showPrivacy(); };
  }
}

/* Tela 07 + 08: desafio de fala e retorno. Estados: permission -> recording -> processing -> feedback. */
function paintSpeak(s, head, my) {
  const o = ob(), b = body();
  const setState = (st) => { b.dataset.state = st; };
  b.innerHTML = `${head}
    <div class="ob-phrase" lang="en">${esc(PHRASE)}</div>
    <p class="muted small center">Eu gostaria de um copo de água, por favor.</p>
    <div class="dock-row ob-dock">
      <button class="round" id="obHear" aria-label="Ouvir a frase">${icon('volume-2')}</button>
      <button class="mic" id="obMic" aria-label="Gravar" ${voice.canListen ? '' : 'disabled'}>${icon('mic')}</button>
      <button class="round" id="obSlow" aria-label="Ouvir devagar">${icon('turtle')}</button>
    </div>
    <p class="muted small center" id="obMicHint">${voice.canListen ? 'Toque no microfone e repita. Só começo a ouvir quando você tocar.' : 'Este navegador não tem reconhecimento de voz. Ouça e repita em voz alta.'}</p>
    <div id="obHeard" class="ob-heard" aria-live="polite"></div>
    <button class="btn primary block ob-cta hidden" id="obNext">Continuar</button>
    <button class="link ob-alt" id="obNoMic">Continuar sem microfone</button>
    <p class="muted small center">O reconhecimento de voz é do seu navegador, que pode enviar o áudio ao serviço dele para transcrever. O EaglesIn não guarda sua gravação.</p>`;
  const say = (mul) => { unlocked = true; X.say([{ text: PHRASE, mul }], undefined, { force: true }); };
  X.$('#obHear').onclick = () => say(1);
  X.$('#obSlow').onclick = () => say(0.7);
  X.$('#obNoMic').onclick = next;
  X.$('#obNext').onclick = next;
  let busy = false;
  X.$('#obMic').onclick = async () => {
    if (busy) return voice.stopListening();
    unlocked = true; busy = true; setState('recording');
    const mic = X.$('#obMic'), heard = X.$('#obHeard'), hint = X.$('#obMicHint');
    mic.classList.add('listening'); hint.textContent = 'Ouvindo… toque de novo para parar.'; heard.textContent = '';
    const r = await listenOnce((t) => { if (my === token) heard.textContent = t; });
    if (my !== token) return;
    busy = false; mic.classList.remove('listening'); setState('processing');
    X.activity('thinking'); await wait(500); X.endActivity('thinking');
    if (my !== token) return;
    setState('feedback');
    if (r.error || !r.text) {
      // Erro técnico ou silêncio: nunca tratado como erro do aluno.
      const msg = r.error && r.error !== 'no-speech' ? voice.listenErrorMsg(new Error(r.error)) : 'Não ouvi nada dessa vez.';
      X.setMood('neutral');
      heard.innerHTML = `<div class="feedback"><span class="fb-head">${icon('life-buoy')} ${esc(msg || 'O microfone não respondeu.')}</span><div class="small">Isso é do aparelho, não é erro seu. Tente de novo ou continue sem microfone.</div></div>`;
      hint.textContent = 'Toque no microfone para tentar de novo.';
      return;
    }
    const target = [...new Set(words(PHRASE))], got = new Set(words(r.text));
    const missing = target.filter((w) => !got.has(w)), ratio = 1 - missing.length / target.length;
    if (ratio > 0) o.spoke = true;
    save();
    const good = ratio >= 0.75;
    X.setMood(good ? 'celebrating' : ratio >= 0.4 ? 'happy' : 'neutral'); X.gesture(good ? 'jump' : 'thumbs');
    speak(good ? 'Olha só! Entendi tudinho. Mandou bem!' : ratio >= 0.4 ? 'Boa! Entendi quase tudo. Quer tentar mais uma vez?' : 'Valeu a tentativa! Ouve de novo e repete com calma.');
    heard.innerHTML = `<div class="feedback ${good ? 'okf' : ''}"><span class="fb-head">${icon('ear')} Eu entendi: "${esc(r.text)}"</span>
      ${missing.length ? `<div class="small">Não peguei: <b>${esc(missing.join(', '))}</b>.</div>` : '<div class="small">Todas as palavras da frase apareceram.</div>'}
      <div class="small muted">Comparo só o texto que o reconhecimento de voz entendeu. Não é uma avaliação de pronúncia.</div></div>`;
    hint.textContent = 'Toque no microfone para repetir.';
    X.$('#obNext').classList.remove('hidden'); X.$('#obNoMic').classList.add('hidden');
  };
}

/* Tela 15: resumo das respostas e rotina sugerida (sem promessas de prazo). */
function paintPlan(s, head) {
  const a = ob().answers, m = a.minutes || 10;
  const routine = m <= 5 ? 'Uma aula curta por dia.' : m <= 10 ? 'Uma aula e uma revisão rápida por dia.' : m <= 15 ? 'Uma aula, uma conversa curta e a revisão do dia.'
    : 'Uma aula completa, uma conversa com o Pavio e a revisão do dia.';
  const row = (ic, k, v) => `<div class="ob-sum"><span class="mini-ico">${icon(ic)}</span><span class="grow"><span class="muted small">${k}</span><b>${esc(v)}</b></span></div>`;
  body().innerHTML = `${head}
    <div class="card ob-plan">
      ${row('graduation-cap', 'Seu nível (pela sua resposta)', label(LEVELS, a.level))}
      ${row('target', 'Objetivo', label(WHY, a.why))}
      ${row('flame', 'Tempo por dia', label(MIN, a.minutes))}
      ${row('life-buoy', 'Vamos atacar', label(BLOCK, a.blocker))}
      ${row('message-circle', 'Assuntos', (a.topics || []).map((t) => label(TOPICS, t)).join(', ') || '—')}
    </div>
    <p class="ob-text"><b>Rotina sugerida:</b> ${routine}${['talk', 'fluent'].includes(a.level) ? ' Como você já conversa, vale fazer o teste de nível depois para não começar do zero.' : ''}</p>
    <p class="muted small center">É um ponto de partida. O ritmo de cada pessoa é diferente e não dá para prometer prazo.</p>
    <button class="btn primary block ob-cta" id="obNext">Gostei, bora</button>`;
  X.$('#obNext').onclick = next;
}

/* Tela 17: conversa de demonstração com roteiro fixo, por voz ou texto. */
function paintDemo(s, my) {
  const o = ob(), sc = sceneFor(o.answers), b = body();
  let i = 0;
  b.innerHTML = `<span class="eyebrow">Primeira conversa · ${esc(sc.name)}</span>
    <div class="ob-chat" id="obLog"></div>
    <div id="obTurn"></div>`;
  const log = X.$('#obLog');
  const add = (cls, html) => { log.insertAdjacentHTML('beforeend', `<div class="msg ${cls}">${html}</div>`); log.lastElementChild.scrollIntoView({ block: 'nearest' }); };
  speak(sc.intro, 'happy');
  const ask = () => {
    if (my !== token) return;
    if (i >= sc.turns.length) return end();
    const t = sc.turns[i];
    add('', `<b lang="en">${esc(t.en)}</b><span class="muted small">${esc(t.pt)}</span>`);
    X.setMood('neutral'); X.gesture('point');
    if (unlocked) X.say([{ text: t.en }]);
    X.$('#obTurn').innerHTML = `
      <div class="ob-reply"><input type="text" id="obIn" lang="en" autocomplete="off" autocapitalize="off" placeholder="Responda em inglês…" />
        <button class="round" id="obSend" aria-label="Enviar">${icon('send-horizontal')}</button>
        ${voice.canListen ? `<button class="mic sm" id="obMic2" aria-label="Responder falando">${icon('mic')}</button>` : ''}</div>
      <p class="muted small center">Exemplo: <span lang="en">${esc(t.hint)}</span></p>`;
    const inp = X.$('#obIn');
    const answer = (text) => {
      if (!text.trim() || my !== token) return;
      add('user', esc(text));
      const ok = t.ok.test(text);
      X.setMood(ok ? 'happy' : 'sarcastic'); X.gesture(ok ? 'thumbs' : 'shrug');
      speak(ok ? ['Boa! É isso aí.', 'Perfeito, entendi tudo.', 'Mandou bem!'][i % 3] : `Quase! Um jeito de dizer é: ${t.hint}`);
      if (!ok) add('', `<span class="muted small">Um jeito de dizer:</span> <b lang="en">${esc(t.hint)}</b>`);
      i++; X.$('#obTurn').innerHTML = '';
      setTimeout(ask, 1500);
    };
    X.$('#obSend').onclick = () => answer(inp.value);
    inp.onkeydown = (e) => { if (e.key === 'Enter') answer(inp.value); };
    const m = X.$('#obMic2');
    if (m) m.onclick = async () => {
      if (m.classList.contains('listening')) return voice.stopListening();
      unlocked = true; m.classList.add('listening');
      const r = await listenOnce((tx) => { if (my === token) inp.value = tx; });
      m.classList.remove('listening');
      if (my !== token) return;
      if (r.text) answer(r.text);
      else X.toast(r.error && r.error !== 'no-speech' ? voice.listenErrorMsg(new Error(r.error)) || 'O microfone não respondeu. Pode digitar.' : 'Não ouvi nada. Pode digitar também.');
    };
  };
  const end = () => {
    X.setMood('celebrating'); X.gesture('jump');
    speak('Olha aí! Você acabou de ter uma conversa inteira em inglês.');
    X.$('#obTurn').innerHTML = `<button class="btn primary block ob-cta" id="obNext">Continuar</button>`;
    X.$('#obNext').onclick = next;
  };
  setTimeout(ask, 900);
}
