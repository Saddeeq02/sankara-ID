from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import inch
from reportlab.lib.utils import ImageReader
import qrcode
import os
import requests
import random
import math
from io import BytesIO

# ID Card Dimensions (standard CR80 is 2.125" x 3.375")
CARD_WIDTH = 2.125 * inch
CARD_HEIGHT = 3.375 * inch

def draw_gradient(c, width, height):
    steps = 150
    # From top (sky blue) to bottom (harvest gold)
    for i in range(steps):
        ratio = i / steps
        r = 0.46 * (1 - ratio) + 0.95 * ratio
        g = 0.78 * (1 - ratio) + 0.72 * ratio
        b = 0.93 * (1 - ratio) + 0.02 * ratio
        c.setFillColorRGB(r, g, b, 1)
        y = height - (ratio * height)
        c.rect(0, y - (height/steps) - 0.5, width, (height/steps) + 1, fill=1, stroke=0)

def draw_bottom_gradient(c, x, y, width, height):
    steps = 100
    # From top (terracotta) to bottom (dark earth)
    for i in range(steps):
        ratio = i / steps
        r = 0.35 * (1 - ratio) + 0.15 * ratio
        g = 0.16 * (1 - ratio) + 0.07 * ratio
        b = 0.12 * (1 - ratio) + 0.05 * ratio
        c.setFillColorRGB(r, g, b, 1)
        cur_y = y + height - (ratio * height)
        c.rect(x, cur_y - (height/steps) - 0.5, width, (height/steps) + 1, fill=1, stroke=0)

def draw_crop_watermarks(c, width, height):
    c.saveState()
    c.setStrokeColorRGB(1, 1, 1, 0.2)
    c.setFillColorRGB(1, 1, 1, 0.2)
    c.setLineWidth(1)
    
    # Left crop stalks
    lx, ly = 20, 65
    c.line(lx, ly, lx + 8, ly + 35)
    for i in range(3):
        c.circle(lx + 4, ly + 10 + i*8, 2, fill=1, stroke=0)
        c.circle(lx + 8, ly + 10 + i*8, 2, fill=1, stroke=0)
        
    lx2, ly2 = 30, 60
    c.line(lx2, ly2, lx2 + 4, ly2 + 25)
    for i in range(2):
        c.circle(lx2 + 2, ly2 + 8 + i*6, 1.5, fill=1, stroke=0)
        c.circle(lx2 + 6, ly2 + 8 + i*6, 1.5, fill=1, stroke=0)

    # Right crop stalks
    rx, ry = width - 20, 65
    c.line(rx, ry, rx - 8, ry + 35)
    for i in range(3):
        c.circle(rx - 4, ry + 10 + i*8, 2, fill=1, stroke=0)
        c.circle(rx - 8, ry + 10 + i*8, 2, fill=1, stroke=0)
        
    rx2, ry2 = width - 30, 60
    c.line(rx2, ry2, rx2 - 4, ry2 + 25)
    for i in range(2):
        c.circle(rx2 - 2, ry2 + 8 + i*6, 1.5, fill=1, stroke=0)
        c.circle(rx2 - 6, ry2 + 8 + i*6, 1.5, fill=1, stroke=0)

    # Circular arcs top right
    c.setStrokeColorRGB(1, 1, 1, 0.15)
    c.setLineWidth(1)
    c.arc(width - 30, height - 70, width + 30, height, 180, 270)
    c.arc(width - 50, height - 90, width + 50, height + 20, 180, 270)

    c.restoreState()

def draw_techco_gradient(c, width, height):
    # Deep black/purple to teal
    steps = 150
    for i in range(steps):
        ratio = i / steps
        r = 0.05 * (1 - ratio) + 0.05 * ratio
        g = 0.05 * (1 - ratio) + 0.55 * ratio
        b = 0.15 * (1 - ratio) + 0.60 * ratio
        c.setFillColorRGB(r, g, b, 1)
        y = height - (ratio * height)
        c.rect(0, y - (height/steps) - 0.5, width, (height/steps) + 1, fill=1, stroke=0)

