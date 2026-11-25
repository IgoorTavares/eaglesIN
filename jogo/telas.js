/* ==========================================================
   telas.js — telas do jogo fora das fases: abertura, mundos,
   mapa do mundo, galeria de cenários, configurações de voz e a
   barra de status (combustível = sequência de dias, nível e moedas).
   ========================================================== */
import * as eleven from '../js/eleven.js';
import { testaVoz, estadoVoz } from '../js/vozgemini.js';
import { state as appState, save as appSave } from '../js/store.js';
import { $, $$, esc, sfx, vibra, Pavio, POSES, falar, calar, vozEstado, ICO, palco, bauSVG, chuvaDeMoedas, pick } from './nucleo.js';
import { MAPA_W, MAPA_H } from './cenas.js';
import { CENAS, mapaDe } from './cenas2.js';
import { NPCS } from './personagens.js';
import { MUNDOS, mundo } from './mundos.js';
import { FASES, FALAS } from './fases.js';
import * as sv from './salvar.js';

/* ---------- barra de status ---------- */
export function hudHTML(soMoedas = false) {
  // Fora das fases, as moedas levam para a loja.
  if (soMoedas) return `<div class="hud-moedas" aria-label="Moedas"><span class="ico-moeda"></span><b id="nMoedas">${sv.moedas()}</b></div>`;
  const moedas = `<a class="hud-moedas link" href="#loja" aria-label="Moedas: abrir a loja"><span class="ico-moeda"></span><b id="nMoedas">${sv.moedas()}</b><i class="hud-mais">+</i></a>`;
  const { lvl, into, need } = sv.userLevel(sv.xpTotal());
  const dias = sv.streak();
  return `<div class="hud">
    <div class="hud-item hud-comb ${dias ? 'on' : ''}" title="Combustível: dias seguidos batendo a meta">${ICO.combustivel}<b>${dias}</b></div>
    <div class="hud-item hud-nivel" title="Nível ${lvl}: ${into} de ${need} XP" style="--p:${Math.round((into / need) * 100)}%"><span>Nv</span><b>${lvl}</b></div>
    ${moedas}
  </div>`;
}
export function atualizaHud() {
  const n = $('#nMoedas');
  if (n && +n.textContent !== sv.moedas()) { n.textContent = sv.moedas(); n.parentElement.animate([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], 300); }
}

/* ---------- abertura (só na primeira vez) ---------- */
export function telaAbertura(app, nav) {
  calar();
  app.innerHTML = `
  <section class="tela abertura">
    <div class="ab-ceu"><div class="ab-sol"></div></div>
    <div class="ab-titulo"><small>EaglesIn</small><h1>A Viagem</h1><p>Aprenda inglês sobrevivendo ao mundo. Com um professor que explode.</p></div>
    <div class="pavio-palco ab-pavio" id="pv"></div>
    <button class="btn-jogar" id="jogar">${appState.jogo.viuAbertura ? 'Continuar a viagem' : 'Começar a viagem'}</button>
    <button class="btn-sec ab-sec" id="galeria">Ver os cenários do Mundo 1</button>
  </section>`;
  const pavio = new Pavio($('#pv'));
  pavio.pose('debochado', false);
  $('#jogar').onclick = () => { sfx('toque'); const primeira = !appState.jogo.viuAbertura; sv.marcaAbertura(); nav.mapa(appState.jogo.mundoAtual, primeira); };
  $('#galeria').onclick = () => { sfx('toque'); nav.galeria(0); };
}

