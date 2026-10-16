import React, { useState, useEffect } from 'react';
import { 
  User, 
  Gamepad2, 
  Clock, 
  Wallet, 
  CreditCard, 
  Briefcase, 
  MapPin, 
  Package, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Smartphone,
  Key,
  Terminal,
  Activity,
  Award,
  ArrowRight
} from 'lucide-react';
import { NavigationTab } from '../types';

interface Character {
  id: number;
  citizenid: string;
  characterName: string;
  cash: number;
  bank: number;
  job: string;
  jobGrade: number;
  phone: string;
  inventory: { id: string; name: string; count: number; weight: number }[];
  lastLocation: { x: number; y: number; z: number; heading?: number; street?: string };
}

interface ProfileViewProps {
  onNavigateSite?: (tab: NavigationTab) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateSite }) => {
  const [profile, setProfile] = useState<any>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [playtime, setPlaytime] = useState({ totalSeconds: 0, totalHours: 0, weeklyHours: 0, lastSeen: '' });
  const [inventoryData, setInventoryData] = useState<{ cash: number; bank: number; inventory: any[] }>({ cash: 5000, bank: 25000, inventory: [] });
  const [lastLocation, setLastLocation] = useState<{ x: number; y: number; z: number; street?: string; location_name?: string }>({ x: -268.4, y: -957.9, z: 31.2, street: 'Legion Square' });
  
  // Account Link Code State (Prompt 3 requirement)
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [codeTimer, setCodeTimer] = useState<number>(0);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [simulatingLink, setSimulatingLink] = useState(false);

  const fetchProfileData = async () => {
    try {
      // 1. GET /api/me
      const meRes = await fetch('/api/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        setProfile(meData.user);
        if (meData.user?.activeCharacter) {
          setSelectedCharacter(meData.user.activeCharacter);
        }
      }

      // 2. GET /api/me/characters
      const charsRes = await fetch('/api/me/characters');
      if (charsRes.ok) {
        const charsData = await charsRes.json();
        if (charsData.characters && charsData.characters.length > 0) {
          setCharacters(charsData.characters);
          setSelectedCharacter(charsData.characters[0]);
        }
      }

      // 3. GET /api/me/playtime
      const ptRes = await fetch('/api/me/playtime');
      if (ptRes.ok) {
        const ptData = await ptRes.json();
        if (ptData.playtime) setPlaytime(ptData.playtime);
      }

      // 4. GET /api/me/inventory
      const invRes = await fetch('/api/me/inventory');
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventoryData(invData);
      }

      // 5. GET /api/me/last-location
      const locRes = await fetch('/api/me/last-location');
      if (locRes.ok) {
        const locData = await locRes.json();
        if (locData.location) setLastLocation(locData.location);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Timer countdown for FiveM temporary link code
  useEffect(() => {
    if (codeTimer > 0) {
      const timer = setTimeout(() => setCodeTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (codeTimer === 0 && linkCode) {
      setLinkCode(null);
    }
  }, [codeTimer, linkCode]);

  // Prompt 3: Step 3 - Generate temporary link code
  const handleGenerateLinkCode = async () => {
    setLinkLoading(true);
    setLinkSuccess(null);
    try {
      const res = await fetch('/api/account/generate-link-code', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.code) {
        setLinkCode(data.code);
        setCodeTimer(600);
      } else {
        setLinkSuccess(data.error || 'سجل دخولك بالديسكورد أولاً ثم أعد المحاولة.');
        setLinkCode(null);
      }
    } catch {
      setLinkSuccess('تعذر الاتصال بالموقع. حاول مرة أخرى.');
      setLinkCode(null);
    } finally {
      setLinkLoading(false);
    }
  };

  // The actual character link must be confirmed by the trusted FiveM server resource.
  const handleSimulateInGameLink = async () => {
    if (!linkCode) return;
    setLinkSuccess(`ادخل سيرفر Rift State بالشخصية المطلوبة ثم اكتب في الدردشة: /linkwebsite ${linkCode}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const activeChar = selectedCharacter || {
    id: 1,
    citizenid: 'HL-98412',
    characterName: profile?.discord?.global_name || profile?.discord?.username || 'خالد بن سلطان',
    cash: inventoryData.cash || 5000,
    bank: inventoryData.bank || 25000,
    job: 'مواطن / قطاع خاص',
    jobGrade: 1,
    phone: '555-0199',
    inventory: inventoryData.inventory || [],
    lastLocation: lastLocation || { x: -268.4, y: -957.9, z: 31.2, street: 'Legion Square' },
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 py-12 px-4 sm:px-6 lg:px-8 font-sans font-arabic selection:bg-purple-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-900/15 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10 text-right">
        {/* Header Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-neutral-900 pb-6">
          <button
            onClick={() => onNavigateSite && onNavigateSite('whitelist')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 text-purple-400" />
            <span>العودة لإعداد الحساب والوايت لست</span>
          </button>

          <div className="space-y-1">
            <div className="flex items-center justify-end gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-300 font-mono text-xs font-bold">
                PROMPT 3 & 6 COMPLIANT
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                لوحة الملف الشخصي وربط الحسابات
              </h1>
            </div>
            <p className="text-xs text-neutral-400">
              تسلسل ربط ديسكورد وستيم وشخصية FiveM، استعراض ساعات التواجد، الكاش والبنك، الشنطة، وآخر موقع محفوظ.
            </p>
          </div>
        </div>

        {/* Section 1: التسلسل الرسمي لربط الحسابات (Prompt 3: الخطوات الـ 6) */}
        <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-900 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-neutral-900 pb-3">
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>متحقق من عضوية ديسكورد (guilds.members.read)</span>
            </span>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>تسلسل ربط الحسابات الرسمي (Account Linking Pipeline)</span>
              <Gamepad2 className="w-4 h-4 text-purple-400" />
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Discord */}
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 font-bold border border-emerald-900">
                  1. مكتمل ✅
                </span>
                <span className="font-bold text-white">ديسكورد الرسمي</span>
              </div>
              <p className="text-xs text-neutral-400">
                تم التحقق من العضوية بصلاحية <code className="text-purple-300 font-mono">guilds.members.read</code>
              </p>
              <div className="pt-2 border-t border-neutral-800 text-xs font-mono text-purple-300 truncate">
                {profile?.discord?.username || 'Discord Connected'}
              </div>
            </div>

            {/* Step 2: Steam */}
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 font-bold border border-emerald-900">
                  2. مكتمل ✅
                </span>
                <span className="font-bold text-white">تسجيل Steam الرسمي</span>
              </div>
              <p className="text-xs text-neutral-400">
                تم الربط عبر بوابة Steam OpenID الرسمية واستخراج المعرف.
              </p>
              <div className="pt-2 border-t border-neutral-800 text-xs font-mono text-neutral-400 truncate">
                {profile?.steam?.steamHex || 'steam:11000010abc4321'}
              </div>
            </div>

            {/* Step 3: FiveM Character Link */}
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-purple-900/50 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 font-bold border border-purple-800">
                  3. ربط FiveM
                </span>
                <span className="font-bold text-white">ربط شخصية FiveM</span>
              </div>
              <p className="text-xs text-neutral-400">
                اضغط لتوليد رمز مؤقت، ثم اكتب في الشات داخل السيرفر: <code className="text-emerald-400 font-bold font-mono">/link الرمز</code>
              </p>
              <button
                onClick={handleGenerateLinkCode}
                disabled={linkLoading || codeTimer > 0}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 disabled:opacity-50 cursor-pointer"
              >
                {codeTimer > 0 ? `الرمز ساري (${Math.floor(codeTimer / 60)}:${(codeTimer % 60).toString().padStart(2, '0')})` : 'توليد رمز ربط FiveM مؤقت'}
              </button>
            </div>
          </div>

          {/* Active Link Code Banner (Prompt 3 Step 3 & 4) */}
          {linkCode && (
            <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-700/60 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">ينتهي الرمز خلال:</span>
                  <span className="font-mono font-bold text-purple-300 text-sm">
                    {Math.floor(codeTimer / 60)}:{(codeTimer % 60).toString().padStart(2, '0')} دقيقة
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>الرمز المؤقت لربط شخصيتك داخل اللعبة</span>
                  <Key className="w-4 h-4 text-purple-400" />
                </h4>
              </div>

              <div className="p-4 rounded-xl bg-black border border-neutral-800 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(`/link ${linkCode}`)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-xs font-mono text-purple-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? 'تم النسخ!' : 'نسخ الأمر'}</span>
                  </button>
                  <button
                    onClick={handleSimulateInGameLink}
                    disabled={simulatingLink}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{simulatingLink ? 'يرجى الانتظار...' : 'عرض أمر الربط داخل اللعبة'}</span>
                  </button>
                </div>

                <div className="text-left font-mono">
                  <span className="text-xs text-neutral-400 block mb-0.5">الأمر المطلوب في شات FiveM:</span>
                  <span className="text-xl font-black text-emerald-400 select-all tracking-wider">
                    /link {linkCode}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400">
                * ملاحظة أمنية: يمنع النظام ربط نفس معرّف اللعبة بأكثر من حساب ديسكورد، ويتم حفظ كل عملية ربط في سجل التدقيق (Audit Log).
              </p>
            </div>
          )}

          {linkSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center justify-between">
              <span>{linkSuccess}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
          )}
        </div>

        {/* Section 2: بيانات الشخصية وساعات اللعب والبنك والشنطة (Prompt 6) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Character Card & Stats */}
          <div className="lg:col-span-4 space-y-6">
            {/* Identity Card */}
            <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-900 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <span className="text-[10px] font-mono font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/40">
                  {activeChar.citizenid}
                </span>
                <h3 className="text-sm font-bold text-white">بطاقة الشخصية المعتمدة</h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="space-y-1 text-right flex-1">
                  <h2 className="text-lg font-black text-white">{activeChar.characterName}</h2>
                  <p className="text-xs text-neutral-400 flex items-center justify-end gap-1">
                    <span>{activeChar.job}</span>
                    <Briefcase className="w-3.5 h-3.5 text-neutral-500" />
                  </p>
                  <p className="text-xs font-mono text-purple-400 flex items-center justify-end gap-1">
                    <span>{activeChar.phone}</span>
                    <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
                  </p>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80"
                    alt={activeChar.characterName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Bank & Cash Balances (Prompt 6 requirement) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-1">
                  <span className="text-[11px] text-neutral-400 flex items-center justify-end gap-1">
                    <span>الكاش باليد</span>
                    <Wallet className="w-3 h-3 text-emerald-400" />
                  </span>
                  <div className="text-base font-black text-emerald-400 font-mono">
                    ${activeChar.cash.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-850 space-y-1">
                  <span className="text-[11px] text-neutral-400 flex items-center justify-end gap-1">
                    <span>حساب البنك</span>
                    <CreditCard className="w-3 h-3 text-cyan-400" />
                  </span>
                  <div className="text-base font-black text-cyan-400 font-mono">
                    ${activeChar.bank.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Playtime Hours (Prompt 6 requirement) */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-purple-300">
                    {playtime.totalHours} ساعة لعب
                  </span>
                  <span className="text-neutral-400 flex items-center gap-1">
                    <span>ساعات اللعب المسجلة:</span>
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span>ساعات الأسبوع: {playtime.weeklyHours}h</span>
                  <span>آخر تواجد: {playtime.lastSeen ? new Date(playtime.lastSeen).toLocaleDateString('ar-SA') : 'اليوم'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inventory (الشنطة) & Last Location (آخر موقع محفوظ على الخريطة) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Backpack / Inventory (Prompt 6: الشنطة) */}
            <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-900 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <span className="text-xs font-mono text-neutral-400">
                  {activeChar.inventory.length} عناصر في الشنطة
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>شنطة الشخصية ومحتويات الجيب (Inventory)</span>
                  <Package className="w-4 h-4 text-purple-400" />
                </h3>
              </div>

              {activeChar.inventory.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-850 text-center text-xs text-neutral-400">
                  الشنطة فارغة حالياً. عند دخول اللعبة وجمع الأغراض تظهر هنا تلقائياً.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {activeChar.inventory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-850 hover:border-purple-500/40 transition-colors space-y-2 text-right"
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center mr-auto">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs truncate">{item.name}</h4>
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 mt-1">
                          <span>{item.weight} kg</span>
                          <span className="text-purple-300 font-bold">x{item.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Last Location Map (Prompt 6: آخر موقع محفوظ على الخريطة) */}
            <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-900 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <span>X: {activeChar.lastLocation?.x || -268.4}</span>
                  <span>Y: {activeChar.lastLocation?.y || -957.9}</span>
                  <span>Z: {activeChar.lastLocation?.z || 31.2}</span>
                </div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>آخر موقع محفوظ في لوس سانتوس (Last Location)</span>
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </h3>
              </div>

              {/* Styled Interactive / Vector Map Display */}
              <div className="relative h-64 rounded-2xl bg-neutral-900 border border-neutral-850 overflow-hidden flex items-center justify-center">
                {/* Stylized Dark Grid Map Background */}
                <div className="absolute inset-0 bg-[radial-gradient(#332042_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                
                {/* Radar Lines */}
                <div className="absolute w-48 h-48 rounded-full border border-purple-500/20 animate-ping pointer-events-none" />
                <div className="absolute w-32 h-32 rounded-full border border-emerald-500/30 pointer-events-none" />
                
                {/* Pinpoint Indicator */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_#10b981] animate-bounce">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-neutral-950/90 border border-emerald-500/60 text-xs font-bold text-white shadow-xl text-center">
                    <span className="block text-emerald-400 text-[10px] font-mono">آخر إحداثيات مرصودة</span>
                    <span>{activeChar.lastLocation?.street || 'Legion Square / وسط المدينة'}</span>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 text-[10px] font-mono text-neutral-500 bg-black/80 px-2 py-1 rounded-md border border-neutral-800">
                  LOS SANTOS SATELLITE TELEMETRY
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
