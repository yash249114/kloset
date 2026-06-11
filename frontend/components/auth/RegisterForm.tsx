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
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, ShoppingBag, Store } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import posthog from 'posthog-js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number').max(15),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['renter', 'seller']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'role' | 'details'>('role');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await authAPI.googleLogin({ credential: credentialResponse.credential || '' });
      setAuth(result.user, result.access_token, result.refresh_token);
      
      // Track signup event via Google Sign-In
      posthog.capture('signup', { method: 'google', role: result.user.role, email: result.user.email });

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
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'renter',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await authAPI.register(data);
      setAuth(result.user, result.access_token, result.refresh_token);
      
      // Track signup event via Email
      posthog.capture('signup', { method: 'email', role: result.user.role, email: result.user.email });

      if (result.user.role === 'seller') {
        posthog.capture('seller registration', { method: 'email', email: result.user.email });
      }

      const redirectMap: Record<string, string> = {
        renter: '/',
        seller: '/seller/dashboard',
      };
      router.push(redirectMap[result.user.role] || '/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleCards = [
    {
      value: 'renter' as const,
      icon: ShoppingBag,
      title: 'I want to Rent',
      desc: 'Browse & book designer outfits for any occasion',
    },
    {
      value: 'seller' as const,
      icon: Store,
      title: 'I want to Sell',
      desc: 'List your outfits and earn from your wardrobe',
    },
  ];

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
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2" style={{ color: 'var(--ink)' }}>
            Join Kloset
          </h1>
          <p className="text-xs font-mono tracking-[0.15em] uppercase opacity-75" style={{ color: 'var(--ink-light)' }}>
            {step === 'role' ? 'Select how you would like to start' : 'Create your account'}
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {step === 'role' ? (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {roleCards.map((role) => (
                  <motion.button
                    key={role.value}
                    type="button"
                    onClick={() => {
                      setValue('role', role.value);
                      setStep('details');
                    }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all duration-300"
                    style={{
                      background:
                        selectedRole === role.value ? 'var(--bloom)' : 'white',
                      border: `1.5px solid ${
                        selectedRole === role.value ? 'var(--rose)' : 'var(--petal)'
                      }`,
                      boxShadow: selectedRole === role.value ? 'var(--shadow-md)' : 'none',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          selectedRole === role.value
                            ? 'linear-gradient(135deg, var(--rose), var(--gold))'
                            : 'var(--bloom)',
                      }}
                    >
                      <role.icon
                        size={20}
                        style={{
                          color: selectedRole === role.value ? 'white' : 'var(--rose)',
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
                        {role.title}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--ink-light)' }}>
                        {role.desc}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* Role indicator */}
                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="text-xs font-mono tracking-wider uppercase flex items-center gap-1.5 mb-4 transition-colors hover:text-[var(--rose-dark)]"
                  style={{ color: 'var(--rose)' }}
                >
                  ← Change Role
                  <span className="badge badge-rose text-[9px] py-0.5 tracking-normal normal-case">{selectedRole}</span>
                </button>

                {/* Name */}
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase mb-2" style={{ color: 'var(--ink-light)' }}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--ink-lighter)' }}
                    />
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="Your full name"
                      className="input-kloset !pl-11"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--rose)' }}>
                      {errors.name.message}
                    </p>
                  )}
                </div>

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

                {/* Phone */}
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase mb-2" style={{ color: 'var(--ink-light)' }}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--ink-lighter)' }}
                    />
                    <input
                      type="tel"
                      {...register('phone')}
                      placeholder="+91 98765 43210"
                      className="input-kloset !pl-11"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--rose)' }}>
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase mb-2" style={{ color: 'var(--ink-light)' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--ink-lighter)' }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="Min 8 characters"
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
                      Create Account
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
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

        {/* Login link */}
        <p className="text-center mt-6 text-sm" style={{ color: 'var(--ink-lighter)' }}>
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-bold transition-colors hover:text-[var(--rose-dark)]"
            style={{ color: 'var(--rose)' }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
