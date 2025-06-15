
import { Link } from "react-router-dom";
import { FingerprintIcon, TwitterIcon, GithubIcon, LinkedinIcon, MailIcon } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-vote-blue to-vote-teal rounded-xl p-3">
                <FingerprintIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-vote-blue to-vote-teal bg-clip-text text-transparent">
                  BiometricBallot
                </span>
                <div className="text-sm text-gray-400">Secure Digital Voting Platform</div>
              </div>
            </Link>
            
            <p className="text-gray-300 text-lg leading-relaxed max-w-md mb-6">
              Revolutionizing democracy with biometric security, blockchain transparency, 
              and accessible voting technology for the digital age.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {[
                { icon: TwitterIcon, href: "#", label: "Twitter" },
                { icon: GithubIcon, href: "#", label: "GitHub" },
                { icon: LinkedinIcon, href: "#", label: "LinkedIn" },
                { icon: MailIcon, href: "#", label: "Email" }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-vote-blue transition-colors duration-300 group"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Platform</h3>
            <ul className="space-y-4">
              {[
                { name: "How It Works", path: "/how-it-works" },
                { name: "Elections", path: "/elections" },
                { name: "Security", path: "/security" },
                { name: "Verify Votes", path: "/verify" }
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-300 hover:text-vote-accent transition-colors duration-300 hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Support</h3>
            <ul className="space-y-4">
              {[
                { name: "FAQ", path: "/faq" },
                { name: "Contact", path: "/contact" },
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Service", path: "/terms" }
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-300 hover:text-vote-accent transition-colors duration-300 hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 BiometricBallot. All rights reserved. Securing democracy through technology.
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>System Status: Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
