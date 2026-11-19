/* A1 · Prova final do nível (curso fixo, offline) */
import { PROVA, ESC, E, OUV, DIT, LEI, O, W } from './ajuda.js';

export default PROVA({
  abertura: 'PROVA FINAL DO A1, porra! Tudo que você viu: apresentação, família, objetos, rotina, comida e cidade. Passou aqui, vira gente no inglês. Errou o básico, volta pro começo, caralho. Boa sorte, vai precisar.',
  abertura_educado: 'Prova final do nível A1: apresentações, família, objetos, rotina, comida e cidade. Respire fundo e boa sorte!',
  texto_leitura: "Hello! My name is Daniel Costa. I'm 29 years old and I'm from Recife, Brazil, but now I live in Toronto, Canada. I'm a cook at a small Italian restaurant. I usually wake up at nine because I work in the afternoon and at night. My wife, Julia, is a teacher. She works in the morning, so we have lunch together at home every day. We live in a quiet neighborhood. There is a beautiful park across from our building, and there are two supermarkets near here. On Sundays we never work. We sometimes go to the park, and in the evening I cook rice and beans, like in Brazil. Julia loves Brazilian food, but she doesn't like spicy food. I can speak Portuguese, English and a little Italian. Toronto is great, but winter is very cold!",
  itens: [
    OUV("Hi, I'm Laura. I'm from Chile.", 'De onde a Laura é?', ['Do Chile', 'Da China', 'Do Canadá', 'Da Espanha'], 'Do Chile', "I'm from Chile."),
    OUV('My brother is a doctor. He works at a hospital.', 'Onde o irmão trabalha?', ['Num hospital', 'Numa escola', 'Num banco', 'Num restaurante'], 'Num hospital', 'Works at a hospital.'),
    OUV('The keys are on the table, next to the phone.', 'Onde estão as chaves?', ['Em cima da mesa, ao lado do celular', 'Embaixo da mesa', 'Na bolsa', 'Atrás do celular'], 'Em cima da mesa, ao lado do celular', 'On the table, next to the phone.'),
    OUV("It's quarter past eight.", 'Que horas são?', ['8:15', '8:45', '7:45', '8:30'], '8:15', 'Quarter past eight.'),
    DIT("I'd like a coffee, please.", "I'd like = eu gostaria."),
    DIT('Turn right at the bank.', 'Turn right = vire à direita.'),
    LEI('De onde o Daniel é?', ['De Recife, no Brasil', 'De Toronto', 'Da Itália', 'De São Paulo'], 'De Recife, no Brasil', '"I\'m from Recife, Brazil".'),
    LEI('Qual é a profissão do Daniel?', ['Cozinheiro', 'Professor', 'Garçom', 'Médico'], 'Cozinheiro', '"I\'m a cook".'),
    LEI('Por que o Daniel acorda às nove?', ['Porque trabalha à tarde e à noite', 'Porque é preguiçoso', 'Porque a esposa acorda tarde', 'Porque não trabalha'], 'Porque trabalha à tarde e à noite', '"because I work in the afternoon and at night."'),
    LEI('O que tem em frente ao prédio deles?', ['Um parque bonito', 'Dois supermercados', 'Um restaurante italiano', 'Uma escola'], 'Um parque bonito', '"a beautiful park across from our building".'),
    LEI('Do que a Julia NÃO gosta?', ['Comida apimentada', 'Comida brasileira', 'Arroz e feijão', 'Parques'], 'Comida apimentada', '"she doesn\'t like spicy food."'),
    LEI('Quais idiomas o Daniel fala?', ['Português, inglês e um pouco de italiano', 'Só português e inglês', 'Português e espanhol', 'Inglês e francês'], 'Português, inglês e um pouco de italiano', '"I can speak Portuguese, English and a little Italian."'),
    E('"Sister" é:', ['irmã', 'filha', 'tia', 'prima'], 'irmã', 'Sister = irmã.', 'vocabulario'),
    E('"Expensive" é:', ['caro', 'barato', 'grande', 'longe'], 'caro', 'Expensive = caro.', 'vocabulario'),
    E('"Wednesday" é:', ['quarta-feira', 'terça-feira', 'quinta-feira', 'sexta-feira'], 'quarta-feira', 'Wednesday = quarta.', 'vocabulario'),
    E('"Under" é:', ['embaixo de', 'em cima de', 'dentro de', 'atrás de'], 'embaixo de', 'Under = embaixo.', 'vocabulario'),
    W('Escreva em inglês: "vermelho"', 'red', [], 'Red.', 'vocabulario'),
    W('Escreva em inglês: "bairro"', 'neighborhood', ['neighbourhood'], 'Neighborhood.', 'vocabulario'),
    E('Complete: "She ___ a teacher."', ['is', 'am', 'are', 'be'], 'is', 'She + is.', 'gramatica'),
    E('Complete: "He ___ to work by bus."', ['goes', 'go', 'gos', 'going'], 'goes', 'He + goes.', 'gramatica'),
    E('Complete: "___ there any restaurants near here?"', ['Are', 'Is', 'Do', 'Have'], 'Are', 'Plural: are there.', 'gramatica'),
    O('Coloque em ordem:', 'what time do you wake up', 'What time do you...?'),
    O('Coloque em ordem:', 'I have a black car', 'Cor antes do substantivo.'),
    W('Negativa: "She likes fish."', "she doesn't like fish", ['she does not like fish'], "Doesn't + like.", 'gramatica'),
  ],
  escrita: [
    ESC('Apresente-se: nome, idade, de onde você é, profissão e sua família (5 frases ou mais).', 'Usar o verbo to be corretamente, idade com years old e pelo menos um membro da família.', "My name is Ana. I'm 25 years old and I'm from Brazil. I'm a nurse. I have a brother and a sister. My mother is a teacher.", [['my name is', "i'm", 'i am'], ['years old'], ['from'], ['mother', 'father', 'brother', 'sister', 'wife', 'husband', 'son', 'daughter', 'family', 'parents']], 25),
    ESC('Descreva um dia normal seu: rotina, horários, comida e algo do seu bairro.', 'Usar simple present, um horário com at, um advérbio de frequência e there is/are ou uma comida.', 'I usually wake up at seven. I have coffee and bread for breakfast. I go to work by bus. There is a park near my house. I never go to bed late.', [['wake up', 'get up', 'go to work', 'go to bed', 'have breakfast', 'have lunch'], ['at'], ['always', 'usually', 'often', 'sometimes', 'rarely', 'never'], ['there is', "there's", 'there are', 'coffee', 'bread', 'rice', 'beans', 'chicken', 'eat', 'drink']], 25),
  ],
  fala: [
    ["Hi! My name is Pedro and I'm from Brazil.", 'Oi! Meu nome é Pedro e sou do Brasil.'],
    ['I have one brother and two sisters.', 'Tenho um irmão e duas irmãs.'],
    ['I usually wake up at seven.', 'Geralmente acordo às sete.'],
    ['Excuse me, is there a pharmacy near here?', 'Com licença, tem uma farmácia aqui perto?'],
  ],
});
