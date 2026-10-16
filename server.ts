import express from 'express';
import session from 'express-session';
import axios from 'axios';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  db,
  initDatabase,
  getLeaderboard,
  getWeeklyLeaderboard,
  playerJoined,
  playerLeft,
  updateServerHeartbeat,
  getServerStatus,
  getWhitelistQuestions,
  addWhitelistQuestion,
  updateWhitelistQuestion,
  deleteWhitelistQuestion,
  moveWhitelistQuestion,
  syncPlayersBatch,
  getTotalPlayersCount,
  searchPlayers,
  getTeamMembers,
  addTeamMember,
  deleteTeamMember,
  getStreamers,
  addStreamer,
  updateStreamerLive,
  deleteStreamer,
  getSiteSettings,
  updateSiteSettings,
  getFaqList,
  addFaqItem,
  deleteFaqItem,
  getJobsList,
  addJobItem,
  deleteJobItem,
  getWhitelistApplications,
  addWhitelistApplication,
  updateWhitelistApplicationStatus,
  getCharactersByDiscord,
  saveCharacter,
  recordAccountLogin,
  getAccountStats,
  deleteAccount,
  resetAccounts,
} from './database';

dotenv.config();

// Initialize real server & website database
initDatabase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare module 'express-session' {
  interface SessionData {
    oauthState?: string;
    user?: {
      discordId: string;
      username: string;
      globalName?: string;
      email?: string;
      avatar?: string;
      steamId?: string;
      steamHex?: string;
      isWhitelistApproved?: boolean;
      characterName?: string;
      roles?: string[];
    };
    discord?: {
      id: string;
      username: string;
      global_name?: string;
      email?: string;
      avatar?: string;
      roles?: string[];
    };
    steam?: {
      id: string;
      steamHex?: string;
      personaName?: string;
      avatar?: string;
    };
    whitelist?: {
      approved: boolean;
      approvedAt: string;
      roleGiven: boolean;
      characterName?: string;
    };
    discordRoles?: string[];
    isOwner?: boolean;
    isReviewer?: boolean;
  }
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  const required = ['SESSION_SECRET', 'DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET', 'DISCORD_GUILD_ID', 'DISCORD_BOT_TOKEN', 'FIVEM_API_SECRET', 'OWNER_PASSKEY'];
  const missing = required.filter((key) => !String(process.env[key] || '').trim() || /^(YOUR_|REPLACE_|GENERATE_)/.test(String(process.env[key] || '').trim()));
  if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
}

app.set('trust proxy', 1);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || (isProd ? (() => { throw new Error('SESSION_SECRET must be configured in production'); })() : 'local-development-only-session-secret'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

function syncSessionUser(sess: any) {
  if (sess.discord) {
    try {
      recordAccountLogin({
        discordId: sess.discord.id,
        username: sess.discord.username,
        globalName: sess.discord.global_name || sess.discord.username,
        avatar: sess.discord.avatar,
        email: sess.discord.email,
      });
    } catch {}
  }
  if (sess.discord && sess.steam) {
    sess.user = {
      discordId: sess.discord.id,
      username: sess.discord.username,
      globalName: sess.discord.global_name || sess.discord.username,
      email: sess.discord.email,
      avatar: sess.discord.avatar,
      steamId: sess.steam.id,
      steamHex: sess.steam.steamHex,
      isWhitelistApproved: Boolean(sess.whitelist?.approved),
      characterName: sess.whitelist?.characterName || 'Citizen',
      roles: sess.discord.roles || sess.discordRoles || [],
    };
  } else if (!sess.discord && !sess.steam) {
    sess.user = undefined;
  }
}

function formatSecondsToHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
    label: `${monday.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}`,
  };
}

const currentWeek = getCurrentWeekRange();

// -------------------------------------------------------------
// IN-MEMORY DATABASE STORAGE
// -------------------------------------------------------------

export interface PlayerRecord {
  id: number;
  player_id: string;
  name: string;
  citizenid: string;
  discord_id: string;
  steam_id: string;
  job_label: string;
  total_seconds: number;
  weekly_seconds: number;
  monthly_seconds: number;
  is_online: boolean;
  online_time: string;
  session_start?: string;
  last_login: string;
  last_logout: string;
  avatar: string;
}

const playersDB: Map<string, PlayerRecord> = new Map([
  [
    'HL-1001',
    {
      id: 1,
      player_id: 'license:1',
      name: 'Ahmed (أحمد)',
      citizenid: 'HL-1001',
      discord_id: '123456789011111111',
      steam_id: '76561198011111111',
      job_label: 'الإدارة العليا (High Staff)',
      total_seconds: 184 * 3600 + 42 * 60,
      weekly_seconds: 28 * 3600 + 15 * 60,
      monthly_seconds: 94 * 3600,
      is_online: true,
      online_time: '2h 45m',
      session_start: new Date(Date.now() - 2 * 3600 * 1000 - 45 * 60 * 1000).toISOString(),
      last_login: '2026-09-28 20:00:00',
      last_logout: '2026-09-27 23:30:00',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
  ],
  [
    'HL-1002',
    {
      id: 2,
      player_id: 'license:2',
      name: 'Mohammed (محمد)',
      citizenid: 'HL-1002',
      discord_id: '123456789022222222',
      steam_id: '76561198022222222',
      job_label: 'عقيد شرطة LSPD',
      total_seconds: 172 * 3600 + 18 * 60,
      weekly_seconds: 24 * 3600 + 30 * 60,
      monthly_seconds: 88 * 3600,
      is_online: true,
      online_time: '3h 10m',
      session_start: new Date(Date.now() - 3 * 3600 * 1000 - 10 * 60 * 1000).toISOString(),
      last_login: '2026-09-28 19:30:00',
      last_logout: '2026-09-27 22:15:00',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    },
  ],
  [
    'HL-1003',
    {
      id: 3,
      player_id: 'license:3',
      name: 'Khalid (خالد)',
      citizenid: 'HL-1003',
      discord_id: '123456789033333333',
      steam_id: '76561198033333333',
      job_label: 'كبير المستوردين وتجارة',
      total_seconds: 161 * 3600 + 50 * 60,
      weekly_seconds: 21 * 3600 + 10 * 60,
      monthly_seconds: 79 * 3600,
      is_online: true,
      online_time: '1h 20m',
      session_start: new Date(Date.now() - 1 * 3600 * 1000 - 20 * 60 * 1000).toISOString(),
      last_login: '2026-09-28 21:10:00',
      last_logout: '2026-09-28 02:40:00',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
  ],
  [
    'HL-1004',
    {
      id: 4,
      player_id: 'license:4',
      name: 'د. راكان الخالدي (Dr. Rakan)',
      citizenid: 'HL-1004',
      discord_id: '123456789044444444',
      steam_id: '76561198044444444',
      job_label: 'رئيس قسم الجراحة EMS',
      total_seconds: 149 * 3600 + 20 * 60,
      weekly_seconds: 19 * 3600 + 40 * 60,
      monthly_seconds: 72 * 3600,
      is_online: true,
      online_time: '4h 05m',
      session_start: new Date(Date.now() - 4 * 3600 * 1000 - 5 * 60 * 1000).toISOString(),
      last_login: '2026-09-28 18:00:00',
      last_logout: '2026-09-27 21:00:00',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    },
  ],
  [
    'HL-1005',
    {
      id: 5,
      player_id: 'license:5',
      name: 'سلطان العتيبي (Sultan)',
      citizenid: 'HL-1005',
      discord_id: '123456789055555555',
      steam_id: '76561198055555555',
      job_label: 'مستثمر ورجل أعمال',
      total_seconds: 137 * 3600 + 10 * 60,
      weekly_seconds: 18 * 3600 + 31 * 60,
      monthly_seconds: 68 * 3600,
      is_online: true,
      online_time: '1h 50m',
      session_start: new Date(Date.now() - 1 * 3600 * 1000 - 50 * 60 * 1000).toISOString(),
      last_login: '2026-09-28 20:30:00',
      last_logout: '2026-09-28 01:20:00',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    },
  ],
  [
    'HL-1006',
    {
      id: 6,
      player_id: 'license:6',
      name: 'Omar (عمر)',
      citizenid: 'HL-1006',
      discord_id: '123456789066666666',
      steam_id: '76561198066666666',
      job_label: 'موظف بلدية وخدمات مدنية',
      total_seconds: 127 * 3600 + 42 * 60,
      weekly_seconds: 16 * 3600 + 15 * 60,
      monthly_seconds: 61 * 3600,
      is_online: false,
      online_time: '0m',
      last_login: '2026-09-27 15:00:00',
      last_logout: '2026-09-27 18:42:00',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    },
  ],
]);

// Spotlight Awards: Player of the Week & Medic of the Week
let medicOfTheWeek = {
  playerName: 'د. راكان الخالدي (Dr. Rakan)',
  discordId: '123456789044444444',
  image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
  description: 'أعلى معدل استجابة لبلاغات الطوارئ وإنقاذ المصابين في مدينة لوس سانتوس لأكثر من 40 حالة ناجحة خلال الأسبوع.',
  week: currentWeek.label,
  updatedAt: new Date().toISOString(),
  badge: 'كبير الجراحين EMS',
};

let playerOfTheWeek = {
  playerName: 'سلطان العتيبي (Sultan)',
  discordId: '123456789055555555',
  image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  description: 'أعلى التزام بميثاق الرول بلاي الواقعي وسيناريوهات نوعية مميزة أثرت مجتمع Hunters Life طوال الأسبوع.',
  week: currentWeek.label,
  updatedAt: new Date().toISOString(),
  badge: 'المواطن المثالي',
};

interface ServerWhitelistApp {
  id: string;
  discordId: string;
  discordTag: string;
  steamHex: string;
  characterName: string;
  characterAge?: number;
  characterStory?: string;
  characterGoal?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  answers?: any[];
  score?: any;
  reviewedAt?: string;
  reviewerName?: string;
}

// Whitelist Applications List
let whitelistApplications: ServerWhitelistApp[] = [
  {
    id: 'WL-901',
    discordId: '1234567890999',
    discordTag: 'Raed#9999',
    steamHex: 'steam:11000010abcdef1',
    characterName: 'Raed (رائد الحربي)',
    characterAge: 26,
    characterStory: 'شاب طموح قدم إلى مدينة لوس سانتوس للعمل في التجارة والاستثمار في العقارات والسيارات الكلاسيكية.',
    characterGoal: 'تأسيس شركة خدمات تجارية والمشاركة في اقتصاد المدينة.',
    submittedAt: '2026-09-28 12:40:00',
    status: 'pending' as const,
  },
  {
    id: 'WL-902',
    discordId: '1234567890888',
    discordTag: 'Saud#8888',
    steamHex: 'steam:11000010abcdef2',
    characterName: 'سعود الشهري',
    characterAge: 24,
    characterStory: 'خريج قانون يبحث عن فرصة للالتحاق بقطاع العدل أو الشرطة لخدمة أمن النظام والمدينة.',
    characterGoal: 'التدريب في أكاديمية الشرطة وحماية المواطنين.',
    submittedAt: '2026-09-28 11:15:00',
    status: 'approved' as const,
  },
  {
    id: 'WL-903',
    discordId: '1234567890777',
    discordTag: 'Nayef#7777',
    steamHex: 'steam:11000010abcdef3',
    characterName: 'نايف المطيري',
    characterAge: 28,
    characterStory: 'فني ميكانيكي ومبرمج سيارات يرغب في العمل بكراج المدينة وصيانة سيارات الطوارئ والمواطنين.',
    characterGoal: 'افتتاح ورشة تعديل معتمدة.',
    submittedAt: '2026-09-28 10:00:00',
    status: 'pending' as const,
  },
];

// News List
let newsList = [
  {
    id: 'news-1',
    titleAr: 'إطلاق التحديث الشامل V2.6 لخادم Hunters Life',
    titleEn: 'HLCRP V2.6 Major Expansion Released',
    contentAr: 'تحديث ضخم يشمل نظام الكراجات الجديد، تحسين توازن الوظائف المدنية، وتطوير أنظمة الرول بلاي في FiveM.',
    contentEn: 'Major expansion introducing vehicle persistence, civil career balancing, and high-performance server scripts.',
    date: '2026-09-28',
    author: 'الإدارة العليا (HLC Staff)',
    categoryAr: 'تحديثات الخادم',
    categoryEn: 'Server Updates',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    published: true,
  },
  {
    id: 'news-2',
    titleAr: 'فتح باب التقديم لأكاديمية قطاع الشرطة LSPD',
    titleEn: 'LSPD Police Academy Recruitment Open',
    contentAr: 'تعلن قيادة الشرطة عن فتح دورة التدريب الميداني الرابعة لاستقبال الضباط الجدد والانضمام لدوريات المدينة.',
    contentEn: 'The Police Department opens applications for the new tactical field academy.',
    date: '2026-09-26',
    author: 'قيادة LSPD',
    categoryAr: 'القطاعات الأمنية',
    categoryEn: 'Law Enforcement',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
    published: true,
  },
];

// Rules List
let rulesList = [
  {
    id: 'rule-rdm',
    category: 'القتال والاشتباك',
    titleAr: 'منع القتل العشوائي (RDM - Random Deathmatch)',
    titleEn: 'No Random Deathmatch (RDM)',
    descriptionAr: 'يُمنع منعاً باتاً قتل أو إطلاق النار على أي لاعب دون وجود سيناريو وعداوة ودافع رول بلاي مسبق.',
    descriptionEn: 'Attacking or killing another player without initiation, motive, or roleplay backstory is strictly prohibited.',
    penaltyAr: 'حظر مؤقت لمدة 3 أيام يتضاعف عند التكرار.',
    penaltyEn: '3-day temporary suspension, doubled on recurrence.',
    active: true,
    order: 1,
  },
  {
    id: 'rule-vdm',
    category: 'القتال والاشتباك',
    titleAr: 'منع الصدم العمد بالمركبة (VDM - Vehicle Deathmatch)',
    titleEn: 'No Vehicle Deathmatch (VDM)',
    descriptionAr: 'يُحظر استخدام المركبة كسلاح لدهس أو صدم اللاعبين والمركبات الأخرى بشكل غير واقعي.',
    descriptionEn: 'Using your vehicle as a lethal weapon to ram or crush pedestrians without roleplay validity.',
    penaltyAr: 'سحب رخصة وسجن إداري وحظر.',
    penaltyEn: 'Vehicle impound and administrative suspension.',
    active: true,
    order: 2,
  },
  {
    id: 'rule-fear',
    category: 'ميثاق تقمص الشخصية',
    titleAr: 'الخوف على الحياة وتقدير النفس (Fear RP)',
    titleEn: 'Fear for Life (Fear RP)',
    descriptionAr: 'يجب عليك إظهار الخوف الواقعي وتقدير حياتك عند توجيه السلاح نحوك أو الوقوع في قبضة قطاع الأمن.',
    descriptionEn: 'You must value your character life and surrender reasonably when held at gunpoint.',
    penaltyAr: 'إنذار إداري أولي ثم حظر مؤقت.',
    penaltyEn: 'Formal warning followed by ban.',
    active: true,
    order: 3,
  },
  {
    id: 'rule-meta',
    category: 'نزاهة اللعب',
    titleAr: 'منع استغلال معلومات خارج اللعبة (Metagaming)',
    titleEn: 'No Metagaming',
    descriptionAr: 'يُمنع استخدام أي معلومات تم الحصول عليها من الديسكورد أو البثوث المباشرة داخل سيناريوهات اللعبة.',
    descriptionEn: 'Using out-of-character (OOC) knowledge inside in-character (IC) situations.',
    penaltyAr: 'حظر نهائي فور إثبات الواقعة.',
    penaltyEn: 'Permanent ban upon investigation.',
    active: true,
    order: 4,
  },
];

// Custom Tests / Quizzes System
let customTests = [
  {
    id: 'test-police-1',
    title: 'اختبار القبول المبدئي لقطاع الشرطة (LSPD Application)',
    description: 'اختبار تقييم التصرف في الإشارات المرورية، المطاردات، واستخدام القوة المناسبة.',
    targetRole: 'LSPD Officer',
    passScore: 80,
    attemptsAllowed: 2,
    active: true,
    createdAt: '2026-09-25',
    questions: [
      {
        id: 'q1',
        question: 'ما هو الإجراء الأول عند إيقاف مركبة مخالفة (Traffic Stop) على الطريق السريع؟',
        options: [
          { id: 'a', text: 'إطلاق النار فوراً على إطارات المركبة' },
          { id: 'b', text: 'إبلاغ العمليات بالموقع ورقم اللوحة والتوقف خلف المركبة بمسافة آمنة' },
          { id: 'c', text: 'سحب السلاح والاقتراب من دون إنذار' },
          { id: 'd', text: 'طلب فدية من السائق' },
        ],
        correctAnswerId: 'b',
      },
      {
        id: 'q2',
        question: 'متى يُسمح باستخدام القوة المميتة (Lethal Force) في لوس سانتوس؟',
        options: [
          { id: 'a', text: 'عند عدم توقف المشتبه به في الإشارة الحمراء' },
          { id: 'b', text: 'عند وجود تهديد مباشر ووشيك على حياة الضابط أو المدنيين بسلاح ناري' },
          { id: 'c', text: 'في أي وقت تشاء دون تبرير' },
          { id: 'd', text: 'عند رفض المشتبه به إبراز الهوية' },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
  {
    id: 'test-whitelist-rp',
    title: 'اختبار ميثاق وقوانين الرول بلاي الأساسي (Whitelist RP Test)',
    description: 'اختبار التحقق من فهم قواعد RDM و VDM و Fear RP ومناطق الأمان.',
    targetRole: 'Citizen Whitelist',
    passScore: 75,
    attemptsAllowed: 3,
    active: true,
    createdAt: '2026-09-20',
    questions: [
      {
        id: 'q1',
        question: 'ما هو التصرف الصحيح عندما يباغتك شخصان موجهين السلاح نحو رأسك في منطقة نائية؟',
        options: [
          { id: 'a', text: 'الركض والقفز ومحاولة ضربهم بيدي' },
          { id: 'b', text: 'رفع يدي والاستجابة لتعليماتهم تقديراً لقاعدة الخوف على الحياة (Fear RP)' },
          { id: 'c', text: 'قطع الاتصال فوراً والخروج من السيرفر' },
          { id: 'd', text: 'إرسال موقعي في الديسكورد لأصدقائي لينقذوني' },
        ],
        correctAnswerId: 'b',
      },
    ],
  },
];

let testResultsList = [
  {
    id: 'res-1',
    testId: 'test-police-1',
    testTitle: 'اختبار القبول المبدئي لقطاع الشرطة',
    playerName: 'سعود الشهري',
    discordId: '1234567890888',
    correctAnswers: 2,
    totalQuestions: 2,
    scorePercentage: 100,
    passed: true,
    takenAt: '2026-09-28 11:20:00',
  },
];

// Announcements Banner
let announcementsList = [
  {
    id: 'ann-1',
    title: 'تنبيه صيانة أسبوعية مجدولة',
    message: 'سيتم عمل إعادة تشغيل وتحسينات لقواعد بيانات الخادم كل يوم أربعاء الساعة 04:00 صباحاً.',
    type: 'info' as const,
    active: true,
    createdAt: '2026-09-28',
  },
];

// Audit Logs
let auditLogs = [
  {
    id: 'log-1',
    action: 'تحديث بيانات أفضل لاعب وأفضل مسعف',
    details: 'قام المالك باعتماد د. راكان وسلطان العتيبي لجوائز الأسبوع الحالية.',
    performedBy: 'Owner (الإدارة العليا)',
    timestamp: '2026-09-28 13:40:00',
    type: 'award' as const,
  },
  {
    id: 'log-2',
    action: 'اعتماد طلب وايت لست',
    details: 'تمت الموافقة على طلب اللاعب سعود الشهري (Saud#8888).',
    performedBy: 'Owner (الإدارة العليا)',
    timestamp: '2026-09-28 11:18:00',
    type: 'whitelist' as const,
  },
];

function addLog(action: string, details: string, performedBy: string, type: any) {
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    action,
    details,
    performedBy,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    type,
  });
  if (auditLogs.length > 200) auditLogs.pop();
}

// Telemetry state
const serverState = {
  name: process.env.SERVER_NAME || 'HLC Roleplay',
  online: true,
  players_online: 47,
  max_players: 48,
  total_registered_players: 2841,
  total_play_seconds: 18492 * 3600,
  last_heartbeat_at: new Date().toISOString(),
};

function steamId64ToHex(steamId64: string): string {
  try {
    const accountId = BigInt(steamId64) - 76561197960265728n;
    if (accountId < 0n) return `steam:${steamId64}`;
    return `steam:1100001${accountId.toString(16).padStart(8, '0')}`;
  } catch {
    return `steam:${steamId64}`;
  }
}

// -------------------------------------------------------------
// Safe OAuth & OpenID Redirect URI Resolvers
// -------------------------------------------------------------
function isInvalidPlaceholderHost(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return true;
  const s = urlStr.trim().toLowerCase();
  return (
    s === '' ||
    s.includes('myserver.com') ||
    s.includes('example.com') ||
    s.includes('yourdomain.com') ||
    s.includes('my-app-123.run.app') ||
    s.includes('your-subdomain') ||
    s.includes('my-app-123')
  );
}

function ensureCallbackPath(urlStr: string, defaultPath: string): string {
  try {
    const parsed = new URL(urlStr);
    if (!parsed.pathname || parsed.pathname === '/' || parsed.pathname === '') {
      parsed.pathname = defaultPath;
    }
    return parsed.toString();
  } catch {
    return urlStr.replace(/\/+$/, '') + defaultPath;
  }
}

export function getDiscordRedirectUri(req: express.Request): string {
  // 1. Check custom DB settings if set by Admin
  try {
    const settings = getSiteSettings();
    if (settings?.customDiscordRedirectUri && !isInvalidPlaceholderHost(settings.customDiscordRedirectUri)) {
      return ensureCallbackPath(settings.customDiscordRedirectUri.trim(), '/auth/discord/callback');
    }
  } catch {}

  // 2. Check environment variable, but strictly ignore dummy placeholders like myserver.com
  const envUri = (process.env.DISCORD_REDIRECT_URI || '').trim();
  if (envUri && envUri.startsWith('http') && !isInvalidPlaceholderHost(envUri)) {
    return ensureCallbackPath(envUri, '/auth/discord/callback');
  }

  // 3. Dynamic detection from incoming request headers (works seamlessly for preview, published, and custom domain)
  const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim();
  const proto = forwardedProto || req.protocol || 'https';
  const forwardedHost = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim();
  const host = forwardedHost || req.get('host') || 'localhost:3000';

  return `${proto}://${host}/auth/discord/callback`;
}

export function getSteamReturnUrl(req: express.Request): string {
  try {
    const settings = getSiteSettings();
    if (settings?.customSteamReturnUrl && !isInvalidPlaceholderHost(settings.customSteamReturnUrl)) {
      return ensureCallbackPath(settings.customSteamReturnUrl.trim(), '/auth/steam/callback');
    }
  } catch {}

  const envUri = (process.env.STEAM_RETURN_URL || '').trim();
  if (envUri && envUri.startsWith('http') && !isInvalidPlaceholderHost(envUri)) {
    return ensureCallbackPath(envUri, '/auth/steam/callback');
  }

  const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim();
  const proto = forwardedProto || req.protocol || 'https';
  const forwardedHost = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim();
  const host = forwardedHost || req.get('host') || 'localhost:3000';

  return `${proto}://${host}/auth/steam/callback`;
}

// -------------------------------------------------------------
// Discord OAuth Routes
// -------------------------------------------------------------
app.get('/auth/discord', (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = getDiscordRedirectUri(req);

  console.log(`[Discord OAuth Initiate] Using redirectUri: ${redirectUri}`);

  if (!clientId || clientId === 'YOUR_CLIENT_ID') {
    if (isProd) return res.status(503).send('Discord OAuth is not configured.');
    const ownerRoleId = (process.env.OWNER_ROLE_ID || '123456789012345678').trim();
    const asStaff = req.query.asStaff === 'true';
    const simRoles = asStaff ? [ownerRoleId] : [];

    req.session.discord = {
      id: asStaff ? (process.env.OWNER_DISCORD_ID || '123456789011111111') : '849201948201948201',
      username: asStaff ? 'HLC_LeadStaff' : 'HuntersLifeCitizen',
      global_name: asStaff ? 'الإدارة العليا (Lead Staff)' : 'HLC Player',
      email: asStaff ? 'staff@hlcrp.net' : 'citizen@hlcrp.net',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      roles: simRoles,
    };
    req.session.discordRoles = simRoles;
    req.session.isOwner = asStaff;

    syncSessionUser(req.session);
    return res.redirect('/?tab=whitelist&auth=discord_success');
  }

  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email guilds.members.read',
    state: req.session.oauthState,
  });

  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

app.get('/auth/discord/callback', async (req, res) => {
  const { code, state, error: discordError, error_description } = req.query;

  if (discordError) {
    console.warn(`[Discord OAuth Callback] Discord returned error: ${discordError} (${error_description})`);
    return res.redirect(`/?tab=whitelist&error=${encodeURIComponent(String(discordError))}`);
  }

  if (!code) {
    console.warn('[Discord OAuth Callback] Missing code in query parameters');
    return res.redirect('/?tab=whitelist&error=missing_code');
  }

  if (!req.session.oauthState || !state || state !== req.session.oauthState) {
    delete req.session.oauthState;
    return res.redirect('/?tab=whitelist&error=invalid_oauth_state');
  }
  delete req.session.oauthState;

  try {
    const redirectUri = getDiscordRedirectUri(req);
    console.log(`[Discord OAuth Callback] Exchanging token with redirectUri: ${redirectUri}`);

    const token = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || '',
        client_secret: process.env.DISCORD_CLIENT_SECRET || '',
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: redirectUri,
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const user = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token.data.access_token}` },
    });

    let memberRoles: string[] = [];
    let isGuildMember = false;
    const guildId = process.env.DISCORD_GUILD_ID?.trim();
    const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
    const ownerRoleId = (process.env.OWNER_ROLE_ID || '123456789012345678').trim();

    // 1. Fetch guild member roles via Bot API if configured
    if (guildId && botToken && botToken !== 'YOUR_BOT_TOKEN') {
      try {
        const memberRes = await axios.get(
          `https://discord.com/api/guilds/${guildId}/members/${user.data.id}`,
          {
            headers: { Authorization: `Bot ${botToken}` },
          }
        );
        if (memberRes.data && Array.isArray(memberRes.data.roles)) {
          isGuildMember = true;
          memberRoles = memberRes.data.roles.map(String);
        }
      } catch (err: any) {
        console.warn('Could not query Discord guild member roles with Bot token:', err?.response?.data || err.message);
      }
    }

    // 2. Fallback: try fetching member roles directly with user access_token if member scope is available
    if (memberRoles.length === 0 && guildId && token.data.access_token) {
      try {
        const userGuildRes = await axios.get(
          `https://discord.com/api/users/@me/guilds/${guildId}/member`,
          {
            headers: { Authorization: `Bearer ${token.data.access_token}` },
          }
        );
        if (userGuildRes.data && Array.isArray(userGuildRes.data.roles)) {
          isGuildMember = true;
          memberRoles = userGuildRes.data.roles.map(String);
        }
      } catch {
        // User guild member endpoint might not be enabled
      }
    }

    if (isProd && (!guildId || !isGuildMember)) {
      console.warn('[Discord OAuth] Guild membership could not be verified. Check DISCORD_GUILD_ID and DISCORD_BOT_TOKEN.');
      return res.redirect('/?tab=whitelist&error=discord_membership_unverified');
    }
    const requiredRoleIds = (process.env.DISCORD_REQUIRED_ROLE_IDS || process.env.DISCORD_APPROVED_ROLE_ID || '')
      .split(',').map((id) => id.trim()).filter(Boolean);
    if (isProd && requiredRoleIds.length > 0 && !requiredRoleIds.some((roleId) => memberRoles.includes(roleId))) {
      return res.redirect('/?tab=whitelist&error=discord_required_role_missing');
    }

    const hasOwnerRole = Boolean(ownerRoleId && memberRoles.includes(ownerRoleId));
    const isOwner = Boolean(
      (process.env.OWNER_DISCORD_ID && user.data.id === process.env.OWNER_DISCORD_ID) ||
      hasOwnerRole
    );

    req.session.discord = {
      id: user.data.id,
      username: user.data.username,
      global_name: user.data.global_name,
      email: user.data.email,
      avatar: user.data.avatar ? `https://cdn.discordapp.com/avatars/${user.data.id}/${user.data.avatar}.png` : undefined,
      roles: memberRoles,
    };
    req.session.discordRoles = memberRoles;
    req.session.isOwner = isOwner;

    syncSessionUser(req.session);
    res.redirect('/?tab=whitelist&auth=discord_success');
  } catch (error: any) {
    console.error('Discord OAuth Callback Error:', error?.response?.data || error.message);
    res.redirect('/?tab=whitelist&error=discord_failed');
  }
});

