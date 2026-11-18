/* ==========================================================
   cenas2.js — cenários dos Mundos 2 a 5 e os mapas temáticos.
   Cada cenário sai de um molde (balcão, rua, metrô, mesa,
   escritório, festa, porta) com variações de cor e objetos.
   O NPC fica sempre à direita; o Pavio ocupa a esquerda.
   ========================================================== */
import { npcSVG } from './personagens.js';
import { CENAS as CENAS1, mapaSVG as mapaAeroporto, MAPA_W, MAPA_H, abre, grad, fonte, mono, pisoLinhas, nuvem, arvores } from './cenas.js';

const fechou = '</svg>';
const placaSVG = (x, y, w, texto, cor, fundo, borda = 'none') => {
  const tam = Math.min(18, Math.floor((w - 20) / (texto.length * 0.68)));
  return `<g transform="translate(${x} ${y})"><rect width="${w}" height="44" rx="10" fill="${fundo}" stroke="${borda}" stroke-width="3"/><text x="${w / 2}" y="${22 + tam * 0.36}" text-anchor="middle" font-size="${tam}" ${fonte} fill="${cor}" letter-spacing="1.5">${texto}</text></g>`;
};
const janelasPredio = (x, y, w, h, cor, acesas = 0.5, seed = 1) => {
  let s = seed, out = '';
  for (let yy = y + 10; yy < y + h - 14; yy += 22) for (let xx = x + 8; xx < x + w - 12; xx += 18) {
    s = (s * 9301 + 49297) % 233280;
    out += `<rect x="${xx}" y="${yy}" width="10" height="12" rx="2" fill="${s / 233280 < acesas ? cor : '#2b3440'}" opacity=".9"/>`;
  }
  return out;
};

/* ---------- Molde: balcão (hotel, farmácia, museu, loja, trocas, recepção) ---------- */
function balcaoSVG({ parede, piso, balcao, tampo, npc, placa, fundo = '', frente = '', etiqueta = '' }) {
  return `${abre(grad('bParede', parede[0], parede[1]) + grad('bPiso', piso[0], piso[1]) + grad('bBalcao', balcao[0], balcao[1]))}
  <rect width="400" height="720" fill="url(#bParede)"/>
  ${fundo}
  ${placaSVG(22, 140, 200, ...placa)}
  <rect x="0" y="460" width="400" height="260" fill="url(#bPiso)"/>
  ${pisoLinhas(460, piso[1])}
  ${npcSVG(npc, 300, 318)}
  <g>
    <rect x="150" y="426" width="270" height="14" rx="4" fill="${tampo}"/>
    <rect x="160" y="438" width="260" height="130" fill="url(#bBalcao)"/>
    ${etiqueta ? `<text x="290" y="500" text-anchor="middle" font-size="15" ${fonte} fill="${tampo}" opacity=".95" letter-spacing="2">${etiqueta}</text>` : ''}
    ${frente}
  </g>
${fechou}`;
}

