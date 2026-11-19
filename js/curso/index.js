/* ==========================================================
   curso/index.js — curso FIXO (funciona offline).
   Cada unidade tem um arquivo: js/curso/<unidade>.js (ex.: A1-U1.js)
   com as 6 aulas e a prova da unidade; a prova final do nível fica em
   js/curso/<nível>-final.js (ex.: A1-final.js).
   Se o arquivo não existir, o app cai na IA (como antes).
   ========================================================== */
const arquivos = {};
function arquivo(nome) {
  if (!(nome in arquivos)) arquivos[nome] = import(`./${nome}.js`).then((m) => m.default).catch(() => null);
  return arquivos[nome];
}

const embaralha = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
/* Mistura as alternativas e as peças de "ordenar" (nunca deixa as peças já na ordem certa). */
function mistura(it) {
  const c = { ...it, opcoes: [...(it.opcoes || [])] };
  if (c.tipo === 'escolha') c.opcoes = embaralha(c.opcoes);
  if (c.tipo === 'ordenar' && c.opcoes.length > 1) {
    let t = 0;
    do { c.opcoes = embaralha(c.opcoes); t++; } while (c.opcoes.join(' ') === it.resposta && t < 8);
  }
  return c;
}

/* Aula fixa pronta para o motor de aula (mesmo formato da IA). */
export async function aulaFixa(lessonId, educado) {
  const u = await arquivo(lessonId.split('-').slice(0, 2).join('-'));
  const a = u?.aulas?.[lessonId];
  if (!a) return null;
  return {
    fixo: true,
    intro: educado ? a.intro_educado || a.intro : a.intro,
    vocab: a.vocab, explicacao: a.explicacao, exemplos: a.exemplos, fala: a.fala,
    pratica: a.pratica.map(mistura),
    quiz: embaralha(a.quiz).map(mistura),
  };
}

/* Prova fixa: id da unidade (A1-U1) ou "A1-final". */
export async function provaFixa(id, educado) {
  const final = id.endsWith('-final');
  const u = await arquivo(id);
  const p = final ? u : u?.prova;
  if (!p) return null;
  // Escuta e leitura primeiro (como na prova da IA), o resto misturado.
  const ordem = { escuta: 0, leitura: 1 };
  const itens = embaralha(p.itens).sort((a, b) => (ordem[a.habilidade] ?? 2) - (ordem[b.habilidade] ?? 2)).map(mistura);
  return {
    fixo: true,
    abertura: educado ? p.abertura_educado || p.abertura : p.abertura,
    texto_leitura: p.texto_leitura, itens, escrita: p.escrita, fala: p.fala,
  };
}

/* ---------- correção da escrita sem IA ----------
   Cada tarefa fixa traz: modelo (resposta exemplo), chaves (grupos de palavras;
   basta uma de cada grupo aparecer) e min (mínimo de palavras). */
const PT = new Set(['eu', 'meu', 'minha', 'você', 'voce', 'ele', 'ela', 'não', 'nao', 'sim', 'é', 'e', 'de', 'do', 'da', 'que', 'com', 'para', 'pra', 'um', 'uma', 'tenho', 'sou', 'estou', 'nome', 'anos', 'gosto', 'moro', 'tem', 'muito', 'mas', 'também', 'tambem', 'quando', 'onde', 'porque']);
const palavras = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’‘`]/g, "'").match(/[a-z']+/g) || [];

export function corrigeEscrita(tarefas, educado) {
  return tarefas.map((t) => {
    const w = palavras(t.answer);
    if (!w.length) return { nota: 0, correcao: t.modelo || '', exemplo: true, comentario: educado ? 'Resposta em branco. Veja um exemplo acima.' : 'Deixou em branco, porra? Olha o exemplo aí em cima.' };
    const pt = w.filter((x) => PT.has(x)).length / w.length;
    if (pt > 0.3) return { nota: 0, correcao: t.modelo || '', exemplo: true, comentario: educado ? 'A resposta precisa ser em inglês.' : 'Escreveu em português, caralho? A prova é de INGLÊS.' };
    const chaves = t.chaves || [];
    const tem = (g) => g.some((k) => (k.includes(' ') ? ` ${w.join(' ')} `.includes(` ${k.toLowerCase()} `) : w.includes(k.toLowerCase())));
    const faltam = chaves.filter((g) => !tem(g));
    const parteChaves = chaves.length ? (chaves.length - faltam.length) / chaves.length : 1;
    const parteTamanho = Math.min(1, w.length / (t.min || 8));
    const nota = Math.round((parteChaves * 7 + parteTamanho * 3) * 10) / 10;
    const falta = faltam.map((g) => `"${g[0]}"`).join(', ');
    const comentario = nota >= 9
      ? (educado ? 'Muito bem! Atendeu a tudo que foi pedido.' : 'Mandou bem pra caralho! Tá tudo aí.')
      : faltam.length
        ? (educado ? `Faltou usar: ${falta}.` : `Faltou usar ${falta}, seu animal. Compara com o exemplo.`)
        : (educado ? 'Escreva um pouco mais para a nota máxima.' : 'Tá certo, mas curto pra cacete. Escreve mais.');
    return { nota, correcao: t.modelo || '', comentario, exemplo: true };
  });
}
