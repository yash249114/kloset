'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import Button from './Button';
import { Z_INDEX } from '@/lib/constants';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const variantStyles = {
    danger: { icon: 'text-error', button: 'bg-error text-white border-error hover:bg-error/80' },
    warning: { icon: 'text-champagne', button: 'bg-champagne text-warm-white border-champagne hover:bg-gold' },
    info: { icon: 'text-charcoal-light', button: 'bg-charcoal text-ivory border-charcoal hover:bg-charcoal-mid' },
  };

  const vs = variantStyles[variant];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: Z_INDEX.MODAL }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/70 backdrop-blur-[4px] cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-ivory rounded-xl shadow-2xl overflow-hidden border border-border z-10"
          >
            <div className="p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border border-border rounded hover:bg-ivory-dark transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full border ${vs.icon} border-current/20 bg-current/5 flex-shrink-0`}>
                  <AlertTriangle size={20} />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-display text-base font-semibold text-charcoal">{title}</h3>
                  <p className="text-xs text-charcoal-light leading-relaxed font-light">{message}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <Button variant="ghost" onClick={onClose} className="h-[44px] px-5 text-[10px] cursor-pointer">
                  {cancelLabel}
                </Button>
                <Button
                  variant="primary"
                  isLoading={isLoading}
                  onClick={onConfirm}
                  className={`h-[44px] px-5 text-[10px] !border ${vs.button} cursor-pointer`}
                >
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
