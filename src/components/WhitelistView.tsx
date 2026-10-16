import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  ExternalLink, 
  Server, 
  Sparkles, 
  Check, 
  Send,
  HelpCircle,
  Users,
  Clock,
  RotateCcw,
  XCircle
} from 'lucide-react';
import { Language, GameServer } from '../types';

interface AuthStatus {
  discord: {
    id: string;
    username: string;
    global_name?: string;
    email?: string;
    avatar?: string;
    roles?: string[];
  } | null;
  steam: {
    id: string;
    steamHex?: string;
    personaName?: string;
    avatar?: string;
  } | null;
  whitelist: {
    approved: boolean;
    approvedAt: string;
    roleGiven: boolean;
    characterName?: string;
  } | null;
  isOwner?: boolean;
}

interface DynamicQuestion {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctAnswerId?: string;
}

interface WhitelistViewProps {
  lang: Language;
}

export const WhitelistView: React.FC<WhitelistViewProps> = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    discord: null,
    steam: null,
    whitelist: null,
  });
  const [step, setStep] = useState<number>(3); // 1: Discord, 2: Steam, 3: Choose Server, 4: Roleplay Test
  const [selectedServer, setSelectedServer] = useState<string>('srv-1');
  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [characterName, setCharacterName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [appStatus, setAppStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [applicationData, setApplicationData] = useState<any>(null);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const err = p.get('error');
    if (err) {
      if (err === 'discord_failed') {
        setAuthError('تعذر تسجيل الدخول بالديسكورد. تأكد من إضافة رابط Redirect URI الصحيح في Discord Developer Portal.');
      } else if (err === 'access_denied') {
        setAuthError('تم إلغاء تسجيل الدخول أو رفض الإذن من طرف المستخدم في ديسكورد.');
      } else {
        setAuthError(`تنبيه مصادقة ديسكورد: ${err}`);
      }
    }
  }, []);

  const [servers, setServers] = useState<GameServer[]>([
    {
      id: 'srv-1',
      name: 'Rift State Main Server #1 (الحياة الواقعية)',
      cfxUrl: 'https://cfx.re/join/riftstate',
      ip: 'play.riftstate.net',
      port: 30120,
      onlinePlayers: 47,
      maxPlayers: 48,
      status: 'online',
      requiresWhitelist: true,
      description: 'سيرفر الرول بلاي الأساسي — سيرفر رسمي يتطلب اجتياز اختبار الرول بلاي.'
    }
  ]);

  const fetchApplicationStatus = async () => {
    try {
      const res = await fetch('/api/whitelist/status');
      if (res.ok) {
        const data = await res.json();
        if (data.status && data.status !== 'none') {
          setAppStatus(data.status);
          setApplicationData(data.application);
          setSubmitSuccess(true);
        }
      }
    } catch (e) {}
  };

  const fetchAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data = await res.json();
        setAuthStatus(data);
        if (data.discord && data.steam) {
          // If both linked, proceed to server selection step 3
          setStep(3);
        } else if (data.discord && !data.steam) {
          setStep(2);
        } else {
          setStep(1);
        }
      }
    } catch (e) {
      // Fallback
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/whitelist/questions');
      if (res.ok) {
        const json = await res.json();
        if (json.questions) {
          setQuestions(json.questions);
        }
      }
    } catch (e) {
      // Fallback
    }
  };

  useEffect(() => {
    fetchAuthStatus();
    fetchQuestions();
    fetchApplicationStatus();
  }, []);

  // Poll status while application is pending
  useEffect(() => {
    if (appStatus !== 'pending') return;
    const interval = setInterval(() => {
      fetchApplicationStatus();
    }, 4000);
    return () => clearInterval(interval);
  }, [appStatus]);

  const handleSimulateDiscord = async () => {
    try {
      await fetch('/api/auth/mock-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'discord', username: '4_3y' }),
      });
      fetchAuthStatus();
    } catch (e) {}
  };

  const handleSimulateSteam = async () => {
    try {
      await fetch('/api/auth/mock-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'steam', username: '4_3y_Steam' }),
      });
      fetchAuthStatus();
    } catch (e) {}
  };

  const handleResetApplication = async () => {
    try {
      await fetch('/api/whitelist/reset-my-app', { method: 'POST' });
      setAppStatus('none');
      setSubmitSuccess(false);
      setApplicationData(null);
      setSelectedAnswers({});
      setCharacterName('');
    } catch (e) {}
  };

  const handleSubmitExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/whitelist/pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: characterName || authStatus.discord?.username || 'Citizen',
          answers: selectedAnswers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmitSuccess(true);
        setAppStatus('pending');
        setApplicationData(data.application || {
          characterName: characterName || authStatus.discord?.username || 'Citizen',
          status: 'pending',
          score: data.score,
        });
        setQuizScore(data.score || { score: questions.length, total: questions.length, passed: true });
        fetchAuthStatus();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const isDiscordLinked = Boolean(authStatus.discord);
  const isSteamLinked = Boolean(authStatus.steam);

  return (
    <div className="min-h-screen bg-black text-neutral-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans font-arabic">
      {/* Ambient background particles & purple glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-purple-900/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-20 right-1/4 w-3 h-3 rounded-full bg-purple-500 blur-[2px] opacity-70 animate-pulse" />

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        {/* Success Notifications matching Screenshot 3 */}
        <div className="space-y-3">
          {isSteamLinked && (
            <div className="w-full p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60 text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>تم ربط حساب ستيم</span>
            </div>
          )}

          {isDiscordLinked && isSteamLinked && (
            <div className="w-full p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60 text-emerald-400 text-xs sm:text-sm font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تم ربط حسابات ديسكورد وستيم</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-500 font-normal">
                {authStatus.discord?.username} • {authStatus.steam?.steamHex || 'steam:11000010abc'}
              </span>
            </div>
          )}
        </div>

        {/* Title matching Screenshot 3: إعداد الحساب */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black text-white font-arabic tracking-wide drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            إعداد الحساب
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base font-arabic">
            أكمل هذه الخطوات للانضمام
          </p>
        </div>

        {/* 4-Step Stepper matching Screenshot 3 */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 py-4">
          {/* Step 1: ربط ديسكورد */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                isDiscordLinked
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_#9333ea]'
                  : step === 1
                  ? 'border-2 border-purple-500 bg-purple-950/50 text-purple-300'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-500'
              }`}
            >
              {isDiscordLinked ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
            </div>
            <span className="text-[11px] font-bold text-neutral-300">ربط ديسكورد</span>
          </div>

          <div className={`w-8 sm:w-16 h-0.5 ${isDiscordLinked ? 'bg-purple-600' : 'bg-neutral-800'}`} />

          {/* Step 2: ربط ستيم */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                isSteamLinked
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_#9333ea]'
                  : step === 2
                  ? 'border-2 border-purple-500 bg-purple-950/50 text-purple-300'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-500'
              }`}
            >
              {isSteamLinked ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
            </div>
            <span className="text-[11px] font-bold text-neutral-300">ربط ستيم</span>
          </div>

          <div className={`w-8 sm:w-16 h-0.5 ${isSteamLinked ? 'bg-purple-600' : 'bg-neutral-800'}`} />

          {/* Step 3: اختر سيرفر */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step === 3
                  ? 'border-2 border-purple-500 bg-purple-950/50 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                  : step > 3
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_#9333ea]'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-500'
              }`}
            >
              {step > 3 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
            </div>
            <span className={`text-[11px] font-bold ${step === 3 ? 'text-purple-300' : 'text-neutral-300'}`}>
              اختر سيرفر
            </span>
          </div>

          <div className={`w-8 sm:w-16 h-0.5 ${step >= 4 ? 'bg-purple-600' : 'bg-neutral-800'}`} />

          {/* Step 4: الاختبار */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step === 4
                  ? 'border-2 border-purple-500 bg-purple-950/50 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                  : submitSuccess
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_#9333ea]'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-500'
              }`}
            >
              {submitSuccess ? <Check className="w-4 h-4 stroke-[3]" /> : '4'}
            </div>
            <span className="text-[11px] font-bold text-neutral-300">الاختبار</span>
          </div>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-bold flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              onClick={() => setAuthError(null)}
              className="text-neutral-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* STEP 1: Connect Discord */}
        {!isDiscordLinked && (
          <div className="max-w-xl mx-auto p-8 rounded-3xl bg-neutral-950/80 border border-neutral-900 text-center space-y-6 shadow-2xl backdrop-blur-md">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white font-arabic">الخطوة 1: ربط حساب ديسكورد</h2>
              <p className="text-xs text-neutral-400">
                يلزم ربط حساب الديسكورد للتأكد من رتبتك واستلام إشعارات القبول والمزامنة الصوتية.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="/auth/discord"
                className="w-full py-3.5 px-6 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#5865F2]/25 transition-transform hover:scale-105 cursor-pointer"
              >
                <span>تسجيل الدخول عبر Discord الرسمي</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={handleSimulateDiscord}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 font-bold text-xs cursor-pointer"
              >
                ربط تجريبي سريع (4_3y)
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Connect Steam */}
        {isDiscordLinked && !isSteamLinked && (
          <div className="max-w-xl mx-auto p-8 rounded-3xl bg-neutral-950/80 border border-neutral-900 text-center space-y-6 shadow-2xl backdrop-blur-md">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white font-arabic">الخطوة 2: ربط حساب ستيم Steam</h2>
              <p className="text-xs text-neutral-400">
                يلزم ربط حساب ستيم للحصول على Steam Hex المعرف داخل سيرفر FiveM.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="/auth/steam"
                className="w-full py-3.5 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                <span>تسجيل الدخول عبر Steam Community</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={handleSimulateSteam}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 font-bold text-xs cursor-pointer"
              >
                ربط تجريبي سريع لـ Steam Hex
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Choose Server matching Screenshot 3 */}
        {isDiscordLinked && isSteamLinked && step === 3 && (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white font-arabic">اختر سيرفر لعبة</h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
                اختر سيرفر واحد على الأقل للانضمام. بعض السيرفرات تتطلب اجتياز اختبار وموافقة الإدارة.
              </p>
            </div>

            {/* Server Card */}
            {servers.length === 0 ? (
              <div className="max-w-xl mx-auto p-8 rounded-2xl bg-neutral-950/40 border border-dashed border-neutral-800 text-neutral-400 text-xs">
                لا توجد سيرفرات متاحة حالياً.
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-4">
                {servers.map((server) => (
                  <div
                    key={server.id}
                    onClick={() => setSelectedServer(server.id)}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer text-right flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      selectedServer === server.id
                        ? 'bg-neutral-950/90 border-purple-500 shadow-xl shadow-purple-900/20'
                        : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <Server className="w-5 h-5 text-purple-400" />
                        <h3 className="text-base font-bold text-white">{server.name}</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ONLINE
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">{server.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-800/40">
                        {server.onlinePlayers} / {server.maxPlayers} لاعب
                      </span>
                    </div>
                  </div>
                ))}

                <div className="pt-4">
                  <button
                    onClick={() => setStep(4)}
                    className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
                  >
                    <span>المتابعة إلى اختبار الرول بلاي</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Roleplay Test */}
        {isDiscordLinked && isSteamLinked && step === 4 && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white font-arabic">اختبار الرول بلاي (Roleplay Exam)</h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                أجب على الأسئلة التالية بدقة لاجتياز الوايت لست والحصول على رتبة المواطن.
              </p>
            </div>

            {submitSuccess ? (
              <div className="space-y-6">
                {/* 1. APPROVED STATE */}
                {appStatus === 'approved' && (
                  <div className="p-8 rounded-3xl bg-neutral-950/90 border border-emerald-500/50 text-center space-y-5 shadow-2xl backdrop-blur-md">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                    <div className="space-y-1">
                      <span className="px-3.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold uppercase inline-block mb-1">
                        تم القبول والاعتماد ✅
                      </span>
                      <h3 className="text-2xl font-bold text-white font-arabic">تهانينا! تم قبول طلبك في السيرفر بنجاح</h3>
                      <p className="text-xs text-neutral-400 max-w-md mx-auto">
                        تمت مراجعة إجاباتك وقبول طلبك رسمياً من قبل إدارة سيرفر RIFT STATE. تم منحك صلاحية الدخول لسيرفر FiveM.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <a
                        href="https://cfx.re/join/riftstate"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 hover:scale-105 transition-transform"
                      >
                        <span>دخول السيرفر الآن (PLAY NOW)</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                {/* 2. REJECTED STATE */}
                {appStatus === 'rejected' && (
                  <div className="p-8 rounded-3xl bg-neutral-950/90 border border-red-500/50 text-center space-y-5 shadow-2xl backdrop-blur-md">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                    <div className="space-y-1">
                      <span className="px-3.5 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 text-xs font-bold uppercase inline-block mb-1">
                        تم رفض الطلب ❌
                      </span>
                      <h3 className="text-2xl font-bold text-white font-arabic">عذراً، تم رفض طلبك من قبل إدارة السيرفر</h3>
                      <p className="text-xs text-neutral-400 max-w-md mx-auto">
                        تمت مراجعة إجاباتك من قبل المشرفين، ولم يحالفك الحظ هذه المرة. يمكنك مراجعة القوانين وإعادة تقديم الاختبار الإلكتروني.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleResetApplication}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:scale-105 transition-transform cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>إعادة التقديم على الاختبار الإلكتروني مجدداً</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. PENDING STATE (Default after submission) */}
                {(appStatus === 'pending' || appStatus === 'none') && (
                  <div className="p-8 rounded-3xl bg-neutral-950/90 border border-purple-500/50 text-center space-y-6 shadow-2xl backdrop-blur-md">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 rounded-full bg-purple-600/30 animate-ping" />
                      <div className="relative w-16 h-16 rounded-full bg-purple-950/80 border border-purple-500 flex items-center justify-center">
                        <Clock className="w-8 h-8 text-purple-400 animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="px-3.5 py-1 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/60 text-xs font-bold inline-block">
                        🟡 الطلب قيد المراجعة والتدقيق
                      </span>
                      <h3 className="text-2xl font-bold text-white font-arabic">تم استلام طلبك وبانتظار قرار الإدارة بالقبول أو الرفض</h3>
                      <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                        تم إرسال إجاباتك وبياناتك تلقائياً إلى روم الإدارة في الديسكورد. يقوم المشرفون الآن بفحص إجاباتك لاتخاذ قرار <strong>القبول ✅</strong> أو <strong>الرفض ❌</strong>.
                      </p>
                    </div>

                    {/* Application Details Summary */}
                    <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 max-w-md mx-auto text-right text-xs space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                        <span className="text-neutral-400">رقم الطلب:</span>
                        <code className="text-purple-300 font-mono font-bold">{applicationData?.id || 'WL-PENDING'}</code>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                        <span className="text-neutral-400">اسم الشخصية:</span>
                        <span className="text-white font-bold">{applicationData?.characterName || characterName}</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                        <span className="text-neutral-400">حساب الديسكورد:</span>
                        <span className="text-indigo-400 font-mono">{authStatus.discord?.username || 'متصل'}</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                        <span className="text-neutral-400">ستيم هيكس (Steam Hex):</span>
                        <span className="text-emerald-400 font-mono text-[11px]">{authStatus.steam?.steamHex || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">نتيجة الاختبار الإلكتروني:</span>
                        <span className="text-purple-300 font-bold">
                          {quizScore?.score ?? applicationData?.score?.score ?? questions.length} من {quizScore?.total ?? applicationData?.score?.total ?? questions.length} ({quizScore?.passed ? 'اجتياز' : 'تم الحل'})
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={fetchApplicationStatus}
                        className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                        <span>تحديث حالة الطلب الآن</span>
                      </button>

                      <span className="text-[11px] text-neutral-500 font-mono">
                        يتم التحديث تلقائياً فور اتخاذ القرار من الديسكورد...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitExam} className="space-y-6">
                <div className="p-6 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-4">
                  <div className="space-y-1 text-right">
                    <label className="text-xs font-bold text-neutral-300">اسم الشخصية داخل اللعبة (Character Name)</label>
                    <input
                      type="text"
                      required
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      placeholder="مثال: راكان الخالدي (Rakan)"
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 text-right"
                    />
                  </div>
                </div>

                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-6 rounded-2xl bg-neutral-950/80 border border-neutral-800/90 space-y-4 text-right"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/40">
                        السؤال {idx + 1}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-white leading-relaxed">
                      {q.question}
                    </h3>

                    <div className="space-y-2 pt-2">
                      {q.options.map((opt) => {
                        const isSelected = selectedAnswers[q.id] === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: opt.id })}
                            className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-purple-950/50 border-purple-500 text-purple-200 shadow-md shadow-purple-900/20'
                                : 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                            }`}
                          >
                            <span>{opt.text}</span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-purple-500 bg-purple-500' : 'border-neutral-700'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'جاري التحقق...' : 'إرسال الإجابات واعتماد الوايت لست'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
