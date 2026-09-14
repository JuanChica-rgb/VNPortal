import { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, Gamepad2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const { t } = useLang();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      if (!name.trim()) {
        setError(t.nameRequired);
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError(t.passwordShort);
        setLoading(false);
        return;
      }
      const { error: signUpError } = await signUp(name.trim(), email.trim(), password);
      if (signUpError) {
        setError(signUpError);
        setLoading(false);
        return;
      }
    } else {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        setError(signInError);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-base-950/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-base-700 bg-base-900 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with glow */}
        <div className="relative px-6 pt-8 pb-6 text-center">
          <div className="absolute inset-0 hero-glow" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-base-800 text-slate-400 transition-all hover:bg-base-700 hover:text-white"
            aria-label={t.close}
          >
            <X className="w-4.5 h-4.5" />
          </button>

          <div className="relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg shadow-accent-500/20">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              {mode === 'signin' ? t.welcomeBack : t.createAccount}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {mode === 'signin' ? t.signinSubtitle : t.signupSubtitle}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.name}</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full rounded-xl bg-base-800 border border-base-700 pl-11 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.email}</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full rounded-xl bg-base-800 border border-base-700 pl-11 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.password}</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full rounded-xl bg-base-800 border border-base-700 pl-11 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 animate-slide-down">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-3 text-sm font-semibold text-white transition-all hover:from-accent-400 hover:to-accent-500 disabled:opacity-50 shadow-lg shadow-accent-500/20"
          >
            {loading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              mode === 'signin' ? t.signin : t.signup
            )}
          </button>

          <p className="text-center text-sm text-slate-500">
            {mode === 'signin' ? t.noAccount : t.haveAccount}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              className="font-semibold text-accent-400 hover:text-accent-300 transition-colors"
            >
              {mode === 'signin' ? t.signupLink : t.signinLink}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
