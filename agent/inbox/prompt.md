You are fixing a website so it works for a shopper on slow, expensive mobile data in Lagos (1GB costs about ₦1000).

Kane CLI tested the user task below through a throttled 3g connection (400 kbps down, 400 ms latency per request) and the run FAILED.

## The user task (must keep working)
"Search for rice, add it to cart and reach the checkout page."

## Kane run #1 result
- Verdict: FAIL. Kane failed (Screenshot failed: TimeoutError: screenshot: Timeout 60000ms exceeded.
Call log:
  - taking page screenshot
  - waiting for fonts to load...
); network wait 152.59s > 30s budget; 2.25MB > 1MB budget
- Network wait: 152.59s (budget 30s)
- Data used: 2.25MB (budget 1MB), cost ₦2.20 per visit, ₦2201 per 1,000 visits
- Requests: 19
- Kane status: failed (exit 3), reason: Screenshot failed: TimeoutError: screenshot: Timeout 60000ms exceeded.
Call log:
  - taking page screenshot
  - waiting for fonts to load...

- Kane summary: The browser automation's screenshot step became stuck waiting for page fonts to finish loading. The font request did not report a completed response, so no shopping actions were performed.
Investigate the browser screenshot/font-loading setup and make screenshot capture tolerate an unfinished font request; then rerun the shopping journey.

Kane's raw NDJSON (last 40 lines of reports/run-1.ndjson):
```
{"type":"stream_start","cli_version":"0.10.9","surface":"run","pid":16605,"v":1,"ts":"2026-11-26T13:19:50.861Z"}
{"type":"recording_state","enabled":true,"session_id":"c2af075f-376f-4881-9665-2dfe12511984","persist":false,"v":1,"ts":"2026-11-26T13:19:50.866Z"}
{"type":"skill_update_available","current":null,"latest":"0.1.4","install_cmd":"kane-cli install skill","v":1,"ts":"2026-11-26T13:19:55.016Z"}
{"type":"bifurcation","flows":["Navigate to http://localhost:8080/index.html then Search for rice, add it to cart and reach the checkout page.\nFail if it takes longer than 30 seconds."],"count":1,"v":1,"ts":"2026-11-26T13:20:03.216Z"}
{"step":2,"status":"running","remark":"Step 1","v":1,"ts":"2026-11-26T13:21:11.260Z"}
{"step":2,"status":"done","remark":"navigate: Navigate to http://localhost:8080/index.html","v":1,"ts":"2026-11-26T13:21:11.264Z"}
{"step":4,"status":"running","remark":"Step 3","v":1,"ts":"2026-11-26T13:22:11.795Z"}
{"step":4,"status":"failed","remark":"agent_info: Screenshot failed: TimeoutError: screenshot: Timeout 60000ms exceeded.\nCall log:","v":1,"ts":"2026-11-26T13:22:16.797Z"}
{"type":"coverage","status":"skipped","reason":"not_assurance_project","pack":"/home/box/.testmuai/kaneai/sessions/c2af075f-376f-4881-9665-2dfe12511984/evidence/1c9e7344-0cc7-443e-a560-0b895a4e467e.evidence","v":1,"ts":"2026-11-26T13:22:26.766Z"}
{"type":"run_end","status":"failed","summary":"The browser automation's screenshot step became stuck waiting for page fonts to finish loading. The font request did not report a completed response, so no shopping actions were performed.\nInvestigate the browser screenshot/font-loading setup and make screenshot capture tolerate an unfinished font request; then rerun the shopping journey.","one_liner":"The run could not continue because the screenshot system waited 60 seconds for fonts and then timed out.","final_state":{},"reason":"Screenshot failed: TimeoutError: screenshot: Timeout 60000ms exceeded.\nCall log:\n  - taking page screenshot\n  - waiting for fonts to load...\n","duration":144.6,"bifurcated":false,"total_runs":1,"context":{"memory":{},"variables":{},"pointer":"(failed) The run could not continue because the screenshot system waited 60 seconds for fonts and then timed out."},"credits_consumed":7.80257,"session_dir":"/home/box/.testmuai/kaneai/sessions/c2af075f-376f-4881-9665-2dfe12511984","run_dir":"/home/box/.testmuai/kaneai/sessions/c2af075f-376f-4881-9665-2dfe12511984/runs/0","result_code":510,"reason_code":"infra_error.screenshot_failed","per_flow_metadata":[{"result_code":"510","reason_code":"infra_error.screenshot_failed","error_message":"Screenshot failed: TimeoutError: screenshot: Timeout 60000ms exceeded.\nCall log:\n  - taking page screenshot\n  - waiting for fonts to load...\n","summary":"The browser automation's screenshot step became stuck waiting for page fonts to finish loading. The font request did not report a completed response, so no shopping actions were performed.\nInvestigate the browser screenshot/font-loading setup and make screenshot capture tolerate an unfinished font request; then rerun the shopping journey.","one_liner":"The run could not continue because the screenshot system waited 60 seconds for fonts and then timed out.","credits_consumed":7.80257}],"run_id":"run-0","verdict":{"confirmed":false,"status":"broken","family":"environment_issue","category":"platform_failure","category_proposal":"","severity":"major","root_cause":"The browser automation's screenshot step became stuck waiting for page fonts to finish loading. The font request did not report a completed response, so no shopping actions were performed.","agent_fault_assessment":"The agent did not take an incorrect shopping action: the run stopped immediately after the initial navigation because its screenshot capture waited for fonts and timed out. This is a browser-automation/platform failure, not evidence that the store's search, cart, or checkout flow is defective.","bug_title":"Screenshot capture times out while waiting for fonts","signals":[],"confidence":0.95,"suggestion":"Investigate the browser screenshot/font-loading setup and make screenshot capture tolerate an unfinished font request; then rerun the shopping journey.","one_liner":"The run could not continue because the screenshot system waited 60 seconds for fonts and then timed out.","relevant_steps":[0,1],"culprit_step":"0-3","credits_consumed":1.7480000000000002,"known_bug_id":"BUG-1","category_name":"","mode":"terminal"},"test_url":"https://test-manager.lambdatest.com/projects/01M8B6B43D8DYDTMKEXTG6K6H0/test-cases/01M8C06F15TNBYXTNERESVE1R2/dashboard/share/US_46H56QY1VCG5QCR4RM9VNF48QRGZGQNLEA7DFLKTZHVCBI9AP75JM1N77835ILUB?type=summary&agentView=true&fqdn=summary-page","coverage":{"status":"skipped"},"v":1,"ts":"2026-11-26T13:22:26.766Z"}
```

