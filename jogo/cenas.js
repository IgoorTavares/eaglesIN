/* ==========================================================
   cenas.js — cenários e personagens em SVG (desenho vetorial,
   leve e nítido em qualquer tela). Protótipo G0.
   ========================================================== */
import { npcSVG } from './personagens.js';

/* ---------- Mapa do Mundo 1: o aeroporto visto de cima ---------- */
export const MAPA_W = 400, MAPA_H = 1300;

export function mapaSVG() {
  return `
<svg class="mapa-bg" viewBox="0 0 ${MAPA_W} ${MAPA_H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="mGrama" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8fd16a"/><stop offset="1" stop-color="#5fae4a"/>
    </linearGradient>
    <pattern id="mTufos" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M10 20 q3 -8 6 0 M40 48 q3 -8 6 0 M30 12 q2 -6 4 0" stroke="#4e9a3c" stroke-width="2" fill="none" stroke-linecap="round"/>
    </pattern>
  </defs>
  <rect width="${MAPA_W}" height="${MAPA_H}" fill="url(#mGrama)"/>
  <rect width="${MAPA_W}" height="${MAPA_H}" fill="url(#mTufos)" opacity=".6"/>

  <!-- pista de pouso -->
  <g transform="rotate(-18 200 140)">
    <rect x="-60" y="95" width="560" height="90" rx="6" fill="#4a5258"/>
    <g fill="#f4f4f0">${Array.from({ length: 11 }, (_, i) => `<rect x="${-40 + i * 52}" y="136" width="30" height="7" rx="2"/>`).join('')}</g>
    <rect x="-60" y="99" width="560" height="3" fill="#f4f4f0" opacity=".7"/>
    <rect x="-60" y="178" width="560" height="3" fill="#f4f4f0" opacity=".7"/>
  </g>
  <!-- aviãozinho decolando -->
  <g class="m-aviao">${aviaoTopo('#ffffff', '#21c46b')}</g>

  <!-- avião estacionado perto da imigração -->
  <g transform="translate(345 330) rotate(90)">${aviaoTopo('#ffffff', '#3d8bff')}</g>
  <!-- terminal -->
  <g transform="translate(-212 525)">
    <rect x="232" y="330" width="150" height="96" rx="14" fill="#dfe7ea" stroke="#9fb2ba" stroke-width="3"/>
    <rect x="248" y="346" width="118" height="20" rx="6" fill="#7fc4ea"/>
    <rect x="248" y="374" width="118" height="20" rx="6" fill="#7fc4ea"/>
    <text x="307" y="414" text-anchor="middle" font-size="11" font-weight="800" fill="#2b3a40" font-family="Inter,system-ui">TERMINAL</text>
  </g>
  <!-- torre de controle -->
  <g>
    <rect x="58" y="250" width="22" height="70" fill="#cfd8dc" stroke="#8fa2aa" stroke-width="2"/>
    <path d="M44 246 h50 l-6 -20 h-38 z" fill="#2f3b44"/>
    <rect x="50" y="228" width="38" height="12" fill="#7fc4ea"/>
    <circle cx="69" cy="222" r="4" fill="#ff5a4e" class="m-pisca"/>
  </g>
  <!-- estacionamento -->
  <g transform="translate(220 660)">
    <rect x="30" y="560" width="120" height="80" rx="10" fill="#6b747a"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${40 + i * 28}" y="572" width="18" height="28" rx="4" fill="${['#ff8a3d', '#3d8bff', '#ffd23f', '#f4f4f0'][i]}"/>`).join('')}
    ${[0, 1, 2].map((i) => `<rect x="${44 + i * 28}" y="608" width="18" height="28" rx="4" fill="${['#21c46b', '#ff5a4e', '#9b6bff'][i]}"/>`).join('')}
  </g>
  <!-- lago e árvores -->
  <ellipse cx="72" cy="1112" rx="50" ry="28" fill="#5cc3e8" stroke="#3aa6cf" stroke-width="3"/>
  ${arvores([[355, 800], [40, 690], [362, 585], [40, 478], [365, 420], [365, 1010], [380, 1150], [205, 1285], [200, 1060], [30, 1250], [205, 850], [210, 530]])}

  <!-- nuvens passando por cima -->
  <g class="m-nuvem" style="--d:46s">${nuvem(60, 260, 1)}</g>
  <g class="m-nuvem" style="--d:62s;--o:-30s">${nuvem(260, 760, .8)}</g>
  <g class="m-nuvem" style="--d:54s;--o:-12s">${nuvem(120, 1160, .9)}</g>
