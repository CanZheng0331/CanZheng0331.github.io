(function () {
  const THEME_KEY = "theme";
  const LANG_KEY = "site-lang";
  const CLOUDFLARE_WEB_ANALYTICS_TOKEN = "64e81903e46f467fa5480cafdebd2e35";
  const VISITOR_STATS_ENDPOINT = "https://canzheng-visitor-counter.zhengcan331.workers.dev";
  const VISITOR_STATS_IGNORE_KEY = "visitor-stats-ignore-token";
  const VISITOR_STATS_SINCE = "2026-06-05";
  let readyMarked = false;
  let sharedThemeBound = false;
  let sharedNavigationBound = false;

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

  function syncThemeIcon(theme) {
    const themeBtn = document.getElementById("theme-btn");
    const themeIcon = themeBtn ? themeBtn.querySelector("i") : null;
    if (themeIcon) {
      themeIcon.className = theme === "light" ? "fas fa-moon" : "fas fa-sun";
    }
    if (themeBtn) {
      const label = theme === "light" ? "Switch to dark theme" : "Switch to light theme";
      themeBtn.title = label;
      themeBtn.setAttribute("aria-label", label);
    }
  }

  function setTheme(theme, themeIcon) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    syncThemeIcon(theme);
    if (themeIcon) {
      themeIcon.className = theme === "light" ? "fas fa-moon" : "fas fa-sun";
    }
  }

  function initThemeToggle() {
    const initialTheme = detectTheme();
    applyTheme(initialTheme);
    syncThemeIcon(initialTheme);

    const themeBtn = document.getElementById("theme-btn");
    if (!themeBtn || sharedThemeBound) {
      return;
    }

    sharedThemeBound = true;
    themeBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || detectTheme();
      setTheme(currentTheme === "light" ? "dark" : "light");
    });
  }

  function initNavigation() {
    const menuBtn = document.getElementById("menu-btn");
    const nav = document.getElementById("site-nav");
    if (!menuBtn || !nav || sharedNavigationBound) {
      return;
    }

    sharedNavigationBound = true;
    const closeMenu = () => {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    };

    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a") && window.matchMedia("(max-width: 900px)").matches) {
        closeMenu();
      }
    });

    const dropdowns = Array.from(nav.querySelectorAll(".dropdown"));
    const dropdownTimers = new WeakMap();
    const desktopNavigation = window.matchMedia("(min-width: 901px)");
    let activeDropdown = null;

    const cancelDropdownClose = (dropdown) => {
      const timer = dropdownTimers.get(dropdown);
      if (timer) {
        window.clearTimeout(timer);
        dropdownTimers.delete(dropdown);
      }
    };

    const closeDropdown = (dropdown) => {
      cancelDropdownClose(dropdown);
      dropdown.classList.remove("is-open");
      if (activeDropdown === dropdown) {
        activeDropdown = null;
      }
    };

    const closeOtherDropdowns = (current) => {
      dropdowns.forEach((dropdown) => {
        if (dropdown !== current) {
          closeDropdown(dropdown);
        }
      });
    };

    const openDropdown = (dropdown) => {
      if (!desktopNavigation.matches) {
        return;
      }
      closeOtherDropdowns(dropdown);
      cancelDropdownClose(dropdown);
      dropdown.classList.add("is-open");
      activeDropdown = dropdown;
    };

    const scheduleDropdownClose = (dropdown) => {
      if (!desktopNavigation.matches) {
        closeDropdown(dropdown);
        return;
      }
      cancelDropdownClose(dropdown);
      const timer = window.setTimeout(() => {
        closeDropdown(dropdown);
      }, 220);
      dropdownTimers.set(dropdown, timer);
    };

    dropdowns.forEach((dropdown) => {
      const submenu = dropdown.querySelector(".dropdown-content");
      dropdown.addEventListener("pointerenter", () => openDropdown(dropdown));
      dropdown.addEventListener("pointerleave", () => scheduleDropdownClose(dropdown));
      dropdown.addEventListener("focusin", () => openDropdown(dropdown));
      dropdown.addEventListener("focusout", (event) => {
        if (!dropdown.contains(event.relatedTarget)) {
          scheduleDropdownClose(dropdown);
        }
      });
      if (submenu) {
        submenu.addEventListener("pointerenter", () => openDropdown(dropdown));
        submenu.addEventListener("pointerleave", () => scheduleDropdownClose(dropdown));
      }
    });

    nav.addEventListener("pointerleave", () => {
      if (activeDropdown) {
        scheduleDropdownClose(activeDropdown);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        dropdowns.forEach(closeDropdown);
      }
    });

    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 900px)").matches) {
        closeMenu();
      } else {
        dropdowns.forEach(closeDropdown);
      }
    });
  }

  function syncYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  function initMissingMedia() {
    document.querySelectorAll("img").forEach((image) => {
      const replaceMissingImage = () => {
        if (!image.isConnected || image.dataset.fallbackApplied === "true") {
          return;
        }
        image.dataset.fallbackApplied = "true";
        const placeholder = document.createElement("div");
        placeholder.className = "media-placeholder";
        placeholder.setAttribute("role", "img");
        placeholder.setAttribute("aria-label", image.alt || "Image unavailable");
        placeholder.textContent = image.alt || "Image unavailable";
        image.replaceWith(placeholder);
      };

      image.addEventListener("error", replaceMissingImage, { once: true });
      if (image.complete && image.naturalWidth === 0) {
        replaceMissingImage();
      }
    });
  }

  function initCloudflareAnalytics() {
    if (!CLOUDFLARE_WEB_ANALYTICS_TOKEN || CLOUDFLARE_WEB_ANALYTICS_TOKEN === "REPLACE_WITH_CLOUDFLARE_WEB_ANALYTICS_TOKEN") {
      return;
    }

    if (localStorage.getItem(VISITOR_STATS_IGNORE_KEY)) {
      return;
    }

    if (document.querySelector('script[src="https://static.cloudflareinsights.com/beacon.min.js"]')) {
      return;
    }

    const script = document.createElement("script");
    script.defer = true;
    script.src = "https://static.cloudflareinsights.com/beacon.min.js";
    script.dataset.cfBeacon = JSON.stringify({
      token: CLOUDFLARE_WEB_ANALYTICS_TOKEN,
      spa: false,
    });
    document.head.appendChild(script);
  }

  function formatNumber(value) {
    const number = Number(value || 0);
    return new Intl.NumberFormat("en-US").format(number);
  }

  function countryName(code) {
    const names = {
      AE: "United Arab Emirates",
      AR: "Argentina",
      AT: "Austria",
      BE: "Belgium",
      BR: "Brazil",
      CN: "China",
      HK: "Hong Kong",
      MO: "Macau",
      TW: "Taiwan",
      KR: "South Korea",
      JP: "Japan",
      SG: "Singapore",
      US: "United States",
      CA: "Canada",
      GB: "United Kingdom",
      DE: "Germany",
      FR: "France",
      AU: "Australia",
      IN: "India",
      ID: "Indonesia",
      IT: "Italy",
      MY: "Malaysia",
      NL: "Netherlands",
      NZ: "New Zealand",
      PH: "Philippines",
      RU: "Russia",
      SE: "Sweden",
      TH: "Thailand",
      VN: "Vietnam",
      ZZ: "Unknown",
    };
    return names[code] || code || "Unknown";
  }

  function countryLocation(code) {
    const locations = {
      AE: [226, 88],
      AR: [112, 142],
      AT: [184, 72],
      AU: [289, 136],
      BE: [175, 68],
      BR: [121, 125],
      CA: [71, 50],
      CN: [260, 83],
      DE: [181, 67],
      FR: [174, 74],
      GB: [168, 62],
      HK: [267, 96],
      ID: [264, 120],
      IN: [235, 100],
      IT: [183, 82],
      JP: [293, 83],
      KR: [281, 82],
      MO: [266, 97],
      MY: [257, 111],
      NL: [177, 66],
      NZ: [313, 151],
      PH: [280, 105],
      RU: [244, 52],
      SE: [184, 55],
      SG: [259, 114],
      TH: [257, 102],
      TW: [278, 97],
      US: [72, 79],
      VN: [262, 101],
    };
    return locations[code] || null;
  }

  function visitorCountryGroups(countriesData) {
    const entries = Object.entries(countriesData || {})
      .map(([code, count]) => [code, Number(count) || 0])
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 5);
    const others = entries.slice(5).reduce((sum, [, count]) => sum + count, 0);
    return { top, others, entries };
  }

  function visitorHeatColor(count, maxCount) {
    if (!count || !maxCount) {
      return "rgba(37, 99, 235, 0.18)";
    }
    const intensity = Math.max(0.22, Math.min(1, count / maxCount));
    return `rgba(37, 99, 235, ${0.28 + intensity * 0.62})`;
  }

  function renderVisitorMap(entries) {
    const mapped = entries
      .map(([code, count]) => ({ code, count, point: countryLocation(code) }))
      .filter((item) => item.point);
    const maxCount = mapped.reduce((max, item) => Math.max(max, item.count), 1);
    const markers = mapped.map((item) => {
      const [x, y] = item.point;
      const radius = Math.max(4, Math.min(13, 4 + (item.count / maxCount) * 9));
      return `
        <g class="visitor-map-marker">
          <circle cx="${x}" cy="${y}" r="${radius + 3}" fill="${visitorHeatColor(item.count, maxCount)}"></circle>
          <circle cx="${x}" cy="${y}" r="${radius}" fill="var(--accent, #2563eb)"></circle>
          <title>${countryName(item.code)}: ${formatNumber(item.count)}</title>
        </g>
      `;
    }).join("");

    return `
      <svg class="visitor-world-map" viewBox="0 0 360 180" role="img" aria-label="World visitor frequency map">
        <rect x="0" y="0" width="360" height="180" rx="10"></rect>
        <path class="visitor-land" d="M18 54 L31 40 L58 34 L86 39 L101 52 L99 67 L79 76 L65 91 L44 98 L27 88 L17 70 Z"></path>
        <path class="visitor-land" d="M93 100 L111 96 L128 106 L137 125 L131 151 L115 166 L101 151 L96 129 Z"></path>
        <path class="visitor-land" d="M144 52 L165 42 L196 42 L219 51 L225 68 L212 82 L190 86 L179 103 L158 105 L146 88 L154 70 Z"></path>
        <path class="visitor-land" d="M175 105 L190 112 L198 132 L190 154 L175 161 L164 143 L165 122 Z"></path>
        <path class="visitor-land" d="M210 58 L239 49 L278 54 L311 72 L330 93 L321 112 L285 112 L262 101 L234 104 L215 90 Z"></path>
        <path class="visitor-land" d="M243 107 L266 112 L286 128 L291 146 L278 155 L255 147 L241 128 Z"></path>
        <path class="visitor-land" d="M286 133 L310 129 L331 139 L338 153 L323 164 L295 159 Z"></path>
        <path class="visitor-land" d="M180 116 L192 126 L197 145 L189 158 L176 151 L171 132 Z"></path>
        ${markers || '<text class="visitor-map-empty" x="180" y="96" text-anchor="middle">No country data yet</text>'}
      </svg>
    `;
  }

  function ensureVisitorStatsStyles() {
    if (document.getElementById("visitor-stats-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "visitor-stats-styles";
    style.textContent = `
      .visitor-stats { max-width: 760px; margin: 24px auto 0; }
      .visitor-panel { background: var(--card, #fff); border: 1px solid var(--border, #d7dde8); border-radius: 8px; box-shadow: var(--shadow-sm, 0 4px 14px rgba(15, 23, 42, 0.08)); color: var(--fg, #0f172a); padding: 18px; text-align: left; }
      .visitor-panel-head { align-items: baseline; display: flex; gap: 12px; justify-content: space-between; font-weight: 800; }
      .visitor-panel-head small, .visitor-total small, .visitor-note, .visitor-empty { color: var(--muted, #64748b); font-size: 12px; }
      .visitor-layout { align-items: stretch; display: grid; gap: 18px; grid-template-columns: minmax(210px, 0.9fr) minmax(280px, 1.4fr); margin-top: 14px; }
      .visitor-summary { display: flex; flex-direction: column; min-width: 0; }
      .visitor-total { background: color-mix(in srgb, var(--accent, #2563eb) 8%, transparent); border: 1px solid color-mix(in srgb, var(--accent, #2563eb) 18%, var(--border, #d7dde8)); border-radius: 8px; margin: 0 0 12px; padding: 14px; }
      .visitor-total span { color: var(--accent, #2563eb); display: block; font-size: 2rem; font-weight: 850; line-height: 1; }
      .visitor-countries-title { color: var(--muted, #64748b); font-size: 11px; font-weight: 800; letter-spacing: 0.04em; margin: 0 0 8px; text-transform: uppercase; }
      .visitor-country-list { display: grid; gap: 6px; }
      .visitor-country-line { align-items: center; display: flex; font-size: 13px; justify-content: space-between; }
      .visitor-country-line strong { color: var(--accent, #2563eb); }
      .visitor-map-wrap { min-width: 0; }
      .visitor-map-title { align-items: baseline; display: flex; justify-content: space-between; margin-bottom: 8px; }
      .visitor-map-title strong { font-size: 12px; }
      .visitor-map-title span { color: var(--muted, #64748b); font-size: 11px; }
      .visitor-world-map { display: block; height: auto; width: 100%; }
      .visitor-world-map rect { fill: color-mix(in srgb, var(--accent, #2563eb) 5%, var(--card, #fff)); }
      .visitor-land { fill: color-mix(in srgb, var(--fg, #0f172a) 13%, transparent); stroke: color-mix(in srgb, var(--fg, #0f172a) 26%, transparent); stroke-linejoin: round; stroke-width: 0.9; }
      .visitor-map-marker circle:last-child { stroke: var(--card, #fff); stroke-width: 1.8; }
      .visitor-map-empty { fill: var(--muted, #64748b); font-size: 11px; }
      .visitor-note { line-height: 1.45; margin: 12px 0 0; }
      @media (max-width: 720px) { .visitor-layout { grid-template-columns: 1fr; } .visitor-panel { padding: 14px; } }
    `;
    document.head.appendChild(style);
  }

  function renderVisitorStats(data) {
    ensureVisitorStatsStyles();

    document.querySelectorAll(".visitor-stats:not([data-skip-worker-stats])").forEach((container) => {
      const { top, others, entries } = visitorCountryGroups(data.countries || {});
      const listedCountries = others > 0 ? [...top, ["OTHERS", others]] : top;
      const countryRows = listedCountries.length
        ? `<div class="visitor-country-list">${listedCountries.map(([code, count]) => {
            const label = code === "OTHERS" ? "Others" : countryName(code);
            return `
              <div class="visitor-country-line">
                <span>${label}</span>
                <strong>${formatNumber(count)}</strong>
              </div>
            `;
          }).join("")}</div>`
        : '<div class="visitor-empty">No country data yet.</div>';

      container.innerHTML = `
        <section class="visitor-panel" aria-label="Visitor statistics">
          <div class="visitor-panel-head">
            <span>Visitor Statistics</span>
            <small>Since ${VISITOR_STATS_SINCE}</small>
          </div>
          <div class="visitor-layout">
            <div class="visitor-summary">
              <div class="visitor-total">
                <span>${formatNumber(data.totalVisits)}</span>
                <small>Total visits</small>
              </div>
              <div class="visitor-countries" aria-label="Visitor countries">
                <div class="visitor-countries-title">Top regions</div>
                ${countryRows}
              </div>
            </div>
            <div class="visitor-map-wrap">
              <div class="visitor-map-title">
                <strong>World Map</strong>
                <span>Frequency by region</span>
              </div>
              ${renderVisitorMap(entries)}
            </div>
          </div>
          <p class="visitor-note">Restarted on ${VISITOR_STATS_SINCE} because clustrmaps.com became unavailable.</p>
        </section>
      `;
    });
  }

  function initVisitorStats() {
    const containers = document.querySelectorAll(".visitor-stats:not([data-skip-worker-stats])");
    if (!containers.length) {
      return;
    }

    renderVisitorStats({ totalVisits: 0, countries: {} });

    if (!VISITOR_STATS_ENDPOINT) {
      document.querySelectorAll(".visitor-note").forEach((element) => {
        element.textContent = `Restarted on ${VISITOR_STATS_SINCE} because clustrmaps.com became unavailable. Connect the Cloudflare Worker endpoint to show live data.`;
      });
      return;
    }

    const pageUrl = `${window.location.origin}${window.location.pathname}`;
    const requestUrl = new URL(VISITOR_STATS_ENDPOINT);
    requestUrl.searchParams.set("page", pageUrl);

    const ignoreToken = localStorage.getItem(VISITOR_STATS_IGNORE_KEY);
    if (ignoreToken) {
      requestUrl.searchParams.set("ignore", ignoreToken);
      requestUrl.searchParams.set("mode", "read");
    }

    fetch(requestUrl.toString(), {
      method: "GET",
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Visitor stats request failed");
        }
        return response.json();
      })
      .then(renderVisitorStats)
      .catch(() => {
        document.querySelectorAll(".visitor-note").forEach((element) => {
          element.textContent = `Restarted on ${VISITOR_STATS_SINCE} because clustrmaps.com became unavailable. Live stats are temporarily unreachable.`;
        });
      });
  }

  function initSharedPageBits() {
    syncYear();
    initThemeToggle();
    initNavigation();
    initMissingMedia();
    initCloudflareAnalytics();
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
