import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
}

export const FeatureCard = ({ icon: Icon, title, description, gradient = "from-soft-blue to-gentle-lavender" }: FeatureCardProps) => {
  return (
    <Card className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-warm-cream to-card">
      <CardContent className="p-6 text-center">
        <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};