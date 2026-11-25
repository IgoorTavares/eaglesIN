/* ==========================================================
   recorder.js — grava sua voz e devolve um WAV (16 kHz, mono)
   em base64 para o Gemini OUVIR e avaliar a pronúncia.
   Para sozinho quando você para de falar.
   ========================================================== */

import { modoOuvir } from './sessao-audio.js';

const AC = window.AudioContext || window.webkitAudioContext;
export const canRecord = !!(navigator.mediaDevices?.getUserMedia && AC);

let active = null;
export const isRecording = () => !!active;
export function stopRecording() { active?.stop(); }

/* Grava até: silêncio depois da fala, toque no botão (stopRecording) ou tempo máximo.
   Retorna { b64, mime, seconds } ou null se ninguém falou.
   onLevel(0..1) recebe o volume para animar o microfone. */
export async function record({ onLevel, maxMs = 30000, silenceMs = 1500, waitMs = 8000 } = {}) {
  const solta = modoOuvir(); // iPhone: modo que permite o microfone
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
    });
  } catch (e) { solta(); throw e; }
  const ctx = new AC();
  if (ctx.state === 'suspended') await ctx.resume();
  const src = ctx.createMediaStreamSource(stream);
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  const chunks = [];
  const t0 = performance.now();
  let spoke = false, lastVoice = 0, noise = 0.008;

  return new Promise((resolve) => {
    let done = false;
    const finish = async () => {
      if (done) return;
      done = true; active = null;
      try { proc.disconnect(); src.disconnect(); } catch {}
      stream.getTracks().forEach((t) => t.stop());
      solta();
      const rate = ctx.sampleRate;
      try { await ctx.close(); } catch {}
      if (!spoke) return resolve(null);
      const pcm = downsample(concat(chunks), rate, 16000);
      resolve({ b64: toBase64(encodeWav(pcm, 16000)), mime: 'audio/wav', seconds: pcm.length / 16000 });
    };
    active = { stop: finish };
    // Segurança: se o áudio não começar a chegar (aba em segundo plano etc.), encerra sozinho.
    setTimeout(finish, maxMs + 1500);

    proc.onaudioprocess = (e) => {
      const d = e.inputBuffer.getChannelData(0);
      chunks.push(new Float32Array(d));
      let s = 0;
      for (let i = 0; i < d.length; i++) s += d[i] * d[i];
      const rms = Math.sqrt(s / d.length);
      const now = performance.now() - t0;
      if (now < 400) noise = Math.max(noise, rms);           // mede o ruído do ambiente no começo
      const threshold = Math.max(0.018, noise * 2.2);
      if (rms > threshold) { spoke = true; lastVoice = now; }
      onLevel?.(Math.min(1, rms / 0.12));
      if (spoke && now - lastVoice > silenceMs) finish();     // parou de falar
      else if (!spoke && now > waitMs) finish();              // não falou nada
      else if (now > maxMs) finish();                         // limite de segurança
    };
    src.connect(proc);
    proc.connect(ctx.destination); // necessário para o processador rodar (saída é silêncio)
  });
}

function concat(chunks) {
  const out = new Float32Array(chunks.reduce((n, c) => n + c.length, 0));
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

/* Reduz a taxa de amostragem tirando a média dos blocos (suficiente para fala). */
function downsample(data, from, to) {
  if (from <= to) return data;
  const ratio = from / to, out = new Float32Array(Math.floor(data.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const a = Math.floor(i * ratio), b = Math.min(data.length, Math.floor((i + 1) * ratio));
    let s = 0;
    for (let j = a; j < b; j++) s += data[j];
    out[i] = s / Math.max(1, b - a);
  }
  return out;
}

function encodeWav(samples, rate) {
  const buf = new ArrayBuffer(44 + samples.length * 2), v = new DataView(buf);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const x = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
  }
  return buf;
}

function toBase64(buf) {
  const u8 = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(bin);
}
