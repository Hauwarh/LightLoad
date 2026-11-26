#!/usr/bin/env node
// LightLoad throttling proxy (no dependencies).
// Sits between the browser and demo-shop and behaves like a slow mobile link:
//   - every request waits `latency_ms` before it is forwarded (round-trip delay)
//   - all responses share ONE downstream pipe of `down_kbps` (like a single phone connection)
//   - counts every byte sent to the browser (headers + body), per file
// Control endpoints (not counted):
//   GET  /__lightload/stats  -> JSON with totals, per-file breakdown, network busy time
//   POST /__lightload/reset  -> zero the counters (start of a run)
const http = require("http");
const fs = require("fs");
const path = require("path");

const cfgPath = path.join(__dirname, "..", "lightload.config.json");
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const presetName = process.env.LIGHTLOAD_NETWORK || cfg.network;
const preset = cfg.presets[presetName];
if (!preset) { console.error(`[proxy] unknown network preset "${presetName}"`); process.exit(2); }

const PORT = Number(process.env.PROXY_PORT || 8080);
const UPSTREAM = { host: "127.0.0.1", port: Number(process.env.SHOP_PORT || 3000) };
const BYTES_PER_MS = (preset.down_kbps * 1000) / 8 / 1000; // kbps -> bytes per millisecond
const CHUNK = 4096;

let stats;
function reset() {
  stats = { started_at: Date.now(), requests: 0, bytes_total: 0, files: {}, inflight: 0, busy_ms: 0, busy_since: null, first_req: null, last_res: null };
}
reset();

// Busy time = wall-clock time during which at least one request was in flight.
// This is the time a user spends waiting on the network, and it excludes Kane's own "thinking" time.
function begin() {
  if (stats.inflight++ === 0) stats.busy_since = Date.now();
  if (!stats.first_req) stats.first_req = Date.now();
}
function end() {
  if (--stats.inflight === 0 && stats.busy_since) { stats.busy_ms += Date.now() - stats.busy_since; stats.busy_since = null; }
  stats.last_res = Date.now();
}

// One shared downstream pipe: chunks from all responses queue for the same bandwidth.
let pipeFreeAt = 0;
function throttledWrite(res, buf) {
  return new Promise((resolve) => {
    const now = Date.now();
    pipeFreeAt = Math.max(now, pipeFreeAt) + buf.length / BYTES_PER_MS;
    setTimeout(() => { res.write(buf); resolve(); }, Math.max(0, pipeFreeAt - now));
  });
}

function record(p, bytes, type, enc, status) {
  const f = stats.files[p] || (stats.files[p] = { bytes: 0, requests: 0, type: type || "", encoding: enc || "identity", status });
  f.bytes += bytes; f.requests += 1; f.status = status;
  if (enc) f.encoding = enc;
  stats.bytes_total += bytes;
}

function snapshot() {
  const busy = stats.busy_ms + (stats.busy_since ? Date.now() - stats.busy_since : 0);
  const files = Object.entries(stats.files).map(([p, f]) => ({ path: p, ...f })).sort((a, b) => b.bytes - a.bytes);
  return {
    network: presetName, preset, requests: stats.requests, bytes_total: stats.bytes_total,
    mb_total: +(stats.bytes_total / 1048576).toFixed(3), busy_seconds: +(busy / 1000).toFixed(2),
    span_seconds: stats.first_req ? +(((stats.last_res || Date.now()) - stats.first_req) / 1000).toFixed(2) : 0,
    files,
  };
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/__lightload/stats") { res.writeHead(200, { "Content-Type": "application/json" }); return res.end(JSON.stringify(snapshot(), null, 2)); }
  if (url.pathname === "/__lightload/reset") { reset(); pipeFreeAt = 0; res.writeHead(204); return res.end(); }

  stats.requests++;
  begin();
  setTimeout(() => {
    const up = http.request({ ...UPSTREAM, method: req.method, path: req.url, headers: { ...req.headers, host: `localhost:${UPSTREAM.port}` } }, async (ur) => {
      // Approximate header bytes on the wire.
      let headerBytes = `HTTP/1.1 ${ur.statusCode} ${ur.statusMessage}\r\n`.length + 2;
      for (const [k, v] of Object.entries(ur.headers)) headerBytes += k.length + String(v).length + 4;
      res.writeHead(ur.statusCode, ur.headers);
      let body = 0;
      const queue = [];
      ur.on("data", (d) => { for (let i = 0; i < d.length; i += CHUNK) queue.push(d.subarray(i, i + CHUNK)); });
      ur.on("end", async () => {
        // Drain sequentially so this response respects the shared bandwidth.
        for (const c of queue) { await throttledWrite(res, c); body += c.length; }
        res.end();
        record(url.pathname, headerBytes + body, ur.headers["content-type"], ur.headers["content-encoding"], ur.statusCode);
        end();
      });
    });
    up.on("error", (e) => { res.writeHead(502); res.end(String(e)); end(); });
    req.pipe(up);
  }, preset.latency_ms);
}).listen(PORT, () => console.error(`[proxy] ${presetName}: ${preset.down_kbps} kbps down, ${preset.latency_ms} ms latency, http://localhost:${PORT} -> :${UPSTREAM.port}`));
