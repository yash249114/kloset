'use client';

import { Toaster as SonnerToaster } from 'sonner';
import { Z_INDEX } from '@/lib/constants';

export default function Toast() {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="light"
      toastOptions={{
        style: {
          background: '#FFFCF8',
          color: '#2C2C2C',
          border: '1px solid #E8E0D5',
          borderRadius: '4px',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '12px',
          letterSpacing: '0.02em',
          padding: '16px',
        },
        className: 'kloset-toast shadow-lg',
      }}
      style={{
        zIndex: Z_INDEX.TOAST,
      }}
    />
  );
}
