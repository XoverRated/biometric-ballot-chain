
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';
import { HomePage } from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';
import SecurityInfoPage from './pages/SecurityInfoPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';
import ElectionsPage from './pages/ElectionsPage';
import ElectionDetailPage from './pages/ElectionDetailPage';
import VoteConfirmationPage from './pages/VoteConfirmationPage';
import ProfilePage from './pages/ProfilePage';
import BiometricRegisterPage from './pages/BiometricRegisterPage';
import BiometricAuthPage from './pages/BiometricAuthPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import EnhancedBiometricRegisterPage from './pages/EnhancedBiometricRegisterPage';
import EnhancedBiometricAuthPage from './pages/EnhancedBiometricAuthPage';
import FaceRegisterPage from './pages/FaceRegisterPage';
import FaceAuthPage from './pages/FaceAuthPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ElectionResultsPage from './pages/ElectionResultsPage';
import { SkipLink } from './components/common/SkipLink';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Web3Provider>
          <div className="min-h-screen bg-gray-50">
            <SkipLink targetId="main-content" />
            <Toaster />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/security" element={<SecurityInfoPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Authentication routes */}
              <Route path="/biometric-register" element={<BiometricRegisterPage />} />
              <Route path="/biometric-auth" element={<BiometricAuthPage />} />
              <Route path="/enhanced-biometric-register" element={<EnhancedBiometricRegisterPage />} />
              <Route path="/enhanced-biometric-auth" element={<EnhancedBiometricAuthPage />} />
              <Route path="/face-register" element={<FaceRegisterPage />} />
              <Route path="/face-auth" element={<FaceAuthPage />} />
              
              {/* Protected routes */}
              <Route path="/elections" element={<ProtectedRoute><ElectionsPage /></ProtectedRoute>} />
              <Route path="/election/:id" element={<ProtectedRoute><ElectionDetailPage /></ProtectedRoute>} />
              <Route path="/elections/:electionId/results" element={<ProtectedRoute><ElectionResultsPage /></ProtectedRoute>} />
              <Route path="/vote-confirmation" element={<ProtectedRoute><VoteConfirmationPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Web3Provider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
