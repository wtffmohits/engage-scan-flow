import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface AttendanceMethodCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  status?: "active" | "coming-soon";
}

export const AttendanceMethodCard = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  status = "active"
}: AttendanceMethodCardProps) => {
  return (
    <Card className="group hover:shadow-strong transition-smooth hover:scale-[1.02] cursor-pointer" onClick={onClick}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-lg bg-gradient-primary shadow-medium">
            <Icon className="h-8 w-8 text-primary-foreground" />
          </div>
          {status === "coming-soon" && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
              Coming Soon
            </span>
          )}
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="ghost" 
          className="w-full justify-between group-hover:bg-accent"
          disabled={status === "coming-soon"}
        >
          {status === "active" ? "Start Session" : "Not Available"}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-smooth" />
        </Button>
      </CardContent>
    </Card>
  );
};