/* ---------- mundos: a rota da viagem ---------- */
export function telaMundos(app, nav) {
  calar();
  const rota = MUNDOS.map((m, k) => {
    const lib = sv.mundoLiberado(m.id), obra = !m.nos.length;
    const est = sv.estrelasDoMundo(m), max = m.nos.length * 3;
    return `<button class="mundo-card ${lib ? '' : 'trancado'} ${m.id === appState.jogo.mundoAtual ? 'atual' : ''}" data-m="${m.id}" style="--c1:${m.cor[0]};--c2:${m.cor[1]}">
      <span class="mundo-num">${lib ? m.num : '<i class="ico-cadeado"></i>'}</span>
      <span class="mundo-txt"><small>Mundo ${m.num} · ${m.cefr}</small><b>${esc(m.nome)}</b><span>${esc(m.resumo)}</span>
        ${lib && !obra ? `<span class="mundo-barra"><i style="width:${max ? Math.round((est / max) * 100) : 0}%"></i></span><span class="mundo-est"><i class="est on"></i> ${est} de ${max}</span>` : ''}
        ${lib && obra ? '<span class="mundo-tag">Em construção</span>' : ''}
      </span>
    </button>${k < MUNDOS.length - 1 ? '<div class="rota-voo"></div>' : ''}`;
  }).join('');
  app.innerHTML = `
  <section class="tela mundos">
    <header class="topo"><div><small>A viagem</small><h2>Mundos</h2></div>${hudHTML()}</header>
    <div class="mundos-rolo">
      ${rota}
      <div class="mundos-extra">
        <button class="btn-sec linha" id="loja">${ICO.loja} Loja do Pavio</button>
        <button class="btn-sec linha" id="classico">${ICO.livro} Aulas, provas e conversa (modo clássico)</button>
        <button class="btn-sec linha" id="cfg">${ICO.engrenagem} Configurações (voz, sons e vibração)</button>
      </div>
    </div>
    <div class="mapa-pavio"><div class="pavio-palco mini" id="pv"></div><div class="balao balao-pavio" id="balaoPv" hidden></div></div>
  </section>`;
  const pavio = new Pavio($('#pv'));
  const balao = $('#balaoPv');
  $('#cfg').onclick = () => abreConfig(app);
  $('#loja').onclick = () => { sfx('toque'); nav.loja(); };
  $('#classico').onclick = () => nav.classico();
  $$('.mundo-card', app).forEach((b) => b.onclick = () => {
    sfx('toque');
    const m = mundo(b.dataset.m);
    if (!sv.mundoLiberado(m.id)) { pavio.pose('impaciente'); b.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], 240); return falar('pavio', FALAS.mundoTrancado, { lang: 'pt-BR', balao }); }
    if (!m.nos.length) { pavio.pose('cansado'); return falar('pavio', FALAS.mundoEmObra, { lang: 'pt-BR', balao }); }
    sv.mudaMundo(m.id); nav.mapa(m.id);
  });
  pavio.pose('alegre');
  falar('pavio', FALAS.mundos, { lang: 'pt-BR', balao }).then((fim) => fim && pavio.pose('neutro'));
}

