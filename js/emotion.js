/* ==========================================================
   emotion.js — motor de emoções, separado do desenho do professor.

   - Emoções "canônicas" que qualquer professor entende.
   - Escada de paciência: o APP conta os erros seguidos (a IA não
     inventa histórico). Cada professor diz como reage em cada degrau.
   - O renderer de cada professor (nuvem, Pavio…) traduz a emoção
     para o próprio desenho.
   ========================================================== */

export const EMOTIONS = [
  'neutral', 'happy', 'excited', 'sarcastic', 'impatient', 'huffing', 'angry', 'furious',
  'surprised', 'disappointed', 'proud', 'celebrating', 'tired', 'laughing', 'calming',
];

/* Nomes antigos (e os que a IA devolve em "emocao") -> emoção canônica. */
const FROM_PT = {
  neutra: 'neutral', feliz: 'happy', orgulhosa: 'proud', irritada: 'angry', chocada: 'surprised',
  debochada: 'sarcastic', decepcionada: 'disappointed', rindo: 'laughing',
};
export const toEmotion = (e) => (EMOTIONS.includes(e) ? e : FROM_PT[e] || 'neutral');

/* Emoção canônica -> um dos 5 humores da Nuvem (mantém a Nuvem igual a antes). */
const TO_CLOUD = {
  neutral: 'neutra', happy: 'feliz', excited: 'feliz', laughing: 'feliz', proud: 'orgulhosa', celebrating: 'orgulhosa',
  sarcastic: 'neutra', tired: 'neutra', calming: 'neutra', surprised: 'chocada',
  impatient: 'irritada', huffing: 'irritada', angry: 'irritada', furious: 'irritada', disappointed: 'irritada',
};
export const toCloud = (e) => TO_CLOUD[toEmotion(e)] || 'neutra';

/* ---------- escada de paciência ---------- */
const run = { wrong: 0, right: 0, keys: {} };
const keyOf = (k) => String(k || '').toLowerCase().replace(/[^a-z0-9' ]/g, '').trim().slice(0, 60);

/* Zera a escada (aula nova, conversa nova). */
export function resetRun() { run.wrong = 0; run.right = 0; run.keys = {}; run.pending = 0; }
/* Pedido de ajuda: a bronca para, mas o app lembra que ele vinha errando
   (se acertar em seguida, é "volta por cima" e o professor comemora). */
export function calmDown() { run.pending = Math.max(run.pending || 0, run.wrong); run.wrong = 0; }
export const currentRun = () => ({ wrong: run.wrong, right: run.right });

/* Registra uma resposta corrigida. key = o que estava certo (para saber se o erro se repete).
   known = a memória do aluno já tinha esse erro (reincidência de outra conversa).
   Devolve { ok, wrong, right, repeat, comeback }. */
export function answer(ok, key, known = false) {
  const k = keyOf(key);
  if (ok) {
    const comeback = run.wrong >= 2 || run.pending >= 2 || (k && run.keys[k] > 0);
    if (k) delete run.keys[k];
    run.right++; run.wrong = 0; run.pending = 0;
    return { ok: true, wrong: 0, right: run.right, repeat: false, comeback };
  }
  const repeat = !!(k && run.keys[k]) || !!known;
  if (k) run.keys[k] = (run.keys[k] || 0) + 1;
  run.wrong++; run.right = 0; run.pending = 0;
  return { ok: false, wrong: run.wrong, right: 0, repeat, comeback: false };
}

/* Degrau 0..3 da escada conforme erros seguidos, erro repetido e intensidade do humor. */
export function step(res, humor = 'grosseiro', polite = false) {
  if (polite) return 0;
  let s = Math.min(3, Math.max(0, res.wrong - 1) + (res.repeat ? 1 : 0));
  if (humor === 'caotico') s = Math.min(3, s + 1);
  if (humor === 'leve') s = Math.min(1, s);
  return s;
}

/* Emoção para uma resposta corrigida, segundo o professor. */
export function emotionFor(teacher, res, humor, polite) {
  if (res.ok) {
    if (res.comeback) return 'celebrating';
    if (res.right > 0 && res.right % 5 === 0) return 'proud';
    return 'happy';
  }
  const ladder = teacher.ladder || ['angry', 'angry', 'angry', 'angry'];
  if (polite) return 'neutral';
  return ladder[step(res, humor, polite)];
}

/* Fala curta de reação, quando o professor tem falas próprias por degrau. */
export function lineFor(teacher, res, humor, polite) {
  const L = teacher.lines; if (!L) return null;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  if (polite) return pick(res.ok ? L.politeRight : L.politeWrong);
  if (res.ok) return pick(res.comeback ? L.comeback : L.right);
  return pick(L.wrong[step(res, humor, polite)]);
}
