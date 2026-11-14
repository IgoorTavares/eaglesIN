/* ==========================================================
   ai.js — chamadas ao Google Gemini direto do navegador.
   A chave fica só no localStorage do seu aparelho.
   Se um modelo estiver lento, sobrecarregado ou sem cota,
   o app tenta o próximo da lista automaticamente.
   ========================================================== */
import { state } from './store.js';
import { REPLY_SCHEMA, SUMMARY_SCHEMA, JUDGE_SCHEMA, JUDGE_PROMPT, AUDIO_INSTRUCTION, LESSON_SCHEMA, EXAM_SCHEMA, WRITING_SCHEMA } from './prompts.js';

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';

/* Ordem de tentativa (o modelo das Configurações vem primeiro). */
/* O "lite" responde em ~2s (medido), ideal para conversa por voz. */
export const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const FALLBACKS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
let preferred = null; // último modelo que respondeu bem nesta sessão

export class AIError extends Error {
  constructor(kind, message, next = false) { super(message); this.kind = kind; this.next = next; }
}

/* Converte o histórico do app para o formato do Gemini.
   messages: [{ role: 'user'|'ai', text, data }] */
function toContents(messages) {
  const contents = [];
  for (const m of messages) {
    if (m.role !== 'user' && m.role !== 'ai') continue;
    const role = m.role === 'user' ? 'user' : 'model';
    const text = m.role === 'ai' ? JSON.stringify(m.data || { fala: m.text }) : m.text;
    // O Gemini exige alternância; junta mensagens seguidas do mesmo papel.
    const last = contents[contents.length - 1];
    if (last && last.role === role) last.parts.push({ text });
    else contents.push({ role, parts: [{ text }] });
  }
  if (!contents.length || contents[0].role !== 'user') contents.unshift({ role: 'user', parts: [{ text: '(início da conversa)' }] });
  return contents;
}

/* Anexa o áudio do aluno como último turno do usuário. */
function withAudio(contents, audio, instruction) {
  const parts = [{ inlineData: { mimeType: audio.mime, data: audio.b64 } }, { text: instruction }];
  const last = contents[contents.length - 1];
  if (last?.role === 'user') last.parts.push(...parts);
  else contents.push({ role: 'user', parts });
  return contents;
}

/* Modelos "pensantes" ficam lentos; pedimos o mínimo de raciocínio. */
function thinkingFor(model) {
  if (/gemini-2\.5/.test(model)) return { thinkingBudget: 0 };
  if (/lite/.test(model)) return undefined; // os "lite" já são rápidos
  if (/gemini-[3-9]/.test(model)) return { thinkingLevel: 'low' };
  return undefined;
}

