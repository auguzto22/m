(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Ano no rodapé
  document.getElementById("ano").textContent = new Date().getFullYear();

  // Navegação: fundo ao rolar + menu mobile
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const mobile = document.getElementById("menu-mobile");

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    mobile.hidden = !open;
    nav.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(mobile.hidden));
  mobile.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Animação de entrada ao rolar
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal").forEach((el) => {
    const siblings = el.parentElement.querySelectorAll(":scope > .reveal");
    const idx = Array.prototype.indexOf.call(siblings, el);
    el.style.transitionDelay = `${Math.min(idx, 5) * 80}ms`;
    observer.observe(el);
  });

  // Brilho gelado que segue o mouse nos cards
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // Flocos de neve / cristais de gelo caindo no hero
  const canvas = document.querySelector(".hero__canvas");
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext("2d");
  let w, h, flakes = [], visible = true;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(70, w / 18));
    flakes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 3,
      speed: 0.25 + Math.random() * 0.7,
      drift: Math.random() * Math.PI * 2,
      alpha: 0.35 + Math.random() * 0.5,
    }));
  };
  resize();
  window.addEventListener("resize", resize);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const draw = () => {
    requestAnimationFrame(draw);
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    flakes.forEach((f) => {
      f.y += f.speed;
      f.drift += 0.01;
      f.x += Math.sin(f.drift) * 0.35;
      if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(14, 165, 233, ${f.alpha * 0.55})`;
      ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
      ctx.shadowBlur = 6;
      ctx.fill();
    });
  };
  requestAnimationFrame(draw);
})();
