# 🦅 EaglesIn

PWA pessoal para aprender inglês **do A1 ao C2 conversando por voz** com um professor de IA debochado.
O professor padrão é o **Professor Pavio**: gente boa, mas com o pavio curtíssimo (fica vermelho, bufa e solta palavrão quando você repete o mesmo erro).
Em Configurações → Professor também estão a **Nuvem**, uma nuvem 3D que fica feliz (sol e pássaros) quando você acerta e vira tempestade (chuva e raios) quando você erra feio, e a **Cláudia**.
O app abre no **tema escuro**; o claro fica em Configurações → Aparência.

**Visual:** identidade verde, preto e branco.
- **Tokens:** cores, tipografia, espaço, cantos, sombras e movimento ficam no topo do `style.css`.
- **Fontes:** Inter e Nunito Sans, salvas em `fonts/` (licença OFL, funcionam offline).
- **Ícones:** Lucide (licença ISC), embutidos no `index.html`. O arquivo-fonte é `icons/ui.svg`. Para usar: `<svg class="ic"><use href="#i-nome"/></svg>`, ou `icon('nome')` no `app.js` e no `js/learn.js`.
- **Telas:** todas seguem o mesmo padrão (`page-head`, cartões, anéis de nota `.ring`, listas `.lesson-row`, barra de etapas). Funcionam do celular (375px) ao desktop (conteúdo centralizado em até 760px) e nos temas escuro e claro com contraste AA.
- **Movimento reduzido:** com "Reduzir movimento" ligado no sistema, as entradas e transições decorativas param; o microfone e o indicador Ouvindo/Pensando/Falando continuam, porque fazem parte da aula.
A **intensidade do humor** (Debochado leve, Grosseiro ou Caótico) é escolhida por professor.
Tudo roda no navegador, sem backend e com custo zero (Gemini no plano gratuito + voz nativa do navegador).

**O estilo não mudou:** palavrões, broncas pesadas na pronúncia ruim e deboche sobre o erro, nunca sobre a pessoa.
Isso vale para aulas, provas, conversas e correção de redação. Quem preferir pode ligar o **Modo educado** em Configurações.

## Estrutura pedagógica (CEFR)

| Nível | Nome | Duração sugerida | Unidades | Aulas | Conversas guiadas |
|---|---|---|---|---|---|
| A1 | Iniciante | 3 meses | 6 | 36 | 12 |
| A2 | Básico | 4 meses | 6 | 36 | 12 |
| B1 | Intermediário | 6 meses | 6 | 36 | 12 |
| B2 | Intermediário superior | 8 meses | 6 | 36 | 12 |
| C1 | Avançado | 10 meses | 6 | 36 | 12 |
| C2 | Proficiência | 12 meses | 6 | 36 | 12 |
| **Total** | | | **36** | **216** | **72** |

Além disso, cada unidade tem **1 prova de unidade** (36 no total) e cada nível tem **1 prova final** (6 no total).

- **Currículo fixo** em `js/curriculum.js`: temas, objetivos, vocabulário-base e cenários de conversa de cada aula.
  Cada unidade tem 5 aulas de conteúdo, uma 6ª aula **Practice** de revisão integrada e 2 conversas guiadas.
- **A IA não inventa o currículo.** Ela só gera os exercícios de cada aula ou prova a partir do que está no currículo.
  O resultado fica guardado no aparelho (`nuvem-packs-v1`, até 40 pacotes) para não gastar cota de novo.
  Cada nova tentativa de prova gera uma prova nova.

### Aula em 6 etapas
1. **Introdução:** objetivo e situação real.
2. **Vocabulário:** palavras com áudio.
3. **Explicação:** a regra, em português, no estilo da professora.
4. **Prática interativa:** múltipla escolha, ordenar palavras, escrever e escuta.
5. **Prática oral:** você fala as frases e recebe nota de pronúncia.
6. **Verificação:** mini-teste com resultado.

### Avaliações e critérios
- **Microavaliação:** a verificação no fim de cada aula.
- **Prova de unidade:**
  - 20 questões objetivas: 4 de escuta, 4 de leitura, 6 de vocabulário e 6 de gramática.
  - 2 redações, corrigidas pela IA.
  - 3 frases faladas.