async function callModel(model, key, { system, contents, schema, temperature, maxTokens }, timeoutMs) {
  const generationConfig = { temperature, responseMimeType: 'application/json', responseSchema: schema, maxOutputTokens: maxTokens || 2048 };
  const thinkingConfig = thinkingFor(model);
  if (thinkingConfig) generationConfig.thinkingConfig = thinkingConfig;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents,
    generationConfig,
    // Palavrão cômico não deve ser bloqueado; discurso de ódio continua bloqueado.
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(`${BASE}${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') throw new AIError('timeout', 'O Gemini demorou demais pra responder. Tenta de novo.', true);
    throw new AIError('offline', 'Falha de conexão. Confere a internet e tenta de novo.');
  } finally { clearTimeout(timer); }

  if (!res.ok) {
    let msg = '';
    try { msg = (await res.json())?.error?.message || ''; } catch {}
    if (res.status === 429) throw new AIError('quota', 'Limite do plano gratuito do Gemini estourou. Espera um minutinho (ou até amanhã, se for o limite diário).', true);
    if (res.status === 400 && /api key/i.test(msg)) throw new AIError('badkey', 'Chave da API inválida. Confere se copiou certinho nas Configurações.');
    if (res.status === 401 || res.status === 403) throw new AIError('badkey', 'Chave da API recusada (sem permissão). Gere outra no Google AI Studio.');
    if (res.status === 404) throw new AIError('model', `Modelo "${model}" não está disponível. Troque o modelo nas Configurações.`, true);
    if (res.status >= 500) throw new AIError('server', 'O Gemini está sobrecarregado agora. Tenta de novo em instantes.', true);
    throw new AIError('http', `Erro ${res.status}: ${msg.slice(0, 160)}`);
  }

  const data = await res.json();
  const cand = data.candidates?.[0];
  if (!cand) throw new AIError('blocked', 'A resposta foi bloqueada pelo filtro do Gemini. Reformula a frase.');
  return cand.content?.parts?.map((p) => p.text || '').join('') || '';
}

/* Tenta o modelo preferido e cai para os próximos se der lentidão/sobrecarga/cota. */
async function call(opts, timeoutMs = 12000) {
  const key = state.settings.apiKey?.trim();
  if (!key) throw new AIError('nokey', 'Cadê a chave da API, criatura? Vai em Configurações e cola ela lá.');
  if (!navigator.onLine) throw new AIError('offline', 'Sem internet. Preciso de conexão pra pensar.');
  const chain = [...new Set([preferred, state.settings.model, ...FALLBACKS].filter(Boolean))];
  let lastErr;
  for (const model of chain) {
    try {
      const text = await callModel(model, key, opts, timeoutMs);
      preferred = model;
      return text;
    } catch (e) {
      lastErr = e;
      if (!e.next) throw e; // erro que não adianta trocar de modelo (chave, internet...)
      if (preferred === model) preferred = null;
    }
  }
  throw lastErr;
}

/* Extrai JSON mesmo se vier com ```json ... ``` em volta. */
function parseJSON(text) {
  const clean = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const start = clean.indexOf('{'), end = clean.lastIndexOf('}');
  return JSON.parse(clean.slice(start, end + 1));
}

/* Chama e tenta de novo (1x) se o JSON vier quebrado. */
async function callJSON(opts, validate, timeoutMs) {
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const obj = parseJSON(await call({ ...opts, temperature: attempt ? 0.6 : opts.temperature }, timeoutMs));
      if (validate(obj)) return obj;
      lastErr = new AIError('json', 'Resposta incompleta da IA.');
    } catch (e) {
      if (e instanceof AIError) throw e;
      lastErr = new AIError('json', 'A IA respondeu um JSON inválido.');
    }
  }
  throw lastErr;
}

/* Resposta do professor numa conversa. Se "audio" vier, o Gemini ouve a fala
   do aluno, transcreve e avalia a pronúncia na mesma chamada. */
export async function chatReply(system, messages, audio = null) {
  let contents = toContents(messages);
  if (audio) contents = withAudio(contents, audio, AUDIO_INSTRUCTION);
  const obj = await callJSON({ system, contents, schema: REPLY_SCHEMA, temperature: 0.95 }, (o) => typeof o.fala === 'string' && o.fala.length > 0, audio ? 18000 : 12000);
  // Normalização defensiva
  obj.palavras_novas = Array.isArray(obj.palavras_novas) ? obj.palavras_novas.filter((w) => w?.en) : [];
  if (!['neutra', 'feliz', 'irritada', 'chocada', 'orgulhosa', 'debochada', 'decepcionada', 'rindo'].includes(obj.emocao)) obj.emocao = 'neutra';
  if (obj.correcao && !obj.correcao.certo) obj.correcao = null;
  if (obj.pronuncia_suspeita && !obj.pronuncia_suspeita.quis_dizer) obj.pronuncia_suspeita = null;
  obj.fato_aluno = typeof obj.fato_aluno === 'string' ? obj.fato_aluno.trim() : '';
  if (!audio) { obj.transcricao = null; obj.pronuncia = null; }
  if (obj.pronuncia) {
    obj.pronuncia.nota = Math.max(0, Math.min(10, Number(obj.pronuncia.nota) || 0));
    obj.pronuncia.palavras = Array.isArray(obj.pronuncia.palavras) ? obj.pronuncia.palavras.filter((p) => p?.palavra).slice(0, 3) : [];
  }
  return obj;
}

/* Juiz de pronúncia do "Repete depois de mim": compara o áudio com a frase esperada. */
export async function judgePronunciation(expected, audio) {
  const contents = withAudio([], audio, `FRASE ESPERADA: "${expected}"`);
  const obj = await callJSON({ system: JUDGE_PROMPT, contents, schema: JUDGE_SCHEMA, temperature: 0.2 }, (o) => Array.isArray(o.erradas), 15000);
  obj.nota = Math.max(0, Math.min(10, Number(obj.nota) || 0));
  return obj;
}

/* Resumo da sessão. */
export async function sessionSummary(system, messages) {
  const contents = toContents(messages);
  const last = contents[contents.length - 1];
  const ask = { text: 'ENCERRAR SESSÃO: gere o resumo agora.' };
  if (last.role === 'user') last.parts.push(ask); else contents.push({ role: 'user', parts: [ask] });
  return callJSON({ system, contents, schema: SUMMARY_SCHEMA, temperature: 0.6 }, (o) => Array.isArray(o.exercicios), 25000);
}

/* ---------- Currículo: aula, prova e correção de redação ---------- */
const ask = (text) => [{ role: 'user', parts: [{ text }] }];
const validItem = (it) => it && typeof it.pergunta === 'string' && typeof it.resposta === 'string' && it.resposta.trim()
  && (it.tipo !== 'escolha' || (Array.isArray(it.opcoes) && it.opcoes.length >= 2 && it.opcoes.some((o) => o.trim() === it.resposta.trim())));
function cleanItems(list) {
  return (Array.isArray(list) ? list : []).filter(validItem).map((it) => {
    if (it.tipo === 'ordenar') {
      const words = it.resposta.replace(/[.!?]+$/, '').split(/\s+/).filter(Boolean);
      // Embaralha de novo localmente (a IA às vezes manda já em ordem).
      it.opcoes = words.map((w) => [Math.random(), w]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
      it.resposta = words.join(' ');
    }
    if (it.tipo === 'escrever') it.opcoes = [];
    it.aceitas = Array.isArray(it.aceitas) ? it.aceitas : [];
    if (!it.audio) it.audio = null;
    return it;
  });
}

export async function generateLesson(system) {
  const o = await callJSON({ system, contents: ask('Gere a aula agora.'), schema: LESSON_SCHEMA, temperature: 0.7, maxTokens: 8192 },
    (x) => Array.isArray(x.vocab) && x.vocab.length && Array.isArray(x.quiz) && x.quiz.length, 60000);
  o.pratica = cleanItems(o.pratica); o.quiz = cleanItems(o.quiz);
  o.fala = (o.fala || []).filter((f) => f?.en); o.exemplos = (o.exemplos || []).filter((f) => f?.en);
  if (!o.quiz.length) throw new AIError('json', 'A IA mandou uma aula incompleta. Tenta de novo.');
  return o;
}

export async function generateExam(system, minItems = 16) {
  const o = await callJSON({ system, contents: ask('Gere a prova completa agora, com todas as quantidades pedidas.'), schema: EXAM_SCHEMA, temperature: 0.6, maxTokens: 12000 },
    (x) => Array.isArray(x.itens) && x.itens.length >= minItems, 90000);
  o.itens = cleanItems(o.itens);
  o.escrita = (o.escrita || []).filter((e) => e?.pergunta);
  o.fala = (o.fala || []).filter((f) => f?.en);
  return o;
}

export async function gradeWriting(system, tasks) {
  const text = tasks.map((t, i) => `TAREFA ${i + 1}: ${t.pergunta}\nCRITÉRIO: ${t.criterio}\nRESPOSTA DO ALUNO: ${t.answer || '(vazia)'}`).join('\n\n');
  const o = await callJSON({ system, contents: ask(text), schema: WRITING_SCHEMA, temperature: 0.3, maxTokens: 2048 },
    (x) => Array.isArray(x.resultados) && x.resultados.length === tasks.length, 30000);
  o.resultados.forEach((r) => { r.nota = Math.max(0, Math.min(10, Number(r.nota) || 0)); });
  return o.resultados;
}

/* Teste rápido da chave (botão "Testar chave"). Retorna o modelo que respondeu. */
export async function testKey() {
  await call({ system: 'Responda {"ok":true}', contents: [{ role: 'user', parts: [{ text: 'ping' }] }], schema: { type: 'OBJECT', properties: { ok: { type: 'BOOLEAN' } } }, temperature: 0 });
  return preferred;
}
