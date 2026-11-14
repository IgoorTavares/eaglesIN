/* ==========================================================
   curriculum.js — currículo fixo do app, alinhado ao CEFR (QECR).
   6 níveis × 6 unidades × 6 aulas = 216 aulas
   + 2 conversas guiadas por unidade (72) + 1 prova por unidade (36)
   + 1 prova final por nível (6).

   A IA personaliza exemplos e exercícios, mas SEMPRE a partir
   destes objetivos, para não pular conteúdo fundamental.
   Formato do vocabulário: "inglês=português; ..."
   ========================================================== */

const L = (title, pt, vocab) => ({ title, pt, vocab });
const C = (title, role, goal) => ({ title, role, goal });
const U = (title, topics, lessons, convos) => ({ title, topics, lessons, convos });
const PRACTICE = L('Practice', 'Revisão integrada da unidade: vocabulário, fala, escuta e escrita', '');

export const CEFR = [
  {
    id: 'A1', name: 'Iniciante', tagline: 'Primeiras palavras e frases', months: 3, target: 'Sobrevivência básica', legacy: 'basico',
    aim: 'Aprender a se apresentar, reconhecer palavras e construir frases simples.',
    behavior: 'Frases MUITO curtas (máx. 8 palavras), vocabulário básico, fala devagar. Explique em português sempre que preciso e ofereça tradução. Corrija só UM erro por vez.',
    final: 'Apresentação pessoal, perguntas sobre a rotina e compreensão de instruções simples.',
    units: [
      U('Primeiros contatos', 'Alfabeto, sons do inglês, cumprimentos, apresentações, nomes e despedidas', [
        L('Hello!', 'Cumprimentos e despedidas', 'hello=olá; hi=oi; good morning=bom dia; good afternoon=boa tarde; good night=boa noite; goodbye=tchau; see you later=até logo; how are you?=como vai?'),
        L('My name is...', 'Apresentação pessoal e construção de frases', "my name is=meu nome é; I am=eu sou; nice to meet you=prazer em conhecer; what's your name?=qual é o seu nome?; this is=este é; friend=amigo"),
        L('Alphabet', 'Letras, soletração e reconhecimento auditivo', 'letter=letra; spell=soletrar; how do you spell it?=como se soletra?; capital letter=letra maiúscula; vowel=vogal; double=dobrado'),
        L('Numbers', 'Números, idade e números de telefone', "one=um; ten=dez; twenty=vinte; how old are you?=quantos anos você tem?; phone number=número de telefone; I'm 25 years old=tenho 25 anos"),
        L('Where are you from?', 'Países, nacionalidades e perguntas', "where are you from?=de onde você é?; I'm from Brazil=sou do Brasil; Brazilian=brasileiro; country=país; city=cidade; American=americano"),
        PRACTICE,
      ], [
        C('Conhecer uma pessoa', 'Você é um intercambista simpático que acabou de chegar e encontra o aluno num café.', 'Cumprimentar, dizer o nome, de onde é e se despedir.'),
        C('Primeiro dia no curso', 'Você é o recepcionista de uma escola de inglês fazendo o cadastro do aluno.', 'Soletrar o nome, dizer idade e telefone.'),
      ]),
      U('Eu e minha família', 'Pronomes, verbo to be, idade, nacionalidade, família e profissões', [
        L('I, you, he, she', 'Pronomes pessoais', 'I=eu; you=você; he=ele; she=ela; we=nós; they=eles; it=isso'),
        L('To be', 'Verbo to be: afirmativa, negativa e pergunta', "am=sou/estou; is=é/está; are=são/estão; isn't=não é; aren't=não são; are you...?=você é...?"),
        L('My family', 'Membros da família e possessivos', 'mother=mãe; father=pai; brother=irmão; sister=irmã; son=filho; daughter=filha; my/your/his/her=meu/seu/dele/dela'),
        L('Jobs', 'Profissões e o que as pessoas fazem', "teacher=professor; doctor=médico; engineer=engenheiro; student=estudante; nurse=enfermeiro; what do you do?=o que você faz?"),
        L('Describing people', 'Descrever pessoas: idade, aparência e personalidade', 'tall=alto; short=baixo; young=jovem; old=velho; friendly=simpático; funny=engraçado; married=casado'),
        PRACTICE,
      ], [
        C('Mostrando fotos da família', 'Você é um colega curioso olhando fotos da família do aluno no celular.', 'Apresentar 3 familiares com nome, idade e profissão.'),
        C('Nova colega de trabalho', 'Você é um novo colega de trabalho estrangeiro no primeiro dia.', 'Perguntar e responder sobre profissão, nacionalidade e família.'),
      ]),
      U('Objetos e lugares', 'Artigos, singular e plural, cores, números, objetos e preposições básicas', [
        L('A, an, the', 'Artigos definidos e indefinidos', 'a book=um livro; an apple=uma maçã; the door=a porta; an umbrella=um guarda-chuva; a car=um carro; the window=a janela'),
        L('One, two, many', 'Singular, plural e plurais irregulares', 'chair/chairs=cadeira/cadeiras; box/boxes=caixa/caixas; child/children=criança/crianças; person/people=pessoa/pessoas; man/men=homem/homens; foot/feet=pé/pés'),
        L('Colors', 'Cores e adjetivos antes do substantivo', 'red=vermelho; blue=azul; green=verde; yellow=amarelo; black=preto; white=branco; a red car=um carro vermelho'),
        L('This and that', 'Demonstrativos e objetos do dia a dia', 'this=este; that=aquele; these=estes; those=aqueles; phone=celular; key=chave; bag=bolsa'),
        L('In, on, under', 'Preposições de lugar', "in=dentro; on=em cima; under=embaixo; next to=ao lado; behind=atrás; between=entre; where's my...?=cadê meu...?"),
        PRACTICE,
      ], [
        C('Achados e perdidos', 'Você é o atendente do achados e perdidos de um aeroporto.', 'Descrever um objeto perdido: cor, tamanho e onde estava.'),
        C('Arrumando o quarto', 'Você é um colega de apartamento procurando suas coisas.', 'Dizer onde estão 4 objetos usando preposições.'),
      ]),
      U('Minha rotina', 'Simple present, horários, dias da semana, hábitos e frequência', [
        L('Every day', 'Simple present: afirmativa', 'wake up=acordar; get up=levantar; have breakfast=tomar café; go to work=ir trabalhar; take a shower=tomar banho; go to bed=ir dormir'),
        L("Do you...? / I don't", 'Simple present: perguntas e negativas com do/does', "do you...?=você...?; does she...?=ela...?; I don't=eu não; she doesn't=ela não; yes, I do=sim; no, he doesn't=não"),
        L("What time is it?", 'Horas e horários', "what time is it?=que horas são?; o'clock=em ponto; half past=e meia; quarter to=quinze para; at 7 a.m.=às 7 da manhã; noon=meio-dia"),
        L('Days of the week', 'Dias da semana e partes do dia', 'Monday=segunda; Friday=sexta; weekend=fim de semana; in the morning=de manhã; at night=à noite; on Sundays=aos domingos'),
        L('Always, never', 'Advérbios de frequência', 'always=sempre; usually=geralmente; often=frequentemente; sometimes=às vezes; rarely=raramente; never=nunca'),
        PRACTICE,
      ], [
        C('Minha semana', 'Você é um amigo novo querendo marcar algo e precisa saber a rotina do aluno.', 'Descrever a rotina e combinar um dia e horário.'),
        C('Entrevista de hábitos', 'Você é um pesquisador fazendo uma enquete sobre hábitos diários.', 'Responder 5 perguntas usando advérbios de frequência.'),
      ]),
      U('Comida e compras', 'Alimentos, preços, pedidos, gostos e preferências', [
        L('Food and drinks', 'Alimentos e bebidas', 'bread=pão; rice=arroz; beans=feijão; chicken=frango; water=água; coffee=café; juice=suco'),
        L('I like / I love', 'Gostos e preferências', "I like=eu gosto; I love=eu amo; I don't like=não gosto; I hate=odeio; my favorite=meu favorito; delicious=delicioso"),
        L('How much is it?', 'Preços e dinheiro', "how much is it?=quanto custa?; dollars=dólares; cheap=barato; expensive=caro; cash=dinheiro; credit card=cartão de crédito"),
        L("Can I have...?", 'Fazer pedidos', "can I have...?=posso pegar...?; I'd like=eu gostaria; menu=cardápio; the check, please=a conta, por favor; for here or to go?=pra comer aqui ou levar?; anything else?=mais alguma coisa?"),
        L('Some and any', 'Contáveis, incontáveis, some e any', 'some=algum; any=nenhum/algum; a lot of=muito; a little=um pouco; a few=alguns; how many?=quantos?'),
        PRACTICE,
      ], [
        C('Pedido na lanchonete', 'Você é um atendente de lanchonete americano, apressado.', 'Pedir comida e bebida, perguntar o preço e pagar.'),
        C('Feira e mercado', 'Você é um vendedor de feira que gosta de conversar.', 'Comprar 3 itens, perguntar preço e dizer do que gosta.'),
      ]),
      U('Minha cidade', 'Direções, lugares, there is/are, can/can\'t e descrições', [
        L('Places in town', 'Lugares da cidade', 'bank=banco; hospital=hospital; supermarket=supermercado; pharmacy=farmácia; bus stop=ponto de ônibus; park=parque'),
        L('There is / There are', 'There is e there are', "there is=há (um); there are=há (vários); is there...?=tem...?; there isn't=não tem; near=perto; far=longe"),
        L('Directions', 'Pedir e dar direções', 'turn left=vire à esquerda; turn right=vire à direita; go straight=siga reto; corner=esquina; block=quarteirão; across from=em frente a'),
        L("Can / Can't", 'Habilidade e permissão com can', "can=consegue/pode; can't=não consegue; can you help me?=pode me ajudar?; swim=nadar; drive=dirigir; cook=cozinhar"),
        L('My neighborhood', 'Descrever o bairro com adjetivos', 'quiet=tranquilo; noisy=barulhento; safe=seguro; dangerous=perigoso; beautiful=bonito; crowded=lotado'),
        PRACTICE,
      ], [
        C('Turista perdido', 'Você é um turista perdido pedindo ajuda ao aluno na rua.', 'Dar direções até a farmácia mais próxima.'),
        C('Onde fica?', 'Você é um morador local e o aluno é o turista.', 'Perguntar onde ficam 2 lugares e entender as direções.'),
      ]),
    ],
  },
  {
    id: 'A2', name: 'Básico', tagline: 'Comunicação no cotidiano', months: 4, target: 'Rotina e situações comuns', legacy: 'basico',
    aim: 'Resolver situações cotidianas e descrever experiências pessoais.',
    behavior: 'Frases curtas (máx. 12 palavras). Pouco português (tradução só quando ele travar). Corrija o erro mais importante e peça para repetir certo.',
    final: 'Relatar uma viagem, fazer planos, comparar opções e resolver situações cotidianas.',
    units: [
      U('Vida diária', 'Present continuous, rotina, tarefas e atividades atuais', [
        L("I'm working", 'Present continuous: forma e uso', "I'm working=estou trabalhando; she's cooking=ela está cozinhando; right now=agora mesmo; at the moment=no momento; what are you doing?=o que você está fazendo?; listening=ouvindo"),
        L('Simple vs continuous', 'Present simple x present continuous', 'usually=geralmente; today=hoje; these days=esses dias; every day=todo dia; currently=atualmente; this week=esta semana'),
        L('Housework', 'Tarefas domésticas', 'do the dishes=lavar a louça; do the laundry=lavar roupa; clean=limpar; vacuum=aspirar; make the bed=arrumar a cama; take out the trash=tirar o lixo'),
        L('On the phone', 'Ligações e mensagens', "call=ligar; text=mandar mensagem; hold on=espera aí; I'll call you back=te ligo de volta; can you hear me?=está me ouvindo?; voicemail=caixa postal"),
        L('Free time', 'Hobbies e tempo livre', 'hobby=hobby; play video games=jogar videogame; watch series=ver séries; go out=sair; hang out=ficar de boa; work out=malhar'),
        PRACTICE,
      ], [
        C('Ligação de um amigo', 'Você é um amigo ligando para saber o que o aluno está fazendo agora.', 'Descrever o que está fazendo e combinar de se falar depois.'),
        C('Divisão de tarefas', 'Você é um colega de república irritado com a bagunça.', 'Negociar quem faz quais tarefas de casa.'),
      ]),
      U('Passado pessoal', 'Simple past, verbos regulares e irregulares, histórias curtas', [
        L('Yesterday', 'Simple past de verbos regulares', 'worked=trabalhou; played=jogou; watched=assistiu; studied=estudou; yesterday=ontem; last night=ontem à noite'),
        L('Irregular verbs', 'Simple past de verbos irregulares', 'went=foi; had=teve; saw=viu; ate=comeu; bought=comprou; took=pegou'),
        L('Did you...?', 'Perguntas e negativas no passado', "did you...?=você...?; I didn't=eu não; when did...?=quando...?; ago=atrás; last week=semana passada; in 2020=em 2020"),
        L('Was / Were', 'Passado do verbo to be', "was=era/estava; were=eram/estavam; wasn't=não era; it was great=foi ótimo; we were tired=estávamos cansados; born=nascido"),
        L('A short story', 'Contar uma história curta com sequência', 'first=primeiro; then=então; after that=depois disso; finally=finalmente; suddenly=de repente; in the end=no fim'),
        PRACTICE,
      ], [
        C('Como foi o fim de semana?', 'Você é um colega de trabalho na segunda-feira de manhã.', 'Contar 3 coisas que fez no fim de semana.'),
        C('A pior viagem', 'Você é um amigo que adora histórias de desastre.', 'Contar uma história curta no passado com começo, meio e fim.'),
      ]),
      U('Planos e futuro', 'Going to, will, convites, intenções e previsões', [
        L('Going to', 'Planos com going to', "I'm going to=vou; tomorrow=amanhã; next month=mês que vem; plan=plano; travel=viajar; this weekend=este fim de semana"),
        L('Will', 'Decisões na hora e previsões com will', "I'll=eu vou; I think it will rain=acho que vai chover; probably=provavelmente; I promise=prometo; maybe=talvez; won't=não vai"),
        L('Invitations', 'Convidar, aceitar e recusar', "would you like to...?=quer...?; let's=vamos; I'd love to=adoraria; sorry, I can't=desculpa, não posso; how about...?=que tal...?; sounds good=parece bom"),
        L('Arrangements', 'Present continuous para compromissos marcados', "I'm meeting=vou encontrar; appointment=compromisso; schedule=agenda; free=livre; busy=ocupado; are you free on...?=está livre na...?"),
        L('Dreams and goals', 'Intenções e metas', 'want to=querer; hope to=esperar; dream=sonho; goal=meta; someday=algum dia; one day=um dia'),
        PRACTICE,
      ], [
        C('Planejando o sábado', 'Você é um amigo animado querendo sair no sábado.', 'Fazer um convite, negociar horário e local e confirmar.'),
        C('Metas do ano', 'Você é um coach de vida exageradamente motivado.', 'Contar 3 metas para o próximo ano usando going to e will.'),
      ]),
      U('Viagens', 'Aeroporto, hotel, transporte, reservas e informações turísticas', [
        L('At the airport', 'Aeroporto e check-in', 'boarding pass=cartão de embarque; gate=portão; flight=voo; luggage=bagagem; passport=passaporte; delayed=atrasado'),
        L('At the hotel', 'Check-in e problemas no hotel', "reservation=reserva; check in=fazer check-in; room key=chave do quarto; single room=quarto de solteiro; the AC isn't working=o ar não funciona; breakfast included=café incluso"),
        L('Getting around', 'Transporte e passagens', 'ticket=passagem; subway=metrô; taxi=táxi; round trip=ida e volta; one way=só ida; how long does it take?=quanto tempo leva?'),
        L('Booking', 'Fazer reservas', "book=reservar; available=disponível; for two people=para duas pessoas; how many nights?=quantas noites?; confirm=confirmar; cancel=cancelar"),
        L('Sightseeing', 'Informações turísticas', 'tour=passeio; museum=museu; entrance fee=entrada; open=aberto; closed=fechado; must-see=imperdível'),
        PRACTICE,
      ], [
        C('Check-in no hotel', 'Você é um recepcionista de hotel em Nova York.', 'Fazer check-in, perguntar do café e reclamar de um problema no quarto.'),
        C('Passeio turístico', 'Você é um guia turístico falante em Londres.', 'Perguntar horários, preços e o que vale a pena visitar.'),
      ]),
      U('Saúde e bem-estar', 'Corpo humano, sintomas, conselhos com should e consultas', [
        L('The body', 'Partes do corpo', 'head=cabeça; back=costas; stomach=estômago; throat=garganta; arm=braço; leg=perna'),
        L("I don't feel well", 'Sintomas e doenças', "headache=dor de cabeça; fever=febre; cold=resfriado; cough=tosse; sore throat=dor de garganta; I feel sick=estou passando mal"),
        L('You should', 'Conselhos com should', "you should=você deveria; you shouldn't=não deveria; rest=descansar; drink water=beber água; see a doctor=ir ao médico; take medicine=tomar remédio"),
        L("At the doctor's", 'Consulta médica', "appointment=consulta; prescription=receita; how long have you had...?=há quanto tempo tem...?; allergic=alérgico; pain=dor; it hurts here=dói aqui"),
        L('Healthy habits', 'Hábitos saudáveis', 'exercise=se exercitar; sleep=dormir; healthy=saudável; junk food=porcaria; stress=estresse; balanced diet=dieta equilibrada'),
        PRACTICE,
      ], [
        C('Consulta médica', 'Você é um médico americano calmo e meticuloso.', 'Explicar 3 sintomas, há quanto tempo e entender o conselho.'),
        C('Amigo doente', 'Você é um amigo que está gripado e reclamando.', 'Dar 3 conselhos usando should.'),
      ]),
      U('Comparações', 'Comparativos, superlativos, quantificadores e preferências', [
        L('Bigger, better', 'Comparativos', "bigger than=maior que; more expensive than=mais caro que; better=melhor; worse=pior; cheaper=mais barato; as...as=tão...quanto"),
        L('The best', 'Superlativos', 'the biggest=o maior; the most beautiful=o mais bonito; the best=o melhor; the worst=o pior; ever=de todos os tempos; in the world=do mundo'),
        L('Too and enough', 'Too e enough', 'too expensive=caro demais; not big enough=não é grande o bastante; enough time=tempo suficiente; too much=demais; too many=muitos demais; a bit=um pouco'),
        L('Much, many, a lot', 'Quantificadores', 'much=muito (incontável); many=muitos; a lot of=muito; few=poucos; little=pouco; plenty of=de sobra'),
        L('I prefer', 'Preferências', "I prefer=prefiro; I'd rather=preferiria; than=do que; instead of=em vez de; it depends=depende; either=qualquer um"),
        PRACTICE,
      ], [
        C('Escolhendo um celular', 'Você é um vendedor de loja de eletrônicos insistente.', 'Comparar dois celulares e escolher um justificando.'),
        C('Melhor cidade', 'Você é um amigo que acha que a cidade dele é a melhor do mundo.', 'Comparar duas cidades usando comparativos e superlativos.'),
      ]),
    ],
  },
  {
    id: 'B1', name: 'Intermediário', tagline: 'Conversas independentes', months: 6, target: 'Independência', legacy: 'intermediario',
    aim: 'Sustentar conversas, explicar opiniões e lidar com imprevistos.',
    behavior: 'Frases naturais de tamanho médio. Português só na bronca. Peça detalhes e justificativas ("why?", "for example?"). Corrija os erros principais.',
    final: 'Produzir uma narrativa, interpretar uma notícia e defender uma opinião.',
    units: [
      U('Experiências', 'Present perfect, ever/never, already/yet, experiências de vida', [
        L('Have you ever...?', 'Present perfect para experiências', "have you ever...?=você já...?; I've never=nunca; been to=já foi a; tried=experimentou; once=uma vez; twice=duas vezes"),
        L('Already, yet, just', 'Already, yet e just', "already=já; yet=ainda (pergunta/negativa); just=acabou de; I haven't finished yet=ainda não terminei; have you done it yet?=já fez?; recently=recentemente"),
        L('For and since', 'Duração com for e since', "for two years=há dois anos; since 2019=desde 2019; how long have you...?=há quanto tempo você...?; all my life=a vida toda; lately=ultimamente; so far=até agora"),
        L('Past simple vs perfect', 'Passado simples x present perfect', 'last year=ano passado; in my life=na minha vida; when I was=quando eu era; ever=alguma vez; at that time=naquela época; up to now=até agora'),
        L('Life experiences', 'Contar experiências marcantes', "unforgettable=inesquecível; scary=assustador; amazing=incrível; achievement=conquista; it changed my life=mudou minha vida; bucket list=lista de desejos"),
        PRACTICE,
      ], [
        C('Já fez isso?', 'Você é um aventureiro exibido que já fez de tudo.', 'Trocar 4 experiências usando have you ever e detalhes no passado.'),
        C('Lista de desejos', 'Você é um amigo planejando a bucket list.', 'Dizer o que já fez, o que ainda não fez e o que quer fazer.'),
      ]),
      U('Narrativas', 'Past continuous, sequências de acontecimentos e storytelling', [
        L('I was walking...', 'Past continuous', "I was walking=eu estava andando; while=enquanto; when=quando; it was raining=estava chovendo; at 8 p.m. yesterday=ontem às 8; they were talking=eles estavam conversando"),
        L('When and while', 'Ação interrompida: when e while', 'when the phone rang=quando o telefone tocou; while I was cooking=enquanto eu cozinhava; meanwhile=enquanto isso; interrupted=interrompido; at the same time=ao mesmo tempo; as soon as=assim que'),
        L('Sequencing', 'Conectores de sequência', 'at first=no início; later=mais tarde; eventually=por fim; afterwards=depois; the next day=no dia seguinte; by the time=quando (já)'),
        L('Past perfect', 'Past perfect para o que aconteceu antes', "had already left=já tinha saído; had never seen=nunca tinha visto; before=antes; by then=até então; realized=percebeu; forgot=esqueceu"),
        L('Storytelling', 'Contar uma boa história', "guess what?=adivinha?; you won't believe=você não vai acreditar; it turned out=no fim das contas; plot twist=reviravolta; anyway=enfim; long story short=resumindo"),
        PRACTICE,
      ], [
        C('Testemunha', 'Você é um policial pegando o depoimento do aluno sobre um acidente.', 'Narrar o que estava acontecendo e o que aconteceu, em ordem.'),
        C('A melhor história', 'Você é um amigo numa mesa de bar pedindo a melhor história do aluno.', 'Contar uma história com começo, conflito e final.'),
      ]),
      U('Trabalho e estudos', 'Entrevistas, reuniões simples, e-mails e objetivos profissionais', [
        L('My job', 'Descrever trabalho e responsabilidades', "I'm in charge of=sou responsável por; I work for=trabalho para; colleague=colega; boss=chefe; deadline=prazo; task=tarefa"),
        L('Job interview', 'Perguntas típicas de entrevista', "tell me about yourself=fale sobre você; strengths=pontos fortes; weaknesses=pontos fracos; experience=experiência; skills=habilidades; why should we hire you?=por que contratar você?"),
        L('Meetings', 'Reuniões simples', "agenda=pauta; let's get started=vamos começar; I agree=concordo; any questions?=alguma pergunta?; follow up=dar retorno; to sum up=resumindo"),
        L('Emails', 'E-mails profissionais', 'Dear=Prezado; I am writing to=escrevo para; please find attached=segue anexo; looking forward to=aguardo; best regards=atenciosamente; as soon as possible=o quanto antes'),
        L('Career goals', 'Objetivos profissionais e estudos', 'promotion=promoção; degree=diploma; course=curso; improve=melhorar; career=carreira; in five years=em cinco anos'),
        PRACTICE,
      ], [
        C('Entrevista de emprego', 'Você é um recrutador de uma empresa americana, exigente e direto.', 'Responder 4 perguntas de entrevista com exemplos.'),
        C('Reunião rápida', 'Você é o gerente conduzindo uma reunião de 5 minutos.', 'Dar um update do trabalho e combinar o próximo passo.'),
      ]),
      U('Opiniões e argumentos', 'Conectores, concordância, discordância e justificativas', [
        L('In my opinion', 'Dar opinião', "in my opinion=na minha opinião; I think=acho; I believe=acredito; personally=pessoalmente; as far as I'm concerned=no que me diz respeito; it seems to me=me parece"),
        L('Agreeing', 'Concordar e discordar com educação', "I totally agree=concordo totalmente; that's true=é verdade; I'm not so sure=não tenho certeza; I see your point, but=entendo, mas; I disagree=discordo; exactly=exatamente"),
        L('Because, so, although', 'Conectores de causa, consequência e contraste', 'because=porque; so=então; although=embora; however=porém; therefore=portanto; on the other hand=por outro lado'),
        L('Giving reasons', 'Justificar com exemplos', 'for example=por exemplo; such as=como; the main reason=o principal motivo; first of all=antes de tudo; besides=além disso; that is why=é por isso'),
        L('Pros and cons', 'Vantagens e desvantagens', 'advantage=vantagem; disadvantage=desvantagem; pros and cons=prós e contras; worth it=vale a pena; drawback=ponto negativo; benefit=benefício'),
        PRACTICE,
      ], [
        C('Discussão de série', 'Você é um fã que odeia o final de uma série famosa que o aluno ama.', 'Defender a opinião com 3 argumentos e um exemplo.'),
        C('Prós e contras', 'Você é um amigo em dúvida se deve morar sozinho.', 'Discutir vantagens e desvantagens e dar um conselho.'),
      ]),
      U('Possibilidades', 'First e second conditional, hipóteses e decisões', [
        L('If it rains...', 'First conditional', "if it rains, I'll stay home=se chover, fico em casa; unless=a menos que; as long as=desde que; in case=caso; I'll=vou; probably=provavelmente"),
        L('If I were rich...', 'Second conditional', "if I were=se eu fosse; I would=eu iria/faria; if I had=se eu tivesse; imagine=imagine; lottery=loteria; I'd buy=eu compraria"),
        L('Might and may', 'Possibilidade com might/may/could', 'might=pode ser que; may=talvez; could=poderia; possibly=possivelmente; perhaps=talvez; likely=provável'),
        L('Making decisions', 'Tomar decisões', "decide=decidir; choose=escolher; option=opção; make up my mind=me decidir; on second thought=pensando melhor; let's go with=vamos de"),
        L('What would you do?', 'Dilemas e hipóteses', "what would you do?=o que você faria?; dilemma=dilema; in your shoes=no seu lugar; I'd probably=eu provavelmente; it's hard to say=difícil dizer; honestly=sinceramente"),
        PRACTICE,
      ], [
        C('E se...?', 'Você é um amigo filosófico que adora perguntas hipotéticas.', 'Responder 4 dilemas usando o second conditional.'),
        C('Resolver um imprevisto', 'Você é o atendente de uma companhia aérea: o voo do aluno foi cancelado.', 'Discutir opções com first conditional e decidir.'),
      ]),
      U('Sociedade e tecnologia', 'Notícias, redes sociais, cultura, meio ambiente e problemas', [
        L('The news', 'Ler e comentar notícias', 'headline=manchete; according to=de acordo com; report=reportagem; government=governo; increase=aumento; issue=questão'),
        L('Social media', 'Redes sociais', 'post=postar; follower=seguidor; share=compartilhar; fake news=notícia falsa; influencer=influenciador; go viral=viralizar'),
        L('Technology', 'Tecnologia no dia a dia', 'device=aparelho; app=aplicativo; update=atualizar; screen time=tempo de tela; artificial intelligence=inteligência artificial; download=baixar'),
        L('Environment', 'Meio ambiente', 'pollution=poluição; recycle=reciclar; climate change=mudança climática; waste=desperdício; renewable=renovável; protect=proteger'),
        L('Problems and solutions', 'Problemas sociais e soluções', 'problem=problema; solution=solução; should be=deveria ser; it would help=ajudaria; community=comunidade; raise awareness=conscientizar'),
        PRACTICE,
      ], [
        C('Discutir uma notícia', 'Você é um apresentador de podcast comentando uma notícia de tecnologia.', 'Resumir a notícia e dar sua opinião com justificativa.'),
        C('Vida sem celular', 'Você é um amigo que decidiu largar as redes sociais.', 'Discutir os efeitos das redes sociais com exemplos.'),
      ]),
    ],
  },
  {
    id: 'B2', name: 'Intermediário superior', tagline: 'Fluência funcional', months: 8, target: 'Comunicação fluida', legacy: 'intermediario',
    aim: 'Participar de discussões detalhadas e comunicar ideias com naturalidade.',
    behavior: 'Ritmo natural, quase sem português. Cobre respostas longas e organizadas. Corrija naturalidade e registro (formal x informal), não só gramática.',
    final: 'Debate estruturado, apresentação oral, redação argumentativa e escuta detalhada.',
    units: [
      U('Comunicação profissional', 'Apresentações, negociações, reuniões e linguagem formal', [
        L('Presentations', 'Abrir, estruturar e fechar uma apresentação', "I'd like to talk about=gostaria de falar sobre; moving on to=passando para; as you can see=como podem ver; to wrap up=para encerrar; key takeaway=principal mensagem; slide=slide"),
        L('Negotiating', 'Negociação básica', "offer=oferta; counteroffer=contraproposta; compromise=meio-termo; deal=acordo; we could consider=poderíamos considerar; that's a deal-breaker=isso inviabiliza"),
        L('Running a meeting', 'Conduzir e participar de reuniões', "can I jump in?=posso interromper?; let's stay on track=vamos manter o foco; action items=encaminhamentos; to clarify=para esclarecer; circle back=retomar; consensus=consenso"),
        L('Formal language', 'Registro formal x informal', 'request=solicitar; assist=auxiliar; regarding=a respeito de; furthermore=além disso; nevertheless=no entanto; would you mind...?=você se importaria...?'),
        L('Small talk at work', 'Conversa informal profissional', "how's business?=como vão os negócios?; catch up=colocar o papo em dia; keep me posted=me mantenha informado; networking=networking; ice breaker=quebra-gelo; touch base=fazer contato"),
        PRACTICE,
      ], [
        C('Negociar um contrato', 'Você é um fornecedor duro na negociação de preço e prazo.', 'Chegar a um acordo com uma contraproposta.'),
        C('Participar de uma reunião', 'Você é a diretora conduzindo uma reunião e pedindo a opinião do aluno.', 'Interromper com educação, dar opinião e propor encaminhamentos.'),
      ]),
      U('Gramática avançada', 'Passive voice, reported speech, relative clauses e modais de dedução', [
        L('Passive voice', 'Voz passiva', 'was built=foi construído; is made=é feito; has been sold=foi vendido; will be announced=será anunciado; by=por; it is said that=dizem que'),
        L('Reported speech', 'Discurso indireto', 'she said that=ela disse que; he told me=ele me disse; asked if=perguntou se; mentioned=mencionou; explained=explicou; claimed=alegou'),
        L('Relative clauses', 'Orações relativas', 'who=que (pessoa); which=que (coisa); whose=cujo; where=onde; that=que; the person who=a pessoa que'),
        L('Must, might, can\'t', 'Modais de dedução', "must be=deve ser (certeza); might be=pode ser; can't be=não pode ser; must have been=deve ter sido; could have=poderia ter; I bet=aposto"),
        L('Third conditional', 'Third conditional e arrependimentos', "if I had known=se eu soubesse; I would have=eu teria; I wish I had=queria ter; regret=arrependimento; should have=deveria ter; if only=se ao menos"),
        PRACTICE,
      ], [
        C('Fofoca do escritório', 'Você é um colega fofoqueiro contando o que ouviu.', 'Recontar 3 falas usando reported speech.'),
        C('Detetive', 'Você é um detetive investigando um mistério com o aluno.', 'Fazer deduções com must/might/can\'t have.'),
      ]),
      U('Argumentação', 'Debates, contra-argumentos, evidências e persuasão', [
        L('Making a case', 'Construir um argumento', 'claim=tese; evidence=evidência; support=sustentar; it is clear that=está claro que; research shows=pesquisas mostram; convincing=convincente'),
        L('Counterarguments', 'Contra-argumentar', "some people argue=alguns argumentam; while it's true that=embora seja verdade; that said=dito isso; on the contrary=pelo contrário; I'd challenge that=eu contestaria isso; flawed=falho"),
        L('Hedging', 'Suavizar afirmações', 'it could be argued=pode-se argumentar; tends to=tende a; to some extent=até certo ponto; arguably=possivelmente; in most cases=na maioria dos casos; it appears=parece'),
        L('Persuasion', 'Técnicas de persuasão', "imagine if=imagine se; the bottom line is=no fim das contas; don't you think?=não acha?; let's face it=vamos encarar; crucial=crucial; undeniable=inegável"),
        L('Debate language', 'Linguagem de debate', 'rebuttal=réplica; point of order=questão de ordem; fair point=ponto justo; to be fair=para ser justo; moving on=seguindo; in conclusion=concluindo'),
        PRACTICE,
      ], [
        C('Debate: home office', 'Você é um CEO que defende o fim do home office.', 'Defender a posição oposta com evidência e contra-argumento.'),
        C('Defender uma proposta', 'Você é um investidor cético.', 'Convencer o investidor com 3 argumentos e responder objeções.'),
      ]),
      U('Cultura e mídia', 'Filmes, podcasts, artigos longos e interpretação crítica', [
        L('Reviewing a film', 'Resenhar filmes e séries', 'plot=enredo; character development=desenvolvimento de personagem; overrated=superestimado; gripping=envolvente; spoiler=spoiler; cast=elenco'),
        L('Podcasts and media', 'Entender podcasts e mídia', 'host=apresentador; episode=episódio; guest=convidado; take=opinião; bias=viés; mainstream=popular'),
        L('Long articles', 'Ler artigos longos e extrair ideias', 'main idea=ideia principal; skim=ler por cima; scan=procurar informação; in other words=em outras palavras; the author suggests=o autor sugere; overall=no geral'),
        L('Critical thinking', 'Interpretação crítica', "reliable=confiável; source=fonte; assumption=pressuposto; point of view=ponto de vista; misleading=enganoso; to question=questionar"),
        L('Slang and idioms', 'Gírias e expressões de séries e música', "it's lit=tá top; no cap=sem mentira; spill the tea=contar a fofoca; break a leg=boa sorte; piece of cake=moleza; low-key=meio que"),
        PRACTICE,
      ], [
        C('Crítica de filme', 'Você é um crítico de cinema arrogante que odeia filmes de super-herói.', 'Defender um filme com análise de enredo e personagens.'),
        C('Podcast de opinião', 'Você é o host de um podcast entrevistando o aluno sobre uma tendência cultural.', 'Explicar a tendência e dar uma opinião crítica.'),
      ]),
      U('Situações complexas', 'Conflitos, reclamações, soluções e negociação de alternativas', [
        L('Making a complaint', 'Fazer reclamações eficazes', "I'm afraid there's a problem=receio que haja um problema; refund=reembolso; unacceptable=inaceitável; I'd like to speak to the manager=quero falar com o gerente; compensation=compensação; faulty=com defeito"),
        L('Handling conflict', 'Lidar com conflitos', "misunderstanding=mal-entendido; calm down=se acalmar; let's sort this out=vamos resolver isso; I understand your frustration=entendo sua frustração; fault=culpa; apologize=pedir desculpas"),
        L('Finding solutions', 'Propor soluções', 'what if we...?=e se nós...?; alternatively=alternativamente; workaround=solução alternativa; win-win=ganha-ganha; feasible=viável; trade-off=troca'),
        L('Polite insistence', 'Insistir com educação', "I'm sorry, but I must insist=desculpe, mas insisto; with all due respect=com todo respeito; I'd appreciate it if=agradeceria se; that's not what we agreed=não foi isso que combinamos; escalate=escalar; firm=firme"),
        L('Unexpected situations', 'Imprevistos', "emergency=emergência; plan B=plano B; last-minute=de última hora; it slipped my mind=esqueci; improvise=improvisar; on short notice=em cima da hora"),
        PRACTICE,
      ], [
        C('Reclamação no restaurante', 'Você é um gerente de restaurante na defensiva.', 'Reclamar com firmeza e conseguir uma compensação.'),
        C('Conflito na equipe', 'Você é um colega que não entregou a parte dele do projeto.', 'Resolver o conflito e combinar uma solução viável.'),
      ]),
      U('Produção independente', 'Redações, relatórios, apresentações e sínteses', [
        L('Essay structure', 'Estrutura de redação argumentativa', 'introduction=introdução; thesis statement=tese; body paragraph=desenvolvimento; topic sentence=frase-tópico; conclusion=conclusão; outline=esboço'),
        L('Reports', 'Relatórios', 'findings=resultados; data=dados; recommend=recomendar; the purpose of this report=o objetivo deste relatório; significant=significativo; trend=tendência'),
        L('Summarizing', 'Sintetizar textos e falas', 'summarize=resumir; key points=pontos-chave; briefly=brevemente; paraphrase=parafrasear; in a nutshell=em poucas palavras; the gist=a essência'),
        L('Linking ideas', 'Coesão e conectores avançados', 'moreover=além disso; whereas=enquanto; consequently=consequentemente; despite=apesar de; in addition=adicionalmente; as a result=como resultado'),
        L('Giving a talk', 'Fazer uma apresentação oral completa', "today I'm going to=hoje vou; let me start with=começo com; this brings me to=isso me leva a; thank you for your attention=obrigado pela atenção; any questions?=perguntas?; audience=público"),
        PRACTICE,
      ], [
        C('Apresentação oral', 'Você é um professor avaliando uma apresentação curta do aluno.', 'Apresentar um tema em 3 partes e responder 2 perguntas.'),
        C('Resumo para o chefe', 'Você é um chefe ocupado que só tem 2 minutos.', 'Resumir um relatório com os pontos-chave e uma recomendação.'),
      ]),
    ],
  },
  {
    id: 'C1', name: 'Avançado', tagline: 'Comunicação profissional e complexa', months: 10, target: 'Comunicação sofisticada', legacy: 'avancado',
    aim: 'Expressar ideias complexas com precisão e adaptar o discurso ao contexto.',
    behavior: 'Inglês 100% natural, rápido, com idioms e nuances. Corrija precisão, colocação e registro. Discorde de propósito para provocar debate.',
    final: 'Apresentação complexa, análise crítica escrita e discussão aprofundada.',
    units: [
      U('Nuances da linguagem', 'Collocations, idioms, phrasal verbs avançados e conotação', [
        L('Collocations', 'Colocações naturais', 'make a decision=tomar uma decisão; heavy rain=chuva forte; strong coffee=café forte; pay attention=prestar atenção; take into account=levar em conta; highly unlikely=muito improvável'),
        L('Idioms', 'Expressões idiomáticas', "hit the nail on the head=acertar em cheio; the ball is in your court=a decisão é sua; cut corners=fazer nas coxas; once in a blue moon=muito raramente; on the fence=em cima do muro; a blessing in disguise=há males que vêm para o bem"),
        L('Phrasal verbs', 'Phrasal verbs avançados', 'come up with=bolar; put up with=aguentar; look into=investigar; get away with=sair impune; back down=recuar; phase out=eliminar aos poucos'),
        L('Connotation', 'Conotação e escolha de palavras', 'slim/skinny=magro (positivo/negativo); stubborn/determined=teimoso/determinado; cheap/affordable=barato/acessível; nosy/curious=intrometido/curioso; childish/childlike=infantil/ingênuo; assertive/aggressive=assertivo/agressivo'),
        L('Precision', 'Precisão e sinônimos', 'significant=significativo; substantial=substancial; marginal=marginal; considerable=considerável; negligible=insignificante; drastic=drástico'),
        PRACTICE,
      ], [
        C('Conversa cheia de idioms', 'Você é um nova-iorquino que fala só com expressões idiomáticas.', 'Entender e usar 4 idioms na conversa.'),
        C('Palavra certa', 'Você é um editor exigente revisando um texto do aluno.', 'Escolher a palavra mais precisa e explicar a conotação.'),
      ]),
      U('Comunicação acadêmica', 'Artigos, pesquisas, resumos, citações e apresentações', [
        L('Academic vocabulary', 'Vocabulário acadêmico', 'hypothesis=hipótese; methodology=metodologia; sample=amostra; framework=estrutura teórica; empirical=empírico; implications=implicações'),
        L('Reading research', 'Ler pesquisas e artigos científicos', 'abstract=resumo; findings suggest=os resultados sugerem; correlation=correlação; causation=causalidade; limitation=limitação; peer-reviewed=revisado por pares'),
        L('Citing sources', 'Citar e referenciar', 'according to=segundo; as stated by=conforme afirmado por; cited in=citado em; quote=citação; reference=referência; plagiarism=plágio'),
        L('Writing abstracts', 'Escrever resumos acadêmicos', 'this paper examines=este artigo examina; aims to=visa; the results indicate=os resultados indicam; concise=conciso; objective=objetivo; scope=escopo'),
        L('Academic talks', 'Apresentações acadêmicas e perguntas', "I'd like to draw your attention to=gostaria de chamar atenção para; this raises the question=isso levanta a questão; further research=mais pesquisas; that's a great question=ótima pergunta; to elaborate=para aprofundar; preliminary=preliminar"),
        PRACTICE,
      ], [
        C('Defesa de pesquisa', 'Você é um orientador fazendo perguntas difíceis sobre a pesquisa do aluno.', 'Explicar hipótese, método e limitações.'),
        C('Discussão de artigo', 'Você é um colega de mestrado que discorda das conclusões de um artigo.', 'Discutir as evidências e propor interpretação alternativa.'),
      ]),
      U('Liderança e negócios', 'Gestão, feedback, negociação e comunicação estratégica', [
        L('Leading a team', 'Liderar equipes', 'delegate=delegar; empower=dar autonomia; accountability=responsabilização; align=alinhar; bottleneck=gargalo; ownership=senso de dono'),
        L('Giving feedback', 'Dar feedback construtivo', "I've noticed that=percebi que; going forward=daqui pra frente; room for improvement=espaço para melhorar; I appreciate=valorizo; constructive=construtivo; blind spot=ponto cego"),
        L('Strategic communication', 'Comunicação estratégica', 'stakeholder=parte interessada; buy-in=adesão; roadmap=roteiro; leverage=alavancar; messaging=mensagem; long-term vision=visão de longo prazo'),
        L('Advanced negotiation', 'Negociação avançada', 'leverage=poder de barganha; walk away=desistir do acordo; concession=concessão; BATNA=melhor alternativa; terms=condições; mutually beneficial=mutuamente benéfico'),
        L('Handling crises', 'Comunicação em crise', 'damage control=contenção de danos; transparency=transparência; take responsibility=assumir a responsabilidade; reassure=tranquilizar; statement=comunicado; backlash=reação negativa'),
        PRACTICE,
      ], [
        C('Conduzir uma reunião', 'Você é um membro do time resistente a uma mudança.', 'Conduzir a reunião, ouvir a objeção e conseguir adesão.'),
        C('Feedback difícil', 'Você é um funcionário talentoso mas que vive atrasando entregas.', 'Dar feedback construtivo e combinar um plano.'),
      ]),
      U('Debates complexos', 'Ética, economia, ciência, política e questões abstratas', [
        L('Ethics', 'Dilemas éticos', 'moral=moral; justify=justificar; consequences=consequências; the greater good=o bem maior; slippery slope=ladeira escorregadia; principle=princípio'),
        L('Economy', 'Economia', 'inflation=inflação; recession=recessão; inequality=desigualdade; tax=imposto; growth=crescimento; supply and demand=oferta e demanda'),
        L('Science', 'Ciência e inovação', 'breakthrough=descoberta; evidence-based=baseado em evidências; ethical concerns=preocupações éticas; gene editing=edição genética; consensus=consenso; skeptical=cético'),
        L('Politics', 'Política (sem partidarismo)', 'policy=política pública; democracy=democracia; legislation=legislação; polarization=polarização; accountability=prestação de contas; reform=reforma'),
        L('Abstract ideas', 'Discutir ideias abstratas', 'free will=livre-arbítrio; meaning=sentido; identity=identidade; perception=percepção; paradox=paradoxo; inherently=intrinsecamente'),
        PRACTICE,
      ], [
        C('Mediar divergências', 'Você interpreta duas pessoas brigando sobre IA no trabalho; o aluno é o mediador.', 'Resumir os dois lados e propor um meio-termo.'),
        C('Tema abstrato', 'Você é um filósofo provocador.', 'Discutir livre-arbítrio com argumentos e exemplos.'),
      ]),
      U('Estilo e registro', 'Ironia, diplomacia, formalidade, tom e adequação cultural', [
        L('Irony and sarcasm', 'Ironia e sarcasmo', "oh, great=ah, ótimo (irônico); yeah, right=tá bom, sei; as if=até parece; what a surprise=que surpresa (irônico); thanks a lot=valeu mesmo (irônico); deadpan=sério/inexpressivo"),
        L('Diplomacy', 'Linguagem diplomática', "I'm not sure that's the best approach=não sei se é a melhor abordagem; perhaps we could=talvez pudéssemos; with respect=com respeito; I take your point=entendo seu ponto; slightly=ligeiramente; somewhat=um tanto"),
        L('Formality levels', 'Níveis de formalidade', "gonna/going to=vou (informal/neutro); kids/children=crianças; get/obtain=conseguir/obter; ask/inquire=perguntar/indagar; buy/purchase=comprar/adquirir; help/assist=ajudar/auxiliar"),
        L('Tone', 'Tom: escrito e falado', 'tone=tom; come across as=passar a impressão de; blunt=direto demais; passive-aggressive=passivo-agressivo; warm=caloroso; neutral=neutro'),
        L('Cultural awareness', 'Adequação cultural', 'small talk=conversa fiada; personal space=espaço pessoal; tipping=gorjeta; taboo=tabu; etiquette=etiqueta; faux pas=gafe'),
        PRACTICE,
      ], [
        C('E-mail diplomático', 'Você é um cliente furioso; o aluno precisa responder com diplomacia.', 'Recusar um pedido mantendo o cliente.'),
        C('Ironia ou elogio?', 'Você é um britânico extremamente irônico.', 'Identificar a ironia e responder no mesmo tom.'),
      ]),
      U('Produção avançada', 'Ensaios, análises críticas, palestras e discussões extensas', [
        L('Critical essays', 'Ensaios críticos', 'critique=crítica; evaluate=avaliar; nuanced=matizado; compelling=convincente; counterpoint=contraponto; synthesis=síntese'),
        L('Analysis', 'Análise crítica de textos', 'underlying=subjacente; imply=implicar; infer=inferir; rhetorical=retórico; coherent=coerente; undermine=minar'),
        L('Public speaking', 'Palestras', 'engage the audience=engajar o público; storytelling=contar histórias; pause for effect=pausa dramática; call to action=chamada para ação; keynote=palestra principal; delivery=desempenho'),
        L('Extended discussion', 'Discussões longas', "building on that=complementando; to take it a step further=indo além; let's unpack that=vamos destrinchar isso; tangent=tangente; to circle back=voltando; devil's advocate=advogado do diabo"),
        L('Editing your work', 'Revisar e editar', 'proofread=revisar; redundant=redundante; concise=conciso; flow=fluidez; rephrase=reformular; clarity=clareza'),
        PRACTICE,
      ], [
        C('Palestra curta', 'Você é a plateia de um TED talk que faz perguntas difíceis.', 'Fazer uma mini palestra e responder às perguntas.'),
        C('Advogado do diabo', 'Você é um advogado do diabo incansável.', 'Sustentar uma tese por 6 trocas sem perder a coerência.'),
      ]),
    ],
  },
  {
    id: 'C2', name: 'Proficiência', tagline: 'Domínio de nuances e precisão', months: 12, target: 'Refinamento e domínio', legacy: 'avancado',
    aim: 'Aprimorar precisão, espontaneidade, flexibilidade e compreensão de nuances.',
    behavior: 'Fale como nativo culto: velocidade natural, humor, referências culturais, subtexto. Corrija até sutilezas de estilo. Mude de assunto e de tom sem avisar para testar flexibilidade.',
    final: 'Avaliação integrada de leitura, escuta, escrita e fala em contextos complexos.',
    units: [
      U('Domínio lexical', 'Expressões raras, sutilezas semânticas e linguagem figurada', [
        L('Rare expressions', 'Expressões raras e sofisticadas', 'serendipity=acaso feliz; ubiquitous=onipresente; quintessential=por excelência; ephemeral=efêmero; a moot point=uma questão irrelevante; par for the course=o esperado'),
        L('Semantic nuance', 'Sutilezas de significado', 'imply/infer=insinuar/deduzir; disinterested/uninterested=imparcial/desinteressado; affect/effect=afetar/efeito; continual/continuous=recorrente/contínuo; historic/historical=histórico (marcante)/histórico (do passado); ensure/insure=garantir/segurar'),
        L('Figurative language', 'Linguagem figurada', 'metaphor=metáfora; simile=comparação; hyperbole=hipérbole; understatement=eufemismo; personification=personificação; vivid imagery=imagens vívidas'),
        L('Word formation', 'Formação de palavras', 'prefix=prefixo; suffix=sufixo; mis-=erroneamente; -ify=transformar em; over-=excessivamente; counter-=contra'),
        L('Register shifts', 'Trocar de registro com fluidez', 'colloquial=coloquial; formal=formal; jargon=jargão; vernacular=vernáculo; code-switching=alternância de código; idiomatic=idiomático'),
        PRACTICE,
      ], [
        C('Duelo de vocabulário', 'Você é um escritor pedante que corrige cada palavra.', 'Reformular frases com vocabulário mais preciso.'),
        C('Metáforas', 'Você é um poeta que só fala por imagens.', 'Interpretar e criar 3 metáforas.'),
      ]),
      U('Retórica e persuasão', 'Discursos, estratégias argumentativas e adaptação ao público', [
        L('Rhetorical devices', 'Recursos retóricos', 'rhetorical question=pergunta retórica; repetition=repetição; tricolon=regra de três; antithesis=antítese; anecdote=anedota; appeal to emotion=apelo emocional'),
        L('Ethos, pathos, logos', 'Credibilidade, emoção e lógica', 'credibility=credibilidade; emotion=emoção; logic=lógica; authority=autoridade; empathy=empatia; reasoning=raciocínio'),
        L('Speeches', 'Discursos marcantes', 'opening hook=gancho inicial; rallying cry=grito de guerra; pause=pausa; cadence=cadência; memorable=memorável; closing line=frase final'),
        L('Know your audience', 'Adaptar ao público', 'tailor=adaptar; tone down=suavizar; layman=leigo; technical audience=público técnico; resonate=ressoar; relatable=identificável'),
        L('Fallacies', 'Falácias e como rebatê-las', 'straw man=espantalho; ad hominem=ataque pessoal; false dilemma=falso dilema; red herring=distração; circular reasoning=raciocínio circular; slippery slope=ladeira escorregadia'),
        PRACTICE,
      ], [
        C('Discurso de campanha', 'Você é um assessor exigente avaliando um discurso.', 'Fazer um discurso curto usando 3 recursos retóricos.'),
        C('Caçador de falácias', 'Você é um debatedor que usa falácias de propósito.', 'Identificar e rebater 3 falácias.'),
      ]),
      U('Interpretação profunda', 'Humor, sarcasmo, subtexto, referências culturais e ambiguidades', [
        L('Humor', 'Entender humor e trocadilhos', "pun=trocadilho; wordplay=jogo de palavras; punchline=desfecho da piada; dry humor=humor seco; inside joke=piada interna; to get the joke=entender a piada"),
        L('Subtext', 'Subtexto e leitura nas entrelinhas', "read between the lines=ler nas entrelinhas; hint=indireta; underlying meaning=sentido implícito; tongue-in-cheek=em tom de brincadeira; loaded question=pergunta capciosa; what they really mean=o que realmente querem dizer"),
        L('Cultural references', 'Referências culturais', 'reference=referência; pop culture=cultura pop; allusion=alusão; Catch-22=situação sem saída; Big Brother=vigilância total; the elephant in the room=o problema que ninguém menciona'),
        L('Ambiguity', 'Ambiguidade', 'ambiguous=ambíguo; double meaning=duplo sentido; vague=vago; clarify=esclarecer; misinterpret=interpretar mal; context-dependent=depende do contexto'),
        L('British vs American', 'Variações do inglês', 'flat/apartment=apartamento; queue/line=fila; brilliant/awesome=ótimo; cheers/thanks=valeu; quite good=razoável (UK); rubbish/trash=lixo'),
        PRACTICE,
      ], [
        C('Piada de série', 'Você é um roteirista de sitcom explicando piadas.', 'Explicar o humor e o subtexto de 3 piadas.'),
        C('Conversa com subtexto', 'Você é um chefe que nunca diz as coisas diretamente.', 'Entender as indiretas e responder com tato.'),
      ]),
      U('Comunicação especializada', 'Vocabulário técnico, textos especializados e debates de alto nível', [
        L('Technical vocabulary', 'Vocabulário técnico da sua área', 'specification=especificação; protocol=protocolo; benchmark=referência; scalability=escalabilidade; compliance=conformidade; workflow=fluxo de trabalho'),
        L('Legal and finance', 'Linguagem jurídica e financeira', 'clause=cláusula; liability=responsabilidade legal; breach=violação; equity=patrimônio; asset=ativo; due diligence=diligência prévia'),
        L('Medical and science', 'Linguagem médica e científica', 'diagnosis=diagnóstico; symptom=sintoma; clinical trial=ensaio clínico; side effect=efeito colateral; placebo=placebo; peer review=revisão por pares'),
        L('Explaining complexity', 'Explicar temas complexos com simplicidade', "in layman's terms=em termos simples; analogy=analogia; break it down=destrinchar; essentially=essencialmente; the crux=o cerne; oversimplify=simplificar demais"),
        L('Expert debate', 'Debate de alto nível', 'evidence suggests=as evidências sugerem; methodological flaw=falha metodológica; robust=robusto; contested=contestado; paradigm=paradigma; nuance=nuance'),
        PRACTICE,
      ], [
        C('Apresentação especializada', 'Você é um painel de especialistas de outra área.', 'Explicar um tema técnico para leigos e responder perguntas.'),
        C('Debate técnico', 'Você é um especialista que discorda da metodologia do aluno.', 'Defender a metodologia com termos técnicos precisos.'),
      ]),
      U('Produção sofisticada', 'Ensaios complexos, edição, síntese e escrita estilística', [
        L('Style', 'Estilo de escrita', 'voice=voz; rhythm=ritmo; concision=concisão; eloquent=eloquente; understated=contido; evocative=evocativo'),
        L('Complex essays', 'Ensaios complexos', 'premise=premissa; line of reasoning=linha de raciocínio; qualify=relativizar; corollary=corolário; overarching=abrangente; cogent=persuasivo'),
        L('Synthesis', 'Síntese de várias fontes', 'synthesize=sintetizar; converge=convergir; diverge=divergir; overarching theme=tema central; reconcile=conciliar; juxtapose=justapor'),
        L('Editing like a pro', 'Edição profissional', 'tighten=enxugar; cut the fluff=cortar o excesso; awkward phrasing=frase truncada; parallelism=paralelismo; dangling modifier=modificador solto; polish=lapidar'),
        L('Creative writing', 'Escrita criativa', 'narrative voice=voz narrativa; show, don\'t tell=mostre, não conte; foreshadowing=prenúncio; tension=tensão; dialogue=diálogo; ending=desfecho'),
        PRACTICE,
      ], [
        C('Editor implacável', 'Você é um editor de revista famoso e implacável.', 'Defender e melhorar um parágrafo do próprio aluno.'),
        C('Síntese ao vivo', 'Você apresenta 3 opiniões diferentes sobre um tema.', 'Sintetizar as três em uma posição coerente.'),
      ]),
      U('Imersão e proficiência', 'Simulações longas, situações imprevisíveis e comunicação espontânea', [
        L('Spontaneity', 'Falar sem preparo', "off the top of my head=de cabeça; let me think=deixa eu pensar; that's a tough one=essa é difícil; on the spot=na hora; wing it=improvisar; thinking out loud=pensando alto"),
        L('Unpredictable situations', 'Situações imprevisíveis', 'curveball=bola curva; adapt=adaptar; caught off guard=pego de surpresa; roll with it=seguir o fluxo; recover=se recuperar; quick thinking=raciocínio rápido'),
        L('Long simulations', 'Simulações longas', 'role-play=simulação; stay in character=manter o personagem; scenario=cenário; stakes=o que está em jogo; outcome=resultado; debrief=análise final'),
        L('Native-like fluency', 'Fluência de nativo', 'filler words=palavras de preenchimento; you know=sabe; I mean=quer dizer; kind of=meio que; contractions=contrações; linking sounds=ligação de sons'),
        L('Self-correction', 'Autocorreção e monitoramento', 'rephrase=reformular; what I meant was=o que eu quis dizer foi; let me put it another way=deixa eu dizer de outro jeito; to be precise=para ser preciso; scratch that=esquece isso; clarify=esclarecer'),
        PRACTICE,
      ], [
        C('Simulação com reviravoltas', 'Você conduz uma simulação de negócios que muda de rumo sem aviso.', 'Se adaptar a 3 mudanças inesperadas mantendo o objetivo.'),
        C('Debate extenso', 'Você é um debatedor experiente de Oxford.', 'Sustentar um debate longo com réplicas espontâneas.'),
      ]),
    ],
  },
];

