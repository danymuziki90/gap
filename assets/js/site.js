(() => {
  const root = document.documentElement;
  const body = document.body;

  const getL10n = (key, fallback) => {
    const lang = document.documentElement.getAttribute("lang") || "en";
    if (!window.gapTranslations || !window.gapTranslations[lang]) return fallback;
    const parts = key.split(".");
    let val = window.gapTranslations[lang];
    for (const part of parts) {
      if (val && typeof val === "object") {
        val = val[part];
      } else {
        return fallback;
      }
    }
    return typeof val === "string" ? val : fallback;
  };

  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  root.classList.add("has-js");
  // Force light mode — theme switcher supprimé
  root.dataset.theme = "light";

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
      setNotice("success", getL10n("contact.form.success", "Thank you. Your message has been sent and the GAP team will follow up soon."));
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        setNotice("error", getL10n("contact.form.error", "Please complete all required fields before sending your message."));
        return;
      }

      const activeLang = document.documentElement.getAttribute("lang") || "en";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = activeLang === "fr" ? "Envoi..." : "Sending...";
      }

      if (window.location.protocol === "file:") {
        form.reset();
        setNotice(
          "success",
          activeLang === "fr" 
            ? "Votre formulaire est validé. Déployez le site sur un serveur pour activer l'envoi."
            : "Your form is validated. Deploy the site to Netlify or a web server to enable live form delivery."
        );

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = getL10n("contact.form.action", "Send Message");
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
        setNotice("success", getL10n("contact.form.success", "Thank you. Your message has been sent and the GAP team will follow up soon."));
      } catch (error) {
        setNotice(
          "error",
          getL10n("contact.form.error", "We could not send the form right now. Please try again later or email info@grandafricanproject.org directly.")
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = getL10n("contact.form.action", "Send Message");
        }
      }
    });
  };

  const setYear = () => {
    document.querySelectorAll("[data-year]").forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });
  };

  const initVideoPlayers = () => {
    document.querySelectorAll(".video-card-thumb[data-video-id]").forEach((thumb) => {
      const playBtn = thumb.querySelector(".video-play-btn");
      
      const loadVideo = (e) => {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
        const videoId = thumb.dataset.videoId;
        if (!videoId) return;

        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        iframe.title = "YouTube video player";
        iframe.frameBorder = "0";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        
        const container = document.createElement("div");
        container.className = "video-iframe-container";
        container.appendChild(iframe);
        
        thumb.innerHTML = "";
        thumb.appendChild(container);
      };

      if (playBtn) {
        playBtn.addEventListener("click", loadVideo);
      }
      thumb.addEventListener("click", loadVideo);
    });
  };

  const initTranslation = () => {
    const storageKey = "gap-lang";

    const getInitialLanguage = () => {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === "fr" || stored === "en") return stored;
      
      const browserLang = navigator.language || navigator.userLanguage || "en";
      return browserLang.startsWith("fr") ? "fr" : "en";
    };

    const getTranslationValue = (lang, key) => {
      if (!window.gapTranslations || !window.gapTranslations[lang]) return null;
      
      const parts = key.split(".");
      let val = window.gapTranslations[lang];
      for (const part of parts) {
        if (val && typeof val === "object") {
          val = val[part];
        } else {
          return null;
        }
      }
      return typeof val === "string" ? val : null;
    };

    const flattenObject = (obj, prefix = '') => {
      let result = {};
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object') {
          Object.assign(result, flattenObject(value, newKey));
        } else {
          result[newKey] = value;
        }
      }
      return result;
    };

    // Store references to text nodes and elements to translate
    // Each entry: { node, key, originalText }
    const textNodes = [];
    const placeholders = [];
    let scanDone = false;

    const initScanner = () => {
      if (scanDone) return;
      scanDone = true;

      // Create a flat dictionary from both languages to find keys by text value
      const frFlat = window.gapTranslations && window.gapTranslations.fr ? flattenObject(window.gapTranslations.fr) : {};
      const enFlat = window.gapTranslations && window.gapTranslations.en ? flattenObject(window.gapTranslations.en) : {};

      const findKeyByValue = (text) => {
        const cleaned = text.trim().replace(/\s+/g, ' ');
        if (!cleaned) return null;

        for (const [key, val] of Object.entries(frFlat)) {
          if (val && val.trim().replace(/\s+/g, ' ') === cleaned) return key;
        }
        for (const [key, val] of Object.entries(enFlat)) {
          if (val && val.trim().replace(/\s+/g, ' ') === cleaned) return key;
        }
        return null;
      };

      // Walk DOM text nodes — capture ORIGINAL text before any translation
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while ((node = walk.nextNode())) {
        const parent = node.parentElement;
        if (parent && (
          parent.tagName === "SCRIPT" ||
          parent.tagName === "STYLE" ||
          parent.classList.contains("lang-btn") ||
          parent.tagName === "I"
        )) {
          continue;
        }

        // Skip elements inside SVG maps
        if (parent && parent.closest("svg")) {
          continue;
        }

        const text = node.nodeValue.trim();
        if (text) {
          const key = findKeyByValue(text);
          if (key) {
            node._translationKey = key;
            node._originalText = node.nodeValue; // preserve whitespace
            textNodes.push(node);
          }
        }
      }

      // Check placeholders
      document.querySelectorAll("[placeholder]").forEach((elem) => {
        const ph = elem.getAttribute("placeholder").trim();
        const key = findKeyByValue(ph);
        if (key) {
          elem._translationKeyPlaceholder = key;
          elem._originalPlaceholder = elem.getAttribute("placeholder");
          placeholders.push(elem);
        }
      });
    };

    const translateLayout = (lang) => {
      const navLinks = {
        "index.html": { fr: "Accueil", en: "Home" },
        "about.html": { fr: "À propos", en: "About" },
        "programs.html": { fr: "Programmes", en: "Programs" },
        "community.html": { fr: "Communauté", en: "Community" },
        "summit.html": { fr: "Sommet", en: "Summit" },
        "impact.html": { fr: "Impact", en: "Impact" },
        "contact.html": { fr: "Contact", en: "Contact" },
        "join.html": { fr: "Rejoindre GAP", en: "Join GAP" }
      };

      document.querySelectorAll("nav.site-nav a, .footer-links a, .site-footer .footer-column a").forEach((link) => {
        const hrefAttr = link.getAttribute("href");
        if (!hrefAttr) return;

        const href = hrefAttr.split("#")[0].split("/").pop() || "index.html";

        if (navLinks[href]) {
          const icon = link.querySelector("i");
          const text = navLinks[href][lang];
          if (link.classList.contains("button") || link.classList.contains("nav-cta")) {
            link.innerHTML = `${text} ${icon ? icon.outerHTML : ""}`;
          } else {
            if (hrefAttr.includes("#")) {
              const hash = hrefAttr.split("#")[1];
              const hashTranslations = {
                "structure": { fr: "Notre Structure", en: "Our Structure" },
                "special-focus": { fr: "Domaines prioritaires", en: "Priority Areas" },
                "station-founder": { fr: "Créer une Station", en: "Start a Station" },
                "station-member": { fr: "Rejoindre une Station", en: "Join a Station" },
                "book-club": { fr: "Club de Lecture", en: "Book Club" },
                "university-coordinator": { fr: "Chapitre Universitaire", en: "University Chapter" },
                "partner-form": { fr: "Devenir Partenaire", en: "Become a Partner" }
              };
              if (hashTranslations[hash]) {
                link.textContent = hashTranslations[hash][lang];
                return;
              }
            }
            
            if (href === "about.html" && link.textContent.trim().toLowerCase().includes("gap")) {
              link.textContent = lang === "fr" ? "À propos de GAP" : "About GAP";
            } else {
              link.textContent = text;
            }
          }
        }
      });

      const announce = document.querySelector(".announcement .container");
      if (announce) {
        const isImpactPage = body.getAttribute("data-page") === "impact" || document.title.toLowerCase().includes("impact");
        const key = isImpactPage ? "global.announcement.impact" : "global.announcement";
        const translation = getTranslationValue(lang, key);
        const icon = announce.querySelector("i");
        if (translation) {
          announce.innerHTML = `${icon ? icon.outerHTML + " " : ""}${translation}`;
        }
      }

      document.querySelectorAll(".site-header .brand, .site-footer .brand").forEach((brand) => {
        const copy = brand.querySelector(".brand-copy");
        if (copy) {
          if (brand.closest("header")) {
            copy.textContent = lang === "fr" ? "Leadership · Développement · Paix · Innovation" : "Leadership · Development · Peace · Innovation";
          } else {
            const translation = getTranslationValue(lang, "global.footer.brand_copy");
            if (translation) copy.textContent = translation;
          }
        }
      });

      const footerDesc = document.querySelector(".site-footer p.card-copy");
      if (footerDesc) {
        const translation = getTranslationValue(lang, "global.footer.brand_copy");
        if (translation) footerDesc.textContent = translation;
      }

      const footerTitles = document.querySelectorAll(".footer-column .footer-title");
      const titleTranslations = {
        "explorer": { fr: "Explorer", en: "Explore" },
        "explore": { fr: "Explorer", en: "Explore" },
        "s'impliquer": { fr: "S'impliquer", en: "Get Involved" },
        "get involved": { fr: "S'impliquer", en: "Get Involved" },
        "contact": { fr: "Contact", en: "Contact" }
      };
      footerTitles.forEach((title) => {
        const txt = title.textContent.trim().toLowerCase();
        if (titleTranslations[txt]) {
          title.textContent = titleTranslations[txt][lang];
        }
      });

      const footerContactLinks = document.querySelectorAll(".site-footer .footer-column span");
      footerContactLinks.forEach((span) => {
        const txt = span.textContent.trim();
        if (txt.includes("Nord-Kivu") || txt.includes("North Kivu")) {
          span.textContent = lang === "fr" ? "Goma, Nord-Kivu" : "Goma, North Kivu";
        } else if (txt.includes("Démocratique") || txt.includes("Democratic")) {
          span.textContent = lang === "fr" ? "République Démocratique du Congo" : "Democratic Republic of the Congo";
        } else if (txt.includes("Bank of Africa") || txt.includes("BOA")) {
          span.textContent = lang === "fr" ? "Bank of Africa RDC | GAP" : "Bank of Africa DRC | GAP";
        }
      });

      const footerCta = document.querySelector(".site-footer .footer-column a.button");
      if (footerCta) {
        footerCta.textContent = lang === "fr" ? "Démarrer une conversation" : "Start a Conversation";
      }

      const footerBottom = document.querySelector(".footer-bottom");
      if (footerBottom) {
        const spans = footerBottom.querySelectorAll("span");
        if (spans.length >= 2) {
          spans[0].innerHTML = `&copy; <span data-year>${new Date().getFullYear()}</span> ${lang === "fr" ? "Grand African Projects. Tous droits réservés." : "Grand African Projects. All rights reserved."}`;
          spans[1].textContent = lang === "fr" ? "Construit pour servir la prochaine génération de leaders africains." : "Built to serve the next generation of African leaders.";
        }
      }

      const skipLink = document.querySelector(".skip-link");
      if (skipLink) {
        skipLink.textContent = lang === "fr" ? "Aller au contenu" : "Skip to content";
      }

      const scrollTop = document.getElementById("scroll-top");
      if (scrollTop) {
        scrollTop.setAttribute("aria-label", lang === "fr" ? "Retour en haut" : "Back to top");
      }
    };

    const translatePage = (lang) => {
      // 1. Scan ONCE at load time before any text is changed
      initScanner();

      // 2. Translate scanned text nodes using memorized originals
      textNodes.forEach((node) => {
        const key = node._translationKey;
        const translation = getTranslationValue(lang, key);
        if (translation !== null) {
          // Preserve leading/trailing whitespace from original
          const original = node._originalText || node.nodeValue;
          const leading = original.match(/^\s*/)[0];
          const trailing = original.match(/\s*$/)[0];
          node.nodeValue = leading + translation + trailing;
        }
      });

      // 3. Translate placeholders using memorized originals
      placeholders.forEach((elem) => {
        const key = elem._translationKeyPlaceholder;
        const translation = getTranslationValue(lang, key);
        if (translation !== null) {
          elem.setAttribute("placeholder", translation);
        }
      });

      // 4. Translate explicit data-i18n attributes (if any exist)
      document.querySelectorAll("[data-i18n]").forEach((elem) => {
        const key = elem.getAttribute("data-i18n");
        const translation = getTranslationValue(lang, key);
        if (translation !== null) {
          elem.textContent = translation;
        }
      });

      document.querySelectorAll("[data-i18n-html]").forEach((elem) => {
        const key = elem.getAttribute("data-i18n-html");
        const translation = getTranslationValue(lang, key);
        if (translation !== null) {
          elem.innerHTML = translation;
        }
      });

      document.querySelectorAll("[data-i18n-placeholder]").forEach((elem) => {
        const key = elem.getAttribute("data-i18n-placeholder");
        const translation = getTranslationValue(lang, key);
        if (translation !== null) {
          elem.setAttribute("placeholder", translation);
        }
      });

      // 5. Update document title
      const pageKey = body.getAttribute("data-page");
      if (pageKey) {
        const titleKey = `${pageKey}.page_title`;
        const titleTranslation = getTranslationValue(lang, titleKey);
        if (titleTranslation !== null) {
          document.title = titleTranslation;
        }
      }

      // 6. Translate header / footer
      translateLayout(lang);

      // 7. Update html attributes & active selector styles
      root.setAttribute("lang", lang);

      document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
        const btnLang = btn.getAttribute("data-lang-btn");
        btn.classList.toggle("is-active", btnLang === lang);
      });
    };

    const setLanguage = (lang) => {
      window.localStorage.setItem(storageKey, lang);
      
      const transElements = document.querySelectorAll("main, .announcement, .site-footer");
      transElements.forEach((el) => {
        el.classList.add("lang-transition", "lang-fade-out");
      });

      setTimeout(() => {
        translatePage(lang);
        transElements.forEach((el) => {
          el.classList.remove("lang-fade-out");
        });
      }, 150);
    };

    const setupListeners = () => {
      document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const selectedLang = btn.getAttribute("data-lang-btn");
          setLanguage(selectedLang);
        });
      });
    };

    const currentLang = getInitialLanguage();
    translatePage(currentLang);
    setupListeners();
  };

  setCurrentNav();
  setYear();
  initReveal();
  initCounters();
  initAccordions();
  initTabs();
  initContactForm();
  initVideoPlayers();
  initTranslation();

  if (navToggle) {
    navToggle.addEventListener("click", toggleNavigation);
  }

  if (nav) {
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNavigation);
    });
  }

  // Fermer en cliquant sur l'overlay (::before) ou hors du panneau
  document.addEventListener("click", (e) => {
    if (!body.classList.contains("nav-open")) return;
    const isInsideNav = nav && nav.contains(e.target);
    const isToggleBtn = navToggle && navToggle.contains(e.target);
    if (!isInsideNav && !isToggleBtn) {
      closeNavigation();
    }
  });

  // Fermer au resize si écran desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
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
    setNotice("success", getL10n("join.form.success", "Thank you for registering with GAP. The team will review your application and follow up within 5 business days."));
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

    const activeLang = document.documentElement.getAttribute("lang") || "en";

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
      setNotice("error", activeLang === "fr" ? "Veuillez entrer votre nom complet." : "Please enter your full name."); return;
    }
    if (!isValidEmail(email)) {
      setNotice("error", activeLang === "fr" ? "Veuillez entrer une adresse e-mail valide." : "Please enter a valid email address."); return;
    }
    if (!isValidPhone(phone)) {
      setNotice("error", activeLang === "fr" ? "Veuillez entrer un numéro de téléphone/WhatsApp valide." : "Please enter a valid phone/WhatsApp number."); return;
    }
    if (!isValidAge(dob)) {
      setNotice("error", activeLang === "fr" ? `Veuillez entrer une date de naissance valide. L'âge minimum est de ${minAge} ans.` : `Please enter a valid date of birth. Minimum age is ${minAge} years.`); return;
    }
    if (!continent) {
      setNotice("error", activeLang === "fr" ? "Veuillez sélectionner votre continent." : "Please select your continent."); return;
    }
    if (!country || country.length < 2) {
      setNotice("error", activeLang === "fr" ? "Veuillez entrer votre pays." : "Please enter your country."); return;
    }
    if (!region || region.length < 2) {
      setNotice("error", activeLang === "fr" ? "Veuillez entrer votre province / état." : "Please enter your region / province / state."); return;
    }
    if (!city || city.length < 2) {
      setNotice("error", activeLang === "fr" ? "Veuillez entrer votre ville." : "Please enter your city."); return;
    }
    if (!engagementType) {
      setNotice("error", activeLang === "fr" ? "Veuillez sélectionner votre type d'engagement avec GAP." : "Please select your type of engagement with GAP."); return;
    }
    if (!why || why.length < 50) {
      setNotice("error", activeLang === "fr" ? "Veuillez nous dire pourquoi vous souhaitez rejoindre GAP (minimum 50 caractères)." : "Please tell us why you want to join GAP (minimum 50 characters)."); return;
    }
    if (!experience || experience.length < 30) {
      setNotice("error", activeLang === "fr" ? "Veuillez décrire votre expérience (minimum 30 caractères)." : "Please describe your leadership or community experience (minimum 30 characters)."); return;
    }
    if (!impact || impact.length < 30) {
      setNotice("error", activeLang === "fr" ? "Veuillez décrire l'impact que vous souhaitez créer (minimum 30 caractères)." : "Please describe the impact you want to create (minimum 30 characters)."); return;
    }
    if (!terms) {
      setNotice("error", activeLang === "fr" ? "Vous devez accepter les conditions générales pour vous inscrire." : "You must agree to the Terms & Conditions to register with GAP."); return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = (activeLang === "fr" ? 'Envoi...' : 'Submitting...') + ' <i class="bi bi-hourglass-split"></i>';
    }

    if (window.location.protocol === "file:") {
      form.reset();
      toggleStationSection();
      setNotice("success", activeLang === "fr" ? "Votre inscription est validée. Déployez le site pour activer l'envoi." : "Your registration is validated. Deploy the site to enable live form submission.");
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = getL10n("join.form.action", "Register with GAP") + ' <i class="bi bi-arrow-up-right"></i>';
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
      setNotice("success", getL10n("join.form.success", "Thank you for registering with Grand African Projects! The team will review your application and reach out within 5 business days."));
    } catch {
      setNotice("error", getL10n("join.form.error", "We could not submit your registration right now. Please try again or email info@grandafricanproject.org directly."));
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = getL10n("join.form.action", "Register with GAP") + ' <i class="bi bi-arrow-up-right"></i>';
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
