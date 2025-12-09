import eventlet
eventlet.monkey_patch()

import sys
import os
import base64
import cv2
import numpy as np
import io
from PIL import Image
from flask import Flask
from flask_socketio import SocketIO, emit

# Current folder ko path me add karo taaki import sahi se chalein
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import face_service
import phone_service

app = Flask(__name__)
# Ping timeout aur ping interval badhaya hai stability ke liye
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet', ping_timeout=60)

# Load faces on startup
face_service.load_known_faces()

def decode_image(base64_string):
    if "base64," in base64_string:
        base64_string = base64_string.split(",")[1]
    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data))
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

@socketio.on('connect')
def handle_connect():
    print("Client connected")

@socketio.on('process_frame')
def handle_frame(data):
    frame_data = data.get('image')
    if not frame_data:
        return

    # 1. Prepare Image
    frame = decode_image(frame_data)
    
    # Optimization: Resize for Face Recognition (Speed up 4x)
    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

    # 2. Run Detections
    faces = face_service.detect_faces(rgb_small_frame) # Returns boxes in 1/4th scale
    phone_boxes = phone_service.detect_phones(frame)   # Returns boxes in full scale

    processed_faces = []
    alerts = []
    phone_detected = len(phone_boxes) > 0

    # 3. Match Logic
    for face in faces:
        name = face['name']
        # Rescale face box to original size (x4)
        top, right, bottom, left = face['box']
        top *= 4
        right *= 4
        bottom *= 4
        left *= 4
        
        # Format for frontend
        face_data = {
            "name": name,
            "box": [left, top, right, bottom], # x1, y1, x2, y2
            "is_using_phone": False
        }

        # Check overlap/distance with any detected phone
        if phone_detected:
            face_center_x = (left + right) / 2
            face_center_y = (top + bottom) / 2

            for p_box in phone_boxes:
                px1, py1, px2, py2 = p_box
                phone_center_x = (px1 + px2) / 2
                phone_center_y = (py1 + py2) / 2

                # Simple distance check (e.g. within 400 pixels)
                dist = np.sqrt((face_center_x - phone_center_x)**2 + (face_center_y - phone_center_y)**2)
                
                if dist < 400: # Threshold adjust kar sakte ho
                    face_data["is_using_phone"] = True
                    if name != "Unknown":
                        alerts.append({
                            "type": "phone_detected",
                            "message": f"📱 {name} is using a phone!",
                            "student": name,
                            "severity": "high"
                        })
                    else:
                         alerts.append({
                            "type": "phone_detected",
                            "message": "📱 Unknown person using phone!",
                            "student": "Unknown",
                            "severity": "medium"
                        })

        processed_faces.append(face_data)

    # 4. Send Result
    response = {
        "faces": processed_faces,
        "phone_detected": phone_detected,
        "alerts": alerts
    }
    emit('analysis_result', response)

if __name__ == '__main__':
    print("Starting EduPulse AI Backend...")
    socketio.run(app, debug=True, port=5000)