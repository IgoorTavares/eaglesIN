/* ==========================================================
   fase.js — motor de fase. Lê o roteiro (fases.js) e roda os turnos:
   diálogo (escolher/falar), montar a frase e repetir falando.
   Vida = o PAVIO (estopim) da paciência do professor: cada erro
   queima um pedaço; se queimar tudo, BOOM e a fase recomeça.
   ========================================================== */
import * as voz from '../js/voice.js';
import { TEACHERS } from '../js/prompts.js';
import { $, $$, esc, pick, sleep, embaralha, sfx, vibra, Pavio, ESCADA, falar, calar, parecido, faltando, palavras, chuvaDeMoedas } from './nucleo.js';
import { malaSVG } from './cenas.js';
import { CENAS } from './cenas2.js';
import { NPCS } from './personagens.js';
import * as sv from './salvar.js';
import { hudHTML, atualizaHud } from './telas.js';
import { state as appState } from '../js/store.js';

const MOEDAS = { toque: 10, falou: 20, monte: 15, repita: 20, ouca: 12 };

/* Pacotes de falas da loja: entram junto com as falas normais do Pavio. */
const PACOTES = {
  bocasuja: {
    right: ['Acertou, filho da mãe! Tô até emocionado, caralho.', 'Puta que pariu, que resposta linda! Quem te ensinou? Eu, porra!', 'Isso, desgraçado! Agora sim tá falando que nem gente.'],
    wrong: [
      ['Ô, cabeça de bagre, não é isso não.', 'Errou, seu jumento lindo. Bora de novo.'],
      ['Puta merda, de novo?! Tá de sacanagem comigo, né?', 'Caralho, meu fígado não aguenta isso não.'],
      ['PORRA! Eu vou enfiar esse dicionário onde o sol não bate!', 'Vai tomar no cu, que erro foi esse?! ...Desculpa. Mas PORRA!'],
    ],
  },
  mae: {
    right: ['Viu? Quando quer, consegue. Igual arrumar o quarto.', 'Muito bem, meu filho. Agora pode comer a sobremesa.', 'Tá vendo? Mãe sempre sabe. Eu falei que você conseguia.'],
    wrong: [
      ['Eu não vou falar de novo, hein. ...Tá, vou falar de novo.', 'Tá achando que eu sou tua empregada? Presta atenção!'],
      ['Eu tô contando até três. UM...', 'Engole esse choro e tenta de novo, que eu não criei filho burro.'],
      ['ONDE TÁ O MEU CHINELO?!', 'Quando chegar em casa a gente conversa, viu?! Eu vou contar pro teu pai!'],
    ],
  },
};
function falasDoPavio() {
  const base = TEACHERS.pavio.lines;
  const L = { ...base, right: [...base.right], wrong: base.wrong.map((g) => [...g]) };
  for (const [id, p] of Object.entries(PACOTES)) {
    if (!sv.temItem(id)) continue;
    L.right.push(...p.right);
    p.wrong.forEach((g, k) => L.wrong[Math.min(k, L.wrong.length - 1)].push(...g));
  }
  return L;
}

/* Coach marks do tutorial: escurece a tela e destaca um elemento por vez. */
async function coach(tela, passos) {
  for (const [sel, texto] of passos) {
    const el = $(sel, tela);
    if (!el) continue;
    await new Promise((ok) => {
      const r = el.getBoundingClientRect(), t = tela.getBoundingClientRect();
      const embaixo = r.top - t.top < t.height / 2;
      const box = document.createElement('div');
      box.className = 'coach';
      // Quatro faixas escuras em volta do elemento destacado (o "furo").
      const x = Math.max(0, r.left - t.left - 6), y = Math.max(0, r.top - t.top - 6);
      const w = Math.min(t.width - x, r.width + 12), h = Math.min(t.height - y, r.height + 12);
      box.innerHTML = `<i class="coach-sombra" style="left:0;right:0;top:0;height:${y}px"></i><i class="coach-sombra" style="left:0;right:0;top:${y + h}px;bottom:0"></i>
        <i class="coach-sombra" style="left:0;width:${x}px;top:${y}px;height:${h}px"></i><i class="coach-sombra" style="left:${x + w}px;right:0;top:${y}px;height:${h}px"></i>
        <div class="coach-furo" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></div>
        <div class="coach-card" style="${embaixo ? `top:${r.bottom - t.top + 16}px` : `bottom:${t.bottom - r.top + 16}px`}"><p>${texto}</p><button class="btn-jogar" type="button">Entendi</button></div>`;
      tela.appendChild(box);
      $('button', box).onclick = () => { sfx('toque'); box.remove(); ok(); };
    });
  }
}

