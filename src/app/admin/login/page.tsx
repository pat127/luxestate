'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const DEMO_CREDENTIALS = [
  { role: 'Super Admin', email: 'ceo@luxestate.com', password: 'LuxAdmin2024!' },
  { role: 'Admin', email: 'admin@luxestate.com', password: 'LuxAdmin2024!' },
  { role: 'Marketing', email: 'marketing@luxestate.com', password: 'LuxAdmin2024!' },
  { role: 'Agent', email: 'agent@luxestate.com', password: 'LuxAdmin2024!' },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/admin');
      else setCheckingSession(false);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }
      router.replace('/admin');
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const fillDemo = (cred: { email: string; password: string }) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-8 h-8 bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-black">C</span>
          </div>
          <div>
            <p className="text-foreground font-bold text-lg leading-none">Cove Estates</p>
            <p className="text-muted-foreground text-xs">Admin Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border p-8">
          <h1 className="text-xl font-bold text-foreground mb-1">Sign In</h1>
          <p className="text-sm text-muted-foreground mb-6">Access your admin dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-secondary border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 bg-card border border-border p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_CREDENTIALS.map((cred) => (
              <button
                key={cred.role}
                onClick={() => fillDemo(cred)}
                className="text-left px-3 py-2 border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <p className="text-xs font-semibold text-foreground">{cred.role}</p>
                <p className="text-[10px] text-muted-foreground truncate">{cred.email}</p>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Password: LuxAdmin2024!</p>
        </div>
      </div>
    </div>
  );
}
