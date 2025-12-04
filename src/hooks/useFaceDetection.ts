import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';
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
}

export const useFaceDetection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const labeledDescriptorsRef = useRef<faceapi.LabeledFaceDescriptors[]>([]);
  const animationRef = useRef<number | null>(null);

  // Load face-api models
  const loadModels = useCallback(async () => {
    try {
      setIsLoading(true);
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      
      setIsModelLoaded(true);
      console.log('Face detection models loaded successfully');
    } catch (err) {
      console.error('Error loading face detection models:', err);
      setError('Failed to load face detection models');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load registered student face descriptors
  const loadRegisteredFaces = useCallback(async () => {
    if (!isModelLoaded) return;
    
    try {
      const labeledDescriptors: faceapi.LabeledFaceDescriptors[] = [];
      
      for (const student of registeredStudents) {
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
      }
      
      labeledDescriptorsRef.current = labeledDescriptors;
      console.log('Registered faces loaded:', labeledDescriptors.length);
    } catch (err) {
      console.error('Error loading registered faces:', err);
    }
  }, [isModelLoaded]);

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
            student
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
    } catch (err) {
      console.error('Face detection error:', err);
    }
    
    // Continue detection loop (every 500ms for performance)
    setTimeout(() => {
      animationRef.current = requestAnimationFrame(detectFaces);
    }, 500);
  }, [isModelLoaded]);

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
    startCamera,
    stopCamera,
    detectFaces,
    canvasRef,
    videoRef
  };
};
