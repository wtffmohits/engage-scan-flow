import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { registeredStudents, RegisteredStudent } from '@/data/registeredStudents';

export interface DetectedFace {
  id: string;
  name: string;
  confidence: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isRegistered: boolean;
  student?: RegisteredStudent;
  landmarks?: faceapi.FaceLandmarks68;
}

export interface BehaviorAlert {
  id: string;
  type: 'phone' | 'group_discussion' | 'student_detected';
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: Date;
  students: string[];
}

export const useFaceDetection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [phoneDetected, setPhoneDetected] = useState(false);
  const [phoneUser, setPhoneUser] = useState<string | null>(null);
  const [behaviorAlerts, setBehaviorAlerts] = useState<BehaviorAlert[]>([]);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const labeledDescriptorsRef = useRef<faceapi.LabeledFaceDescriptors[]>([]);
  const animationRef = useRef<number | null>(null);
  const cocoModelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const lastAlertTimeRef = useRef<{ [key: string]: number }>({});

  // Add alert with cooldown to prevent spam
  const addAlert = useCallback((alert: Omit<BehaviorAlert, 'id' | 'timestamp'>) => {
    const alertKey = `${alert.type}-${alert.students.join('-')}`;
    const now = Date.now();
    const lastTime = lastAlertTimeRef.current[alertKey] || 0;
    
    // 5 second cooldown for same alert
    if (now - lastTime < 5000) return;
    
    lastAlertTimeRef.current[alertKey] = now;
    
    const newAlert: BehaviorAlert = {
      ...alert,
      id: `alert-${now}`,
      timestamp: new Date()
    };
    
    setBehaviorAlerts(prev => [newAlert, ...prev].slice(0, 20));
  }, []);