</svg>`;
}

export function aviaoTopo(corpo, cauda) {
  return `<g transform="translate(-30 0)">
    <ellipse cx="0" cy="0" rx="34" ry="7" fill="${corpo}" stroke="#9fb2ba" stroke-width="1.5"/>
    <path d="M-6 -4 L-16 -34 L-6 -34 L10 -4 Z M-6 4 L-16 34 L-6 34 L10 4 Z" fill="${corpo}" stroke="#9fb2ba" stroke-width="1.5"/>
    <path d="M-28 -2 L-36 -14 L-30 -14 L-22 -2 Z M-28 2 L-36 14 L-30 14 L-22 2 Z" fill="${cauda}"/>
    <circle cx="26" cy="0" r="3" fill="#7fc4ea"/>
  </g>`;
}

export function arvores(pts) {
  return pts.map(([x, y]) => `<g transform="translate(${x} ${y})"><ellipse cx="3" cy="16" rx="18" ry="6" fill="#3f7f31" opacity=".35"/><circle r="17" fill="#3f9a3a"/><circle cx="-6" cy="-5" r="9" fill="#5fbf4c"/></g>`).join('');
}

export function nuvem(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity=".85">
    <ellipse cx="0" cy="0" rx="46" ry="20" fill="#fff"/><ellipse cx="-20" cy="-12" rx="22" ry="18" fill="#fff"/><ellipse cx="18" cy="-14" rx="26" ry="22" fill="#fff"/>
  </g>`;
}

/* ---------- Cena: balcão de check-in ---------- */
export function checkinSVG() {
  const linhas = [
    ['NEW YORK', '10:45', 'ON TIME', '#9be36d'],
    ['LONDON', '11:20', 'BOARDING', '#ffd23f'],
    ['LISBOA', '12:05', 'DELAYED', '#ff7a6b'],
  ];
  return `
<svg class="cena-bg" viewBox="0 0 400 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="cParede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef3f4"/><stop offset="1" stop-color="#cfdbe0"/></linearGradient>
    <linearGradient id="cCeu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb6f2"/><stop offset="1" stop-color="#cdebff"/></linearGradient>
    <linearGradient id="cPiso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9b89e"/><stop offset="1" stop-color="#93806a"/></linearGradient>
    <linearGradient id="cBalcao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34414a"/><stop offset="1" stop-color="#1d252b"/></linearGradient>
    <clipPath id="cJanela"><rect x="0" y="30" width="400" height="230"/></clipPath>
  </defs>

  <rect width="400" height="720" fill="url(#cParede)"/>
  <!-- janelão com céu, nuvens e avião passando -->
  <g clip-path="url(#cJanela)">
    <rect x="0" y="30" width="400" height="230" fill="url(#cCeu)"/>
    <g class="c-nuvem" style="--d:40s">${nuvem(80, 90, .9)}</g>
    <g class="c-nuvem" style="--d:55s;--o:-20s">${nuvem(300, 140, .7)}</g>
    <g class="c-aviao">
      <g transform="translate(0 120)">
        <path d="M0 0 q10 -12 60 -12 h40 q16 0 22 10 q-6 10 -22 10 h-80 q-14 0 -20 -8 z" fill="#fff" stroke="#9fb2ba" stroke-width="1.5"/>
        <path d="M14 -8 l-10 -18 h10 l16 18 z" fill="#21c46b"/>
        <path d="M50 2 l-14 18 h12 l24 -18 z" fill="#dfe7ea" stroke="#9fb2ba"/>
        ${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${44 + i * 10}" cy="-4" r="2.4" fill="#7fc4ea"/>`).join('')}
      </g>
    </g>
    <rect x="0" y="232" width="400" height="28" fill="#9fb2ba" opacity=".5"/>
  </g>
  <g fill="#56656e">
    ${[0, 100, 200, 300, 392].map((x) => `<rect x="${x}" y="30" width="8" height="230"/>`).join('')}
    <rect x="0" y="140" width="400" height="6"/>
    <rect x="0" y="24" width="400" height="10"/>
    <rect x="0" y="256" width="400" height="10"/>
  </g>

  <!-- painel de partidas pendurado -->
  <g transform="translate(40 168)">
    <line x1="40" y1="-40" x2="40" y2="0" stroke="#56656e" stroke-width="3"/>
    <line x1="280" y1="-40" x2="280" y2="0" stroke="#56656e" stroke-width="3"/>
    <rect width="320" height="92" rx="10" fill="#12181b" stroke="#2f3b44" stroke-width="4"/>
    <text x="14" y="20" font-size="11" font-weight="800" letter-spacing="2" fill="#9be36d" font-family="ui-monospace,Consolas,monospace">DEPARTURES</text>
    ${linhas.map(([c, h, s, cor], i) => `
      <text x="14" y="${42 + i * 18}" font-size="12.5" font-weight="700" fill="#ffd23f" font-family="ui-monospace,Consolas,monospace">${c}</text>
      <text x="150" y="${42 + i * 18}" font-size="12.5" font-weight="700" fill="#ffd23f" font-family="ui-monospace,Consolas,monospace">${h}</text>
      <text x="216" y="${42 + i * 18}" font-size="12.5" font-weight="700" fill="${cor}" font-family="ui-monospace,Consolas,monospace" class="${s === 'BOARDING' ? 'c-pisca' : ''}">${s}</text>`).join('')}
  </g>

  <!-- placa CHECK-IN 12 -->
  <g transform="translate(300 286)">
    <rect width="86" height="34" rx="8" fill="#0f7a43"/>
    <text x="43" y="22" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="Inter,system-ui">CHECK-IN 12</text>
  </g>
  <!-- planta -->
  <g transform="translate(26 360)">
    <path d="M18 0 q-30 -40 -6 -70 q4 30 10 40 q2 -40 24 -56 q-6 40 -8 60 q14 -26 34 -26 q-18 22 -28 52 z" fill="#3f9a3a"/>
    <path d="M2 0 h44 l-6 46 h-32 z" fill="#c8643c"/>
  </g>

  <!-- piso em perspectiva -->
  <rect x="0" y="470" width="400" height="250" fill="url(#cPiso)"/>
  <g stroke="#7e6c58" stroke-width="1.4" opacity=".45">
    ${[-400, -240, -100, 40, 160, 260, 360, 480, 620, 800].map((x) => `<line x1="200" y1="420" x2="${x}" y2="720"/>`).join('')}
    ${[500, 540, 592, 660].map((y) => `<line x1="0" y1="${y}" x2="400" y2="${y}"/>`).join('')}
  </g>
  <rect x="0" y="420" width="400" height="52" fill="#cfdbe0"/>

  <!-- atendente atrás do balcão -->
  ${npcSVG('atendente', 258, 300)}

  <!-- balcão -->
  <g>
    <rect x="128" y="424" width="300" height="16" rx="4" fill="#5a6a74"/>
    <rect x="136" y="438" width="290" height="120" fill="url(#cBalcao)"/>
    <rect x="136" y="470" width="290" height="26" fill="#21c46b"/>
    <text x="281" y="489" text-anchor="middle" font-size="15" font-weight="900" fill="#0c2a1a" font-family="Inter,system-ui" letter-spacing=".5">EaglesIn Air</text>
    <!-- monitor de costas -->
    <rect x="330" y="372" width="54" height="40" rx="5" fill="#2f3b44"/>
    <rect x="352" y="410" width="10" height="16" fill="#2f3b44"/>
    <!-- balança de bagagem -->
    <rect x="96" y="540" width="90" height="18" rx="4" fill="#9fb2ba"/>
    <rect x="128" y="524" width="26" height="16" rx="3" fill="#12181b"/>
    <text x="141" y="536" text-anchor="middle" font-size="9" font-weight="800" fill="#9be36d" font-family="ui-monospace,monospace">23kg</text>
  </g>
  <ellipse cx="270" cy="562" rx="160" ry="8" fill="#000" opacity=".12"/>
