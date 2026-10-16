/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, NavigationTab, ServerStats, UserAccount } from './types';
import { initialServerStats } from './data/serverData';
import { Navbar } from './components/Navbar';
import { ConnectModal } from './components/ConnectModal';
import { HomeView } from './components/HomeView';
import { RosterView } from './components/RosterView';
import { TeamView } from './components/TeamView';
import { LiveView } from './components/LiveView';
import { CareersView } from './components/CareersView';
import { FaqView } from './components/FaqView';
import { RulesView } from './components/RulesView';
import { UpdatesView } from './components/UpdatesView';
import { LeaderboardView } from './components/LeaderboardView';
import { NewsView } from './components/NewsView';
import { CityView } from './components/CityView';
import { WhitelistView } from './components/WhitelistView';
import { SupportView } from './components/SupportView';
import { StoreView } from './components/StoreView';
import { ProfileView } from './components/ProfileView';
import { OwnerPanelView } from './components/OwnerPanelView';
import { AuthModals } from './components/AuthModals';
import { Footer } from './components/Footer';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [stats, setStats] = useState<ServerStats>(initialServerStats);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Read initial tab from URL query params (e.g. ?tab=whitelist or ?tab=owner)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as NavigationTab;
    if (tabParam) {
      setCurrentTab(tabParam);
    }
  }, []);

  // Sync document direction with language
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Sync live user session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/status');
        if (res.ok) {
          const data = await res.json();
          if (data.discord && data.steam) {
            setCurrentUser({
              username: data.discord.username,
              discordTag: `@${data.discord.username}`,
              steamHex: data.steam.steamHex || 'steam:110000100000000',
              avatar: data.discord.avatar,
              citizenName: data.whitelist?.characterName,
              isLoggedIn: true,
              whitelistStatus: data.whitelist?.approved ? 'approved' : 'pending',
            });
          }
        }
      } catch (e) {
        // Fallback
      }
    };
    checkAuth();
  }, []);

  // Sync live server telemetry from backend API (/api/server/status)
  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const res = await fetch('/api/server/status');
        if (res.ok) {
          const data = await res.json();
          setStats((prev) => ({
            ...prev,
            onlinePlayers: data.players_online || data.server?.players || prev.onlinePlayers,
            maxPlayers: data.max_players || data.server?.maxPlayers || prev.maxPlayers,
            serverStatus: data.status === 'ONLINE' || data.server?.online ? 'online' : 'maintenance',
          }));
        }
      } catch (e) {
        // Fallback
      }
    };

    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleNavigate = (tab: NavigationTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/unlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all' }),
      });
    } catch (e) {}
    setCurrentUser(null);
  };

  // If in Admin Panel, render full-screen admin panel as in Screenshots 1, 2, 7
  if (currentTab === 'owner') {
    return (
      <OwnerPanelView
        lang={lang}
        onNavigateSite={(tab) => handleNavigate(tab || 'home')}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-black text-neutral-100 flex flex-col font-sans ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        lang={lang}
        onToggleLang={handleToggleLang}
        stats={stats}
        onOpenLogin={() => setLoginModalOpen(true)}
        onOpenRegister={() => setRegisterModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-grow">
        {currentTab === 'home' && (
          <HomeView
            lang={lang}
            onNavigate={handleNavigate}
            onOpenConnect={() => setConnectModalOpen(true)}
            stats={stats}
          />
        )}

        {currentTab === 'roster' && <LiveView lang={lang} onNavigate={handleNavigate} />}

        {currentTab === 'team' && <TeamView lang={lang} onNavigate={handleNavigate} />}

        {currentTab === 'live' && <LiveView lang={lang} onNavigate={handleNavigate} />}

        {currentTab === 'careers' && <CareersView lang={lang} onNavigate={handleNavigate} />}

        {currentTab === 'faq' && <FaqView lang={lang} onNavigate={handleNavigate} />}

        {currentTab === 'leaderboard' && <LeaderboardView lang={lang} />}

        {currentTab === 'store' && <StoreView lang={lang} />}

        {currentTab === 'rules' && <RulesView lang={lang} />}

        {currentTab === 'updates' && <UpdatesView lang={lang} />}

        {currentTab === 'news' && <NewsView lang={lang} />}

        {currentTab === 'city' && (
          <CityView
            lang={lang}
            onOpenConnect={() => setConnectModalOpen(true)}
            onOpenWhitelist={() => handleNavigate('whitelist')}
          />
        )}

        {currentTab === 'whitelist' && <WhitelistView lang={lang} />}

        {currentTab === 'profile' && <ProfileView onNavigateSite={handleNavigate} />}

        {currentTab === 'support' && <SupportView lang={lang} />}
      </main>

      {/* Footer matching Screenshots 5, 6, 8, 9, 10 */}
      <Footer />

      {/* Modals */}
      <ConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        stats={stats}
        lang={lang}
      />

      <AuthModals
        loginOpen={loginModalOpen}
        registerOpen={registerModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(false);
        }}
        lang={lang}
        onLoginSuccess={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(false);
          window.location.reload();
        }}
        onNavigateToWhitelist={() => handleNavigate('whitelist')}
      />
    </div>
  );
}