def draw_techco_mesh(c, width, height):
    c.saveState()
    c.setStrokeColorRGB(1, 1, 1, 0.4)
    c.setFillColorRGB(1, 1, 1, 0.4)
    c.setLineWidth(0.5)
    
    # Draw some nodes representing a network mesh
    nodes = [
        (10, height - 20), (50, height - 10), (90, height - 40), (140, height - 20),
        (20, height - 70), (70, height - 80), (120, height - 60), (150, height - 90),
        (40, height - 110), (100, height - 120), (140, height - 130)
    ]
    for x, y in nodes:
        c.circle(x, y, 1.5, fill=1, stroke=0)
        
    # Connect them
    connections = [(0,1), (1,3), (0,4), (1,2), (2,3), (4,5), (2,6), (3,7), (5,8), (6,9), (7,10), (8,9), (9,10), (4,8), (5,6), (6,7)]
    for i, j in connections:
        n1, n2 = nodes[i], nodes[j]
        c.line(n1[0], n1[1], n2[0], n2[1])
        
    c.restoreState()

def draw_social_icons(c, cx, y, box_color=(0.12, 0.16, 0.22)):
    size = 14
    centers = [cx - 36, cx - 12, cx + 12, cx + 36]
    
    c.setLineWidth(0.8)
    
    # Draw dark rounded boxes for each icon
    for x in centers:
        c.setFillColorRGB(*box_color, 1)
        c.roundRect(x - size/2, y - size/2, size, size, 4, fill=1, stroke=0)
        
    c.setStrokeColorRGB(0.8, 0.8, 0.8, 1)
    c.setFillColorRGB(0.8, 0.8, 0.8, 1)
    
    # 1. Facebook
    fx, fy = centers[0], y
    c.saveState()
    c.setFont("Helvetica-Bold", 10)
    t = c.beginText(fx - 2.5, fy - 3.5)
    t.setTextRenderMode(1)
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
    p.curveTo(tx - 2, ty + 4, tx + 1.5, ty + 4, tx + 3.5, ty + 2)
    p.curveTo(tx + 1.5, ty + 1, tx + 0.5, ty - 1.5, tx + 3.5, ty - 4)
    p.curveTo(tx + 0.5, ty - 2.5, tx - 1, ty - 4, tx - 3, ty - 4)
    p.curveTo(tx - 5, ty - 1.5, tx - 5, ty + 1, tx - 3.5, ty + 0.5)
    c.drawPath(p, fill=0, stroke=1)
    c.restoreState()
    
    # 4. LinkedIn
    lx, ly = centers[3], y
    c.saveState()
    c.setFont("Helvetica-Bold", 8)
    t2 = c.beginText(lx - 3.5, ly - 3)
    t2.setTextRenderMode(1)
    t2.textOut("in")
    c.drawText(t2)
    c.restoreState()

