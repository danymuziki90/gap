(() => {
  const root = document.documentElement;
  const body = document.body;
  const themeStorageKey = "gap-theme";
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const themeToggle = document.querySelector("[data-theme-toggle]");

  root.classList.add("has-js");

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);

    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );

      const icon = themeToggle.querySelector("i");
      if (icon) {
        icon.className = theme === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
      }
    }
  };

  const getInitialTheme = () => {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const toggleNavigation = () => {
    const isOpen = body.classList.toggle("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", String(isOpen));
      const icon = navToggle.querySelector("i");
      if (icon) {
        icon.className = isOpen ? "bi bi-x-lg" : "bi bi-list";
      }
    }
  };

  const closeNavigation = () => {
    body.classList.remove("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      const icon = navToggle.querySelector("i");
      if (icon) {
        icon.className = "bi bi-list";
      }
    }
  };

  const setCurrentNav = () => {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav] a").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }

      const isCurrent =
        (currentPath === "" || currentPath === "index.html")
          ? href === "index.html"
          : href === currentPath;

      link.classList.toggle("is-current", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const initReveal = () => {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    items.forEach((item) => observer.observe(item));
  };

  const animateCounter = (element) => {
    const target = Number(element.dataset.counter || "0");
    const suffix = element.dataset.counterSuffix || "";
    const duration = 1200;
    const start = performance.now();

    const update = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      element.textContent = `${value.toLocaleString()}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  const initCounters = () => {
    const counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) {
      return;
    }

    const seen = new WeakSet();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !seen.has(entry.target)) {
            seen.add(entry.target);
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.45,
      }
    );

    counters.forEach((counter) => {
      const suffix = counter.dataset.counterSuffix || "";
      counter.textContent = `0${suffix}`;
      observer.observe(counter);
    });
  };

  const initAccordions = () => {
    document.querySelectorAll("[data-accordion]").forEach((accordion) => {
      accordion.querySelectorAll("[data-accordion-button]").forEach((button) => {
        button.addEventListener("click", () => {
          const item = button.closest(".accordion-item");
          if (!item) {
            return;
          }

          const isOpen = item.classList.contains("is-open");
          accordion.querySelectorAll(".accordion-item").forEach((entry) => {
            entry.classList.remove("is-open");
            const entryButton = entry.querySelector("[data-accordion-button]");
            if (entryButton) {
              entryButton.setAttribute("aria-expanded", "false");
            }
          });

          if (!isOpen) {
            item.classList.add("is-open");
            button.setAttribute("aria-expanded", "true");
          }
        });
      });
    });
  };

  const initTabs = () => {
    document.querySelectorAll("[data-tabs]").forEach((tabs) => {
      const buttons = tabs.querySelectorAll("[data-tab-target]");
      const panels = tabs.querySelectorAll("[data-tab-panel]");

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const target = button.dataset.tabTarget;

          buttons.forEach((item) => item.setAttribute("aria-selected", "false"));
          panels.forEach((panel) => {
            panel.hidden = panel.id !== target;
          });

          button.setAttribute("aria-selected", "true");
        });
      });
    });
  };

  const initContactForm = () => {
    const form = document.querySelector("[data-contact-form]");
    if (!form) {
      return;
    }

    const notice = form.querySelector("[data-form-notice]");
    const submitButton = form.querySelector("[data-form-submit]");

    const setNotice = (type, message) => {
      if (!notice) {
        return;
      }

      notice.className = "status-message is-visible";
      notice.classList.add(type === "success" ? "is-success" : "is-error");
      notice.textContent = message;
    };

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("sent") === "1") {
      setNotice("success", "Thank you. Your message has been sent and the GAP team will follow up soon.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        setNotice("error", "Please complete all required fields before sending your message.");
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      if (window.location.protocol === "file:") {
        form.reset();
        setNotice(
          "success",
          "Your form is validated. Deploy the site to Netlify or a web server to enable live form delivery."
        );

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Send Message";
        }

        return;
      }

      const payload = new URLSearchParams(new FormData(form)).toString();

      try {
        const response = await fetch("/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: payload,
        });

        if (!response.ok) {
          throw new Error("Submission failed");
        }

        form.reset();
        setNotice("success", "Thank you. Your message has been sent and the GAP team will follow up soon.");
      } catch (error) {
        setNotice(
          "error",
          "We could not send the form right now. Please try again later or email info@grandafricanproject.org directly."
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Send Message";
        }
      }
    });
  };

  const setYear = () => {
    document.querySelectorAll("[data-year]").forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });
  };

  setTheme(getInitialTheme());
  setCurrentNav();
  setYear();
  initReveal();
  initCounters();
  initAccordions();
  initTabs();
  initContactForm();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      setTheme(root.dataset.theme === "dark" ? "light" : "dark");
    });
  }

  if (navToggle) {
    navToggle.addEventListener("click", toggleNavigation);
  }

  if (nav) {
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNavigation);
    });
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeNavigation();
    }
  });
})();


// ============================================================
// GAP REGISTRATION FORM — join.html
// ============================================================
const initRegistrationForm = () => {
  const form = document.querySelector("[data-registration-form]");
  if (!form) return;

  const notice = form.querySelector("[data-form-notice]");
  const submitButton = form.querySelector("[data-form-submit]");
  const stationSection = document.getElementById("station-info-section");
  const engagementRadios = form.querySelectorAll('input[name="engagement_type"]');

  // Show/hide station info section based on engagement type
  const toggleStationSection = () => {
    const selected = form.querySelector('input[name="engagement_type"]:checked');
    if (!stationSection) return;
    const showStation = selected && (
      selected.value === "station-founder" || selected.value === "station-member"
    );
    stationSection.classList.toggle("is-visible", !!showStation);
  };

  engagementRadios.forEach((radio) => {
    radio.addEventListener("change", toggleStationSection);
  });

  // Pre-select from anchor hash (e.g. join.html#station-founder)
  const applyHashSelection = () => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const map = {
      "station-founder": "station-founder",
      "station-member": "station-member",
      "book-club": "book-club",
      "university-coordinator": "university-coordinator",
    };
    if (map[hash]) {
      const radio = form.querySelector(`input[name="engagement_type"][value="${map[hash]}"]`);
      if (radio) {
        radio.checked = true;
        toggleStationSection();
        setTimeout(() => {
          const formEl = document.getElementById("registration-form");
          if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    }
  };

  applyHashSelection();
  window.addEventListener("hashchange", applyHashSelection);

  // Inline anchor buttons on join page (onclick handlers set select value — sync radios)
  document.querySelectorAll('[onclick*="engagement-type"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      setTimeout(() => {
        const sel = document.getElementById("engagement-type");
        if (!sel) return;
        const radio = form.querySelector(`input[name="engagement_type"][value="${sel.value}"]`);
        if (radio) { radio.checked = true; toggleStationSection(); }
      }, 50);
    });
  });

  const setNotice = (type, message) => {
    if (!notice) return;
    notice.className = "status-message is-visible";
    notice.classList.add(type === "success" ? "is-success" : "is-error");
    notice.textContent = message;
    notice.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  // Success on redirect
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("registered") === "1") {
    setNotice("success", "Thank you for registering with GAP. The team will review your application and follow up within 5 business days.");
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Client-side validation helpers
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isValidPhone = (v) => v.replace(/[\s\-+()\d]/g, "").length === 0 && v.trim().length >= 7;
  const minAge = 14;
  const isValidAge = (dateStr) => {
    if (!dateStr) return false;
    const dob = new Date(dateStr);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear() -
      (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
    return age >= minAge && age <= 100;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Manual validation
    const name = form.querySelector("#reg-name")?.value.trim();
    const email = form.querySelector("#reg-email")?.value.trim();
    const phone = form.querySelector("#reg-phone")?.value.trim();
    const dob = form.querySelector("#reg-dob")?.value;
    const country = form.querySelector("#reg-country")?.value.trim();
    const city = form.querySelector("#reg-city")?.value.trim();
    const region = form.querySelector("#reg-region")?.value.trim();
    const continent = form.querySelector("#reg-continent")?.value;
    const engagementType = form.querySelector('input[name="engagement_type"]:checked');
    const why = form.querySelector("#reg-why")?.value.trim();
    const experience = form.querySelector("#reg-experience")?.value.trim();
    const impact = form.querySelector("#reg-impact")?.value.trim();
    const terms = form.querySelector("#reg-terms")?.checked;

    if (!name || name.length < 2) {
      setNotice("error", "Please enter your full name."); return;
    }
    if (!isValidEmail(email)) {
      setNotice("error", "Please enter a valid email address."); return;
    }
    if (!isValidPhone(phone)) {
      setNotice("error", "Please enter a valid phone/WhatsApp number."); return;
    }
    if (!isValidAge(dob)) {
      setNotice("error", `Please enter a valid date of birth. Minimum age is ${minAge} years.`); return;
    }
    if (!continent) {
      setNotice("error", "Please select your continent."); return;
    }
    if (!country || country.length < 2) {
      setNotice("error", "Please enter your country."); return;
    }
    if (!region || region.length < 2) {
      setNotice("error", "Please enter your region / province / state."); return;
    }
    if (!city || city.length < 2) {
      setNotice("error", "Please enter your city."); return;
    }
    if (!engagementType) {
      setNotice("error", "Please select your type of engagement with GAP."); return;
    }
    if (!why || why.length < 50) {
      setNotice("error", "Please tell us why you want to join GAP (minimum 50 characters)."); return;
    }
    if (!experience || experience.length < 30) {
      setNotice("error", "Please describe your leadership or community experience (minimum 30 characters)."); return;
    }
    if (!impact || impact.length < 30) {
      setNotice("error", "Please describe the impact you want to create (minimum 30 characters)."); return;
    }
    if (!terms) {
      setNotice("error", "You must agree to the Terms & Conditions to register with GAP."); return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = 'Submitting... <i class="bi bi-hourglass-split"></i>';
    }

    if (window.location.protocol === "file:") {
      form.reset();
      toggleStationSection();
      setNotice("success", "Your registration is validated. Deploy the site to enable live form submission.");
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Register with GAP <i class="bi bi-arrow-up-right"></i>';
      }
      return;
    }

    const payload = new URLSearchParams(new FormData(form)).toString();
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload,
      });
      if (!response.ok) throw new Error("Submission failed");
      form.reset();
      toggleStationSection();
      setNotice("success", "Thank you for registering with Grand African Projects! The team will review your application and reach out within 5 business days.");
    } catch {
      setNotice("error", "We could not submit your registration right now. Please try again or email info@grandafricanproject.org directly.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Register with GAP <i class="bi bi-arrow-up-right"></i>';
      }
    }
  });
};

// ============================================================
// SMOOTH SCROLL for in-page anchors with offset
// ============================================================
const initSmoothAnchors = () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href").slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = 110;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  });
};

// ============================================================
// GALLERY LIGHTBOX (simple keyboard-accessible overlay)
// ============================================================
const initGalleryLightbox = () => {
  const items = document.querySelectorAll(".gallery-item");
  if (!items.length) return;

  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Image lightbox");
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close lightbox"><i class="bi bi-x-lg"></i></button>
    <img class="lightbox-img" src="" alt="">
    <div class="lightbox-caption"></div>
  `;
  document.body.appendChild(overlay);

  const img = overlay.querySelector(".lightbox-img");
  const caption = overlay.querySelector(".lightbox-caption");
  const closeBtn = overlay.querySelector(".lightbox-close");

  const open = (src, alt) => {
    img.src = src;
    img.alt = alt;
    caption.textContent = alt;
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };
  const close = () => {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    img.src = "";
  };

  items.forEach((item) => {
    const image = item.querySelector("img");
    if (!image) return;
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `View image: ${image.alt}`);
    item.addEventListener("click", () => open(image.src, image.alt));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(image.src, image.alt); }
    });
  });

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && overlay.classList.contains("is-open")) close(); });
};

// ============================================================
// ACTIVE NAV — extend for new pages
// ============================================================
const extendCurrentNav = () => {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const newPages = ["special-focus.html", "structure.html", "join.html", "bookclub.html"];
  document.querySelectorAll("[data-nav] a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    const isCurrent = href === currentPath || (currentPath === "" && href === "index.html");
    if (isCurrent) {
      link.classList.add("is-current");
      link.setAttribute("aria-current", "page");
    }
  });
};

// ============================================================
// INIT NEW MODULES
// ============================================================
initRegistrationForm();
initSmoothAnchors();
initGalleryLightbox();
extendCurrentNav();
