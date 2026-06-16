'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { CredentialResponse } from '@react-oauth/google';
import { isAxiosError } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { authAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import GoogleButton from '@/components/auth/GoogleButton';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

function AuthLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'renter' | 'seller'>('renter');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      const resp = await authAPI.login({ email: email.trim(), password });
      setAuth(resp.user, resp.access_token, resp.refresh_token);
      toast.success('Welcome back to Kloset Luxe.');
      router.push(redirectTo);
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.error : '';
      if (msg && msg.toLowerCase().includes('not verified')) {
        toast.error('Email not verified. Redirecting to verification...');
        router.push(`/auth/verify-email?email=${encodeURIComponent(email.trim())}`);
      } else if (msg) {
        toast.error(msg);
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Google sign-in failed. No credential received.');
      return;
    }
    setIsSubmitting(true);
    try {
      const resp = await authAPI.googleLogin({
        credential: credentialResponse.credential,
        role,
      });
      setAuth(resp.user, resp.access_token, resp.refresh_token);
      toast.success(`Welcome to Kloset Luxe!`);
      router.push(redirectTo);
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.error : 'Google sign-in failed. Please try again.';
      toast.error(msg ?? 'Google sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
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
            Luxury Heritage Wear
          </span>
          <h2 className="text-4xl font-display font-semibold text-warm-white leading-tight">
            Wear Legacy,<br />Return the Rest.
          </h2>
          <p className="text-sm text-ivory/70 font-light max-w-md leading-relaxed">
            Access premium designer wedding sets, sarees, and sherwanis — curated, sanitized, and delivered to your doorstep.
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
              <h1 className="text-2xl font-display font-medium text-charcoal whitespace-nowrap">Welcome Back</h1>
              <p className="text-xs text-charcoal-light font-light">Sign in to your Kloset Luxe account</p>
            </div>

            {/* Google Sign-In — 56px height */}
            <div className="mb-6">
              <GoogleButton
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google sign-in failed.')}
              />
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-charcoal-light font-mono">or continue with email</span>
              </div>
            </div>

            {/* Role Selector — 56px tall, equal-width horizontal cards */}
            <div className="flex gap-2 mb-6 bg-ivory rounded-lg p-1 border border-border">
              {(['renter', 'seller'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 h-14 rounded text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer ${
                    role === r
                      ? 'bg-charcoal text-ivory shadow-sm'
                      : 'text-charcoal-light hover:text-charcoal'
                  }`}
                >
                  {r === 'renter' ? 'Renter' : 'Seller'}
                </button>
              ))}
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

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-widest text-charcoal-light uppercase font-bold block mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-14 pl-12 pr-12 text-sm font-sans bg-white border border-border rounded outline-none focus:border-champagne"
                    required
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

              <div className="flex items-center justify-between text-[10px] font-mono">
                <label className="flex items-center gap-2 text-charcoal-light cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-champagne" />
                  Remember me
                </label>
                <Link href="/auth/forgot-password" className="text-champagne hover:text-charcoal transition-colors font-bold">
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="w-full h-14 cursor-pointer"
              >
                <ArrowRight size={16} className="mr-2" /> Sign In
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/60 text-center">
              <p className="text-[10px] font-mono text-charcoal-light">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-champagne font-bold hover:text-charcoal transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-[9px] text-charcoal-light/60 font-mono mt-6">
            By signing in, you agree to our{' '}
            <Link href="/support" className="underline hover:text-charcoal">Terms</Link> and{' '}
            <Link href="/support" className="underline hover:text-charcoal">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthLoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-ivory min-h-screen pt-36 text-center font-mono text-xs text-charcoal-light">
        Loading...
      </div>
    }>
      <AuthLoginForm />
    </Suspense>
  );
}
