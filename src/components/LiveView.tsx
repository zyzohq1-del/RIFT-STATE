import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Radio,
  Users,
  ExternalLink,
  X,
  RefreshCw,
  Search,
  CheckCircle2,
  Tv
} from 'lucide-react';
import { LiveStreamer, NavigationTab } from '../types';

interface LiveViewProps {
  onNavigate?: (tab: NavigationTab) => void;
  lang?: string;
}

export const LiveView: React.FC<LiveViewProps> = ({ onNavigate }) => {
  const [streamers, setStreamers] = useState<LiveStreamer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'twitch' | 'kick' | 'youtube'>('all');

  // Active Stream for Player Modal
  const [activeStream, setActiveStream] = useState<LiveStreamer | null>(null);

  // Status feedback toast
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const fetchStreams = async () => {
    try {
      const res = await fetch('/api/streams');
      if (res.ok) {
        const data = await res.json();
        if (data.streams && Array.isArray(data.streams)) {
          setStreamers(data.streams);
          if (activeStream) {
            const updated = data.streams.find((s: LiveStreamer) => s.id === activeStream.id);
            if (updated) setActiveStream(updated);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch streams', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
    const interval = setInterval(fetchStreams, 15000);
    return () => clearInterval(interval);
  }, [activeStream?.id]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/streams/check', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.streams) setStreamers(data.streams);
        showFeedback('تم فحص وتحديث بيانات البثوث الحية والمشاهدين بنجاح!');
      } else {
        await fetchStreams();
        showFeedback('تم تحديث القائمة بنجاح!');
      }
    } catch {
      await fetchStreams();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtered streamers for the bottom section
  const filteredCreators = streamers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.channelName && c.channelName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = platformFilter === 'all' || c.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  // Online Streamers
  const onlineStreamers = streamers.filter((s) => s.isOnline);
  const topStream = onlineStreamers[0] || null;

  return (
    <div className="min-h-screen bg-black text-neutral-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-900/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-20 right-10 w-2 h-2 rounded-full bg-purple-400 blur-[1px] animate-pulse" />
      <div className="absolute top-72 left-8 w-3 h-3 rounded-full bg-emerald-400/50 blur-[2px] animate-ping" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Top Header & Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-900 pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              title="تحديث البثوث والمشاهدين"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
              <span>{isRefreshing ? 'جاري الفحص...' : 'تحديث البثوث الآن'}</span>
            </button>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>العودة للرئيسية (Back to Home)</span>
            </button>
          )}
        </div>

        {/* Action feedback toast */}
        {actionMessage && (
          <div
            className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between gap-3 animate-fadeIn ${
              actionMessage.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-red-950/80 border-red-500/50 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-neutral-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. أول شيء فوق: البثوث المباشرة الآن (Live Streams Broadcast Top Section) */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-purple-900/30 pb-4">
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-bold">{onlineStreamers.length} بث مباشر الآن</span>
              <span>•</span>
              <span>
                {onlineStreamers.reduce((acc, s) => acc + (s.viewers || 0), 0).toLocaleString()} مشاهد حي
              </span>
            </div>

            <div className="text-right space-y-1">
              <div className="flex items-center justify-end gap-2.5">
                <span className="px-2 py-0.5 rounded-md bg-red-600 text-[10px] font-black uppercase text-white tracking-widest animate-pulse">
                  LIVE
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-arabic tracking-tight">
                  البثوث المباشرة الآن (Live Streams)
                </h2>
                <Radio className="w-6 h-6 text-red-500 animate-pulse" />
              </div>
              <p className="text-xs text-neutral-400">
                بثوث صناع المحتوى المعتمدين في السيرفر تتحدث فورياً بالمشاهدين والعنوان الأصلي.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-neutral-500 font-mono text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
              جاري فحص حالة البثوث المباشرة...
            </div>
          ) : onlineStreamers.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-neutral-800 bg-neutral-950/60 text-center space-y-3">
              <Radio className="w-12 h-12 text-neutral-600 mx-auto" />
              <h3 className="text-base font-bold text-neutral-200">لا يوجد بث مباشر نشط حالياً</h3>
              <p className="text-xs text-neutral-400 max-w-lg mx-auto">
                بانتظار بدء أي بث من قائمة صناع المحتوى المعتمدين في الأسفل. بمجرد أن يفك أي صانع محتوى بثاً على Kick أو Twitch أو YouTube، سيظهر بثه فوراً هنا في الأعلى مع اسمه وعنوان بثه وعدد المشاهدين!
              </p>
            </div>
          ) : (
            /* Top Live Showcase: Hero & Live Cards */
            <div className="space-y-6">
              {/* Highlight Hero Card for the Top Live Streamer */}
              {topStream && (
                <div className="relative rounded-3xl bg-gradient-to-r from-purple-950/90 via-neutral-900/90 to-purple-950/90 border border-purple-500/60 p-6 sm:p-8 shadow-2xl shadow-purple-950/50 overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-right">
                    {/* Left: Quick Actions & Live Watch */}
                    <div className="flex items-center flex-wrap gap-3 order-2 lg:order-1">
                      <button
                        onClick={() => setActiveStream(topStream)}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-purple-600/30 transition-transform hover:scale-105 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>مشاهدة البث الآن (WATCH LIVE)</span>
                      </button>

                      <a
                        href={topStream.channelUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>فتح القناة الرسمية</span>
                      </a>
                    </div>

                    {/* Right: Streamer Info & Title & Viewers */}
                    <div className="flex items-center gap-5 order-1 lg:order-2 w-full lg:w-auto justify-end">
                      <div className="space-y-2 text-right">
                        {/* Live Badges */}
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {/* عدد المشاهدين */}
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-900/60 border border-purple-700 text-purple-200 text-xs font-mono font-bold">
                            <Users className="w-3.5 h-3.5 text-purple-400" />
                            <span>{topStream.viewers.toLocaleString()} مشاهد حي</span>
                          </div>

                          {/* المنصة */}
                          <span className="px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-700 text-[10px] font-mono font-bold uppercase text-purple-300">
                            {topStream.platform}
                          </span>

                          {/* مؤشر البث */}
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-400 text-xs font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>بث مباشر الآن</span>
                          </div>
                        </div>

                        {/* اسم صانع المحتوى */}
                        <h3 className="text-xl sm:text-2xl font-black text-white font-arabic">
                          {topStream.name}
                        </h3>

                        {/* عنوان بثه البارز */}
                        <div className="p-3 rounded-2xl bg-black/60 border border-purple-500/30 max-w-xl">
                          <p className="text-sm font-bold text-purple-200 font-arabic leading-relaxed">
                            {topStream.title || `🔴 [سيرفر فايف إم] ${topStream.name} بث مباشر الآن!`}
                          </p>
                        </div>
                      </div>

                      {/* صورة صانع المحتوى */}
                      <div className="relative shrink-0">
                        <img
                          src={topStream.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&h=200&q=80'}
                          alt={topStream.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-purple-500 shadow-xl"
                        />
                        <span className="absolute -bottom-2 -left-2 px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] uppercase tracking-wider animate-bounce">
                          LIVE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Active Streams if more than 1 */}
              {onlineStreamers.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {onlineStreamers.slice(1).map((streamer) => (
                    <div
                      key={streamer.id}
                      className="p-5 rounded-2xl bg-neutral-950 border border-purple-800/40 hover:border-purple-500/70 transition-all flex items-start justify-between gap-4"
                    >
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => setActiveStream(streamer)}
                          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>مشاهدة</span>
                        </button>
                        <a
                          href={streamer.channelUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[10px] text-center border border-neutral-800"
                        >
                          القناة
                        </a>
                      </div>

                      <div className="space-y-1.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 uppercase">
                            {streamer.platform}
                          </span>
                          <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1">
                            <Users className="w-3 h-3 text-purple-400" />
                            {streamer.viewers.toLocaleString()} مشاهد
                          </span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <h4 className="font-bold text-white text-sm">{streamer.name}</h4>
                        </div>
                        <p className="text-xs text-neutral-300 font-medium line-clamp-1">{streamer.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 2. تحته على طول: قائمة صناع المحتوى المعتمدين كاملة (Creators List) */}
        {/* ========================================================================= */}
        <section className="space-y-6 pt-6 border-t border-neutral-900">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter & Search Bar */}
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {(['all', 'twitch', 'kick', 'youtube'] as const).map((pf) => (
                <button
                  key={pf}
                  onClick={() => setPlatformFilter(pf)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase transition-colors cursor-pointer ${
                    platformFilter === pf
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {pf === 'all' ? 'الكل (All)' : pf}
                </button>
              ))}

              {/* Search input */}
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث عن صانع محتوى..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Section Header */}
            <div className="text-right space-y-1 w-full sm:w-auto">
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs font-mono text-purple-400 font-bold">
                  ({streamers.length} صانع محتوى مسجل)
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-arabic">
                  قائمة صناع المحتوى (Content Creators)
                </h3>
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-xs text-neutral-400">
                القائمة المعتمدة لصناع المحتوى في السيرفر مع متابعة البثوث وقنواتهم الرسمية.
              </p>
            </div>
          </div>

          {/* Creators Grid */}
          {filteredCreators.length === 0 ? (
            <div className="p-10 rounded-3xl border border-dashed border-neutral-800 bg-neutral-950/60 text-center space-y-2">
              <Users className="w-10 h-10 text-neutral-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">لا يوجد صناع محتوى مسجلين حالياً</h4>
              <p className="text-xs text-neutral-500">
                يتم اعتماد وإضافة صناع المحتوى من خلال لوحة إدارة الإدارة (Admin Panel).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCreators.map((creator) => (
                <div
                  key={creator.id}
                  className={`p-5 rounded-2xl bg-neutral-950 border transition-all flex flex-col justify-between space-y-4 ${
                    creator.isOnline
                      ? 'border-purple-500/60 shadow-lg shadow-purple-950/30'
                      : 'border-neutral-900 hover:border-neutral-800'
                  }`}
                >
                  {/* Top card bar: status + avatar + name */}
                  <div className="flex items-start justify-between gap-3">
                    <a
                      href={creator.channelUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-800 flex items-center gap-1.5 text-xs"
                      title="فتح القناة"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>القناة</span>
                    </a>

                    {/* Creator Identity */}
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-900/50 uppercase">
                            {creator.platform}
                          </span>
                          <h4 className="font-bold text-white text-sm">{creator.name}</h4>
                        </div>
                        <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                          @{creator.channelName || creator.name}
                        </p>
                      </div>
                      <img
                        src={creator.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&h=150&q=80'}
                        alt={creator.name}
                        className="w-11 h-11 rounded-xl object-cover border border-purple-500/30"
                      />
                    </div>
                  </div>

                  {/* Title & Stats */}
                  <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-850 text-right space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-purple-300">
                        {creator.isOnline ? `${creator.viewers.toLocaleString()} مشاهد` : 'غير متصل'}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className={`w-2 h-2 rounded-full ${creator.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
                        <span className={creator.isOnline ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                          {creator.isOnline ? 'مباشر الآن (LIVE)' : 'غير متصل (OFFLINE)'}
                        </span>
                      </div>
                    </div>
                    {creator.isOnline && creator.title && (
                      <p className="text-[11px] text-neutral-300 line-clamp-1 font-arabic">
                        {creator.title}
                      </p>
                    )}
                  </div>

                  {/* Bottom: Action */}
                  <div className="pt-2 border-t border-neutral-900 flex items-center justify-between gap-2">
                    {creator.isOnline ? (
                      <button
                        onClick={() => setActiveStream(creator)}
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white cursor-pointer transition-all shadow-md shadow-purple-600/30"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>مشاهدة البث الآن</span>
                      </button>
                    ) : (
                      <a
                        href={creator.channelUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 rounded-xl text-xs font-medium text-center bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
                      >
                        زيارة القناة الرسمية
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ========================================================================= */}
      {/* Stream Viewer Modal */}
      {/* ========================================================================= */}
      {activeStream && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-purple-500/50 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative text-right font-arabic">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveStream(null)}
                className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="space-y-0.5 text-right">
                  <h3 className="text-base font-bold text-white">{activeStream.name} - بث مباشر</h3>
                  <div className="flex items-center justify-end gap-2 text-xs font-mono text-purple-300">
                    <span>{activeStream.viewers.toLocaleString()} مشاهد</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
                <img
                  src={activeStream.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&h=150&q=80'}
                  alt={activeStream.name}
                  className="w-10 h-10 rounded-xl object-cover border border-purple-500/40"
                />
              </div>
            </div>

            <div className="aspect-video w-full rounded-2xl bg-neutral-900 flex flex-col items-center justify-center text-center p-8 space-y-4 border border-neutral-800">
              <Radio className="w-14 h-14 text-purple-400 animate-pulse" />
              <div className="space-y-1">
                <div className="text-base font-bold text-white max-w-md">{activeStream.title}</div>
                <div className="text-xs text-neutral-400">
                  البث متاح للمشاهدة المباشرة على منصة {activeStream.platform.toUpperCase()}
                </div>
              </div>
              <a
                href={activeStream.channelUrl}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-purple-600/30"
              >
                <span>فتح البث الكامل على {activeStream.platform.toUpperCase()}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
