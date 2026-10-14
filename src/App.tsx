import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { BusinessProvider } from '@/context/BusinessContext';
import AuthScreen from '@/components/auth/AuthScreen';
import AppShell from '@/components/layout/AppShell';
import LandingPage from '@/components/LandingPage';
import { Building2 } from 'lucide-react';
import { isEmailVerificationCallback, supabase } from '@/lib/supabase';
import { getAppView } from './app-view';

function AppContent() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [forceAuth, setForceAuth] = useState(() => window.location.hash === '#reset-password' || isEmailVerificationCallback);

  useEffect(() => {
    const recoveryMode = window.location.hash === '#reset-password';
    if (recoveryMode || isEmailVerificationCallback) {
      setShowAuth(true);
      setForceAuth(true);
    }

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowAuth(true);
        setForceAuth(true);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isEmailVerificationCallback || loading || !user || emailVerified) return;
    if (user.email_confirmed_at) {
      setEmailVerified(true);
      setForceAuth(false);
      void supabase.auth.signOut().then(() => {
        window.history.replaceState({}, '', window.location.pathname);
      });
    }
  }, [loading, user, emailVerified]);

  const view = getAppView({ loading, user, showAuth, forceAuth });

  if (view === 'loading') {
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

  if (view === 'workspace') {
    return (
      <BusinessProvider>
        <AppShell />
      </BusinessProvider>
    );
  }

  if (view === 'auth') {
    return <AuthScreen onBack={() => { setShowAuth(false); setForceAuth(false); }} emailVerified={emailVerified} onRecoveryComplete={() => setForceAuth(false)} />;
  }

  return <LandingPage onGetStarted={() => setShowAuth(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
