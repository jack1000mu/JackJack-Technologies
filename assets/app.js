(function () {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------------- MOBILE NAV ----------------
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  function closeNav() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // ---------------- SERVICES DROPDOWN ----------------
  const servicesToggle = document.getElementById("servicesToggle");
  const servicesMenu = document.getElementById("servicesMenu");

  function closeServices() {
    if (!servicesToggle || !servicesMenu) return;
    servicesMenu.classList.remove("is-open");
    servicesToggle.setAttribute("aria-expanded", "false");
  }

  function toggleServices() {
    if (!servicesToggle || !servicesMenu) return;
    const willOpen = !servicesMenu.classList.contains("is-open");
    servicesMenu.classList.toggle("is-open", willOpen);
    servicesToggle.setAttribute("aria-expanded", String(willOpen));
  }

  if (servicesToggle && servicesMenu) {
    servicesToggle.addEventListener("click", (e) => {
      e.preventDefault();
      toggleServices();
    });

    document.addEventListener("click", (e) => {
      const drop = servicesToggle.closest(".dropdown");
      if (drop && !drop.contains(e.target)) closeServices();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeServices();
    });
  }

  // Close nav when clicking a link (mobile)
  document.querySelectorAll(".nav__menu a").forEach(a => {
    a.addEventListener("click", () => {
      closeServices();
      closeNav();
    });
  });

  // ---------------- SLIDER ----------------
  const slides = Array.from(document.querySelectorAll(".slider__img"));
  const prevBtn = document.getElementById("slidePrev");
  const nextBtn = document.getElementById("slideNext");
  const dotsWrap = document.getElementById("sliderDots");

  let idx = 0;
  let timer = null;

  function renderDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "slider__dot" + (i === idx ? " is-active" : "");
      b.setAttribute("aria-label", `Go to slide ${i + 1}`);
      b.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(b);
    });
  }

  function show(i) {
    slides.forEach((s, k) => s.classList.toggle("is-active", k === i));
    idx = i;
    renderDots();
  }

  function goTo(i) {
    if (!slides.length) return;
    show((i + slides.length) % slides.length);
    restartAuto();
  }

  function next() { goTo(idx + 1); }
  function prev() { goTo(idx - 1); }

  function restartAuto() {
    if (!slides.length) return;
    if (timer) clearInterval(timer);
    timer = setInterval(next, 4000);
  }

  if (slides.length) {
    show(0);
    restartAuto();
    if (nextBtn) nextBtn.addEventListener("click", next);
    if (prevBtn) prevBtn.addEventListener("click", prev);
  }

  // ---------------- QUOTE MODAL (Formspree) ----------------
  const modal = document.getElementById("quoteModal");
  const form = document.getElementById("quoteForm");
  const serviceSelect = document.getElementById("serviceSelect");

  function openModal(serviceName) {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (serviceName && serviceSelect) {
      const options = Array.from(serviceSelect.options);
      const match = options.find(o => o.text.trim() === serviceName.trim());
      serviceSelect.value = match ? match.value : "Other";
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  [
    "openQuote","openQuoteHero","openQuoteCard","openQuoteCta","openQuoteContact",
    "openQuoteProjects","openQuoteTraining","openQuoteData","openQuoteSlider"
  ]
    .map(id => document.getElementById(id))
    .filter(Boolean)
    .forEach(btn => btn.addEventListener("click", () => openModal()));

  document.querySelectorAll("[data-close='true']").forEach(el => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

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
          alert("Thanks! Your quote request has been sent. We’ll get back to you shortly.");
          closeModal();
          form.reset();
        } else {
          alert("Sorry, something went wrong. Please try again or use WhatsApp.");
        }
      } catch {
        alert("Network issue. Please try again or use WhatsApp.");
      }
    });
  }

  // ---------------- TESTIMONIALS (localStorage) ----------------
  const reviewForm = document.getElementById("reviewForm");
  const reviewsList = document.getElementById("reviewsList");
  const clearBtn = document.getElementById("clearReviews");
  const STORAGE_KEY = "jjt_reviews_v1";

  function loadReviews() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  }

  function saveReviews(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function starString(n) {
    n = Number(n) || 0;
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  }

  function escapeHtml(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderReviews() {
    if (!reviewsList) return;
    const items = loadReviews();
    if (!items.length) {
      reviewsList.innerHTML = `<p class="muted">No reviews yet. Be the first to leave one 🙂</p>`;
      return;
    }

    reviewsList.innerHTML = items
      .slice().reverse()
      .map(r => `
        <div class="review">
          <div class="review__top">
            <div class="review__name">${escapeHtml(r.name)}</div>
            <div class="review__stars" aria-label="${r.rating} stars">${starString(r.rating)}</div>
          </div>
          <div class="review__text">${escapeHtml(r.text)}</div>
          <div class="review__date">${new Date(r.date).toLocaleString()}</div>
        </div>
      `).join("");
  }

  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("reviewName").value.trim();
      const text = document.getElementById("reviewText").value.trim();
      const ratingEl = reviewForm.querySelector("input[name='rating']:checked");
      const rating = ratingEl ? ratingEl.value : "";

      if (!name || !text || !rating) {
        alert("Please enter your name, rating, and review.");
        return;
      }

      const items = loadReviews();
      items.push({ name, text, rating: Number(rating), date: new Date().toISOString() });
      saveReviews(items);
      reviewForm.reset();
      renderReviews();
      alert("Thank you! Your review was added.");
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Clear all reviews on this device?")) {
        localStorage.removeItem(STORAGE_KEY);
        renderReviews();
      }
    });
  }

  renderReviews();
})();

/* ---------------- SLIDER SCRIPT ---------------- */

(function(){
  const slides = document.querySelectorAll(".slider__img");
  const dotsBox = document.getElementById("sliderDots");
  const prevBtn = document.getElementById("slidePrev");
  const nextBtn = document.getElementById("slideNext");

  if(!slides.length) return;

  let index = 0;
  let timer;

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "slider__dot" + (i === 0 ? " is-active" : "");
    dot.addEventListener("click", () => showSlide(i));
    dotsBox.appendChild(dot);
  });

  const dots = dotsBox.querySelectorAll(".slider__dot");

  function showSlide(i){
    slides[index].classList.remove("is-active");
    dots[index].classList.remove("is-active");

    index = i;

    slides[index].classList.add("is-active");
    dots[index].classList.add("is-active");
  }

  function nextSlide(){
    showSlide((index + 1) % slides.length);
  }

  function prevSlide(){
    showSlide((index - 1 + slides.length) % slides.length);
  }

  nextBtn.addEventListener("click", () => {
    nextSlide();
    restart();
  });

  prevBtn.addEventListener("click", () => {
    prevSlide();
    restart();
  });

  function start(){
    timer = setInterval(nextSlide, 5000); // 5 seconds
  }

  function restart(){
    clearInterval(timer);
    start();
  }

  start();
})();
