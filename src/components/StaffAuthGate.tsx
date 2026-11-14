'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, LogOut, Loader2, KeyRound } from 'lucide-react';

interface StaffAuthGateProps {
  children: React.ReactNode;
  portalTitle?: string;
}

export default function StaffAuthGate({
  children,
  portalTitle = 'WTC Gem Lab Staff Portal',
}: StaffAuthGateProps) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [usingDefaultPin, setUsingDefaultPin] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/staff/auth', { cache: 'no-store' });
      const data = await res.json();
      setAuthenticated(Boolean(data?.authenticated));
      setUsingDefaultPin(Boolean(data?.usingDefaultPin));
    } catch {
      setAuthenticated(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/staff/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok || !data?.authenticated) {
        setError(data?.error || 'Invalid Staff Access PIN.');
      } else {
        setAuthenticated(true);
        setPin('');
      }
    } catch {
      setError('Unable to reach authentication server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/staff/auth', { method: 'DELETE' });
    setAuthenticated(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-3 text-sm font-mono">
          <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
          <span>Verifying Staff Lab Session...</span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-[#0b132b]/95 p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-amber-400 font-semibold">
                Authorized Personnel Only
              </p>
              <h1 className="text-xl font-bold text-white font-serif">
                {portalTitle}
              </h1>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            Enter your WTC Gem Lab Staff Access PIN to unlock gemstone diagnostics, report publishing, and registry administration.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Staff Access PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter Staff Access PIN"
                  className="w-full rounded-lg bg-[#020617] border border-slate-700 focus:border-amber-400 focus:outline-none pl-10 pr-4 py-2.5 text-sm text-white font-mono"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/15 border border-red-500/40 px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold py-2.5 text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Staff Portal</span>
                </>
              )}
            </button>
          </form>

          {usingDefaultPin && (
            <p className="mt-5 text-[11px] text-slate-400 border-t border-slate-800 pt-4 leading-relaxed">
              Default development PIN: <code className="text-amber-300">WTC-LAB-2026</code>. Set <code className="text-slate-300">STAFF_ACCESS_PIN</code> in Vercel Environment Variables for production.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[#081024] border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono">Staff Session Active</span>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-slate-300 hover:text-amber-300 transition font-mono"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
      {children}
    </div>
  );
}
