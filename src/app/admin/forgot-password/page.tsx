'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reset-password`,
      });
      if (resetError) {
        setError(resetError.message || 'Failed to send reset email.');
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Check Your Email</h2>
              <p className="text-sm text-muted-foreground mb-1">
                We sent a password reset link to:
              </p>
              <p className="text-sm font-semibold text-foreground mb-4">{email}</p>
              <p className="text-xs text-muted-foreground mb-6">
                Click the link in the email to reset your password. The link expires in 1 hour.
              </p>
              <Link
                href="/admin/login"
                className="text-xs text-primary hover:underline"
              >
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-foreground mb-1">Forgot Password</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your email and we will send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
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

                {error && (
                  <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-border text-center">
                <Link href="/admin/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
