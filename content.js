/* ==========================================================
   content.js — conteúdo pedagógico (temas × níveis)
   ----------------------------------------------------------
   Formato compacto: cada item "inglês|português".
   Para ADICIONAR UM TEMA: copie um bloco de THEMES, mude o id,
   nome, emoji e preencha basico / intermediario / avancado.
   O app lê tudo automaticamente (trilha, exercícios, prompts).
   ========================================================== */

import { POP_THEMES } from './content-pop.js';

export const LEVELS = {
  basico: {
    id: 'basico', name: 'Básico', cefr: 'A1-A2', ttsRate: 0.85,
    grammar: 'verbo to be, present simple, pronomes pessoais e possessivos, artigos, números, there is/are, can, imperativo, past simple básico, perguntas com what/where/when/who',
    behavior: 'Use frases curtas (máx. 10 palavras) e vocabulário muito simples. Explique em português com mais frequência. Corrija apenas UM erro por vez, o mais importante.',
  },
  intermediario: {
    id: 'intermediario', name: 'Intermediário', cefr: 'B1-B2', ttsRate: 1.0,
    grammar: 'past simple vs present perfect, future (will/going to), condicionais 0/1/2, modais (should, must, might), comparativos e superlativos, phrasal verbs comuns, used to, reported speech básico, gírias leves',
    behavior: 'Use frases mais longas e menos português (só na bronca). Corrija os erros principais e cobre respostas mais elaboradas (peça detalhes, "why?", exemplos).',
  },
  avancado: {
    id: 'avancado', name: 'Avançado', cefr: 'C1', ttsRate: 1.05,
    grammar: 'condicionais 3 e mistos, voz passiva, inversão, wish/if only, phrasal verbs avançados, nuances de tom (formal vs informal), colocações',
    behavior: 'Fale quase 100% em inglês, ritmo natural, com expressões idiomáticas, gírias, humor e debate de opinião. Corrija nuance e naturalidade (o que um nativo diria), não só erro gramatical. Discorde de propósito para provocar debate.',
  },
};

/* Lições de cada tema (por nível). A ordem é a ordem da trilha. */
export const LESSONS = [
  { id: 'palavras', name: 'Palavras-chave', icon: '📚', kind: 'exercises', desc: 'Mini-exercícios com o vocabulário do tema' },
  { id: 'pronuncia', name: 'Repete depois de mim', icon: '🗣️', kind: 'repeat', desc: '5 frases-alvo com xilique incluso' },
  { id: 'roleplay', name: 'Roleplay', icon: '🎭', kind: 'chat', desc: 'Conversa de cenário até cumprir a meta' },
];

/* Helper: transforma "en|pt" em {en, pt}. */
const P = (arr) => arr.map((s) => { const [en, pt] = s.split('|'); return { en: en.trim(), pt: (pt || '').trim() }; });
const L = (o) => ({ words: P(o.words), phrases: P(o.phrases), roleplay: o.roleplay, goal: o.goal, targets: P(o.targets) });

/* Grupos da trilha (a ordem aqui é a ordem na tela). */
export const GROUPS = [
  { id: 'pop', name: '🎬 Séries & Filmes' },
  { id: 'musica', name: '🎤 Rap & Hip-hop' },
  { id: 'diaadia', name: '🌎 Dia a dia' },
];

