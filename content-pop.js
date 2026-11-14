/* ==========================================================
   content-pop.js — cultura pop como método de ensino:
   séries, filmes e rap/hip-hop.
   ----------------------------------------------------------
   Mesmo formato do content.js ("inglês|português").
   "style" diz à Cláudia COMO usar o universo da série na conversa.
   Regra de ouro: nada de copiar falas/letras. As frases abaixo
   são originais, só falam SOBRE as obras.
   ========================================================== */

const P = (arr) => arr.map((s) => { const [en, pt] = s.split('|'); return { en: en.trim(), pt: (pt || '').trim() }; });
const L = (o) => ({ words: P(o.words), phrases: P(o.phrases), roleplay: o.roleplay, goal: o.goal, targets: P(o.targets) });

export const POP_THEMES = [
  /* ---------------------------------------------------- FRIENDS */
  {
    id: 'friends', name: 'Friends', emoji: '🛋️', group: 'pop',
    style: 'Use o universo de Friends: a cafeteria Central Perk, o apartamento da Monica, Ross e Rachel, Joey e a comida, o sarcasmo do Chandler, a Phoebe esquisita. Converse sobre episódios, personagens e situações e use isso para ensinar o inglês do dia a dia americano.',
    basico: L({
      words: ['friend|amigo', 'roommate|colega de apartamento', 'coffee shop|cafeteria', 'couch|sofá', 'apartment|apartamento', 'funny|engraçado', 'boyfriend|namorado', 'girlfriend|namorada', 'sandwich|sanduíche', 'date|encontro', 'joke|piada', 'wedding|casamento', 'best friend|melhor amigo'],
      phrases: ['Joey loves food.|Joey ama comida.', 'Monica is very clean.|Monica é muito limpa.', 'They drink coffee at Central Perk.|Eles tomam café no Central Perk.', 'Chandler makes a lot of jokes.|Chandler faz muitas piadas.', 'Who is your favorite character?|Quem é seu personagem favorito?'],
      roleplay: 'Vocês estão no sofá de uma cafeteria estilo Central Perk. Cláudia pergunta sobre seus amigos e seu personagem favorito.',
      goal: 'Descreva seu personagem favorito de Friends com 3 características.',
      targets: ['My favorite character is Joey.|Meu personagem favorito é o Joey.', 'Ross has a pet monkey.|Ross tem um macaco de estimação.', 'Phoebe sings funny songs.|Phoebe canta músicas engraçadas.', 'We are friends forever.|Somos amigos para sempre.', 'Rachel works in a coffee shop.|Rachel trabalha numa cafeteria.'],
    }),
    intermediario: L({
      words: ['to be on a break|dar um tempo (relação)', 'to hit on|dar em cima', 'to make up|fazer as pazes', 'to break up|terminar', 'awkward|constrangedor', 'to move in|ir morar junto', 'to freak out|surtar', 'to get over|superar', 'crush|paixonite', 'clumsy|desastrado', 'to set someone up|arranjar um encontro', 'sarcastic|sarcástico', 'to tease|zoar'],
      phrases: ['Were Ross and Rachel really on a break?|Ross e Rachel estavam mesmo dando um tempo?', 'Joey hits on everyone he meets.|Joey dá em cima de todo mundo.', 'Monica freaks out when the apartment is messy.|Monica surta quando o apê está bagunçado.', 'Chandler uses sarcasm when he feels awkward.|Chandler usa sarcasmo quando fica sem graça.', 'If I lived in New York, I would hang out at a café every day.|Se eu morasse em NY, ficaria num café todo dia.'],
      roleplay: 'Debate na cafeteria: Cláudia jura que o Ross estava errado na história do "break". Defenda um lado.',
      goal: 'Dê sua opinião sobre a polêmica do "break" com 2 argumentos e uma condicional.',
      targets: ['They broke up and made up again.|Eles terminaram e voltaram de novo.', 'He can\'t get over her.|Ele não consegue superar ela.', 'Stop teasing me!|Para de me zoar!', 'She moved in with her boyfriend.|Ela foi morar com o namorado.', 'Monica totally freaked out.|Monica surtou total.'],
    }),
    avancado: L({
      words: ['deadpan|humor seco', 'catchphrase|bordão', 'to have chemistry|ter química', 'will-they-won\'t-they|o "vão ou não vão ficar"', 'to age badly|envelhecer mal', 'laugh track|risadas de fundo', 'ensemble cast|elenco coral', 'running gag|piada recorrente', 'to cringe|sentir vergonha alheia', 'codependent|codependente', 'to call someone out|confrontar alguém', 'comfort show|série conforto', 'to rewatch|reassistir'],
      phrases: ['Some jokes haven\'t aged well at all.|Algumas piadas não envelheceram nada bem.', 'Chandler\'s deadpan delivery is unmatched.|O humor seco do Chandler é imbatível.', 'Had Ross not said the wrong name, everything would have been different.|Se o Ross não tivesse falado o nome errado, tudo teria sido diferente.', 'The running gags are what keep me rewatching it.|As piadas recorrentes me fazem reassistir.', 'Without the laugh track, half the scenes would feel awkward.|Sem as risadas de fundo, metade das cenas pareceria constrangedora.'],
      roleplay: 'Podcast de cultura pop: Cláudia diz que Friends envelheceu mal. Você defende ou concorda com nuance.',
      goal: 'Argumente se Friends envelheceu bem usando condicional 3 e 2 expressões do tema.',
      targets: ['Their chemistry is undeniable.|A química deles é inegável.', 'That scene makes me cringe.|Essa cena me dá vergonha alheia.', 'It\'s the ultimate comfort show.|É a série conforto definitiva.', 'The will-they-won\'t-they lasted ten seasons.|O vão-ou-não-vão durou dez temporadas.', 'That\'s my favorite running gag.|Essa é minha piada recorrente favorita.'],
    }),
  },

  /* ---------------------------------------------------- SUITS */
  {
    id: 'suits', name: 'Suits', emoji: '⚖️', group: 'pop',
    style: 'Use o universo de Suits: escritório de advocacia em Nova York, Harvey Specter confiante, Mike com memória fotográfica e sem diploma, Donna que sabe tudo, Louis competitivo, negociações e blefes. Ensine inglês corporativo, jurídico e de negociação. Cláudia pode agir como sócia arrogante do escritório.',
    basico: L({
      words: ['lawyer|advogado', 'law firm|escritório de advocacia', 'office|escritório', 'client|cliente', 'case|caso', 'deal|acordo', 'boss|chefe', 'suit|terno', 'contract|contrato', 'win|ganhar', 'lie|mentir', 'secret|segredo', 'smart|inteligente'],
      phrases: ['Harvey is a great lawyer.|Harvey é um ótimo advogado.', 'Mike has a big secret.|Mike tem um grande segredo.', 'Donna knows everything.|Donna sabe tudo.', 'We have a new client.|Temos um cliente novo.', 'I always wear a suit to work.|Sempre uso terno no trabalho.'],
      roleplay: 'Primeiro dia num escritório de advocacia de Nova York. Cláudia é a sócia exigente e quer saber quem você é.',
      goal: 'Apresente-se profissionalmente: nome, o que faz e uma qualidade.',
      targets: ['I want to win this case.|Quero ganhar este caso.', 'He is a very smart lawyer.|Ele é um advogado muito inteligente.', 'Can I see the contract?|Posso ver o contrato?', 'We have a deal.|Temos um acordo.', 'Don\'t lie to me.|Não minta pra mim.'],
    }),
    intermediario: L({
      words: ['to close a deal|fechar um acordo', 'leverage|poder de barganha', 'to bluff|blefar', 'settlement|acordo judicial', 'to back down|recuar', 'to sue|processar', 'partner|sócio', 'associate|associado', 'loyal|leal', 'to cover for someone|acobertar alguém', 'to blackmail|chantagear', 'confident|confiante', 'to get fired|ser demitido'],
      phrases: ['Harvey never backs down.|Harvey nunca recua.', 'You need leverage to win a negotiation.|Você precisa de poder de barganha pra ganhar uma negociação.', 'If they sue us, we\'ll settle out of court.|Se nos processarem, faremos acordo fora do tribunal.', 'He\'s bluffing, and I know it.|Ele está blefando, e eu sei.', 'Donna covered for Harvey again.|Donna acobertou o Harvey de novo.'],
      roleplay: 'Negociação: Cláudia é a advogada da outra parte, arrogante. Você precisa fechar um acordo melhor.',
      goal: 'Negocie usando if/will e chame o blefe dela pelo menos uma vez.',
      targets: ['I\'m not going to back down.|Não vou recuar.', 'Let\'s close this deal today.|Vamos fechar esse acordo hoje.', 'You\'re bluffing.|Você está blefando.', 'He got fired for lying.|Ele foi demitido por mentir.', 'We have all the leverage.|Temos todo o poder de barganha.'],
    }),
    avancado: L({
      words: ['to call someone\'s bluff|pagar pra ver o blefe', 'to play hardball|jogar duro', 'non-negotiable|inegociável', 'fine print|letras miúdas', 'to have someone over a barrel|ter alguém nas mãos', 'breach of contract|quebra de contrato', 'to cut corners|pegar atalhos (antiético)', 'to throw someone under the bus|jogar alguém aos leões', 'power move|jogada de poder', 'to bill hours|faturar horas', 'to hold all the cards|ter todas as cartas', 'fraud|fraude', 'to be disbarred|ter o registro de advogado cassado'],
      phrases: ['Under no circumstances will we accept those terms.|Em nenhuma circunstância aceitaremos esses termos.', 'Had you read the fine print, you\'d have seen the clause.|Se tivesse lido as letras miúdas, teria visto a cláusula.', 'They threw him under the bus to save the firm.|Jogaram ele aos leões pra salvar o escritório.', 'That was a classic power move.|Aquela foi uma clássica jogada de poder.', 'Should you breach the contract, we will sue.|Caso quebre o contrato, processaremos.'],
      roleplay: 'Debate ético: Cláudia defende que o Mike merecia perder tudo pela fraude. Você argumenta com tom formal de advogado.',
      goal: 'Debata a ética do Mike com inversão (Under no circumstances...) e uma condicional 3.',
      targets: ['I\'m calling your bluff.|Estou pagando pra ver.', 'This clause is non-negotiable.|Essa cláusula é inegociável.', 'They\'re playing hardball.|Eles estão jogando duro.', 'We have them over a barrel.|Temos eles nas mãos.', 'He cut corners and got caught.|Ele pegou atalhos e foi pego.'],
    }),
  },

  /* ---------------------------------------------------- HARRY POTTER */
  {
    id: 'harrypotter', name: 'Harry Potter', emoji: '🧙', group: 'pop',
    style: 'Use o universo de Harry Potter: Hogwarts, as quatro casas, feitiços, Quadribol, Hermione estudiosa, Ron, Snape, Dumbledore, Voldemort. Aproveite para ensinar inglês BRITÂNICO (mate, brilliant, bloody, gutted, loo) e comparar com o americano.',
    basico: L({
      words: ['wizard|bruxo', 'witch|bruxa', 'wand|varinha', 'magic|magia', 'spell|feitiço', 'school|escola', 'owl|coruja', 'broom|vassoura', 'castle|castelo', 'house|casa (de Hogwarts)', 'brave|corajoso', 'loyal|leal', 'scary|assustador'],
      phrases: ['Harry is a young wizard.|Harry é um bruxo jovem.', 'Hermione is very smart.|Hermione é muito inteligente.', 'I want a magic wand.|Quero uma varinha mágica.', 'Hogwarts is a big castle.|Hogwarts é um castelo grande.', 'Which house are you in?|Em qual casa você está?'],
      roleplay: 'Cerimônia de seleção: Cláudia é o chapéu seletor mal-humorado e pergunta sobre sua personalidade para escolher sua casa.',
      goal: 'Descreva sua personalidade com 3 adjetivos e diga qual casa você quer.',
      targets: ['I am brave and loyal.|Eu sou corajoso e leal.', 'My owl brings letters.|Minha coruja traz cartas.', 'He can fly on a broom.|Ele sabe voar numa vassoura.', 'This spell is very hard.|Esse feitiço é muito difícil.', 'I want to be in Gryffindor.|Quero ficar na Grifinória.'],
    }),
    intermediario: L({
      words: ['to cast a spell|lançar um feitiço', 'the chosen one|o escolhido', 'prophecy|profecia', 'to sneak out|sair escondido', 'detention|detenção', 'potion|poção', 'cloak|capa', 'mate|parceiro (brit.)', 'brilliant|incrível (brit.)', 'to betray|trair', 'to defeat|derrotar', 'scar|cicatriz', 'misunderstood|incompreendido'],
      phrases: ['Harry used to live under the stairs.|Harry morava embaixo da escada.', 'They sneaked out at night under the invisibility cloak.|Eles saíram escondidos à noite com a capa de invisibilidade.', 'If I had a time-turner, I would take more classes.|Se eu tivesse um vira-tempo, faria mais aulas.', 'Snape is the most misunderstood character.|Snape é o personagem mais incompreendido.', 'That was brilliant, mate!|Isso foi incrível, parceiro!'],
      roleplay: 'Aula de Poções: Cláudia é a professora carrasca que tira pontos da sua casa por cada erro de inglês.',
      goal: 'Conte o que você faria com um poder mágico (condicional 2) e defenda um personagem.',
      targets: ['He got detention again.|Ele pegou detenção de novo.', 'She cast a powerful spell.|Ela lançou um feitiço poderoso.', 'If I were a wizard, I would fly to work.|Se eu fosse bruxo, iria voando pro trabalho.', 'He has a scar on his forehead.|Ele tem uma cicatriz na testa.', 'Cheers, mate!|Valeu, parceiro!'],
    }),
    avancado: L({
      words: ['morally grey|moralmente ambíguo', 'redemption arc|arco de redenção', 'to foreshadow|prenunciar', 'plot hole|furo de roteiro', 'the greater good|o bem maior', 'bloody|pra caramba (brit.)', 'gutted|arrasado (brit.)', 'chuffed|todo contente (brit.)', 'to have a go at someone|dar bronca em alguém (brit.)', 'allegiance|lealdade', 'to manipulate|manipular', 'to sacrifice|sacrificar', 'cunning|astuto'],
      phrases: ['Had Dumbledore been honest, Harry would have suffered less.|Se Dumbledore tivesse sido honesto, Harry teria sofrido menos.', 'Was Snape a hero or a villain? It\'s debatable.|Snape foi herói ou vilão? É discutível.', 'The time-turner creates a massive plot hole.|O vira-tempo cria um furo de roteiro enorme.', 'I was absolutely gutted when that character died.|Fiquei arrasado quando aquele personagem morreu.', 'Little did we know the clues were there from book one.|Mal sabíamos que as pistas estavam lá desde o livro um.'],
      roleplay: 'Debate: Cláudia diz que Dumbledore foi um manipulador e não um herói. Discuta.',
      goal: 'Debata usando condicional 3, inversão (Little did we know) e uma gíria britânica.',
      targets: ['Snape has the best redemption arc.|Snape tem o melhor arco de redenção.', 'It was all for the greater good.|Foi tudo pelo bem maior.', 'That\'s bloody brilliant!|Isso é incrível pra caramba!', 'I\'m chuffed to bits.|Estou todo contente.', 'The ending was foreshadowed early on.|O final foi prenunciado logo no começo.'],
    }),
  },

  /* ---------------------------------------------------- VIKINGS */
  {
    id: 'vikings', name: 'Vikings', emoji: '⚔️', group: 'pop',
    style: 'Use o universo de Vikings: Ragnar Lothbrok, Lagertha, Bjorn, Floki, Rollo, saques, navios, Kattegat, deuses nórdicos, Valhalla. Ensine vocabulário épico de poder, honra, lealdade e traição, sem descrever violência gráfica. Cláudia pode agir como uma jarl desconfiada.',
    basico: L({
      words: ['ship|navio', 'sea|mar', 'king|rei', 'queen|rainha', 'warrior|guerreiro', 'shield|escudo', 'axe|machado', 'village|vila', 'gold|ouro', 'brave|corajoso', 'strong|forte', 'god|deus', 'cold|frio'],
      phrases: ['Ragnar is a brave warrior.|Ragnar é um guerreiro corajoso.', 'They sail on big ships.|Eles navegam em navios grandes.', 'Lagertha is strong and smart.|Lagertha é forte e inteligente.', 'The village is very cold.|A vila é muito fria.', 'Where is the gold?|Onde está o ouro?'],
      roleplay: 'Você chega de barco numa vila viking. Cláudia é a chefe desconfiada e quer saber quem você é e o que traz.',
      goal: 'Diga de onde vem, o que traz e por que ela deve confiar em você.',
      targets: ['We sail to the west.|Navegamos para o oeste.', 'She is a strong queen.|Ela é uma rainha forte.', 'I am not afraid.|Não tenho medo.', 'This axe is very heavy.|Este machado é muito pesado.', 'The king has a lot of gold.|O rei tem muito ouro.'],
    }),
    intermediario: L({
      words: ['raid|saque / ataque', 'to conquer|conquistar', 'earl|conde (jarl)', 'honor|honra', 'to betray|trair', 'to settle|se estabelecer', 'shield-maiden|guerreira viking', 'ally|aliado', 'to seize power|tomar o poder', 'fate|destino', 'feast|banquete', 'to sail|navegar', 'revenge|vingança'],
      phrases: ['Rollo betrayed his own brother.|Rollo traiu o próprio irmão.', 'Ragnar wanted to settle new lands, not just raid them.|Ragnar queria se estabelecer em novas terras, não só saqueá-las.', 'If we win this battle, we will rule Kattegat.|Se vencermos essa batalha, governaremos Kattegat.', 'Lagertha has been a shield-maiden for years.|Lagertha é guerreira há anos.', 'Floki believed the gods controlled their fate.|Floki acreditava que os deuses controlavam o destino deles.'],
      roleplay: 'Conselho de guerra: Cláudia é a jarl e quer saber se vale a pena navegar até a Inglaterra. Convença ela do seu plano.',
      goal: 'Proponha um plano usando going to/will e uma condicional 1.',
      targets: ['We\'re going to sail at dawn.|Vamos navegar ao amanhecer.', 'He seized power from the earl.|Ele tomou o poder do conde.', 'They are our allies now.|Eles são nossos aliados agora.', 'She wants revenge.|Ela quer vingança.', 'Tonight we have a feast.|Hoje à noite temos um banquete.'],
    }),
    avancado: L({
      words: ['to forge an alliance|forjar uma aliança', 'to bend the knee|se render (curvar-se)', 'lust for power|sede de poder', 'to avenge|vingar', 'ruthless|implacável', 'legacy|legado', 'downfall|ruína / queda', 'hubris|arrogância desmedida', 'to be torn between|estar dividido entre', 'pagan|pagão', 'to cross the line|passar dos limites', 'bitter rivalry|rivalidade amarga', 'to stand your ground|manter a posição'],
      phrases: ['Never had Kattegat seen such a ruthless leader.|Kattegat nunca tinha visto um líder tão implacável.', 'Ragnar\'s hubris was ultimately his downfall.|A arrogância do Ragnar foi, no fim, a ruína dele.', 'Had Rollo stayed loyal, history would have been different.|Se Rollo tivesse sido leal, a história seria outra.', 'He was torn between his faith and his ambition.|Ele estava dividido entre a fé e a ambição.', 'I\'d rather stand my ground than bend the knee.|Prefiro manter minha posição a me curvar.'],
      roleplay: 'Debate: Cláudia acha que Ragnar foi um líder egoísta. Você defende o legado dele (ou ataca).',
      goal: 'Debata o legado de Ragnar com inversão e condicional 3.',
      targets: ['They forged an unlikely alliance.|Eles forjaram uma aliança improvável.', 'His legacy outlived him.|O legado dele sobreviveu a ele.', 'She crossed the line that day.|Ela passou dos limites naquele dia.', 'It was a bitter rivalry between brothers.|Era uma rivalidade amarga entre irmãos.', 'His lust for power destroyed him.|A sede de poder o destruiu.'],
    }),
  },

  /* ---------------------------------------------------- MARVEL */
  {
    id: 'marvel', name: 'Vingadores & Marvel', emoji: '🦸', group: 'pop',
    style: 'Use o universo Marvel: Vingadores (Homem de Ferro, Capitão América, Thor, Hulk, Viúva Negra, Thanos), os filmes e as séries (Loki, WandaVision, Demolidor, etc.). Discuta heróis, poderes, ordem para assistir, cenas pós-créditos e teorias. Cláudia pode agir como agente da S.H.I.E.L.D.',
    basico: L({
      words: ['hero|herói', 'villain|vilão', 'power|poder', 'strong|forte', 'to fly|voar', 'shield|escudo', 'hammer|martelo', 'armor|armadura', 'to save|salvar', 'to fight|lutar', 'team|equipe', 'world|mundo', 'fast|rápido'],
      phrases: ['Thor has a big hammer.|Thor tem um martelo grande.', 'Iron Man can fly.|O Homem de Ferro sabe voar.', 'Thanos is a strong villain.|Thanos é um vilão forte.', 'The Avengers save the world.|Os Vingadores salvam o mundo.', 'What is your favorite superpower?|Qual é seu superpoder favorito?'],
      roleplay: 'Cláudia é recrutadora da S.H.I.E.L.D. e entrevista você para entrar nos Vingadores.',
      goal: 'Diga qual poder você tem, o que você sabe fazer (can) e por que deve entrar no time.',
      targets: ['I can fly very fast.|Eu sei voar muito rápido.', 'Captain America has a shield.|O Capitão América tem um escudo.', 'He is my favorite hero.|Ele é meu herói favorito.', 'We fight as a team.|Lutamos em equipe.', 'The villain wants to destroy the world.|O vilão quer destruir o mundo.'],
    }),
    intermediario: L({
      words: ['superpower|superpoder', 'to team up|se juntar', 'post-credits scene|cena pós-créditos', 'multiverse|multiverso', 'timeline|linha do tempo', 'sacrifice|sacrifício', 'to snap|estalar (os dedos)', 'to binge|maratonar', 'origin story|história de origem', 'spin-off|derivado', 'sidekick|ajudante', 'to be worth it|valer a pena', 'watch order|ordem para assistir'],
      phrases: ['Did you stay for the post-credits scene?|Você ficou pra cena pós-créditos?', 'Thanos snapped his fingers and half of everyone disappeared.|Thanos estalou os dedos e metade de todo mundo sumiu.', 'If I could have one superpower, I would teleport.|Se eu pudesse ter um superpoder, eu me teletransportaria.', 'Loki has become one of my favorite characters.|Loki virou um dos meus personagens favoritos.', 'The multiverse is getting way too confusing.|O multiverso está ficando confuso demais.'],
      roleplay: 'Cláudia acha que os filmes depois de Ultimato ficaram fracos. Recomende um filme ou série Marvel e convença ela.',
      goal: 'Recomende um filme/série Marvel sem spoiler, com comparativo e present perfect.',
      targets: ['It\'s worth it, trust me.|Vale a pena, confia.', 'They teamed up to save the city.|Eles se juntaram pra salvar a cidade.', 'I\'ve watched every Marvel movie.|Já vi todos os filmes da Marvel.', 'Don\'t leave before the post-credits scene!|Não sai antes da cena pós-créditos!', 'His sacrifice was heartbreaking.|O sacrifício dele foi de partir o coração.'],
    }),
    avancado: L({
      words: ['superhero fatigue|cansaço de super-herói', 'to retcon|reescrever o passado da história', 'fan service|fan service', 'cameo|participação especial', 'stakes|o que está em jogo', 'CGI-heavy|cheio de efeitos', 'character-driven|focado em personagens', 'to pay off|compensar (narrativa)', 'to cash in on|lucrar em cima de', 'cinematic universe|universo cinematográfico', 'to raise the bar|elevar o nível', 'to overstay its welcome|durar mais do que devia', 'groundbreaking|revolucionário'],
      phrases: ['Not since Endgame have the stakes felt this real.|Desde Ultimato as apostas não pareciam tão reais.', 'The franchise is clearly suffering from superhero fatigue.|A franquia claramente sofre de cansaço de super-herói.', 'Had they slowed down, the multiverse saga would have paid off.|Se tivessem desacelerado, a saga do multiverso teria compensado.', 'The cameos are pure fan service, but I\'m not complaining.|As participações são puro fan service, mas não reclamo.', 'WandaVision raised the bar for Marvel series.|WandaVision elevou o nível das séries Marvel.'],
      roleplay: 'Podcast: Cláudia defende que a Marvel só faz filme pra vender brinquedo. Debata.',
      goal: 'Debata a qualidade da Marvel usando inversão (Not since...) e condicional 3.',
      targets: ['The story is surprisingly character-driven.|A história é surpreendentemente focada nos personagens.', 'That cameo broke the internet.|Aquela participação quebrou a internet.', 'They retconned the whole timeline.|Eles reescreveram a linha do tempo toda.', 'The franchise has overstayed its welcome.|A franquia já durou mais do que devia.', 'It was a groundbreaking crossover.|Foi um crossover revolucionário.'],
    }),
  },

  /* ---------------------------------------------------- THE OFFICE */
  {
    id: 'theoffice', name: 'The Office', emoji: '📎', group: 'pop',
    style: 'Use o universo de The Office (versão americana): Michael Scott, o chefe sem noção, Dwight, Jim e as pegadinhas, Pam, a empresa de papel em Scranton, reuniões constrangedoras, olhares para a câmera. Ensine inglês de escritório e humor constrangedor.',
    basico: L({
      words: ['paper|papel', 'boss|chefe', 'desk|mesa de trabalho', 'prank|pegadinha', 'coworker|colega de trabalho', 'meeting|reunião', 'funny|engraçado', 'weird|esquisito', 'to sell|vender', 'phone|telefone', 'lunch|almoço', 'party|festa', 'camera|câmera'],
      phrases: ['Michael is a funny boss.|Michael é um chefe engraçado.', 'Jim plays pranks on Dwight.|Jim faz pegadinhas com o Dwight.', 'They sell paper.|Eles vendem papel.', 'Dwight is very weird.|Dwight é muito esquisito.', 'Pam works at the front desk.|Pam trabalha na recepção.'],
      roleplay: 'Primeiro dia numa empresa de papel. Cláudia é a chefe sem noção que faz perguntas esquisitas.',
      goal: 'Apresente-se aos colegas e diga o que você faz no trabalho.',
      targets: ['My boss is very weird.|Meu chefe é muito esquisito.', 'We have a meeting at three.|Temos uma reunião às três.', 'I sell paper.|Eu vendo papel.', 'That prank was so funny.|Aquela pegadinha foi muito engraçada.', 'Who ate my lunch?|Quem comeu meu almoço?'],
    }),
    intermediario: L({
      words: ['awkward silence|silêncio constrangedor', 'to pull a prank|fazer uma pegadinha', 'sales rep|vendedor', 'regional manager|gerente regional', 'to get promoted|ser promovido', 'to suck up to|puxar o saco de', 'mockumentary|falso documentário', 'to stare at the camera|olhar pra câmera', 'team building|integração', 'to show off|se exibir', 'clueless|sem noção', 'to quit|pedir demissão', 'coworker crush|paixonite no trabalho'],
      phrases: ['Michael always makes meetings awkward.|Michael sempre deixa as reuniões constrangedoras.', 'Dwight sucks up to the boss.|Dwight puxa o saco do chefe.', 'Jim has pulled hundreds of pranks on Dwight.|Jim já fez centenas de pegadinhas com o Dwight.', 'If my boss acted like Michael, I would quit.|Se meu chefe agisse como o Michael, eu pediria demissão.', 'The awkward silences are the best part.|Os silêncios constrangedores são a melhor parte.'],
      roleplay: 'Reunião de integração constrangedora: Cláudia é a chefe e força você a contar uma história de trabalho.',
      goal: 'Conte uma história engraçada de trabalho no passado e use 2 expressões do tema.',
      targets: ['He\'s totally clueless.|Ele é totalmente sem noção.', 'Stop showing off!|Para de se exibir!', 'She got promoted last week.|Ela foi promovida semana passada.', 'That was an awkward silence.|Aquele foi um silêncio constrangedor.', 'He keeps staring at the camera.|Ele fica olhando pra câmera.'],
    }),
    avancado: L({
      words: ['second-hand embarrassment|vergonha alheia', 'oblivious|alheio / que não percebe nada', 'cringe comedy|comédia constrangedora', 'to break the fourth wall|quebrar a quarta parede', 'office politics|política de escritório', 'to throw shade|alfinetar', 'passive-aggressive|passivo-agressivo', 'to undermine|minar (alguém)', 'to overstep|passar dos limites', 'HR complaint|reclamação no RH', 'to keep a straight face|segurar o riso', 'slow-burn romance|romance lento', 'endearing|cativante'],
      phrases: ['Michael is so oblivious that it\'s almost endearing.|Michael é tão alheio que chega a ser cativante.', 'I could barely keep a straight face.|Eu mal consegui segurar o riso.', 'Were Michael my boss, I\'d file an HR complaint every week.|Se o Michael fosse meu chefe, eu reclamaria no RH toda semana.', 'Jim and Pam\'s slow-burn romance paid off beautifully.|O romance lento de Jim e Pam compensou lindamente.', 'Dwight\'s passive-aggressive notes are legendary.|Os bilhetes passivo-agressivos do Dwight são lendários.'],
      roleplay: 'Debate: Cláudia acha o Michael Scott o pior chefe da TV. Você defende ele (ou detona).',
      goal: 'Debata usando "Were I..." (inversão condicional) e 2 expressões do tema.',
      targets: ['The show is peak cringe comedy.|A série é o auge da comédia constrangedora.', 'Stop throwing shade at me.|Para de me alfinetar.', 'He totally overstepped.|Ele passou totalmente dos limites.', 'Office politics are exhausting.|Política de escritório cansa.', 'Every glance at the camera breaks the fourth wall.|Cada olhada pra câmera quebra a quarta parede.'],
    }),
  },

  /* ---------------------------------------------------- STRANGER THINGS */
  {
    id: 'strangerthings', name: 'Stranger Things', emoji: '🚲', group: 'pop',
    style: 'Use o universo de Stranger Things: Hawkins nos anos 80, Eleven e seus poderes, o Mundo Invertido, monstros, bicicletas, D&D, a amizade dos meninos, Steve, Dustin. Ensine gírias dos anos 80 e vocabulário de mistério e terror leve.',
    basico: L({
      words: ['bike|bicicleta', 'friend|amigo', 'monster|monstro', 'dark|escuro', 'lights|luzes', 'power|poder', 'game|jogo', 'town|cidade pequena', 'lost|perdido', 'scary|assustador', 'to run|correr', 'to find|encontrar', 'strange|estranho'],
      phrases: ['Will is lost.|Will está perdido.', 'Eleven has strange powers.|Eleven tem poderes estranhos.', 'The kids ride their bikes at night.|As crianças andam de bicicleta à noite.', 'There is a monster in the dark.|Tem um monstro no escuro.', 'Run! It\'s coming!|Corre! Está vindo!'],
      roleplay: 'Cláudia é sua amiga em Hawkins e jura que viu algo estranho na floresta. Vocês planejam o que fazer.',
      goal: 'Diga o que vocês vão fazer usando can e imperativo (Let\'s...).',
      targets: ['Let\'s find our friend.|Vamos encontrar nosso amigo.', 'The lights are blinking.|As luzes estão piscando.', 'I can hear something.|Consigo ouvir alguma coisa.', 'This town is very strange.|Essa cidade é muito estranha.', 'Don\'t go into the woods.|Não vai pra floresta.'],
    }),
    intermediario: L({
      words: ['the Upside Down|o Mundo Invertido', 'to vanish|desaparecer', 'creepy|sinistro', 'to investigate|investigar', 'to hide|esconder', 'flashlight|lanterna', 'rumor|boato', 'to sneak into|entrar escondido', 'telekinesis|telecinese', 'rad|irado (gíria anos 80)', 'totally|total (gíria anos 80)', 'gnarly|sinistro / radical (anos 80)', 'grounded|de castigo'],
      phrases: ['Will vanished into the Upside Down.|Will sumiu no Mundo Invertido.', 'We\'ve been looking for him all night.|Estamos procurando ele a noite toda.', 'If we go into the woods, we\'ll need flashlights.|Se formos pra floresta, vamos precisar de lanternas.', 'That\'s totally rad!|Isso é muito irado!', 'Mom grounded me for sneaking out.|Minha mãe me deixou de castigo por sair escondido.'],
      roleplay: 'Investigação: Cláudia é a policial cética de Hawkins. Convença ela de que algo sobrenatural está acontecendo.',
      goal: 'Conte o que aconteceu usando past simple e present perfect continuous.',
      targets: ['That house is so creepy.|Aquela casa é muito sinistra.', 'We sneaked into the lab.|Entramos escondidos no laboratório.', 'Where did he vanish?|Onde ele sumiu?', 'I\'m grounded for a week.|Estou de castigo por uma semana.', 'She moved it with her mind.|Ela moveu com a mente.'],
    }),
    avancado: L({
      words: ['nostalgia trip|viagem nostálgica', 'to hold up|se sustentar (qualidade)', 'homage|homenagem', 'to build tension|construir tensão', 'jump scare|susto (jump scare)', 'cliffhanger|gancho', 'coming-of-age|história de amadurecimento', 'to lose steam|perder o fôlego', 'eerie|arrepiante', 'to be on edge|ficar tenso', 'synth soundtrack|trilha de sintetizador', 'to pay homage to|homenagear', 'to outgrow|crescer além de'],
      phrases: ['The show pays homage to classic 80s horror.|A série homenageia o terror clássico dos anos 80.', 'The synth soundtrack makes everything feel eerie.|A trilha de sintetizador deixa tudo arrepiante.', 'Had the cast not grown up so fast, the timeline would make more sense.|Se o elenco não tivesse crescido tão rápido, a linha do tempo faria mais sentido.', 'Rarely does a show balance horror and humor so well.|Raramente uma série equilibra tão bem terror e humor.', 'At its core, it\'s a coming-of-age story.|No fundo, é uma história de amadurecimento.'],
      roleplay: 'Debate: Cláudia acha que a série perdeu o fôlego depois da primeira temporada.',
      goal: 'Debata a qualidade das temporadas com inversão (Rarely does...) e condicional 3.',
      targets: ['The first season still holds up.|A primeira temporada ainda se sustenta.', 'That jump scare got me.|Aquele susto me pegou.', 'The show lost steam halfway through.|A série perdeu o fôlego na metade.', 'I was on edge the whole episode.|Fiquei tenso o episódio inteiro.', 'It\'s a total nostalgia trip.|É uma viagem nostálgica total.'],
    }),
  },

  /* ---------------------------------------------------- GAME OF THRONES */
  {
    id: 'got', name: 'Game of Thrones', emoji: '🐉', group: 'pop',
    style: 'Use o universo de Game of Thrones: os Sete Reinos, o Trono de Ferro, Starks, Lannisters, Targaryens, Jon Snow, Daenerys e os dragões, Tyrion, intriga política. Ensine vocabulário de poder, política e registro formal/épico, sem violência gráfica. Cláudia pode agir como rainha desconfiada.',
    basico: L({
      words: ['king|rei', 'queen|rainha', 'dragon|dragão', 'throne|trono', 'family|família', 'winter|inverno', 'sword|espada', 'wall|muralha', 'brother|irmão', 'sister|irmã', 'fire|fogo', 'ice|gelo', 'war|guerra'],
      phrases: ['Daenerys has three dragons.|Daenerys tem três dragões.', 'Jon Snow lives in the North.|Jon Snow mora no Norte.', 'Everyone wants the Iron Throne.|Todo mundo quer o Trono de Ferro.', 'Winter is very cold in the North.|O inverno é muito frio no Norte.', 'Tyrion is very clever.|Tyrion é muito esperto.'],
      roleplay: 'Cláudia é uma rainha desconfiada e você chega à corte. Ela quer saber de que família você é.',
      goal: 'Apresente sua "casa": nome, onde vive e o símbolo da sua família.',
      targets: ['My family lives in the North.|Minha família mora no Norte.', 'The dragon is very big.|O dragão é muito grande.', 'She wants the throne.|Ela quer o trono.', 'I have a brother and a sister.|Tenho um irmão e uma irmã.', 'There is a big wall of ice.|Tem uma muralha grande de gelo.'],
    }),
    intermediario: L({
      words: ['heir|herdeiro', 'to claim|reivindicar', 'alliance|aliança', 'loyal|leal', 'kingdom|reino', 'to rule|governar', 'scheme|trama / esquema', 'ruthless|implacável', 'oath|juramento', 'to plot|tramar', 'to marry into|casar com (família)', 'to trust|confiar', 'betrayal|traição'],
      phrases: ['Cersei will do anything to protect her family.|Cersei faz qualquer coisa pra proteger a família.', 'Tyrion is the smartest person in the kingdom.|Tyrion é a pessoa mais esperta do reino.', 'If you break your oath, nobody will trust you.|Se você quebrar o juramento, ninguém vai confiar em você.', 'Littlefinger was always plotting something.|Mindinho estava sempre tramando algo.', 'Who should have ruled the Seven Kingdoms?|Quem deveria ter governado os Sete Reinos?'],
      roleplay: 'Conselho real: Cláudia é a rainha e pergunta em quem ela deve confiar. Dê conselhos e defenda uma aliança.',
      goal: 'Dê conselhos com should/must e uma condicional 1.',
      targets: ['You should never trust him.|Você nunca deveria confiar nele.', 'He is the true heir.|Ele é o verdadeiro herdeiro.', 'They broke their oath.|Eles quebraram o juramento.', 'She rules with fire.|Ela governa com fogo.', 'It was the worst betrayal.|Foi a pior traição.'],
    }),
    avancado: L({
      words: ['political intrigue|intriga política', 'to usurp|usurpar', 'power vacuum|vácuo de poder', 'to be a pawn|ser um peão', 'to backstab|apunhalar pelas costas', 'rushed ending|final apressado', 'to subvert expectations|subverter expectativas', 'cunning|astuto', 'a claim to the throne|direito ao trono', 'mercy|misericórdia', 'to hold court|presidir a corte', 'character assassination|destruição de personagem (roteiro)', 'to play the long game|jogar a longo prazo'],
      phrases: ['Seldom has a finale been so divisive.|Raramente um final dividiu tanto as pessoas.', 'Had the writers taken their time, the ending would have landed.|Se os roteiristas tivessem ido com calma, o final teria funcionado.', 'Everyone was a pawn in Littlefinger\'s game.|Todo mundo era peão no jogo do Mindinho.', 'Subverting expectations isn\'t the same as good writing.|Subverter expectativas não é o mesmo que bom roteiro.', 'Tyrion always played the long game.|Tyrion sempre jogou a longo prazo.'],
      roleplay: 'Debate: Cláudia jura que o final da série foi o pior da história da TV. Discuta com argumentos.',
      goal: 'Debata o final com inversão (Seldom has...) e condicional 3.',
      targets: ['The ending felt rushed.|O final pareceu apressado.', 'He usurped the throne.|Ele usurpou o trono.', 'She was just a pawn.|Ela era só um peão.', 'It was pure political intrigue.|Era pura intriga política.', 'They backstabbed their own allies.|Eles apunhalaram os próprios aliados.'],
    }),
  },

  /* ---------------------------------------------------- HIP-HOP */
  {
    id: 'hiphop', name: 'Hip-hop: gírias', emoji: '🎧', group: 'musica',
    style: 'Ensine gírias do hip-hop americano (old school e atual) e a cultura do rap: MCs, beats, batalhas, freestyle, álbuns clássicos, artistas famosos (fale deles, opine, compare). NUNCA reproduza letras: explique as gírias com exemplos seus. Nunca use insultos raciais ou homofóbicos, mesmo que apareçam em músicas; se o aluno perguntar, explique por que a palavra é ofensiva.',
    basico: L({
      words: ['beat|batida', 'rapper|rapper', 'rhyme|rima', 'crew|galera / grupo', 'homie|parceiro', 'dope|irado', 'chill|de boa', 'fresh|estiloso', 'flow|jeito de rimar', 'mic|microfone', 'sneakers|tênis', 'track|faixa', 'fire|muito bom'],
      phrases: ['This beat is dope.|Essa batida é irada.', 'He is my homie.|Ele é meu parceiro.', 'I like his flow.|Curto o flow dele.', 'Let\'s chill tonight.|Vamos ficar de boa hoje à noite.', 'Those sneakers are fresh!|Esses tênis estão estilosos!'],
      roleplay: 'Cláudia é uma DJ de hip-hop e pergunta que rappers você curte e por quê.',
      goal: 'Diga 2 rappers ou músicas que você curte e use 2 gírias do tema.',
      targets: ['This track is fire.|Essa faixa é muito boa.', 'What\'s up, homie?|E aí, parceiro?', 'His rhymes are dope.|As rimas dele são iradas.', 'We just chill and listen to music.|A gente só fica de boa ouvindo música.', 'Turn up the beat!|Aumenta a batida!'],
    }),
    intermediario: L({
      words: ['bars|versos bons', 'freestyle|improviso', 'beef|treta', 'diss track|música de ataque', 'to drop an album|lançar um álbum', 'OG|veterano / original', 'hustle|corre / batalha diária', 'to flex|ostentar', 'real one|pessoa leal', 'to go hard|mandar muito', 'G.O.A.T.|o maior de todos', 'underground|underground', 'feature|participação'],
      phrases: ['He dropped a new album last night.|Ele lançou um álbum novo ontem à noite.', 'Those two rappers have had beef for years.|Esses dois rappers têm treta há anos.', 'His last verse had crazy bars.|O último verso dele teve rimas absurdas.', 'Stop flexing, man!|Para de ostentar, cara!', 'Who\'s the G.O.A.T. of hip-hop for you?|Quem é o maior do hip-hop pra você?'],
      roleplay: 'Batalha de opinião: Cláudia diz quem é o maior rapper de todos os tempos. Você discorda e defende o seu.',
      goal: 'Defenda seu G.O.A.T. com comparativos/superlativos e 3 gírias.',
      targets: ['That freestyle went hard.|Esse improviso mandou muito.', 'He\'s an OG in the game.|Ele é veterano no jogo.', 'This diss track is brutal.|Essa música de ataque é brutal.', 'You\'re a real one.|Você é parceiro de verdade.', 'Respect the hustle.|Respeita o corre.'],
    }),
    avancado: L({
      words: ['to spit bars|mandar rimas pesadas', 'wordplay|jogo de palavras', 'double entendre|duplo sentido', 'mixtape|mixtape', 'to sell out|se vender', 'ghostwriter|escritor fantasma', 'street cred|credibilidade de rua', 'to come up|subir na vida', 'to murder a track|destruir numa faixa', 'conscious rap|rap consciente', 'braggadocio|ostentação lírica', 'to pay your dues|ralar antes de ser reconhecido', 'to be slept on|ser subestimado'],
      phrases: ['His wordplay is on another level.|O jogo de palavras dele está em outro nível.', 'Had he written his own verses, he\'d have more respect.|Se ele tivesse escrito os próprios versos, teria mais respeito.', 'Conscious rap tells stories most media ignore.|O rap consciente conta histórias que a mídia ignora.', 'She murdered that feature.|Ela destruiu naquela participação.', 'You have to pay your dues before you get street cred.|Você tem que ralar antes de ter credibilidade de rua.'],
      roleplay: 'Debate: Cláudia diz que o rap de hoje é só ostentação e que o antigo era consciente.',
      goal: 'Debata com nuance usando inversão ou condicional 3 e 3 termos do tema.',
      targets: ['That line is a clever double entendre.|Esse verso é um duplo sentido esperto.', 'He came up from nothing.|Ele subiu do nada.', 'That artist is so slept on.|Esse artista é muito subestimado.', 'She spits bars like a veteran.|Ela manda rimas como veterana.', 'They sold out for radio hits.|Eles se venderam por sucesso de rádio.'],
    }),
  },

  /* ---------------------------------------------------- RAP & TRAP */
  {
    id: 'rapgirias', name: 'Rap, trap & gírias atuais', emoji: '🔥', group: 'musica',
    style: 'Ensine gírias atuais do rap, do trap e da internet americana (no cap, drip, bussin, lowkey, rizz...). Explique significado, tom e QUANDO NÃO USAR (ex.: entrevista de emprego). Zoe o aluno quando usar gíria no contexto errado. Nunca reproduza letras e nunca use insultos raciais ou homofóbicos.',
    basico: L({
      words: ['lit|animado / da hora', 'vibe|clima / energia', 'drip|estilo (roupa)', 'bro|mano', 'squad|galera', 'sus|suspeito', 'to slay|arrasar', 'mood|me identifico', 'lowkey|meio que / na moral', 'highkey|muito / abertamente', 'cringe|vergonhoso', 'bet|fechou / combinado', 'fire|muito bom'],
      phrases: ['This party is lit!|Essa festa está da hora!', 'Your drip is crazy, bro.|Seu estilo está absurdo, mano.', 'That guy is kinda sus.|Esse cara é meio suspeito.', 'Bet, see you at nine.|Fechou, te vejo às nove.', 'Lowkey, I love this song.|Na moral, eu amo essa música.'],
      roleplay: 'Vocês estão numa festa. Cláudia é a amiga que só fala gíria e você precisa acompanhar.',
      goal: 'Responda usando pelo menos 3 gírias do tema corretamente.',
      targets: ['The vibe here is amazing.|A vibe aqui está incrível.', 'You slayed tonight!|Você arrasou hoje!', 'That\'s so cringe.|Isso é muito vergonhoso.', 'My squad is here.|Minha galera está aqui.', 'Bet, let\'s go.|Fechou, bora.'],
    }),
    intermediario: L({
      words: ['no cap|sem mentira', 'cap|mentira', 'bussin|muito bom (comida)', 'salty|ressentido / bolado', 'to ghost|sumir sem responder', 'rent-free|não sai da cabeça', 'it hits different|bate diferente', 'valid|válido / justo', 'extra|exagerado', 'main character energy|energia de protagonista', 'W / L|vitória / derrota', 'to stan|ser fã fervoroso', 'glow up|transformação pra melhor'],
      phrases: ['No cap, this burger is bussin.|Sem mentira, esse hambúrguer está muito bom.', 'Why are you so salty?|Por que você está tão bolado?', 'That song lives rent-free in my head.|Essa música não sai da minha cabeça.', 'Music hits different at night.|Música bate diferente à noite.', 'That\'s a huge W for us.|Essa é uma vitória enorme pra gente.'],
      roleplay: 'Cláudia testa seu "inglês de rede social": ela manda situações e você reage com gíria.',
      goal: 'Use no cap, rent-free e it hits different numa conversa natural.',
      targets: ['Stop the cap!|Para de mentir!', 'She ghosted me.|Ela sumiu sem responder.', 'He\'s being so extra.|Ele está exagerado demais.', 'Look at that glow up!|Olha essa transformação!', 'That take is valid.|Essa opinião é válida.'],
    }),
    avancado: L({
      words: ['cooked|ferrado', 'delulu|iludido', 'rizz|charme / lábia', 'the ick|a broxada / o ranço', 'to touch grass|sair da internet', 'to understand the assignment|mandar exatamente bem', 'mid|meia-boca', 'to gatekeep|guardar só pra si', 'aura|moral / presença', 'chronically online|viciado em internet', 'it\'s giving...|tá com cara de...', 'to fumble|vacilar / perder a chance', 'ratio|resposta com mais likes que o post'],
      phrases: ['Honestly, that album was mid.|Sinceramente, esse álbum foi meia-boca.', 'He fumbled a great opportunity.|Ele vacilou e perdeu uma ótima oportunidade.', 'You need to touch grass.|Você precisa sair da internet.', 'She understood the assignment.|Ela mandou exatamente bem.', 'Had I known slang aged this fast, I wouldn\'t have memorized so much.|Se eu soubesse que gíria envelhece tão rápido, não teria decorado tanto.'],
      roleplay: 'Debate: Cláudia acha que gíria de internet está matando o inglês "de verdade". Você discute, e ela zoa quem usa gíria errado.',
      goal: 'Debata usando 3 gírias no contexto certo e explique quando NÃO usar gíria.',
      targets: ['We\'re so cooked.|A gente está muito ferrado.', 'That\'s pure delulu.|Isso é pura ilusão.', 'His rizz is unmatched.|A lábia dele é imbatível.', 'Don\'t gatekeep that song!|Não esconde essa música só pra você!', 'It\'s giving main character.|Tá com cara de protagonista.'],
    }),
  },
];