- **Prova final do nível:** 24 questões, 2 redações e 4 frases faladas, cobrindo as 4 habilidades.
- **Avaliação de retenção:** feita com o que você já estudou (flashcards). Roda sem IA.
- **Nota da prova:** questões objetivas valem 60%, redação 20% e fala 20%.
  Se uma parte for pulada, o peso se redistribui entre as outras.

| Resultado | O que acontece |
|---|---|
| **80% ou mais** | Avança |
| **60–79%** | Revisão direcionada (o app lista as aulas mais fracas) |
| **Abaixo de 60%** | Reforço da unidade |
| **Prova final** | Exige 80% no geral **e** no mínimo 60% em escuta, leitura, escrita e conversação |

Os critérios ficam em `PASS`, no `js/store.js`. Questões erradas viram flashcards de revisão.

### Conversar com a IA
| Modalidade | O que faz |
|---|---|
| 🧭 Guiada | Segue o roteiro das conversas da unidade |
| 💬 Livre | Você escolhe o assunto |
| 🎭 Simulação | A IA vira atendente, cliente, entrevistador… |
| 🏆 Desafio | Atingir um objetivo sem ajuda |
| 🗣️ Pronúncia | Frases com sons difíceis para brasileiros, avaliadas com rigor |
| ⚔️ Debate | A IA defende sempre o lado oposto |

Os temas pop (Friends, Marvel, Harry Potter, rap etc.) ficam em **Conversar → Séries, filmes e rap**.
Ao encerrar uma conversa, o relatório mostra:
- erros;
- frases alternativas;
- vocabulário usado;
- fluidez e compreensão;
- pontos de melhoria.

As regras de cada modalidade estão em `CHAT_MODES`, no `js/prompts.js`.

### Progresso e adaptação
- **Perfil de habilidades:** vocabulário, gramática, escuta, conversação, leitura e escrita.
  Cada aula, prova e conversa atualiza o perfil com média móvel.
- **Recomendação:** a tela inicial sugere o próximo passo pela habilidade mais fraca e pelas revisões pendentes.
- **Revisão espaçada:** flashcards no sistema Leitner com 5 caixas (`js/srs.js`).
- **Rotina semanal:** cada dia da semana tem um foco (aula, conversa, revisão…), definido em `WEEKLY` no `js/curriculum.js`.
- **Plano "Completo (50 min)":** repetição 20 min, conversa 15, revisão 5 e exercícios 10. Escolha em Configurações.
- **Sem bloqueio:** nada fica trancado. O app marca o caminho recomendado, e o próximo nível é sugerido depois da prova final aprovada.

### Navegação
Seis abas:
- **Início:** próxima aula, foco do dia, revisões e recomendação.
- **Aprender:** níveis, unidades e aulas.
- **Conversar**
- **Provas**
- **Revisar:** flashcards, retenção e exercícios.
- **Progresso:** habilidades e jornada A1→C2.

**Jornada do aluno:**
1. Teste de nível: 5 perguntas que sugerem um nível de A1 a C1.
2. Plano.
3. Aulas.
4. Conversas.
5. Prova de unidade.
6. Revisão.
7. Prova final.
8. Próximo nível.

## Arquivos

```
index.html          app shell + navegação (6 abas)
style.css           tema, mobile-first, mascote e telas do currículo
app.js              roteador, telas gerais, conversa, treino guiado, gamificação
content.js          temas do dia a dia × níveis + teste de nível
content-pop.js      séries, filmes e rap (Friends, Suits, Harry Potter, Marvel, Hip-hop…)
config.local.js     chave pré-configurada, SÓ para este computador (está no .gitignore)
js/curriculum.js    currículo CEFR: níveis, unidades, aulas, conversas, rotina semanal
js/learn.js         telas de Aprender, aulas em 6 etapas, provas, retenção, flashcards
js/prompts.js       professores, personalidade, modalidades e prompts  ← o jeito da professora
js/ai.js            chamadas ao Gemini, geração de aulas/provas, troca automática de modelo
js/store.js         dados (localStorage), XP, streak, planos, progresso CEFR, habilidades
js/mascot.js        mascote Nuvem animada (olhos, boca, sol, chuva, raios)
js/pavio.js         Professor Pavio 2.5D (expressões, vermelhidão, fumaça, boca)
js/emotion.js       motor de emoções + escada de paciência (erros seguidos contados pelo app)
icons/pavio/        expressões do Pavio (arte provisória recortada de _referencia.webp)
js/recorder.js      grava sua voz (WAV 16 kHz) para o Gemini avaliar a pronúncia
js/eleven.js        voz natural do ElevenLabs (opcional)
js/voice.js         síntese e reconhecimento de fala do navegador
js/pronunciation.js comparação palavra por palavra + falas do "xilique"
js/srs.js           revisão espaçada (Leitner, 5 caixas)
js/exercises.js     completar, ouvir e escrever, ordenar, traduzir
sw.js               service worker (offline do app shell)
manifest.json       instalação na tela inicial
icons/mascot/       imagens da Nuvem (happy.png = sol, storm.png = tempestade)
```

