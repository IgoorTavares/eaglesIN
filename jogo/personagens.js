/* ==========================================================
   personagens.js — gerador dos personagens secundários (NPCs) em SVG.
   Todos têm a mesma base (cabeça, olhos que piscam, boca que fala),
   e variam pele, cabelo, roupa, chapéu, óculos, barba e expressão.
   O jogo liga a classe .falando no grupo .npc para mexer a boca.
   ========================================================== */

export const PELES = { clara: ['#f6d2b4', '#eab894'], media: ['#f1c7a0', '#e0ac85'], morena: ['#c98d62', '#b37650'], escura: ['#8a5a3c', '#744830'] };

/* Personagens do Mundo 1 */
export const NPCS = {
  atendente: { nome: 'Atendente', pele: 'media', cabelo: '#3a2418', estilo: 'coque', roupa: '#1f3a5f', detalhe: '#21c46b', chapeu: 'comissaria', brinco: true, expressao: 'simpatica', cil: true },
  seguranca: { nome: 'Agente de segurança', pele: 'escura', cabelo: '#1a1110', estilo: 'curto', roupa: '#2b3440', detalhe: '#ffd23f', chapeu: 'quepe', expressao: 'seria', barba: true, cracha: true },
  barista: { nome: 'Barista', pele: 'morena', cabelo: '#2a1a12', estilo: 'topete', roupa: '#3b2a20', detalhe: '#ff8a3d', expressao: 'simpatica', barba: true, cracha: true },
  portao: { nome: 'Agente do portão', pele: 'clara', cabelo: '#c9772c', estilo: 'curto', roupa: '#0f5132', detalhe: '#9be36d', expressao: 'simpatica', oculos: true, gravata: true, cracha: true },
  comissaria: { nome: 'Comissária', pele: 'morena', cabelo: '#1a1110', estilo: 'rabo', roupa: '#7a1f2b', detalhe: '#ffd23f', chapeu: 'comissaria', expressao: 'simpatica', brinco: true, cil: true },
  comissario: { nome: 'Comissário', pele: 'clara', cabelo: '#e8c66a', estilo: 'topete', roupa: '#7a1f2b', detalhe: '#ffd23f', expressao: 'simpatica', gravata: true },
  /* Mundo 2: hotel e cidade */
  recepcionista: { nome: 'Recepcionista', pele: 'clara', cabelo: '#d9a441', estilo: 'rabo', roupa: '#1d2b3a', detalhe: '#c9a227', expressao: 'simpatica', brinco: true, cil: true, cracha: true },
  metro: { nome: 'Agente do metrô', pele: 'escura', cabelo: '#1a1110', estilo: 'curto', roupa: '#1f4fa8', detalhe: '#ffd23f', chapeu: 'quepe', expressao: 'seria', cracha: true },
  hotdog: { nome: 'Vendedor de hot dog', pele: 'media', cabelo: '#2a1a12', estilo: 'careca', roupa: '#c42323', detalhe: '#ffd23f', expressao: 'simpatica', barba: true },
  farmaceutica: { nome: 'Farmacêutica', pele: 'morena', cabelo: '#2a1a12', estilo: 'coque', roupa: '#f4f4f0', detalhe: '#21c46b', expressao: 'simpatica', oculos: true, cracha: true },
  bilheteira: { nome: 'Bilheteira do museu', pele: 'escura', cabelo: '#3a2418', estilo: 'coque', roupa: '#7a1f2b', detalhe: '#f4f4f0', expressao: 'simpatica', brinco: true, cil: true },
  taxista: { nome: 'Taxista', pele: 'clara', cabelo: '#5a3a22', estilo: 'topete', roupa: '#3a3a3a', detalhe: '#ffd23f', expressao: 'brava', barba: true, oculos: true },
  /* Mundo 3: restaurante e compras */
  hostess: { nome: 'Hostess', pele: 'clara', cabelo: '#1a1110', estilo: 'rabo', roupa: '#111111', detalhe: '#c9a227', expressao: 'simpatica', brinco: true, cil: true },
  garcom: { nome: 'Garçom', pele: 'media', cabelo: '#1a1110', estilo: 'topete', roupa: '#111111', detalhe: '#f4f4f0', expressao: 'simpatica', gravata: true },
  vendedora: { nome: 'Vendedora', pele: 'morena', cabelo: '#7a3b1e', estilo: 'curto', roupa: '#ff5a7a', detalhe: '#ffd23f', expressao: 'simpatica', brinco: true, cracha: true },
  trocas: { nome: 'Atendente de trocas', pele: 'escura', cabelo: '#1a1110', estilo: 'careca', roupa: '#3d8bff', detalhe: '#f4f4f0', expressao: 'seria', oculos: true, cracha: true },
  maitre: { nome: 'Maître', pele: 'clara', cabelo: '#9a9a9a', estilo: 'topete', roupa: '#111111', detalhe: '#7a1f2b', expressao: 'brava', gravata: true, barba: true, grande: true },
  /* Mundo 4: trabalho */
  portaria: { nome: 'Recepcionista', pele: 'media', cabelo: '#1a1110', estilo: 'curto', roupa: '#5b37b3', detalhe: '#f4f4f0', expressao: 'simpatica', cracha: true, brinco: true },
  recrutadora: { nome: 'Ms. Carter', pele: 'escura', cabelo: '#1a1110', estilo: 'coque', roupa: '#2b3440', detalhe: '#9b6bff', expressao: 'seria', oculos: true, brinco: true },
  colega: { nome: 'Colega', pele: 'clara', cabelo: '#c9772c', estilo: 'topete', roupa: '#3d8bff', detalhe: '#f4f4f0', expressao: 'simpatica', barba: true },
  cliente: { nome: 'Cliente', pele: 'media', cabelo: '#5a5a5a', estilo: 'curto', roupa: '#1d2b3a', detalhe: '#21c46b', expressao: 'simpatica', gravata: true, oculos: true },
  diretora: { nome: 'Diretora', pele: 'clara', cabelo: '#e8c66a', estilo: 'coque', roupa: '#7a1f2b', detalhe: '#f4f4f0', expressao: 'seria', brinco: true, cracha: true },
  chefe: { nome: 'O chefe', pele: 'media', cabelo: '#7a7a7a', estilo: 'careca', roupa: '#1b1f22', detalhe: '#c42323', expressao: 'brava', gravata: true, oculos: true, grande: true },
  /* Mundo 5: vida social */
  anfitria: { nome: 'Anfitriã', pele: 'morena', cabelo: '#2a1a12', estilo: 'rabo', roupa: '#ff8a3d', detalhe: '#ffd23f', expressao: 'simpatica', brinco: true, cil: true },
  estranho: { nome: 'Convidado', pele: 'clara', cabelo: '#3a2418', estilo: 'curto', roupa: '#21c46b', detalhe: '#1d2b3a', expressao: 'simpatica', oculos: true },
  date: { nome: 'Sam', pele: 'escura', cabelo: '#1a1110', estilo: 'topete', roupa: '#9b6bff', detalhe: '#f4f4f0', expressao: 'simpatica', cil: true },
  vizinho: { nome: 'Vizinho', pele: 'media', cabelo: '#c9772c', estilo: 'topete', roupa: '#ffd23f', detalhe: '#ff5a7a', expressao: 'simpatica', barba: true },
  amigo: { nome: 'Jake', pele: 'clara', cabelo: '#e8c66a', estilo: 'curto', roupa: '#1f4fa8', detalhe: '#ff8a3d', expressao: 'simpatica' },
  sogro: { nome: 'O sogro', pele: 'clara', cabelo: '#d0d0d0', estilo: 'careca', roupa: '#3b4a2a', detalhe: '#c9a227', expressao: 'brava', barba: true, oculos: true, grande: true },
  imigracao: { nome: 'Oficial da imigração', pele: 'media', cabelo: '#5a5a5a', estilo: 'careca', roupa: '#1d2b3a', detalhe: '#c9a227', chapeu: 'quepe', expressao: 'brava', oculos: true, barba: true, cracha: true, grande: true },
};

