# Cloudflare Visitor Counter

This folder contains the Worker used by the public visitor statistics widget.

The site also uses Cloudflare Web Analytics in `site.js`, but Web Analytics does
not expose public visitor counts or visitor country summaries to the frontend.
This Worker keeps a small public aggregate in Cloudflare KV.

## Setup

1. Create a Cloudflare Worker.
2. Create a KV namespace.
3. Bind the namespace to the Worker with this exact binding name:

```text
VISITOR_STATS
```

4. Add a Worker secret named `IGNORE_TOKEN`. Use a long random value.
5. Deploy `visitor-counter-worker.js`.
6. Copy the Worker URL and set it in `site.js`:

```js
const VISITOR_STATS_ENDPOINT = "https://your-worker.your-account.workers.dev/";
```

## Ignore Your Own Visits

Set the same secret value in your own browser console:

```js
localStorage.setItem("visitor-stats-ignore-token", "your-long-random-ignore-token");
```

After that, visits from this browser will fetch the latest public stats but will
not increment the counter. To re-enable counting for this browser:

```js
localStorage.removeItem("visitor-stats-ignore-token");
```

When the frontend sees this local token, it calls the Worker with
`mode=read`, so the Worker returns the current public totals without increasing
the counters. If your own visits are still counted, check these points:

- The website has deployed the latest `site.js`.
- The Worker has deployed the latest `visitor-counter-worker.js`.
- The localStorage token was set on the same origin you are visiting, for example
  `https://canzheng0331.github.io`, not a local preview URL.
- A hard refresh was performed after deployment.

The public counter starts from 2026-06-05 because clustrmaps.com became
unavailable. The Worker stores aggregate counts only: total visits, counts by
country code, and counts by page URL. It does not store raw IP addresses.