## A mascote Nuvem

A Nuvem usa duas imagens (`icons/mascot/happy.png` e `storm.png`) com camadas animadas por cima: piscar, boca que acompanha a fala, raios de sol, pássaros, chuva e relâmpagos.
Ela reage ao que o app está fazendo de verdade:
- **Ouvindo:** aparece um anel em volta dela.
- **Pensando:** aparece um balão.
- **Sem internet:** aparece um aviso.
- **Bom resultado:** sol e brilhos.
- **Erro feio:** tempestade.

O humor só muda **depois** que a resposta chega.
Com "reduzir movimento" ligado no sistema, ela continua piscando e falando, mas sem flutuar, sem chuva e sem relâmpagos.

## Professor Pavio

O Pavio é 80% gente boa e 20% explosão. Quem decide a reação é o **app**, contando os erros seguidos; a IA não inventa histórico.

| Erros seguidos | Reação (intensidade Grosseiro) |
|---|---|
| 1º | acolhedor, sem palavrão |
| 2º | debochado |
| 3º | bravo, ficando vermelho, com palavrão |
| 4º ou mais | o pavio estoura: fica vermelho, bufa, solta fumaça, respira e volta a explicar com calma |

- **Erro repetido:** errar de novo a mesma coisa sobe um degrau a mais.
- **Intensidade:** no Leve ele para no deboche; no Caótico ele explode mais cedo.
- **Modo educado:** desliga a bronca.
- **🆘 Ajuda (na conversa):** para a bronca e faz ele explicar o último erro de novo. Se você acertar em seguida, ele comemora.
- **Arte provisória:** as expressões foram recortadas da folha `icons/pavio/_referencia.webp`. Para trocar pela arte final, substitua os arquivos `.jpg` mantendo os mesmos nomes; se a boca ficar fora do lugar, ajuste `MOUTH` no `js/pavio.js`.

### Memória do aluno
O professor lembra de você entre conversas (`js/memory.js`):
- **Fatos que você contou:** trabalho, gostos, objetivo. Ao anotar um, o app mostra "🧠 Anotei: …".
- **Erros de gramática que você repete.** Repetir um erro de outra conversa conta como reincidência: o Pavio sobe um degrau na escada.
- **Contexto:** palavras de pronúncia difícil, habilidades mais fracas e as últimas conversas resumidas.

Na abertura da conversa ele puxa assunto pelo que lembra.
- **Onde fica:** só no aparelho, e vai junto no prompt do Gemini.
- **Fora da memória:** dados sensíveis (saúde, religião, documentos, endereço, telefone) e o que é dito nas Simulações.
- **Controle:** em **Configurações → 🧠 Memória do aluno** você vê tudo, apaga item por item, apaga a memória inteira ou desliga.

### Primeiro acesso, login e modo foco (2026-11-14)
- **Primeiro acesso (`js/onboarding.js`):** 18 telas com o Pavio (apresentação, preferência de áudio, nível, desafio de fala, objetivos, plano, humor, conversa de demonstração, convite para conta). Quem já tinha progresso ou chave não vê. Dá para rever em **Configurações → Conta e apresentação**.
  - Não usa IA paga: a conversa de demonstração tem roteiro fixo, e o desafio de fala compara só o **texto** do reconhecimento de voz do navegador (não é avaliação de pronúncia).
  - As respostas ficam em `state.onboarding` neste aparelho, sem áudio, e expiram em 7 dias se a apresentação não for concluída. Ao concluir, viram preferências (áudio, plano, humor) e fatos da memória do aluno.
