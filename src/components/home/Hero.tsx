import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShieldCheckIcon, VoteIcon, CheckCircleIcon } from "lucide-react";

export const Hero = () => {
  return (
    <div className="hero-gradient text-white py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Electronic Voting Using Blockchain and Biometric Scanning Technologies
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100">
              Experience a revolutionary voting system that combines the security of facial recognition 
              with the transparency of blockchain technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-white text-vote-blue hover:bg-vote-light transition-colors">
                  Sign In to Vote
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-vote-blue transition-colors"
                >
                  Learn How It Works
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 mt-10">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span>Secure Identity Verification</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span>Immutable Ballot Records</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span>Vote Verification</span>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-vote-light rounded-full flex items-center justify-center">
                    <VoteIcon className="h-10 w-10 text-vote-teal" />
                  </div>
                </div>
                <h3 className="text-vote-blue text-xl font-bold text-center mb-4">
                  Cast Your Vote Securely
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Your vote is securely recorded and cannot be altered, ensuring the integrity of the election.
                </p>
                <div className="bg-gray-100 p-4 rounded-lg relative overflow-hidden biometric-scan">
                  <div className="flex justify-center mb-2">
                    <FaceRecognitionDisplay />
                  </div>
                  <p className="text-center text-sm text-gray-500">
                    Verify your identity with facial recognition
                  </p>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-center text-vote-blue">
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Blockchain Protected</span>
                  </div>
                </div>
              </div>
              {/* Background hexagon pattern */}
              <div className="absolute -z-10 -right-16 -bottom-16 w-64 h-64 opacity-10">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FaceRecognitionDisplay = () => {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <div className="w-24 h-32 border-2 border-dashed border-vote-teal rounded-lg flex items-center justify-center">
        <div className="w-16 h-20 border border-vote-teal rounded-full relative">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-vote-teal rounded-full"></div>
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-vote-teal rounded-full"></div>
          <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-vote-teal"></div>
          <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-vote-teal rounded-full"></div>
        </div>
      </div>
      <div className="absolute inset-0 border-2 border-vote-teal animate-pulse-slow opacity-50"></div>
    </div>
  );
};
