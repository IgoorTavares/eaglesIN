/* ==========================================================
   voice.js — voz nativa do navegador (grátis)
   - SpeechRecognition (fala → texto) em en-US
   - speechSynthesis (texto → fala) em en-US e pt-BR
   ========================================================== */

import { modoOuvir } from './sessao-audio.js';

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const canListen = !!SR;
export const canSpeak = 'speechSynthesis' in window;

let voices = [];
function loadVoices() { voices = canSpeak ? speechSynthesis.getVoices() : []; }
if (canSpeak) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

/* Vozes "de efeito" do iPhone/Mac (sinos, robôs, sussurro...): não servem para aula. */
const NOVELTY = /^(albert|bad news|bahh|bells|boing|bolhas|bubbles|cellos|celos|wobble|fred|good news|jester|junior|kathy|organ|pipe organ|ralph|superstar|trinoids|whisper|zarvox|deranged|hysterical|princess|sinos|violoncelos|órgão|sussurro|boas notícias|más notícias)\b/i;
const IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/* Lista vozes de um idioma, melhores primeiro (Google/Natural/Premium soam melhor). */
export function listVoices(lang = 'en-US') {
  const prefix = lang.slice(0, 2).toLowerCase();
  const score = (v) =>
    (v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase() ? 10 : 0) +
    (/natural|neural|premium|enhanced/i.test(v.name) ? 6 : 0) +
    (/google/i.test(v.name) ? 4 : 0) +
    (/samantha|aria|jenny|ava|allison|zira/i.test(v.name) ? 2 : 0) +
    (v.localService ? 0 : 1);
  return voices.filter((v) => v.lang.toLowerCase().startsWith(prefix) && !NOVELTY.test(v.name)).sort((a, b) => score(b) - score(a));
}

/* Nomes comuns de vozes masculinas (para o professor Mario). */
const MALE = /\b(male|guy|david|mark|daniel|alex|fred|aaron|arthur|george|james|ryan|christopher|eric|roger|steffan|andrew|brian|antonio|felipe|ricardo|humberto)\b/i;
function pickVoice(lang, preferredURI, male) {
  const list = listVoices(lang);
  return list.find((v) => v.voiceURI === preferredURI) || (male && list.find((v) => MALE.test(v.name))) || list[0] || null;
}

/* iPhone (principalmente no app instalado na tela inicial): a voz do aparelho só toca depois
   de uma fala iniciada DENTRO de um toque. No 1º toque na tela, fala um texto mudo para destravar. */
let falaDestravada = false;
function destravaFala() {
  if (falaDestravada || !canSpeak) return;
  falaDestravada = true;
  try { if (speechSynthesis.paused) speechSynthesis.resume(); const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.rate = 2; speechSynthesis.speak(u); } catch {}
  loadVoices();
}
addEventListener('pointerdown', destravaFala, { passive: true });
addEventListener('touchend', destravaFala, { passive: true });

/* Se a voz não começar (2 falas seguidas), mostra uma dica uma vez por sessão em vez de ficar mudo. */
let semVozSeguidas = 0, dicaVozMostrada = false;
function dicaSemVoz() {
  if (dicaVozMostrada) return;
  dicaVozMostrada = true;
  const d = document.createElement('div');
  d.setAttribute('role', 'status');
  d.style.cssText = 'position:fixed;left:12px;right:12px;top:calc(12px + env(safe-area-inset-top));z-index:99998;background:#14231a;color:#fff;border-radius:14px;padding:12px 14px;font-size:.9rem;line-height:1.4;box-shadow:0 8px 24px rgba(0,0,0,.3)';
  d.innerHTML = '🔇 <b>A voz não tocou.</b> Toque na tela uma vez, aumente o volume e confira se o iPhone não está no modo silencioso.';
  d.addEventListener('click', () => d.remove());
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 7000);
}

/* Fala um texto. Retorna uma Promise resolvida no fim da fala.
   opts: { lang, rate, voiceURI, onStart } */