- **Login (`js/auth.js`):** botão "Entrar com o Google" pelo Firebase Authentication. **Ainda desligado:** falta criar o projeto e colar o `firebaseConfig` em `FIREBASE_CONFIG` (passo a passo no topo do arquivo). O login só identifica a pessoa; o progresso continua no aparelho.
- **Modo foco:** aula, prova, primeiro acesso e login escondem o cabeçalho e as abas. O Pavio fica de corpo inteiro e o que ele fala em português aparece num balão.
- **Áudio:** `settings.audioPref` = `all` (fala tudo), `speech` (só o inglês dos exercícios) ou `off` (só o botão Ouvir).
- **Memória de vídeo:** no máximo 3 poses do Pavio ficam carregadas além da neutra; as outras são liberadas e voltam do cache.

### Pavio em 3D
Para ligar: **Configurações → Professor → Pavio em 3D** (ou o botão **3D** na tela inicial).
- **Modelo em uso:** `icons/pavio3d/pavio-corpo.glb` (corpo inteiro, ~59 mil triângulos, 4,6 MB) e `icons/pavio3d/pavio-rostos.glb` (10 cabeças de expressão, 3,1 MB). Os dois foram gerados a partir dos originais do Tripo com `@gltf-transform` (simplificação, texturas JPEG de 2048 px, quantização).
- **Ligado por padrão** (desde 2026-11-14) em quem tem WebGL; dá para desligar nas Configurações. Sem WebGL, fica o Pavio 2.5D.
- **Onde aparece:** corpo inteiro na tela inicial, com **uma pose de corpo inteiro por emoção** (`icons/pavio3d/corpos/*.glb`, 11 poses de ~4,4 MB: alegre, debochado, surpreso, pensando, impaciente, bravo, bufando, raivoso, decepcionado, escutando, cansado; o neutro é o `pavio-corpo.glb`). Cada pose só é baixada na primeira vez que aparece; até chegar, fica a pose atual. No chat e nas aulas, a cabeça com a cara da emoção atual.
- **Emoção → cara:** tranquilo/voltando à calma → neutro; alegre, animado, rindo, comemorando → alegre; orgulhoso, debochado → debochado; sem paciência, cansado → impaciente; bravo → bravo; bufando → bufando; pavio estourado → raivoso (vermelho); surpreso → surpreso; decepcionado → decepcionado (mão na cara); pensando → pensando.
- **Movimento por código** (o modelo não tem esqueleto): respira e balança parado, pula comemorando, treme de raiva, murcha decepcionado, estufa bufando, inclina a cabeça ao ouvir, balança ao falar. Os gestos (pular, joinha, "não", mão na cara, pisar forte) têm impulsos próprios e trocam a cara por um instante.
- **Movimento reduzido:** o corpo fica parado e só as caras mudam.
- **Ordem de carga:** `pavio.glb` com esqueleto do Mixamo (se um dia existir) → corpo + cabeças → robô de teste.
- **Sem WebGL ou com falha:** volta sozinho para o Pavio 2.5D.
- **Desempenho:** o Three.js (`js/vendor/three/`, ~0,8 MB) só é baixado quando o 3D é ligado. O desenho roda a no máximo 30 quadros/s e para quando a tela fica escondida.
- **Animação de verdade (opcional, depois):** com o corpo passado pelo Mixamo, gere `icons/pavio3d/pavio.glb` seguindo [tools/COMO-GERAR-PAVIO-3D.md](tools/COMO-GERAR-PAVIO-3D.md). Quando esse arquivo existe, o app o usa no lugar do corpo animado por código. Até lá, o console mostra um 404 de `pavio.glb`, que é esperado.
- **Originais (2026-11-14):** `PAVIO3d.glb`, `PAVIO3dneutro.glb`, `PAVIOexpressões.glb` e as 11 poses (`PAVIOalegre.glb`, `RAIVA.glb`, `FURIOSO.glb` etc., 62–75 MB cada, ~1 milhão de vértices) **não são usados pelo app** e ficam fora dele, em `D:\TRABALHO\WHITE LABEL\english-pavio3d-originais\`, só como fonte.
- **Licenças:** Three.js r169 (MIT). Robô de teste "RobotExpressive" (CC0, Tomás Laulhé / Don McCurdy), só para teste.

## 1. Gerar a chave grátis do Gemini

1. Acesse **https://aistudio.google.com** e entre com sua conta Google.
2. Menu **Get API key** → **Create API key** → escolha ou crie um projeto.
3. Copie a chave.
4. No app: **⚙️ Configurações → Chave do Google Gemini** → cole → **Testar chave**.

A chave fica **só no localStorage do seu aparelho**. Para trocar, cole outra no mesmo campo.
No plano gratuito, o Google pode usar as conversas e os áudios para treinar modelos. Não fale dados sensíveis.

### Chave pré-configurada (`config.local.js`)
Neste computador a chave já está em `config.local.js`, e o app a usa sozinho quando ainda não há chave salva.
- O arquivo está no `.gitignore`, então **não vai** para o GitHub se você publicar com `git`.
- Se você publicar **arrastando a pasta** (upload pelo site), **não inclua** `config.local.js`.
  Num site público qualquer pessoa consegue abrir o arquivo e gastar sua cota. No celular, cole a chave uma vez em Configurações.
- Se quiser mesmo deixar a chave embutida no site, restrinja-a antes no Google Cloud Console:
  Credenciais → sua chave → *Restrições de aplicativo: sites* → seu domínio.
- Se a chave vazar, apague-a no AI Studio e gere outra.

### Modelo e cota
- **Modelo padrão:** `gemini-3.5-flash-lite`.
- **Troca automática:** se o modelo estiver lento, sobrecarregado (503) ou sem cota (429), o app tenta sozinho, nesta ordem:
  `gemini-3.1-flash-lite` → `gemini-3.5-flash` → `gemini-3.8-flash` → `gemini-flash-latest`.
  A lista fica em `FALLBACKS`, no `js/ai.js`.
- **Tempo nos testes:** uma aula ficou pronta em ~6 s e uma prova em ~5 s.
- **Cota:** cada aula ou prova gasta uma chamada maior. Depois de pronta, a aula fica guardada e não gasta de novo.

## 1b. Voz natural com ElevenLabs (opcional)

Sem configurar nada, a professora usa a voz do navegador, que é grátis. Para uma voz natural:

1. Em **elevenlabs.io → perfil → API Keys**, crie uma chave.
   Se for restringir permissões, libere **Text to Speech** e **Voices (leitura)**.
2. No app: **⚙️ Configurações → Voz → Voz natural (ElevenLabs)** → cole a chave → **Carregar vozes** → escolha a voz.
   Ou cole direto o ID da voz.
3. Toque em **Testar voz**.

Como funciona:
- **Modelo:** a mesma voz fala o inglês e a bronca em português, com o modelo `eleven_flash_v2_5`, rápido e multilíngue.
  Para trocar, mude `ELEVEN_MODEL` no `js/eleven.js`.
- **Créditos:** cada fala gasta créditos do seu plano.
  Repetir uma fala ("ouvir de novo", 🐢 devagar) reaproveita o áudio já gerado e não gasta de novo.
  Para economizar, desligue "Ler a bronca em português em voz alta".
- **Sem créditos, chave inválida ou voz apagada:** o app avisa e volta sozinho para a voz do navegador.
  A voz natural só volta quando você reabrir o app ou mexer nas configurações.
- **Cuidado com a chave:** ela fica só no aparelho e vale o mesmo cuidado da chave do Gemini.
  Para pré-configurar neste computador, use os campos `ELEVENLABS_API_KEY` e `ELEVENLABS_VOICE_ID` em `config.local.js`.
- **Voz do Pavio:** ele tem voz própria (ID `RGbeQtiShYRDVCrd9b9w`, em `TEACHERS.pavio.elevenVoice` no `js/prompts.js`). Basta ter a chave do ElevenLabs.
  A voz escolhida em Configurações vale para os outros professores.
  Vozes da biblioteca do ElevenLabs podem exigir plano pago para uso pela API; se a conta recusar, o app avisa e usa a voz do navegador.
- **Escolha da voz:** use uma voz da biblioteca ou uma voz sua. Não clone a voz de dubladores ou de personagens.

## 2. Publicar de graça

O app precisa de **HTTPS**, porque o microfone e o service worker só funcionam assim. As duas opções abaixo já são HTTPS.

### Opção A — GitHub Pages
1. Crie um repositório no GitHub (ex.: `eaglesin`). Ele pode ser público.
2. Envie todos os arquivos desta pasta para a raiz do repositório, **menos o `config.local.js`**.
   Pelo site: **Add file → Upload files**, arrastando tudo, inclusive as pastas `js/` e `icons/`.
3. Vá em **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. Em 1–2 minutos, o app fica em `https://SEU-USUARIO.github.io/eaglesin/`.

