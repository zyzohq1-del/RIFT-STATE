import React from 'react';
import { Calendar, Tag, CheckCircle2, Zap } from 'lucide-react';
import { Language } from '../types';
import { updatesData } from '../data/serverData';

interface UpdatesViewProps {
  lang: Language;
}

export const UpdatesView: React.FC<UpdatesViewProps> = ({ lang }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-xs font-semibold text-red-500 uppercase tracking-wider font-mono">
          PATCH NOTES & CHANGELOG
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-arabic">
          {lang === 'ar' ? 'سجل تحديثات السيرفر' : 'Server Updates & Changelog'}
        </h1>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto font-arabic">
          {lang === 'ar'
            ? 'نعمل باستمرار على تطوير وتحديث سيرفر Hunters Life لتقديم أفضل تجربة رول بلاي واقعية وسلسة.'
            : 'Continuous improvements and optimizations to deliver the highest quality FiveM roleplay.'}
        </p>
      </div>

      {/* Updates Timeline */}
      <div className="space-y-8">
        {updatesData.map((upd) => (
          <div
            key={upd.id}
            className="p-6 sm:p-8 bg-neutral-950 border border-neutral-900 rounded-2xl space-y-6 relative overflow-hidden"
          >
            {/* Version & Date */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-900">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-mono font-black text-sm tracking-wider">
                  {upd.version}
                </span>
                <span className="text-xs font-semibold text-neutral-400 uppercase font-mono">
                  {upd.type === 'major' ? 'Major Release' : 'Feature Update'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>{upd.date}</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-white font-arabic">
              {lang === 'ar' ? upd.titleAr : upd.titleEn}
            </h2>

            {/* Highlights List */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-neutral-300 font-arabic">
                {lang === 'ar' ? 'أبرز الإضافات والتحسينات:' : 'Key Additions & Fixes:'}
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {(lang === 'ar' ? upd.highlightsAr : upd.highlightsEn).map((item: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/50 border border-neutral-850 text-xs sm:text-sm text-neutral-300 font-arabic leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