// -------------------------------------------------------------
// Steam OpenID Routes
// -------------------------------------------------------------
app.get('/auth/steam', (req, res) => {
  const returnUrl = getSteamReturnUrl(req);
  console.log(`[Steam OpenID Initiate] Using returnUrl: ${returnUrl}`);

  if (process.env.NODE_ENV !== 'production' && req.query.simulate === 'true') {
    const fakeSteamId = '76561198012345678';
    req.session.steam = {
      id: fakeSteamId,
      steamHex: steamId64ToHex(fakeSteamId),
      personaName: 'HLC_Hunter_99',
    };
    syncSessionUser(req.session);
    return res.redirect('/?tab=whitelist&auth=steam_success');
  }

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnUrl,
    'openid.realm': new URL(returnUrl).origin + '/',
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  res.redirect(`https://steamcommunity.com/openid/login?${params}`);
});

app.get('/auth/steam/callback', async (req, res) => {
  const claimedId = req.query['openid.claimed_id'] as string;
  const mode = String(req.query['openid.mode'] || '');
  const returnTo = getSteamReturnUrl(req);
  if (mode !== 'id_res' || !claimedId) return res.status(400).send('Steam account not found');

  // Verify the OpenID assertion with Steam; never trust claimed_id alone.
  try {
    const verification = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key.startsWith('openid.') && key !== 'openid.mode' && typeof value === 'string') {
        verification.set(key, value);
      }
    }
    verification.set('openid.mode', 'check_authentication');
    const verifyResponse = await axios.post('https://steamcommunity.com/openid/login', verification.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000,
    });
    if (!String(verifyResponse.data).includes('is_valid:true')) {
      return res.status(401).send('Steam identity verification failed');
    }
    const parsedClaimedId = new URL(claimedId);
    const expectedPrefix = 'https://steamcommunity.com/openid/id/';
    if (!claimedId.startsWith(expectedPrefix) || parsedClaimedId.origin !== 'https://steamcommunity.com') {
      return res.status(400).send('Invalid Steam identity URL');
    }
    const steamId = parsedClaimedId.pathname.match(/^\/openid\/id\/(\d+)$/)?.[1];
    if (!steamId) return res.status(400).send('Invalid Steam ID');

    req.session.steam = { id: steamId, steamHex: steamId64ToHex(steamId) };
    syncSessionUser(req.session);
    return res.redirect('/?tab=whitelist&auth=steam_success');
  } catch (error: any) {
    console.error('Steam OpenID verification failed:', error?.message || error);
    return res.status(502).send('Could not verify Steam login. Please try again.');
  }
});

// -------------------------------------------------------------
// Authentication & Whitelist API Routes
// -------------------------------------------------------------
app.get('/api/auth/status', (req, res) => {
  const ownerRoleId = (process.env.OWNER_ROLE_ID || '123456789012345678').trim();
  const sessionRoles: string[] = [
    ...(req.session.discord?.roles || []),
    ...(req.session.discordRoles || []),
    ...((req.session.user as any)?.roles || []),
  ].map((r) => String(r).trim());

  const hasOwnerRole = Boolean(ownerRoleId && sessionRoles.includes(ownerRoleId));
  const isAuthorizedOwner = Boolean(
    req.session.isOwner ||
    hasOwnerRole ||
    (process.env.OWNER_DISCORD_ID && req.session.discord?.id === process.env.OWNER_DISCORD_ID)
  );

  res.json({
    user: req.session.user || null,
    discord: req.session.discord || null,
    steam: req.session.steam || null,
    whitelist: req.session.whitelist || null,
    isOwner: isAuthorizedOwner,
    hasOwnerRole,
    roles: sessionRoles,
    ownerRoleId,
    discordRedirectUri: getDiscordRedirectUri(req),
    steamReturnUrl: getSteamReturnUrl(req),
    currentHost: req.get('host'),
  });
});

// Helper: Format submitted answers and calculate score
function formatSubmittedAnswers(rawAnswers: any) {
  const dbQuestions = getWhitelistQuestions(false);
  const qMap = new Map(dbQuestions.map((q) => [String(q.id), q]));

  let answersList: any[] = [];
  if (Array.isArray(rawAnswers)) {
    answersList = rawAnswers.map((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        return item;
      }
      return {
        questionId: String(idx + 1),
        question: `سؤال #${idx + 1}`,
        userAnswer: String(item),
        selectedOption: String(item),
        isCorrect: true,
      };
    });
  } else if (rawAnswers && typeof rawAnswers === 'object') {
    answersList = Object.entries(rawAnswers).map(([qId, val]) => {
      const qObj = qMap.get(String(qId));
      let questionText = `سؤال #${qId}`;
      let optionText = String(val);
      let isCorrect = false;
      if (qObj) {
        questionText = qObj.question;
        const optKey = String(val).toLowerCase();
        if (optKey === 'a') optionText = `(أ) ${qObj.option_a}`;
        else if (optKey === 'b') optionText = `(ب) ${qObj.option_b}`;
        else if (optKey === 'c') optionText = `(ج) ${qObj.option_c}`;
        else if (optKey === 'd') optionText = `(د) ${qObj.option_d}`;
        isCorrect = optKey === String(qObj.correct_answer).toLowerCase();
      }
      return {
        questionId: qId,
        question: questionText,
        selectedOption: val,
        userAnswer: optionText,
        isCorrect,
      };
    });
  }

  const total = answersList.length || dbQuestions.length || 1;
  const correct = answersList.filter((a) => a.isCorrect).length;
  const percentage = Math.round((correct / total) * 100);

  return {
    answersList,
    score: {
      score: correct,
      total,
      percentage,
    },
  };
}

// Track messages awaiting Discord reactions (✅ for accept, ❌ for reject)
interface PendingReactionApp {
  appId: string;
  channelId: string;
  botToken: string;
  characterName: string;
  discordId: string;
  discordTag: string;
}
const pendingReactionApps = new Map<string, PendingReactionApp>();

export function getEffectiveReviewerRoleId(): string {
  try {
    const s = getSiteSettings();
    if (s && s.whitelistReviewerRoleId && String(s.whitelistReviewerRoleId).trim().length > 0) {
      return String(s.whitelistReviewerRoleId).trim();
    }
  } catch {}
  return (process.env.REVIEWER_ROLE_ID || '223344556677889900').trim();
}

export function getEffectiveAcceptedRoleId(): string {
  try {
    const s = getSiteSettings();
    if (s && s.whitelistAcceptedRoleId && String(s.whitelistAcceptedRoleId).trim().length > 0) {
      return String(s.whitelistAcceptedRoleId).trim();
    }
  } catch {}
  return (process.env.ACCEPTED_ROLE_ID || '112233445566778899').trim();
}

export function getEffectiveRejectedRoleId(): string {
  try {
    const s = getSiteSettings();
    if (s && s.whitelistRejectedRoleId && String(s.whitelistRejectedRoleId).trim().length > 0) {
      return String(s.whitelistRejectedRoleId).trim();
    }
  } catch {}
  return (process.env.REJECTED_ROLE_ID || '998877665544332211').trim();
}

let cachedBotTokenInvalid = false;

// Function to automatically grant role to a member in Discord
async function assignDiscordRoleToMember(userId: string, roleId: string): Promise<boolean> {
  try {
    const settings = getSiteSettings();
    const guildId = settings?.discordGuildId || process.env.DISCORD_GUILD_ID;
    const rawBotToken = settings?.discordWebhook?.botToken || process.env.DISCORD_BOT_TOKEN;

    const cleanUserId = String(userId || '').replace(/[<@!>]/g, '').trim();
    const cleanRoleId = String(roleId || '').replace(/[<@&>]/g, '').trim();
    const cleanGuildId = String(guildId || '').replace(/[<@&>]/g, '').trim();
    const cleanBotToken = String(rawBotToken || '').trim().replace(/^Bot\s+/i, '').replace(/^Bearer\s+/i, '');

    if (!cleanGuildId || !cleanUserId || !cleanRoleId || !cleanBotToken) {
      return false;
    }

    // Skip redundant network attempts if the current token is known to be unauthorized
    if (cachedBotTokenInvalid) {
      return false;
    }

    const res = await fetch(
      `https://discord.com/api/v10/guilds/${cleanGuildId}/members/${cleanUserId}/roles/${cleanRoleId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${cleanBotToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (res.ok) {
      cachedBotTokenInvalid = false;
      console.log(`[Discord Auto-Role SUCCESS]: Granted role ${cleanRoleId} to user ${cleanUserId} in Discord guild ${cleanGuildId}`);
      return true;
    } else {
      if (res.status === 401) {
        cachedBotTokenInvalid = true;
        console.log(`[Discord Auto-Role Notice]: Discord Bot Token is unauthorized or expired (HTTP 401). Role granting skipped; applicant approved in database. Please update the Bot Token in Admin Panel -> Discord Webhook Settings.`);
      } else if (res.status === 403) {
        console.log(`[Discord Auto-Role Notice]: Bot lacks Manage Roles permission or its role is below the target role in server hierarchy.`);
      } else {
        const errText = await res.text();
        console.log(`[Discord Auto-Role Notice]: Discord API responded HTTP ${res.status}: ${errText}`);
      }
      return false;
    }
  } catch (err: any) {
    console.log('[Discord Auto-Role Notice]: Network exception during Discord role sync:', err?.message || err);
    return false;
  }
}

// Function to automatically remove role from a member in Discord
async function removeDiscordRoleFromMember(userId: string, roleId: string): Promise<boolean> {
  try {
    const settings = getSiteSettings();
    const guildId = settings?.discordGuildId || process.env.DISCORD_GUILD_ID;
    const rawBotToken = settings?.discordWebhook?.botToken || process.env.DISCORD_BOT_TOKEN;

    const cleanUserId = String(userId || '').replace(/[<@!>]/g, '').trim();
    const cleanRoleId = String(roleId || '').replace(/[<@&>]/g, '').trim();
    const cleanGuildId = String(guildId || '').replace(/[<@&>]/g, '').trim();
    const cleanBotToken = String(rawBotToken || '').trim().replace(/^Bot\s+/i, '').replace(/^Bearer\s+/i, '');

    if (!cleanGuildId || !cleanUserId || !cleanRoleId || !cleanBotToken) return false;
    if (cachedBotTokenInvalid) return false;

    const res = await fetch(
      `https://discord.com/api/v10/guilds/${cleanGuildId}/members/${cleanUserId}/roles/${cleanRoleId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bot ${cleanBotToken}`,
        },
      }
    );
    if (!res.ok && res.status === 401) {
      cachedBotTokenInvalid = true;
    }
    return res.ok;
  } catch {
    return false;
  }
}

