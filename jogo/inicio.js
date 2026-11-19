/* ==========================================================
   inicio.js — tela "Início" (painel do dia), redesign 2026-11.
   Saudação do Pavio, ofensiva da semana, nível e XP, moedas /
   XP / estrelas, meta do dia com o baú, missão do dia e o mundo
   atual. Tudo vem dos dados que o app e o jogo já guardam.
   ========================================================== */
import { state as appState, today, goalSeconds, lastDays } from '../js/store.js';
import { $, esc, sfx, falar, calar, Pavio, pick } from './nucleo.js';
import { abreConfig, abreBau } from './telas.js';
import { MUNDOS, mundo } from './mundos.js';
import { MISSOES, missaoDoDia } from './missao.js';
import * as sv from './salvar.js';
import * as FALAS from '../js/falas-pavio.js';

const fmt = (n) => Number(n || 0).toLocaleString('pt-BR');

/* Ícones coloridos (os gradientes ficam no sprite do jogo/index.html). */
const ic = (id, cls = '') => `<svg class="ini-ico ${cls}" aria-hidden="true"><use href="#g-${id}"/></svg>`;

/* Saudação do Pavio pela hora do dia (no Modo educado, sem palavrão). */
const SAUDACOES = {
  madrugada: ['Acordado ainda, seu imbecil?', 'Três da manhã e você aqui? Puta que pariu, que dedicação.', 'Vai dormir, arrombado. ...Tá, uma fase e cama.'],
  manha: ['Bom dia, seu otário! Vamos estudar?', 'Bom dia, fdp. Demorou, mas entrou, hein?!', 'Bom dia, seu merda. Café tomado? Então bora.'],
  tarde: ['Boa tarde, arrombado! Bora estudar?', 'Boa tarde, seu animal. Achei que tinha fugido.', 'Boa tarde, imbecil. Senta aí que hoje tem.'],
  noite: ['Boa noite, caralho!', 'Boa noite, seu otário. Lembrou que existe inglês?', 'Boa noite, fdp. Uma fase antes de dormir, vai.'],
};
const EDUCADO = { madrugada: 'Acordado ainda?', manha: 'Bom dia!', tarde: 'Boa tarde!', noite: 'Boa noite!' };
function saudacao(metaOk) {
  const h = new Date().getHours();
  const p = h < 5 ? 'madrugada' : h < 12 ? 'manha' : h < 18 ? 'tarde' : 'noite';
  // Metade das vezes a saudação da hora, metade uma do roteiro do Pavio.
  const oi = appState.settings?.polite ? EDUCADO[p] : Math.random() < 0.5 ? pick(SAUDACOES[p]) : pick(FALAS.SAUDACOES);
  const sub = metaOk
    ? pick(['Meta de hoje batida. Milagre, porra.', 'Já estudou hoje. Quer mais? Tô aqui.', 'Meta feita, seu animal. Agora não amolece.'])
    : pick(['Bora subir de nível ou vai enrolar de novo?', 'O inglês não vai se aprender sozinho, caralho.', 'Cinco minutinhos. Não morre ninguém.']);
  return { oi, sub };
}

function falaDoPavio({ faltaMin, metaOk, dias, bau }) {
  if (bau) return 'Tem baú fechado aí, mané. Abre logo que é moeda de graça, porra!';
  if (metaOk) return dias > 1 ? `${dias} dias seguidos. Tô quase orgulhoso. Quase.` : 'Bateu a meta hoje. Amanhã eu quero de novo, hein.';
  if (faltaMin <= 3) return `Faltam ${faltaMin || 1} minutinho${faltaMin > 1 ? 's' : ''} pra meta, preguiçoso. Até minha avó já tinha terminado, porra!`;
  return pick([
    `Faltam ${faltaMin} minutos pra meta de hoje. Bora, que eu não tenho o dia todo.`,
    'Olha esse painel. Lindo, né? Agora joga, caralho.',
    'Fica aí só olhando os números. Clássico. Vai jogar!',
    ...FALAS.ESPONTANEAS,
  ]);
}

