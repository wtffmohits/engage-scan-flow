import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

export interface DetectionFace {
  id?: string | number;
  name: string;
  box: [number, number, number, number]; // left, top, right, bottom
  is_using_phone?: boolean;
  isRegistered?: boolean;
  confidence?: number;
  student?: { rollNo?: string } | null;
}

export interface BehaviorAlert {
  type: string;
  message: string;
  timestamp: string | Date;
  severity: 'high' | 'medium' | 'low';
}

export const usePythonDetection = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const [detectedFaces, setDetectedFaces] = useState<DetectionFace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [phoneDetected, setPhoneDetected] = useState(false);
  const [phoneUser, setPhoneUser] = useState<string | null>(null);
  const [behaviorAlerts, setBehaviorAlerts] = useState<BehaviorAlert[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIntervalRef = useRef<number | null>(null);

  // Connect to backend socket once
  useEffect(() => {
    try {
      const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ Connected to Python Backend');
        setIsConnected(true);
        setIsLoading(false);
      });

      socket.on('disconnect', () => {
        console.log('❌ Disconnected from Backend');
        setIsConnected(false);
      });

      // Optional: backend can emit model loaded event
      socket.on('model_loaded', () => {
        setIsModelLoaded(true);
        setIsLoading(false);
      });

      // Generic analysis result expected from backend
      socket.on('analysis_result', (payload: any) => {
        // Normalize payload into our local shape
        try {
          const faces: DetectionFace[] = (payload.faces || []).map((f: any, idx: number) => ({
            id: f.id ?? idx,
            name: f.name ?? 'Unknown',
            box: f.box ?? [0, 0, 0, 0],
            is_using_phone: !!f.is_using_phone,
            isRegistered: !!f.isRegistered,
            confidence: f.confidence ?? 0,
            student: f.student ?? null,
          }));

          setDetectedFaces(faces);

          if (payload.phone_detected) {
            setPhoneDetected(true);
            setPhoneUser(payload.phone_user ?? null);
          } else {
            setPhoneDetected(false);
            setPhoneUser(null);
          }

          if (payload.alerts && Array.isArray(payload.alerts)) {
            const alerts = payload.alerts.map((a: any) => ({
              type: a.type,
              message: a.message,
              timestamp: a.timestamp ? new Date(a.timestamp) : new Date(),
              severity: a.severity || 'low',
            }));
            setBehaviorAlerts(alerts);
          }

          // Draw overlay if available
          if (canvasRef.current && videoRef.current) {
            drawDetections(faces, canvasRef.current, videoRef.current);
          }
        } catch (e) {
          console.error('Error processing analysis_result', e);
        }
      });

      socket.on('connect_error', (err: any) => {
        console.error('Socket connect error', err);
        setError(String(err));
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Socket init error', err);
      setError(String(err));
      setIsLoading(false);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (frameIntervalRef.current) {
        window.clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    };
  }, []);

  // Start sending frames to backend at ~5 FPS
  const startFrameLoop = () => {
    if (frameIntervalRef.current) return;
    frameIntervalRef.current = window.setInterval(() => {
      const video = videoRef.current;
      const socket = socketRef.current;
      if (!video || video.paused || video.ended || !socket || !socket.connected) return;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = video.videoWidth || 640;
      tempCanvas.height = video.videoHeight || 480;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
      try {
        const base64Image = tempCanvas.toDataURL('image/jpeg', 0.6);
        socket.emit('process_frame', { image: base64Image });
      } catch (e) {
        console.warn('Failed to emit frame', e);
      }
    }, 200);
  };

  const stopFrameLoop = () => {
    if (frameIntervalRef.current) {
      window.clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  };

  // Start Camera - returns true on success
  const startCamera = async (videoElement: HTMLVideoElement, canvasElement?: HTMLCanvasElement) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      videoElement.srcObject = stream;
      videoRef.current = videoElement;
      if (canvasElement) canvasRef.current = canvasElement;

      await videoElement.play();
      startFrameLoop();
      return true;
    } catch (e) {
      console.error('Camera access error:', e);
      setError(String(e));
      return false;
    }
  };

  const stopCamera = () => {
    try {
      const video = videoRef.current;
      if (video && video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
        // @ts-ignore
        video.srcObject = null;
      }
      stopFrameLoop();
      setDetectedFaces([]);
      setPhoneDetected(false);
      setPhoneUser(null);
    } catch (e) {
      console.warn('Error stopping camera', e);
    }
  };

  const detectFaces = () => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit('trigger_detection');
  };

  const drawDetections = (faces: DetectionFace[], canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faces.forEach(face => {
      const [left, top, right, bottom] = face.box;
      const width = right - left;
      const height = bottom - top;

      ctx.strokeStyle = face.is_using_phone ? 'red' : 'lime';
      ctx.lineWidth = 2;
      ctx.strokeRect(left, top, width, height);

      ctx.fillStyle = face.is_using_phone ? 'red' : 'lime';
      ctx.font = '14px Arial';
      const label = `${face.name}${face.confidence ? ` (${Math.round(face.confidence)}%)` : ''}`;
      ctx.fillText(label, left, Math.max(12, top - 6));
    });
  };

  return {
    // state
    isLoading,
    isModelLoaded: isModelLoaded || true, // if backend doesn't emit, assume true after init
    detectedFaces,
    error,
    phoneDetected,
    phoneUser,
    behaviorAlerts,

    // refs + controls
    startCamera,
    stopCamera,
    detectFaces,
    canvasRef,
  };
};