/* ---------- mapa de um mundo ---------- */
export function telaMapa(app, nav, mundoId, primeira = false) {
  calar();
  const M = mundo(mundoId);
  if (!M.nos.length) return nav.mundos();
  const atual = M.nos.findIndex((n, k) => sv.faseLiberada(M, k) && !sv.estrelas(n.id));
  const trilha = 'M' + `${M.nos[0].x},${M.nos[0].y}` + M.nos.slice(1).map((n, k) => {
    const a = M.nos[k]; const my = (a.y + n.y) / 2;
    return ` C${a.x},${my} ${n.x},${my} ${n.x},${n.y}`;
  }).join('');
  app.innerHTML = `
  <section class="tela mapa">
    <header class="topo">
      <button class="topo-mundo" id="mundos" aria-label="Ver todos os mundos">${ICO.globo}<span><small>Mundo ${M.num} · ${M.cefr}</small><b>${esc(M.nome)}</b></span></button>
      ${hudHTML()}
    </header>
    <div class="mapa-rolo"><div class="mapa-area" style="aspect-ratio:${MAPA_W}/${MAPA_H}">
      ${mapaDe(M)}
      <svg class="mapa-trilha" viewBox="0 0 ${MAPA_W} ${MAPA_H}" preserveAspectRatio="xMidYMid slice"><path d="${trilha}" /></svg>
      ${M.nos.map((n, k) => {
        const est = sv.estrelas(n.id), lib = sv.faseLiberada(M, k);
        return `<button class="no ${n.chefe ? 'chefe' : ''} ${lib ? '' : 'trancado'} ${k === atual ? 'atual' : ''}" data-i="${k}"
          style="left:${(n.x / MAPA_W) * 100}%;top:${(n.y / MAPA_H) * 100}%">
          <span class="no-bola">${n.chefe ? '<i class="ico-chefe"></i>' : lib ? k + 1 : '<i class="ico-cadeado"></i>'}</span>
          <span class="no-nome">${esc(n.nome)}</span>
          ${est ? `<span class="no-estrelas">${'<i class="est on"></i>'.repeat(est)}${'<i class="est"></i>'.repeat(3 - est)}</span>` : ''}
        </button>`;
      }).join('')}
      ${atual >= 0 ? `<img class="ficha" src="../icons/pavio-marca.png" alt="" style="left:${(M.nos[atual].x / MAPA_W) * 100}%;top:${(M.nos[atual].y / MAPA_H) * 100}%">` : ''}
    </div></div>
    <div class="mapa-pavio"><div class="pavio-palco mini" id="pv"></div><div class="balao balao-pavio" id="balaoPv" hidden></div></div>
  </section>`;
  const pavio = new Pavio($('#pv'));
  const balao = $('#balaoPv');
  $('#mundos').onclick = () => { sfx('toque'); nav.mundos(); };
  /* Missão do dia e baú ficam no Início (jogo/inicio.js), não no mapa. */
  const rolo = $('.mapa-rolo');
  const alvo = $('.no.atual', app) || $('.no', app);
  requestAnimationFrame(() => { rolo.scrollTop = alvo.offsetTop - rolo.clientHeight * 0.55; });
  $$('.no', app).forEach((b) => b.onclick = () => {
    const k = +b.dataset.i, n = M.nos[k];
    sfx('toque');
    if (!sv.faseLiberada(M, k)) { b.animate([{ transform: 'translate(-50%,-50%) rotate(-8deg)' }, { transform: 'translate(-50%,-50%) rotate(8deg)' }, { transform: 'translate(-50%,-50%)' }], 260); pavio.pose('impaciente'); return falar('pavio', FALAS.trancado, { lang: 'pt-BR', balao }); }
    if (!FASES[n.id]) { pavio.pose('cansado'); return falar('pavio', FALAS.embreve, { lang: 'pt-BR', balao }); }
    nav.fase(M.id, k);
  });
  // Primeira entrada depois da migração: o Pavio conta o que trouxe do app.
  const mg = appState.jogo.migrado;
  let fala = primeira ? FALAS.inicio : FALAS.volta;
  // Mundo novo, ainda sem estrela: o Pavio apresenta o lugar.
  if (M.fala && !sv.estrelasDoMundo(M)) fala = M.fala;
  if (M.id === 'social' && M.nos.every((n) => sv.estrelas(n.id))) fala = 'Zerou a viagem inteira, caralho! Agora volta nas fases e pega todas as estrelas, que eu sou exigente, porra.';
  if (appState.jogo.avisoMigracao && mg) {
    fala = `Achei teu histórico, meu querido: ${mg.aulas} aula${mg.aulas === 1 ? '' : 's'} feita${mg.aulas === 1 ? '' : 's'} e ${mg.xp} de XP. Te dei ${mg.bonus} moedas de boas-vindas${mg.mundos > 1 ? ` e liberei ${mg.mundos} mundos` : ''}, porra! Agora bora jogar.`;
    sv.avisoMigracaoVisto();
  }
  pavio.pose(primeira || mg && fala !== FALAS.volta ? 'alegre' : 'debochado');
  falar('pavio', fala, { lang: 'pt-BR', balao }).then((fim) => fim && pavio.pose('neutro'));
}

