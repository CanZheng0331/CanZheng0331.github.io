(function () {
  const THEME_KEY = "theme";
  const LANG_KEY = "site-lang";
  const CLOUDFLARE_WEB_ANALYTICS_TOKEN = "64e81903e46f467fa5480cafdebd2e35";
  const VISITOR_STATS_ENDPOINT = "https://canzheng-visitor-counter.zhengcan331.workers.dev";
  const VISITOR_STATS_IGNORE_KEY = "visitor-stats-ignore-token";
  const VISITOR_STATS_SINCE = "2026-06-05";
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

  function initCloudflareAnalytics() {
    if (!CLOUDFLARE_WEB_ANALYTICS_TOKEN || CLOUDFLARE_WEB_ANALYTICS_TOKEN === "REPLACE_WITH_CLOUDFLARE_WEB_ANALYTICS_TOKEN") {
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
      ZZ: "Unknown",
    };
    return names[code] || code || "Unknown";
  }

  function ensureVisitorStatsStyles() {
    if (document.getElementById("visitor-stats-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "visitor-stats-styles";
    style.textContent = `
      .visitor-stats { max-width: 340px; margin: 20px auto 0; }
      .visitor-panel { background: var(--card, #fff); border: 1px solid var(--border, #d7dde8); border-radius: 8px; box-shadow: var(--shadow-sm, 0 4px 14px rgba(15, 23, 42, 0.08)); color: var(--fg, #0f172a); padding: 14px; text-align: left; }
      .visitor-panel-head { align-items: baseline; display: flex; gap: 12px; justify-content: space-between; font-weight: 700; }
      .visitor-panel-head small, .visitor-total small, .visitor-note, .visitor-empty { color: var(--muted, #64748b); font-size: 12px; }
      .visitor-total { border-bottom: 1px solid var(--border, #d7dde8); border-top: 1px solid var(--border, #d7dde8); margin: 12px 0; padding: 12px 0; }
      .visitor-total span { color: var(--accent, #2563eb); display: block; font-size: 1.8rem; font-weight: 800; line-height: 1; }
      .visitor-country { margin-top: 10px; }
      .visitor-country-meta { align-items: center; display: flex; font-size: 12px; justify-content: space-between; margin-bottom: 5px; }
      .visitor-country-track { background: color-mix(in srgb, var(--accent, #2563eb) 12%, transparent); border-radius: 999px; height: 6px; overflow: hidden; }
      .visitor-country-track span { background: var(--accent, #2563eb); border-radius: inherit; display: block; height: 100%; }
      .visitor-note { line-height: 1.45; margin: 12px 0 0; }
    `;
    document.head.appendChild(style);
  }

  function renderVisitorStats(data) {
    ensureVisitorStatsStyles();

    document.querySelectorAll(".visitor-stats").forEach((container) => {
      const countries = Object.entries(data.countries || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      const maxCountryCount = countries.reduce((max, item) => Math.max(max, Number(item[1]) || 0), 1);

      const countryRows = countries.length
        ? countries.map(([code, count]) => {
            const percent = Math.max(6, Math.round((Number(count) / maxCountryCount) * 100));
            return `
              <div class="visitor-country">
                <div class="visitor-country-meta">
                  <span>${countryName(code)}</span>
                  <strong>${formatNumber(count)}</strong>
                </div>
                <div class="visitor-country-track"><span style="width: ${percent}%"></span></div>
              </div>
            `;
          }).join("")
        : '<div class="visitor-empty">No country data yet.</div>';

      container.innerHTML = `
        <section class="visitor-panel" aria-label="Visitor statistics">
          <div class="visitor-panel-head">
            <span>Visitor Statistics</span>
            <small>Since ${VISITOR_STATS_SINCE}</small>
          </div>
          <div class="visitor-total">
            <span>${formatNumber(data.totalVisits)}</span>
            <small>Total visits</small>
          </div>
          <div class="visitor-countries" aria-label="Visitor countries">
            ${countryRows}
          </div>
          <p class="visitor-note">Restarted on ${VISITOR_STATS_SINCE} because clustrmaps.com became unavailable.</p>
        </section>
      `;
    });
  }

  function initVisitorStats() {
    const containers = document.querySelectorAll(".visitor-stats");
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
