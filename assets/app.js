(function () {
  // Year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------------- MOBILE MENU ----------------
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

    // close menu when clicking a link (mobile)
    navMenu.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a && navMenu.classList.contains("is-open")) closeNav();
    });
  }

  // ---------------- SERVICES DROPDOWN (ROBUST) ----------------
  const servicesDropdown = document.getElementById("servicesDropdown");
  const servicesToggle = document.getElementById("servicesToggle");

  function closeServices() {
    if (!servicesDropdown || !servicesToggle) return;
    servicesDropdown.classList.remove("is-open");
    servicesToggle.setAttribute("aria-expanded", "false");
  }

  function toggleServices() {
    if (!servicesDropdown || !servicesToggle) return;
    const open = servicesDropdown.classList.toggle("is-open");
    servicesToggle.setAttribute("aria-expanded", String(open));
  }

  if (servicesDropdown && servicesToggle) {
    servicesToggle.addEventListener("click", (e) => {
      e.preventDefault();
      toggleServices();
    });

    // close if click outside
    document.addEventListener("click", (e) => {
      const inside = servicesDropdown.contains(e.target);
      if (!inside) closeServices();
    });

    // close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeServices();
    });
  }

  // ---------------- QUOTE MODAL ----------------
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

  // Buttons that open quote modal
  [
    "openQuote", "openQuoteTop", "openQuoteHero", "openQuoteCard",
    "openQuoteCta", "openQuoteContact", "openQuoteSlider"
  ]
    .map(id => document.getElementById(id))
    .filter(Boolean)
    .forEach(btn => btn.addEventListener("click", () => openModal()));

  // Any element with data-open-quote
  document.querySelectorAll("[data-open-quote]").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-open-quote")));
  });

  // Close modal elements
  document.querySelectorAll("[data-close='true']").forEach(el => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Formspree submit via fetch
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
      } catch (err) {
        alert("Network issue. Please try again or use WhatsApp.");
      }
    });
  }

  // ---------------- SLIDER ----------------
  const sliderImgs = Array.from(document.querySelectorAll(".slider__img"));
  const prevBtn = document.getElementById("slidePrev");
  const nextBtn = document.getElementById("slideNext");
  const dotsWrap = document.getElementById("sliderDots");

  let idx = 0;
  let timer = null;

  function renderSlider() {
    if (!sliderImgs.length) return;
    sliderImgs.forEach((img, i) => img.classList.toggle("is-active", i === idx));

    if (dotsWrap) {
      Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle("is-active", i === idx));
    }
  }

  function go(n) {
    if (!sliderImgs.length) return;
    idx = (n + sliderImgs.length) % sliderImgs.length;
    renderSlider();
  }

  function startAuto() {
    if (!sliderImgs.length) return;
    stopAuto();
    timer = setInterval(() => go(idx + 1), 4500);
  }
  function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  if (dotsWrap && sliderImgs.length) {
    dotsWrap.innerHTML = "";
    sliderImgs.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "slider__dot" + (i === 0 ? " is-active" : "");
      b.addEventListener("click", () => {
        go(i);
        startAuto();
      });
      dotsWrap.appendChild(b);
    });
  }

  if (prevBtn) prevBtn.addEventListener("click", () => { go(idx - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { go(idx + 1); startAuto(); });

  renderSlider();
  startAuto();

  // ---------------- TESTIMONIALS (LOCAL DEVICE) ----------------
  const reviewForm = document.getElementById("reviewForm");
  const reviewsList = document.getElementById("reviewsList");
  const revName = document.getElementById("revName");
  const revText = document.getElementById("revText");
  const revRating = document.getElementById("revRating");
  const clearBtn = document.getElementById("clearReviews");
  const starPicker = document.getElementById("starPicker");
  const starsHint = document.getElementById("starsHint");

  const STORAGE_KEY = "jjtech_reviews_v1";

  function loadReviews() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveReviews(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function formatStars(n) {
    return "★".repeat(n) + "☆".repeat(5 - n);
  }

  function renderReviews() {
    if (!reviewsList) return;
    const list = loadReviews();

    if (!list.length) {
      reviewsList.innerHTML = `<p class="muted">No reviews yet — be the first.</p>`;
      return;
    }

    reviewsList.innerHTML = list
      .slice()
      .reverse()
      .map(r => {
        return `
          <div class="reviewItem">
            <div class="reviewTop">
              <div class="reviewName">${escapeHtml(r.name)} <span class="muted">(${formatStars(r.rating)})</span></div>
              <div class="reviewDate">${new Date(r.date).toLocaleDateString()}</div>
            </div>
            <div class="reviewText">${escapeHtml(r.text)}</div>
          </div>
        `;
      })
      .join("");
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setStars(n) {
    if (!starPicker || !revRating) return;
    revRating.value = String(n);
    const stars = starPicker.querySelectorAll(".star");
    stars.forEach(btn => {
      const v = Number(btn.dataset.star || 0);
      btn.classList.toggle("is-on", v <= n);
    });
    if (starsHint) starsHint.textContent = n ? `You rated ${n}/5` : "Select a rating";
  }

  if (starPicker) {
    starPicker.querySelectorAll(".star").forEach(btn => {
      btn.addEventListener("click", () => {
        setStars(Number(btn.dataset.star || 0));
      });
    });
  }

  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (revName?.value || "").trim();
      const text = (revText?.value || "").trim();
      const rating = Number(revRating?.value || 0);

      if (!name || !text || rating < 1) {
        alert("Please enter your name, select a star rating, and write a review.");
        return;
      }

      const list = loadReviews();
      list.push({ name, text, rating, date: new Date().toISOString() });
      saveReviews(list);

      reviewForm.reset();
      setStars(0);
      renderReviews();
      alert("Thank you! Your review has been saved on this device.");
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      renderReviews();
    });
  }

  renderReviews();
  setStars(0);
    // ---------------- BACK TO TOP ----------------
  const backTop = document.getElementById("backTop");

  function toggleBackTop() {
    if (!backTop) return;
    const show = window.scrollY > 450;
    backTop.classList.toggle("is-show", show);
  }

  if (backTop) {
    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", toggleBackTop, { passive: true });
    toggleBackTop();
  }

})();
