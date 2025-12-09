from ultralytics import YOLO

# Load model once when module is imported
print("Loading YOLOv8 Model...")
model = YOLO("yolov8n.pt") 

def detect_phones(frame):
    """
    Detects phones in the frame using YOLOv8.
    Returns list of boxes: [x1, y1, x2, y2]
    """
    results = model(frame, verbose=False, conf=0.4) # Confidence threshold 0.4
    phone_boxes = []

    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls = int(box.cls[0])
            # COCO Class 67 is 'cell phone'
            if cls == 67: 
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                phone_boxes.append([x1, y1, x2, y2])
    
    return phone_boxes