const hotelSVG = () => balcaoSVG({
  parede: ['#f1e6d2', '#d9c6a6'], piso: ['#a48a6a', '#6e5a44'], balcao: ['#4a3426', '#2c1e15'], tampo: '#c9a227', npc: 'recepcionista',
  placa: ['GRAND HOTEL', '#ffd23f', '#1d2b3a'], etiqueta: 'RECEPTION',
  fundo: `<g transform="translate(240 150)"><rect width="140" height="96" rx="8" fill="#6b4a34"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${18 + (i % 6) * 21}" cy="${24 + Math.floor(i / 6) * 40}" r="4" fill="#c9a227"/><rect x="${15 + (i % 6) * 21}" y="${28 + Math.floor(i / 6) * 40}" width="6" height="14" rx="2" fill="${i % 4 ? '#e3c35a' : '#f4f4f0'}"/>`).join('')}</g>
    ${['NEW YORK', 'LONDON', 'TOKYO'].map((c, i) => `<g transform="translate(${44 + i * 62} 214)"><circle r="20" fill="#fff" stroke="#6b4a34" stroke-width="4"/><path d="M0 0 v-12 M0 0 l${8 - i * 4} 5" stroke="#1d2b3a" stroke-width="2.5" stroke-linecap="round"/><text y="36" text-anchor="middle" font-size="8" ${fonte} fill="#6b4a34">${c}</text></g>`).join('')}
    <g transform="translate(26 300)"><rect x="18" y="80" width="40" height="44" rx="6" fill="#8a5a3c"/><circle cx="38" cy="60" r="34" fill="#3f9a3a"/><circle cx="24" cy="48" r="16" fill="#5fbf4c"/></g>`,
  frente: '<g transform="translate(372 404)"><ellipse cx="0" cy="22" rx="16" ry="5" fill="#8a7020"/><path d="M-13 21 q13 -30 26 0 z" fill="#e3c35a"/><circle cx="0" cy="-6" r="3" fill="#e3c35a"/></g>',
});

const farmaciaSVG = () => balcaoSVG({
  parede: ['#f2fbf6', '#cfe9dc'], piso: ['#cfd8dc', '#9aa7b0'], balcao: ['#f4f4f0', '#d7dee3'], tampo: '#1f9d55', npc: 'farmaceutica',
  placa: ['PHARMACY', '#ffffff', '#1f9d55'], etiqueta: 'Rx',
  fundo: `<g transform="translate(240 140)">${[0, 1, 2].map((r) => `<rect x="0" y="${r * 58 + 44}" width="150" height="6" fill="#9aa7b0"/>${Array.from({ length: 6 }, (_, c) => `<rect x="${6 + c * 24}" y="${r * 58 + 18}" width="18" height="26" rx="3" fill="${['#ff5a4e', '#3d8bff', '#ffd23f', '#21c46b', '#9b6bff', '#ff8a3d'][(c + r * 2) % 6]}"/>`).join('')}`).join('')}</g>
    <g transform="translate(70 230)"><rect x="-26" y="-8" width="52" height="16" rx="3" fill="#21c46b"/><rect x="-8" y="-26" width="16" height="52" rx="3" fill="#21c46b"/></g>`,
  frente: '<g transform="translate(176 456)"><rect width="40" height="30" rx="4" fill="#fff" stroke="#21c46b" stroke-width="2"/><rect x="6" y="8" width="28" height="4" rx="2" fill="#21c46b"/><rect x="6" y="16" width="20" height="4" rx="2" fill="#9aa7b0"/></g>',
});

const museuSVG = () => balcaoSVG({
  parede: ['#ece7df', '#cfc6b6'], piso: ['#c2b59b', '#8f8068'], balcao: ['#7a1f2b', '#4f1019'], tampo: '#c9a227', npc: 'bilheteira',
  placa: ['CITY MUSEUM', '#f4f4f0', '#7a1f2b'], etiqueta: 'TICKETS',
  fundo: `${[[244, 150, 72, 90, '#3d8bff', '#ffd23f'], [324, 160, 60, 70, '#ff8a3d', '#21c46b'], [40, 220, 80, 60, '#9b6bff', '#ff5a7a']].map(([x, y, w, h, a, b]) => `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" fill="#c9a227"/><rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="${a}"/><circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 5}" fill="${b}"/><path d="M6 ${h - 6} l${w / 3} -${h / 3} l${w / 3} ${h / 4} l${w / 3 - 12} -${h / 5} v${h / 5 + h / 4 - h / 4} z" fill="#111" opacity=".25"/></g>`).join('')}
    <g transform="translate(130 300)"><rect x="-10" y="40" width="20" height="90" fill="#d7dee3"/><circle cy="20" r="26" fill="#d7dee3"/><rect x="-30" y="128" width="60" height="12" fill="#b9c4cb"/></g>`,
});

const lojaSVG = () => balcaoSVG({
  parede: ['#fde7ee', '#f3c6d4'], piso: ['#d9d2cc', '#a89e95'], balcao: ['#2b2b2b', '#111111'], tampo: '#ff5a7a', npc: 'vendedora',
  placa: ['URBAN STYLE', '#ffffff', '#111111'], etiqueta: 'SALE -30%',
  fundo: `<g transform="translate(236 168)"><rect x="0" y="0" width="150" height="5" rx="2" fill="#56656e"/>${['#ff5a7a', '#3d8bff', '#ffd23f', '#21c46b', '#111', '#ff8a3d'].map((c, i) => `<path d="M${10 + i * 24} 4 l-2 8 h-8 l-4 34 h28 l-4 -34 h-8 z" fill="${c}"/>`).join('')}</g>
    <g transform="translate(40 230)"><rect width="10" height="200" x="30" fill="#56656e"/><rect x="0" y="0" width="70" height="5" fill="#56656e"/>${[0, 1, 2].map((i) => `<path d="M${8 + i * 20} 4 v6 q-6 4 -6 14 v60 h16 v-60 q0 -10 -6 -14" fill="${['#1d2b3a', '#c42323', '#e8c66a'][i]}"/>`).join('')}</g>`,
  frente: '<g transform="translate(176 448)"><rect width="56" height="34" rx="4" fill="#d7dee3"/><rect x="6" y="6" width="44" height="12" rx="2" fill="#163b5c"/><text x="28" y="16" text-anchor="middle" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#9be36d">$59.99</text></g>',
});

const trocasSVG = () => balcaoSVG({
  parede: ['#e6eef7', '#c3d3e6'], piso: ['#b9c2c8', '#7f8a92'], balcao: ['#3d8bff', '#1f4fa8'], tampo: '#ffd23f', npc: 'trocas',
  placa: ['RETURNS &amp; EXCHANGES', '#1d2b3a', '#ffd23f'], etiqueta: 'CUSTOMER SERVICE',
  fundo: `${[[244, 170, 60, 44], [312, 180, 56, 34], [258, 214, 80, 40], [330, 214, 50, 40]].map(([x, y, w, h]) => `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" fill="#c7915a" stroke="#8a5a3c" stroke-width="2"/><rect x="${w / 2 - 5}" width="10" height="${h}" fill="#e3c35a" opacity=".6"/></g>`).join('')}`,
  frente: '<g transform="translate(180 452)"><rect width="46" height="30" rx="4" fill="#fff"/><rect x="6" y="6" width="34" height="3" fill="#9aa7b0"/><rect x="6" y="12" width="26" height="3" fill="#9aa7b0"/><rect x="6" y="18" width="30" height="3" fill="#9aa7b0"/></g>',
});

const portariaSVG = () => balcaoSVG({
  parede: ['#ecebf7', '#c9c3e6'], piso: ['#8a86a8', '#545072'], balcao: ['#ffffff', '#d9d6ec'], tampo: '#5b37b3', npc: 'portaria',
  placa: ['NEXUS CORP', '#9be36d', '#11161b'], etiqueta: 'NEXUS',
  fundo: `<g opacity=".7">${[240, 290, 340, 390].map((x) => `<rect x="${x - 4}" y="100" width="4" height="360" fill="#9aa7b0"/>`).join('')}<rect x="236" y="100" width="164" height="360" fill="#bfe4ff" opacity=".35"/></g>
    <g transform="translate(40 330)"><rect x="14" y="70" width="40" height="44" rx="6" fill="#56656e"/><path d="M34 70 q-30 -30 -20 -70 q10 30 20 40 q4 -40 24 -50 q-6 40 -4 60 q14 -20 30 -20 q-14 20 -30 40 z" fill="#3f9a3a"/></g>`,
});

/* ---------- Metrô: azulejo, placa SUBWAY e cabine de bilhetes ---------- */
function metroSVG() {
  return `${abre(grad('mParede', '#f4f4f0', '#d7dee3') + grad('mPiso', '#6b747a', '#3a424b'))}
  <rect width="400" height="720" fill="url(#mParede)"/>
  <g stroke="#c5ccd1" stroke-width="1.5">${Array.from({ length: 18 }, (_, i) => `<line x1="0" y1="${100 + i * 22}" x2="400" y2="${100 + i * 22}"/>`).join('')}${Array.from({ length: 14 }, (_, i) => `<line x1="${i * 30}" y1="100" x2="${i * 30}" y2="470"/>`).join('')}</g>
  <rect x="0" y="250" width="400" height="18" fill="#1f4fa8"/>
  <g transform="translate(22 136)"><rect width="200" height="56" rx="8" fill="#11161b"/><text x="16" y="36" font-size="22" ${fonte} fill="#fff">SUBWAY</text>
    ${[['A', '#1f4fa8'], ['C', '#1f4fa8'], ['N', '#ffd23f'], ['4', '#21c46b']].map(([l, c], i) => `<circle cx="${124 + i * 20}" cy="28" r="9" fill="${c}"/><text x="${124 + i * 20}" y="32" text-anchor="middle" font-size="11" ${fonte} fill="${c === '#ffd23f' ? '#111' : '#fff'}">${l}</text>`).join('')}</g>
  <g transform="translate(30 290)"><rect width="130" height="90" rx="6" fill="#fff" stroke="#56656e" stroke-width="3"/>
    <path d="M12 70 q30 -50 60 -20 t50 -30" stroke="#1f4fa8" stroke-width="4" fill="none"/><path d="M14 30 q40 20 100 40" stroke="#21c46b" stroke-width="4" fill="none"/><path d="M60 10 v70" stroke="#ffd23f" stroke-width="4"/>
    <text x="65" y="86" text-anchor="middle" font-size="8" ${fonte} fill="#56656e">SUBWAY MAP</text></g>
  <rect x="0" y="470" width="400" height="250" fill="url(#mPiso)"/>
  ${pisoLinhas(470, '#2b3440')}
  ${npcSVG('metro', 300, 318)}
  <g>
    <rect x="186" y="250" width="224" height="8" fill="#56656e"/>
    <rect x="186" y="256" width="224" height="176" fill="#bfe4ff" opacity=".18"/>
    <path d="M206 276 l40 -10 M350 286 l40 -12" stroke="#fff" stroke-width="3" opacity=".4" stroke-linecap="round"/>
    <rect x="186" y="250" width="8" height="190" fill="#56656e"/><rect x="402" y="250" width="8" height="190" fill="#56656e"/>
    <rect x="176" y="430" width="234" height="14" rx="4" fill="#8d9aa3"/>
    <rect x="186" y="444" width="224" height="120" fill="#1f4fa8"/>
    <text x="298" y="496" text-anchor="middle" font-size="15" ${fonte} fill="#ffd23f" letter-spacing="2">TOKENS · CARDS</text>
    <g transform="translate(206 520)"><rect width="56" height="22" rx="4" fill="#11161b"/><text x="28" y="15" text-anchor="middle" font-size="10" ${mono} fill="#9be36d">$2.90</text></g>
  </g>