/* ---------- configurações de voz (as mesmas do app) ---------- */
export function abreConfig(app) {
  calar();
  const el = appState.settings.eleven ||= { key: '', voiceId: '', voiceName: '' };
  const fundo = document.createElement('div');
  fundo.className = 'modal-fundo';
  fundo.innerHTML = `<div class="modal" role="dialog" aria-label="Configurações">
    <h3>Configurações</h3>
    <label class="chave"><span><b>Efeitos sonoros</b><small>Moedas, erros, BOOM e música do chefão</small></span><input type="checkbox" id="cfSons" ${sv.pref('sons') ? 'checked' : ''}><i></i></label>
    <label class="chave"><span><b>Vibração</b><small>Treme o celular quando você erra e no BOOM</small></span><input type="checkbox" id="cfVibrar" ${sv.pref('vibrar') ? 'checked' : ''}><i></i></label>
    <h4 class="modal-sub">Voz dos personagens</h4>
    <label class="campo"><span>Quando o Pavio fala</span><select id="cfAudio">
      <option value="all" ${(appState.settings.audioPref || 'all') === 'all' ? 'selected' : ''}>Fala tudo (app inteiro)</option>
      <option value="speech" ${appState.settings.audioPref === 'speech' ? 'selected' : ''}>Só o inglês dos exercícios</option>
      <option value="off" ${appState.settings.audioPref === 'off' ? 'selected' : ''}>Sem áudio</option>
    </select></label>
    <label class="chave"><span><b>Voz natural (Gemini)</b><small>Voz de gente de verdade, usando a chave do Gemini. Desligada: voz do aparelho.</small></span><input type="checkbox" id="cfVozG" ${appState.settings.vozGemini !== false ? 'checked' : ''}><i></i></label>
    <label class="campo"><span>Chave do Gemini (fica só neste aparelho)</span><input type="password" id="cfGKey" value="${esc(appState.settings.apiKey || '')}" placeholder="AIza..." autocomplete="off"></label>
    <button class="btn-sec" id="cfTestaG" style="margin:10px 0 4px">Testar voz natural</button>
    <p class="modal-txt" id="cfInfoG">${esc(estadoVoz().txt)}</p>
    <p class="modal-txt">Por padrão, o Pavio e todos os personagens falam com a <b>voz do aparelho</b> (grátis).</p>
    <p class="modal-txt">Para usar uma voz do <b>ElevenLabs</b> em todos eles, cole sua chave e o ID da voz. Deixe o ID em branco para voltar à voz do aparelho.</p>
    <label class="campo"><span>Chave do ElevenLabs (fica só neste aparelho)</span><input type="password" id="cfKey" value="${esc(el.key)}" placeholder="sk_..." autocomplete="off"></label>
    <label class="campo"><span>ID da voz</span><input type="text" id="cfVoz" value="${esc(el.voiceId)}" placeholder="ex.: pNInz6obpgDQGcFmaJgB" autocomplete="off"></label>
    <p class="modal-txt" id="cfInfo">${eleven.elevenReady() ? 'ElevenLabs ativo.' : 'Usando a voz do aparelho.'}${vozEstado.elevenFalhou ? ' Último erro: ' + esc(vozEstado.elevenFalhou) : ''}</p>
    <div class="fim-botoes"><button class="btn-jogar" id="cfTestar">Salvar e testar</button><button class="btn-sec" id="cfFechar">Fechar</button></div>
  </div>`;
  app.appendChild(fundo);
  $('#cfSons').onchange = (e) => { sv.mudaPref('sons', e.target.checked); sfx('toque'); };
  $('#cfVibrar').onchange = (e) => { sv.mudaPref('vibrar', e.target.checked); vibra(60); };
  $('#cfAudio').onchange = (e) => { appState.settings.audioPref = e.target.value; appSave(); if (e.target.value === 'off') calar(); };
  $('#cfVozG').onchange = (e) => { appState.settings.vozGemini = e.target.checked; appSave(); $('#cfInfoG').textContent = estadoVoz().txt; };
  const guardaGKey = () => { const k = $('#cfGKey').value.trim(); if (k !== (appState.settings.apiKey || '')) { appState.settings.apiKey = k; appSave(); } };
  $('#cfGKey').onchange = () => { guardaGKey(); $('#cfInfoG').textContent = estadoVoz().txt; };
  $('#cfTestaG').onclick = async (e) => {
    guardaGKey();
    const b = e.currentTarget, info = $('#cfInfoG');
    calar(); b.disabled = true; info.textContent = 'Gerando a voz… (1 a 3 segundos)';
    const r = await testaVoz();
    b.disabled = false; info.textContent = r.ok ? r.msg : 'Não funcionou: ' + r.msg + ' Enquanto isso, fica a voz do aparelho.';
  };
  const guarda = () => { guardaGKey(); el.key = $('#cfKey').value.trim(); el.voiceId = $('#cfVoz').value.trim(); el.voiceName = ''; vozEstado.elevenFalhou = ''; appSave(); };
  $('#cfFechar').onclick = () => { guarda(); fundo.remove(); };
  fundo.onclick = (e) => { if (e.target === fundo) { guarda(); fundo.remove(); } };
  $('#cfTestar').onclick = async () => {
    guarda();
    const info = $('#cfInfo');
    if (!el.voiceId) { info.textContent = 'Sem ID: testando a voz do aparelho.'; await falar('npc', 'Hello! Welcome to EaglesIn.'); return; }
    if (!el.key) { info.textContent = 'Cole a chave do ElevenLabs para usar o ID da voz.'; return; }
    info.textContent = 'Testando…';
    try { await eleven.speak('Hello! Welcome to EaglesIn. Bora, porra!', { lang: 'en-US' }); info.textContent = 'ElevenLabs funcionando com essa voz.'; }
    catch (e) { info.textContent = 'Não deu: ' + e.message; }
  };
}

