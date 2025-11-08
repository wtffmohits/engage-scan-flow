import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, ScanFace, QrCode, BarChart3, Shield, Zap, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-classroom.jpg";

const Index = () => {
  const features = [
    {
      icon: ScanFace,
      title: "AI Face Recognition",
      description: "Advanced facial recognition technology for seamless, contactless attendance",
    },
    {
      icon: QrCode,
      title: "Multi-Method Tracking",
      description: "QR codes, manual entry, and future radar-based proximity detection",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Real-time engagement metrics, behavior analysis, and automated reports",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "End-to-end encryption with role-based access control",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process hundreds of students in minutes with 99% accuracy",
    },
    {
      icon: Globe,
      title: "Cross-Platform",
      description: "Unified database syncing across web and mobile applications",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        <div className="absolute inset-0" style={{ 
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15
        }}></div>
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm mb-6 shadow-soft">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">AI-Powered Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Transform Attendance Into{" "}
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Smart Insights
              </span>
            </h1>
            
            <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
              Multi-technology attendance platform combining Face Recognition, QR codes, and AI analytics 
              for colleges, schools, and training programs.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard">
                <Button variant="hero" size="xl" className="gap-2">
                  Get Started
                  <Brain className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="xl" className="bg-card/80 backdrop-blur-sm hover:bg-card">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-lg text-muted-foreground">
              Advanced technology meets intuitive design for seamless attendance management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="shadow-medium hover:shadow-strong transition-smooth hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="p-3 rounded-lg bg-gradient-primary w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Modern Education
            </h2>
            <p className="text-lg text-muted-foreground">
              Trusted by institutions worldwide to increase transparency and efficiency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {["Universities", "Schools", "Training Centers", "Coaching Institutes"].map((useCase) => (
              <Card key={useCase} className="shadow-medium hover:shadow-strong transition-smooth text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-foreground">{useCase}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Revolutionize Your Attendance System?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of institutions using AI to transform attendance into actionable insights
          </p>
          <Link to="/auth">
            <Button variant="secondary" size="xl" className="gap-2 shadow-glow">
              Start Free Trial
              <Brain className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">AttendAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 AttendAI. Transforming attendance management with AI technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
