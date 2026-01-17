(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Dropdown services (index page)
  const servicesToggle = document.getElementById("servicesToggle");
  const dropdownMenu = servicesToggle ? servicesToggle.parentElement.querySelector(".dropdown__menu") : null;

  function closeDropdown() {
    if (!servicesToggle || !dropdownMenu) return;
    dropdownMenu.style.display = "none";
    servicesToggle.setAttribute("aria-expanded", "false");
  }

  function toggleDropdown() {
    if (!servicesToggle || !dropdownMenu) return;
    const isOpen = dropdownMenu.style.display === "block";
    dropdownMenu.style.display = isOpen ? "none" : "block";
    servicesToggle.setAttribute("aria-expanded", String(!isOpen));
  }

  if (servicesToggle && dropdownMenu) {
    servicesToggle.addEventListener("click", (e) => {
      e.preventDefault();
      toggleDropdown();
    });

    document.addEventListener("click", (e) => {
      const clickedInside = servicesToggle.parentElement.contains(e.target);
      if (!clickedInside) closeDropdown();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDropdown();
    });
  }

  // Quote modal
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

  // Buttons that open quote
  ["openQuote", "openQuoteTop", "openQuoteHero", "openQuoteCard", "openQuoteCta", "openQuoteContact"]
    .map(id => document.getElementById(id))
    .filter(Boolean)
    .forEach(btn => btn.addEventListener("click", () => openModal()));

  // Service cards "Get Started"
  document.querySelectorAll("[data-open-quote]").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-open-quote")));
  });

  // Close modal
  document.querySelectorAll("[data-close='true']").forEach(el => {
    el.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Real submit handler (Formspree) - stays on same page
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
})();