</svg>`;
}

/* Pavio de bolso: mala laranja que fica ao lado dele na cena. */
export function malaSVG() {
  return `<svg class="mala" viewBox="0 0 80 90" aria-hidden="true">
    <rect x="26" y="0" width="28" height="16" rx="6" fill="none" stroke="#5a3a20" stroke-width="5"/>
    <rect x="4" y="12" width="72" height="70" rx="12" fill="#ff8a3d" stroke="#c75f1f" stroke-width="3"/>
    <rect x="4" y="38" width="72" height="8" fill="#c75f1f"/>
    <rect x="14" y="22" width="20" height="12" rx="3" fill="#fff" opacity=".85"/>
    <circle cx="18" cy="86" r="4" fill="#2b2b2b"/><circle cx="62" cy="86" r="4" fill="#2b2b2b"/>
  </svg>`;
}

/* ==========================================================
   Cenários do Mundo 1 (viewBox 400×720). A área que aparece na tela
   fica mais ou menos entre y=150 e y=570; o Pavio ocupa a esquerda,
   então o personagem e as coisas importantes ficam à direita.
   ========================================================== */
export const abre = (defs = '') => `<svg class="cena-bg" viewBox="0 0 400 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${defs}</defs>`;
export const grad = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
export const fonte = 'font-family="Inter,system-ui" font-weight="900"';
export const mono = 'font-family="ui-monospace,Consolas,monospace" font-weight="700"';
export const pisoLinhas = (y0, cor) => `<g stroke="${cor}" stroke-width="1.4" opacity=".4">${[-400, -220, -80, 60, 200, 340, 480, 620, 800].map((x) => `<line x1="200" y1="${y0 - 60}" x2="${x}" y2="720"/>`).join('')}${[0, 40, 92, 160].map((d) => `<line x1="0" y1="${y0 + 30 + d}" x2="400" y2="${y0 + 30 + d}"/>`).join('')}</g>`;

