'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface PremiumCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  className?: string;
  asChild?: boolean;
}

const variantStyles = {
  default: 'bg-white border border-border/40',
  elevated: 'bg-white shadow-lg border border-border/20',
  outlined: 'bg-transparent border-2 border-border',
  interactive: 'bg-white border border-border/40 cursor-pointer transition-all duration-300',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

export default function PremiumCard({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  asChild = false,
  style,
  ...props
}: PremiumCardProps) {
  const baseClassName = `rounded-xl ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`;
  
  const hoverProps = hoverable ? {
    whileHover: { 
      y: -4, 
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
      transition: springTransition 
    },
    whileTap: { scale: 0.98, transition: springTransition },
    style: {
      ...style,
      willChange: 'transform, box-shadow',
    } as React.CSSProperties,
  } : {
    style: {
      ...style,
      willChange: 'transform',
    } as React.CSSProperties,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className={baseClassName}
      {...hoverProps}
      {...props}
    >
      {children}
    </motion.div>
  );
}