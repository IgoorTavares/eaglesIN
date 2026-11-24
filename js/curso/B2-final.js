/* B2 · Prova final do nível (curso fixo, offline) */
import { PROVA, ESC, E, OUV, DIT, LEI, O, W } from './ajuda.js';

export default PROVA({
  abertura: 'PROVA FINAL DO B2, porra! Trabalho, gramática pesada, argumentação, mídia, perrengue e produção independente. Passou aqui, tu fala inglês de verdade, sem rodinha. Errou, volta e eu te xingo com reported speech e tudo, caralho. Bora!',
  abertura_educado: 'Prova final do nível B2: comunicação profissional, gramática avançada, argumentação, mídia, situações complexas e produção escrita e oral. Respire fundo e boa sorte!',
  texto_leitura: "The Four-Day Week: Hype or the Future?\nWhen a software company in Porto Alegre switched to a four-day week in 2023, many people assumed productivity would fall. It did not. According to the company's own report, which was published last March, output rose by 8% and sick days were cut by almost half. \"If we had known the results would be this good, we would have done it years ago,\" said the CEO, Marina Kunz.\nCritics argue that the model only works for office jobs. Admittedly, it is harder to apply in hospitals or restaurants, where someone must always be present. Moreover, some employees said they felt more pressure, since the same work had to be done in less time. However, a survey of 900 workers carried out by a national university suggests that the majority would not return to a five-day week, even for higher pay.\nIt seems that the debate is far from over. What is clear, though, is that companies which ignore the question may find it harder to attract young talent in the future.",
  itens: [
    OUV("To wrap up, the key takeaway is that customers want faster service.", 'Qual é a principal mensagem?', ['Clientes querem atendimento mais rápido', 'Clientes querem preços menores', 'A empresa vai crescer', 'O serviço é ótimo'], 'Clientes querem atendimento mais rápido', 'Key takeaway.'),
    OUV("If we had left on time, we wouldn't have missed the train.", 'O que aconteceu?', ['Perderam o trem', 'Pegaram o trem', 'Saíram cedo', 'O trem atrasou'], 'Perderam o trem', 'Terceira condicional.'),
    OUV("With all due respect, I see it differently.", 'A pessoa:', ['Discorda com educação', 'Concorda totalmente', 'Pede desculpas', 'Muda de assunto'], 'Discorda com educação', 'With all due respect.'),
    OUV("My flight has been cancelled. Am I entitled to a hotel room?", 'O que a pessoa pergunta?', ['Se tem direito a um quarto de hotel', 'Onde fica o hotel', 'Quanto custa o hotel', 'Se o voo saiu'], 'Se tem direito a um quarto de hotel', 'Entitled to.'),
    DIT('The benefits outweigh the costs.', 'Outweigh.'),
    DIT('She said she would call me the next day.', 'Reported speech.'),
    LEI('O que aconteceu com a produtividade da empresa de Porto Alegre?', ['Aumentou 8%', 'Caiu 8%', 'Ficou igual', 'Caiu pela metade'], 'Aumentou 8%', '"output rose by 8%".'),
    LEI('O que a CEO disse?', ['Teriam adotado anos antes se soubessem dos resultados', 'Vai voltar à semana de cinco dias', 'Os resultados foram ruins', 'Não sabia do relatório'], 'Teriam adotado anos antes se soubessem dos resultados', '"we would have done it years ago".'),
    LEI('Qual é a crítica ao modelo?', ['Só funciona bem para trabalhos de escritório', 'É caro demais', 'Reduz a produtividade', 'Ninguém gosta'], 'Só funciona bem para trabalhos de escritório', '"the model only works for office jobs."'),
    LEI('Por que alguns funcionários sentiram mais pressão?', ['O mesmo trabalho tinha que ser feito em menos tempo', 'Ganharam menos', 'Tiveram mais reuniões', 'Mudaram de cargo'], 'O mesmo trabalho tinha que ser feito em menos tempo', '"the same work had to be done in less time."'),
    LEI('O que a pesquisa com 900 trabalhadores sugere?', ['A maioria não voltaria à semana de cinco dias', 'A maioria quer voltar', 'Querem salário maior', 'Ninguém respondeu'], 'A maioria não voltaria à semana de cinco dias', '"the majority would not return to a five-day week".'),
    LEI('Qual é a conclusão do texto?', ['Empresas que ignorarem o tema podem ter dificuldade de atrair jovens talentos', 'A semana de quatro dias acabou', 'O debate está resolvido', 'Só hospitais devem adotar'], 'Empresas que ignorarem o tema podem ter dificuldade de atrair jovens talentos', '"companies which ignore the question may find it harder to attract young talent".'),
    E('"Compromise" (negociação) é:', ['meio-termo', 'compromisso na agenda', 'promessa', 'contrato'], 'meio-termo', 'Compromise.', 'vocabulario'),
    E('"Misleading" é:', ['enganoso', 'liderança', 'perdido', 'mal lido'], 'enganoso', 'Misleading.', 'vocabulario'),
    E('"Drawback" é:', ['desvantagem', 'gaveta', 'recuo', 'desenho'], 'desvantagem', 'Drawback.', 'vocabulario'),
    E('"Under the weather" é:', ['meio doente', 'na chuva', 'com calor', 'feliz'], 'meio doente', 'Idiom.', 'vocabulario'),
    W('Escreva em inglês: "reembolso"', 'refund', [], 'Refund.', 'vocabulario'),
    W('Escreva em inglês: "até certo ponto"', 'to some extent', ['to a certain extent'], 'To some extent.', 'vocabulario'),
    E('Complete: "The report ___ published last March."', ['was', 'were', 'has', 'is being'], 'was', 'Passiva.', 'gramatica'),
    E('Complete: "He isn\'t answering. He ___ be in a meeting."', ['must', "mustn't", 'should', 'shall'], 'must', 'Dedução.', 'gramatica'),
    E('Complete: "___ the rain, the event continued."', ['Despite', 'Although', 'Unless', 'Whereas'], 'Despite', 'Despite + substantivo.', 'gramatica'),
    O('Coloque em ordem:', 'she asked me if I had finished the report', 'Reported question.'),
    O('Coloque em ordem:', 'the woman whose car was stolen called the police', 'Whose.'),
    W('Complete: "If I ___ (know), I would have helped you."', 'had known', ["i'd known"], 'Terceira condicional.', 'gramatica'),
  ],
  escrita: [
    ESC('Redação argumentativa: "Should companies adopt a four-day working week?" Escreva introdução com tese, um argumento com exemplo, um contra-argumento com refutação e conclusão.', 'Tese clara, conectores avançados, um contra-argumento (some people argue / admittedly) com refutação (however / nonetheless), hedging (tend to / it seems / may) e conclusão.', "Nowadays, more and more companies are testing a four-day week. This essay will argue that it benefits both workers and employers. Firstly, rested employees tend to be more productive. For example, a company in Porto Alegre saw output rise by 8%. Some people argue that it only works for office jobs. Admittedly, it may be harder in hospitals. However, flexible shifts could solve this problem. In conclusion, the benefits outweigh the drawbacks, so more companies should consider it.", [['this essay will argue', 'i believe', 'i strongly believe', 'in my view', 'in my opinion'], ['firstly', 'moreover', 'furthermore', 'in addition', 'for example', 'for instance'], ['some people argue', 'critics', 'admittedly', 'it could be argued', 'while it is true', 'on the other hand'], ['however', 'nonetheless', 'nevertheless', 'outweigh', 'whereas'], ['in conclusion', 'to sum up', 'overall', 'therefore']], 80),
    ESC('Escreva um e-mail formal ao seu gerente propondo testar a semana de quatro dias na sua equipe por três meses.', 'Registro formal (sem contrações), propósito claro (I am writing to propose), argumentos, uma condicional e fórmulas de fechamento.', "Dear Mr. Silva,\nI am writing to propose a three-month trial of a four-day week in our team. Recent studies suggest that productivity tends to increase. If the results are not positive, we will return to the current schedule. Furthermore, it could help us attract new talent. I would be grateful if we could discuss this at our next meeting.\nKind regards,\nJúlia Campos", [['dear'], ['i am writing to', 'i would like to propose', 'i would like to suggest', 'propose', 'suggest'], ['if'], ['furthermore', 'moreover', 'in addition', 'therefore', 'i would be grateful', 'please do not hesitate'], ['kind regards', 'best regards', 'yours sincerely', 'sincerely', 'regards']], 50),
  ],
  fala: [
    ["Today I'd like to talk about the four-day week.", 'Hoje gostaria de falar sobre a semana de quatro dias.'],
    ['Some people argue that it only works for office jobs.', 'Algumas pessoas argumentam que só funciona para trabalhos de escritório.'],
    ["With all due respect, I see it differently.", 'Com todo o respeito, vejo de outra forma.'],
    ["To sum up, I'd like to leave you with one question.", 'Para resumir, quero deixar vocês com uma pergunta.'],
  ],
});