const DAILY_THEMES = [
  /* ---------------------------------------------------- ALIMENTAÇÃO */
  {
    id: 'alimentacao', name: 'Alimentação', emoji: '🍔',
    basico: L({
      words: ['breakfast|café da manhã', 'lunch|almoço', 'dinner|jantar', 'bread|pão', 'rice|arroz', 'beans|feijão', 'chicken|frango', 'egg|ovo', 'fruit|fruta', 'water|água', 'coffee|café', 'hungry|com fome', 'delicious|delicioso'],
      phrases: ['I am hungry.|Estou com fome.', 'I like rice and beans.|Eu gosto de arroz e feijão.', 'What do you eat for breakfast?|O que você come no café da manhã?', 'I don\'t like fish.|Eu não gosto de peixe.', 'Can I have some water?|Posso tomar um pouco de água?'],
      roleplay: 'Você e a Cláudia falam sobre o que cada um comeu hoje e a comida favorita.',
      goal: 'Diga o que você comeu hoje e qual é sua comida favorita.',
      targets: ['I eat bread for breakfast.|Eu como pão no café da manhã.', 'My favorite food is chicken.|Minha comida favorita é frango.', 'I drink coffee every day.|Eu bebo café todo dia.', 'There is rice on the table.|Tem arroz na mesa.', 'This cake is delicious.|Este bolo é delicioso.'],
    }),
    intermediario: L({
      words: ['homemade|caseiro', 'leftovers|sobras', 'spicy|apimentado', 'bland|sem graça (sabor)', 'recipe|receita', 'ingredient|ingrediente', 'to bake|assar', 'to fry|fritar', 'healthy|saudável', 'junk food|porcaria / fast food', 'craving|desejo (de comer)', 'portion|porção', 'to cut down on|diminuir (consumo)'],
      phrases: ['I\'ve been trying to cut down on sugar.|Tenho tentado diminuir o açúcar.', 'I used to eat a lot of junk food.|Eu costumava comer muita porcaria.', 'If I had more time, I would cook more.|Se eu tivesse mais tempo, cozinharia mais.', 'This is way spicier than I expected.|Isso é bem mais apimentado do que eu esperava.', 'Could you share the recipe?|Você pode compartilhar a receita?'],
      roleplay: 'Cláudia é uma amiga que quer aprender uma receita brasileira sua. Explique o passo a passo.',
      goal: 'Explique uma receita com pelo menos 3 passos usando first, then, after that.',
      targets: ['I\'ve never tried Japanese food.|Nunca experimentei comida japonesa.', 'I used to hate vegetables.|Eu odiava legumes.', 'First, you fry the onions.|Primeiro, você frita as cebolas.', 'Homemade food is healthier.|Comida caseira é mais saudável.', 'I\'m craving something sweet.|Estou com vontade de algo doce.'],
    }),
    avancado: L({
      words: ['mouth-watering|de dar água na boca', 'acquired taste|gosto adquirido', 'to binge on|comer compulsivamente', 'wholesome|nutritivo / saudável', 'overrated|superestimado', 'comfort food|comida afetiva', 'to whip up|preparar rapidinho', 'a far cry from|muito diferente de', 'food for thought|algo para pensar', 'to have a sweet tooth|ser formiga (gostar de doce)', 'palate|paladar', 'to savor|saborear', 'gourmet|gourmet'],
      phrases: ['Had I known it was that spicy, I wouldn\'t have ordered it.|Se eu soubesse que era tão apimentado, não teria pedido.', 'Pineapple on pizza is wildly overrated.|Abacaxi na pizza é extremamente superestimado.', 'Coffee is definitely an acquired taste.|Café é definitivamente um gosto adquirido.', 'I can whip up something in ten minutes.|Consigo preparar algo em dez minutos.', 'I wish I didn\'t have such a sweet tooth.|Queria não ser tão formiga.'],
      roleplay: 'Debate: Cláudia defende que comida gourmet é golpe e que fast food é superior. Discorde com argumentos.',
      goal: 'Defenda sua opinião com 2 argumentos e use uma estrutura de inversão ou wish.',
      targets: ['This dish is a far cry from my grandma\'s.|Esse prato é muito diferente do da minha avó.', 'Rarely have I eaten something so bland.|Raramente comi algo tão sem graça.', 'Comfort food hits differently on a rainy day.|Comida afetiva bate diferente num dia chuvoso.', 'I could have binged on that all night.|Eu poderia ter comido aquilo a noite toda.', 'That\'s some food for thought.|Isso dá o que pensar.'],
    }),
  },

  /* ---------------------------------------------------- SOCIAL */
  {
    id: 'social', name: 'Social', emoji: '💬',
    basico: L({
      words: ['hello|olá', 'name|nome', 'friend|amigo', 'nice to meet you|prazer em te conhecer', 'where|onde', 'from|de (origem)', 'live|morar', 'age|idade', 'weekend|fim de semana', 'phone|celular', 'photo|foto', 'follow|seguir', 'party|festa'],
      phrases: ['What\'s your name?|Qual é o seu nome?', 'Where are you from?|De onde você é?', 'Nice to meet you!|Prazer em te conhecer!', 'I live in São Paulo.|Eu moro em São Paulo.', 'Can I follow you on Instagram?|Posso te seguir no Instagram?'],
      roleplay: 'Vocês se conhecem numa festa. Cláudia é uma estranha curiosa.',
      goal: 'Apresente-se: nome, cidade, trabalho e pergunte algo para ela.',
      targets: ['My name is Lucas.|Meu nome é Lucas.', 'I am from Brazil.|Eu sou do Brasil.', 'Nice to meet you too.|Prazer em te conhecer também.', 'What do you do on weekends?|O que você faz nos fins de semana?', 'This is my best friend.|Este é meu melhor amigo.'],
    }),
    intermediario: L({
      words: ['small talk|conversa fiada', 'to hang out|sair / curtir junto', 'to catch up|botar o papo em dia', 'awkward|constrangedor', 'to get along|se dar bem', 'feed|feed (rede social)', 'to post|postar', 'to scroll|rolar a tela', 'followers|seguidores', 'to run into|esbarrar em alguém', 'acquaintance|conhecido', 'to text|mandar mensagem', 'outgoing|extrovertido'],
      phrases: ['We should hang out sometime.|A gente devia sair qualquer dia.', 'Long time no see! Let\'s catch up.|Quanto tempo! Vamos botar o papo em dia.', 'I ran into an old friend yesterday.|Esbarrei num velho amigo ontem.', 'I spend way too much time scrolling.|Passo tempo demais rolando a tela.', 'Have you been up to anything fun?|Você tem feito algo legal?'],
      roleplay: 'Small talk no elevador com uma colega nova do prédio (Cláudia). Mantenha o papo vivo.',
      goal: 'Mantenha um small talk com 3 perguntas de follow-up.',
      targets: ['We get along really well.|A gente se dá muito bem.', 'That was so awkward.|Aquilo foi muito constrangedor.', 'I\'ll text you later.|Te mando mensagem depois.', 'I\'ve been really busy lately.|Tenho estado muito ocupado ultimamente.', 'She is more outgoing than me.|Ela é mais extrovertida que eu.'],
    }),
    avancado: L({
      words: ['to break the ice|quebrar o gelo', 'to hit it off|se dar bem de cara', 'doomscrolling|rolar notícias ruins sem parar', 'clout|influência / fama', 'to ghost|sumir sem responder', 'FOMO|medo de ficar de fora', 'to put yourself out there|se expor / se arriscar', 'echo chamber|bolha', 'to be on the same wavelength|estar na mesma sintonia', 'curated|selecionado / editado', 'to unplug|desconectar', 'performative|performático', 'banter|zoeira / troca de piadas'],
      phrases: ['We hit it off right away.|A gente se deu bem de cara.', 'Social media is basically a curated highlight reel.|Rede social é basicamente um compilado editado dos melhores momentos.', 'He ghosted me after the second date.|Ele sumiu depois do segundo encontro.', 'Not only is it addictive, but it\'s also exhausting.|Não só é viciante, como também é exaustivo.', 'I wish I could unplug more often.|Queria conseguir desconectar com mais frequência.'],
      roleplay: 'Debate: Cláudia acha que redes sociais destruíram as amizades reais. Discorde ou concorde com nuance.',
      goal: 'Dê uma opinião com nuance usando "not only... but also" ou "had I...".',
      targets: ['Let me break the ice.|Deixa eu quebrar o gelo.', 'We\'re on the same wavelength.|Estamos na mesma sintonia.', 'I\'ve got serious FOMO.|Estou com um FOMO sério.', 'You need to put yourself out there.|Você precisa se expor mais.', 'It\'s just harmless banter.|É só uma zoeira inofensiva.'],
    }),
  },

  /* ---------------------------------------------------- PRONOMES */
  {
    id: 'pronomes', name: 'Pronomes', emoji: '👉',
    basico: L({
      words: ['I|eu', 'you|você', 'he|ele', 'she|ela', 'it|ele/ela (coisa)', 'we|nós', 'they|eles/elas', 'my|meu/minha', 'your|seu/sua', 'his|dele', 'her|dela', 'our|nosso', 'their|deles'],
      phrases: ['She is my sister.|Ela é minha irmã.', 'This is his car.|Este é o carro dele.', 'We love our dog.|Nós amamos nosso cachorro.', 'They are my friends.|Eles são meus amigos.', 'Is it your phone?|É o seu celular?'],
      roleplay: 'Mostre fotos imaginárias da sua família e amigos para a Cláudia e descreva cada pessoa.',
      goal: 'Descreva 3 pessoas usando he/she/they e my/his/her corretamente.',
      targets: ['He is my brother.|Ele é meu irmão.', 'Her name is Ana.|O nome dela é Ana.', 'Their house is big.|A casa deles é grande.', 'We are in our room.|Estamos no nosso quarto.', 'It is my cat.|É o meu gato.'],
    }),
    intermediario: L({
      words: ['mine|meu (pronome)', 'yours|seu (pronome)', 'his|dele (pronome)', 'hers|dela (pronome)', 'ours|nosso (pronome)', 'theirs|deles (pronome)', 'myself|eu mesmo', 'yourself|você mesmo', 'himself|ele mesmo', 'herself|ela mesma', 'ourselves|nós mesmos', 'themselves|eles mesmos', 'each other|um ao outro'],
      phrases: ['That jacket is mine, not yours.|Essa jaqueta é minha, não sua.', 'I made it myself.|Eu mesmo fiz.', 'They blame each other.|Eles culpam um ao outro.', 'She hurt herself at the gym.|Ela se machucou na academia.', 'Help yourself!|Sirva-se!'],
      roleplay: 'Vocês dividiram um apartamento e agora estão separando as coisas. Discuta o que é de quem.',
      goal: 'Use pelo menos 3 pronomes possessivos (mine, yours, hers) e 1 reflexivo.',
      targets: ['This book is hers.|Este livro é dela.', 'We did it ourselves.|Nós mesmos fizemos.', 'Is this pen yours?|Esta caneta é sua?', 'They taught themselves English.|Eles aprenderam inglês sozinhos.', 'We help each other.|Nós nos ajudamos.'],
    }),
    avancado: L({
      words: ['who|que / quem (pessoas)', 'whom|a quem (formal)', 'whose|cujo', 'which|que / o qual (coisas)', 'that|que', 'whoever|quem quer que', 'whatever|o que quer que', 'one|alguém (genérico)', 'singular they|they singular (neutro)', 'oneself|si mesmo', 'by oneself|sozinho', 'the former|o primeiro', 'the latter|o último'],
      phrases: ['The guy whose car got towed is furious.|O cara cujo carro foi guinchado está furioso.', 'To whom it may concern.|A quem possa interessar.', 'Someone left their umbrella here.|Alguém deixou o guarda-chuva aqui.', 'Whoever said that was clearly joking.|Quem quer que tenha dito isso estava claramente brincando.', 'Between coffee and tea, I prefer the former.|Entre café e chá, prefiro o primeiro.'],
      roleplay: 'Cláudia faz uma fofoca enrolada sobre pessoas do escritório. Peça detalhes usando relative clauses.',
      goal: 'Use who, whose e which em frases relativas na mesma conversa.',
      targets: ['The woman who called you is my boss.|A mulher que te ligou é minha chefe.', 'That\'s the friend whose dog bit me.|Esse é o amigo cujo cachorro me mordeu.', 'One should always double-check.|Deve-se sempre conferir duas vezes.', 'Whatever you decide is fine by me.|O que você decidir está bom pra mim.', 'The movie, which was long, ended badly.|O filme, que era longo, terminou mal.'],
    }),
  },

  /* ---------------------------------------------------- FILMES */
  {
    id: 'filmes', name: 'Filmes', emoji: '🎬',
    basico: L({
      words: ['movie|filme', 'actor|ator', 'actress|atriz', 'funny|engraçado', 'scary|assustador', 'sad|triste', 'boring|chato', 'cinema|cinema', 'ticket|ingresso', 'popcorn|pipoca', 'love|amar', 'watch|assistir', 'ending|final'],
      phrases: ['I like action movies.|Eu gosto de filmes de ação.', 'The movie was very funny.|O filme foi muito engraçado.', 'Who is your favorite actor?|Quem é seu ator favorito?', 'I watched a movie last night.|Assisti a um filme ontem à noite.', 'Horror movies are scary.|Filmes de terror são assustadores.'],
      roleplay: 'Cláudia pergunta qual filme você viu por último e se gostou.',
      goal: 'Diga o nome de um filme, se gostou e por quê (uma palavra: funny, sad...).',
      targets: ['I love this movie.|Eu amo esse filme.', 'The ending was sad.|O final foi triste.', 'Can I have popcorn?|Posso pegar pipoca?', 'She is a great actress.|Ela é uma ótima atriz.', 'This movie is boring.|Este filme é chato.'],
    }),
    intermediario: L({
      words: ['plot|enredo', 'twist|reviravolta', 'cast|elenco', 'sequel|continuação', 'director|diretor', 'soundtrack|trilha sonora', 'overrated|superestimado', 'underrated|subestimado', 'to be set in|se passar em', 'main character|protagonista', 'spoiler|spoiler', 'to recommend|recomendar', 'thriller|suspense'],
      phrases: ['The plot is about a man who loses his memory.|O enredo é sobre um homem que perde a memória.', 'It\'s set in New York in the 80s.|Se passa em Nova York nos anos 80.', 'I didn\'t see that twist coming.|Não esperava aquela reviravolta.', 'The sequel was worse than the original.|A continuação foi pior que o original.', 'You should definitely watch it.|Você definitivamente deveria assistir.'],
      roleplay: 'Recomende um filme para a Cláudia, que é exigente e odeia quase tudo.',
      goal: 'Descreva o enredo sem spoiler e convença ela a assistir.',
      targets: ['The cast was amazing.|O elenco estava incrível.', 'It\'s the best movie I\'ve ever seen.|É o melhor filme que já vi.', 'The soundtrack gave me chills.|A trilha sonora me deu arrepios.', 'It\'s a bit overrated.|É um pouco superestimado.', 'Don\'t give me any spoilers!|Não me dá spoiler!'],
    }),
    avancado: L({
      words: ['cinematography|fotografia (cinema)', 'pacing|ritmo', 'to drag on|se arrastar', 'cliché|clichê', 'tour de force|obra-prima de atuação', 'to fall flat|não funcionar / fracassar', 'thought-provoking|instigante', 'heavy-handed|forçado / sem sutileza', 'the suspension of disbelief|suspensão da descrença', 'box-office flop|fracasso de bilheteria', 'to steal the show|roubar a cena', 'arc|arco (de personagem)', 'gripping|envolvente'],
      phrases: ['The pacing drags on in the second act.|O ritmo se arrasta no segundo ato.', 'Her performance was a tour de force.|A atuação dela foi impecável.', 'The message felt a bit heavy-handed.|A mensagem pareceu meio forçada.', 'Had the studio cut 30 minutes, it would\'ve been brilliant.|Se o estúdio tivesse cortado 30 minutos, teria sido brilhante.', 'The jokes fell completely flat.|As piadas não funcionaram nada.'],
      roleplay: 'Vocês são críticos de cinema num podcast. Cláudia detona um filme que você ama.',
      goal: 'Defenda o filme falando de atuação, ritmo e roteiro, com uma condicional 3.',
      targets: ['The supporting actor stole the show.|O ator coadjuvante roubou a cena.', 'It was gripping from start to finish.|Foi envolvente do começo ao fim.', 'The cinematography is breathtaking.|A fotografia é de tirar o fôlego.', 'His character arc made no sense.|O arco do personagem dele não fez sentido.', 'It was a massive box-office flop.|Foi um fracasso enorme de bilheteria.'],
    }),
  },

  /* ---------------------------------------------------- SÉRIES */
  {
    id: 'series', name: 'Séries', emoji: '📺',
    basico: L({
      words: ['series|série', 'episode|episódio', 'season|temporada', 'character|personagem', 'favorite|favorito', 'every day|todo dia', 'night|noite', 'TV|TV', 'new|novo', 'old|antigo', 'good|bom', 'bad|ruim', 'start|começar'],
      phrases: ['I watch series every night.|Eu assisto séries toda noite.', 'What is your favorite series?|Qual é sua série favorita?', 'There are five seasons.|Há cinco temporadas.', 'I can\'t stop watching.|Eu não consigo parar de assistir.', 'This episode is very good.|Este episódio é muito bom.'],
      roleplay: 'Cláudia quer uma série nova para assistir. Fale da sua favorita.',
      goal: 'Diga o nome da série, quantas temporadas tem e o personagem favorito.',
      targets: ['My favorite series is Friends.|Minha série favorita é Friends.', 'I watch one episode every day.|Assisto um episódio todo dia.', 'There is a new season.|Tem uma temporada nova.', 'He is my favorite character.|Ele é meu personagem favorito.', 'Where can I watch it?|Onde posso assistir?'],
    }),
    intermediario: L({
      words: ['to binge-watch|maratonar', 'cliffhanger|final de suspense', 'to be hooked|estar viciado', 'to get cancelled|ser cancelada', 'spin-off|derivada', 'streaming|streaming', 'to catch up on|colocar em dia', 'storyline|trama', 'to renew|renovar', 'finale|episódio final', 'subtitles|legendas', 'dubbed|dublado', 'pilot|episódio piloto'],
      phrases: ['I binge-watched the whole season in two days.|Maratonei a temporada inteira em dois dias.', 'The season ended on a huge cliffhanger.|A temporada acabou num baita suspense.', 'I\'m totally hooked on this show.|Estou totalmente viciado nessa série.', 'I prefer watching with subtitles.|Prefiro assistir com legenda.', 'It got cancelled after season two.|Foi cancelada depois da segunda temporada.'],
      roleplay: 'Cláudia está atrasada numa série que você já terminou. Ela implora para você não dar spoiler.',
      goal: 'Fale da série sem spoiler, usando present perfect (I\'ve watched...).',
      targets: ['I\'ve already finished it.|Eu já terminei.', 'I\'m going to catch up this weekend.|Vou colocar em dia neste fim de semana.', 'The finale was disappointing.|O episódio final foi decepcionante.', 'They should renew it.|Eles deveriam renovar.', 'Do you watch it dubbed?|Você assiste dublado?'],
    }),
    avancado: L({
      words: ['to jump the shark|perder a qualidade (série)', 'slow burn|história de desenvolvimento lento', 'filler episode|episódio de enrolação', 'to wrap up|amarrar / concluir', 'ensemble cast|elenco coral', 'prestige TV|TV de prestígio', 'to milk it|esticar demais', 'loose ends|pontas soltas', 'morally grey|moralmente ambíguo', 'to live up to the hype|corresponder ao hype', 'showrunner|showrunner', 'to resonate|ressoar / tocar', 'binge-worthy|maratonável'],
      phrases: ['The show jumped the shark in season four.|A série perdeu a mão na quarta temporada.', 'They milked it way past its prime.|Esticaram muito além do auge.', 'If only they had ended it sooner.|Se ao menos tivessem terminado antes.', 'The finale left too many loose ends.|O final deixou pontas soltas demais.', 'It\'s a slow burn, but it pays off.|É lento, mas compensa.'],
      roleplay: 'Debate: Cláudia diz que séries longas sempre ficam ruins. Discuta com exemplos.',
      goal: 'Use "if only" ou "wish" e duas expressões idiomáticas do tema.',
      targets: ['It didn\'t live up to the hype.|Não correspondeu ao hype.', 'The protagonist is morally grey.|O protagonista é moralmente ambíguo.', 'That was clearly a filler episode.|Aquele foi claramente um episódio de enrolação.', 'They wrapped it up beautifully.|Eles concluíram lindamente.', 'It\'s binge-worthy from the pilot.|É maratonável desde o piloto.'],
    }),
  },

  /* ---------------------------------------------------- MÚSICAS */
  {
    id: 'musicas', name: 'Músicas', emoji: '🎵',
    basico: L({
      words: ['music|música', 'song|canção', 'singer|cantor', 'band|banda', 'listen|ouvir', 'sing|cantar', 'dance|dançar', 'loud|alto', 'concert|show', 'guitar|violão / guitarra', 'happy|feliz', 'beautiful|bonito', 'radio|rádio'],
      phrases: ['I listen to music every day.|Eu ouço música todo dia.', 'What kind of music do you like?|Que tipo de música você gosta?', 'I can\'t sing very well.|Não sei cantar muito bem.', 'This song is beautiful.|Esta música é bonita.', 'I went to a concert last year.|Fui a um show ano passado.'],
      roleplay: 'Cláudia é DJ de uma rádio e pergunta o que você quer ouvir.',
      goal: 'Diga seu estilo favorito, um cantor e uma música.',
      targets: ['I like rock music.|Eu gosto de rock.', 'She is a great singer.|Ela é uma ótima cantora.', 'Can you play the guitar?|Você sabe tocar violão?', 'This song makes me happy.|Esta música me deixa feliz.', 'Let\'s dance!|Vamos dançar!'],
    }),
    intermediario: L({
      words: ['lyrics|letra', 'catchy|chiclete / pegajoso', 'playlist|playlist', 'album|álbum', 'to be into|curtir / gostar de', 'tune|melodia', 'beat|batida', 'to release|lançar', 'live|ao vivo', 'cover|versão cover', 'genre|gênero', 'stuck in my head|grudado na cabeça', 'nostalgic|nostálgico'],
      phrases: ['I\'m really into indie rock lately.|Estou curtindo muito indie rock ultimamente.', 'This song has been stuck in my head all day.|Essa música está grudada na minha cabeça o dia todo.', 'The lyrics are really deep.|A letra é muito profunda.', 'Their new album was released last week.|O novo álbum deles saiu semana passada.', 'It sounds better live.|Soa melhor ao vivo.'],
      roleplay: 'Montem juntos uma playlist para uma viagem de carro. Cláudia tem gosto duvidoso.',
      goal: 'Recomende 2 músicas e explique por que cada uma combina com a viagem.',
      targets: ['The beat is so catchy.|A batida é muito chiclete.', 'This song makes me nostalgic.|Essa música me deixa nostálgico.', 'I\'ve listened to this album a hundred times.|Já ouvi esse álbum cem vezes.', 'Their cover is better than the original.|O cover deles é melhor que o original.', 'What genre are you into?|De que gênero você curte?'],
    }),
    avancado: L({
      words: ['guilty pleasure|prazer culpado', 'to grow on someone|ir conquistando aos poucos', 'earworm|música chiclete', 'sell-out|vendido (artista)', 'one-hit wonder|artista de um sucesso só', 'to strike a chord|tocar o coração', 'raw|cru / visceral', 'overproduced|produzido demais', 'to belt out|cantar a plenos pulmões', 'mainstream|mainstream', 'timeless|atemporal', 'to have an ear for|ter ouvido para', 'underground|alternativo / underground'],
      phrases: ['That song really grew on me.|Essa música foi me conquistando.', 'Their early stuff was raw; now it\'s overproduced.|O começo deles era cru; agora é produzido demais.', 'They\'re basically a one-hit wonder.|Eles são basicamente artistas de um sucesso só.', 'Little did I know it would become my favorite.|Mal sabia eu que viraria minha favorita.', 'That chorus really strikes a chord.|Esse refrão toca fundo.'],
      roleplay: 'Debate: Cláudia acha que a música de hoje é pior que a dos anos 90.',
      goal: 'Argumente usando "little did I know" ou inversão e 2 expressões do tema.',
      targets: ['It\'s my ultimate guilty pleasure.|É meu maior prazer culpado.', 'She has an ear for melody.|Ela tem ouvido para melodia.', 'We belted out every song.|Cantamos todas a plenos pulmões.', 'Some songs are simply timeless.|Algumas músicas são simplesmente atemporais.', 'They sold out to go mainstream.|Eles se venderam pra virar mainstream.'],
    }),
  },

  /* ---------------------------------------------------- VIAGEM */
  {
    id: 'viagem', name: 'Viagem', emoji: '✈️',
    basico: L({
      words: ['airport|aeroporto', 'passport|passaporte', 'hotel|hotel', 'room|quarto', 'ticket|passagem', 'bag|mala / bolsa', 'beach|praia', 'map|mapa', 'left|esquerda', 'right|direita', 'bathroom|banheiro', 'key|chave', 'night|noite'],
      phrases: ['I have a reservation.|Eu tenho uma reserva.', 'Where is the bathroom?|Onde fica o banheiro?', 'How much is it?|Quanto custa?', 'Can I have the key, please?|Pode me dar a chave, por favor?', 'Turn left, please.|Vire à esquerda, por favor.'],
      roleplay: 'Check-in no hotel. Cláudia é a recepcionista mal-humorada.',
      goal: 'Faça o check-in: diga seu nome, quantas noites e peça o wi-fi.',
      targets: ['Here is my passport.|Aqui está meu passaporte.', 'I want a room for two nights.|Quero um quarto por duas noites.', 'Where is the airport?|Onde fica o aeroporto?', 'Is there a beach near here?|Tem praia aqui perto?', 'What is the wi-fi password?|Qual é a senha do wi-fi?'],
    }),
    intermediario: L({
      words: ['layover|escala', 'boarding pass|cartão de embarque', 'to check in|fazer check-in', 'delayed|atrasado', 'luggage|bagagem', 'customs|alfândega', 'sightseeing|passeio turístico', 'itinerary|roteiro', 'to book|reservar', 'off the beaten path|fora do roteiro turístico', 'jet lag|jet lag', 'refund|reembolso', 'aisle seat|assento no corredor'],
      phrases: ['My flight has been delayed for three hours.|Meu voo atrasou três horas.', 'I\'d like an aisle seat, if possible.|Gostaria de um assento no corredor, se possível.', 'My luggage didn\'t arrive.|Minha bagagem não chegou.', 'We\'re going to do some sightseeing tomorrow.|Vamos fazer um passeio turístico amanhã.', 'If the flight is cancelled, will I get a refund?|Se o voo for cancelado, eu recebo reembolso?'],
      roleplay: 'Sua mala sumiu no aeroporto. Cláudia é a atendente do balcão de bagagens.',
      goal: 'Descreva a mala, conte o que aconteceu e peça uma solução.',
      targets: ['I missed my connecting flight.|Perdi meu voo de conexão.', 'I\'ve booked a hostel downtown.|Reservei um hostel no centro.', 'I\'m still dealing with jet lag.|Ainda estou lidando com o jet lag.', 'Where do I go through customs?|Onde eu passo pela alfândega?', 'Could you check my boarding pass?|Pode conferir meu cartão de embarque?'],
    }),
    avancado: L({
      words: ['wanderlust|vontade de viajar', 'tourist trap|armadilha para turista', 'to get ripped off|ser passado para trás', 'bucket list|lista de desejos', 'to soak up|absorver / curtir', 'culture shock|choque cultural', 'to rough it|viajar no perrengue', 'stopover|parada (de dias)', 'to go off-grid|sumir do mapa', 'hidden gem|joia escondida', 'overtourism|turismo excessivo', 'to wing it|improvisar', 'the locals|os moradores locais'],
      phrases: ['That restaurant was a total tourist trap.|Aquele restaurante era uma armadilha para turista total.', 'We decided to wing it and skip the itinerary.|Decidimos improvisar e pular o roteiro.', 'Had we booked earlier, we\'d have saved a fortune.|Se tivéssemos reservado antes, teríamos economizado uma fortuna.', 'I\'d rather rough it than stay in a fancy resort.|Prefiro o perrengue a ficar num resort chique.', 'Overtourism is ruining some cities.|O turismo excessivo está arruinando algumas cidades.'],
      roleplay: 'Debate: Cláudia acha que viajar sem roteiro é burrice. Você defende o improviso (ou o contrário).',
      goal: 'Conte uma história de viagem com condicional 3 e 2 expressões idiomáticas.',
      targets: ['We got totally ripped off.|Fomos totalmente passados para trás.', 'Iceland is on my bucket list.|A Islândia está na minha lista de desejos.', 'I just wanted to soak up the atmosphere.|Eu só queria curtir o clima.', 'That café is a real hidden gem.|Aquele café é uma verdadeira joia escondida.', 'The culture shock hit me hard.|O choque cultural me pegou forte.'],
    }),
  },

  /* ---------------------------------------------------- FUTEBOL */
  {
    id: 'futebol', name: 'Futebol', emoji: '⚽',
    basico: L({
      words: ['soccer / football|futebol', 'team|time', 'player|jogador', 'goal|gol', 'game / match|jogo / partida', 'win|ganhar', 'lose|perder', 'ball|bola', 'fan|torcedor', 'stadium|estádio', 'coach|técnico', 'score|placar', 'draw|empate'],
      phrases: ['What team do you support?|Para que time você torce?', 'My team won yesterday.|Meu time ganhou ontem.', 'The score was two to one.|O placar foi dois a um.', 'He is a great player.|Ele é um ótimo jogador.', 'It was a draw.|Foi empate.'],
      roleplay: 'Cláudia torce para o time rival e quer saber do jogo de ontem.',
      goal: 'Diga seu time, o placar do último jogo e quem fez gol.',
      targets: ['I support Flamengo.|Eu torço pro Flamengo.', 'We lost the game.|Nós perdemos o jogo.', 'What a goal!|Que golaço!', 'The stadium is full.|O estádio está cheio.', 'Who is the coach?|Quem é o técnico?'],
    }),
    intermediario: L({
      words: ['referee|juiz', 'penalty|pênalti', 'offside|impedimento', 'striker|atacante', 'goalkeeper|goleiro', 'to score|marcar gol', 'league|campeonato / liga', 'relegated|rebaixado', 'injury time|acréscimos', 'to be sent off|ser expulso', 'red card|cartão vermelho', 'title|título', 'to equalize|empatar (o jogo)'],
      phrases: ['The referee was terrible yesterday.|O juiz foi horrível ontem.', 'That was clearly offside!|Aquilo foi impedimento claro!', 'He scored in injury time.|Ele marcou nos acréscimos.', 'If we lose again, we\'ll get relegated.|Se perdermos de novo, seremos rebaixados.', 'We should have won that game.|A gente devia ter ganho aquele jogo.'],
      roleplay: 'Mesa redonda: comente o jogo de ontem com a Cláudia, que culpa o juiz de tudo.',
      goal: 'Conte o jogo usando past simple e dê sua opinião com should/must.',
      targets: ['The goalkeeper made an amazing save.|O goleiro fez uma defesa incrível.', 'He was sent off in the first half.|Ele foi expulso no primeiro tempo.', 'It was a clear penalty.|Foi pênalti claro.', 'We\'re going to win the league.|Vamos ganhar o campeonato.', 'They equalized in the last minute.|Eles empataram no último minuto.'],
    }),
    avancado: L({
      words: ['to park the bus|retrancar o time', 'a hat-trick|três gols no jogo', 'nutmeg|caneta (drible)', 'banana skin|casca de banana (jogo traiçoeiro)', 'to bottle it|amarelar', 'clinical finish|finalização precisa', 'dodgy decision|decisão duvidosa', 'underdog|azarão', 'to be on fire|estar em chamas / em grande fase', 'derby|clássico', 'to throw away a lead|entregar a vantagem', 'set piece|bola parada', 'VAR|VAR'],
      phrases: ['They parked the bus and still lost.|Eles retrancaram e mesmo assim perderam.', 'We bottled it in the final, as usual.|Amarelamos na final, como sempre.', 'Had the VAR been checked, the goal would\'ve been disallowed.|Se o VAR tivesse sido checado, o gol teria sido anulado.', 'Never have I seen such a clinical finish.|Nunca vi uma finalização tão precisa.', 'The underdogs pulled off a massive upset.|O azarão conseguiu uma zebra enorme.'],
      roleplay: 'Podcast de futebol: Cláudia defende que o VAR estragou o esporte. Debatam.',
      goal: 'Opine sobre o VAR com inversão (Never have I...) e uma condicional 3.',
      targets: ['He scored a stunning hat-trick.|Ele fez um hat-trick impressionante.', 'That was a dodgy decision.|Aquela foi uma decisão duvidosa.', 'We threw away a two-goal lead.|Entregamos uma vantagem de dois gols.', 'The striker is on fire this season.|O atacante está em chamas nesta temporada.', 'The derby is always a banana skin.|O clássico é sempre uma casca de banana.'],
    }),
  },

  /* ---------------------------------------------------- TRABALHO */
  {
    id: 'trabalho', name: 'Trabalho', emoji: '💼',
    basico: L({
      words: ['work|trabalhar / trabalho', 'job|emprego', 'office|escritório', 'boss|chefe', 'meeting|reunião', 'computer|computador', 'email|e-mail', 'busy|ocupado', 'colleague|colega', 'salary|salário', 'start|começar', 'finish|terminar', 'from home|de casa'],
      phrases: ['I work in an office.|Eu trabalho num escritório.', 'What do you do?|O que você faz (profissão)?', 'I start work at nine.|Começo a trabalhar às nove.', 'I work from home on Fridays.|Trabalho de casa às sextas.', 'My boss is very busy.|Meu chefe é muito ocupado.'],
      roleplay: 'Cláudia quer saber como é seu dia de trabalho.',
      goal: 'Diga sua profissão, horário e uma coisa que você faz todo dia.',
      targets: ['I am a designer.|Eu sou designer.', 'I have a meeting at ten.|Tenho uma reunião às dez.', 'I send a lot of emails.|Eu mando muitos e-mails.', 'My colleague is very nice.|Meu colega é muito legal.', 'I finish work at six.|Termino o trabalho às seis.'],
    }),
    intermediario: L({
      words: ['deadline|prazo', 'to be in charge of|ser responsável por', 'to run late|estar atrasado', 'workload|carga de trabalho', 'to get a raise|ganhar aumento', 'promotion|promoção', 'to deal with|lidar com', 'remote|remoto', 'burnout|esgotamento', 'to set up|organizar / marcar', 'to follow up|dar retorno', 'client|cliente', 'overtime|hora extra'],
      phrases: ['I\'m in charge of the marketing team.|Sou responsável pela equipe de marketing.', 'We have a tight deadline this week.|Temos um prazo apertado esta semana.', 'Could we set up a call tomorrow?|Podemos marcar uma call amanhã?', 'I\'ll follow up by email.|Vou dar retorno por e-mail.', 'I\'ve been working overtime a lot.|Tenho feito muita hora extra.'],
      roleplay: 'Cláudia é sua chefe e você precisa pedir um prazo maior para um projeto.',
      goal: 'Peça mais prazo explicando o motivo com educação (could, would, should).',
      targets: ['I\'m dealing with a difficult client.|Estou lidando com um cliente difícil.', 'My workload is crazy right now.|Minha carga de trabalho está insana agora.', 'I\'m going to ask for a raise.|Vou pedir um aumento.', 'Working remotely is more productive.|Trabalhar remoto é mais produtivo.', 'Sorry, I\'m running late.|Desculpa, estou atrasado.'],
    }),
    avancado: L({
      words: ['to touch base|alinhar / conversar rapidamente', 'to drop the ball|vacilar / deixar a peteca cair', 'bandwidth|disponibilidade', 'to push back on|questionar / resistir a', 'low-hanging fruit|ganho fácil', 'to circle back|retomar o assunto', 'to be on the same page|estar alinhado', 'micromanage|microgerenciar', 'stakeholder|parte interessada', 'to step up|assumir a responsabilidade', 'corporate jargon|jargão corporativo', 'to call it a day|encerrar o dia', 'leverage|alavancar'],
      phrases: ['I don\'t have the bandwidth for that right now.|Não tenho disponibilidade para isso agora.', 'I\'d like to push back on that deadline.|Gostaria de questionar esse prazo.', 'Let\'s circle back on this next week.|Vamos retomar isso semana que vem.', 'Had I been told earlier, I could have prepared.|Se tivessem me avisado antes, eu teria me preparado.', 'Should you need anything, let me know.|Caso precise de algo, me avise.'],
      roleplay: 'Reunião tensa: Cláudia é uma gerente que microgerencia tudo. Negocie autonomia com tom diplomático.',
      goal: 'Discorde de forma diplomática e formal, usando "Should you..." ou passiva.',
      targets: ['Let\'s make sure we\'re on the same page.|Vamos garantir que estamos alinhados.', 'Someone dropped the ball on this.|Alguém vacilou nisso.', 'Let\'s go for the low-hanging fruit first.|Vamos atrás dos ganhos fáceis primeiro.', 'The report was approved by the board.|O relatório foi aprovado pela diretoria.', 'I think we should call it a day.|Acho que devemos encerrar o dia.'],
    }),
  },

  /* ---------------------------------------------------- ENTREVISTA */
  {
    id: 'entrevista', name: 'Entrevista de emprego', emoji: '🤝',
    basico: L({
      words: ['interview|entrevista', 'experience|experiência', 'skill|habilidade', 'strong|forte', 'weak|fraco', 'team|equipe', 'hard-working|trabalhador', 'company|empresa', 'year|ano', 'study|estudar', 'university|faculdade', 'speak|falar', 'learn|aprender'],
      phrases: ['Tell me about yourself.|Fale sobre você.', 'I have three years of experience.|Tenho três anos de experiência.', 'I am hard-working.|Sou trabalhador.', 'I can work in a team.|Sei trabalhar em equipe.', 'Why do you want this job?|Por que você quer esta vaga?'],
      roleplay: 'Cláudia é a recrutadora debochada. Ela faz perguntas típicas: tell me about yourself, strengths, why this job.',
      goal: 'Responda "tell me about yourself" com nome, experiência e uma qualidade.',
      targets: ['I studied at university.|Eu estudei na faculdade.', 'I like to learn new things.|Gosto de aprender coisas novas.', 'My strong skill is communication.|Minha habilidade forte é comunicação.', 'I want to work at this company.|Quero trabalhar nesta empresa.', 'I speak Portuguese and English.|Falo português e inglês.'],
    }),
    intermediario: L({
      words: ['strengths|pontos fortes', 'weaknesses|pontos fracos', 'background|formação / histórico', 'to be responsible for|ser responsável por', 'achievement|conquista', 'challenge|desafio', 'to handle|lidar com', 'goal|objetivo', 'proactive|proativo', 'to apply for|se candidatar a', 'position|vaga / cargo', 'reference|referência', 'to improve|melhorar'],
      phrases: ['My main strength is that I\'m very organized.|Meu principal ponto forte é que sou muito organizado.', 'I\'ve been working in sales for five years.|Trabalho com vendas há cinco anos.', 'One of my weaknesses is that I\'m a perfectionist.|Um dos meus pontos fracos é ser perfeccionista.', 'Where do you see yourself in five years?|Onde você se vê daqui a cinco anos?', 'I\'m applying for this position because...|Estou me candidatando a esta vaga porque...'],
      roleplay: 'Entrevista real: Cláudia (recrutadora cética) pergunta strengths, weaknesses, why this job e uma situação difícil.',
      goal: 'Responda strengths, weaknesses e why this job com exemplos concretos.',
      targets: ['I handled a very difficult project.|Lidei com um projeto muito difícil.', 'I\'m a proactive person.|Sou uma pessoa proativa.', 'My biggest achievement was leading a team.|Minha maior conquista foi liderar uma equipe.', 'I\'m working on improving my public speaking.|Estou trabalhando para melhorar minha fala em público.', 'I see myself as a manager in five years.|Me vejo como gerente em cinco anos.'],
    }),
    avancado: L({
      words: ['track record|histórico comprovado', 'to thrive|prosperar', 'transferable skills|habilidades transferíveis', 'cross-functional|multidisciplinar', 'to spearhead|liderar (iniciativa)', 'results-driven|focado em resultados', 'to take ownership|assumir responsabilidade', 'stakeholder management|gestão de stakeholders', 'growth mindset|mentalidade de crescimento', 'to align with|estar alinhado com', 'counteroffer|contraproposta', 'compensation package|pacote de remuneração', 'to negotiate|negociar'],
      phrases: ['I have a proven track record in scaling teams.|Tenho histórico comprovado em escalar equipes.', 'I spearheaded a project that cut costs by 20%.|Liderei um projeto que cortou custos em 20%.', 'I thrive in fast-paced environments.|Eu prospero em ambientes acelerados.', 'Were I to join, my first priority would be...|Caso eu entrasse, minha primeira prioridade seria...', 'Could we discuss the compensation package?|Podemos falar do pacote de remuneração?'],
      roleplay: 'Entrevista final com Cláudia, diretora exigente: STAR method, perguntas cabeludas e negociação salarial.',
      goal: 'Conte uma conquista usando o método STAR e negocie salário com tom formal.',
      targets: ['I take full ownership of my results.|Assumo total responsabilidade pelos meus resultados.', 'My values align with the company\'s mission.|Meus valores se alinham com a missão da empresa.', 'I\'ve worked closely with cross-functional teams.|Trabalhei próximo de equipes multidisciplinares.', 'I\'d like to negotiate the offer.|Gostaria de negociar a proposta.', 'I have a strong growth mindset.|Tenho uma forte mentalidade de crescimento.'],
    }),
  },

  /* ---------------------------------------------------- RESTAURANTE */
  {
    id: 'restaurante', name: 'Restaurante', emoji: '🍽️',
    basico: L({
      words: ['menu|cardápio', 'table|mesa', 'waiter|garçom', 'order|pedir', 'drink|bebida', 'dessert|sobremesa', 'bill / check|conta', 'meat|carne', 'salad|salada', 'without|sem', 'with|com', 'please|por favor', 'thank you|obrigado'],
      phrases: ['A table for two, please.|Uma mesa para dois, por favor.', 'Can I see the menu?|Posso ver o cardápio?', 'I would like a salad, please.|Eu gostaria de uma salada, por favor.', 'The check, please.|A conta, por favor.', 'Without onions, please.|Sem cebola, por favor.'],
      roleplay: 'Cláudia é a garçonete impaciente. Peça comida e bebida.',
      goal: 'Peça um prato, uma bebida e pergunte os ingredientes.',
      targets: ['I would like a coke.|Eu gostaria de uma coca.', 'What is in this dish?|O que tem neste prato?', 'Can I have the check?|Pode trazer a conta?', 'The food is very good.|A comida está muito boa.', 'I want chocolate cake for dessert.|Quero bolo de chocolate de sobremesa.'],
    }),
    intermediario: L({
      words: ['starter|entrada', 'main course|prato principal', 'side dish|acompanhamento', 'to recommend|recomendar', 'medium rare|ao ponto para mal', 'well done|bem passado', 'tip|gorjeta', 'to split the bill|dividir a conta', 'allergic|alérgico', 'gluten-free|sem glúten', 'to complain|reclamar', 'cold|frio', 'reservation|reserva'],
      phrases: ['What would you recommend?|O que você recomenda?', 'I\'d like my steak medium rare.|Quero meu bife ao ponto para mal.', 'I\'m allergic to peanuts.|Sou alérgico a amendoim.', 'Can we split the bill?|Podemos dividir a conta?', 'Excuse me, my food is cold.|Com licença, minha comida está fria.'],
      roleplay: 'Seu prato veio errado e frio. Cláudia é a gerente que não quer dar desconto.',
      goal: 'Reclame com educação e consiga uma solução (troca ou desconto).',
      targets: ['I\'ll have the soup as a starter.|Vou pedir a sopa de entrada.', 'Is the tip included?|A gorjeta está incluída?', 'Do you have gluten-free options?|Vocês têm opções sem glúten?', 'This isn\'t what I ordered.|Isso não é o que eu pedi.', 'We have a reservation for eight.|Temos uma reserva para oito pessoas.'],
    }),
    avancado: L({
      words: ['to be comped|ganhar cortesia', 'to send back|devolver (prato)', 'corkage fee|taxa de rolha', 'tasting menu|menu degustação', 'pairing|harmonização', 'overpriced|caro demais', 'ambiance|ambiente', 'to pick up the tab|pagar a conta (de todos)', 'to be on the house|ser por conta da casa', 'snobby|esnobe', 'understated|discreto / sóbrio', 'to rave about|elogiar muito', 'pretentious|pretensioso'],
      phrases: ['I\'m afraid I\'ll have to send this back.|Receio que vou ter que devolver isto.', 'The ambiance was lovely, but it was wildly overpriced.|O ambiente era lindo, mas absurdamente caro.', 'Dessert is on the house.|A sobremesa é por conta da casa.', 'Let me pick up the tab this time.|Deixa que eu pago a conta desta vez.', 'Not once did the waiter check on us.|Nem uma vez o garçom veio ver a gente.'],
      roleplay: 'Jantar num restaurante esnobe: Cláudia é a sommelier pretensiosa. Peça harmonização e reclame com classe.',
      goal: 'Reclame de forma formal e irônica, usando inversão (Not once did...) ou passiva.',
      targets: ['Everyone raves about this place.|Todo mundo elogia muito esse lugar.', 'The wine pairing was exquisite.|A harmonização de vinhos foi requintada.', 'The tasting menu is a bit pretentious.|O menu degustação é meio pretensioso.', 'Our drinks were comped.|Nossas bebidas foram cortesia.', 'Is there a corkage fee?|Tem taxa de rolha?'],
    }),
  },
];

