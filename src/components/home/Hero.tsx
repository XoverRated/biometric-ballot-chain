import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShieldCheckIcon, FingerprintIcon, ArrowRightIcon } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-vote-blue via-vote-teal to-vote-accent overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0 bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-16 text-center text-white relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <FingerprintIcon className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-vote-accent rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="block">Secure Digital</span>
              <span className="block bg-gradient-to-r from-white to-vote-light bg-clip-text text-transparent">
                Voting Platform
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Experience the future of democracy with biometric authentication, 
              blockchain security, and transparent elections.
            </p>
          </div>

          {/* Features badges */}
          <div className="flex flex-wrap justify-center gap-4 py-6">
            {[
              "🔐 Biometric Security",
              "⛓️ Blockchain Verified", 
              "📱 Mobile Friendly",
              "🌍 Accessible Anywhere"
            ].map((feature) => (
              <div key={feature} className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm font-medium">
                {feature}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-white text-vote-blue hover:bg-vote-light hover:text-vote-blue transition-all duration-300 shadow-lg hover:shadow-xl group px-8 py-4 text-lg font-semibold"
              >
                Start Voting Now
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link to="/how-it-works">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 px-8 py-4 text-lg font-semibold"
              >
                Learn How It Works
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="pt-12 border-t border-white/20">
            <p className="text-white/70 text-sm mb-4">Trusted by democratic institutions worldwide</p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold">🏛️</div>
              <div className="text-2xl font-bold">🔒</div>
              <div className="text-2xl font-bold">⚡</div>
              <div className="text-2xl font-bold">🌐</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};
