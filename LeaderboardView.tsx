import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Clock, 
  Heart, 
  Briefcase, 
  Shield, 
  Medal, 
  Crown, 
  Sparkles,
  Server
} from 'lucide-react';
import { Language } from '../types';

interface HeroCard {
  name: string;
  role: string;
  note?: string;
  points?: string;
  avatar?: string;
  assigned?: boolean;
  isPlaceholder?: boolean;
}

interface JobRow {
  rank: number;
  name: string;
  job: string;
  level: number;
  bonus: string | null;
  avatar: string;
}

interface TopHoursPodium {
  rank: number;
  name: string;
  role: string;
  timeString: string;
  hours: number;
  avatar: string;
}

interface TopHoursRow {
  rank: number;
  name: string;
  timeString: string;
  hours: number;
  percentage: number;
  avatar: string;
}

interface ShowcaseData {
  heroes: {
    week_reset_timer: string;
    cop_of_the_week: HeroCard;
    medic_of_the_week: HeroCard;
    employee_of_the_week: HeroCard;
  };
  top_jobs: JobRow[];
  top_hours_podium: TopHoursPodium[];
  top_hours_list: TopHoursRow[];
  countdown_timer: string;
}

interface LeaderboardViewProps {
  lang: Language;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ lang }) => {
  const [data, setData] = useState<ShowcaseData | null>(null);

  const fetchShowcase = async () => {
    try {
      const res = await fetch('/api/leaderboard/showcase');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchShowcase();
    // Poll every 15s for live player hours sync from server
    const interval = setInterval(fetchShowcase, 15000);
    return () => clearInterval(interval);
  }, []);

  const heroes = data?.heroes || {
    week_reset_timer: '423:46:54',
    cop_of_the_week: {
      name: 'ما تحدد للحين',
      role: 'LSPD',
      note: 'لم يتم التعيين بعد',
      assigned: false,
      isPlaceholder: true,
    },
    medic_of_the_week: {
      name: 'ما تحدد للحين',
      role: 'EMS',
      note: 'لم يتم التعيين بعد',
      assigned: false,
      isPlaceholder: true,
    },
    employee_of_the_week: {
      name: 'ما تحدد للحين',
      role: 'Civilian',
      points: '0 نقطة',
      assigned: false,
      isPlaceholder: true,
    },
  };

  const topJobs = data?.top_jobs || [];
  const topPodium = data?.top_hours_podium || [];
  const topList = data?.top_hours_list || [];

  const firstPlace = topPodium.find(p => p.rank === 1);
  const secondPlace = topPodium.find(p => p.rank === 2);
  const thirdPlace = topPodium.find(p => p.rank === 3);

  const hasPodium = Boolean(firstPlace);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-arabic text-neutral-100">
      {/* 1. Header Section */}
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className="w-12 h-12 rounded-full border border-red-600/50 bg-red-950/20 text-red-500 flex items-center justify-center shadow-lg shadow-red-900/20">
          <Trophy className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
          المتصدرين
        </h1>
        <p className="text-xs text-neutral-400">
          اكثر اللاعبين ساعات هالاسبوع وابطال الاسبوع (مربوط مباشرة مع قاعدة بيانات السيرفر)
        </p>
      </div>

      {/* 2. ابطال الاسبوع Section */}
      <div className="space-y-4">
        {/* Title bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-black text-lg">
            <div className="w-5 h-5 rounded-md bg-red-600/20 border border-red-600/50 text-red-500 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 fill-current" />
            </div>
            <span>ابطال الاسبوع</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11px] font-mono text-neutral-400">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>يتجدد الاسبوع بعد {heroes.week_reset_timer}</span>
          </div>
        </div>

        {/* 3 Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: شرطي الاسبوع */}
          <div className="p-5 bg-neutral-950 border border-neutral-850 rounded-2xl relative flex items-center justify-between shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-[11px] font-bold text-neutral-200 bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded-lg">
                  <Shield className="w-3 h-3 text-blue-400" />
                  <span>شرطي الاسبوع</span>
                </span>
                <Trophy className="w-3.5 h-3.5 text-neutral-500" />
              </div>

              <div className="space-y-0.5 pt-1">
                <div className="font-black text-white text-base tracking-wide uppercase font-mono">
                  {heroes.cop_of_the_week.name}
                </div>
                <div className="text-[11px] text-neutral-400 font-mono font-bold">
                  {heroes.cop_of_the_week.role}
                </div>
              </div>

              <div className="text-[10px] text-neutral-500 font-mono pt-1">
                {heroes.cop_of_the_week.note || 'لم يتم التعيين بعد'}
              </div>
            </div>

            <div className="w-16 h-16 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0 flex items-center justify-center">
              {heroes.cop_of_the_week.avatar ? (
                <img
                  src={heroes.cop_of_the_week.avatar}
                  alt={heroes.cop_of_the_week.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Shield className="w-7 h-7 text-neutral-700 stroke-1" />
              )}
            </div>
          </div>

          {/* Card 2: مسعف الاسبوع */}
          <div className="p-5 bg-neutral-950 border border-neutral-850 rounded-2xl relative flex items-center justify-between shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-[11px] font-bold text-neutral-200 bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded-lg">
                  <Heart className="w-3 h-3 text-red-500" />
                  <span>مسعف الاسبوع</span>
                </span>
                <Trophy className="w-3.5 h-3.5 text-neutral-500" />
              </div>

              <div className="space-y-0.5 pt-1">
                <div className="font-black text-white text-base tracking-wide uppercase font-mono">
                  {heroes.medic_of_the_week.name}
                </div>
                <div className="text-[11px] text-neutral-400 font-mono font-bold">
                  {heroes.medic_of_the_week.role}
                </div>
              </div>

              <div className="text-[10px] text-neutral-500 font-mono pt-1">
                {heroes.medic_of_the_week.note || 'لم يتم التعيين بعد'}
              </div>
            </div>

            <div className="w-16 h-16 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0 flex items-center justify-center">
              {heroes.medic_of_the_week.avatar ? (
                <img
                  src={heroes.medic_of_the_week.avatar}
                  alt={heroes.medic_of_the_week.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Heart className="w-7 h-7 text-neutral-700 stroke-1" />
              )}
            </div>
          </div>

          {/* Card 3: موظف الاسبوع */}
          <div className="p-5 bg-neutral-950 border border-neutral-850 rounded-2xl relative flex items-center justify-between shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-[11px] font-bold text-neutral-200 bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded-lg">
                  <Briefcase className="w-3 h-3 text-red-400" />
                  <span>موظف الاسبوع</span>
                </span>
                <Trophy className="w-3.5 h-3.5 text-neutral-500" />
              </div>

              <div className="space-y-0.5 pt-1">
                <div className="font-black text-white text-base tracking-wide uppercase font-mono">
                  {heroes.employee_of_the_week.name}
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  {heroes.employee_of_the_week.role}
                </div>
              </div>

              <div className="pt-1">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-red-950/60 border border-red-900/60 text-red-400 text-[10px] font-mono font-bold">
                  {heroes.employee_of_the_week.points || '0 نقطة'}
                </span>
              </div>
            </div>

            <div className="w-16 h-16 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0 flex items-center justify-center">
              {heroes.employee_of_the_week.avatar ? (
                <img
                  src={heroes.employee_of_the_week.avatar}
                  alt={heroes.employee_of_the_week.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Briefcase className="w-7 h-7 text-neutral-700 stroke-1" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. اعلى الساعات Section */}
      <div className="space-y-6 pt-4">
        {/* Title bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-black text-lg">
            <div className="w-5 h-5 rounded-md bg-red-600/20 border border-red-600/50 text-red-500 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 fill-current" />
            </div>
            <span>اعلى الساعات هالاسبوع</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11px] font-mono text-neutral-400">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>يتحدث الترتيب تلقائياً مع السيرفر</span>
          </div>
        </div>

        {/* Empty state or Podium */}
        {!hasPodium ? (
          <div className="p-12 sm:p-16 rounded-3xl border border-dashed border-neutral-800/80 bg-neutral-950/60 text-center space-y-4 backdrop-blur-md">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-amber-500/80" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white">لا يوجد لاعبين مسجلين بعد</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                عند دخول أي شخص إلى السيرفر عبر FiveM سيتم إدراجه تلقائياً هنا وبدء احتساب عدد ساعاته الفعلية بدقة دون أي أسماء وهمية.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>جاهز للاستقبال والربط اللحظي</span>
            </div>
          </div>
        ) : (
          <>
            {/* Top 3 Podiums */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* #3 Podium */}
              {thirdPlace && (
                <div className="p-6 bg-neutral-950 border border-neutral-850 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 relative shadow-xl">
                  <div className="w-8 h-8 rounded-full bg-amber-900/20 border border-amber-800/40 text-amber-600 flex items-center justify-center">
                    <Medal className="w-4 h-4" />
                  </div>

                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-md">
                    <img src={thirdPlace.avatar} alt={thirdPlace.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="font-black text-white text-base tracking-wider uppercase font-mono">
                      {thirdPlace.name}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono font-bold">
                      {thirdPlace.role}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
                    <Clock className="w-3 h-3 text-red-500" />
                    <span>{thirdPlace.timeString}</span>
                  </div>

                  <div className="text-3xl font-black font-mono text-neutral-700 pt-2">
                    #3
                  </div>
                </div>
              )}

              {/* #1 Podium (Center, prominent red border and glow) */}
              {firstPlace && (
                <div className="p-6 sm:p-8 bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900/60 border border-red-600/70 rounded-2xl flex flex-col items-center justify-center text-center space-y-3.5 relative shadow-2xl ring-1 ring-red-600/30 md:order-none order-first">
                  <div className="w-9 h-9 rounded-full bg-red-600/20 border border-red-600/60 text-red-500 flex items-center justify-center shadow-lg shadow-red-600/20">
                    <Crown className="w-5 h-5 fill-current" />
                  </div>

                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-red-600/40 bg-neutral-900 shadow-xl">
                    <img src={firstPlace.avatar} alt={firstPlace.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="font-black text-white text-lg tracking-wider uppercase font-mono">
                      {firstPlace.name}
                    </div>
                    <div className="text-xs text-neutral-400 font-mono font-bold">
                      {firstPlace.role}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-white font-bold">
                    <Clock className="w-3.5 h-3.5 text-red-500" />
                    <span>{firstPlace.timeString}</span>
                  </div>

                  <div className="text-4xl font-black font-mono text-neutral-700 pt-2">
                    #1
                  </div>
                </div>
              )}

              {/* #2 Podium */}
              {secondPlace && (
                <div className="p-6 bg-neutral-950 border border-neutral-850 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 relative shadow-xl">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center justify-center">
                    <Medal className="w-4 h-4" />
                  </div>

                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-md">
                    <img src={secondPlace.avatar} alt={secondPlace.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="font-black text-white text-base tracking-wider uppercase font-mono">
                      {secondPlace.name}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono font-bold">
                      {secondPlace.role}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
                    <Clock className="w-3 h-3 text-red-500" />
                    <span>{secondPlace.timeString}</span>
                  </div>

                  <div className="text-3xl font-black font-mono text-neutral-700 pt-2">
                    #2
                  </div>
                </div>
              )}
            </div>

            {/* Ranked List from #4 to #10 */}
            {topList.length > 0 && (
              <div className="bg-neutral-950 border border-neutral-850 rounded-2xl overflow-hidden shadow-2xl divide-y divide-neutral-900">
                {topList.map((player) => (
                  <div
                    key={player.rank}
                    className="p-3 sm:px-6 flex items-center justify-between gap-4 hover:bg-neutral-900/30 transition-colors"
                  >
                    <div className="text-xs font-mono text-neutral-300 w-36 text-start">
                      {player.timeString}
                    </div>

                    <div className="flex-1 max-w-md hidden sm:block">
                      <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600 rounded-full"
                          style={{ width: `${player.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                        {player.name}
                      </span>
                      <div className="w-7 h-7 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0">
                        <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-mono font-bold text-neutral-500 w-6 text-end">
                        #{player.rank}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. اعلى 30 بالوظائف Section (Only when real jobs data exists) */}
      {topJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2 text-white font-black text-base">
              <Briefcase className="w-4 h-4 text-red-500" />
              <span>اعلى بالوظائف</span>
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-850 rounded-2xl overflow-hidden shadow-2xl divide-y divide-neutral-900">
            {topJobs.map((job) => (
              <div
                key={job.rank}
                className="p-3 sm:px-5 flex items-center justify-between gap-4 hover:bg-neutral-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400 font-bold flex items-center justify-center">
                    {job.level}
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">{job.job}</span>
                  {job.bonus && (
                    <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-900/60 text-red-400 text-[10px] font-mono font-bold">
                      {job.bonus}
                    </span>
                  )}
                </div>

                <div className="flex-1 max-w-md hidden sm:block h-[1px] bg-red-900/40" />

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white font-mono">{job.name}</span>
                  <div className="w-7 h-7 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0">
                    <img src={job.avatar} alt={job.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-mono font-bold text-neutral-500 w-6 text-end">
                    #{job.rank}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
