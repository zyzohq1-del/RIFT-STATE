import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ArrowRight, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Flame, 
  ExternalLink,
  ChevronRight,
  Radio,
  Trophy,
  Server
} from 'lucide-react';
import { Language, NavigationTab, ServerStats } from '../types';

interface HomeViewProps {
  lang: Language;
  onNavigate: (tab: NavigationTab) => void;
  onOpenConnect: () => void;
  stats: ServerStats;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenConnect,
  stats,
}) => {
  const [liveData, setLiveData] = useState({
    playersOnline: stats.onlinePlayers || 47,
    maxPlayers: stats.maxPlayers || 48,
    status: 'ONLINE',
    serverName: 'RIFT STATE'
  });

  useEffect(() => {
    fetch('/api/server/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLiveData({
            playersOnline: data.players_online || data.server?.players || 47,
            maxPlayers: data.max_players || data.server?.maxPlayers || 48,
            status: data.status || 'ONLINE',
            serverName: data.server?.name || 'RIFT STATE'
          });
        }
      })
      .catch(() => {});
  }, [stats]);

  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSiteSettings = () => {
      fetch('/api/site-settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.settings) setSiteSettings(data.settings);
        })
        .catch(() => {});
    };

    fetchSiteSettings();
    window.addEventListener('rift_logo_updated', fetchSiteSettings);
    return () => window.removeEventListener('rift_logo_updated', fetchSiteSettings);
  }, []);

  const socialLinks = siteSettings?.socialLinks || {
    youtube: { enabled: true, url: 'https://youtube.com' },
    tiktok: { enabled: true, url: 'https://tiktok.com' },
    instagram: { enabled: true, url: 'https://instagram.com' },
    twitter: { enabled: true, url: 'https://x.com' },
    discord: { enabled: true, url: 'https://discord.gg' },
    kick: { enabled: true, url: 'https://kick.com' },
    twitch: { enabled: true, url: 'https://twitch.tv' },
  };

  const heroButtons = siteSettings?.heroButtons || {
    playNow: { enabled: true, label: 'PLAY NOW', url: 'https://cfx.re/join/hlcrp' },
    joinNow: { enabled: true, label: 'JOIN NOW', url: '/whitelist' },
    learnMore: { enabled: true, label: 'LEARN MORE', url: 'connect_modal' },
  };

  const joinServer = async () => {
    if (heroButtons.playNow?.url && heroButtons.playNow.url !== 'connect_modal') {
      window.location.href = heroButtons.playNow.url;
      return;
    }
    try {
      const response = await fetch('/api/server/join');
      const data = await response.json();
      if (data.success && data.url) {
        window.location.href = data.url;
        return;
      }
    } catch (e) {}
    onOpenConnect();
  };

  const handleJoinNowClick = () => {
    if (heroButtons.joinNow?.url && heroButtons.joinNow.url !== '/whitelist') {
      if (heroButtons.joinNow.url.startsWith('http')) {
        window.open(heroButtons.joinNow.url, '_blank');
        return;
      }
    }
    onNavigate('whitelist');
  };

  const handleLearnMoreClick = () => {
    if (heroButtons.learnMore?.url && heroButtons.learnMore.url !== 'connect_modal') {
      if (heroButtons.learnMore.url.startsWith('http')) {
        window.open(heroButtons.learnMore.url, '_blank');
        return;
      }
    }
    onOpenConnect();
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-purple-600 selection:text-white">
      {/* Subtle Starfield & Ambient Purple Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-purple-900/15 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-10 left-16 w-2 h-2 rounded-full bg-purple-400 blur-[1px] opacity-70 animate-pulse" />
      <div className="absolute top-44 right-24 w-3 h-3 rounded-full bg-indigo-500 blur-[2px] opacity-60" />
      <div className="absolute top-80 left-32 w-1.5 h-1.5 rounded-full bg-purple-300 blur-[1px] opacity-50" />
      <div className="absolute top-96 right-1/3 w-2.5 h-2.5 rounded-full bg-purple-500 blur-[2px] opacity-40 animate-ping" />

      {/* Hero Section matching Screenshot 4 */}
      <section className="relative min-h-[82vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20 z-10">
        <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center">
          {/* Official Rift State Server Logo Crest */}
          <div className="relative group cursor-pointer transition-transform hover:scale-105 duration-300">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 rounded-full blur-xl opacity-60 group-hover:opacity-90 transition duration-500 animate-pulse" />
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-purple-900 via-purple-500 to-indigo-400 shadow-[0_0_35px_rgba(168,85,247,0.6)]">
              <img
                src={siteSettings?.logoUrl || (typeof window !== 'undefined' ? localStorage.getItem('rift_custom_logo') || '/logo.png' : '/logo.png')}
                alt="Rift State Official Logo"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Tag Pill: ✧ THE GTA RP IN THE MIDDLE EAST */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-purple-800/80 bg-purple-950/40 text-purple-300 text-xs font-mono font-bold tracking-widest uppercase backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{siteSettings?.tagline || 'THE GTA RP IN THE MIDDLE EAST'}</span>
          </div>

          {/* Huge Hero Typography: RIFT STATE */}
          <div className="space-y-1">
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black font-display tracking-tight text-white leading-none uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              {siteSettings?.heroTitle ? siteSettings.heroTitle.split(' ')[0] : 'RIFT'}
            </h1>
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black font-display tracking-tight text-purple-300 leading-none uppercase drop-shadow-[0_0_40px_rgba(168,85,247,0.7)]">
              {siteSettings?.heroTitle ? siteSettings.heroTitle.split(' ').slice(1).join(' ') || 'STATE' : 'STATE'}
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-neutral-400 max-w-2xl mx-auto text-sm sm:text-lg leading-relaxed font-normal">
            {siteSettings?.heroSubtitle || 'The most immersive GTA V roleplay experience. Join 300,000+ players in a world of adventure, drama, and unforgettable stories.'}
          </p>

          {/* Action Buttons: PLAY NOW & JOIN NOW & LEARN MORE */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {heroButtons.playNow?.enabled !== false && (
              <button
                onClick={joinServer}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{heroButtons.playNow?.label || 'PLAY NOW'}</span>
              </button>
            )}

            {heroButtons.joinNow?.enabled !== false && (
              <button
                onClick={handleJoinNowClick}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:scale-105 cursor-pointer"
              >
                <span>{heroButtons.joinNow?.label || 'JOIN NOW'}</span>
              </button>
            )}

            {heroButtons.learnMore?.enabled !== false && (
              <button
                onClick={handleLearnMoreClick}
                className="px-7 py-3.5 rounded-xl bg-neutral-950/80 hover:bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 text-neutral-300 hover:text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>{heroButtons.learnMore?.label || 'LEARN MORE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Social Icons Bar with Dynamic Toggles & URLs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
            {socialLinks.youtube?.enabled && (
              <a
                href={socialLinks.youtube.url || 'https://youtube.com'}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-950/90 border border-neutral-800 hover:border-red-500/60 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-all shadow-sm hover:scale-105"
                title="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}

            {socialLinks.tiktok?.enabled && (
              <a
                href={socialLinks.tiktok.url || 'https://tiktok.com'}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-950/90 border border-neutral-800 hover:border-pink-500/60 text-neutral-400 hover:text-pink-400 flex items-center justify-center transition-all shadow-sm hover:scale-105"
                title="TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            )}

            {socialLinks.instagram?.enabled && (
              <a
                href={socialLinks.instagram.url || 'https://instagram.com'}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-950/90 border border-neutral-800 hover:border-amber-500/60 text-neutral-400 hover:text-amber-400 flex items-center justify-center transition-all shadow-sm hover:scale-105"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}

            {socialLinks.twitter?.enabled && (
              <a
                href={socialLinks.twitter.url || 'https://x.com'}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-950/90 border border-neutral-800 hover:border-blue-400 text-neutral-400 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105"
                title="X (Twitter)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}

            {socialLinks.discord?.enabled && (
              <a
                href={socialLinks.discord.url || 'https://discord.gg'}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-950/90 border border-neutral-800 hover:border-indigo-500/60 text-neutral-400 hover:text-indigo-400 flex items-center justify-center transition-all shadow-sm hover:scale-105"
                title="Discord"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            )}

            {socialLinks.kick?.enabled && (
              <a
                href={socialLinks.kick.url || 'https://kick.com'}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-950/90 border border-neutral-800 hover:border-emerald-500/60 text-neutral-400 hover:text-emerald-400 flex items-center justify-center transition-all shadow-sm hover:scale-105 font-mono text-xs font-black"
                title="Kick"
              >
                K
              </a>
            )}

            {socialLinks.twitch?.enabled && (
              <a
                href={socialLinks.twitch.url || 'https://twitch.tv'}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-950/90 border border-neutral-800 hover:border-purple-500/60 text-neutral-400 hover:text-purple-400 flex items-center justify-center transition-all shadow-sm hover:scale-105"
                title="Twitch"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Live Server Telemetry Banner */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-3xl bg-neutral-950/80 border border-neutral-800/80 backdrop-blur-xl shadow-2xl">
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-neutral-400">Players Online</div>
              <div className="text-xl font-black text-white font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{liveData.playersOnline} / {liveData.maxPlayers}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-neutral-400">Server Status</div>
              <div className="text-xl font-black text-emerald-400 font-mono flex items-center gap-1.5">
                <span>ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-bold text-purple-400 tracking-widest uppercase">
            WHY PLAY IN RIFT STATE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-wide">
            DESIGNED FOR TRUE IMMERSION
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-gradient-to-b from-neutral-900/70 to-neutral-950/90 border border-neutral-800 hover:border-purple-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-800/50 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
              Serious Roleplay First
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Enforced Fear RP, realistic police investigations, legal judicial courts, and strict anti-RDM protocols for cinematic storylines.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-neutral-900/70 to-neutral-950/90 border border-neutral-800 hover:border-purple-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
              Custom Framework & Cars
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Proprietary vehicle physics, realistic handling, custom engine sounds, real estate interiors, and modern phone UI.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-neutral-900/70 to-neutral-950/90 border border-neutral-800 hover:border-purple-500/50 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-800/50 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
              Competitive Leaderboards
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Live server hours tracking, weekly civilian rewards, medic spotlight, and automated achievements synchronized with FiveM SQL.
            </p>
          </div>
        </div>
      </section>

      {/* STAY CONNECTED / WANT TO SEE MORE? Section matching Screenshot 5 */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-neutral-900/80 bg-black text-center z-10 overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Badge with horizontal lines matching Screenshot 5 */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-[1px] bg-purple-600/60" />
            <span className="text-xs font-mono font-bold text-purple-400 tracking-widest uppercase">
              STAY CONNECTED
            </span>
            <div className="w-12 h-[1px] bg-purple-600/60" />
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white tracking-wide uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            WANT TO SEE MORE?
          </h2>

          {/* Subtitle */}
          <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Follow us on social media for more epic moments and behind-the-scenes content.
          </p>

          {/* X / TWITTER Button matching Screenshot 5 */}
          <div className="pt-2">
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-purple-500/70 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-purple-900/30"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>X / TWITTER</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
