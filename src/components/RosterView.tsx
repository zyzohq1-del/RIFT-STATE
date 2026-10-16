import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, Video, Youtube, Radio } from 'lucide-react';
import { CreatorRosterItem } from '../types';

interface RosterViewProps {
  lang?: string;
}

export const RosterView: React.FC<RosterViewProps> = () => {
  const [creators, setCreators] = useState<CreatorRosterItem[]>([
    {
      id: 'cr-1',
      name: 'RiftSniper',
      platform: 'kick',
      channelUrl: 'https://kick.com/example',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&h=300&q=80',
      followers: '45.2K',
      category: 'GTA V Roleplay',
      description: 'Daily GTA V Roleplay streamer in Rift State City.'
    },
    {
      id: 'cr-2',
      name: 'Falcon_RP',
      platform: 'twitch',
      channelUrl: 'https://twitch.tv/example',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300&q=80',
      followers: '88.5K',
      category: 'LSPD & Undercover',
      description: 'Senior Officer on patrol. High adrenaline pursuits.'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<'all' | 'kick' | 'twitch' | 'youtube'>('all');

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const res = await fetch('/api/roster');
        if (res.ok) {
          const data = await res.json();
          if (data.creators && Array.isArray(data.creators)) {
            setCreators(data.creators);
          }
        }
      } catch (e) {
        // Fallback to initial
      }
    };
    fetchCreators();
  }, []);

  const filteredCreators = creators.filter(c => {
    if (activeFilter === 'all') return true;
    return c.platform === activeFilter;
  });

  return (
    <div className="min-h-screen bg-black text-neutral-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Ambient background particles & purple glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-900/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-purple-400 blur-[1px] animate-pulse" />
      <div className="absolute top-40 right-20 w-3 h-3 rounded-full bg-indigo-500 blur-[2px] opacity-70" />
      <div className="absolute bottom-20 left-1/4 w-2 h-2 rounded-full bg-purple-500 blur-[1px]" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Header matching screenshot 10 */}
        <div className="text-center space-y-4">
          {/* Badge with glowing purple dot */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-800/60 bg-purple-950/30 text-purple-300 text-xs font-mono font-bold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
            <span>ROSTER</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white font-display uppercase tracking-wider drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            CREATOR ROSTER
          </h1>

          <p className="text-neutral-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Meet the talented content creators who bring Rift State to life.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              ALL CREATORS
            </button>
            <button
              onClick={() => setActiveFilter('kick')}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === 'kick'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              Kick
            </button>
            <button
              onClick={() => setActiveFilter('twitch')}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === 'twitch'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              Twitch
            </button>
            <button
              onClick={() => setActiveFilter('youtube')}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === 'youtube'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              YouTube
            </button>
          </div>
        </div>

        {/* Content list or Empty State box matching Screenshot 10 */}
        {filteredCreators.length === 0 ? (
          <div className="max-w-2xl mx-auto p-12 rounded-3xl border border-dashed border-neutral-800/90 bg-neutral-950/40 text-center space-y-3 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white">No creators found</h3>
            <p className="text-xs text-neutral-400">
              More creators coming soon — stay tuned for announcements!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="group relative rounded-2xl bg-gradient-to-b from-neutral-900/80 to-neutral-950/90 border border-neutral-800 hover:border-purple-500/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={creator.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80'}
                      alt={creator.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-purple-500/40 group-hover:border-purple-400 transition-colors shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-lg text-white group-hover:text-purple-300 transition-colors">
                          {creator.name}
                        </h3>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-purple-950/60 text-purple-400 border border-purple-800/40">
                        {creator.platform}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {creator.description || 'Verified Content Creator on Rift State.'}
                  </p>

                  {creator.followers && (
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/80">
                      <span className="text-neutral-500 font-mono">Followers</span>
                      <span className="font-bold text-white font-mono">{creator.followers}</span>
                    </div>
                  )}
                </div>

                <div className="pt-5">
                  <a
                    href={creator.channelUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-600 border border-purple-800/60 hover:border-purple-500 text-purple-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Watch Channel</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
