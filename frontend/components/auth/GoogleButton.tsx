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
