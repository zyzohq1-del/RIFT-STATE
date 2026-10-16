import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft, 
  ExternalLink,
  Trash2,
  Copy,
  RefreshCw
} from 'lucide-react';
import { Language, UserAccount, NavigationTab } from '../types';
import { RiftLogo } from './RiftLogo';

interface AuthStatus {
  user: any;
  discord: {
    id: string;
    username: string;
    global_name?: string;
    email?: string;
    avatar?: string;
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
}

interface AuthModalsProps {
  loginOpen: boolean;
  registerOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLoginSuccess: (user: UserAccount) => void;
  onNavigateToWhitelist?: () => void;
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  loginOpen,
  registerOpen,
  onClose,
  lang,
  onLoginSuccess,
  onNavigateToWhitelist,
}) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    user: null,
    discord: null,
    steam: null,
    whitelist: null,
  });
  const [loading, setLoading] = useState(false);
  const [copiedHex, setCopiedHex] = useState(false);

  const isOpen = loginOpen || registerOpen;

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data = await res.json();
        setAuthStatus(data);

        // If user already has both Discord & Steam linked, auto-sync
        if (data.discord && data.steam) {
          const userAccount: UserAccount = {
            username: data.discord.username,
            discordTag: `@${data.discord.username}`,
            steamHex: data.steam.steamHex || 'steam:110000100000000',
            avatar: data.discord.avatar,
            citizenName: data.whitelist?.characterName,
            isLoggedIn: true,
            whitelistStatus: data.whitelist?.approved ? 'approved' : 'pending',
          };
          onLoginSuccess(userAccount);
        }
      }
    } catch (e) {
      console.error('Failed to fetch auth status', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMockLink = async (type: 'discord' | 'steam') => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/mock-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          username: type === 'discord' ? 'Hunter_Citizen' : 'HLC_Player',
          discordId: '849201948201948201',
          steamId: '76561198012345678',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuthStatus((prev) => ({
          ...prev,
          user: data.user,
          discord: data.discord,
          steam: data.steam,
          whitelist: data.whitelist,
        }));

        if (data.discord && data.steam) {
          const userAccount: UserAccount = {
            username: data.discord.username,
            discordTag: `@${data.discord.username}`,
            steamHex: data.steam.steamHex || 'steam:110000100000000',
            avatar: data.discord.avatar,
            citizenName: data.whitelist?.characterName,
            isLoggedIn: true,
            whitelistStatus: data.whitelist?.approved ? 'approved' : 'pending',
          };
          onLoginSuccess(userAccount);
        }
      }
    } catch (e) {
      console.error('Failed to mock link', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (type: 'discord' | 'steam') => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/unlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuthStatus((prev) => ({
          ...prev,
          discord: data.discord,
          steam: data.steam,
        }));
      }
    } catch (e) {
      console.error('Failed to unlink', e);
    } finally {
      setLoading(false);
    }
  };

  const isBothLinked = Boolean(authStatus.discord && authStatus.steam);

  const handleProceedToWhitelist = () => {
    if (authStatus.discord && authStatus.steam) {
      const userAccount: UserAccount = {
        username: authStatus.discord.username,
        discordTag: `@${authStatus.discord.username}`,
        steamHex: authStatus.steam.steamHex || 'steam:110000100000000',
        avatar: authStatus.discord.avatar,
        citizenName: authStatus.whitelist?.characterName,
        isLoggedIn: true,
        whitelistStatus: authStatus.whitelist?.approved ? 'approved' : 'pending',
      };
      onLoginSuccess(userAccount);
    }
    onClose();
    if (onNavigateToWhitelist) {
      onNavigateToWhitelist();
    }
  };

  const copySteamHex = () => {
    if (authStatus.steam?.steamHex) {
      navigator.clipboard.writeText(authStatus.steam.steamHex);
      setCopiedHex(true);
      setTimeout(() => setCopiedHex(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-neutral-950 border border-neutral-850 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
          <div className="flex items-center gap-3">
            <RiftLogo size="sm" showText={false} />
            <div>
              <div className="text-[11px] font-mono font-bold text-red-500 uppercase tracking-wider">
                DISCORD & STEAM IDENTITY
              </div>
              <h2 className="font-display font-black text-xl text-white font-arabic">
                {loginOpen
                  ? (lang === 'ar' ? 'تسجيل الدخول والوايت لست' : 'Sign In & Whitelist')
                  : (lang === 'ar' ? 'إنشاء حساب والتقديم على الوايت لست' : 'Register & Apply Whitelist')}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-xl hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Notice */}
        <div className="p-4 bg-neutral-900/60 border border-neutral-850 rounded-2xl space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white font-arabic">
            <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'شرط أساسي لتسجيل الدخول والتقديم'
                : 'Mandatory Requirement for Sign In & Whitelist'}
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-arabic leading-relaxed">
            {lang === 'ar'
              ? 'لكي تتمكن من تسجيل الدخول والتقديم على الوايت لست (Whitelist)، يجب ربط حساب Discord و Steam معاً للتحقق من هويتك ومنحك الرتبة تلقائياً في السيرفر.'
              : 'To sign in and apply for Whitelist, you must link both your Discord and Steam accounts to verify your identity and receive automatic access.'}
          </p>
        </div>

        {/* Linking Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Discord Card */}
          <div className="p-4 bg-neutral-900/50 border border-neutral-850 rounded-2xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="font-bold text-white text-xs">Discord</span>
                </div>
                {authStatus.discord ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'مرتبط' : 'Linked'}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {lang === 'ar' ? 'مطلوب' : 'Required'}
                  </span>
                )}
              </div>

              {authStatus.discord ? (
                <div className="p-2.5 bg-neutral-950 rounded-xl space-y-0.5">
                  <div className="text-xs font-bold text-white truncate">
                    {authStatus.discord.global_name || authStatus.discord.username}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono truncate">
                    @{authStatus.discord.username}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-400 font-arabic">
                  {lang === 'ar' ? 'لمنحك رتبة Whitelist الآلية في الديسكورد.' : 'For automated Whitelist Discord role.'}
                </p>
              )}
            </div>

            <div className="pt-2">
              {authStatus.discord ? (
                <button
                  onClick={() => handleUnlink('discord')}
                  className="w-full py-1.5 text-[11px] text-neutral-500 hover:text-rose-400 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{lang === 'ar' ? 'إلغاء الربط' : 'Unlink'}</span>
                </button>
              ) : (
                <div className="space-y-1.5">
                  <a
                    href="/auth/discord"
                    className="w-full py-2 px-3 bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#5865F2]/20 flex items-center justify-center gap-1.5 text-center font-arabic"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'ar' ? 'ربط Discord' : 'Link Discord'}</span>
                  </a>
                  <button
                    onClick={() => handleMockLink('discord')}
                    className="w-full py-1 text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {lang === 'ar' ? 'تجربة سريعة' : 'Quick Mock'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Steam Card */}
          <div className="p-4 bg-neutral-900/50 border border-neutral-850 rounded-2xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center font-bold text-[10px]">
                    ST
                  </div>
                  <span className="font-bold text-white text-xs">Steam</span>
                </div>
                {authStatus.steam ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'مرتبط' : 'Linked'}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {lang === 'ar' ? 'مطلوب' : 'Required'}
                  </span>
                )}
              </div>

              {authStatus.steam ? (
                <div className="p-2.5 bg-neutral-950 rounded-xl space-y-0.5 font-mono">
                  <div className="text-[11px] text-amber-400 font-bold truncate">
                    {authStatus.steam.steamHex || 'steam:1100001...'}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    {authStatus.steam.personaName || 'Steam Player'}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-400 font-arabic">
                  {lang === 'ar' ? 'لاستخراج Steam Hex ID المطلوب لخادم FiveM.' : 'For Steam Hex ID used in FiveM.'}
                </p>
              )}
            </div>

            <div className="pt-2">
              {authStatus.steam ? (
                <button
                  onClick={() => handleUnlink('steam')}
                  className="w-full py-1.5 text-[11px] text-neutral-500 hover:text-rose-400 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{lang === 'ar' ? 'إلغاء الربط' : 'Unlink'}</span>
                </button>
              ) : (
                <div className="space-y-1.5">
                  <a
                    href="/auth/steam"
                    className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl transition-all border border-neutral-700 flex items-center justify-center gap-1.5 text-center font-arabic"
                  >
                    <span>{lang === 'ar' ? 'ربط Steam' : 'Link Steam'}</span>
                  </a>
                  <button
                    onClick={() => handleMockLink('steam')}
                    className="w-full py-1 text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {lang === 'ar' ? 'تجربة سريعة' : 'Quick Mock'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button: Proceed to Whitelist application */}
        <div className="space-y-3 pt-2">
          {isBothLinked ? (
            <button
              onClick={handleProceedToWhitelist}
              className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-xl shadow-red-600/25 font-arabic flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {authStatus.whitelist?.approved
                  ? (lang === 'ar' ? 'أنت معتمد بالفعل! الانتقال لبيانات حسابك' : 'Already Approved! View Account')
                  : (lang === 'ar' ? 'إتمام الدخول والتقديم على الوايت لست' : 'Proceed to Whitelist Application')}
              </span>
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
          ) : (
            <div className="p-3 bg-neutral-900/50 border border-neutral-850 rounded-xl text-center space-y-1 text-xs text-neutral-400 font-arabic">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>{lang === 'ar' ? 'بانتظار استكمال ربط الحسابين' : 'Awaiting Both Accounts'}</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                {lang === 'ar'
                  ? 'قم بربط ديسكورد وستيم بالأعلى لتفعيل زر الدخول والتقديم فوراً.'
                  : 'Link both Discord and Steam above to proceed to the application.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