/* ---------- baú diário ---------- */
export function abreBau(app, depois) {
  calar();
  const fundo = document.createElement('div');
  fundo.className = 'modal-fundo';
  const dias = sv.streak();
  fundo.innerHTML = `<div class="modal bau-modal" role="dialog" aria-label="Baú do dia">
    <h3>Baú do dia</h3>
    <button class="bau-grande" id="bauAbre" aria-label="Abrir o baú">${bauSVG()}</button>
    <p class="modal-txt" id="bauTxt">Toque no baú para abrir. ${dias ? `Sequência de <b>${dias} dia${dias === 1 ? '' : 's'}</b>: quanto maior, mais moedas.` : 'Jogue todo dia para o baú crescer.'}</p>
    <div class="fim-botoes"><button class="btn-sec" id="bauFecha">Depois</button></div>
  </div>`;
  app.appendChild(fundo);
  $('#bauFecha').onclick = () => fundo.remove();
  $('#bauAbre').onclick = (e) => {
    const b = e.currentTarget; b.disabled = true;
    const valor = sv.abreBau();
    b.classList.add('abrindo');
    setTimeout(() => {
      b.innerHTML = bauSVG(true); sfx('bau'); vibra(40);
      chuvaDeMoedas(Math.min(20, Math.round(valor / 4)), b);
      $('#bauTxt').innerHTML = `<b class="bau-valor"><span class="ico-moeda"></span> +${valor} moedas</b><br>Volte amanhã para o próximo baú.`;
      $('#bauFecha').textContent = 'Pegar';
      $('#bauFecha').className = 'btn-jogar';
      depois?.();
    }, 450);
  };
}

/* ---------- loja do Pavio ---------- */
const FALA_LOJA = {
  entra: 'Bem-vindo à minha lojinha, porra. Aqui tudo é pago em moeda, que fiado eu não faço.',
  reserva: 'Pavio reserva. Quando eu for explodir, eu acendo esse e te dou mais uma chance. Uma, caralho!',
  dica: 'Dica 50/50. Eu sumo com uma resposta errada. Preguiçoso, mas funciona.',
  bocasuja: 'Agora sim! Comprou o meu repertório completo. Prepara o ouvido, filho da mãe!',
  mae: 'Pacote Mãe Brasileira, hein? Agora eu tenho chinelo e não tenho medo de usar.',
  pobre: ['Tá duro, né? Vai jogar umas fases e volta com dinheiro, porra.', 'Com essa merreca aí? Nem fodendo. Junta mais moeda.'],
  tem: 'Esse você já tem, meu querido. Não vou te vender duas vezes, eu sou honesto, porra.',
};
export function telaLoja(app, nav) {
  calar();
  const card = (it) => {
    const qtd = sv.temItem(it.id), dono = it.tipo === 'fixo' && qtd;
    return `<div class="loja-item ${dono ? 'dono' : ''}" data-id="${it.id}">
      <div class="loja-ico ico-${it.id}"></div>
      <div class="loja-txt"><b>${esc(it.nome)}</b><span>${esc(it.desc)}</span>
        ${it.tipo === 'gasta' ? `<small>Você tem: <b class="qtd">${qtd}</b></small>` : ''}</div>
      <button class="btn-preco" data-id="${it.id}" ${dono ? 'disabled' : ''}>${dono ? 'Seu' : `<span class="ico-moeda"></span>${it.preco}`}</button>
    </div>`;
  };
  app.innerHTML = `
  <section class="tela loja">
    <header class="topo"><button class="btn-x" id="voltar" aria-label="Voltar">${ICO.voltar}</button><div><small>Gaste suas moedas</small><h2>Loja do Pavio</h2></div>${hudHTML(true)}</header>
    <div class="loja-rolo">
      <h4 class="loja-sec">Para usar nas fases</h4>
      ${sv.LOJA.filter((x) => x.tipo === 'gasta').map(card).join('')}
      <h4 class="loja-sec">Pacotes de fala do Pavio</h4>
      ${sv.LOJA.filter((x) => x.tipo === 'fixo').map(card).join('')}
      <p class="loja-dica">Ganhe moedas nas fases, nas missões e no baú do dia.</p>
    </div>
    <div class="mapa-pavio"><div class="pavio-palco mini" id="pv"></div><div class="balao balao-pavio" id="balaoPv" hidden></div></div>
  </section>`;
  const pavio = new Pavio($('#pv'));
  const balao = $('#balaoPv');
  const diz = (t, pose) => { calar(); pavio.pose(pose); return falar('pavio', t, { lang: 'pt-BR', balao }); };
  $('#voltar').onclick = () => { sfx('toque'); nav.voltar(); };
  $('.loja-rolo', app).onclick = (e) => {
    const b = e.target.closest('.btn-preco');
    if (!b || b.disabled) return;
    const it = sv.LOJA.find((x) => x.id === b.dataset.id);
    if (it.tipo === 'fixo' && sv.temItem(it.id)) return diz(FALA_LOJA.tem, 'debochado');
    if (sv.moedas() < it.preco) { sfx('erro'); b.animate([{ transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'none' }], 220); return diz(pick(FALA_LOJA.pobre), 'impaciente'); }
    sv.compra(it.id); sfx('compra'); vibra(30);
    chuvaDeMoedas(6, b); atualizaHud();
    const el = b.closest('.loja-item');
    el.outerHTML = card(it);
    const novo = $(`.loja-item[data-id="${it.id}"]`, app);
    novo.animate([{ transform: 'scale(1.04)' }, { transform: 'none' }], 300);
    pavio.acao('pulo');
    diz(FALA_LOJA[it.id], 'alegre');
  };
  diz(FALA_LOJA.entra, 'debochado');
}

