// Prints Kane's NDJSON stream as short human lines while it runs (the raw stream is saved by tee).
const rl = require("readline").createInterface({ input: process.stdin });
rl.on("line", (l) => {
  let e; try { e = JSON.parse(l); } catch { return; }
  if (e.step !== undefined && e.remark) console.log(`  kane step ${e.step} [${e.status}] ${e.remark}`);
  else if (e.type === "error") console.log(`  kane error: ${e.message}`);
  else if (e.type === "run_end") console.log(`  kane run_end: ${e.status} in ${e.duration}s - ${e.one_liner || e.summary || ""}`);
});
