You are fixing a website so it works for a shopper on slow, expensive mobile data in Lagos (1GB costs about ₦1000).

Kane CLI tested the user task below through a throttled 3g connection (400 kbps down, 400 ms latency per request) and the run FAILED.

## The user task (must keep working)
"Search for rice, add it to cart and reach the checkout page."

## Kane run #1 result
- Verdict: FAIL. Kane failed (Screenshot failed: TimeoutError: screenshot: Timeout 60000ms exceeded.
Call log:
  - taking page screenshot
  - waiting for fonts to load...
); network wait 152.47s > 30s budget; 2.26MB > 1MB budget
- Network wait: 152.47s (budget 30s)
- Data used: 2.26MB (budget 1MB), cost ₦2.21 per visit, ₦2206 per 1,000 visits
- Requests: 19
- Kane status: failed (exit 3), reason: Screenshot failed: TimeoutError: screenshot: Timeout 60000ms exceeded.
Call log:
  - taking page screenshot
  - waiting for fonts to load...

- Kane summary: The automation was set to take a screenshot after opening the page, and that screenshot waited for page fonts to finish. The font requests did not complete, so the screenshot timed out after 60 seconds.
Change the test screenshot setting so it does not wait indefinitely for fonts, or use a short bounded wait and continue the shopping flow when optional font loading is unfinished.

Kane's raw NDJSON (last 40 lines of reports/run-1.ndjson):
```
{"type":"stream_start","cli_version":"0.10.9","surface":"run","pid":56766,"v":1,"ts":"2026-11-26T14:14:18.852Z"}
{"type":"recording_state","enabled":true,"session_id":"c0b4a7a6-2da1-4001-986b-c2fe872e1eb6","persist":false,"v":1,"ts":"2026-11-26T14:14:18.856Z"}
{"type":"skill_update_available","current":null,"latest":"0.1.4","install_cmd":"kane-cli install skill","v":1,"ts":"2026-11-26T14:14:20.465Z"}
{"type":"bifurcation","flows":["Navigate to http://localhost:8080/index.html then Search for rice, add it to cart and reach the checkout page.\nFail if it takes longer than 30 seconds."],"count":1,"v":1,"ts":"2026-11-26T14:14:26.252Z"}
{"step":2,"status":"running","remark":"Step 1","v":1,"ts":"2026-11-26T14:15:35.839Z"}
{"step":2,"status":"done","remark":"navigate: Navigate to http://localhost:8080/index.html","v":1,"ts":"2026-11-26T14:15:35.848Z"}
{"step":4,"status":"running","remark":"Step 3","v":1,"ts":"2026-11-26T14:16:36.370Z"}
{"step":4,"status":"failed","remark":"agent_info: Screenshot failed: TimeoutError: screenshot: Timeout 60000ms exceeded.\nCall log:","v":1,"ts":"2026-11-26T14:16:41.377Z"}
{"type":"coverage","status":"skipped","reason":"not_assurance_project","pack":"/home/box/.testmuai/kaneai/sessions/c0b4a7a6-2da1-4001-986b-c2fe872e1eb6/evidence/5e283ff5-7701-4e1a-957d-fec27db00db8.evidence","v":1,"ts":"2026-11-26T14:16:51.939Z"}
{"type":"run_end","status":"failed","summary":"The automation was set to take a screenshot after opening the page, and that screenshot waited for page fonts to finish. The font requests did not complete, so the screenshot timed out after 60 seconds.\nChange the test screenshot setting so it does not wait indefinitely for fonts, or use a short bounded wait and continue the shopping flow when optional font loading is unfinished.","one_liner":"The run stopped because its screenshot tool waited for fonts that never finished loading, before it performed any shopping actions.","final_state":{},"reason":"Screenshot failed: TimeoutError: screenshot: Timeout 60000ms exceeded.\nCall log:\n  - taking page screenshot\n  - waiting for fonts to load...\n","duration":145,"bifurcated":false,"total_runs":1,"context":{"memory":{},"variables":{},"pointer":"(failed) The run stopped because its screenshot tool waited for fonts that never finished loading, before it performed any shopping actions."},"credits_consumed":2.26942,"session_dir":"/home/box/.testmuai/kaneai/sessions/c0b4a7a6-2da1-4001-986b-c2fe872e1eb6","run_dir":"/home/box/.testmuai/kaneai/sessions/c0b4a7a6-2da1-4001-986b-c2fe872e1eb6/runs/0","result_code":510,"reason_code":"infra_error.screenshot_failed","per_flow_metadata":[{"result_code":"510","reason_code":"infra_error.screenshot_failed","error_message":"Screenshot failed: TimeoutError: screenshot: Timeout 60000ms exceeded.\nCall log:\n  - taking page screenshot\n  - waiting for fonts to load...\n","summary":"The automation was set to take a screenshot after opening the page, and that screenshot waited for page fonts to finish. The font requests did not complete, so the screenshot timed out after 60 seconds.\nChange the test screenshot setting so it does not wait indefinitely for fonts, or use a short bounded wait and continue the shopping flow when optional font loading is unfinished.","one_liner":"The run stopped because its screenshot tool waited for fonts that never finished loading, before it performed any shopping actions.","credits_consumed":2.26942}],"run_id":"run-0","verdict":{"confirmed":false,"status":"broken","family":"automation_bug","category":"config_issue","category_proposal":"","severity":"major","root_cause":"The automation was set to take a screenshot after opening the page, and that screenshot waited for page fonts to finish. The font requests did not complete, so the screenshot timed out after 60 seconds.","agent_fault_assessment":"The agent did not click the wrong item or fail to follow the shopping flow; it never had an opportunity to act because the automation's mandatory screenshot capture blocked immediately after navigation. This is a test/automation configuration failure rather than evidence that the storefront's search, cart, or checkout is broken.","bug_title":"Screenshot capture blocks on unfinished font loading","signals":[],"confidence":0.93,"suggestion":"Change the test screenshot setting so it does not wait indefinitely for fonts, or use a short bounded wait and continue the shopping flow when optional font loading is unfinished.","one_liner":"The run stopped because its screenshot tool waited for fonts that never finished loading, before it performed any shopping actions.","relevant_steps":[0,1],"culprit_step":"0-3","credits_consumed":1.7868,"known_bug_id":"BUG-2","category_name":"","mode":"terminal"},"test_url":"https://test-manager.lambdatest.com/projects/01M8B6B43D8DYDTMKEXTG6K6H0/test-cases/01M8C3A3XGN320FND2PNWYNCXX/dashboard/share/US_FNBWZ7583YHKXMJ0H5LOSVVINS3WEMMHS422CK6IVN7476EUTVZDNL42D8JT7NRU?type=summary&agentView=true&fqdn=summary-page","coverage":{"status":"skipped"},"v":1,"ts":"2026-11-26T14:16:51.939Z"}
```

