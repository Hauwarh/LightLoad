// Builds the agent prompt from Kane's report for run N. Printed to stdout.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const n = Number(process.argv[2]);
const r = JSON.parse(fs.readFileSync(path.join(root, `reports/run-${n}.json`), "utf8"));
const bytes = JSON.parse(fs.readFileSync(path.join(root, `reports/run-${n}.bytes.json`), "utf8"));
const ndjson = fs.readFileSync(path.join(root, `reports/run-${n}.ndjson`), "utf8").trim().split("\n");

function tree(dir, rel = "") {
  let out = [];
  for (const name of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, name), q = rel ? `${rel}/${name}` : name;
    const st = fs.statSync(p);
    if (st.isDirectory()) out = out.concat(tree(p, q));
    else out.push(`${String(Math.round(st.size / 1024)).padStart(7)} KB  demo-shop/${q}`);
  }
  return out;
}

const fileRows = bytes.files.map((f) => `| ${f.path} | ${Math.round(f.bytes / 1024)} | ${f.requests} | ${f.type} | ${f.encoding} |`).join("\n");
const prev = [];
for (let i = 1; i < n; i++) {
  const p = path.join(root, `reports/run-${i}.json`);
  if (fs.existsSync(p)) { const x = JSON.parse(fs.readFileSync(p, "utf8")); prev.push(`- run #${i}: ${x.verdict}, ${x.seconds}s, ${x.mb}MB (${x.failures.join("; ") || "ok"})`); }
}

process.stdout.write(`You are fixing a website so it works for a shopper on slow, expensive mobile data in Lagos (1GB costs about ₦${r.budgets.naira_per_gb}).

Kane CLI tested the user task below through a throttled ${r.network} connection (${r.network_preset.down_kbps} kbps down, ${r.network_preset.latency_ms} ms latency per request) and the run FAILED.

## The user task (must keep working)
"${r.task}"

## Kane run #${n} result
- Verdict: FAIL. ${r.failures.join("; ")}
- Network wait: ${r.seconds}s (budget ${r.budgets.time_s}s)
- Data used: ${r.mb}MB (budget ${r.budgets.data_mb}MB), cost ₦${r.naira.toFixed(2)} per visit, ₦${r.naira_per_1000_visits} per 1,000 visits
- Requests: ${r.requests}
- Kane status: ${r.kane.status} (exit ${r.kane.exit_code})${r.kane.reason ? `, reason: ${r.kane.reason}` : ""}
- Kane summary: ${r.kane.summary || r.kane.one_liner || "(none)"}
${r.kane.errors.length ? `- Kane errors: ${r.kane.errors.join(" | ")}\n` : ""}
Kane's raw NDJSON (last 40 lines of reports/run-${n}.ndjson):
\`\`\`
${ndjson.slice(-40).join("\n")}
\`\`\`
${prev.length ? `\nEarlier runs:\n${prev.join("\n")}\n` : ""}
## Bytes served per file during the run (from the throttling proxy)
| path | KB | requests | content-type | encoding |
|---|---|---|---|---|
${fileRows}

## Files in demo-shop/
\`\`\`
${tree(path.join(root, "demo-shop")).join("\n")}
\`\`\`

## Your job
Cut page weight and load time on the task path (home -> search for rice -> add to cart -> cart -> checkout) until it fits BOTH budgets, without breaking the task.

Rules:
1. Only edit files inside demo-shop/. Do not touch proxy/, scripts/, agent/ (except agent/last-fix.txt), reports/, lightload, loop.sh or lightload.config.json. Edits outside demo-shop/ are reverted automatically.
2. Keep the task working: the search form, "Add to cart" buttons, the cart page, "Proceed to checkout" link and the Checkout page with its form must still exist and behave the same. Keep visible text labels the same so a test agent can find them.
3. Keep everything same-origin and static. No CDNs, no build step that must run at serve time.
4. Useful levers: resize and recompress images (sharp, ImageMagick \`convert\`, \`cwebp\` or Python Pillow, whichever is installed; check first), use WebP/AVIF, set width/height and loading="lazy" on below-the-fold images, remove unused JS/CSS, use system fonts or a small subset WOFF2, add defer to scripts. The static server sends a precompressed "file.gz" or "file.br" next to any file automatically when the browser accepts it, and files under demo-shop/static/ get long-lived cache headers.
5. Delete heavy files you no longer reference.
6. Do not run git commit. The harness commits for you.
7. When done, write ONE short line (under 80 chars, lowercase, no trailing period) summarising what you changed to agent/last-fix.txt, e.g. "compress images to webp, drop unused lodash/moment, system fonts".
`);
