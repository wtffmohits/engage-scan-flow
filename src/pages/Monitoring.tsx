import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef, useCallback } from "react";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { usePythonDetection } from "@/hooks/usePythonDetection";
import { 
  Video, 
  AlertTriangle, 
  Eye, 
  Users, 
  PhoneOff, 
  BedDouble, 
  MessageSquare,
  TrendingUp,
  Download,
  Loader2,
  Camera,
  UserCheck,
  Smartphone
} from "lucide-react";

interface StudentBehavior {
  id: number;
  name: string;
  emotion: string;
  attention: number;
  activity: string;
  alert: boolean;
  rollNo?: string;
}

const Monitoring = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [classEngagement, setClassEngagement] = useState(78);
  const [students, setStudents] = useState<StudentBehavior[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  
// Monitoring component ke andar line 46 ke paas
const { 
    isLoading, 
    isModelLoaded, 
    detectedFaces, 
    error,
    phoneDetected,
    phoneUser,
    behaviorAlerts,
    startCamera, 
    stopCamera, 
    detectFaces, // Ye ab dummy function hai, backend auto-detect karta hai
    canvasRef 
  } = useFaceDetection(); // <-- Changed from useFaceDetection()

  const [alerts, setAlerts] = useState<Array<{ time: string; message: string; severity: string }>>([]);

  const [behaviorStats, setBehaviorStats] = useState({
    attentive: 0,
    distracted: 0,
    talking: 0,
    sleeping: 0,
    phoneUsage: 0,
  });

  // Handle start monitoring
  const handleStartMonitoring = useCallback(async () => {
    if (!videoRef.current || !isModelLoaded) return;
    
    const success = await startCamera(videoRef.current);
    if (success) {
      setIsMonitoring(true);
      // Wait for video to be ready
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
        detectFaces();
      };
    }
  }, [isModelLoaded, startCamera, detectFaces]);

  // Handle stop monitoring
  const handleStopMonitoring = useCallback(() => {
    stopCamera();
    setIsMonitoring(false);
    setStudents([]);
    setBehaviorStats({
      attentive: 0,
      distracted: 0,
      talking: 0,
      sleeping: 0,
      phoneUsage: 0,
    });
  }, [stopCamera]);

  // Update students list when faces are detected
  useEffect(() => {
    if (detectedFaces.length > 0) {
      const updatedStudents: StudentBehavior[] = detectedFaces.map((face, index) => ({
        id: index + 1,
        name: face.name,
        rollNo: face.student?.rollNo,
        emotion: face.isRegistered ? (phoneDetected && phoneUser === face.name ? "Using Phone" : "Focused") : "Unknown",
        attention: face.isRegistered ? face.confidence : 0,
        activity: face.isRegistered ? (phoneDetected && phoneUser === face.name ? "Phone Usage" : "Present") : "Not Registered",
        alert: !face.isRegistered || (phoneDetected && phoneUser === face.name)
      }));
      setStudents(updatedStudents);
      
      // Update behavior stats
      const registered = detectedFaces.filter(f => f.isRegistered).length;
      const unregistered = detectedFaces.filter(f => !f.isRegistered).length;
      const groupDiscussionCount = behaviorAlerts.filter(a => a.type === 'group_discussion').length;
      
      setBehaviorStats({
        attentive: registered,
        distracted: unregistered,
        talking: groupDiscussionCount,
        sleeping: 0,
        phoneUsage: phoneDetected ? 1 : 0,
      });
      
      // Add alert for new registered student detection
      const registeredFaces = detectedFaces.filter(f => f.isRegistered);
      if (registeredFaces.length > 0) {
        const latestFace = registeredFaces[0];
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
        
        setAlerts(prev => {
          const exists = prev.some(a => a.message.includes(latestFace.name) && a.message.includes('detected'));
          if (!exists) {
            return [{
              time: timeStr,
              message: `${latestFace.name} (Roll: ${latestFace.student?.rollNo}) detected - ${latestFace.confidence}% match`,
              severity: "low"
            }, ...prev].slice(0, 20);
          }
          return prev;
        });
      }
    }
  }, [detectedFaces, phoneDetected, phoneUser, behaviorAlerts]);

  // Update alerts from behavior detection
  useEffect(() => {
    if (behaviorAlerts.length > 0) {
      const latestAlert = behaviorAlerts[0];
      const timeStr = latestAlert.timestamp.toLocaleString('en-US', { hour12: false });
      
      setAlerts(prev => {
        const exists = prev.some(a => a.message === latestAlert.message);
        if (!exists) {
          return [{
            time: timeStr,
            message: latestAlert.message,
            severity: latestAlert.severity
          }, ...prev].slice(0, 20);
        }
        return prev;
      });
    }
  }, [behaviorAlerts]);

  // Update class engagement based on detected faces
  useEffect(() => {
    if (isMonitoring && detectedFaces.length > 0) {
      const avgConfidence = detectedFaces
        .filter(f => f.isRegistered)
        .reduce((sum, f) => sum + f.confidence, 0) / 
        Math.max(detectedFaces.filter(f => f.isRegistered).length, 1);
      setClassEngagement(avgConfidence || 0);
    }
  }, [isMonitoring, detectedFaces]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Live Classroom Monitoring</h1>
            <p className="text-muted-foreground">AI-powered real-time behavior and engagement tracking</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Session
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Camera Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Live Camera Feed
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isLoading && (
                      <Badge variant="secondary" className="gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading AI...
                      </Badge>
                    )}
                    <Badge variant={isMonitoring ? "default" : "secondary"}>
                      {isMonitoring ? "● LIVE" : "Stopped"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg relative overflow-hidden">
                  {/* Video element - always present */}
                  <video 
                    ref={videoRef}
                    className={`absolute inset-0 w-full h-full object-cover ${isMonitoring ? 'block' : 'hidden'}`}
                    playsInline
                    muted
                  />
                  
                  {/* Canvas for face detection overlay */}
                  <canvas 
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full ${isMonitoring ? 'block' : 'hidden'}`}
                  />
                  
                  {!isMonitoring ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <Video className="h-16 w-16 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">
                          {isLoading ? "Loading face detection models..." : "Start monitoring to view live feed"}
                        </p>
                        {error && (
                          <p className="text-destructive text-sm">{error}</p>
                        )}
                        <Button 
                          onClick={handleStartMonitoring} 
                          variant="hero" 
                          size="lg" 
                          className="gap-2"
                          disabled={isLoading || !isModelLoaded}
                        >
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Video className="h-5 w-5" />
                          )}
                          {isLoading ? "Loading..." : "Start Monitoring"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Engagement overlay */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                        <p className="text-sm font-medium">
                          Faces Detected: <span className="text-primary font-bold">{detectedFaces.length}</span>
                          {detectedFaces.filter(f => f.isRegistered).length > 0 && (
                            <span className="ml-2 text-success">
                              ({detectedFaces.filter(f => f.isRegistered).length} registered)
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Phone Detection Alert */}
                      {phoneDetected && (
                        <div className="absolute top-4 right-4 bg-destructive/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg animate-pulse">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-white" />
                            <div>
                              <p className="font-bold text-white text-sm">📱 PHONE DETECTED!</p>
                              <p className="text-xs text-white/90">{phoneUser} using phone</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Detected faces info overlay */}
                      {detectedFaces.filter(f => f.isRegistered).map((face, index) => (
                        <div 
                          key={face.id}
                          className="absolute top-16 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-success/50"
                          style={{ top: `${64 + index * 80}px` }}
                        >
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-success" />
                            <div>
                              <p className="font-semibold text-success text-sm">{face.name}</p>
                              <p className="text-xs text-muted-foreground">Roll No: {face.student?.rollNo}</p>
                              <p className="text-xs text-muted-foreground">Match: {face.confidence}%</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Controls */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        <Button onClick={handleStopMonitoring} variant="destructive">
                          Stop Monitoring
                        </Button>
                        <Button variant="outline" className="bg-background/80 backdrop-blur-sm">
                          View All Students
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Student Grid */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Behavior Status
                  {students.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{students.length} detected</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No students detected yet. Start monitoring to see student status.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.map((student) => (
                      <div 
                        key={student.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          student.alert ? 'border-destructive/50 bg-destructive/5' : 'border-success/50 bg-success/5'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          student.attention > 80 ? 'bg-success' : 
                          student.attention > 60 ? 'bg-yellow-500' : 'bg-destructive'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <p className="font-medium text-sm">{student.name}</p>
                              {student.rollNo && (
                                <p className="text-xs text-muted-foreground">Roll No: {student.rollNo}</p>
                              )}
                            </div>
                            <Badge variant={student.alert ? "destructive" : "default"} className="text-xs">
                              {student.activity}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={student.attention} className="h-1 flex-1" />
                            <span className="text-xs text-muted-foreground">{student.attention}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Analytics */}
          <div className="space-y-6">
            {/* Classroom Stats */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Classroom Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recognition Confidence</span>
                    <span className="font-semibold text-success">{Math.round(classEngagement)}%</span>
                  </div>
                  <Progress value={classEngagement} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <Eye className="h-4 w-4 text-success mb-1" />
                    <p className="text-2xl font-bold text-success">{behaviorStats.attentive}</p>
                    <p className="text-xs text-muted-foreground">Registered</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="h-4 w-4 text-destructive mb-1" />
                    <p className="text-2xl font-bold text-destructive">{behaviorStats.distracted}</p>
                    <p className="text-xs text-muted-foreground">Unknown</p>
                  </div>

                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <MessageSquare className="h-4 w-4 text-yellow-600 mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{behaviorStats.talking}</p>
                    <p className="text-xs text-muted-foreground">Talking</p>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <BedDouble className="h-4 w-4 text-blue-600 mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{behaviorStats.sleeping}</p>
                    <p className="text-xs text-muted-foreground">Sleeping</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-1">
                    <PhoneOff className="h-4 w-4 text-destructive" />
                    <span className="font-semibold text-destructive">{behaviorStats.phoneUsage}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Phone Usage Detected</p>
                </div>
              </CardContent>
            </Card>

            {/* Alerts Feed */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Live Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {alerts.map((alert, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        alert.severity === 'high' ? 'border-destructive/50 bg-destructive/5' :
                        alert.severity === 'medium' ? 'border-yellow-500/50 bg-yellow-500/5' :
                        'border-success/50 bg-success/5'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                          alert.severity === 'high' ? 'text-destructive' :
                          alert.severity === 'medium' ? 'text-yellow-600' :
                          'text-success'
                        }`} />
                        <div className="flex-1">
                          <p className="text-xs font-medium">{alert.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Monitoring;
