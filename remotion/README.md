# XZK — Remotion (loop do hero)

Sub-projeto **isolado**. Nunca é importado pelo bundle do app — só produz os
arquivos de vídeo em `../public`, que o site embeda como `<video>`.

## Por que separado?
O orçamento de performance proíbe Remotion em runtime. Aqui ele só **renderiza**
assets; o app consome o resultado (`/public/hero-loop.webm` + `.mp4` + poster).

## Como renderizar
```bash
cd remotion
npm install
npm run render          # gera hero-loop.webm e hero-loop.mp4 em ../public
npm run render:poster   # gera o poster PNG (opcional; já existe um .svg de fallback)
npm run studio          # abre o Remotion Studio pra editar a composição
```

A composição `HeroLoop` (8s, 1080×1080, 30fps, loop perfeito) mostra um clip
"sendo analisado": legendas pipocando palavra-a-palavra (brancas + keyword em
ouro), scanner dourado varrendo, waveform reagindo a um drop, número subindo em
mono dourado e um micro-glitch no corte que liga o fim ao começo.

> Enquanto o vídeo não for renderizado, o `<video>` do hero cai no
> `poster="/hero-loop-poster.svg"` automaticamente — o site funciona sem o vídeo.
