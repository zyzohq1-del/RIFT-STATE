import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.resolve(process.cwd(), 'server_database.sqlite');
export const db = new DatabaseSync(DB_PATH);

// Initialize all schema tables required for FiveM server sync & website database
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT UNIQUE,
      steam_id TEXT,
      player_name TEXT NOT NULL,
      total_playtime INTEGER DEFAULT 0,
      weekly_playtime INTEGER DEFAULT 0,
      monthly_playtime INTEGER DEFAULT 0,
      last_seen TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS player_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT NOT NULL,
      player_name TEXT NOT NULL,
      discord_id TEXT,
      steam_id TEXT,
      joined_at TEXT NOT NULL,
      left_at TEXT,
      duration INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS server_status (
      id INTEGER PRIMARY KEY,
      online_players INTEGER DEFAULT 47,
      max_players INTEGER DEFAULT 48,
      last_heartbeat TEXT,
      online INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS whitelist_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role_title TEXT NOT NULL,
      role_type TEXT NOT NULL,
      description TEXT,
      discord_id TEXT,
      avatar TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS streamers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      platform TEXT NOT NULL DEFAULT 'kick',
      channel_name TEXT NOT NULL,
      channel_url TEXT,
      title TEXT,
      viewers INTEGER DEFAULT 0,
      is_online INTEGER DEFAULT 0,
      avatar TEXT,
      uptime TEXT,
      last_checked TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS creators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      platform TEXT NOT NULL DEFAULT 'kick',
      channel_url TEXT NOT NULL,
      channel_id TEXT,
      avatar TEXT,
      followers TEXT,
      category TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY,
      settings_json TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faq_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT DEFAULT 'عام',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      salary TEXT,
      description TEXT,
      icon TEXT,
      requirements TEXT,
      openings INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS whitelist_applications (
      id TEXT PRIMARY KEY,
      discord_id TEXT NOT NULL,
      discord_tag TEXT NOT NULL,
      steam_hex TEXT,
      character_name TEXT NOT NULL,
      character_story TEXT,
      answers_json TEXT,
      status TEXT DEFAULT 'pending',
      reviewer_name TEXT,
      reviewed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citizenid TEXT UNIQUE NOT NULL,
      discord_id TEXT NOT NULL,
      steam_id TEXT,
      character_name TEXT NOT NULL,
      cash INTEGER DEFAULT 5000,
      bank INTEGER DEFAULT 25000,
      job TEXT DEFAULT 'مواطن',
      job_grade INTEGER DEFAULT 1,
      phone TEXT DEFAULT '555-0199',
      inventory_json TEXT DEFAULT '[]',
      last_location_json TEXT DEFAULT '{"x": -268.4, "y": -957.9, "z": 31.2, "street": "Legion Square"}',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS registered_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT UNIQUE NOT NULL,
      username TEXT,
      global_name TEXT,
      avatar TEXT,
      email TEXT,
      first_login TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT DEFAULT CURRENT_TIMESTAMP,
      login_count INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS account_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL UNIQUE,
      steam_id TEXT,
      license_id TEXT,
      citizenid TEXT NOT NULL UNIQUE,
      character_name TEXT NOT NULL,
      linked_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Initialize registered_accounts if empty with recent logins (including last 17-18 days)
  try {
    db.prepare('ALTER TABLE whitelist_applications ADD COLUMN role_given INTEGER DEFAULT 0').run();
  } catch {}
  try {
    db.prepare('ALTER TABLE whitelist_applications ADD COLUMN role_given_at TEXT').run();
  } catch {}
  try {
    db.prepare('ALTER TABLE whitelist_applications ADD COLUMN role_id TEXT').run();
  } catch {}
  try {
    db.prepare('ALTER TABLE whitelist_applications ADD COLUMN discord_message_id TEXT').run();
  } catch {}

  const regCountStmt = db.prepare('SELECT COUNT(*) as count FROM registered_accounts');
  const regCount = (regCountStmt.get() as any)?.count || 0;
  if (regCount === 0) {
    const insertAcc = db.prepare(`
      INSERT INTO registered_accounts (discord_id, username, global_name, avatar, email, first_login, last_login, login_count)
      VALUES (?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?), ?)
    `);
    insertAcc.run('109876543210987654', 'Bader_AlHarbi', 'بدر الحربي', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', 'bader@hlcrp.net', '-17 days', '-2 hours', 14);
    insertAcc.run('209876543210987655', 'Fahad_AlOtaibi', 'فهد العتيبي', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', 'fahad@hlcrp.net', '-16 days', '-1 days', 9);
    insertAcc.run('309876543210987656', 'Sultan_Najd', 'سلطان نجد', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80', 'sultan@hlcrp.net', '-15 days', '-3 days', 12);
    insertAcc.run('409876543210987657', 'Turki_Gamer', 'تركي الدوسري', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 'turki@hlcrp.net', '-10 days', '-5 hours', 21);
    insertAcc.run('509876543210987658', 'Khaled_RP', 'خالد الشمري', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', 'khaled@hlcrp.net', '-5 days', '-12 hours', 6);
    insertAcc.run('609876543210987659', 'Nasser_Hunter', 'ناصر القحطاني', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80', 'nasser@hlcrp.net', '-1 days', '-30 minutes', 3);
  }

  // Initialize site settings with defaults if not present
  const settingsStmt = db.prepare('SELECT id FROM site_settings WHERE id = 1');
  if (!settingsStmt.get()) {
    const defaultSettings = JSON.stringify({
      siteName: 'RIFT STATE',
      tagline: 'THE GTA RP IN THE MIDDLE EAST',
      heroTitle: 'RIFT STATE',
      heroSubtitle: 'The most immersive GTA V roleplay experience. Join 300,000+ players in a world of adventure, drama, and unforgettable stories.',
      cfxJoinUrl: 'https://cfx.re/join/riftstate',
      discordUrl: 'https://discord.gg/riftstate',
      twitterUrl: 'https://x.com/riftstate',
      storeUrl: 'https://store.riftstate.net',
      location: 'Saudi Arabia / Middle East',
      website: 'https://riftstate.net',
      email: 'support@riftstate.net',
    });
    db.prepare('INSERT INTO site_settings (id, settings_json) VALUES (1, ?)').run(defaultSettings);
  }

  // Ensure default server_status row
  const statusStmt = db.prepare('SELECT id FROM server_status WHERE id = 1');
  const existingStatus = statusStmt.get();
  if (!existingStatus) {
    const insertStatus = db.prepare(`
      INSERT INTO server_status (id, online_players, max_players, last_heartbeat, online)
      VALUES (1, 0, 48, ?, 1)
    `);
    insertStatus.run(new Date().toISOString());
  }

  // Seed default authentic whitelist questions if empty
  const qStmt = db.prepare('SELECT COUNT(*) as count FROM whitelist_questions');
  const qCount = (qStmt.get() as any)?.count || 0;
  if (qCount === 0) {
    const insertQ = db.prepare(`
      INSERT INTO whitelist_questions (question, option_a, option_b, option_c, option_d, correct_answer, sort_order, enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    insertQ.run(
      'ما هو التصرف الصحيح عند توجيه السلاح نحوك مباشرة (Fear RP)؟',
      'الركض والقفز ومحاولة ضرب المعتدي بيدك',
      'رفع يديك والاستجابة للتعليمات حفاظاً على حياتك وتقدير الخوف',
      'الخروج فوراً من اللعبة وفصل السيرفر (Combat Logging)',
      'سحب السلاح والرد بالرصاص دون أي تقدير للموقف',
      'b',
      1
    );

    insertQ.run(
      'ما هو تعريف القتل العشوائي (RDM) الممنوع في الخادم؟',
      'الاشتباك بعد سيناريو وعداوة ودافع رول بلاي مسبق',
      'قتل أي لاعب أو إطلاق النار عليه دون أي سيناريو أو سبب مسبق',
      'الدفاع عن النفس داخل مركز الشرطة',
      'التدريب في ميدان الرماية المخصص',
      'b',
      2
    );

    insertQ.run(
      'ما هو معنى الصدم العشوائي بالمركبة (VDM) الممنوع؟',
      'استخدام المركبة كسلاح لدهس أو صدم اللاعبين بشكل غير واقعي',
      'الوقوف في إشارة المرور والالتزام بالسرعة',
      'حادث تصادم بسيط والنزول لتبادل التأمين',
      'إيقاف المركبة في المواقف العامة',
      'a',
      3
    );

    insertQ.run(
      'ما هو التصرف الممنوع بموجب قانون (Metagaming)؟',
      'التحدث مع اللاعبين داخل السيرفر بالمايك',
      'استخدام معلومات تم الحصول عليها من بثوث ديسكورد أو تويتش داخل اللعبة',
      'شراء سيارة من المعرض الرسمي',
      'طلب الإسعاف عبر الهاتف باللعبة',
      'b',
      4
    );
  }

  // Seed default creators / roster if empty
  const cStmt = db.prepare('SELECT COUNT(*) as count FROM creators');
  const cCount = (cStmt.get() as any)?.count || 0;
  if (cCount === 0) {
    const insertC = db.prepare(`
      INSERT INTO creators (name, platform, channel_url, channel_id, avatar, followers, category, description, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertC.run(
      'RiftSniper',
      'kick',
      'https://kick.com/example',
      'riftsniper',
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&h=300&q=80',
      '45.2K',
      'GTA V Roleplay',
      'Daily GTA V Roleplay streamer in Rift State City.',
      1
    );
    insertC.run(
      'Falcon_RP',
      'twitch',
      'https://twitch.tv/example',
      'falcon_rp',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300&q=80',
      '88.5K',
      'LSPD & Undercover',
      'Senior Officer on patrol. High adrenaline pursuits.',
      2
    );
    insertC.run(
      'Sultan_Gamer',
      'youtube',
      'https://youtube.com/@example',
      'sultan_gamer',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&h=300&q=80',
      '120K',
      'Gangs & Heists',
      'تغطية سيناريوهات العصابات والسطو والحروب في لوس سانتوس.',
      3
    );
    insertC.run(
      'Bader_Live',
      'kick',
      'https://kick.com/example',
      'bader_live',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
      '34.8K',
      'Civilian Life & EMS',
      'سيناريوهات الحياة المدنية وتحديات يومية ممتعة في ريفت ستيت.',
      4
    );
  }

  // WIPE ANY PREVIOUS SEEDED DUMMY PLAYERS AS PER USER DIRECTIVE:
  // "وبالنسبة للـ leaderboard، أبغاك تشيل كل الأشخاص اللي فيها ولا تخلي أي أحد. عندما يرتبط مع السيرفر، أي شخص يدخل السيرفر يطلع اسمه هنا ويبدأ يحسب له عدد ساعاته."
  db.exec(`
    DELETE FROM players WHERE discord_id LIKE '1234567890%' OR player_name IN ('YASSTA LAVISTA', 'BRIMAN KEEF', 'CEKO PRT', 'SULTAN BRODZE', 'KAHLID ABDULAZIZ', 'ABU AJMI', 'BADER SHAMARI', 'SULTAN ALANAZI', 'MOHAMMED ALHARBI', 'THOMAS MCALLISTER');
    DELETE FROM player_sessions WHERE player_name IN ('YASSTA LAVISTA', 'BRIMAN KEEF', 'CEKO PRT', 'SULTAN BRODZE', 'KAHLID ABDULAZIZ', 'ABU AJMI', 'BADER SHAMARI', 'SULTAN ALANAZI', 'MOHAMMED ALHARBI', 'THOMAS MCALLISTER');
  `);
}

// -------------------------------------------------------------
// TEAM MEMBERS MANAGEMENT (Exact prompt specification: Empty by default)
// -------------------------------------------------------------
export function getTeamMembers() {
  const stmt = db.prepare('SELECT * FROM team_members ORDER BY id ASC');
  const rows = stmt.all() as any[];
  return rows.map((r) => ({
    id: `tm-${r.id}`,
    numericId: r.id,
    name: r.name,
    roleTitle: r.role_title,
    roleType: r.role_type,
    description: r.description || '',
    discordId: r.discord_id || '',
    avatar: r.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300&q=80',
    createdAt: r.created_at,
  }));
}

export function addTeamMember(data: {
  name: string;
  roleTitle: string;
  roleType: string;
  description?: string;
  discordId?: string;
  avatar?: string;
}) {
  const stmt = db.prepare(`
    INSERT INTO team_members (name, role_title, role_type, description, discord_id, avatar)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    data.name,
    data.roleTitle,
    data.roleType,
    data.description || '',
    data.discordId || '',
    data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300&q=80'
  );
  return { success: true, id: Number(info.lastInsertRowid) };
}

export function deleteTeamMember(id: number) {
  const stmt = db.prepare('DELETE FROM team_members WHERE id = ?');
  stmt.run(id);
  return { success: true };
}

// -------------------------------------------------------------
// STREAMERS MANAGEMENT (Real-time live status and viewers)
// -------------------------------------------------------------
export function getStreamers() {
  const stmt = db.prepare('SELECT * FROM streamers ORDER BY is_online DESC, viewers DESC, id ASC');
  const rows = stmt.all() as any[];
  return rows.map((r) => ({
    id: `st-${r.id}`,
    numericId: r.id,
    name: r.name,
    platform: r.platform,
    channelName: r.channel_name,
    channelUrl: r.channel_url || (r.platform === 'kick' ? `https://kick.com/${r.channel_name}` : `https://twitch.tv/${r.channel_name}`),
    title: r.title || `🔴 [RIFT STATE] ${r.name} Live`,
    viewers: r.viewers || 0,
    isOnline: Boolean(r.is_online),
    avatar: r.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&h=300&q=80',
    uptime: r.uptime || '',
    lastChecked: r.last_checked,
  }));
}

export function addStreamer(data: {
  name: string;
  platform?: string;
  channelName: string;
  channelUrl?: string;
  avatar?: string;
  title?: string;
  viewers?: number;
  isOnline?: boolean;
}) {
  let cleanChannel = (data.channelName || '').trim();
  let platform = (data.platform || 'twitch').toLowerCase();

  if (cleanChannel.includes('youtube.com') || cleanChannel.includes('youtu.be')) {
    platform = 'youtube';
  } else if (cleanChannel.includes('kick.com')) {
    platform = 'kick';
  } else if (cleanChannel.includes('twitch.tv')) {
    platform = 'twitch';
  }

  cleanChannel = cleanChannel
    .replace(/^https?:\/\/(www\.)?(twitch\.tv|kick\.com|youtube\.com\/@?)\//i, '')
    .replace(/\/.*$/, '')
    .trim();

  let channelUrl = data.channelUrl;
  if (!channelUrl) {
    if (platform === 'kick') channelUrl = `https://kick.com/${cleanChannel}`;
    else if (platform === 'youtube') channelUrl = `https://youtube.com/@${cleanChannel}`;
    else channelUrl = `https://twitch.tv/${cleanChannel}`;
  }

  const isOnline = data.isOnline ? 1 : 0;
  const viewers = Number(data.viewers || 0);
  const title = data.title || `🔴 [RIFT STATE] ${data.name} Live`;

  const stmt = db.prepare(`
    INSERT INTO streamers (name, platform, channel_name, channel_url, viewers, is_online, avatar, title)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    data.name,
    platform,
    cleanChannel,
    channelUrl,
    viewers,
    isOnline,
    data.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&h=300&q=80',
    title
  );
  return { success: true, id: Number(info.lastInsertRowid), channel: cleanChannel, platform };
}

export function updateStreamerLive(id: number, isOnline: boolean, viewers = 0, title?: string, uptime?: string) {
  const stmt = db.prepare(`
    UPDATE streamers
    SET
      is_online = ?,
      viewers = ?,
      title = COALESCE(?, title),
      uptime = COALESCE(?, uptime),
      last_checked = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(isOnline ? 1 : 0, viewers, title || null, uptime || null, id);
  return { success: true };
}

export function deleteStreamer(id: number) {
  const stmt = db.prepare('DELETE FROM streamers WHERE id = ?');
  stmt.run(id);
  return { success: true };
}

// -------------------------------------------------------------
// CREATOR ROSTER MANAGEMENT (صناع المحتوى)
// -------------------------------------------------------------
export function getCreators() {
  const stmt = db.prepare('SELECT * FROM creators ORDER BY sort_order ASC, id ASC');
  const rows = stmt.all() as any[];
  return rows.map((r) => ({
    id: `cr-${r.id}`,
    numericId: r.id,
    name: r.name,
    platform: r.platform || 'kick',
    channelUrl: r.channel_url || '',
    channelId: r.channel_id || '',
    avatar: r.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300&q=80',
    followers: r.followers || '10K',
    category: r.category || 'GTA V Roleplay',
    description: r.description || 'صانع محتوى معتمد في سيرفر RIFT STATE.',
    sortOrder: r.sort_order || 0,
    createdAt: r.created_at,
  }));
}

export function addCreator(data: {
  name: string;
  platform?: string;
  channelUrl: string;
  channelId?: string;
  avatar?: string;
  followers?: string;
  category?: string;
  description?: string;
  sortOrder?: number;
}) {
  const stmt = db.prepare(`
    INSERT INTO creators (name, platform, channel_url, channel_id, avatar, followers, category, description, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    data.name,
    data.platform || 'kick',
    data.channelUrl,
    data.channelId || '',
    data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300&q=80',
    data.followers || '10K',
    data.category || 'GTA V Roleplay',
    data.description || 'صانع محتوى معتمد في سيرفر RIFT STATE.',
    data.sortOrder || 0
  );
  return { success: true, id: Number(info.lastInsertRowid) };
}

export function updateCreator(
  id: number,
  data: {
    name: string;
    platform?: string;
    channelUrl: string;
    channelId?: string;
    avatar?: string;
    followers?: string;
    category?: string;
    description?: string;
    sortOrder?: number;
  }
) {
  const stmt = db.prepare(`
    UPDATE creators
    SET
      name = ?,
      platform = ?,
      channel_url = ?,
      channel_id = ?,
      avatar = ?,
      followers = ?,
      category = ?,
      description = ?,
      sort_order = ?
    WHERE id = ?
  `);
  stmt.run(
    data.name,
    data.platform || 'kick',
    data.channelUrl,
    data.channelId || '',
    data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300&q=80',
    data.followers || '10K',
    data.category || 'GTA V Roleplay',
    data.description || 'صانع محتوى معتمد في سيرفر RIFT STATE.',
    data.sortOrder || 0,
    id
  );
  return { success: true };
}

export function deleteCreator(id: number) {
  const stmt = db.prepare('DELETE FROM creators WHERE id = ?');
  stmt.run(id);
  return { success: true };
}

// -------------------------------------------------------------
// LEADERBOARD QUERIES (Exact prompt specification)
// -------------------------------------------------------------

/**
 * 2. كود المتصدرين
 * SELECT player_name, discord_id, steam_id, total_playtime
 * FROM players WHERE total_playtime > 0 ORDER BY total_playtime DESC LIMIT 10
 */
export function getLeaderboard(limit = 10) {
  const stmt = db.prepare(`
    SELECT
      player_name,
      discord_id,
      steam_id,
      total_playtime
    FROM players
    WHERE total_playtime > 0
    ORDER BY total_playtime DESC
    LIMIT ?
  `);

  const rows = stmt.all(limit) as any[];

  return rows.map((row, index) => ({
    rank: index + 1,
    name: row.player_name,
    discord_id: row.discord_id,
    steam_id: row.steam_id,
    seconds: row.total_playtime,
    hours: Math.round((row.total_playtime / 3600) * 100) / 100,
  }));
}

/**
 * 4. المتصدر الأسبوعي
 * SELECT player_name, discord_id, SUM(duration) AS seconds
 * FROM player_sessions
 * WHERE joined_at >= datetime('now', '-7 days')
 * GROUP BY player_id
 * ORDER BY seconds DESC LIMIT 10
 */
export function getWeeklyLeaderboard(limit = 10) {
  const stmt = db.prepare(`
    SELECT
      player_name,
      discord_id,
      SUM(duration) AS seconds
    FROM player_sessions
    WHERE joined_at >= datetime('now', '-7 days')
    GROUP BY player_name, discord_id
    ORDER BY seconds DESC
    LIMIT ?
  `);

  let rows = stmt.all(limit) as any[];

  // Fallback to weekly_playtime from players table if no sessions in last 7 days
  if (!rows || rows.length === 0) {
    const fallbackStmt = db.prepare(`
      SELECT
        player_name,
        discord_id,
        weekly_playtime AS seconds
      FROM players
      WHERE weekly_playtime > 0
      ORDER BY weekly_playtime DESC
      LIMIT ?
    `);
    rows = fallbackStmt.all(limit) as any[];
  }

  return rows.map((row, i) => ({
    rank: i + 1,
    name: row.player_name,
    discord_id: row.discord_id,
    hours: Math.round(((row.seconds || 0) / 3600) * 100) / 100,
    seconds: row.seconds || 0,
  }));
}

// -------------------------------------------------------------
// PLAYTIME & SESSION TRACKING (Exact prompt specification)
// -------------------------------------------------------------

/**
 * 3. حساب ساعات التواجد: عند دخول اللاعب
 */
export function playerJoined(
  playerId: string,
  name: string,
  discordId?: string,
  steamId?: string
) {
  const now = new Date().toISOString();

  // Close any orphaned session for this player first
  const closeOrphan = db.prepare(`
    UPDATE player_sessions
    SET left_at = ?, duration = 0
    WHERE player_id = ? AND left_at IS NULL
  `);
  closeOrphan.run(now, playerId);

  // Insert new session
  const insertSession = db.prepare(`
    INSERT INTO player_sessions
    (
      player_id,
      player_name,
      discord_id,
      steam_id,
      joined_at
    )
    VALUES (?, ?, ?, ?, ?)
  `);
  insertSession.run(playerId, name, discordId || null, steamId || null, now);

  // Ensure player exists in players table
  const upsertPlayer = db.prepare(`
    INSERT INTO players (discord_id, steam_id, player_name, last_seen)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(discord_id) DO UPDATE SET
      player_name = excluded.player_name,
      steam_id = COALESCE(excluded.steam_id, players.steam_id),
      last_seen = excluded.last_seen,
      updated_at = CURRENT_TIMESTAMP
  `);

  const dId = discordId || `guest_${playerId}`;
  upsertPlayer.run(dId, steamId || null, name, now);

  return { success: true, joinedAt: now };
}

/**
 * 3. حساب ساعات التواجد: عند الخروج
 */
export function playerLeft(playerId: string) {
  const stmt = db.prepare(`
    SELECT *
    FROM player_sessions
    WHERE player_id = ?
    AND left_at IS NULL
    ORDER BY joined_at DESC
    LIMIT 1
  `);

  const session = stmt.get(playerId) as any;
  if (!session) {
    return { success: false, message: 'No active session found' };
  }

  const now = new Date();
  const joinedDate = new Date(session.joined_at);
  const duration = Math.max(1, Math.floor((now.getTime() - joinedDate.getTime()) / 1000));
  const nowIso = now.toISOString();

  const updateSession = db.prepare(`
    UPDATE player_sessions
    SET
      left_at = ?,
      duration = ?
    WHERE id = ?
  `);
  updateSession.run(nowIso, duration, session.id);

  // Update total, weekly, and monthly playtime in players table
  const updatePlayer = db.prepare(`
    UPDATE players
    SET
      total_playtime = total_playtime + ?,
      weekly_playtime = weekly_playtime + ?,
      monthly_playtime = monthly_playtime + ?,
      last_seen = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE (discord_id = ? AND discord_id IS NOT NULL) OR player_name = ?
  `);
  updatePlayer.run(duration, duration, duration, nowIso, session.discord_id, session.player_name);

  return {
    success: true,
    sessionId: session.id,
    durationSeconds: duration,
    durationHours: Math.round((duration / 3600) * 100) / 100,
  };
}

// -------------------------------------------------------------
// 5. SERVER HEARTBEAT & STATUS
// -------------------------------------------------------------
export function updateServerHeartbeat(players: number, maxPlayers: number) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO server_status (id, online_players, max_players, last_heartbeat, online)
    VALUES (1, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      online_players = excluded.online_players,
      max_players = excluded.max_players,
      last_heartbeat = excluded.last_heartbeat,
      online = 1
  `);
  stmt.run(players, maxPlayers, now);
  return { success: true, timestamp: now };
}

export function getServerStatus() {
  const stmt = db.prepare('SELECT * FROM server_status WHERE id = 1');
  const row = stmt.get() as any;
  if (!row) {
    return {
      players: 47,
      max_players: 48,
      online: true,
      last_heartbeat: new Date().toISOString(),
    };
  }
  return {
    players: row.online_players,
    max_players: row.max_players,
    online: Boolean(row.online),
    last_heartbeat: row.last_heartbeat,
  };
}

// -------------------------------------------------------------
// 8, 9, 10, 11. WHITELIST QUESTIONS MANAGEMENT
// -------------------------------------------------------------
export function getWhitelistQuestions(onlyEnabled = true) {
  const sql = onlyEnabled
    ? 'SELECT * FROM whitelist_questions WHERE enabled = 1 ORDER BY sort_order ASC, id ASC'
    : 'SELECT * FROM whitelist_questions ORDER BY sort_order ASC, id ASC';
  const stmt = db.prepare(sql);
  return stmt.all() as any[];
}

export function addWhitelistQuestion(data: {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  sort_order?: number;
  enabled?: boolean;
}) {
  const maxOrderStmt = db.prepare('SELECT MAX(sort_order) as maxOrder FROM whitelist_questions');
  const maxOrder = ((maxOrderStmt.get() as any)?.maxOrder || 0) + 1;
  const sortOrder = data.sort_order !== undefined ? data.sort_order : maxOrder;

  const stmt = db.prepare(`
    INSERT INTO whitelist_questions
    (
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      sort_order,
      enabled
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    data.question,
    data.option_a,
    data.option_b,
    data.option_c,
    data.option_d,
    data.correct_answer.toLowerCase(),
    sortOrder,
    data.enabled !== false ? 1 : 0
  );

  return { success: true, id: Number(info.lastInsertRowid) };
}

export function updateWhitelistQuestion(
  id: number,
  data: Partial<{
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
    sort_order: number;
    enabled: boolean;
  }>
) {
  const currentStmt = db.prepare('SELECT * FROM whitelist_questions WHERE id = ?');
  const current = currentStmt.get(id) as any;
  if (!current) return { success: false, error: 'Question not found' };

  const question = data.question !== undefined ? data.question : current.question;
  const option_a = data.option_a !== undefined ? data.option_a : current.option_a;
  const option_b = data.option_b !== undefined ? data.option_b : current.option_b;
  const option_c = data.option_c !== undefined ? data.option_c : current.option_c;
  const option_d = data.option_d !== undefined ? data.option_d : current.option_d;
  const correct_answer = data.correct_answer !== undefined ? data.correct_answer.toLowerCase() : current.correct_answer;
  const sort_order = data.sort_order !== undefined ? data.sort_order : current.sort_order;
  const enabled = data.enabled !== undefined ? (data.enabled ? 1 : 0) : current.enabled;

  const stmt = db.prepare(`
    UPDATE whitelist_questions
    SET
      question = ?,
      option_a = ?,
      option_b = ?,
      option_c = ?,
      option_d = ?,
      correct_answer = ?,
      sort_order = ?,
      enabled = ?
    WHERE id = ?
  `);

  stmt.run(question, option_a, option_b, option_c, option_d, correct_answer, sort_order, enabled, id);
  return { success: true };
}

export function deleteWhitelistQuestion(questionId: number) {
  const stmt = db.prepare('DELETE FROM whitelist_questions WHERE id = ?');
  stmt.run(questionId);
  return { success: true };
}

/**
 * 11. تحريك السؤال فوق وتحت (Move question UP or DOWN)
 */
export function moveWhitelistQuestion(questionId: number, direction: 'up' | 'down') {
  const questionStmt = db.prepare('SELECT * FROM whitelist_questions WHERE id = ?');
  const question = questionStmt.get(questionId) as any;

  if (!question) {
    return { success: false, error: 'Question not found' };
  }

  let other: any = null;
  if (direction === 'up') {
    const otherStmt = db.prepare(`
      SELECT *
      FROM whitelist_questions
      WHERE sort_order < ?
      ORDER BY sort_order DESC
      LIMIT 1
    `);
    other = otherStmt.get(question.sort_order);
  } else {
    const otherStmt = db.prepare(`
      SELECT *
      FROM whitelist_questions
      WHERE sort_order > ?
      ORDER BY sort_order ASC
      LIMIT 1
    `);
    other = otherStmt.get(question.sort_order);
  }

  if (other) {
    const updateStmt = db.prepare(`
      UPDATE whitelist_questions
      SET sort_order = ?
      WHERE id = ?
    `);

    // Swap sort_order
    updateStmt.run(other.sort_order, question.id);
    updateStmt.run(question.sort_order, other.id);
  }

  return { success: true };
}

// Bulk sync from FiveM server database or Python API
export function syncPlayersBatch(playersList: Array<{
  discord_id?: string;
  steam_id?: string;
  player_name: string;
  total_playtime: number;
  weekly_playtime?: number;
  monthly_playtime?: number;
  last_seen?: string;
}>) {
  const insertOrUpdate = db.prepare(`
    INSERT INTO players (discord_id, steam_id, player_name, total_playtime, weekly_playtime, monthly_playtime, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(discord_id) DO UPDATE SET
      steam_id = COALESCE(excluded.steam_id, players.steam_id),
      player_name = excluded.player_name,
      total_playtime = excluded.total_playtime,
      weekly_playtime = excluded.weekly_playtime,
      monthly_playtime = excluded.monthly_playtime,
      last_seen = excluded.last_seen,
      updated_at = CURRENT_TIMESTAMP
  `);

  let count = 0;
  for (const p of playersList) {
    const discordId = p.discord_id || `steam_${p.steam_id || p.player_name}`;
    insertOrUpdate.run(
      discordId,
      p.steam_id || null,
      p.player_name,
      p.total_playtime || 0,
      p.weekly_playtime || Math.floor((p.total_playtime || 0) * 0.15),
      p.monthly_playtime || Math.floor((p.total_playtime || 0) * 0.5),
      p.last_seen || new Date().toISOString()
    );
    count++;
  }

  return { success: true, syncedCount: count };
}

// Total count of registered players in database
export function getTotalPlayersCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM players');
  return (stmt.get() as any)?.count || 0;
}

// List players with search
export function searchPlayers(query = ''): any[] {
  if (!query) {
    const stmt = db.prepare('SELECT * FROM players ORDER BY total_playtime DESC LIMIT 100');
    return stmt.all() as any[];
  }
  const term = `%${query}%`;
  const stmt = db.prepare(`
    SELECT * FROM players
    WHERE player_name LIKE ? OR discord_id LIKE ? OR steam_id LIKE ?
    ORDER BY total_playtime DESC
    LIMIT 50
  `);
  return stmt.all(term, term, term) as any[];
}

// -------------------------------------------------------------
// SITE SETTINGS PERSISTENCE
// -------------------------------------------------------------
export function getSiteSettings(): any {
  const stmt = db.prepare('SELECT settings_json FROM site_settings WHERE id = 1');
  const row = stmt.get() as any;
  const defaults = {
    siteName: 'RIFT STATE',
    tagline: 'THE GTA RP IN THE MIDDLE EAST',
    heroTitle: 'RIFT STATE',
    heroSubtitle: 'The most immersive GTA V roleplay experience. Join 300,000+ players in a world of adventure, drama, and unforgettable stories.',
    logoUrl: '/logo.png',
    cfxJoinUrl: 'https://cfx.re/join/hlcrp',
    discordUrl: 'https://discord.gg/riftstate',
    twitterUrl: 'https://x.com/riftstate',
    storeUrl: 'https://store.riftstate.net',
    location: 'Saudi Arabia / Riyadh',
    website: 'https://riftstate.net',
    email: 'support@riftstate.net',
    ownerRoleId: '123456789012345678',
    discordGuildId: '987654321098765432',
    customDiscordRedirectUri: '',
    customSteamReturnUrl: '',
    whitelistReviewerRoleId: '223344556677889900', // رتبة المشرفين المراجعين للتقديمات فقط
    whitelistAcceptedRoleId: '112233445566778899', // رتبة المقبولين في الوايت لست
    whitelistRejectedRoleId: '998877665544332211',
    fivemServerIp: 'play.hlcrp.net:30120',
    fivemApiSecret: '',
    socialLinks: {
      youtube: { enabled: true, url: 'https://youtube.com/@riftstate' },
      tiktok: { enabled: true, url: 'https://tiktok.com/@riftstate' },
      instagram: { enabled: true, url: 'https://instagram.com/riftstate' },
      twitter: { enabled: true, url: 'https://x.com/riftstate' },
      discord: { enabled: true, url: 'https://discord.gg/riftstate' },
      kick: { enabled: true, url: 'https://kick.com/riftstate' },
      twitch: { enabled: true, url: 'https://twitch.tv/riftstate' },
    },
    heroButtons: {
      playNow: { enabled: true, label: 'PLAY NOW', url: 'https://cfx.re/join/hlcrp' },
      joinNow: { enabled: true, label: 'JOIN NOW', url: '/whitelist' },
      learnMore: { enabled: true, label: 'LEARN MORE', url: 'connect_modal' },
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
    discordWebhook: {
      enabled: false,
      webhookUrl: '',
      botToken: '',
      channelId: '',
      sendMode: 'webhook', // 'webhook' | 'bot' | 'both'
      channelName: '#تقديمات-الاختبار-الإلكتروني',
      mentionRole: '@here',
      customMessage: '🔔 شخص جديد قدّم على الاختبار الإلكتروني وبانتظار قرار الإدارة!',
      embedTitle: '📋 تقديم جديد في الاختبار الإلكتروني - RIFT STATE',
      embedColor: '#8b5cf6',
      showCharacterName: true,
      showDiscordId: true,
      showSteamHex: true,
      showAnswers: true,
      showScore: true,
      showDate: true,
      includeActionButtons: true,
    },
  };

  if (!row?.settings_json) {
    return defaults;
  }
  try {
    const parsed = JSON.parse(row.settings_json);
    return {
      ...defaults,
      ...parsed,
      socialLinks: { ...defaults.socialLinks, ...(parsed.socialLinks || {}) },
      heroButtons: { ...defaults.heroButtons, ...(parsed.heroButtons || {}) },
      navbarSettings: { ...defaults.navbarSettings, ...(parsed.navbarSettings || {}) },
      footerSettings: { ...defaults.footerSettings, ...(parsed.footerSettings || {}) },
      discordWebhook: { ...defaults.discordWebhook, ...(parsed.discordWebhook || {}) },
    };
  } catch {
    return defaults;
  }
}

export function updateSiteSettings(settings: any): { success: boolean } {
  const jsonStr = JSON.stringify(settings);
  const stmt = db.prepare(`
    INSERT INTO site_settings (id, settings_json, updated_at)
    VALUES (1, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      settings_json = excluded.settings_json,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(jsonStr);
  return { success: true };
}

// -------------------------------------------------------------
// FAQ ITEMS PERSISTENCE
// -------------------------------------------------------------
export function getFaqList(): any[] {
  const stmt = db.prepare('SELECT * FROM faq_items ORDER BY sort_order ASC, id ASC');
  const rows = stmt.all() as any[];
  return rows || [];
}

export function addFaqItem(data: { question: string; answer: string; category?: string; sort_order?: number }) {
  const stmt = db.prepare(`
    INSERT INTO faq_items (question, answer, category, sort_order)
    VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(data.question, data.answer, data.category || 'عام', data.sort_order || 0);
  return { success: true, id: Number(info.lastInsertRowid) };
}

export function deleteFaqItem(id: number | string) {
  const stmt = db.prepare('DELETE FROM faq_items WHERE id = ?');
  stmt.run(Number(id));
  return { success: true };
}

// -------------------------------------------------------------
// JOBS PERSISTENCE
// -------------------------------------------------------------
export function getJobsList(): any[] {
  const stmt = db.prepare('SELECT * FROM jobs ORDER BY id ASC');
  const rows = stmt.all() as any[];
  return rows || [];
}

export function addJobItem(data: { title: string; department: string; salary?: string; description?: string; icon?: string; requirements?: string; openings?: number }) {
  const stmt = db.prepare(`
    INSERT INTO jobs (title, department, salary, description, icon, requirements, openings)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    data.title,
    data.department,
    data.salary || '$3,000 / ساعة',
    data.description || '',
    data.icon || 'Briefcase',
    data.requirements || '',
    data.openings || 1
  );
  return { success: true, id: Number(info.lastInsertRowid) };
}

export function deleteJobItem(id: number | string) {
  const stmt = db.prepare('DELETE FROM jobs WHERE id = ?');
  stmt.run(Number(id));
  return { success: true };
}

// -------------------------------------------------------------
// WHITELIST APPLICATIONS PERSISTENCE
// -------------------------------------------------------------
export function getWhitelistApplications(): any[] {
  const stmt = db.prepare('SELECT * FROM whitelist_applications ORDER BY created_at DESC');
  const rows = stmt.all() as any[];
  return rows.map((r) => {
    let answers = [];
    try {
      answers = r.answers_json ? JSON.parse(r.answers_json) : [];
    } catch {}
    return {
      id: r.id,
      discordId: r.discord_id,
      discordTag: r.discord_tag,
      steamHex: r.steam_hex,
      characterName: r.character_name,
      characterStory: r.character_story,
      answers,
      status: r.status,
      reviewerName: r.reviewer_name,
      reviewedAt: r.reviewed_at,
      submittedAt: r.created_at,
      roleGiven: Boolean(r.role_given),
      roleGivenAt: r.role_given_at || null,
      roleId: r.role_id || null,
      discordMessageId: r.discord_message_id || null,
    };
  });
}

export function addWhitelistApplication(data: {
  id?: string;
  discordId: string;
  discordTag: string;
  steamHex?: string;
  characterName: string;
  characterStory?: string;
  answers: any[];
  status?: string;
  discordMessageId?: string;
}) {
  const appId = data.id || `WL-${Date.now().toString().slice(-4)}`;
  const answersJson = JSON.stringify(data.answers || []);
  const stmt = db.prepare(`
    INSERT INTO whitelist_applications (id, discord_id, discord_tag, steam_hex, character_name, character_story, answers_json, status, discord_message_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      answers_json = excluded.answers_json,
      status = excluded.status,
      discord_message_id = COALESCE(excluded.discord_message_id, whitelist_applications.discord_message_id)
  `);
  stmt.run(
    appId,
    data.discordId,
    data.discordTag,
    data.steamHex || 'steam:unknown',
    data.characterName,
    data.characterStory || 'New Citizen',
    answersJson,
    data.status || 'pending',
    data.discordMessageId || null
  );
  return { success: true, id: appId };
}

export function updateWhitelistApplicationStatus(
  id: string,
  status: string,
  reviewerName = 'Owner Staff',
  roleGiven = false,
  roleId = '',
  discordMessageId?: string
) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE whitelist_applications
    SET status = ?,
        reviewer_name = ?,
        reviewed_at = ?,
        role_given = CASE WHEN ? = 1 THEN 1 ELSE role_given END,
        role_given_at = CASE WHEN ? = 1 THEN ? ELSE role_given_at END,
        role_id = CASE WHEN ? != '' THEN ? ELSE role_id END,
        discord_message_id = COALESCE(?, discord_message_id)
    WHERE id = ?
  `);
  stmt.run(
    status,
    reviewerName,
    now,
    roleGiven ? 1 : 0,
    roleGiven ? 1 : 0,
    now,
    roleId || '',
    roleId || '',
    discordMessageId || null,
    id
  );
  return { success: true, id, status, roleGiven, roleId };
}

// -------------------------------------------------------------
// CHARACTERS & FIVEM PROFILE PERSISTENCE
// -------------------------------------------------------------
export function getCharactersByDiscord(discordId: string): any[] {
  const stmt = db.prepare('SELECT * FROM characters WHERE discord_id = ? AND is_active = 1');
  const rows = stmt.all(discordId) as any[];
  return rows.map((r) => {
    let inventory = [];
    let location = { x: -268.4, y: -957.9, z: 31.2, street: 'Legion Square' };
    try {
      if (r.inventory_json) inventory = JSON.parse(r.inventory_json);
      if (r.last_location_json) location = JSON.parse(r.last_location_json);
    } catch {}
    return {
      id: r.id,
      citizenid: r.citizenid,
      discordId: r.discord_id,
      steamId: r.steam_id,
      characterName: r.character_name,
      cash: r.cash,
      bank: r.bank,
      job: r.job,
      jobGrade: r.job_grade,
      phone: r.phone,
      inventory,
      lastLocation: location,
    };
  });
}

export function saveCharacter(data: {
  citizenid: string;
  discordId: string;
  steamId?: string;
  characterName: string;
  cash?: number;
  bank?: number;
  job?: string;
  jobGrade?: number;
  phone?: string;
  inventory?: any[];
  lastLocation?: any;
}) {
  const invStr = JSON.stringify(data.inventory || []);
  const locStr = JSON.stringify(data.lastLocation || { x: -268.4, y: -957.9, z: 31.2, street: 'Legion Square' });
  const stmt = db.prepare(`
    INSERT INTO characters (citizenid, discord_id, steam_id, character_name, cash, bank, job, job_grade, phone, inventory_json, last_location_json, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(citizenid) DO UPDATE SET
      character_name = excluded.character_name,
      cash = excluded.cash,
      bank = excluded.bank,
      job = excluded.job,
      job_grade = excluded.job_grade,
      phone = excluded.phone,
      inventory_json = excluded.inventory_json,
      last_location_json = excluded.last_location_json
  `);
  stmt.run(
    data.citizenid,
    data.discordId,
    data.steamId || null,
    data.characterName,
    data.cash !== undefined ? data.cash : 5000,
    data.bank !== undefined ? data.bank : 25000,
    data.job || 'مواطن',
    data.jobGrade || 1,
    data.phone || '555-0199',
    invStr,
    locStr
  );
  return { success: true, citizenid: data.citizenid };
}

// -------------------------------------------------------------
// REGISTERED ACCOUNTS & ONBOARDING ANALYTICS
// -------------------------------------------------------------
export function recordAccountLogin(data: {
  discordId: string;
  username?: string;
  globalName?: string;
  avatar?: string;
  email?: string;
}) {
  const stmt = db.prepare(`
    INSERT INTO registered_accounts (discord_id, username, global_name, avatar, email, first_login, last_login, login_count)
    VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'), 1)
    ON CONFLICT(discord_id) DO UPDATE SET
      username = coalesce(nullif(excluded.username, ''), registered_accounts.username),
      global_name = coalesce(nullif(excluded.global_name, ''), registered_accounts.global_name),
      avatar = coalesce(nullif(excluded.avatar, ''), registered_accounts.avatar),
      email = coalesce(nullif(excluded.email, ''), registered_accounts.email),
      last_login = datetime('now'),
      login_count = registered_accounts.login_count + 1
  `);
  stmt.run(data.discordId, data.username || '', data.globalName || '', data.avatar || '', data.email || '');
}

export function getAccountStats() {
  const totalStmt = db.prepare('SELECT COUNT(*) as count FROM registered_accounts');
  const total = (totalStmt.get() as any)?.count || 0;

  // الحسابات المسجلة أو النشطة في آخر 18 يوم (حسب طلب المستخدم بدقة)
  const recentStmt = db.prepare(`
    SELECT COUNT(*) as count FROM registered_accounts
    WHERE last_login >= datetime('now', '-18 days')
  `);
  const recent = (recentStmt.get() as any)?.count || 0;

  // الحسابات المسجلة مع تفاصيلها
  const listStmt = db.prepare(`
    SELECT discord_id, username, global_name, avatar, email, first_login, last_login, login_count
    FROM registered_accounts
    ORDER BY last_login DESC
    LIMIT 100
  `);
  const accounts = (listStmt.all() as any[]).map(a => ({
    discordId: a.discord_id,
    username: a.username,
    globalName: a.global_name || a.username,
    avatar: a.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    email: a.email,
    firstLogin: a.first_login,
    lastLogin: a.last_login,
    loginCount: a.login_count,
  }));

  // إحصائيات اختبار الرول بلاي
  const appsStmt = db.prepare('SELECT status, COUNT(*) as count FROM whitelist_applications GROUP BY status');
  const appCounts = (appsStmt.all() as any[]) || [];
  const testStats = {
    total: 0,
    accepted: 0,
    rejected: 0,
    pending: 0,
  };
  for (const row of appCounts) {
    if (row.status === 'accepted') testStats.accepted += row.count;
    else if (row.status === 'rejected') testStats.rejected += row.count;
    else testStats.pending += row.count;
    testStats.total += row.count;
  }

  return {
    totalAccounts: total,
    activeLast18Days: recent,
    accounts,
    testStats,
  };
}

export function deleteAccount(discordId: string) {
  const stmt = db.prepare('DELETE FROM registered_accounts WHERE discord_id = ?');
  stmt.run(discordId);
  return getAccountStats();
}

export function resetAccounts() {
  db.exec('DELETE FROM registered_accounts;');
  return getAccountStats();
}