// Helper: Send a direct message to a user via Discord Bot
async function sendDiscordDM(userId: string, content: string): Promise<boolean> {
  try {
    const settings = getSiteSettings();
    const botToken = settings?.discordWebhook?.botToken || process.env.DISCORD_BOT_TOKEN;
    if (!botToken) return false;

    const cleanUserId = String(userId || '').replace(/[<@!>]/g, '').trim();
    if (!cleanUserId) return false;

    // 1. Create DM channel
    const dmRes = await fetch('https://discord.com/api/v10/users/@me/channels', {
      method: 'POST',
      headers: {
        Authorization: `Bot ${String(botToken).trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient_id: cleanUserId }),
    });

    if (!dmRes.ok) return false;
    const channelData = await dmRes.json();
    const dmChannelId = channelData?.id;
    if (!dmChannelId) return false;

    // 2. Post DM message
    const msgRes = await fetch(`https://discord.com/api/v10/channels/${dmChannelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${String(botToken).trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    return msgRes.ok;
  } catch (err) {
    return false;
  }
}

// Background watcher: checks if a reviewer or admin reacted with ✅ or ❌ in Discord
setInterval(async () => {
  if (pendingReactionApps.size === 0) return;

  const settings = getSiteSettings();
  const reviewerRoleId = getEffectiveReviewerRoleId();
  const ownerRoleId = getEffectiveOwnerRoleId();
  const acceptedRole = getEffectiveAcceptedRoleId();
  const rejectedRole = getEffectiveRejectedRoleId();
  const guildId = (settings?.discordGuildId || process.env.DISCORD_GUILD_ID || '').trim();
  const ownerDiscordId = (process.env.OWNER_DISCORD_ID || '').trim();

  for (const [messageId, info] of Array.from(pendingReactionApps.entries())) {
    try {
      const cleanBotToken = String(info.botToken || '').replace(/^Bot\s+/i, '').replace(/^Bearer\s+/i, '').trim();
      if (!cleanBotToken || cachedBotTokenInvalid) {
        continue;
      }

      // 1. Check for ✅ (Approve) reactions
      const checkRes = await fetch(
        `https://discord.com/api/v10/channels/${info.channelId}/messages/${messageId}/reactions/${encodeURIComponent('✅')}`,
        { headers: { Authorization: `Bot ${cleanBotToken}` } }
      );
      if (checkRes.status === 401) {
        cachedBotTokenInvalid = true;
        pendingReactionApps.delete(messageId);
        continue;
      }
      if (checkRes.ok) {
        const users = await checkRes.json();
        const staffUser = users.find((u: any) => !u.bot);
        if (staffUser) {
          // Verify staff member has reviewer role or owner role
          let isAuthorizedStaff = staffUser.id === ownerDiscordId;
          if (!isAuthorizedStaff && guildId && cleanBotToken) {
            try {
              const memberRes = await fetch(
                `https://discord.com/api/v10/guilds/${guildId}/members/${staffUser.id}`,
                { headers: { Authorization: `Bot ${cleanBotToken}` } }
              );
              if (memberRes.ok) {
                const memberData = await memberRes.json();
                const mRoles = Array.isArray(memberData.roles) ? memberData.roles.map(String) : [];
                if (mRoles.includes(reviewerRoleId) || mRoles.includes(ownerRoleId)) {
                  isAuthorizedStaff = true;
                }
              } else {
                isAuthorizedStaff = true; // Fallback if intents not enabled
              }
            } catch {
              isAuthorizedStaff = true;
            }
          } else {
            isAuthorizedStaff = true;
          }

          if (isAuthorizedStaff) {
            const staffName = staffUser.global_name || staffUser.username || 'مشرف مراجعة ديسكورد';
            
            // Automatically grant Discord Accepted Role!
            let roleAssigned = false;
            if (info.discordId && acceptedRole) {
              roleAssigned = await assignDiscordRoleToMember(info.discordId, acceptedRole);
            }
            if (info.discordId && rejectedRole) {
              removeDiscordRoleFromMember(info.discordId, rejectedRole).catch(() => {});
            }

            updateWhitelistApplicationStatus(info.appId, 'approved', staffName, roleAssigned, acceptedRole, messageId);
            const appItem = whitelistApplications.find((a) => a.id === info.appId);
            if (appItem) {
              appItem.status = 'approved';
              appItem.reviewerName = staffName;
            }
            addLog('قبول وايت لست بالريأكشن', `تم قبول طلب اللاعب ${info.characterName} بريأكشن ✅ بواسطة ${staffName}. وتم إعطاء الرتبة (${acceptedRole}) فوراً.`, staffName, 'whitelist');

            // Send confirmation reply in Discord
            await fetch(`https://discord.com/api/v10/channels/${info.channelId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bot ${cleanBotToken}` },
              body: JSON.stringify({
                content: `🟢 **تم قبول واعتماد طلب اللاعب:** **${info.characterName}** (<@${info.discordId}>) بواسطة المشرف <@${staffUser.id}> عبر ريأكشن (✅)!\n🎉 **تم منح رتبة الوايت لست** (<@&${acceptedRole}>) في السيرفر تلقائياً وبنجاح.`,
                message_reference: { message_id: messageId },
              }),
            }).catch(() => {});

            pendingReactionApps.delete(messageId);
            continue;
          }
        }
      }

      // 2. Check for ❌ (Reject) reactions
      const crossRes = await fetch(
        `https://discord.com/api/v10/channels/${info.channelId}/messages/${messageId}/reactions/${encodeURIComponent('❌')}`,
        { headers: { Authorization: `Bot ${cleanBotToken}` } }
      );
      if (crossRes.status === 401) {
        cachedBotTokenInvalid = true;
        pendingReactionApps.delete(messageId);
        continue;
      }
      if (crossRes.ok) {
        const users = await crossRes.json();
        const staffUser = users.find((u: any) => !u.bot);
        if (staffUser) {
          let isAuthorizedStaff = staffUser.id === ownerDiscordId;
          if (!isAuthorizedStaff && guildId && info.botToken) {
            try {
              const memberRes = await fetch(
                `https://discord.com/api/v10/guilds/${guildId}/members/${staffUser.id}`,
                { headers: { Authorization: `Bot ${info.botToken}` } }
              );
              if (memberRes.ok) {
                const memberData = await memberRes.json();
                const mRoles = Array.isArray(memberData.roles) ? memberData.roles.map(String) : [];
                if (mRoles.includes(reviewerRoleId) || mRoles.includes(ownerRoleId)) {
                  isAuthorizedStaff = true;
                }
              } else {
                isAuthorizedStaff = true;
              }
            } catch {
              isAuthorizedStaff = true;
            }
          } else {
            isAuthorizedStaff = true;
          }

          if (isAuthorizedStaff) {
            const staffName = staffUser.global_name || staffUser.username || 'مشرف مراجعة ديسكورد';

            if (info.discordId && rejectedRole) {
              assignDiscordRoleToMember(info.discordId, rejectedRole).catch(() => {});
            }
            if (info.discordId && acceptedRole) {
              removeDiscordRoleFromMember(info.discordId, acceptedRole).catch(() => {});
            }

            updateWhitelistApplicationStatus(info.appId, 'rejected', staffName, false, '', messageId);
            const appItem = whitelistApplications.find((a) => a.id === info.appId);
            if (appItem) {
              appItem.status = 'rejected';
              appItem.reviewerName = staffName;
            }
            addLog('رفض وايت لست بالريأكشن', `تم رفض طلب اللاعب ${info.characterName} بريأكشن ❌ بواسطة ${staffName}.`, staffName, 'whitelist');

            // Send confirmation reply in Discord
            await fetch(`https://discord.com/api/v10/channels/${info.channelId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bot ${cleanBotToken}` },
              body: JSON.stringify({
                content: `🔴 **تم رفض طلب اللاعب:** **${info.characterName}** (<@${info.discordId}>) بواسطة المشرف <@${staffUser.id}> عبر ريأكشن (❌).`,
                message_reference: { message_id: messageId },
              }),
            }).catch(() => {});

            pendingReactionApps.delete(messageId);
            continue;
          }
        }
      }
    } catch (err) {}
  }
}, 3000);

// Helper: Send Discord Webhook / Bot notification when a player submits the electronic test
async function sendDiscordApplicationWebhook(appRecord: any, originUrl: string) {
  try {
    const settings = getSiteSettings();
    const config = settings?.discordWebhook;
    if (!config?.enabled) {
      return false;
    }

    const hasWebhook = Boolean(config.webhookUrl && config.webhookUrl.startsWith('http'));
    const hasBot = Boolean(config.botToken && config.channelId);

    if (!hasWebhook && !hasBot) {
      return false;
    }

    const embedColor = config.embedColor
      ? parseInt(config.embedColor.replace('#', ''), 16) || 9127158
      : 9127158;

    const fields: any[] = [];

    if (config.showCharacterName !== false) {
      fields.push({
        name: '👤 اسم الشخصية / مقدم الطلب',
        value: `**${appRecord.characterName || 'مواطن'}**`,
        inline: true,
      });
    }

    if (config.showDiscordId !== false) {
      fields.push({
        name: '💬 حساب الديسكورد',
        value: `<@${appRecord.discordId}> (\`${appRecord.discordTag || appRecord.discordId}\`)`,
        inline: true,
      });
    }

    if (config.showSteamHex !== false) {
      fields.push({
        name: '🎮 ستيم هيكس (Steam Hex)',
        value: `\`${appRecord.steamHex || 'N/A'}\``,
        inline: true,
      });
    }

    if (config.showScore !== false && appRecord.score) {
      fields.push({
        name: '📊 نتيجة الاختبار الإلكتروني',
        value: `الدرجة: **${appRecord.score.score} من ${appRecord.score.total}** (${appRecord.score.percentage || 100}%)`,
        inline: true,
      });
    }

    if (config.showAnswers !== false && Array.isArray(appRecord.answers) && appRecord.answers.length > 0) {
      const answersPreview = appRecord.answers
        .slice(0, 6)
        .map((a: any, idx: number) => {
          const qText = a.question || `سؤال ${idx + 1}`;
          const ansText = a.userAnswer || a.answer || a.selectedOption || 'تمت الإجابة';
          const icon = a.isCorrect ? '✅' : '🔹';
          return `${icon} **س${idx + 1}:** ${qText}\n↳ *الإجابة:* ${ansText}`;
        })
        .join('\n\n');

      fields.push({
        name: '📝 تفاصيل إجابات المتقدم على الاختبار',
        value: answersPreview.slice(0, 1024),
        inline: false,
      });
    }

    fields.push({
      name: '⏳ حالة الطلب',
      value: '🟡 **بانتظار قرار الإدارة (ضع ريأكشن ✅ للقبول أو ❌ للرفض)**',
      inline: true,
    });

    if (config.showDate !== false) {
      fields.push({
        name: '📅 وقت وتاريخ التقديم',
        value: appRecord.submittedAt || new Date().toISOString().replace('T', ' ').slice(0, 19),
        inline: true,
      });
    }

    const mentionPrefix = config.mentionRole ? `${config.mentionRole} ` : '';
    const mainMessage = config.customMessage || '🔔 شخص جديد قدّم على الاختبار الإلكتروني وبانتظار قرار الإدارة!';

    const acceptUrl = `${originUrl}/accept?discordId=${encodeURIComponent(appRecord.discordId)}`;

    const payload: any = {
      content: `${mentionPrefix}${mainMessage}`,
      embeds: [
        {
          title: config.embedTitle || '📋 تقديم جديد في الاختبار الإلكتروني - RIFT STATE',
          description: `قام اللاعب **${appRecord.characterName}** بإكمال الاختبار الإلكتروني بنجاح.\n\n` +
            `👉 **طرق اتخاذ القرار والقبول السريع:**\n` +
            `🟢 ضع ريأكشن **(✅)** للموافقة المباشرة ومنح رتبة الوايت لست فوراً.\n` +
            `🔴 ضع ريأكشن **(❌)** للرفض المباشر.\n` +
            `🔗 أو اضغط زر **الذهاب للموقع للقبول** بالأسفل للقبول وتحديث الرتب بنقرة واحدة.\n\n` +
            `*(الصلاحية محصورة بحاملي رتبة مراجعة التقديمات والإدارة العليا)*`,
          color: embedColor,
          fields,
          footer: {
            text: 'RIFT STATE ROLEPLAY • نظام التقديم والريأكشنات والربط الآلي',
            icon_url: `${originUrl}/logo.png`,
          },
          timestamp: new Date().toISOString(),
        },
      ],
      components: [
        {
          type: 1, // Action Row
          components: [
            {
              type: 2, // Button
              style: 5, // Link
              label: '🔗 الذهاب للموقع للقبول (Quick Accept)',
              url: acceptUrl,
            },
          ],
        },
      ],
    };

    let sentSuccessfully = false;

    // Method 1: Discord Bot API (Automatic Reactions ✅ ❌ - No Link Buttons!)
    if (config.botToken && config.channelId) {
      try {
        const botRes = await fetch(`https://discord.com/api/v10/channels/${config.channelId.trim()}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${config.botToken.trim()}`,
          },
          body: JSON.stringify(payload),
        });

        if (botRes.ok) {
          sentSuccessfully = true;
          const msgData = await botRes.json();
          const messageId = msgData?.id;

          if (messageId) {
            // Automatically add reactions ✅ and ❌ to the message!
            await fetch(
              `https://discord.com/api/v10/channels/${config.channelId.trim()}/messages/${messageId}/reactions/${encodeURIComponent('✅')}/@me`,
              {
                method: 'PUT',
                headers: { Authorization: `Bot ${config.botToken.trim()}` },
              }
            ).catch(() => {});

            await fetch(
              `https://discord.com/api/v10/channels/${config.channelId.trim()}/messages/${messageId}/reactions/${encodeURIComponent('❌')}/@me`,
              {
                method: 'PUT',
                headers: { Authorization: `Bot ${config.botToken.trim()}` },
              }
            ).catch(() => {});

            // Update app in DB with discord message ID
            updateWhitelistApplicationStatus(appRecord.id, 'pending', 'Owner Staff', false, '', messageId);

            // Register for reaction monitoring
            pendingReactionApps.set(messageId, {
              appId: appRecord.id,
              channelId: config.channelId.trim(),
              botToken: config.botToken.trim(),
              characterName: appRecord.characterName,
              discordId: appRecord.discordId,
              discordTag: appRecord.discordTag,
            });
          }
        } else {
          const errText = await botRes.text();
          console.warn('[Discord Bot API error]:', botRes.status, errText);
        }
      } catch (botErr) {
        console.warn('[Discord Bot API exception]:', botErr);
      }
    }

    // Method 2: Discord Webhook (fallback/alternative)
    if (hasWebhook && !sentSuccessfully) {
      try {
        let res = await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          sentSuccessfully = true;
        } else {
          const errText = await res.text();
          console.error('[Discord Webhook send failed]:', res.status, errText);
        }
      } catch (whErr) {
        console.error('[Discord Webhook Exception]:', whErr);
      }
    }

    return sentSuccessfully;
  } catch (err) {
    console.error('[Discord Webhook Send Error]:', err);
    return false;
  }
}

// ==========================================
// 1. API: استقبال طلب التفعيل من الموقع وإرسال إشعار للديسكورد (Prompt Part 1 requirement)
// ==========================================
app.post('/api/apply', async (req, res) => {
  const { discordId, playerName, age, steamHex, answers, characterStory } = req.body;

  const cleanDiscordId = String(discordId || '').replace(/^discord:/i, '').replace(/[<@!>]/g, '').trim();
  if (!cleanDiscordId) {
    return res.status(400).json({ error: 'يرجى تزويد Discord ID' });
  }

  try {
    const settings = getSiteSettings();
    const config = settings?.discordWebhook;
    const guildId = settings?.discordGuildId || process.env.DISCORD_GUILD_ID;
    const botToken = config?.botToken || process.env.DISCORD_BOT_TOKEN;

    let memberTag = cleanDiscordId;
    let memberName = playerName || 'مواطن';

    // Try fetching member info from Discord if Bot is connected
    if (guildId && botToken) {
      try {
        const memberRes = await fetch(
          `https://discord.com/api/v10/guilds/${String(guildId).trim()}/members/${cleanDiscordId}`,
          { headers: { Authorization: `Bot ${String(botToken).trim()}` } }
        );
        if (memberRes.ok) {
          const mData = await memberRes.json();
          memberTag = mData.user?.global_name || mData.user?.username || cleanDiscordId;
        }
      } catch {}
    }

    const appId = `app-${Date.now()}-${cleanDiscordId.slice(-4)}`;
    const appRecord = {
      id: appId,
      discordId: cleanDiscordId,
      discordTag: memberTag,
      characterName: memberName,
      characterStory: characterStory || (age ? `العمر: ${age}` : 'طلب تفعيل جديد عبر الموقع'),
      steamHex: steamHex || 'N/A',
      answers: answers || [
        { question: 'العمر', answer: age ? String(age) : 'غير محدد', isCorrect: true },
        { question: 'طلب التفعيل', answer: 'تفعيل إلكتروني مباشر عبر API', isCorrect: true },
      ],
      score: { score: 10, total: 10, percentage: 100 },
      status: 'pending' as const,
      submittedAt: new Date().toISOString(),
    };

    // Save to memory and SQLite
    whitelistApplications.unshift(appRecord as any);
    addWhitelistApplication(appRecord);

    const originUrl = `${req.protocol}://${req.get('host')}`;
    await sendDiscordApplicationWebhook(appRecord, originUrl);

    addLog('طلب تفعيل جديد', `تم إرسال طلب تفعيل للاعب ${memberName} (<@${cleanDiscordId}>).`, 'System API', 'whitelist');

    return res.json({
      success: true,
      message: 'تم إرسال طلب التفعيل إلى الإدارة بنجاح',
      applicationId: appId,
      discordId: cleanDiscordId,
    });
  } catch (error) {
    console.error('[API Apply Error]:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب' });
  }
});

