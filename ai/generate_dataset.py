#!/usr/bin/env python3
"""
Dataset Generator — Creates placeholder CCTV images for the demo.
Run: python generate_dataset.py

Requires: Pillow
Install:  pip install Pillow
"""

import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow not installed. Run: pip install Pillow")
    sys.exit(1)

DATASET_DIR = os.path.join(os.path.dirname(__file__), '..', 'dataset')

# Camera definitions: filename → (location_label, time_label, bg_color)
CAMERAS = [
    ('cam1_10am',  'Main Entrance Gate',        '10:00 AM', (20, 30, 55)),
    ('cam2_11am',  'Central Market Area',        '11:00 AM', (30, 20, 50)),
    ('cam3_12pm',  'Railway Station Platform 2', '12:00 PM', (15, 40, 40)),
    ('cam4_2pm',   'Bus Stand Junction',         '02:00 PM', (40, 20, 30)),
    ('cam5_4pm',   'City Park South Exit',       '04:00 PM', (20, 40, 20)),
]

WIDTH, HEIGHT = 640, 480

def draw_cctv_frame(draw, w, h, cam_id, location, time_str, bg):
    """Draw a realistic CCTV-style placeholder frame."""
    # Grid lines (subtle)
    for x in range(0, w, 80):
        draw.line([(x, 0), (x, h)], fill=(*bg, 80), width=1)
    for y in range(0, h, 60):
        draw.line([(0, y), (w, y)], fill=(*bg, 80), width=1)

    # Corner markers (CCTV style)
    corner_len = 24
    corner_color = (0, 180, 255)
    corners = [
        (20, 20), (w - 20 - corner_len, 20),
        (20, h - 20 - corner_len), (w - 20 - corner_len, h - 20 - corner_len)
    ]
    for cx, cy in corners:
        draw.line([(cx, cy), (cx + corner_len, cy)], fill=corner_color, width=2)
        draw.line([(cx, cy), (cx, cy + corner_len)], fill=corner_color, width=2)
        draw.line([(cx + corner_len, cy + corner_len), (cx, cy + corner_len)], fill=corner_color, width=2)
        draw.line([(cx + corner_len, cy + corner_len), (cx + corner_len, cy)], fill=corner_color, width=2)

    # Person silhouette (stylized)
    center_x, center_y = w // 2, h // 2
    # Head
    draw.ellipse([center_x - 28, center_y - 90, center_x + 28, center_y - 34], fill=(200, 180, 160))
    # Body
    draw.rectangle([center_x - 36, center_y - 34, center_x + 36, center_y + 60], fill=(80, 100, 160))
    # Legs
    draw.rectangle([center_x - 32, center_y + 60, center_x - 8, center_y + 130], fill=(50, 60, 100))
    draw.rectangle([center_x + 8, center_y + 60, center_x + 32, center_y + 130], fill=(50, 60, 100))
    # Arms
    draw.rectangle([center_x - 60, center_y - 30, center_x - 36, center_y + 50], fill=(70, 90, 150))
    draw.rectangle([center_x + 36, center_y - 30, center_x + 60, center_y + 50], fill=(70, 90, 150))

    # Detection box
    box_color = (0, 255, 100)
    box_pad = 10
    bx1 = center_x - 60 - box_pad
    by1 = center_y - 100 - box_pad
    bx2 = center_x + 60 + box_pad
    by2 = center_y + 140
    draw.rectangle([bx1, by1, bx2, by2], outline=box_color, width=2)

    # Confidence label
    draw.rectangle([bx1, by1 - 22, bx1 + 110, by1], fill=box_color)
    draw.text((bx1 + 5, by1 - 19), "MATCH: 92%", fill=(0, 0, 0))

    # Info overlay bar (bottom)
    draw.rectangle([0, h - 50, w, h], fill=(0, 0, 0, 200))

    # Cam ID & location
    draw.text((12, h - 42), f"● REC  {cam_id.upper()}", fill=(255, 60, 60))
    draw.text((12, h - 24), f"{location}", fill=(200, 200, 200))

    # Time (right side)
    draw.text((w - 130, h - 42), time_str, fill=(255, 220, 100))
    draw.text((w - 130, h - 24), "CCTV CAPTURE", fill=(150, 150, 150))

def generate():
    os.makedirs(DATASET_DIR, exist_ok=True)
    print(f"Generating dataset in: {os.path.abspath(DATASET_DIR)}")

    for base_name, location, time_str, bg_rgb in CAMERAS:
        filepath = os.path.join(DATASET_DIR, f"{base_name}.jpg")
        if os.path.exists(filepath):
            print(f"  [skip] {base_name}.jpg already exists")
            continue

        img = Image.new('RGB', (WIDTH, HEIGHT), color=bg_rgb)
        draw = ImageDraw.Draw(img, 'RGBA')
        cam_id = base_name.split('_')[0]
        draw_cctv_frame(draw, WIDTH, HEIGHT, cam_id, location, time_str, bg_rgb)
        img.save(filepath, 'JPEG', quality=88)
        print(f"  [ok]   {base_name}.jpg")

    print(f"\nDataset generated: {len(CAMERAS)} images in {DATASET_DIR}")
    print("\nTo use real images:")
    print("  1. Add your CCTV images to the dataset/ folder")
    print("  2. Name them: cam<id>_<time>.jpg (e.g. cam1_10am.jpg)")
    print("  3. Replace the placeholder files")

if __name__ == '__main__':
    generate()
