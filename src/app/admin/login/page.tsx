'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-black">C</span>
          </div>
          <span className="text-foreground font-bold text-lg tracking-tight">Cove Estates</span>
          <span className="text-muted-foreground text-sm">Admin</span>
        </div>

        <div className="bg-card border border-border p-8">
          <h1 className="text-xl font-bold text-foreground mb-1">Sign In</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Access your team dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@coveestates.com"
                required
                className="w-full bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground px-3 py-2.5 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground px-3 py-2.5 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            {error && (
              <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-border space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">
              Demo Credentials
            </p>
            <button
              type="button"
              onClick={() => { setEmail('admin@coveestates.com'); setPassword('Admin@2024!'); }}
              className="w-full text-left px-3 py-2 bg-background border border-border hover:border-primary/40 transition-colors"
            >
              <p className="text-xs font-semibold text-foreground">Super Admin / CEO</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">admin@coveestates.com · Admin@2024!</p>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('sarah@coveestates.com'); setPassword('Agent@2024!'); }}
              className="w-full text-left px-3 py-2 bg-background border border-border hover:border-primary/40 transition-colors"
            >
              <p className="text-xs font-semibold text-foreground">Agent — Sarah Mitchell</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">sarah@coveestates.com · Agent@2024!</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