## Bytes served per file during the run (from the throttling proxy)
| path | KB | requests | content-type | encoding |
|---|---|---|---|---|
| /vendor/moment-with-locales.js | 1236 | 2 | application/javascript; charset=utf-8 | identity |
| /vendor/lodash.js | 1063 | 2 | application/javascript; charset=utf-8 | identity |
| /js/app.js | 4 | 2 | application/javascript; charset=utf-8 | identity |
| /css/style.css | 2 | 2 | text/css; charset=utf-8 | identity |
| /index.html | 1 | 2 | text/html; charset=utf-8 | identity |
| /js/analytics.js | 1 | 2 | application/javascript; charset=utf-8 | identity |

## Files in demo-shop/
```
      1 KB  demo-shop/cart.html
      1 KB  demo-shop/checkout.html
      2 KB  demo-shop/css/style.css
    692 KB  demo-shop/fonts/DejaVuSans-Bold.ttf
    623 KB  demo-shop/fonts/DejaVuSans-Oblique.ttf
    742 KB  demo-shop/fonts/DejaVuSans.ttf
      4 KB  demo-shop/fonts/LICENSE-dejavu
   1078 KB  demo-shop/img/beans.jpg
   1107 KB  demo-shop/img/garri.jpg
   3500 KB  demo-shop/img/hero-checkout.jpg
   3943 KB  demo-shop/img/hero-home.jpg
   3827 KB  demo-shop/img/hero-search.jpg
   1204 KB  demo-shop/img/palm-oil.jpg
   1073 KB  demo-shop/img/rice.jpg
   1070 KB  demo-shop/img/tomatoes.jpg
   1077 KB  demo-shop/img/yam.jpg
      1 KB  demo-shop/index.html
      0 KB  demo-shop/js/analytics.js
      3 KB  demo-shop/js/app.js
      1 KB  demo-shop/product.html
      1 KB  demo-shop/search.html
      2 KB  demo-shop/vendor/LICENSE-lodash
      1 KB  demo-shop/vendor/LICENSE-moment
    531 KB  demo-shop/vendor/lodash.js
    618 KB  demo-shop/vendor/moment-with-locales.js
```

## Your job
Cut page weight and load time on the task path (home -> search for rice -> add to cart -> cart -> checkout) until it fits BOTH budgets, without breaking the task.

Rules:
1. Only edit files inside demo-shop/. Do not touch proxy/, scripts/, agent/ (except agent/last-fix.txt), reports/, lightload, loop.sh or lightload.config.json. Edits outside demo-shop/ are reverted automatically.
2. Keep the task working: the search form, "Add to cart" buttons, the cart page, "Proceed to checkout" link and the Checkout page with its form must still exist and behave the same. Keep visible text labels the same so a test agent can find them.
3. Keep everything same-origin and static. No CDNs, no build step that must run at serve time.
4. Useful levers: resize and recompress images (sharp, ImageMagick `convert`, `cwebp` or Python Pillow, whichever is installed; check first), use WebP/AVIF, set width/height and loading="lazy" on below-the-fold images, remove unused JS/CSS, use system fonts or a small subset WOFF2, add defer to scripts. The static server sends a precompressed "file.gz" or "file.br" next to any file automatically when the browser accepts it, and files under demo-shop/static/ get long-lived cache headers.
5. Delete heavy files you no longer reference.
6. Do not run git commit. The harness commits for you.
7. When done, write ONE short line (under 80 chars, lowercase, no trailing period) summarising what you changed to agent/last-fix.txt, e.g. "compress images to webp, drop unused lodash/moment, system fonts".
