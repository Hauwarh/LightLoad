"""STAND-IN for an AI agent, used only by test/selftest.sh to check the fix/commit plumbing.
It applies a fixed set of slimming edits. The real loop uses Claude Code, Cursor or Codex."""
import os, re, sys
from PIL import Image
sys.stdin.read()  # the prompt (ignored by this stand-in)
shop = "demo-shop"
for name in os.listdir(f"{shop}/img"):
    if not name.endswith(".jpg"): continue
    src = f"{shop}/img/{name}"
    im = Image.open(src).convert("RGB")
    w = 800 if name.startswith("hero") else 320
    im = im.resize((w, int(im.height * w / im.width)))
    im.save(src[:-4] + ".webp", "WEBP", quality=55)
    os.remove(src)
for d in ("vendor", "fonts"):
    for f in os.listdir(f"{shop}/{d}"):
        if not f.startswith("LICENSE"): os.remove(f"{shop}/{d}/{f}")
os.remove(f"{shop}/js/analytics.js")
for f in os.listdir(shop):
    if not f.endswith(".html"): continue
    p = f"{shop}/{f}"; s = open(p).read()
    s = re.sub(r'<script src="(vendor/[^"]+|js/analytics\.js)"></script>\n', "", s)
    s = s.replace('<script src="js/app.js">', '<script defer src="js/app.js">').replace(".jpg\"", ".webp\" width=\"800\" height=\"533\"")
    open(p, "w").write(s)
p = f"{shop}/js/app.js"; s = open(p).read().replace(".jpg", ".webp").replace("<img src=", "<img loading=\"lazy\" width=\"320\" height=\"320\" src=")
open(p, "w").write(s)
p = f"{shop}/css/style.css"; s = open(p).read()
s = re.sub(r"@font-face[^}]+}\n", "", s).replace('"Market", sans-serif', "system-ui, -apple-system, Roboto, sans-serif")
s = s.replace(".card img { width: 100%;", ".card img { width: 100%; height: auto;").replace(".hero img { width: 100%;", ".hero img { width: 100%; height: auto;")
open(p, "w").write(s)
open("agent/last-fix.txt", "w").write("webp images at display size, drop unused lodash/moment, system fonts, defer js\n")
