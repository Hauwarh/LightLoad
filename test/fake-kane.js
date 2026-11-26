#!/usr/bin/env node
// STAND-IN for kane-cli, used only by test/selftest.sh to check the harness without Kane credits.
// It is NOT Kane and proves nothing about the site. It walks the task path like a browser
// (fetches each page and every asset it references, 6 at a time, through the throttled proxy)
// and prints Kane-shaped NDJSON. The real demo uses `kane-cli`.
const http = require("http");
const args = process.argv.slice(2);
if (args[0] === "config") process.exit(0);
const objective = args[1] || "";
const url = new URL(args[args.indexOf("--url") + 1]);
const timeout = Number(args[args.indexOf("--timeout") + 1] || 300);
const limit = Number((objective.match(/longer than (\d+) seconds/) || [])[1] || 30);
const emit = (o) => process.stdout.write(JSON.stringify({ v: 1, ts: new Date().toISOString(), ...o }) + "\n");
const cache = new Map();
function get(p) {
  return new Promise((resolve, reject) => {
    const headers = { "accept-encoding": "gzip, br" };
    if (cache.has(p)) headers["if-none-match"] = cache.get(p).etag;
    http.get({ host: url.hostname, port: url.port, path: p, headers }, (res) => {
      const chunks = []; res.on("data", (d) => chunks.push(d));
      res.on("end", () => {
        if (res.statusCode === 304) return resolve(cache.get(p).body);
        const body = Buffer.concat(chunks);
        if (res.headers.etag) cache.set(p, { etag: res.headers.etag, body });
        resolve(res.statusCode === 200 ? body : null);
      });
    }).on("error", reject);
  });
}
async function pool(items, fn, n = 6) { const q = [...items]; await Promise.all(Array.from({ length: n }, async () => { while (q.length) await fn(q.shift()); })); }
async function load(page) {
  const html = await get(page);
  if (!html) throw new Error(`${page} returned no page`);
  const s = html.toString();
  const blocking = [...s.matchAll(/<script[^>]+src="([^"]+)"(?![^>]*\b(?:defer|async)\b)[^>]*>/g)].map((m) => m[1]);
  const other = [...s.matchAll(/(?:src|href)="([^"#?]+\.(?:css|js|jpg|jpeg|png|webp|avif|svg|woff2?|ttf))"/g)].map((m) => m[1]).filter((x) => !blocking.includes(x));
  // Images built by app.js (product cards) are only known after JS runs; find them in the JS.
  const assets = new Set(other);
  for (const js of blocking.concat(other.filter((x) => x.endsWith(".js")))) {
    const b = await get("/" + js.replace(/^\//, "")); if (!b) continue;
    for (const m of b.toString().matchAll(/["'](img\/[^"']+\.(?:jpg|jpeg|png|webp|avif))["']/g)) if (!/loading/.test(s)) assets.add(m[1]);
  }
  await pool([...assets], async (a) => {
    const b = await get("/" + a.replace(/^\//, ""));
    if (b && a.endsWith(".css")) for (const m of b.toString().matchAll(/url\(["']?\.\.\/([^"')]+)["']?\)/g)) await get("/" + m[1]);
  });
  return s;
}
(async () => {
  const t0 = Date.now();
  emit({ type: "stream_start", cli_version: "fake-0", surface: "selftest" });
  const steps = [["/index.html", "Opened home page"], ["/search.html?q=rice", "Searched for rice"], ["/cart.html", "Added rice and opened cart"], ["/checkout.html", "Reached checkout page"]];
  let i = 0;
  const killer = setTimeout(() => { emit({ type: "run_end", status: "failed", reason: "Timeout", summary: "Timed out", duration: timeout }); process.exit(3); }, timeout * 1000);
  try {
    for (const [p, remark] of steps) {
      emit({ step: i, status: "running", remark });
      const s = await load(p);
      if (p.startsWith("/checkout") && !/Checkout/.test(s)) throw new Error("Checkout heading missing");
      if (p.startsWith("/search") && !/Add to cart|app\.js/.test(s)) throw new Error("No add to cart path");
      emit({ step: i++, status: "done", remark });
    }
    clearTimeout(killer);
    const d = +((Date.now() - t0) / 1000).toFixed(1);
    const ok = d <= limit;
    emit({ type: "run_end", status: ok ? "passed" : "failed", reason: ok ? "Objective completed" : `Took ${d}s, limit ${limit}s`, one_liner: ok ? "Reached checkout in time" : `Reached checkout but took ${d}s`, summary: `Walked home, search, cart, checkout in ${d}s`, duration: d, credits_consumed: 0 });
    process.exit(ok ? 0 : 1);
  } catch (e) {
    emit({ type: "error", message: e.message });
    emit({ type: "run_end", status: "failed", reason: e.message, duration: +((Date.now() - t0) / 1000).toFixed(1) });
    process.exit(1);
  }
})();
