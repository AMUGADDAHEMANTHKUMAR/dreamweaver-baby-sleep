import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <section id="features" className="py-20">
        <FeaturesSection />
      </section>
      <section id="how-it-works" className="py-20 bg-warm-cream/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our simple 3-step process helps you create the perfect sleep routine for your baby
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-soft-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Sleep Patterns</h3>
              <p className="text-muted-foreground">Monitor your baby's sleep and wake times to understand their natural rhythm</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-warm-coral rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Routines</h3>
              <p className="text-muted-foreground">Build personalized bedtime routines with our guided recommendations</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-soft-mint rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy Better Sleep</h3>
              <p className="text-muted-foreground">Watch as your baby develops healthy sleep habits and longer rest periods</p>
            </div>
          </div>
        </div>
      </section>
      <section id="reviews" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Parents Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of families who have transformed their bedtime routines
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-gentle">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">⭐</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">"DreamyBaby helped us establish a consistent sleep routine. Our little one now sleeps through the night!"</p>
              <div className="font-semibold">Sarah M.</div>
              <div className="text-sm text-muted-foreground">Mother of 8-month-old</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-gentle">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">⭐</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">"The sleep tracking features are incredible. We finally understand our baby's sleep patterns."</p>
              <div className="font-semibold">Michael R.</div>
              <div className="text-sm text-muted-foreground">Father of 6-month-old</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-gentle">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">⭐</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">"Easy to use and the audio library is perfect for bedtime. Highly recommend!"</p>
              <div className="font-semibold">Emma L.</div>
              <div className="text-sm text-muted-foreground">Mother of twins</div>
            </div>
          </div>
        </div>
      </section>
      <section id="pricing" className="py-20 bg-gentle-lavender/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade when you're ready for more features
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-gentle">
              <h3 className="text-2xl font-bold mb-4">Free Plan</h3>
              <div className="text-4xl font-bold mb-6">$0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-soft-mint rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Basic sleep tracking
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-soft-mint rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  5 audio tracks
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-soft-mint rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Basic articles
                </li>
              </ul>
              <button className="w-full py-3 px-6 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors">
                Get Started Free
              </button>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-gentle border-2 border-soft-blue">
              <div className="text-center mb-4">
                <span className="bg-soft-blue text-white px-3 py-1 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Premium Plan</h3>
              <div className="text-4xl font-bold mb-6">$9.99<span className="text-lg font-normal text-muted-foreground">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-soft-blue rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Advanced analytics
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-soft-blue rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Unlimited audio library
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-soft-blue rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Expert tips & articles
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-soft-blue rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  Custom routines
                </li>
              </ul>
              <button className="w-full py-3 px-6 bg-soft-blue text-white rounded-lg font-semibold hover:bg-soft-blue/90 transition-colors">
                Start Premium Trial
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
