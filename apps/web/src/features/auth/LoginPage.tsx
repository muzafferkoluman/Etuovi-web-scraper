import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Home, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithPassword, signInWithDemoUser, isDemoMode, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signInWithPassword(email, password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate('/');
    }
  };

  const handleDemoSignIn = () => {
    signInWithDemoUser();
    navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-500/20">
            <Home className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign in to KotiScout
          </h2>
          <p className="text-xs text-slate-500">
            Monitor real-estate markets, track price drops, and manage automated saved searches.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ostaja@kotiscout.fi"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </form>

        {/* Demo Fast Login Option */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full py-2.5 px-4 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-900 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Sign In as Demo Scout (Zero-friction)</span>
          </button>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>Don't have an account?</span>
            <Link to="/signup" className="text-emerald-600 font-bold hover:underline">
              Create account
            </Link>
          </div>
        </div>

        {/* Supabase status badge */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isDemoMode ? 'Local Dev / Supabase Auth Ready' : 'Supabase Auth Active'}</span>
        </div>
      </div>
    </div>
  );
};