/* m = mundo, i = índice da parada, F = roteiro, nav = { mapa(), fase(i) } */
export function telaFase(app, m, i, F, nav) {
  calar();
  const inicio = Date.now();
  const VIDAS = F.vidas || 4; // o chefão tem o pavio mais curto
  let turno = 0, vidas = VIDAS, seguidos = 0, erros = 0, ganhou = 0, acabou = false, reservaUsada = false;
  const LINES = falasDoPavio();
  const tutorial = F.id === 'checkin' && !sv.tutorialFeito();
  const nomeNpc = NPCS[F.npc]?.nome || 'Atendente';
  app.innerHTML = `
  <section class="tela fase ${F.chefe ? 'chefe' : ''}">
    <div class="cena">${(CENAS[F.id] || CENAS.checkin)()}</div>
    ${F.chefe ? '<div class="chefe-vinheta"></div>' : ''}
    <header class="topo fase-topo">
      <button class="btn-x" id="sair" aria-label="Sair da fase">✕</button>
      <div class="estopim" aria-label="Paciência do Pavio">
        <svg viewBox="0 0 200 40"><circle class="bomba" cx="20" cy="22" r="15"/><circle cx="14" cy="16" r="4" fill="#fff" opacity=".35"/><rect x="28" y="9" width="10" height="8" rx="2" fill="#555"/>
          <path id="corda" class="corda" d="M36 12 C60 -2 74 26 98 14 S140 0 160 14 S186 22 194 12"/></svg>
        <div class="faisca" id="faisca"></div>
      </div>
      ${hudHTML(true)}
    </header>
    <div class="progresso">${F.turnos.map(() => '<i></i>').join('')}</div>
    <div class="pavio-palco grande" id="pv"></div>
    <div class="mala-wrap">${malaSVG()}</div>
    <div class="painel" id="caixa"><div class="balao balao-npc" id="balaoNpc" hidden></div><div class="balao balao-pavio" id="balaoPv" hidden></div><div id="painel"></div></div>
    <div class="flash" id="flash"></div>
  </section>`;
  const pavio = new Pavio($('#pv'));
  const tela = $('.fase', app), balaoNpc = $('#balaoNpc'), balaoPv = $('#balaoPv'), painel = $('#painel'), caixa = $('#caixa');
  // O Pavio fica sempre logo acima da caixa de baixo, do tamanho do espaço que sobra.
  const ro = new ResizeObserver(() => tela.style.setProperty('--ph', caixa.offsetHeight + 'px'));
  ro.observe(caixa);
  const sobe = () => { caixa.classList.remove('sobe'); void caixa.offsetWidth; caixa.classList.add('sobe'); };
  const vivo = () => document.body.contains(tela); // a pessoa pode ter saído no meio de uma fala
  const corda = $('#corda'), L = corda.getTotalLength();
  corda.style.strokeDasharray = L;
  const posFaisca = () => {
    const vis = L * (vidas / VIDAS); corda.style.strokeDashoffset = L - vis;
    const p = corda.getPointAtLength(Math.max(1, vis)); const f = $('#faisca');
    f.style.left = (p.x / 200) * 100 + '%'; f.style.top = (p.y / 40) * 100 + '%';
  };
  posFaisca();
  $('#sair').onclick = () => { sfx('toque'); acabou = true; calar(); nav.mapa(); };

  const marcaProgresso = () => $$('.progresso i', app).forEach((el, k) => { el.className = k < turno ? 'ok' : k === turno ? 'agora' : ''; });
  const pavioDiz = (texto, pose, lang = 'pt-BR') => { if (pose) pavio.pose(pose); return falar('pavio', texto, { lang, balao: balaoPv }); };
  const npcDiz = (texto) => falar('npc', texto);

  async function abre() {
    marcaProgresso();
    if (F.chefe) {
      // Entrada do chefão: faixa vermelha, música tensa e o Pavio assustado.
      tela.insertAdjacentHTML('beforeend', `<div class="chefe-faixa"><small>CHEFÃO</small><b>${esc(F.titulo)}</b><span>Pavio curto: ${VIDAS} erros e acabou</span></div>`);
      sfx('chefe'); pavio.pose('surpreso', false); pavio.acao('treme');
      await sleep(1900);
      $('.chefe-faixa', tela)?.remove();
      if (!vivo() || acabou) return;
      await pavioDiz(F.intro, 'impaciente');
    } else {
      pavio.pose('debochado', false); pavio.acao('pulo');
      await pavioDiz(F.intro, 'debochado');
    }
    if (vivo() && !acabou) proximo();
  }

  /* ---------- turno ---------- */
  async function proximo() {
    if (!vivo() || acabou) return;
    if (turno >= F.turnos.length) return vitoria();
    marcaProgresso();
    const T = F.turnos[turno];
    balaoPv.hidden = true; painel.innerHTML = '';
    pavio.pose('escutando');
    balaoNpc.innerHTML = `<span class="quem">${esc(nomeNpc)}</span><p class="en">${esc(T.en)}</p><p class="pt" hidden>${esc(T.pt)}</p>
      <div class="balao-acoes"><button class="mini-btn" id="ouvir">Ouvir de novo</button><button class="mini-btn" id="traduzir">Traduzir</button></div>`;
    balaoNpc.hidden = false; balaoNpc.classList.remove('entra'); void balaoNpc.offsetWidth; balaoNpc.classList.add('entra');
    $('#ouvir').onclick = () => { calar(); npcDiz(T.en); };
    $('#traduzir').onclick = (e) => { const p = $('.pt', balaoNpc); p.hidden = !p.hidden; e.target.textContent = p.hidden ? 'Traduzir' : 'Esconder'; };
    const tipo = T.tipo === 'repita' && !voz.canListen ? 'monte' : T.tipo || 'dialogo';
    if (tipo === 'ouca') {
      // Teste de ouvido: a frase fica borrada até acertar (a não ser que o som esteja desligado).
      if ((appState.settings.audioPref || 'all') !== 'off') $('.en', balaoNpc).classList.add('borrado');
      $('#traduzir').remove();
      montaOuca(T);
    }
    if (tipo === 'dialogo') montaDialogo(T);
    if (tipo === 'monte') montaMonte(T);
    const terminou = await npcDiz(T.en);
    if (!vivo() || acabou) return;
    if (tipo === 'repita') montaRepita(T);
    else if (terminou && pavio.atual === 'escutando') pavio.pose('neutro');
    if (tutorial && turno === 0 && vivo() && !acabou) {
      await coach(tela, [
        ['.estopim', '<b>Esse é o pavio da paciência do professor.</b> Cada erro queima um pedaço. Se queimar tudo, BOOM e a fase recomeça.'],
        ['.progresso', 'Aqui você vê quantas falas faltam para terminar a parada.'],
        ['.balao-acoes', 'Não entendeu o atendente? <b>Ouvir de novo</b> repete a frase e <b>Traduzir</b> mostra em português.'],
        ['#painel', voz.canListen ? 'Responda tocando numa opção ou <b>fale no microfone</b> — falando você ganha moeda em dobro!' : 'Responda tocando na opção certa. Acertou, ganha moeda.'],
      ]);
      sv.marcaTutorial();
    }
  }

  /* Dica 50/50 (item da loja): some com uma resposta errada. */
  function botaoDica(ops) {
    if (!sv.temItem('dica') || ops.filter((o) => !o.certo).length < 2) return '';
    return `<button class="mini-btn escuro btn-dica" id="dica"><span class="ico-moeda"></span> Dica 50/50 <small>(${sv.temItem('dica')})</small></button>`;
  }
  function ligaDica(ops) {
    const b = $('#dica', painel);
    if (!b) return;
    b.onclick = () => {
      if (!sv.usaItem('dica')) return;
      sfx('compra');
      const vivos = $$('.opcao', painel).filter((el) => !ops[+el.dataset.i].certo && !el.disabled);
      const some = pick(vivos);
      if (some) { some.disabled = true; some.classList.add('sumiu'); }
      b.remove();
      pavioDiz('Tá, vou te dar uma colher de chá. Uma dessas aí era pura merda.', 'debochado');
    };
  }

  /* Microfone: devolve o texto dito ('' se nada). */
  async function ouvir(btn, txtEl, textoOuvindo) {
    if (voz.isListening()) { voz.stopListening(); return null; }
    const txt0 = txtEl?.innerHTML;
    calar(); btn.classList.add('ouvindo'); if (txtEl) txtEl.innerHTML = textoOuvindo;
    pavio.pose('escutando');
    let r = '';
    try { r = await voz.listen({ lang: 'en-US' }); } catch { r = ''; }
    btn.classList.remove('ouvindo'); if (txtEl) txtEl.innerHTML = txt0;
    return typeof r === 'string' ? r : r?.text || '';
  }
  const micHTML = (txt) => voz.canListen ? `<div class="resp-topo"><button class="btn-mic" id="mic" aria-label="Responder falando"><span class="ico-mic"></span></button><p id="micTxt">${txt}</p></div>` : '';

  /* ---------- tipo: diálogo ---------- */
  function montaDialogo(T) {
    const ops = embaralha([{ t: T.ok, certo: true }, ...T.errados.map(([t, porque]) => ({ t, porque }))]);
    painel.innerHTML = `${micHTML('<b>Fale em inglês</b> e ganhe 2× moedas<br>ou toque numa resposta')}
      <div class="opcoes">${ops.map((o, k) => `<button class="opcao" data-i="${k}">${esc(o.t)}</button>`).join('')}</div>${botaoDica(ops)}`;
    sobe(); ligaDica(ops);
    $$('.opcao', painel).forEach((b) => b.onclick = () => { sfx('toque'); responde(T, ops[+b.dataset.i].certo, b, { porque: ops[+b.dataset.i].porque, moedas: MOEDAS.toque }); });
    const mic = $('#mic');
    if (mic) mic.onclick = async () => {
      const dito = await ouvir(mic, $('#micTxt'), '<b>Ouvindo…</b> fale em inglês<br>toque de novo para parar');
      if (dito === null) return;
      if (!dito) return pavioDiz('Não ouvi porra nenhuma, meu querido. Fala de novo, mais perto do microfone.', 'pensando');
      let best = -1, nota = 0;
      ops.forEach((o, k) => { const n = Math.max(parecido(dito, o.t), ...(o.certo ? (T.aceita || []).map((a) => parecido(dito, a) * 0.95) : [0])); if (n > nota) { nota = n; best = k; } });
      if (best < 0 || nota < 0.5) return pavioDiz(`Você disse "<i>${esc(dito)}</i>"? Não entendi caralho nenhum. Tenta de novo ou toca numa resposta.`, 'pensando');
      responde(T, ops[best].certo, $(`.opcao[data-i="${best}"]`, painel), { porque: ops[best].porque, moedas: MOEDAS.falou, dito });
    };
  }

  /* ---------- tipo: ouça e entenda (resposta em português) ---------- */
  function montaOuca(T) {
    const ops = embaralha([{ t: T.ok, certo: true }, ...T.errados.map(([t, porque]) => ({ t, porque }))]);
    painel.innerHTML = `<p class="monte-instr"><span class="ico-ouvido"></span><b>${esc(T.pergunta || 'O que foi dito?')}</b><br><small>Não entendeu? Toque em "Ouvir de novo".</small></p>
      <div class="opcoes">${ops.map((o, k) => `<button class="opcao pt" data-i="${k}">${esc(o.t)}</button>`).join('')}</div>${botaoDica(ops)}`;
    sobe(); ligaDica(ops);
    $$('.opcao', painel).forEach((b) => b.onclick = () => { sfx('toque'); responde(T, ops[+b.dataset.i].certo, b, { porque: ops[+b.dataset.i].porque, moedas: MOEDAS.ouca, ouca: true }); });
  }

  /* ---------- tipo: montar a frase com peças ---------- */
  function montaMonte(T) {
    const alvo = T.ok.split(/\s+/);
    const pecas = embaralha([...alvo, ...(T.extras || [])].map((w, k) => ({ w, k })));
    painel.innerHTML = `<p class="monte-instr">Monte a resposta tocando nas palavras:</p>
      <div class="monte-linha" id="linha" aria-live="polite"></div>
      <div class="monte-pecas" id="pecas">${pecas.map((p) => `<button class="peca" data-k="${p.k}">${esc(p.w)}</button>`).join('')}</div>
      <button class="btn-jogar" id="conferir" disabled>Conferir</button>`;
    sobe();
    const linha = $('#linha'), conf = $('#conferir');
    const atualiza = () => { conf.disabled = !linha.children.length; };
    $$('.peca', painel).forEach((b) => b.onclick = () => {
      sfx('peca');
      (b.parentElement === linha ? $('#pecas') : linha).appendChild(b);
      b.animate([{ transform: 'scale(.8)' }, { transform: 'scale(1)' }], 160);
      atualiza();
    });
    conf.onclick = () => {
      const dito = $$('.peca', linha).map((b) => b.textContent).join(' ');
      const certo = palavras(dito).join(' ') === palavras(T.ok).join(' ');
      responde(T, certo, linha, { porque: `${T.dica}<br>Certo: <b>${esc(T.ok)}</b>`, moedas: MOEDAS.monte, dito, monte: true });
    };
  }

  /* ---------- tipo: repetir falando (o Pavio sopra) ---------- */
  async function montaRepita(T) {
    painel.innerHTML = `<div class="repita">
      <button class="btn-mic grande" id="mic" aria-label="Falar a frase"><span class="ico-mic"></span></button>
      <p id="micTxt"><b>Toque e fale:</b><br><span class="alvo">${esc(T.ok)}</span></p></div>
      <div class="repita-acoes"><button class="mini-btn escuro" id="deNovo">Ouvir o Pavio de novo</button><button class="mini-btn escuro" id="semMic">Não posso falar agora</button></div>`;
    sobe();
    const mic = $('#mic');
    const sopra = async () => { await pavioDiz(`${esc(T.sopro || 'Fala comigo:')} <b class="sopro">${esc(T.ok)}</b>`, 'debochado'); if (vivo()) await falar('pavio', T.ok, { lang: 'en-US' }); };
    $('#deNovo').onclick = () => { calar(); sopra(); };
    $('#semMic').onclick = () => { calar(); montaMonte({ ...T, extras: T.extras || [] }); pavioDiz('Tá bom, preguiçoso. Então monta a frase aí, porra.', 'impaciente'); };
    mic.onclick = async () => {
      const dito = await ouvir(mic, $('#micTxt'), `<b>Ouvindo…</b><br><span class="alvo">${esc(T.ok)}</span>`);
      if (dito === null) return;
      if (!dito) return pavioDiz('Não ouvi porra nenhuma. Fala mais alto, meu querido!', 'pensando');
      const nota = parecido(dito, T.ok);
      const falta = faltando(dito, T.ok);
      responde(T, nota >= 0.7, mic, { porque: `Você disse "<i>${esc(dito)}</i>".${falta.length ? ` Faltou: <b>${esc(falta.join(', '))}</b>.` : ''} ${esc(T.dica || '')}`, moedas: MOEDAS.repita, dito, repita: true });
    };
    await sopra();
  }

  /* ---------- acerto e erro (iguais para todos os tipos) ---------- */
  async function responde(T, certo, alvoEl, { porque = '', moedas = 10, dito = '', monte = false, repita = false, ouca = false } = {}) {
    calar();
    $$('button', painel).forEach((b) => (b.disabled = true));
    if (certo) {
      alvoEl?.classList.add('certa'); sfx('certo');
      ganhou += moedas; sv.ganhaMoedas(moedas);
      chuvaDeMoedas(Math.round(moedas / 2.5), alvoEl || painel); setTimeout(atualizaHud, 900);
      const voltou = seguidos >= 2; seguidos = 0;
      pavio.pose('alegre'); pavio.acao('pulo');
      turno++; marcaProgresso();
      const en = $('.en', balaoNpc);
      en.classList.remove('borrado');
      en.innerHTML = ouca
        ? `<span class="voce">Disse: “${esc(T.en)}”</span><br>${esc(T.resposta)}`
        : `${dito ? `<span class="voce">Você: “${esc(dito)}”</span><br>` : ''}${esc(T.resposta)}`;
      $('.balao-acoes', balaoNpc)?.remove(); $('.pt', balaoNpc)?.remove();
      await npcDiz(T.resposta);
      if (!vivo() || acabou) return;
      const extra = repita ? ' Que pronúncia, porra!' : dito && !monte ? ' E ainda falou, porra! Moeda em dobro.' : '';
      await pavioDiz((voltou ? pick(LINES.comeback) : pick(LINES.right)) + extra, 'alegre');
      await sleep(250);
      proximo();
    } else {
      alvoEl?.classList.add('errada'); sfx('erro'); vibra(70);
      erros++; seguidos++; vidas--;
      const degrau = Math.min(seguidos, ESCADA.length) - 1;
      queima();
      tela.classList.remove('tremor'); void tela.offsetWidth;
      if (degrau >= 2) tela.classList.add('tremor');
      pavio.pose(ESCADA[degrau]); pavio.acao(degrau >= 2 ? 'surto' : 'treme');
      let bronca = pick(LINES.wrong[Math.min(degrau, LINES.wrong.length - 1)]);
      if (vidas <= 0) {
        // Pavio reserva (item da loja): acende de novo uma vez por fase.
        if (reservaUsada || !sv.usaItem('reserva')) return explode();
        reservaUsada = true; vidas = 1;
        await sleep(350); sfx('compra'); posFaisca();
        const f = $('#faisca'); f.classList.add('forte', 'reacende'); setTimeout(() => f.classList.remove('forte', 'reacende'), 1200);
        tela.insertAdjacentHTML('beforeend', '<div class="aviso-reserva">Pavio reserva aceso!</div>');
        setTimeout(() => $('.aviso-reserva', tela)?.remove(), 1800);
        bronca = 'Ia explodir, caralho! Sorte tua que eu guardei um pavio reserva no bolso. Último aviso, porra!';
      }
      await pavioDiz(`${esc(bronca)}<span class="porque">${porque}</span>`, ESCADA[degrau]);
      if (!vivo() || acabou) return;
      // tenta de novo o mesmo turno
      if (monte) { montaMonte(T); return; }
      if (repita) { $$('button', painel).forEach((b) => (b.disabled = false)); alvoEl?.classList.remove('errada'); return; }
      $$('button', painel).forEach((b) => { if (!b.classList.contains('errada') && !b.classList.contains('sumiu')) b.disabled = false; });
    }
  }

  function queima() {
    sfx('chiado');
    const f = $('#faisca'); f.classList.add('forte');
    posFaisca(); setTimeout(() => f.classList.remove('forte'), 700);
  }

  async function explode() {
    acabou = true;
    calar(); await sleep(500);
    sfx('boom'); vibra([180, 80, 320]);
    $('#flash').classList.add('boom');
    tela.classList.add('tremor-forte');
    pavio.pose('raivoso'); pavio.acao('surto');
    painel.innerHTML = ''; balaoNpc.hidden = true;
    await sleep(700);
    painel.innerHTML = `<div class="fim boom-fim"><h3>BOOM!</h3><p>${F.chefe ? `${esc(F.boomTexto || 'O oficial perdeu a paciência e o Pavio explodiu junto. Volta pro fim da fila!')}` : `O pavio do professor acabou. Você foi expulso: ${esc(F.titulo)}.`}</p>
      <div class="fim-botoes"><button class="btn-jogar" id="denovo">Tentar de novo</button><button class="btn-sec" id="mapa">Voltar ao mapa</button></div></div>`;
    sobe();
    $('#denovo').onclick = () => nav.fase(i); $('#mapa').onclick = () => nav.mapa();
    await falar('pavio', F.boom ? F.boom : F.chefe
      ? 'PUTA QUE PARIU! Quase deportaram a gente, caralho! Eu suando na fila e você travando! ...Respira, Pavio... Tá. Volta pra fila que dessa vez a gente passa, porra.'
      : 'CARALHO! PORRA! EU EXPLODI, VÉI! Que merda foi essa?! ...Respira, Pavio... Tá. Bora de novo, que dessa vez você vai, porra.', { lang: 'pt-BR', balao: balaoPv });
  }

  async function vitoria() {
    acabou = true; calar();
    const est = erros === 0 ? 3 : erros <= 2 ? 2 : 1;
    const xp = 20 + F.turnos.length * 5;
    const r = sv.registraFase(m, i, est, xp, (Date.now() - inicio) / 1000);
    if (F.chefe) {
      // Carimbo no passaporte antes da tela de vitória.
      balaoNpc.hidden = true; painel.innerHTML = '';
      tela.insertAdjacentHTML('beforeend', `<div class="carimbo-wrap"><div class="passaporte"><small>${esc((F.selo || [])[0] || 'UNITED STATES')}</small><div class="carimbo">${esc((F.selo || [])[1] || 'ADMITTED')}</div></div></div>`);
      await sleep(450); sfx('carimbo'); tela.classList.add('tremor');
      await sleep(1500);
      $('.carimbo-wrap', tela)?.remove(); tela.classList.remove('tremor');
    }
    balaoNpc.hidden = true; sfx('vitoria');
    pavio.pose(est === 3 ? 'alegre' : est === 2 ? 'debochado' : 'cansado'); pavio.acao('pulo');
    painel.innerHTML = `<div class="fim"><small>${r.recorde && !r.primeira ? 'Novo recorde!' : F.chefe ? 'Chefão derrotado' : 'Parada concluída'}</small><h3>${esc(F.titulo)}</h3>
      <div class="estrelas-grandes">${[1, 2, 3].map((k) => `<i class="est ${k <= est ? 'on' : ''}" style="animation-delay:${k * 0.25}s"></i>`).join('')}</div>
      <div class="ganhos"><span><span class="ico-moeda"></span> +${ganhou}</span><span>XP +${xp}</span></div>
      ${r.metaBatida ? '<p class="fim-meta">Meta do dia batida! Combustível reabastecido.</p>' : ''}
      ${r.liberou ? `<p class="fim-meta">Mundo liberado: <b>${esc(r.liberou.nome)}</b>!</p>` : ''}
      <div class="fim-botoes"><button class="btn-jogar" id="mapa">Continuar</button><button class="btn-sec" id="denovo">Jogar de novo</button></div></div>`;
    sobe();
    atualizaHud();
    $('#mapa').onclick = () => { sfx('toque'); nav.mapa(); }; $('#denovo').onclick = () => nav.fase(i);
    const fala = est === 3 ? F.fim : est === 2 ? 'Passou, mas me fez suar, hein, cacete. ' + F.fim : 'Passou raspando, puta merda. Quase infartei. Mas passou, porra!';
    await falar('pavio', fala + (r.metaBatida ? ' E bateu a meta do dia, caralho!' : ''), { lang: 'pt-BR', balao: balaoPv });
  }

  abre();
  return () => { acabou = true; ro.disconnect(); calar(); };
}
