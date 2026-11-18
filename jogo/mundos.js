/* ==========================================================
   mundos.js — os 5 mundos da viagem e as paradas de cada um.
   Cada mundo corresponde a um nível do currículo (CEFR) do app.
   Só o Mundo 1 tem paradas desenhadas por enquanto (G3/G4).
   ========================================================== */
export const MUNDOS = [
  {
    id: 'aeroporto', num: 1, nome: 'Aeroporto', cefr: 'A1', cor: ['#21c46b', '#0f7a43'],
    resumo: 'Check-in, segurança, embarque e o temido oficial da imigração.',
    nos: [
      { id: 'checkin', nome: 'Check-in', x: 115, y: 1215 },
      { id: 'seguranca', nome: 'Segurança', x: 282, y: 1112 },
      { id: 'cafe', nome: 'Café', x: 118, y: 1008 },
      { id: 'portao', nome: 'Portão 12', x: 285, y: 900 },
      { id: 'atraso', nome: 'Voo atrasado', x: 118, y: 795 },
      { id: 'embarque', nome: 'Embarque', x: 282, y: 690 },
      { id: 'aviao', nome: 'Lanche a bordo', x: 120, y: 585 },
      { id: 'formulario', nome: 'Formulário', x: 280, y: 478 },
      { id: 'imigracao', nome: 'Imigração', x: 200, y: 345, chefe: true },
    ],
  },
  {
    id: 'cidade', num: 2, nome: 'Hotel e cidade', cefr: 'A2', cor: ['#3d8bff', '#1f4fa8'], resumo: 'Hotel, metrô, pedir direção e se virar na rua.',
    fala: 'Chegamos em Nova York, porra! Agora é hotel, metrô e rua. Se você se perder aqui, ninguém te acha, caralho.',
    nos: zigue([['hotel', 'Hotel'], ['metro', 'Metrô'], ['direcoes', 'Pedir direção'], ['farmacia', 'Farmácia'], ['museu', 'Museu'], ['taxi', 'Táxi']]),
  },
  {
    id: 'restaurante', num: 3, nome: 'Restaurante e compras', cefr: 'B1', cor: ['#ff8a3d', '#b5541a'], resumo: 'Pedir comida, reclamar, comprar e devolver.',
    fala: 'Mundo 3: comida e compras, porra! Aqui o inglês fica sério: pedir, reclamar e devolver sem passar vergonha.',
    nos: zigue([['reserva', 'Reserva'], ['pedido', 'Pedido'], ['reclamacao', 'Reclamação'], ['loja', 'Loja de roupas'], ['devolucao', 'Troca'], ['conta', 'A conta']]),
  },
  {
    id: 'trabalho', num: 4, nome: 'Trabalho', cefr: 'B2', cor: ['#9b6bff', '#5b37b3'], resumo: 'Entrevista de emprego, reuniões e o chefe chato.',
    fala: 'Mundo 4: trabalho, porra! Entrevista, reunião e chefe chato. Aqui não tem mais "the book is on the table", é inglês de gente grande.',
    nos: zigue([['portaria', 'Recepção'], ['entrevista', 'Entrevista'], ['reuniao', 'Reunião'], ['ligacao', 'Call com cliente'], ['apresentacao', 'Apresentação'], ['promocao', 'O chefe']]),
  },
  {
    id: 'social', num: 5, nome: 'Vida social', cefr: 'C1', cor: ['#ff5a7a', '#a8264a'], resumo: 'Festas, encontros, vizinhos, discussões e o sogro.',
    fala: 'Último mundo, caralho! Vida social: festa, encontro, vizinho e o temido sogro. Aqui é gíria, ironia e expressão de nativo.',
    nos: zigue([['festa', 'Festa'], ['papo', 'Papo furado'], ['encontro', 'Encontro'], ['vizinho', 'Vizinho'], ['debate', 'Discussão'], ['sogro', 'O sogro']]),
  },
];

/* Distribui as paradas em zigue-zague no mapa (1300 de altura); a última é o chefão. */
function zigue(lista) {
  const n = lista.length, y0 = 1200, y1 = 360;
  return lista.map(([id, nome], k) => {
    const chefe = k === n - 1;
    return { id, nome, x: chefe ? 200 : k % 2 ? 285 : 115, y: Math.round(y0 - (k * (y0 - y1)) / (n - 1)), ...(chefe ? { chefe: true } : {}) };
  });
}
export const mundo = (id) => MUNDOS.find((m) => m.id === id) || MUNDOS[0];
/* Mundo e índice de uma parada. */
export function ondeFica(faseId) {
  for (const m of MUNDOS) { const i = m.nos.findIndex((n) => n.id === faseId); if (i >= 0) return { m, i, no: m.nos[i] }; }
  return null;
}
