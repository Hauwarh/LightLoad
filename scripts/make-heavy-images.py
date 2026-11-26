"""Generate the deliberately heavy images for demo-shop (run once; output is committed).
Noise + q98 JPEG makes files huge, like a phone photo uploaded without resizing."""
import random, sys, os
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]
random.seed(7)
font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def make(name, w, h, c1, c2, label, q=95):
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        t = y / h
        base = tuple(int(c1[i] * (1 - t) + c2[i] * t) for i in range(3))
        for x in range(w):
            n = random.randint(-38, 38)
            px[x, y] = (max(0, min(255, base[0] + n)), max(0, min(255, base[1] + n)), max(0, min(255, base[2] + n)))
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(font_path, int(h * 0.14))
    tw = d.textlength(label, font=f)
    d.text(((w - tw) / 2, h * 0.42), label, fill=(255, 255, 255), font=f, stroke_width=6, stroke_fill=(0, 0, 0))
    img.save(os.path.join(out, name), "JPEG", quality=q, subsampling=0)
    print(name, os.path.getsize(os.path.join(out, name)) // 1024, "KB")
make("hero-home.jpg", 3000, 2000, (20, 120, 60), (240, 200, 40), "Fresh Market Lagos")
make("hero-search.jpg", 2800, 1900, (200, 70, 30), (250, 210, 120), "Search the market")
make("hero-checkout.jpg", 2800, 1900, (30, 60, 140), (120, 200, 230), "Almost done")
for name, c1, c2, label in [
    ("rice.jpg", (235, 230, 210), (180, 150, 90), "Rice"),
    ("beans.jpg", (150, 60, 40), (90, 40, 20), "Beans"),
    ("garri.jpg", (245, 235, 200), (220, 190, 120), "Garri"),
    ("palm-oil.jpg", (220, 90, 20), (150, 40, 10), "Palm Oil"),
    ("tomatoes.jpg", (230, 40, 40), (120, 20, 20), "Tomatoes"),
    ("yam.jpg", (170, 120, 70), (240, 220, 180), "Yam"),
]:
    make(name, 1400, 1400, c1, c2, label, q=92)
