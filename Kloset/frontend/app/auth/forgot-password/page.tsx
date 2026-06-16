'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Sparkles, Lock, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { authAPI } from '@/lib/api';
import Button from '@/components/ui/Button';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email.trim());
      toast.success('Password reset link sent to your email!');
      router.push(`/auth/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.error : '';
      toast.error(msg || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-ivory font-sans text-charcoal select-none">
      {/* LEFT: Editorial Image — 50vw, cover, full height */}
      <div className="hidden lg:block w-[50vw] relative overflow-hidden bg-charcoal">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-left space-y-4">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-champagne font-extrabold">
            Secure Recovery
          </span>
          <h2 className="text-4xl font-display font-semibold text-warm-white leading-tight">
            Regain Access to<br />Your Closet
          </h2>
          <p className="text-sm text-ivory/70 font-light max-w-md leading-relaxed">
            Enter your email and we&apos;ll send you a secure link to reset your password.
          </p>
          <div className="flex gap-3 pt-2">
            <div className="w-10 h-1 bg-champagne rounded" />
            <div className="w-6 h-1 bg-ivory/30 rounded" />
            <div className="w-6 h-1 bg-ivory/30 rounded" />
          </div>
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
          {/* Logo */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="font-display text-3xl font-bold tracking-widest text-charcoal">KLOSET</span>
              <span className="text-[10px] font-mono tracking-widest text-champagne uppercase font-extrabold mt-2">Luxe</span>
            </Link>
          </div>

          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8 space-y-2">
              <h1 className="text-2xl font-display font-medium text-charcoal whitespace-nowrap">Forgot Password?</h1>
              <p className="text-xs text-charcoal-light font-light">Enter your email to receive a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-14 pl-12 pr-4 text-sm font-sans bg-white border border-border rounded outline-none focus:border-champagne"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light" size={16} />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full h-14 cursor-pointer"
              >
                <ArrowRight size={16} className="mr-2" /> Send Reset Link
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

          <p className="text-center text-[9px] text-charcoal-light/60 font-mono mt-6">
            By continuing, you agree to our{' '}
            <Link href="/support" className="underline hover:text-charcoal">Terms</Link> and{' '}
            <Link href="/support" className="underline hover:text-charcoal">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="bg-ivory min-h-screen pt-36 text-center font-mono text-xs text-charcoal-light">
        Loading...
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}