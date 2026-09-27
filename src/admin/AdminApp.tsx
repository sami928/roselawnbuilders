import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, HardHat, Loader2, Lock } from 'lucide-react';
import { api, ApiError, UNAUTHORIZED_EVENT, type User } from './api';
import { Dashboard } from './Dashboard';

export function AdminApp() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api<{ user: User }>('/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (!user) return <LoginScreen onLogin={setUser} />;
  return (
    <Dashboard
      user={user}
      onLogout={async () => {
        await api('/auth/logout', { method: 'POST', body: {} }).catch(() => {});
        setUser(null);
      }}
    />
  );
}

function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await api<{ user: User }>('/auth/login', { method: 'POST', body: { email, password } });
      onLogin(user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in.');
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-[#282a28] p-12 text-[#f5f1e9] lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-[.07]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '44px 44px' }}
        />
        <div className="relative flex items-center gap-3 text-sm font-semibold tracking-wide">
          <span className="flex h-9 w-9 items-center justify-center bg-[#be2b24]">
            <HardHat size={18} />
          </span>
          Roselawn Builders
        </div>
        <div className="relative max-w-md">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[.18em] text-[#dd4b2d]">Lead dashboard</p>
          <h1 className="font-serif text-4xl leading-tight tracking-tight">
            Every inquiry, <em className="text-[#dd4b2d]">one place.</em>
          </h1>
          <p className="mt-5 leading-relaxed text-stone-400">Track new requests, follow up fast, and see which projects are moving toward a signed contract.</p>
        </div>
        <p className="relative text-xs text-stone-500">Authorized staff only.</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center bg-[#be2b24] text-white">
              <HardHat size={20} />
            </span>
          </div>
          <h2 className="font-serif text-2xl tracking-tight">Sign in</h2>
          <p className="mb-7 mt-2 text-sm text-stone-500">Use your Roselawn dashboard account.</p>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="input mb-4" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} autoFocus />
          <label className="label" htmlFor="password">Password</label>
          <input id="password" className="input" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && (
            <p role="alert" className="mt-4 border-l-2 border-[#be2b24] bg-[#fbe9e7] px-3 py-2 text-sm text-[#8e201e]">
              {error}
            </p>
          )}
          <button className="btn-primary mt-6 w-full py-3" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />} Sign in <ArrowRight size={15} />
          </button>
          <a href="/" className="mt-6 block text-center text-xs text-stone-500 hover:text-[#be2b24]">
            ← Back to website
          </a>
        </form>
      </div>
    </div>
  );
}
