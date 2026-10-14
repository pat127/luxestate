'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

type UserRole = 'super_admin' | 'admin' | 'marketing' | 'agent';

const ROLE_META: Record<UserRole, { label: string; icon: string; color: string; defaultRoute: string }> = {
  super_admin: { label: 'Super Admin', icon: 'ShieldCheckIcon', color: 'text-amber-400', defaultRoute: '/admin' },
  admin: { label: 'Admin', icon: 'Cog6ToothIcon', color: 'text-blue-400', defaultRoute: '/admin' },
  marketing: { label: 'Marketing', icon: 'MegaphoneIcon', color: 'text-pink-400', defaultRoute: '/admin' },
  agent: { label: 'Agent', icon: 'IdentificationIcon', color: 'text-emerald-400', defaultRoute: '/admin' },
};

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginSuccess, setLoginSuccess] = useState<{
    name: string;
    role: UserRole;
    redirectTo: string;
  } | null>(null);

  useEffect(() => {
    if (!loginSuccess) return;
    const timer = setTimeout(() => {
      router.replace(loginSuccess.redirectTo);
    }, 1800);
    return () => clearTimeout(timer);
  }, [loginSuccess, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (signInError) throw signInError;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Login succeeded but session could not be established. Please try again.');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, role, status')
        .eq('id', user.id)
        .single();

      if (profile?.status === 'Inactive') {
        await supabase.auth.signOut();
        setError('Your account has been deactivated. Contact your administrator.');
        return;
      }

      const validRoles: UserRole[] = ['super_admin', 'admin', 'marketing', 'agent'];
      const role: UserRole = profile?.role && validRoles.includes(profile.role) ? profile.role : 'agent';
      const meta = ROLE_META[role];

      await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);

      setLoginSuccess({
        name: profile?.full_name || user.email || 'User',
        role,
        redirectTo: meta.defaultRoute,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      setError(msg === 'Invalid login credentials' ? 'Invalid email or password.' : msg);
    } finally {
      setLoading(false);
    }
  };

  if (loginSuccess) {
    const meta = ROLE_META[loginSuccess.role];
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-500">
          <div className={`w-16 h-16 mx-auto mb-5 flex items-center justify-center border-2 border-current rounded-full ${meta.color}`}>
            <Icon name={meta.icon as any} size={28} />
          </div>
          <h2 className="text-foreground font-bold text-lg mb-1">Welcome back</h2>
          <p className="text-foreground text-base font-medium mb-2">{loginSuccess.name}</p>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 border rounded-sm ${meta.color} border-current/20`}>
            <Icon name={meta.icon as any} size={12} />
            {meta.label}
          </span>
          <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
            <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
            <span className="text-xs">Redirecting to your dashboard...</span>
          </div>
          <div className="mt-4 w-32 h-0.5 bg-border mx-auto overflow-hidden rounded-full">
            <div className="h-full bg-primary animate-[progress_1.8s_ease-in-out]" style={{ animation: 'progress 1.8s ease-in-out forwards' }} />
          </div>
          <style>{`
            @keyframes progress { from { width: 0% } to { width: 100% } }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-primary-foreground font-black text-base">C</span>
          </div>
          <h1 className="text-foreground font-bold text-lg tracking-tight">Cove Estates</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.15em] mt-0.5">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border p-8">
          <div className="mb-6">
            <h2 className="text-base font-bold text-foreground">Sign In</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Enter your credentials to access the admin panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="you@coveestate.com"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-secondary border border-border px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={14} />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <Icon name="ExclamationCircleIcon" size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-[10px] text-muted-foreground">
            Contact your administrator to reset your password.
          </p>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/40 mt-6">
          © {new Date().getFullYear()} Cove Estates. All rights reserved.
        </p>
      </div>
    </div>
  );
}
