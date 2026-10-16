import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, ArrowLeft } from 'lucide-react';
import { NavigationTab } from '../types';

interface FaqViewProps {
  onNavigate?: (tab: NavigationTab) => void;
  lang?: string;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category?: string;
  sort_order?: number;
}

export const FaqView: React.FC<FaqViewProps> = ({ onNavigate }) => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch('/api/faq');
        if (res.ok) {
          const data = await res.json();
          if (data.faqs && Array.isArray(data.faqs)) {
            setFaqs(data.faqs);
          }
        }
      } catch (e) {
        // network issue fallback
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  return (
    <div className="min-h-screen bg-black text-neutral-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-900/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
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

        <div className="text-center space-y-4">
          <div className="inline-flex flex-col items-center gap-1">
            <span className="text-xs font-mono font-bold text-purple-400 tracking-widest uppercase">
              FAQ
            </span>
            <div className="w-8 h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white font-display uppercase tracking-wider drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            FREQUENTLY ASKED QUESTIONS
          </h1>

          <p className="text-neutral-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Everything you need to know about joining and playing in Rift State.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-neutral-500 font-mono">Loading FAQs...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="max-w-2xl mx-auto p-12 rounded-3xl border border-dashed border-neutral-800/90 bg-neutral-950/40 text-center space-y-3 backdrop-blur-md">
            <HelpCircle className="w-10 h-10 text-neutral-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">لا توجد أسئلة شائعة مضافة حالياً</h3>
            <p className="text-xs text-neutral-400">
              يمكن للإدارة إضافة وتعديل الأسئلة الشائعة من لوحة تحكم الأونر في أي وقت.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.id || idx}
                  className="rounded-2xl bg-neutral-900/70 border border-neutral-800 overflow-hidden transition-colors hover:border-purple-500/40"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-850/60"
                  >
                    <div className="flex items-center gap-3">
                      {faq.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/60 text-purple-300 border border-purple-800/40">
                          {faq.category}
                        </span>
                      )}
                      <span className="font-bold text-sm sm:text-base text-white">{faq.question}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-purple-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
