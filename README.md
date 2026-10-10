# Blitz — site institucional

Site da **Blitz**, empresa de tecnologia. Feito em HTML, CSS e JavaScript puros — sem build, sem dependências.

## Como ver

Abra o `index.html` no navegador, ou rode um servidor local:

```bash
python3 -m http.server 8000
# acesse http://localhost:8000
```

## Estrutura

- `index.html` — conteúdo e seções (início, empresa, produtos, tecnologia, princípios, FAQ)
- `styles.css` — tema escuro com texto cromado, vidro, roxo da marca e animações
- `script.js` — loader, cursor, rolagem suave (Lenis), animações com GSAP ScrollTrigger (editor explodido em 3D, títulos, cards), FAQ e menu mobile
- `three-scene.js` — cena 3D do topo com Three.js (logo "b" em fita 3D, estrelas cromadas e partículas)
- `assets/vendor/` — bibliotecas incluídas no site: GSAP, ScrollTrigger, Lenis e Three.js
- `assets/logo.png` — logo da Blitz (o "b" em fita, branco com fundo transparente)
- `assets/logo-icon.png`, `assets/favicon.png`, `assets/apple-touch-icon.png` — logo em fundo preto para ícones

## Próximos passos

- Publicar gratuitamente com GitHub Pages, Netlify ou Vercel
