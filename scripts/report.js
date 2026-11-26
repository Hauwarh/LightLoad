// Builds reports/run-N.json from Kane's NDJSON (run_end) + the proxy's byte count + the config.
// Verdict = pass only if Kane passed the task AND network wait <= time budget AND data <= data budget.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const root = path.join(__dirname, "..");
const n = Number(process.argv[2]);
const kaneExit = Number(process.argv[3]);
const cfg = JSON.parse(fs.readFileSync(path.join(root, "lightload.config.json"), "utf8"));
const lines = fs.readFileSync(path.join(root, `reports/run-${n}.ndjson`), "utf8").split("\n").filter(Boolean);
const events = lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const runEnd = [...events].reverse().find((e) => e.type === "run_end") || null;
const errors = events.filter((e) => e.type === "error").map((e) => e.message);
const steps = events.filter((e) => e.step !== undefined && e.remark).map((e) => ({ step: e.step, status: e.status, remark: e.remark }));
const bytes = JSON.parse(fs.readFileSync(path.join(root, `reports/run-${n}.bytes.json`), "utf8"));

const EXIT = { 0: "passed", 1: "failed", 2: "error", 3: "timeout" };
const mb = bytes.bytes_total / 1048576;
const naira = (bytes.bytes_total / 1073741824) * cfg.naira_per_gb;
const kaneStatus = runEnd ? runEnd.status : EXIT[kaneExit] || "error";
const checks = {
  kane_task: kaneStatus === "passed" && kaneExit === 0,
  time: bytes.busy_seconds <= cfg.time_budget_s,
  data: mb <= cfg.data_budget_mb,
};
let commit = "";
try { commit = execSync("git rev-parse --short HEAD", { cwd: root, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch {}
const failures = [];
if (!checks.kane_task) failures.push(`Kane ${kaneStatus}${runEnd && runEnd.reason ? ` (${runEnd.reason})` : ""}`);
if (!checks.time) failures.push(`network wait ${bytes.busy_seconds}s > ${cfg.time_budget_s}s budget`);
if (!checks.data) failures.push(`${mb.toFixed(2)}MB > ${cfg.data_budget_mb}MB budget`);

const report = {
  run: n,
  timestamp: new Date().toISOString(),
  git_commit: commit,
  network: bytes.network,
  network_preset: bytes.preset,
  task: cfg.task,
  verdict: failures.length ? "fail" : "pass",
  failures,
  seconds: bytes.busy_seconds,
  mb: +mb.toFixed(2),
  naira: +naira.toFixed(2),
  naira_per_1000_visits: Math.round(naira * 1000),
  requests: bytes.requests,
  budgets: { time_s: cfg.time_budget_s, data_mb: cfg.data_budget_mb, naira_per_gb: cfg.naira_per_gb },
  checks,
  kane: {
    exit_code: kaneExit,
    status: kaneStatus,
    duration_s: runEnd ? runEnd.duration : null,
    reason: runEnd ? runEnd.reason || null : null,
    one_liner: runEnd ? runEnd.one_liner || null : null,
    summary: runEnd ? runEnd.summary || null : null,
    test_url: runEnd ? runEnd.test_url || null : null,
    session_dir: runEnd ? runEnd.session_dir || null : null,
    errors,
    steps,
    ndjson: `reports/run-${n}.ndjson`,
  },
  heaviest_files: bytes.files.slice(0, 15).map((f) => ({ path: f.path, kb: Math.round(f.bytes / 1024), type: f.type, encoding: f.encoding, requests: f.requests })),
};
fs.writeFileSync(path.join(root, `reports/run-${n}.json`), JSON.stringify(report, null, 2) + "\n");
const tag = report.verdict === "pass" ? "PASS" : "FAIL";
console.log(`\n${tag}  run #${n}: ${report.seconds}s network wait, ${report.mb}MB, ₦${report.naira.toFixed(2)} per visit (Kane: ${kaneStatus})`);
if (failures.length) console.log("  why: " + failures.join("; "));
console.log(`  report: reports/run-${n}.json`);
