(function () {
  const STATS_OPT_OUT_KEY = "visitor-stats-opt-out";
  const CLUSTRMAPS_SRC = "//clustrmaps.com/map_v2.js?d=GtDZVi4tsLCxCMPsshi4UGUmYEeEN1BC-yvrYvb1Rt4&cl=ffffff&w=250&h=150";

  const params = new URLSearchParams(window.location.search);
  const stats = params.get("stats");

  if (stats === "off" || params.get("no-count") === "1") {
    localStorage.setItem(STATS_OPT_OUT_KEY, "true");
  } else if (stats === "on") {
    localStorage.removeItem(STATS_OPT_OUT_KEY);
  }

  const isOptedOut = localStorage.getItem(STATS_OPT_OUT_KEY) === "true";
  const isLocalPreview = window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "::1";

  if (isOptedOut || isLocalPreview) {
    document.write(
      `<div class="visitor-stats-status" data-visitor-stats-status="off">${
        isOptedOut
          ? "Visitor stats disabled for this browser."
          : "Visitor stats disabled in local preview."
      }</div>`
    );
    return;
  }

  document.write(`<div class="visitor-stats" aria-label="Visitor statistics"><script type="text/javascript" id="clustrmaps" src="${CLUSTRMAPS_SRC}"><\/script></div>`);
}());
