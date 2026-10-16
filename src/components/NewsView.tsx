import React from 'react';
import { Calendar, User, Newspaper, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { newsArticles } from '../data/serverData';

interface NewsViewProps {
  lang: Language;
}

export const NewsView: React.FC<NewsViewProps> = ({ lang }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-xs font-semibold text-red-500 uppercase tracking-wider font-mono">
          COMMUNITY PRESS & DISPATCH
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-arabic">
          {lang === 'ar' ? 'أخبار وإعلانات المدينة' : 'City News & Press'}
        </h1>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto font-arabic">
          {lang === 'ar'
            ? 'مستجدات مجتمع Hunters Life، الفعاليات المجدولة، والبيانات الرسمية الصادرة من الإدارة.'
            : 'Latest community happenings, tournaments, and administrative announcements.'}
        </p>
      </div>

      {/* Articles Grid */}
      <div className="space-y-6">
        {newsArticles.map((article) => (
          <article
            key={article.id}
            className="p-6 sm:p-8 bg-neutral-950 border border-neutral-900 rounded-2xl space-y-4 hover:border-neutral-800 transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 font-mono pb-3 border-b border-neutral-900">
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold uppercase">
                  {lang === 'ar' ? article.categoryAr : article.categoryEn}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.date}
                </span>
              </div>
              <span className="font-arabic text-neutral-400">{article.author}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white font-arabic">
              {lang === 'ar' ? article.titleAr : article.titleEn}
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed font-arabic">
              {lang === 'ar' ? article.contentAr : article.contentEn}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
};
