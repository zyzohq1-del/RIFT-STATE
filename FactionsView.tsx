import React, { useState } from 'react';
import { Shield, HeartPulse, Wrench, CheckCircle, ArrowRight, X, Send, Award, FileText } from 'lucide-react';
import { Language, Faction } from '../types';
import { factionsList } from '../data/serverData';

interface FactionsViewProps {
  lang: Language;
}

export const FactionsView: React.FC<FactionsViewProps> = ({ lang }) => {
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [targetFaction, setTargetFaction] = useState<Faction | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [form, setForm] = useState({
    discordId: '',
    characterName: '',
    experienceYears: '1',
    whyJoin: '',
  });

  const handleOpenApply = (faction: Faction) => {
    setTargetFaction(faction);
    setApplyModalOpen(true);
    setSubmittedSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSuccess(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
          {lang === 'ar' ? 'القطاعات والمهن الرسمية' : 'Government & Civilian Sectors'}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-arabic">
          {lang === 'ar' ? 'قطاعات ومؤسسات مدينة HLCRP' : 'Official Whitelisted Departments'}
        </h1>
        <p className="text-sm text-neutral-400 max-w-2xl mx-auto">
          {lang === 'ar'
            ? 'سواء كنت ترغب بحفظ الأمن كرجل شرطة، إنقاذ الأرواح كمسعف، أو قيادة عالم السيارات والتجارة، توفر المدينة فرصاً وظيفية متقدمة.'
            : 'Whether upholding the law as LSPD, saving lives in EMS, or dominating automotive custom tuning, Los Santos has a career for you.'}
        </p>
      </div>

      {/* Factions Showcase */}
      <div className="space-y-12">
        {factionsList.map((faction, idx) => (
          <div
            key={faction.id}
            className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700/80 transition-all grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Image Col */}
            <div className={`lg:col-span-5 relative min-h-[260px] lg:min-h-full ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              <img
                src={faction.image}
                alt={faction.nameAr}
                className="w-full h-full object-cover object-center filter brightness-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent lg:hidden" />
            </div>

            {/* Content Col */}
            <div className={`lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {faction.id === 'lspd' && <Shield className="w-4 h-4 text-blue-400" />}
                    {faction.id === 'ems' && <HeartPulse className="w-4 h-4 text-rose-400" />}
                    {faction.id === 'customs' && <Wrench className="w-4 h-4 text-amber-400" />}
                    <span className="font-mono text-amber-400 uppercase">{faction.shortName}</span>
                  </div>
                  <span className="text-emerald-400 font-medium">
                    {lang === 'ar' ? 'باب التوظيف مفتوح' : 'Recruitment Open'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white font-arabic">
                  {lang === 'ar' ? faction.nameAr : faction.nameEn}
                </h2>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {lang === 'ar' ? faction.descriptionAr : faction.descriptionEn}
                </p>

                {/* Requirements */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-neutral-200">
                    {lang === 'ar' ? 'شروط الالتحاق بالقطاع:' : 'Recruitment Requirements:'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(lang === 'ar' ? faction.requirementsAr : faction.requirementsEn).map((req, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-neutral-400">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ranks hierarchy overview */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'ar' ? 'التسلسل الإداري والرتب:' : 'Ranks & Hierarchy:'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {faction.ranks.map((r, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono py-1 px-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-300"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  {lang === 'ar' ? 'تخضع المقابلات لقيادة القطاع في الديسكورد' : 'Interviews conducted by Sector Command'}
                </span>
                <button
                  onClick={() => handleOpenApply(faction)}
                  className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تقديم طلب توظيف' : 'Submit Application'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sector Application Modal */}
      {applyModalOpen && targetFaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <div className="text-xs text-amber-400 font-mono uppercase">{targetFaction.shortName}</div>
                <h3 className="text-lg font-bold text-white font-arabic">
                  {lang === 'ar' ? `التقديم على ${targetFaction.nameAr}` : `Apply for ${targetFaction.nameEn}`}
                </h3>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white font-arabic">
                  {lang === 'ar' ? 'تم استلام طلب التوظيف بنجاح!' : 'Application Submitted!'}
                </h4>
                <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                  {lang === 'ar'
                    ? `سيتم مراجعة ملفك من قِبل قيادة ${targetFaction.nameAr} والتواصل معك عبر تذكرة خاصة في سيرفر الديسكورد لتحديد موعد الاختبار.`
                    : 'Sector command will review your file and reach out via a private Discord ticket.'}
                </p>
                <button
                  onClick={() => setApplyModalOpen(false)}
                  className="py-2 px-6 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg"
                >
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    {lang === 'ar' ? 'حساب الديسكورد (Discord Tag) *' : 'Discord Tag *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.discordId}
                    onChange={(e) => setForm({ ...form, discordId: e.target.value })}
                    placeholder="User#0000"
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    {lang === 'ar' ? 'اسم الشخصية داخل السيرفر *' : 'In-game Character Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.characterName}
                    onChange={(e) => setForm({ ...form, characterName: e.target.value })}
                    placeholder="مثال: فهد السالم"
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    {lang === 'ar' ? 'لماذا ترغب بالانضمام لهذا القطاع تحديداً؟ *' : 'Why do you want to join this department? *'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={form.whyJoin}
                    onChange={(e) => setForm({ ...form, whyJoin: e.target.value })}
                    placeholder={lang === 'ar' ? 'اكتب دوافعك وخبراتك السابقة في هذا المجال...' : 'Describe your motivations and qualifications...'}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="py-2 px-4 rounded-lg bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-neutral-950"
                  >
                    {lang === 'ar' ? 'إرسال طلب الالتحاق' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
