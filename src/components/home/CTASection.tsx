
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRightIcon, ShieldCheckIcon, FingerprintIcon } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-vote-blue via-vote-teal to-vote-accent relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\" fill-rule=\"evenodd\"%3E%3Cpath d=\"M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z\"/%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
      </div>

      <div className="container mx-auto px-4 text-center text-white relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Icons */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <FingerprintIcon className="h-8 w-8 text-white" />
            </div>
            <div className="w-4 h-0.5 bg-white/40"></div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Ready to Experience
            <br />
            <span className="bg-gradient-to-r from-white to-vote-light bg-clip-text text-transparent">
              Secure Democracy?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of voters who trust BiometricBallot for secure, 
            transparent, and accessible digital voting.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-white text-vote-blue hover:bg-vote-light hover:text-vote-blue transition-all duration-300 shadow-2xl hover:shadow-3xl group px-10 py-5 text-xl font-bold"
              >
                Start Voting Today
                <ArrowRightIcon className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>
            
            <Link to="/security">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white/40 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 px-10 py-5 text-xl font-semibold"
              >
                Learn About Security
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">256-bit</div>
              <div className="text-white/80">Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">99.9%</div>
              <div className="text-white/80">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-white/80">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 border border-white/10 rounded-full"></div>
      <div className="absolute top-1/2 left-20 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
      <div className="absolute top-1/4 right-32 w-3 h-3 bg-white/20 rounded-full animate-pulse delay-1000"></div>
    </section>
  );
};
