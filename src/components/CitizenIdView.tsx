import React, { useState } from 'react';
import { CreditCard, Download, UserCheck, Shield, Sparkles, Printer } from 'lucide-react';
import { Language } from '../types';

interface CitizenIdViewProps {
  lang: Language;
}

export const CitizenIdView: React.FC<CitizenIdViewProps> = ({ lang }) => {
  const [characterName, setCharacterName] = useState('خالد بن سلطان');
  const [citizenId, setCitizenId] = useState('HL-98412');
  const [dob, setDob] = useState('1997-08-14');
  const [gender, setGender] = useState('male');
  const [bloodType, setBloodType] = useState('O+');
  const [occupation, setOccupation] = useState('ميكانيكي معتمد / LS Customs');
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=250&q=80',
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
          {lang === 'ar' ? 'نظام السجل المدني' : 'Civil Registry System'}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-arabic">
          {lang === 'ar' ? 'صانع بطاقة هوية مواطن HLCRP' : 'Los Santos Citizen ID Card'}
        </h1>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto">
          {lang === 'ar'
            ? 'قم بتصميم بطاقة الهوية الرسمية لشخصيتك داخل السيرفر واستخدامها في ملفك بالديسكورد والسيناريوهات.'
            : 'Customize and export your official character resident identity card.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white font-arabic">
            {lang === 'ar' ? 'بيانات الهوية' : 'Card Details'}
          </h2>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">
              {lang === 'ar' ? 'اسم الشخصية الكامل' : 'Character Full Name'}
            </label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">
                {lang === 'ar' ? 'رقم السجل المدني (Citizen ID)' : 'Citizen ID'}
              </label>
              <input
                type="text"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">
                {lang === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">
                {lang === 'ar' ? 'فصيلة الدم' : 'Blood Type'}
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">
                {lang === 'ar' ? 'الجنس' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="male">{lang === 'ar' ? 'ذكر' : 'Male'}</option>
                <option value="female">{lang === 'ar' ? 'أنثى' : 'Female'}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">
              {lang === 'ar' ? 'المهنة أو القطاع' : 'Occupation / Faction'}
            </label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Avatar choice */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-medium text-neutral-300">
              {lang === 'ar' ? 'اختر صورة الهوية' : 'Select Photo Portrait'}
            </label>
            <div className="flex gap-2">
              {avatars.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedAvatar === idx ? 'border-amber-500 scale-105' : 'border-neutral-800 opacity-60'
                  }`}
                >
                  <img src={av} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card Preview Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-xs font-semibold text-neutral-400">
            {lang === 'ar' ? 'معاينة البطاقة المباشرة:' : 'Live Identity Card Preview:'}
          </div>

          {/* Physical ID Card Mockup */}
          <div className="w-full max-w-md mx-auto aspect-[1.586/1] bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-neutral-700/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between text-neutral-100">
            {/* Background seal watermarks */}
            <div className="absolute -end-8 -top-8 w-44 h-44 rounded-full bg-amber-500/5 blur-xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-700/60 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-neutral-950 font-black font-display text-sm">
                  HL
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold font-mono">
                    STATE OF LOS SANTOS
                  </div>
                  <div className="text-xs font-bold font-arabic">
                    {lang === 'ar' ? 'بطاقة هوية مقيم رسمية' : 'Resident Identity Card'}
                  </div>
                </div>
              </div>
              <div className="text-end">
                <div className="text-[9px] text-neutral-500 font-mono">CITIZEN NO.</div>
                <div className="text-xs font-mono font-bold text-amber-400">{citizenId}</div>
              </div>
            </div>

            {/* Card Body */}
            <div className="flex items-center gap-4 py-2 relative z-10">
              {/* Photo Box */}
              <div className="w-24 h-28 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900 shrink-0 shadow-inner">
                <img
                  src={avatars[selectedAvatar]}
                  alt="Character"
                  className="w-full h-full object-cover filter grayscale contrast-125"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-xs flex-grow">
                <div>
                  <div className="text-[9px] text-neutral-500 uppercase">{lang === 'ar' ? 'الاسم الكامل' : 'FULL NAME'}</div>
                  <div className="text-sm font-bold text-white font-arabic">{characterName}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <div className="text-[8px] text-neutral-500 uppercase">{lang === 'ar' ? 'تاريخ الميلاد' : 'DOB'}</div>
                    <div className="font-mono text-neutral-200">{dob}</div>
                  </div>
                  <div>
                    <div className="text-[8px] text-neutral-500 uppercase">{lang === 'ar' ? 'فصيلة الدم' : 'BLOOD'}</div>
                    <div className="font-mono text-amber-400">{bloodType}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[8px] text-neutral-500 uppercase">{lang === 'ar' ? 'المهنة' : 'OCCUPATION'}</div>
                  <div className="text-neutral-200 truncate">{occupation}</div>
                </div>
              </div>
            </div>

            {/* Card Footer / Hologram */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-[9px] text-neutral-500 font-mono relative z-10">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>HLCRP SECURE CHIP</span>
              </div>
              <div className="tracking-widest select-none">||| | | |||| | ||| |||| |</div>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/10"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'ar' ? 'طباعة / حفظ الهوية' : 'Print / Save Card'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