/* Todos os temas: cultura pop primeiro (content-pop.js), depois o dia a dia. */
export const THEMES = [...POP_THEMES, ...DAILY_THEMES.map((t) => ({ ...t, group: 'diaadia' }))];

/* Os cenários foram escritos com a Cláudia (feminino). Quando o professor
   é homem (Mario), esta função troca o nome e os papéis para o masculino.
   Use só em "roleplay", "goal" e "style" — nunca nas traduções das frases. */
const MASC = [
  ['uma amiga', 'um amigo'], ['sua amiga', 'seu amigo'], ['a amiga', 'o amigo'], ['uma estranha curiosa', 'um estranho curioso'],
  ['uma colega nova', 'um colega novo'], ['a recepcionista mal-humorada', 'o recepcionista mal-humorado'], ['a atendente', 'o atendente'],
  ['está atrasada', 'está atrasado'], ['sua chefe', 'seu chefe'], ['uma gerente', 'um gerente'], ['a gerente', 'o gerente'],
  ['a recrutadora debochada', 'o recrutador debochado'], ['RECRUTADORA debochada', 'RECRUTADOR debochado'], ['recrutadora cética', 'recrutador cético'], ['recrutadora', 'recrutador'],
  ['diretora exigente', 'diretor exigente'], ['a garçonete impaciente', 'o garçom impaciente'], ['a sommelier pretensiosa', 'o sommelier pretensioso'],
  ['a sócia exigente', 'o sócio exigente'], ['sócia arrogante', 'sócio arrogante'], ['a advogada', 'o advogado'], ['a professora carrasca', 'o professor carrasco'],
  ['a chefe desconfiada', 'o chefe desconfiado'], ['a chefe sem noção', 'o chefe sem noção'], ['a chefe', 'o chefe'], ['uma jarl desconfiada', 'um jarl desconfiado'], ['a jarl', 'o jarl'],
  ['a policial cética', 'o policial cético'], ['uma rainha desconfiada', 'um rei desconfiado'], ['rainha desconfiada', 'rei desconfiado'], ['a rainha', 'o rei'], ['uma DJ', 'um DJ'],
];
export function genderize(text, teacher) {
  let t = String(text || '');
  if (teacher?.g === 'm') {
    for (const [f, m] of MASC) t = t.replaceAll(f, m);
    t = t.replace(/\bela\b/g, 'ele').replace(/\bEla\b/g, 'Ele').replace(/\bdela\b/g, 'dele');
  }
  return t.replaceAll('Cláudia', teacher?.name || 'Cláudia');
}

/* Tema livre (sempre desbloqueado): o usuário digita o assunto. */
export const FREE_THEME = { id: 'livre', name: 'Tema livre', emoji: '🎲' };

/* ----------------------------------------------------------
   Teste de nível (5 perguntas). Pontuação: 0-2 básico,
   3-4 intermediário, 5 avançado.
   ---------------------------------------------------------- */
export const LEVEL_TEST = [
  { q: 'Complete: "She ___ a doctor."', options: ['is', 'are', 'am', 'be'], a: 0 },
  { q: 'Complete: "Yesterday I ___ to the beach."', options: ['go', 'goes', 'went', 'gone'], a: 2 },
  { q: 'Complete: "I ___ in São Paulo since 2015."', options: ['live', 'am living', 'have lived', 'lived'], a: 2 },
  { q: 'Complete: "If I ___ rich, I would travel the world."', options: ['am', 'were', 'will be', 'have been'], a: 1 },
  { q: 'Complete: "___ I known about the traffic, I would have left earlier."', options: ['If', 'Did', 'Had', 'Were'], a: 2 },
];

/* Ajuda de busca */
export function getTheme(id) { return THEMES.find((t) => t.id === id); }