${fechou}`;
}

/* ---------- Rua: prédios, calçada; carrinho de hot dog ou táxi ---------- */
function ruaSVG({ noite = false, taxi = false }) {
  const ceu = noite ? ['#0f1a3a', '#36305e'] : ['#7fc4ea', '#d7efff'];
  const predios = [[0, 120, 90, 360, '#8f7a6a'], [84, 180, 80, 300, '#b45f4a'], [160, 90, 100, 390, '#6b7a8a'], [256, 150, 80, 330, '#a3906f'], [330, 110, 90, 370, '#5f6b7a']];
  return `${abre(grad('rCeu', ...ceu) + grad('rRua', '#4a5258', '#2c3236'))}
  <rect width="400" height="720" fill="url(#rCeu)"/>
  ${noite ? '<circle cx="320" cy="70" r="22" fill="#fff6d8"/>' : `<g class="c-nuvem" style="--d:60s">${nuvem(80, 80, .6)}</g>`}
  ${predios.map(([x, y, w, h, c], i) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>${janelasPredio(x, y, w, h, noite ? '#ffe9a8' : '#bfe4ff', noite ? 0.55 : 0.8, i + 3)}`).join('')}
  <rect x="0" y="470" width="400" height="40" fill="#b9c2c8"/>
  <rect x="0" y="506" width="400" height="214" fill="url(#rRua)"/>
  <g fill="#f4f4f0">${[0, 1, 2, 3, 4].map((i) => `<rect x="${i * 90}" y="610" width="50" height="8" rx="2"/>`).join('')}</g>
  <!-- placa de rua e semáforo -->
  <g transform="translate(40 300)"><rect x="0" y="0" width="6" height="180" fill="#2f3b44"/><rect x="-30" y="10" width="80" height="20" rx="3" fill="#0f7a43"/><text x="10" y="25" text-anchor="middle" font-size="11" ${fonte} fill="#fff">5th Ave</text>
    <rect x="-8" y="50" width="22" height="56" rx="5" fill="#11161b"/><circle cx="3" cy="62" r="6" fill="${noite ? '#ff5a4e' : '#5a2424'}"/><circle cx="3" cy="78" r="6" fill="#5a4a14"/><circle cx="3" cy="94" r="6" fill="${noite ? '#1d4a2a' : '#21c46b'}" class="c-pisca" style="animation-duration:2s"/></g>
  ${taxi ? taxiSVG() : hotdogSVG()}
${fechou}`;
}
function hotdogSVG() {
  return `<path d="M200 270 q100 -60 200 0 z" fill="#c42323"/><path d="M233 252 q67 -40 134 0" stroke="#ffd23f" stroke-width="10" fill="none"/>
  <rect x="386" y="268" width="6" height="170" fill="#8d9aa3"/><path d="M389 268 q-40 -6 -89 -12" stroke="#8d9aa3" stroke-width="4" fill="none"/>
  ${npcSVG('hotdog', 300, 330)}
  <g>
    <rect x="186" y="430" width="230" height="16" rx="4" fill="#c5ccd1"/>
    <rect x="196" y="444" width="210" height="96" rx="6" fill="#d7dee3" stroke="#8d9aa3" stroke-width="3"/>
    <text x="300" y="486" text-anchor="middle" font-size="18" ${fonte} fill="#c42323">HOT DOGS</text>
    <text x="300" y="512" text-anchor="middle" font-size="13" ${fonte} fill="#1d2b3a">$2</text>
    <circle cx="220" cy="548" r="14" fill="#2b2b2b"/><circle cx="380" cy="548" r="14" fill="#2b2b2b"/>
    <g transform="translate(230 416)"><rect width="34" height="12" rx="6" fill="#e2a64a"/><rect x="4" y="3" width="26" height="6" rx="3" fill="#b5541a"/><path d="M6 6 q4 -3 8 0 t8 0 t8 0" stroke="#ffd23f" stroke-width="2" fill="none"/></g>
  </g>`;
}
function taxiSVG() {
  // Táxi visto de lado: o motorista aparece pela janela da frente.
  return `<g>
    <rect x="276" y="336" width="70" height="20" rx="4" fill="#11161b"/><text x="311" y="350" text-anchor="middle" font-size="11" ${fonte} fill="#ffd23f">TAXI</text>
    <path d="M230 356 h196 l8 16 h-212 z" fill="#ffd23f" stroke="#b58a00" stroke-width="3"/>
    <polygon points="238,372 334,372 334,448 206,448" fill="#bfe4ff" opacity=".22"/>
    <polygon points="346,372 422,372 444,448 346,448" fill="#bfe4ff" opacity=".22"/>
    ${npcSVG('taxista', 290, 396, 0.72)}
    <path d="M232 372 l-32 76" stroke="#ffd23f" stroke-width="12" stroke-linecap="round"/>
    <rect x="334" y="370" width="12" height="80" fill="#ffd23f"/>
    <path d="M424 372 l22 76" stroke="#ffd23f" stroke-width="12"/>
    <rect x="150" y="444" width="300" height="84" rx="18" fill="#ffd23f" stroke="#b58a00" stroke-width="3"/>
    <g fill="#11161b">${Array.from({ length: 10 }, (_, i) => `<rect x="${170 + i * 28}" y="484" width="14" height="10" opacity="${i % 2 ? 1 : 0}"/><rect x="${184 + i * 28}" y="494" width="14" height="10" opacity="${i % 2 ? 0 : 1}"/>`).join('')}</g>
    <rect x="300" y="460" width="22" height="5" rx="2" fill="#b58a00"/>
    <circle cx="206" cy="530" r="24" fill="#2b2b2b"/><circle cx="206" cy="530" r="9" fill="#8d9aa3"/>
    <circle cx="402" cy="530" r="24" fill="#2b2b2b"/><circle cx="402" cy="530" r="9" fill="#8d9aa3"/>
    <g transform="translate(352 454)"><rect width="56" height="22" rx="4" fill="#11161b"/><text x="28" y="15" text-anchor="middle" font-size="10" ${mono} fill="#ff5a4e" class="c-pisca">$80.00</text></g>
  </g>`;
}

/* ---------- Mesa: restaurante, encontro e jantar em família ---------- */
function mesaSVG({ npc, noite = false, parede = ['#5a2a2a', '#3a1818'], toalha = '#f4f4f0', placa = '', casa = false }) {
  const jan = noite ? ['#0f1a3a', '#36305e'] : ['#7fc4ea', '#d7efff'];
  return `${abre(grad('tParede', ...parede) + grad('tJan', ...jan) + grad('tPiso', '#5a3826', '#3b2418'))}
  <rect width="400" height="720" fill="url(#tParede)"/>
  ${casa
    ? `<g opacity=".25">${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 44}" y="100" width="22" height="380" fill="#fff"/>`).join('')}</g>`
    : `<rect x="0" y="380" width="400" height="100" fill="#000" opacity=".18"/><rect x="0" y="376" width="400" height="6" fill="#c9a227" opacity=".7"/>`}
  <!-- janela -->
  <g transform="translate(200 120)"><rect width="180" height="170" rx="8" fill="url(#tJan)" stroke="#2c1e15" stroke-width="8"/>
    ${noite ? janelasPredio(10, 70, 60, 100, '#ffe9a8', 0.5, 5) + janelasPredio(84, 40, 80, 130, '#ffe9a8', 0.5, 8) : `<g class="c-nuvem" style="--d:50s">${nuvem(60, 50, .4)}</g><rect x="0" y="120" width="180" height="50" fill="#5fae4a"/>`}
    <rect x="86" y="0" width="8" height="170" fill="#2c1e15"/></g>
  <!-- quadro -->
  <g transform="translate(30 150)"><rect width="110" height="80" fill="#c9a227"/><rect x="6" y="6" width="98" height="68" fill="${casa ? '#7fc4ea' : '#2f6b3a'}"/>${casa ? '<circle cx="34" cy="40" r="12" fill="#f1c7a0"/><circle cx="62" cy="38" r="12" fill="#f1c7a0"/><circle cx="84" cy="44" r="9" fill="#f1c7a0"/><rect x="20" y="52" width="80" height="22" fill="#3b4a2a"/>' : '<path d="M6 74 l30 -30 l20 18 l18 -26 l30 38 z" fill="#8fd16a"/><circle cx="80" cy="22" r="8" fill="#ffd23f"/>'}</g>
  ${placa ? placaSVG(22, 260, 140, ...placa) : ''}
  <!-- luminária -->
  <line x1="200" y1="0" x2="200" y2="70" stroke="#2c1e15" stroke-width="3"/><path d="M170 96 q30 -40 60 0 z" fill="#c9a227"/><ellipse cx="200" cy="98" rx="12" ry="5" fill="#ffe9a8"/>
  <rect x="0" y="480" width="400" height="240" fill="url(#tPiso)"/>
  ${npcSVG(npc, 290, 312)}
  <!-- mesa com toalha -->
  <g>
    <path d="M110 452 h300 l10 120 h-320 z" fill="${toalha}"/>
    <path d="M110 452 h300 v14 h-300 z" fill="#000" opacity=".06"/>
    <ellipse cx="300" cy="462" rx="44" ry="10" fill="#fff" stroke="#c5ccd1" stroke-width="2"/><ellipse cx="300" cy="460" rx="26" ry="5" fill="${casa ? '#c7782f' : '#e2a64a'}"/>
    <rect x="364" y="410" width="12" height="40" rx="5" fill="#bfe4ff" opacity=".7" stroke="#9aa7b0"/><path d="M366 430 h8 v18 h-8 z" fill="${noite ? '#7a1f2b' : '#ff8a3d'}"/>
    ${noite ? '<rect x="226" y="420" width="8" height="30" fill="#f4f4f0"/><path d="M230 404 q6 8 0 16 q-6 -8 0 -16" fill="#ffd23f" class="c-pisca" style="animation-duration:1.4s"/>' : ''}
    ${casa ? '<g transform="translate(180 440)"><ellipse cx="0" cy="10" rx="34" ry="10" fill="#fff"/><ellipse cx="0" cy="4" rx="26" ry="14" fill="#b5541a"/><path d="M-8 -6 q8 -6 16 0" stroke="#fff" stroke-width="3" fill="none"/></g>' : ''}
  </g>
${fechou}`;
}

/* ---------- Escritório: entrevista, reunião, videochamada, apresentação, chefe ---------- */
function escritorioSVG({ npc, tipo = 'entrevista' }) {
  const escuro = tipo === 'chefe';
  const parede = escuro ? ['#3a2a22', '#22180f'] : ['#e9ecf2', '#c9cfdb'];
  const tela = tipo === 'call';
  return `${abre(grad('oParede', ...parede) + grad('oCeu', '#7fb4ea', '#d7efff') + grad('oMesa', escuro ? '#6b4a34' : '#f4f4f0', escuro ? '#3b2418' : '#c5ccd1'))}
  <rect width="400" height="720" fill="url(#oParede)"/>
  <!-- janelão com a cidade -->
  <g transform="translate(${tipo === 'reuniao' || tipo === 'apresentacao' ? 230 : 20} 110)">
    <rect width="${tipo === 'reuniao' || tipo === 'apresentacao' ? 160 : 360}" height="200" fill="url(#oCeu)"/>
    ${[[10, 80, 50], [70, 40, 60], [140, 100, 40], [190, 60, 70], [270, 90, 60]].filter(([x]) => x < (tipo === 'reuniao' || tipo === 'apresentacao' ? 150 : 350)).map(([x, y, w], i) => `<rect x="${x}" y="${y}" width="${w}" height="${200 - y}" fill="#8a9bb0"/>${janelasPredio(x, y, w, 200 - y, '#e8f4ff', 0.6, i + 11)}`).join('')}
    ${Array.from({ length: tipo === 'reuniao' || tipo === 'apresentacao' ? 3 : 5 }, (_, i) => `<rect x="${i * 80}" y="0" width="5" height="200" fill="${escuro ? '#22180f' : '#9aa7b0'}"/>`).join('')}
  </g>
  ${tipo === 'reuniao' ? `<g transform="translate(18 120)"><rect width="190" height="130" rx="6" fill="#fff" stroke="#9aa7b0" stroke-width="4"/>${[[30, 60], [70, 40], [110, 76], [150, 96]].map(([x, h]) => `<rect x="${x}" y="${110 - h}" width="24" height="${h}" fill="${h > 70 ? '#21c46b' : '#3d8bff'}"/>`).join('')}<path d="M20 90 l50 -40 l40 20 l60 -50" stroke="#ff5a4e" stroke-width="4" fill="none"/></g>` : ''}
  ${tipo === 'apresentacao' ? `<g transform="translate(18 104)"><rect width="200" height="150" rx="4" fill="#fff" stroke="#56656e" stroke-width="3"/><text x="100" y="26" text-anchor="middle" font-size="13" ${fonte} fill="#1d2b3a">RESULTS 2026</text>${[[30, 40], [70, 60], [110, 80], [150, 104]].map(([x, h]) => `<rect x="${x}" y="${136 - h}" width="26" height="${h}" fill="#9b6bff"/>`).join('')}<text x="176" y="44" font-size="14" ${fonte} fill="#21c46b">+20%</text></g>` : ''}
  ${escuro ? `<g transform="translate(36 340)"><rect width="70" height="90" rx="4" fill="#c9a227"/><rect x="8" y="8" width="54" height="74" fill="#22180f"/><text x="35" y="52" text-anchor="middle" font-size="10" ${fonte} fill="#c9a227">BEST</text><text x="35" y="66" text-anchor="middle" font-size="10" ${fonte} fill="#c9a227">BOSS</text></g>` : ''}
  <rect x="0" y="480" width="400" height="240" fill="${escuro ? '#2c1e15' : '#8a86a8'}"/>
  ${tela
    ? `<g transform="translate(176 230)"><rect width="220" height="170" rx="10" fill="#11161b"/><clipPath id="oTela"><rect x="8" y="8" width="204" height="144" rx="4"/></clipPath><rect x="8" y="8" width="204" height="144" rx="4" fill="#3a4a5c"/>
        <g clip-path="url(#oTela)"><rect x="8" y="8" width="204" height="144" fill="#d8e6f0"/><rect x="140" y="20" width="60" height="70" fill="#9fb3c8"/>${npcSVG(npc, 110, 70, 0.7)}</g>
        <circle cx="200" cy="140" r="6" fill="#ff5a4e"/><rect x="96" y="170" width="28" height="40" fill="#56656e"/><rect x="70" y="206" width="80" height="10" rx="4" fill="#56656e"/></g>`
    : npcSVG(npc, 290, 312)}
  <!-- mesa -->
  <g>
    <rect x="${tela ? 120 : 150}" y="440" width="${tela ? 300 : 270}" height="18" rx="4" fill="url(#oMesa)"/>
    <rect x="${tela ? 140 : 170}" y="456" width="${tela ? 260 : 230}" height="110" fill="${escuro ? '#4a3426' : '#d7dee3'}"/>
    ${tipo === 'chefe' ? `<g transform="translate(320 414)"><rect width="74" height="24" rx="3" fill="#c9a227"/><text x="37" y="17" text-anchor="middle" font-size="11" ${fonte} fill="#22180f">THE BOSS</text></g>` : `<g transform="translate(330 404)"><rect width="56" height="36" rx="3" fill="#2b3440"/><rect x="4" y="4" width="48" height="26" fill="#3d8bff" opacity=".6"/><rect x="-6" y="36" width="68" height="5" rx="2" fill="#56656e"/></g>`}
    <g transform="translate(${tela ? 160 : 190} 420)"><rect width="40" height="20" fill="#fff" transform="rotate(-6)"/><rect x="8" y="-4" width="40" height="20" fill="#f4f4f0" stroke="#c5ccd1" transform="rotate(4)"/></g>
    <g transform="translate(${tela ? 250 : 250} 416)"><rect width="18" height="22" rx="3" fill="${escuro ? '#c42323' : '#21c46b'}"/><path d="M18 6 q8 0 8 6 q0 6 -8 6" stroke="${escuro ? '#c42323' : '#21c46b'}" stroke-width="3" fill="none"/></g>
  </g>
${fechou}`;
}

/* ---------- Festa: sala com luzinhas, balões e a ilha da cozinha ---------- */
function festaSVG({ npc, bar = false }) {
  return `${abre(grad('fParede', bar ? '#2b1f3a' : '#4a2a5c', bar ? '#140f22' : '#2a1838') + grad('fIlha', '#f4f4f0', '#c5ccd1'))}
  <rect width="400" height="720" fill="url(#fParede)"/>
  <!-- varal de luzinhas -->
  <path d="M0 120 q100 50 200 0 t200 0" stroke="#11161b" stroke-width="2" fill="none"/>
  ${Array.from({ length: 12 }, (_, i) => { const x = i * 34 + 14, y = 120 + Math.sin((x / 400) * Math.PI * 2) * 22 + 10; return `<circle cx="${x}" cy="${y}" r="6" fill="${['#ffd23f', '#ff5a7a', '#21c46b', '#3d8bff'][i % 4]}" class="c-pisca" style="animation-duration:${1 + (i % 3) * 0.5}s"/>`; }).join('')}
  ${bar
    ? `<g transform="translate(220 170)">${[0, 1].map((r) => `<rect x="0" y="${r * 60 + 50}" width="170" height="6" fill="#6b4a34"/>${Array.from({ length: 7 }, (_, c) => `<rect x="${8 + c * 23}" y="${r * 60 + (c % 2 ? 14 : 22)}" width="12" height="${c % 2 ? 36 : 28}" rx="3" fill="${['#21c46b', '#c9a227', '#7a1f2b', '#bfe4ff', '#ff8a3d'][(c + r) % 5]}" opacity=".9"/>`).join('')}`).join('')}</g>`
    : `<g transform="translate(26 170)">${[[20, 0, '#ff5a7a'], [56, 20, '#ffd23f'], [0, 40, '#3d8bff']].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="18" ry="22" fill="${c}"/><path d="M${x} ${y + 22} q-6 30 4 60" stroke="#fff" stroke-width="1.5" fill="none" opacity=".6"/>`).join('')}</g>
       <g transform="translate(240 170)"><rect width="140" height="90" fill="#c9a227"/><rect x="6" y="6" width="128" height="78" fill="#ff8a3d"/><circle cx="96" cy="34" r="16" fill="#ffd23f"/><path d="M6 84 q40 -40 70 -10 q30 -30 58 -6 v16 z" fill="#4a2a5c"/></g>`}
  <rect x="0" y="470" width="400" height="250" fill="${bar ? '#1c1424' : '#6b4a34'}"/>
  ${npcSVG(npc, 296, 316)}
  <g>
    <rect x="150" y="430" width="270" height="16" rx="5" fill="${bar ? '#6b4a34' : '#f4f4f0'}"/>
    <rect x="160" y="444" width="260" height="126" fill="${bar ? '#3b2418' : 'url(#fIlha)'}"/>
    ${[[190, '#ff8a3d'], [226, '#21c46b'], [380, '#ffd23f']].map(([x, c]) => `<g transform="translate(${x} 398)"><path d="M0 0 h22 l-4 32 h-14 z" fill="#bfe4ff" opacity=".6" stroke="#fff"/><path d="M2 12 h18 l-2 18 h-14 z" fill="${c}"/></g>`).join('')}
    <g transform="translate(270 416)"><ellipse cx="0" cy="12" rx="30" ry="8" fill="#fff"/><circle cx="-10" cy="6" r="7" fill="#e2a64a"/><circle cx="6" cy="4" r="7" fill="#c7782f"/><circle cx="16" cy="8" r="6" fill="#e2a64a"/></g>
  </g>
${fechou}`;
}

