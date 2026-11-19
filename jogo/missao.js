/* ==========================================================
   missao.js — Missão do Pavio: conversa livre com um personagem,
   sem roteiro, feita pelo Gemini (a chave é a do app).
   O NPC responde em inglês; o Pavio comenta em português e corrige.
   Até 6 falas do aluno. Premia moedas uma vez por dia por mundo.
   ========================================================== */
import * as voz from '../js/voice.js';
import { missaoTurno, AIError } from '../js/ai.js';
import { dayKey } from '../js/store.js';
import { $, esc, sfx, vibra, Pavio, POSES, falar, calar, chuvaDeMoedas, ICO } from './nucleo.js';
import { CENAS } from './cenas2.js';
import { NPCS } from './personagens.js';
import { FASES } from './fases.js';
import * as sv from './salvar.js';
import { hudHTML, atualizaHud } from './telas.js';

// Ponto de troca para testes (permite simular a IA sem gastar cota).
export const ia = { turno: missaoTurno };

const MAX_FALAS = 6;

/* 3 missões por mundo. cena = id da parada (cenário + personagem). */
export const MISSOES = {
  aeroporto: [
    { cena: 'cafe', titulo: 'Café antes do voo', objetivo: 'Peça uma bebida e algo para comer, pergunte o preço e pague.', papel: 'a friendly barista at an airport coffee shop', abre: 'Hi there! What can I get for you today?' },
    { cena: 'checkin', titulo: 'Check-in sem roteiro', objetivo: 'Diga para onde vai, entregue o passaporte e peça um assento na janela.', papel: 'an airline check-in agent', abre: 'Good morning! Where are you flying today?' },
    { cena: 'aviao', titulo: 'Serviço de bordo', objetivo: 'Peça uma bebida, um cobertor e pergunte quanto tempo falta.', papel: 'a flight attendant on a long flight', abre: 'Hello! Can I get you anything to drink?' },
  ],
  cidade: [
    { cena: 'hotel', titulo: 'Recepção do hotel', objetivo: 'Faça o check-in, pergunte a senha do wi-fi e o horário do café da manhã.', papel: 'a hotel receptionist in New York', abre: 'Welcome to the Grand Hotel! Do you have a reservation?' },
    { cena: 'direcoes', titulo: 'Perdido na rua', objetivo: 'Peça direções para o museu e compre um cachorro-quente.', papel: 'a talkative hot dog vendor on a New York street', abre: 'Hey buddy! Hot dog? Best in town!' },
    { cena: 'taxi', titulo: 'Corrida de táxi', objetivo: 'Diga o endereço, pergunte o preço e quanto tempo demora.', papel: 'a grumpy New York taxi driver', abre: 'Yeah, where to?' },
  ],
  restaurante: [
    { cena: 'pedido', titulo: 'Jantar completo', objetivo: 'Peça entrada, prato principal e bebida. Avise que tem alergia a algo.', papel: 'a waiter at a nice restaurant', abre: 'Good evening! Are you ready to order, or do you need a few more minutes?' },
    { cena: 'reclamacao', titulo: 'Prato errado', objetivo: 'Reclame com educação: o prato veio errado e frio. Peça uma solução.', papel: 'a waiter who made a mistake with the order', abre: 'Here you go! Enjoy your meal.' },
    { cena: 'loja', titulo: 'Compras', objetivo: 'Procure uma jaqueta, pergunte o tamanho, o preço e peça desconto.', papel: 'a shop assistant at a clothing store', abre: 'Hi! Are you looking for anything in particular?' },
  ],
  trabalho: [
    { cena: 'entrevista', titulo: 'Entrevista de emprego', objetivo: 'Fale da sua experiência, dos seus pontos fortes e por que quer a vaga.', papel: 'a recruiter interviewing a candidate for a job', abre: 'Thanks for coming in. So, tell me a little about yourself.' },
    { cena: 'reuniao', titulo: 'Prazo atrasado', objetivo: 'Explique por que o projeto atrasou e proponha uma nova data.', papel: 'a coworker worried about a project deadline', abre: 'Hey, the client is asking about the project. Are we on schedule?' },
    { cena: 'promocao', titulo: 'Pedir aumento', objetivo: 'Convença o chefe a te dar um aumento com bons argumentos.', papel: 'a demanding but fair boss', abre: 'You wanted to see me? I have five minutes.' },
  ],
  social: [
    { cena: 'festa', titulo: 'Papo na festa', objetivo: 'Puxe assunto, conte de onde você é e descubra algo sobre a pessoa.', papel: 'the host of a house party', abre: 'Hey! I don\'t think we\'ve met. How do you know everyone here?' },
    { cena: 'encontro', titulo: 'Primeiro encontro', objetivo: 'Converse, faça perguntas e convide para um segundo encontro.', papel: 'Sam, on a first date at a restaurant', abre: 'So... this place is nice. Do you come here often?' },
    { cena: 'sogro', titulo: 'O sogro de novo', objetivo: 'Convença o sogro de que você tem planos sérios para o futuro.', papel: 'a skeptical, protective father-in-law at a family dinner', abre: 'So. What exactly are your plans for the future, young one?' },
  ],
};

