import React, { useState, useEffect } from 'react';

interface RiftLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  className?: string;
  customSrc?: string;
}

export const RiftLogo: React.FC<RiftLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  customSrc,
}) => {
  const [imageError, setImageError] = useState(false);
  const [currentLogo, setCurrentLogo] = useState<string>(() => {
    if (customSrc) return customSrc;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rift_custom_logo');
      if (saved) return saved;
    }
    return '/logo.png';
  });

  useEffect(() => {
    if (customSrc) {
      setCurrentLogo(customSrc);
      setImageError(false);
    }
  }, [customSrc]);

  useEffect(() => {
    const handleLogoUpdate = () => {
      const saved = localStorage.getItem('rift_custom_logo');
      if (saved) {
        setCurrentLogo(saved);
        setImageError(false);
      }
    };
    window.addEventListener('rift_logo_updated', handleLogoUpdate);
    return () => window.removeEventListener('rift_logo_updated', handleLogoUpdate);
  }, []);

  const sizeMap = {
    sm: { box: 'w-8 h-8', text: 'text-xs', sub: 'text-[9px]' },
    md: { box: 'w-10 h-10', text: 'text-sm', sub: 'text-[10px]' },
    lg: { box: 'w-14 h-14', text: 'text-base', sub: 'text-xs' },
    xl: { box: 'w-20 h-20', text: 'text-xl', sub: 'text-sm' },
    hero: { box: 'w-28 h-28 sm:w-36 sm:h-36', text: 'text-2xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Circular server emblem */}
      <div className={`relative ${currentSize.box} shrink-0 flex items-center justify-center group`}>
        {/* Ambient violet backlight glow */}
        <div className="absolute inset-0 rounded-full bg-purple-600/40 blur-md group-hover:bg-purple-500/60 transition-all animate-pulse" />

        {/* Outer neon border ring */}
        <div className="relative w-full h-full rounded-full p-[2px] bg-gradient-to-tr from-purple-900 via-purple-500 to-indigo-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] overflow-hidden">
          {!imageError ? (
            <img
              src={currentLogo}
              alt="Rift State Official Logo"
              className="w-full h-full object-cover rounded-full filter brightness-105 contrast-105"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-b from-purple-950 via-neutral-900 to-black flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-3/5 h-3/5 text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)] fill-current"
              >
                <path d="M26 18 H52 C68 18 78 28 78 42 C78 54 70 63 58 65 L78 82 H60 L44 66 H38 V82 H26 V18 Z M38 30 V54 H50 C58 54 64 50 64 42 C64 34 58 30 50 30 H38 Z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {showText && (
        <div className="flex flex-col select-none text-left tracking-wider">
          <span className={`font-black uppercase text-white font-display leading-tight drop-shadow-[0_0_10px_rgba(168,85,247,0.4)] ${currentSize.text}`}>
            RIFT
          </span>
          <span className={`font-bold uppercase text-purple-400 font-mono tracking-widest leading-none ${currentSize.sub}`}>
            STATE
          </span>
        </div>
      )}
    </div>
  );
};