## Bytes served per file during the run (from the throttling proxy)
| path | KB | requests | content-type | encoding |
|---|---|---|---|---|
| /vendor/moment-with-locales.js | 1236 | 2 | application/javascript; charset=utf-8 | identity |
| /vendor/lodash.js | 1063 | 2 | application/javascript; charset=utf-8 | identity |
| /css/style.css | 7 | 2 | text/css; charset=utf-8 | identity |
| /js/app.js | 4 | 2 | application/javascript; charset=utf-8 | identity |
| /index.html | 2 | 2 | text/html; charset=utf-8 | identity |
| /js/analytics.js | 1 | 2 | application/javascript; charset=utf-8 | identity |

## Files in demo-shop/
```
      1 KB  demo-shop/cart.html
      2 KB  demo-shop/checkout.html
      7 KB  demo-shop/css/style.css
    692 KB  demo-shop/fonts/DejaVuSans-Bold.ttf
    623 KB  demo-shop/fonts/DejaVuSans-Oblique.ttf
    742 KB  demo-shop/fonts/DejaVuSans.ttf
      4 KB  demo-shop/fonts/LICENSE-dejavu
      2 KB  demo-shop/img/CREDITS.md
   3102 KB  demo-shop/img/beans.jpg
   1799 KB  demo-shop/img/garri.jpg
   4002 KB  demo-shop/img/hero-checkout.jpg
   4068 KB  demo-shop/img/hero-home.jpg
   3450 KB  demo-shop/img/hero-search.jpg
   2187 KB  demo-shop/img/palm-oil.jpg
   1581 KB  demo-shop/img/rice.jpg
   2605 KB  demo-shop/img/tomatoes.jpg
   4517 KB  demo-shop/img/yam.jpg
      2 KB  demo-shop/index.html
      0 KB  demo-shop/js/analytics.js
      3 KB  demo-shop/js/app.js
      1 KB  demo-shop/product.html
      2 KB  demo-shop/search.html
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
