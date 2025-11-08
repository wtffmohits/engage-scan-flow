import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Video, CheckCircle } from "lucide-react";
import { useState } from "react";

const Attendance = () => {
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Face Recognition Attendance</h1>
          <p className="text-muted-foreground">AI-powered facial recognition for seamless attendance tracking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Camera Feed</CardTitle>
                <CardDescription>Position yourself in front of the camera for recognition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                  {!isScanning ? (
                    <div className="text-center space-y-4">
                      <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">Camera preview will appear here</p>
                      <Button onClick={() => setIsScanning(true)} variant="hero" size="lg" className="gap-2">
                        <Video className="h-5 w-5" />
                        Start Recognition
                      </Button>
                    </div>
                  ) : (
                    <div className="relative w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-4 border-primary rounded-lg animate-pulse"></div>
                      </div>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                        <Button onClick={() => setIsScanning(false)} variant="destructive">
                          Stop Recognition
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Recent Recognitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Student {i + 1}</p>
                        <p className="text-xs text-muted-foreground">ID: STU{1000 + i}</p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Session Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Recognized</span>
                    <span className="font-semibold">42</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Failed</span>
                    <span className="font-semibold text-destructive">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="font-semibold text-success">95.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Attendance;
