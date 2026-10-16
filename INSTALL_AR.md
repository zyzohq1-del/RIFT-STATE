# إعداد موقع Rift State على VPS (Node.js + SQLite + Discord + Steam + QBCore)

## 1) المتطلبات
- Ubuntu VPS حديث مع Node.js 22 أو أحدث وnpm.
- نطاق مربوط بعنوان الخادم مع HTTPS عبر Nginx/Cloudflare Proxy.
- موارد QBCore تعمل على سيرفر FiveM.

## 2) تشغيل الموقع
1. ارفع ملفات المشروع إلى مجلد خاص بالخادم.
2. انسخ `.env.example` إلى `.env` واملأ القيم الحقيقية؛ لا ترفع `.env` إلى Git ولا ترسله لأحد.
3. أنشئ أسراراً طويلة وعشوائية ومختلفة لكل من `SESSION_SECRET` و`FIVEM_API_SECRET` و`OWNER_PASSKEY`.
4. نفّذ `npm install` ثم `npm run build` ثم `npm start`.
5. شغّل التطبيق خلف Nginx مع HTTPS، واستخدم مدير عمليات مثل systemd أو PM2 لإعادة تشغيله عند توقفه.

## 3) إعداد Discord OAuth2
- في Discord Developer Portal، أنشئ OAuth2 application وأضف Redirect URI مطابقاً تماماً: `https://YOUR_DOMAIN/auth/discord/callback`.
- ضع `DISCORD_CLIENT_ID` و`DISCORD_CLIENT_SECRET` و`DISCORD_GUILD_ID` و`DISCORD_BOT_TOKEN` في `.env`.
- أضف البوت إلى سيرفر Discord بصلاحيات قراءة أعضاء السيرفر، وضع `DISCORD_REQUIRED_ROLE_IDS` كمعرف رتبة أو أكثر مفصولة بفواصل.
- ضع `DISCORD_REDIRECT_URI` على رابط callback نفسه. لا تشارك Client Secret أو Bot Token.

## 4) إعداد Steam OpenID
- ضع `STEAM_RETURN_URL=https://YOUR_DOMAIN/auth/steam/callback`.
- لا تغيّر الرابط المسجل في إعدادات Steam/OpenID عن الرابط الفعلي المستخدم.

## 5) ربط شخصية QBCore
1. في ملف `.env`، عيّن `FIVEM_API_SECRET` إلى سر طويل عشوائي.
2. افتح `resources/website_bridge/config.lua`، واجعل `Config.ApiUrl` رابط الموقع الأساسي واجعل `Config.BridgeSecret` مطابقاً تماماً لـ `FIVEM_API_SECRET`.
3. أضف `ensure website_bridge` إلى `server.cfg` بعد `ensure qb-core`.
4. اللاعب يسجل دخوله للموقع عبر Discord ويولّد رمز ربط. ثم يدخل FiveM بالشخصية الصحيحة ويكتب `/linkwebsite RF-1234` خلال عشر دقائق.
5. تتم قراءة `citizenid` من PlayerData على الخادم، وليس من المتصفح. لا تستخدم رمز الربط أكثر من مرة.

## 6) قاعدة البيانات
- قاعدة البيانات الحالية SQLite محفوظة في `server_database.sqlite` بجانب ملفات التطبيق، وتنشأ جداول الربط عند بدء التشغيل.
- احتفظ بنسخ احتياطية دورية من الملف أثناء إيقاف التطبيق أو باستخدام آلية نسخ متوافقة مع SQLite. لا تحذف الملف عند تحديث الكود.
- إذا كان متوقعاً عدد كبير من الكتابات المتزامنة أو تعدد نسخ الموقع، انقل قاعدة البيانات إلى PostgreSQL/MySQL بعد اختبار ترحيل البيانات.

## تنبيهات أمان
- تسجيل الدخول لا يكتمل بشكل آمن في الإنتاج قبل ضبط جميع أسرار `.env` والتحقق من العضوية والرتب.
- لا تفتح منفذ قاعدة البيانات للإنترنت.
- لا ترسل أسرار الموقع داخل كود المتصفح أو ملفات FiveM client؛ السر يوضع فقط في إعدادات الخادم.
- اختبر OAuth والربط على نطاق تجريبي أولاً قبل اعتماد الموقع للاعبين.
