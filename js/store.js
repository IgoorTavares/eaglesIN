/* ==========================================================
   store.js — dados salvos no aparelho (localStorage):
   configurações, plano de estudo, tempo estudado, notas de
   pronúncia, palavras difíceis e provas.
   ========================================================== */

const KEY = 'claudia-teacher-v1'; // mantido para não perder dados de versões anteriores

/* Planos de treino diário. Os minutos são editáveis nas Configurações. */
export const PLANS = {
  basico: {
    name: 'Básico',
    stages: [
      { id: 'review', name: 'Palavras difíceis', min: 2 },
      { id: 'repeat', name: 'Aula de frases', min: 5 },
      { id: 'chat', name: 'Conversa', min: 3 },
    ],
  },
  medio: {
    name: 'Médio',
    stages: [
      { id: 'review', name: 'Palavras difíceis', min: 3 },
      { id: 'repeat', name: 'Aula de frases', min: 8 },
      { id: 'chat', name: 'Conversa', min: 6 },
      { id: 'exercises', name: 'Teste rápido', min: 3 },
    ],
  },
  cefr50: {
    name: 'Completo (50 min)',
    stages: [
      { id: 'repeat', name: 'Aula do currículo (vocabulário + gramática)', min: 20 },
      { id: 'chat', name: 'Conversação guiada', min: 15 },
      { id: 'review', name: 'Pronúncia: palavras difíceis', min: 5 },
      { id: 'exercises', name: 'Revisão espaçada', min: 10 },
    ],
  },
  intensivo: {
    name: 'Intensivo',
    stages: [
      { id: 'review', name: 'Palavras difíceis', min: 5 },
      { id: 'repeat', name: 'Aula de frases', min: 15 },
      { id: 'chat', name: 'Conversa', min: 12 },
      { id: 'exercises', name: 'Teste rápido', min: 6 },
      { id: 'summary', name: 'Resumo da sessão', min: 2 },
    ],
  },
};

function defaults() {
  return {
    settings: {
      apiKey: '',
      model: 'gemini-3.5-flash-lite',
      listenMode: 'gemini',   // 'gemini' = a IA ouve seu áudio | 'browser' = transcrição do navegador
      level: 'basico',
      theme: 'friends',       // tema escolhido no momento
      plan: 'basico',
      planMinutes: {},        // plano -> { etapa: minutos } (só o que você alterou)
      rate: 1,
      polite: false,
      speakPt: true,
      autoListen: false,
      pavioMotion: true,      // Pavio se mexe mesmo com "reduzir movimento"/"efeitos de animação" desligados no sistema
      voiceURI: '',
      voiceURIpt: '',         // voz do aparelho para o português (bronca), quando não há ElevenLabs
      eleven: { key: '', voiceId: '', voiceName: '' },
      reminder: { enabled: false, time: '19:00' },
      days: [true, true, true, true, true, true, true], // dom..sáb
    },
    history: {},   // 'YYYY-MM-DD' -> { seconds, goalMet, phrases, notaSum, notaN }
    practice: {},  // nível -> tema -> { frase: melhor nota }
    exams: [],     // { themeId, level, kind, score, date }
    massacred: {}, // palavra difícil -> { count, last, dica }
    testDone: false,
    chat: null,
    lastReminder: '',
  };
}

function merge(base, saved) {
  for (const k in saved) {
    if (saved[k] && typeof saved[k] === 'object' && !Array.isArray(saved[k]) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
      base[k] = merge(base[k], saved[k]);
    } else base[k] = saved[k];
  }
  return base;
}

