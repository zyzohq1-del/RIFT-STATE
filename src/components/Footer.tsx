import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Mail } from 'lucide-react';
import { RiftLogo } from './RiftLogo';

interface FooterProps {
  settings?: any;
}

export const Footer: React.FC<FooterProps> = ({ settings: propSettings }) => {
  const [settings, setSettings] = useState<any>(propSettings || null);

  useEffect(() => {
    if (!propSettings) {
      const fetchSettings = async () => {
        try {
          const res = await fetch('/api/site-settings');
          if (res.ok) {
            const data = await res.json();
            if (data.settings) setSettings(data.settings);
          }
        } catch {}
      };
      fetchSettings();
      window.addEventListener('rift_logo_updated', fetchSettings);
      return () => window.removeEventListener('rift_logo_updated', fetchSettings);
    } else {
      setSettings(propSettings);
    }
  }, [propSettings]);

  const socialLinks = settings?.socialLinks || {
    youtube: { enabled: true, url: 'https://youtube.com' },
    tiktok: { enabled: true, url: 'https://tiktok.com' },
    instagram: { enabled: true, url: 'https://instagram.com' },
    twitter: { enabled: true, url: 'https://x.com' },
    discord: { enabled: true, url: 'https://discord.gg' },
    kick: { enabled: true, url: 'https://kick.com' },
    twitch: { enabled: true, url: 'https://twitch.tv' },
  };

  const footer = settings?.footerSettings || {
    locationText: settings?.location || 'Saudi Arabia / Riyadh',
    websiteText: settings?.website || 'https://riftstate.net',
    emailText: settings?.email || 'support@riftstate.net',
    copyrightText: '© 2026 RIFT STATE ROLEPLAY. ALL RIGHTS RESERVED.',
  };

  return (
    <footer className="w-full bg-black border-t border-neutral-900 py-10 px-4 sm:px-6 lg:px-8 font-sans select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand Logo & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <RiftLogo size="sm" showText={true} customSrc={settings?.logoUrl} />
          <span className="text-[11px] font-mono text-neutral-500">
            {footer.copyrightText || '© 2026 RIFT STATE ROLEPLAY.'}
          </span>
        </div>

        {/* Center Contact & Meta */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-mono">
          {footer.locationText && (
            <div className="flex items-center gap-1.5 hover:text-neutral-200 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>{footer.locationText}</span>
            </div>
          )}
          {footer.websiteText && (
            <a
              href={footer.websiteText.startsWith('http') ? footer.websiteText : `https://${footer.websiteText}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-purple-300 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>{footer.websiteText.replace(/^https?:\/\//i, '')}</span>
            </a>
          )}
          {footer.emailText && (
            <a
              href={`mailto:${footer.emailText}`}
              className="flex items-center gap-1.5 hover:text-purple-300 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>{footer.emailText}</span>
            </a>
          )}
        </div>

        {/* Dynamic Social Icons with ON/OFF Toggles & Custom Links */}
        <div className="flex items-center gap-2">
          {/* YouTube */}
          {socialLinks.youtube?.enabled && (
            <a
              href={socialLinks.youtube.url || 'https://youtube.com'}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-red-500/60 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-all shadow-sm hover:scale-105"
              title="YouTube"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          )}

          {/* TikTok */}
          {socialLinks.tiktok?.enabled && (
            <a
              href={socialLinks.tiktok.url || 'https://tiktok.com'}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-pink-500/60 text-neutral-400 hover:text-pink-400 flex items-center justify-center transition-all shadow-sm hover:scale-105"
              title="TikTok"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </a>
          )}

          {/* Instagram */}
          {socialLinks.instagram?.enabled && (
            <a
              href={socialLinks.instagram.url || 'https://instagram.com'}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-amber-500/60 text-neutral-400 hover:text-amber-400 flex items-center justify-center transition-all shadow-sm hover:scale-105"
              title="Instagram"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          )}

          {/* Twitter / X */}
          {socialLinks.twitter?.enabled && (
            <a
              href={socialLinks.twitter.url || 'https://x.com'}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-blue-400 text-neutral-400 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105"
              title="X (Twitter)"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          )}

          {/* Discord */}
          {socialLinks.discord?.enabled && (
            <a
              href={socialLinks.discord.url || 'https://discord.gg'}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-indigo-500/60 text-neutral-400 hover:text-indigo-400 flex items-center justify-center transition-all shadow-sm hover:scale-105"
              title="Discord"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
          )}

          {/* Kick */}
          {socialLinks.kick?.enabled && (
            <a
              href={socialLinks.kick.url || 'https://kick.com'}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-emerald-500/60 text-neutral-400 hover:text-emerald-400 flex items-center justify-center transition-all shadow-sm hover:scale-105 font-mono text-[10px] font-black"
              title="Kick"
            >
              K
            </a>
          )}

          {/* Twitch */}
          {socialLinks.twitch?.enabled && (
            <a
              href={socialLinks.twitch.url || 'https://twitch.tv'}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-purple-500/60 text-neutral-400 hover:text-purple-400 flex items-center justify-center transition-all shadow-sm hover:scale-105"
              title="Twitch"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};
