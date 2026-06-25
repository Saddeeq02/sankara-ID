import os
from PIL import Image

ref_path = "/home/fox/.gemini/antigravity/brain/76612839-a6ba-48f7-8cd7-3ab40b4c7463/media__1782060566922.png"
img = Image.open(ref_path)

# Let's crop the logo from the front card (left side):
# X: 45 to 255
# Y: 20 to 85
logo = img.crop((45, 20, 255, 85))
logo.save("/home/fox/sankara_id/backend/uploads/logo.png")

# Let's also crop the background styles:
# We can paint a beautiful background gradient in ReportLab itself,
# which is much cleaner than cropping a low-res image.
# We will use ReportLab's drawing capabilities to draw a gorgeous gradient.
print("Logo cropped and saved successfully.")
