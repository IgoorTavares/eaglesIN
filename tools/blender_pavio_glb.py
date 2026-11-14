"""
blender_pavio_glb.py — junta o Professor Pavio (FBX do Mixamo, COM pele) e as
animações (FBX do Mixamo, SEM pele) num único arquivo GLB leve para o EaglesIn.

Requer Blender 3.6 LTS ou 4.x (grátis: blender.org). Roda sem abrir a interface:

  "C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe" --background ^
      --python tools\\blender_pavio_glb.py -- ^
      --modelo "C:\\pavio\\Pavio.fbx" --anims "C:\\pavio\\anims" ^
      --saida "icons\\pavio3d\\pavio.glb"

Opções:
  --max-tris 40000   reduz a malha se passar disso (celular agradece)
  --max-tex 1024     reduz texturas maiores que isso (px)

Cada arquivo da pasta de animações vira uma animação com o NOME DO ARQUIVO
(ex.: anims\\Idle.fbx -> "Idle"). Os nomes que o app entende estão em NOMES.
O app (js/pavio3d.js) encontra icons/pavio3d/pavio.glb sozinho.
"""
import argparse
import os
import re
import sys

import bpy

# Nome do arquivo -> o que o Pavio faz com ele no app. Só "Idle" é obrigatório.
NOMES = {
    'Idle': 'parado respirando (base de tudo)',
    'Talk': 'falando, gesticulando',
    'Clap': 'alegre: bate palmas',
    'Jump': 'pulo (toque no personagem, surpresa boa)',
    'Dance': 'comemorando: dança',
    'Angry': 'bravo / sem paciência: bate o pé',
    'Furious': 'pavio estourado: surto',
    'Point': 'apontando',
    'Think': 'pensando (enquanto a IA responde)',
    'Disappointed': 'decepcionado: facepalm',
    'Celebrate': 'vitória (prova aprovada)',
    'Yes': 'orgulhoso: acena que sim',
    'No': 'debochado: balança a cabeça',
    'Wave': 'animado: acena',
    'Surprised': 'surpreso: recua',
    'Laugh': 'rindo',
    'Tired': 'cansado',
}


def ler_args():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    p = argparse.ArgumentParser(description='Pavio (Mixamo) -> GLB para o EaglesIn')
    p.add_argument('--modelo', required=True, help='FBX do Pavio baixado do Mixamo "With Skin"')
    p.add_argument('--anims', required=True, help='pasta com as animações FBX "Without Skin"')
    p.add_argument('--saida', default='pavio.glb')
    p.add_argument('--max-tris', type=int, default=40000)
    p.add_argument('--max-tex', type=int, default=1024)
    return p.parse_args(argv)


def importar_fbx(caminho):
    antes = set(bpy.data.objects)
    acoes_antes = set(bpy.data.actions)
    bpy.ops.import_scene.fbx(filepath=caminho)
    novos = [o for o in bpy.data.objects if o not in antes]
    novas_acoes = [a for a in bpy.data.actions if a not in acoes_antes]
    return novos, novas_acoes


def triangulos(malhas):
    return sum(max(1, len(p.vertices) - 2) for m in malhas for p in m.data.polygons)