### Opção B — Cloudflare Pages
1. Entre em **dash.cloudflare.com → Workers & Pages → Create → Pages → Upload assets**.
2. Dê um nome ao projeto e arraste a pasta inteira, sem o `config.local.js`.
3. O app fica em `https://NOME.pages.dev`.

### Testar no PC antes
Qualquer servidor estático serve, por exemplo:
```bash
npx serve .
```
Abra o endereço mostrado no **Chrome**.
Abrir o `index.html` direto como arquivo não funciona, porque módulos ES e service worker precisam de servidor.

## 3. Instalar no celular

- **Android (Chrome):** abra o link → menu ⋮ → **Instalar app** (ou "Adicionar à tela inicial").
- **iPhone (Safari):** abra o link → botão Compartilhar → **Adicionar à Tela de Início**.

Na primeira vez que tocar no microfone, permita o acesso.

### Dois jeitos de te ouvir (Configurações → Professor)
- **IA ouve meu áudio (padrão):** o app grava e o Gemini escuta o áudio.
  Funciona em qualquer navegador que grave áudio, inclusive o Firefox, e avalia a pronúncia bem melhor. Gasta um pouco mais da cota.
- **Transcrição do navegador:** usa a Web Speech API.
  É mais leve e mostra o texto enquanto você fala, mas é menos rigorosa. Não funciona no Firefox.

