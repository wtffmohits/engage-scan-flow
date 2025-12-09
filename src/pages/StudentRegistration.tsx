import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import * as faceapi from 'face-api.js';
import { 
  UserPlus, 
  Camera, 
  CheckCircle, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  GraduationCap,
  Building2,
  Calendar,
  Hash,
  ScanFace,
  RefreshCw
} from "lucide-react";

interface StudentFormData {
  name: string;
  age: string;
  contact: string;
  email: string;
  rollNo: string;
  class: string;
  department: string;
  academicYear: string;
}

const initialFormData: StudentFormData = {
  name: "",
  age: "",
  contact: "",
  email: "",
  rollNo: "",
  class: "",
  department: "",
  academicYear: ""
};

const StudentRegistration = () => {
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [step, setStep] = useState<'form' | 'scan'>('form');
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelLoading(true);
        const MODEL_URL = "/models";
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setIsModelLoading(false);
      } catch (err) {
        console.error("Error loading models:", err);
        setIsModelLoading(false);
      }
    };
    loadModels();
  }, []);

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, age, contact, email, rollNo, class: cls, department, academicYear } = formData;
    if (!name || !age || !contact || !email || !rollNo || !cls || !department || !academicYear) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return false;
    }
    if (!/^\d+$/.test(age) || parseInt(age) < 15 || parseInt(age) > 50) {
      toast({
        title: "Invalid Age",
        description: "Please enter a valid age between 15-50",
        variant: "destructive"
      });
      return false;
    }
    if (!/^\d{10}$/.test(contact)) {
      toast({
        title: "Invalid Contact",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleProceedToScan = () => {
    if (validateForm()) {
      setStep('scan');
    }
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
          startFaceDetection();
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please allow camera permissions.",
        variant: "destructive"
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsCameraReady(false);
  }, []);

  const startFaceDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.paused || video.ended || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(startFaceDetection);
      return;
    }

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (detection) {
        setFaceDetected(true);
        const resized = faceapi.resizeResults(detection, displaySize);
        
        if (ctx) {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 3;
          ctx.strokeRect(
            resized.detection.box.x,
            resized.detection.box.y,
            resized.detection.box.width,
            resized.detection.box.height
          );
          
          // Draw face guide text
          ctx.fillStyle = '#22c55e';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText('Face Detected ✓', resized.detection.box.x, resized.detection.box.y - 10);
        }
      } else {
        setFaceDetected(false);
      }
    } catch (err) {
      console.error("Detection error:", err);
    }

    animationRef.current = requestAnimationFrame(startFaceDetection);
  }, []);

  const captureFace = useCallback(async () => {
    if (!videoRef.current || !faceDetected) return;

    setIsScanning(true);

    try {
      const video = videoRef.current;
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        // Capture image from video
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const imageData = tempCanvas.toDataURL('image/jpeg', 0.9);
          setCapturedImage(imageData);
          setFaceDescriptor(detection.descriptor);
          
          stopCamera();
          
          toast({
            title: "Face Captured",
            description: "Your face has been successfully scanned!",
          });
        }
      } else {
        toast({
          title: "No Face Detected",
          description: "Please position your face in front of the camera",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Capture error:", err);
      toast({
        title: "Capture Failed",
        description: "Failed to capture face. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  }, [faceDetected, stopCamera]);

  const retakeFace = useCallback(() => {
    setCapturedImage(null);
    setFaceDescriptor(null);
    startCamera();
  }, [startCamera]);

  const handleRegisterStudent = async () => {
    if (!capturedImage || !faceDescriptor) {
      toast({
        title: "Face Not Captured",
        description: "Please capture your face before registering",
        variant: "destructive"
      });
      return;
    }

    setIsRegistering(true);

    try {
      // Store student data in localStorage for now (will be database later)
      const existingStudents = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
      
      const newStudent = {
        id: `STU${Date.now()}`,
        ...formData,
        profileImage: capturedImage,
        faceDescriptor: Array.from(faceDescriptor),
        status: 'active',
        registeredAt: new Date().toISOString()
      };

      existingStudents.push(newStudent);
      localStorage.setItem('registeredStudents', JSON.stringify(existingStudents));

      toast({
        title: "Registration Successful!",
        description: `${formData.name} has been registered successfully.`,
      });

      // Reset form
      setFormData(initialFormData);
      setStep('form');
      setCapturedImage(null);
      setFaceDescriptor(null);

    } catch (err) {
      console.error("Registration error:", err);
      toast({
        title: "Registration Failed",
        description: "Could not register student. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    if (step === 'scan' && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step, capturedImage, startCamera, stopCamera]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Registration</h1>
          <p className="text-muted-foreground">Register new students with face recognition for attendance and behavior analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registration Steps */}
          <div className="lg:col-span-1">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Registration Steps</CardTitle>
                <CardDescription>Follow these steps to register</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${step === 'form' ? 'border-primary bg-primary/10' : 'border-success bg-success/10'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'form' ? 'bg-primary text-primary-foreground' : 'bg-success text-success-foreground'}`}>
                    {step === 'scan' ? <CheckCircle className="h-4 w-4" /> : '1'}
                  </div>
                  <div>
                    <p className="font-medium">Fill Details</p>
                    <p className="text-xs text-muted-foreground">Enter student information</p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg border ${step === 'scan' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'scan' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    2
                  </div>
                  <div>
                    <p className="font-medium">Face Scan</p>
                    <p className="text-xs text-muted-foreground">Capture face for recognition</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-muted">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Complete</p>
                    <p className="text-xs text-muted-foreground">Registration complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            {formData.name && (
              <Card className="shadow-medium mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    {capturedImage ? (
                      <img src={capturedImage} alt="Captured" className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-success" />
                    ) : (
                      <div className="w-24 h-24 rounded-full mx-auto bg-muted flex items-center justify-center">
                        <User className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <h3 className="font-bold mt-3">{formData.name || "Student Name"}</h3>
                    <p className="text-sm text-muted-foreground">Roll No: {formData.rollNo || "---"}</p>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <p>{formData.department || "Department"}</p>
                      <p>Class: {formData.class || "---"}</p>
                      <p>Year: {formData.academicYear || "---"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Form / Scan Area */}
          <div className="lg:col-span-2">
            {step === 'form' ? (
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Student Information
                  </CardTitle>
                  <CardDescription>Enter all required details for registration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rollNo" className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Roll Number *
                      </Label>
                      <Input
                        id="rollNo"
                        placeholder="Enter roll number"
                        value={formData.rollNo}
                        onChange={(e) => handleInputChange('rollNo', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Age *
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Enter age"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact Number *
                      </Label>
                      <Input
                        id="contact"
                        placeholder="10-digit mobile number"
                        value={formData.contact}
                        onChange={(e) => handleInputChange('contact', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="student@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="class" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Class *
                      </Label>
                      <Select value={formData.class} onValueChange={(v) => handleInputChange('class', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Year">1st Year</SelectItem>
                          <SelectItem value="2nd Year">2nd Year</SelectItem>
                          <SelectItem value="3rd Year">3rd Year</SelectItem>
                          <SelectItem value="4th Year">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Department *
                      </Label>
                      <Select value={formData.department} onValueChange={(v) => handleInputChange('department', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Information Technology">Information Technology</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Mechanical">Mechanical</SelectItem>
                          <SelectItem value="Civil">Civil</SelectItem>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="academicYear" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Academic Year *
                      </Label>
                      <Select value={formData.academicYear} onValueChange={(v) => handleInputChange('academicYear', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024-25">2024-25</SelectItem>
                          <SelectItem value="2025-26">2025-26</SelectItem>
                          <SelectItem value="2026-27">2026-27</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button onClick={handleProceedToScan} variant="hero" size="lg" className="gap-2">
                      <ScanFace className="h-5 w-5" />
                      Proceed to Face Scan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ScanFace className="h-5 w-5" />
                    Face Scan
                  </CardTitle>
                  <CardDescription>Position your face in the camera and capture</CardDescription>
                </CardHeader>
                <CardContent>
                  {isModelLoading ? (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
                        <p className="text-muted-foreground">Loading face detection models...</p>
                      </div>
                    </div>
                  ) : capturedImage ? (
                    <div className="space-y-6">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={capturedImage} alt="Captured face" className="max-h-full object-contain" />
                      </div>
                      <div className="text-center">
                        <Badge variant="default" className="bg-success gap-2 text-base px-4 py-2">
                          <CheckCircle className="h-4 w-4" />
                          Face Captured Successfully
                        </Badge>
                      </div>
                      <div className="flex justify-center gap-4">
                        <Button onClick={retakeFace} variant="outline" className="gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Retake
                        </Button>
                        <Button onClick={handleRegisterStudent} variant="hero" className="gap-2" disabled={isRegistering}>
                          {isRegistering ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Complete Registration
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="aspect-video bg-muted rounded-lg relative overflow-hidden">
                        <video
                          ref={videoRef}
                          className="absolute inset-0 w-full h-full object-cover"
                          playsInline
                          muted
                        />
                        <canvas
                          ref={canvasRef}
                          className="absolute inset-0 w-full h-full"
                        />
                        
                        {!isCameraReady && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        )}

                        {/* Face guide overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className={`w-48 h-60 border-4 rounded-full ${faceDetected ? 'border-success' : 'border-dashed border-muted-foreground/50'}`}></div>
                        </div>

                        {/* Status indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                          <Badge variant={faceDetected ? "default" : "secondary"} className={`${faceDetected ? 'bg-success' : ''} gap-2`}>
                            {faceDetected ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Face Detected - Ready to Capture
                              </>
                            ) : (
                              <>
                                <ScanFace className="h-4 w-4" />
                                Position your face in the oval
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-center gap-4">
                        <Button onClick={() => { stopCamera(); setStep('form'); }} variant="outline">
                          Back to Form
                        </Button>
                        <Button 
                          onClick={captureFace} 
                          variant="hero" 
                          className="gap-2"
                          disabled={!faceDetected || isScanning}
                        >
                          {isScanning ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                          {isScanning ? 'Capturing...' : 'Capture Face'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentRegistration;