/* ---------- Segurança: detector de metais, raio-X e esteira ---------- */
export function segurancaSVG() {
  const bandejas = [0, 1, 2].map((i) => `<g transform="translate(${i * 110} 0)">
      <path d="M0 0 h78 l-6 20 h-66 z" fill="#8d9aa3" stroke="#6b7880" stroke-width="2"/>
      ${i === 0 ? '<rect x="14" y="-12" width="44" height="14" rx="3" fill="#2f3b44"/>' : i === 1 ? '<path d="M12 0 q4 -16 20 -14 q14 2 28 8 l2 6 z" fill="#c75f1f"/>' : '<rect x="20" y="-18" width="16" height="20" rx="4" fill="#3d8bff"/><rect x="40" y="-10" width="18" height="12" rx="3" fill="#ffd23f"/>'}
    </g>`).join('');
  return `${abre(grad('sParede', '#e3e9ee', '#c2ccd4') + grad('sPiso', '#b9c2c8', '#7f8a92') + grad('sMaq', '#c5d0d6', '#93a1a9'))}
  <rect width="400" height="720" fill="url(#sParede)"/>
  <!-- faixa do teto com a placa -->
  <rect x="0" y="120" width="400" height="16" fill="#9aa7b0"/>
  <g transform="translate(36 150)">
    <rect width="250" height="42" rx="10" fill="#14191c"/>
    <text x="125" y="28" text-anchor="middle" font-size="18" ${fonte} fill="#ffd23f" letter-spacing="1.5">SECURITY CHECK</text>
  </g>
  <!-- regras na parede -->
  <g transform="translate(300 160)">
    <rect width="80" height="96" rx="8" fill="#fff" stroke="#9aa7b0" stroke-width="2"/>
    ${[0, 1, 2].map((i) => `<circle cx="18" cy="${22 + i * 26}" r="9" fill="none" stroke="#ff5a4e" stroke-width="3"/><line x1="12" y1="${16 + i * 26}" x2="24" y2="${28 + i * 26}" stroke="#ff5a4e" stroke-width="3"/><rect x="34" y="${18 + i * 26}" width="36" height="7" rx="3" fill="#c2ccd4"/>`).join('')}
  </g>
  <rect x="0" y="500" width="400" height="220" fill="url(#sPiso)"/>
  ${pisoLinhas(500, '#5f6a72')}
  <!-- detector de metais (pórtico) -->
  <g transform="translate(36 236)">
    <rect x="0" y="0" width="22" height="270" rx="6" fill="#d7dee3" stroke="#8d9aa3" stroke-width="3"/>
    <rect x="104" y="0" width="22" height="270" rx="6" fill="#d7dee3" stroke="#8d9aa3" stroke-width="3"/>
    <rect x="-4" y="-16" width="134" height="30" rx="8" fill="#b9c4cb" stroke="#8d9aa3" stroke-width="3"/>
    <circle cx="63" cy="-1" r="7" fill="#21c46b" class="c-pisca"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="6" y="${30 + i * 36}" width="10" height="18" rx="3" fill="#9be36d" opacity=".55"/><rect x="110" y="${30 + i * 36}" width="10" height="18" rx="3" fill="#9be36d" opacity=".55"/>`).join('')}
  </g>
  <!-- agente atrás da máquina -->
  ${npcSVG('seguranca', 296, 300)}
  <!-- máquina de raio-X com esteira -->
  <g>
    <rect x="200" y="392" width="220" height="92" rx="10" fill="url(#sMaq)" stroke="#6b7880" stroke-width="3"/>
    <rect x="214" y="408" width="70" height="60" rx="8" fill="#1d252b"/>
    <path d="M214 408 h70 v14 q-35 -8 -70 0 z" fill="#2f3b44"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${222 + i * 10}" y="408" width="6" height="40" fill="#11161b" opacity=".7"/>`).join('')}
    <text x="350" y="446" text-anchor="middle" font-size="12" ${fonte} fill="#2f3b44">X-RAY</text>
    <circle cx="390" cy="410" r="5" fill="#ff5a4e" class="c-pisca"/>
  </g>
  <g>
    <rect x="150" y="484" width="270" height="18" rx="6" fill="#2f3b44"/>
    ${Array.from({ length: 12 }, (_, i) => `<circle cx="${160 + i * 22}" cy="493" r="5" fill="#56656e"/>`).join('')}
    <g transform="translate(150 464)"><g class="c-esteira">${bandejas}</g></g>
    <rect x="160" y="502" width="10" height="56" fill="#56656e"/><rect x="400" y="502" width="10" height="56" fill="#56656e"/>
  </g>
  <!-- monitor do raio-X -->
  <g transform="translate(316 328)">
    <rect width="72" height="54" rx="6" fill="#11161b"/>
    <rect x="6" y="6" width="60" height="42" rx="3" fill="#163b5c"/>
    <path d="M14 38 q10 -24 22 -10 q8 -16 22 4" stroke="#ff9a3d" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="30" y="54" width="12" height="12" fill="#2f3b44"/>
  </g>
