import { lazy, Suspense, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { BusinessProvider } from '@/context/BusinessContext';

import { AbosMark } from '@/components/landing/abos-mark';
import { isEmailVerificationCallback, supabase } from '@/lib/supabase';
import { getAppView } from './app-view';

const AuthScreen = lazy(() => import('@/components/auth/AuthScreen'));
const AppShell = lazy(() => import('@/components/layout/AppShell'));
const LandingPage = lazy(() => import('@/components/LandingPage'));

function AppChunkFallback() {
  return (
    <div className="min-h-screen abos-bg flex items-center justify-center" role="status" aria-label="Loading ABOS">
      <div className="w-7 h-7 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );
}

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
          <AbosMark className="h-12 w-12" glow />
          <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (view === 'workspace') {
    return (
      <BusinessProvider>
        <Suspense fallback={<AppChunkFallback />}><AppShell /></Suspense>
      </BusinessProvider>
    );
  }

  if (view === 'auth') {
    return <Suspense fallback={<AppChunkFallback />}><AuthScreen onBack={() => { setShowAuth(false); setForceAuth(false); }} emailVerified={emailVerified} onRecoveryComplete={() => setForceAuth(false)} /></Suspense>;
  }

  return <Suspense fallback={<AppChunkFallback />}><LandingPage onGetStarted={() => setShowAuth(true)} onLogin={() => setShowAuth(true)} /></Suspense>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
