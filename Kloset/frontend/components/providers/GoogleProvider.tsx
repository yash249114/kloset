'use client';

import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  if (!clientId && process.env.NODE_ENV === 'production') {
    console.error(
      '[Kloset] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google OAuth will be unavailable. Configure it in Vercel environment variables or .env.production.'
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId || 'dummy-client-id'}>
      {children}
    </GoogleOAuthProvider>
  );
}
