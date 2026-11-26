#!/usr/bin/env node
// Tiny static server for demo-shop (no dependencies).
// Like nginx gzip_static/brotli_static: if "file.br" or "file.gz" exists next to a file and the
// browser accepts it, the compressed copy is sent. That gives the fixing agent a real lever.
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(process.argv[2] || path.join(__dirname, "..", "demo-shop"));
const port = Number(process.env.SHOP_PORT || 3000);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif", ".ico": "image/x-icon",
  ".ttf": "font/ttf", ".otf": "font/otf", ".woff": "font/woff", ".woff2": "font/woff2",
};

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("Not found"); }
    const ae = req.headers["accept-encoding"] || "";
    let send = file, enc = null;
    if (/\bbr\b/.test(ae) && fs.existsSync(file + ".br")) { send = file + ".br"; enc = "br"; }
    else if (/\bgzip\b/.test(ae) && fs.existsSync(file + ".gz")) { send = file + ".gz"; enc = "gzip"; }
    const sst = fs.statSync(send);
    const etag = `"${sst.size.toString(16)}-${Math.floor(sst.mtimeMs).toString(16)}"`;
    // Default policy: revalidate every time (what most naive static hosts do).
    // A page can opt into long caching by putting assets under /static/ (fingerprinted names).
    const cache = p.startsWith("/static/") ? "public, max-age=31536000, immutable" : "no-cache";
    const headers = { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", ETag: etag, "Cache-Control": cache, Vary: "Accept-Encoding" };
    if (enc) headers["Content-Encoding"] = enc;
    if (req.headers["if-none-match"] === etag) { res.writeHead(304, headers); return res.end(); }
    headers["Content-Length"] = sst.size;
    res.writeHead(200, headers);
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(send).pipe(res);
  });
}).listen(port, () => console.error(`[shop] serving ${root} on http://localhost:${port}`));