/* Desenha um personagem do peito para cima, com o centro do rosto em (x, y). */
export function npcSVG(id, x, y, escala = 1) {
  const o = typeof id === 'string' ? NPCS[id] : id;
  const [pele, sombra] = PELES[o.pele] || PELES.media;
  const cab = o.cabelo, s = (o.grande ? 1.12 : 1) * escala;
  const brava = o.expressao === 'brava', seria = o.expressao === 'seria' || brava;

  const cabeloAtras = {
    coque: `<ellipse cx="0" cy="18" rx="44" ry="46" fill="${cab}"/><circle cx="0" cy="-34" r="16" fill="${cab}"/>`,
    rabo: `<ellipse cx="0" cy="16" rx="42" ry="44" fill="${cab}"/><path d="M28 -4 q34 20 22 78 q-6 -30 -26 -44 z" fill="${cab}"/>`,
    curto: '', topete: '', careca: '',
  }[o.estilo] || '';
  const cabeloFrente = {
    coque: `<path d="M-36 6 q4 -40 36 -38 q34 -2 38 38 q-14 -22 -38 -24 q-22 2 -36 24 z" fill="${cab}"/>`,
    rabo: `<path d="M-37 10 q2 -44 37 -42 q36 -2 38 40 q-10 -26 -30 -26 q-4 10 -20 10 q-14 0 -25 18 z" fill="${cab}"/>`,
    curto: `<path d="M-37 8 q-2 -42 37 -42 q40 0 37 42 q-6 -18 -14 -22 q-24 6 -50 -2 q-6 6 -10 24 z" fill="${cab}"/>`,
    topete: `<path d="M-36 6 q-4 -38 30 -44 q24 -10 40 6 q12 14 2 38 q-8 -20 -20 -22 q-26 0 -52 22 z" fill="${cab}"/>`,
    careca: `<path d="M-37 12 q0 -10 4 -18 M37 12 q0 -10 -4 -18" stroke="${cab}" stroke-width="7" stroke-linecap="round"/>`,
  }[o.estilo] || '';

  const chapeu = o.chapeu === 'comissaria'
    ? `<g transform="rotate(-8 0 -22)"><path d="M-26 -20 q26 -14 52 0 l-4 10 q-22 -8 -44 0 z" fill="${o.roupa}"/><rect x="-22" y="-14" width="44" height="5" fill="${o.detalhe}"/></g>`
    : o.chapeu === 'quepe'
      ? `<g><path d="M-38 -6 q2 -30 38 -32 q36 2 38 32 z" fill="${o.roupa}"/><rect x="-40" y="-10" width="80" height="9" rx="3" fill="#11161b"/><path d="M-34 -2 q34 14 68 0 l4 8 q-38 14 -76 0 z" fill="#11161b"/><circle cx="0" cy="-20" r="6" fill="${o.detalhe}"/></g>`
      : '';

  const sobrancelhas = brava
    ? `<path d="M-23 2 l17 7 M6 9 l17 -7" stroke="${o.estilo === 'careca' ? '#3a3a3a' : cab}" stroke-width="4" stroke-linecap="round"/>`
    : seria
      ? `<path d="M-22 6 h15 M7 6 h15" stroke="${cab}" stroke-width="3.4" stroke-linecap="round"/>`
      : `<path d="M-21 6 q8 -5 15 -1 M6 5 q8 -4 15 1" stroke="${cab}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
  const bocaFechada = brava ? 'M-10 2 q10 -6 20 0' : seria ? 'M-9 0 h18' : 'M-10 -2 q10 9 20 0';

  return `
<g class="npc" transform="translate(${x} ${y}) scale(${s})"><g class="npc-vivo">
  <path d="M-64 156 q4 -70 64 -74 q60 4 64 74 z" fill="${o.roupa}"/>
  <path d="M-16 82 l16 26 l16 -26 z" fill="#f4f4f0"/>
  ${o.gravata ? `<path d="M-5 88 h10 l5 40 l-10 10 l-10 -10 z" fill="${o.detalhe}"/>` : `<path d="M-14 84 q14 30 28 0 l-6 28 l-8 -8 l-8 8 z" fill="${o.detalhe}"/>`}
  ${o.cracha ? `<rect x="22" y="104" width="22" height="28" rx="3" fill="#fff"/><rect x="25" y="108" width="16" height="10" rx="2" fill="${o.detalhe}"/>` : `<rect x="-40" y="104" width="22" height="6" rx="2" fill="${o.detalhe}"/>`}
  <rect x="-10" y="54" width="20" height="30" rx="6" fill="${sombra}"/>
  ${cabeloAtras}
  <ellipse cx="-38" cy="24" rx="7" ry="9" fill="${sombra}"/>
  <ellipse cx="38" cy="24" rx="7" ry="9" fill="${sombra}"/>
  <ellipse cx="0" cy="22" rx="36" ry="40" fill="${pele}"/>
  ${o.barba ? `<path d="M-34 30 q2 30 34 34 q32 -4 34 -34 q-6 18 -34 20 q-28 -2 -34 -20 z" fill="${o.estilo === 'careca' ? '#4a4a4a' : cab}" opacity=".9"/>` : ''}
  ${cabeloFrente}
  ${chapeu}
  <g class="npc-olhos">
    <ellipse cx="-13" cy="18" rx="6" ry="${brava ? 5.5 : 7.5}" fill="#fff"/>
    <ellipse cx="13" cy="18" rx="6" ry="${brava ? 5.5 : 7.5}" fill="#fff"/>
    <circle cx="-12" cy="19" r="3.6" fill="#2b1a10"/>
    <circle cx="14" cy="19" r="3.6" fill="#2b1a10"/>
    <circle cx="-11" cy="17.5" r="1.2" fill="#fff"/>
    <circle cx="15" cy="17.5" r="1.2" fill="#fff"/>
  </g>
  ${o.cil ? `<path d="M-20 12 l-4 -3 M20 12 l4 -3" stroke="#1a1110" stroke-width="2" stroke-linecap="round"/>` : ''}
  ${sobrancelhas}
  ${o.oculos ? `<g fill="none" stroke="#1b1f22" stroke-width="2.6"><rect x="-23" y="10" width="19" height="16" rx="5"/><rect x="4" y="10" width="19" height="16" rx="5"/><path d="M-4 16 h8 M-23 16 l-12 -3 M23 16 l12 -3"/></g>` : ''}
  <path d="M0 22 q-3 10 1 12" stroke="${sombra}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  ${seria ? '' : `<ellipse cx="-22" cy="34" rx="6" ry="3.5" fill="#f29a9a" opacity=".5"/><ellipse cx="22" cy="34" rx="6" ry="3.5" fill="#f29a9a" opacity=".5"/>`}
  <g class="npc-boca" transform="translate(0 44)">
    <path class="boca-fechada" d="${bocaFechada}" stroke="#a5453c" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <ellipse class="boca-aberta" cx="0" cy="1" rx="8" ry="6" fill="#7a2a24"/>
  </g>
  ${o.brinco ? `<circle cx="-38" cy="34" r="2.6" fill="#ffd23f"/><circle cx="38" cy="34" r="2.6" fill="#ffd23f"/>` : ''}
</g></g>`;
}
