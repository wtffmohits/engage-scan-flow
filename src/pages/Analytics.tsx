import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, Brain } from "lucide-react";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Insights</h1>
          <p className="text-muted-foreground">AI-powered classroom analytics and behavior tracking</p>
        </div>

        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="attendance" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Attendance Trends
            </TabsTrigger>
            <TabsTrigger value="engagement" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="behavior" className="gap-2">
              <Brain className="h-4 w-4" />
              Behavior Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>Weekly Attendance</CardTitle>
                  <CardDescription>Last 7 days attendance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-around gap-2">
                    {[92, 88, 95, 91, 94, 89, 96].map((value, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gradient-primary rounded-t-lg relative" style={{ height: `${value}%` }}>
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium">{value}%</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Day {i + 1}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>Department-wise Attendance</CardTitle>
                  <CardDescription>Current month comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { dept: "Computer Science", rate: 96 },
                      { dept: "Electronics", rate: 92 },
                      { dept: "Mechanical", rate: 88 },
                      { dept: "Civil", rate: 90 },
                    ].map((item) => (
                      <div key={item.dept} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.dept}</span>
                          <span className="text-muted-foreground">{item.rate}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-primary h-2 rounded-full transition-smooth"
                            style={{ width: `${item.rate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Classroom Engagement Metrics</CardTitle>
                <CardDescription>Real-time behavior and participation tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Attention Level", value: 87, icon: Brain },
                    { label: "Participation", value: 92, icon: Users },
                    { label: "Discipline Score", value: 95, icon: TrendingUp },
                  ].map((metric) => (
                    <div key={metric.label} className="text-center space-y-3">
                      <div className="inline-flex p-4 rounded-full bg-gradient-primary">
                        <metric.icon className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-foreground">{metric.value}%</p>
                        <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mx-auto max-w-[200px]">
                        <div 
                          className="bg-gradient-primary h-2 rounded-full transition-smooth"
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>AI Behavior Analysis</CardTitle>
                <CardDescription>Computer vision + audio NLP insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Proxy Detection Alerts</h4>
                      <div className="space-y-2">
                        {[
                          { time: "09:15 AM", student: "STU1023", status: "Resolved" },
                          { time: "10:30 AM", student: "STU1045", status: "Pending" },
                          { time: "02:45 PM", student: "STU1089", status: "Resolved" },
                        ].map((alert, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div>
                              <p className="text-sm font-medium">{alert.student}</p>
                              <p className="text-xs text-muted-foreground">{alert.time}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              alert.status === "Resolved" 
                                ? "bg-success/20 text-success" 
                                : "bg-warning/20 text-warning"
                            }`}>
                              {alert.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Performance Reports</h4>
                      <div className="space-y-2">
                        <div className="p-4 rounded-lg bg-gradient-card border border-border">
                          <p className="text-sm font-medium mb-2">Auto-generated Insights</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Overall class engagement improved by 12% this week. Morning sessions show 
                            highest participation rates. Recommend maintaining current teaching approach.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analytics;
