/* ==========================================================
   voice.js — voz nativa do navegador (grátis)
   - SpeechRecognition (fala → texto) em en-US
   - speechSynthesis (texto → fala) em en-US e pt-BR
   ========================================================== */

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const canListen = !!SR;
export const canSpeak = 'speechSynthesis' in window;

let voices = [];
function loadVoices() { voices = canSpeak ? speechSynthesis.getVoices() : []; }
if (canSpeak) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

/* Lista vozes de um idioma, melhores primeiro (Google/Natural/Premium soam melhor). */
export function listVoices(lang = 'en-US') {
  const prefix = lang.slice(0, 2).toLowerCase();
  const score = (v) =>
    (v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase() ? 10 : 0) +
    (/natural|neural|premium|enhanced/i.test(v.name) ? 6 : 0) +
    (/google/i.test(v.name) ? 4 : 0) +
    (/samantha|aria|jenny|ava|allison|zira/i.test(v.name) ? 2 : 0) +
    (v.localService ? 0 : 1);
  return voices.filter((v) => v.lang.toLowerCase().startsWith(prefix)).sort((a, b) => score(b) - score(a));
}

/* Nomes comuns de vozes masculinas (para o professor Mario). */
const MALE = /\b(male|guy|david|mark|daniel|alex|fred|aaron|arthur|george|james|ryan|christopher|eric|roger|steffan|andrew|brian|antonio|felipe|ricardo|humberto)\b/i;
function pickVoice(lang, preferredURI, male) {
  const list = listVoices(lang);
  return list.find((v) => v.voiceURI === preferredURI) || (male && list.find((v) => MALE.test(v.name))) || list[0] || null;
}

/* Fala um texto. Retorna uma Promise resolvida no fim da fala.
   opts: { lang, rate, voiceURI, onStart } */
export function speak(text, opts = {}) {
  return new Promise((resolve) => {
    if (!canSpeak || !text) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    const lang = opts.lang || 'en-US';
    u.lang = lang;
    u.rate = Math.min(1.5, Math.max(0.5, opts.rate || 1));
    const v = pickVoice(lang, lang.startsWith('en') ? opts.voiceURI : '', opts.male);
    if (v) u.voice = v;
    // Sem voz masculina instalada: engrossa um pouco a voz disponível.
    if (opts.male && v && !MALE.test(v.name)) u.pitch = 0.7;
    let done = false;
    const finish = () => { if (!done) { done = true; clearInterval(keepAlive); resolve(); } };
    u.onstart = () => opts.onStart?.();
    u.onend = finish;
    u.onerror = finish;
    // Chrome corta falas longas após ~15s; esse "cutucão" evita isso.
    const keepAlive = setInterval(() => { if (speechSynthesis.speaking) { speechSynthesis.pause(); speechSynthesis.resume(); } }, 10000);
    speechSynthesis.speak(u);
    // Garantia: se o evento de fim nunca vier, libera depois de um tempo proporcional.
    setTimeout(finish, 2000 + text.length * 120 / u.rate);
  });
}

/* Fala uma sequência [{text, lang}] em ordem. */
export async function speakSeq(parts, opts = {}) {
  for (const p of parts) await speak(p.text, { ...opts, lang: p.lang || 'en-US' });
}

export function stopSpeaking() { if (canSpeak) speechSynthesis.cancel(); }
export function isSpeaking() { return canSpeak && speechSynthesis.speaking; }

/* Escuta uma frase. Retorna Promise<{ text, confidence, alternatives }>.
   onInterim(texto) recebe o texto parcial em tempo real. */
let current = null;
export function listen({ onInterim, lang = 'en-US' } = {}) {
  return new Promise((resolve, reject) => {
    if (!SR) return reject(new Error('unsupported'));
    stopSpeaking();
    const rec = new SR();
    current = rec;
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 3;
    let finalText = '', confidence = 0, alternatives = [];
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finalText += r[0].transcript;
          confidence = r[0].confidence || confidence;
          alternatives = Array.from(r).map((a) => a.transcript);
        } else interim += r[0].transcript;
      }
      onInterim?.((finalText + ' ' + interim).trim());
    };
    rec.onerror = (e) => { current = null; reject(new Error(e.error || 'error')); };
    rec.onend = () => { current = null; resolve({ text: finalText.trim(), confidence, alternatives }); };
    try { rec.start(); } catch (err) { reject(err); }
  });
}
export function stopListening() { try { current?.stop(); } catch {} }
export function isListening() { return !!current; }

/* Mensagens amigáveis para erros do reconhecimento. */
export function listenErrorMsg(err) {
  const m = String(err?.message || err);
  if (m === 'not-allowed' || m === 'service-not-allowed') return 'Permissão do microfone negada. Libere nas configurações do navegador.';
  if (m === 'no-speech') return 'Não ouvi nada. Fala mais perto do microfone!';
  if (m === 'audio-capture') return 'Nenhum microfone encontrado.';
  if (m === 'network') return 'O reconhecimento de voz precisa de internet.';
  if (m === 'aborted') return '';
  if (m === 'unsupported') return 'Seu navegador não suporta reconhecimento de voz. Use o chat por texto.';
  return 'Erro no microfone: ' + m;
}
