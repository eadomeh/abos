import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { BusinessProvider } from '@/context/BusinessContext';
import AuthScreen from '@/components/auth/AuthScreen';
import LandingPage from '@/components/LandingPage';
import AppShell from '@/components/layout/AppShell';
import { Building2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen abos-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Building2 className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return showAuth
      ? <AuthScreen onBack={() => setShowAuth(false)} />
      : <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <BusinessProvider>
      <AppShell />
    </BusinessProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