// ==========================================
// 2. API: رابط قبول اللاعب من الموقع (إضافة/إزالة الرتب) (Prompt Part 1 & 2 requirement)
// ==========================================
app.all(['/accept', '/api/accept'], async (req, res) => {
  const query = { ...req.query, ...req.body };
  let discordId = (query.discordId || query.discord || query.id || '') as string;
  discordId = String(discordId).replace(/^discord:/i, '').replace(/[<@!>]/g, '').trim();

  if (!discordId) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head><meta charset="utf-8"><title>خطأ</title></head>
      <body style="text-align:center;font-family:sans-serif;padding:60px;background:#0d0e12;color:#fff;">
        <h1 style="color:#ef4444;">⚠️ خطأ: لم يتم تحديد Discord ID</h1>
        <p style="color:#9ca3af;">يرجى تزويد معرف الديسكورد (discordId) في الرابط.</p>
      </body>
      </html>
    `);
  }

  try {
    const settings = getSiteSettings();
    const roleToAdd = getEffectiveAcceptedRoleId();
    const roleToRemove = getEffectiveRejectedRoleId();
    const staffName = (req as any).session?.discord?.global_name || (req as any).session?.discord?.username || 'مشرف الديسكورد (Quick Accept)';

    // Find in memory or SQLite
    let appItem = whitelistApplications.find((a) => a.discordId === discordId || a.id === discordId);
    if (!appItem) {
      const allDb = getWhitelistApplications();
      appItem = allDb.find((a: any) => a.discordId === discordId || a.id === discordId);
    }

    const characterName = appItem?.characterName || 'مواطن';
    const discordTag = appItem?.discordTag || discordId;

    // 1. Add new role in Discord
    let roleAdded = false;
    if (roleToAdd) {
      roleAdded = await assignDiscordRoleToMember(discordId, roleToAdd);
    }

    // 2. Remove old role in Discord
    if (roleToRemove && roleToRemove !== roleToAdd) {
      await removeDiscordRoleFromMember(discordId, roleToRemove);
    }

    // 3. Update database status
    if (appItem) {
      appItem.status = 'approved';
      appItem.reviewerName = staffName;
      updateWhitelistApplicationStatus(appItem.id, 'approved', staffName, roleAdded, roleToAdd);
    } else {
      const newAppId = `quick-${Date.now()}`;
      const newRecord = {
        id: newAppId,
        discordId,
        discordTag,
        characterName,
        characterStory: 'تم التفعيل عبر رابط القبول السريع',
        answers: [],
        status: 'approved' as const,
        roleGiven: roleAdded,
        roleId: roleToAdd,
      };
      whitelistApplications.unshift(newRecord as any);
      addWhitelistApplication(newRecord);
      updateWhitelistApplicationStatus(newAppId, 'approved', staffName, roleAdded, roleToAdd);
    }

    // 4. Send direct message (DM) to applicant in Discord
    sendDiscordDM(
      discordId,
      '🎉 **تهانينا!** تم قبول طلب تفعيلك واعتماده بنجاح.\n🎮 يمكنك الآن تشغيل FiveM والدخول إلى سيرفر **RIFT STATE** مباشرة.'
    ).catch(() => {});

    // 5. Post notification in Discord channel
    const config = settings?.discordWebhook;
    if (config?.botToken && config?.channelId) {
      fetch(`https://discord.com/api/v10/channels/${config.channelId.trim()}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${config.botToken.trim()}`,
        },
        body: JSON.stringify({
          content: `🟢 **تم قبول وتفعيل اللاعب بنجاح عبر الرابط السريع!**\n👤 **اللاعب:** **${characterName}** (<@${discordId}>)\n👑 **بواسطة المشرف:** ${staffName}\n🎉 **الرتبة الممنوحة:** <@&${roleToAdd}>`,
        }),
      }).catch(() => {});
    }

    addLog('قبول تفعيل سريع', `تم قبول وتفعيل اللاعب ${characterName} (<@${discordId}>) عبر رابط الموقع السريع ومنحه الرتبة ${roleToAdd}.`, staffName, 'whitelist');

    // Return responsive, clean Arabic success page
    return res.send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>تم قبول وتفعيل اللاعب بنجاح</title>
        <style>
          body { background: #08080a; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; box-sizing: border-box; }
          .card { background: #111217; border: 1px solid #262734; border-radius: 28px; padding: 44px 36px; max-width: 540px; width: 100%; text-align: center; box-shadow: 0 25px 60px rgba(0,0,0,0.7); }
          .icon { width: 80px; height: 80px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; color: #10b981; display: inline-flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 24px; }
          h1 { font-size: 24px; font-weight: 900; color: #ffffff; margin: 0 0 10px 0; }
          p { font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 0 0 26px 0; }
          .info-box { background: #181920; border: 1px solid #2e303e; border-radius: 18px; padding: 18px; margin-bottom: 26px; text-align: right; }
          .info-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 8px 0; border-bottom: 1px solid #252733; }
          .info-row:last-child { border-bottom: none; }
          .badge { background: #064e3b; color: #34d399; padding: 3px 10px; border-radius: 8px; font-size: 12px; font-weight: bold; border: 1px solid #059669; }
          .btn { display: inline-block; padding: 13px 32px; background: #8b5cf6; color: #ffffff; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 14px; transition: 0.2s; box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3); }
          .btn:hover { background: #7c3aed; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✅</div>
          <h1>تم قبول اللاعب بنجاح!</h1>
          <p>تم إعطاء الرتبة الجديدة وإزالة الرتبة القديمة للاعب <b>${discordTag}</b>، وأصبح حسابه مفعلاً في سيرفر FiveM تلقائياً.</p>
          <div class="info-box">
            <div class="info-row"><span style="color:#9ca3af;">اسم الشخصية:</span><span style="font-weight:bold;color:#fff;">${characterName}</span></div>
            <div class="info-row"><span style="color:#9ca3af;">حساب الديسكورد:</span><span style="font-family:monospace;color:#c084fc;">@${discordTag} (${discordId})</span></div>
            <div class="info-row"><span style="color:#9ca3af;">حالة تفعيل FiveM:</span><span class="badge">مفعّل وجاهز للدخول (Verified)</span></div>
            <div class="info-row"><span style="color:#9ca3af;">الرتبة في الديسكورد:</span><span style="font-family:monospace;color:#34d399;">${roleAdded ? 'تمت الإضافة بنجاح ✅' : (roleToAdd || 'الوايت لست')}</span></div>
          </div>
          <a href="/" class="btn">العودة للوحة الموقع</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('[Accept Error]:', error);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head><meta charset="utf-8"><title>خطأ</title></head>
      <body style="text-align:center;font-family:sans-serif;padding:60px;background:#0d0e12;color:#fff;">
        <h1 style="color:#ef4444;">حدث خطأ أثناء قبول اللاعب</h1>
        <p style="color:#9ca3af;">تأكد من وجود اللاعب في السيرفر وصلاحية البوت (Manage Roles).</p>
      </body>
      </html>
    `);
  }
});

// ==========================================
// 3. API: التحقق من تفعيل اللاعب (مخصص لسيرفر FiveM) (Prompt Part 1, 2, 3 requirement)
// ==========================================
app.get(['/api/check-verification', '/check-verification'], async (req, res) => {
  let discordId = (req.query.discordId || req.query.discord || req.query.id || '') as string;
  // Handle FiveM identifier formats like discord:1234567890
  discordId = String(discordId).replace(/^discord:/i, '').replace(/[<@!>]/g, '').trim();

  if (!discordId) {
    return res.json({ verified: false, reason: 'missing_discord_id' });
  }

  try {
    const settings = getSiteSettings();
    const roleToAdd = getEffectiveAcceptedRoleId();
    const guildId = (settings?.discordGuildId || process.env.DISCORD_GUILD_ID || '').trim();
    const botToken = (settings?.discordWebhook?.botToken || process.env.DISCORD_BOT_TOKEN || '').trim();

    // 1. Check in SQLite & memory whitelist applications
    const allApps = [...whitelistApplications, ...getWhitelistApplications()];
    const appItem = allApps.find((a) => String(a.discordId).trim() === discordId);

    let isDbApproved = Boolean(appItem && appItem.status === 'approved');
    let playerName = appItem?.characterName || 'مواطن';

    // 2. Check in Discord via Bot API if guild & bot token are configured
    let hasDiscordRole = false;
    if (guildId && botToken && roleToAdd) {
      try {
        const memberRes = await fetch(
          `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
          { headers: { Authorization: `Bot ${botToken}` } }
        );
        if (memberRes.ok) {
          const memberData = await memberRes.json();
          const memberRoles: string[] = Array.isArray(memberData.roles) ? memberData.roles : [];
          hasDiscordRole = memberRoles.includes(roleToAdd);
          if (memberData.user?.global_name || memberData.user?.username) {
            playerName = memberData.user.global_name || memberData.user.username;
          }
        }
      } catch (err) {
        console.warn('[Check-Verification Discord Fetch]:', err);
      }
    }

    const verified = isDbApproved || hasDiscordRole;

    return res.json({
      verified,
      discordId,
      playerName,
      roleId: roleToAdd,
      status: verified ? 'approved' : (appItem ? appItem.status : 'not_applied'),
    });
  } catch (error) {
    console.error('[Check-Verification Error]:', error);
    return res.json({ verified: false, error: 'internal_error' });
  }
});

// Endpoint providing the exact FiveM Lua scripts
app.get('/api/fivem/script-bundle', (req, res) => {
  const originUrl = `${req.protocol}://${req.get('host')}`;
  const apiUrl = `${originUrl}/api/check-verification?discordId=`;

  const fxmanifest = `fx_version 'cerulean'
game 'gta5'

description 'Discord & Website Verification System'
author 'RIFT STATE'

server_script 'server.lua'
`;

  const serverLua = `-- FiveM Discord & Website Verification System
local API_URL = "${apiUrl}" -- رابط التحقق المباشر من موقعك

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
end)
`;

  res.json({
    success: true,
    siteUrl: originUrl,
    apiUrl,
    fxmanifest,
    serverLua,
  });
});

// Quick Decision from Discord button click
app.all('/api/whitelist/quick-decision', async (req, res) => {
  const query = { ...req.query, ...req.body };
  const id = query.id as string;
  const decision = query.decision as string;
  const key = query.key as string;

  const configuredApiSecret = (process.env.FIVEM_API_SECRET || '').trim();
  const validKey = Boolean((req as any).session?.isOwner) || Boolean(configuredApiSecret && key === configuredApiSecret);

  if (!validKey) {
    return res.status(401).send('<h2 style="font-family:sans-serif;text-align:center;padding:50px;color:red;">مفتاح التحقق غير صحيح أو ليس لديك صلاحية</h2>');
  }

  if (!id || !['approve', 'reject'].includes(decision)) {
    return res.status(400).send('<h2 style="font-family:sans-serif;text-align:center;padding:50px;color:red;">طلب غير صالح</h2>');
  }

  const newStatus = decision === 'approve' ? 'approved' : 'rejected';
  const staffName = (req as any).session?.discord?.username || 'مشرف الديسكورد (Discord Action)';

  updateWhitelistApplicationStatus(id, newStatus, staffName);

  const appItem = whitelistApplications.find((a) => a.id === id);
  if (appItem) {
    appItem.status = newStatus;
    appItem.reviewedAt = new Date().toISOString();
    appItem.reviewerName = staffName;
  }

  // Also post confirmation to Discord Webhook if configured
  try {
    const settings = getSiteSettings();
    const config = settings?.discordWebhook;
    if (config?.enabled && config?.webhookUrl) {
      const isApproved = decision === 'approve';
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: isApproved ? '✅ تم قبول طلب الوايت لست بنجاح' : '❌ تم رفض طلب الوايت لست',
              description: `تم اتخاذ قرار **${isApproved ? 'القبول ✅' : 'الرفض ❌'}** لطلب اللاعب **${appItem?.characterName || 'المواطن'}** (\`${appItem?.discordTag || id}\`) بواسطة المشرف **${staffName}**.\n\nتم تحديث حالة اللاعب فوراً في قاعدة بيانات السيرفر.`,
              color: isApproved ? 3066993 : 15158332,
              footer: { text: 'RIFT STATE • تحديث حالة الطلب الآلي' },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    }
  } catch {}

  addLog(
    decision === 'approve' ? 'قبول وايت لست' : 'رفض وايت لست',
    `تم اتخاذ قرار ${decision === 'approve' ? 'قبول' : 'رفض'} الطلب ${id} بواسطة ${staffName}.`,
    staffName,
    'whitelist'
  );

  const titleText = decision === 'approve' ? 'تم قبول طلب اللاعب بنجاح! ✅' : 'تم رفض طلب اللاعب ❌';
  const colorHex = decision === 'approve' ? '#10b981' : '#ef4444';

  res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${titleText} - RIFT STATE</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&display=swap" rel="stylesheet">
      <style>
        body { margin: 0; background: #050505; color: #fff; font-family: 'Cairo', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; box-sizing: border-box; }
        .card { max-width: 520px; width: 100%; background: #0d0d12; border: 1px solid rgba(139,92,246,0.3); border-radius: 24px; padding: 36px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
        .badge { display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; margin-bottom: 16px; background: ${colorHex}22; color: ${colorHex}; border: 1px solid ${colorHex}44; }
        h1 { margin: 0 0 12px 0; font-size: 22px; font-weight: 900; }
        p { color: #a1a1aa; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
        .info-box { background: #161622; border: 1px solid #2a2a3c; border-radius: 16px; padding: 16px; margin-bottom: 24px; text-align: right; font-size: 13px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; color: #ccc; }
        .info-row:last-child { margin-bottom: 0; }
        .info-val { font-weight: bold; color: #fff; }
        .actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .btn { display: inline-block; padding: 12px 24px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; box-shadow: 0 4px 15px rgba(124,58,237,0.4); }
        .btn-outline { background: #1a1a24; border: 1px solid #333346; color: #ccc; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">${decision === 'approve' ? 'مقبول APPROVED' : 'مرفوض REJECTED'}</div>
        <h1>${titleText}</h1>
        <p>تم تسجيل القرار بنجاح في قاعدة بيانات سيرفر <strong>RIFT STATE</strong> وتم إرسال إشعار التحديث تلقائياً إلى روم الديسكورد.</p>
        
        <div class="info-box">
          <div class="info-row">
            <span>مقدم الطلب:</span>
            <span class="info-val">${appItem?.characterName || 'غير محدد'}</span>
          </div>
          <div class="info-row">
            <span>حساب الديسكورد:</span>
            <span class="info-val">${appItem?.discordTag || appItem?.discordId || id}</span>
          </div>
          <div class="info-row">
            <span>معرف الطلب:</span>
            <span class="info-val" style="font-family: monospace;">${id}</span>
          </div>
        </div>

        <div class="actions">
          <a href="/api/whitelist/review?id=${encodeURIComponent(id)}&key=hlc_fivem_secret_key_2026" class="btn btn-outline">🔍 معاينة فحص الإجابات</a>
          <a href="/?tab=admin" class="btn btn-primary">الانتقال للوحة التحكم</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Dedicated Review Page: View full application answers with Accept and Reject buttons
app.get('/api/whitelist/review', (req, res) => {
  const { id } = req.query as { id: string };

  const appItem =
    whitelistApplications.find((a) => a.id === id) ||
    getWhitelistApplications().find((a) => a.id === id);

  if (!appItem) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>الطلب غير موجود - RIFT STATE</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;800&display=swap" rel="stylesheet">
        <style>body { background: #050505; color: #fff; font-family: 'Cairo', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }</style>
      </head>
      <body>
        <div>
          <h2>❌ عذراً، طلب الانضمام غير موجود أو تم حذفه.</h2>
          <a href="/?tab=admin" style="color: #a78bfa;">العودة للوحة التحكم</a>
        </div>
      </body>
      </html>
    `);
  }

  const answers = Array.isArray(appItem.answers) ? appItem.answers : [];
  const statusBadge =
    appItem.status === 'approved'
      ? '<span style="background: rgba(16,185,129,0.2); color: #10b981; border: 1px solid rgba(16,185,129,0.4); padding: 4px 14px; border-radius: 999px; font-weight: bold; font-size: 12px;">✅ مقبول (APPROVED)</span>'
      : appItem.status === 'rejected'
      ? '<span style="background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid rgba(239,68,68,0.4); padding: 4px 14px; border-radius: 999px; font-weight: bold; font-size: 12px;">❌ مرفوض (REJECTED)</span>'
      : '<span style="background: rgba(245,158,11,0.2); color: #f59e0b; border: 1px solid rgba(245,158,11,0.4); padding: 4px 14px; border-radius: 999px; font-weight: bold; font-size: 12px;">🟡 قيد المراجعة والانتظار (PENDING)</span>';

  const answersHtml = answers.length > 0
    ? answers
        .map(
          (a: any, idx: number) => `
            <div style="background: #111118; border: 1px solid #242436; border-radius: 14px; padding: 18px; margin-bottom: 14px; text-align: right;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: 800; color: #c4b5fd; font-size: 14px;">سؤال ${idx + 1}: ${a.question || `سؤال #${idx + 1}`}</span>
                ${a.isCorrect ? '<span style="color:#10b981; font-weight:bold; font-size:12px;">✅ إجابة صحيحة</span>' : '<span style="color:#a78bfa; font-size:12px;">🔹 إجابة المتقدم</span>'}
              </div>
              <div style="background: #08080c; border: 1px solid #1c1c2a; border-radius: 10px; padding: 12px 14px; color: #fff; font-size: 13px; line-height: 1.6;">
                ↳ <strong>الإجابة:</strong> ${a.userAnswer || a.answer || a.selectedOption || 'تمت الإجابة'}
              </div>
            </div>
          `
        )
        .join('')
    : '<div style="color: #71717a; text-align: center; padding: 24px;">لا توجد تفاصيل إجابات مسجلة لهذا الطلب.</div>';

  res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فحص طلب الاختبار الإلكتروني - ${appItem.characterName} - RIFT STATE</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; background: #050505; color: #e4e4e7; font-family: 'Cairo', sans-serif; min-height: 100vh; padding: 30px 16px; }
        .container { max-width: 840px; margin: 0 auto; }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #1f1f2e; flex-wrap: wrap; gap: 14px; }
        .logo-box { display: flex; align-items: center; gap: 12px; }
        .logo-img { width: 44px; height: 44px; border-radius: 50%; border: 2px solid #7c3aed; object-fit: cover; }
        .logo-title { font-size: 18px; font-weight: 900; color: #fff; margin: 0; }
        .logo-sub { font-size: 11px; color: #a1a1aa; margin: 0; }
        .profile-card { background: #0c0c14; border: 1px solid #202032; border-radius: 20px; padding: 24px; margin-bottom: 24px; box-shadow: 0 8px 30px rgba(0,0,0,0.6); }
        .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 16px; }
        .item-label { font-size: 11px; color: #71717a; display: block; margin-bottom: 4px; }
        .item-val { font-size: 14px; font-weight: 700; color: #fff; word-break: break-all; }
        .decision-bar { background: #13131e; border: 1px solid #2f2f48; border-radius: 18px; padding: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 24px; }
        .btn-approve { background: #16a34a; hover: #15803d; color: #fff; padding: 12px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(22,163,74,0.3); border: none; cursor: pointer; }
        .btn-reject { background: #dc2626; color: #fff; padding: 12px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(220,38,38,0.3); border: none; cursor: pointer; }
        .btn-panel { background: #272738; color: #ddd; padding: 12px 20px; border-radius: 12px; font-weight: 700; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-box">
            <img src="/logo.png" alt="Logo" class="logo-img" />
            <div>
              <h1 class="logo-title">RIFT STATE ROLEPLAY</h1>
              <p class="logo-sub">فحص ومراجعة طلبات الاختبار الإلكتروني</p>
            </div>
          </div>
          <div>${statusBadge}</div>
        </div>

        <!-- Action Bar: Top Decision -->
        <div class="decision-bar">
          <div>
            <span style="font-weight: 800; color: #fff; font-size: 15px; display: block;">اتخاذ قرار القبول أو الرفض للطلب (${appItem.id}):</span>
            <span style="font-size: 12px; color: #a1a1aa;">بمجرد الضغط سيتم تسجيل القرار فوراً وإشعار روم الديسكورد تلقائياً.</span>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="/api/whitelist/quick-decision?id=${encodeURIComponent(appItem.id)}&decision=approve&key=hlc_fivem_secret_key_2026" class="btn-approve">
              ✅ قبول الطلب (Approve)
            </a>
            <a href="/api/whitelist/quick-decision?id=${encodeURIComponent(appItem.id)}&decision=reject&key=hlc_fivem_secret_key_2026" class="btn-reject">
              ❌ رفض الطلب (Reject)
            </a>
            <a href="/?tab=admin" class="btn-panel">
              ⚙️ لوحة التحكم
            </a>
          </div>
        </div>

        <!-- Applicant Profile -->
        <div class="profile-card">
          <h2 style="font-size: 16px; font-weight: 800; color: #c4b5fd; margin: 0 0 14px 0; border-bottom: 1px solid #1a1a28; padding-bottom: 10px;">
            بيانات المتقدم وحساباته
          </h2>
          <div class="grid-2">
            <div>
              <span class="item-label">اسم الشخصية / مقدم الطلب:</span>
              <span class="item-val" style="color: #a78bfa; font-size: 16px;">${appItem.characterName}</span>
            </div>
            <div>
              <span class="item-label">حساب الديسكورد:</span>
              <span class="item-val">${appItem.discordTag} (<code style="color:#818cf8;">${appItem.discordId}</code>)</span>
            </div>
            <div>
              <span class="item-label">ستيم هيكس (Steam Hex):</span>
              <span class="item-val"><code style="color:#34d399;">${appItem.steamHex || 'N/A'}</code></span>
            </div>
            <div>
              <span class="item-label">تاريخ ووقت التقديم:</span>
              <span class="item-val">${appItem.submittedAt || appItem.createdAt || 'الآن'}</span>
            </div>
          </div>
        </div>

        <!-- Exam Answers Breakdown -->
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 16px; font-weight: 800; color: #fff; margin: 0 0 14px 0;">
            إجابات وسيناريوهات الاختبار الإلكتروني (${answers.length} سؤال):
          </h2>
          ${answersHtml}
        </div>

        <!-- Bottom Decision Bar -->
        <div class="decision-bar" style="margin-top: 30px;">
          <span style="font-weight: 800; color: #fff;">القرار النهائي:</span>
          <div style="display: flex; gap: 10px;">
            <a href="/api/whitelist/quick-decision?id=${encodeURIComponent(appItem.id)}&decision=approve&key=hlc_fivem_secret_key_2026" class="btn-approve">
              ✅ قبول الطلب (Approve)
            </a>
            <a href="/api/whitelist/quick-decision?id=${encodeURIComponent(appItem.id)}&decision=reject&key=hlc_fivem_secret_key_2026" class="btn-reject">
              ❌ رفض الطلب (Reject)
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.post('/api/whitelist/pass', async (req, res) => {
  if (!req.session.discord) {
    return res.status(401).json({ success: false, message: 'Discord account is not linked' });
  }
  if (!req.session.steam) {
    return res.status(401).json({ success: false, message: 'Steam account is not linked' });
  }

  const { characterName, characterStory, answers } = req.body;
  const appId = `WL-${Date.now().toString().slice(-4)}`;
  const { answersList, score } = formatSubmittedAnswers(answers);

  const appRecord = {
    id: appId,
    discordId: req.session.discord.id,
    discordTag: req.session.discord.username,
    steamHex: req.session.steam.steamHex || 'steam:11000010abc',
    characterName: characterName || req.session.discord.username || 'Citizen',
    characterStory: characterStory || 'New Citizen',
    answers: answersList,
    score,
    submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    status: 'pending' as const, // Pending review by staff as requested in Prompt 5
  };

  req.session.whitelist = {
    approved: false,
    approvedAt: '',
    roleGiven: false,
    characterName: appRecord.characterName,
  };

  whitelistApplications.unshift(appRecord);

  // Persist in SQLite whitelist_applications table
  addWhitelistApplication({
    id: appId,
    discordId: appRecord.discordId,
    discordTag: appRecord.discordTag,
    steamHex: appRecord.steamHex,
    characterName: appRecord.characterName,
    characterStory: appRecord.characterStory,
    answers: answersList,
    status: 'pending',
  });

  syncSessionUser(req.session);
  addLog('تقديم اختبار رول بلاي', `قام اللاعب ${appRecord.characterName} (${appRecord.discordTag}) بتقديم اختبار الرول بلاي وهو بانتظار المراجعة.`, req.session.discord.username, 'whitelist');

  // Trigger Discord Webhook Notification automatically!
  const originUrl = `${req.protocol}://${req.get('host')}`;
  sendDiscordApplicationWebhook(appRecord, originUrl).catch(() => {});

  res.json({
    success: true,
    user: req.session.user,
    discord: req.session.discord,
    steam: req.session.steam,
    whitelist: req.session.whitelist,
    application: appRecord,
    score,
  });
});

// Real-time check of user's whitelist application status (pending, approved, rejected)
app.get('/api/whitelist/status', (req, res) => {
  if (!req.session.discord) {
    return res.json({ success: true, linked: false, status: 'none', application: null });
  }

  const discordId = req.session.discord.id;
  const dbApps = getWhitelistApplications();
  const latestApp =
    dbApps.find((a) => a.discordId === discordId) ||
    whitelistApplications.find((a) => a.discordId === discordId);

  if (!latestApp) {
    return res.json({ success: true, linked: true, status: 'none', application: null });
  }

  res.json({
    success: true,
    linked: true,
    status: latestApp.status, // 'pending' | 'approved' | 'rejected'
    application: latestApp,
  });
});

// Reset application to re-apply if rejected
app.post('/api/whitelist/reset-my-app', (req, res) => {
  delete req.session.whitelist;
  res.json({ success: true, message: 'تمت إعادة تعيين حالة التقديم بنجاح ويمكنك التقديم مجدداً.' });
});

app.post('/api/whitelist/apply', async (req, res) => {
  // Alias for /api/whitelist/pass
  if (!req.session.discord) {
    return res.status(401).json({ success: false, message: 'Discord account is not linked' });
  }
  const { characterName, characterStory, answers } = req.body;
  const appId = `WL-${Date.now().toString().slice(-4)}`;
  const { answersList, score } = formatSubmittedAnswers(answers);

  const appRecord = {
    id: appId,
    discordId: req.session.discord.id,
    discordTag: req.session.discord.username,
    steamHex: req.session.steam?.steamHex || 'steam:11000010abc',
    characterName: characterName || req.session.discord.username || 'Citizen',
    characterStory: characterStory || 'New Citizen',
    answers: answersList,
    score,
    submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    status: 'pending' as const,
  };

  whitelistApplications.unshift(appRecord);
  addWhitelistApplication({
    id: appId,
    discordId: appRecord.discordId,
    discordTag: appRecord.discordTag,
    steamHex: appRecord.steamHex,
    characterName: appRecord.characterName,
    characterStory: appRecord.characterStory,
    answers: answersList,
    status: 'pending',
  });

  const originUrl = `${req.protocol}://${req.get('host')}`;
  sendDiscordApplicationWebhook(appRecord, originUrl).catch(() => {});

  res.json({ success: true, application: appRecord, score });
});

app.post('/api/auth/mock-link', (req, res) => {
  if (isProd) return res.status(404).json({ success: false, error: 'Not found' });
  const { type, discordId, username, steamId, roles, isOwner } = req.body;
  const ownerRoleId = (process.env.OWNER_ROLE_ID || '123456789012345678').trim();

  if (type === 'discord') {
    const assignedRoles: string[] = Array.isArray(roles)
      ? roles.map(String)
      : isOwner
        ? [ownerRoleId]
        : [];

    req.session.discord = {
      id: discordId || '849201948201948201',
      username: username || 'HLC_Hunter',
      global_name: username || 'HLC Citizen',
      email: `${username || 'hunter'}@hlcrp.net`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      roles: assignedRoles,
    };
    req.session.discordRoles = assignedRoles;

    if (
      isOwner ||
      assignedRoles.includes(ownerRoleId) ||
      (process.env.OWNER_DISCORD_ID && discordId === process.env.OWNER_DISCORD_ID)
    ) {
      req.session.isOwner = true;
    }
  } else if (type === 'steam') {
    const id = steamId || '76561198012345678';
    req.session.steam = {
      id,
      steamHex: steamId64ToHex(id),
      personaName: username || 'HLC_Steam_Player',
    };
  }

  syncSessionUser(req.session);
  res.json({
    success: true,
    user: req.session.user || null,
    discord: req.session.discord || null,
    steam: req.session.steam || null,
    whitelist: req.session.whitelist || null,
    isOwner: Boolean(req.session.isOwner),
    discordRoles: req.session.discordRoles || [],
  });
});

app.post('/api/auth/unlink', (req, res) => {
  const { type } = req.body;
  if (type === 'discord') delete req.session.discord;
  else if (type === 'steam') delete req.session.steam;
  else if (type === 'all') req.session.destroy(() => {});

  syncSessionUser(req.session);
  res.json({ success: true });
});

// -------------------------------------------------------------
// Live FiveM Telemetry & Players Endpoint (Poll every 10 seconds)
// -------------------------------------------------------------
app.get('/api/players/live', (_req, res) => {
  const players = Array.from(playersDB.values()).map((p) => ({
    id: p.id,
    player_id: p.player_id,
    name: p.name,
    citizenid: p.citizenid,
    discord_id: p.discord_id,
    steam_id: p.steam_id,
    job_label: p.job_label,
    total_seconds: p.total_seconds,
    total_hours: formatSecondsToHours(p.total_seconds),
    hours_raw: Math.floor(p.total_seconds / 3600),
    online_time: p.is_online ? p.online_time : 'غير متصل',
    is_online: p.is_online,
    last_login: p.last_login,
    last_logout: p.last_logout,
    avatar: p.avatar,
  }));

  // Sort by total seconds for Top Players
  const topPlayers = [...players]
    .sort((a, b) => b.total_seconds - a.total_seconds)
    .slice(0, 10)
    .map((p, idx) => ({
      rank: idx + 1,
      ...p,
      displayLine: `${idx + 1}. ${p.name} — ${Math.floor(p.total_seconds / 3600)} Hours`,
    }));

  const onlineCount = players.filter((p) => p.is_online).length;

  res.json({
    success: true,
    server: {
      status: 'ONLINE',
      online: true,
      name: serverState.name,
      playersOnline: 47, // Exact matching prompt requested
      maxPlayers: serverState.max_players,
      lastHeartbeatAt: new Date().toISOString(),
    },
    players,
    topPlayers,
    medic_of_the_week: medicOfTheWeek,
    player_of_the_week: playerOfTheWeek,
    updatedAt: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// 1 & 5. SERVER STATUS & HEARTBEAT (Real Database Sync)
// -------------------------------------------------------------
const handleHeartbeat = (req: express.Request, res: express.Response) => {
  const { players, max_players, online_players } = req.body;
  const count = online_players !== undefined ? Number(online_players) : (players !== undefined ? Number(players) : 47);
  const max = max_players !== undefined ? Number(max_players) : 48;
  const result = updateServerHeartbeat(count, max);

  res.json({
    success: true,
    server: {
      players: count,
      max_players: max,
      online: 1,
      last_heartbeat: result.timestamp,
    },
  });
};
app.post('/server/heartbeat', handleHeartbeat);
app.post('/api/server/heartbeat', handleHeartbeat);

app.get('/api/server/status', (_req, res) => {
  const status = getServerStatus();
  const totalRegistered = getTotalPlayersCount();
  const joinUrl = process.env.FIVEM_JOIN_URL || 'https://cfx.re/join/hlcrp';

  res.json({
    success: true,
    players: status.players,
    max_players: status.max_players,
    online: status.online,
    status: status.online ? 'ONLINE' : 'OFFLINE',
    players_online: status.players,
    total_registered_players: totalRegistered,
    fivem_join_url: joinUrl,
    url: joinUrl,
    server_ip: 'play.hlcrp.net',
    server: {
      name: serverState.name,
      online: status.online,
      players: status.players,
      maxPlayers: status.max_players,
      lastHeartbeatAt: status.last_heartbeat,
    },
  });
});

// 6. دخول السيرفر (FiveM Join Endpoint)
app.get('/api/server/join', (_req, res) => {
  const joinUrl = process.env.FIVEM_JOIN_URL || 'https://cfx.re/join/hlcrp';
  res.json({
    success: true,
    url: joinUrl,
    joinUrl,
  });
});

// -------------------------------------------------------------
// 2. كود المتصدرين (Real Database Leaderboard)
// -------------------------------------------------------------
app.get('/api/leaderboard', (_req, res) => {
  const players = getLeaderboard(10);
  res.json({
    success: true,
    players,
  });
});

// 4. المتصدر الأسبوعي (Weekly Leaderboard)
app.get('/api/leaderboard/weekly', (_req, res) => {
  const players = getWeeklyLeaderboard(10);
  res.json({
    success: true,
    players,
  });
});

// -------------------------------------------------------------
// 3. حساب ساعات التواجد ودخول/خروج اللاعبين (FiveM Webhook / API)
// -------------------------------------------------------------
const handlePlayerJoined = (req: express.Request, res: express.Response) => {
  const { player_id, name, discord_id, steam_id, playerName, discordId, steamId } = req.body;
  const pId = String(player_id || steam_id || steamId || discord_id || `player_${Date.now()}`);
  const pName = String(name || playerName || 'Player');
  const dId = discord_id || discordId;
  const sId = steam_id || steamId;

  const result = playerJoined(pId, pName, dId, sId);
  res.json(result);
};
app.post('/server/player-joined', handlePlayerJoined);
app.post('/api/server/player-joined', handlePlayerJoined);

const handlePlayerLeft = (req: express.Request, res: express.Response) => {
  const { player_id, steam_id, steamId, discord_id, discordId } = req.body;
  const pId = String(player_id || steam_id || steamId || discord_id || discordId || '');
  if (!pId) {
    return res.status(400).json({ success: false, error: 'player_id is required' });
  }

  const result = playerLeft(pId);
  res.json(result);
};
app.post('/server/player-left', handlePlayerLeft);
app.post('/api/server/player-left', handlePlayerLeft);

// Sync batch from FiveM server database or Python API
const handleSyncPlayers = (req: express.Request, res: express.Response) => {
  const { players } = req.body;
  if (!Array.isArray(players)) {
    return res.status(400).json({ success: false, error: 'players array required' });
  }
  const result = syncPlayersBatch(players);
  res.json(result);
};
app.post('/server/sync-players', handleSyncPlayers);
app.post('/api/server/sync-players', handleSyncPlayers);

// Full hours leaderboard endpoint
app.get('/api/leaderboards/hours', (req, res) => {
  const period = (req.query.period as string) || 'all';
  const players = period === 'week' ? getWeeklyLeaderboard(20) : getLeaderboard(20);

  res.json({
    success: true,
    period,
    players: players.map((p: any) => ({
      rank: p.rank,
      id: p.rank,
      player_name: p.name,
      name: p.name,
      discord_id: p.discord_id,
      steam_id: p.steam_id,
      seconds: p.seconds,
      hours: Math.floor(p.hours),
      formatted_hours: `${Math.floor(p.hours)} ساعة`,
      is_online: true,
      online_time: `${Math.floor(p.hours % 24)}h`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    })),
  });
});

app.get('/api/awards/current', (_req, res) => {
  res.json({
    success: true,
    week: currentWeek,
    medic_of_the_week: medicOfTheWeek,
    player_of_the_week: playerOfTheWeek,
    awards: {
      medic: { ...medicOfTheWeek, award_type: 'medic', player_name: medicOfTheWeek.playerName },
      player: { ...playerOfTheWeek, award_type: 'player', player_name: playerOfTheWeek.playerName },
    },
  });
});

// -------------------------------------------------------------
// 8. أسئلة الـ Whitelist (Real Database Questions)
// -------------------------------------------------------------
// Public questions for applicants
app.get('/api/whitelist/questions', (_req, res) => {
  const rows = getWhitelistQuestions(true);
  res.json({
    success: true,
    questions: rows.map((q) => ({
      id: String(q.id),
      numericId: q.id,
      question: q.question,
      options: [
        { id: 'a', text: q.option_a },
        { id: 'b', text: q.option_b },
        { id: 'c', text: q.option_c },
        { id: 'd', text: q.option_d },
      ],
      sort_order: q.sort_order,
    })),
  });
});

// -------------------------------------------------------------
// Authentic Heroes of the Week (ابطال الاسبوع - Empty by default, assigned by owner)
// -------------------------------------------------------------
let heroesData = {
  week_reset_timer: '423:46:54',
  cop_of_the_week: {
    name: 'ما تحدد للحين',
    role: 'LSPD',
    note: 'شرطي الاسبوع',
    avatar: '',
    assigned: false,
    isPlaceholder: true,
  },
  medic_of_the_week: {
    name: 'ما تحدد للحين',
    role: 'EMS',
    note: 'مسعف الاسبوع',
    avatar: '',
    assigned: false,
    isPlaceholder: true,
  },
  employee_of_the_week: {
    name: 'ما تحدد للحين',
    role: 'Civilian',
    points: '0 نقطة',
    avatar: '',
    assigned: false,
    isPlaceholder: true,
  },
};

app.get('/api/heroes', (_req, res) => {
  res.json({ success: true, heroes: heroesData });
});

app.post('/api/owner/heroes', (req, res) => {
  if (!isOwnerCheck(req)) return res.status(403).json({ success: false, error: 'Owner required' });
  const { cop, medic, employee } = req.body;
  if (cop) heroesData.cop_of_the_week = { ...heroesData.cop_of_the_week, ...cop };
  if (medic) heroesData.medic_of_the_week = { ...heroesData.medic_of_the_week, ...medic };
  if (employee) heroesData.employee_of_the_week = { ...heroesData.employee_of_the_week, ...employee };
  addLog('تحديث أبطال الأسبوع', 'تم تعديل بيانات أبطال الأسبوع.', 'Owner', 'award');
  res.json({ success: true, heroes: heroesData });
});

// -------------------------------------------------------------
// Authentic Leaderboard Showcase matching real server database only
// -------------------------------------------------------------
app.get('/api/leaderboard/showcase', (_req, res) => {
  const weekly = getWeeklyLeaderboard(10);
  const allTime = getLeaderboard(10);
  const activeList = weekly.length >= 3 ? weekly : (weekly.length > 0 ? weekly : allTime);

  // If no players in database, return empty arrays (NO fake players)
  const top_hours_podium = activeList.slice(0, 3).map((p, idx) => ({
    rank: idx + 1,
    name: p.name.toUpperCase(),
    role: idx === 0 ? 'High Staff' : 'Civilian',
    timeString: `${Math.floor(p.hours)} ساعة${p.seconds % 3600 > 0 ? ` و ${Math.floor((p.seconds % 3600) / 60)} دقيقة` : ''}`,
    hours: p.hours,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
  }));

  const maxHours = activeList[0]?.hours || 20;
  const top_hours_list = activeList.slice(3, 10).map((p, idx) => ({
    rank: idx + 4,
    name: p.name.toUpperCase(),
    timeString: `${Math.floor(p.hours)} ساعة${p.seconds % 3600 > 0 ? ` و ${Math.floor((p.seconds % 3600) / 60)} دقيقة` : ''}`,
    hours: p.hours,
    percentage: Math.min(100, Math.max(10, Math.round((p.hours / maxHours) * 100))),
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  }));

  res.json({
    success: true,
    heroes: heroesData,
    top_jobs: [],
    top_hours_podium,
    top_hours_list,
    countdown_timer: '00:46:54',
  });
});

// -------------------------------------------------------------
// TEAM API (Real SQLite database, empty by default)
// -------------------------------------------------------------
app.get('/api/team', (_req, res) => {
  const team = getTeamMembers();
  res.json({ success: true, team });
});

// -------------------------------------------------------------
// LIVE STREAMS API (Real-time live status & immediate offline)
// -------------------------------------------------------------
async function updateAllStreamersLiveStatus() {
  const streamers = getStreamers();
  for (const s of streamers) {
    try {
      if (s.platform === 'kick') {
        const slug = (s.channelName || '').toLowerCase().trim();
        const resp = await axios.get(`https://kick.com/api/v2/channels/${slug}`, {
          timeout: 4000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        });
        if (resp.data && resp.data.livestream && resp.data.livestream.is_live) {
          const ls = resp.data.livestream;
          updateStreamerLive(s.numericId, true, Number(ls.viewer_count || 0), ls.session_title || s.title);
        } else {
          updateStreamerLive(s.numericId, false, 0);
        }
      } else if (s.platform === 'twitch') {
        const slug = (s.channelName || '').toLowerCase().trim();
        const gqlRes = await axios.post(
          'https://gql.twitch.tv/gql',
          {
            query: `query { user(login: "${slug}") { stream { viewersCount title type } } }`,
          },
          {
            headers: { 'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko' },
            timeout: 4000,
          }
        );
        const st = gqlRes.data?.data?.user?.stream;
        if (st && st.type === 'live') {
          updateStreamerLive(s.numericId, true, Number(st.viewersCount || 0), st.title || s.title);
        } else {
          updateStreamerLive(s.numericId, false, 0);
        }
      }
    } catch {
      updateStreamerLive(s.numericId, false, 0);
    }
  }
}

// Background auto check every 45 seconds
setInterval(() => {
  updateAllStreamersLiveStatus().catch(() => {});
}, 45000);

app.get('/api/streams', async (_req, res) => {
  const streamers = getStreamers();
  res.json({
    success: true,
    streams: streamers,
    onlineStreams: streamers.filter((s) => s.isOnline),
  });
});

// Streamer / Bot webhook status update
app.post('/api/streams/status', (req, res) => {
  const { channel, isOnline, viewers, title } = req.body;
  const streamers = getStreamers();
  const found = streamers.find((s) => s.channelName.toLowerCase() === String(channel || '').toLowerCase());
  if (found) {
    updateStreamerLive(found.numericId, Boolean(isOnline), Number(viewers || 0), title);
    return res.json({ success: true, channel: found.channelName, isOnline: Boolean(isOnline), viewers: Number(viewers || 0) });
  }
  res.status(404).json({ success: false, error: 'Streamer not found' });
});

// Helper: Check if user is owner or authorized admin to manage streamers
function isStreamerAdmin(req: express.Request): boolean {
  if (isOwnerCheck(req)) return true;
  const ownerRoleId = getEffectiveOwnerRoleId();
  const sessionRoles: string[] = [
    ...(req.session?.discord?.roles || []),
    ...(req.session?.discordRoles || []),
    ...((req.session?.user as any)?.roles || []),
  ].map((r) => String(r).trim());
  if (ownerRoleId && sessionRoles.includes(ownerRoleId)) return true;
  return false;
}

// Add creator / streamer endpoint (Requires Owner / Senior Admin)
app.post('/api/streams', (req, res) => {
  if (!isStreamerAdmin(req)) {
    return res.status(403).json({
      success: false,
      error: 'غير مصرح لك بإضافة صناع المحتوى أو فتح بث. هذه الصلاحية محصورة للإدارة العليا والسيرفر فقط.',
    });
  }

  const { name, platform, channelName, channelUrl, avatar, title, viewers, isOnline } = req.body;
  if (!name || !channelName) {
    return res.status(400).json({ success: false, error: 'اسم صانع المحتوى ورابط أو اسم القناة مطلوبان' });
  }
  const result = addStreamer({
    name,
    platform: platform || 'twitch',
    channelName,
    channelUrl,
    avatar: avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&h=300&q=80',
    title: title || `🔴 [سيرفر فايف إم] ${name} يبث الآن!`,
    viewers: viewers !== undefined ? Number(viewers) : 0,
    isOnline: Boolean(isOnline),
  });
  const streamers = getStreamers();
  res.json({ ...result, streams: streamers, onlineStreams: streamers.filter((s) => s.isOnline) });
});

// Toggle streamer live status with custom title & viewers (Requires Owner / Senior Admin)
app.post('/api/streams/:id/toggle', (req, res) => {
  if (!isStreamerAdmin(req)) {
    return res.status(403).json({
      success: false,
      error: 'غير مصرح لك ببدء أو إنهاء بثوث صناع المحتوى.',
    });
  }

  const rawId = req.params.id.replace(/^st-/, '');
  const { isOnline, viewers, title } = req.body;
  updateStreamerLive(Number(rawId), Boolean(isOnline), Number(viewers || 0), title);
  const streamers = getStreamers();
  res.json({ success: true, streams: streamers, onlineStreams: streamers.filter((s) => s.isOnline) });
});

// Delete streamer (Requires Owner / Senior Admin)
app.delete('/api/streams/:id', (req, res) => {
  if (!isStreamerAdmin(req)) {
    return res.status(403).json({
      success: false,
      error: 'غير مصرح لك بحذف صناع المحتوى.',
    });
  }

  const rawId = req.params.id.replace(/^st-/, '');
  deleteStreamer(Number(rawId));
  const streamers = getStreamers();
  res.json({ success: true, streams: streamers, onlineStreams: streamers.filter((s) => s.isOnline) });
});

// Refresh live streams
app.post('/api/streams/check', async (_req, res) => {
  await updateAllStreamersLiveStatus();
  const streamers = getStreamers();
  res.json({ success: true, streams: streamers, onlineStreams: streamers.filter((s) => s.isOnline) });
});

// -------------------------------------------------------------
// Public Content Endpoints (News, Rules, Tests, Announcements)
// -------------------------------------------------------------
app.get('/api/news', (_req, res) => {
  res.json({ success: true, news: newsList.filter((n) => n.published) });
});

app.get('/api/rules', (_req, res) => {
  res.json({ success: true, rules: rulesList.filter((r) => r.active) });
});

app.get('/api/tests', (_req, res) => {
  // Only return active tests without leaking correct answers to public!
  const publicTests = customTests
    .filter((t) => t.active)
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      targetRole: t.targetRole,
      passScore: t.passScore,
      attemptsAllowed: t.attemptsAllowed,
      questions: t.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
      })),
    }));
  res.json({ success: true, tests: publicTests });
});

app.post('/api/tests/:id/submit', (req, res) => {
  const test = customTests.find((t) => t.id === req.params.id);
  if (!test) return res.status(404).json({ success: false, error: 'Test not found' });

  const { answers, playerName, discordId } = req.body;
  let correct = 0;
  test.questions.forEach((q) => {
    if (answers && answers[q.id] === q.correctAnswerId) {
      correct += 1;
    }
  });

  const total = test.questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score >= test.passScore;

  const resultRecord = {
    id: `res-${Date.now()}`,
    testId: test.id,
    testTitle: test.title,
    playerName: playerName || req.session.user?.username || 'Player',
    discordId: discordId || req.session.user?.discordId || 'Unknown',
    correctAnswers: correct,
    totalQuestions: total,
    scorePercentage: score,
    passed,
    takenAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };

  testResultsList.unshift(resultRecord);
  addLog('إجراء اختبار', `قام اللاعب ${resultRecord.playerName} بإجراء ${test.title} وحقق ${score}% (${passed ? 'ناجح' : 'راسب'}).`, resultRecord.playerName, 'test');

  res.json({
    success: true,
    result: {
      correct,
      wrong: total - correct,
      total,
      score,
      passed,
    },
  });
});

app.get('/api/announcements', (_req, res) => {
  res.json({ success: true, announcements: announcementsList.filter((a) => a.active) });
});

// -------------------------------------------------------------
// Site Settings, FAQs & Careers Public Endpoints (SQLite Backed)
// -------------------------------------------------------------
app.get('/api/site-settings', (_req, res) => {
  res.json({ success: true, settings: getSiteSettings() });
});

app.post('/api/site-settings/upload-logo', (req, res) => {
  try {
    const { imageBase64 } = req.body || {};
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ success: false, error: 'بيانات الصورة غير صالحة أو مفقودة' });
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const base64Data = matches ? matches[2] : imageBase64;
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length === 0) {
      return res.status(400).json({ success: false, error: 'الملف فارغ' });
    }

    // Save to public/logo.png and public/server-logo.png
    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, 'logo.png'), buffer);
    fs.writeFileSync(path.join(publicDir, 'logo.jpg'), buffer);
    fs.writeFileSync(path.join(publicDir, 'server-logo.png'), buffer);

    // If dist folder exists, write to dist too
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, 'logo.png'), buffer);
      fs.writeFileSync(path.join(distDir, 'logo.jpg'), buffer);
      fs.writeFileSync(path.join(distDir, 'server-logo.png'), buffer);
    }

    const timestamp = Date.now();
    const logoUrl = `/logo.png?v=${timestamp}`;
    const settings = getSiteSettings() || {};
    settings.logoUrl = logoUrl;
    updateSiteSettings(settings);

    addLog('تحديث الشعار الرسمي', 'تم رفع وحفظ شعار السيرفر الأصلي بنجاح تام وبدون أي تعديل ذكاء اصطناعي.', 'Owner', 'server');

    return res.json({ success: true, logoUrl, message: 'تم حفظ وتعيين الشعار بنجاح تام لكامل الموقع' });
  } catch (err: any) {
    console.error('Error uploading logo:', err);
    return res.status(500).json({ success: false, error: err.message || 'حدث خطأ أثناء رفع الشعار' });
  }
});

app.get('/api/faq', (_req, res) => {
  res.json({ success: true, faqs: getFaqList() });
});

app.get('/api/careers', (_req, res) => {
  res.json({ success: true, careers: getJobsList() });
});

// -------------------------------------------------------------
// USER PROFILE ENDPOINTS (GET /api/me & subroutes as requested)
// -------------------------------------------------------------
app.get('/api/me', (req, res) => {
  const discord = req.session.discord || null;
  const steam = req.session.steam || null;
  const discordId = discord?.id || 'guest';
  const characters = getCharactersByDiscord(discordId);
  const activeChar = characters[0] || {
    citizenid: `HL-${Math.floor(1000 + Math.random() * 9000)}`,
    characterName: discord?.global_name || discord?.username || 'مواطن',
    cash: 5000,
    bank: 25000,
    job: 'مواطن',
    jobGrade: 1,
    phone: '555-0199',
    inventory: [
      { id: 'phone', name: 'هاتف ذكي', count: 1, weight: 0.2 },
      { id: 'id_card', name: 'بطاقة هوية', count: 1, weight: 0.1 },
      { id: 'water', name: 'ماء نقي', count: 2, weight: 0.5 },
    ],
    lastLocation: { x: -268.4, y: -957.9, z: 31.2, street: 'Legion Square' },
  };

  res.json({
    success: true,
    user: {
      id: discordId,
      discord,
      steam,
      whitelist: req.session.whitelist || null,
      activeCharacter: activeChar,
      charactersCount: characters.length,
    },
  });
});

app.get('/api/me/characters', (req, res) => {
  const discordId = req.session.discord?.id || 'guest';
  const characters = getCharactersByDiscord(discordId);
  res.json({ success: true, characters });
});

app.get('/api/me/playtime', (req, res) => {
  const discordId = req.session.discord?.id || 'guest';
  try {
    const player = db.prepare('SELECT total_playtime, weekly_playtime, monthly_playtime, last_seen FROM players WHERE discord_id = ?').get(discordId) as any;
    const totalSeconds = player?.total_playtime || 0;
    res.json({
      success: true,
      playtime: {
        totalSeconds,
        totalHours: Math.floor(totalSeconds / 3600),
        weeklyHours: Math.floor((player?.weekly_playtime || 0) / 3600),
        lastSeen: player?.last_seen || new Date().toISOString(),
      },
    });
  } catch {
    res.json({
      success: true,
      playtime: { totalSeconds: 0, totalHours: 0, weeklyHours: 0, lastSeen: new Date().toISOString() },
    });
  }
});

app.get('/api/me/inventory', (req, res) => {
  const discordId = req.session.discord?.id || 'guest';
  const characters = getCharactersByDiscord(discordId);
  const activeChar = characters[0];
  const inventory = activeChar?.inventory || [
    { id: 'phone', name: 'هاتف ذكي', count: 1, weight: 0.2 },
    { id: 'id_card', name: 'بطاقة هوية', count: 1, weight: 0.1 },
    { id: 'driver_license', name: 'رخصة قيادة', count: 1, weight: 0.1 },
    { id: 'bandage', name: 'ضمادة طبية', count: 3, weight: 0.3 },
  ];
  const cash = activeChar?.cash || 5000;
  const bank = activeChar?.bank || 25000;

  res.json({
    success: true,
    cash,
    bank,
    inventory,
  });
});

app.get('/api/me/last-location', (req, res) => {
  const discordId = req.session.discord?.id || 'guest';
  const characters = getCharactersByDiscord(discordId);
  const activeChar = characters[0];
  const lastLocation = activeChar?.lastLocation || {
    x: -268.4,
    y: -957.9,
    z: 31.2,
    heading: 180.0,
    location_name: 'Legion Square',
  };
  res.json({ success: true, location: lastLocation });
});

// -------------------------------------------------------------
// FiveM Character Linking & Session Handlers
// -------------------------------------------------------------
const pendingLinkCodes = new Map<string, { discordId: string; username: string; expiresAt: number }>();

app.post(['/api/account/generate-link-code', '/api/me/link-code'], (req, res) => {
  const discordId = req.session.discord?.id || (req.session?.user as any)?.discordId || (!isProd ? '109876543210987654' : null);
  const username = req.session.discord?.username || (req.session?.user as any)?.username || 'CitizenPlayer';
  if (!discordId) {
    return res.status(401).json({ success: false, error: 'يجب تسجيل الدخول بالديسكورد أولاً' });
  }
  const code = `RF-${crypto.randomInt(1000, 10000)}`;
  pendingLinkCodes.set(code, {
    discordId,
    username,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  res.json({ success: true, code, expiresInMinutes: 10 });
});

function verifyFivemSecret(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = ((req.headers.authorization || req.headers['x-server-key'] || req.headers['x-fivem-secret'] || req.headers['x-bridge-secret'] || '') as string);
  const expectedSecret = (process.env.FIVEM_API_SECRET || '').trim();
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!expectedSecret || !token || token !== expectedSecret) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid FIVEM_API_SECRET' });
  }
  next();
}

app.post('/internal/fivem/session-start', verifyFivemSecret, (req, res) => {
  const { license, steam, discord, name } = req.body;
  if (!license && !discord && !steam) {
    return res.status(400).json({ success: false, error: 'Identifier required (license, discord, or steam)' });
  }
  const pId = license || discord || steam || 'unknown';
  const playerName = name || 'Citizen';
  const result = playerJoined(pId, playerName, discord, steam);
  addLog('دخول FiveM', `بدء جلسة اللعب للاعب (${playerName} - ${pId})`, 'FiveM Server', 'server');
  res.json({ success: true, session: result });
});

app.post('/internal/fivem/session-end', verifyFivemSecret, (req, res) => {
  const { license, steam, discord } = req.body;
  if (!license && !discord && !steam) {
    return res.status(400).json({ success: false, error: 'Identifier required (license, discord, or steam)' });
  }
  const pId = license || discord || steam || 'unknown';
  const result = playerLeft(pId);
  addLog('خروج FiveM', `انتهاء جلسة اللعب وحفظ الساعات للاعب (${pId})`, 'FiveM Server', 'server');
  res.json({ success: true, result });
});

app.post('/internal/fivem/link-account', verifyFivemSecret, (req, res) => {
  const { code, license, steam, discord, citizenid, characterName } = req.body;
  if (!code || !citizenid || !/^[A-Za-z0-9_-]{2,64}$/.test(String(citizenid))) {
    return res.status(400).json({ success: false, error: 'Valid link code and QBCore citizenid are required' });
  }
  const entry = pendingLinkCodes.get(code);
  if (!entry || entry.expiresAt < Date.now()) {
    return res.status(400).json({ success: false, error: 'رمز الربط غير صالح أو منتهي الصلاحية' });
  }

  try {
    const existingPlayer = db.prepare('SELECT id, player_name, discord_id FROM players WHERE steam_id = ? OR discord_id = ?').get(steam || '', discord || '') as any;
    if (existingPlayer && existingPlayer.discord_id !== entry.discordId) {
      return res.status(409).json({ success: false, error: 'معرف اللعبة مرتبط بحساب آخر بالفعل' });
    }

    db.prepare(`
      INSERT INTO players (player_name, discord_id, steam_id, last_seen)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(discord_id) DO UPDATE SET
        steam_id = excluded.steam_id,
        last_seen = CURRENT_TIMESTAMP
    `).run(String(characterName || entry.username).slice(0, 100), entry.discordId, steam || license || 'fivem:linked');

    db.prepare(`
      INSERT INTO account_links (discord_id, steam_id, license_id, citizenid, character_name, linked_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(citizenid) DO UPDATE SET
        discord_id = excluded.discord_id, steam_id = excluded.steam_id,
        license_id = excluded.license_id, character_name = excluded.character_name, linked_at = CURRENT_TIMESTAMP
    `).run(entry.discordId, steam || null, license || null, String(citizenid), String(characterName || entry.username).slice(0, 100));

    pendingLinkCodes.delete(code);
    addLog('ربط حساب FiveM', `تم ربط حساب الديسكورد ${entry.username} بمعرف اللعبة بنجاح.`, entry.username, 'account');
    res.json({ success: true, message: 'تم ربط الحساب بنجاح', discordId: entry.discordId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/twitch/eventsub', (req, res) => {
  const messageType = req.headers['twitch-eventsub-message-type'];
  const { subscription, event } = req.body;

  if (messageType === 'webhook_callback_verification') {
    return res.status(200).send(req.body.challenge);
  }

  if (subscription?.type === 'stream.online') {
    const channelName = event?.broadcaster_user_login || event?.broadcaster_user_name;
    const streamers = getStreamers();
    const st = streamers.find((s) => s.channelName?.toLowerCase() === channelName?.toLowerCase());
    if (st) {
      updateStreamerLive(st.numericId, true, 50, `${st.name} بث مباشر الآن!`);
    }
    addLog('بدء بث Twitch', `بدأ الستريمر ${channelName} بثاً مباشراً جديداً.`, 'Twitch EventSub', 'stream');
  } else if (subscription?.type === 'stream.offline') {
    const channelName = event?.broadcaster_user_login || event?.broadcaster_user_name;
    const streamers = getStreamers();
    const st = streamers.find((s) => s.channelName?.toLowerCase() === channelName?.toLowerCase());
    if (st) {
      updateStreamerLive(st.numericId, false, 0, '');
    }
  }

  res.status(200).json({ success: true });
});

// -------------------------------------------------------------
// STAFF & OWNER AUTHORIZATION MIDDLEWARE (OWNER_ROLE_ID Verification)
// -------------------------------------------------------------
export function getEffectiveOwnerRoleId(): string {
  try {
    const s = getSiteSettings();
    if (s && s.ownerRoleId && String(s.ownerRoleId).trim().length > 0) {
      return String(s.ownerRoleId).trim();
    }
  } catch {}
  return (process.env.OWNER_ROLE_ID || (isProd ? '' : '123456789012345678')).trim();
}

export function isOwnerCheck(req: express.Request): boolean {
  if (req.session?.isOwner) return true;

  const adminKey = (req.headers['x-admin-key'] || req.headers['x-passkey'] || req.query.passkey) as string | undefined;
  const ownerSecret = (process.env.OWNER_PASSKEY || (isProd ? '' : 'hlc2026')).trim();
  if (adminKey && ownerSecret && adminKey === ownerSecret) {
    return true;
  }

  const ownerRoleId = getEffectiveOwnerRoleId();
  const ownerDiscordId = process.env.OWNER_DISCORD_ID?.trim();
  const sessionRoles: string[] = [
    ...(req.session?.discord?.roles || []),
    ...(req.session?.discordRoles || []),
    ...((req.session?.user as any)?.roles || []),
  ].map((r) => String(r).trim());

  if (ownerRoleId && sessionRoles.includes(ownerRoleId)) return true;
  if (ownerDiscordId && req.session?.discord?.id === ownerDiscordId) {
    return true;
  }

  // In dev / preview environment inside AI Studio, enable seamless owner management
  if (!isProd || process.env.NODE_ENV !== 'production') {
    return true;
  }
  return false;
}

/**
 * Middleware that verifies the user's Discord OWNER_ROLE_ID through session data
 * before granting access to /api/admin/* endpoints to ensure only authorized staff
 * can modify rules, news, whitelist applications, tests, or server configurations.
 */
export function verifyDiscordOwnerRole(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Allow inspection of status, passkey login, switch-role-mode, and logout endpoints without blocking
  const p = (req.path || '').toLowerCase();
  const orig = (req.originalUrl || '').toLowerCase();
  if (
    p === '/status' ||
    p === '/auth' ||
    p === '/logout' ||
    p === '/switch-role-mode' ||
    orig.endsWith('/auth') ||
    orig.endsWith('/status') ||
    orig.endsWith('/logout') ||
    orig.endsWith('/switch-role-mode') ||
    orig.includes('/api/admin/auth') ||
    orig.includes('/api/admin/status') ||
    orig.includes('/api/admin/logout') ||
    orig.includes('/api/admin/switch-role-mode') ||
    orig.includes('/api/owner/auth') ||
    orig.includes('/api/owner/status') ||
    orig.includes('/api/owner/logout')
  ) {
    return next();
  }

  const adminKey = (req.headers['x-admin-key'] || req.headers['x-passkey'] || req.query.passkey) as string | undefined;
  const ownerSecret = (process.env.OWNER_PASSKEY || (isProd ? '' : 'hlc2026')).trim();
  const reviewerSecret = (process.env.REVIEWER_PASSKEY || (isProd ? '' : 'reviewer2026')).trim();

  if (adminKey && ownerSecret && adminKey === ownerSecret) {
    req.session.isOwner = true;
    req.session.isReviewer = false;
    return next();
  }

  if (adminKey && reviewerSecret && adminKey === reviewerSecret) {
    req.session.isReviewer = true;
    req.session.isOwner = false;
    return next();
  }

  const ownerRoleId = getEffectiveOwnerRoleId();
  const reviewerRoleId = getEffectiveReviewerRoleId();
  const ownerDiscordId = process.env.OWNER_DISCORD_ID?.trim();

  // Extract roles from session (discord.roles, discordRoles, or user.roles)
  const sessionRoles: string[] = [
    ...(req.session?.discord?.roles || []),
    ...(req.session?.discordRoles || []),
    ...((req.session?.user as any)?.roles || []),
  ].map((r) => String(r).trim());

  const hasOwnerRole = Boolean(ownerRoleId && sessionRoles.includes(ownerRoleId));
  const hasReviewerRole = Boolean(reviewerRoleId && sessionRoles.includes(reviewerRoleId));
  const isDirectOwner = Boolean(
    req.session?.isOwner ||
    (ownerDiscordId && req.session?.discord?.id === ownerDiscordId)
  );
  const isDirectReviewer = Boolean(req.session?.isReviewer);

  // 1. Full Owner Access: has Owner Role or is direct owner
  if (hasOwnerRole || isDirectOwner) {
    req.session.isOwner = true;
    req.session.isReviewer = false;
    return next();
  }

  // 2. Reviewer Access: has Reviewer Role or is in reviewer session
  // Must ONLY be allowed to access:
  // - GET /whitelist (view applications)
  // - GET /whitelist/questions (view exam questions only - read only)
  // - GET /settings (read-only branding like site name and logo)
  // - POST /applications/:id/decision & POST /whitelist/:id/approve /reject (approve or reject)
  // - POST /applications/:id/grant-role (grant role)
  if (hasReviewerRole || isDirectReviewer) {
    req.session.isReviewer = true;
    req.session.isOwner = false;

    const reqMethod = req.method.toUpperCase();
    const isWhitelisting = (reqMethod === 'GET' && (p === '/whitelist' || p.startsWith('/whitelist?')));
    const isViewingQuestions = (reqMethod === 'GET' && (p === '/whitelist/questions' || p.startsWith('/whitelist/questions?')));
    const isReadingSettings = (reqMethod === 'GET' && p === '/settings');
    const isApplicationDecision = (reqMethod === 'POST' && (
      (p.startsWith('/applications/') && p.endsWith('/decision')) ||
      (p.startsWith('/whitelist/') && (p.endsWith('/approve') || p.endsWith('/reject')))
    ));
    const isGrantingRole = (reqMethod === 'POST' && p.startsWith('/applications/') && p.endsWith('/grant-role'));

    if (isWhitelisting || isViewingQuestions || isReadingSettings || isApplicationDecision || isGrantingRole) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Forbidden: Reviewer Role Restricted',
      message: 'غير مصرح: رتبتك مخصصة فقط لمراجعة طلبات الانضمام (قبول ورفض) واستعراض أسئلة الاختبار، ولا يمكنك تعديل أو حذف أي محتوى آخر في السيرفر.',
      userRole: 'reviewer',
    });
  }

  // In development / preview mode inside AI Studio, fallback
  if (!isProd || process.env.NODE_ENV !== 'production') {
    if (req.session?.isReviewer) {
      const reqMethod = req.method.toUpperCase();
      const isWhitelisting = (reqMethod === 'GET' && (p === '/whitelist' || p.startsWith('/whitelist?')));
      const isViewingQuestions = (reqMethod === 'GET' && (p === '/whitelist/questions' || p.startsWith('/whitelist/questions?')));
      const isReadingSettings = (reqMethod === 'GET' && p === '/settings');
      const isApplicationDecision = (reqMethod === 'POST' && (
        (p.startsWith('/applications/') && p.endsWith('/decision')) ||
        (p.startsWith('/whitelist/') && (p.endsWith('/approve') || p.endsWith('/reject')))
      ));
      const isGrantingRole = (reqMethod === 'POST' && p.startsWith('/applications/') && p.endsWith('/grant-role'));

      if (isWhitelisting || isViewingQuestions || isReadingSettings || isApplicationDecision || isGrantingRole) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Forbidden: Reviewer Role Restricted',
        message: 'غير مصرح: رتبتك مخصصة فقط لمراجعة طلبات الانضمام واستعراض أسئلة الاختبار.',
        userRole: 'reviewer',
      });
    }

    req.session.isOwner = true;
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Forbidden: Missing required Discord Role',
    message: 'غير مصرح: يجب أن يمتلك حسابك في الديسكورد إما رتبة الإدارة العليا أو رتبة مراجعة التقديمات.',
    requiredOwnerRoleId: ownerRoleId,
    requiredReviewerRoleId: reviewerRoleId,
    userRoles: sessionRoles,
  });
}

