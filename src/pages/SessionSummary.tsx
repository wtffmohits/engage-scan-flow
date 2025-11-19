import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Download, 
  FileText, 
  Share2, 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertTriangle,
  Users,
  Clock
} from "lucide-react";

const SessionSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const sessionData = {
    id: id || "S001",
    date: "Nov 19, 2025",
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    duration: "1h 30m",
    subject: "Mathematics - Calculus",
    teacher: "Prof. Sarah Johnson",
    totalStudents: 45,
    present: 42,
    avgEngagement: 76,
    peakEngagement: 92,
    lowestEngagement: 54,
  };

  const studentPerformance = [
    { name: "Student A", engagement: 95, behavior: "Excellent", alerts: 0, trend: "up" },
    { name: "Student B", engagement: 65, behavior: "Needs Attention", alerts: 3, trend: "down" },
    { name: "Student C", engagement: 88, behavior: "Good", alerts: 0, trend: "up" },
    { name: "Student D", engagement: 45, behavior: "Poor", alerts: 5, trend: "down" },
    { name: "Student E", engagement: 82, behavior: "Good", alerts: 1, trend: "up" },
  ];

  const behaviorDistribution = [
    { label: "Attentive", count: 28, percentage: 67, color: "bg-success" },
    { label: "Distracted", count: 8, percentage: 19, color: "bg-destructive" },
    { label: "Talking", count: 4, percentage: 10, color: "bg-yellow-500" },
    { label: "Looking Away", count: 2, percentage: 5, color: "bg-blue-500" },
  ];

  const alertsSummary = [
    { time: "10:45", student: "Student D", issue: "Using phone detected", severity: "high" },
    { time: "10:43", student: "Student B", issue: "Looking away for 20 sec", severity: "medium" },
    { time: "10:40", student: "Row 3 Group", issue: "Group discussion detected", severity: "low" },
    { time: "10:35", student: "Student F", issue: "Sleeping posture detected", severity: "high" },
    { time: "10:25", student: "Student B", issue: "Not paying attention", severity: "medium" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Session Summary</h1>
              <p className="text-muted-foreground">Detailed analysis for Session {sessionData.id}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="default" className="gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Session Info */}
        <Card className="shadow-medium mb-6">
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                <p className="font-semibold">{sessionData.date}</p>
                <p className="text-sm">{sessionData.startTime} - {sessionData.endTime}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                <p className="font-semibold">{sessionData.subject}</p>
                <p className="text-sm">{sessionData.teacher}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Attendance</p>
                <p className="font-semibold">{sessionData.present}/{sessionData.totalStudents}</p>
                <p className="text-sm text-success">{Math.round((sessionData.present/sessionData.totalStudents)*100)}% Present</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {sessionData.duration}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Engagement & Behavior */}
          <div className="lg:col-span-2 space-y-6">
            {/* Engagement Summary */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Class Engagement Summary
                </CardTitle>
                <CardDescription>Overall classroom attention and participation metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-3xl font-bold text-primary">{sessionData.avgEngagement}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Average</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-success/5 border border-success/20">
                    <p className="text-3xl font-bold text-success">{sessionData.peakEngagement}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Peak</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="text-3xl font-bold text-destructive">{sessionData.lowestEngagement}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Lowest</p>
                  </div>
                </div>

                {/* Engagement Timeline Chart (Simulated) */}
                <div>
                  <p className="text-sm font-medium mb-3">Engagement Timeline</p>
                  <div className="h-32 bg-muted rounded-lg flex items-end gap-1 p-2">
                    {[65, 72, 78, 85, 92, 88, 82, 75, 68, 72, 78, 82, 85, 80, 75, 70, 65, 60, 54, 62, 68, 75, 80, 85].map((value, i) => (
                      <div 
                        key={i}
                        className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-sm"
                        style={{ height: `${value}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>10:00</span>
                    <span>10:30</span>
                    <span>11:00</span>
                    <span>11:30</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Behavior Distribution */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Behavior Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {behaviorDistribution.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-sm text-muted-foreground">{item.count} students ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full transition-all`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Student Performance */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Student-wise Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentPerformance.map((student, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{student.name}</p>
                          <div className="flex items-center gap-2">
                            {student.trend === "up" ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                            <Badge variant={student.alerts > 0 ? "destructive" : "secondary"}>
                              {student.behavior}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={student.engagement} className="h-2 flex-1" />
                          <span className="text-sm font-semibold min-w-[3rem] text-right">{student.engagement}%</span>
                        </div>
                        {student.alerts > 0 && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {student.alerts} alerts during session
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Alerts Summary */}
          <div className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Alerts Summary
                </CardTitle>
                <CardDescription>All behavior alerts during this session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertsSummary.map((alert, index) => (
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
                          <p className="text-sm font-medium">{alert.student}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{alert.issue}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-sm font-medium mb-1">📊 Engagement Dip</p>
                  <p className="text-xs text-muted-foreground">
                    Consider interactive activities around 11:00 AM when engagement dropped.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <p className="text-sm font-medium mb-1">👥 Student B & D</p>
                  <p className="text-xs text-muted-foreground">
                    Multiple alerts detected. Recommend one-on-one follow-up.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                  <p className="text-sm font-medium mb-1">✅ Strong Start</p>
                  <p className="text-xs text-muted-foreground">
                    First 30 minutes showed excellent engagement. Replicate this approach.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionSummary;
