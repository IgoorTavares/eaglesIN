/* ==========================================================
   srs.js — revisão espaçada estilo Leitner (5 caixas).
   Acertou: sobe uma caixa (intervalo maior).
   Errou:   volta para a caixa 1 (revisa amanhã/hoje).
   ========================================================== */
import { state, save, dayKey } from './store.js';

export const INTERVALS = [0, 1, 3, 7, 14, 30]; // dias por caixa (1..5); índice 0 não usado

function addDays(n) { const d = new Date(); d.setDate(d.getDate() + n); return dayKey(d); }

/* Adiciona (ou rebaixa, se já existe e errou de novo) uma palavra. */
export function addCard(en, pt = '', { failed = false } = {}) {
  if (!en) return;
  const k = en.trim().toLowerCase();
  const c = state.srs[k];
  if (c) {
    if (pt && !c.pt) c.pt = pt;
    if (failed) { c.box = 1; c.due = dayKey(); }
  } else {
    state.srs[k] = { en: en.trim(), pt, box: 1, due: dayKey(), added: dayKey() };
  }
  save();
}

export function dueCards(limit = 20) {
  const t = dayKey();
  return Object.values(state.srs)
    .filter((c) => c.due <= t)
    .sort((a, b) => a.box - b.box || a.due.localeCompare(b.due))
    .slice(0, limit);
}

export function grade(en, correct) {
  const c = state.srs[en.toLowerCase()];
  if (!c) return;
  c.box = correct ? Math.min(5, c.box + 1) : 1;
  c.due = addDays(correct ? INTERVALS[c.box] : 0);
  save();
}

export function boxCounts() {
  const counts = [0, 0, 0, 0, 0];
  for (const c of Object.values(state.srs)) counts[c.box - 1]++;
  return counts;
}
