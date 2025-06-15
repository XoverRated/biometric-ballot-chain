
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FingerprintIcon, UserIcon, MenuIcon, XIcon } from "lucide-react"; // Removed ShieldCheckIcon as it's not used
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/auth/UserMenu";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-vote-blue rounded-full p-2">
            <FingerprintIcon className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl text-vote-blue hidden md:block">BiometricBallot</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-vote-blue transition-colors">
            Home
          </Link>
          <Link to="/how-it-works" className="text-gray-700 hover:text-vote-blue transition-colors">
            How It Works
          </Link>
          <Link to="/elections" className="text-gray-700 hover:text-vote-blue transition-colors">
            Elections
          </Link>
          {user && ( // Show Verify Votes link only if user is logged in
            <Link to="/verify" className="text-gray-700 hover:text-vote-blue transition-colors">
              Verify Votes
            </Link>
          )}
        </nav>

        {/* Authentication Button - Desktop */}
        <div className="hidden md:block">
          {user ? (
            <UserMenu />
          ) : (
            <Link to="/auth">
              <Button className="bg-vote-blue hover:bg-vote-teal transition-colors">
                <UserIcon className="h-4 w-4 mr-2" />
                Sign In to Vote
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
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
          "absolute top-full left-0 right-0 bg-white shadow-md md:hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible h-0"
        )}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          <Link
            to="/"
            className="block px-4 py-2 hover:bg-vote-gray rounded"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/how-it-works"
            className="block px-4 py-2 hover:bg-vote-gray rounded"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            to="/elections"
            className="block px-4 py-2 hover:bg-vote-gray rounded"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Elections
          </Link>
          {user && ( // Show Verify Votes link only if user is logged in
            <Link
              to="/verify"
              className="block px-4 py-2 hover:bg-vote-gray rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Verify Votes
            </Link>
          )}
          {user ? (
            <div className="px-4 py-2">
              <UserMenu />
            </div>
          ) : (
            <Link
              to="/auth"
              className="block"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Button className="w-full bg-vote-blue hover:bg-vote-teal">
                <UserIcon className="h-4 w-4 mr-2" />
                Sign In to Vote
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

