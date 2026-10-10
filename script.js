(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.getElementById("ano").textContent = new Date().getFullYear();

  /* ---------- Navegação ---------- */
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const mobile = document.getElementById("menu-mobile");
  const progress = document.querySelector(".progress");
  let lastY = window.scrollY;

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    mobile.hidden = !open;
    nav.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(mobile.hidden));
  mobile.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Manifesto: divide em palavras ---------- */
  const manifesto = document.querySelector(".split-words");
  let words = [];
  if (manifesto) {
    manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/)
      .map((w) => `<span class="w">${w}</span>`).join(" ");
    words = [...manifesto.querySelectorAll(".w")];
  }

  /* ---------- Loop de rolagem ---------- */
  const footerWord = document.querySelector(".footer__word");
  const stats = [...document.querySelectorAll(".stat")];

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("is-scrolled", y > 10);
    const menuOpen = !mobile.hidden;
    nav.classList.toggle("is-hidden", !menuOpen && y > 400 && y > lastY);
    lastY = y;

    if (reduceMotion) return;

    // Manifesto acende palavra por palavra
    if (manifesto) {
      const r = manifesto.getBoundingClientRect();
      const t = Math.min(Math.max((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35), 0), 1);
      const lit = Math.floor(t * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < lit));
    }

    // Parallax dos cards de números
    stats.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      s.style.setProperty("--py", (c * (i % 2 ? -60 : -30)).toFixed(1));
    });

    // Palavra gigante do rodapé sobe
    if (footerWord) {
      const r = footerWord.getBoundingClientRect();
      footerWord.style.setProperty("--fw", Math.max(0, (r.top - innerHeight * 0.6) * 0.25).toFixed(1));
    }
  };
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ---------- Reveal ao entrar na tela ---------- */
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const fmt = (v) => el.dataset.format === "k" && v >= 1000 ? (v / 1000).toFixed(v % 1000 ? 1 : 0).replace(".", ",") + " mil" : String(v);
    if (reduceMotion) { el.textContent = fmt(target); return; }
    const start = performance.now();
    const dur = 1800;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - t, 4))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-visible");
      e.target.querySelectorAll?.("[data-count]").forEach(countUp);
      if (e.target.matches("[data-count]")) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

  document.querySelectorAll(".reveal").forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 6) * 90}ms`;
    io.observe(el);
  });
  document.querySelectorAll("[data-count]").forEach((el) => io.observe(el));

  /* ---------- FAQ: abre um por vez com animação ---------- */
  document.querySelectorAll(".faq details").forEach((d) => {
    const summary = d.querySelector("summary");
    const body = d.querySelector(".faq__body");
    summary.addEventListener("click", (e) => {
      if (reduceMotion) return;
      e.preventDefault();
      if (d.open) {
        const h = body.scrollHeight;
        body.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 450, easing: "cubic-bezier(.16,1,.3,1)" })
          .onfinish = () => { d.open = false; };
      } else {
        document.querySelectorAll(".faq details[open]").forEach((o) => { if (o !== d) o.querySelector("summary").click(); });
        d.open = true;
        const h = body.scrollHeight;
        body.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 550, easing: "cubic-bezier(.16,1,.3,1)" });
      }
    });
  });

  if (reduceMotion || !finePointer) return;

  /* ---------- Efeitos de mouse ---------- */
  const glow = document.querySelector(".cursor-glow");
  const hero = document.querySelector(".hero");
  const layers = [...document.querySelectorAll(".parallax")];
  let mx = innerWidth / 2, my = innerHeight / 2, gx = mx, gy = my;

  window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

  const loop = () => {
    gx += (mx - gx) * 0.12;
    gy += (my - gy) * 0.12;
    glow.style.transform = `translate(${gx}px, ${gy}px)`;

    const hr = hero.getBoundingClientRect();
    if (hr.bottom > 0) {
      hero.style.setProperty("--sx", `${gx - hr.left}px`);
      hero.style.setProperty("--sy", `${gy - hr.top}px`);
      const nx = gx / innerWidth - 0.5, ny = gy / innerHeight - 0.5;
      layers.forEach((l) => {
        const d = Number(l.dataset.depth);
        l.style.translate = `${(nx * d).toFixed(1)}px ${(ny * d).toFixed(1)}px`;
      });
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // Spotlight nas bordas de vidro
  document.querySelectorAll(".glass").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // Inclinação 3D
  document.querySelectorAll(".tilt").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1000px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateZ(0)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });

  // Botões magnéticos
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
})();
