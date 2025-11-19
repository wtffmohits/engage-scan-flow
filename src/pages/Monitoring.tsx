import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { 
  Video, 
  AlertTriangle, 
  Eye, 
  Users, 
  PhoneOff, 
  BedDouble, 
  MessageSquare,
  TrendingUp,
  Download
} from "lucide-react";

interface StudentBehavior {
  id: number;
  name: string;
  emotion: string;
  attention: number;
  activity: string;
  alert: boolean;
}

const Monitoring = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [classEngagement, setClassEngagement] = useState(78);
  const [students] = useState<StudentBehavior[]>([
    { id: 1, name: "Student A", emotion: "Focused", attention: 95, activity: "Listening", alert: false },
    { id: 2, name: "Student B", emotion: "Confused", attention: 65, activity: "Looking Down", alert: true },
    { id: 3, name: "Student C", emotion: "Engaged", attention: 88, activity: "Taking Notes", alert: false },
    { id: 4, name: "Student D", emotion: "Distracted", attention: 45, activity: "Using Phone", alert: true },
    { id: 5, name: "Student E", emotion: "Neutral", attention: 72, activity: "Listening", alert: false },
  ]);

  const [alerts, setAlerts] = useState([
    { time: "10:45:23", message: "Student D using phone detected", severity: "high" },
    { time: "10:43:15", message: "Student B looking away for 20 sec", severity: "medium" },
    { time: "10:40:08", message: "Group discussion detected in row 3", severity: "low" },
  ]);

  const [behaviorStats] = useState({
    attentive: 12,
    distracted: 3,
    talking: 2,
    sleeping: 1,
    phoneUsage: 1,
  });

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        setClassEngagement(prev => Math.min(100, Math.max(40, prev + (Math.random() - 0.5) * 10)));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

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
                  <CardTitle>Live Camera Feed</CardTitle>
                  <Badge variant={isMonitoring ? "default" : "secondary"}>
                    {isMonitoring ? "● LIVE" : "Stopped"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg relative overflow-hidden">
                  {!isMonitoring ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <Video className="h-16 w-16 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">Start monitoring to view live feed</p>
                        <Button onClick={() => setIsMonitoring(true)} variant="hero" size="lg" className="gap-2">
                          <Video className="h-5 w-5" />
                          Start Monitoring
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10">
                      {/* Simulated AI Overlays */}
                      <div className="absolute top-4 left-4 space-y-2">
                        <div className="w-32 h-40 border-2 border-success rounded-lg p-2 bg-background/80 backdrop-blur-sm">
                          <div className="text-xs space-y-1">
                            <p className="font-semibold text-success">Student A</p>
                            <p className="text-muted-foreground">😊 Focused</p>
                            <Progress value={95} className="h-1" />
                            <p className="text-[10px]">Attention: 95%</p>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-4 right-4 space-y-2">
                        <div className="w-32 h-40 border-2 border-destructive rounded-lg p-2 bg-background/80 backdrop-blur-sm">
                          <div className="text-xs space-y-1">
                            <p className="font-semibold text-destructive">Student D</p>
                            <p className="text-muted-foreground">📱 Using Phone</p>
                            <Progress value={45} className="h-1" />
                            <p className="text-[10px]">Attention: 45%</p>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 space-x-2">
                        <Button onClick={() => setIsMonitoring(false)} variant="destructive">
                          Stop Monitoring
                        </Button>
                        <Button variant="outline" className="bg-background/80 backdrop-blur-sm">
                          View All Students
                        </Button>
                      </div>

                      {/* Engagement overlay */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <p className="text-xs font-medium">
                          Class Engagement: <span className="text-primary font-bold">{Math.round(classEngagement)}%</span>
                        </p>
                      </div>
                    </div>
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
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.map((student) => (
                    <div 
                      key={student.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        student.alert ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        student.attention > 80 ? 'bg-success' : 
                        student.attention > 60 ? 'bg-yellow-500' : 'bg-destructive'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">{student.name}</p>
                          <Badge variant={student.alert ? "destructive" : "secondary"} className="text-xs">
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
                    <span className="text-muted-foreground">Active Attention</span>
                    <span className="font-semibold text-success">{Math.round(classEngagement)}%</span>
                  </div>
                  <Progress value={classEngagement} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <Eye className="h-4 w-4 text-success mb-1" />
                    <p className="text-2xl font-bold text-success">{behaviorStats.attentive}</p>
                    <p className="text-xs text-muted-foreground">Attentive</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="h-4 w-4 text-destructive mb-1" />
                    <p className="text-2xl font-bold text-destructive">{behaviorStats.distracted}</p>
                    <p className="text-xs text-muted-foreground">Distracted</p>
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
                        'border-blue-500/50 bg-blue-500/5'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                          alert.severity === 'high' ? 'text-destructive' :
                          alert.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
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
