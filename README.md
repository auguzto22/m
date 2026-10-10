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
- `three-scene.js` — cena 3D do topo com Three.js (logo de vidro, estrelas cromadas e partículas)
- `assets/vendor/` — bibliotecas incluídas no site: GSAP, ScrollTrigger, Lenis e Three.js
- `assets/logo.svg` — logo da Blitz (ícone de vidro com raio); `assets/logo-preview.png` mostra o logo
- `assets/favicon.svg` — ícone da aba do navegador

## Próximos passos

- Publicar gratuitamente com GitHub Pages, Netlify ou Vercel
