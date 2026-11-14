/* ==========================================================
   memory.js — memória do aluno (fica só no aparelho).

   O professor lembra:
   - fatos que o aluno contou (trabalho, gostos, objetivo…);
   - erros de gramática/vocabulário que ele repete;
   - palavras de pronúncia difícil e habilidades mais fracas;
   - como foram as últimas conversas.
   Essa memória vai junto no prompt da conversa (Gemini).
   O aluno vê, apaga item por item ou desliga nas Configurações.
   ========================================================== */
import { state, save, dayKey, hardWords } from './store.js';
import { SKILLS } from './curriculum.js';

const MAX_FACTS = 25, MAX_ERRORS = 40, MAX_SESSIONS = 5;
const M = () => {
  const m = (state.memory ??= {});
  m.on ??= true; m.facts ??= []; m.errors ??= {}; m.sessions ??= [];
  return m;
};
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9' ]/g, ' ').replace(/\s+/g, ' ').trim();
/* Nada de dado sensível na memória, mesmo que a IA mande. */
const SENSITIVE = /\b(cpf|rg|senha|password|cart[aã]o|conta banc|endere[cç]o|rua |avenida|telefone|celular|whats|e-?mail|@|doen[cç]a|diagn[oó]stic|rem[eé]dio|religi|igreja|partido|vota|sexual)\b|\d{5,}/i;

export const memoryOn = () => M().on !== false;
export function setMemoryOn(on) { M().on = !!on; save(); }
export const memoryData = () => { const m = M(); return { on: m.on, facts: m.facts, errors: errorList(), sessions: m.sessions }; };

/* ---------- fatos ---------- */
export function addFact(text) {
  const t = String(text || '').trim().replace(/\s+/g, ' ').slice(0, 140);
  if (!memoryOn() || t.length < 4 || SENSITIVE.test(t)) return false;
  const m = M(), n = norm(t);
  if (m.facts.some((f) => norm(f.t) === n)) return false;
  m.facts.push({ t, d: dayKey() });
  if (m.facts.length > MAX_FACTS) m.facts.splice(0, m.facts.length - MAX_FACTS);
  save();
  return true;
}
export function removeFact(i) { M().facts.splice(i, 1); save(); }

/* ---------- erros recorrentes ---------- */
const errKey = (certo) => norm(certo).slice(0, 80);
/* Já errou isso antes (em outra conversa ou nesta)? */
export const knownError = (certo) => memoryOn() && !!M().errors[errKey(certo)];
export function recordError(c) {
  if (!memoryOn() || !c?.certo) return;
  const k = errKey(c.certo); if (!k) return;
  const m = M(), e = (m.errors[k] ??= { certo: '', errado: '', explicacao: '', n: 0 });
  e.certo = String(c.certo).slice(0, 120);
  if (c.errado) e.errado = String(c.errado).slice(0, 120);
  if (c.explicacao) e.explicacao = String(c.explicacao).slice(0, 160);
  e.n++; e.d = dayKey();
  const keys = Object.keys(m.errors);
  if (keys.length > MAX_ERRORS) {
    // sai o menos repetido e mais antigo
    keys.sort((a, b) => m.errors[a].n - m.errors[b].n || String(m.errors[a].d).localeCompare(String(m.errors[b].d)));
    keys.slice(0, keys.length - MAX_ERRORS).forEach((x) => delete m.errors[x]);
  }
  save();
}
export function removeError(k) { delete M().errors[k]; save(); }
function errorList() {
  return Object.entries(M().errors).map(([k, e]) => ({ k, ...e }))
    .sort((a, b) => b.n - a.n || String(b.d).localeCompare(String(a.d)));
}

/* ---------- conversas ---------- */
export function recordSession({ nota, foco }) {
  if (!memoryOn()) return;
  const m = M();
  m.sessions.push({ d: dayKey(), nota: Math.round(Number(nota) * 10) / 10 || 0, foco: String(foco || '').slice(0, 140) });
  if (m.sessions.length > MAX_SESSIONS) m.sessions.splice(0, m.sessions.length - MAX_SESSIONS);
  save();
}

export function clearMemory() { const on = memoryOn(); state.memory = { on, facts: [], errors: {}, sessions: [] }; save(); }

/* ---------- texto para o prompt ---------- */
const br = (d) => (d ? d.slice(8, 10) + '/' + d.slice(5, 7) : '');
export function memoryNote() {
  if (!memoryOn()) return '';
  const m = M(), out = [];
  if (m.facts.length) out.push('- Sobre o aluno: ' + m.facts.slice(-12).map((f) => f.t.replace(/\.$/, '')).join('; ') + '.');
  const errs = errorList().slice(0, 6);
  if (errs.length) out.push('- Erros que ele já cometeu (nº de vezes): ' + errs.map((e) => `${e.errado ? `"${e.errado}" → ` : ''}"${e.certo}" (${e.n}x)`).join('; ') + '.');
  const hw = hardWords(5).filter((w) => w.count >= 2);
  if (hw.length) out.push('- Pronúncia que ele vive errando: ' + hw.map((w) => w.word).join(', ') + '.');
  const weak = Object.entries(state.skills || {}).filter(([, s]) => s.n && s.v < 70).sort((a, b) => a[1].v - b[1].v).slice(0, 2);
  if (weak.length) out.push('- Habilidades mais fracas: ' + weak.map(([k, s]) => `${(SKILLS[k] || k).toLowerCase()} ${s.v}%`).join(', ') + '.');
  if (m.sessions.length) out.push('- Últimas conversas: ' + m.sessions.slice(-2).map((s) => `${br(s.d)} nota ${s.nota}${s.foco ? ` (melhorar: ${s.foco})` : ''}`).join('; ') + '.');
  if (!out.length) return '';
  return [
    'MEMÓRIA DO ALUNO (guardada no aparelho dele; é o que você sabe de conversas anteriores):',
    ...out,
    'COMO USAR A MEMÓRIA: use com naturalidade, sem recitar a lista. Puxe assunto pelo que você sabe dele de vez em quando. Se ele repetir um erro da lista, diga que ele JÁ errou isso antes (é reincidência, e a bronca pode subir). Se acertar algo que vivia errando, comemore. Nunca invente fatos que não estão aqui.',
  ].join('\n');
}
