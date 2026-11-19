/* ==========================================================
   vozgemini.js — voz natural gerada pelo Gemini (TTS).
   Usa a MESMA chave do Gemini do app (fica só no aparelho).
   - Cada fala é guardada no aparelho (Cache Storage): repetir uma
     fala não gasta cota de novo, nem em outro dia.
   - Se der erro ou acabar a cota, quem chama volta para a voz do
     aparelho e a voz do Gemini descansa por um tempo.
   ========================================================== */
import { state } from './store.js';
import { playURL } from './eleven.js';

const API = 'https://generativelanguage.googleapis.com/v1beta/interactions';
// O "lite" é o mais rápido; os outros entram se ele não estiver disponível.
const MODELOS = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts', 'gemini-3.1-flash-tts-preview'];
let modeloOk = null;

/* Vozes: o Pavio tem voz própria; atendentes e personagens usam outra. */
export const VOZES = {
  pavio: { voz: 'Fenrir', pt: 'Brazilian Portuguese from São Paulo, a funny, energetic, sarcastic teacher talking to a friend; natural and expressive, never robotic', en: 'clear American English, a Brazilian teacher modeling the sentence slowly and naturally' },
  npc: { voz: 'Kore', pt: 'natural Brazilian Portuguese', en: 'natural, friendly American English at a relaxed conversational pace, like a real person' },
};

export class VozError extends Error { constructor(kind, msg) { super(msg); this.kind = kind; } }

const CACHE = 'voz-gemini-v1';
let pausaAte = 0; // depois de erro de cota/servidor, descansa e usa a voz do aparelho
export const vozGeminiPronta = () => !!state.settings.apiKey?.trim() && state.settings.vozGemini !== false && Date.now() > pausaAte && navigator.onLine !== false;

const memoria = new Map(); // chave -> objectURL (nesta sessão)
const chaveDe = (quem, lang, texto) => `${quem}|${lang}|${texto}`;
async function hash(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].slice(0, 16).map((x) => x.toString(16).padStart(2, '0')).join('');
}

/* Procura o áudio (base64) na resposta, onde quer que ele venha. */
function achaAudio(o) {
  let achado = null;
  const anda = (x) => {
    if (!x || typeof x !== 'object') return;
    if (Array.isArray(x)) return x.forEach(anda);
    if (typeof x.data === 'string' && x.data.length > 200 && (x.type === 'audio' || /audio/.test(x.mime_type || x.mimeType || ''))) achado = { data: x.data, mime: x.mime_type || x.mimeType || 'audio/wav' };
    if (x.inlineData?.data) achado = { data: x.inlineData.data, mime: x.inlineData.mimeType || 'audio/wav' };
    Object.values(x).forEach(anda);
  };
  anda(o);
  return achado;
}

/* PCM cru (L16) vira WAV, caso venha sem cabeçalho. */
function pcmParaWav(bytes, rate = 24000) {
  const b = new ArrayBuffer(44 + bytes.length), v = new DataView(b);
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + bytes.length, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, 'data'); v.setUint32(40, bytes.length, true); new Uint8Array(b, 44).set(bytes);
  return new Blob([b], { type: 'audio/wav' });
}

async function chamaModelo(modelo, texto, quem, lang) {
  const V = VOZES[quem] || VOZES.npc;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  let res;
  try {
    res = await fetch(API, {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': state.settings.apiKey.trim() },
      body: JSON.stringify({
        model: modelo,
        input: [{ type: 'user_input', content: [{ type: 'text', text: texto, annotations: [{ type: 'speech_metadata', style: lang.startsWith('pt') ? V.pt : V.en }] }] }],
        response_format: { type: 'audio' },
        generation_config: { speech_config: [{ voice: V.voz }] },
      }),
    });
  } catch (e) {
    throw new VozError(e.name === 'AbortError' ? 'timeout' : 'offline', 'A voz do Gemini não respondeu.');
  } finally { clearTimeout(t); }
  if (!res.ok) {
    let msg = ''; try { const j = await res.json(); msg = (Array.isArray(j) ? j[0] : j)?.error?.message || ''; } catch {}
    // 400/404: modelo ou formato não aceito -> tenta o próximo da lista
    if (res.status === 404 || res.status === 400) throw new VozError('model', `Modelo ${modelo}: ${msg.slice(0, 120)}`);
    if (res.status === 429) throw new VozError('quota', 'A cota de voz do Gemini acabou por agora.');
    if (res.status === 401 || res.status === 403) throw new VozError('badkey', `A chave do Gemini foi recusada: ${msg.slice(0, 120)}`);
    throw new VozError('http', `Voz do Gemini: erro ${res.status}. ${msg.slice(0, 120)}`);
  }
  const a = achaAudio(await res.json());
  if (!a) throw new VozError('vazio', 'O Gemini não mandou áudio.');
  const bytes = Uint8Array.from(atob(a.data), (c) => c.charCodeAt(0));
  const ehWav = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46; // "RIFF"
  return ehWav ? new Blob([bytes], { type: 'audio/wav' }) : pcmParaWav(bytes);
}

