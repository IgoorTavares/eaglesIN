/* B1 · Prova final do nível (curso fixo, offline) */
import { PROVA, ESC, E, OUV, DIT, LEI, O, W } from './ajuda.js';

export default PROVA({
  abertura: 'PROVA FINAL DO B1, porra! Experiência, narrativa, trabalho, opinião, condicionais e o mundo lá fora. Passou aqui, tu é oficialmente independente no inglês. Errou, tu volta e eu te xingo até passar, caralho. Bora!',
  abertura_educado: 'Prova final do nível B1: experiências, narrativas, trabalho, opiniões, condicionais e sociedade. Respire fundo e boa sorte!',
  texto_leitura: "Five years ago, Bruno Alves was working as an accountant in São Paulo. He had a good salary, but he was unhappy. \"I had never really chosen that career,\" he says. One day, while he was waiting for a delayed train, he started recording short videos about saving money. Long story short, one of them went viral, and his channel now has more than 800,000 followers. Bruno has written two books and he has given talks in four countries. However, he admits there are drawbacks. \"I work more than before, and social media can be stressful. If I could change one thing, I'd take more days off.\" According to Bruno, the main reason for his success is consistency: he has posted a video every week since 2020. His advice? \"If you have an idea, start small. You might fail, but you'll learn a lot.\"",
  itens: [
    OUV("Have you ever been to Canada? — No, never.", 'A pessoa já foi ao Canadá?', ['Nunca', 'Sim, uma vez', 'Sim, várias vezes', 'Vai no ano que vem'], 'Nunca', 'No, never.'),
    OUV("I was cooking dinner when the lights went out.", 'O que aconteceu?', ['As luzes apagaram enquanto cozinhava', 'Queimou o jantar', 'Acabou o gás', 'Saiu para jantar'], 'As luzes apagaram enquanto cozinhava', 'Was cooking... went out.'),
    OUV("I'm in charge of a team of ten people.", 'Pelo que a pessoa é responsável?', ['Uma equipe de dez pessoas', 'Dez projetos', 'Dez clientes', 'Uma loja'], 'Uma equipe de dez pessoas', 'In charge of.'),
    OUV("I see your point, but I'm not so sure.", 'A pessoa:', ['Discorda com educação', 'Concorda totalmente', 'Não ouviu', 'Mudou de assunto'], 'Discorda com educação', 'I see your point, but...'),
    DIT("If I were you, I'd accept the offer.", 'If I were you...'),
    DIT('According to the news, prices have increased.', 'According to.'),
    LEI('O que o Bruno fazia há cinco anos?', ['Era contador em São Paulo', 'Era youtuber', 'Escrevia livros', 'Dava palestras'], 'Era contador em São Paulo', '"working as an accountant in São Paulo."'),
    LEI('Como começou a ideia dos vídeos?', ['Enquanto esperava um trem atrasado', 'Numa reunião', 'Nas férias', 'Depois de ser demitido'], 'Enquanto esperava um trem atrasado', '"while he was waiting for a delayed train".'),
    LEI('O que o Bruno já fez desde então?', ['Escreveu dois livros e deu palestras em quatro países', 'Abriu uma empresa', 'Voltou a ser contador', 'Mudou para o exterior'], 'Escreveu dois livros e deu palestras em quatro países', '"has written two books... talks in four countries."'),
    LEI('Qual é um ponto negativo citado?', ['Trabalha mais que antes', 'Ganha pouco', 'Não tem seguidores', 'Não gosta de vídeos'], 'Trabalha mais que antes', '"I work more than before".'),
    LEI('O que ele mudaria se pudesse?', ['Tiraria mais dias de folga', 'Voltaria à contabilidade', 'Pararia de postar', 'Mudaria de cidade'], 'Tiraria mais dias de folga', '"I\'d take more days off."'),
    LEI('Qual é o principal motivo do sucesso, segundo ele?', ['Constância', 'Sorte', 'Dinheiro', 'Contatos'], 'Constância', '"the main reason... is consistency".'),
    E('"Deadline" é:', ['prazo', 'demissão', 'pauta', 'meta'], 'prazo', 'Deadline.', 'vocabulario'),
    E('"Eventually" é:', ['por fim', 'às vezes', 'logo', 'eventualmente'], 'por fim', 'Falso cognato.', 'vocabulario'),
    E('"Although" é:', ['embora', 'também', 'portanto', 'sempre'], 'embora', 'Although.', 'vocabulario'),
    E('"Go viral" é:', ['viralizar', 'adoecer', 'sumir', 'ser bloqueado'], 'viralizar', 'Go viral.', 'vocabulario'),
    W('Escreva em inglês: "até agora"', 'so far', ['until now', 'up to now'], 'So far.', 'vocabulario'),
    W('Escreva em inglês: "vale a pena"', 'worth it', ["it's worth it", 'it is worth it'], 'Worth it.', 'vocabulario'),
    E('Complete: "I\'ve lived here ___ 2015."', ['since', 'for', 'ago', 'from'], 'since', 'Since + início.', 'gramatica'),
    E('Complete: "When we arrived, the movie ___ already started."', ['had', 'has', 'was', 'did'], 'had', 'Past perfect.', 'gramatica'),
    E('Complete: "If it ___ tomorrow, we\'ll stay home."', ['rains', 'will rain', 'rained', 'would rain'], 'rains', 'First conditional.', 'gramatica'),
    O('Coloque em ordem:', 'what would you do if you won the lottery', 'Second conditional.'),
    O('Coloque em ordem:', 'have you ever met a famous person', 'Have you ever...?'),
    W('Negativa: "I have finished the report."', "i haven't finished the report", ['i have not finished the report', "i haven't finished the report yet", 'i have not finished the report yet'], "Haven't + particípio.", 'gramatica'),
  ],
  escrita: [
    ESC('Conte uma experiência marcante da sua vida: o que estava acontecendo, o que aconteceu e como terminou.', 'Usar present perfect para introduzir, past continuous (cenário), past simple (ações) e conectores de sequência.', "I've had many adventures, but the best one was in 2019. I was traveling in Chile when I lost my passport. At first I panicked. Then a kind woman helped me find the embassy. Eventually, I got a new passport and it turned out she was from Brazil too!", [["i've", 'i have', 'have you ever', 'never'], ['was', 'were'], ['traveling', 'walking', 'working', 'waiting', 'driving', 'living', 'studying', 'raining'], ['at first', 'then', 'eventually', 'in the end', 'suddenly', 'it turned out', 'finally', 'long story short']], 50),
    ESC('Dê sua opinião: "Is it better to work for a company or to have your own business?" Use argumentos, um exemplo e uma condicional.', 'Expressar opinião, usar conectores (however, because...), um exemplo e pelo menos uma frase com if.', "In my opinion, it's better to have your own business because you have more freedom. For example, my uncle opened a bakery and he decides his schedule. However, it's riskier. If I had enough money, I would open my own company.", [['in my opinion', 'i think', 'i believe', 'personally'], ['because', 'however', 'although', 'on the other hand', 'so'], ['for example', 'such as', 'for instance'], ['if']], 45),
  ],
  fala: [
    ["I've lived here for ten years.", 'Moro aqui há dez anos.'],
    ['I was walking home when I saw an old friend.', 'Eu estava indo para casa quando vi um velho amigo.'],
    ['In my opinion, technology makes life easier.', 'Na minha opinião, a tecnologia facilita a vida.'],
    ["If I had more time, I'd learn another language.", 'Se eu tivesse mais tempo, aprenderia outro idioma.'],
  ],
});
