(function () {
  const THEME_KEY = "theme";
  const LANG_KEY = "site-lang";
  let readyMarked = false;

  document.documentElement.setAttribute("data-site-loading", "false");
  document.documentElement.setAttribute("data-site-ready", "true");

  function markReady() {
    if (readyMarked) {
      return;
    }
    readyMarked = true;
    document.documentElement.setAttribute("data-site-loading", "false");
    document.documentElement.setAttribute("data-site-ready", "true");
  }

  function detectLanguage() {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "zh" || saved === "en") {
      return saved;
    }
    return "en";
  }

  function detectTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function applyLanguage(lang) {
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
    document.documentElement.setAttribute("data-lang", lang);

    document.querySelectorAll("[data-lang]").forEach((element) => {
      element.hidden = element.getAttribute("data-lang") !== lang;
    });

    document.querySelectorAll("[data-placeholder-zh][data-placeholder-en]").forEach((element) => {
      element.placeholder = element.getAttribute(lang === "zh" ? "data-placeholder-zh" : "data-placeholder-en");
    });

    document.querySelectorAll("[data-title-zh][data-title-en]").forEach((element) => {
      element.title = element.getAttribute(lang === "zh" ? "data-title-zh" : "data-title-en");
    });

    document.querySelectorAll("[data-aria-label-zh][data-aria-label-en]").forEach((element) => {
      element.setAttribute("aria-label", element.getAttribute(lang === "zh" ? "data-aria-label-zh" : "data-aria-label-en"));
    });

    document.querySelectorAll("[data-lang-toggle]").forEach((element) => {
      element.textContent = lang === "zh" ? "EN" : "ZH";
      element.title = lang === "zh" ? "Switch to English" : "Switch to Chinese";
      element.setAttribute("aria-label", element.title);
    });

    document.dispatchEvent(new CustomEvent("site:language-change", { detail: { lang } }));
  }

  function setLanguage(lang) {
    localStorage.setItem(LANG_KEY, lang);
    applyLanguage(lang);
  }

  function setTheme(theme, themeIcon) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    if (themeIcon) {
      themeIcon.className = theme === "light" ? "fas fa-moon" : "fas fa-sun";
    }
  }

  function syncYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  function initVisitorStats() {
    const containers = document.querySelectorAll("[data-visitor-map]");
    if (!containers.length) {
      return;
    }

    const mapUrl = "https://clustrmaps.com/map_v2.png?d=GtDZVi4tsLCxCMPsshi4UGUmYEeEN1BC-yvrYvb1Rt4&cl=ffffff&w=250&h=150";

    containers.forEach((container) => {
      if (container.dataset.loaded === "true") {
        return;
      }
      container.dataset.loaded = "true";
      container.textContent = "";

      const link = document.createElement("a");
      link.className = "visitor-map-link";
      link.href = "https://clustrmaps.com/";
      link.target = "_blank";
      link.rel = "noopener";
      link.setAttribute("aria-label", "Open visitor statistics");
      link.style.display = "block";
      link.style.lineHeight = "0";

      const image = document.createElement("img");
      image.className = "visitor-map-image";
      image.src = mapUrl;
      image.width = 250;
      image.height = 150;
      image.loading = "lazy";
      image.alt = "Visitor map";
      image.style.display = "block";
      image.style.height = "auto";
      image.style.maxWidth = "100%";

      image.addEventListener("error", () => {
        container.innerHTML = '<div class="visitor-stats-status">Visitor statistics are temporarily unavailable.</div>';
      }, { once: true });

      link.appendChild(image);
      container.appendChild(link);
    });
  }

  function initSharedPageBits() {
    syncYear();
    initVisitorStats();
  }

  function init(options) {
    const settings = options || {};
    const titles = settings.titles || {};
    const themeBtn = document.getElementById("theme-btn");
    const themeIcon = themeBtn ? themeBtn.querySelector("i") : null;
    const langBtn = document.getElementById("lang-btn");

    const initialTheme = detectTheme();
    const initialLang = detectLanguage();

    setTheme(initialTheme, themeIcon);
    applyLanguage(initialLang);

    if (titles.zh && titles.en) {
      const syncTitle = () => {
        const lang = document.documentElement.getAttribute("data-lang") || initialLang;
        document.title = `${lang === "zh" ? titles.zh : titles.en} | Can Zheng`;
      };
      syncTitle();
      document.addEventListener("site:language-change", syncTitle);
    }

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const currentTheme = localStorage.getItem(THEME_KEY) || initialTheme;
        setTheme(currentTheme === "light" ? "dark" : "light", themeIcon);
      });
    }

    if (langBtn) {
      langBtn.addEventListener("click", () => {
        const currentLang = document.documentElement.getAttribute("data-lang") || initialLang;
        setLanguage(currentLang === "zh" ? "en" : "zh");
      });
    }

    markReady();
  }

  initSharedPageBits();

  document.addEventListener("DOMContentLoaded", function () {
    initSharedPageBits();
    window.setTimeout(markReady, 300);
  });

  window.addEventListener("load", function () {
    markReady();
  });

  window.setTimeout(markReady, 1500);

  window.Site = {
    init,
    setLanguage,
    getLanguage: detectLanguage,
    markReady,
  };
}());