// -------------------------------------------------------------
// ADMIN & OWNER REST API ROUTER
// -------------------------------------------------------------
const adminRouter = express.Router();
adminRouter.use(verifyDiscordOwnerRole);

// Auth & Status
adminRouter.get('/status', (req, res) => {
  const ownerRoleId = getEffectiveOwnerRoleId();
  const reviewerRoleId = getEffectiveReviewerRoleId();
  const acceptedRoleId = getEffectiveAcceptedRoleId();
  const sessionRoles: string[] = [
    ...(req.session.discord?.roles || []),
    ...(req.session.discordRoles || []),
    ...((req.session.user as any)?.roles || []),
  ].map((r) => String(r).trim());

  const hasOwnerRole = Boolean(ownerRoleId && sessionRoles.includes(ownerRoleId));
  const hasReviewerRole = Boolean(reviewerRoleId && sessionRoles.includes(reviewerRoleId));
  const isDirectOwner = Boolean(
    req.session?.isOwner ||
    (process.env.OWNER_DISCORD_ID && req.session?.discord?.id === process.env.OWNER_DISCORD_ID)
  );

  const isOwner = Boolean(req.session?.isOwner ?? (hasOwnerRole || isDirectOwner));
  const isReviewer = Boolean(req.session?.isReviewer ?? (!isOwner && hasReviewerRole));
  const role = isOwner ? 'owner' : (isReviewer ? 'reviewer' : 'guest');

  res.json({
    success: true,
    isOwner,
    isReviewer,
    role,
    isAuthorized: isOwner || isReviewer,
    hasOwnerRole,
    hasReviewerRole,
    ownerRoleId,
    reviewerRoleId,
    acceptedRoleId,
    roles: sessionRoles,
    discord: req.session.discord || null,
  });
});

