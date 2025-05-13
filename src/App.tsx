
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import BiometricAuthPage from "./pages/BiometricAuthPage";
import ElectionsPage from "./pages/ElectionsPage";
import ElectionDetailPage from "./pages/ElectionDetailPage";
import VoteConfirmationPage from "./pages/VoteConfirmationPage";
import VerifyPage from "./pages/VerifyPage";
import HowItWorksPage from "./pages/HowItWorksPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/biometric-auth" element={<BiometricAuthPage />} />
          <Route path="/elections" element={<ElectionsPage />} />
          <Route path="/elections/:id" element={<ElectionDetailPage />} />
          <Route path="/vote-confirmation" element={<VoteConfirmationPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