def main():
    a = ler_args()
    if not os.path.isfile(a.modelo):
        sys.exit(f'Modelo não encontrado: {a.modelo}')
    if not os.path.isdir(a.anims):
        sys.exit(f'Pasta de animações não encontrada: {a.anims}')

    # Cena vazia
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # 1) Personagem com pele
    objs, acoes_base = importar_fbx(a.modelo)
    arm = next((o for o in objs if o.type == 'ARMATURE'), None)
    malhas = [o for o in objs if o.type == 'MESH']
    if not arm or not malhas:
        sys.exit('O FBX do modelo precisa ter esqueleto e malha (baixe do Mixamo com "With Skin").')
    arm.animation_data_create()
    arm.animation_data.action = None
    for ac in acoes_base:  # pose que veio junto com o modelo (T-pose): descarta
        bpy.data.actions.remove(ac)

    # 2) Animações (cada FBX vira uma ação com o nome do arquivo)
    clipes = []
    for arq in sorted(os.listdir(a.anims)):
        if not arq.lower().endswith('.fbx'):
            continue
        nome = os.path.splitext(arq)[0]
        novos, novas_acoes = importar_fbx(os.path.join(a.anims, arq))
        arm_anim = next((o for o in novos if o.type == 'ARMATURE'), None)
        acao = arm_anim.animation_data.action if arm_anim and arm_anim.animation_data else None
        if not acao:
            print(f'[aviso] {arq}: sem animação, ignorado')
        else:
            acao.name = nome
            acao.use_fake_user = True
            # Uma faixa NLA por animação: o exportador gera um clipe para cada uma.
            faixa = arm.animation_data.nla_tracks.new()
            faixa.name = nome
            faixa.strips.new(nome, int(acao.frame_range[0]), acao)
            clipes.append(nome)
        for ac in novas_acoes:  # ações extras que o FBX cria (ex.: mixamo.com|Layer0)
            if ac is not acao and ac.users == 0:
                bpy.data.actions.remove(ac)
        for o in novos:  # esqueletos/malhas das animações não são necessários
            bpy.data.objects.remove(o, do_unlink=True)

    if 'Idle' not in clipes:
        sys.exit('Falta a animação obrigatória "Idle" (anims\\Idle.fbx).')

    # 3) Malha mais leve para celular
    tris = triangulos(malhas)
    if tris > a.max_tris:
        razao = a.max_tris / tris
        for m in malhas:
            mod = m.modifiers.new('Reduzir', 'DECIMATE')
            mod.ratio = razao
        print(f'Malha: {tris} triângulos -> ~{a.max_tris} (decimate {razao:.2f})')

    # 4) Texturas no máximo --max-tex px
    for img in bpy.data.images:
        w, h = img.size
        if w and h and max(w, h) > a.max_tex:
            k = a.max_tex / max(w, h)
            img.scale(max(1, int(w * k)), max(1, int(h * k)))
            print(f'Textura {img.name}: {w}x{h} -> {img.size[0]}x{img.size[1]}')

    # 5) Osso da cabeça (o app o encontra sozinho; aqui só para conferência)
    cabeca = next((b.name for b in arm.data.bones if re.search(r'(^|:)Head$', b.name)), None)

    # 6) Exporta GLB
    os.makedirs(os.path.dirname(os.path.abspath(a.saida)), exist_ok=True)
    opcoes = dict(
        filepath=os.path.abspath(a.saida), export_format='GLB', export_apply=True,
        export_animations=True, export_skins=True, export_morph=True, export_yup=True,
        export_image_format='JPEG',
    )
    try:
        bpy.ops.export_scene.gltf(**opcoes, export_animation_mode='NLA_TRACKS')
    except TypeError:  # Blender < 3.6
        bpy.ops.export_scene.gltf(**opcoes, export_nla_strips=True)

    kb = os.path.getsize(a.saida) / 1024
    print('\n=== PRONTO ===')
    print(f'Arquivo: {os.path.abspath(a.saida)} ({kb:.0f} KB)')
    print(f'Animações: {", ".join(clipes)}')
    faltam = [n for n in NOMES if n not in clipes]
    if faltam:
        print('Opcionais que faltaram (o app usa o Idle no lugar): ' + ', '.join(faltam))
    desconhecidos = [n for n in clipes if n not in NOMES]
    if desconhecidos:
        print('Nomes que o app não usa (renomeie o arquivo se quiser usar): ' + ', '.join(desconhecidos))
    print(f'Osso da cabeça: {cabeca or "não achei (o movimento da cabeça na fala fica desligado)"}')
    if kb > 6000:
        print('[aviso] Arquivo grande para celular. Tente --max-tris 25000 --max-tex 1024.')


main()
