import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { BusinessProvider } from '@/context/BusinessContext';
import AuthScreen from '@/components/auth/AuthScreen';
import AppShell from '@/components/layout/AppShell';
import { Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function AppContent() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const recoveryMode = window.location.hash === '#reset-password';
    if (recoveryMode) setShowAuth(true);

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowAuth(true);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

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

  if (!user || showAuth) {
    return (
      <AuthScreen
        onBack={() => setShowAuth(false)}
      />
    );
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
