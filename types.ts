export type Language = 'ar' | 'en';

export type NavigationTab = 
  | 'home' 
  | 'roster'
  | 'team'
  | 'live'
  | 'careers'
  | 'faq'
  | 'leaderboard'
  | 'store'
  | 'rules' 
  | 'updates' 
  | 'news' 
  | 'city' 
  | 'whitelist' 
  | 'support'
  | 'profile'
  | 'owner';

export interface TeamMember {
  id: string;
  name: string;
  roleTitle: string; // e.g. RS Founder, Owner, Lead Staff, Developer
  roleType: 'founder' | 'owner' | 'staff' | 'dev' | 'management';
  description: string;
  avatar: string;
  discordId?: string;
  sortOrder?: number;
  socials?: {
    discord?: string;
    twitter?: string;
    kick?: string;
    twitch?: string;
  };
}

export interface CreatorRosterItem {
  id: string;
  name: string;
  platform: 'kick' | 'twitch' | 'youtube' | 'tiktok';
  channelUrl: string;
  channelId?: string;
  avatar: string;
  followers?: string;
  category?: string;
  description?: string;
  sortOrder?: number;
}

export interface CareerPosition {
  id: string;
  title: string;
  department: string;
  type: string; // Full-Time, Volunteer, Staff
  description: string;
  requirements: string[];
  openRolesCount: number;
  active: boolean;
  applyUrl?: string;
}

export interface LiveStreamer {
  id: string;
  name: string;
  platform: 'kick' | 'twitch' | 'youtube';
  channelName?: string;
  channelUrl: string;
  title: string;
  viewers: number;
  isOnline: boolean;
  avatar: string;
  uptime?: string;
  category?: string;
}

export interface FaqItem {
  id: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  category: string;
  order: number;
}

export interface GameServer {
  id: string;
  name: string;
  cfxUrl: string;
  ip: string;
  port: number;
  onlinePlayers: number;
  maxPlayers: number;
  status: 'online' | 'maintenance' | 'offline';
  requiresWhitelist: boolean;
  description?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  joinButtonText: string;
  cfxJoinUrl: string;
  discordUrl: string;
  twitterUrl: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  redditUrl?: string;
  storeUrl: string;
  location: string;
  website: string;
  email: string;
  serverJoinEnabled: boolean;
  discordEnabled: boolean;
}

export interface SpotlightAward {
  playerName: string;
  discordId: string;
  image: string;
  description: string;
  week: string;
  updatedAt?: string;
  badge?: string;
}

export interface WeeklyAward {
  id: string;
  award_type: 'admin' | 'military' | 'distributor' | 'employee' | 'player' | 'medic';
  player_id: string | number;
  player_name: string;
  week_start: string;
  week_end: string;
  assigned_by: string;
  created_at: string;
  avatar?: string;
  badge?: string;
}

export interface PlayerStat {
  id: number;
  player_id: string;
  name: string;
  discord_id?: string;
  steam_id?: string;
  citizenid?: string;
  total_seconds: number;
  weekly_seconds: number;
  monthly_seconds: number;
  formatted_total_hours?: string;
  formatted_weekly_hours?: string;
  formatted_monthly_hours?: string;
  online_time?: string;
  is_online: boolean;
  job?: string;
  avatar?: string;
  last_login?: string;
  last_logout?: string;
}

export interface OwnerDashboardData {
  server: {
    status: 'ONLINE' | 'OFFLINE';
    players_online: number;
    max_players: number;
    total_registered_players: number;
  };
  statistics: {
    total_hours: number;
    this_week_hours: number;
    this_month_hours: number;
  };
  current_awards: Record<string, WeeklyAward>;
  medic_of_the_week: SpotlightAward;
  player_of_the_week: SpotlightAward;
  week_dates: {
    start: string;
    end: string;
    label: string;
  };
}

export interface ServerStats {
  onlinePlayers: number;
  maxPlayers: number;
  serverStatus: 'online' | 'maintenance' | 'restarting';
  ip: string;
  cfxUrl: string;
  discordMembers: number;
  tickRate: number;
  pingMs: number;
  inGameTime?: string;
  weather?: string;
}

export interface Faction {
  id: string;
  nameAr: string;
  nameEn: string;
  shortName: string;
  category: 'government' | 'emergency' | 'justice' | 'civilian' | 'underground';
  descriptionAr: string;
  descriptionEn: string;
  requirementsAr: string[];
  requirementsEn: string[];
  image: string;
  ranks: string[];
  isOpen: boolean;
}

export interface WhitelistApplication {
  id: string;
  discordId: string;
  discordTag: string;
  steamHex: string;
  applicantAge?: number;
  characterName: string;
  characterAge?: number;
  characterStory?: string;
  characterGoal?: string;
  submittedAt: string;
  status: 'pending' | 'reviewing' | 'interview' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedAt?: string;
}

export interface RuleItem {
  id: string;
  term?: string;
  category?: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  penaltyAr: string;
  penaltyEn: string;
  active?: boolean;
  order?: number;
}

export interface RuleCategory {
  id: string;
  titleAr: string;
  titleEn: string;
  rules: RuleItem[];
}

export interface NewsArticle {
  id: string;
  date: string;
  author: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  categoryAr: string;
  categoryEn: string;
  image?: string;
  published?: boolean;
}

export interface StoreItem {
  id: string;
  titleAr: string;
  titleEn: string;
  category: 'vip' | 'vehicles' | 'business' | 'customs';
  priceSar: number;
  descriptionAr: string;
  descriptionEn: string;
  featuresAr: string[];
  featuresEn: string[];
  image?: string;
  popular?: boolean;
}

export interface SupportTicket {
  id: string;
  type: 'report' | 'appeal' | 'complaint' | 'general';
  discordTag: string;
  reportedPlayer?: string;
  evidenceUrl?: string;
  subject: string;
  details: string;
  createdAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
}

export interface ServerUpdate {
  id: string;
  version: string;
  date: string;
  titleAr: string;
  titleEn: string;
  highlightsAr: string[];
  highlightsEn: string[];
  type: 'major' | 'minor' | 'hotfix';
}

export interface LeaderboardPlayer {
  rank: number;
  name: string;
  category: 'wealth' | 'police' | 'gang' | 'playtime';
  value: string;
  avatar: string;
  faction?: string;
  badge?: string;
}

export interface UserAccount {
  username: string;
  discordTag: string;
  steamHex: string;
  avatar?: string;
  citizenName?: string;
  isLoggedIn: boolean;
  whitelistStatus: 'not_applied' | 'pending' | 'interview' | 'approved';
}

export interface TestOption {
  id: string;
  text: string;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: TestOption[];
  correctAnswerId: string;
}

export interface CustomTest {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  passScore: number; // percentage, e.g. 80
  attemptsAllowed: number;
  active: boolean;
  questions: TestQuestion[];
  createdAt: string;
}

export interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  playerName: string;
  discordId: string;
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  passed: boolean;
  takenAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
  type: 'player' | 'whitelist' | 'award' | 'rule' | 'news' | 'test' | 'server';
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'event';
  active: boolean;
  createdAt: string;
}
