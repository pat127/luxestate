'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Supabase sends the token via URL hash; onAuthStateChange picks it up
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
        setCheckingSession(false);
      } else if (session) {
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    // Also check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
        setCheckingSession(false);
      } else {
        // Give onAuthStateChange time to fire
        setTimeout(() => setCheckingSession(false), 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || 'Failed to update password.');
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.replace('/admin'), 2500);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
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

        <div className="bg-card border border-border p-8">
          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Password Updated</h2>
              <p className="text-sm text-muted-foreground">
                Your password has been reset successfully. Redirecting to dashboard...
              </p>
            </div>
          ) : !sessionReady ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Invalid or Expired Link</h2>
              <p className="text-sm text-muted-foreground mb-4">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link
                href="/admin/forgot-password"
                className="inline-block px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
              >
                Request New Link
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-foreground mb-1">Reset Password</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your new password below.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-secondary border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-secondary border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Repeat new password"
                    required
                    autoComplete="new-password"
                  />
                </div>

                {/* Password strength hints */}
                <div className="space-y-1">
                  {[
                    { label: 'At least 8 characters', met: password.length >= 8 },
                    { label: 'Passwords match', met: password === confirmPassword && confirmPassword.length > 0 },
                  ].map((hint) => (
                    <div key={hint.label} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hint.met ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
                      <span className={`text-[11px] ${hint.met ? 'text-emerald-400' : 'text-muted-foreground'}`}>{hint.label}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