def generate_id_card(staff_id: int, full_name: str, role: str, department: str, picture_path: str = None, template: str = "agri") -> str:
    import tempfile
    output_dir = tempfile.gettempdir()
    file_path = os.path.join(output_dir, f"staff_{staff_id}_id.pdf")

    c = canvas.Canvas(file_path, pagesize=(CARD_WIDTH, CARD_HEIGHT))
    logo_path = "uploads/logo.png"

    if template == "techco":
        # ==========================
        # --- FRONT PAGE (Template 2) ---
        # ==========================
        
        # Base White Card
        c.setFillColorRGB(1, 1, 1, 1)
        c.rect(0, 0, CARD_WIDTH, CARD_HEIGHT, fill=1, stroke=0)

        # White Footer Area (Bottom ~55%)
        footer_height = CARD_HEIGHT * 0.55

        # Inset Background Gradient (White margins on left, right, top)
        c.saveState()
        margin = 14
        grad_rect = c.beginPath()
        grad_rect.rect(margin, footer_height, CARD_WIDTH - 2*margin, CARD_HEIGHT - footer_height - margin)
        c.clipPath(grad_rect)
        
        bg_img_path = "uploads/techco_bg_fixed.png"
        if os.path.exists(bg_img_path):
            c.drawImage(bg_img_path, margin, footer_height, width=CARD_WIDTH - 2*margin, height=CARD_HEIGHT - footer_height - margin, preserveAspectRatio=False)
            # Add a slight dark tint
            c.setFillColorRGB(0.05, 0.1, 0.2, 0.4)
            c.rect(margin, footer_height, CARD_WIDTH - 2*margin, CARD_HEIGHT - footer_height - margin, fill=1, stroke=0)
        else:
            draw_techco_gradient(c, CARD_WIDTH, CARD_HEIGHT)
            
        c.restoreState()

        # Bottom Inset Area (Solid Dark Matched Color)
        c.saveState()
        bottom_rect = c.beginPath()
        bottom_rect.rect(margin, margin, CARD_WIDTH - 2*margin, footer_height - margin)
        c.clipPath(bottom_rect)
        c.setFillColorRGB(0.05, 0.1, 0.15, 1) # Dark navy/teal
        c.rect(margin, margin, CARD_WIDTH - 2*margin, footer_height - margin, fill=1, stroke=0)
        c.restoreState()

        # Top Logo
        logo_w, logo_h = 70, 20
        # White glow/pill box behind the logo for perfect clarity
        c.setFillColorRGB(1, 1, 1, 0.85)
        c.roundRect((CARD_WIDTH - logo_w - 20) / 2, CARD_HEIGHT - margin - 35 - 5, logo_w + 20, logo_h + 10, 8, fill=1, stroke=0)
        
        if os.path.exists(logo_path):
            c.drawImage(logo_path, (CARD_WIDTH - logo_w) / 2, CARD_HEIGHT - margin - 35, width=logo_w, height=logo_h, mask='auto', preserveAspectRatio=True)
        else:
            c.setFillColorRGB(1, 1, 1, 1)
            c.setFont("Helvetica-Bold", 10)
            c.drawCentredString(CARD_WIDTH / 2, CARD_HEIGHT - margin - 25, "SANKARA Nigeria Limited")

        # Photo (Perfect Circle)
        photo_r = 40
        photo_x = CARD_WIDTH / 2
        photo_y = footer_height
        
        # Thick white border
        c.setFillColorRGB(1, 1, 1, 1)
        c.circle(photo_x, photo_y, photo_r + 4, fill=1, stroke=0)
        
        if picture_path:
            img_data = picture_path
            if picture_path.startswith('http'):
                try:
                    resp = requests.get(picture_path)
                    if resp.status_code == 200:
                        img_data = ImageReader(BytesIO(resp.content))
                except:
                    pass
            elif os.path.exists(picture_path):
                img_data = picture_path
                
        c.saveState()
        p = c.beginPath()
        p.roundRect(photo_x - photo_r, photo_y - photo_r, photo_r * 2, photo_r * 2, photo_r)
        c.clipPath(p)
        if picture_path and img_data:
            try:
                c.drawImage(img_data, photo_x - photo_r, photo_y - photo_r, width=photo_r*2, height=photo_r*2)
            except:
                c.setFillColorRGB(0.9, 0.9, 0.9, 1)
                c.circle(photo_x, photo_y, photo_r, fill=1)
        else:
            c.setFillColorRGB(0.85, 0.9, 0.95, 1)
            c.circle(photo_x, photo_y, photo_r, fill=1, stroke=0)
            c.setFillColorRGB(0.6, 0.7, 0.8, 1)
            c.circle(photo_x, photo_y + 10, 10, fill=1)
            c.circle(photo_x, photo_y - 15, 20, fill=1)
        c.restoreState()

        # Typography
        text_y = photo_y - photo_r - 18
        
        c.setFillColorRGB(1, 1, 1, 1) # White name for dark background
        c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(CARD_WIDTH / 2, text_y, full_name.title())

        c.setFillColorRGB(0.6, 0.8, 0.85, 1) # Soft light teal for role
        c.setFont("Helvetica", 8)
        c.drawCentredString(CARD_WIDTH / 2, text_y - 10, role.title())

        # Line Separator
        line_y = text_y - 18
        c.setStrokeColorRGB(0.3, 0.4, 0.5, 1)
        c.setLineWidth(1)
        c.line(30, line_y, CARD_WIDTH - 30, line_y)
        c.setFillColorRGB(0.3, 0.4, 0.5, 1)
        c.circle(30, line_y, 1.5, fill=1, stroke=0)
        c.circle(CARD_WIDTH - 30, line_y, 1.5, fill=1, stroke=0)

        # ID Details
        info_y = line_y - 10
        c.setFillColorRGB(0.8, 0.8, 0.8, 1) # Bright grey for ID
        c.setFont("Helvetica-Bold", 7.5)
        c.drawCentredString(CARD_WIDTH / 2, info_y, f"ID: SANK-{staff_id:05d}")
        
        c.setFillColorRGB(0.7, 0.7, 0.7, 1) # Light grey for email
        c.setFont("Helvetica", 6.5)
        c.drawCentredString(CARD_WIDTH / 2, info_y - 10, "sankaranigerialimited@gmail.com")

        # Bottom Accent Tab (Website)
        c.setFillColorRGB(0.0, 0.35, 0.45, 1)
        c.rect(margin, margin, CARD_WIDTH - 2*margin, 12, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1, 1)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawCentredString(CARD_WIDTH / 2, margin + 4, "sankaranigerialimited.com")

        # Thick Edge Border Line
        c.setStrokeColorRGB(0.0, 0.35, 0.45, 1)
        c.setLineWidth(6.0)
        c.rect(3, 3, CARD_WIDTH - 6, CARD_HEIGHT - 6, fill=0, stroke=1)

        c.showPage()
        
        # ==========================
        # --- BACK PAGE (Template 2) ---
        # ==========================
        # Base White Card
        c.setFillColorRGB(1, 1, 1, 1)
        c.rect(0, 0, CARD_WIDTH, CARD_HEIGHT, fill=1, stroke=0)

        # Inset Background: Gradient top
        margin = 14
        white_bg_height = CARD_HEIGHT * 0.45
        
        c.saveState()
        grad_rect2 = c.beginPath()
        grad_rect2.rect(margin, white_bg_height, CARD_WIDTH - 2*margin, CARD_HEIGHT - white_bg_height - margin)
        c.clipPath(grad_rect2)
        bg_img_path = "uploads/techco_bg_fixed.png"
        if os.path.exists(bg_img_path):
            c.drawImage(bg_img_path, margin, white_bg_height, width=CARD_WIDTH - 2*margin, height=CARD_HEIGHT - white_bg_height - margin, preserveAspectRatio=False)
            c.setFillColorRGB(0.05, 0.1, 0.2, 0.4)
            c.rect(margin, white_bg_height, CARD_WIDTH - 2*margin, CARD_HEIGHT - white_bg_height - margin, fill=1, stroke=0)
        else:
            draw_techco_gradient(c, CARD_WIDTH, CARD_HEIGHT)
            
        c.restoreState()
        
        # Bottom Inset Area (Solid Dark Matched Color)
        c.saveState()
        bottom_rect2 = c.beginPath()
        bottom_rect2.rect(margin, margin, CARD_WIDTH - 2*margin, white_bg_height - margin)
        c.clipPath(bottom_rect2)
        c.setFillColorRGB(0.05, 0.1, 0.15, 1)
        c.rect(margin, margin, CARD_WIDTH - 2*margin, white_bg_height - margin, fill=1, stroke=0)
        c.restoreState()

        # Social Icons
        icon_y = CARD_HEIGHT - margin - 25
        draw_social_icons(c, CARD_WIDTH / 2, icon_y)

        c.setFillColorRGB(1, 1, 1, 1)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawCentredString(CARD_WIDTH / 2, icon_y - 18, "@sankaranigerianlimited")


        # Center QR Code
        qr_size = 85
        qr_y = CARD_HEIGHT - 155
        qr_x = (CARD_WIDTH - qr_size) / 2
        
        qr_data = f"https://sankaranigerialimited.com/?id={staff_id}"
        qr_obj = qrcode.QRCode(box_size=10, border=1)
        qr_obj.add_data(qr_data)
        qr_obj.make(fit=True)
        # Match the background color (0.05, 0.1, 0.15) which is #0d1a26
        qr_img = qr_obj.make_image(fill_color="white", back_color="#0d1a26")
        
        qr_buffer = BytesIO()
        qr_img.save(qr_buffer, format="PNG")
        qr_buffer.seek(0)
        qr_image = ImageReader(qr_buffer)
        
        c.drawImage(qr_image, qr_x, qr_y, width=qr_size, height=qr_size)

        # Typography
        text_y = qr_y - 18
        
        c.setFillColorRGB(0.6, 0.8, 0.85, 1) # Teal accent for phones
        c.setFont("Helvetica-Bold", 7.5)
        c.drawCentredString(CARD_WIDTH / 2, text_y, "Sales: +234 809 993 3644")
        c.drawCentredString(CARD_WIDTH / 2, text_y - 12, "Parts: +234 802 648 7775")

        # Barcode representation
        import random
        bar_y = 36
        c.setFillColorRGB(1, 1, 1, 1) # White lines!
        random.seed(staff_id)
        bx = 40
        while bx < (CARD_WIDTH - 40):
            w = random.choice([0.75, 1.25, 2.0])
            if bx + w <= (CARD_WIDTH - 40):
                c.rect(bx, bar_y, w, 14, fill=1, stroke=0)
            bx += w + random.choice([0.75, 1.0])

        # Bottom Accent Tab (Website)
        c.setFillColorRGB(0.0, 0.35, 0.45, 1)
        c.rect(margin, margin, CARD_WIDTH - 2*margin, 12, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1, 1)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawCentredString(CARD_WIDTH / 2, margin + 4, "sankaranigerialimited.com")

        # Thick Edge Border Line
        c.setStrokeColorRGB(0.0, 0.35, 0.45, 1)
        c.setLineWidth(6.0)
        c.rect(3, 3, CARD_WIDTH - 6, CARD_HEIGHT - 6, fill=0, stroke=1)

        c.save()
        return file_path

    else:
        # ==========================
        # --- FRONT PAGE (Template 1) ---
        # ==========================
        
        # Base White Card
        c.setFillColorRGB(1, 1, 1, 1)
        c.rect(0, 0, CARD_WIDTH, CARD_HEIGHT, fill=1, stroke=0)

        # White Footer Area (Bottom ~55%)
        footer_height = CARD_HEIGHT * 0.55
        margin = 14

        # Inset Background Gradient (White margins all around)
        c.saveState()
        grad_rect = c.beginPath()
        grad_rect.rect(margin, margin, CARD_WIDTH - 2*margin, CARD_HEIGHT - 2*margin)
        c.clipPath(grad_rect)
        
        draw_gradient(c, CARD_WIDTH, CARD_HEIGHT)
        draw_crop_watermarks(c, CARD_WIDTH, CARD_HEIGHT)
        c.restoreState()

        # Bottom Accent Tab (Amber)
        c.setFillColorRGB(0.90, 0.45, 0.05, 1)
        c.rect(margin, margin, CARD_WIDTH - 2*margin, 12, fill=1, stroke=0)

        # Top Logo
        logo_w, logo_h = 70, 20
        # White glow/pill box behind the logo for perfect clarity
        c.setFillColorRGB(1, 1, 1, 0.85)
        c.roundRect((CARD_WIDTH - logo_w - 20) / 2, CARD_HEIGHT - margin - 35 - 5, logo_w + 20, logo_h + 10, 8, fill=1, stroke=0)
        
        if os.path.exists(logo_path):
            c.drawImage(logo_path, (CARD_WIDTH - logo_w) / 2, CARD_HEIGHT - margin - 35, width=logo_w, height=logo_h, mask='auto', preserveAspectRatio=True)
        else:
            c.setFillColorRGB(1, 1, 1, 1)
            c.setFont("Helvetica-Bold", 10)
            c.drawCentredString(CARD_WIDTH / 2, CARD_HEIGHT - margin - 25, "SANKARA Nigeria Limited")

        # Photo (Perfect Circle)
        photo_r = 40
        photo_x = CARD_WIDTH / 2
        photo_y = footer_height
        
        # Thick white border
        c.setFillColorRGB(1, 1, 1, 1)
        c.circle(photo_x, photo_y, photo_r + 4, fill=1, stroke=0)
        
        if picture_path:
            img_data = picture_path
            if picture_path.startswith('http'):
                try:
                    resp = requests.get(picture_path)
                    if resp.status_code == 200:
                        img_data = ImageReader(BytesIO(resp.content))
                except:
                    pass
            elif os.path.exists(picture_path):
                img_data = picture_path
                
        c.saveState()
        p = c.beginPath()
        p.roundRect(photo_x - photo_r, photo_y - photo_r, photo_r * 2, photo_r * 2, photo_r)
        c.clipPath(p)
        if picture_path and img_data:
            try:
                c.drawImage(img_data, photo_x - photo_r, photo_y - photo_r, width=photo_r*2, height=photo_r*2)
            except:
                c.setFillColorRGB(0.9, 0.9, 0.9, 1)
                c.circle(photo_x, photo_y, photo_r, fill=1)
        else:
            c.setFillColorRGB(0.85, 0.9, 0.95, 1)
            c.circle(photo_x, photo_y, photo_r, fill=1, stroke=0)
            c.setFillColorRGB(0.6, 0.7, 0.8, 1)
            c.circle(photo_x, photo_y + 10, 10, fill=1)
            c.circle(photo_x, photo_y - 15, 20, fill=1)
        c.restoreState()

        # Typography
        text_y = photo_y - photo_r - 18
        
        # Text color: Dark Charcoal/Brown for light gold background
        text_color = (0.2, 0.1, 0.05)
        
        c.setFillColorRGB(*text_color, 1)
        c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(CARD_WIDTH / 2, text_y, full_name.title())

        c.setFillColorRGB(0.35, 0.2, 0.1, 1) # Medium brown for role
        c.setFont("Helvetica", 8)
        c.drawCentredString(CARD_WIDTH / 2, text_y - 10, role.title())

        # Line Separator
        line_y = text_y - 18
        c.setStrokeColorRGB(0.35, 0.2, 0.1, 1)
        c.setLineWidth(1)
        c.line(30, line_y, CARD_WIDTH - 30, line_y)
        c.setFillColorRGB(0.35, 0.2, 0.1, 1)
        c.circle(30, line_y, 1.5, fill=1, stroke=0)
        c.circle(CARD_WIDTH - 30, line_y, 1.5, fill=1, stroke=0)

        # ID Details
        info_y = line_y - 10
        c.setFillColorRGB(*text_color, 1)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawCentredString(CARD_WIDTH / 2, info_y, f"ID: SANK-{staff_id:05d}")
        
        c.setFillColorRGB(0.35, 0.2, 0.1, 1)
        c.setFont("Helvetica", 6.5)
        c.drawCentredString(CARD_WIDTH / 2, info_y - 10, "sankaranigerialimited@gmail.com")

        # Bottom Accent Tab (Website)
        c.setFillColorRGB(0.90, 0.45, 0.05, 1)
        c.rect(margin, margin, CARD_WIDTH - 2*margin, 12, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1, 1)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawCentredString(CARD_WIDTH / 2, margin + 4, "sankaranigerialimited.com")

        # Edge Border Line
        c.setStrokeColorRGB(0.90, 0.45, 0.05, 1)
        c.setLineWidth(1.5)
        c.rect(1.5, 1.5, CARD_WIDTH - 3, CARD_HEIGHT - 3, fill=0, stroke=1)

        c.showPage()
        
        # ==========================
        # --- BACK PAGE (Template 1) ---
        # ==========================
        # Base White Card
        c.setFillColorRGB(1, 1, 1, 1)
        c.rect(0, 0, CARD_WIDTH, CARD_HEIGHT, fill=1, stroke=0)

        # Inset Background: Gradient top
        margin = 14
        white_bg_height = CARD_HEIGHT * 0.45
        
        # Inset Background: Gradient everywhere
        c.saveState()
        grad_rect2 = c.beginPath()
        grad_rect2.rect(margin, margin, CARD_WIDTH - 2*margin, CARD_HEIGHT - 2*margin)
        c.clipPath(grad_rect2)
        
        draw_gradient(c, CARD_WIDTH, CARD_HEIGHT)
        draw_crop_watermarks(c, CARD_WIDTH, CARD_HEIGHT)
            
        c.restoreState()

        # Social Icons
        icon_y = CARD_HEIGHT - margin - 25
        # Pass the deep earth color for the social icon boxes
        draw_social_icons(c, CARD_WIDTH / 2, icon_y, box_color=(0.25, 0.10, 0.05))

        # Text color for light gold background
        text_color = (0.2, 0.1, 0.05)
        
        c.setFillColorRGB(*text_color, 1)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawCentredString(CARD_WIDTH / 2, icon_y - 18, "@sankaranigerianlimited")

        # Center QR Code
        qr_size = 85
        qr_y = CARD_HEIGHT - 155
        qr_x = (CARD_WIDTH - qr_size) / 2
        
        qr_data = f"https://sankaranigerialimited.com/?id={staff_id}"
        qr_obj = qrcode.QRCode(box_size=10, border=1)
        qr_obj.add_data(qr_data)
        qr_obj.make(fit=True)
        # Match the background color
        qr_img = qr_obj.make_image(fill_color="#26110D", back_color="white")
        
        qr_buffer = BytesIO()
        qr_img.save(qr_buffer, format="PNG")
        qr_buffer.seek(0)
        qr_image = ImageReader(qr_buffer)
        
        c.drawImage(qr_image, qr_x, qr_y, width=qr_size, height=qr_size)

        # Typography
        text_y = qr_y - 18
        
        c.setFillColorRGB(0.35, 0.2, 0.1, 1) # Medium brown for phones
        c.setFont("Helvetica-Bold", 7.5)
        c.drawCentredString(CARD_WIDTH / 2, text_y, "Sales: +234 809 993 3644")
        c.drawCentredString(CARD_WIDTH / 2, text_y - 12, "Parts: +234 802 648 7775")

        # Bottom Accent Tab (Website)
        c.setFillColorRGB(0.90, 0.45, 0.05, 1)
        c.rect(margin, margin, CARD_WIDTH - 2*margin, 12, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1, 1)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawCentredString(CARD_WIDTH / 2, margin + 4, "sankaranigerialimited.com")

        # Edge Border Line
        c.setStrokeColorRGB(0.90, 0.45, 0.05, 1)
        c.setLineWidth(1.5)
        c.rect(1.5, 1.5, CARD_WIDTH - 3, CARD_HEIGHT - 3, fill=0, stroke=1)

        c.save()
        return file_path
