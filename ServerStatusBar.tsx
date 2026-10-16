import React, { useState } from 'react';
import { Users, Wifi, Clock, CloudSun, Copy, Check, Play } from 'lucide-react';
import { Language, ServerStats } from '../types';

interface ServerStatusBarProps {
  stats: ServerStats;
  lang: Language;
  onOpenConnect: () => void;
}

export const ServerStatusBar: React.FC<ServerStatusBarProps> = ({
  stats,
  lang,
  onOpenConnect,
}) => {
  const [copied, setCopied] = useState(false);

  const copyIp = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(stats.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const percentage = Math.round((stats.onlinePlayers / stats.maxPlayers) * 100);

  const handleJoinServer = async () => {
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

  return (
    <div className="w-full bg-neutral-900/90 border-b border-neutral-800 text-neutral-300 text-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left side: Status & Player Counter */}
        <div className="flex items-center flex-wrap gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400">
              {lang === 'ar' ? 'الخادم متصل' : 'Server Online'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-neutral-300">
            <Users className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-mono tabular-nums font-medium text-white">{stats.onlinePlayers}</span>
            <span className="text-neutral-500">/</span>
            <span className="font-mono tabular-nums text-neutral-400">{stats.maxPlayers}</span>
            <span className="text-neutral-400 hidden sm:inline">
              ({percentage}%)
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-neutral-400">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono tabular-nums">{stats.pingMs}ms</span>
            <span className="text-neutral-600">·</span>
            <span className="font-mono tabular-nums">{stats.tickRate} Hz</span>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-neutral-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono tabular-nums">{stats.inGameTime}</span>
            </div>
            <span className="text-neutral-600">·</span>
            <div className="flex items-center gap-1">
              <CloudSun className="w-3.5 h-3.5 text-sky-400" />
              <span>{stats.weather}</span>
            </div>
          </div>
        </div>

        {/* Right side: Quick IP Copy & Connect button */}
        <div className="flex items-center gap-2.5 ms-auto">
          <button
            onClick={copyIp}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded bg-neutral-950/70 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
            title="Copy server IP"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 font-medium">
                  {lang === 'ar' ? 'تم نسخ الـ IP' : 'IP Copied'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-neutral-400" />
                <span className="text-[11px] font-mono text-neutral-300">play.hlcrp.net</span>
              </>
            )}
          </button>

          <button
            onClick={handleJoinServer}
            className="flex items-center gap-1.5 py-1 px-3 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all text-xs cursor-pointer shadow-sm shadow-amber-500/10"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{lang === 'ar' ? 'دخول فوري' : 'Connect'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