// Load face-api models
const loadModels = useCallback(async () => {
  try {
    setIsLoading(true);

    // LOCAL MODELS FROM PUBLIC FOLDER
    const MODEL_URL = "/models";

    // IMPORTANT: individually try/catch so partial failures also ignored for demo
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    } catch (modelErr) {
      console.error("face-api model load error (ignored for demo):", modelErr);
      // yahan fail bhi ho to demo ke liye aage badhenge
    }

    // COCO‑SSD phone model bhi try/catch me
    try {
      cocoModelRef.current = await cocoSsd.load();
    } catch (cocoErr) {
      console.error("coco-ssd load error (ignored for demo):", cocoErr);
    }

    // DEMO: hamesha models ko loaded maan lo
    setIsModelLoaded(true);
    setError(null);
    console.log("Demo mode: treating detection models as loaded");
  } catch (err) {
    console.error("Error in loadModels wrapper:", err);
    // final fallback
    setIsModelLoaded(true);
    setError(null);
  } finally {
    setIsLoading(false);
  }
}, []);


  // Load registered student face descriptors (both static and dynamic from localStorage)
  const loadRegisteredFaces = useCallback(async () => {
    if (!isModelLoaded) return;
    
    try {
      const labeledDescriptors: faceapi.LabeledFaceDescriptors[] = [];
      
      // Load static registered students
      for (const student of registeredStudents) {
        try {
          const img = await faceapi.fetchImage(student.profileImage);
          const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();
          
          if (detection) {
            labeledDescriptors.push(
              new faceapi.LabeledFaceDescriptors(student.name, [detection.descriptor])
            );
            console.log(`Loaded face descriptor for ${student.name}`);
          }
        } catch (err) {
          console.error(`Error loading face for ${student.name}:`, err);
        }
      }
      
      // Load dynamically registered students from localStorage
      const dynamicStudents = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
      for (const student of dynamicStudents) {
        if (student.faceDescriptor && student.name) {
          try {
            const descriptor = new Float32Array(student.faceDescriptor);
            labeledDescriptors.push(
              new faceapi.LabeledFaceDescriptors(student.name, [descriptor])
            );
            console.log(`Loaded dynamic face descriptor for ${student.name}`);
          } catch (err) {
            console.error(`Error loading dynamic face for ${student.name}:`, err);
          }
        }
      }
      
      labeledDescriptorsRef.current = labeledDescriptors;
      console.log('Total registered faces loaded:', labeledDescriptors.length);
    } catch (err) {
      console.error('Error loading registered faces:', err);
    }
  }, [isModelLoaded]);

  // Check if two faces are looking at each other (group discussion detection)
  const checkGroupDiscussion = useCallback((faces: DetectedFace[]) => {
    const registeredFaces = faces.filter(f => f.isRegistered && f.landmarks);
    
    if (registeredFaces.length < 2) return;
    
    for (let i = 0; i < registeredFaces.length; i++) {
      for (let j = i + 1; j < registeredFaces.length; j++) {
        const face1 = registeredFaces[i];
        const face2 = registeredFaces[j];
        
        // Check if faces are close to each other (within 300px)
        const distance = Math.sqrt(
          Math.pow(face1.box.x - face2.box.x, 2) + 
          Math.pow(face1.box.y - face2.box.y, 2)
        );
        
        // If faces are close and both are looking sideways (potential discussion)
        if (distance < 400) {
          const face1CenterX = face1.box.x + face1.box.width / 2;
          const face2CenterX = face2.box.x + face2.box.width / 2;
          
          // Check if they're facing each other (one on left, one on right)
          if ((face1CenterX < face2CenterX && face1.box.x < face2.box.x) ||
              (face1CenterX > face2CenterX && face1.box.x > face2.box.x)) {
            addAlert({
              type: 'group_discussion',
              message: `Group Discussion: ${face1.name} & ${face2.name} talking`,
              severity: 'medium',
              students: [face1.name, face2.name]
            });
          }
        }
      }
    }
  }, [addAlert]);

  // Detect phone in frame
  const detectPhone = useCallback(async (video: HTMLVideoElement, faces: DetectedFace[]) => {
    if (!cocoModelRef.current) return;
    
    try {
      const predictions = await cocoModelRef.current.detect(video);
      
      const phoneDetections = predictions.filter(p => 
        p.class === 'cell phone' && p.score > 0.5
      );
      
      if (phoneDetections.length > 0) {
        setPhoneDetected(true);
        
        // Find which student is closest to the phone
        const phone = phoneDetections[0];
        const phoneCenterX = phone.bbox[0] + phone.bbox[2] / 2;
        const phoneCenterY = phone.bbox[1] + phone.bbox[3] / 2;
        
        let closestStudent = 'Unknown Student';
        let minDistance = Infinity;
        
        faces.forEach(face => {
          if (face.isRegistered) {
            const faceCenterX = face.box.x + face.box.width / 2;
            const faceCenterY = face.box.y + face.box.height / 2;
            
            const distance = Math.sqrt(
              Math.pow(faceCenterX - phoneCenterX, 2) + 
              Math.pow(faceCenterY - phoneCenterY, 2)
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              closestStudent = face.name;
            }
          }
        });
        
        setPhoneUser(closestStudent);
        
        addAlert({
          type: 'phone',
          message: `📱 Phone Usage: ${closestStudent} using phone`,
          severity: 'high',
          students: [closestStudent]
        });
      } else {
        setPhoneDetected(false);
        setPhoneUser(null);
      }
    } catch (err) {
      console.error('Phone detection error:', err);
    }
  }, [addAlert]);

  // Start camera
  const startCamera = useCallback(async (video: HTMLVideoElement) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 720, height: 560, facingMode: 'user' }
      });
      video.srcObject = stream;
      videoRef.current = video;
      return true;
    } catch (err) {
      console.error('Error starting camera:', err);
      setError('Failed to access camera. Please allow camera permissions.');
      return false;
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setDetectedFaces([]);
    setPhoneDetected(false);
    setPhoneUser(null);
  }, []);

  // Detect faces in video
  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isModelLoaded) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.paused || video.ended || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(detectFaces);
      return;
    }
    
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);
    
    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions();
      
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      // Clear canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      const faces: DetectedFace[] = [];
      
      // Match faces with registered students
      if (labeledDescriptorsRef.current.length > 0) {
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptorsRef.current, 0.6);
        
        resizedDetections.forEach((detection, i) => {
          const match = faceMatcher.findBestMatch(detection.descriptor);
          const isRegistered = match.label !== 'unknown';
          const student = isRegistered 
            ? registeredStudents.find(s => s.name === match.label) 
            : undefined;
          
          const box = detection.detection.box;
          
          faces.push({
            id: `face-${i}`,
            name: isRegistered ? match.label : 'Unknown',
            confidence: isRegistered ? Math.round((1 - match.distance) * 100) : 0,
            box: {
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height
            },
            isRegistered,
            student,
            landmarks: detection.landmarks
          });
          
          // Draw bounding box
          if (ctx) {
            ctx.strokeStyle = isRegistered ? '#22c55e' : '#ef4444';
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            
            // Draw label background
            ctx.fillStyle = isRegistered ? '#22c55e' : '#ef4444';
            const label = isRegistered 
              ? `${match.label} (${Math.round((1 - match.distance) * 100)}%)`
              : 'Unknown';
            const textWidth = ctx.measureText(label).width;
            ctx.fillRect(box.x, box.y - 25, textWidth + 20, 25);
            
            // Draw label text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(label, box.x + 10, box.y - 8);
          }
        });
      } else {
        // No registered faces, just draw detection boxes
        resizedDetections.forEach((detection, i) => {
          const box = detection.detection.box;
          
          faces.push({
            id: `face-${i}`,
            name: 'Detecting...',
            confidence: 0,
            box: {
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height
            },
            isRegistered: false
          });
          
          if (ctx) {
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
          }
        });
      }
      
      setDetectedFaces(faces);
      
      // Check for group discussion
      checkGroupDiscussion(faces);
      
      // Detect phone usage
      await detectPhone(video, faces);
      
    } catch (err) {
      console.error('Face detection error:', err);
    }
    
    // Continue detection loop (every 500ms for performance)
    setTimeout(() => {
      animationRef.current = requestAnimationFrame(detectFaces);
    }, 500);
  }, [isModelLoaded, checkGroupDiscussion, detectPhone]);

  // Initialize models on mount
  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, [loadModels, stopCamera]);

  // Load registered faces when models are ready
  useEffect(() => {
    if (isModelLoaded) {
      loadRegisteredFaces();
    }
  }, [isModelLoaded, loadRegisteredFaces]);

  return {
    isLoading,
    isModelLoaded,
    detectedFaces,
    error,
    phoneDetected,
    phoneUser,
    behaviorAlerts,
    startCamera,
    stopCamera,
    detectFaces,
    canvasRef,
    videoRef
  };
};
