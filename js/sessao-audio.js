/* ==========================================================
   sessao-audio.js — modo de áudio do iPhone (navigator.audioSession, Safari 16.4+).
   - 'playback': só tocar (ignora a chave de silencioso). BLOQUEIA o microfone.
   - 'play-and-record': tocar e ouvir (necessário para o microfone funcionar).
   - 'auto': o sistema decide (padrão; não atrapalha a voz do aparelho).
   Antes o app deixava 'playback' fixo desde a abertura: o iPhone recusava o
   microfone sem nem mostrar o pedido de permissão. Agora cada uso pede o seu modo
   e devolve para 'auto' quando termina. Em outros aparelhos não faz nada.
   ========================================================== */
const S = navigator.audioSession;
let ouvindo = 0, tocando = 0;
function aplica() {
  if (!S) return;
  const tipo = ouvindo ? 'play-and-record' : tocando ? 'playback' : 'auto';
  try { if (S.type !== tipo) S.type = tipo; } catch {}
}
/* Microfone: chame antes de começar a ouvir; a função devolvida encerra (pode chamar 2×). */
export function modoOuvir() {
  ouvindo++; aplica();
  let fim = false;
  return () => { if (fim) return; fim = true; ouvindo = Math.max(0, ouvindo - 1); aplica(); };
}
/* Player de áudio (voz natural / ElevenLabs): tocar mesmo com o silencioso ligado. */
export function modoTocar() {
  tocando++; aplica();
  let fim = false;
  return () => { if (fim) return; fim = true; tocando = Math.max(0, tocando - 1); aplica(); };
}
aplica(); // garante 'auto' ao abrir (desfaz o 'playback' fixo das versões antigas)