export function telaInicio(app, nav) {
  calar();
  const M = mundo(appState.jogo.mundoAtual);
  const t = today(), meta = goalSeconds();
  const metaMin = Math.max(1, Math.round(meta / 60)), feitoMin = Math.min(metaMin, Math.floor(t.seconds / 60));
  const metaOk = !!t.goalMet, faltaMin = Math.max(0, metaMin - feitoMin);
  const dias = sv.streak();
  const { lvl, into, need } = sv.userLevel(sv.xpTotal());
  const estTotal = MUNDOS.reduce((a, m) => a + sv.estrelasDoMundo(m), 0);
  const estM = sv.estrelasDoMundo(M), maxM = M.nos.length * 3;
  const bau = sv.bauDisponivel();
  const missaoOk = estM > 0;
  const mis = (MISSOES[M.id] || [])[missaoDoDia(M.id)];
  const missaoFeita = sv.missaoPremiada(M.id);
  const proxNo = M.nos.find((n, k) => sv.faseLiberada(M, k) && !sv.estrelas(n.id));
  const { oi, sub } = saudacao(metaOk);

  const semana = lastDays(7).map((d) => {
    const cls = d.met ? 'feito' : d.isToday ? 'hoje' : d.planned ? 'perdeu' : 'folga';
    const dentro = d.met ? '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : d.isToday ? ic('fogo', 'mini') : '';
    return `<div><span>${d.label}</span><i class="${cls}" title="${d.date}${d.met ? ': meta batida' : ''}">${dentro}</i></div>`;
  }).join('');

  app.innerHTML = `
  <section class="tela inicio">
    <div class="ini-rolo">
      <header class="ini-topo">
        <div class="ini-marca"><img src="../icons/pavio-marca.png" alt=""><div><b>EaglesIn</b><small>INGLÊS COM O PAVIO</small></div></div>
        <a class="ini-pilula" href="#loja" aria-label="Moedas: ${fmt(sv.moedas())}. Abrir a loja">${ic('moeda')}<b id="nMoedas">${fmt(sv.moedas())}</b></a>
        <button class="ini-quad" id="cfg" aria-label="Configurações"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.3a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.6a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.3a2 2 0 0 1 1 1.7v.2a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.6a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.3a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>
      </header>

      <section class="ini-card ini-hero">
        <svg class="ini-brilho" style="left:56%;top:16px"><use href="#g-brilho"/></svg>
        <svg class="ini-brilho" style="left:46%;bottom:58px;animation-delay:.8s;width:10px;height:10px"><use href="#g-brilho"/></svg>
        <svg class="ini-brilho" style="right:24px;top:14px;animation-delay:1.4s"><use href="#g-brilho"/></svg>
        <h2 class="${oi.length > 38 ? 'longa' : ''}">${esc(oi)}</h2>
        <p>${esc(sub)}</p>
        <button class="ini-btn-branco" id="continuar">${proxNo ? 'Continuar a viagem' : 'Ver o mapa'}</button>
        <img src="sprites/pavio-alegre.webp" alt="Professor Pavio">
      </section>

      <section class="ini-card ini-ofensiva" aria-label="Ofensiva: ${dias} dias seguidos">
        <div class="ini-of-num"><div>${ic('fogo', 'chama')}<b>${dias}</b></div><span>${dias === 1 ? 'dia seguido' : 'dias seguidos'}</span></div>
        <div class="ini-semana">${semana}</div>
      </section>

      <section class="ini-card ini-nivel">
        <div class="ini-hexa"><svg viewBox="0 0 84 92" aria-hidden="true"><path d="M42 3 79 24v44L42 89 5 68V24z" fill="rgba(255,255,255,.12)" stroke="#86EFAC" stroke-width="3"/><path d="M42 12 71 28.5v35L42 80 13 63.5v-35z" fill="url(#gHexa)"/></svg><span>Nível<b>${lvl}</b></span></div>
        <div class="ini-nivel-info">
          <b>${fmt(into)} / ${fmt(need)} XP</b>
          <div class="ini-barra"><i data-w="${Math.round((into / need) * 100)}%"></i></div>
          <span>Faltam ${fmt(need - into)} XP pro nível ${lvl + 1}</span>
        </div>
        <a class="ini-presente" href="#loja" aria-label="Loja do Pavio">${ic('presente')}</a>
      </section>

      <section class="ini-stats">
        <a class="ini-stat" href="#loja">${ic('moeda')}<b>${fmt(sv.moedas())}</b><span>Moedas</span></a>
        <div class="ini-stat">${ic('xp')}<b>${fmt(sv.xpTotal())}</b><span>XP total</span></div>
        <a class="ini-stat" href="#mundos">${ic('estrela')}<b>${fmt(estTotal)}</b><span>Estrelas</span></a>
      </section>

      <section class="ini-card ini-meta">
        <div class="ini-meta-esq">
          <div class="ini-meta-topo"><h3>Meta do dia</h3><span class="ini-etiqueta ${metaOk ? 'ok' : ''}">${metaOk ? 'Feita!' : `${feitoMin}/${metaMin} min`}</span></div>
          <div class="ini-mut">${metaOk ? 'Bateu a meta de hoje. Respeito.' : `Estude ${metaMin} minutos hoje`}</div>
          <div class="ini-barra verde"><i data-w="${Math.round((feitoMin / metaMin) * 100)}%"></i></div>
        </div>
        <button class="ini-bau ${bau ? 'fechado' : 'aberto'}" id="bau" aria-label="${bau ? 'Abrir o baú do dia' : 'Baú do dia já aberto'}" ${bau ? '' : 'disabled'}>
          ${ic('bau')}<small>${bau ? 'Abrir!' : 'Amanhã tem'}</small>
        </button>
      </section>

      <section class="ini-card ini-missao ${missaoOk ? '' : 'trancada'}">
        <h3>Missão do dia ${missaoFeita ? '<span class="ini-feita">✓ feita</span>' : ''}</h3>
        <p>${missaoOk && mis ? esc(mis.titulo) + ': ' + esc(mis.objetivo) : `Passe a primeira parada de ${esc(M.nome)} pra liberar as missões, porra.`}</p>
        <button class="ini-btn-branco" id="missao">${missaoOk ? (missaoFeita ? 'Treinar de novo' : 'Encarar missão') : 'Ir pro mapa'}</button>
        ${ic('trofeu', 'ini-trofeu')}
      </section>

      <button class="ini-card ini-mundo" id="mundo" style="--c1:${M.cor[0]};--c2:${M.cor[1]}">
        <span class="ini-mundo-num">${M.num}</span>
        <span class="ini-mundo-txt"><small>Mundo ${M.num} · ${M.cefr}</small><b>${esc(M.nome)}</b>
          <span class="ini-barra fina"><i data-w="${maxM ? Math.round((estM / maxM) * 100) : 0}%"></i></span>
          <span class="ini-mut">${estM} de ${maxM} estrelas${proxNo ? ' · próxima: ' + esc(proxNo.nome) : ''}</span></span>
        <svg class="ini-seta" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="ini-link" id="todos">Ver todos os mundos</button>

      <section class="ini-dica">
        <div class="pavio-palco ini-pavio" id="pv"></div>
        <div class="balao balao-pavio ini-fala" id="balaoPv" hidden></div>
      </section>
    </div>
  </section>`;

  // barras enchem depois da entrada
  setTimeout(() => app.querySelectorAll('.inicio [data-w]').forEach((b) => (b.style.width = b.dataset.w)), 120);

  const pavio = new Pavio($('#pv'));
  const balao = $('#balaoPv');
  $('#cfg').onclick = () => { sfx('toque'); abreConfig(app); };
  $('#continuar').onclick = () => { sfx('toque'); nav.mapa(M.id); };
  $('#mundo').onclick = () => { sfx('toque'); nav.mapa(M.id); };
  $('#todos').onclick = () => { sfx('toque'); nav.mundos(); };
  $('#missao').onclick = () => { sfx('toque'); missaoOk ? nav.missao(M.id) : nav.mapa(M.id); };
  const bauBtn = $('#bau');
  if (bau) bauBtn.onclick = () => abreBau(app, () => {
    bauBtn.disabled = true; bauBtn.className = 'ini-bau aberto';
    bauBtn.querySelector('small').textContent = 'Amanhã tem';
    const v = fmt(sv.moedas());
    app.querySelectorAll('#nMoedas, .ini-stat:first-child b').forEach((el) => (el.textContent = v));
    pavio.pose('alegre'); pavio.acao('pulo');
  });

  pavio.pose(metaOk ? 'alegre' : 'debochado', false);
  falar('pavio', falaDoPavio({ faltaMin, metaOk, dias, bau }), { lang: 'pt-BR', balao }).then((fim) => fim && pavio.pose('neutro'));
}