/* ---------- Porta do vizinho: corredor do prédio e a festa lá dentro ---------- */
function portaSVG() {
  return `${abre(grad('pParede', '#d9cfc0', '#b3a690') + grad('pDentro', '#ff5a7a', '#5b37b3'))}
  <rect width="400" height="720" fill="url(#pParede)"/>
  <rect x="0" y="470" width="400" height="250" fill="#7a6a58"/>
  <rect x="0" y="466" width="400" height="8" fill="#5a4a38"/>
  <!-- porta aberta com a festa lá dentro -->
  <rect x="200" y="140" width="190" height="334" fill="url(#pDentro)"/>
  ${Array.from({ length: 6 }, (_, i) => `<circle cx="${220 + i * 30}" cy="${170 + (i % 2) * 20}" r="7" fill="${['#ffd23f', '#21c46b', '#3d8bff'][i % 3]}" class="c-pisca" style="animation-duration:${0.6 + (i % 3) * 0.3}s"/>`).join('')}
  <g transform="translate(330 200)"><path d="M0 0 l20 0 l-6 30 z" fill="#ffd23f" opacity=".5"/><path d="M-30 30 l60 0 l-30 200 z" fill="#fff" opacity=".08"/></g>
  ${npcSVG('vizinho', 296, 300)}
  <rect x="196" y="136" width="198" height="340" fill="none" stroke="#5a3826" stroke-width="10"/>
  <path d="M196 140 l-60 30 v300 l60 6 z" fill="#8a5a3c" stroke="#5a3826" stroke-width="4"/>
  <circle cx="150" cy="320" r="6" fill="#c9a227"/>
  <g transform="translate(150 230)"><rect width="34" height="22" rx="3" fill="#c9a227"/><text x="17" y="16" text-anchor="middle" font-size="12" ${fonte} fill="#3b2418">4B</text></g>
  <rect x="220" y="478" width="150" height="20" rx="4" fill="#3f6b3a"/><text x="295" y="493" text-anchor="middle" font-size="10" ${fonte} fill="#cfe9dc">WELCOME</text>
  <!-- notas musicais -->
  ${[[250, 260], [360, 300], [300, 380]].map(([x, y], i) => `<text x="${x}" y="${y}" font-size="26" fill="#fff" opacity=".7" class="c-pisca" style="animation-duration:${1 + i * 0.4}s">♪</text>`).join('')}
${fechou}`;
}

