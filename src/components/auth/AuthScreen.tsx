import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type Mode = 'signin' | 'signup' | 'forgot' | 'reset';

export default function AuthScreen({ onBack }: { onBack?: () => void }) {
  const {
    signIn,
    signUp,
    signInWithProvider,
    resetPassword,
    updatePassword,
  } = useAuth();

  const [mode, setMode] = useState<Mode>(window.location.hash === '#reset-password' ? 'reset' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
        setError(null);
        setSuccess(null);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const title =
    mode === 'signin' ? 'Welcome back.' :
    mode === 'signup' ? 'Build with ABOS.' :
    mode === 'forgot' ? 'Reset your access.' :
    'Create a new password.';

  const subtitle =
    mode === 'signin' ? 'Enter the operating layer for your business.' :
    mode === 'signup' ? 'Start building your intelligent business workspace.' :
    mode === 'forgot' ? 'We will send a secure recovery link to your email.' :
    'Choose a strong password for your ABOS account.';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    let result: { error: string | null };

    if (mode === 'signin') {
      result = await signIn(email, password);
    } else if (mode === 'signup') {
      result = await signUp(email, password);
      if (!result.error) setSuccess('Account created. Check your email if confirmation is required.');
    } else if (mode === 'forgot') {
      result = await resetPassword(email);
      if (!result.error) setSuccess('Recovery email sent. Check your inbox.');
    } else {
      if (password.length < 6) {
        result = { error: 'Password must be at least 6 characters.' };
      } else if (password !== confirmation) {
        result = { error: 'Passwords do not match.' };
      } else {
        result = await updatePassword(password);
        if (!result.error) {
          setSuccess('Password updated. You can now continue with ABOS.');
          setMode('signin');
          setPassword('');
          setConfirmation('');
          window.history.replaceState({}, '', window.location.pathname + window.location.search);
        }
      }
    }

    if (result.error) setError(result.error);
    setLoading(false);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmation('');
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#050a0d] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,.14),transparent_28%),radial-gradient(circle_at_90%_80%,rgba(34,211,238,.08),transparent_28%),#050a0d]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
        <section className="hidden lg:block">
          <button
            onClick={onBack}
            className="mb-16 inline-flex items-center gap-2 text-xs uppercase tracking-[.2em] text-slate-500 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to ABOS
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-[9px] uppercase tracking-[.22em] text-emerald-200/80">
            <Sparkles className="h-3.5 w-3.5" /> Intelligent operations
          </div>

          <h1 className="mt-7 max-w-xl text-6xl font-semibold leading-[.95] tracking-[-.055em]">
            The command layer for your next stage of growth.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-500">
            One workspace for conversations, customers, automation, revenue signals and the intelligence that connects them.
          </p>

          <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              ['01', 'Connect', 'Bring business activity together.'],
              ['02', 'Understand', 'Turn signals into useful context.'],
              ['03', 'Move', 'Act faster with automation and AI.'],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-2xl border border-white/8 bg-white/[.025] p-4">
                <span className="text-[9px] tracking-[.2em] text-slate-700">{n}</span>
                <div className="mt-6 text-sm font-medium">{t}</div>
                <p className="mt-1 text-[11px] leading-5 text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-7 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/10">
                <Sparkles className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-[.22em]">ABOS</div>
                <div className="text-[8px] uppercase tracking-[.2em] text-slate-600">AI Business Operating System</div>
              </div>
            </div>
            {onBack && <button onClick={onBack} className="text-xs text-slate-500">Back</button>}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-8">
            <div className="mb-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/10">
                {mode === 'forgot' ? <KeyRound className="h-5 w-5 text-emerald-300" /> : mode === 'reset' ? <Lock className="h-5 w-5 text-emerald-300" /> : <UserRound className="h-5 w-5 text-emerald-300" />}
              </div>
              <h2 className="text-3xl font-semibold tracking-[-.035em]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
            </div>

            {(mode === 'signin' || mode === 'signup') && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => signInWithProvider('google')} className="rounded-xl border border-white/10 bg-white/[.03] py-3 text-sm font-medium transition hover:bg-white/[.07]">Google</button>
                  <button type="button" onClick={() => signInWithProvider('apple')} className="rounded-xl border border-white/10 bg-white/[.03] py-3 text-sm font-medium transition hover:bg-white/[.07]">Apple</button>
                </div>
                <div className="my-6 flex items-center gap-3 text-[9px] uppercase tracking-[.2em] text-slate-700"><span className="h-px flex-1 bg-white/8" /> or continue with email <span className="h-px flex-1 bg-white/8" /></div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode !== 'reset' && (
                <label className="block">
                  <span className="mb-2 block text-[10px] font-medium uppercase tracking-[.18em] text-slate-500">Email</span>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@business.com" className="w-full rounded-xl border border-white/10 bg-white/[.025] py-3.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-emerald-300/40 focus:bg-white/[.045]" />
                  </div>
                </label>
              )}

              {mode !== 'forgot' && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-medium uppercase tracking-[.18em] text-slate-500">{mode === 'reset' ? 'New password' : 'Password'}</span>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                      <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} required minLength={6} placeholder="Minimum 6 characters" className="w-full rounded-xl border border-white/10 bg-white/[.025] py-3.5 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-emerald-300/40 focus:bg-white/[.045]" />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                  </label>
                  {mode === 'reset' && (
                    <label className="block">
                      <span className="mb-2 block text-[10px] font-medium uppercase tracking-[.18em] text-slate-500">Confirm password</span>
                      <input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} type={showPassword ? 'text' : 'password'} required minLength={6} placeholder="Repeat the new password" className="w-full rounded-xl border border-white/10 bg-white/[.025] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-emerald-300/40 focus:bg-white/[.045]" />
                    </label>
                  )}
                </>
              )}

              {error && <div className="flex gap-2 rounded-xl border border-red-400/15 bg-red-400/[.06] p-3 text-xs leading-5 text-red-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
              {success && <div className="flex gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/[.06] p-3 text-xs leading-5 text-emerald-100"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />{success}</div>}

              <button disabled={loading} type="submit" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 py-3.5 text-sm font-semibold text-[#03100a] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send recovery link' : 'Update password'}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></>}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-600">
              {mode === 'signin' && <>New to ABOS? <button onClick={() => switchMode('signup')} className="text-slate-300 hover:text-white">Create an account</button><button onClick={() => switchMode('forgot')} className="ml-4 text-slate-400 hover:text-white">Forgot password?</button></>}
              {mode === 'signup' && <>Already have an account? <button onClick={() => switchMode('signin')} className="text-slate-300 hover:text-white">Sign in</button></>}
              {mode === 'forgot' && <button onClick={() => switchMode('signin')} className="inline-flex items-center gap-1 text-slate-300 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Back to sign in</button>}
              {mode === 'reset' && <button onClick={() => switchMode('signin')} className="inline-flex items-center gap-1 text-slate-300 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Back to sign in</button>}
            </div>
          </div>

          <p className="mt-5 text-center text-[9px] uppercase tracking-[.16em] text-slate-700">Secure authentication · Your business data stays yours</p>
        </section>
      </div>
    </div>
  );
}