> ⚠️ **Sobre a pronúncia:** nenhum dos dois é um laboratório de fonética.
> A nota pode variar de uma tentativa para outra, e ruído ou sotaque podem enganar a avaliação. Use como treino, não como certificado.

## 4. Personalizar

- **Currículo:** `CEFR` no `js/curriculum.js`.
  - Cada aula: `L('Título', 'objetivo em português', 'palavra=tradução; ...')`.
  - Cada conversa guiada: `C('Título', 'papel da IA', 'meta do aluno')`.
- **Jeito da professora:** `js/prompts.js`.
  - `TEACHERS`: os professores.
  - `personaDebochada` e `personaEducada`: a personalidade.
  - `RULES`: as reações por nota de pronúncia.
  - `CHAT_MODES`: as modalidades.
  - `buildLessonPrompt` / `buildExamPrompt`: como as aulas e as provas são geradas.
- **Reações fixas nos exercícios:** as frases de acerto e erro ficam no `js/learn.js`.
  As falas do "xilique" (Repete depois de mim) ficam em `js/pronunciation.js` (`XILIQUE`, `CELEBRA`).
- **Critérios de aprovação:** `PASS` no `js/store.js`.
- **Planos de treino:** pelo app, em **Configurações → Plano de treino diário**.
  Os padrões ficam em `PLANS`, no `js/store.js`. XP e conquistas ficam em `XP` e `ACHIEVEMENTS`, no mesmo arquivo.
- **Temas pop e do dia a dia:** `POP_THEMES` (`content-pop.js`) e `DAILY_THEMES` (`content.js`).
  Copie um bloco existente e altere. Escreva frases **suas** sobre a obra; não copie falas de roteiro nem letras de música.

### Publicar uma atualização
Depois de editar qualquer arquivo, aumente `CACHE_VERSION` em **`sw.js`** (hoje `nuvem-v30`) e suba de novo.
Se criar um arquivo novo, adicione-o também à lista `SHELL`.
O celular baixa a versão nova em segundo plano, e ela aparece quando você **abrir o app pela segunda vez**.

## Limitações conhecidas
- **Qualidade das aulas e provas:** o conteúdo é gerado pela IA a partir do currículo e pode ter erros pontuais.
  Se uma aula vier ruim, use **Refazer (aula nova)** no resultado da aula.
- **Escuta:** as questões de escuta usam a voz sintética do navegador, não áudio gravado por nativos.
- **Lembrete:** sem servidor não existe push de verdade.
  A notificação só dispara se o app estiver aberto ou em segundo plano recente no horário escolhido.
- **Limite do Gemini grátis:** se estourar, o app avisa. Espere um minuto (limite por minuto) ou até o dia seguinte (limite diário).
- **Dados:** ficam só no aparelho. Use **Configurações → Exportar backup** para não perder o progresso ao trocar de celular.
