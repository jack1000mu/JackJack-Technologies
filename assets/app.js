// assets/app.js  ✅ REPLACE ALL

(function () {
  // ===== Helpers =====
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => [...el.querySelectorAll(s)];

  // ===== Year =====
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Mobile menu =====
  const navToggle = qs("#navToggle");
  const navMenu = qs("#navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // close menu after clicking a link (mobile)
    qsa("#navMenu a").forEach(a => {
      a.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ===== Services dropdown (works desktop + mobile) =====
  const dropdown = qs("#servicesDropdown");
  const servicesToggle = qs("#servicesToggle");

  function closeDropdown() {
    if (!dropdown || !servicesToggle) return;
    dropdown.classList.remove("is-open");
    servicesToggle.setAttribute("aria-expanded", "false");
  }

  if (dropdown && servicesToggle) {
    servicesToggle.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.toggle("is-open");
      servicesToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // close when clicking outside
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) closeDropdown();
    });

    // close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDropdown();
    });
  }

  // ===== Quote modal =====
  const modal = qs("#quoteModal");
  const form = qs("#quoteForm");
  const serviceSelect = qs("select[name='service']");

  function openModal(serviceName) {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // optional: preselect service
    if (serviceName && serviceSelect) {
      const options = Array.from(serviceSelect.options);
      const match = options.find(o => o.text.trim() === serviceName.trim());
      if (match) serviceSelect.value = match.value;
      else serviceSelect.value = "Other";
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Buttons that open the modal (only the ones that exist will work)
  [
    "openQuote",
    "openQuoteHero",
    "openQuoteCta"
  ]
    .map(id => qs("#" + id))
    .filter(Boolean)
    .forEach(btn => btn.addEventListener("click", () => openModal()));

  // Close modal buttons/backdrop
  qsa("[data-close='true']").forEach(el => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Formspree submit (stay on page)
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const resp = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { "Accept": "application/json" }
        });

        if (resp.ok) {
          alert("Thanks! Your request has been sent. We’ll get back to you shortly.");
          closeModal();
          form.reset();
        } else {
          alert("Sorry, something went wrong. Please try again or WhatsApp us.");
        }
      } catch (err) {
        alert("Network issue. Please try again or WhatsApp us.");
      }
    });
  }

  // ===== Slider (auto + arrows + dots) =====
  const slidesWrap = qs("#slides");
  const slider = qs("#slider");
  const prevBtn = qs("#prevBtn");
  const nextBtn = qs("#nextBtn");
  const dotsWrap = qs("#dots");

  if (!slidesWrap || !slider || !dotsWrap) return;

  let index = 0;
  let intervalId;

  const total = () => slidesWrap.children.length;

  function renderDots() {
    dotsWrap.innerHTML = "";
    for (let i = 0; i < total(); i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dotBtn" + (i === index ? " is-active" : "");
      b.setAttribute("aria-label", `Go to slide ${i + 1}`);
      b.addEventListener("click", () => {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(b);
    }
  }

  function goTo(i) {
    const n = total();
    index = (i + n) % n;
    slidesWrap.style.transform = `translateX(-${index * 100}%)`;
    renderDots();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function start() { intervalId = setInterval(next, 4500); }
  function stop() { clearInterval(intervalId); }
  function restart() { stop(); start(); }

  if (nextBtn) nextBtn.addEventListener("click", () => { next(); restart(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { prev(); restart(); });

  // pause on hover (desktop)
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  renderDots();
  goTo(0);
  start();
})();