/* Missão do dia: muda todo dia, mas é a mesma o dia inteiro. */
export function missaoDoDia(mundoId) {
  const s = dayKey() + mundoId;
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % MISSOES[mundoId].length;
}

function prompt(M, X, nomeNpc) {
  return `You run a speaking mission in a language-learning game for a Brazilian learner of English (level ${M.cefr}).
You play TWO roles and answer ONLY in JSON:
1) "fala": the NPC — ${X.papel}, named "${nomeNpc}". Speak natural English adapted to ${M.cefr} (short sentences for A1/A2). Max 2 sentences. Stay in character, react to what the learner said and keep the scene moving toward the goal.
2) "pavio": Professor Pavio, a short, HOSTILE, acid, foul-mouthed Brazilian English teacher. One or two short sentences in Brazilian Portuguese, very informal, with heavy comic profanity in almost every sentence (porra, caralho, puta que pariu, cacete, merda, desgraça, vai tomar no cu) and harsh sarcastic roasting of the learner's English ("seu jumento", "cabeça de bagre", "anta"). Praise comes sour and grudging. Never target appearance, family, race, gender, sexuality, religion, disability or health; never slurs. Never translate the NPC line here.
Other fields:
- "traducao": the NPC line translated to Brazilian Portuguese.
- "pose": Pavio's mood, one of: alegre, debochado, bravo, surpreso, pensando, impaciente, decepcionado, raivoso.
- "correcao": if the learner's last English message had a real mistake, {"errado": short wrong part, "certo": corrected sentence}; otherwise null. If they wrote in Portuguese, set certo to how to say it in English.
- "terminou": true when the learner has accomplished the goal or the scene reached a natural end.
- "nota": 0 to 10, overall performance so far (grammar, vocabulary, accomplishing the goal, effort).
LEARNER'S GOAL (in Portuguese): ${X.objetivo}
The learner has at most ${MAX_FALAS} messages. When a user message starts with "[ÚLTIMA FALA]", wrap up the scene politely, set terminou=true and give the final nota.`;
}

