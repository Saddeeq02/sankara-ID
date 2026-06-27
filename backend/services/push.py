import firebase_admin
from firebase_admin import credentials, messaging
import os
import json

# Initialize Firebase Admin
try:
    env_json = os.getenv("FIREBASE_ADMIN_JSON")
    if env_json:
        cred_dict = json.loads(env_json)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin initialized from ENV.")
    else:
        cred_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-admin.json')
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin initialized from file.")
        else:
            print(f"Firebase Admin credentials NOT FOUND!")
except Exception as e:
    print(f"Error initializing Firebase Admin: {e}")

def send_push_notification(token: str, title: str, body: str, data: dict = None):
    if not token:
        return False
        
    try:
        # See documentation on defining a message payload.
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data if data else {},
            token=token,
        )

        # Send a message to the device corresponding to the provided registration token.
        response = messaging.send(message)
        print('Successfully sent message:', response)
        return True
    except Exception as e:
        print('Error sending message:', e)
        return False
