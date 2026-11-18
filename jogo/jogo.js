/* ==========================================================
   jogo.js — entrada do EaglesIn: A Viagem.
   Rotas (no endereço, para o "voltar" do celular funcionar):
     #abertura · #mundos · #mapa/<mundo> · #fase/<mundo>/<parada> · #galeria/<n>
     #loja · #missao/<mundo>
   O progresso fica nos dados do app (salvar.js).
   ========================================================== */
import { needsOnboarding } from '../js/onboarding.js';
import { $, calar } from './nucleo.js';
import { telaAbertura, telaMundos, telaMapa, telaGaleria, telaLoja } from './telas.js';
import { telaFase } from './fase.js';
import { telaMissao } from './missao.js';
import { mundo } from './mundos.js';
import { FASES } from './fases.js';
import * as sv from './salvar.js';

// Primeiro acesso: a apresentação do Pavio (18 telas) ainda mora no app; depois ela volta para cá.
if (needsOnboarding()) location.replace('../index.html#welcome');

const app = $('#jogo');
const j = sv.iniciarSalvamento();
let limpa = null;
let primeiraNoMapa = false;

const nav = {
  abertura: () => ir('abertura'),
  mundos: () => ir('mundos'),
  mapa: (id = j.mundoAtual, primeira = false) => { primeiraNoMapa = primeira; ir(`mapa/${id}`); },
  fase: (a, b) => (b === undefined ? ir(`fase/${j.mundoAtual}/${a}`) : ir(`fase/${a}/${b}`)),
  galeria: (k) => ir(`galeria/${k}`, true),
  loja: () => ir('loja'),
  missao: (id = j.mundoAtual) => ir(`missao/${id}`),
  voltar: () => (history.length > 1 ? history.back() : ir('abertura')),
  classico: () => { try { sessionStorage.setItem('eaglesin-classico', '1'); } catch {} location.href = '../index.html#learn'; },
};

function ir(rota, trocar = false) {
  const h = '#' + rota;
  if (location.hash === h) return mostra();
  if (trocar && location.hash.startsWith('#galeria')) history.replaceState(null, '', h), mostra();
  else location.hash = h;
}

function mostra() {
  rota();
  // Transição de entrada de cada tela.
  app.firstElementChild?.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
}

function rota() {
  try { limpa?.(); } catch {}
  limpa = null; calar();
  document.querySelector('.modal-fundo')?.remove();
  const [nome, a, b] = (location.hash.slice(1) || (j.viuAbertura ? `mapa/${j.mundoAtual}` : 'abertura')).split('/');
  if (nome === 'mundos') return telaMundos(app, nav);
  if (nome === 'loja') return telaLoja(app, nav);
  if (nome === 'missao') {
    const M = mundo(a);
    if (!sv.mundoLiberado(M.id) || !sv.estrelasDoMundo(M)) return nav.mapa(M.id);
    limpa = telaMissao(app, M, nav);
    return;
  }
  if (nome === 'mapa') { const p = primeiraNoMapa; primeiraNoMapa = false; return telaMapa(app, nav, a || j.mundoAtual, p); }
  if (nome === 'galeria') { limpa = telaGaleria(app, nav, Math.max(0, Math.min(mundo('aeroporto').nos.length - 1, +a || 0))); return; }
  if (nome === 'fase') {
    const M = mundo(a), k = +b, no = M.nos[k];
    if (!no || !FASES[no.id] || !sv.faseLiberada(M, k)) return nav.mapa(M.id);
    limpa = telaFase(app, M, k, FASES[no.id], { mapa: () => nav.mapa(M.id), fase: (x) => (x === k ? mostra() : nav.fase(M.id, x)) });
    return;
  }
  return telaAbertura(app, nav);
}

addEventListener('hashchange', mostra);
mostra();

// Mesmo service worker do app (funciona offline e instala como app).
if ('serviceWorker' in navigator) navigator.serviceWorker.register('../sw.js', { scope: '../' }).catch(() => {});
