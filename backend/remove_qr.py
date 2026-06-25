import cv2
import numpy as np

img_path = "/home/fox/sankara_id/backend/uploads/techco_bg.png"
img = cv2.imread(img_path)

if img is not None:
    detector = cv2.QRCodeDetector()
    data, bbox, _ = detector.detectAndDecode(img)
    
    if bbox is not None:
        print("Found QR code at:", bbox)
        # Bounding box is typically an array of 4 points
        points = bbox[0].astype(int)
        
        # Calculate bounding box
        x_min = np.min(points[:, 0])
        x_max = np.max(points[:, 0])
        y_min = np.min(points[:, 1])
        y_max = np.max(points[:, 1])
        
        # Add some padding
        pad = 10
        x_min = max(0, x_min - pad)
        x_max = min(img.shape[1], x_max + pad)
        y_min = max(0, y_min - pad)
        y_max = min(img.shape[0], y_max + pad)
        
        # Get average color around the box to paint over it
        avg_color = np.mean(img[max(0, y_min-20):y_min, x_min:x_max], axis=(0, 1))
        
        # Paint over it
        cv2.rectangle(img, (x_min, y_min), (x_max, y_max), avg_color, -1)
        
        # Save it
        cv2.imwrite(img_path, img)
        print("QR code painted over successfully!")
    else:
        print("No QR code found in the image using cv2.QRCodeDetector.")
else:
    print("Could not read image.")
