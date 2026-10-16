import React from 'react';

interface HlcLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const HlcLogo: React.FC<HlcLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-14 h-14',
    hero: 'w-72 h-72 sm:w-96 sm:h-96',
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${sizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_10px_25px_rgba(220,38,38,0.25)]"
      >
        <defs>
          {/* Chrome / Silver Gradient */}
          <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#cfd6e0" />
            <stop offset="50%" stopColor="#8a95a5" />
            <stop offset="75%" stopColor="#4a5568" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Dark Metallic Shadow */}
          <linearGradient id="metalDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Crimson Red Arrow Gradient */}
          <linearGradient id="crimsonRed" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#7f1d1d" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* H Letter - Gothic Geometric Chrome */}
        <path
          d="M 60 70 
             L 135 125 
             L 135 175 
             L 165 175 
             L 165 125 
             L 190 125 
             L 190 275 
             L 165 275 
             L 165 225 
             L 135 225 
             L 135 275 
             L 60 330 
             L 60 260 
             L 95 235 
             L 95 165 
             L 60 140 
             Z"
          fill="url(#chromeGrad)"
          stroke="#1e293b"
          strokeWidth="3"
        />

        {/* C Letter - Gothic Geometric Chrome */}
        <path
          d="M 340 70 
             L 265 125 
             L 265 165 
             L 295 165 
             L 295 140 
             L 330 140 
             L 330 260 
             L 295 260 
             L 295 235 
             L 265 235 
             L 265 275 
             L 340 330 
             L 340 275 
             L 310 275 
             L 310 125 
             L 340 125 
             Z"
          fill="url(#chromeGrad)"
          stroke="#1e293b"
          strokeWidth="3"
        />

        {/* Red Arrow in Center Piercing Upwards */}
        {/* Arrow Head */}
        <path
          d="M 200 40 
             L 235 105 
             L 214 95 
             L 214 260 
             L 186 260 
             L 186 95 
             L 165 105 
             Z"
          fill="url(#crimsonRed)"
          filter="url(#redGlow)"
        />

        {/* Arrow Shaft ridges/fletchings */}
        <path
          d="M 186 160 L 175 175 L 186 185 Z"
          fill="#991b1b"
        />
        <path
          d="M 214 160 L 225 175 L 214 185 Z"
          fill="#991b1b"
        />
        <path
          d="M 186 195 L 175 210 L 186 220 Z"
          fill="#991b1b"
        />
        <path
          d="M 214 195 L 225 210 L 214 220 Z"
          fill="#991b1b"
        />
        <path
          d="M 186 230 L 175 245 L 186 255 Z"
          fill="#991b1b"
        />
        <path
          d="M 214 230 L 225 245 L 214 255 Z"
          fill="#991b1b"
        />
      </svg>
    </div>
  );
};
