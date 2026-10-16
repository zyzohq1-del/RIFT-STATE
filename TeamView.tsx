import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Crown, Code2, Users2, Sparkles, MessageSquare } from 'lucide-react';
import { TeamMember, NavigationTab } from '../types';

interface TeamViewProps {
  onNavigate?: (tab: NavigationTab) => void;
  lang?: string;
}

export const TeamView: React.FC<TeamViewProps> = ({ onNavigate }) => {
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch('/api/team');
        if (res.ok) {
          const data = await res.json();
          if (data.team && Array.isArray(data.team)) {
            setTeam(data.team);
          }
        }
      } catch (e) {
        // Fallback
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="min-h-screen bg-black text-neutral-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Ambient background particles & purple glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-900/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-20 right-1/4 w-3 h-3 rounded-full bg-purple-500 blur-[2px] opacity-60" />
      <div className="absolute bottom-20 right-20 w-2 h-2 rounded-full bg-indigo-400 blur-[1px]" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Back to Home Link */}
        {onNavigate && (
          <div className="flex justify-center">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>
        )}

        {/* Header matching Screenshot 9 */}
        <div className="text-center space-y-4">
          {/* Badge with purple underline */}
          <div className="inline-flex flex-col items-center gap-1">
            <span className="text-xs font-mono font-bold text-purple-400 tracking-widest uppercase">
              TEAM
            </span>
            <div className="w-8 h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white font-display uppercase tracking-wider drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            THE PEOPLE BEHIND RIFT STATE
          </h1>

          <p className="text-neutral-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Meet the dedicated team that builds, manages, and supports the Rift State experience.
          </p>
        </div>

        {/* Team Grid or Empty Announcement matching Screenshot 9 */}
        {team.length === 0 ? (
          <div className="max-w-2xl mx-auto p-12 rounded-3xl border border-dashed border-neutral-800/90 bg-neutral-950/40 text-center space-y-3 backdrop-blur-md">
            <div className="text-sm text-neutral-300 font-medium flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>More team members coming soon — stay tuned for announcements!</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.id}
                className="group relative rounded-2xl bg-gradient-to-b from-neutral-900/80 to-neutral-950/90 border border-neutral-800 hover:border-purple-500/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80'}
                    alt={member.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/40 group-hover:border-purple-400 transition-colors shadow-lg"
                  />
                  <div>
                    <h3 className="font-black text-lg text-white group-hover:text-purple-300 transition-colors">
                      {member.name}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-mono font-bold uppercase bg-purple-950/60 text-purple-300 border border-purple-800/40">
                      {member.roleType === 'founder' && <Crown className="w-3 h-3 text-amber-400" />}
                      {member.roleType === 'dev' && <Code2 className="w-3 h-3 text-cyan-400" />}
                      {member.roleType === 'management' && <Shield className="w-3 h-3 text-purple-400" />}
                      <span>{member.roleTitle}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
                  {member.description}
                </p>

                {member.discordId && (
                  <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-mono">Discord:</span>
                    <span className="font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900/40">
                      {member.discordId}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom announcement note */}
        <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-neutral-800/60 bg-neutral-950/30 text-center text-xs text-neutral-400">
          • More team members coming soon — stay tuned for announcements!
        </div>
      </div>
    </div>
  );
};
