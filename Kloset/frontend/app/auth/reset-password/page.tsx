'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { authAPI } from '@/lib/api';
import Button from '@/components/ui/Button';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !password.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token.trim(), password);
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.error : '';
      toast.error(msg || 'Invalid or expired reset token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center font-sans select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springTransition}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 rounded-full bg-success/10 text-success border border-success/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} />
          </div>
          <h1 className="text-2xl font-display font-medium text-charcoal mb-2">Password Reset Complete</h1>
          <p className="text-xs text-charcoal-light font-light mb-8">
            Your password has been updated successfully. You will be redirected to sign in.
          </p>
          <Link href="/auth/login" className="btn btn-primary inline-flex px-8 text-xs font-mono uppercase cursor-pointer">
            Sign In Now
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ivory font-sans text-charcoal select-none">
      {/* LEFT: Editorial Image — 50vw, cover, full height */}
      <div className="hidden lg:block w-[50vw] relative overflow-hidden bg-charcoal">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-left space-y-4">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-champagne font-extrabold">
            Password Reset
          </span>
          <h2 className="text-4xl font-display font-semibold text-warm-white leading-tight">
            Secure Your Account
          </h2>
          <p className="text-sm text-ivory/70 font-light max-w-md leading-relaxed">
            Enter the reset token sent to your email along with your new password.
          </p>
        </div>
      </div>

      {/* RIGHT: Auth Panel — 50vw, vertically + horizontally centered */}
      <div className="w-[50vw] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="w-full min-w-[440px] max-w-[520px] px-6"
        >
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="font-display text-3xl font-bold tracking-widest text-charcoal">KLOSET</span>
              <span className="text-[10px] font-mono tracking-widest text-champagne uppercase font-extrabold mt-2">Luxe</span>
            </Link>
          </div>

          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8 space-y-2">
              <h1 className="text-2xl font-display font-medium text-charcoal whitespace-nowrap">Set New Password</h1>
              <p className="text-xs text-charcoal-light font-light">
                {email ? `Reset for ${email}` : 'Enter the reset token from your email'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
                  Reset Token
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter the reset token from your email"
                    className="w-full h-14 pl-12 pr-4 text-sm font-sans bg-white border border-border rounded outline-none focus:border-champagne"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light" size={16} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full h-14 pl-12 pr-12 text-sm font-sans bg-white border border-border rounded outline-none focus:border-champagne"
                    required
                    minLength={8}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light" size={16} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-charcoal cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full h-14 pl-12 pr-4 text-sm font-sans bg-white border border-border rounded outline-none focus:border-champagne"
                    required
                    minLength={8}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light" size={16} />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full h-14 cursor-pointer"
              >
                <ArrowRight size={16} className="mr-2" /> Reset Password
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/60 text-center">
              <p className="text-[10px] font-mono text-charcoal-light">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-champagne font-bold hover:text-charcoal transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="bg-ivory min-h-screen pt-36 text-center font-mono text-xs text-charcoal-light">
        Loading...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}