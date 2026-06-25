import qrcode
qr = qrcode.QRCode()
qr.add_data("test")
qr.make(fit=True)
try:
    img = qr.make_image(fill_color="white", back_color="transparent")
    print("transparent worked")
except Exception as e:
    print(f"transparent failed: {e}")
