import { FeatureCard } from "./FeatureCard";
import { 
  Clock, 
  Calendar, 
  Music, 
  Users, 
  BarChart3, 
  Moon,
  Heart,
  Smartphone
} from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Clock,
      title: "Track Everything",
      description: "Monitor sleep, feeds, diaper changes, and more with our intuitive one-tap logging. See patterns emerge naturally.",
      gradient: "from-soft-blue to-gentle-lavender"
    },
    {
      icon: Calendar,
      title: "Personalized Sleep Schedules",
      description: "Get AI-powered schedule recommendations based on your baby's unique patterns and developmental stage.",
      gradient: "from-warm-coral to-accent"
    },
    {
      icon: Music,
      title: "Sounds & Guides",
      description: "Access our library of soothing sounds, white noise, and expert sleep guides to help your little one drift off peacefully.",
      gradient: "from-soft-mint to-gentle-lavender"
    },
    {
      icon: Users,
      title: "Multi-Caregiver Support",
      description: "Sync data across all caregivers in real-time. Grandparents, partners, and babysitters stay in the loop.",
      gradient: "from-gentle-lavender to-soft-blue"
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Beautiful insights and trends help you understand what's working and identify opportunities for better sleep.",
      gradient: "from-accent to-warm-coral"
    },
    {
      icon: Moon,
      title: "Sleep Optimization",
      description: "Gentle suggestions to improve sleep quality based on proven methods and your baby's individual needs.",
      gradient: "from-soft-blue to-soft-mint"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-warm-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-soft-blue/10 px-4 py-2 rounded-full text-sm text-soft-blue font-medium mb-6">
            <Heart className="h-4 w-4" />
            Everything you need for better sleep
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Features that
            <span className="block bg-gradient-to-r from-soft-blue to-gentle-lavender bg-clip-text text-transparent">
              grow with your family
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From newborn to toddler, our comprehensive toolkit adapts to your changing needs, 
            making every bedtime a little easier and every morning a little brighter.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
            />
          ))}
        </div>
        
        {/* Additional feature highlight */}
        <div className="bg-gradient-to-r from-soft-blue to-gentle-lavender rounded-3xl p-8 md:p-12 text-center text-white shadow-soft">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm mb-6">
              <Smartphone className="h-4 w-4" />
              Works on all devices
            </div>
            
            <h3 className="text-2xl md:text-4xl font-bold mb-4">
              Sleep better tonight
            </h3>
            
            <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
              Join thousands of families who've transformed their bedtime routines. 
              Start your journey to peaceful nights and happy mornings.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-soft-blue px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
                Start Your Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-soft-blue transition-all duration-300">
                Watch Demo Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};