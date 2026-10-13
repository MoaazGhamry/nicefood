# 🌟 NiceFood Food Industries Group (مجموعة نايس فود للمنتجات الغذائية)

منصة تجارة إلكترونية متطورة وفائقة الفخامة مبنية بأحدث معايير الويب لعام 2026 لشركة **نايس فود** ومصانعها الثلاثة:
1. **طعموش (Taamoosh)**: مصنعات الدواجن والمجمدات المقرمشة (بانيه، ستربس، ناجتس، برجر).
2. **ابن الأصول (Ibn El-Ossool)**: أصالة اللحوم البلدي والمصنعات الشرقية (سجق إسكندراني، كفتة حاتي، حواوشي).
3. **مزايا (Mazaya)**: مصنعات اللحوم الباردة الفاخرة (لانشون بجميع أطعمته، سوسيس، فرانكفورتر).
4. **قسم العروض والتخفيضات (Offers & Deals)**.

---

## 🎨 التصميم وتجربة المستخدم (Design & Aesthetics)
- **Living Brand Aurora Background**: خلفية حية ومتحركة ديناميكياً بألوان الهوية لكل علامة تجارية (أخضر زمردي لنايس فود، أزرق كحلي ملكي لطعموش، أحمر عنابي دافئ لابن الأصول، وأخضر زيتوني لمزايا).
- **Ultra-Luxury Liquid Glass**: زجاج سائل عالي التباين والشفافية (`backdrop-filter: blur(28px) saturate(200%)`) مع لمعات وانعكاسات ضوئية تفاعلية عند التحويم.
- **Strictly Emoji-Free**: استخدام أيقونات تقنية متناسقة SVG خالية من الإيموجي التقليدي.
- **Full Dark & Light Modes**: دعم متكامل للوضع الليلي والنهاري بدون أي ألوان عشوائية، مع الحفاظ على عمق اللون الأسود الحجري.
- **Bilingual & Responsive**: دعم كامل للغتين العربية (RTL) والإنجليزية (LTR)، وتوافق تام مع شاشات الهواتف والأجهزة اللوحية.

---

## 🔒 نظام الحماية والأمان المتقدم (Anti-Hacking & Security System)
الموقع محمي بنظام أمني متكامل على كل طبقات التطبيق:
1. **Sliding-Window Rate Limiting**:
   - حماية مسارات الطلبات (`/api/orders`) من هجمات الإغراق (Spam) بحد أقصى 10 طلبات لكل دقيقتين لكل IP.
   - حماية لوحة التحكم (`/api/admin/verify`) من هجمات التخمين العنيف (Anti-Brute-Force) بحد أقصى 5 محاولات خاطئة خلال 15 دقيقة مع حظر مؤقت.
2. **Timing-Safe Constant-Time Verification**:
   - منع هجمات تحليل التوقيت (Timing Attacks) أثناء فحص رمز المرور الإداري باستخدام `crypto.timingSafeEqual`.
3. **Cryptographic HMAC SHA-512 Verification for Paymob**:
   - فحص وتوثيق جميع إشعارات الدفع (Webhooks & Callbacks) من Paymob لمنع التزوير أو تزييف تأكيد الدفع عبر التوقيع الرقمي المشفر.
4. **Input Sanitization & Bounds Checking**:
   - تنظيف أرقام الهواتف، النصوص، والمدخلات لمنع هجمات XSS أو التلاعب بأسعار ومبالغ الفواتير.
5. **Hardened HTTP Security Headers**:
   - حماية مفعلة في `next.config.ts`:
     - `Strict-Transport-Security (HSTS)`
     - `X-Frame-Options: SAMEORIGIN` (منع Clickjacking)
     - `X-Content-Type-Options: nosniff` (منع MIME sniffing)
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Permissions-Policy`

---

## 💳 بوابة الدفع الإلكتروني الحقيقية (Paymob Gateway)
- مسار بدء الدفع: `/api/paymob/initiate`
- مسار استلام الإشعار والتحقق المشفر: `/api/paymob/callback`
- المتغيرات المطلوبة في `.env`:
  ```env
  PAYMOB_API_KEY="your_api_key"
  PAYMOB_INTEGRATION_ID="your_integration_id"
  PAYMOB_IFRAME_ID="your_iframe_id"
  PAYMOB_HMAC_SECRET="your_hmac_secret"
  ```
- *ملاحظة:* في حال عدم ملء مفاتيح Paymob، يعمل النظام في وضع المحاكاة الآمن (Simulation Mode) تلقائياً لتجربة كل الخطوات بدون توقف.

---

## 🛡️ لوحة التحكم السرية (Admin Dashboard)
- الدخول إلى لوحة التحكم محمي ومخفي من شريط التنقل العلوي لتفادي الفضوليين.
- يتم الدخول عبر:
  - الضغط على أيقونة الختم الأمني الصغيرة في التذييل (Footer) أو في أقصى يمين الهيدر.
  - أو كتابة الرابط مباشرة: `http://localhost:3001/admin`
- رمز الدخول الافتراضي: `1234` (أو تخصيصه عبر `ADMIN_PASSCODE` في `.env`).

---

## 🚀 خطة النشر على Vercel وقاعدة البيانات (Database & Vercel Deployment)

### 1. طبيعة قاعدة البيانات الحالية والسحابية:
- **محلياً (Development)**: يعمل الموقع حالياً بـ SQLite (`prisma/dev.db`) لسرعة وسهولة التطوير المحلي.
- **على Vercel (Production)**: بيئة Vercel Serverless تعمل بوحدات مؤقتة للقراءة فقط (Ephemeral Read-Only)، لذا يلزم ربط قاعدة بيانات سحابية حقيقية **PostgreSQL** لضمان حفظ الطلبات والمنتجات دون ضياع.

### 2. تجهيز قاعدة بيانات PostgreSQL مجانية (خلال دقيقة واحدة):
يمكنك إنشاء قاعدة بيانات PostgreSQL مجانية على:
- [Supabase](https://supabase.com) (موصى به - مجاني وسريع)
- [Neon Tech](https://neon.tech) (PostgreSQL سحابي مخصص لـ Vercel)
- [Vercel Postgres](https://vercel.com/storage/postgres)

بمجرد إنشاء القاعدة، انسخ رابط الاتصال:
```env
DATABASE_URL="postgres://username:password@host:port/database?sslmode=require"
```

### 3. تفعيل PostgreSQL مع Prisma:
قم بتغيير ملف `prisma/schema.prisma` ليكون:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
*(أو استخدام الملف الجاهز `prisma/schema.postgresql.prisma`)*

ثم تشغيل الأمر لرفع الجداول وملئها بالبيانات:
```bash
npx prisma db push
node prisma/seed.js
```

---

## 🌐 مستودع GitHub
تم رفع المشروع كاملاً على المستودع:
🔗 [https://github.com/MoaazGhamry/nicefood](https://github.com/MoaazGhamry/nicefood)

---

## 📦 أوامر التشغيل والبناء (Scripts)
- `npm run dev`: تشغيل خادم التطوير المحلي.
- `npm run build`: بناء النسخة النهائية واختبار الأنواع (0 Errors).
- `npx prisma studio`: استعراض وتعديل بيانات القاعدة عبر واجهة رسومية سهلة.
