from services.pdf_generator import generate_id_card
import traceback

try:
    generate_id_card(1, "Test User", "Manager", "IT", template="agri")
    print("Success")
except Exception as e:
    traceback.print_exc()
