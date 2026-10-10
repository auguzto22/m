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

  // Animação de entrada ao rolar + contadores
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("is-visible");
      el.querySelectorAll("[data-count]").forEach(animateCount);
      observer.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal").forEach((el, i) => {
    const siblings = el.parentElement.querySelectorAll(":scope > .reveal");
    const idx = Array.prototype.indexOf.call(siblings, el);
    el.style.transitionDelay = `${Math.min(idx, 5) * 80}ms`;
    observer.observe(el);
  });

  // Brilho que segue o mouse nos cards
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // Formulário de contato (validação no navegador)
  const form = document.getElementById("form-contato");
  const status = form.querySelector(".form__status");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("[required]").forEach((field) => {
      const ok = field.value.trim() !== "" && field.checkValidity();
      field.classList.toggle("is-invalid", !ok);
      field.setAttribute("aria-invalid", String(!ok));
      if (!ok) valid = false;
    });
    if (!valid) {
      status.className = "form__status err";
      status.textContent = "Por favor, preencha nome, um e-mail válido e a mensagem.";
      return;
    }
    status.className = "form__status ok";
    status.textContent = "Mensagem enviada! Entraremos em contato em breve. ⚡";
    form.reset();
  });

  // Raios animados no fundo do hero
  const canvas = document.querySelector(".hero__canvas");
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext("2d");
  let w, h, dpr, bolts = [], last = 0, visible = true;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const makeBolt = () => {
    const pts = [];
    let x = w * (0.45 + Math.random() * 0.55);
    let y = -10;
    const endY = h * (0.4 + Math.random() * 0.5);
    while (y < endY) {
      pts.push([x, y]);
      x += (Math.random() - 0.5) * 70;
      y += 18 + Math.random() * 34;
    }
    return { pts, life: 1, width: 1 + Math.random() * 1.6 };
  };

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const draw = (now) => {
    requestAnimationFrame(draw);
    if (!visible) return;
    if (now - last > 1800 + Math.random() * 2600) { bolts.push(makeBolt()); last = now; }
    ctx.clearRect(0, 0, w, h);
    bolts = bolts.filter((b) => b.life > 0);
    bolts.forEach((b) => {
      ctx.beginPath();
      b.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.strokeStyle = `rgba(255, 214, 10, ${b.life * 0.55})`;
      ctx.lineWidth = b.width;
      ctx.shadowColor = "rgba(255, 214, 10, 0.9)";
      ctx.shadowBlur = 18;
      ctx.stroke();
      b.life -= 0.025;
    });
  };
  requestAnimationFrame(draw);
})();
