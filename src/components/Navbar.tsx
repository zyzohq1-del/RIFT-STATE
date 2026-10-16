import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';
import { NavigationTab, Language, ServerStats, UserAccount } from '../types';
import { RiftLogo } from './RiftLogo';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  lang: Language;
  onToggleLang: () => void;
  stats: ServerStats;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  stats,
  onOpenLogin,
  currentUser,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSettings, setNavSettings] = useState<any>(null);

  useEffect(() => {
    const fetchNavSettings = () => {
      fetch('/api/site-settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.settings) setNavSettings(data.settings);
        })
        .catch(() => {});
    };

    fetchNavSettings();
    window.addEventListener('rift_logo_updated', fetchNavSettings);
    return () => window.removeEventListener('rift_logo_updated', fetchNavSettings);
  }, []);

  const allNavLinks: { id: NavigationTab; label: string; key: string }[] = [
    { id: 'home', label: 'HOME', key: 'showHome' },
    { id: 'team', label: 'TEAM', key: 'showTeam' },
    { id: 'live', label: 'LIVE', key: 'showLive' },
    { id: 'careers', label: 'CAREERS', key: 'showCareers' },
    { id: 'faq', label: 'FAQ', key: 'showFaq' },
    { id: 'leaderboard', label: 'LEADERBOARD', key: 'showLeaderboard' },
  ];

  const nb = navSettings?.navbarSettings;
  const navLinks = allNavLinks.filter((link) => {
    if (!nb) return true;
    if (nb[link.key] !== undefined) return Boolean(nb[link.key]);
    return true;
  });

  return (
    <div className="w-full pt-4 px-4 sm:px-6 lg:px-8 z-40 relative">
      <nav className="max-w-7xl mx-auto bg-black/80 border border-neutral-900/90 rounded-2xl backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl">
        {/* Left Zone: Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onSelectTab('home')}
            className="cursor-pointer transition-opacity hover:opacity-90 flex items-center"
          >
            <RiftLogo size="md" customSrc={navSettings?.logoUrl} />
          </button>

          {/* Desktop Nav Links matching Screenshots */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-mono font-bold tracking-wider">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`relative py-1.5 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white font-extrabold'
                      : 'text-neutral-400 hover:text-white font-medium'
                  }`}
                >
                  {isActive && (
                    <span className="text-purple-400 font-mono">//</span>
                  )}
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Zone: STORE + SIGN IN / LOGOUT + Mobile Menu Button */}
        <div className="flex items-center gap-3">
          {/* Store Button matching Screenshots (Purple Gradient Pill) */}
          {nb?.showStore !== false && (
            <button
              onClick={() => {
                if (nb?.storeUrl && nb.storeUrl.startsWith('http') && nb.storeUrl !== 'internal') {
                  window.open(nb.storeUrl, '_blank');
                  return;
                }
                onSelectTab('store');
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(147,51,234,0.35)] hover:scale-105 cursor-pointer"
            >
              {nb?.storeLabel || 'STORE'}
            </button>
          )}

          {/* User Profile / Sign In */}
          {currentUser?.isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('profile')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                  currentTab === 'profile'
                    ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200'
                }`}
                title="الملف الشخصي وربط الحساب"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-bold">{currentUser.username}</span>
              </button>
              <button
                onClick={onLogout}
                className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono font-bold text-neutral-300 hover:text-white uppercase transition-colors cursor-pointer"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('profile')}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-bold uppercase transition-colors cursor-pointer ${
                  currentTab === 'profile'
                    ? 'bg-purple-950/60 border-purple-500 text-purple-300'
                    : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
                title="الملف الشخصي وربط FiveM"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>PROFILE</span>
              </button>
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                SIGN IN
              </button>
            </div>
          )}

          {/* Admin Panel Link */}
          <button
            onClick={() => onSelectTab('owner')}
            className={`p-2 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
              currentTab === 'owner'
                ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Admin Panel"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 rounded-2xl bg-black/95 border border-neutral-900 space-y-3 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onSelectTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-wider ${
                  currentTab === link.id
                    ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                onSelectTab('whitelist');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-wider text-purple-400 hover:text-white"
            >
              // ACCOUNT SETUP & WHITELIST
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
