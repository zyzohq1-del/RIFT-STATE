import React from 'react';
import { Shield, HeartPulse, Wrench, Building2, Car, Users, Play } from 'lucide-react';
import { Language } from '../types';

interface CityViewProps {
  lang: Language;
  onOpenConnect: () => void;
  onOpenWhitelist: () => void;
}

export const CityView: React.FC<CityViewProps> = ({
  lang,
  onOpenConnect,
  onOpenWhitelist,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-xs font-semibold text-red-500 uppercase tracking-wider font-mono">
          CITY BLUEPRINT & ECOSYSTEM
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-arabic">
          {lang === 'ar' ? 'عالم مدينة Hunters Life' : 'Welcome to Hunters Life City'}
        </h1>
        <p className="text-sm text-neutral-400 max-w-2xl mx-auto font-arabic">
          {lang === 'ar'
            ? 'مدينة متكاملة المعالم، مبنية على التوازن الدقيق بين السلطات الأمنية، الاقتصاد الحر، والسيناريوهات الدرامية العميقة.'
            : 'A meticulously balanced city framework harmonizing law enforcement, free enterprise, and deep character storytelling.'}
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-950/40 border border-blue-900/40 text-blue-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white font-arabic">
            {lang === 'ar' ? 'القطاع الأمني والعدلي' : 'Law & Justice Sector'}
          </h2>
          <p className="text-xs text-neutral-300 leading-relaxed font-arabic">
            {lang === 'ar'
              ? 'منظومة شرطة LSPD المجهزة بأحدث أنظمة الرادارات والمحاكم والتحقيقات الجنائية لكشف مسارح الجريمة.'
              : 'State-of-the-art police CAD/MDT, forensic ballistic labs, and official department of justice courts.'}
          </p>
        </div>

        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-900/40 text-red-500 flex items-center justify-center">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white font-arabic">
            {lang === 'ar' ? 'الرعاية الطبية والإسعاف' : 'Emergency Medical (EMS)'}
          </h2>
          <p className="text-xs text-neutral-300 leading-relaxed font-arabic">
            {lang === 'ar'
              ? 'مستشفيات مجهزة بكوادر متخصصة، إنعاش متقدم، وإسعاف جوي مروحي متاح لكافة حوادث المدينة على مدار الساعة.'
              : 'Comprehensive trauma care, intensive surgery simulation, and high-altitude air rescue ambulances.'}
          </p>
        </div>

        <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-900/40 text-amber-500 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white font-arabic">
            {lang === 'ar' ? 'التجارة وورش السيارات' : 'Customs & Commerce'}
          </h2>
          <p className="text-xs text-neutral-300 leading-relaxed font-arabic">
            {lang === 'ar'
              ? 'ورش كاستمز لتعديل المحركات والشكمانات، مع إمكانية امتلاك المطاعم، المقاهي، والشركات الخاصة.'
              : 'Performance tuning, custom engine swaps, paint booths, and civilian entrepreneurship franchises.'}
          </p>
        </div>
      </div>

      {/* City Stats / Quick Connect Banner */}
      <div className="p-8 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-850 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-start">
          <h3 className="text-2xl font-black text-white font-arabic">
            {lang === 'ar' ? 'جاهز لبدء مغامرتك في Hunters Life؟' : 'Ready to start your story in Hunters Life?'}
          </h3>
          <p className="text-xs text-neutral-400 font-arabic max-w-lg">
            {lang === 'ar'
              ? 'انضم إلى السيرفر الآن، وتعرف على مجتمع سعودي متكامل يقدر متعة الرول بلاي الجاد.'
              : 'Join the server today and experience genuine roleplay with thousands of dedicated members.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenConnect}
            className="py-3 px-6 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{lang === 'ar' ? 'اتصال مباشر بالسيرفر' : 'Connect to Server'}</span>
          </button>
          <button
            onClick={onOpenWhitelist}
            className="py-3 px-6 bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
          >
            {lang === 'ar' ? 'تقديم وايت لست' : 'Apply Whitelist'}
          </button>
        </div>
      </div>
    </div>
  );
};
