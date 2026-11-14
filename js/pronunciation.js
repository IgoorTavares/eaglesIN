/* ==========================================================
   pronunciation.js — compara o que você falou com a frase-alvo
   e gera o "xilique" da Cláudia.
   IMPORTANTE: a Web Speech API só ESTIMA a pronúncia (ela tenta
   adivinhar palavras). Não é avaliação fonética real.
   ========================================================== */

const NUM = { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 20: 'twenty', 30: 'thirty', 100: 'hundred' };
const SAME = { okay: 'ok', 'o.k.': 'ok', gonna: 'going', wanna: 'want', '%': 'percent' };

/* Normaliza: minúsculas, sem pontuação, sem acento, apóstrofo removido. */
export function tokenize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/(\d+)%/g, '$1 percent')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/-/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/'/g, ''))
    .filter(Boolean)
    .map((w) => NUM[w] || SAME[w] || w);
}

/* Distância de edição entre duas palavras (para tolerar plural, etc.). */
function lev(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
/* Palavras "iguais o bastante": idênticas, ou diferença mínima em palavras longas. */
function wordMatch(a, b) {
  if (a === b) return true;
  if (a.length >= 6 && lev(a, b) <= 1) return true;
  return false;
}

/* Alinha a frase esperada com a falada (LCS por palavras).
   Retorna { words: [{ text, ok }], score (0-1), heard } */
export function compare(expected, spokenAlternatives, confidence = 0) {
  const display = String(expected).split(/\s+/).filter(Boolean);
  const exp = display.map((w) => tokenize(w).join(''));
  let best = null;
  for (const alt of spokenAlternatives.filter(Boolean)) {
    const got = tokenize(alt);
    // Tabela LCS
    const m = exp.length, n = got.length;
    const L = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--)
      L[i][j] = wordMatch(exp[i], got[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    // Reconstrói quais palavras esperadas foram encontradas
    const ok = Array(m).fill(false);
    let i = 0, j = 0;
    while (i < m && j < n) {
      if (wordMatch(exp[i], got[j])) { ok[i] = true; i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) i++;
      else j++;
    }
    // Palavras vazias após normalização (ex: "—") contam como certas
    exp.forEach((e, k) => { if (!e) ok[k] = true; });
    const score = ok.filter(Boolean).length / Math.max(1, m);
    if (!best || score > best.score) best = { ok, score, heard: alt };
  }
  if (!best) best = { ok: exp.map(() => false), score: 0, heard: '' };
  return {
    words: display.map((text, k) => ({ text, ok: best.ok[k] })),
    score: best.score,
    heard: best.heard,
    // Confiança baixa com tudo "certo" = passou raspando
    shaky: best.score === 1 && confidence > 0 && confidence < 0.55,
  };
}

/* ---------------- Xilique ---------------- */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const XILIQUE = {
  rude: [
    // 1ª tentativa: bronca leve
    ['Hmm, "{w}" saiu meio torto, hein. Repete só essa palavra.', 'Quase! Mas "{w}" você assassinou de leve. De novo, só ela.', 'Peraí, que porra foi essa no "{w}"? Repete só essa.', 'Caramba, o "{w}" tropeçou. Vai, só ele.'],
    // 2ª: mais irritada
    ['PELO AMOR DE DEUS! É "{w}"! Tenta de novo, devagar!', 'Porra, de novo errou "{w}"! Abre essa boca e fala direito!', 'Meu pai amado... "{w}"! Não é tão difícil, criatura!', 'Eu tô ficando com rugas por causa desse "{w}". Mais uma vez!'],
    // 3ª: desiste com ironia
    ['Tá bom, desisto. "{w}" vai ficar pra próxima encarnação. Bora pra próxima.', 'Ok, você venceu, o "{w}" morreu. Descanse em paz. Próxima!', 'Vou anotar "{w}" na lista das palavras que você massacrou. Seguimos, né.', 'Parabéns, você inventou uma palavra nova. Não é "{w}", mas é sua. Próxima.'],
  ],
  polite: [
    ['Quase! Vamos repetir só a palavra "{w}".', 'Boa tentativa! Repete só "{w}" pra mim?', 'Faltou um pouquinho no "{w}". Mais uma vez?'],
    ['Calma, sem pressa. Fala "{w}" bem devagar.', 'Tenta de novo "{w}", escutando bem o som.', 'Você consegue! "{w}", devagarinho.'],
    ['Tudo bem, essa é difícil mesmo. Vou guardar "{w}" pra revisão. Próxima!', 'Sem problema, a gente treina "{w}" depois. Seguindo!'],
  ],
};
const CELEBRA = {
  rude: ['Tá... foi bom. Não se acostuma.', 'Olha só, até que não foi uma tragédia.', 'Caramba, acertou! Quem é você e o que fez com meu aluno?', 'Ok, admito: ficou bonito. Não conta pra ninguém.', 'Uau. Quase caiu uma lágrima. Mentira. Mas foi bom.'],
  polite: ['Muito bem! Perfeito!', 'Excelente pronúncia!', 'Isso aí, mandou bem!', 'Perfeito, parabéns!'],
};
const RASPANDO = {
  rude: ['Passou raspando, hein. Eu ouvi um sotaque de novela aí.', 'Acertou, mas com a confiança de quem chuta na prova.'],
  polite: ['Acertou! Só capricha um pouco mais na clareza.', 'Certo! Dá pra falar com um pouco mais de confiança.'],
};

export function xiliqueLine(word, attempt, polite) {
  const set = polite ? XILIQUE.polite : XILIQUE.rude;
  return pick(set[Math.min(attempt, 3) - 1]).replaceAll('{w}', word);
}
export function celebrateLine(polite, shaky = false) {
  return pick((shaky ? RASPANDO : CELEBRA)[polite ? 'polite' : 'rude']);
}
