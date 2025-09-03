import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";
import heroImage from "@/assets/new-hero-baby-sleep.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-warm-cream to-gentle-lavender overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-soft-blue to-gentle-lavender rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-warm-coral to-accent rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-soft-mint to-gentle-lavender rounded-full opacity-15 animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Content */}
        <div className="text-center lg:text-left space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-muted-foreground shadow-gentle">
            <Heart className="h-4 w-4 text-warm-coral" />
            Trusted by 50,000+ families
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Sweet Dreams
            <span className="block bg-gradient-to-r from-soft-blue to-gentle-lavender bg-clip-text text-transparent">
              Start Here
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Transform sleepless nights into peaceful rest. Our gentle, science-backed approach helps you understand your baby's sleep patterns and create the perfect bedtime routine.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6" onClick={() => window.location.href = '/auth'}>
              Start Tracking
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-soft-blue rounded-full"></div>
              No subscription required
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-warm-coral rounded-full"></div>
              Works offline
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-soft-mint rounded-full"></div>
              Privacy focused
            </div>
          </div>
        </div>
        
        {/* Image */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl shadow-warm">
            <img 
              src={heroImage} 
              alt="Peaceful sleeping baby" 
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-soft-blue/20 to-transparent"></div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-soft animate-bounce delay-1000">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-soft-mint rounded-full"></div>
              <span className="text-sm font-medium">8 hrs sleep</span>
            </div>
          </div>
          
          <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-soft animate-bounce">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-warm-coral rounded-full"></div>
              <span className="text-sm font-medium">Perfect routine</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};