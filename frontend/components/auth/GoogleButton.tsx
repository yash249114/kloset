'use client';

import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Chrome } from 'lucide-react';

interface GoogleButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError?: () => void;
  variant?: 'primary' | 'outline';
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function GoogleButton({
  onSuccess,
  onError,
  variant = 'outline',
  children,
  className = '',
  disabled = false,
}: GoogleButtonProps) {
  const { signIn } = useGoogleLogin({
    onSuccess,
    onError: onError || (() => {}),
    flow: 'auth-code',
  });

  const handleClick = () => {
    if (!disabled) {
      signIn();
    }
  };

  const baseStyle = 'inline-flex items-center justify-center h-[52px] px-8 text-xs font-mono font-semibold uppercase tracking-widest transition-all duration-300 rounded focus:outline-none disabled:opacity-50 disabled:pointer-events-none select-none gap-2';
  
  const variantStyle = variant === 'primary'
    ? 'bg-charcoal text-ivory border border-charcoal hover:bg-charcoal-mid hover:border-charcoal-mid'
    : 'bg-transparent text-charcoal border-2 border-charcoal hover:bg-charcoal hover:text-ivory';

  return (
    <motion.button
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`${baseStyle} ${variantStyle} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      type="button"
    >
      <Chrome size={16} className="text-charcoal" aria-hidden="true" />
      {children || 'Continue with Google'}
    </motion.button>
  );
}