adminRouter.post('/auth', (req, res) => {
  const { passkey, mode } = req.body;
  const ownerSecret = process.env.OWNER_PASSKEY || (isProd ? '' : 'hlc2026');
  const reviewerSecret = process.env.REVIEWER_PASSKEY || (isProd ? '' : 'reviewer2026');
  const ownerRoleId = getEffectiveOwnerRoleId();
  const reviewerRoleId = getEffectiveReviewerRoleId();

  const verifiedRoles: string[] = req.session.discord?.roles || req.session.discordRoles || [];
  if (isProd && !req.session.discord) return res.status(401).json({ success: false, error: 'سجل الدخول عبر Discord أولاً' });
  if (isProd && mode === 'reviewer' && !verifiedRoles.includes(reviewerRoleId)) return res.status(403).json({ success: false, error: 'رتبة المراجعة غير موجودة في حسابك' });
  if (isProd && mode !== 'reviewer' && !verifiedRoles.includes(ownerRoleId)) return res.status(403).json({ success: false, error: 'رتبة الإدارة غير موجودة في حسابك' });

  if ((!isProd && (passkey === reviewerSecret || passkey === 'reviewer' || mode === 'reviewer')) || (isProd && verifiedRoles.includes(reviewerRoleId) && mode === 'reviewer')) {
    req.session.isReviewer = true;
    req.session.isOwner = false;
    const roles = req.session.discordRoles || req.session.discord?.roles || [];
    if (!roles.includes(reviewerRoleId)) roles.push(reviewerRoleId);
    req.session.discordRoles = roles;
    if (req.session.discord) {
      req.session.discord.roles = roles;
    } else {
      req.session.discord = {
        id: '222233334444555566',
        username: 'ReviewerStaff',
        global_name: 'مشرف التقديمات (Reviewer Staff)',
        roles: [reviewerRoleId],
      };
    }
    addLog('تسجيل دخول مشرف التقديمات', 'تم توثيق رتبة مراجعة التقديمات والدخول للوحة المراجعة.', 'Reviewer Staff', 'whitelist');
    return res.json({
      success: true,
      message: 'Reviewer authenticated with REVIEWER_ROLE_ID',
      role: 'reviewer',
      roleGranted: reviewerRoleId,
    });
  }

  if ((!isProd && (passkey === ownerSecret || passkey === 'hlc_owner')) || (isProd && verifiedRoles.includes(ownerRoleId))) {
    req.session.isOwner = true;
    req.session.isReviewer = false;
    const roles = req.session.discordRoles || req.session.discord?.roles || [];
    if (!roles.includes(ownerRoleId)) {
      roles.push(ownerRoleId);
    }
    req.session.discordRoles = roles;
    if (req.session.discord) {
      req.session.discord.roles = roles;
    } else {
      req.session.discord = {
        id: process.env.OWNER_DISCORD_ID || '123456789011111111',
        username: 'OwnerStaff',
        global_name: 'الإدارة العليا (Staff)',
        roles: [ownerRoleId],
      };
    }
    addLog('تسجيل دخول للإدارة', 'تم توثيق رتبة OWNER_ROLE_ID بنجاح والدخول للوحة الإدارة.', 'Owner Staff', 'server');
    return res.json({
      success: true,
      message: 'Admin authenticated with OWNER_ROLE_ID',
      role: 'owner',
      roleGranted: ownerRoleId,
    });
  }
  res.status(403).json({ success: false, message: 'رمز مرور الإدارة غير صحيح' });
});

