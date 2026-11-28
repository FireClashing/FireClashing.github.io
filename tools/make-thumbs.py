"""Make small preview copies of every certificate image for fast page loads.
Run from the repo root:  pip install pillow  &&  python tools/make-thumbs.py
Creates certificates/thumbs/<same file name>. The full-size image still opens in the viewer."""
import glob, os
from PIL import Image

os.makedirs("certificates/thumbs", exist_ok=True)
for f in glob.glob("certificates/*"):
    if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        im = Image.open(f).convert("RGB")
        im.thumbnail((900, 900))
        im.save(os.path.join("certificates", "thumbs", os.path.basename(f)), quality=80, optimize=True)
        print("ok", f)
