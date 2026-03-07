'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Zap, Eye, EyeOff, Loader2, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DEMO_ACCOUNTS = [
  { label: 'Admin',  email: 'admin@taskflow.com',  password: 'admin123', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
  { label: 'PM',     email: 'pm@taskflow.com',     password: 'admin123', color: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100' },
  { label: 'Lead',   email: 'lead@taskflow.com',   password: 'admin123', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  { label: 'Staff',  email: 'staff@taskflow.com',  password: 'admin123', color: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100' },
];

export default function LoginClientPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@taskflow.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const doSignIn = async (loginEmail: string, loginPassword: string, label?: string) => {
    const result = await signIn('credentials', {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });
    if (result?.error) {
      return false;
    }
    toast.success(label ? `Signed in as ${label}` : 'Signed in successfully');
    router.push('/');
    router.refresh();
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const ok = await doSignIn(email, password);
      if (!ok) setError('Invalid email or password');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setDemoLoading(account.label);
    setError('');
    try {
      const ok = await doSignIn(account.email, account.password, account.label);
      if (!ok) setError(`Demo account "${account.label}" not found. Please seed the database.`);
    } catch {
      setError('Demo login failed.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-2xl shadow-indigo-500/30 mb-4">
            <Zap className="w-8 h-8 text-white fill-current" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Engineering<span className="text-indigo-400">Flow</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Project Management Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all text-sm"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all text-sm pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-2.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 text-sm mt-2',
                loading
                  ? 'bg-indigo-500/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30'
              )}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <FlaskConical className="w-3 h-3" /> Demo Access
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Demo Role Bypass Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(account => (
              <button
                key={account.label}
                onClick={() => handleDemo(account)}
                disabled={!!demoLoading}
                className={cn(
                  'flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all',
                  account.color,
                  demoLoading === account.label ? 'opacity-70' : ''
                )}
              >
                {demoLoading === account.label ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : null}
                Login as {account.label}
              </button>
            ))}
          </div>
          <p className="text-center text-[11px] text-slate-500 mt-3">
            Demo accounts use password: <code className="bg-white/10 px-1 rounded">admin123</code>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">© 2026 EngineeringFlow. All rights reserved.</p>
      </div>
    </div>
  );
}
