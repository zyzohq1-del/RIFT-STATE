import React, { useState, useMemo } from 'react';
import { Search, AlertCircle, Scale, ShieldAlert } from 'lucide-react';
import { Language } from '../types';
import { rulesData } from '../data/serverData';

interface RulesViewProps {
  lang: Language;
}

export const RulesView: React.FC<RulesViewProps> = ({ lang }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCategories = useMemo(() => {
    return rulesData
      .map((cat) => {
        if (selectedCategory !== 'all' && cat.id !== selectedCategory) {
          return null;
        }

        const filteredRules = cat.rules.filter((rule) => {
          const query = searchQuery.toLowerCase().trim();
          if (!query) return true;
          return (
            (rule.term && rule.term.toLowerCase().includes(query)) ||
            rule.titleAr.toLowerCase().includes(query) ||
            rule.titleEn.toLowerCase().includes(query) ||
            rule.descriptionAr.toLowerCase().includes(query) ||
            rule.descriptionEn.toLowerCase().includes(query)
          );
        });

        if (filteredRules.length === 0) return null;

        return {
          ...cat,
          rules: filteredRules,
        };
      })
      .filter(Boolean);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="text-xs font-semibold text-red-500 uppercase tracking-wider font-mono">
          HUNTERS LIFE CONSTITUTION
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-arabic">
          {lang === 'ar' ? 'دستور وقوانين الرول بلاي' : 'Roleplay Rules & Regulations'}
        </h1>
        <p className="text-sm text-neutral-400 max-w-2xl mx-auto font-arabic">
          {lang === 'ar'
            ? 'الالتزام بالقوانين هو أساس التجربة الواقعية الناجحة في مدينة Hunters Life. الجهل بالأنظمة لا يعفي من العقوبات.'
            : 'Adhering to these principles ensures an immersive, fair environment for all players in Hunters Life.'}
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="relative max-w-xl mx-auto">
          <Search className="w-4 h-4 absolute top-3.5 start-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'ar'
                ? 'ابحث في القوانين (مثلاً: RDM, VDM, Fear RP, سرقة, مايك)...'
                : 'Search rules (e.g. RDM, VDM, Fear RP, Heists)...'
            }
            className="w-full ps-10 pe-4 py-2.5 bg-neutral-950 border border-neutral-850 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 font-arabic"
          />
        </div>

        {/* Categories Segmented Control */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-neutral-950 border border-neutral-900 rounded-xl max-w-2xl mx-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`py-1.5 px-3.5 text-xs font-bold rounded-lg transition-colors cursor-pointer font-arabic ${
              selectedCategory === 'all'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'جميع القوانين' : 'All Rules'}
          </button>
          {rulesData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`py-1.5 px-3.5 text-xs font-bold rounded-lg transition-colors cursor-pointer font-arabic ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? cat.titleAr : cat.titleEn}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Content */}
      <div className="space-y-10">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 text-sm font-arabic">
            {lang === 'ar' ? 'لم يتم العثور على أي بند يطابق بحثك.' : 'No rules match your search.'}
          </div>
        ) : (
          filteredCategories.map((cat) => {
            if (!cat) return null;
            return (
              <section key={cat.id} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-900">
                  <Scale className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg sm:text-xl font-bold text-white font-arabic">
                    {lang === 'ar' ? cat.titleAr : cat.titleEn}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-5 bg-neutral-950 border border-neutral-900 rounded-xl flex flex-col justify-between hover:border-neutral-800 transition-all space-y-4"
                    >
                      <div className="space-y-2">
                        {rule.term && (
                          <div className="text-xs font-mono font-bold text-red-500 tracking-wider">
                            {rule.term}
                          </div>
                        )}
                        <h3 className="text-base font-bold text-white font-arabic">
                          {lang === 'ar' ? rule.titleAr : rule.titleEn}
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-arabic">
                          {lang === 'ar' ? rule.descriptionAr : rule.descriptionEn}
                        </p>
                      </div>

                      {/* Penalty */}
                      <div className="pt-3 border-t border-neutral-900 flex items-start gap-2 text-xs text-red-300 bg-red-950/20 p-2.5 rounded-lg border border-red-900/30 font-arabic">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-red-400 me-1">
                            {lang === 'ar' ? 'العقوبة المقررة:' : 'Penalty:'}
                          </span>
                          <span>{lang === 'ar' ? rule.penaltyAr : rule.penaltyEn}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};
