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
              Electronic Voting using Blockchain and Biometric Scanning Technologies
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100">
              Experience a revolutionary voting system that combines the security of biometric verification 
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
                    <FingerprintDisplay />
                  </div>
                  <p className="text-center text-sm text-gray-500">
                    Verify your identity with your fingerprint
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

const FingerprintDisplay = () => {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-vote-teal animate-pulse-slow"
      >
        <path
          d="M50 10C40.6064 10 31.7838 14.2143 25.2513 22.015C24.5403 22.6937 23.4597 22.6937 22.7487 22.015C22.0378 21.3362 22.0378 20.3021 22.7487 19.6233C29.9298 11.1224 39.5301 6.66667 50 6.66667C60.4699 6.66667 70.0702 11.1224 77.2513 19.6233C77.9622 20.3021 77.9622 21.3362 77.2513 22.015C76.5403 22.6937 75.4597 22.6937 74.7487 22.015C68.2162 14.2143 59.3936 10 50 10Z"
          fill="currentColor"
        />
        <path
          d="M77.2513 29.2872C76.5403 28.6085 75.4597 28.6085 74.7487 29.2872C68.2162 37.088 59.3936 41.3333 50 41.3333C40.6064 41.3333 31.7838 37.088 25.2513 29.2872C24.5403 28.6085 23.4597 28.6085 22.7487 29.2872C22.0378 29.966 22.0378 31.0001 22.7487 31.6789C29.9298 40.1798 39.5301 44.6667 50 44.6667C60.4699 44.6667 70.0702 40.1798 77.2513 31.6789C77.9622 31.0001 77.9622 29.966 77.2513 29.2872Z"
          fill="currentColor"
        />
        <path
          d="M77.2513 36.6233C76.5403 35.9445 75.4597 35.9445 74.7487 36.6233C68.2162 44.4241 59.3936 48.6667 50 48.6667C40.6064 48.6667 31.7838 44.4241 25.2513 36.6233C24.5403 35.9445 23.4597 35.9445 22.7487 36.6233C22.0378 37.3021 22.0378 38.3362 22.7487 39.015C29.9298 47.5159 39.5301 52 50 52C60.4699 52 70.0702 47.5159 77.2513 39.015C77.9622 38.3362 77.9622 37.3021 77.2513 36.6233Z"
          fill="currentColor"
        />
        <path
          d="M77.2513 44.2872C76.5403 43.6085 75.4597 43.6085 74.7487 44.2872C68.2162 52.088 59.3936 56.3333 50 56.3333C40.6064 56.3333 31.7838 52.088 25.2513 44.2872C24.5403 43.6085 23.4597 43.6085 22.7487 44.2872C22.0378 44.966 22.0378 46.0001 22.7487 46.6789C29.9298 55.1798 39.5301 59.6667 50 59.6667C60.4699 59.6667 70.0702 55.1798 77.2513 46.6789C77.9622 46.0001 77.9622 44.966 77.2513 44.2872Z"
          fill="currentColor"
        />
        <path
          d="M77.2513 51.6233C76.5403 50.9445 75.4597 50.9445 74.7487 51.6233C68.2162 59.4241 59.3936 63.6667 50 63.6667C40.6064 63.6667 31.7838 59.4241 25.2513 51.6233C24.5403 50.9445 23.4597 50.9445 22.7487 51.6233C22.0378 52.3021 22.0378 53.3362 22.7487 54.015C29.9298 62.5159 39.5301 67 50 67C60.4699 67 70.0702 62.5159 77.2513 54.015C77.9622 53.3362 77.9622 52.3021 77.2513 51.6233Z"
          fill="currentColor"
        />
        <path
          d="M77.2513 59.2872C76.5403 58.6085 75.4597 58.6085 74.7487 59.2872C68.2162 67.088 59.3936 71.3333 50 71.3333C40.6064 71.3333 31.7838 67.088 25.2513 59.2872C24.5403 58.6085 23.4597 58.6085 22.7487 59.2872C22.0378 59.966 22.0378 61.0001 22.7487 61.6789C29.9298 70.1798 39.5301 74.6667 50 74.6667C60.4699 74.6667 70.0702 70.1798 77.2513 61.6789C77.9622 61.0001 77.9622 59.966 77.2513 59.2872Z"
          fill="currentColor"
        />
        <path
          d="M74.7487 66.6233C68.2162 74.4241 59.3936 78.6667 50 78.6667C40.6064 78.6667 31.7838 74.4241 25.2513 66.6233C24.5403 65.9445 23.4597 65.9445 22.7487 66.6233C22.0378 67.3021 22.0378 68.3362 22.7487 69.015C29.9298 77.5159 39.5301 82 50 82C60.4699 82 70.0702 77.5159 77.2513 69.015C77.9622 68.3362 77.9622 67.3021 77.2513 66.6233C76.5403 65.9445 75.4597 65.9445 74.7487 66.6233Z"
          fill="currentColor"
        />
        <path
          d="M74.7487 74.2872C68.2162 82.088 59.3936 86.3333 50 86.3333C40.6064 86.3333 31.7838 82.088 25.2513 74.2872C24.5403 73.6085 23.4597 73.6085 22.7487 74.2872C22.0378 74.966 22.0378 76.0001 22.7487 76.6789C29.9298 85.1798 39.5301 89.6667 50 89.6667C60.4699 89.6667 70.0702 85.1798 77.2513 76.6789C77.9622 76.0001 77.9622 74.966 77.2513 74.2872C76.5403 73.6085 75.4597 73.6085 74.7487 74.2872Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};
