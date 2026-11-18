/* ==========================================================
   salvar.js — progresso do jogo, guardado DENTRO dos dados do app
   (state.jogo no localStorage "claudia-teacher-v1"). Assim entra no
   backup/exportação do app e, no futuro, na sincronização com a conta.
   XP, sequência de dias e meta diária são os mesmos do app.
   ========================================================== */
import { state, save, flush, addXp, userLevel, streak, addStudyTime, finalPassed, dayKey } from '../js/store.js';
import { MUNDOS, mundo } from './mundos.js';

export const J = () => state.jogo;
export { userLevel, streak };
export const xpTotal = () => state.xp || 0;

export function iniciarSalvamento() {
  state.jogo ??= { v: 1, moedas: 0, estrelas: {}, mundos: { aeroporto: true }, mundoAtual: 'aeroporto', viuAbertura: false, migrado: null };
  const j = state.jogo;
  j.estrelas ??= {}; j.mundos ??= { aeroporto: true }; j.mundos.aeroporto = true;
  migrar();
  return j;
}

/* Migração única do progresso do app de estudo para o jogo:
   - moedas e estrelas do protótipo G0 (outra chave do localStorage);
   - bônus de boas-vindas pelas aulas feitas e pelo XP;
   - mundos liberados pelas provas finais aprovadas ou pelo nível antigo. */
function migrar() {
  const j = state.jogo;
  if (j.migrado) return;
  try {
    const g0 = JSON.parse(localStorage.getItem('eaglesin-jogo-g0') || 'null');
    if (g0) {
      j.moedas += g0.moedas || 0;
      for (const [k, v] of Object.entries(g0.estrelas || {})) j.estrelas[k] = Math.max(j.estrelas[k] || 0, v);
      localStorage.removeItem('eaglesin-jogo-g0');
    }
  } catch {}
  const aulas = Object.values(state.curr?.lessons || {}).filter((l) => (l.best ?? 0) >= 60).length;
  const bonus = aulas * 10 + Math.floor((state.xp || 0) / 10);
  j.moedas += bonus;
  const nivelAntigo = state.settings.level; // 'basico' | 'intermediario' | 'avancado'
  MUNDOS.forEach((m, i) => {
    if (!i) return;
    const anterior = MUNDOS[i - 1];
    if (finalPassed(anterior.cefr) || (nivelAntigo === 'intermediario' && i <= 2) || nivelAntigo === 'avancado') j.mundos[m.id] = true;
  });
  j.migrado = { data: dayKey(), aulas, xp: state.xp || 0, bonus, mundos: Object.keys(j.mundos).length };
  j.avisoMigracao = aulas > 0 || (state.xp || 0) > 0 || j.migrado.mundos > 1;
  save(); flush();
}

export const moedas = () => state.jogo.moedas;
export function ganhaMoedas(n) { state.jogo.moedas += n; save(); }
export const estrelas = (faseId) => state.jogo.estrelas[faseId] || 0;
export const mundoLiberado = (id) => !!state.jogo.mundos[id];
export function faseLiberada(m, i) {
  if (!mundoLiberado(m.id)) return false;
  return i === 0 || estrelas(m.nos[i - 1].id) > 0;
}
export const estrelasDoMundo = (m) => m.nos.reduce((a, n) => a + estrelas(n.id), 0);

/* Fim de fase: grava estrelas, XP e tempo de estudo (conta para a meta do dia do app).
   Vencer o chefão libera o próximo mundo. */
export function registraFase(m, i, est, xp, segundos) {
  const j = state.jogo, no = m.nos[i];
  const antes = j.estrelas[no.id] || 0;
  j.estrelas[no.id] = Math.max(antes, est);
  addXp(xp);
  const metaBatida = addStudyTime(Math.max(10, Math.round(segundos)));
  let liberou = null;
  if (no.chefe) {
    const prox = MUNDOS[MUNDOS.indexOf(m) + 1];
    if (prox && !j.mundos[prox.id]) { j.mundos[prox.id] = true; liberou = prox; }
  }
  save(); flush();
  return { recorde: est > antes, primeira: !antes, metaBatida, liberou };
}
/* ---------- G5: loja, baú, missões, tutorial e preferências ---------- */
export const LOJA = [
  { id: 'reserva', tipo: 'gasta', preco: 80, nome: 'Pavio reserva', desc: 'Quando o pavio acabar, ele acende de novo uma vez. Salva a fase do BOOM.' },
  { id: 'dica', tipo: 'gasta', preco: 40, nome: 'Dica 50/50', desc: 'Some com uma resposta errada nas perguntas de escolher.' },
  { id: 'bocasuja', tipo: 'fixo', preco: 300, nome: 'Pacote Boca Suja', desc: 'O Pavio ganha um repertório novo de xingamento quando você erra (e quando acerta).' },
  { id: 'mae', tipo: 'fixo', preco: 250, nome: 'Pacote Mãe Brasileira', desc: 'O Pavio te dá bronca igual tua mãe: chinelo, "eu não vou falar de novo" e tudo.' },
];
const itens = () => (state.jogo.itens ??= {});
export const temItem = (id) => itens()[id] || 0;
export function compra(id) {
  const it = LOJA.find((x) => x.id === id);
  if (!it || state.jogo.moedas < it.preco || (it.tipo === 'fixo' && temItem(id))) return false;
  state.jogo.moedas -= it.preco;
  itens()[id] = it.tipo === 'fixo' ? 1 : temItem(id) + 1;
  save(); flush();
  return true;
}
export function usaItem(id) {
  if (!temItem(id)) return false;
  itens()[id] -= 1; save();
  return true;
}

/* Baú diário: moedas que crescem com a sequência de dias. */
export const bauDisponivel = () => state.jogo.viuAbertura && state.jogo.bau !== dayKey();
export function abreBau() {
  const valor = 20 + Math.min(streak(), 10) * 5;
  state.jogo.bau = dayKey(); state.jogo.moedas += valor;
  save(); flush();
  return valor;
}

/* Missão do Pavio (conversa livre com IA): recompensa uma vez por dia por mundo. */
export const missaoPremiada = (mundoId) => (state.jogo.missoes ??= {})[mundoId] === dayKey();
export function registraMissao(mundoId, nota, segundos) {
  const premiar = !missaoPremiada(mundoId);
  const moedasGanhas = premiar ? Math.round(nota * 6) : 0;
  if (premiar) { state.jogo.missoes[mundoId] = dayKey(); state.jogo.moedas += moedasGanhas; addXp(30); }
  const metaBatida = addStudyTime(Math.max(30, Math.round(segundos)));
  state.jogo.missoesFeitas = (state.jogo.missoesFeitas || 0) + 1;
  save(); flush();
  return { moedas: moedasGanhas, premiou: premiar, metaBatida };
}

// Quem já ganhou alguma estrela não precisa do tutorial.
export const tutorialFeito = () => !!state.jogo.tutorial || Object.keys(state.jogo.estrelas).length > 0;
export function marcaTutorial() { state.jogo.tutorial = true; save(); }

/* Preferências do jogo (efeitos sonoros e vibração). */
export const pref = (k) => (state.jogo.pref ??= {})[k] !== false;
export function mudaPref(k, v) { (state.jogo.pref ??= {})[k] = v; save(); }

export function mudaMundo(id) { state.jogo.mundoAtual = mundo(id).id; save(); }
export function marcaAbertura() { state.jogo.viuAbertura = true; save(); }
export function avisoMigracaoVisto() { state.jogo.avisoMigracao = false; save(); }
