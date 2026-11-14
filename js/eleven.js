/* ==========================================================
   eleven.js — voz natural do ElevenLabs (opcional).
   Se a chave e a voz estiverem configuradas, o professor fala
   com ela; se faltar cota ou der erro, o app volta sozinho
   para a voz do navegador.
   A chave fica só no localStorage do aparelho.
   ========================================================== */
import { state } from './store.js';

const API = 'https://api.elevenlabs.io/v1';
/* Modelo rápido e barato (metade dos créditos), fala inglês e português. */
export const ELEVEN_MODEL = 'eleven_flash_v2_5';

export class ElevenError extends Error {
  constructor(kind, message) { super(message); this.kind = kind; }
}

const cfg = () => state.settings.eleven || {};
/* Voz do professor: a dele (ex.: Pavio), senão a escolhida nas Configurações. */
export const voiceFor = (teacher) => teacher?.elevenVoice || cfg().voiceId || '';
export const elevenReady = (teacher) => !!(cfg().key && voiceFor(teacher));

/* Um único player, "destravado" no primeiro toque na tela
   (iPhone e Android só deixam tocar áudio depois de um gesto). */
const player = new Audio();
player.preload = 'auto';
let unlocked = false;
const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
addEventListener('pointerdown', () => {
  if (unlocked) return;
  unlocked = true;
  if (!player.src) { player.src = SILENCE; player.play().catch(() => {}); }
}, { passive: true });

/* Cache em memória: "ouvir de novo" não gasta créditos outra vez. */
const cache = new Map(); // chave -> objectURL
const MAX_CACHE = 60;

function errorFor(status, detail) {
  const d = typeof detail === 'string' ? detail : detail?.message || detail?.status || '';
  if (status === 401 && /quota/i.test(JSON.stringify(detail || ''))) return new ElevenError('quota', 'Acabaram os créditos do ElevenLabs neste mês.');
  if (status === 401) return new ElevenError('badkey', 'Chave do ElevenLabs inválida.');
  if (/library voices/i.test(JSON.stringify(detail || ''))) return new ElevenError('voice', 'O plano grátis do ElevenLabs não libera vozes da biblioteca pela API.');
  if (status === 402 || status === 429) return new ElevenError('quota', 'Limite do ElevenLabs atingido.');
  if (status === 404 || status === 400 && /voice/i.test(d)) return new ElevenError('voice', 'Voz do ElevenLabs não encontrada. Escolha outra nas Configurações.');
  return new ElevenError('http', `ElevenLabs respondeu ${status}. ${String(d).slice(0, 120)}`);
}

async function synth(text, lang, voiceId) {
  const { key } = cfg();
  const id = `${voiceId}|${lang}|${text}`;
  if (cache.has(id)) return cache.get(id);
  let res;
  try {
    res = await fetch(`${API}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_64`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': key },
      body: JSON.stringify({
        text,
        model_id: ELEVEN_MODEL,
        language_code: lang.slice(0, 2),            // 'en' ou 'pt'
        voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true },
      }),
    });
  } catch { throw new ElevenError('offline', 'Sem conexão com o ElevenLabs.'); }
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json())?.detail; } catch {}
    throw errorFor(res.status, detail);
  }
  const url = URL.createObjectURL(await res.blob());
  cache.set(id, url);
  if (cache.size > MAX_CACHE) { const [k, old] = cache.entries().next().value; URL.revokeObjectURL(old); cache.delete(k); }
  return url;
}

let stopCurrent = null;
export const isPlaying = () => !!stopCurrent;
export function stop() { stopCurrent?.(); }

/* Fala um texto. Resolve quando termina (ou é interrompido); rejeita com ElevenError
   se não deu para gerar/tocar — quem chama cai para a voz do navegador. */
export async function speak(text, { lang = 'en-US', rate = 1, alive, voiceId = cfg().voiceId } = {}) {
  const url = await synth(text, lang, voiceId);
  if (alive && !alive()) return; // a fala foi cancelada enquanto o áudio era gerado
  stop();
  return new Promise((resolve, reject) => {
    let done = false;
    let guard = setTimeout(() => finish(), 60000); // trava de segurança
    const finish = (err) => {
      if (done) return;
      done = true; stopCurrent = null;
      clearTimeout(guard);
      player.onended = player.onerror = player.onloadedmetadata = null;
      try { player.pause(); } catch {}
      err ? reject(err) : resolve();
    };
    stopCurrent = () => finish();
    player.src = url;
    player.playbackRate = Math.min(1.5, Math.max(0.6, rate)); // velocidade ajustável sem gastar créditos
    player.preservesPitch = true;
    player.onended = () => finish();
    // Se o evento de fim não vier, encerra pela duração do áudio + folga.
    player.onloadedmetadata = () => {
      if (!isFinite(player.duration)) return;
      clearTimeout(guard);
      guard = setTimeout(() => finish(), (player.duration / player.playbackRate) * 1000 + 2000);
    };
    player.onerror =() => finish(new ElevenError('play', 'Não consegui tocar o áudio do ElevenLabs.'));
    player.play().catch(() => finish(new ElevenError('play', 'O navegador bloqueou o áudio. Toque na tela e tente de novo.')));
  });
}

/* Lista as vozes da sua conta (para escolher nas Configurações). */
export async function listVoices(key = cfg().key) {
  let res;
  try { res = await fetch(`${API}/voices`, { headers: { 'xi-api-key': key } }); }
  catch { throw new ElevenError('offline', 'Sem conexão com o ElevenLabs.'); }
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json())?.detail; } catch {}
    throw errorFor(res.status, detail);
  }
  const data = await res.json();
  return (data.voices || []).map((v) => ({
    id: v.voice_id, name: v.name,
    info: [v.labels?.gender, v.labels?.accent, v.category].filter(Boolean).join(' · '),
  }));
}

/* Créditos restantes no mês (pode falhar se a chave não tiver essa permissão). */
export async function creditsLeft(key = cfg().key) {
  try {
    const res = await fetch(`${API}/user/subscription`, { headers: { 'xi-api-key': key } });
    if (!res.ok) return null;
    const s = await res.json();
    return { used: s.character_count, limit: s.character_limit };
  } catch { return null; }
}
