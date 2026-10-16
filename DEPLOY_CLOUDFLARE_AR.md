# نشر Rift State على Cloudflare — مهم

هذا المشروع ليس موقعًا ثابتًا فقط. يحتوي على خادم Express (`server.ts`)، وجلسات OAuth، وقاعدة SQLite، وواجهة FiveM Bridge. لذلك **لا تستخدم Upload and deploy الخاص بالمواقع الثابتة**؛ هذه الطريقة لا تشغّل خادم Node.js أو قاعدة SQLite.

## الخيار الأسهل

انشر المشروع على استضافة تدعم Node.js (مثل VPS أو خدمة Node.js مُدارة) وشغّل:

```bash
npm install
npm run build
npm start
```

اضبط `NODE_ENV=production`، و`PORT` حسب الاستضافة، وجميع القيم المطلوبة في `.env.example` داخل إعدادات البيئة السرية للاستضافة. لا ترفع ملف `.env` ولا تشارك أسرار OAuth أو توكن البوت.

## إذا كان النطاق في Cloudflare

اترك DNS والنطاق لدى Cloudflare، واجعل سجل DNS يوجّه إلى استضافة Node.js. Cloudflare Pages static upload وحده لا يشغّل هذا الخادم. تحويل المشروع إلى Cloudflare Workers يتطلب نقل الخادم وطبقة قاعدة البيانات والجلسات إلى واجهات متوافقة مع Workers وD1/KV؛ لا يكفي رفع ملفات `dist`.

## إعداد Discord

في Discord Developer Portal، أضف رابط callback المطابق تمامًا إلى OAuth2 Redirects:

`https://YOUR_DOMAIN/auth/discord/callback`

اضبط `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_GUILD_ID`, `DISCORD_BOT_TOKEN` و`DISCORD_REDIRECT_URI`. أضف البوت إلى السيرفر المطلوب مع صلاحية قراءة أعضاء السيرفر. عيّن `OWNER_ROLE_ID` و`OWNER_DISCORD_ID` و`DISCORD_APPROVED_ROLE_ID` و`DISCORD_REJECTED_ROLE_ID` إلى القيم الفعلية، ولا تستخدم أرقامًا تجريبية.

## إعداد Steam

أضف `STEAM_RETURN_URL=https://YOUR_DOMAIN/auth/steam/callback`. تسجيل Steam يتم عبر OpenID ويُتحقق من الرد لدى Steam قبل اعتماد الهوية.

## ربط FiveM

ضع `resources/website_bridge` داخل موارد السيرفر. راجع `resources/website_bridge/README.md` و`config.lua`، واضبط رابط API وسر الربط بقيمة سرية قوية متطابقة مع إعداد الخادم. لا تضع السر في ملفات الواجهة الأمامية.

## قبل الإطلاق

- استخدم `SESSION_SECRET` عشوائيًا قويًا.
- فعّل HTTPS.
- راجع `FIVEM_API_SECRET` و`Config.ApiKey` ولا تستخدم القيم الافتراضية.
- اختبر Discord وSteam على نطاق منشور؛ لا تعتبر تسجيل الدخول ناجحًا لمجرد ظهور الواجهة.
- اربط Steam ID بشخصية QBCore عبر `citizenid` من قاعدة بيانات السيرفر قبل اعتبار هوية Steam إثباتًا لشخصية RP.
