const SINCE = "2026-06-05";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function normalizeCountry(request) {
  const country = request.cf && typeof request.cf.country === "string" ? request.cf.country : "ZZ";
  return /^[A-Z]{2}$/.test(country) ? country : "ZZ";
}

async function readState(env) {
  const stored = await env.VISITOR_STATS.get("global", "json");
  return stored || {
    since: SINCE,
    totalVisits: 0,
    countries: {},
    pages: {},
  };
}

async function writeState(env, state) {
  await env.VISITOR_STATS.put("global", JSON.stringify(state));
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405);
    }

    if (!env.VISITOR_STATS) {
      return json({ error: "Missing VISITOR_STATS KV binding" }, 500);
    }

    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "unknown";
    const country = normalizeCountry(request);
    const state = await readState(env);
    const readOnly = url.searchParams.get("mode") === "read";
    const ignoreToken = url.searchParams.get("ignore");
    const shouldIgnoreVisit = Boolean(env.IGNORE_TOKEN && ignoreToken && ignoreToken === env.IGNORE_TOKEN);

    if (readOnly || shouldIgnoreVisit) {
      return json({
        since: state.since || SINCE,
        totalVisits: Number(state.totalVisits || 0),
        countries: state.countries || {},
      });
    }

    state.since = state.since || SINCE;
    state.totalVisits = Number(state.totalVisits || 0) + 1;
    state.countries[country] = Number(state.countries[country] || 0) + 1;

    if (!state.pages[page]) {
      state.pages[page] = 0;
    }
    state.pages[page] += 1;

    await writeState(env, state);

    return json({
      since: state.since,
      totalVisits: state.totalVisits,
      countries: state.countries,
    });
  },
};
