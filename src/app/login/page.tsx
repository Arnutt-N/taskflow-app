'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Zap, Eye, EyeOff, Loader2, FlaskConical, Mail } from 'lucide-react';
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
    // Use window.location for reliable redirect on production/Vercel
    window.location.href = '/';
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Engineering Grid / Ambient Background */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.5 }}></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-xl shadow-indigo-500/30 mb-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 blur-md transform rotate-45 translate-x-1/2" />
            <Zap className="w-8 h-8 text-white fill-current relative z-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineering<span className="text-indigo-600">Flow</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium tracking-wide uppercase">Project Management Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 pt-10 shadow-xl shadow-slate-200/50 relative">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium"
                  placeholder="engineering@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot password?</a>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 text-sm mt-4',
                loading
                  ? 'bg-indigo-400 cursor-not-allowed hidden'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transform hover:-translate-y-0.5 active:translate-y-0'
              )}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</> : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <FlaskConical className="w-3 h-3" /> Quick Access
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Demo Role Bypass Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {DEMO_ACCOUNTS.map(account => (
              <button
                key={account.label}
                onClick={() => handleDemo(account)}
                disabled={!!demoLoading}
                className={cn(
                  'flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all shadow-sm',
                  account.color,
                  demoLoading === account.label ? 'opacity-70 cursor-not-allowed' : ''
                )}
              >
                {demoLoading === account.label ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : null}
                {account.label} Portal
              </button>
            ))}
          </div>

        </div>

        <p className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-8">© 2026 EngineeringFlow Systems.</p>
      </div>
    </div>
  );
}
