'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Z_INDEX } from '@/lib/constants';
import { useUIStore } from '@/store/useUIStore';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  zIndex?: number;
  maxWidth?: string;
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  zIndex = Z_INDEX.DRAWER,
  maxWidth = '480px',
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  const { registerOverlay, unregisterOverlay } = useUIStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Single source of truth: Drawer manages overlay registration
  useEffect(() => {
    if (isOpen) {
      registerOverlay();
    }
    return () => {
      unregisterOverlay();
    };
  }, [isOpen, registerOverlay, unregisterOverlay]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 overflow-hidden" 
          style={{ zIndex }}
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-[4px] cursor-pointer"
          />

          {/* Drawer Sliding Body */}
          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-screen flex flex-col h-full bg-ivory border-l border-border shadow-2xl relative"
              style={{ maxWidth }}
            >
              {/* Header */}
              <div className="p-6 flex items-center justify-between border-b border-border bg-white flex-shrink-0">
                {title ? (
                  <h3 className="text-lg font-display font-medium text-charcoal tracking-wide">
                    {title}
                  </h3>
                ) : (
                  <div />
                )}
                <button
                  onClick={onClose}
                  className="w-[52px] h-[52px] border border-border hover:bg-ivory-dark text-charcoal flex items-center justify-center cursor-pointer transition-colors rounded"
                  aria-label="Close drawer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Contents */}
              <div className="flex-1 overflow-y-auto p-6 scroll-rail">
                {children}
              </div>
            </motion.div>
          </div>

        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
