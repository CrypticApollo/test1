"""Generate the webOS launcher icons (80x80 and 130x130) for Nova OS."""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "assets")


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def icon(size, path):
    scale = 4  # draw big, downsample for smooth edges
    s = size * scale
    grad = Image.new("RGB", (s, s))
    px = grad.load()
    c1, c2, c3 = (91, 108, 255), (180, 76, 255), (255, 111, 145)
    for y in range(s):
        for x in range(s):
            t = (x + y) / (2 * s)
            px[x, y] = lerp(c1, c2, t / 0.6) if t < 0.6 else lerp(c2, c3, (t - 0.6) / 0.4)

    mask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, s - 1, s - 1), radius=int(s * 0.27), fill=255)
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    img.paste(grad, (0, 0), mask)

    draw = ImageDraw.Draw(img)
    font = None
    for name in ("DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        try:
            font = ImageFont.truetype(name, int(s * 0.62))
            break
        except OSError:
            pass
    font = font or ImageFont.load_default()
    box = draw.textbbox((0, 0), "N", font=font)
    w, h = box[2] - box[0], box[3] - box[1]
    draw.text(((s - w) / 2 - box[0], (s - h) / 2 - box[1]), "N", font=font, fill="white")

    img.resize((size, size), Image.LANCZOS).save(path)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    icon(80, os.path.join(OUT, "icon.png"))
    icon(130, os.path.join(OUT, "largeIcon.png"))
    print("icons written to", os.path.normpath(OUT))
