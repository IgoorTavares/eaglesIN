/* ==========================================================
   curso/ajuda.js — atalhos para escrever o curso fixo.
   Os arquivos de unidade usam estas funções para ficar curtos.
   ========================================================== */

/* Múltipla escolha. A 1ª opção da lista pode ser qualquer uma: o app mistura. */
export const E = (pergunta, opcoes, resposta, explicacao, habilidade = 'vocabulario') =>
  ({ tipo: 'escolha', habilidade, audio: null, pergunta, opcoes, resposta, explicacao });
/* Escuta: o aluno ouve "audio" (não vê o texto) e escolhe. */
export const OUV = (audio, pergunta, opcoes, resposta, explicacao) =>
  ({ tipo: 'escolha', habilidade: 'escuta', audio, pergunta, opcoes, resposta, explicacao });
/* Escuta e escreve o que ouviu. */
export const DIT = (audio, explicacao, aceitas = []) =>
  ({ tipo: 'escrever', habilidade: 'escuta', audio, pergunta: 'Escreva o que você ouviu.', opcoes: [], resposta: audio.replace(/[.!?]$/, ''), aceitas, explicacao });
/* Leitura: pergunta sobre o texto da prova. */
export const LEI = (pergunta, opcoes, resposta, explicacao) =>
  ({ tipo: 'escolha', habilidade: 'leitura', audio: null, pergunta, opcoes, resposta, explicacao });
/* Ordenar: escreva a frase certa SEM pontuação final; o app embaralha as palavras. */
export const O = (pergunta, frase, explicacao, habilidade = 'gramatica') =>
  ({ tipo: 'ordenar', habilidade, audio: null, pergunta, opcoes: frase.split(' '), resposta: frase, explicacao });
/* Escrever: resposta principal + outras formas aceitas. */
export const W = (pergunta, resposta, aceitas, explicacao, habilidade = 'escrita') =>
  ({ tipo: 'escrever', habilidade, audio: null, pergunta, opcoes: [], resposta, aceitas, explicacao });

/* Aula: vocab [en, pt, exemplo], exemplos e fala [en, pt]. */
export const AULA = ({ intro, intro_educado, vocab, explicacao, exemplos, pratica, fala, quiz }) => ({
  intro, intro_educado,
  vocab: vocab.map(([en, pt, exemplo]) => ({ en, pt, exemplo })),
  explicacao: Array.isArray(explicacao) ? explicacao.join('\n') : explicacao,
  exemplos: exemplos.map(([en, pt]) => ({ en, pt })),
  pratica, quiz,
  fala: fala.map(([en, pt]) => ({ en, pt })),
});

/* Tarefa de escrita da prova: chaves = grupos de palavras (basta uma de cada grupo). */
export const ESC = (pergunta, criterio, modelo, chaves, min = 8) => ({ pergunta, criterio, modelo, chaves, min });

export const PROVA = ({ abertura, abertura_educado, texto_leitura, itens, escrita, fala }) => ({
  abertura, abertura_educado, texto_leitura, itens, escrita,
  fala: fala.map(([en, pt]) => ({ en, pt })),
});