export function speak(text, opts = {}) {
  return new Promise((resolve) => {
    if (!canSpeak || !text) return resolve();
    try { if (speechSynthesis.paused) speechSynthesis.resume(); } catch {}
    const u = new SpeechSynthesisUtterance(text);
    const lang = opts.lang || 'en-US';
    u.lang = lang;
    u.rate = Math.min(1.5, Math.max(0.5, opts.rate || 1));
    const v = pickVoice(lang, lang.startsWith('en') ? opts.voiceURI : opts.voiceURIpt, opts.male);
    if (v) u.voice = v;
    // Sem voz masculina instalada: engrossa um pouco a voz disponível.
    if (opts.male && v && !MALE.test(v.name)) u.pitch = 0.7;
    let done = false, comecou = false, cortada = false;
    const finish = () => { if (!done) { done = true; clearInterval(keepAlive); resolve(); } };
    u.onstart = () => { comecou = true; semVozSeguidas = 0; opts.onStart?.(); };
    u.onend = finish;
    u.onerror = (e) => { if (e?.error === 'interrupted' || e?.error === 'canceled') cortada = true; finish(); };
    // Depois do 1º toque, se a fala nem começou em 3 s (2 vezes seguidas), avisa em vez de ficar mudo.
    setTimeout(() => { if (!comecou && !cortada && falaDestravada && ++semVozSeguidas >= 2) dicaSemVoz(); }, 3000);
    // Chrome no computador corta falas longas após ~15s; esse "cutucão" evita isso.
    // No iPhone ele atrapalha (pausa e às vezes não volta), então fica desligado lá.
    const keepAlive = IOS ? 0 : setInterval(() => { if (speechSynthesis.speaking) { speechSynthesis.pause(); speechSynthesis.resume(); } }, 10000);
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

/* ---------- permissão do microfone ----------
   Pede a permissão do aparelho no toque do botão (getUserMedia mostra o aviso do sistema),
   libera o microfone na hora e guarda que deu certo nesta sessão. Se estiver bloqueado,
   mostra o passo a passo para liberar. Nunca grava nada aqui: o áudio é descartado. */
let micLiberado = false;
export async function garantirMic() {
  if (micLiberado) return { ok: true };
  if (!window.isSecureContext) return { ok: false, motivo: 'https' };
  if (!navigator.mediaDevices?.getUserMedia) return { ok: false, motivo: 'semsuporte' };
  try {
    const st = await navigator.permissions?.query({ name: 'microphone' });
    if (st?.state === 'denied') return { ok: false, motivo: 'negado' };
  } catch {} // Safari antigo não tem permissions.query: segue para o pedido
  const solta = modoOuvir(); // iPhone: sem isso o pedido de permissão nem aparece
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    s.getTracks().forEach((t) => t.stop());
    micLiberado = true;
    return { ok: true };
  } catch (e) {
    const n = e?.name || '';
    ultimoErro = `${n || 'Erro'}${e?.message ? ': ' + e.message : ''}`.slice(0, 160);
    if (n === 'NotAllowedError' || n === 'SecurityError' || n === 'PermissionDeniedError') return { ok: false, motivo: 'negado' };
    if (n === 'NotFoundError' || n === 'OverconstrainedError' || n === 'DevicesNotFoundError') return { ok: false, motivo: 'semmic' };
    if (n === 'NotReadableError' || n === 'TrackStartError') return { ok: false, motivo: 'ocupado' };
    return { ok: false, motivo: 'erro', detalhe: ultimoErro };
  } finally { solta(); }
}
let ultimoErro = '';

const ANDROID = /Android/i.test(navigator.userAgent);
const AJUDA = {
  negado: {
    t: 'Libere o microfone',
    p: IOS
      ? ['Abra os <b>Ajustes</b> do iPhone → <b>Apps</b> → <b>Safari</b> → <b>Microfone</b> e escolha <b>Perguntar</b> ou <b>Permitir</b>.', 'No Safari, toque no ícone à esquerda do endereço → <b>Ajustes do Site</b> → <b>Microfone: Permitir</b>.', 'Confira <b>Ajustes → Geral → Teclado → Ditado</b> ligado (o reconhecimento de voz depende dele).', 'Volte, toque em <b>Pedir permissão de novo</b> e depois no microfone.']
      : ANDROID
        ? ['Toque no <b>cadeado</b> ao lado do endereço (ou nos 3 pontinhos → <b>Informações do site</b>).', 'Em <b>Permissões</b>, ative o <b>Microfone</b>.', 'Se instalou o app, segure o ícone → <b>Informações do app</b> → <b>Permissões</b> → <b>Microfone</b> → Permitir.', 'Volte e toque no microfone de novo.']
        : ['Clique no <b>cadeado</b> (ou no ícone de microfone riscado) ao lado do endereço.', 'Em <b>Microfone</b>, escolha <b>Permitir</b>.', 'Recarregue a página e toque no microfone de novo.'],
  },
  servico: {
    t: 'Ative o reconhecimento de voz',
    p: IOS
      ? ['Abra os <b>Ajustes</b> do iPhone → <b>Geral</b> → <b>Teclado</b>.', 'Ative <b>Ditado</b> (o reconhecimento de voz do Safari depende dele).', 'Confira também <b>Ajustes → Tempo de Uso → Restrições</b>: Siri e Ditado precisam estar liberados.', 'Volte ao app e toque no microfone de novo.']
      : ['O navegador bloqueou o serviço de reconhecimento de voz.', 'Use o <b>Chrome</b> (ou o Safari no iPhone) com internet.', 'Confira se o microfone está liberado para este site.'],
  },
  semmic: { t: 'Nenhum microfone encontrado', p: ['Conecte um fone com microfone ou use o celular.', 'Confira se o microfone não está desativado no sistema.'] },
  ocupado: { t: 'O microfone está ocupado', p: ['Outro app (ligação, gravador, videochamada) está usando o microfone.', 'Feche esse app e toque no microfone de novo.'] },
  https: { t: 'O microfone precisa de conexão segura', p: ['Abra o app pelo endereço com <b>https://</b>.'] },
  semsuporte: { t: 'Este navegador não ouve', p: ['Use o <b>Chrome</b> no Android/computador ou o <b>Safari</b> no iPhone.', 'Enquanto isso, responda tocando ou digitando.'] },
  erro: { t: 'O microfone não respondeu', p: ['Feche e abra o app de novo.', 'Se continuar, reinicie o navegador.'] },
};
/* Mostra o passo a passo (funciona no app clássico e no jogo: estilos próprios, sem depender do CSS da página). */
export function mostraAjudaMic(motivo, detalhe = motivo === 'erro' ? ultimoErro : '') {
  const a = AJUDA[motivo] || AJUDA.erro;
  document.getElementById('ajudaMic')?.remove();
  const d = document.createElement('div');
  d.id = 'ajudaMic';
  d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', a.t);
  d.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.45);padding:16px;font-family:inherit';
  d.innerHTML = `<div style="background:#fff;color:#14231a;max-width:440px;width:100%;border-radius:20px;padding:20px 18px 16px;box-shadow:0 12px 40px rgba(0,0,0,.3);margin-bottom:env(safe-area-inset-bottom)">
    <div style="font-size:28px;line-height:1">🎙️</div>
    <h2 style="margin:8px 0 10px;font-size:1.15rem">${a.t}</h2>
    <ol style="margin:0 0 10px;padding-left:20px;line-height:1.5;font-size:.95rem">${a.p.map((x) => `<li style="margin-bottom:4px">${x}</li>`).join('')}</ol>
    ${detalhe ? `<p style="margin:0 0 12px;font-size:.75rem;color:#5b6b63;word-break:break-word">Detalhe técnico: ${String(detalhe).replace(/[<>&]/g, '')}</p>` : ''}
    <p data-status style="margin:0 0 10px;font-size:.9rem;font-weight:600;color:#15803d" hidden></p>
    <div style="display:flex;gap:8px">
      <button type="button" data-tenta style="flex:1;border:0;border-radius:14px;padding:12px;background:#16a34a;color:#fff;font-weight:700;font-size:1rem">Pedir permissão de novo</button>
      <button type="button" data-fecha style="border:1px solid #cbd5d1;border-radius:14px;padding:12px 16px;background:#fff;color:#14231a;font-weight:600">Fechar</button>
    </div></div>`;
  const fecha = () => d.remove();
  d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-fecha]')) fecha(); });
  const status = d.querySelector('[data-status]'), tenta = d.querySelector('[data-tenta]');
  tenta.addEventListener('click', async () => {
    // Este toque É o gesto do usuário: o iPhone mostra o pedido de permissão aqui.
    micLiberado = false;
    tenta.disabled = true; tenta.textContent = 'Pedindo…';
    const r = await garantirMic();
    if (r.ok) {
      status.hidden = false; status.textContent = '✅ Microfone liberado! Feche e toque no microfone para falar.';
      tenta.textContent = 'Fechar'; tenta.disabled = false; tenta.onclick = fecha;
    } else mostraAjudaMic(r.motivo, r.detalhe);
  });
  document.body.appendChild(d);
}

