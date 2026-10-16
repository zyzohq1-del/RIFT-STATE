import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';
import { Language, ServerStats } from '../types';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  stats: ServerStats;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  isOpen,
  onClose,
  lang,
  stats,
}) => {
  const [copiedConsole, setCopiedConsole] = useState(false);
  const [copiedCfx, setCopiedCfx] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: 'console' | 'cfx') => {
    navigator.clipboard.writeText(text);
    if (type === 'console') {
      setCopiedConsole(true);
      setTimeout(() => setCopiedConsole(false), 2000);
    } else {
      setCopiedCfx(true);
      setTimeout(() => setCopiedCfx(false), 2000);
    }
  };

  const handleDirectLaunch = async () => {
    try {
      const res = await fetch('/api/server/join');
      if (res.ok) {
        const data = await res.json();
        if (data.joinUrl) {
          window.location.href = data.joinUrl;
          return;
        }
      }
    } catch (e) {
      // Fallback
    }
    window.location.href = 'fivem://connect/play.hlcrp.net:30120';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-lg font-bold text-white font-arabic">
              {lang === 'ar' ? 'الاتصال المباشر بسيرفر HLCRP' : 'Direct Connect to HLCRP'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5">
          {/* Quick launch button */}
          <div>
            <button
              onClick={handleDirectLaunch}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-neutral-950 font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تشغيل اللعبة والدخول التلقائي (FiveM)' : 'Launch & Auto-Connect in FiveM'}</span>
            </button>
            <p className="text-xs text-neutral-400 text-center mt-2">
              {lang === 'ar' ? 'يتطلب تثبيت FiveM على جهازك للتشغيل الفوري' : 'Requires FiveM client installed on your PC'}
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-neutral-800"></div>
            <span className="flex-shrink mx-4 text-xs text-neutral-500 font-medium">
              {lang === 'ar' ? 'أو عبر كونسول F8' : 'OR VIA F8 CONSOLE'}
            </span>
            <div className="flex-grow border-t border-neutral-800"></div>
          </div>

          {/* F8 Console Command Box */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'ar' ? 'أمر الاتصال المباشر (Console Command)' : 'Direct Console Command'}</span>
            </label>
            <div className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-sm">
              <span className="text-neutral-200 select-all">{stats.ip}</span>
              <button
                onClick={() => copyToClipboard(stats.ip, 'console')}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-sans px-2.5 py-1 bg-neutral-900 border border-neutral-700/60 rounded hover:bg-neutral-800 transition-colors"
              >
                {copiedConsole ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CFX URL Box */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-300">
              {lang === 'ar' ? 'رابط السيرفر الرسمي (CFX Link)' : 'Official CFX Join Link'}
            </label>
            <div className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-sm">
              <span className="text-neutral-300 truncate select-all">{stats.cfxUrl}</span>
              <button
                onClick={() => copyToClipboard(stats.cfxUrl, 'cfx')}
                className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white font-sans px-2.5 py-1 bg-neutral-900 border border-neutral-700/60 rounded hover:bg-neutral-800 transition-colors"
              >
                {copiedCfx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick instructions steps */}
          <div className="p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-lg text-xs text-neutral-400 space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ar' ? 'طريقة الدخول بخطوات سهلة:' : 'Simple Connection Guide:'}</span>
            </div>
            <p>1. {lang === 'ar' ? 'شغّل برنامج FiveM على حاسوبك' : 'Open FiveM on your computer'}</p>
            <p>2. {lang === 'ar' ? 'اضغط على زر F8 في لوحة المفاتيح لفتح الكونسول' : 'Press F8 on your keyboard to open the console'}</p>
            <p>3. {lang === 'ar' ? 'الصق أمر الاتصال واضغط Enter وسيبدأ التحميل مباشرة' : 'Paste the connect command and hit Enter to join'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