/* ---------- Registro: todos os cenários do jogo ---------- */
export const CENAS = {
  ...CENAS1,
  // Mundo 2
  hotel: hotelSVG, metro: metroSVG, direcoes: () => ruaSVG({}), farmacia: farmaciaSVG, museu: museuSVG, taxi: () => ruaSVG({ noite: true, taxi: true }),
  // Mundo 3
  reserva: () => mesaSVG({ npc: 'hostess', noite: true, placa: ['BELLA NOTTE', '#ffd23f', '#2c1e15'] }),
  pedido: () => mesaSVG({ npc: 'garcom', noite: true }),
  reclamacao: () => mesaSVG({ npc: 'garcom', noite: true }),
  loja: lojaSVG, devolucao: trocasSVG,
  conta: () => mesaSVG({ npc: 'maitre', noite: true, parede: ['#2c1e15', '#140c08'] }),
  // Mundo 4
  portaria: portariaSVG,
  entrevista: () => escritorioSVG({ npc: 'recrutadora' }),
  reuniao: () => escritorioSVG({ npc: 'colega', tipo: 'reuniao' }),
  ligacao: () => escritorioSVG({ npc: 'cliente', tipo: 'call' }),
  apresentacao: () => escritorioSVG({ npc: 'diretora', tipo: 'apresentacao' }),
  promocao: () => escritorioSVG({ npc: 'chefe', tipo: 'chefe' }),
  // Mundo 5
  festa: () => festaSVG({ npc: 'anfitria' }),
  papo: () => festaSVG({ npc: 'estranho', bar: true }),
  encontro: () => mesaSVG({ npc: 'date', noite: true, parede: ['#3a1a2a', '#1f0c16'], toalha: '#ffe3ea' }),
  vizinho: portaSVG,
  debate: () => festaSVG({ npc: 'amigo', bar: true }),
  sogro: () => mesaSVG({ npc: 'sogro', noite: true, casa: true, parede: ['#7a8a5a', '#4a5a34'], toalha: '#fff6d8' }),
};