</svg>`;
}

/* ---------- Café do aeroporto: cardápio, máquina de espresso e vitrine ---------- */
export function cafeSVG() {
  const itens = [['COFFEE', '$3'], ['TEA', '$2'], ['MUFFIN', '$4'], ['WATER', '$2'], ['SANDWICH', '$6']];
  return `${abre(grad('cParede', '#f3e2c7', '#e2c49c') + grad('cPiso', '#8a5a3c', '#5a3826') + grad('cBalcao', '#5a3826', '#3b2418') + grad('cVidro', '#fff8ec', '#f1dcc0'))}
  <rect width="400" height="720" fill="url(#cParede)"/>
  <!-- tijolinhos -->
  <g fill="#d9b88d" opacity=".55">${Array.from({ length: 7 }, (_, r) => Array.from({ length: 6 }, (_, c) => `<rect x="${c * 72 - (r % 2) * 36}" y="${250 + r * 30}" width="64" height="24" rx="3"/>`).join('')).join('')}</g>
  <!-- luminárias pendentes -->
  ${[90, 230, 350].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="96" stroke="#3b2418" stroke-width="3"/><path d="M${x - 22} 118 q22 -34 44 0 z" fill="#2f3b44"/><ellipse cx="${x}" cy="120" rx="10" ry="5" fill="#ffe9a8" class="c-pisca" style="animation-duration:4s"/>`).join('')}
  <!-- quadro do cardápio -->
  <g transform="translate(22 136)">
    <rect width="190" height="150" rx="10" fill="#1f2a24" stroke="#5a3826" stroke-width="6"/>
    <text x="95" y="30" text-anchor="middle" font-size="16" ${fonte} fill="#ffd23f" letter-spacing="2">SKY CAFÉ</text>
    ${itens.map(([n, p], i) => `<text x="18" y="${56 + i * 20}" font-size="12" ${mono} fill="#f4f4f0">${n}</text><text x="172" y="${56 + i * 20}" text-anchor="end" font-size="12" ${mono} fill="#9be36d">${p}</text>`).join('')}
  </g>
  <!-- prateleira com xícaras -->
  <rect x="236" y="196" width="150" height="8" rx="3" fill="#5a3826"/>
  ${[250, 280, 310, 340].map((x, i) => `<g transform="translate(${x} 176)"><rect width="20" height="20" rx="4" fill="${['#fff', '#ff8a3d', '#fff', '#21c46b'][i]}"/><path d="M20 5 q8 0 8 6 q0 6 -8 6" stroke="${['#fff', '#ff8a3d', '#fff', '#21c46b'][i]}" stroke-width="3" fill="none"/></g>`).join('')}
  <rect x="0" y="460" width="400" height="260" fill="url(#cPiso)"/>
  ${pisoLinhas(460, '#3b2418')}
  <!-- barista atrás do balcão -->
  ${npcSVG('barista', 300, 318)}
  <!-- máquina de espresso -->
  <g transform="translate(196 330)">
    <rect width="76" height="96" rx="10" fill="#c5ccd1" stroke="#8d9aa3" stroke-width="3"/>
    <rect x="8" y="10" width="60" height="22" rx="4" fill="#2f3b44"/><circle cx="22" cy="21" r="5" fill="#21c46b" class="c-pisca"/><circle cx="54" cy="21" r="5" fill="#ff5a4e"/>
    <rect x="18" y="44" width="40" height="10" rx="3" fill="#56656e"/><rect x="30" y="54" width="6" height="12" fill="#56656e"/>
    <rect x="24" y="70" width="18" height="16" rx="3" fill="#fff"/>
    <g class="c-vapor"><path d="M30 64 q-6 -10 0 -18 q6 -8 0 -16" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/></g>
  </g>
  <!-- balcão com vitrine de doces -->
  <g>
    <rect x="150" y="426" width="270" height="14" rx="4" fill="#7a4f36"/>
    <rect x="160" y="438" width="260" height="130" fill="url(#cBalcao)"/>
    <rect x="176" y="452" width="150" height="70" rx="8" fill="url(#cVidro)" stroke="#c9a27a" stroke-width="3"/>
    ${[[198, 500, '#c7782f'], [236, 500, '#8a4b2a'], [274, 500, '#e2a64a'], [304, 500, '#c7782f']].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="10" fill="${c}"/><ellipse cx="${x}" cy="${y - 8}" rx="12" ry="7" fill="${c}" opacity=".85"/>`).join('')}
    <g transform="translate(340 404)"><rect width="56" height="24" rx="4" fill="#11161b"/><text x="28" y="17" text-anchor="middle" font-size="11" ${mono} fill="#9be36d">$ 3.00</text></g>
  </g>