/* ---------- índices e ids ---------- */
export const LEVEL_IDS = CEFR.map((l) => l.id);
export const WEEKLY = [
  { day: 'Domingo', focus: 'Descanso ou prática livre', action: 'free' },
  { day: 'Segunda', focus: 'Vocabulário e pronúncia', action: 'review' },
  { day: 'Terça', focus: 'Gramática contextualizada', action: 'lesson' },
  { day: 'Quarta', focus: 'Escuta e compreensão', action: 'lesson' },
  { day: 'Quinta', focus: 'Conversação com IA', action: 'convo' },
  { day: 'Sexta', focus: 'Leitura e escrita', action: 'lesson' },
  { day: 'Sábado', focus: 'Revisão e avaliação', action: 'srs' },
];
export const SKILLS = {
  vocabulario: 'Vocabulário', gramatica: 'Gramática', escuta: 'Compreensão auditiva',
  conversacao: 'Conversação', leitura: 'Leitura', escrita: 'Escrita',
};

for (const lv of CEFR) {
  lv.units.forEach((u, ui) => {
    u.id = `${lv.id}-U${ui + 1}`; u.n = ui + 1; u.level = lv.id;
    u.lessons = u.lessons.map((l, li) => ({ ...l, id: `${u.id}-L${li + 1}`, n: li + 1, unit: u.id, level: lv.id }));
    u.convos.forEach((c, ci) => { c.id = `${u.id}-C${ci + 1}`; c.n = ci + 1; c.unit = u.id; c.level = lv.id; });
  });
}

export const getLevel = (id) => CEFR.find((l) => l.id === id) || CEFR[0];
export const getUnit = (id) => getLevel(String(id).slice(0, 2)).units.find((u) => u.id === id);
export const getLesson = (id) => getUnit(String(id).split('-').slice(0, 2).join('-'))?.lessons.find((l) => l.id === id);
export const getConvo = (id) => getUnit(String(id).split('-').slice(0, 2).join('-'))?.convos.find((c) => c.id === id);
export const parseVocab = (s) => String(s || '').split(';').map((x) => x.trim()).filter(Boolean).map((x) => { const [en, ...pt] = x.split('='); return { en: en.trim(), pt: pt.join('=').trim() }; });
/* Vocabulário da unidade inteira (para a aula "Practice" e a prova). */
export const unitVocab = (unit) => unit.lessons.flatMap((l) => parseVocab(l.vocab));
export const allLessons = () => CEFR.flatMap((l) => l.units.flatMap((u) => u.lessons));
export const totals = () => ({
  levels: CEFR.length,
  units: CEFR.reduce((a, l) => a + l.units.length, 0),
  lessons: allLessons().length,
  convos: CEFR.reduce((a, l) => a + l.units.reduce((b, u) => b + u.convos.length, 0), 0),
});
