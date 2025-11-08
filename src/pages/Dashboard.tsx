import { Navbar } from "@/components/Navbar";
import { StatsCard } from "@/components/StatsCard";
import { AttendanceMethodCard } from "@/components/AttendanceMethodCard";
import { Users, CheckCircle, TrendingUp, AlertCircle, ScanFace, QrCode, FileEdit, Radar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Students",
      value: "1,284",
      icon: Users,
      trend: { value: "12% from last month", isPositive: true },
    },
    {
      title: "Today's Attendance",
      value: "94.2%",
      icon: CheckCircle,
      trend: { value: "2.1% from yesterday", isPositive: true },
      iconBg: "bg-success",
    },
    {
      title: "Avg. Engagement",
      value: "87%",
      icon: TrendingUp,
      trend: { value: "5% from last week", isPositive: true },
      iconBg: "bg-secondary",
    },
    {
      title: "Proxy Alerts",
      value: "3",
      icon: AlertCircle,
      trend: { value: "2 less than yesterday", isPositive: true },
      iconBg: "bg-warning",
    },
  ];

  const attendanceMethods = [
    {
      title: "Face Recognition",
      description: "AI-powered facial recognition for seamless attendance tracking",
      icon: ScanFace,
      onClick: () => navigate("/attendance/face-recognition"),
    },
    {
      title: "QR Code Scan",
      description: "Quick attendance marking via QR code scanning",
      icon: QrCode,
      onClick: () => navigate("/attendance/qr-code"),
    },
    {
      title: "Manual Entry",
      description: "Traditional manual attendance marking with override options",
      icon: FileEdit,
      onClick: () => navigate("/attendance/manual"),
    },
    {
      title: "Proximity Detection",
      description: "Next-gen radar-based automatic attendance detection",
      icon: Radar,
      onClick: () => {},
      status: "coming-soon" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitor attendance, engagement, and analytics in real-time</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Attendance Methods</h2>
          <p className="text-muted-foreground">Choose your preferred attendance tracking method</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {attendanceMethods.map((method) => (
            <AttendanceMethodCard key={method.title} {...method} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