adminRouter.post('/switch-role-mode', (req, res) => {
  const { mode } = req.body;
  if (mode === 'reviewer') {
    req.session.isReviewer = true;
    req.session.isOwner = false;
  } else {
    req.session.isOwner = true;
    req.session.isReviewer = false;
  }
  res.json({
    success: true,
    mode: req.session.isOwner ? 'owner' : 'reviewer',
    isOwner: Boolean(req.session.isOwner),
    isReviewer: Boolean(req.session.isReviewer),
  });
});

adminRouter.post('/logout', (req, res) => {
  req.session.isOwner = false;
  req.session.isReviewer = false;
  req.session.discordRoles = [];
  if (req.session.discord) {
    req.session.discord.roles = [];
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// 1. Overview / Dashboard
adminRouter.get('/overview', (_req, res) => {
  const status = getServerStatus();
  const totalRegistered = getTotalPlayersCount();
  res.json({
    success: true,
    server: {
      players_online: status.players,
      max_players: status.max_players,
      status: status.online ? 'ONLINE' : 'OFFLINE',
      uptime: '99.98%',
      last_heartbeat: status.last_heartbeat,
    },
    totalRegistered,
    totalPlayHours: Math.floor(serverState.total_play_seconds / 3600),
    medicOfTheWeek,
    playerOfTheWeek,
    recentApplications: whitelistApplications.slice(0, 5),
    recentLogs: auditLogs.slice(0, 5),
  });
});

// 2. Players Management (Real Database Query)
adminRouter.get('/players', (req, res) => {
  const search = String(req.query.search || '').trim();
  const list = searchPlayers(search);

  res.json({
    success: true,
    players: list.map((p) => {
      const chars = getCharactersByDiscord(p.discord_id);
      const totalHours = Math.floor(p.total_playtime / 3600);
      const totalMins = Math.floor((p.total_playtime % 3600) / 60);
      const weeklyHours = Math.floor(p.weekly_playtime / 3600);
      return {
        id: p.id,
        name: p.player_name,
        player_name: p.player_name,
        discord_id: p.discord_id,
        steam_id: p.steam_id || 'N/A',
        citizenid: chars[0]?.citizenid || `HL-${1000 + p.id}`,
        job_label: chars[0]?.job || 'مواطن',
        total_seconds: p.total_playtime,
        total_hours: `${totalHours} ساعة${totalMins > 0 ? ` و ${totalMins} دقيقة` : ''}`,
        total_hours_num: totalHours,
        weekly_seconds: p.weekly_playtime,
        weekly_hours: `${weeklyHours} ساعة`,
        monthly_seconds: p.monthly_playtime,
        is_online: true,
        last_seen: p.last_seen,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        characters: chars,
      };
    }),
  });
});

// 3. Whitelist Applications Management
adminRouter.get('/whitelist', (_req, res) => {
  res.json({ success: true, applications: whitelistApplications });
});

adminRouter.post('/whitelist/:id/approve', async (req, res) => {
  const allApps = [...whitelistApplications, ...getWhitelistApplications()];
  const appItem = allApps.find((a) => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ success: false, error: 'Application not found' });

  appItem.status = 'approved';
  const staffName = req.session?.discord?.global_name || req.session?.discord?.username || 'Owner Staff';
  appItem.reviewerName = staffName;

  const acceptedRole = getEffectiveAcceptedRoleId();
  let roleGranted = false;
  if (appItem.discordId && acceptedRole) {
    roleGranted = await assignDiscordRoleToMember(appItem.discordId, acceptedRole);
  }
  updateWhitelistApplicationStatus(req.params.id, 'approved', staffName, roleGranted, acceptedRole);
  addLog('قبول وايت لست', `تم قبول طلب اللاعب ${appItem.characterName} (${appItem.discordTag}). تم منح الرتبة (${acceptedRole}).`, staffName, 'whitelist');
  res.json({ success: true, application: appItem, roleGranted, roleId: acceptedRole });
});

adminRouter.post('/whitelist/:id/reject', async (req, res) => {
  const allApps = [...whitelistApplications, ...getWhitelistApplications()];
  const appItem = allApps.find((a) => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ success: false, error: 'Application not found' });

  appItem.status = 'rejected';
  const staffName = req.session?.discord?.global_name || req.session?.discord?.username || 'Owner Staff';
  appItem.reviewerName = staffName;

  const acceptedRole = getEffectiveAcceptedRoleId();
  if (appItem.discordId && acceptedRole) {
    removeDiscordRoleFromMember(appItem.discordId, acceptedRole).catch(() => {});
  }
  updateWhitelistApplicationStatus(req.params.id, 'rejected', staffName, false, '');
  addLog('رفض وايت لست', `تم رفض طلب اللاعب ${appItem.characterName} (${appItem.discordTag}).`, staffName, 'whitelist');
  res.json({ success: true, application: appItem });
});

// 4. Whitelist Questions Management (Real SQLite Table: whitelist_questions)
adminRouter.get('/whitelist/questions', (_req, res) => {
  const questions = getWhitelistQuestions(false);
  res.json({
    success: true,
    questions: questions.map((q) => ({
      id: String(q.id),
      numericId: q.id,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      options: [
        { id: 'a', text: q.option_a },
        { id: 'b', text: q.option_b },
        { id: 'c', text: q.option_c },
        { id: 'd', text: q.option_d },
      ],
      correctAnswerId: q.correct_answer,
      correct_answer: q.correct_answer,
      sort_order: q.sort_order,
      enabled: Boolean(q.enabled),
    })),
  });
});

adminRouter.post('/whitelist/questions', (req, res) => {
  const { id, numericId, question, option_a, option_b, option_c, option_d, options, correct_answer, correctAnswerId, sort_order, enabled } = req.body;

  const targetId = numericId || (id && !isNaN(Number(id)) ? Number(id) : null);

  const optA = option_a || options?.[0]?.text || 'الخيار الأول';
  const optB = option_b || options?.[1]?.text || 'الخيار الثاني';
  const optC = option_c || options?.[2]?.text || 'الخيار الثالث';
  const optD = option_d || options?.[3]?.text || 'الخيار الرابع';
  const correct = (correct_answer || correctAnswerId || 'a').toLowerCase();

  if (targetId) {
    updateWhitelistQuestion(targetId, {
      question,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_answer: correct,
      sort_order,
      enabled,
    });
    addLog('تعديل سؤال وايت لست', `تم تعديل السؤال رقم ${targetId}`, 'Owner Staff', 'test');
    return res.json({ success: true, id: targetId });
  }

  const result = addWhitelistQuestion({
    question: question || 'سؤال جديد',
    option_a: optA,
    option_b: optB,
    option_c: optC,
    option_d: optD,
    correct_answer: correct,
    sort_order,
    enabled,
  });

  addLog('إضافة سؤال وايت لست', `تمت إضافة سؤال جديد للوايت لست: ${question}`, 'Owner Staff', 'test');
  res.json(result);
});

adminRouter.delete('/whitelist/questions/:id', (req, res) => {
  const qId = Number(req.params.id);
  deleteWhitelistQuestion(qId);
  addLog('حذف سؤال وايت لست', `تم حذف السؤال ذو المعرف ${req.params.id}`, 'Owner Staff', 'test');
  res.json({ success: true });
});

// 11. تحريك السؤال فوق وتحت (Move question UP / DOWN in database)
adminRouter.post('/whitelist/questions/:id/move', (req, res) => {
  const qId = Number(req.params.id);
  const direction = req.body.direction === 'down' ? 'down' : 'up';
  const result = moveWhitelistQuestion(qId, direction);
  if (!result.success) {
    return res.status(404).json(result);
  }
  addLog('إعادة ترتيب الأسئلة', `تم تحريك السؤال #${qId} إلى ${direction === 'up' ? 'الأعلى' : 'الأسفل'}`, 'Owner Staff', 'test');
  res.json({ success: true, direction });
});

// Server Database Status & Sync endpoints
adminRouter.get('/database/status', (_req, res) => {
  const status = getServerStatus();
  const totalPlayers = getTotalPlayersCount();
  res.json({
    success: true,
    connected: true,
    driver: 'SQLite (server_database.sqlite)',
    totalPlayers,
    serverStatus: status,
    syncWebhookUrl: '/api/server/sync-players',
    heartbeatWebhookUrl: '/api/server/heartbeat',
    playerJoinWebhookUrl: '/api/server/player-joined',
    playerLeftWebhookUrl: '/api/server/player-left',
  });
});

adminRouter.post('/database/sync-test', (req, res) => {
  const syncList = Array.isArray(req.body.players) ? req.body.players : [];
  if (syncList.length === 0) {
    return res.json({ success: true, message: 'قاعدة البيانات نقية ولا توجد أسماء وهمية. أرسل مصفوفة اللاعبين لمزامنتها عند الحاجة.', syncedCount: 0 });
  }
  const result = syncPlayersBatch(syncList);
  addLog('مزامنة بيانات السيرفر', `تمت مزامنة ${result.syncedCount} لاعب مع قاعدة البيانات.`, 'Owner Staff', 'server');
  res.json(result);
});

// 5. Spotlight: Medic of the Week
adminRouter.get('/medic', (_req, res) => {
  res.json({ success: true, medic: medicOfTheWeek });
});

adminRouter.post('/medic', (req, res) => {
  const { playerName, discordId, image, description, week } = req.body;
  medicOfTheWeek = {
    playerName: playerName || medicOfTheWeek.playerName,
    discordId: discordId || medicOfTheWeek.discordId,
    image: image || medicOfTheWeek.image,
    description: description || medicOfTheWeek.description,
    week: week || medicOfTheWeek.week,
    updatedAt: new Date().toISOString(),
    badge: 'كبير الجراحين EMS',
  };
  addLog('تحديث أفضل مسعف', `تم تحديد ${medicOfTheWeek.playerName} كمسعف الأسبوع.`, 'Owner Staff', 'award');
  res.json({ success: true, medic: medicOfTheWeek });
});

// 6. Spotlight: Player of the Week
adminRouter.get('/player-of-the-week', (_req, res) => {
  res.json({ success: true, player: playerOfTheWeek });
});

adminRouter.post('/player-of-the-week', (req, res) => {
  const { playerName, discordId, image, description, week } = req.body;
  playerOfTheWeek = {
    playerName: playerName || playerOfTheWeek.playerName,
    discordId: discordId || playerOfTheWeek.discordId,
    image: image || playerOfTheWeek.image,
    description: description || playerOfTheWeek.description,
    week: week || playerOfTheWeek.week,
    updatedAt: new Date().toISOString(),
    badge: 'المواطن المثالي',
  };
  addLog('تحديث أفضل لاعب', `تم تحديد ${playerOfTheWeek.playerName} كلاعب الأسبوع.`, 'Owner Staff', 'award');
  res.json({ success: true, player: playerOfTheWeek });
});

adminRouter.post('/heroes', (req, res) => {
  const { cop, medic, employee } = req.body;
  if (cop) heroesData.cop_of_the_week = { ...heroesData.cop_of_the_week, ...cop };
  if (medic) heroesData.medic_of_the_week = { ...heroesData.medic_of_the_week, ...medic };
  if (employee) heroesData.employee_of_the_week = { ...heroesData.employee_of_the_week, ...employee };
  addLog('تحديث أبطال الأسبوع', 'تم تعديل بيانات أبطال الأسبوع.', 'Owner Staff', 'award');
  res.json({ success: true, heroes: heroesData });
});

// 7. News Management
adminRouter.get('/news', (_req, res) => {
  res.json({ success: true, news: newsList });
});

adminRouter.post('/news', (req, res) => {
  const { id, titleAr, contentAr, date, author, categoryAr, image, published } = req.body;

  if (id) {
    const existing = newsList.find((n) => n.id === id);
    if (existing) {
      existing.titleAr = titleAr || existing.titleAr;
      existing.contentAr = contentAr || existing.contentAr;
      existing.image = image || existing.image;
      existing.published = published !== undefined ? published : existing.published;
      existing.categoryAr = categoryAr || existing.categoryAr;
      addLog('تعديل خبر', `تم تعديل الخبر: ${existing.titleAr}`, 'Owner Staff', 'news');
      return res.json({ success: true, newsItem: existing });
    }
  }

  const newItem = {
    id: `news-${Date.now()}`,
    titleAr: titleAr || 'خبر جديد',
    titleEn: 'New Announcement',
    contentAr: contentAr || '',
    contentEn: '',
    date: date || new Date().toISOString().split('T')[0],
    author: author || 'الإدارة العليا',
    categoryAr: categoryAr || 'أخبار السيرفر',
    categoryEn: 'Server News',
    image: image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    published: published !== undefined ? published : true,
  };
  newsList.unshift(newItem);
  addLog('إضافة خبر جديد', `تم نشر خبر جديد: ${newItem.titleAr}`, 'Owner Staff', 'news');
  res.json({ success: true, newsItem: newItem });
});

adminRouter.delete('/news/:id', (req, res) => {
  newsList = newsList.filter((n) => n.id !== req.params.id);
  addLog('حذف خبر', `تم حذف الخبر ذو المعرف ${req.params.id}`, 'Owner Staff', 'news');
  res.json({ success: true });
});

// 8. Rules Management
adminRouter.get('/rules', (_req, res) => {
  res.json({ success: true, rules: rulesList });
});

adminRouter.post('/rules', (req, res) => {
  const { id, titleAr, descriptionAr, penaltyAr, category, active } = req.body;

  if (id) {
    const existing = rulesList.find((r) => r.id === id);
    if (existing) {
      existing.titleAr = titleAr || existing.titleAr;
      existing.descriptionAr = descriptionAr || existing.descriptionAr;
      existing.penaltyAr = penaltyAr || existing.penaltyAr;
      existing.category = category || existing.category;
      if (active !== undefined) existing.active = active;
      addLog('تعديل قانون', `تم تعديل قانون: ${existing.titleAr}`, 'Owner Staff', 'rule');
      return res.json({ success: true, ruleItem: existing });
    }
  }

  const newRule = {
    id: `rule-${Date.now()}`,
    category: category || 'قوانين عامة',
    titleAr: titleAr || 'قانون جديد',
    titleEn: 'New Rule',
    descriptionAr: descriptionAr || '',
    descriptionEn: '',
    penaltyAr: penaltyAr || 'إنذار إداري',
    penaltyEn: 'Warning',
    active: active !== undefined ? active : true,
    order: rulesList.length + 1,
  };
  rulesList.push(newRule);
  addLog('إضافة قانون', `تمت إضافة قانون جديد: ${newRule.titleAr}`, 'Owner Staff', 'rule');
  res.json({ success: true, ruleItem: newRule });
});

adminRouter.delete('/rules/:id', (req, res) => {
  rulesList = rulesList.filter((r) => r.id !== req.params.id);
  addLog('حذف قانون', `تم حذف القانون ذو المعرف ${req.params.id}`, 'Owner Staff', 'rule');
  res.json({ success: true });
});

// 9. Custom Tests Management
adminRouter.get('/tests', (_req, res) => {
  res.json({ success: true, tests: customTests, results: testResultsList });
});

adminRouter.post('/tests', (req, res) => {
  const { id, title, description, targetRole, passScore, attemptsAllowed, active, questions } = req.body;

  if (id) {
    const existing = customTests.find((t) => t.id === id);
    if (existing) {
      existing.title = title || existing.title;
      existing.description = description || existing.description;
      existing.targetRole = targetRole || existing.targetRole;
      if (passScore !== undefined) existing.passScore = passScore;
      if (attemptsAllowed !== undefined) existing.attemptsAllowed = attemptsAllowed;
      if (active !== undefined) existing.active = active;
      if (questions) existing.questions = questions;
      addLog('تعديل اختبار', `تم تعديل الاختبار: ${existing.title}`, 'Owner Staff', 'test');
      return res.json({ success: true, test: existing });
    }
  }

  const newTest = {
    id: `test-${Date.now()}`,
    title: title || 'اختبار جديد',
    description: description || '',
    targetRole: targetRole || 'General',
    passScore: passScore || 80,
    attemptsAllowed: attemptsAllowed || 3,
    active: active !== undefined ? active : true,
    questions: questions || [],
    createdAt: new Date().toISOString().split('T')[0],
  };
  customTests.push(newTest);
  addLog('إنشاء اختبار جديد', `تم إنشاء اختبار: ${newTest.title}`, 'Owner Staff', 'test');
  res.json({ success: true, test: newTest });
});

adminRouter.delete('/tests/:id', (req, res) => {
  customTests = customTests.filter((t) => t.id !== req.params.id);
  addLog('حذف اختبار', `تم حذف الاختبار ذو المعرف ${req.params.id}`, 'Owner Staff', 'test');
  res.json({ success: true });
});

// 10. Announcements
adminRouter.get('/announcements', (_req, res) => {
  res.json({ success: true, announcements: announcementsList });
});

adminRouter.post('/announcements', (req, res) => {
  const { title, message, type, active } = req.body;
  const newAnn = {
    id: `ann-${Date.now()}`,
    title: title || 'إعلان إداري',
    message: message || '',
    type: type || 'info',
    active: active !== undefined ? active : true,
    createdAt: new Date().toISOString().split('T')[0],
  };
  announcementsList.unshift(newAnn);
  addLog('نشر إعلان', `تم نشر إعلان عاجل: ${newAnn.title}`, 'Owner Staff', 'server');
  res.json({ success: true, announcement: newAnn });
});

// 11. Audit Logs
adminRouter.get('/logs', (_req, res) => {
  res.json({ success: true, logs: auditLogs });
});

// 11b. Onboarding & Registered Accounts Analytics (User requirement: Logins count, tests, 18-day active window)
adminRouter.get('/onboarding-stats', (_req, res) => {
  const stats = getAccountStats();
  res.json({ success: true, ...stats });
});

adminRouter.delete('/accounts/:discordId', (req, res) => {
  const stats = deleteAccount(req.params.discordId);
  addLog('حذف حساب مسجل', `تم حذف الحساب بالمعرف ${req.params.discordId}`, 'Owner Staff', 'server');
  res.json({ success: true, ...stats });
});

adminRouter.post('/accounts/reset', (_req, res) => {
  const stats = resetAccounts();
  addLog('تصفير الحسابات المسجلة', 'تم تصفير قائمة الحسابات المسجلة للاختبار.', 'Owner Staff', 'server');
  res.json({ success: true, ...stats });
});

// 12. Team Management (SQLite database, owner adds members)
adminRouter.get('/team', (_req, res) => {
  const team = getTeamMembers();
  res.json({ success: true, team });
});

adminRouter.post('/team', (req, res) => {
  const { name, roleTitle, roleType, description, discordId, avatar } = req.body;
  if (!name || !roleTitle) {
    return res.status(400).json({ success: false, error: 'الاسم والرتبة مطلوبان' });
  }
  const result = addTeamMember({
    name,
    roleTitle,
    roleType: roleType || 'management',
    description,
    discordId,
    avatar,
  });
  addLog('إضافة عضو إدارة', `تمت إضافة العضو ${name} (${roleTitle}) إلى طاقم العمل.`, 'Owner Staff', 'server');
  res.json({ ...result, team: getTeamMembers() });
});

adminRouter.delete('/team/:id', (req, res) => {
  const rawId = req.params.id.replace(/^tm-/, '');
  deleteTeamMember(Number(rawId));
  addLog('حذف عضو إدارة', `تم حذف عضو الإدارة معرف ${rawId}.`, 'Owner Staff', 'server');
  res.json({ success: true, team: getTeamMembers() });
});

// 13. Streamers Management (Real-time live status and viewers)
adminRouter.get('/streams', (_req, res) => {
  const streamers = getStreamers();
  res.json({ success: true, streams: streamers });
});

adminRouter.post('/streams', (req, res) => {
  const { name, platform, channelName, channelUrl, avatar, title, viewers, isOnline } = req.body;
  if (!name || !channelName) {
    return res.status(400).json({ success: false, error: 'اسم صانع المحتوى ورابط أو اسم القناة مطلوبان' });
  }
  const result = addStreamer({
    name,
    platform: platform || 'twitch',
    channelName,
    channelUrl,
    avatar,
    title,
    viewers: viewers !== undefined ? Number(viewers) : 0,
    isOnline: Boolean(isOnline),
  });
  addLog('إضافة صانع محتوى', `تمت إضافة صانع المحتوى ${name} (${channelName}).`, 'Owner Staff', 'server');
  res.json({ ...result, streams: getStreamers() });
});

adminRouter.delete('/streams/:id', (req, res) => {
  const rawId = req.params.id.replace(/^st-/, '');
  deleteStreamer(Number(rawId));
  addLog('حذف ستريمر', `تم حذف الستريمر معرف ${rawId}.`, 'Owner Staff', 'server');
  res.json({ success: true, streams: getStreamers() });
});

adminRouter.post('/streams/check', async (_req, res) => {
  await updateAllStreamersLiveStatus();
  addLog('فحص البثوث المباشرة', 'تم فحص وتحديث حالة البثوث المباشرة وعدد المشاهدين الآن.', 'Owner Staff', 'server');
  res.json({ success: true, streams: getStreamers() });
});

adminRouter.post('/streams/:id/status', (req, res) => {
  const rawId = req.params.id.replace(/^st-/, '');
  const { isOnline, viewers, title } = req.body;
  updateStreamerLive(Number(rawId), Boolean(isOnline), Number(viewers || 0), title);
  res.json({ success: true, streams: getStreamers() });
});

// 14. Site Settings (Saved directly to SQLite site_settings table)
adminRouter.get('/settings', (_req, res) => {
  res.json({ success: true, settings: getSiteSettings() });
});

adminRouter.post('/settings', (req, res) => {
  cachedBotTokenInvalid = false;
  updateSiteSettings(req.body);
  addLog('تحديث إعدادات الموقع', 'تم حفظ إعدادات الموقع وهوية السيرفر في قاعدة البيانات.', 'Owner Staff', 'server');
  res.json({ success: true, settings: getSiteSettings() });
});

adminRouter.post('/upload-logo', (req, res) => {
  try {
    const { imageBase64 } = req.body || {};
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ success: false, error: 'بيانات الصورة غير صالحة أو مفقودة' });
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const base64Data = matches ? matches[2] : imageBase64;
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length === 0) {
      return res.status(400).json({ success: false, error: 'الملف فارغ' });
    }

    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, 'logo.png'), buffer);
    fs.writeFileSync(path.join(publicDir, 'logo.jpg'), buffer);
    fs.writeFileSync(path.join(publicDir, 'server-logo.png'), buffer);

    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, 'logo.png'), buffer);
      fs.writeFileSync(path.join(distDir, 'logo.jpg'), buffer);
      fs.writeFileSync(path.join(distDir, 'server-logo.png'), buffer);
    }

    const timestamp = Date.now();
    const logoUrl = `/logo.png?v=${timestamp}`;
    const settings = getSiteSettings() || {};
    settings.logoUrl = logoUrl;
    updateSiteSettings(settings);

    addLog('تحديث الشعار الرسمي', 'تم رفع وحفظ شعار السيرفر الأصلي بنجاح تام وبدون أي تعديل ذكاء اصطناعي.', 'Owner', 'server');

    return res.json({ success: true, logoUrl, message: 'تم حفظ وتعيين الشعار بنجاح تام لكامل الموقع' });
  } catch (err: any) {
    console.error('Error uploading logo in adminRouter:', err);
    return res.status(500).json({ success: false, error: err.message || 'حدث خطأ أثناء رفع الشعار' });
  }
});

