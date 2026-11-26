// Builds card/before-after.html (and .png via headless Chrome if available).
// Usage: node scripts/card.js [beforeRun] [afterRun]   (default: first and last run)
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const root = path.join(__dirname, "..");
const runs = fs.readdirSync(path.join(root, "reports")).map((f) => (f.match(/^run-(\d+)\.json$/) || [])[1]).filter(Boolean).map(Number).sort((a, b) => a - b);
if (runs.length < 1) { console.error("card: no runs yet"); process.exit(1); }
const a = Number(process.argv[2] || runs[0]);
const b = Number(process.argv[3] || runs[runs.length - 1]);
const load = (n) => JSON.parse(fs.readFileSync(path.join(root, `reports/run-${n}.json`), "utf8"));
const before = load(a), after = load(b);
const pct = (x, y) => { if (!(x > 0)) return 0; const v = (1 - y / x) * 100; return v >= 99.5 && v < 100 ? v.toFixed(1) : Math.round(v); };
const naira = (v) => "₦" + v.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function col(r, label) {
  const ok = r.verdict === "pass";
  return `<div class="col ${ok ? "pass" : "fail"}">
  <div class="label">${label} &middot; run #${r.run}</div>
  <div class="badge">Kane ${ok ? "PASS" : "FAIL"}</div>
  <div class="stat"><span>${r.seconds}s</span>network wait</div>
  <div class="stat"><span>${r.mb} MB</span>data used</div>
  <div class="stat"><span>${naira(r.naira)}</span>per visit</div>
  <div class="small">${naira(r.naira_per_1000_visits)} per 1,000 visits &middot; ${r.requests} requests</div>
  <div class="small">${esc(r.failures.join("; ") || "within budget")}</div>
</div>`;
}

const html = `<!doctype html><html><head><meta charset="utf-8"><title>LightLoad: before and after</title>
<style>
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f1412;color:#f1f1ec}
.wrap{width:1200px;height:630px;box-sizing:border-box;padding:40px 48px;display:flex;flex-direction:column}
h1{margin:0;font-size:34px} .sub{color:#a9b3ad;margin:6px 0 24px;font-size:18px}
.row{display:flex;gap:24px;flex:1} .col{flex:1;border-radius:16px;padding:24px 28px;background:#1a211d}
.fail{border:3px solid #e5484d} .pass{border:3px solid #30a46c}
.label{color:#a9b3ad;font-size:16px;text-transform:uppercase;letter-spacing:.06em}
.badge{display:inline-block;margin:10px 0 14px;padding:6px 14px;border-radius:999px;font-weight:700;font-size:20px}
.fail .badge{background:#e5484d} .pass .badge{background:#30a46c}
.stat{font-size:18px;color:#a9b3ad;margin:6px 0} .stat span{display:inline-block;min-width:200px;font-size:38px;font-weight:800;color:#fff;margin-right:10px}
.small{color:#a9b3ad;font-size:15px;margin-top:8px}
.foot{margin-top:18px;font-size:18px;color:#d8e0da} .foot b{color:#30a46c}
</style></head><body><div class="wrap">
<h1>LightLoad: same task, same ${esc(before.network)} throttle</h1>
<div class="sub">"${esc(before.task)}" &middot; ${before.network_preset.down_kbps} kbps, ${before.network_preset.latency_ms} ms latency &middot; ₦${before.budgets.naira_per_gb}/GB</div>
<div class="row">${col(before, "Before")}${col(after, "After")}</div>
<div class="foot"><b>${pct(before.seconds, after.seconds)}% less waiting</b>, <b>${pct(before.mb, after.mb)}% less data</b>, ${naira(before.naira - after.naira)} saved per visit. Fixed by an AI agent reading Kane's report, no human edits.</div>
</div></body></html>`;

fs.mkdirSync(path.join(root, "card"), { recursive: true });
const out = path.join(root, "card/before-after.html");
fs.writeFileSync(out, html);
console.log(`card: ${path.relative(root, out)} (runs #${a} -> #${b})`);
const chrome = ["google-chrome", "chromium", "chromium-browser", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((c) => {
  try { execFileSync(c, ["--version"], { stdio: "ignore" }); return true; } catch { return false; }
});
if (chrome) {
  try {
    execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--window-size=1200,630", `--screenshot=${path.join(root, "card/before-after.png")}`, "file://" + out], { stdio: "ignore", timeout: 30000 });
    console.log("card: card/before-after.png");
  } catch { console.log("card: PNG skipped (Chrome screenshot failed); open the HTML instead"); }
}
