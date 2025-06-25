
import { Link } from "react-router-dom";
import { FingerprintIcon, GithubIcon, TwitterIcon, FacebookIcon } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-vote-blue text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and tagline */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-white rounded-full p-2">
                <FingerprintIcon className="h-6 w-6 text-vote-blue" />
              </div>
              <span className="font-bold text-xl">BiometricBallot</span>
            </div>
            <p className="text-gray-300 text-sm">
              Secure, transparent electronic voting powered by blockchain and biometrics.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" aria-label="Twitter" className="text-white hover:text-vote-accent">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Facebook" className="text-white hover:text-vote-accent">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" aria-label="GitHub" className="text-white hover:text-vote-accent">
                <GithubIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/elections" className="text-gray-300 hover:text-white transition-colors">
                  Elections
                </Link>
              </li>
              <li>
                <Link to="/verify" className="text-gray-300 hover:text-white transition-colors">
                  Verify Votes
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-gray-300 hover:text-white transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300">
              Have questions or need assistance? Contact our support team.
            </p>
            <Link 
              to="/contact" 
              className="inline-block mt-4 px-4 py-2 bg-vote-teal text-white rounded hover:bg-vote-accent transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} BiometricBallot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
