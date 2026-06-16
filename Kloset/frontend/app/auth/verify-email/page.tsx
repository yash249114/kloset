'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { authAPI } from '@/lib/api';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.replace('/auth/register');
    }
  }, [email, router]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code.');
      return;
    }
    setIsSubmitting(true);
    try {
      const resp = await authAPI.verifyEmailOTP(email, code);
      setAuth(resp.user, resp.access_token, resp.refresh_token);
      setVerified(true);
      toast.success('Email verified successfully!');
      setTimeout(() => {
        router.push(resp.user.role === 'seller' ? '/seller' : '/');
      }, 1500);
    } catch (err: unknown) {
      const msg = typeof err === 'object' && err !== null && 'response' in err
        ? (err as any).response?.data?.error || 'Invalid code. Please try again.'
        : 'Verification failed. Please try again.';
      toast.error(msg);
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await authAPI.sendEmailOTP(email);
      setCooldown(60);
      toast.success('A new verification code has been sent.');
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch {
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center font-sans select-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-border rounded-2xl p-12 shadow-sm text-center max-w-md"
        >
          <CheckCircle size={48} className="text-success mx-auto mb-4" />
          <h1 className="text-2xl font-display font-medium text-charcoal mb-2">Email Verified!</h1>
          <p className="text-sm text-charcoal-light mb-4">Redirecting you to your dashboard...</p>
          <Loader2 size={20} className="animate-spin text-champagne mx-auto" />
        </motion.div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center font-sans text-charcoal-light text-xs">
        Redirecting...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center font-sans text-charcoal select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springTransition}
        className="w-full max-w-[440px] px-4"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="font-display text-3xl font-bold tracking-widest text-charcoal">KLOSET</span>
            <span className="text-[10px] font-mono tracking-widest text-champagne uppercase font-extrabold mt-2">Luxe</span>
          </Link>
        </div>

        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8 space-y-2">
            <div className="w-14 h-14 bg-champagne/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={24} className="text-champagne" />
            </div>
            <h1 className="text-2xl font-display font-medium text-charcoal">Verify Your Email</h1>
            <p className="text-xs text-charcoal-light font-light">
              We sent a 6-digit code to <strong className="text-charcoal">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-lg font-mono font-bold bg-white border border-border rounded outline-none focus:border-champagne focus:ring-1 focus:ring-champagne transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.join('').length !== 6}
              className="w-full h-14 bg-charcoal text-ivory rounded text-xs font-mono uppercase tracking-wider font-bold hover:bg-charcoal/90 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              Verify Email
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/60 text-center space-y-3">
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="text-xs font-mono tracking-wider text-champagne hover:text-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 mx-auto"
            >
              {isResending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <RefreshCw size={12} />
              )}
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
            </button>

            <p className="text-[10px] font-mono text-charcoal-light">
              Wrong email?{' '}
              <Link href="/auth/register" className="text-champagne font-bold hover:text-charcoal transition-colors">
                Create a new account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ivory flex items-center justify-center font-mono text-xs text-charcoal-light">
        Loading...
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