/* Formato antigo (generateContent), para quando o novo (interactions) não aceitar o pedido. */
const MODELOS_GC = ['gemini-3.1-flash-tts-preview', 'gemini-2.5-flash-preview-tts'];
async function chamaModeloGC(modelo, texto, quem, lang) {
  const V = VOZES[quem] || VOZES.npc;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  let res;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': state.settings.apiKey.trim() },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `Speak as ${lang.startsWith('pt') ? V.pt : V.en}: ${texto}` }] }],
        generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: V.voz } } } },
      }),
    });
  } catch (e) {
    throw new VozError(e.name === 'AbortError' ? 'timeout' : 'offline', 'A voz do Gemini não respondeu.');
  } finally { clearTimeout(t); }
  if (!res.ok) {
    let msg = ''; try { const j = await res.json(); msg = (Array.isArray(j) ? j[0] : j)?.error?.message || ''; } catch {}
    if (res.status === 404 || res.status === 400) throw new VozError('model', `Modelo ${modelo}: ${msg.slice(0, 120)}`);
    if (res.status === 429) throw new VozError('quota', 'A cota de voz do Gemini acabou por agora.');
    if (res.status === 401 || res.status === 403) throw new VozError('badkey', `A chave do Gemini foi recusada: ${msg.slice(0, 120)}`);
    throw new VozError('http', `Voz do Gemini: erro ${res.status}. ${msg.slice(0, 120)}`);
  }
  const a = achaAudio(await res.json());
  if (!a) throw new VozError('vazio', 'O Gemini não mandou áudio.');
  const bytes = Uint8Array.from(atob(a.data), (c) => c.charCodeAt(0));
  const rate = +(/rate=(\d+)/.exec(a.mime)?.[1] || 24000);
  return bytes[0] === 0x52 && bytes[1] === 0x49 ? new Blob([bytes], { type: 'audio/wav' }) : pcmParaWav(bytes, rate);
}
// Lista de tentativas: [função, modelo]. A que funcionar primeiro fica guardada.
const TENTATIVAS = [...MODELOS.map((m) => [chamaModelo, m]), ...MODELOS_GC.map((m) => [chamaModeloGC, m])];

/* Gera (ou pega do cache) o áudio de uma fala. Devolve um objectURL. */
export async function audioDe(texto, { quem = 'npc', lang = 'en-US' } = {}) {
  const k = chaveDe(quem, lang, texto);
  if (memoria.has(k)) return memoria.get(k);
  const pedido = (async () => {
    const reqKey = new Request(`${location.origin}/__voz-gemini/${await hash(k + (VOZES[quem] || VOZES.npc).voz)}.wav`);
    let cache = null;
    try { cache = await caches.open(CACHE); const r = await cache.match(reqKey); if (r) return URL.createObjectURL(await r.blob()); } catch {}
    let blob, erro;
    for (const tent of modeloOk ? [modeloOk] : TENTATIVAS) {
      try { blob = await tent[0](tent[1], texto, quem, lang); modeloOk = tent; break; }
      catch (e) { erro = e; if (!['model', 'vazio'].includes(e.kind)) break; }
    }
    if (!blob) {
      // cota/servidor: descansa 10 min; chave recusada: descansa até recarregar
      if (['quota', 'http', 'model', 'vazio'].includes(erro?.kind)) pausaAte = Date.now() + 10 * 60 * 1000;
      if (erro?.kind === 'badkey') pausaAte = Infinity;
      throw erro || new VozError('http', 'Falhou a voz do Gemini.');
    }
    try { await cache?.put(reqKey, new Response(blob, { headers: { 'Content-Type': 'audio/wav' } })); } catch {}
    return URL.createObjectURL(blob);
  })();
  memoria.set(k, pedido);
  pedido.catch(() => memoria.delete(k));
  return pedido;
}

/* Botão "Testar voz natural": tenta de novo mesmo se estava descansando e conta o que houve. */
export async function testaVoz() {
  if (!state.settings.apiKey?.trim()) return { ok: false, msg: 'Falta a chave do Gemini nas configurações do app.' };
  pausaAte = 0; modeloOk = null;
  const frase = 'Fala, meu querido! Agora eu tenho voz de gente, porra!';
  memoria.delete(chaveDe('pavio', 'pt-BR', frase));
  try {
    const t0 = performance.now();
    await falaGemini(frase, { quem: 'pavio', lang: 'pt-BR' });
    return { ok: true, msg: `Voz natural funcionando (${modeloOk?.[1] || 'Gemini'}, ${((performance.now() - t0) / 1000).toFixed(1)} s).` };
  } catch (e) { return { ok: false, msg: e.message || 'Não deu certo.' }; }
}

/* Já deixa uma fala pronta (ex.: a resposta do atendente), sem tocar. */
export function prepara(texto, opts) { if (vozGeminiPronta() && texto) audioDe(texto, opts).catch(() => {}); }

/* Fala com a voz do Gemini. Rejeita com VozError se não deu (quem chama usa a voz do aparelho). */
export async function falaGemini(texto, { quem = 'npc', lang = 'en-US', rate = 1, alive } = {}) {
  const url = await audioDe(texto, { quem, lang });
  if (alive && !alive()) return;
  return playURL(url, { rate });
}
