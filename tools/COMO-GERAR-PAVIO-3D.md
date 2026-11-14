# Como gerar o Professor Pavio em 3D

Resultado final: um arquivo `icons/pavio3d/pavio.glb`. Quando ele existe, o app usa o Pavio no lugar do robô de teste, sem mudar nada no código.

O caminho mais barato, todo grátis ou com plano grátis:

1. Imagem do Pavio de corpo inteiro.
2. Gerador de imagem para 3D.
3. Mixamo: esqueleto e animações.
4. Blender: junta tudo num `.glb` leve (roteiro `tools/blender_pavio_glb.py`).

---

## 1. Imagem de corpo inteiro

O gerador 3D precisa do personagem **inteiro, de frente, em pose "A"** (braços abertos uns 45°, pernas um pouco afastadas), fundo branco, sem sombra e sem objetos na mão.

Prompt sugerido para gerar essa imagem a partir da folha `icons/pavio/_referencia.webp`:

> Full-body character turnaround, front view, of the same character from the reference: middle-aged teacher, bald head, thick mustache, round glasses, short-sleeve shirt and tie. A-pose, arms 45 degrees from the body, feet slightly apart, neutral friendly expression, mouth closed. Plain white background, even lighting, no shadows, no props, stylized 3D cartoon look.

Se o gerador aceitar várias vistas, gere também lado e costas.

## 2. Imagem para 3D

Use um destes, com a imagem do passo 1:

- **Meshy** (meshy.ai)
- **Tripo** (tripo3d.ai)
- **Hunyuan3D** (grátis, roda online)

Configuração:

- Escolha a malha **com textura** e a opção de **pose A/T**, se houver.
- Baixe em **FBX** ou **OBJ**.

Confira a licença do plano grátis antes de usar num app publicado.

## 3. Mixamo (mixamo.com, grátis com conta Adobe)

1. **Upload Character**: envie o modelo e marque queixo, pulsos, cotovelos, joelhos e virilha.
2. Baixe o personagem: **FBX Binary**, **With Skin**, **T-pose**. Salve como `Pavio.fbx`.
3. Para cada animação da tabela abaixo:
   - Procure o nome sugerido.
   - Marque **In Place** quando existir.
   - Baixe em **FBX Binary**, **Without Skin**, **30 fps**.
   - Salve **com o nome da coluna "Arquivo"** numa pasta `anims`.

| Arquivo | Sugestão no Mixamo | Quando aparece no app |
|---|---|---|
| `Idle.fbx` (**obrigatório**) | Breathing Idle | parado |
| `Talk.fbx` | Talking | falando |
| `Think.fbx` | Thinking | esperando a IA |
| `Clap.fbx` | Clapping | alegre, joinha |
| `Yes.fbx` | Head Nod Yes | orgulhoso |
| `No.fbx` | Shaking Head No | debochado |
| `Wave.fbx` | Waving | animado |
| `Jump.fbx` | Jump | toque no personagem |
| `Dance.fbx` | Silly Dancing | comemorando |
| `Angry.fbx` | Angry / Stomping | bravo, sem paciência |
| `Furious.fbx` | Angry Gesture / Yelling | pavio estourado |
| `Surprised.fbx` | Surprised | surpreso |
| `Disappointed.fbx` | Disappointed | decepcionado (facepalm) |
| `Laugh.fbx` | Laughing | rindo |
| `Tired.fbx` | Tired / Sad Idle | cansado |
| `Point.fbx` | Pointing | apontando |

Só o `Idle` é obrigatório. Quando falta uma animação, o Pavio fica no Idle naquele momento, mas a vermelhidão e a fumaça aparecem do mesmo jeito.

## 4. Blender

1. Instale o **Blender 4.2 LTS** (blender.org, grátis).
2. No PowerShell, na pasta do projeto:

```
& "C:\Program Files\Blender Foundation\Blender 4.2\blender.exe" --background --python tools\blender_pavio_glb.py -- --modelo "C:\pavio\Pavio.fbx" --anims "C:\pavio\anims" --saida "icons\pavio3d\pavio.glb"
```

3. No fim, o roteiro mostra:
   - o tamanho do arquivo;
   - as animações incluídas;
   - as que faltaram;
   - o osso da cabeça encontrado.

Meta: **até ~6 MB** para abrir bem no celular. Se passar disso, rode de novo com `--max-tris 25000 --max-tex 1024`.

## 5. Testar

1. Abra o app no PC (`npx serve` ou o servidor local de sempre).
2. Ligue **Configurações → Professor → Pavio em 3D**.
3. O Pavio deve se mexer com as animações do Mixamo, e não mais com o movimento por código.

Se der problema:

- **Aparece o Pavio "estátua" (movimento por código):** o arquivo não está em `icons/pavio3d/pavio.glb` ou não abriu. Veja o console do navegador (F12).
- **Gira, deita ou fica gigante/minúsculo:** reexporte do Mixamo em T-pose. O app enquadra pelo tamanho do modelo, então o tamanho em si não importa.
- **A vermelhidão pinta a roupa toda:** dê ao material da pele um nome com "skin" ou "pele" no Blender. Sem isso, o app tinge tudo.
- **Uma animação não toca:** o nome do arquivo precisa ser exatamente o da tabela (maiúsculas contam).

Para publicar a mudança, aumente `CACHE_VERSION` no `sw.js`.

## Expressões do rosto (opcional, avançado)

O Mixamo não cria expressões faciais. Para sobrancelha brava, boca aberta e afins, crie **shape keys** no Blender (`Angry`, `Happy`, `Surprised`, `Sad`, `MouthOpen`) e preencha `face` em `MODEL_PAVIO` no `js/pavio3d.js`. O robô de teste (`MODEL_TEST`) serve de exemplo. Sem shape keys, o Pavio ainda funciona: corpo, cabeça, cor e fumaça.
