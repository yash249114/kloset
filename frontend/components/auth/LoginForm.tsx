'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authAPI } from '@/lib/api/auth';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import posthog from 'posthog-js';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await authAPI.googleLogin({ credential: credentialResponse.credential || '' });
      setAuth(result.user, result.access_token, result.refresh_token);
      
      // Track login event
      posthog.capture('login', { method: 'google', role: result.user.role, email: result.user.email });
      
      const redirectMap: Record<string, string> = {
        renter: '/',
        seller: '/seller/dashboard',
        admin: '/admin/dashboard',
      };
      router.push(redirectMap[result.user.role] || '/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Google Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await authAPI.login(data);
      setAuth(result.user, result.access_token, result.refresh_token);
      
      // Track login event
      posthog.capture('login', { method: 'email', role: result.user.role, email: result.user.email });

      // Redirect based on role
      const redirectMap: Record<string, string> = {
        renter: '/',
        seller: '/seller/dashboard',
        admin: '/admin/dashboard',
      };
      router.push(redirectMap[result.user.role] || '/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <div
        className="rounded-[28px] p-8 md:p-10 relative overflow-hidden"
        style={{
          background: 'white',
          border: '1px solid var(--petal)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Top gold line accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--gold)] via-[var(--bloom)] to-[var(--gold)]" />

        {/* Header */}
        <div className="text-center mb-8 mt-2">
          <h1
            className="text-3xl md:text-4xl font-display font-bold mb-2"
            style={{ color: 'var(--ink)' }}
          >
            Welcome Back
          </h1>
          <p className="text-xs font-mono tracking-[0.15em] uppercase opacity-75" style={{ color: 'var(--ink-light)' }}>
            Sign in to access your wardrobe
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-2xl text-xs font-medium"
              style={{
                background: 'rgba(193, 123, 123, 0.08)',
                color: 'var(--rose)',
                border: '1px solid rgba(193, 123, 123, 0.15)',
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase mb-2" style={{ color: 'var(--ink-light)' }}>
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--ink-lighter)' }}
              />
              <input
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className="input-kloset !pl-11"
              />
            </div>
            {errors.email && (
              <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--rose)' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono tracking-wider uppercase" style={{ color: 'var(--ink-light)' }}>
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium transition-colors hover:text-[var(--rose-dark)]"
                style={{ color: 'var(--rose)' }}
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--ink-lighter)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Enter your password"
                className="input-kloset !pl-11 !pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff size={16} style={{ color: 'var(--ink-lighter)' }} />
                ) : (
                  <Eye size={16} style={{ color: 'var(--ink-lighter)' }} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--rose)' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="btn-gold w-full flex items-center justify-center gap-2 !py-4 text-xs tracking-[0.2em] font-mono"
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <motion.div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <>
                Sign In
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--petal)]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-[var(--ink-lighter)] font-mono">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Sign-in failed. Please try again.')}
            useOneTap
            shape="pill"
            width="320px"
          />
        </div>

        {/* Register link */}
        <p className="text-center mt-6 text-sm" style={{ color: 'var(--ink-lighter)' }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-bold transition-colors hover:text-[var(--rose-dark)]"
            style={{ color: 'var(--rose)' }}
          >
            Create One
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
