# Regenerate the swimlane timing diagram and save to /mnt/data with correct filenames.
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyArrowPatch
import matplotlib as mpl

import os
import matplotlib.pyplot as plt

output_dir = "~/Desktop/images/"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

plt.plot([1, 2, 3])
plt.savefig(os.path.join(output_dir, "my_figure.png"))

client = "Client" + "\n" + "(Browser Extension)"
server = "Main Server" + "\n" + "(Synchronous)"
celery = "Celery Workers" + "\n" + "(Asynchronous)"
# Config
T_MIN, T_MAX = 0, 20
lanes = [
    {"name": client, "y": 2},
    {"name": server, "y": 1},
    {"name": celery, "y": 0},
]
lane_blocks = {
    client: [
        ("Send batch request" +"\n"+ "(N posts)", 0.00, 0.10, "critical"),
        ("Receive response" +"\n"+ "(text + tokens)", 5.00, 5.10, "critical"),
        ("Apply" +"\n"+ "CSS", 5.10, 5.20, "critical"),
        ("Polling", 5.20, 7.20, "critical"),
        ("Image" +"\n"+ "renders", 8.00, 20.00, "async"),
    ],
    server: [
        ("Parse request", 0.00, 0.50, "critical"),
        ("Text" + "\n" + "analysis", 0.50, 2.00, "critical"),
        ("Image" + "\n" + "analysis", 0.50, 2.00, "critical"),
        ("Text" + "\n" + "selection application", 2.00, 4.00, "critical"),
        ("Dispatch" + "\n" + "img proc.", 4.00, 5.00, "critical"),
        ("Return" + "\n" + "response", 5.00, 5.10, "critical"),
    ],
    celery: [
        ("", 5.00, 5.30, "async"),
        ("Generate" + "\n" + "K candidates", 5.30, 8.00, "async"),
        ("Score" + "\n" + "K candidates", 8.00, 13.00, "async"),
        ("Select best+" + "\n" + "cache", 13.00, 15.00, "async"),
        ("Available" + "\n" + "for polling", 15.00, 20.00, "async"),
    ],
}
arrows = [
    (0.00, client, server, "Request (Batch N)"),
    (5.00, server, client, "Response (text mods + tokens)"),
    (15.00, celery, client, "Ready: transformed images"),
]
vlines = [0, 5, 10, 15, 20]

mpl.rcParams['pdf.fonttype'] = 42
mpl.rcParams['ps.fonttype'] = 42

fig, ax = plt.subplots(figsize=(14, 6), dpi=150)
lane_height = 0.7
lane_gap = 0.35
text_bbox = dict(facecolor='skyblue', alpha=0.95, boxstyle='round,pad=0.2', edgecolor='none')

# Lane backgrounds and labels
for lane in lanes:
    y = lane["y"]
    ax.add_patch(Rectangle((T_MIN, y - lane_height/2 - lane_gap/2),
                           T_MAX - T_MIN, lane_height + lane_gap,
                           fill=False, linewidth=0.6, edgecolor='0.85'))
    ax.text(T_MIN - 0.7, y, lane["name"], va='center', ha='right', fontsize=10, bbox=text_bbox)

def draw_block(y, t0, t1, label, style):
    width = max(t1 - t0, 0.05)
    hatch = '////' if style == "critical" else '...'
    rect = Rectangle((t0, y - lane_height/2), width, lane_height,
                     facecolor='white', edgecolor='black', hatch=hatch, linewidth=1.0)
    ax.add_patch(rect)
    ax.text(t0 + 0.2, y, label, va='center', ha='left', fontsize=10, clip_on=True, wrap=True, bbox=text_bbox)

for lane in lanes:
    y = lane["y"]
    for (label, t0, t1, style) in lane_blocks.get(lane["name"], []):
        draw_block(y, t0, t1, label, style)

def lane_y(name):
    for l in lanes:
        if l["name"] == name:
            return l["y"]
    raise ValueError(name)

for t, src, dst, text in arrows:
    y0, y1 = lane_y(src), lane_y(dst)
    arrow = FancyArrowPatch((t, y0), (t, y1),
                            arrowstyle='-|>', mutation_scale=12,
                            linewidth=1.0, color='black',
                            connectionstyle="arc3,rad=0.2")
    ax.add_patch(arrow)
    ax.text(t + 0.2, (y0 + y1) / 2, text, fontsize=9, va='center', ha='left')

for x in vlines:
    ax.axvline(x=x, ymin=0.02, ymax=0.98, linestyle='--', linewidth=0.6, color='0.7')
    ax.text(x, -0.45, f"T={x}s", fontsize=9, ha='center', va='top')

ax.set_xlim(T_MIN - 0.5, T_MAX + 0.5)
ax.set_ylim(-0.8, 2.8)
ax.set_yticks([])
ax.set_xlabel("Time (seconds)")
ax.set_title("DIY‑MOD Swimlane Timing Diagram", fontsize=12)

legend_patches = [
    Rectangle((0,0),1,1, facecolor='white', edgecolor='black', hatch='////', linewidth=1.0),
    Rectangle((0,0),1,1, facecolor='white', edgecolor='black', hatch='...', linewidth=1.0),
]
ax.legend(legend_patches, ["Critical path (blocks initial response)", "Asynchronous (non‑blocking)"],
          loc='upper right', fontsize=10, frameon=False)

fig.tight_layout()

# svg_path = "~/Desktop/images/DIY-MOD_swimlane.svg"
pdf_path = "DIY-MOD_swimlane.pdf"
png_path = "DIY-MOD_swimlane.png"

fig.savefig(os.path.join(output_dir,pdf_path))
fig.savefig(os.path.join(output_dir,png_path), dpi=200)

# (svg_path, pdf_path, png_path)