/* Compara o que foi dito com as frases esperadas: true quando todas as palavras de alguma
   delas já apareceram (assim a escuta para na hora, sem esperar o silêncio). */
const soPalavras = (s) => String(s || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').split(/\s+/).filter(Boolean);
function cobre(dito, alvo) {
  const d = soPalavras(dito), a = soPalavras(alvo);
  if (!a.length || d.length < a.length * 0.8) return false;
  let j = 0;
  for (const w of d) if (j < a.length && w === a[j]) j++;
  return j >= Math.ceil(a.length * 0.9);
}

/* Escuta uma frase. Retorna Promise<{ text, confidence, alternatives }>.
   onInterim(texto) recebe o texto parcial em tempo real.
   alvos: frases esperadas; se o aluno já disse uma delas, devolve NA HORA (resposta imediata). */
let current = null;
export function listen({ onInterim, lang = 'en-US', alvos = [] } = {}) {
  if (!SR) return Promise.reject(new Error('unsupported'));
  stopSpeaking();
  // IMPORTANTE: nada de "await" antes do start(). O reconhecimento começa no MESMO toque do botão;
  // é isso que faz o iPhone/Chrome mostrarem o pedido de permissão do microfone.
  return new Promise((resolve, reject) => {
    const solta = modoOuvir(); // iPhone: modo que permite o microfone (volta ao normal no fim)
    const rec = new SR();
    current = rec;
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 3;
    let finalText = '', confidence = 0, alternatives = [], pronto = false;
    const termina = (res) => { if (pronto) return; pronto = true; current = null; micLiberado = true; solta(); resolve(res); };
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
      const agora = (finalText + ' ' + interim).trim();
      onInterim?.(agora);
      // Já disse a frase esperada: responde sem esperar o fim do silêncio.
      // Se ela é o começo de outra opção mais longa ("Yes" / "Yes, please"), espera o fim normal.
      const achou = alvos.length ? alvos.filter((a) => cobre(agora, a)) : [];
      const comecoDeOutra = (a) => { const w = soPalavras(a); return alvos.some((b) => { const v = soPalavras(b); return v.length > w.length && w.every((x, k) => v[k] === x); }); };
      if (achou.some((a) => !comecoDeOutra(a))) {
        termina({ text: agora, confidence: confidence || 0.9, alternatives: alternatives.length ? alternatives : [agora] });
        try { rec.abort(); } catch {}
      }
    };
    rec.onerror = (e) => {
      if (pronto) return;
      current = null; pronto = true; solta();
      const err = e.error || 'error';
      if (err === 'not-allowed') mostraAjudaMic('negado', 'not-allowed');
      else if (err === 'service-not-allowed') mostraAjudaMic('servico', 'service-not-allowed'); // iPhone: Ditado desligado
      else if (err === 'audio-capture') mostraAjudaMic('semmic', 'audio-capture');
      reject(new Error(err));
    };
    rec.onend = () => termina({ text: finalText.trim(), confidence, alternatives });
    try { rec.start(); } catch (err) { pronto = true; current = null; solta(); ultimoErro = `${err?.name || 'Erro'}: ${err?.message || ''}`; mostraAjudaMic('erro'); reject(new Error('mic-erro')); }
  });
}
export function stopListening() { try { current?.stop(); } catch {} }
export function isListening() { return !!current; }

/* Mensagens amigáveis para erros do reconhecimento. */
export function listenErrorMsg(err) {
  const m = String(err?.message || err);
  // Permissão/serviço: o passo a passo já apareceu na tela (mostraAjudaMic).
  if (m.startsWith('mic-') || m === 'not-allowed' || m === 'service-not-allowed' || m === 'audio-capture') return '';
  if (m === 'no-speech') return 'Não ouvi nada. Fala mais perto do microfone!';
  if (m === 'audio-capture') return 'Nenhum microfone encontrado.';
  if (m === 'network') return 'O reconhecimento de voz precisa de internet.';
  if (m === 'aborted') return '';
  if (m === 'unsupported') return 'Seu navegador não suporta reconhecimento de voz. Use o chat por texto.';
  return 'Erro no microfone: ' + m;
}
