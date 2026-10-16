import React, { useState, useEffect } from 'react';
import { ArrowLeft, Briefcase, CheckCircle2, ChevronRight, Send, X } from 'lucide-react';
import { CareerPosition, NavigationTab } from '../types';

interface CareersViewProps {
  onNavigate?: (tab: NavigationTab) => void;
  lang?: string;
}

export const CareersView: React.FC<CareersViewProps> = ({ onNavigate }) => {
  const [positions, setPositions] = useState<CareerPosition[]>([]);
  const [applyingPosition, setApplyingPosition] = useState<CareerPosition | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [applicantForm, setApplicantForm] = useState({
    name: '',
    discordId: '',
    experience: '',
    portfolio: ''
  });

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await fetch('/api/careers');
        if (res.ok) {
          const data = await res.json();
          if (data.careers && Array.isArray(data.careers)) {
            // Include all jobs from database unless explicitly marked inactive
            setPositions(data.careers.filter((p: any) => p.active !== false));
          }
        }
      } catch (e) {
        // Fallback
      }
    };
    fetchPositions();
  }, []);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setApplyingPosition(null);
      setApplicantForm({ name: '', discordId: '', experience: '', portfolio: '' });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-900/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-28 left-20 w-2 h-2 rounded-full bg-purple-400 blur-[1px] animate-pulse" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
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

        {/* Header matching Screenshot 6 */}
        <div className="text-center space-y-4">
          {/* Badge with purple underline */}
          <div className="inline-flex flex-col items-center gap-1">
            <span className="text-xs font-mono font-bold text-purple-400 tracking-widest uppercase">
              CAREERS
            </span>
            <div className="w-10 h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white font-display uppercase tracking-wider drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            JOIN OUR TEAM
          </h1>

          <p className="text-neutral-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Help us build something meaningful. We're looking for talented people to join Rift State Studios.
          </p>
        </div>

        {/* Section title matching Screenshot 6: Open Positions (X roles) */}
        <div className="space-y-4">
          <div className="text-left font-bold text-sm text-neutral-200">
            Open Positions <span className="text-neutral-500 font-mono font-normal">({positions.length} roles)</span>
          </div>

          {/* Empty state box matching Screenshot 6 */}
          {positions.length === 0 ? (
            <div className="max-w-3xl mx-auto p-12 rounded-3xl border border-dashed border-neutral-800/90 bg-neutral-950/40 text-center space-y-3 backdrop-blur-md">
              <h3 className="text-lg font-bold text-white">No Open Positions</h3>
              <p className="text-xs text-neutral-400">
                We don't have any open positions right now. Follow us on social media for announcements.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {positions.map((pos) => (
                <div
                  key={pos.id}
                  className="rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-purple-500/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-neutral-900/90"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{pos.title}</h3>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/60 text-purple-300 border border-purple-800/40">
                        {pos.type || (pos as any).salary || 'شاغر متاح'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {pos.department} • {pos.description}
                      {(pos as any).openings ? ` (${(pos as any).openings} شواغر متاحة)` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setApplyingPosition(pos)}
                    className="py-2 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
                  >
                    <span>Apply Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {applyingPosition && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Apply for {applyingPosition.title}</h3>
                <p className="text-xs text-neutral-400">{applyingPosition.department}</p>
              </div>
              <button
                onClick={() => setApplyingPosition(null)}
                className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center space-y-3 bg-purple-950/20 rounded-2xl border border-purple-800/40">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Application Received!</h4>
                <p className="text-xs text-neutral-400">Our staff team will contact you on Discord if selected.</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={applicantForm.name}
                    onChange={(e) => setApplicantForm({ ...applicantForm, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Discord ID or Tag</label>
                  <input
                    type="text"
                    required
                    value={applicantForm.discordId}
                    onChange={(e) => setApplicantForm({ ...applicantForm, discordId: e.target.value })}
                    placeholder="username#0000"
                    className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">Roleplay & Staff Experience</label>
                  <textarea
                    rows={3}
                    required
                    value={applicantForm.experience}
                    onChange={(e) => setApplicantForm({ ...applicantForm, experience: e.target.value })}
                    placeholder="Briefly describe your experience..."
                    className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/25"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>SUBMIT APPLICATION</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
