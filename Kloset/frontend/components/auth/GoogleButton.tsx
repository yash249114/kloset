'use client';

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface GoogleButtonProps {
  onSuccess: (credentialResponse: { credential?: string }) => void;
  onError?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function GoogleButton({
  onSuccess,
  onError,
  className = '',
}: GoogleButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <div className={`flex justify-center w-full ${className}`}>
        <button
          disabled
          className="w-full h-14 flex items-center justify-center gap-3 border border-border rounded bg-white text-charcoal-light text-xs font-mono uppercase tracking-wider cursor-not-allowed opacity-60"
        >
          Google Sign-In Not Configured
        </button>
      </div>
    );
  }

  return (
    <div className={`flex justify-center w-full ${className}`}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          onSuccess(credentialResponse);
        }}
        onError={onError || (() => {})}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="400"
      />
    </div>
  );
}
