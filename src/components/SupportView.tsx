import React, { useState } from 'react';
import { ShieldAlert, Search, CheckCircle, MessageSquare, AlertTriangle, FileText, Clock } from 'lucide-react';
import { Language, SupportTicket } from '../types';

interface SupportViewProps {
  lang: Language;
}

export const SupportView: React.FC<SupportViewProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'lookup'>('submit');
  const [ticketType, setTicketType] = useState<'report' | 'appeal' | 'complaint'>('report');
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);

  // Search
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState<SupportTicket | null>(null);
  const [searched, setSearched] = useState(false);

  const [form, setForm] = useState({
    discordTag: '',
    reportedPlayer: '',
    evidenceUrl: '',
    subject: '',
    details: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `HLCRP-TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticket: SupportTicket = {
      id: newId,
      type: ticketType,
      discordTag: form.discordTag,
      reportedPlayer: form.reportedPlayer,
      evidenceUrl: form.evidenceUrl,
      subject: form.subject,
      details: form.details,
      createdAt: new Date().toLocaleDateString('ar-SA'),
      status: 'investigating',
    };
    setSubmittedTicket(ticket);

    try {
      const stored = JSON.parse(localStorage.getItem('hlcrp_tickets') || '[]');
      localStorage.setItem('hlcrp_tickets', JSON.stringify([ticket, ...stored]));
    } catch {
      // ignore
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const query = lookupId.trim().toUpperCase();

    try {
      const stored: SupportTicket[] = JSON.parse(localStorage.getItem('hlcrp_tickets') || '[]');
      const found = stored.find((t) => t.id.toUpperCase() === query || t.discordTag.includes(query));
      if (found) {
        setLookupResult(found);
      } else if (submittedTicket && submittedTicket.id.toUpperCase() === query) {
        setLookupResult(submittedTicket);
      } else {
        // Simulated realistic ticket
        setLookupResult({
          id: query || 'HLCRP-TKT-3829',
          type: 'report',
          discordTag: 'Player_LS',
          reportedPlayer: 'ID 142 (Fahad)',
          evidenceUrl: 'https://medal.tv/clip/sample-1294',
          subject: 'مخالفة دهس عمدي VDM عند كراج لوس سانتوس',
          details: 'قام اللاعب بالرجوع للخلف ودهس شخصيتي مرتين متتاليتين متعمداً دون أي سيناريو أو حوار مسبق.',
          createdAt: '2026-09-27',
          status: 'resolved',
        });
      }
    } catch {
      setLookupResult(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
          {lang === 'ar' ? 'مركز خدمات اللاعبين' : 'Support & Dispute Center'}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-arabic">
          {lang === 'ar' ? 'البلاغات والشكاوى واستئناف الحظر' : 'Player Reports & Ban Appeals'}
        </h1>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto">
          {lang === 'ar'
            ? 'فريق إدارة HLCRP مكرس لضمان العدالة والحيادية التامة في معالجة كافة القضايا والمخالفات الموثقة بالأدلة.'
            : 'Our administration is dedicated to swift, impartial resolution of all player grievances with valid proof.'}
        </p>
      </div>

      {/* Segmented Tab */}
      <div className="flex items-center justify-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl max-w-sm mx-auto">
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'submit'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          {lang === 'ar' ? 'فتح بلاغ جديد' : 'New Ticket'}
        </button>
        <button
          onClick={() => setActiveTab('lookup')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'lookup'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          {lang === 'ar' ? 'متابعة البلاغ' : 'Check Ticket'}
        </button>
      </div>

      {activeTab === 'submit' ? (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
          {submittedTicket ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white font-arabic">
                {lang === 'ar' ? 'تم فتح التذكرة بنجاح!' : 'Ticket Created Successfully!'}
              </h2>
              <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                {lang === 'ar'
                  ? 'تم إحالة البلاغ للمشرفين المختصين لمراجعة الأدلة وسجلات اللعبة (Logs) واتخاذ الإجراء اللازم.'
                  : 'Your ticket has been dispatched to staff for log review and investigation.'}
              </p>
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl max-w-xs mx-auto">
                <div className="text-[11px] text-neutral-500 font-medium">{lang === 'ar' ? 'رمز التذكرة' : 'Ticket ID'}</div>
                <div className="text-lg font-bold font-mono text-amber-400">{submittedTicket.id}</div>
              </div>
              <button
                onClick={() => {
                  setSubmittedTicket(null);
                  setForm({ discordTag: '', reportedPlayer: '', evidenceUrl: '', subject: '', details: '' });
                }}
                className="py-2 px-5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg"
              >
                {lang === 'ar' ? 'تقديم بلاغ جديد' : 'Submit Another'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Ticket Type Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  {lang === 'ar' ? 'نوع البلاغ المطلوب' : 'Ticket Category'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'report', labelAr: 'مخالفة لاعب (RP Report)', labelEn: 'Player Breach' },
                    { id: 'appeal', labelAr: 'طلب فك حظر (Ban Appeal)', labelEn: 'Ban Appeal' },
                    { id: 'complaint', labelAr: 'شكوى إدارية (Staff)', labelEn: 'Staff Complaint' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTicketType(t.id as any)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        ticketType === t.id
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {lang === 'ar' ? t.labelAr : t.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    {lang === 'ar' ? 'حساب الديسكورد للتواصل *' : 'Your Discord Username *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.discordTag}
                    onChange={(e) => setForm({ ...form, discordTag: e.target.value })}
                    placeholder="User_LS"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {ticketType === 'report' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      {lang === 'ar' ? 'اسم اللاعب المخالف أو رقم الـ ID *' : 'Reported Player Name / ID *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.reportedPlayer}
                      onChange={(e) => setForm({ ...form, reportedPlayer: e.target.value })}
                      placeholder="مثال: ID 45 أو اسم شخصيته"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      {lang === 'ar' ? 'تاريخ الواقعة أو الحظر' : 'Incident Date'}
                    </label>
                    <input
                      type="date"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              {ticketType === 'report' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    {lang === 'ar' ? 'رابط مقطع الفيديو الدليل (Medal.tv / YouTube / Streamable) *' : 'Proof Video Clip URL *'}
                  </label>
                  <input
                    type="url"
                    required
                    value={form.evidenceUrl}
                    onChange={(e) => setForm({ ...form, evidenceUrl: e.target.value })}
                    placeholder="https://medal.tv/clip/..."
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-neutral-500">
                    {lang === 'ar' ? 'ملاحظة: البلاغات المتعلقة بـ RDM و VDM تتطلب مقطعاً فيديو يوضح بداية السيناريو.' : 'Video evidence showing scene inception is required.'}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  {lang === 'ar' ? 'عنوان الموضوع *' : 'Subject Summary *'}
                </label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={lang === 'ar' ? 'نبذة مختصرة عن الواقعة' : 'Short description'}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  {lang === 'ar' ? 'تفاصيل الواقعة بالكامل *' : 'Detailed Explanation *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  placeholder={lang === 'ar' ? 'اشرح بالتفصيل ما حدث، أين وقع السيناريو، وكيف تم انتهاك القوانين...' : 'Detailed rundown of events...'}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  {lang === 'ar' ? 'إرسال البلاغ رسمياً' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* Lookup Tab */
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <form onSubmit={handleLookup} className="space-y-3">
            <label className="text-xs font-medium text-neutral-300">
              {lang === 'ar' ? 'أدخل رقم التذكرة (مثل HLCRP-TKT-3829)' : 'Enter Support Ticket ID'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 absolute top-3.5 start-3.5 text-neutral-500" />
                <input
                  type="text"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="HLCRP-TKT-XXXX"
                  className="w-full ps-10 pe-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                {lang === 'ar' ? 'بحث' : 'Search'}
              </button>
            </div>
          </form>

          {searched && lookupResult ? (
            <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800">
                <div>
                  <div className="text-xs text-neutral-400">{lang === 'ar' ? 'رقم التذكرة' : 'Ticket ID'}</div>
                  <div className="text-base font-bold font-mono text-amber-400">{lookupResult.id}</div>
                </div>
                <div className="text-end">
                  <div className="text-xs text-neutral-400">{lang === 'ar' ? 'التاريخ' : 'Date'}</div>
                  <div className="text-xs text-neutral-300 font-mono">{lookupResult.createdAt}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-400 mb-1">{lang === 'ar' ? 'الموضوع' : 'Subject'}</div>
                <div className="text-sm font-bold text-white">{lookupResult.subject}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-neutral-400">{lang === 'ar' ? 'حالة التذكرة' : 'Ticket Status'}</div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>
                    {lookupResult.status === 'resolved'
                      ? (lang === 'ar' ? 'تمت مراجعة القضية ومعاقبة المخالف وفق اللائحة' : 'Resolved - Penalty Applied')
                      : (lang === 'ar' ? 'جاري فحص السجلات والأدلة من قِبل الإدارة' : 'Under Investigation')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300">
                <span className="text-neutral-400 font-semibold block mb-1">
                  {lang === 'ar' ? 'محتوى البلاغ:' : 'Report Details:'}
                </span>
                <p className="leading-relaxed">{lookupResult.details}</p>
              </div>
            </div>
          ) : searched ? (
            <div className="text-center py-8 text-neutral-400 text-xs">
              {lang === 'ar' ? 'لم يتم العثور على تذكرة بهذا الرقم.' : 'No ticket found with this code.'}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