export function telaMissao(app, M, nav) {
  calar();
  let idx = missaoDoDia(M.id);
  let fechado = false;
  const fim = () => { fechado = true; ro?.disconnect(); calar(); voz.stopListening(); };
  let ro = null;

  function monta() {
    const X = MISSOES[M.id][idx];
    const npcId = FASES[X.cena]?.npc;
    const nomeNpc = NPCS[npcId]?.nome || 'Personagem';
    const msgs = [{ role: 'ai', text: X.abre, data: { fala: X.abre } }];
    let falas = 0, nota = 0, ocupado = false, acabou = false;
    const inicio = Date.now();
    ro?.disconnect();
    app.innerHTML = `
    <section class="tela fase missao-tela">
      <div class="cena">${(CENAS[X.cena] || CENAS.checkin)()}</div>
      <header class="topo fase-topo">
        <button class="btn-x" id="sair" aria-label="Sair da missão">✕</button>
        <div class="gal-titulo"><small>Missão do Pavio · ${esc(M.nome)}</small><b>${esc(X.titulo)}</b></div>
        ${hudHTML(true)}
      </header>
      <div class="pavio-palco grande" id="pv"></div>
      <div class="painel" id="caixa"><div class="balao balao-npc" id="balaoNpc" hidden></div><div class="balao balao-pavio" id="balaoPv" hidden></div><div id="painel"></div></div>
    </section>`;
    const pavio = new Pavio($('#pv'));
    const tela = $('.missao-tela', app), caixa = $('#caixa'), painel = $('#painel'), balaoNpc = $('#balaoNpc'), balaoPv = $('#balaoPv');
    ro = new ResizeObserver(() => tela.style.setProperty('--ph', caixa.offsetHeight + 'px'));
    ro.observe(caixa);
    const sobe = () => { caixa.classList.remove('sobe'); void caixa.offsetWidth; caixa.classList.add('sobe'); };
    const vivo = () => !fechado && document.body.contains(tela);
    const pavioDiz = (t, pose) => { if (pose) pavio.pose(pose); return falar('pavio', t, { lang: 'pt-BR', balao: balaoPv }); };
    $('#sair').onclick = () => { sfx('toque'); fim(); nav.mapa(M.id); };

    const premiada = sv.missaoPremiada(M.id);
    painel.innerHTML = `<div class="missao-card">
      <small>Seu objetivo</small><p>${esc(X.objetivo)}</p>
      <ul><li>Conversa livre, em inglês, com ${esc(nomeNpc)}</li><li>Até ${MAX_FALAS} falas suas — fale no microfone ou digite</li>
      <li>${premiada ? 'Já premiada hoje: agora é só treino' : 'Recompensa de hoje: até <b>60 moedas</b> e 30 XP'}</li></ul>
      <div class="fim-botoes"><button class="btn-jogar" id="comeca">Começar</button><button class="btn-sec" id="outra">Outra missão</button></div>
    </div>`;
    sobe();
    $('#outra').onclick = () => { sfx('toque'); calar(); idx = (idx + 1) % MISSOES[M.id].length; monta(); };
    $('#comeca').onclick = () => { sfx('toque'); calar(); comeca(); };
    pavio.pose('debochado', false); pavio.acao('pulo');
    pavioDiz(`Missão sem roteiro, meu querido. Aqui não tem resposta pronta: ${X.objetivo.charAt(0).toLowerCase() + X.objetivo.slice(1)} Se vira, porra!`, 'debochado');

    function mostraNpc(fala, traducao) {
      balaoNpc.innerHTML = `<span class="quem">${esc(nomeNpc)}</span><p class="en">${esc(fala)}</p>${traducao ? `<p class="pt" hidden>${esc(traducao)}</p>` : ''}
        <div class="balao-acoes"><button class="mini-btn" id="ouvir">Ouvir de novo</button>${traducao ? '<button class="mini-btn" id="traduzir">Traduzir</button>' : ''}</div>`;
      balaoNpc.hidden = false; balaoNpc.classList.remove('entra'); void balaoNpc.offsetWidth; balaoNpc.classList.add('entra');
      $('#ouvir', balaoNpc).onclick = () => { calar(); falar('npc', fala); };
      const tr = $('#traduzir', balaoNpc);
      if (tr) tr.onclick = () => { const p = $('.pt', balaoNpc); p.hidden = !p.hidden; tr.textContent = p.hidden ? 'Traduzir' : 'Esconder'; };
      return falar('npc', fala);
    }

    function entrada() {
      painel.innerHTML = `<div class="missao-entrada">
          ${voz.canListen ? '<button class="btn-mic" id="mic" aria-label="Responder falando"><span class="ico-mic"></span></button>' : ''}
          <input id="txt" type="text" placeholder="Responda em inglês…" autocomplete="off" autocapitalize="sentences" enterkeyhint="send" maxlength="240">
          <button class="btn-enviar" id="enviar" aria-label="Enviar">${ICO.enviar}</button>
        </div>
        <p class="missao-conta"><span>Fala ${falas + 1} de ${MAX_FALAS}</span><button class="link-btn" id="encerra">Encerrar missão</button></p>`;
      sobe();
      const txt = $('#txt');
      const manda = () => { const t = txt.value.trim(); if (t) envia(t); };
      $('#enviar').onclick = manda;
      txt.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); manda(); } };
      $('#encerra').onclick = () => { if (falas) resultado(); else { fim(); nav.mapa(M.id); } };
      const mic = $('#mic');
      if (mic) mic.onclick = async () => {
        if (voz.isListening()) { voz.stopListening(); return; }
        calar(); mic.classList.add('ouvindo'); pavio.pose('escutando');
        txt.placeholder = 'Ouvindo… fale em inglês';
        let r = '';
        try { r = await voz.listen({ lang: 'en-US' }); } catch { r = ''; }
        if (!vivo()) return;
        mic.classList.remove('ouvindo'); txt.placeholder = 'Responda em inglês…';
        const dito = typeof r === 'string' ? r : r?.text || '';
        if (!dito) return pavioDiz('Não ouvi porra nenhuma. Fala de novo ou digita aí.', 'pensando');
        envia(dito, true);
      };
    }

    async function comeca() {
      balaoPv.hidden = true; painel.innerHTML = '';
      pavio.pose('escutando');
      await mostraNpc(X.abre, '');
      if (!vivo()) return;
      pavio.pose('neutro');
      entrada();
    }

    async function envia(texto, falado = false) {
      if (ocupado || acabou) return;
      ocupado = true; calar();
      falas++;
      const ultima = falas >= MAX_FALAS;
      msgs.push({ role: 'user', text: (ultima ? '[ÚLTIMA FALA] ' : '') + texto });
      balaoPv.hidden = true;
      painel.innerHTML = `<div class="missao-voce"><small>Você${falado ? ' (falando)' : ''}</small><p>${esc(texto)}</p></div><p class="missao-pensando"><i></i><i></i><i></i></p>`;
      sobe();
      pavio.pose('pensando');
      let r;
      try {
        r = await ia.turno(prompt(M, X, nomeNpc), msgs);
      } catch (e) {
        msgs.pop(); falas--; ocupado = false;
        if (!vivo()) return;
        return erroIA(e, texto);
      }
      if (!vivo()) return;
      msgs.push({ role: 'ai', text: r.fala, data: r });
      nota = r.nota;
      const pose = POSES.includes(r.pose) ? r.pose : 'debochado';
      if (r.correcao) { sfx('erro'); vibra(40); } else sfx('certo');
      await mostraNpc(r.fala, r.traducao);
      if (!vivo()) return;
      const corr = r.correcao ? `<span class="porque">${r.correcao.errado ? `Você: <s>${esc(r.correcao.errado)}</s><br>` : ''}Melhor: <b>${esc(r.correcao.certo)}</b></span>` : '';
      const pv = pavioDiz(esc(r.pavio || (r.correcao ? 'Quase, porra.' : 'Isso aí, caralho!')) + corr, pose);
      pavio.acao(r.correcao ? 'treme' : 'pulo');
      ocupado = false;
      if (r.terminou || ultima) { acabou = true; await pv; if (vivo()) resultado(); return; }
      entrada();
    }

    function erroIA(e, texto) {
      const semChave = e instanceof AIError && ['nokey', 'badkey'].includes(e.kind);
      pavio.pose(semChave ? 'impaciente' : 'cansado');
      painel.innerHTML = `<div class="missao-erro">
        <p>${esc(e?.message || 'A IA não respondeu.')}</p>
        ${semChave ? '<p class="modal-txt">A missão usa a chave do Gemini do app (gratuita no Google AI Studio). Cole a chave nas configurações do app e volte aqui.</p>' : ''}
        <div class="fim-botoes">${semChave ? '<a class="btn-jogar" href="../index.html#settings">Abrir configurações do app</a>' : '<button class="btn-jogar" id="deNovo">Tentar de novo</button>'}<button class="btn-sec" id="mapa">Voltar ao mapa</button></div></div>`;
      sobe();
      $('#mapa', painel).onclick = () => { fim(); nav.mapa(M.id); };
      const dn = $('#deNovo', painel);
      if (dn) dn.onclick = () => envia(texto);
      pavioDiz(semChave ? 'Sem a chave do Gemini eu não consigo inventar conversa, meu querido. Vai lá nas configurações e cola ela, porra.' : 'Deu pau na internet ou no Gemini, caralho. Tenta de novo.');
    }

    async function resultado() {
      acabou = true; calar();
      const segundos = (Date.now() - inicio) / 1000;
      const res = sv.registraMissao(M.id, nota, segundos);
      const est = nota >= 8 ? 3 : nota >= 5 ? 2 : 1;
      balaoNpc.hidden = true; sfx('vitoria');
      pavio.pose(est === 3 ? 'alegre' : est === 2 ? 'debochado' : 'cansado'); pavio.acao('pulo');
      painel.innerHTML = `<div class="fim"><small>Missão concluída</small><h3>${esc(X.titulo)}</h3>
        <div class="estrelas-grandes">${[1, 2, 3].map((k) => `<i class="est ${k <= est ? 'on' : ''}" style="animation-delay:${k * 0.25}s"></i>`).join('')}</div>
        <p class="missao-nota">Nota do Pavio: <b>${nota.toFixed(nota % 1 ? 1 : 0)}</b> de 10</p>
        <div class="ganhos">${res.premiou ? `<span><span class="ico-moeda"></span> +${res.moedas}</span><span>XP +30</span>` : '<span>Treino (prêmio de hoje já pego)</span>'}</div>
        ${res.metaBatida ? '<p class="fim-meta">Meta do dia batida! Combustível reabastecido.</p>' : ''}
        <div class="fim-botoes"><button class="btn-jogar" id="mapa">Voltar ao mapa</button><button class="btn-sec" id="outra">Outra missão</button></div></div>`;
      sobe();
      if (res.moedas) { chuvaDeMoedas(Math.min(20, Math.round(res.moedas / 3)), $('.ganhos', painel)); setTimeout(atualizaHud, 900); }
      $('#mapa', painel).onclick = () => { sfx('toque'); fim(); nav.mapa(M.id); };
      $('#outra', painel).onclick = () => { sfx('toque'); calar(); idx = (idx + 1) % MISSOES[M.id].length; monta(); };
      const fala = est === 3 ? 'Puta que pariu, conversou igual gringo! Tô orgulhoso, caralho.' : est === 2 ? 'Deu pro gasto. Teve umas merdas no meio, mas o gringo te entendeu, porra.' : 'Sobreviveu, mas foi feio, hein. Amanhã tem outra, e eu quero ver melhora, porra.';
      await pavioDiz(fala + (res.metaBatida ? ' E bateu a meta do dia!' : ''));
    }
  }

  monta();
  return fim;
}
