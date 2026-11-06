"""Unroll the 750 ml label from the official product photo into a flat texture.

The photo shows the label wrapped around a cylinder (centre x=626.5 px,
radius 194.5 px). Each output column is sampled at R*sin(theta) so the
texture can be wrapped back onto the 3D bottle without stretching.
Run: python3 scripts/media/extract-label.py
"""
from pathlib import Path
import math
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "public/images/products/product-750ml.webp"
TARGET = ROOT / "public/images/3d/label-750ml.webp"

CENTER_X, RADIUS = 626.5, 194.5
TOP, BOTTOM = 517, 1515
THETA_LEFT, THETA_RIGHT = math.asin((484 - CENTER_X) / RADIUS), math.asin((774 - CENTER_X) / RADIUS)
SCALE = 1.8

image = Image.open(SOURCE).convert("RGB")
height = BOTTOM - TOP
band = image.crop((0, TOP, image.width, BOTTOM)).resize((image.width * 4, height), Image.LANCZOS)
pixels = np.asarray(band).astype(np.float32)

arc = RADIUS * (THETA_RIGHT - THETA_LEFT)
out_w = int(round(arc))
columns = []
for column in range(out_w):
    theta = THETA_LEFT + (column + 0.5) / out_w * (THETA_RIGHT - THETA_LEFT)
    x = (CENTER_X + RADIUS * math.sin(theta)) * 4
    left = int(math.floor(x))
    t = x - left
    columns.append(pixels[:, left] * (1 - t) + pixels[:, min(left + 1, pixels.shape[1] - 1)] * t)
flat = np.stack(columns, axis=1)

# Remove half of the photographed cylinder shading (3D lighting adds it back).
luma = flat.mean(axis=2)
profile = np.median(luma, axis=0)
kernel = np.ones(25) / 25
smooth = np.convolve(np.pad(profile, 12, mode="edge"), kernel, mode="valid")
gain = np.clip((np.median(smooth) / np.maximum(smooth, 1)) ** 0.5, 0.8, 1.6)
flat = np.clip(flat * gain[None, :, None], 0, 255).astype(np.uint8)

label = Image.fromarray(flat).resize((int(out_w * SCALE), int(height * SCALE)), Image.LANCZOS)
label = label.filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2))
label.save(TARGET, "WEBP", quality=88, method=6)
print(f"{TARGET.relative_to(ROOT)} {label.size} {TARGET.stat().st_size // 1024} KB")
