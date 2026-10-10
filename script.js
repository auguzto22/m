(() => {
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
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal").forEach((el) => {
    const siblings = el.parentElement.querySelectorAll(":scope > .reveal");
    const idx = Array.prototype.indexOf.call(siblings, el);
    el.style.transitionDelay = `${Math.min(idx, 5) * 80}ms`;
    observer.observe(el);
  });
})();