export const state = (() => {
  try { return merge(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
  catch { return defaults(); }
})();

/* Migrações de versões antigas. */
if (/^gemini-(flash-latest|2\.|1\.)/.test(state.settings.model || '')) state.settings.model = 'gemini-3.5-flash-lite';
if (!Array.isArray(state.exams)) state.exams = [];
/* --- COMPATIBILIDADE TEMPORÁRIA ---------------------------------------
   A interface antiga (app.js) ainda usa XP, sequência, conquistas e revisão.
   Estes campos e funções ficam aqui até a nova interface (Pavio 3D, aula de
   frases e provas) substituir o app.js. Depois disso, este bloco sai. */
state.xp ??= 0; state.srs ??= {}; state.achievements ??= {}; state.progress ??= {};
state.stats = { messages: 0, correctRepeats: 0, massacredTotal: 0, exercisesDone: 0, lessonsDone: 0, sessions: 0, themesTalked: {}, ...(state.stats || {}) };
/* Professor padrão: Pavio (decidido em 2026-11-13). Migração única: quem estava no padrão
   antigo (Nuvem) ou no Mario (removido) passa para o Pavio; depois disso, a escolha é livre. */
if (!state.settings.pavioDefault) {
  if (!state.settings.teacher || ['nuvem', 'mario'].includes(state.settings.teacher)) state.settings.teacher = 'pavio';
  state.settings.pavioDefault = true;
}
if (!state.settings.teacher || state.settings.teacher === 'mario') state.settings.teacher = 'pavio';
/* Pavio em 3D vira o padrão (2026-11-14, com as expressões de corpo inteiro). Migração única:
   liga para todo mundo uma vez; depois, quem desligar fica desligado. Sem WebGL, o app usa o 2.5D. */
if (!state.settings.pavio3dDefault) { state.settings.pavio3d = true; state.settings.pavio3dDefault = true; }
for (const [k, p] of Object.entries(PLANS)) {
  state.settings.planMinutes[k] ??= {};
  for (const s of p.stages) state.settings.planMinutes[k][s.id] ??= s.min;
}
export const XP = { message: 5, repeatOk: 10, repeatWord: 3, exercise: 4, review: 2, lesson: 30, goalMet: 25, session: 15 };
export const ACHIEVEMENTS = [];
export function addXp(n) { state.xp += n; save(); }
export function userLevel(xp = state.xp) { let lvl = 1, need = 100, acc = 0; while (xp >= acc + need) { acc += need; lvl++; need += 50; } return { lvl, into: xp - acc, need }; }
export function streak() {
  let count = 0; const d = new Date();
  if (state.history[dayKey(d)]?.goalMet) count++;
  for (let i = 1; i < 400; i++) {
    d.setDate(d.getDate() - 1);
    if (state.history[dayKey(d)]?.goalMet) { count++; continue; }
    if (!state.settings.days[d.getDay()]) continue;
    break;
  }
  return count;
}
export function lessonState(level, themeId) { state.progress[level] ??= {}; state.progress[level][themeId] ??= {}; return state.progress[level][themeId]; }
export function completeLesson(level, themeId, lessonId) {
  const ls = lessonState(level, themeId); if (ls[lessonId]) return false;
  ls[lessonId] = dayKey(); state.stats.lessonsDone++; save(); return true;
}
export function addMassacred(word) { addHardWord(word); state.stats.massacredTotal++; }
export function checkAchievements() { return []; }

let saveTimer = 0;
let frozen = false;
export function save() { clearTimeout(saveTimer); saveTimer = setTimeout(flush, 150); }
export function flush() {
  clearTimeout(saveTimer);
  if (frozen) return;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('save failed', e); }
}
export function resetAll() { frozen = true; localStorage.removeItem(KEY); location.reload(); }
export function exportData() { return JSON.stringify(state, null, 2); }
export function importData(json) {
  const data = JSON.stringify(merge(defaults(), JSON.parse(json)));
  frozen = true; localStorage.setItem(KEY, data); location.reload();
}

/* ---------- Datas ---------- */
export function dayKey(d = new Date()) {
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
export function today() {
  const k = dayKey();
  state.history[k] ??= { seconds: 0, goalMet: false, phrases: 0, notaSum: 0, notaN: 0 };
  const t = state.history[k];
  t.phrases ??= 0; t.notaSum ??= 0; t.notaN ??= 0;
  return t;
}

/* ---------- Plano ---------- */
export function currentPlan() {
  const p = PLANS[state.settings.plan] || PLANS.basico;
  const mins = state.settings.planMinutes[state.settings.plan] || {};
  const stages = p.stages.map((s) => ({ ...s, min: Number(mins[s.id] ?? s.min) }));
  return { ...p, stages, total: stages.reduce((a, s) => a + s.min, 0) };
}
export const goalSeconds = () => Math.max(60, currentPlan().total * 60);
export const isTrainingDay = (d = new Date()) => !!state.settings.days[d.getDay()];

/* Soma tempo de estudo de hoje; devolve true no momento em que a meta é batida. */
export function addStudyTime(sec) {
  const t = today();
  t.seconds += sec;
  let justMet = false;
  if (!t.goalMet && t.seconds >= goalSeconds()) { t.goalMet = true; justMet = true; }
  save();
  return justMet;
}

/* Últimos 7 dias (o último é hoje) para o acompanhamento. */
export function lastDays(n = 7) {
  const out = [];
  for (let k = n - 1; k >= 0; k--) {
    const d = new Date(); d.setDate(d.getDate() - k);
    const rec = state.history[dayKey(d)] || {};
    out.push({
      label: 'DSTQQSS'[d.getDay()], date: dayKey(d), isToday: k === 0,
      planned: !!state.settings.days[d.getDay()],
      minutes: Math.round((rec.seconds || 0) / 60),
      met: !!rec.goalMet,
      nota: rec.notaN ? rec.notaSum / rec.notaN : null,
      phrases: rec.phrases || 0,
    });
  }
  return out;
}

/* ---------- Prática de frases ---------- */
export function recordPhrase(level, themeId, en, nota) {
  const t = today();
  t.phrases++; t.notaSum += nota; t.notaN++;
  if (themeId) {
    state.practice[level] ??= {};
    state.practice[level][themeId] ??= {};
    const cur = state.practice[level][themeId][en];
    state.practice[level][themeId][en] = Math.max(cur ?? 0, Math.round(nota * 10) / 10);
  }
  save();
}
export function recordNota(nota) { const t = today(); t.notaSum += nota; t.notaN++; save(); }

export function themeStats(level, themeId) {
  const notas = Object.values(state.practice[level]?.[themeId] || {});
  const exams = state.exams.filter((e) => e.themeId === themeId && e.level === level && e.kind === 'prova');
  return {
    practiced: notas.length,
    avg: notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null,
    bestExam: exams.length ? Math.max(...exams.map((e) => e.score)) : null,
  };
}

/* ---------- Palavras difíceis ---------- */
export function addHardWord(word, dica = '') {
  const w = String(word || '').toLowerCase().trim();
  if (!w) return;
  state.massacred[w] ??= { count: 0, last: '', dica: '' };
  state.massacred[w].count++;
  state.massacred[w].last = dayKey();
  if (dica) state.massacred[w].dica = dica;
  save();
}
export function removeHardWord(word) { delete state.massacred[String(word).toLowerCase()]; save(); }
export function hardWords(limit = 99) {
  return Object.entries(state.massacred).sort((a, b) => b[1].count - a[1].count).slice(0, limit).map(([word, v]) => ({ word, ...v }));
}

/* ---------- Currículo CEFR ---------- */
const LEGACY_TO_CEFR = { basico: 'A1', intermediario: 'B1', avancado: 'C1' };
state.settings.cefr ??= LEGACY_TO_CEFR[state.settings.level] || 'A1';
state.curr ??= {};
state.curr.lessons ??= {};    // id -> { best (0-100), last, tries, date }
state.curr.unitExams ??= {};  // unitId -> [{ score, skills, date }]
state.curr.finals ??= {};     // levelId -> [{ score, skills, passed, date }]
state.curr.convos ??= {};     // convoId -> { nota, date }
state.skills ??= {};          // habilidade -> { v (0-100), n }
state.settings.humorBy ??= {}; // professor -> 'leve' | 'grosseiro' | 'caotico' (intensidade do humor)

/* Regras internas de aprovação (não são critérios oficiais do CEFR). */
export const PASS = { advance: 80, retry: 60, finalSkillMin: 60 };

export function updateSkill(key, pct) {
  if (!key || !Number.isFinite(pct)) return;
  const s = (state.skills[key] ??= { v: 0, n: 0 });
  s.v = s.n ? Math.round(s.v * 0.7 + pct * 0.3) : Math.round(pct);
  s.n++;
  save();
}
export function recordLesson(id, pct) {
  const r = (state.curr.lessons[id] ??= { best: 0, tries: 0 });
  r.best = Math.max(r.best, Math.round(pct)); r.last = Math.round(pct); r.tries++; r.date = dayKey();
  (state.stats.lessonsDone = (state.stats.lessonsDone || 0) + 1);
  save();
}
export const lessonDone = (id) => (state.curr.lessons[id]?.best ?? -1) >= PASS.retry;
export function recordUnitExam(unitId, score, skills) {
  (state.curr.unitExams[unitId] ??= []).push({ score: Math.round(score), skills, date: dayKey() });
  save();
}
export const bestUnitExam = (unitId) => { const l = state.curr.unitExams[unitId] || []; return l.length ? Math.max(...l.map((e) => e.score)) : null; };
export function recordFinal(levelId, score, skills, passed) {
  (state.curr.finals[levelId] ??= []).push({ score: Math.round(score), skills, passed, date: dayKey() });
  save();
}
export const finalPassed = (levelId) => (state.curr.finals[levelId] || []).some((f) => f.passed);
export function recordConvo(id, nota) { state.curr.convos[id] = { nota, date: dayKey() }; save(); }

/* ---------- Pacotes de aula/prova gerados pela IA (cache local, fora do backup) ---------- */
const PACK_KEY = 'nuvem-packs-v1';
function packs() { try { return JSON.parse(localStorage.getItem(PACK_KEY) || '{}'); } catch { return {}; } }
export function getPack(id) { return packs()[id]?.pack || null; }
export function putPack(id, pack) {
  const all = packs();
  all[id] = { pack, t: Date.now() };
  const keys = Object.keys(all).sort((a, b) => all[b].t - all[a].t);
  keys.slice(40).forEach((k) => delete all[k]); // guarda só os 40 mais recentes
  try { localStorage.setItem(PACK_KEY, JSON.stringify(all)); } catch { /* sem espaço: segue sem cache */ }
}
export function dropPack(id) { const all = packs(); delete all[id]; try { localStorage.setItem(PACK_KEY, JSON.stringify(all)); } catch {} }

/* ---------- Provas ---------- */
export function recordExam({ themeId, level, kind, score }) {
  state.exams.push({ themeId, level, kind, score: Math.round(score * 10) / 10, date: dayKey() });
  if (state.exams.length > 200) state.exams.shift();
  save();
}
