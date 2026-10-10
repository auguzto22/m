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

/* ================= MOTION PACK: loader, cursor, GSAP, Lenis ================= */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const html = document.documentElement;

  /* ---------- Loader ---------- */
  const loader = document.querySelector(".loader");
  const finish = () => {
    html.classList.remove("is-loading");
    if (window.ScrollTrigger) setTimeout(() => window.ScrollTrigger.refresh(), 100);
  };
  if (loader && !reduceMotion) {
    const count = loader.querySelector(".loader__count");
    const bar = loader.querySelector(".loader__bar b");
    const start = performance.now();
    const dur = 1500;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      count.textContent = Math.round(e * 100);
      bar.style.setProperty("--p", e);
      if (t < 1) requestAnimationFrame(tick);
      else setTimeout(finish, 180);
    };
    requestAnimationFrame(tick);
    setTimeout(() => loader.remove(), 3600);
  } else {
    finish();
  }

  /* ---------- Rodapé: letra por letra ---------- */
  const fw = document.querySelector(".footer__word");
  if (fw) fw.innerHTML = [...fw.textContent.trim()].map((c) => `<span>${c}</span>`).join("");

  if (reduceMotion) return;

  /* ---------- Texto embaralhado nos chips ---------- */
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+";
  const scramble = (el) => {
    const final = el.textContent;
    let frame = 0;
    const total = 22;
    const run = () => {
      el.textContent = [...final].map((ch, i) => {
        if (ch === " " || ch === "●") return ch;
        return frame / total > i / final.length ? ch : glyphs[(Math.random() * glyphs.length) | 0];
      }).join("");
      if (++frame <= total) requestAnimationFrame(run);
      else el.textContent = final;
    };
    run();
  };
  const chipIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      setTimeout(() => scramble(e.target), 200);
      chipIO.unobserve(e.target);
    });
  }, { threshold: 1 });
  document.querySelectorAll(".chip").forEach((c) => chipIO.observe(c));

  /* ---------- Cursor personalizado ---------- */
  const cursor = document.querySelector(".cursor");
  if (cursor && finePointer) {
    const ring = cursor.querySelector(".cursor__ring");
    const dot = cursor.querySelector(".cursor__dot");
    let x = -100, y = -100, rx = x, ry = y;
    window.addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
    window.addEventListener("pointerdown", () => cursor.classList.add("is-down"));
    window.addEventListener("pointerup", () => cursor.classList.remove("is-down"));
    document.addEventListener("pointerover", (e) => {
      cursor.classList.toggle("is-hover", !!e.target.closest("a, button, summary"));
    });
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      dot.style.transform = `translate(${x}px, ${y}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Rolagem suave (Lenis) ---------- */
  if (window.Lenis) {
    const lenis = new window.Lenis({ lerp: 0.085 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        const target = id.length > 1 && document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -70, duration: 1.6 });
      });
    });
  }

  /* ---------- Hero sai com a rolagem + controla o 3D ---------- */
  gsap.to(".hero__text", {
    yPercent: -35, opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  ScrollTrigger.create({
    trigger: ".hero", start: "top top", end: "bottom top", scrub: true,
    onUpdate: (s) => { window.__heroProgress = s.progress; },
  });

  /* ---------- Títulos surgem em 3D ---------- */
  document.querySelectorAll(".heading").forEach((h) => {
    h.style.transition = "none";
    h.classList.remove("reveal");
    h.classList.add("split-ready");
    gsap.fromTo(h,
      { clipPath: "inset(0% 0% 100% 0%)", y: 90, rotationX: -40, opacity: 1, filter: "blur(0px)", transformOrigin: "50% 100%" },
      { clipPath: "inset(-20% -5% -20% -5%)", y: 0, rotationX: 0, opacity: 1, duration: 1.5, ease: "expo.out",
        scrollTrigger: { trigger: h, start: "top 88%" } });
  });

  /* ---------- Editor explodido em camadas 3D ---------- */
  const scene = document.querySelector(".ex-scene");
  if (scene) {
    const layers = gsap.utils.toArray(".ex-layer");
    const tags = gsap.utils.toArray(".ex-tag");
    const small = window.innerWidth < 700;
    gsap.set(scene, { rotationX: 58, rotationZ: -30, scale: 0.78 });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: ".exploded", start: "top top", end: small ? "+=1300" : "+=2400", scrub: 1, pin: true, anticipatePin: 1 },
    });
    tl.to(scene, { rotationX: 50, rotationZ: -24, scale: small ? 0.92 : 0.74, y: small ? 60 : 70, duration: 1, ease: "power2.inOut" }, 0)
      .to(layers, { z: (i, el) => Number(el.dataset.z) * (small ? 0.35 : 1), duration: 1.1, ease: "power3.inOut", stagger: 0.04 }, 0)
      .to(tags, { opacity: 1, duration: 0.35, stagger: 0.05 }, 0.7)
      .to(scene, { rotationZ: -12, rotationX: 46, duration: 0.8, ease: "sine.inOut" })
      .to(tags, { opacity: 0, duration: 0.3 })
      .to(layers, { z: 0, duration: 1, ease: "power3.inOut" }, "<")
      .to(scene, { rotationX: 0, rotationZ: 0, scale: 1, y: 0, duration: 1.1, ease: "power3.inOut" }, "<0.2");
  }

  /* ---------- Cards de números voam em 3D ---------- */
  const statRot = window.innerWidth > 900 ? -14 : 0;
  gsap.fromTo(".stat",
    { y: 220, rotationY: -60, rotationX: 35, rotation: statRot - 20, opacity: 0, transformPerspective: 900 },
    { y: 0, rotationY: 0, rotationX: 0, rotation: statRot, opacity: 1, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: ".stats__cards", start: "top 95%", end: "top 35%", scrub: 1 } });

  /* ---------- Marquee inclina com a velocidade ---------- */
  const viewport = document.querySelector(".marquee__viewport");
  if (viewport) {
    const setSkew = gsap.quickTo(viewport, "--skew", { duration: 0.4, ease: "power3" });
    ScrollTrigger.create({
      onUpdate: (self) => setSkew(gsap.utils.clamp(-14, 14, self.getVelocity() / -220)),
    });
  }

  /* ---------- Bento: entrada escalonada em 3D ---------- */
  gsap.utils.toArray(".bento .tilt, .pillars .tilt, .principles .tilt").forEach((el) => {
    // Sem transição CSS durante a entrada, e valores finais explícitos:
    // assim o card nunca fica preso invisível.
    el.style.transition = "none";
    el.classList.remove("reveal");
    gsap.fromTo(el,
      { opacity: 0, y: 120, rotationX: 25, scale: 0.92, filter: "blur(0px)", transformPerspective: 1200 },
      { opacity: 1, y: 0, rotationX: 0, scale: 1, duration: 1.4, ease: "expo.out",
        clearProps: "transform,transition,filter",
        scrollTrigger: { trigger: el, start: "top 92%" } });
  });

  /* ---------- Palavra gigante do rodapé ---------- */
  gsap.from(".footer__word span", {
    yPercent: 115, rotation: 10, stagger: 0.07, duration: 1.5, ease: "expo.out",
    scrollTrigger: { trigger: ".footer__word", start: "top 98%" },
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