</svg>`;
}

/* ---------- Portão 12: janelão com o avião, poltronas e balcão ---------- */
export function portaoSVG(atrasado = false) {
  return `${abre(grad('gCeu', '#4fa9ec', '#bfe4ff') + grad('gPiso', '#566a7a', '#33424d') + grad('gBalcao', '#1d6b45', '#0f4a2e') + '<clipPath id="gJan"><rect x="0" y="130" width="400" height="290"/></clipPath>')}
  <rect width="400" height="720" fill="#e9eef1"/>
  <g clip-path="url(#gJan)">
    <rect x="0" y="130" width="400" height="290" fill="url(#gCeu)"/>
    <g class="c-nuvem" style="--d:50s">${nuvem(100, 190, .8)}</g>
    <g class="c-nuvem" style="--d:70s;--o:-35s">${nuvem(300, 170, .6)}</g>
    <rect x="0" y="360" width="400" height="60" fill="#7d878e"/>
    <rect x="0" y="384" width="400" height="4" fill="#ffd23f" opacity=".8"/>
    <!-- avião estacionado -->
    <g transform="translate(20 236)">
      <path d="M0 70 q0 -40 60 -44 h290 q40 0 60 44 z" fill="#fff" stroke="#9fb2ba" stroke-width="2"/>
      <path d="M0 70 h410 q-8 30 -60 34 h-300 q-50 -4 -50 -34 z" fill="#f4f6f7" stroke="#9fb2ba" stroke-width="2"/>
      <rect x="40" y="64" width="370" height="8" fill="#21c46b"/>
      ${Array.from({ length: 14 }, (_, i) => `<rect x="${70 + i * 22}" y="40" width="10" height="13" rx="5" fill="#5a7c93"/>`).join('')}
      <path d="M20 30 l-26 -70 h36 l40 70 z" fill="#21c46b"/>
      <text x="-2" y="2" font-size="11" ${fonte} fill="#fff" transform="rotate(-62 -2 2)">EaglesIn</text>
      <path d="M150 92 l70 40 h40 l-40 -40 z" fill="#dfe7ea" stroke="#9fb2ba" stroke-width="2"/>
      <rect x="220" y="104" width="44" height="22" rx="10" fill="#9fb2ba"/>
      <circle cx="120" cy="124" r="10" fill="#2b2b2b"/><circle cx="330" cy="124" r="10" fill="#2b2b2b"/>
    </g>
    <!-- ponte de embarque -->
    <path d="M330 300 h80 v60 h-80 z" fill="#c5ccd1" stroke="#8d9aa3" stroke-width="2"/>
  </g>
  <g fill="#56656e">
    ${[0, 132, 264, 392].map((x) => `<rect x="${x}" y="130" width="8" height="290"/>`).join('')}
    <rect x="0" y="124" width="400" height="10"/><rect x="0" y="416" width="400" height="10"/>
  </g>
  <!-- placa GATE 12 -->
  <g transform="translate(24 150)">
    <rect width="120" height="64" rx="10" fill="#0f7a43"/>
    <text x="60" y="26" text-anchor="middle" font-size="13" ${fonte} fill="#9be36d" letter-spacing="2">GATE</text>
    <text x="60" y="54" text-anchor="middle" font-size="28" ${fonte} fill="#fff">12</text>
  </g>
  <rect x="0" y="426" width="400" height="294" fill="url(#gPiso)"/>
  ${pisoLinhas(426, '#22303a')}
  <!-- agente atrás do balcão -->
  ${npcSVG('portao', 300, 330)}
  <g>
    <rect x="200" y="452" width="220" height="14" rx="4" fill="#4c5d68"/>
    <rect x="208" y="464" width="212" height="98" fill="url(#gBalcao)"/>
    <text x="300" y="502" text-anchor="middle" font-size="16" ${fonte} fill="#9be36d">GATE 12</text>
    <g transform="translate(234 516)"><rect width="132" height="26" rx="4" fill="#11161b"/><text x="66" y="18" text-anchor="middle" font-size="12" ${mono} fill="#ffd23f">${atrasado ? 'NYC 12:15 <tspan fill="#ff5a4e" class="c-pisca">DELAYED</tspan>' : 'NYC 10:45 <tspan fill="#9be36d" class="c-pisca">BOARDING</tspan>'}</text></g>
    <rect x="352" y="410" width="44" height="34" rx="4" fill="#2f3b44"/>
  </g>
  <!-- fileira de poltronas -->
  <g transform="translate(-10 500)">
    ${[0, 1, 2].map((i) => `<g transform="translate(${i * 64} 0)"><rect x="0" y="0" width="56" height="54" rx="12" fill="#2f6fb3"/><rect x="0" y="40" width="56" height="26" rx="8" fill="#245a92"/></g>`).join('')}
    <rect x="0" y="66" width="190" height="8" fill="#56656e"/>
  </g>
</svg>`;
}

/* ---------- Embarque: túnel da ponte de embarque e a porta do avião ---------- */
export function embarqueSVG() {
  const vx = 240; // ponto de fuga levemente à direita (o Pavio fica à esquerda)
  return `${abre(grad('eParede', '#e6eaed', '#b8c2c9', 1, 0) + grad('eChao', '#4a5660', '#2c353c') + grad('eCabine', '#fff3d6', '#f2d49a'))}
  <rect width="400" height="720" fill="#d0d7dc"/>
  <!-- teto, paredes e chão em perspectiva -->
  <polygon points="0,110 400,110 ${vx + 80},250 ${vx - 80},250" fill="#c3ccd2"/>
  ${[0, 1, 2, 3].map((i) => { const t = (i + 1) / 5; return `<rect x="${0 + (vx - 80) * t + 60 * (1 - t)}" y="${110 + 140 * t - 4}" width="${(400 - 0) * (1 - t) * 0.5 + 40}" height="6" rx="3" fill="#fffbe8" opacity=".9"/>`; }).join('')}
  <polygon points="0,110 ${vx - 80},250 ${vx - 80},500 0,640" fill="url(#eParede)"/>
  <polygon points="400,110 ${vx + 80},250 ${vx + 80},500 400,640" fill="#cfd6db"/>
  ${[0.25, 0.5, 0.75].map((t) => `<line x1="${(vx - 80) * t}" y1="${110 + 140 * t}" x2="${(vx - 80) * t}" y2="${640 - 140 * t}" stroke="#9aa7b0" stroke-width="3"/><line x1="${400 - (400 - vx - 80) * t}" y1="${110 + 140 * t}" x2="${400 - (400 - vx - 80) * t}" y2="${640 - 140 * t}" stroke="#9aa7b0" stroke-width="3"/>`).join('')}
  <!-- janelinhas da parede direita -->
  ${[0.2, 0.55].map((t) => { const x = 400 - (400 - vx - 80) * t, w = 46 * (1 - t * 0.6); return `<rect x="${x - w - 6}" y="${200 + 70 * t}" width="${w}" height="${90 * (1 - t * 0.5)}" rx="8" fill="#7fc4ea" stroke="#8d9aa3" stroke-width="2"/>`; }).join('')}
  <polygon points="0,640 400,640 ${vx + 80},500 ${vx - 80},500" fill="url(#eChao)"/>
  <polygon points="${vx - 30},500 ${vx + 30},500 ${vx + 90},640 ${vx - 90},640" fill="#21c46b" opacity=".35"/>
  <!-- fuselagem e porta do avião no fim do túnel -->
  <rect x="${vx - 80}" y="250" width="160" height="250" fill="#f4f6f7"/>
  <rect x="${vx - 80}" y="440" width="160" height="10" fill="#21c46b"/>
  <rect x="${vx - 52}" y="262" width="104" height="230" rx="40" fill="url(#eCabine)" stroke="#9fb2ba" stroke-width="5"/>
  <rect x="${vx - 40}" y="300" width="80" height="40" rx="6" fill="#e8c88a" opacity=".6"/>
  ${npcSVG('comissaria', vx, 330, 0.95)}
  <path d="M${vx + 52} 270 l40 -8 v236 l-40 -6 z" fill="#e3e8eb" stroke="#9fb2ba" stroke-width="3"/>
  <text x="${vx}" y="236" text-anchor="middle" font-size="12" ${fonte} fill="#56656e" letter-spacing="2">FLIGHT EI 012</text>
