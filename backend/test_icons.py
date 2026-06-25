from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import inch

c = canvas.Canvas("test_icons.pdf", pagesize=(200, 200))
cx, y = 100, 100

# Background
c.setFillColorRGB(0.05, 0.1, 0.15)
c.rect(0,0,200,200, fill=1)

size = 16
centers = [cx - 40, cx - 13, cx + 13, cx + 40]

c.setLineWidth(0.8)

# Draw boxes
for x in centers:
    c.setFillColorRGB(0.12, 0.16, 0.22, 1) # dark box
    c.roundRect(x - size/2, y - size/2, size, size, 4, fill=1, stroke=0)
    
c.setStrokeColorRGB(0.8, 0.8, 0.8, 1)
c.setFillColorRGB(0.8, 0.8, 0.8, 1)

# 1. Facebook (hollow text)
fx, fy = centers[0], y
c.saveState()
c.setFont("Helvetica-Bold", 10)
t = c.beginText(fx - 2.5, fy - 3.5)
t.setTextRenderMode(1) # stroke only
t.textOut("f")
c.drawText(t)
c.restoreState()

# 2. Instagram
ix, iy = centers[1], y
c.roundRect(ix - 4, iy - 4, 8, 8, 2, fill=0, stroke=1)
c.circle(ix, iy, 1.8, fill=0, stroke=1)
c.circle(ix + 2, iy + 2, 0.4, fill=1, stroke=0)

# 3. Twitter
tx, ty = centers[2], y
c.saveState()
p = c.beginPath()
p.moveTo(tx - 3.5, ty + 0.5)
p.curveTo(tx - 2, ty + 4, tx + 1.5, ty + 4, tx + 3.5, ty + 2) # Head
p.curveTo(tx + 1.5, ty + 1, tx + 0.5, ty - 1.5, tx + 3.5, ty - 4) # Wing
p.curveTo(tx + 0.5, ty - 2.5, tx - 1, ty - 4, tx - 3, ty - 4) # Belly
p.curveTo(tx - 5, ty - 1.5, tx - 5, ty + 1, tx - 3.5, ty + 0.5) # Tail
c.drawPath(p, fill=0, stroke=1)
c.restoreState()

# 4. LinkedIn (hollow text)
lx, ly = centers[3], y
c.saveState()
c.setFont("Helvetica-Bold", 8)
t2 = c.beginText(lx - 3.5, ly - 3)
t2.setTextRenderMode(1)
t2.textOut("in")
c.drawText(t2)
c.restoreState()

c.save()
print("Icons drawn!")