/* ==========================================================
   Mapas temáticos dos Mundos 2 a 5. Os enfeites ficam do lado
   oposto de cada parada; o marco do mundo fica perto do chefão.
   ========================================================== */
const predio = (x, y, c, h = 70, k = 1) => `<g transform="translate(${x - 26} ${y - h})"><rect width="52" height="${h}" rx="4" fill="${c}" stroke="#00000033" stroke-width="2"/>${janelasPredio(0, 0, 52, h, '#e8f4ff', 0.7, k)}</g>`;
const taxiMini = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-14" y="-7" width="28" height="14" rx="4" fill="#ffd23f"/><rect x="-7" y="-5" width="14" height="10" rx="2" fill="#3a4a5c"/></g>`;
const guardaSol = (x, y, c) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="22" rx="20" ry="6" fill="#00000022"/><circle r="22" fill="${c}"/><path d="M0 -22 v44 M-22 0 h44 M-15 -15 l30 30 M15 -15 l-30 30" stroke="#fff" stroke-width="3" opacity=".7"/><circle r="4" fill="#fff"/></g>`;
const torre = (x, y, c, h = 90) => `<g transform="translate(${x - 22} ${y - h})"><rect width="44" height="${h}" fill="${c}"/><g fill="#bfe4ff" opacity=".55">${Array.from({ length: Math.floor(h / 14) }, (_, i) => `<rect x="5" y="${6 + i * 14}" width="34" height="7"/>`).join('')}</g></g>`;
const casinha = (x, y, c) => `<g transform="translate(${x - 26} ${y - 40})"><rect y="14" width="52" height="36" fill="${c}"/><path d="M-6 16 l32 -24 l32 24 z" fill="#b5541a"/><rect x="20" y="30" width="12" height="20" fill="#6b4a34"/><rect x="6" y="22" width="10" height="10" fill="#bfe4ff"/><rect x="36" y="22" width="10" height="10" fill="#bfe4ff"/></g>`;
const baloes = (x, y) => `<g transform="translate(${x} ${y})">${[[-10, 0, '#ff5a7a'], [8, -8, '#ffd23f'], [0, -24, '#3d8bff']].map(([dx, dy, c]) => `<ellipse cx="${dx}" cy="${dy - 20}" rx="10" ry="13" fill="${c}"/><path d="M${dx} ${dy - 7} q-3 10 ${-dx} 24" stroke="#fff" stroke-width="1.2" fill="none"/>`).join('')}</g>`;

const TEMAS = {
  cidade: {
    chao: ['#a9b7c6', '#7f90a3'],
    padrao: '<pattern id="tm" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M0 40 h80 M40 0 v80" stroke="#ffffff" stroke-width="10" opacity=".25"/></pattern>',
    deco: (x, y, k) => (k % 3 === 2 ? `<rect x="${x - 36}" y="${y - 30}" width="72" height="56" rx="14" fill="#6fbf5a"/>${arvores([[x - 14, y - 6], [x + 16, y + 4]])}` : predio(x, y + 20, ['#e8d2b8', '#c7a98a', '#d9b0a0'][k % 3], 60 + (k % 2) * 30, k + 1)) + taxiMini(x + (x < 200 ? 50 : -50), y + 30),
    marco: () => `<g transform="translate(330 300)"><rect x="-18" y="-150" width="36" height="150" fill="#9aa7b0"/><rect x="-26" y="-60" width="52" height="60" fill="#8a9bb0"/><path d="M-12 -150 l12 -30 l12 30 z" fill="#c5ccd1"/><rect x="-1" y="-210" width="2" height="34" fill="#56656e"/>${janelasPredio(-18, -150, 36, 150, '#e8f4ff', 0.7, 4)}</g>${predio(70, 330, '#c7a98a', 100, 9)}`,
  },
  restaurante: {
    chao: ['#f3d9b1', '#e0b98a'],
    padrao: '<pattern id="tm" width="40" height="30" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="36" height="12" rx="4" fill="#c99a68" opacity=".35"/><rect x="-18" y="17" width="36" height="12" rx="4" fill="#c99a68" opacity=".35"/><rect x="22" y="17" width="36" height="12" rx="4" fill="#c99a68" opacity=".35"/></pattern>',
    deco: (x, y, k) => (k % 2 ? `${guardaSol(x - 18, y - 4, ['#ff5a4e', '#21c46b', '#3d8bff'][k % 3])}${guardaSol(x + 22, y + 18, '#ffd23f')}` : `<g transform="translate(${x - 34} ${y - 40})"><rect width="68" height="56" fill="#f4f4f0"/><path d="M-4 0 h76 l-6 18 h-64 z" fill="${['#c42323', '#0f7a43', '#1f4fa8'][k % 3]}"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${i * 15}" y="0" width="7" height="18" fill="#fff" opacity=".5"/>`).join('')}<rect x="10" y="26" width="20" height="30" fill="#6b4a34"/><rect x="38" y="26" width="22" height="16" fill="#bfe4ff"/></g>`),
    marco: () => `<g transform="translate(330 320)"><ellipse cy="10" rx="54" ry="18" fill="#9aa7b0"/><ellipse rx="46" ry="14" fill="#7fc4ea"/><rect x="-6" y="-46" width="12" height="46" fill="#c5ccd1"/><ellipse cy="-48" rx="20" ry="6" fill="#c5ccd1"/><path d="M0 -50 q-14 -20 -26 4 M0 -50 q14 -20 26 4" stroke="#7fc4ea" stroke-width="4" fill="none" class="c-pisca" style="animation-duration:1.6s"/></g>${guardaSol(70, 320, '#ff8a3d')}`,
  },
  trabalho: {
    chao: ['#cfcaea', '#a8a0d4'],
    padrao: '<pattern id="tm" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="58" height="58" fill="none" stroke="#ffffff" stroke-width="2" opacity=".3"/></pattern>',
    deco: (x, y, k) => torre(x, y + 30, ['#5b6fa8', '#3d8bff', '#7a6ab0'][k % 3], 70 + (k % 3) * 20) + (k % 2 ? `<g transform="translate(${x + (x < 200 ? 44 : -44)} ${y + 20})"><rect x="-8" y="-4" width="16" height="8" rx="3" fill="#56656e"/><circle cy="-12" r="10" fill="#3f9a3a"/></g>` : ''),
    marco: () => `${torre(330, 360, '#2f3b6a', 200)}<g transform="translate(330 150)"><rect x="-26" y="-20" width="52" height="22" rx="4" fill="#9b6bff"/><text y="-4" text-anchor="middle" font-size="13" ${fonte} fill="#fff">HQ</text></g>${torre(70, 340, '#5b6fa8', 120)}`,
  },
  social: {
    chao: ['#9ad67a', '#6fbf5a'],
    padrao: '<pattern id="tm" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="3" fill="#ff5a7a" opacity=".5"/><circle cx="40" cy="36" r="3" fill="#ffd23f" opacity=".6"/></pattern>',
    deco: (x, y, k) => (k % 2 ? casinha(x, y + 10, ['#fff6d8', '#ffd1dc', '#cfe9dc'][k % 3]) + baloes(x + (x < 200 ? 40 : -40), y + 10) : `${arvores([[x - 18, y], [x + 18, y + 16]])}<g transform="translate(${x} ${y + 40})"><rect x="-24" y="-4" width="48" height="8" rx="3" fill="#8a5a3c"/><rect x="-22" y="4" width="4" height="10" fill="#6b4a34"/><rect x="18" y="4" width="4" height="10" fill="#6b4a34"/></g>`),
    marco: () => `<g transform="translate(320 250)"><circle r="70" fill="none" stroke="#ff5a7a" stroke-width="6"/>${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<line x1="0" y1="0" x2="${Math.cos(a) * 70}" y2="${Math.sin(a) * 70}" stroke="#ff5a7a" stroke-width="3"/><circle cx="${Math.cos(a) * 70}" cy="${Math.sin(a) * 70}" r="9" fill="${['#ffd23f', '#3d8bff', '#21c46b'][i % 3]}"/>`; }).join('')}<path d="M-30 110 l30 -110 l30 110" stroke="#56656e" stroke-width="6" fill="none"/></g>${baloes(70, 300)}`,
  },
};

/* Mapa de qualquer mundo: o aeroporto tem desenho próprio; os outros saem do tema. */
export function mapaDe(M) {
  const T = TEMAS[M.id];
  if (!T) return mapaAeroporto();
  return `
<svg class="mapa-bg" viewBox="0 0 ${MAPA_W} ${MAPA_H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>${grad('tmChao', ...T.chao)}${T.padrao}</defs>
  <rect width="${MAPA_W}" height="${MAPA_H}" fill="url(#tmChao)"/>
  <rect width="${MAPA_W}" height="${MAPA_H}" fill="url(#tm)"/>
  ${T.marco()}
  ${M.nos.map((n, k) => (n.chefe ? '' : T.deco(n.x < 200 ? 310 : 90, n.y, k))).join('')}
  <g class="m-nuvem" style="--d:56s">${nuvem(60, 220, .9)}</g>
  <g class="m-nuvem" style="--d:66s;--o:-28s">${nuvem(260, 820, .8)}</g>
</svg>`;
}
