import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import FaceAuthPage from "@/pages/FaceAuthPage";
import FaceRegisterPage from "@/pages/FaceRegisterPage";
import ElectionsPage from "@/pages/ElectionsPage";
import ElectionDetailPage from "@/pages/ElectionDetailPage";
import VoteConfirmationPage from "@/pages/VoteConfirmationPage";
import VerifyPage from "@/pages/VerifyPage";
import HowItWorksPage from "@/pages/HowItWorksPage";
import FAQPage from "@/pages/FAQPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import SecurityInfoPage from "@/pages/SecurityInfoPage";
import ContactPage from "@/pages/ContactPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import AboutUsPage from "@/pages/AboutUsPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { BiometricProtectedRoute } from "@/components/auth/BiometricProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          
          <Route path="/face-auth" element={<ProtectedRoute><FaceAuthPage /></ProtectedRoute>} />
          <Route path="/face-register" element={<ProtectedRoute><FaceRegisterPage /></ProtectedRoute>} />
          <Route path="/elections" element={<BiometricProtectedRoute><ElectionsPage /></BiometricProtectedRoute>} />
          <Route path="/elections/:id" element={<BiometricProtectedRoute><ElectionDetailPage /></BiometricProtectedRoute>} />
          <Route path="/vote-confirmation" element={<BiometricProtectedRoute><VoteConfirmationPage /></BiometricProtectedRoute>} />
          <Route path="/verify" element={<BiometricProtectedRoute><VerifyPage /></BiometricProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Admin Route */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/security" element={<SecurityInfoPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;