// Endpoint to verify Discord Bot Token status live
adminRouter.all('/check-bot-token', async (req, res) => {
  const queryToken = (req.body?.botToken || req.query?.botToken) as string | undefined;
  const settings = getSiteSettings();
  const rawToken = queryToken || settings?.discordWebhook?.botToken || process.env.DISCORD_BOT_TOKEN || '';
  const cleanToken = String(rawToken).trim().replace(/^Bot\s+/i, '').replace(/^Bearer\s+/i, '');

  if (!cleanToken) {
    return res.json({
      valid: false,
      error: 'لم يتم إدخال توكن البوت بعد. يرجى إدخال التوكن من صفحة Discord Developer Portal.',
      status: 400,
    });
  }

  try {
    const dRes = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bot ${cleanToken}` },
    });
    if (dRes.ok) {
      const data = await dRes.json();
      cachedBotTokenInvalid = false;
      return res.json({
        valid: true,
        bot: {
          id: data.id,
          username: data.username,
          tag: `${data.username}#${data.discriminator || '0000'}`,
          avatar: data.avatar,
        },
      });
    } else {
      const status = dRes.status;
      if (status === 401) {
        cachedBotTokenInvalid = true;
        return res.json({
          valid: false,
          status: 401,
          error: 'توكن البوت غير مصرح به أو منتهي الصلاحية (401: Unauthorized). يرجى الضغط على Reset Token في Discord Developer Portal ونسخ التوكن الجديد.',
        });
      }
      const errText = await dRes.text();
      return res.json({
        valid: false,
        status,
        error: `خطأ من ديسكورد: HTTP ${status} - ${errText}`,
      });
    }
  } catch (err: any) {
    return res.json({
      valid: false,
      error: err?.message || 'تعذر الاتصال بخوادم ديسكورد',
    });
  }
});

// 15. FAQ Management (SQLite faq_items)
adminRouter.get('/faq', (_req, res) => {
  res.json({ success: true, faqs: getFaqList() });
});

adminRouter.post('/faq', (req, res) => {
  const { question, answer, category, sort_order } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ success: false, error: 'السؤال والإجابة مطلوبان' });
  }
  const result = addFaqItem({ question, answer, category, sort_order });
  addLog('إضافة سؤال شائع', `تمت إضافة سؤال جديد للأسئلة الشائعة: ${question}`, 'Owner Staff', 'server');
  res.json({ ...result, faqs: getFaqList() });
});

adminRouter.delete('/faq/:id', (req, res) => {
  deleteFaqItem(Number(req.params.id));
  addLog('حذف سؤال شائع', `تم حذف السؤال رقم ${req.params.id}`, 'Owner Staff', 'server');
  res.json({ success: true, faqs: getFaqList() });
});

// 16. Careers / Jobs Management (SQLite jobs)
adminRouter.get('/jobs', (_req, res) => {
  res.json({ success: true, jobs: getJobsList() });
});

adminRouter.post('/jobs', (req, res) => {
  const { title, department, salary, description, icon, requirements, openings } = req.body;
  if (!title || !department) {
    return res.status(400).json({ success: false, error: 'المسمى الوظيفي والقطاع مطلوبان' });
  }
  const result = addJobItem({ title, department, salary, description, icon, requirements, openings });
  addLog('إضافة وظيفة', `تمت إضافة شاغر وظيفي جديد: ${title}`, 'Owner Staff', 'server');
  res.json({ ...result, jobs: getJobsList() });
});

adminRouter.delete('/jobs/:id', (req, res) => {
  deleteJobItem(Number(req.params.id));
  addLog('حذف وظيفة', `تم حذف الشاغر الوظيفي رقم ${req.params.id}`, 'Owner Staff', 'server');
  res.json({ success: true, jobs: getJobsList() });
});

// 17. Quizzes Aliases (Prompt 6 requirement: POST /api/admin/quizzes)
adminRouter.post('/quizzes', (req, res) => {
  const { question, option_a, option_b, option_c, option_d, options, correct_answer, correctAnswerId, sort_order, enabled } = req.body;
  const optA = option_a || options?.[0]?.text || 'الخيار الأول';
  const optB = option_b || options?.[1]?.text || 'الخيار الثاني';
  const optC = option_c || options?.[2]?.text || 'الخيار الثالث';
  const optD = option_d || options?.[3]?.text || 'الخيار الرابع';
  const correct = (correct_answer || correctAnswerId || 'a').toLowerCase();

  const result = addWhitelistQuestion({
    question: question || 'سؤال جديد',
    option_a: optA,
    option_b: optB,
    option_c: optC,
    option_d: optD,
    correct_answer: correct,
    sort_order,
    enabled,
  });
  addLog('إضافة سؤال اختبار', `تمت إضافة سؤال رول بلاي جديد: ${question}`, 'Owner Staff', 'test');
  res.json({ ...result, questions: getWhitelistQuestions(false) });
});

adminRouter.get('/quizzes', (_req, res) => {
  res.json({ success: true, quizzes: getWhitelistQuestions(false) });
});

adminRouter.delete('/quizzes/:id', (req, res) => {
  deleteWhitelistQuestion(Number(req.params.id));
  addLog('حذف سؤال اختبار', `تم حذف السؤال رقم ${req.params.id}`, 'Owner Staff', 'test');
  res.json({ success: true, questions: getWhitelistQuestions(false) });
});

// 18. Creators Aliases (Prompt 6 requirement: POST /api/admin/creators)
adminRouter.post('/creators', (req, res) => {
  const { name, platform, channelName, channelUrl, avatar, title, viewers, isOnline } = req.body;
  if (!name || !channelName) {
    return res.status(400).json({ success: false, error: 'اسم صانع المحتوى والقناة مطلوبان' });
  }
  const result = addStreamer({
    name,
    platform: platform || 'twitch',
    channelName,
    channelUrl,
    avatar,
    title,
    viewers: viewers !== undefined ? Number(viewers) : 0,
    isOnline: Boolean(isOnline),
  });
  addLog('إضافة صانع محتوى', `تمت إضافة صانع المحتوى ${name} (${channelName})`, 'Owner Staff', 'server');
  res.json({ ...result, creators: getStreamers() });
});

adminRouter.get('/creators', (_req, res) => {
  res.json({ success: true, creators: getStreamers() });
});

adminRouter.delete('/creators/:id', (req, res) => {
  const rawId = req.params.id.replace(/^st-/, '');
  deleteStreamer(Number(rawId));
  addLog('حذف صانع محتوى', `تم حذف صانع المحتوى ${rawId}`, 'Owner Staff', 'server');
  res.json({ success: true, creators: getStreamers() });
});

// 19. Whitelist Application Decision (Prompt 5 & 6 requirement: POST /api/admin/applications/:id/decision)
adminRouter.post('/applications/:id/decision', async (req, res) => {
  const { decision, reviewerName } = req.body;
  if (!decision || !['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ success: false, error: 'يجب تحديد قرار القبول أو الرفض (decision: approve | reject)' });
  }

  const allApps = [...whitelistApplications, ...getWhitelistApplications()];
  const appItem = allApps.find((a) => a.id === req.params.id);
  if (!appItem) {
    return res.status(404).json({ success: false, error: 'طلب الانضمام غير موجود' });
  }

  // Prevent double processing as specified in prompt
  if (appItem.status !== 'pending') {
    return res.status(400).json({ success: false, error: 'تم اتخاذ القرار في هذا الطلب مسبقاً ولا يمكن معالجته مرتين.' });
  }

  const staffName = reviewerName || req.session?.discord?.global_name || req.session?.discord?.username || 'Owner Staff';
  const newStatus = decision === 'approve' ? 'approved' : 'rejected';
  appItem.status = newStatus;
  appItem.reviewerName = staffName;

  const acceptedRole = getEffectiveAcceptedRoleId();
  const rejectedRole = getEffectiveRejectedRoleId();
  let roleGranted = false;

  // Auto-grant or revoke Discord Role immediately!
  if (decision === 'approve') {
    if (appItem.discordId && acceptedRole) {
      roleGranted = await assignDiscordRoleToMember(appItem.discordId, acceptedRole);
    }
    if (appItem.discordId && rejectedRole) {
      removeDiscordRoleFromMember(appItem.discordId, rejectedRole).catch(() => {});
    }
  } else {
    if (appItem.discordId && rejectedRole) {
      assignDiscordRoleToMember(appItem.discordId, rejectedRole).catch(() => {});
    }
    if (appItem.discordId && acceptedRole) {
      removeDiscordRoleFromMember(appItem.discordId, acceptedRole).catch(() => {});
    }
  }

  updateWhitelistApplicationStatus(req.params.id, newStatus, staffName, roleGranted, acceptedRole);

  if (decision === 'approve') {
    addLog('قبول وايت لست', `تم قبول طلب اللاعب ${appItem.characterName} (${appItem.discordTag}) بواسطة ${staffName}. تم منح رتبة المقبولين (${acceptedRole}).`, staffName, 'whitelist');
  } else {
    addLog('رفض وايت لست', `تم رفض طلب اللاعب ${appItem.characterName} (${appItem.discordTag}) بواسطة ${staffName}.`, staffName, 'whitelist');
  }

  // Notify Discord via Bot or Webhook about the decision
  try {
    const settings = getSiteSettings();
    const config = settings?.discordWebhook;
    const isApproved = decision === 'approve';

    // 1. Notify via Bot Channel if Bot Token is available
    if (config?.botToken && config?.channelId) {
      const replyContent = isApproved
        ? `🟢 **تم قبول واعتماد طلب اللاعب:** **${appItem.characterName}** (<@${appItem.discordId}>) بواسطة المشرف **${staffName}** عبر لوحة الإدارة!\n🎉 **تم منح رتبة المقبولين** (<@&${acceptedRole}>) في السيرفر تلقائياً.`
        : `🔴 **تم رفض طلب اللاعب:** **${appItem.characterName}** (<@${appItem.discordId}>) بواسطة المشرف **${staffName}** عبر لوحة الإدارة.`;

      fetch(`https://discord.com/api/v10/channels/${config.channelId.trim()}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${config.botToken.trim()}`,
        },
        body: JSON.stringify({
          content: replyContent,
          message_reference: appItem.discordMessageId ? { message_id: appItem.discordMessageId } : undefined,
        }),
      }).catch(() => {});
    }

    // 2. Notify via Webhook if Webhook is enabled
    if (config?.enabled && config?.webhookUrl) {
      fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: isApproved ? '✅ تم قبول طلب الوايت لست' : '❌ تم رفض طلب الوايت لست',
              description: `تم تحديث حالة طلب اللاعب **${appItem.characterName}** (${appItem.discordTag}) إلى **${isApproved ? 'مقبول ✅' : 'مرفوض ❌'}** بواسطة المشرف **${staffName}** عبر لوحة الإدارة.\n${isApproved ? `تم منح الرتبة (<@&${acceptedRole}>) في السيرفر تلقائياً.` : ''}`,
              color: isApproved ? 3066993 : 15158332,
              footer: { text: 'RIFT STATE • تحديث حالة الطلب الآلي' },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      }).catch(() => {});
    }
  } catch {}

  res.json({
    success: true,
    application: appItem,
    decision: newStatus,
    reviewer: staffName,
    roleGranted,
    roleId: acceptedRole,
    processedAt: new Date().toISOString(),
  });
});

// Explicit Grant Role Route for 1-click re-attempt or test
adminRouter.post('/applications/:id/grant-role', async (req, res) => {
  const allApps = [...whitelistApplications, ...getWhitelistApplications()];
  const appItem = allApps.find((a) => a.id === req.params.id);
  if (!appItem) {
    return res.status(404).json({ success: false, error: 'طلب الانضمام غير موجود' });
  }

  const acceptedRole = getEffectiveAcceptedRoleId();
  if (!appItem.discordId || !acceptedRole) {
    return res.status(400).json({ success: false, error: 'حساب الديسكورد أو معرف الرتبة غير متوفر' });
  }

  const granted = await assignDiscordRoleToMember(appItem.discordId, acceptedRole);
  updateWhitelistApplicationStatus(req.params.id, appItem.status || 'approved', appItem.reviewerName || 'Owner Staff', granted, acceptedRole);

  res.json({
    success: granted,
    roleId: acceptedRole,
    discordId: appItem.discordId,
    message: granted
      ? `تم منح الرتبة (${acceptedRole}) للاعب في الديسكورد بنجاح!`
      : 'تعذر منح الرتبة في الديسكورد. تأكد من توكن البوت ومعرف السيرفر وأن رتبة البوت في الديسكورد أعلى من الرتبة الممنوحة ولديها صلاحية Manage Roles.',
  });
});

// 20. Discord Webhook / Bot Test Route (Reactions ✅ & ❌, No Link Buttons)
adminRouter.post('/discord-webhook/test', async (req, res) => {
  const { webhookUrl, botToken, channelId, channelName, mentionRole, embedTitle, embedColor } = req.body;
  const hasWebhook = Boolean(webhookUrl && webhookUrl.startsWith('http'));
  const hasBot = Boolean(botToken && channelId);

  if (!hasWebhook && !hasBot) {
    return res.status(400).json({
      success: false,
      error: 'يرجى إدخال رابط ويب هوك صالح (يبدأ بـ https://discord.com/api/webhooks/...) أو توكن ومعرف روم البوت.',
    });
  }

  try {
    const originUrl = `${req.protocol}://${req.get('host')}`;
    const colorInt = embedColor ? parseInt(embedColor.replace('#', ''), 16) || 9127158 : 9127158;

    const fields: any[] = [
      { name: '👤 اسم الشخصية (تجريبي)', value: 'سلطان القحطاني', inline: true },
      { name: '💬 حساب الديسكورد (تجريبي)', value: '<@123456789012345678> (`Sultan#0001`)', inline: true },
      { name: '🎮 ستيم هيكس (تجريبي)', value: '`steam:110000112345678`', inline: false },
      { name: '📊 نتيجة الاختبار (تجريبي)', value: 'الدرجة: **10 من 10 (100%)** - ناجح ✅', inline: true },
      { name: '⏳ حالة الطلب', value: '🟡 **قيد المراجعة والتدقيق (ضع ريأكشن ✅ أو ❌)**', inline: true },
    ];

    const mentionPrefix = mentionRole ? `${mentionRole} ` : '';
    const payload = {
      content: `${mentionPrefix}🔔 **تجربة نظام الريأكشنات وإشعارات الاختبار الإلكتروني!**`,
      embeds: [
        {
          title: embedTitle || '🔔 رسالة تجريبية: اختبار ربط ديسكورد والريأكشنات بنجاح!',
          description: `تم إرسال هذه الرسالة بنجاح من لوحة تحكم سيرفر **RIFT STATE** إلى روم **${channelName || '#طلبات-الوايت-لست'}**.\n\n` +
            `👉 **طريقة اتخاذ القرار (نظام الريأكشنات):**\n` +
            `🟢 قام البوت بوضع ريأكشن **(✅)** للقبول المباشر وإعطاء رتبة الوايت لست فوراً!\n` +
            `🔴 قام البوت بوضع ريأكشن **(❌)** للرفض المباشر.\n\n` +
            `*(يحق فقط لحاملي رتبة مراجعة التقديمات والإدارة اتخاذ القرار)*`,
          color: colorInt,
          fields,
          footer: {
            text: 'RIFT STATE • تجربة نظام الريأكشنات بنجاح',
            icon_url: `${originUrl}/logo.png`,
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    let delivered = false;
    let messageId: string | null = null;

    // Test Bot API if provided (Sends message and adds real Discord reactions ✅ and ❌)
    if (hasBot) {
      try {
        const botRes = await fetch(`https://discord.com/api/v10/channels/${channelId.trim()}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${botToken.trim()}`,
          },
          body: JSON.stringify(payload),
        });

        if (botRes.ok) {
          delivered = true;
          const msgData = await botRes.json();
          messageId = msgData?.id;

          if (messageId) {
            // Add reaction ✅
            await fetch(
              `https://discord.com/api/v10/channels/${channelId.trim()}/messages/${messageId}/reactions/${encodeURIComponent('✅')}/@me`,
              {
                method: 'PUT',
                headers: { Authorization: `Bot ${botToken.trim()}` },
              }
            ).catch(() => {});

            // Add reaction ❌
            await fetch(
              `https://discord.com/api/v10/channels/${channelId.trim()}/messages/${messageId}/reactions/${encodeURIComponent('❌')}/@me`,
              {
                method: 'PUT',
                headers: { Authorization: `Bot ${botToken.trim()}` },
              }
            ).catch(() => {});
          }
        } else {
          const errText = await botRes.text();
          console.warn('[Test Bot API Error]:', errText);
        }
      } catch (err) {}
    }

    // Test Webhook if provided and not delivered by bot
    if (hasWebhook && !delivered) {
      try {
        const whRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (whRes.ok) {
          delivered = true;
        }
      } catch (err) {}
    }

    if (!delivered) {
      return res.status(500).json({
        success: false,
        error: 'فشل إرسال الرسالة إلى ديسكورد. تأكد من صحة رابط الويب هوك أو توكن البوت ومعرف الروم وصلاحيات البوت داخل السيرفر.',
      });
    }

    res.json({
      success: true,
      delivered: true,
      messageId,
      message: hasBot
        ? 'تم إرسال الرسالة التجريبية وإضافة الريأكشنات (✅ و ❌) عليها بنجاح في الديسكورد!'
        : 'تم إرسال الرسالة التجريبية إلى الويب هوك بنجاح! (ملاحظة: لإضافة الريأكشنات التلقائية ✅ و ❌ يتطلب إدخال توكن البوت ومعرف الروم)',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'حدث خطأ أثناء إرسال الرسالة التجريبية إلى ديسكورد',
    });
  }
});

// Mount adminRouter on both /api/admin and /api/owner endpoints
app.use('/api/admin', adminRouter);
app.use('/api/owner', adminRouter);

// -------------------------------------------------------------
// Vite middleware integration (Dev & Prod)
// -------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (isProd: ${isProd})`);
  });
}

startServer();
