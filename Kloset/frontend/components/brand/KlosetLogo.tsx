import React from 'react';

interface LogoProps {
  variant?: 'wordmark' | 'compact' | 'full';
  className?: string;
}

export function KlosetWordmark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 540 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g fill="currentColor">
        <path d="M36 96V24h16.2v41.4L86.4 24h19.8L68.4 57.6l43.2 38.4H78.3L50.4 67.2V96H36z" />
        <path d="M97.2 96V24h16.2v93.6h54V96H97.2z" />
        <path d="M173.7 60c0 30.6 12.6 54 36 54s36-23.4 36-54-12.6-54-36-54-36 23.4-36 54zm16.2 0c0-21.6 7.2-39.6 19.8-39.6s19.8 18 19.8 39.6-7.2 39.6-19.8 39.6-19.8-18-19.8-39.6z" />
        <path d="M307.8 56.4c16.2-3.6 27-10.8 27-23.4 0-14.4-12.6-23.4-32.4-23.4-19.8 0-34.2 9-37.8 25.2h16.2c1.8-9 10.8-14.4 21.6-14.4 12.6 0 18 5.4 18 12.6 0 7.2-5.4 10.8-19.8 14.4l-7.2 1.8c-16.2 3.6-28.8 12.6-28.8 27 0 16.2 12.6 27 34.2 27 19.8 0 34.2-9 37.8-25.2h-16.2c-1.8 9-10.8 14.4-21.6 14.4-10.8 0-16.2-5.4-16.2-12.6 0-7.2 5.4-10.8 18-14.4l7.2-1.8z" />
        <path d="M356.4 96V24h64.8v14.4h-48.6v32.4h43.2v14.4h-43.2v32.4h50.4V96H356.4z" />
        <path d="M442.8 96V50.4h-36V24h86.4v26.4h-34.2V96h-16.2z" />
      </g>
    </svg>
  );
}

export function KlosetMonogram({
  className = '',
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
    >
      <g fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="square" strokeLinejoin="miter">
        <line x1="50" y1="30" x2="50" y2="170" />
        <line x1="50" y1="100" x2="160" y2="30" />
        <line x1="50" y1="100" x2="160" y2="170" />
      </g>
      <polygon points="88,82 105,65 122,82 105,99" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

export function KlosetLogoFull({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g fill="currentColor">
        <path d="M40 160V40h18v46l38-46h22L76 96l48 64h-22L56 112v48H40z" />
        <path d="M108 160V40h18v104h60v16H108z" />
        <path d="M193 100c0 34 14 60 40 60s40-26 40-60-14-60-40-60-40 26-40 60zm18 0c0-24 8-44 22-44s22 20 22 44-8 44-22 44-22-20-22-44z" />
        <path d="M342 96c18-4 30-12 30-26 0-16-14-26-36-26-22 0-38 10-42 28h18c2-10 12-16 24-16 14 0 20 6 20 14 0 8-6 12-22 16l-8 2c-18 4-32 14-32 30 0 18 14 30 38 30 22 0 38-10 42-28h-18c-2 10-12 16-24 16-12 0-18-6-18-14 0-8 6-12 20-16l8-2z" />
        <path d="M396 160V40h72v16h-54v36h48v16h-48v36h56v16h-74z" />
        <path d="M492 160V56h-40V40h96v16h-38v104h-18z" />
      </g>
      <text
        x="300"
        y="184"
        textAnchor="middle"
        fontFamily="'DM Sans', sans-serif"
        fontSize="10"
        letterSpacing="6"
        fill="currentColor"
        opacity="0.6"
      >
        LUXURY FASHION RENTAL
      </text>
    </svg>
  );
}

export function KlosetLogo({ variant = 'wordmark', className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <KlosetMonogram size={28} className="text-champagne" />
      {variant === 'wordmark' && (
        <KlosetWordmark className="h-5 w-auto text-charcoal" />
      )}
      {variant === 'full' && (
        <KlosetLogoFull className="h-8 w-auto text-charcoal" />
      )}
    </div>
  );
}