</svg>`;
}

/* ---------- No avião: corredor, poltronas e o carrinho ---------- */
export function aviaoSVG(npc = 'comissario', noite = false) {
  const vx = 236, vy = 300;
  const poltrona = (x, y, s, lado) => `<g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-34" y="-70" width="68" height="100" rx="16" fill="#1f3a5f"/>
      <rect x="-30" y="-66" width="60" height="22" rx="8" fill="#21c46b"/>
      <rect x="${lado < 0 ? -40 : 28}" y="-10" width="12" height="44" rx="5" fill="#16294a"/>
    </g>`;
  const fileiras = [[332, 0.36], [366, 0.5], [410, 0.68], [466, 0.9]]; // [y, escala], do fundo para a frente
  return `${abre(grad('aTeto', '#f4f1ea', '#dcd6c8') + grad('aChao', '#5a6470', '#3a424b'))}
  <rect width="400" height="720" fill="#e8e3d8"/>
  <!-- teto curvo e bagageiros -->
  <path d="M0 110 q${vx} -60 400 0 L${vx + 50} ${vy - 40} q-50 -20 -100 0 z" fill="url(#aTeto)"/>
  <polygon points="0,110 ${vx - 50},${vy - 40} ${vx - 50},${vy - 10} 0,250" fill="#f7f5f0" stroke="#cfc8b8" stroke-width="2"/>
  <polygon points="400,110 ${vx + 50},${vy - 40} ${vx + 50},${vy - 10} 400,250" fill="#f7f5f0" stroke="#cfc8b8" stroke-width="2"/>
  ${[0.3, 0.6].map((t) => `<line x1="${(vx - 50) * t}" y1="${110 + (vy - 150) * t}" x2="${(vx - 50) * t}" y2="${250 + (vy - 260) * t}" stroke="#cfc8b8" stroke-width="2"/><line x1="${400 - (400 - vx - 50) * t}" y1="${110 + (vy - 150) * t}" x2="${400 - (400 - vx - 50) * t}" y2="${250 + (vy - 260) * t}" stroke="#cfc8b8" stroke-width="2"/>`).join('')}
  <!-- paredes com janelinhas -->
  <polygon points="0,250 ${vx - 50},${vy - 10} ${vx - 50},${vy + 90} 0,560" fill="#ece7dc"/>
  <polygon points="400,250 ${vx + 50},${vy - 10} ${vx + 50},${vy + 90} 400,560" fill="#e2dccf"/>
  ${[0.12, 0.42, 0.66].map((t) => { const s = 1 - t * 0.7; return `<ellipse cx="${400 - (400 - vx - 50) * t - 18 * s}" cy="${300 + 6 * t}" rx="${14 * s}" ry="${22 * s}" fill="#7fc4ea" stroke="#cfc8b8" stroke-width="3"/>`; }).join('')}
  <!-- corredor -->
  <polygon points="${vx - 50},${vy + 90} ${vx + 50},${vy + 90} 400,720 0,720" fill="url(#aChao)"/>
  <polygon points="${vx - 14},${vy + 90} ${vx + 14},${vy + 90} ${vx + 90},720 ${vx - 90},720" fill="#21c46b" opacity=".18"/>
  <!-- poltronas (do fundo para a frente) -->
  ${fileiras.map(([y, s]) => poltrona(vx - 46 - 150 * s, y, s, -1) + poltrona(vx + 46 + 150 * s, y, s, 1)).join('')}
  <!-- comissário e o carrinho -->
  ${npcSVG(npc, vx + 30, vy + 24, 0.9)}
  <g transform="translate(${vx - 34} ${vy + 120})">
    <rect width="128" height="112" rx="8" fill="#c5ccd1" stroke="#8d9aa3" stroke-width="3"/>
    <rect x="10" y="12" width="108" height="40" rx="5" fill="#dfe5e8"/>
    <rect x="18" y="-24" width="14" height="26" rx="3" fill="#ff8a3d"/><rect x="38" y="-30" width="12" height="32" rx="3" fill="#3d8bff"/>
    <rect x="56" y="-18" width="22" height="20" rx="4" fill="#fff" stroke="#c5ccd1"/><rect x="84" y="-26" width="12" height="28" rx="3" fill="#21c46b"/>
    <rect x="10" y="62" width="108" height="8" rx="3" fill="#8d9aa3"/>
    <circle cx="20" cy="116" r="6" fill="#2b2b2b"/><circle cx="108" cy="116" r="6" fill="#2b2b2b"/>
  </g>
  <!-- poltronas da frente (perto da câmera) -->
  ${poltrona(40, 560, 1.4, -1)}${poltrona(380, 560, 1.4, 1)}
  ${noite ? '<rect width="400" height="720" fill="#0b1640" opacity=".42"/><g fill="#ffe9a8">' + [[120, 200], [300, 196], [210, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" class="c-pisca" style="animation-duration:3s"/>`).join('') + '</g>' : ''}
</svg>`;
}

/* ---------- Imigração (chefão): cabine com vidro, luz dura e cordão ---------- */
export function imigracaoSVG() {
  return `${abre(grad('iParede', '#2b3744', '#151c24') + grad('iPiso', '#3a4651', '#1c232a') + grad('iCabine', '#4a3426', '#2c1e15') + '<radialGradient id="iLuz" cx="0.68" cy="0.35" r="0.5"><stop offset="0" stop-color="#fff6d8" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>')}
  <rect width="400" height="720" fill="url(#iParede)"/>
  <rect width="400" height="720" fill="url(#iLuz)"/>
  <!-- placa iluminada -->
  <g transform="translate(24 140)">
    <rect width="352" height="56" rx="10" fill="#0d1318" stroke="#c9a227" stroke-width="2"/>
    <text x="176" y="26" text-anchor="middle" font-size="18" ${fonte} fill="#ffd23f" letter-spacing="3">IMMIGRATION</text>
    <text x="176" y="45" text-anchor="middle" font-size="11" ${fonte} fill="#c9d3da" letter-spacing="2">PASSPORT CONTROL · ALL VISITORS</text>
  </g>
  <!-- luz NEXT piscando -->
  <g transform="translate(320 214)"><rect width="58" height="26" rx="6" fill="#0d1318"/><text x="29" y="18" text-anchor="middle" font-size="13" ${fonte} fill="#ff5a4e" class="c-pisca">NEXT</text></g>
  <polygon points="250,110 330,110 420,560 160,560" fill="#fff6d8" opacity=".07"/>
  <rect x="0" y="500" width="400" height="220" fill="url(#iPiso)"/>
  ${pisoLinhas(500, '#0d1318')}
  <!-- oficial (desenhado antes do vidro) -->
  ${npcSVG('imigracao', 282, 322)}
  <!-- cabine -->
  <g>
    <rect x="170" y="250" width="240" height="8" fill="#2c1e15"/>
    <rect x="170" y="256" width="240" height="176" fill="#9fd3ff" opacity=".14"/>
    <path d="M196 270 l40 -10 M206 300 l70 -20 M350 280 l40 -12" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/>
    <rect x="170" y="250" width="8" height="190" fill="#2c1e15"/><rect x="402" y="250" width="8" height="190" fill="#2c1e15"/>
    <rect x="160" y="430" width="250" height="16" rx="4" fill="#6b4a34"/>
    <rect x="170" y="444" width="240" height="116" fill="url(#iCabine)"/>
    <rect x="186" y="464" width="208" height="6" rx="3" fill="#c9a227" opacity=".7"/>
    <!-- passaporte e carimbo -->
    <g transform="translate(206 410) rotate(-8)"><rect width="34" height="24" rx="3" fill="#7a1f2b"/><circle cx="17" cy="12" r="5" fill="none" stroke="#c9a227" stroke-width="2"/></g>
    <g transform="translate(330 398)"><rect x="6" y="0" width="14" height="22" rx="4" fill="#2b2b2b"/><rect x="0" y="20" width="26" height="12" rx="3" fill="#7a1f2b"/></g>
  </g>
  <!-- cordão de fila -->
  <g>
    ${[20, 120].map((x) => `<rect x="${x}" y="470" width="8" height="90" rx="3" fill="#c9a227"/><circle cx="${x + 4}" cy="468" r="7" fill="#e3c35a"/><ellipse cx="${x + 4}" cy="560" rx="16" ry="5" fill="#8a7020"/>`).join('')}
    <path d="M28 476 q48 30 96 0" stroke="#b3202a" stroke-width="7" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;
}

/* Cenário de cada parada do Mundo 1. */
export const CENAS = {
  checkin: checkinSVG, seguranca: segurancaSVG, cafe: cafeSVG, portao: () => portaoSVG(), atraso: () => portaoSVG(true),
  embarque: embarqueSVG, aviao: () => aviaoSVG(), formulario: () => aviaoSVG('comissaria', true), imigracao: imigracaoSVG,
};
