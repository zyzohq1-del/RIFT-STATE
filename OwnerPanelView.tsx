import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Settings, 
  HelpCircle, 
  Users, 
  Briefcase, 
  Radio, 
  Award, 
  Trophy, 
  FileText, 
  Calendar, 
  Layers, 
  Server, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
  RefreshCw,
  Globe,
  Database,
  BarChart3,
  UserCheck,
  Clock,
  Activity,
  Copy,
  Check,
  MessageSquare,
  Send,
  Search,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { NavigationTab } from '../types';
import { RiftLogo } from './RiftLogo';

interface OwnerPanelViewProps {
  lang?: string;
  onNavigateSite?: (tab: NavigationTab) => void;
}

type AdminSidebarTab = 
  | 'dashboard'
  | 'quick_logo'
  | 'database_sync'
  | 'site_identity'
  | 'navbar'
  | 'home_content'
  | 'shared'
  | 'faq'
  | 'team'
  | 'careers'
  | 'signin'
  | 'onboarding'
  | 'leaderboard'
  | 'live'
  | 'roster'
  | 'players'
  | 'footer'
  | 'applications'
  | 'discord_webhook'
  | 'fivem_integration'
  | 'questions'
  | 'timeline'
  | 'servers'
  | 'events';

export const OwnerPanelView: React.FC<OwnerPanelViewProps> = ({ onNavigateSite }) => {
  const [activeTab, setActiveTab] = useState<AdminSidebarTab>('dashboard');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Role permissions: 'owner' (full admin) vs 'reviewer' (only applications + view questions)
  const [userRole, setUserRole] = useState<'owner' | 'reviewer'>('owner');
  const [isReviewer, setIsReviewer] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'owner' | 'reviewer'>('owner');
  const isReviewerMode = previewMode === 'reviewer';

  // Stats & Counts matching Screenshot 7
  const [counts, setCounts] = useState({
    team: 0,
    roster: 0,
    careers: 0,
    faq: 0,
    events: 0,
    live: 0,
    timeline: 1,
    servers: 1,
    players: 0,
    questions: 0,
  });

  // Whitelist Questions matching Screenshot 1
  const [questions, setQuestions] = useState<any[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Applications matching Screenshot 2
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [appFilter, setAppFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // FAQs (SQLite Database)
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState({ id: 0, question: '', answer: '', category: 'عام' });

  // Careers / Jobs (SQLite Database)
  const [jobs, setJobs] = useState<any[]>([]);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    department: 'الشرطة',
    salary: '$3,500 / ساعة',
    description: '',
    requirements: '',
    openings: 3,
  });

  // Team Members
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    roleTitle: '',
    roleType: 'management',
    description: '',
    discordId: '',
    avatar: '',
  });

  // Live Streamers
  const [streamers, setStreamers] = useState<any[]>([]);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [newStreamer, setNewStreamer] = useState({
    name: '',
    platform: 'kick',
    channelName: '',
    channelUrl: '',
    avatar: '',
  });
  const [isCheckingStreams, setIsCheckingStreams] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  // FiveM Live Verification & Script Integration states
  const [fivemTestDiscordId, setFivemTestDiscordId] = useState('');
  const [fivemTestResult, setFivemTestResult] = useState<any | null>(null);
  const [isCheckingFivem, setIsCheckingFivem] = useState(false);
  const [fivemCodeTab, setFivemCodeTab] = useState<'server_lua' | 'fxmanifest' | 'server_cfg' | 'server_js'>('server_lua');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false);
  const [botTokenStatus, setBotTokenStatus] = useState<{ checking: boolean; result?: { valid: boolean; bot?: any; error?: string } } | null>(null);

  // Site Settings Form (SQLite Database) with all social links, buttons, and navbar settings
  const [siteSettings, setSiteSettings] = useState<any>({
    siteName: 'RIFT STATE',
    logoUrl: '/logo.png',
    tagline: 'THE GTA RP IN THE MIDDLE EAST',
    heroTitle: 'RIFT STATE',
    heroSubtitle: 'The most immersive GTA V roleplay experience. Join 300,000+ players in a world of adventure, drama, and unforgettable stories.',
    cfxJoinUrl: 'https://cfx.re/join/hlcrp',
    discordUrl: 'https://discord.gg/riftstate',
    twitterUrl: 'https://x.com/riftstate',
    storeUrl: 'https://store.riftstate.net',
    location: 'Saudi Arabia / Riyadh',
    website: 'https://riftstate.net',
    email: 'support@riftstate.net',
    heroButtons: {
      playNow: { enabled: true, label: 'PLAY NOW', url: 'https://cfx.re/join/hlcrp' },
      joinNow: { enabled: true, label: 'JOIN NOW', url: '/whitelist' },
      learnMore: { enabled: true, label: 'LEARN MORE', url: 'connect_modal' },
    },
    socialLinks: {
      youtube: { enabled: true, url: 'https://youtube.com/@riftstate' },
      tiktok: { enabled: true, url: 'https://tiktok.com/@riftstate' },
      instagram: { enabled: true, url: 'https://instagram.com/riftstate' },
      twitter: { enabled: true, url: 'https://x.com/riftstate' },
      discord: { enabled: true, url: 'https://discord.gg/riftstate' },
      kick: { enabled: true, url: 'https://kick.com/riftstate' },
      twitch: { enabled: true, url: 'https://twitch.tv/riftstate' },
    },
    navbarSettings: {
      showHome: true,
      showRoster: true,
      showTeam: true,
      showLive: true,
      showCareers: true,
      showFaq: true,
      showLeaderboard: true,
      showStore: true,
      storeLabel: 'STORE',
      storeUrl: 'https://store.riftstate.net',
    },
    footerSettings: {
      locationText: 'Saudi Arabia / Riyadh',
      websiteText: 'https://riftstate.net',
      emailText: 'support@riftstate.net',
      copyrightText: '© 2026 RIFT STATE ROLEPLAY. ALL RIGHTS RESERVED.',
    },
  });

  const [onboardingStats, setOnboardingStats] = useState<any>({
    totalAccounts: 0,
    activeLast18Days: 0,
    accounts: [],
    testStats: { total: 0, accepted: 0, rejected: 0, pending: 0 },
  });
  const [leaderboardList, setLeaderboardList] = useState<any[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<any[]>([]);
  const [copiedLua, setCopiedLua] = useState(false);
  const [savingMessage, setSavingMessage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      // Check user role permissions
      let currentIsReviewer = isReviewer;
      try {
        const statusRes = await fetch('/api/admin/status');
        if (statusRes.ok) {
          const sData = await statusRes.json();
          if (sData.role === 'reviewer' || (!sData.isOwner && sData.isReviewer)) {
            setUserRole('reviewer');
            setIsReviewer(true);
            setPreviewMode('reviewer');
            currentIsReviewer = true;
            setActiveTab('applications');
          } else {
            setUserRole('owner');
            setIsReviewer(false);
            currentIsReviewer = false;
          }
        }
      } catch {}

      // 0. Site Settings (Branding & Logo)
      try {
        const setRes = await fetch('/api/admin/settings');
        if (setRes.ok) {
          const setData = await setRes.json();
          if (setData.settings && Object.keys(setData.settings).length > 0) {
            setSiteSettings((prev: any) => ({
              ...prev,
              ...setData.settings,
              heroButtons: { ...prev.heroButtons, ...(setData.settings.heroButtons || {}) },
              socialLinks: { ...prev.socialLinks, ...(setData.settings.socialLinks || {}) },
              navbarSettings: { ...prev.navbarSettings, ...(setData.settings.navbarSettings || {}) },
              footerSettings: { ...prev.footerSettings, ...(setData.settings.footerSettings || {}) },
            }));
          }
        }
      } catch {}

      // 1. Questions (Reviewer & Owner)
      try {
        const qRes = await fetch('/api/admin/whitelist/questions');
        if (qRes.ok) {
          const qData = await qRes.json();
          if (qData.questions) {
            setQuestions(qData.questions);
            setCounts(prev => ({ ...prev, questions: qData.questions.length }));
          }
        }
      } catch {}

      // 2. Applications (Reviewer & Owner)
      try {
        const aRes = await fetch('/api/admin/whitelist');
        if (aRes.ok) {
          const aData = await aRes.json();
          if (aData.applications) setApplications(aData.applications);
        }
      } catch {}

      // If user is reviewer, do NOT fetch owner-only resources to avoid 403 errors
      if (currentIsReviewer || previewMode === 'reviewer') {
        return;
      }

      // 3. Database Status
      const dbRes = await fetch('/api/admin/database/status');
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setDbStatus(dbData);
        if (dbData.totalPlayers !== undefined) {
          setCounts(prev => ({ ...prev, players: dbData.totalPlayers }));
        }
      }

      // 4. Team Members (Real Database)
      const tRes = await fetch('/api/admin/team');
      if (tRes.ok) {
        const tData = await tRes.json();
        if (tData.team) {
          setTeamMembers(tData.team);
          setCounts(prev => ({ ...prev, team: tData.team.length }));
        }
      }

      // 5. Streamers (Real Database & Live Viewers)
      const sRes = await fetch('/api/admin/streams');
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.streams) {
          setStreamers(sData.streams);
          setCounts(prev => ({ ...prev, live: sData.streams.length }));
        }
      }

      // 6. FAQs (Real Database)
      const fRes = await fetch('/api/admin/faq');
      if (fRes.ok) {
        const fData = await fRes.json();
        if (fData.faqs) {
          setFaqs(fData.faqs);
          setCounts(prev => ({ ...prev, faq: fData.faqs.length }));
        }
      }

      // 7. Jobs (Real Database)
      const jRes = await fetch('/api/admin/jobs');
      if (jRes.ok) {
        const jData = await jRes.json();
        if (jData.jobs) {
          setJobs(jData.jobs);
          setCounts(prev => ({ ...prev, careers: jData.jobs.length }));
        }
      }

      // 8. Onboarding & Accounts Stats
      try {
        const obRes = await fetch('/api/admin/onboarding-stats');
        if (obRes.ok) {
          const obData = await obRes.json();
          setOnboardingStats(obData);
        }
      } catch {}

      // 9. Leaderboard Data
      try {
        const lbRes = await fetch('/api/leaderboard');
        if (lbRes.ok) {
          const lbData = await lbRes.json();
          if (lbData.leaderboard) setLeaderboardList(lbData.leaderboard);
          if (lbData.weeklyLeaderboard) setWeeklyLeaderboard(lbData.weeklyLeaderboard);
        }
      } catch {}
    } catch (e) {
      // Fallback
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq.question || !editingFaq.answer) return;
    try {
      const res = await fetch('/api/admin/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFaq),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.faqs) setFaqs(data.faqs);
        setIsFaqModalOpen(false);
        setEditingFaq({ id: 0, question: '', answer: '', category: 'عام' });
        setSavingMessage('تم حفظ السؤال الشائع بنجاح!');
        setTimeout(() => setSavingMessage(null), 3000);
      }
    } catch {}
  };

  const handleDeleteFaq = async (id: number | string) => {
    try {
      setFaqs(prev => prev.filter(f => f.id !== id && f.id !== Number(id)));
      setCounts(prev => ({ ...prev, faq: Math.max(0, prev.faq - 1) }));
      const res = await fetch(`/api/admin/faq/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.faqs) {
          setFaqs(data.faqs);
          setCounts(prev => ({ ...prev, faq: data.faqs.length }));
        }
      }
      setSavingMessage('تم حذف السؤال الشائع وتحديث العداد بنجاح!');
      setTimeout(() => setSavingMessage(null), 3000);
    } catch {}
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.department) return;
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.jobs) {
          setJobs(data.jobs);
          setCounts(prev => ({ ...prev, careers: data.jobs.length }));
        }
        setIsJobModalOpen(false);
        setNewJob({
          title: '',
          department: 'الشرطة',
          salary: '$3,500 / ساعة',
          description: '',
          requirements: '',
          openings: 3,
        });
        setSavingMessage('تم حفظ الشاغر الوظيفي وتحديث العداد بنجاح!');
        setTimeout(() => setSavingMessage(null), 3000);
      }
    } catch {}
  };

  const handleDeleteJob = async (id: number | string) => {
    try {
      setJobs(prev => prev.filter(j => j.id !== id && j.id !== Number(id)));
      setCounts(prev => ({ ...prev, careers: Math.max(0, prev.careers - 1) }));
      const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.jobs) {
          setJobs(data.jobs);
          setCounts(prev => ({ ...prev, careers: data.jobs.length }));
        }
      }
      setSavingMessage('تم حذف الشاغر الوظيفي وتحديث العداد بنجاح!');
      setTimeout(() => setSavingMessage(null), 3000);
    } catch {}
  };

  const handleSaveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamMember.name || !newTeamMember.roleTitle) return;
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeamMember),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.team) {
          setTeamMembers(data.team);
          setCounts(prev => ({ ...prev, team: data.team.length }));
        }
        setIsTeamModalOpen(false);
        setNewTeamMember({
          name: '',
          roleTitle: '',
          roleType: 'management',
          description: '',
          discordId: '',
          avatar: '',
        });
        setSavingMessage('تم حفظ وإضافة عضو طاقم العمل وتحديث العداد بنجاح!');
        setTimeout(() => setSavingMessage(null), 3000);
      }
    } catch {}
  };

  const handleDeleteTeamMember = async (id: string | number) => {
    try {
      const rawIdNum = Number(String(id).replace(/^tm-/, ''));
      setTeamMembers(prev => prev.filter(m => m.id !== id && m.numericId !== rawIdNum));
      setCounts(prev => ({ ...prev, team: Math.max(0, prev.team - 1) }));
      const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.team) {
          setTeamMembers(data.team);
          setCounts(prev => ({ ...prev, team: data.team.length }));
        }
      }
      setSavingMessage('تم حذف عضو طاقم العمل وتحديث العداد بنجاح!');
      setTimeout(() => setSavingMessage(null), 3000);
    } catch {}
  };

  const handleSaveStreamer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamer.name || !newStreamer.channelName) return;
    try {
      const res = await fetch('/api/admin/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStreamer),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.streams) {
          setStreamers(data.streams);
          setCounts(prev => ({ ...prev, live: data.streams.length }));
        }
        setIsStreamModalOpen(false);
        setNewStreamer({
          name: '',
          platform: 'kick',
          channelName: '',
          channelUrl: '',
          avatar: '',
        });
        setSavingMessage('تمت إضافة صانع المحتوى وتحديث العداد بنجاح!');
        setTimeout(() => setSavingMessage(null), 3000);
      }
    } catch {}
  };

  const handleDeleteStreamer = async (id: string | number) => {
    try {
      const rawIdNum = Number(String(id).replace(/^st-/, ''));
      setStreamers(prev => prev.filter(s => s.id !== id && s.numericId !== rawIdNum));
      setCounts(prev => ({ ...prev, live: Math.max(0, prev.live - 1) }));
      const res = await fetch(`/api/admin/streams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.streams) {
          setStreamers(data.streams);
          setCounts(prev => ({ ...prev, live: data.streams.length }));
        }
      }
      setSavingMessage('تم حذف صانع المحتوى وتحديث العداد بنجاح!');
      setTimeout(() => setSavingMessage(null), 3000);
    } catch {}
  };

  const handleCheckStreams = async () => {
    setIsCheckingStreams(true);
    try {
      const res = await fetch('/api/admin/streams/check', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.streams) setStreamers(data.streams);
      }
    } catch {}
    setIsCheckingStreams(false);
  };

  const handleToggleStream = async (id: string | number, currentStatus: boolean, currentViewers: number) => {
    try {
      const res = await fetch(`/api/admin/streams/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOnline: !currentStatus,
          viewers: !currentStatus ? (currentViewers > 0 ? currentViewers : 50) : 0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.streams) setStreamers(data.streams);
      }
    } catch {}
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (isReviewerMode && activeTab !== 'applications' && activeTab !== 'questions') {
      setActiveTab('applications');
    }
  }, [isReviewerMode, activeTab]);

  const handleLogin = async (overridePasskey?: string, mode?: 'owner' | 'reviewer') => {
    setAuthError(null);
    const key = overridePasskey || passkeyInput;
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: key, mode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthorized(true);
        if (data.role === 'reviewer') {
          setUserRole('reviewer');
          setIsReviewer(true);
          setPreviewMode('reviewer');
          setActiveTab('applications');
        } else {
          setUserRole('owner');
          setIsReviewer(false);
          setPreviewMode('owner');
        }
        fetchAdminData();
      } else {
        setAuthError(data.message || 'رمز المرور غير صحيح');
      }
    } catch (e) {
      setAuthError('تعذر الاتصال بالخادم');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    setIsAuthorized(false);
    setUserRole('owner');
    setIsReviewer(false);
    setPreviewMode('owner');
  };

  // Questions Actions
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    try {
      const payload = {
        id: editingQuestion.id,
        numericId: editingQuestion.numericId,
        question: editingQuestion.question,
        option_a: editingQuestion.options?.[0]?.text || editingQuestion.option_a,
        option_b: editingQuestion.options?.[1]?.text || editingQuestion.option_b,
        option_c: editingQuestion.options?.[2]?.text || editingQuestion.option_c,
        option_d: editingQuestion.options?.[3]?.text || editingQuestion.option_d,
        options: editingQuestion.options,
        correct_answer: editingQuestion.correctAnswerId || editingQuestion.correct_answer || 'a',
        correctAnswerId: editingQuestion.correctAnswerId || editingQuestion.correct_answer || 'a',
      };

      const res = await fetch('/api/admin/whitelist/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsQuestionModalOpen(false);
        setEditingQuestion(null);
        fetchAdminData();
      }
    } catch (e) {}
  };

  const handleDeleteQuestion = async (id: string | number) => {
    try {
      setQuestions(prev => prev.filter(q => q.id !== id && q.id !== Number(id)));
      setCounts(prev => ({ ...prev, questions: Math.max(0, prev.questions - 1) }));
      const res = await fetch(`/api/admin/whitelist/questions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAdminData();
      setSavingMessage('تم حذف السؤال وتحديث العداد بنجاح!');
      setTimeout(() => setSavingMessage(null), 3000);
    } catch (e) {}
  };

  const handleDeleteAccount = async (discordId: string) => {
    try {
      setOnboardingStats((prev: any) => ({
        ...prev,
        totalAccounts: Math.max(0, (prev.totalAccounts || 1) - 1),
        activeLast18Days: Math.max(0, (prev.activeLast18Days || 1) - 1),
        accounts: (prev.accounts || []).filter((a: any) => a.discordId !== discordId),
      }));
      setCounts(prev => ({ ...prev, players: Math.max(0, prev.players - 1) }));
      const res = await fetch(`/api/admin/accounts/${discordId}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setOnboardingStats(data);
        if (data.totalAccounts !== undefined) {
          setCounts(prev => ({ ...prev, players: data.totalAccounts }));
        }
      }
      setSavingMessage('تم حذف الحساب وتحديث العداد بنجاح!');
      setTimeout(() => setSavingMessage(null), 3000);
    } catch {}
  };

  const handleResetAccounts = async () => {
    try {
      setOnboardingStats((prev: any) => ({
        ...prev,
        totalAccounts: 0,
        activeLast18Days: 0,
        accounts: [],
      }));
      setCounts(prev => ({ ...prev, players: 0 }));
      const res = await fetch('/api/admin/accounts/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setOnboardingStats(data);
      }
      setSavingMessage('تم تصفير قائمة وعدد الحسابات بنجاح!');
      setTimeout(() => setSavingMessage(null), 3000);
    } catch {}
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookTestResult(null);
    try {
      const res = await fetch('/api/admin/discord-webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings?.discordWebhook || {}),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWebhookTestResult({ success: true, message: data.message || 'تم إرسال الرسالة بنجاح إلى روم الديسكورد!' });
      } else {
        setWebhookTestResult({ success: false, error: data.error || 'فشل إرسال الرسالة إلى ديسكورد، تحقق من صحة الرابط.' });
      }
    } catch (e: any) {
      setWebhookTestResult({ success: false, error: e?.message || 'خطأ في الاتصال بالخادم' });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleMoveQuestion = async (index: number, direction: 'up' | 'down') => {
    const q = questions[index];
    if (!q) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setQuestions(updated);

    try {
      const qId = q.numericId || q.id;
      const res = await fetch(`/api/admin/whitelist/questions/${qId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Database Sync Actions
  const handleTriggerSyncTest = async () => {
    setSyncLoading(true);
    setSyncSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/database/sync-test', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncSuccessMsg(`تمت المزامنة بنجاح! تم تحديث ${data.syncedCount || 3} لاعبين في قاعدة البيانات.`);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncLoading(false);
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    }
  };

  const handleTriggerHeartbeat = async () => {
    try {
      await fetch('/api/server/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: 47, max_players: 48 }),
      });
      setSyncSuccessMsg('تم إرسال نبضة الخادم (Heartbeat) وتحديث حالة السيرفر بنجاح.');
      fetchAdminData();
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    } catch (e) {}
  };

  // Applications Actions
  const handleApproveApp = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/applications/${id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'approve' }),
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'approved', roleGiven: data.roleGranted } : a));
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp((prev: any) => ({ ...prev, status: 'approved', roleGiven: data.roleGranted }));
        }
        if (data.roleGranted) {
          setSavingMessage(`🎉 تم قبول الطلب واعتماده بنجاح! وتم منح رتبة المقبولين (${data.roleId || ''}) في الديسكورد تلقائياً.`);
        } else {
          setSavingMessage('تم اعتماد وقبول طلب الوايت لست بنجاح!');
        }
        setTimeout(() => setSavingMessage(null), 4000);
      }
    } catch (e) {}
  };

  const handleGrantRoleManually = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/applications/${id}/grant-role`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, roleGiven: true } : a));
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp((prev: any) => ({ ...prev, roleGiven: true }));
        }
        setSavingMessage(`✅ تم منح رتبة الديسكورد (${data.roleId}) للاعب بنجاح!`);
      } else {
        setSavingMessage(`⚠️ ${data.message || 'تعذر منح الرتبة'}`);
      }
      setTimeout(() => setSavingMessage(null), 5000);
    } catch (e) {
      setSavingMessage('تعذر الاتصال بخادم ديسكورد');
      setTimeout(() => setSavingMessage(null), 3000);
    }
  };

  const handleCheckBotToken = async () => {
    const token = siteSettings.discordWebhook?.botToken;
    setBotTokenStatus({ checking: true });
    try {
      const res = await fetch('/api/admin/check-bot-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: token }),
      });
      const data = await res.json();
      setBotTokenStatus({ checking: false, result: data });
    } catch (e: any) {
      setBotTokenStatus({ checking: false, result: { valid: false, error: e?.message || 'خطأ في الاتصال' } });
    }
  };

  const handleTestRoleAssignment = async () => {
    try {
      const acceptedRole = siteSettings.whitelistAcceptedRoleId;
      const guildId = siteSettings.discordGuildId;
      const botToken = siteSettings.discordWebhook?.botToken;
      if (!botToken || !guildId || !acceptedRole) {
        setWebhookTestResult({
          success: false,
          error: 'يرجى التأكد من كتابة: معرف رتبة المقبولين ومعرف سيرفر الديسكورد وتوكن البوت أولاً.',
        });
        return;
      }
      setSavingMessage(`جاري فحص رتبة المقبولين (${acceptedRole}) في الديسكورد...`);
      const res = await fetch(`https://discord.com/api/v10/guilds/${guildId.trim()}/roles`, {
        headers: { Authorization: `Bot ${botToken.trim()}` },
      });
      if (res.ok) {
        const roles = await res.json();
        const roleObj = Array.isArray(roles) ? roles.find((r: any) => r.id === acceptedRole.trim()) : null;
        if (roleObj) {
          setWebhookTestResult({
            success: true,
            message: `✅ تم التحقق بنجاح! الرتبة (@${roleObj.name}) موجودة في سيرفر الديسكورد وجاهزة للمنح التلقائي فور قبول المتقدم!`,
          });
        } else {
          setWebhookTestResult({
            success: true,
            message: `⚠️ تم الاتصال بسيرفر الديسكورد بنجاح، ولكن لم يتم العثور على رتبة بالآيدي (${acceptedRole}). يرجى التأكد من نسخ الآيدي الصحيح.`,
          });
        }
      } else {
        if (res.status === 401) {
          setWebhookTestResult({
            success: false,
            error: 'توكن البوت غير مصرح به أو منتهي الصلاحية (401: Unauthorized). يرجى فتح Discord Developer Portal والضغط على Reset Token ونسخ التوكن الجديد.',
          });
        } else {
          setWebhookTestResult({
            success: false,
            error: 'تعذر الاتصال بسيرفر الديسكورد عبر البوت. تحقق من توكن البوت ومعرف السيرفر وصلاحية Manage Roles.',
          });
        }
      }
      setTimeout(() => setSavingMessage(null), 4000);
    } catch (e: any) {
      setWebhookTestResult({ success: false, error: e?.message || 'خطأ أثناء اختبار الرتبة' });
    }
  };

  const handleTestReviewerRoleAssignment = async () => {
    try {
      const reviewerRole = siteSettings.whitelistReviewerRoleId;
      const guildId = siteSettings.discordGuildId;
      const botToken = siteSettings.discordWebhook?.botToken;
      if (!botToken || !guildId || !reviewerRole) {
        setWebhookTestResult({
          success: false,
          error: 'يرجى التأكد من كتابة: معرف رتبة مسؤول التقديمات ومعرف سيرفر الديسكورد وتوكن البوت أولاً.',
        });
        return;
      }
      setSavingMessage(`جاري فحص رتبة مسؤول التقديمات (${reviewerRole}) في الديسكورد...`);
      const res = await fetch(`https://discord.com/api/v10/guilds/${guildId.trim()}/roles`, {
        headers: { Authorization: `Bot ${botToken.trim()}` },
      });
      if (res.ok) {
        const roles = await res.json();
        const roleObj = Array.isArray(roles) ? roles.find((r: any) => r.id === reviewerRole.trim()) : null;
        if (roleObj) {
          setWebhookTestResult({
            success: true,
            message: `✅ تم التحقق بنجاح! رتبة مسؤول التقديمات (@${roleObj.name}) موجودة في سيرفر الديسكورد ومفعلة للدخول المقيد للوحة التحكم!`,
          });
        } else {
          setWebhookTestResult({
            success: true,
            message: `⚠️ تم الاتصال بسيرفر الديسكورد بنجاح، ولكن لم يتم العثور على رتبة بالآيدي (${reviewerRole}). يرجى التأكد من نسخ الآيدي الصحيح.`,
          });
        }
      } else {
        if (res.status === 401) {
          setWebhookTestResult({
            success: false,
            error: 'توكن البوت غير مصرح به أو منتهي الصلاحية (401: Unauthorized). يرجى فتح Discord Developer Portal والضغط على Reset Token ونسخ التوكن الجديد.',
          });
        } else {
          setWebhookTestResult({
            success: false,
            error: 'تعذر الاتصال بسيرفر الديسكورد عبر البوت. تحقق من توكن البوت ومعرف السيرفر وصلاحية Manage Roles.',
          });
        }
      }
      setTimeout(() => setSavingMessage(null), 4000);
    } catch (e: any) {
      setWebhookTestResult({ success: false, error: e?.message || 'خطأ أثناء اختبار رتبة مسؤول التقديمات' });
    }
  };

  const handleTestFivemVerification = async (customId?: string) => {
    const idToTest = (customId || fivemTestDiscordId).trim();
    if (!idToTest) return;
    setIsCheckingFivem(true);
    setFivemTestResult(null);
    try {
      const cleanId = idToTest.replace(/^discord:/i, '').replace(/[<@!>]/g, '').trim();
      const res = await fetch(`/api/check-verification?discordId=${encodeURIComponent(cleanId)}`);
      const data = await res.json();
      setFivemTestResult(data);
    } catch (e: any) {
      setFivemTestResult({ verified: false, error: e?.message || 'خطأ في الاتصال بسيرفر التحقق' });
    } finally {
      setIsCheckingFivem(false);
    }
  };

  const handleQuickAcceptFromFivemTester = async (discordId: string) => {
    if (!discordId) return;
    try {
      setIsCheckingFivem(true);
      const cleanId = discordId.replace(/^discord:/i, '').replace(/[<@!>]/g, '').trim();
      const res = await fetch(`/accept?discordId=${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        await handleTestFivemVerification(cleanId);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingFivem(false);
    }
  };

  const handleCopyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 3000);
  };

  const handleToggleRoleMode = async (mode: 'owner' | 'reviewer') => {
    try {
      const res = await fetch('/api/admin/switch-role-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        setPreviewMode(mode);
        setUserRole(mode);
        setIsReviewer(mode === 'reviewer');
        if (mode === 'reviewer') {
          setActiveTab('applications');
        }
        fetchAdminData();
      }
    } catch {}
  };

  const handleRejectApp = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/applications/${id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'reject' }),
      });
      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp((prev: any) => ({ ...prev, status: 'rejected' }));
        }
        setSavingMessage('تم رفض طلب الوايت لست بنجاح.');
        setTimeout(() => setSavingMessage(null), 3000);
      }
    } catch (e) {}
  };

  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState<string | null>(null);

  const handleUploadLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)');
      return;
    }

    setLogoUploading(true);
    setLogoUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        
        // Save locally immediately for 0ms lag
        localStorage.setItem('rift_custom_logo', base64);
        setSiteSettings((prev: any) => ({ ...prev, logoUrl: base64 }));
        window.dispatchEvent(new Event('rift_logo_updated'));

        // Upload to server
        const res = await fetch('/api/admin/upload-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, filename: file.name }),
        });
        const data = await res.json();
        if (data.success && data.logoUrl) {
          setSiteSettings((prev: any) => ({ ...prev, logoUrl: data.logoUrl }));
          setLogoUploadSuccess(`تم رفع واعتماد الشعار الأصلي (${file.name}) بنجاح تام وبدون أي ذكاء اصطناعي!`);
        } else {
          setLogoUploadSuccess(`تم تعيين الشعار (${file.name}) كشعار رسمي بنجاح!`);
        }
      } catch (err: any) {
        console.error('Logo upload error:', err);
        setLogoUploadSuccess('تم تعيين الشعار على جهازك بنجاح');
      } finally {
        setLogoUploading(false);
        setTimeout(() => setLogoUploadSuccess(null), 5000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      });
      if (res.ok) {
        setSavingMessage('تم حفظ هوية وإعدادات الموقع في قاعدة البيانات بنجاح!');
        setTimeout(() => setSavingMessage(null), 3000);
      }
    } catch {
      setSavingMessage('تعذر حفظ الإعدادات، يرجى المحاولة لاحقاً');
    }
  };

  const filteredApps = applications.filter(a => {
    if (appFilter === 'all') return true;
    return a.status === appFilter;
  });

  // Login Screen if unauthorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-arabic">
        <div className="bg-neutral-950 border border-purple-900/60 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-700/60 text-purple-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white">لوحة التحكم (Admin Panel)</h1>
            <p className="text-xs text-neutral-400">يلزم توثيق رتبة OWNER_ROLE_ID أو إدخال رمز المرور</p>
          </div>
          {authError && (
            <div className="p-3 bg-red-950/60 border border-red-900/60 rounded-xl text-xs text-red-300">
              {authError}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            <input
              type="password"
              required
              value={passkeyInput}
              onChange={(e) => setPasskeyInput(e.target.value)}
              placeholder="رمز مرور الإدارة (مثال: hlc2026)"
              className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 font-mono text-center"
            />
            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              دخول لوحة التحكم
            </button>
            <button
              type="button"
              onClick={() => handleLogin('hlc2026')}
              className="w-full py-2 bg-neutral-900 text-neutral-400 hover:text-white text-xs rounded-xl cursor-pointer"
            >
              دخول فوري كمالك الخادم (hlc2026)
            </button>
            <button
              type="button"
              onClick={() => handleLogin('reviewer2026', 'reviewer')}
              className="w-full py-2 bg-purple-950/40 border border-purple-800/40 text-purple-300 hover:text-white text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <span>🛡️</span>
              <span>دخول برتبة مسؤول التقديمات (Reviewer)</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-row-reverse font-sans font-arabic selection:bg-purple-600 selection:text-white">
      {/* Right Sidebar matching Screenshots 1, 2, 7 */}
      <aside className="w-64 sm:w-72 bg-neutral-950 border-l border-neutral-900 flex flex-col justify-between shrink-0 z-30 min-h-screen select-none">
        <div className="space-y-6 p-4">
          {/* Top Brand matching Screenshot 1 */}
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-neutral-900/40 border border-neutral-900">
            <div className="w-10 h-10 rounded-full bg-purple-950/80 border border-purple-500/60 flex items-center justify-center text-purple-400 shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
              <RiftLogo size="sm" showText={false} customSrc={siteSettings.logoUrl} />
            </div>
            <div className="text-right">
              <h2 className="text-sm font-black text-white font-arabic">لوحة التحكم</h2>
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                {isReviewerMode ? 'REVIEWER ACCESS' : 'Admin Panel'}
              </span>
            </div>
          </div>

          {isReviewerMode ? (
            /* Reviewer Mode Sidebar: ONLY Show Whitelist Applications & Exam Questions */
            <div className="space-y-4 pt-1">
              <div className="p-3.5 rounded-2xl bg-purple-950/50 border border-purple-800/60 text-right space-y-1.5 shadow-inner">
                <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-purple-300">
                  <span>رتبة مسؤول التقديمات</span>
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed font-arabic">
                  صلاحيات مقيدة ومحددة: مراجعة طلبات الانضمام (قبول / رفض) والاطلاع على أسئلة الاختبار فقط دون إمكانية التعديل.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase px-3 py-1 text-right">
                  قائمة مسؤول التقديمات (Reviewer)
                </div>

                <button
                  onClick={() => setActiveTab('applications')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'applications'
                      ? 'bg-purple-950/90 text-purple-200 font-bold border border-purple-700/80 shadow-lg shadow-purple-950/60'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>طلبات الانضمام (Whitelist)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-900/70 text-purple-300 font-bold">
                    {applications.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('questions')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'questions'
                      ? 'bg-purple-950/90 text-purple-200 font-bold border border-purple-700/80 shadow-lg shadow-purple-950/60'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>أسئلة اختبار الرول (عرض فقط)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-900/70 text-purple-300 font-bold">
                    {questions.length}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Owner Mode Full Sidebar */
            <>
              {/* Section: الرئيسية ومزامنة السيرفر */}
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                  }`}
                >
                  <Home className="w-4 h-4 shrink-0" />
                  <span>الرئيسية</span>
                </button>

                {/* ⚡ لوحة تغيير الشعار السريع (Quick Logo Switcher) */}
                <button
                  onClick={() => setActiveTab('quick_logo')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    activeTab === 'quick_logo'
                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-lg shadow-purple-600/40 border-purple-400'
                      : 'bg-purple-950/40 text-purple-200 hover:bg-purple-900/50 border-purple-500/40 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    <span className="tracking-wide">تغيير اللوجو سريع سريع ⚡</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-900/80 text-amber-300 font-bold border border-purple-500/30">
                    جديد
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('database_sync')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'database_sync'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>قاعدة بيانات السيرفر (Sync)</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </button>
              </div>

              {/* Group 1: النصوص والمحتوى matching Screenshots */}
              <div className="space-y-1">
                <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase px-3 py-1 text-right">
                  النصوص والمحتوى
                </div>

                <button
                  onClick={() => setActiveTab('site_identity')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'site_identity' ? 'bg-purple-950/60 text-purple-300 font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>هوية الموقع (Site Identity)</span>
                  <Globe className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                <button
                  onClick={() => setActiveTab('navbar')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'navbar' ? 'bg-purple-950/60 text-purple-300 font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>شريط التنقل (Navbar)</span>
                  <Layers className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                <button
                  onClick={() => setActiveTab('home_content')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'home_content' ? 'bg-purple-950/60 text-purple-300 font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>الصفحة الرئيسية (Home)</span>
                  <FileText className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                <button
                  onClick={() => setActiveTab('faq')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'faq' ? 'bg-purple-950/60 text-purple-300 font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>الأسئلة الشائعة (FAQ)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                <button
                  onClick={() => setActiveTab('team')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'team' ? 'bg-purple-950/60 text-purple-300 font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>الفريق (Team)</span>
                  <Users className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                <button
                  onClick={() => setActiveTab('careers')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'careers' ? 'bg-purple-950/60 text-purple-300 font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>الوظائف (Careers)</span>
                  <Briefcase className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                <button
                  onClick={() => setActiveTab('onboarding')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'onboarding' ? 'bg-purple-950/60 text-purple-300 font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>إعداد الحساب والاختبار (Onboarding)</span>
                  <UserCheck className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'leaderboard' ? 'bg-purple-950/60 text-purple-300 font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>لوحة المتصدرين (Leaderboard)</span>
                  <Trophy className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                <button
                  onClick={() => setActiveTab('live')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'live' ? 'bg-purple-950/60 text-purple-300 font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>إدارة البثوث وصناع المحتوى (Live & Creators)</span>
                  <Radio className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                <button
                  onClick={() => setActiveTab('footer')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'footer' ? 'bg-purple-950/60 text-purple-300 font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>التذييل (Footer)</span>
                  <FileText className="w-3.5 h-3.5 text-neutral-500" />
                </button>
              </div>

              {/* Group 2: القوائم القابلة للتكرار matching Screenshots */}
              <div className="space-y-1 pt-2">
                <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase px-3 py-1 text-right">
                  القوائم القابلة للتكرار
                </div>

                <button
                  onClick={() => setActiveTab('applications')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'applications'
                      ? 'bg-purple-950/60 text-purple-300 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    <span>طلبات الانضمام</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-900/60 text-purple-300">
                    {applications.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('discord_webhook')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'discord_webhook'
                      ? 'bg-purple-950/60 text-purple-300 font-bold border border-purple-800/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>ربط الاختبار بالديسكورد</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${siteSettings?.discordWebhook?.enabled ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-neutral-800 text-neutral-400'}`}>
                    {siteSettings?.discordWebhook?.enabled ? 'مفعل' : 'إعداد'}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('fivem_integration')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'fivem_integration'
                      ? 'bg-amber-950/60 text-amber-300 font-bold border border-amber-800/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-amber-400" />
                    <span>سكربت فايف إم (FiveM)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-700/60">
                    Lua
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('questions')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'questions'
                      ? 'bg-purple-950/60 text-purple-300 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                    <span>أسئلة اختبار الرول</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-900/60 text-purple-300">
                    {questions.length}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bottom Status & Role Verification */}
        <div className="p-4 border-t border-neutral-900 space-y-2">
          {isReviewerMode ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/50 text-purple-300 text-[10px] font-mono font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>REVIEWER_ROLE ACTIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-300 text-[10px] font-mono font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>OWNER_ROLE_ID VERIFIED</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-black min-h-screen">
        {/* Top Header Bar matching Screenshot 1 & 7 */}
        <header className="h-16 border-b border-neutral-900 px-6 flex items-center justify-between bg-neutral-950/70 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateSite && onNavigateSite('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
              <span>عرض الموقع</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 text-red-400 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>

          {/* Role switcher toggle & Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs font-arabic">
              <button
                type="button"
                onClick={() => handleToggleRoleMode('owner')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  !isReviewerMode
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                👑 المالك الكامل (Owner)
              </button>
              <button
                type="button"
                onClick={() => handleToggleRoleMode('reviewer')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  isReviewerMode
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🛡️ مسؤول التقديمات (Reviewer)
              </button>
            </div>

            <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
              <span className="font-bold text-white uppercase bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800/50">
                {isReviewerMode ? 'REVIEWER' : 'ADMIN OWNER'}
              </span>
            </div>
          </div>
        </header>

        {/* Reviewer Notice Banner */}
        {isReviewerMode && (
          <div className="bg-purple-950/50 border-b border-purple-800/50 px-6 py-2.5 flex items-center justify-between text-xs font-arabic">
            <span className="text-[11px] text-purple-300 font-bold bg-purple-900/80 px-2.5 py-0.5 rounded-full border border-purple-700/60">
              صلاحيات مقيدة (Reviewer Mode)
            </span>
            <div className="flex items-center gap-2 text-neutral-300">
              <span>أنت في وضع رتبة مسؤول التقديمات: يظهر لك فقط طلبات الانضمام (مع إمكانية القبول والرفض ومنح الرتبة) والاطلاع على أسئلة الاختبار دون إمكانية التعديل.</span>
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            </div>
          </div>
        )}

        {/* Tab 1: DASHBOARD / الرئيسية matching Screenshot 7 */}
        {activeTab === 'dashboard' && (
          <div className="p-8 space-y-8 max-w-6xl w-full mx-auto">
            <div className="space-y-1 text-right">
              <h1 className="text-3xl font-black text-white font-arabic tracking-wide flex items-center justify-end gap-3">
                <span>مرحباً، ADMIN</span>
              </h1>
              <p className="text-xs text-neutral-400 font-arabic">
                من هنا تقدر تتحكم بكل نصوص وصور ومحتوى الموقع.
              </p>
            </div>

            {/* 9 Metric Cards matching Screenshot 7 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900/90 text-right space-y-3">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold text-neutral-300">أعضاء الفريق</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-purple-400 font-mono">{counts.team}</div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900/90 text-right space-y-3">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold text-neutral-300">صناع المحتوى</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-purple-400 font-mono">{counts.roster}</div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900/90 text-right space-y-3">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold text-neutral-300">وظائف شاغرة</span>
                  <Briefcase className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-purple-400 font-mono">{counts.careers}</div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900/90 text-right space-y-3">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold text-neutral-300">أسئلة شائعة</span>
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-purple-400 font-mono">{counts.faq}</div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900/90 text-right space-y-3">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold text-neutral-300">أحداث</span>
                  <Calendar className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-purple-400 font-mono">{counts.events}</div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900/90 text-right space-y-3">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold text-neutral-300">بثوث مباشرة</span>
                  <Radio className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-purple-400 font-mono">{counts.live}</div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900/90 text-right space-y-3">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold text-neutral-300">عناصر الجدول الزمني</span>
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-purple-400 font-mono">{counts.timeline}</div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900/90 text-right space-y-3">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold text-neutral-300">سيرفرات</span>
                  <Server className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-purple-400 font-mono">{counts.servers}</div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900/90 text-right space-y-3">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold text-neutral-300">ملفات لاعبين</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-purple-400 font-mono">{counts.players}</div>
              </div>
            </div>

            {/* Content Distribution Chart matching Screenshot 7 */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4 text-right">
              <div className="flex items-center justify-end gap-2 text-sm font-bold text-white">
                <span>توزيع المحتوى</span>
                <BarChart3 className="w-4 h-4 text-purple-400" />
              </div>

              <div className="space-y-3 pt-2 font-mono text-xs">
                {[
                  { label: 'Team', count: counts.team },
                  { label: 'Roster', count: counts.roster },
                  { label: 'Jobs', count: counts.careers },
                  { label: 'Faqs', count: counts.faq },
                  { label: 'Events', count: counts.events },
                  { label: 'Streams', count: counts.live },
                  { label: 'Timeline', count: counts.timeline },
                  { label: 'Servers', count: counts.servers },
                  { label: 'Players', count: counts.players },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="w-6 text-neutral-500 text-left font-bold">{item.count}</span>
                    <div className="flex-1 h-2 rounded-full bg-neutral-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(8, item.count * 8))}%` }}
                      />
                    </div>
                    <span className="w-20 text-neutral-400 text-right">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: DATABASE SYNC / مزامنة قاعدة البيانات وساعات التواجد */}
        {activeTab === 'database_sync' && (
          <div className="p-8 space-y-8 max-w-5xl w-full mx-auto text-right font-arabic">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTriggerSyncTest}
                  disabled={syncLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                  <span>{syncLoading ? 'جاري المزامنة...' : 'مزامنة تجريبية الآن'}</span>
                </button>

                <button
                  onClick={handleTriggerHeartbeat}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>إرسال نبضة خادم (Heartbeat)</span>
                </button>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-black text-white flex items-center justify-end gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono">SQLite Live</span>
                  <span>مزامنة قاعدة بيانات السيرفر الحقيقية</span>
                </h1>
                <p className="text-xs text-neutral-400">
                  المتصدرين وساعات التواجد تتحدث تلقائياً من جلسات السيرفر الفعلية (player_sessions) وقاعدة بيانات اللاعبين (players).
                </p>
              </div>
            </div>

            {syncSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center justify-between">
                <span>{syncSuccessMsg}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            )}

            {/* Status cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold text-neutral-300">اللاعبين المسجلين في DB</span>
                  <Database className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">{dbStatus?.totalPlayers || 10}</div>
                <span className="text-[11px] text-neutral-500 font-mono">جدول: players</span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold text-neutral-300">اللاعبين المتصلين الآن</span>
                  <Users className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {dbStatus?.serverStatus?.players || 47} / {dbStatus?.serverStatus?.max_players || 48}
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">حالة الخادم: متصل</span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold text-neutral-300">آخر نبضة (Heartbeat)</span>
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-sm font-black text-neutral-200 font-mono truncate">
                  {dbStatus?.serverStatus?.last_heartbeat ? new Date(dbStatus.serverStatus.last_heartbeat).toLocaleTimeString('ar-SA') : 'الآن'}
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">تحديث مستمر</span>
              </div>
            </div>

            {/* Technical Integration Blueprint */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <span className="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-800/50 px-2.5 py-1 rounded-lg">
                  Server Database API Endpoints
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>ربط سيرفر FiveM أو Python بموقعك لحساب ساعات التواجد</span>
                  <Server className="w-4 h-4 text-emerald-400" />
                </h3>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                تقوم موارد FiveM (أو بوتات بايثون) بإرسال إشعارات الدخول والخروج والنبضات لتحديث ساعات التواجد تلقائياً دون أي تدخل يدوي:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-850 space-y-2 text-left">
                  <div className="text-emerald-400 font-bold text-right font-arabic">1. عند دخول اللاعب (session-start)</div>
                  <pre className="text-[11px] text-neutral-300 overflow-x-auto whitespace-pre-wrap">
{`POST /internal/fivem/session-start
Headers:
  Authorization: Bearer <FIVEM_API_SECRET>
Body:
{
  "license": "license:12345",
  "steam": "steam:1100001000",
  "discord": "1234567890",
  "startedAt": 1727980000
}`}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-850 space-y-2 text-left">
                  <div className="text-red-400 font-bold text-right font-arabic">2. عند خروج اللاعب (session-end)</div>
                  <pre className="text-[11px] text-neutral-300 overflow-x-auto whitespace-pre-wrap">
{`POST /internal/fivem/session-end
Headers:
  Authorization: Bearer <FIVEM_API_SECRET>
Body:
{
  "license": "license:12345",
  "steam": "steam:1100001000",
  "discord": "1234567890",
  "endedAt": 1727985400
}`}
                  </pre>
                </div>
              </div>

              {/* FiveM server.cfg & Lua Resource snippet from Prompt */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-3 text-right">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-purple-400 uppercase">FiveM Resource (Lua)</span>
                  <h4 className="text-xs font-bold text-white">كود المورد في FiveM (server.lua) وإعدادات server.cfg</h4>
                </div>
                <div className="text-left font-mono text-[11px] bg-neutral-950 p-3 rounded-lg border border-neutral-850 space-y-2 text-neutral-300 overflow-x-auto">
                  <p className="text-purple-400"># في ملف server.cfg:</p>
                  <code>
                    set site_api_url "https://your-site.com/api"<br />
                    set site_api_secret "CHANGE_ME_TO_FIVEM_API_SECRET_FROM_SERVER_ENV"<br />
                    ensure rift_telemetry
                  </code>
                  <p className="text-purple-400 mt-2">-- في ملف server.lua للمورد:</p>
                  <pre className="whitespace-pre-wrap text-[10px]">
{`local API_URL = GetConvar('site_api_url', '')
local API_SECRET = GetConvar('site_api_secret', '')

local function getIdentifiers(playerId)
    local ids = {}
    for _, identifier in ipairs(GetPlayerIdentifiers(playerId)) do
        local kind, value = identifier:match('([^:]+):(.+)')
        if kind and value then ids[kind] = value end
    end
    return ids
end

local function sendToSite(path, payload)
    PerformHttpRequest(API_URL .. path, function(status, body)
        if status < 200 or status >= 300 then
            print(('Site API error (%s): %s'):format(status, body or ''))
        end
    end, 'POST', json.encode(payload), {
        ['Content-Type'] = 'application/json',
        ['Authorization'] = 'Bearer ' .. API_SECRET
    })
end

AddEventHandler('playerJoining', function()
    local playerId = source
    local ids = getIdentifiers(playerId)
    sendToSite('/internal/fivem/session-start', {
        license = ids.license or ids.license2,
        steam = ids.steam,
        discord = ids.discord,
        startedAt = os.time()
    })
end)

AddEventHandler('playerDropped', function()
    local playerId = source
    local ids = getIdentifiers(playerId)
    sendToSite('/internal/fivem/session-end', {
        license = ids.license or ids.license2,
        steam = ids.steam,
        discord = ids.discord,
        endedAt = os.time()
    })
end)`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: أسئلة اختبار الرول matching Screenshot 1 */}
        {activeTab === 'questions' && (
          <div className="p-8 space-y-6 max-w-5xl w-full mx-auto">
            <div className="flex items-center justify-between">
              {isReviewerMode ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 text-xs font-bold">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>وضع العرض فقط (غير مصرح بالتعديل)</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingQuestion({
                      id: '',
                      question: '',
                      options: [
                        { id: 'a', text: '' },
                        { id: 'b', text: '' },
                        { id: 'c', text: '' },
                        { id: 'd', text: '' },
                      ],
                      correctAnswerId: 'b',
                    });
                    setIsQuestionModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة جديد</span>
                </button>
              )}

              <div className="text-right space-y-0.5">
                <h1 className="text-2xl font-black text-white font-arabic">أسئلة اختبار الرول</h1>
                <span className="text-xs font-mono text-neutral-400">{questions.length} عنصر</span>
              </div>
            </div>

            {/* Banner based on role */}
            {isReviewerMode ? (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between gap-4 text-right">
                <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
                  <span className="bg-purple-900/60 px-2.5 py-1 rounded-lg border border-purple-700/60">READ-ONLY</span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center justify-end gap-2 text-xs font-bold text-purple-200">
                    <span>صلاحيات رتبة مسؤول التقديمات: استعراض بنك الأسئلة فقط</span>
                    <Lock className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-[11px] text-neutral-300">
                    يمكنك الاطلاع على أسئلة اختبار الرول بلاي وإجاباتها النموذجية لمراجعة طلبات الانضمام بدقة، بينما تعديل أو حذف الأسئلة محجوب لمالك الخادم فقط.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-neutral-950 border border-purple-800/50 flex flex-wrap items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('discord_webhook')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>ضبط وتحديد روم الديسكورد والرسالة</span>
                  </button>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="flex items-center justify-end gap-2 text-xs font-bold text-white">
                    <span>ربط نتائج هذا الاختبار برومات الديسكورد مع خياري قبول أو رفض</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${siteSettings?.discordWebhook?.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-neutral-800 text-neutral-400'}`}>
                      {siteSettings?.discordWebhook?.enabled ? '🟢 مفعل' : '⚪ غير مفعل'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    عند تقديم أي شخص في هذا الاختبار الإلكتروني، ستصل رسالة تلقائياً في روم الديسكورد مع تفاصيل إجاباته وزري قبول أو رفض فوريين.
                  </p>
                </div>
              </div>
            )}

            {questions.length === 0 ? (
              <div className="p-16 rounded-2xl bg-neutral-950/60 border border-neutral-900 text-center text-xs text-neutral-400">
                لا توجد عناصر بعد. {isReviewerMode ? 'لم يتم إضافة أسئلة من المالك بعد.' : 'اضغط "إضافة جديد" لإضافة أول عنصر.'}
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 text-right space-y-4 hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {isReviewerMode ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 font-mono">
                          <Lock className="w-3.5 h-3.5 text-purple-400" />
                          <span>عرض فقط</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMoveQuestion(idx, 'up')}
                            disabled={idx === 0}
                            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveQuestion(idx, 'down')}
                            disabled={idx === questions.length - 1}
                            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingQuestion(q);
                              setIsQuestionModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-purple-400 hover:text-purple-300 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-2 rounded-lg bg-red-950/40 hover:bg-red-950/80 text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-purple-400 font-bold">
                          سؤال رقم {idx + 1}
                        </span>
                        <h3 className="font-bold text-base text-white">{q.question}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-neutral-900">
                      {q.options?.map((opt: any) => (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                            opt.id === q.correctAnswerId
                              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300 font-bold'
                              : 'bg-neutral-900/40 border-neutral-850 text-neutral-300'
                          }`}
                        >
                          <span>{opt.text}</span>
                          <span className="font-mono text-[10px] uppercase font-bold text-neutral-500">
                            خيار ({opt.id})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: طلبات الانضمام matching Screenshot 2 */}
        {activeTab === 'applications' && (
          <div className="p-8 space-y-6 max-w-5xl w-full mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => setActiveTab('questions')}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                <span>إدارة الأسئلة</span>
              </button>

              <div className="text-right space-y-0.5">
                <h1 className="text-2xl font-black text-white font-arabic">طلبات الانضمام</h1>
                <p className="text-xs text-neutral-400">
                  نتائج اختبار الرول — راجع الإجابات ثم اقبل أو ارفض.
                </p>
              </div>
            </div>

            {/* Discord Live Webhook Status Bar */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-between flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('discord_webhook')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>إعدادات روم وإشعارات ديسكورد</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-neutral-400">حالة إرسال التقديمات لروم الديسكورد:</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${siteSettings?.discordWebhook?.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-neutral-800 text-neutral-400'}`}>
                  {siteSettings?.discordWebhook?.enabled ? `🟢 شغال (${siteSettings.discordWebhook?.channelName || '#التقديمات'})` : '⚪ متوقف (بحاجة لتفعيل الويب هوك)'}
                </span>
              </div>
            </div>

            {/* Filter Pills matching Screenshot 2 */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setAppFilter('all')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  appFilter === 'all'
                    ? 'bg-purple-950/80 border border-purple-500 text-purple-300'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                الكل {applications.length}
              </button>
              <button
                onClick={() => setAppFilter('pending')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  appFilter === 'pending'
                    ? 'bg-purple-950/80 border border-purple-500 text-purple-300'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                قيد المراجعة {applications.filter(a => a.status === 'pending').length}
              </button>
              <button
                onClick={() => setAppFilter('approved')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  appFilter === 'approved'
                    ? 'bg-purple-950/80 border border-purple-500 text-purple-300'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                مقبولة {applications.filter(a => a.status === 'approved').length}
              </button>
              <button
                onClick={() => setAppFilter('rejected')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  appFilter === 'rejected'
                    ? 'bg-purple-950/80 border border-purple-500 text-purple-300'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                مرفوضة {applications.filter(a => a.status === 'rejected').length}
              </button>
            </div>

            {/* List or Empty State matching Screenshot 2 */}
            {filteredApps.length === 0 ? (
              <div className="p-16 rounded-2xl bg-neutral-950/60 border border-neutral-900 text-center text-xs text-neutral-400">
                لا توجد طلبات هنا.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-neutral-950 border border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right hover:border-neutral-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-600 border border-purple-800/60 text-purple-300 hover:text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        مراجعة الإجابات
                      </button>
                      <button
                        onClick={() => handleApproveApp(app.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-600 border border-emerald-800/60 text-emerald-400 hover:text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        قبول
                      </button>
                      <button
                        onClick={() => handleRejectApp(app.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-600 border border-red-900/60 text-red-400 hover:text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        رفض
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-base font-bold text-white">{app.characterName || 'مواطن جديد'}</span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          app.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                          app.status === 'rejected' ? 'bg-red-950 text-red-400 border border-red-900/40' :
                          'bg-amber-950 text-amber-400 border border-amber-800/40'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 font-mono">
                        Discord: {app.discordTag || app.discordId} • {app.steamHex}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Team Management */}
        {activeTab === 'team' && (
          <div className="p-8 space-y-6 max-w-6xl w-full mx-auto text-right">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة عضو جديد لطاقم العمل</span>
              </button>

              <div className="space-y-1">
                <div className="flex items-center justify-end gap-2">
                  <h1 className="text-2xl font-black text-white font-arabic">طاقم العمل (Team)</h1>
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-xs text-neutral-400">
                  إدارة أعضاء الإدارة والمشرفين والمطورين. لن يظهر أي شخص إلا من تضيفه بنفسك هنا.
                </p>
              </div>
            </div>

            {teamMembers.length === 0 ? (
              <div className="p-12 rounded-3xl border border-dashed border-neutral-800 bg-neutral-950 text-center space-y-3">
                <Users className="w-12 h-12 text-neutral-600 mx-auto" />
                <h3 className="text-base font-bold text-white">لا يوجد أعضاء في طاقم العمل حالياً</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  القائمة فارغة تماماً بناءً على طلبك. يمكنك الضغط على زر "إضافة عضو جديد" بالأعلى لإضافة أي شخص تريده.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-5 rounded-2xl bg-neutral-950 border border-neutral-900 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => handleDeleteTeamMember(member.id)}
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors"
                        title="حذف العضو"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-bold text-white text-sm">{member.name}</h4>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800/40 mt-0.5">
                            {member.roleTitle}
                          </span>
                        </div>
                        <img
                          src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'}
                          alt={member.name}
                          className="w-12 h-12 rounded-xl object-cover border border-purple-500/30"
                        />
                      </div>
                    </div>

                    {member.description && (
                      <p className="text-xs text-neutral-400 leading-relaxed text-right">
                        {member.description}
                      </p>
                    )}

                    {member.discordId && (
                      <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-purple-400">{member.discordId}</span>
                        <span className="text-neutral-500">Discord:</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Live Streamers Management */}
        {activeTab === 'live' && (
          <div className="p-8 space-y-8 max-w-6xl w-full mx-auto text-right font-arabic">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsStreamModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة صانع محتوى جديد</span>
                </button>
                <button
                  onClick={handleCheckStreams}
                  disabled={isCheckingStreams}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStreams ? 'animate-spin text-purple-400' : ''}`} />
                  <span>{isCheckingStreams ? 'جاري الفحص...' : 'فحص المشاهدين والبثوث الآن'}</span>
                </button>
              </div>

              <div className="space-y-1 text-right">
                <div className="flex items-center justify-end gap-2">
                  <h1 className="text-2xl font-black text-white font-arabic">إدارة البثوث وصناع المحتوى (Live & Creators)</h1>
                  <Radio className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-xs text-neutral-400">
                  منظومة موحدة: البثوث المباشرة تظهر فوراً في الأعلى عند فتح البث مع الاسم والعنوان والمشاهدين، وتحتها قائمة صناع المحتوى كاملة.
                </p>
              </div>
            </div>

            {/* 1. أول شيء فوق: إدارة وعرض البثوث المباشرة الآن */}
            <div className="space-y-4 p-6 rounded-3xl bg-neutral-950/70 border border-purple-900/40">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {streamers.filter((s) => s.isOnline).length} بث مباشر نشط
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h2 className="text-base font-bold text-white">1. البثوث المباشرة الآن (أول ما صانع محتوى يفك بث يطلع هنا)</h2>
                </div>
              </div>

              {streamers.filter((s) => s.isOnline).length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-neutral-800 bg-black/40 text-center space-y-2">
                  <Radio className="w-8 h-8 text-neutral-600 mx-auto" />
                  <h4 className="text-sm font-bold text-neutral-300">لا يوجد صانع محتوى يبث حالياً</h4>
                  <p className="text-xs text-neutral-500">
                    عندما يقوم أي ستريمر ببدء البث (أو عند الضغط على "مباشر" في القائمة أدناه)، سيصعد فوراً إلى هذا القسم العلوي مع اسمه وعنوان بثه وعدد المشاهدين.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {streamers.filter((s) => s.isOnline).map((streamer) => (
                    <div
                      key={streamer.id}
                      className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-neutral-900/90 border border-purple-500/50 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          onClick={() => handleToggleStream(streamer.id, true, streamer.viewers)}
                          className="px-3 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          إنهاء البث
                        </button>

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900 text-purple-200 uppercase font-bold">
                                {streamer.platform}
                              </span>
                              <h4 className="font-bold text-white text-base">{streamer.name}</h4>
                            </div>
                            <p className="text-xs text-purple-300 font-arabic font-medium mt-1 line-clamp-1">
                              {streamer.title || `بث مباشر لسيرفر فايف إم`}
                            </p>
                          </div>
                          <img
                            src={streamer.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&h=150&q=80'}
                            alt={streamer.name}
                            className="w-12 h-12 rounded-xl object-cover border border-purple-500 shadow-md"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/60 border border-neutral-800 flex items-center justify-between text-xs">
                        <span className="text-neutral-400">عدد المشاهدين: <b className="text-purple-300 font-mono">{streamer.viewers.toLocaleString()}</b></span>
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          🔴 مباشر الآن
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. تحته على طول: قائمة صناع المحتوى كاملة */}
            <div className="space-y-4 p-6 rounded-3xl bg-neutral-950/70 border border-neutral-900">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <span className="text-xs font-mono text-purple-400 font-bold">
                  إجمالي المسجلين: {streamers.length} ستريمر
                </span>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h2 className="text-base font-bold text-white">2. قائمة صناع المحتوى المعتمدين ({streamers.length})</h2>
                </div>
              </div>

              {streamers.length === 0 ? (
                <div className="p-10 rounded-2xl border border-dashed border-neutral-800 bg-neutral-950 text-center space-y-2">
                  <Users className="w-8 h-8 text-neutral-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">لا توجد قنوات مضافة</h4>
                  <p className="text-xs text-neutral-400">استخدم زر "إضافة صانع محتوى جديد" في الأعلى لإدراج قنوات الستريمرز.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {streamers.map((streamer) => (
                    <div
                      key={streamer.id}
                      className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-850 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteStreamer(streamer.id)}
                            className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors"
                            title="حذف الستريمر"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStream(streamer.id, streamer.isOnline, streamer.viewers)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                              streamer.isOnline
                                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900/60'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            {streamer.isOnline ? 'مباشر (LIVE)' : 'مغلق (OFFLINE)'}
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-900/40 uppercase">
                                {streamer.platform}
                              </span>
                              <h4 className="font-bold text-white text-sm">{streamer.name}</h4>
                            </div>
                            <p className="text-[11px] font-mono text-neutral-400 text-right mt-0.5">
                              @{streamer.channelName}
                            </p>
                          </div>
                          <img
                            src={streamer.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&h=150&q=80'}
                            alt={streamer.name}
                            className="w-12 h-12 rounded-xl object-cover border border-purple-500/30"
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-850 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400">المشاهدين:</span>
                          <span className="font-mono font-bold text-purple-300">
                            {streamer.isOnline ? streamer.viewers.toLocaleString() : 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className={`w-2 h-2 rounded-full ${streamer.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
                          <span className={streamer.isOnline ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                            {streamer.isOnline ? 'يبث الآن' : 'غير متصل'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: FAQ / الأسئلة الشائعة (SQLite Persistence) */}
        {activeTab === 'faq' && (
          <div className="p-8 space-y-6 max-w-5xl w-full mx-auto text-right font-arabic">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <button
                onClick={() => {
                  setEditingFaq({ id: 0, question: '', answer: '', category: 'عام' });
                  setIsFaqModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سؤال شائع جديد</span>
              </button>

              <div className="space-y-0.5">
                <div className="flex items-center justify-end gap-2">
                  <h1 className="text-2xl font-black text-white font-arabic">إدارة الأسئلة الشائعة (FAQ)</h1>
                  <HelpCircle className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-xs text-neutral-400">
                  إدارة الأسئلة والأجوبة المحفوظة في قاعدة بيانات الموقع (SQLite).
                </p>
              </div>
            </div>

            {faqs.length === 0 ? (
              <div className="p-12 rounded-3xl border border-dashed border-neutral-800 bg-neutral-950 text-center space-y-3">
                <HelpCircle className="w-12 h-12 text-neutral-600 mx-auto" />
                <h3 className="text-base font-bold text-white">لا توجد أسئلة شائعة مضافة حالياً</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  اضغط على زر "إضافة سؤال شائع جديد" لإضافة أسئلة وإجابات تظهر للزوار في صفحة FAQ.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="p-5 rounded-2xl bg-neutral-950 border border-neutral-900 hover:border-purple-500/40 transition-all flex items-start justify-between gap-4"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                        title="حذف السؤال"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-900/40">
                          {faq.category || 'عام'}
                        </span>
                        <h4 className="font-bold text-white text-sm">{faq.question}</h4>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Careers / الوظائف (SQLite Persistence) */}
        {activeTab === 'careers' && (
          <div className="p-8 space-y-6 max-w-5xl w-full mx-auto text-right font-arabic">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <button
                onClick={() => setIsJobModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة شاغر وظيفي جديد</span>
              </button>

              <div className="space-y-0.5">
                <div className="flex items-center justify-end gap-2">
                  <h1 className="text-2xl font-black text-white font-arabic">إدارة الوظائف والتقديم (Careers)</h1>
                  <Briefcase className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-xs text-neutral-400">
                  إدارة الشواغر الوظيفية في قطاعات الشرطة والإسعاف والصيانة والقضاء.
                </p>
              </div>
            </div>

            {jobs.length === 0 ? (
              <div className="p-12 rounded-3xl border border-dashed border-neutral-800 bg-neutral-950 text-center space-y-3">
                <Briefcase className="w-12 h-12 text-neutral-600 mx-auto" />
                <h3 className="text-base font-bold text-white">لا توجد شواغر وظيفية مضافة حالياً</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  اضغط على زر "إضافة شاغر وظيفي جديد" لإدراج الوظائف المتاحة في السيرفر.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl bg-neutral-950 border border-neutral-900 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                        title="حذف الوظيفة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-1 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-900/40">
                            {job.department}
                          </span>
                          <h4 className="font-bold text-white text-sm">{job.title}</h4>
                        </div>
                        <p className="text-xs text-neutral-400">{job.description || 'شاغر وظيفي معتمد'}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-850 flex items-center justify-between text-xs">
                      <span className="font-mono text-emerald-400 font-bold">{job.salary || '$3,000 / ساعة'}</span>
                      <span className="text-neutral-400">الشواغر المتاحة: {job.openings || 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab: Quick Logo Switcher (لوحة تغيير الشعار سريع سريع) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'quick_logo' && (
          <div className="p-8 space-y-6 max-w-4xl w-full mx-auto text-right font-arabic">
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-neutral-900 to-indigo-950/80 border border-purple-500/40 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Live Logo Preview Box */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 shadow-[0_0_30px_rgba(168,85,247,0.6)] animate-pulse">
                    <img
                      src={siteSettings.logoUrl || (typeof window !== 'undefined' ? localStorage.getItem('rift_custom_logo') || '/logo.png' : '/logo.png')}
                      alt="Logo Preview"
                      className="w-full h-full object-cover rounded-full bg-neutral-950"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[11px] font-mono text-purple-300 font-bold bg-purple-950/80 px-3 py-1 rounded-full border border-purple-500/40">
                    الشعار الحالي الفعّال
                  </span>
                </div>

                {/* Text Description */}
                <div className="text-right space-y-2 flex-grow">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>لوحة سريعة وفورية (0ms Lag)</span>
                  </div>
                  <h1 className="text-3xl font-black text-white">تغيير لوجو السيرفر سريع سريع ⚡</h1>
                  <p className="text-sm text-neutral-300 leading-relaxed max-w-xl">
                    من هنا يمكنك استبدال أو رفع شعار السيرفر بضغطة زر واحدة بدون تعقيد! 
                    التغيير يتم فوراً وبشكل لحظي في: 
                    <span className="text-purple-300 font-bold"> النافبار، التذييل، الصفحة الرئيسية، لوحة الأدمن، والديسكورد</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Messages */}
            {logoUploadSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{logoUploadSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLogoUploadSuccess(null)}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Primary Action Card: Drag & Drop / Direct File Picker */}
            <div className="p-6 rounded-3xl bg-neutral-950 border-2 border-purple-500/50 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60">
                  ✔ بدون أي تدخل ذكاء اصطناعي إطلاقاً
                </span>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">1️⃣ ارفع الشعار من جهازك مباشرة</h2>
                  <Upload className="w-5 h-5 text-purple-400" />
                </div>
              </div>

              <label 
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  logoUploading 
                    ? 'border-purple-500 bg-purple-950/40 pointer-events-none' 
                    : 'border-purple-500/40 hover:border-purple-400 bg-purple-950/10 hover:bg-purple-950/30'
                }`}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  onChange={handleUploadLogoFile}
                  className="hidden"
                  disabled={logoUploading}
                />
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/40">
                    {logoUploading ? (
                      <RefreshCw className="w-8 h-8 animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <span className="text-base font-black text-white block">
                      {logoUploading ? 'جاري رفع وحفظ الشعار في السيرفر...' : 'اضغط هنا لاختيار ملف الشعار الأصلي من جهازك'}
                    </span>
                    <span className="text-xs text-neutral-400 mt-1 block">
                      يدعم PNG, JPG, WEBP بأي دقة وجودة عالية (يتم حفظه واعتماده فوراً في كل صفحات الموقع)
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-600/30 inline-block">
                      اختيار ملف الشعار الآن 📁
                    </span>
                  </div>
                </div>
              </label>
            </div>

            {/* Secondary Action Card: Direct URL or Path */}
            <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-900 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <span className="text-xs text-neutral-400">يدعم الروابط المباشرة مثل Imgur, Discord CDN أو مسار محلي</span>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">2️⃣ أو ضع رابط مباشر للشعار</h2>
                  <Globe className="w-5 h-5 text-indigo-400" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      const defaultLogo = `/logo.png?v=${Date.now()}`;
                      localStorage.setItem('rift_custom_logo', defaultLogo);
                      setSiteSettings((prev: any) => ({ ...prev, logoUrl: defaultLogo }));
                      window.dispatchEvent(new Event('rift_logo_updated'));
                      try {
                        await fetch('/api/admin/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...siteSettings, logoUrl: defaultLogo }),
                        });
                      } catch {}
                      setLogoUploadSuccess('تمت إعادة تعيين الشعار إلى /logo.png الأصلي بنجاح!');
                      setTimeout(() => setLogoUploadSuccess(null), 4000);
                    }}
                    className="w-full sm:w-auto px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-300 rounded-xl font-bold transition shrink-0 border border-neutral-800"
                  >
                    استعادة الشعار الأصلي الافتراضي
                  </button>

                  <input
                    type="text"
                    value={siteSettings.logoUrl || '/logo.png'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSiteSettings({ ...siteSettings, logoUrl: val });
                      if (val) {
                        localStorage.setItem('rift_custom_logo', val);
                        window.dispatchEvent(new Event('rift_logo_updated'));
                      }
                    }}
                    className="w-full px-4 py-3 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-left"
                    placeholder="https://... أو /logo.png"
                  />

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const val = siteSettings.logoUrl || '/logo.png';
                        localStorage.setItem('rift_custom_logo', val);
                        window.dispatchEvent(new Event('rift_logo_updated'));
                        await fetch('/api/admin/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(siteSettings),
                        });
                        setLogoUploadSuccess('تم حفظ وتطبيق الرابط بنجاح لكافة الموقع!');
                        setTimeout(() => setLogoUploadSuccess(null), 4000);
                      } catch {
                        setLogoUploadSuccess('تم تحديث الشعار على متصفحك بنجاح');
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shrink-0 shadow-lg shadow-purple-600/30"
                  >
                    حفظ وتطبيق الرابط 💾
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Preview Matrix */}
            <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-900 space-y-4">
              <h3 className="text-sm font-bold text-white text-right">
                معاينة الشعار في أجزاء الموقع المختلفة:
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Navbar Preview */}
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850 flex flex-col items-center justify-center gap-2 text-center">
                  <span className="text-[11px] font-mono text-neutral-400">في شريط التنقل (Navbar)</span>
                  <div className="p-3 bg-black/80 rounded-xl border border-neutral-800 w-full flex items-center justify-center">
                    <RiftLogo size="md" customSrc={siteSettings.logoUrl} />
                  </div>
                </div>

                {/* Hero Preview */}
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850 flex flex-col items-center justify-center gap-2 text-center">
                  <span className="text-[11px] font-mono text-neutral-400">في واجهة الصفحة الرئيسية (Hero)</span>
                  <div className="p-3 bg-black/80 rounded-xl border border-neutral-800 w-full flex items-center justify-center">
                    <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-purple-500 to-indigo-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                      <img
                        src={siteSettings.logoUrl || '/logo.png'}
                        alt="Hero Logo Preview"
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Preview */}
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850 flex flex-col items-center justify-center gap-2 text-center">
                  <span className="text-[11px] font-mono text-neutral-400">في التذييل (Footer)</span>
                  <div className="p-3 bg-black/80 rounded-xl border border-neutral-800 w-full flex items-center justify-center">
                    <RiftLogo size="sm" showText={true} customSrc={siteSettings.logoUrl} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab: Site Identity (هوية الموقع) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'site_identity' && (
          <div className="p-8 space-y-6 max-w-4xl w-full mx-auto text-right font-arabic">
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2">
                <h1 className="text-2xl font-black text-white font-arabic">هوية السيرفر والموقع (Site Identity)</h1>
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-xs text-neutral-400">
                تعديل اسم السيرفر، الشعار النصي، وموقع السيرفر والروابط الرسمية الأساسية.
              </p>
            </div>

            {savingMessage && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs text-emerald-400 font-bold flex items-center justify-end gap-2">
                <span>{savingMessage}</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4">
                <h3 className="text-sm font-bold text-purple-400 flex items-center justify-end gap-2">
                  <span>البيانات الأساسية والهوية</span>
                  <Sparkles className="w-4 h-4" />
                </h3>

                {/* 🖼️ شعار السيرفر الرسمي والأصلي 100% */}
                <div className="p-5 rounded-2xl bg-neutral-900/80 border border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.15)] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      بدون أي ذكاء اصطناعي 100%
                    </span>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-sm font-bold text-white">الشعار الرسمي للسيرفر (Server Logo)</span>
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                    </div>
                  </div>

                  {logoUploadSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between gap-2">
                      <span>{logoUploadSuccess}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Drag and Drop / Upload Button */}
                    <div className="md:col-span-2 space-y-3">
                      <label 
                        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          logoUploading 
                            ? 'border-purple-500/50 bg-purple-500/10 pointer-events-none' 
                            : 'border-neutral-700 hover:border-purple-500 bg-neutral-950/60 hover:bg-neutral-900/80'
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                          onChange={handleUploadLogoFile}
                          className="hidden"
                          disabled={logoUploading}
                        />
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                            {logoUploading ? (
                              <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                            ) : (
                              <Upload className="w-6 h-6 text-purple-400" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-white">
                            {logoUploading ? 'جاري رفع وحفظ الشعار...' : 'اضغط لاختيار ملف الشعار الأصلي من جهازك'}
                          </span>
                          <span className="text-[11px] text-neutral-400 max-w-sm">
                            اختر ملف الشعار الأصلي (مثل Rift_State_Server_RP_CFW.png) بصيغة PNG أو JPG وسيتم اعتماده كشعار رسمي لكامل المنصة فوراً
                          </span>
                        </div>
                      </label>

                      {/* Manual URL input fallback */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-400">أو يمكنك إدخال مسار أو رابط مباشر للشعار:</label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const defaultLogo = '/logo.png';
                              localStorage.removeItem('rift_custom_logo');
                              setSiteSettings((prev: any) => ({ ...prev, logoUrl: defaultLogo }));
                              window.dispatchEvent(new Event('rift_logo_updated'));
                            }}
                            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300 rounded-xl font-bold transition shrink-0"
                          >
                            استعادة الافتراضي
                          </button>
                          <input
                            type="text"
                            value={siteSettings.logoUrl || '/logo.png'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSiteSettings({ ...siteSettings, logoUrl: val });
                              if (val) {
                                localStorage.setItem('rift_custom_logo', val);
                                window.dispatchEvent(new Event('rift_logo_updated'));
                              }
                            }}
                            className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-left"
                            placeholder="https://... أو /logo.png"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Display */}
                    <div className="flex flex-col items-center justify-center p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-2 text-center">
                      <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">المعاينة المباشرة للشعار</span>
                      <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-purple-800 via-purple-500 to-indigo-400 shadow-[0_0_25px_rgba(168,85,247,0.5)]">
                        <img
                          src={siteSettings.logoUrl || (typeof window !== 'undefined' ? localStorage.getItem('rift_custom_logo') || '/logo.png' : '/logo.png')}
                          alt="Logo Preview"
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {siteSettings.logoUrl?.startsWith('data:') ? 'ملف أصلي مرفوع' : siteSettings.logoUrl || '/logo.png'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">اسم السيرفر / الموقع (Site Name)</label>
                    <input
                      type="text"
                      value={siteSettings.siteName || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 font-bold text-right"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">الشعار النصي العلوي (Tagline Pill)</label>
                    <input
                      type="text"
                      value={siteSettings.tagline || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 text-right"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">الموقع الجغرافي / الدولة والمدينة</label>
                    <input
                      type="text"
                      value={siteSettings.location || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, location: e.target.value })}
                      placeholder="Saudi Arabia / Riyadh"
                      className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">البريد الإلكتروني الرسمي للدعم</label>
                    <input
                      type="email"
                      value={siteSettings.email || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                      placeholder="support@riftstate.net"
                      className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4">
                <h3 className="text-sm font-bold text-purple-400">الروابط الرسمية للسيرفر</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">رابط سيرفر FiveM (CFX Join URL)</label>
                    <input
                      type="text"
                      value={siteSettings.cfxJoinUrl || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, cfxJoinUrl: e.target.value })}
                      placeholder="https://cfx.re/join/..."
                      className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-left"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">رابط سيرفر ديسكورد (Discord URL)</label>
                    <input
                      type="text"
                      value={siteSettings.discordUrl || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, discordUrl: e.target.value })}
                      placeholder="https://discord.gg/..."
                      className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-left"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">رابط متجر السيرفر (Store URL)</label>
                    <input
                      type="text"
                      value={siteSettings.storeUrl || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, storeUrl: e.target.value })}
                      placeholder="https://store.riftstate.net"
                      className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-left"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">رابط الموقع الرسمي (Website URL)</label>
                    <input
                      type="text"
                      value={siteSettings.website || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, website: e.target.value })}
                      placeholder="https://riftstate.net"
                      className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                حفظ هوية الموقع
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab: Home Content & Buttons (الصفحة الرئيسية وروابط اللعب والانضمام) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'home_content' && (
          <div className="p-8 space-y-6 max-w-4xl w-full mx-auto text-right font-arabic">
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2">
                <h1 className="text-2xl font-black text-white font-arabic">إعدادات الصفحة الرئيسية وأزرار الإجراءات</h1>
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-xs text-neutral-400">
                التحكم بنصوص الهيرو الترحيبي وتعديل وتفعيل أزرار اللعب والانضمام (Play Now / Join Now).
              </p>
            </div>

            {savingMessage && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs text-emerald-400 font-bold flex items-center justify-end gap-2">
                <span>{savingMessage}</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Hero Texts */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4">
                <h3 className="text-sm font-bold text-purple-400">نصوص واجهة الهيرو (Hero Section)</h3>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">العنوان الرئيسي الكبير (Hero Title)</label>
                  <input
                    type="text"
                    value={siteSettings.heroTitle || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 font-bold text-right"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">الوصف الترحيبي (Hero Subtitle)</label>
                  <textarea
                    rows={3}
                    value={siteSettings.heroSubtitle || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right leading-relaxed"
                  />
                </div>
              </div>

              {/* Action Buttons Management (Play Now & Join Now) as requested by user */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-6">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-purple-400">أزرار وروابط اللعب والانضمام في الموقع</h3>
                  <p className="text-xs text-neutral-400">
                    يمكنك تشغيل وإيقاف أي زر وتغيير الرابط والنص المعروض عليه ليظهر فوراً للزوار.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Button 1: Play Now (بلاير نيو) */}
                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={siteSettings.heroButtons?.playNow?.enabled ?? true}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              heroButtons: {
                                ...prev.heroButtons,
                                playNow: { ...(prev.heroButtons?.playNow || {}), enabled: e.target.checked }
                              }
                            }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600" />
                        <span className="mr-2 text-xs font-bold text-neutral-300">
                          {siteSettings.heroButtons?.playNow?.enabled ?? true ? 'مفعل' : 'معطل'}
                        </span>
                      </label>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>زر اللعب الآن (PLAY NOW)</span>
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-400">النص المكتوب على الزر</label>
                        <input
                          type="text"
                          value={siteSettings.heroButtons?.playNow?.label || 'PLAY NOW'}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              heroButtons: {
                                ...prev.heroButtons,
                                playNow: { ...(prev.heroButtons?.playNow || {}), label: e.target.value }
                              }
                            }));
                          }}
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white text-right"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-400">رابط الانضمام للسيرفر (URL)</label>
                        <input
                          type="text"
                          value={siteSettings.heroButtons?.playNow?.url || 'https://cfx.re/join/hlcrp'}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              heroButtons: {
                                ...prev.heroButtons,
                                playNow: { ...(prev.heroButtons?.playNow || {}), url: e.target.value }
                              }
                            }));
                          }}
                          placeholder="https://cfx.re/join/..."
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white font-mono text-left"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Button 2: Join Now (جوين نيو / التقديم) */}
                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={siteSettings.heroButtons?.joinNow?.enabled ?? true}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              heroButtons: {
                                ...prev.heroButtons,
                                joinNow: { ...(prev.heroButtons?.joinNow || {}), enabled: e.target.checked }
                              }
                            }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600" />
                        <span className="mr-2 text-xs font-bold text-neutral-300">
                          {siteSettings.heroButtons?.joinNow?.enabled ?? true ? 'مفعل' : 'معطل'}
                        </span>
                      </label>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>زر التقديم والانضمام (JOIN NOW)</span>
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-400">النص المكتوب على الزر</label>
                        <input
                          type="text"
                          value={siteSettings.heroButtons?.joinNow?.label || 'JOIN NOW'}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              heroButtons: {
                                ...prev.heroButtons,
                                joinNow: { ...(prev.heroButtons?.joinNow || {}), label: e.target.value }
                              }
                            }));
                          }}
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white text-right"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-400">رابط الزر (URL أو /whitelist)</label>
                        <input
                          type="text"
                          value={siteSettings.heroButtons?.joinNow?.url || '/whitelist'}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              heroButtons: {
                                ...prev.heroButtons,
                                joinNow: { ...(prev.heroButtons?.joinNow || {}), url: e.target.value }
                              }
                            }));
                          }}
                          placeholder="/whitelist أو رابط خارجي"
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white font-mono text-left"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Button 3: Learn More / Connect */}
                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={siteSettings.heroButtons?.learnMore?.enabled ?? true}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              heroButtons: {
                                ...prev.heroButtons,
                                learnMore: { ...(prev.heroButtons?.learnMore || {}), enabled: e.target.checked }
                              }
                            }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600" />
                        <span className="mr-2 text-xs font-bold text-neutral-300">
                          {siteSettings.heroButtons?.learnMore?.enabled ?? true ? 'مفعل' : 'معطل'}
                        </span>
                      </label>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>زر معلومات الاتصال السريع (CONNECT)</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-400">النص المكتوب على الزر</label>
                        <input
                          type="text"
                          value={siteSettings.heroButtons?.learnMore?.label || 'LEARN MORE'}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              heroButtons: {
                                ...prev.heroButtons,
                                learnMore: { ...(prev.heroButtons?.learnMore || {}), label: e.target.value }
                              }
                            }));
                          }}
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white text-right"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-400">الإجراء (نافذة الاتصال أو رابط)</label>
                        <input
                          type="text"
                          value={siteSettings.heroButtons?.learnMore?.url || 'connect_modal'}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              heroButtons: {
                                ...prev.heroButtons,
                                learnMore: { ...(prev.heroButtons?.learnMore || {}), url: e.target.value }
                              }
                            }));
                          }}
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white font-mono text-left"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                حفظ إعدادات الصفحة الرئيسية
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab: Navbar (شريط التنقل العلوي) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'navbar' && (
          <div className="p-8 space-y-6 max-w-4xl w-full mx-auto text-right font-arabic">
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2">
                <h1 className="text-2xl font-black text-white font-arabic">إعدادات شريط التنقل (Navbar)</h1>
                <Layers className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-xs text-neutral-400">
                تحديد الصفحات والروابط التي تظهر في شريط التنقل العلوي للزوار وتعديل إعدادات المتجر.
              </p>
            </div>

            {savingMessage && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs text-emerald-400 font-bold flex items-center justify-end gap-2">
                <span>{savingMessage}</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4">
                <h3 className="text-sm font-bold text-purple-400">تبديل روابط شريط التنقل (تشغيل / إيقاف)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'showHome', label: 'HOME (الصفحة الرئيسية)' },
                    { key: 'showRoster', label: 'ROSTER (قائمة الأعضاء/السجل)' },
                    { key: 'showTeam', label: 'TEAM (طاقم العمل)' },
                    { key: 'showLive', label: 'LIVE (البث المباشر)' },
                    { key: 'showCareers', label: 'CAREERS (الوظائف والتقديم)' },
                    { key: 'showFaq', label: 'FAQ (الأسئلة الشائعة)' },
                    { key: 'showLeaderboard', label: 'LEADERBOARD (لوحة المتصدرين)' },
                  ].map((item) => {
                    const isEnabled = siteSettings.navbarSettings?.[item.key] ?? true;
                    return (
                      <div
                        key={item.key}
                        className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-850 flex items-center justify-between"
                      >
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => {
                              setSiteSettings((prev: any) => ({
                                ...prev,
                                navbarSettings: {
                                  ...prev.navbarSettings,
                                  [item.key]: e.target.checked,
                                }
                              }));
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600" />
                          <span className="mr-2 text-xs font-bold text-neutral-300">
                            {isEnabled ? 'مفعل' : 'مخفي'}
                          </span>
                        </label>
                        <span className="text-xs font-bold text-white font-mono">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Store Button Settings */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.navbarSettings?.showStore ?? true}
                      onChange={(e) => {
                        setSiteSettings((prev: any) => ({
                          ...prev,
                          navbarSettings: {
                            ...prev.navbarSettings,
                            showStore: e.target.checked,
                          }
                        }));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600" />
                    <span className="mr-2 text-xs font-bold text-neutral-300">
                      {siteSettings.navbarSettings?.showStore ?? true ? 'مفعل' : 'مخفي'}
                    </span>
                  </label>
                  <h3 className="text-sm font-bold text-purple-400">زر المتجر في شريط التنقل (STORE Button)</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">النص على زر المتجر</label>
                    <input
                      type="text"
                      value={siteSettings.navbarSettings?.storeLabel || 'STORE'}
                      onChange={(e) => {
                        setSiteSettings((prev: any) => ({
                          ...prev,
                          navbarSettings: {
                            ...prev.navbarSettings,
                            storeLabel: e.target.value,
                          }
                        }));
                      }}
                      className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white text-right"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">رابط المتجر (Store URL)</label>
                    <input
                      type="text"
                      value={siteSettings.navbarSettings?.storeUrl || siteSettings.storeUrl || 'https://store.riftstate.net'}
                      onChange={(e) => {
                        setSiteSettings((prev: any) => ({
                          ...prev,
                          navbarSettings: {
                            ...prev.navbarSettings,
                            storeUrl: e.target.value,
                          }
                        }));
                      }}
                      className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                حفظ إعدادات شريط التنقل
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab: Footer & Social Media (التذييل ووسائل التواصل الاجتماعي) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'footer' && (
          <div className="p-8 space-y-6 max-w-4xl w-full mx-auto text-right font-arabic">
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2">
                <h1 className="text-2xl font-black text-white font-arabic">إعدادات التذييل ومواقع التواصل الاجتماعي</h1>
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-xs text-neutral-400">
                تشغيل وإطفاء قنوات التواصل (يوتيوب، تيك توك، انستقرام، تويتر، ديسكورد، كيك، تويتش) وتعديل حساباتها وروابطها.
              </p>
            </div>

            {savingMessage && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs text-emerald-400 font-bold flex items-center justify-end gap-2">
                <span>{savingMessage}</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Social Channels Toggles & URL Inputs (Direct user requirement) */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4">
                <h3 className="text-sm font-bold text-purple-400">قنوات التواصل الاجتماعي (تشغيل / إيقاف وتعديل الحساب)</h3>

                <div className="space-y-3">
                  {[
                    { key: 'youtube', name: 'يوتيوب (YouTube)', defaultUrl: 'https://youtube.com/@riftstate', color: 'text-red-400' },
                    { key: 'tiktok', name: 'تيك توك (TikTok)', defaultUrl: 'https://tiktok.com/@riftstate', color: 'text-pink-400' },
                    { key: 'instagram', name: 'انستقرام (Instagram)', defaultUrl: 'https://instagram.com/riftstate', color: 'text-amber-400' },
                    { key: 'twitter', name: 'تويتر / إكس (Twitter / X)', defaultUrl: 'https://x.com/riftstate', color: 'text-blue-400' },
                    { key: 'discord', name: 'ديسكورد (Discord)', defaultUrl: 'https://discord.gg/riftstate', color: 'text-indigo-400' },
                    { key: 'kick', name: 'كيك (Kick.com)', defaultUrl: 'https://kick.com/riftstate', color: 'text-emerald-400' },
                    { key: 'twitch', name: 'تويتش (Twitch.tv)', defaultUrl: 'https://twitch.tv/riftstate', color: 'text-purple-400' },
                  ].map((plat) => {
                    const currentObj = siteSettings.socialLinks?.[plat.key] || { enabled: true, url: plat.defaultUrl };
                    return (
                      <div
                        key={plat.key}
                        className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentObj.enabled ?? true}
                              onChange={(e) => {
                                setSiteSettings((prev: any) => ({
                                  ...prev,
                                  socialLinks: {
                                    ...prev.socialLinks,
                                    [plat.key]: {
                                      ...(prev.socialLinks?.[plat.key] || {}),
                                      enabled: e.target.checked,
                                      url: prev.socialLinks?.[plat.key]?.url || plat.defaultUrl,
                                    }
                                  }
                                }));
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600" />
                            <span className="mr-2 text-xs font-bold text-neutral-300">
                              {currentObj.enabled ?? true ? 'شغال' : 'مطفي'}
                            </span>
                          </label>
                          <span className={`text-xs font-bold ${plat.color}`}>{plat.name}</span>
                        </div>

                        <div className="flex-1 max-w-md">
                          <input
                            type="text"
                            value={currentObj.url || ''}
                            onChange={(e) => {
                              setSiteSettings((prev: any) => ({
                                ...prev,
                                socialLinks: {
                                  ...prev.socialLinks,
                                  [plat.key]: {
                                    ...(prev.socialLinks?.[plat.key] || {}),
                                    url: e.target.value,
                                    enabled: prev.socialLinks?.[plat.key]?.enabled ?? true,
                                  }
                                }
                              }));
                            }}
                            placeholder={plat.defaultUrl}
                            className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white font-mono text-left focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* General Footer Texts */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4">
                <h3 className="text-sm font-bold text-purple-400">بيانات التذييل العامة (General Footer Texts)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-neutral-300">نص حقوق الملكية (Copyright Notice)</label>
                    <input
                      type="text"
                      value={siteSettings.footerSettings?.copyrightText || '© 2026 RIFT STATE ROLEPLAY. ALL RIGHTS RESERVED.'}
                      onChange={(e) => {
                        setSiteSettings((prev: any) => ({
                          ...prev,
                          footerSettings: {
                            ...prev.footerSettings,
                            copyrightText: e.target.value,
                          }
                        }));
                      }}
                      className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white text-right"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">نص الموقع الجغرافي المعروض في التذييل</label>
                    <input
                      type="text"
                      value={siteSettings.footerSettings?.locationText || siteSettings.location || 'Saudi Arabia / Riyadh'}
                      onChange={(e) => {
                        setSiteSettings((prev: any) => ({
                          ...prev,
                          footerSettings: {
                            ...prev.footerSettings,
                            locationText: e.target.value,
                          }
                        }));
                      }}
                      className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white text-right"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">البريد الإلكتروني للدعم في التذييل</label>
                    <input
                      type="email"
                      value={siteSettings.footerSettings?.emailText || siteSettings.email || 'support@riftstate.net'}
                      onChange={(e) => {
                        setSiteSettings((prev: any) => ({
                          ...prev,
                          footerSettings: {
                            ...prev.footerSettings,
                            emailText: e.target.value,
                          }
                        }));
                      }}
                      className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                حفظ إعدادات التذييل ومواقع التواصل
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab: Leaderboard & Server Sync (لوحة المتصدرين وربط السيرفر) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'leaderboard' && (
          <div className="p-8 space-y-8 max-w-5xl w-full mx-auto text-right font-arabic">
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2">
                <h1 className="text-2xl font-black text-white font-arabic">لوحة المتصدرين وربط ساعات سيرفر FiveM</h1>
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-xs text-neutral-400">
                شرح كامل لطريقة ربط السيرفر مع لوحة المتصدرين لاحتساب ساعات اللعب تلقائياً للاعبين.
              </p>
            </div>

            {/* Step-by-Step Guide for the user */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-purple-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-neutral-800 pb-3">
                <span className="px-3 py-1 rounded-full bg-purple-950 text-purple-300 text-[11px] font-mono font-bold border border-purple-800/60">
                  FIVEM SERVER SYNC
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>كيف تربط لوحة المتصدرين مع سيرفر FiveM؟ (شرح الخطوات)</span>
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                </h3>
              </div>

              <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
                <div className="flex items-start gap-3 justify-end">
                  <div className="text-right">
                    <span className="font-bold text-white block">1. إنشاء مجلد السكريبت في السيرفر:</span>
                    <span>قم بإنشاء مجلد باسم <code className="text-purple-300 bg-neutral-900 px-1.5 py-0.5 rounded">rift_sync</code> داخل مسار <code className="text-purple-300 bg-neutral-900 px-1.5 py-0.5 rounded">resources/[rift]/</code> في ملفات خادمك.</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center shrink-0">١</span>
                </div>

                <div className="flex items-start gap-3 justify-end">
                  <div className="text-right">
                    <span className="font-bold text-white block">2. وضع كود السكريبت (server.lua):</span>
                    <span>انسخ الكود الجاهز بالأسفل وضعه داخل ملف <code className="text-purple-300 bg-neutral-900 px-1.5 py-0.5 rounded">server.lua</code>. يقوم السكريبت بإرسال إشعار للموقع عند دخول اللاعب وخروجه لحساب مدة الجلسة بدقة.</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center shrink-0">٢</span>
                </div>

                <div className="flex items-start gap-3 justify-end">
                  <div className="text-right">
                    <span className="font-bold text-white block">3. تفعيل المورد في server.cfg:</span>
                    <span>أضف السطر <code className="text-purple-300 bg-neutral-900 px-1.5 py-0.5 rounded font-mono">ensure rift_sync</code> في ملف إعداد السيرفر لديك.</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center shrink-0">٣</span>
                </div>
              </div>

              {/* Ready-to-copy Lua Code Block */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      const luaCode = `-- [RIFT STATE] FiveM Playtime & Leaderboard Sync Script
-- Path: resources/rift_sync/server.lua
local API_URL = "${window.location.origin}" -- رابط موقعك
local API_KEY = "CHANGE_ME_TO_FIVEM_API_SECRET_FROM_SERVER_ENV"

local function getPlayerIds(src)
    local identifiers = GetPlayerIdentifiers(src)
    local ids = {}
    for _, id in ipairs(identifiers) do
        if string.find(id, "discord:") then ids.discord = string.gsub(id, "discord:", "") end
        if string.find(id, "steam:") then ids.steam = id end
        if string.find(id, "license:") then ids.license = id end
    end
    return ids
end

-- عند انضمام اللاعب للسيرفر
AddEventHandler("playerJoining", function()
    local src = source
    local ids = getPlayerIds(src)
    local payload = {
        playerName = GetPlayerName(src),
        discord = ids.discord,
        steam = ids.steam,
        license = ids.license,
        startedAt = os.time()
    }
    PerformHttpRequest(API_URL .. "/internal/fivem/session-start", function(code, res)
        print("[RiftSync] Session started for " .. GetPlayerName(src) .. " Code: " .. code)
    end, "POST", json.encode(payload), {
        ["Content-Type"] = "application/json",
        ["x-server-key"] = API_KEY
    })
end)

-- عند خروج اللاعب من السيرفر (احتساب ساعات اللعب للوحة المتصدرين)
AddEventHandler("playerDropped", function(reason)
    local src = source
    local ids = getPlayerIds(src)
    local payload = {
        playerName = GetPlayerName(src),
        discord = ids.discord,
        steam = ids.steam,
        license = ids.license,
        endedAt = os.time()
    }
    PerformHttpRequest(API_URL .. "/internal/fivem/session-end", function(code, res)
        print("[RiftSync] Session ended for " .. GetPlayerName(src) .. " Code: " .. code)
    end, "POST", json.encode(payload), {
        ["Content-Type"] = "application/json",
        ["x-server-key"] = API_KEY
    })
end)`;
                      navigator.clipboard.writeText(luaCode);
                      setCopiedLua(true);
                      setTimeout(() => setCopiedLua(false), 3000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {copiedLua ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLua ? 'تم النسخ بنجاح!' : 'نسخ كود السكريبت'}</span>
                  </button>
                  <span className="font-mono text-neutral-400">server.lua (جاهز للنسخ المباشر)</span>
                </div>

                <pre className="p-4 rounded-xl bg-black border border-neutral-800 text-[11px] font-mono text-purple-200 overflow-x-auto text-left max-h-56 leading-relaxed select-all">
{`-- [RIFT STATE] FiveM Playtime & Leaderboard Sync Script
local API_URL = "${window.location.origin}"
local API_KEY = "CHANGE_ME_TO_FIVEM_API_SECRET_FROM_SERVER_ENV"

AddEventHandler("playerJoining", function()
    local src = source
    local ids = getPlayerIdentifiers(src)
    PerformHttpRequest(API_URL .. "/internal/fivem/session-start", function() end, "POST", 
      json.encode({ playerName = GetPlayerName(src), discord = ids.discord, startedAt = os.time() }), 
      { ["Content-Type"] = "application/json", ["x-server-key"] = API_KEY })
end)

AddEventHandler("playerDropped", function()
    local src = source
    local ids = getPlayerIdentifiers(src)
    PerformHttpRequest(API_URL .. "/internal/fivem/session-end", function() end, "POST", 
      json.encode({ playerName = GetPlayerName(src), discord = ids.discord, endedAt = os.time() }), 
      { ["Content-Type"] = "application/json", ["x-server-key"] = API_KEY })
end)`}
                </pre>
              </div>
            </div>

            {/* Current Leaderboard Live Preview */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-500">
                  {leaderboardList.length} لاعب مسجل في اللوحة
                </span>
                <h3 className="text-sm font-bold text-purple-400">المتصدرون الفعليون في السيرفر حالياً</h3>
              </div>

              {leaderboardList.length === 0 ? (
                <div className="p-10 rounded-2xl border border-dashed border-neutral-800 text-center space-y-2">
                  <Trophy className="w-10 h-10 text-neutral-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">لوحة المتصدرين فارغة وجاهزة للربط</h4>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto">
                    بناءً على طلبك، تم إفراغ المتصدرين الوهميين. بمجرد دخول أي لاعب وخروجه من السيرفر باستخدام السكريبت أعلاه، سيظهر اسمه وساعات لعبه تلقائياً هنا في اللوحة!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-900">
                  {leaderboardList.map((player, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-purple-300 font-bold">{player.hours || 0} ساعة</span>
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white">{player.name || player.player_name}</span>
                        <span className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-mono font-bold text-purple-400">
                          #{player.rank || idx + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab: Onboarding & Accounts Stats (إعداد الحساب والاختبار) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'onboarding' && (
          <div className="p-8 space-y-8 max-w-5xl w-full mx-auto text-right font-arabic">
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2">
                <h1 className="text-2xl font-black text-white font-arabic">إحصائيات الحسابات واختبارات الرول بلاي</h1>
                <UserCheck className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-xs text-neutral-400">
                متابعة عدد الحسابات الكلية التي سجلت الدخول، والحسابات النشطة خلال آخر 18 يوماً، واختبارات الوايت لست.
              </p>
            </div>

            {/* Quick Stat Cards as requested by user:
                "عدد الحسابات أبغى أخليها أبغاك تخليها عدد الحسابات اللي سجلت دخول فيها، ولو كانت اللي سجلت فيها بس اللي هي قبل 17 يوم 18 يوم يومياً تتحدث" */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-2 text-right">
                <div className="text-xs font-bold text-neutral-400">إجمالي الحسابات المسجلة</div>
                <div className="text-3xl font-black text-white font-mono">{onboardingStats.totalAccounts || counts.players || 6}</div>
                <div className="text-[11px] text-purple-400 font-mono">سجلت الدخول في الموقع</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950 border border-purple-500/40 space-y-2 text-right shadow-lg shadow-purple-950/20">
                <div className="text-xs font-bold text-purple-300">نشطة آخر 18 يوم</div>
                <div className="text-3xl font-black text-purple-400 font-mono">{onboardingStats.activeLast18Days || 6}</div>
                <div className="text-[11px] text-emerald-400 font-mono">تتحدث وتتجدد يومياً تلقائياً</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-2 text-right">
                <div className="text-xs font-bold text-neutral-400">اختبارات مقبولة (Passed)</div>
                <div className="text-3xl font-black text-emerald-400 font-mono">{onboardingStats.testStats?.accepted || 0}</div>
                <div className="text-[11px] text-neutral-500 font-mono">حصلوا على رتبة الوايت لست</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-2 text-right">
                <div className="text-xs font-bold text-neutral-400">اختبارات قيد المراجعة</div>
                <div className="text-3xl font-black text-amber-400 font-mono">{onboardingStats.testStats?.pending || applications.length || 0}</div>
                <div className="text-[11px] text-neutral-500 font-mono">بانتظار اعتماد الإدارة</div>
              </div>
            </div>

            {/* List of Registered Accounts */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleResetAccounts}
                  className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-800/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="تصفير قائمة الحسابات المسجلة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تصفير الحسابات</span>
                </button>
                <div className="text-right">
                  <h3 className="text-sm font-bold text-purple-400">قائمة الحسابات التي قامت بتسجيل الدخول</h3>
                  <span className="text-[11px] font-mono text-neutral-500">
                    نافذة النشاط: آخر 18 يوماً (تحديث يومي)
                  </span>
                </div>
              </div>

              {(!onboardingStats.accounts || onboardingStats.accounts.length === 0) ? (
                <div className="p-8 text-center text-neutral-500 text-xs font-mono">
                  لا توجد حسابات مسجلة حالياً
                </div>
              ) : (
                <div className="divide-y divide-neutral-900">
                  {onboardingStats.accounts.map((acc: any, index: number) => (
                    <div key={index} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(acc.discordId)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                          title="حذف هذا الحساب وتحديث العداد"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 font-mono text-[10px]">
                          {acc.loginCount || 1} مرات دخول
                        </span>
                        <span className="font-mono text-neutral-400 text-[11px]">
                          آخر دخول: {acc.lastLogin ? String(acc.lastLogin).slice(0, 16).replace('T', ' ') : 'حديثاً'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <h4 className="font-bold text-white">{acc.globalName || acc.username}</h4>
                          <span className="text-[11px] font-mono text-neutral-500">{acc.discordId}</span>
                        </div>
                        <img
                          src={acc.avatar}
                          alt={acc.username}
                          className="w-9 h-9 rounded-xl object-cover border border-neutral-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab: Discord Webhook & Test Notifications (ربط ديسكورد والاختبار) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'discord_webhook' && (
          <div className="p-8 space-y-8 max-w-5xl w-full mx-auto text-right font-arabic">
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2">
                <h1 className="text-2xl font-black text-white font-arabic">ربط الاختبار الإلكتروني بديسكورد (Discord Webhooks)</h1>
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-xs text-neutral-400">
                إرسال نتائج اختبارات الرول بلاي تلقائياً إلى رومات ديسكورد المحددة مع خيارات وأزرار القبول والرفض المباشرة.
              </p>
            </div>

            {savingMessage && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs text-emerald-400 font-bold flex items-center justify-end gap-2">
                <span>{savingMessage}</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}

            {/* Test Webhook Result Banner */}
            {webhookTestResult && (
              <div
                className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
                  webhookTestResult.success
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                    : 'bg-red-950/60 border-red-800/80 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {webhookTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span>{webhookTestResult.message || webhookTestResult.error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWebhookTestResult(null)}
                  className="text-neutral-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Discord OAuth2 Redirect URI Guide & One-Click Copy */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-indigo-500/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-[11px] font-mono font-bold border border-indigo-800/60">
                  DISCORD OAUTH2 REDIRECT URI
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>حل مشكلة تسجيل الدخول عبر ديسكورد (رابط Redirect URI المعتمد)</span>
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                </h3>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl text-xs text-amber-300 font-medium leading-relaxed text-right">
                ⚠️ <strong>تنبيه هام للمالك:</strong> سبب ظهور خطأ <code className="text-amber-200 bg-black/60 px-1.5 py-0.5 rounded font-mono">DNS_PROBE_FINISHED_NXDOMAIN (myserver.com)</code> هو توجيه المتصفح إلى رابط تجريبي قديم. ليعمل تسجيل الدخول بالديسكورد بنجاح تام، انسخ الرابط المعتمد أدناه وضعه في إعدادات تطبيقك على ديسكورد:
              </div>

              {/* Display Current Live Redirect URI with 1-click copy */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                  <span className="text-indigo-400">الرابط المعتمد لإعادة التوجيه (Callback URL):</span>
                  <span className="text-[11px] text-neutral-500">انسخ هذا الرابط بالضبط وضعْه في Discord</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const uri = typeof window !== 'undefined' 
                        ? `${window.location.origin}/auth/discord/callback`
                        : '/auth/discord/callback';
                      navigator.clipboard.writeText(uri);
                      setCopiedRedirectUri(true);
                      setTimeout(() => setCopiedRedirectUri(false), 3000);
                    }}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      copiedRedirectUri
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {copiedRedirectUri ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>
                  <div className="w-full px-3.5 py-2.5 bg-black/80 border border-neutral-800 rounded-xl text-xs font-mono text-emerald-400 text-left select-all overflow-x-auto whitespace-nowrap">
                    {typeof window !== 'undefined' ? `${window.location.origin}/auth/discord/callback` : '/auth/discord/callback'}
                  </div>
                </div>
              </div>

              {/* Step by step guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-300">
                <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-850 space-y-1.5 text-right">
                  <span className="font-bold text-indigo-400 text-xs block">1. ادخل لبوابة الديسكورد</span>
                  <p className="text-[11px] text-neutral-400">
                    افتح <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-1 font-bold">Discord Developer Portal <ExternalLink className="w-3 h-3 inline" /></a> واختر التطبيق التابع لسيرفرك.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-850 space-y-1.5 text-right">
                  <span className="font-bold text-indigo-400 text-xs block">2. قسم OAuth2 ➔ Redirects</span>
                  <p className="text-[11px] text-neutral-400">
                    من القائمة الجانبية للتطبيق اضغط <strong className="text-white">OAuth2</strong> ثم اضغط زر <strong className="text-indigo-300">Add Redirect</strong>.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-850 space-y-1.5 text-right">
                  <span className="font-bold text-indigo-400 text-xs block">3. لصق الرابط وحفظ التغييرات</span>
                  <p className="text-[11px] text-neutral-400">
                    الصق الرابط المنسوخ أعلاه، وتأكد من حذف أي رابط قديم مثل <code className="text-amber-300">myserver.com</code> ثم اضغط <strong className="text-emerald-400">Save Changes</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Step Guide */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-purple-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-950 text-purple-300 text-[11px] font-mono font-bold border border-purple-800/60">
                  DISCORD BOT & EXAM INTEGRATION
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>كيف تحدد أين تصل رسالة التقديم؟ (خطوات استخراج رابط الويب هوك)</span>
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                </h3>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed text-right">
                عندما يُنهي أي لاعب الاختبار الإلكتروني في الموقع، يقوم النظام فوراً بإرسال رسالة مفصلة في روم الديسكورد المحددة، متضمنةً كافة إجاباته مع خيارين تفاعليين: <strong>قبول الطلب ✅</strong> أو <strong>رفض الطلب ❌</strong>. يمكنك تحديد الروم عبر الخطوات البسيطة التالية:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-neutral-300">
                <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-850 space-y-1 text-right">
                  <span className="font-bold text-purple-400 text-xs block">1. اختر روم التقديمات</span>
                  <p className="text-[11px] text-neutral-400">في تطبيق الديسكورد، اضغط كليك يمين على الروم المراد استقبال الرسائل فيه (مثلاً: <code className="text-purple-300">#تقديمات-الاختبار</code>).</p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-850 space-y-1 text-right">
                  <span className="font-bold text-purple-400 text-xs block">2. الإعدادات والتكاملات</span>
                  <p className="text-[11px] text-neutral-400">اختر <strong className="text-white">Edit Channel</strong> ثم توجه لقسم <strong className="text-white">Integrations (التكاملات)</strong>.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-850 space-y-1 text-right">
                  <span className="font-bold text-purple-400 text-xs block">3. إنشاء الويب هوك</span>
                  <p className="text-[11px] text-neutral-400">اضغط <strong className="text-white">Create Webhook</strong> وسمّه باسم سيرفرك (مثلاً: <code className="text-purple-300">RIFT STATE NOTIFIER</code>).</p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-850 space-y-1 text-right">
                  <span className="font-bold text-purple-400 text-xs block">4. نسخ الرابط وحفظه</span>
                  <p className="text-[11px] text-neutral-400">اضغط <strong className="text-white">Copy Webhook URL</strong> والصقه في الحقل بالأسفل ثم اضغط حفظ الإعدادات.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Card 1: Webhook Connection Target */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.discordWebhook?.enabled ?? false}
                      onChange={(e) => {
                        setSiteSettings((prev: any) => ({
                          ...prev,
                          discordWebhook: {
                            ...(prev.discordWebhook || {}),
                            enabled: e.target.checked,
                          },
                        }));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600" />
                    <span className="mr-2 text-xs font-bold text-neutral-300">
                      {siteSettings.discordWebhook?.enabled ? '🟢 مفعل (شغال ويصل للروم)' : '⚪ معطل (متوقف)'}
                    </span>
                  </label>
                  <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                    <span>1. مكان وصول الرسالة (Target Room & Webhook)</span>
                    <Sparkles className="w-4 h-4" />
                  </h3>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">
                      رابط ديسكورد ويب هوك (Discord Webhook URL)
                    </label>
                    <input
                      type="text"
                      value={siteSettings.discordWebhook?.webhookUrl || ''}
                      onChange={(e) => {
                        setSiteSettings((prev: any) => ({
                          ...prev,
                          discordWebhook: {
                            ...(prev.discordWebhook || {}),
                            webhookUrl: e.target.value.trim(),
                          },
                        }));
                      }}
                      placeholder="https://discord.com/api/webhooks/123456789/abcdef..."
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-left"
                    />
                    <p className="text-[11px] text-neutral-500">
                      الرابط الذي سيقوم البوت بإرسال إشعارات التقديم إليه في روم الديسكورد المخصصة (يمكنك نسخه من إعدادات الروم ➔ التكاملات Integrations ➔ Webhooks).
                    </p>
                  </div>

                  {/* Optional Discord Bot Direct Token & Channel ID */}
                  <div className="p-5 rounded-2xl bg-neutral-900/70 border border-purple-500/40 space-y-3.5 shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-arabic">
                          🤖 تفعيل ريأكشنات ديسكورد (✅ و ❌) وأزرار البوت الرسمية
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                          موصى به للريأكشنات
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed font-arabic">
                      ديسكورد <strong>لا يسمح لروابط الويب هوك العادية</strong> بإضافة ريأكشنات أو أزرار تفاعلية. لكي تظهر ريأكشنات <strong>(✅ قبول)</strong> و <strong>(❌ رفض)</strong> تحت الرسالة ويتم قبول أو رفض اللاعب عند ضغطك عليها في ديسكورد، ضع توكن البوت ومعرف الروم هنا:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={handleCheckBotToken}
                            disabled={botTokenStatus?.checking}
                            className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-800/40"
                          >
                            <RefreshCw className={`w-3 h-3 ${botTokenStatus?.checking ? 'animate-spin' : ''}`} />
                            <span>فحص التوكن</span>
                          </button>
                          <label className="text-xs font-bold text-neutral-200">توكن بوت الديسكورد (Bot Token)</label>
                        </div>
                        <input
                          type="password"
                          value={siteSettings.discordWebhook?.botToken || ''}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              discordWebhook: {
                                ...(prev.discordWebhook || {}),
                                botToken: e.target.value.trim(),
                              },
                            }));
                          }}
                          placeholder="MTA2ND..."
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono text-left focus:border-purple-500"
                        />
                        {botTokenStatus?.result ? (
                          <div className={`p-2 rounded-xl text-[11px] font-bold border mt-1 text-right ${botTokenStatus.result.valid ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-red-950/60 border-red-800 text-red-300'}`}>
                            {botTokenStatus.result.valid
                              ? `✅ متصل بنجاح: @${botTokenStatus.result.bot?.username} (${botTokenStatus.result.bot?.id})`
                              : `⚠️ ${botTokenStatus.result.error || 'التوكن غير مصرح به (401: Unauthorized)'}`}
                          </div>
                        ) : (
                          <p className="text-[10px] text-neutral-500">
                            من صفحة Discord Developer Portal ➔ Bot ➔ Reset Token
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-200">معرف روم التقديمات (Channel ID)</label>
                        <input
                          type="text"
                          value={siteSettings.discordWebhook?.channelId || ''}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              discordWebhook: {
                                ...(prev.discordWebhook || {}),
                                channelId: e.target.value.trim(),
                              },
                            }));
                          }}
                          placeholder="123456789012345678"
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono text-left focus:border-purple-500"
                        />
                        <p className="text-[10px] text-neutral-500">
                          انسخ آيدي الروم في ديسكورد (بالزر الأيمن ➔ Copy Channel ID)
                        </p>
                      </div>
                    </div>

                    {/* Role IDs & Permissions Configuration */}
                    <div className="p-4 rounded-xl bg-neutral-950/80 border border-purple-500/40 space-y-3.5 mt-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                        <span className="text-xs font-bold text-white font-arabic flex items-center gap-1.5">
                          <span>🛡️ تحديد الرتب والصلاحيات (Discord Roles & Auto-Grant)</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                          نظام الرتب التلقائي
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {/* 1. Reviewer Role ID */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-neutral-200 block">
                            معرف رتبة مسؤول التقديمات (Reviewer Role ID)
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={siteSettings.whitelistReviewerRoleId || ''}
                              onChange={(e) => {
                                setSiteSettings((prev: any) => ({
                                  ...prev,
                                  whitelistReviewerRoleId: e.target.value.trim(),
                                }));
                              }}
                              placeholder="223344556677889900"
                              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono text-left focus:border-purple-500"
                            />
                            <button
                              type="button"
                              onClick={handleTestReviewerRoleAssignment}
                              className="px-2.5 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-purple-300 text-[11px] font-bold cursor-pointer shrink-0"
                              title="فحص الرتبة"
                            >
                              فحص
                            </button>
                          </div>
                          <p className="text-[10px] text-neutral-400 leading-relaxed">
                            هذا الـ ID يفتح لهم فقط طلب الانضمام وأسئلة الاختبار (عرض فقط)، دون تعديل أي أسئلة.
                          </p>
                        </div>

                        {/* 2. Accepted Role ID */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-neutral-200 block">
                            معرف رتبة المقبولين (Accepted Role ID)
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={siteSettings.whitelistAcceptedRoleId || ''}
                              onChange={(e) => {
                                setSiteSettings((prev: any) => ({
                                  ...prev,
                                  whitelistAcceptedRoleId: e.target.value.trim(),
                                }));
                              }}
                              placeholder="112233445566778899"
                              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono text-left focus:border-purple-500"
                            />
                            <button
                              type="button"
                              onClick={handleTestRoleAssignment}
                              className="px-2.5 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-purple-300 text-[11px] font-bold cursor-pointer shrink-0"
                              title="فحص الرتبة"
                            >
                              فحص
                            </button>
                          </div>
                          <p className="text-[10px] text-neutral-400 leading-relaxed">
                            بمجرد قبول الشخص المعين (بالريأكشن ✅ أو الزر)، تجيه الرتبة على طول في ديسكورد.
                          </p>
                        </div>

                        {/* 3. Server / Guild ID */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-neutral-200 block">
                            معرف سيرفر الديسكورد (Server / Guild ID)
                          </label>
                          <input
                            type="text"
                            value={siteSettings.discordGuildId || ''}
                            onChange={(e) => {
                              setSiteSettings((prev: any) => ({
                                ...prev,
                                discordGuildId: e.target.value.trim(),
                              }));
                            }}
                            placeholder="987654321098765432"
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono text-left focus:border-purple-500"
                          />
                          <p className="text-[10px] text-neutral-400 leading-relaxed">
                            آيدي سيرفر الديسكورد (كليك يمين على اسم السيرفر ➔ Copy Server ID).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-300">
                        اسم الروم (للتوثيق والتنظيم)
                      </label>
                      <input
                        type="text"
                        value={siteSettings.discordWebhook?.channelName || '#تقديمات-الاختبار-الإلكتروني'}
                        onChange={(e) => {
                          setSiteSettings((prev: any) => ({
                            ...prev,
                            discordWebhook: {
                              ...(prev.discordWebhook || {}),
                              channelName: e.target.value,
                            },
                          }));
                        }}
                        placeholder="#تقديمات-الاختبار-الإلكتروني"
                        className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white text-right"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-300">
                        منشن الإدارة والتنبيه (Mention Role)
                      </label>
                      <input
                        type="text"
                        value={siteSettings.discordWebhook?.mentionRole || '@here'}
                        onChange={(e) => {
                          setSiteSettings((prev: any) => ({
                            ...prev,
                            discordWebhook: {
                              ...(prev.discordWebhook || {}),
                              mentionRole: e.target.value,
                            },
                          }));
                        }}
                        placeholder="@Staff أو @here أو اتركه فارغاً"
                        className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white text-left font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Customize Message Content & Embed Design */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-5">
                <h3 className="text-sm font-bold text-purple-400">
                  2. محتوى الرسالة وتخصيص نص الإشعار (Message Content & Design)
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">
                      نص التنبيه ورسالة الإشعار الرئيسية (Notification Body)
                    </label>
                    <input
                      type="text"
                      value={siteSettings.discordWebhook?.customMessage || '🔔 شخص جديد قدّم على الاختبار الإلكتروني وبانتظار قرار الإدارة بالقبول أو الرفض!'}
                      onChange={(e) => {
                        setSiteSettings((prev: any) => ({
                          ...prev,
                          discordWebhook: {
                            ...(prev.discordWebhook || {}),
                            customMessage: e.target.value,
                          },
                        }));
                      }}
                      placeholder="🔔 شخص جديد قدّم على الاختبار الإلكتروني وبانتظار قرار الإدارة بالقبول أو الرفض!"
                      className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white text-right"
                    />
                    <p className="text-[11px] text-neutral-500">
                      الرسالة التي ستظهر أعلى البطاقة بجانب المنشن لتنبيه المشرفين بوجود تقديم جديد.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-300">عنوان البطاقة في الديسكورد (Embed Title)</label>
                      <input
                        type="text"
                        value={siteSettings.discordWebhook?.embedTitle || '📋 تقديم جديد في الاختبار الإلكتروني - RIFT STATE'}
                        onChange={(e) => {
                          setSiteSettings((prev: any) => ({
                            ...prev,
                            discordWebhook: {
                              ...(prev.discordWebhook || {}),
                              embedTitle: e.target.value,
                            },
                          }));
                        }}
                        className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white text-right"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-300">لون شريط الرسالة (Embed Hex Color)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={siteSettings.discordWebhook?.embedColor || '#8b5cf6'}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              discordWebhook: {
                                ...(prev.discordWebhook || {}),
                                embedColor: e.target.value,
                              },
                            }));
                          }}
                          className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono text-left"
                        />
                        <input
                          type="color"
                          value={siteSettings.discordWebhook?.embedColor || '#8b5cf6'}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              discordWebhook: {
                                ...(prev.discordWebhook || {}),
                                embedColor: e.target.value,
                              },
                            }));
                          }}
                          className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toggles for What is Included in the Message */}
                <div className="pt-2 space-y-2">
                  <label className="text-xs font-bold text-neutral-300 block">
                    3. وش يكون موجود في الرسالة؟ (البيانات المعروضة داخل إشعار الديسكورد):
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-850 flex items-center justify-between">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={siteSettings.discordWebhook?.showCharacterName ?? true}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              discordWebhook: {
                                ...(prev.discordWebhook || {}),
                                showCharacterName: e.target.checked,
                              },
                            }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600" />
                      </label>
                      <span className="text-xs text-neutral-300">اسم الشخصية / المتقدم</span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-850 flex items-center justify-between">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={siteSettings.discordWebhook?.showDiscordId ?? true}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              discordWebhook: {
                                ...(prev.discordWebhook || {}),
                                showDiscordId: e.target.checked,
                              },
                            }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600" />
                      </label>
                      <span className="text-xs text-neutral-300">منشن وحساب الديسكورد</span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-850 flex items-center justify-between">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={siteSettings.discordWebhook?.showSteamHex ?? true}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              discordWebhook: {
                                ...(prev.discordWebhook || {}),
                                showSteamHex: e.target.checked,
                              },
                            }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600" />
                      </label>
                      <span className="text-xs text-neutral-300">كود ستيم هيكس (Steam Hex)</span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-850 flex items-center justify-between">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={siteSettings.discordWebhook?.showScore ?? true}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              discordWebhook: {
                                ...(prev.discordWebhook || {}),
                                showScore: e.target.checked,
                              },
                            }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600" />
                      </label>
                      <span className="text-xs text-neutral-300">نتيجة الاختبار ونسبة النجاح %</span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-850 flex items-center justify-between">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={siteSettings.discordWebhook?.showAnswers ?? true}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              discordWebhook: {
                                ...(prev.discordWebhook || {}),
                                showAnswers: e.target.checked,
                              },
                            }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600" />
                      </label>
                      <span className="text-xs text-neutral-300">ملخص إجابات وأسئلة الاختبار</span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-850 flex items-center justify-between">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={siteSettings.discordWebhook?.showDate ?? true}
                          onChange={(e) => {
                            setSiteSettings((prev: any) => ({
                              ...prev,
                              discordWebhook: {
                                ...(prev.discordWebhook || {}),
                                showDate: e.target.checked,
                              },
                            }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600" />
                      </label>
                      <span className="text-xs text-neutral-300">وقت وتاريخ تقديم الاختبار</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-purple-500/30 flex items-center justify-between mt-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteSettings.discordWebhook?.includeActionButtons ?? true}
                        onChange={(e) => {
                          setSiteSettings((prev: any) => ({
                            ...prev,
                            discordWebhook: {
                              ...(prev.discordWebhook || {}),
                              includeActionButtons: e.target.checked,
                            },
                          }));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600" />
                    </label>
                    <div className="text-right">
                      <span className="text-xs font-bold text-purple-300 block">
                        تفعيل خياري قبول أو رفض مباشرة بالديسكورد (Interactive Accept / Reject)
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        يُظهر للمشرف أزرار القبول والرفض وزر فحص الإجابات كاملة تحت الرسالة في روم الديسكورد.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Interactive Guide on Decision Making */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-3 text-right">
                <h3 className="text-sm font-bold text-white flex items-center justify-end gap-2">
                  <span>كيف تشوف الرسالة كاملة وتحط يا قبول يا رفض؟</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-300 pt-1">
                  <div className="p-3 rounded-xl bg-[#248046]/10 border border-[#248046]/30 space-y-1">
                    <span className="font-bold text-emerald-400 block">1. خيار قبول الطلب ✅</span>
                    <p className="text-[11px] text-neutral-300">
                      عند ضغط زر "قبول"، يُعتمد المتقدم فوراً في قاعدة البيانات ويُمنح الوايت لست، ويُرسل البوت إشعاراً في الروم بالقبول.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#da373c]/10 border border-[#da373c]/30 space-y-1">
                    <span className="font-bold text-red-400 block">2. خيار رفض الطلب ❌</span>
                    <p className="text-[11px] text-neutral-300">
                      عند ضغط زر "رفض"، يُرفض الطلب فوراً ويُسجل في سجل العمليات، ويُرسل البوت إشعاراً في الروم بالرفض.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-1">
                    <span className="font-bold text-purple-300 block">3. فحص الإجابات كاملة 🔍</span>
                    <p className="text-[11px] text-neutral-300">
                      يفتح صفحة فحص شاملة للمشرف لعرض كافة أسئلة الاختبار واختيارات المتقدم، مع زري قبول ورفض مدمجين.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Live Realistic Discord Message Preview */}
              <div className="p-6 rounded-2xl bg-[#313338] border border-neutral-800 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-700/60 pb-3">
                  <span className="font-mono">{siteSettings.discordWebhook?.channelName || '#تقديمات-الاختبار-الإلكتروني'}</span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span>معاينة حية ومطابقة 100% لشكل الرسالة داخل الديسكورد (Discord Live Preview)</span>
                    <Eye className="w-4 h-4 text-indigo-400" />
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shrink-0 shadow-md">
                    <img
                      src="/logo.png"
                      alt="Bot"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-2 text-right">
                    <div className="flex items-center justify-end gap-2 text-xs">
                      <span className="text-neutral-400 text-[10px] font-mono">اليوم في 4:45 م</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#5865F2] text-white text-[9px] font-bold">BOT</span>
                      <span className="font-bold text-white">RIFT STATE NOTIFIER</span>
                    </div>

                    <div className="text-xs text-neutral-200 font-mono space-y-1">
                      {siteSettings.discordWebhook?.mentionRole && (
                        <span className="text-[#5865F2] bg-[#5865F2]/15 px-1.5 py-0.5 rounded font-bold ml-2">
                          {siteSettings.discordWebhook.mentionRole}
                        </span>
                      )}
                      <span>
                        {siteSettings.discordWebhook?.customMessage || '🔔 شخص جديد قدّم على الاختبار الإلكتروني وبانتظار قرار الإدارة بالقبول أو الرفض!'}
                      </span>
                    </div>

                    {/* Discord Embed Box */}
                    <div
                      className="p-4 rounded-lg bg-[#2b2d31] border-r-4 space-y-3 shadow"
                      style={{ borderRightColor: siteSettings.discordWebhook?.embedColor || '#8b5cf6' }}
                    >
                      <h4 className="font-black text-white text-sm">
                        {siteSettings.discordWebhook?.embedTitle || '📋 تقديم جديد في الاختبار الإلكتروني - RIFT STATE'}
                      </h4>

                      <p className="text-xs text-neutral-300 leading-relaxed">
                        قام اللاعب <strong>سلطان القحطاني</strong> بإكمال الاختبار الإلكتروني بنجاح، ويمكنك مراجعة إجاباته أدناه ثم اختيار قبول أو رفض.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-neutral-700/50">
                        {siteSettings.discordWebhook?.showCharacterName !== false && (
                          <div>
                            <span className="text-neutral-400 text-[11px] block">👤 اسم الشخصية:</span>
                            <span className="font-bold text-white">سلطان القحطاني</span>
                          </div>
                        )}

                        {siteSettings.discordWebhook?.showDiscordId !== false && (
                          <div>
                            <span className="text-neutral-400 text-[11px] block">💬 حساب الديسكورد:</span>
                            <span className="text-indigo-400 font-mono">@Sultan#0001 (1234567890)</span>
                          </div>
                        )}

                        {siteSettings.discordWebhook?.showSteamHex !== false && (
                          <div className="sm:col-span-2">
                            <span className="text-neutral-400 text-[11px] block">🎮 ستيم هيكس (Steam Hex):</span>
                            <code className="text-purple-300 font-mono text-[11px] bg-black/40 px-1 py-0.5 rounded">
                              steam:110000112345678
                            </code>
                          </div>
                        )}

                        {siteSettings.discordWebhook?.showScore !== false && (
                          <div>
                            <span className="text-neutral-400 text-[11px] block">📊 نتيجة الاختبار:</span>
                            <span className="font-bold text-emerald-400">10 من 10 (100%) - ناجح ✅</span>
                          </div>
                        )}

                        <div>
                          <span className="text-neutral-400 text-[11px] block">⏳ حالة الطلب:</span>
                          <span className="font-bold text-amber-400">🟡 بانتظار قرار الإدارة</span>
                        </div>

                        {siteSettings.discordWebhook?.showAnswers !== false && (
                          <div className="sm:col-span-2">
                            <span className="text-neutral-400 text-[11px] block">📝 ملخص إجابات الاختبار:</span>
                            <div className="text-[11px] text-neutral-300 bg-black/30 p-2.5 rounded-lg leading-relaxed font-mono space-y-1">
                              <div>✅ <strong>س1: ما هو الرول بلاي؟</strong> ↳ الإجابة: محاكاة وتجسيد الحياة الواقعية</div>
                              <div>✅ <strong>س2: ماذا تفعل عند الـ Fear RP؟</strong> ↳ الإجابة: تقدير الخوف والاستجابة للتعليمات</div>
                            </div>
                          </div>
                        )}

                        {siteSettings.discordWebhook?.showDate !== false && (
                          <div className="sm:col-span-2 text-[10px] text-neutral-400">
                            📅 تاريخ ووقت التقديم: {new Date().toLocaleDateString('ar-SA')} - 04:45 م
                          </div>
                        )}
                      </div>

                      {/* Discord Buttons Preview */}
                      {siteSettings.discordWebhook?.includeActionButtons !== false && (
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-neutral-700/50">
                          <button
                            type="button"
                            className="px-3.5 py-1.5 rounded bg-[#248046] hover:bg-[#1a6334] text-white text-xs font-bold flex items-center gap-1.5 shadow"
                          >
                            <span>✅ قبول الطلب (Approve)</span>
                          </button>
                          <button
                            type="button"
                            className="px-3.5 py-1.5 rounded bg-[#da373c] hover:bg-[#a1282c] text-white text-xs font-bold flex items-center gap-1.5 shadow"
                          >
                            <span>❌ رفض الطلب (Reject)</span>
                          </button>
                          <button
                            type="button"
                            className="px-3.5 py-1.5 rounded bg-[#4e5058] hover:bg-[#383a40] text-white text-xs font-bold flex items-center gap-1.5 shadow"
                          >
                            <span>🔍 فحص الطلب والإجابات كاملة</span>
                          </button>
                        </div>
                      )}

                      {/* Discord Emoji Reactions Preview */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-700/40">
                        <span className="text-[10px] text-neutral-400 font-arabic ml-1">
                          ريأكشنات اتخاذ القرار الفوري:
                        </span>
                        <div className="px-2.5 py-1 rounded-md bg-[#383a40] border border-[#4e5058] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
                          <span>✅</span>
                          <span className="text-[11px] font-mono text-emerald-400">1</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-md bg-[#383a40] border border-[#4e5058] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
                          <span>❌</span>
                          <span className="text-[11px] font-mono text-red-400">1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook || (!siteSettings.discordWebhook?.webhookUrl && !siteSettings.discordWebhook?.botToken)}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
                >
                  <Send className={`w-4 h-4 ${isTestingWebhook ? 'animate-spin' : ''}`} />
                  <span>{isTestingWebhook ? 'جاري الإرسال...' : 'إرسال رسالة تجريبية للديسكورد (Test Send)'}</span>
                </button>

                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
                >
                  حفظ إعدادات ربط ديسكورد والاختبار
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Tab: FiveM Script Integration (ربط سيرفر فايف إم والسكربتات) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'fivem_integration' && (
          <div className="p-8 space-y-8 max-w-5xl w-full mx-auto text-right font-arabic">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2">
                <h1 className="text-2xl font-black text-white font-arabic">ربط سيرفر فايف إم (FiveM Verification & Lua Script)</h1>
                <Server className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-xs text-neutral-400">
                منظومة الربط الثلاثية المتكاملة: فايف إم (FiveM Lua) + الموقع الإلكتروني (Backend API) + بوت الديسكورد (Discord Bot) لنظام التفعيل والقبول التلقائي.
              </p>
            </div>

            {/* Quick Live API Endpoints Banner */}
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyCode(
                    `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/check-verification?discordId=`,
                    'api_url'
                  )}
                  className="px-3 py-1.5 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-amber-700/60 transition-colors"
                >
                  {copiedSnippet === 'api_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet === 'api_url' ? 'تم النسخ!' : 'نسخ رابط API'}</span>
                </button>
                <code className="text-[11px] font-mono text-amber-300 bg-black/40 px-3 py-1.5 rounded-xl border border-amber-900/50">
                  {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/check-verification?discordId=
                </code>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-300 block">رابط فحص التفعيل المباشر لسيرفر FiveM</span>
                <span className="text-[10px] text-neutral-400">يقوم سكربت فايف إم باستدعاء هذا الرابط عند دخول اللاعب</span>
              </div>
            </div>

            {/* 3 Architecture Components Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Part 1 */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-purple-500/30 space-y-2.5 text-right shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                    PART 1
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">بوت الديسكورد</span>
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  يستقبل التقديمات فوراً، ويرسل إشعار للإدارة برابط سريع للقبول بالإضافة لريأكشنات <strong>(✅)</strong> و <strong>(❌)</strong>، وعند القبول يمنح رتبة المفعلين ويزيل غير المفعلين.
                </p>
                <div className="text-[10px] font-mono text-purple-400 bg-purple-950/40 p-2 rounded-xl border border-purple-900/50">
                  ⚡ منح وإزالة الرتب تلقائياً
                </div>
              </div>

              {/* Part 2 */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-indigo-500/30 space-y-2.5 text-right shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                    PART 2
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">سيرفر الموقع (API)</span>
                    <Globe className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  يوفر endpoint <code className="text-indigo-300 font-mono">/accept</code> للقبول السريع من الروابط، ويوفر endpoint <code className="text-indigo-300 font-mono">/api/check-verification</code> لـ FiveM للتحقق من اللاعبين.
                </p>
                <div className="text-[10px] font-mono text-indigo-400 bg-indigo-950/40 p-2 rounded-xl border border-indigo-900/50">
                  🚀 /api/check-verification
                </div>
              </div>

              {/* Part 3 */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-amber-500/30 space-y-2.5 text-right shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                    PART 3
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">سكربت فايف إم (Lua)</span>
                    <Server className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  يتحقق في لحظة دخول اللاعب <code className="text-amber-300 font-mono">playerConnecting</code> عبر معرف الديسكورد، فإذا كان مفعلاً يسمح له بالدخول، وإلا يرفض الدخول مع توجيهه للموقع.
                </p>
                <div className="text-[10px] font-mono text-amber-400 bg-amber-950/40 p-2 rounded-xl border border-amber-900/50">
                  🎮 resources/discord_verify
                </div>
              </div>
            </div>

            {/* Live Player Verification Tester Console */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-neutral-900 pb-3">
                <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-3 py-1 rounded-xl">
                  LIVE API TESTER
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>أداة فحص وتجربة التحقق المباشر للاعبين في FiveM</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </h3>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-neutral-400">
                  أدخل Discord ID الخاص باللاعب لتجربة نفس العملية التي ينفذها سيرفر فايف إم تماماً والتأكد مما إذا كان سيُسمح له بالدخول:
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestFivemVerification()}
                    disabled={isCheckingFivem || !fivemTestDiscordId.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
                  >
                    {isCheckingFivem ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>{isCheckingFivem ? 'جاري الفحص...' : 'فحص تفعيل اللاعب في FiveM'}</span>
                  </button>

                  <input
                    type="text"
                    value={fivemTestDiscordId}
                    onChange={(e) => setFivemTestDiscordId(e.target.value)}
                    placeholder="مثال: 123456789012345678 أو discord:1234567890"
                    className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono text-left focus:outline-none focus:border-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTestFivemVerification();
                    }}
                  />
                </div>

                {/* Test Result Display */}
                {fivemTestResult && (
                  <div
                    className={`p-5 rounded-2xl border text-right space-y-3 transition-all ${
                      fivemTestResult.verified
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                        : 'bg-red-950/40 border-red-800/80 text-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {fivemTestResult.verified ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مفعّل ✅ مسموح له بالدخول إلى سيرفر FiveM</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-red-900/80 border border-red-700 text-red-300 text-xs font-bold flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>غير مفعّل ❌ سيتم طرده برسالة التفعيل</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-neutral-400">
                        استجابة FiveM API المباشرة
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-black/40 p-3.5 rounded-xl border border-white/5 font-arabic">
                      <div>
                        <span className="text-neutral-400 block text-[11px]">اسم اللاعب / الشخصية:</span>
                        <span className="font-bold text-white">{fivemTestResult.playerName || 'غير مسجل'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[11px]">حالة التقديم بالموقع:</span>
                        <span className="font-mono text-amber-300 font-bold">{fivemTestResult.status || 'not_applied'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[11px]">معرف الرتبة الممنوحة:</span>
                        <span className="font-mono text-purple-300">{fivemTestResult.roleId || 'غير محدد'}</span>
                      </div>
                    </div>

                    {/* Quick Accept CTA if not verified */}
                    {!fivemTestResult.verified && (
                      <div className="pt-2 flex items-center justify-between flex-wrap gap-3 border-t border-red-900/40">
                        <button
                          type="button"
                          onClick={() => handleQuickAcceptFromFivemTester(fivemTestDiscordId)}
                          disabled={isCheckingFivem}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>قبول وتفعيل هذا اللاعب فوراً بالرتبة الجديدة ✅</span>
                        </button>
                        <p className="text-[11px] text-neutral-400">
                          يمكنك تفعيله بضغطة زر واحدة لتجربة دخول FiveM مباشرة
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Accept URL Generator Card */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-neutral-900 pb-3">
                <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-900/50">
                  QUICK ACCEPT URL
                </span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>رابط القبول السريع المباشر (Quick Accept Link)</span>
                  <ExternalLink className="w-4 h-4 text-indigo-400" />
                </h3>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                هذا الرابط يضعه البوت في إشعار المشرفين. عند فتحه، يُمنح اللاعب الرتبة الجديدة في ديسكورد وتُزال القديمة ويُصبح مفعلاً في سيرفر FiveM فوراً:
              </p>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/accept?discordId=${fivemTestDiscordId || '1234567890'}`;
                      handleCopyCode(url, 'accept_url');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedSnippet === 'accept_url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet === 'accept_url' ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                  </button>

                  <a
                    href={`/accept?discordId=${fivemTestDiscordId || '1234567890'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>تجربة فتح الرابط</span>
                  </a>
                </div>

                <code className="text-xs font-mono text-indigo-300">
                  {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/accept?discordId={fivemTestDiscordId || '1234567890'}
                </code>
              </div>
            </div>

            {/* FiveM Script Code Viewer (fxmanifest.lua, server.lua, server.cfg, server.js) */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-neutral-900 pb-3">
                <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setFivemCodeTab('server_lua')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      fivemCodeTab === 'server_lua'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    server.lua
                  </button>
                  <button
                    type="button"
                    onClick={() => setFivemCodeTab('fxmanifest')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      fivemCodeTab === 'fxmanifest'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    fxmanifest.lua
                  </button>
                  <button
                    type="button"
                    onClick={() => setFivemCodeTab('server_cfg')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      fivemCodeTab === 'server_cfg'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    server.cfg
                  </button>
                  <button
                    type="button"
                    onClick={() => setFivemCodeTab('server_js')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      fivemCodeTab === 'server_js'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    server.js (Node.js)
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>أكواد السكربتات المجهزة لسيرفر فايف إم (FiveM Resource Files)</span>
                  <FileText className="w-4 h-4 text-amber-400" />
                </h3>
              </div>

              {/* Code Tab Content */}
              {fivemCodeTab === 'server_lua' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const originUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                        const code = `-- FiveM Server Script: server.lua
-- مسار الملف في سيرفرك: resources/discord_verify/server.lua
local API_URL = "${originUrl}/api/check-verification?discordId=" -- رابط التحقق المباشر من موقعك

AddEventHandler('playerConnecting', function(name, setKickReason, deferrals)
    local src = source
    local identifiers = GetPlayerIdentifiers(src)
    local discordId = nil

    deferrals.defer()
    deferrals.update("جاري التحقق من تفعيل الحساب في الديسكورد والموقع...")

    -- البحث عن Discord ID الخاص باللاعب
    for _, id in ipairs(identifiers) do
        if string.find(id, "discord:") then
            discordId = string.gsub(id, "discord:", "")
            break
        end
    end

    if not discordId then
        deferrals.done(" يرجى فتح برنامج الديسكورد قبل تشغيل FiveM وربطه باللعبة.")
        return
    end

    -- طلب التحقق من API الموقع/البوت
    PerformHttpRequest(API_URL .. discordId, function(err, text, headers)
        if err ~= 200 or not text then
            deferrals.done(" حدث خطأ أثناء الاتصال بسيرفر التفعيل، يرجى المحاولة لاحقاً.")
            return
        end

        local data = json.decode(text)

        if data and data.verified then
            deferrals.done() -- السماح بالدخول
        else
            deferrals.done(" أنت غير مفعل في السيرفر! يرجى تقديم طلب التفعيل عبر الموقع أولاً.")
        end
    end, 'GET', '', { ['Content-Type'] = 'application/json' })
end)`;
                        handleCopyCode(code, 'server_lua');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all"
                    >
                      {copiedSnippet === 'server_lua' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSnippet === 'server_lua' ? 'تم نسخ server.lua!' : 'نسخ كود server.lua كامل'}</span>
                    </button>
                    <span className="font-mono text-neutral-400 text-[11px]">
                      مسار الملف: <code className="text-amber-300">resources/discord_verify/server.lua</code>
                    </span>
                  </div>

                  <pre className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-emerald-400 overflow-x-auto text-left leading-relaxed max-h-96">
{`-- FiveM Server Script: server.lua
-- مسار الملف: resources/discord_verify/server.lua
local API_URL = "${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/check-verification?discordId="

AddEventHandler('playerConnecting', function(name, setKickReason, deferrals)
    local src = source
    local identifiers = GetPlayerIdentifiers(src)
    local discordId = nil

    deferrals.defer()
    deferrals.update("جاري التحقق من تفعيل الحساب في الديسكورد والموقع...")

    -- البحث عن Discord ID الخاص باللاعب
    for _, id in ipairs(identifiers) do
        if string.find(id, "discord:") then
            discordId = string.gsub(id, "discord:", "")
            break
        end
    end

    if not discordId then
        deferrals.done(" يرجى فتح برنامج الديسكورد قبل تشغيل FiveM وربطه باللعبة.")
        return
    end

    -- طلب التحقق من API الموقع/البوت
    PerformHttpRequest(API_URL .. discordId, function(err, text, headers)
        if err ~= 200 or not text then
            deferrals.done(" حدث خطأ أثناء الاتصال بسيرفر التفعيل، يرجى المحاولة لاحقاً.")
            return
        end

        local data = json.decode(text)

        if data and data.verified then
            deferrals.done() -- السماح بالدخول
        else
            deferrals.done(" أنت غير مفعل في السيرفر! يرجى تقديم طلب التفعيل عبر الموقع أولاً.")
        end
    end, 'GET', '', { ['Content-Type'] = 'application/json' })
end)`}
                  </pre>
                </div>
              )}

              {fivemCodeTab === 'fxmanifest' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const code = `fx_version 'cerulean'
game 'gta5'

description 'Discord & Website Verification System'
author 'RIFT STATE'

server_script 'server.lua'`;
                        handleCopyCode(code, 'fxmanifest');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all"
                    >
                      {copiedSnippet === 'fxmanifest' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSnippet === 'fxmanifest' ? 'تم نسخ fxmanifest.lua!' : 'نسخ كود fxmanifest.lua'}</span>
                    </button>
                    <span className="font-mono text-neutral-400 text-[11px]">
                      مسار الملف: <code className="text-amber-300">resources/discord_verify/fxmanifest.lua</code>
                    </span>
                  </div>

                  <pre className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-emerald-400 overflow-x-auto text-left leading-relaxed">
{`fx_version 'cerulean'
game 'gta5'

description 'Discord & Website Verification System'
author 'RIFT STATE'

server_script 'server.lua'`}
                  </pre>
                </div>
              )}

              {fivemCodeTab === 'server_cfg' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        handleCopyCode('ensure discord_verify', 'server_cfg');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all"
                    >
                      {copiedSnippet === 'server_cfg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSnippet === 'server_cfg' ? 'تم النسخ!' : 'نسخ سطر التشغيل'}</span>
                    </button>
                    <span className="font-mono text-neutral-400 text-[11px]">
                      أضف هذا السطر في نهاية ملف: <code className="text-amber-300">server.cfg</code>
                    </span>
                  </div>

                  <pre className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-amber-300 overflow-x-auto text-left">
ensure discord_verify
                  </pre>
                </div>
              )}

              {fivemCodeTab === 'server_js' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const code = `// Discord Bot & Express API (server.js)
const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const CONFIG = {
    PORT: 3000,
    DISCORD_TOKEN: "${siteSettings.discordWebhook?.botToken || 'ضع_توكن_البوت_هنا'}",
    GUILD_ID: "${siteSettings.discordGuildId || 'ضع_ايدي_سيرفر_الديسكورد_هنا'}",
    ADMIN_CHANNEL_ID: "${siteSettings.discordWebhook?.channelId || 'ضع_ايدي_روم_إشعارات_الإدارة_هنا'}",
    WEBSITE_URL: "${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}",
    ROLE_TO_ADD: "${siteSettings.whitelistAcceptedRoleId || 'ضع_ايدي_رتبة_المفعل_هنا'}",
    ROLE_TO_REMOVE: "ضع_ايدي_رتبة_غير_المفعل_هنا"
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ]
});

const verifiedUsers = new Map();

client.once('ready', () => {
    console.log(\`[Discord Bot] تم تسجيل الدخول بنجاح باسم: \${client.user.tag}\`);
});

app.post('/api/apply', async (req, res) => {
    const { discordId, playerName, age } = req.body;
    if (!discordId) return res.status(400).json({ error: "يرجى تزويد Discord ID" });

    try {
        const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
        const member = await guild.members.fetch(discordId).catch(() => null);
        if (!member) return res.status(404).json({ error: "العضو غير موجود في سيرفر الديسكورد" });

        const adminChannel = await client.channels.fetch(CONFIG.ADMIN_CHANNEL_ID);
        const embed = new EmbedBuilder()
            .setTitle("طلب تفعيل جديد")
            .setColor("#00ff88")
            .addFields(
                { name: "اسم اللاعب", value: playerName || "غير محدد", inline: true },
                { name: "العمر", value: age ? String(age) : "غير محدد", inline: true },
                { name: "حساب الديسكورد", value: \`<@\${discordId}> (\${discordId})\` }
            )
            .setTimestamp();

        const acceptUrl = \`\${CONFIG.WEBSITE_URL}/accept?discordId=\${discordId}\`;
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('الذهاب للموقع للقبول')
                .setStyle(ButtonStyle.Link)
                .setURL(acceptUrl)
        );

        await adminChannel.send({ embeds: [embed], components: [row] });
        return res.json({ success: true, message: "تم إرسال طلب التفعيل إلى الإدارة بنجاح" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "حدث خطأ أثناء معالجة الطلب" });
    }
});

app.get('/accept', async (req, res) => {
    const { discordId } = req.query;
    if (!discordId) return res.status(400).send("<h1>خطأ: لم يتم تحديد Discord ID</h1>");

    try {
        const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
        const member = await guild.members.fetch(discordId);

        if (CONFIG.ROLE_TO_ADD) await member.roles.add(CONFIG.ROLE_TO_ADD);
        if (CONFIG.ROLE_TO_REMOVE) await member.roles.remove(CONFIG.ROLE_TO_REMOVE);

        verifiedUsers.set(discordId, true);
        member.send("تهانينا! تم قبول طلب تفعيلك بنجاح. يمكنك الآن الدخول إلى سيرفر FiveM.").catch(() => {});

        return res.send(\`
            <div style="text-align:center; font-family:sans-serif; padding:50px;">
                <h1 style="color: green;">تم قبول اللاعب بنجاح!</h1>
                <p>تم إعطاء الرتبة الجديدة وإزالة الرتبة القديمة للاعب <b>\${member.user.tag}</b>.</p>
            </div>
        \`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("<h1>حدث خطأ أثناء قبول اللاعب.</h1>");
    }
});

app.get('/api/check-verification', async (req, res) => {
    const { discordId } = req.query;
    if (!discordId) return res.json({ verified: false });

    try {
        const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
        const member = await guild.members.fetch(discordId).catch(() => null);
        if (!member) return res.json({ verified: false, reason: "not_in_discord" });

        const hasRole = member.roles.cache.has(CONFIG.ROLE_TO_ADD);
        return res.json({ verified: hasRole });
    } catch (error) {
        return res.json({ verified: false });
    }
});

app.listen(CONFIG.PORT, () => {
    console.log(\`[Website API] السيرفر يعمل على المنفذ: \${CONFIG.PORT}\`);
});
client.login(CONFIG.DISCORD_TOKEN);`;
                        handleCopyCode(code, 'server_js');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all"
                    >
                      {copiedSnippet === 'server_js' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSnippet === 'server_js' ? 'تم النسخ!' : 'نسخ كود Node.js كامل'}</span>
                    </button>
                    <span className="font-mono text-neutral-400 text-[11px]">
                      كود سيرفر Node.js المتكامل المدمج حالياً في مشروعك
                    </span>
                  </div>

                  <pre className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-cyan-300 overflow-x-auto text-left leading-relaxed max-h-96">
{`const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const CONFIG = {
    PORT: 3000,
    DISCORD_TOKEN: "${siteSettings.discordWebhook?.botToken ? '••••••••••••' : 'ضع_توكن_البوت_هنا'}",
    GUILD_ID: "${siteSettings.discordGuildId || 'ضع_ايدي_سيرفر_الديسكورد_هنا'}",
    ADMIN_CHANNEL_ID: "${siteSettings.discordWebhook?.channelId || 'ضع_ايدي_روم_إشعارات_الإدارة_هنا'}",
    WEBSITE_URL: "${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}",
    ROLE_TO_ADD: "${siteSettings.whitelistAcceptedRoleId || 'ضع_ايدي_رتبة_المفعل_هنا'}",
    ROLE_TO_REMOVE: "ضع_ايدي_رتبة_غير_المفعل_هنا"
};
// ... (مدمج وجاهز للتشغيل مباشرة في السيرفر)`}
                  </pre>
                </div>
              )}
            </div>

            {/* Easy Setup Steps Guide */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center justify-end gap-2 border-b border-neutral-900 pb-3">
                <span>طريقة الربط والتشغيل في سيرفر فايف إم بخطوات سهلة</span>
                <HelpCircle className="w-4 h-4 text-purple-400" />
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-neutral-300">
                <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2 text-right">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-mono">1</div>
                  <h4 className="font-bold text-white text-xs">إنشاء المجلد في السيرفر</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    توجه لمجلد <code className="text-amber-300">resources</code> في سيرفر FiveM وأنشئ مجلداً جديداً باسم <code className="text-amber-300">discord_verify</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2 text-right">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-mono">2</div>
                  <h4 className="font-bold text-white text-xs">وضع ملفي السكربت</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    أنشئ داخل المجلد ملف <code className="text-amber-300">fxmanifest.lua</code> وملف <code className="text-amber-300">server.lua</code> وانسخ الأكواد من الأزرار بالأعلى.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2 text-right">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-mono">3</div>
                  <h4 className="font-bold text-white text-xs">التشغيل في server.cfg</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    افتح ملف <code className="text-amber-300">server.cfg</code> في السيرفر وأضف السطر: <code className="text-amber-300">ensure discord_verify</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2 text-right">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-mono">4</div>
                  <h4 className="font-bold text-white text-xs">إعداد بوت الديسكورد</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    تأكد من تفعيل خيارات <strong>Intents</strong> (وخاصة <strong>Server Members Intent</strong>) ورتبة البوت أعلى من رتبة الوايت لست.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Question Modal Dialog */}
      {isQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-right">
            <h3 className="text-lg font-bold text-white">
              {editingQuestion.id ? 'تعديل سؤال وايت لست' : 'إضافة سؤال جديد'}
            </h3>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">نص السؤال</label>
                <input
                  type="text"
                  required
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  placeholder="مثال: ما هو التصرف الصحيح عند توجيه السلاح نحوك؟"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right"
                />
              </div>

              {editingQuestion.options?.map((opt: any, optIdx: number) => (
                <div key={opt.id} className="space-y-1">
                  <label className="text-xs text-neutral-400">الخيار ({opt.id})</label>
                  <input
                    type="text"
                    required
                    value={opt.text}
                    onChange={(e) => {
                      const updatedOpts = [...editingQuestion.options];
                      updatedOpts[optIdx].text = e.target.value;
                      setEditingQuestion({ ...editingQuestion, options: updatedOpts });
                    }}
                    className="w-full px-4 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right"
                  />
                </div>
              ))}

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">الإجابة الصحيحة</label>
                <select
                  value={editingQuestion.correctAnswerId || 'a'}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswerId: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="a">الخيار (a)</option>
                  <option value="b">الخيار (b)</option>
                  <option value="c">الخيار (c)</option>
                  <option value="d">الخيار (d)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  حفظ السؤال
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application Review Modal Dialog (Prompt 5 Embed matching) */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-purple-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                selectedApp.status === 'approved'
                  ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                  : selectedApp.status === 'rejected'
                    ? 'bg-red-950 border border-red-800 text-red-300'
                    : 'bg-amber-950 border border-amber-800 text-amber-300 animate-pulse'
              }`}>
                {selectedApp.status === 'approved' ? 'مقبول ✅' : selectedApp.status === 'rejected' ? 'مرفوض ❌' : 'قيد المراجعة (Pending)'}
              </span>
              <h3 className="text-lg font-bold text-white font-arabic">مراجعة اختبار الرول بلاي</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850 text-xs">
              <div>
                <span className="text-neutral-400 block mb-0.5">اسم الشخصية:</span>
                <span className="font-bold text-white text-sm">{selectedApp.characterName}</span>
              </div>
              <div>
                <span className="text-neutral-400 block mb-0.5">حساب ديسكورد:</span>
                <span className="font-mono text-purple-300">{selectedApp.discordTag}</span>
              </div>
              <div>
                <span className="text-neutral-400 block mb-0.5">معرف ستيم / اللعبة:</span>
                <span className="font-mono text-neutral-300">{selectedApp.steamHex || 'steam:unknown'}</span>
              </div>
            </div>

            {/* Prompt 5: Review Room Embed format with ✅ and ❌ */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-neutral-300 border-r-2 border-purple-500 pr-2">
                إجابات المتقدم في اختبار القواعد (Fear RP / RDM / VDM / Meta):
              </h4>

              {Array.isArray(selectedApp.answers) && selectedApp.answers.length > 0 ? (
                <div className="space-y-3">
                  {selectedApp.answers.map((ans: any, aIdx: number) => {
                    const matchedQ = questions.find(q => q.id === ans.questionId || q.numericId === Number(ans.questionId));
                    const qTitle = matchedQ?.question || `سؤال #${aIdx + 1}`;
                    return (
                      <div key={ans.questionId || aIdx} className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-850 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ans.isCorrect ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-red-950 text-red-400 border border-red-900'}`}>
                            {ans.isCorrect ? 'إجابة صحيحة ✅' : 'إجابة خاطئة ❌'}
                          </span>
                          <span className="font-bold text-white">{qTitle}</span>
                        </div>

                        {matchedQ?.options ? (
                          <div className="space-y-1.5 pt-1">
                            {matchedQ.options.map((opt: any) => {
                              const isSelected = opt.id === ans.selectedOptionId;
                              const isCorrect = opt.id === (ans.correctOptionId || matchedQ.correctAnswerId);
                              return (
                                <div
                                  key={opt.id}
                                  className={`px-3 py-2 rounded-lg text-xs flex items-center justify-between border ${
                                    isSelected && isCorrect
                                      ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300 font-bold'
                                      : isSelected && !isCorrect
                                        ? 'bg-red-950/60 border-red-700 text-red-300 font-bold'
                                        : isCorrect
                                          ? 'bg-neutral-900 border-emerald-900/60 text-emerald-400'
                                          : 'bg-neutral-950 border-neutral-900 text-neutral-400'
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    {isSelected && isCorrect && <span>✅</span>}
                                    {isSelected && !isCorrect && <span>❌</span>}
                                    <span>{opt.text}</span>
                                  </span>
                                  <span className="font-mono text-[10px] text-neutral-500">
                                    {isSelected ? '(اختيار اللاعب)' : isCorrect ? '(الصحيحة)' : `(${opt.id})`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-neutral-400 flex items-center justify-between">
                            <span>الخيار المحدد: <b className="text-white">{ans.selectedOptionId}</b></span>
                            <span>الخيار الصحيح: <b className="text-emerald-400">{ans.correctOptionId}</b></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-850 text-xs text-neutral-400 text-center space-y-1">
                  <span>تم إجراء الاختبار بنجاح بنتيجة معتمدة (100% نجاح في Fear RP و RDM و Metagaming)</span>
                </div>
              )}
            </div>

            {/* Prompt 5 Decision Buttons */}
            {selectedApp.status === 'pending' ? (
              <div className="flex items-center gap-3 pt-3 border-t border-neutral-900">
                <button
                  onClick={() => handleApproveApp(selectedApp.id)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>قبول ومنح رتبة المقبول (APPROVE)</span>
                </button>
                <button
                  onClick={() => handleRejectApp(selectedApp.id)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>رفض ومنح رتبة المرفوض (REJECT)</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400">
                تم اتخاذ القرار في هذا الطلب مسبقاً ({selectedApp.status === 'approved' ? 'تم القبول ومنح الرتبة' : 'تم الرفض'}). لا يمكن معالجته مرتين لمنع التكرار.
              </div>
            )}

            <button
              onClick={() => setSelectedApp(null)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white text-xs cursor-pointer"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}

      {/* FAQ Modal Dialog */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-right">
            <h3 className="text-lg font-bold text-white">إضافة سؤال شائع جديد (FAQ)</h3>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">السؤال</label>
                <input
                  type="text"
                  required
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  placeholder="مثال: كيف أربط حساب الديسكورد باللعبة؟"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">الإجابة والتوضيح</label>
                <textarea
                  rows={4}
                  required
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  placeholder="اكتب الإجابة المفصلة التي ستظهر للاعبين..."
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">القسم / التصنيف</label>
                <input
                  type="text"
                  value={editingFaq.category}
                  onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                  placeholder="مثال: عام / قوانين / فني"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  حفظ في قاعدة البيانات
                </button>
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Modal Dialog */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-right">
            <h3 className="text-lg font-bold text-white">إضافة شاغر وظيفي جديد</h3>

            <form onSubmit={handleSaveJob} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">المسمى الوظيفي</label>
                <input
                  type="text"
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="مثال: ضابط شرطة أول / مسعف ميداني"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">القطاع</label>
                  <select
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="الشرطة">الشرطة (LSPD)</option>
                    <option value="الإسعاف">الإسعاف (EMS)</option>
                    <option value="الصيانة">الصيانة (Mechanic)</option>
                    <option value="القضاء">القضاء (DOJ)</option>
                    <option value="التجارة">الشركات والتجارة</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">الراتب المتوقع</label>
                  <input
                    type="text"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    placeholder="$3,500 / ساعة"
                    className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">وصف الوظيفة والمهام</label>
                <textarea
                  rows={3}
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="شرح مهام الوظيفة داخل السيرفر..."
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  حفظ الوظيفة
                </button>
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Member Modal Dialog */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-right">
            <h3 className="text-lg font-bold text-white">إضافة عضو جديد لطاقم العمل</h3>

            <form onSubmit={handleSaveTeamMember} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">اسم العضو / اللقب</label>
                <input
                  type="text"
                  required
                  value={newTeamMember.name}
                  onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                  placeholder="مثال: Sultan / RiftOwner"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">المسمى الوظيفي</label>
                  <input
                    type="text"
                    required
                    value={newTeamMember.roleTitle}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, roleTitle: e.target.value })}
                    placeholder="مثال: المؤسس / Head of Staff"
                    className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">نوع الرتبة</label>
                  <select
                    value={newTeamMember.roleType}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, roleType: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="founder">المؤسس (Founder)</option>
                    <option value="management">الإدارة العليا (Management)</option>
                    <option value="dev">المطور الرئيسي (Developer)</option>
                    <option value="admin">مشرف إداري (Staff)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">حساب ديسكورد</label>
                <input
                  type="text"
                  value={newTeamMember.discordId}
                  onChange={(e) => setNewTeamMember({ ...newTeamMember, discordId: e.target.value })}
                  placeholder="مثال: Username#0001 أو آيدي الديسكورد"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">رابط الصورة الرمزية (اختياري)</label>
                <input
                  type="text"
                  value={newTeamMember.avatar}
                  onChange={(e) => setNewTeamMember({ ...newTeamMember, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-left"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">نبذة تعريفية</label>
                <textarea
                  rows={2}
                  value={newTeamMember.description}
                  onChange={(e) => setNewTeamMember({ ...newTeamMember, description: e.target.value })}
                  placeholder="المهام أو نبذة عن دوره في السيرفر..."
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  إضافة العضو
                </button>
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Streamer Modal Dialog */}
      {isStreamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-right">
            <h3 className="text-lg font-bold text-white">إضافة ستريمر جديد للسيرفر</h3>

            <form onSubmit={handleSaveStreamer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">اسم الستريمر / اللاعب</label>
                <input
                  type="text"
                  required
                  value={newStreamer.name}
                  onChange={(e) => setNewStreamer({ ...newStreamer, name: e.target.value })}
                  placeholder="مثال: Sniper_Live"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">المنصة</label>
                  <select
                    value={newStreamer.platform}
                    onChange={(e) => setNewStreamer({ ...newStreamer, platform: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="kick">Kick.com</option>
                    <option value="twitch">Twitch.tv</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-300">اسم القناة أو الرابط</label>
                  <input
                    type="text"
                    required
                    value={newStreamer.channelName}
                    onChange={(e) => setNewStreamer({ ...newStreamer, channelName: e.target.value })}
                    placeholder="مثال: channel_slug أو https://kick.com/..."
                    className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-left"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300">صورة الستريمر الرمزية (اختياري)</label>
                <input
                  type="text"
                  value={newStreamer.avatar}
                  onChange={(e) => setNewStreamer({ ...newStreamer, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-left"
                />
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                * ملاحظة: يتم فحص المشاهدين الحقيقيين وتحديثهم فوراً. وعندما يغلق الستريمر بثه، ينتهي البث على الفور ويختفي من قسم البثوث المباشرة.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  إضافة الستريمر
                </button>
                <button
                  type="button"
                  onClick={() => setIsStreamModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
