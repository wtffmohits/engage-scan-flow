import face_recognition
import os
import pickle
import numpy as np

# Paths setup (Relative to this file)
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(CURRENT_DIR, '..', 'data')
STUDENTS_DIR = os.path.join(DATA_DIR, 'students')
ENCODINGS_FILE = os.path.join(DATA_DIR, 'encodings.pkl')

known_face_encodings = []
known_face_names = []

def load_known_faces():
    global known_face_encodings, known_face_names
    
    # 1. Check if encodings.pkl exists to save time
    if os.path.exists(ENCODINGS_FILE):
        print("Loading encodings from cache...")
        with open(ENCODINGS_FILE, 'rb') as f:
            data = pickle.load(f)
            known_face_encodings = data['encodings']
            known_face_names = data['names']
        print(f"Loaded {len(known_face_names)} students from cache.")
        return

    # 2. If no cache, process images from students folder
    print("Processing student images (First Run)...")
    if not os.path.exists(STUDENTS_DIR):
        os.makedirs(STUDENTS_DIR)
        print(f"Warning: '{STUDENTS_DIR}' folder empty or missing.")
        return

    temp_encodings = []
    temp_names = []

    for filename in os.listdir(STUDENTS_DIR):
        if filename.endswith((".jpg", ".png", ".jpeg")):
            name = os.path.splitext(filename)[0].replace("-", " ").title() # "aman-singh" -> "Aman Singh"
            image_path = os.path.join(STUDENTS_DIR, filename)
            
            try:
                image = face_recognition.load_image_file(image_path)
                # Get encoding (assume 1 face per image)
                encs = face_recognition.face_encodings(image)
                if encs:
                    temp_encodings.append(encs[0])
                    temp_names.append(name)
                    print(f"Encoded: {name}")
                else:
                    print(f"Skipping {filename}: No face found.")
            except Exception as e:
                print(f"Error processing {filename}: {e}")

    # 3. Update global variables & Save cache
    known_face_encodings = temp_encodings
    known_face_names = temp_names
    
    with open(ENCODINGS_FILE, 'wb') as f:
        pickle.dump({'encodings': known_face_encodings, 'names': known_face_names}, f)
    print("Encodings saved to cache.")

def detect_faces(rgb_small_frame):
    """
    Returns a list of dicts: {'name': str, 'box': [top, right, bottom, left]}
    Input should be RGB image (not BGR).
    """
    detected_people = []
    
    face_locations = face_recognition.face_locations(rgb_small_frame)
    face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

    for face_encoding, face_loc in zip(face_encodings, face_locations):
        name = "Unknown"
        # Calculate distances to all known faces
        if len(known_face_encodings) > 0:
            face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
            best_match_index = np.argmin(face_distances)
            
            # Threshold: 0.6 is typical, 0.5 is stricter
            if face_distances[best_match_index] < 0.5:
                name = known_face_names[best_match_index]

        detected_people.append({
            "name": name,
            "box": face_loc # (top, right, bottom, left)
        })
        
    return detected_people