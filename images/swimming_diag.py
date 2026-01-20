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

client = "Extension"+ "\n" + "Client"
server = "DIY-MOD"+ "\n" + " Server"
celery = "Celery" + "\n" + " Workers" #+ "\n" + "(Async)"
# Config
T_MIN, T_MAX = 0, 32
lanes = [
    {"name": client, "y": 2},
    {"name": server, "y": 1},
    {"name": celery, "y": 0},
]
lane_blocks = {
    client: [
        ("Intercept" +"\n"+ "Batch" +"\n"+ "(N posts)", .00, 1.10, "critical"),
        ("Recv." +"\n"+ "Batch", 13.50, 15.50, "critical"),
        ("Apply" +"\n"+ "CSS", 15.50, 17.00, "critical"),
        ("Polling for"+"\n"+ "img Resource", 17.20, 28.20, "async"),
        ("Image" +"\n"+ "Renders", 28.20, 32.00, "async"),
    ],
    server: [
        ("Parse" + "\n" + "Req.", 1.00, 2.00, "critical"),
        ("Text+img" + "\n" + "Analysis", 2, 5.00, "critical"),
        # ("Image" + "\n" + "analysis", 2, 5.00, "critical"),
        ("Apply text" + "\n" + "Interventions", 5.00, 9.00, "critical"),
        ("Dispatch" + "\n" + "img Proc.", 9.00, 11.00, "critical"),
        ("Return" + "\n" + "Batch", 11.00, 13.00, "critical"),
    ],
    celery: [
        ("", 9.50, 10.50, "async"),
        ("Generate" + "\n" + "K Candidates", 10.50, 17.00, "async"),
        ("Score" + "\n" + "K Candidates", 17.00, 21.00, "async"),
        ("Select best+" + "\n" + "Cache", 21.00, 25.00, "async"),
        ("Available" + "\n" + "for Polling", 25.00, 31.50, "async"),
    ],
}
arrows = [
    (1.00, client, server, "Request"+"\n"+"(Batch of N)",'solid'),
    (10.00, server, celery, "Forward"+"\n"+"Processing",'solid'),
    (13.150, server, client, "Response"+"\n"+"(text mods + tokens)",'solid'),
    (21.00, client, celery, "Attempt:1"+"\n"+("Unsuccessful"),'dashed'),
    (28.00, client, celery, "Attempt:2"+"\n"+("Successful"),'solid'),
    (28.90, celery, client, "Ready:"+"\n"+"Xformation"+"\n"+"+Metadata",'solid'),
]




vlines = [] #[0, 5, 10, 15, 20]

mpl.rcParams['pdf.fonttype'] = 42
mpl.rcParams['ps.fonttype'] = 42

fig, ax = plt.subplots(figsize=(14, 6), dpi=150)
lane_height = 0.7
lane_gap = 0.35
text_bbox = dict(facecolor='white', alpha=0.99, boxstyle='round,pad=0.45', edgecolor='0.25')
text_bbox_2 = dict(facecolor='white', alpha=0.99, boxstyle='round,pad=0.15', edgecolor='1')
# Lane backgrounds and labels
for lane in lanes:
    y = lane["y"]
    ax.add_patch(Rectangle((T_MIN, y - lane_height/2 - lane_gap/2),
                           T_MAX - T_MIN, lane_height + lane_gap,
                           fill=False, linewidth=0.6, edgecolor='0.85'))
    ax.text(T_MIN - 0.7, y, lane["name"], va='center', ha='right', fontsize=14, bbox=text_bbox_2)

def draw_block(y, t0, t1, label, style):
    font_size=13 if t0==13.50 else 13
    width = max(t1 - t0, 0.05)
    hatch = '////' if style == "critical" else '...'
    rect = Rectangle((t0, y - lane_height/2), width, lane_height,
                     facecolor='white', edgecolor='black', hatch=hatch, linewidth=1.75)
    ax.add_patch(rect)
    # center the text horizontally in the time window, and vertically in the lane
    x_center = (t0 + t1) / 2.0
    ax.text(x_center, y, label,
            va='center', ha='center', fontsize=font_size, clip_on=True, wrap=True, bbox=text_bbox)

for lane in lanes:
    y = lane["y"]
    for (label, t0, t1, style) in lane_blocks.get(lane["name"], []):
        draw_block(y, t0, t1, label, style)

def lane_y(name):
    for l in lanes:
        if l["name"] == name:
            return l["y"]
    raise ValueError(name)

# use the style when drawing
for t, src, dst, text, style in arrows:
    y0, y1 = lane_y(src), lane_y(dst)
    x1=t
    y_mid=(y0+y1)/2
    x_mid=(t+x1)/2
    arrow_color = 'black'
    arrow_width = 1.0
    if t==13.150:
        y1=y1-0.25
        x1=t+0.75
        x_mid=x_mid+0.55
        y_mid=y_mid-0.20
    if t==1.0:
        y1=y1+0.15
        x1=t-0.55
    if t==28.90:
        y_mid=y_mid-0.25
        x_mid=x_mid+0.75
        x1=t+.25
        y1=y1-0.15
    if t==28.00:
        y_mid=y_mid+0.25
        x_mid=x_mid-0.95
        x1=t-0.55
        y1=y1+0.15
        arrow_color='green'
        arrow_width=2
    if t==21.00:
        x_mid=x_mid-0.85
        arrow_color='red'
        arrow_width=2


    #     y1=y1-0.25
    #     x1=t+0.75
    # if t==13.150:
    #     y1=y1-0.25
    #     x1=t+0.75

    custom_dashed = (2, (10, 3))
    arrow = FancyArrowPatch((t, y0), (x1, y1),
                            arrowstyle='-|>', mutation_scale=30,
                            linewidth=arrow_width, color=arrow_color,
                            linestyle=custom_dashed if style == 'dashed' else '-',
                            connectionstyle="arc3,rad=0.2")
    ax.add_patch(arrow)
    ax.text(x_mid + 0.2, y_mid, text, fontsize=13., va='center', ha='left',color=arrow_color)

for x in vlines:
    ax.axvline(x=x, ymin=0.02, ymax=0.98, linestyle='-', linewidth=0.6, color='0.7')
    ax.text(x, -0.45, f"T={x}s", fontsize=11, ha='center', va='top')

ax.set_xlim(T_MIN - 0.5, T_MAX + 0.5)
ax.set_ylim(-0.8, 2.8)
ax.set_yticks([])
ax.set_xticks([])
ax.set_xlabel("Time \u2192", fontsize=14)  # "Time →"
# ax.set_xlabel("Time (seconds)")
ax.set_title("DIY-MOD: Client–Server–Worker Timing Diagram", fontsize=14)

legend_patches = [
    Rectangle((0,0),2,2, facecolor='white', edgecolor='black', hatch='////', linewidth=1.0),
    Rectangle((0,0),2,2, facecolor='white', edgecolor='black', hatch='...', linewidth=1.0),
]
ax.legend(legend_patches, ["Critical path (blocks initial response)", "Asynchronous (non‑blocking)"],
          loc='upper right', fontsize=14, frameon=False)

fig.tight_layout()

# svg_path = "~/Desktop/images/DIY-MOD_swimlane.svg"
pdf_path = "DIY-MOD_swimlane.pdf"
png_path = "DIY-MOD_swimlane.png"

fig.savefig(os.path.join(output_dir,pdf_path))
fig.savefig(os.path.join(output_dir,png_path), dpi=200)

# (svg_path, pdf_path, png_path)