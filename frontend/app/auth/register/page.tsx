'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { CredentialResponse } from '@react-oauth/google';
import { isAxiosError } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { authAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import GoogleButton from '@/components/auth/GoogleButton';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

export default function AuthRegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'renter' | 'seller'>('renter');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const resp = await authAPI.register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, role });
      setAuth(resp.user, resp.access_token, resp.refresh_token);
      toast.success(`Welcome to Kloset Luxe!`);
      router.push(role === 'seller' ? '/seller' : '/');
    } catch {
      toast.error('Registration failed. Please try again.');
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
      router.push(role === 'seller' ? '/seller' : '/');
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
            backgroundImage: `url('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-left space-y-4">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-champagne font-extrabold">
            Join the Circle
          </span>
          <h2 className="text-4xl font-display font-semibold text-warm-white leading-tight">
            Become a Member of<br />Circular Couture
          </h2>
          <p className="text-sm text-ivory/70 font-light max-w-md leading-relaxed">
            Rent premium designer outfits or list your wardrobe — join India&apos;s most trusted luxury fashion rental marketplace.
          </p>
          <div className="flex gap-3 pt-2">
            <div className="w-10 h-1 bg-champagne rounded" />
            <div className="w-6 h-1 bg-ivory/30 rounded" />
            <div className="w-6 h-1 bg-ivory/30 rounded" />
          </div>
        </div>
      </div>

      {/* RIGHT: Registration Panel — 50vw, vertically + horizontally centered */}
      <div className="w-[50vw] flex items-center justify-center overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="w-full min-w-[440px] max-w-[520px] px-6 py-8"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="font-display text-3xl font-bold tracking-widest text-charcoal">KLOSET</span>
              <span className="text-[10px] font-mono tracking-widest text-champagne uppercase font-extrabold mt-2">Luxe</span>
            </Link>
          </div>

          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8 space-y-2">
              <h1 className="text-2xl font-display font-medium text-charcoal whitespace-nowrap">Create Your Account</h1>
              <p className="text-xs text-charcoal-light font-light">Join the circular couture community</p>
            </div>

            {/* Google Sign-Up — 56px height */}
            <div className="mb-6">
              <GoogleButton
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google sign-up failed.')}
              />
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-charcoal-light font-mono">or register with email</span>
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
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full h-14 pl-12 pr-4 text-sm font-sans bg-white border border-border rounded outline-none focus:border-champagne"
                    required
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light" size={16} />
                </div>
              </div>

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
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full h-14 pl-12 pr-4 text-sm font-sans bg-white border border-border rounded outline-none focus:border-champagne"
                    required
                  />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light" size={16} />
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
                    placeholder="Create a strong password"
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

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="w-full h-14 cursor-pointer"
              >
                <ArrowRight size={16} className="mr-2" /> Create Account
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/60 text-center">
              <p className="text-[10px] font-mono text-charcoal-light">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-champagne font-bold hover:text-charcoal transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-[9px] text-charcoal-light/60 font-mono mt-4">
            By creating an account, you agree to our{' '}
            <Link href="/support" className="underline hover:text-charcoal">Terms</Link> and{' '}
            <Link href="/support" className="underline hover:text-charcoal">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
