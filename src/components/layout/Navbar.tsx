
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FingerprintIcon, UserIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/auth/UserMenu";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="w-full bg-white/95 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="bg-gradient-to-br from-vote-blue to-vote-teal rounded-xl p-2.5 group-hover:scale-105 transition-transform duration-200">
            <FingerprintIcon className="h-7 w-7 text-white" />
          </div>
          <div className="hidden md:block">
            <span className="font-bold text-2xl bg-gradient-to-r from-vote-blue to-vote-teal bg-clip-text text-transparent">
              BiometricBallot
            </span>
            <div className="text-xs text-gray-500 -mt-1">Secure Digital Voting</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {[
            { name: "Home", path: "/" },
            { name: "How It Works", path: "/how-it-works" },
            { name: "Elections", path: "/elections" },
            { name: "Security", path: "/security" }
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="relative text-gray-700 hover:text-vote-blue transition-colors font-medium group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-vote-blue transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
          {user && (
            <Link
              to="/verify"
              className="relative text-gray-700 hover:text-vote-blue transition-colors font-medium group"
            >
              Verify Votes
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-vote-blue transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}
        </nav>

        {/* Authentication Button - Desktop */}
        <div className="hidden md:block">
          {user ? (
            <UserMenu />
          ) : (
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-vote-blue to-vote-teal hover:from-vote-teal hover:to-vote-blue transition-all duration-300 shadow-lg hover:shadow-xl group">
                <UserIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Sign In to Vote
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <XIcon className="h-6 w-6 text-vote-blue" />
          ) : (
            <MenuIcon className="h-6 w-6 text-vote-blue" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "absolute top-full left-0 right-0 bg-white shadow-lg md:hidden transition-all duration-300 ease-in-out border-t border-gray-100",
          isMobileMenuOpen ? "opacity-100 visible max-h-96" : "opacity-0 invisible max-h-0 overflow-hidden"
        )}
      >
        <div className="container mx-auto px-4 py-6 space-y-4">
          {[
            { name: "Home", path: "/" },
            { name: "How It Works", path: "/how-it-works" },
            { name: "Elections", path: "/elections" },
            { name: "Security", path: "/security" }
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block px-4 py-3 hover:bg-vote-light rounded-lg transition-colors font-medium text-gray-700 hover:text-vote-blue"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {user && (
            <Link
              to="/verify"
              className="block px-4 py-3 hover:bg-vote-light rounded-lg transition-colors font-medium text-gray-700 hover:text-vote-blue"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Verify Votes
            </Link>
          )}
          
          <div className="pt-4 border-t border-gray-200">
            {user ? (
              <div className="px-4">
                <UserMenu />
              </div>
            ) : (
              <Link
                to="/auth"
                className="block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button className="w-full bg-gradient-to-r from-vote-blue to-vote-teal hover:from-vote-teal hover:to-vote-blue transition-all duration-300">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Sign In to Vote
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
