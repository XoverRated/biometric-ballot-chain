
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import BiometricAuthPage from "@/pages/BiometricAuthPage";
import ElectionsPage from "@/pages/ElectionsPage";
import ElectionDetailPage from "@/pages/ElectionDetailPage";
import VoteConfirmationPage from "@/pages/VoteConfirmationPage";
import VerifyPage from "@/pages/VerifyPage";
import HowItWorksPage from "@/pages/HowItWorksPage";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/biometric-auth" element={<BiometricAuthPage />} />
          <Route path="/elections" element={<ElectionsPage />} />
          <Route path="/elections/:id" element={<ElectionDetailPage />} />
          <Route path="/vote-confirmation" element={<VoteConfirmationPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;