/* ---------- galeria: todos os cenários do Mundo 1 ---------- */
const AMOSTRA = {
  checkin: ['atendente', 'Good morning! Where are you flying to today?'],
  seguranca: ['seguranca', 'Please put your bag and your shoes in the tray.'],
  cafe: ['barista', 'Hi! What can I get you?'],
  portao: ['portao', 'Boarding will start in ten minutes.'],
  atraso: ['portao', 'I am sorry, your flight is delayed.'],
  embarque: ['comissaria', 'Welcome aboard! May I see your boarding pass?'],
  aviao: ['comissario', 'Would you like coffee, tea, or orange juice?'],
  formulario: ['comissaria', 'Please fill out this landing card.'],
  imigracao: ['imigracao', 'What is the purpose of your visit?'],
};
export function telaGaleria(app, nav, k) {
  calar();
  const nos = MUNDOS[0].nos, n = nos[k], [npc, fala] = AMOSTRA[n.id];
  app.innerHTML = `
  <section class="tela fase galeria">
    <div class="cena">${CENAS[n.id]()}</div>
    <header class="topo fase-topo">
      <button class="btn-x" id="sair" aria-label="Voltar">✕</button>
      <div class="gal-titulo"><small>Cenário ${k + 1} de ${nos.length}</small><b>${esc(n.nome)}</b></div>
      <button class="btn-x" id="cfg" aria-label="Voz dos personagens">${ICO.engrenagem}</button>
    </header>
    <div class="pavio-palco grande" id="pv"></div>
    <div class="painel" id="caixa">
      <div class="balao balao-npc"><span class="quem">${esc(NPCS[npc].nome)}</span><p class="en">${esc(fala)}</p></div>
      <div class="gal-poses">${POSES.map((p) => `<button class="chip" data-p="${p}">${p}</button>`).join('')}</div>
      <div class="gal-nav"><button class="btn-sec" id="ant" ${k ? '' : 'disabled'}>‹ Anterior</button><button class="btn-jogar" id="falar">Fazer falar</button><button class="btn-sec" id="prox" ${k < nos.length - 1 ? '' : 'disabled'}>Próximo ›</button></div>
    </div>
  </section>`;
  const pavio = new Pavio($('#pv'));
  const tela = $('.fase', app), caixa = $('#caixa');
  const ro = new ResizeObserver(() => tela.style.setProperty('--ph', caixa.offsetHeight + 'px'));
  ro.observe(caixa);
  pavio.pose(n.chefe ? 'impaciente' : 'neutro', false);
  $('#sair').onclick = () => nav.voltar();
  $('#cfg').onclick = () => abreConfig(app);
  $('#ant').onclick = () => nav.galeria(k - 1);
  $('#prox').onclick = () => nav.galeria(k + 1);
  $('#falar').onclick = async () => { calar(); pavio.pose('escutando'); await falar('npc', fala); if (palco.pavio === pavio) pavio.pose('debochado'); };
  $$('.chip', app).forEach((b) => b.onclick = () => { pavio.pose(b.dataset.p); pavio.acao(['raivoso', 'bravo'].includes(b.dataset.p) ? 'surto' : 'pulo'); });
  return () => ro.disconnect();
}
