/* A2 · Prova final do nível (curso fixo, offline) */
import { PROVA, ESC, E, OUV, DIT, LEI, O, W } from './ajuda.js';

export default PROVA({
  abertura: 'PROVA FINAL DO A2, porra! Presente, passado, futuro, viagem, saúde e comparação. Tudo misturado. Passou aqui, tu já se vira lá fora sem passar fome nem se perder. Errou, volta e estuda, caralho. Bora!',
  abertura_educado: 'Prova final do nível A2: presente, passado, futuro, viagens, saúde e comparações. Respire fundo e boa sorte!',
  texto_leitura: "Last month, Marina traveled to Lisbon for the first time. Her flight was delayed for two hours, so she arrived at the hotel very late. The next morning she felt terrible: she had a sore throat and a headache. The receptionist said she should see a doctor, and the pharmacy across the street was the cheapest in the area. After two days of rest, she felt much better. She visited the castle, which was the most beautiful place of the trip, and she took a tram tour. Lisbon was smaller than she expected, but it was more interesting than Madrid, her last trip. Right now Marina is writing about the trip on her blog. Next year she is going to visit Porto, and she thinks she will stay longer. Her advice: always bring medicine in your carry-on!",
  itens: [
    OUV("I'm cooking dinner right now. Can I call you back?", 'O que a pessoa está fazendo?', ['Fazendo o jantar', 'Jantando fora', 'Lavando a louça', 'Dormindo'], 'Fazendo o jantar', "I'm cooking dinner."),
    OUV('Last weekend we went to the beach and ate fish.', 'O que fizeram no fim de semana passado?', ['Foram à praia e comeram peixe', 'Ficaram em casa', 'Foram ao cinema', 'Pescaram no rio'], 'Foram à praia e comeram peixe', 'Went + ate.'),
    OUV("I'm going to study in Canada next year.", 'Qual é o plano?', ['Estudar no Canadá ano que vem', 'Trabalhar no Canadá', 'Visitar o Canadá este ano', 'Mudar para os EUA'], 'Estudar no Canadá ano que vem', 'Going to study.'),
    OUV("You have a fever. You should stay in bed.", 'Qual é o conselho?', ['Ficar de cama', 'Ir trabalhar', 'Tomar sorvete', 'Fazer exercício'], 'Ficar de cama', 'Should stay in bed.'),
    DIT('Is breakfast included?', 'Breakfast included.'),
    DIT("It's too expensive for me.", 'Too + adjetivo.'),
    LEI('Por que a Marina chegou tarde ao hotel?', ['O voo atrasou duas horas', 'Ela se perdeu', 'O táxi demorou', 'Ela perdeu o voo'], 'O voo atrasou duas horas', '"Her flight was delayed for two hours".'),
    LEI('Como ela se sentiu na manhã seguinte?', ['Mal, com dor de garganta e de cabeça', 'Ótima', 'Cansada, mas bem', 'Com fome'], 'Mal, com dor de garganta e de cabeça', '"a sore throat and a headache."'),
    LEI('Qual foi o lugar mais bonito da viagem?', ['O castelo', 'A farmácia', 'O hotel', 'O bonde'], 'O castelo', '"the castle... the most beautiful place".'),
    LEI('O que ela achou de Lisboa comparada a Madri?', ['Mais interessante', 'Maior', 'Mais cara', 'Pior'], 'Mais interessante', '"more interesting than Madrid".'),
    LEI('O que a Marina está fazendo agora?', ['Escrevendo sobre a viagem no blog', 'Viajando para o Porto', 'Indo ao médico', 'Fazendo as malas'], 'Escrevendo sobre a viagem no blog', '"Right now Marina is writing...".'),
    LEI('Qual é o conselho da Marina?', ['Levar remédio na bagagem de mão', 'Nunca viajar sozinha', 'Reservar o hotel mais barato', 'Fazer passeio de bonde'], 'Levar remédio na bagagem de mão', '"always bring medicine in your carry-on!"'),
    E('"Do the laundry" é:', ['lavar roupa', 'lavar a louça', 'limpar a casa', 'passar roupa'], 'lavar roupa', 'Laundry.', 'vocabulario'),
    E('"Boarding pass" é:', ['cartão de embarque', 'passaporte', 'passagem de ônibus', 'portão'], 'cartão de embarque', 'Boarding pass.', 'vocabulario'),
    E('"Sore throat" é:', ['dor de garganta', 'garganta seca', 'tosse', 'febre'], 'dor de garganta', 'Sore throat.', 'vocabulario'),
    E('"I\'d love to" (resposta a convite) é:', ['adoraria', 'eu amei', 'eu amo', 'não posso'], 'adoraria', "I'd love to.", 'vocabulario'),
    W('Escreva em inglês: "ontem"', 'yesterday', [], 'Yesterday.', 'vocabulario'),
    W('Escreva em inglês: "mais barato"', 'cheaper', [], 'Cheaper.', 'vocabulario'),
    E('Complete: "Where ___ you go on vacation last year?"', ['did', 'do', 'were', 'are'], 'did', 'Passado: did.', 'gramatica'),
    E('Complete: "The phone is ringing! — I ___ answer it."', ["'ll", "'m going to", 'answered', 'am answer'], "'ll", 'Decisão na hora: will.', 'gramatica'),
    E('Complete: "This is the ___ day of my life!"', ['best', 'better', 'goodest', 'most good'], 'best', 'The best.', 'gramatica'),
    O('Coloque em ordem:', 'what are you doing this weekend', 'Continuous para planos.'),
    O('Coloque em ordem:', 'I have had a headache since Monday', 'Since + início.'),
    W('Negativa: "She went to work yesterday."', "she didn't go to work yesterday", ['she did not go to work yesterday'], "Didn't + go.", 'gramatica'),
  ],
  escrita: [
    ESC('Conte sobre uma viagem ou passeio que você fez: como foi, o que aconteceu e o que você achou (compare com outro lugar).', 'Usar simple past (com verbos irregulares), was/were e pelo menos um comparativo ou superlativo.', 'Last year I went to Florianópolis with my friends. The weather was great and we went to the beach every day. One day I had a terrible sunburn! Florianópolis was more beautiful than Rio, and it was the best trip of my life.', [['went', 'had', 'saw', 'took', 'ate', 'visited', 'stayed'], ['was', 'were'], ['than', 'the best', 'the most', 'the worst', 'better', 'worse', 'more']], 35),
    ESC('Escreva seus planos para as próximas férias: aonde vai, com quem, o que vai fazer e uma previsão.', 'Usar going to, will e/ou present continuous para o futuro.', "Next summer I'm going to visit my cousins in Bahia. We're flying on December 20th. I think it will be very hot. We are going to swim every day and I will probably eat too much!", [['going to'], ['will', "i'll", 'probably', 'think'], ['next', 'summer', 'vacation', 'holiday', 'december', 'january', 'july']], 25),
  ],
  fala: [
    ["I'm working right now. I'll call you back.", 'Estou trabalhando agora. Te ligo de volta.'],
    ['Last weekend I went to the beach.', 'No fim de semana passado fui à praia.'],
    ["I'm going to travel next year.", 'Vou viajar ano que vem.'],
    ['This hotel is cheaper than the other one.', 'Este hotel é mais barato que o outro.'],
  ],
});
