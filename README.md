# סמן – מערכת אתרים לעסקים (Angular)

## דרישות והפעלה מקומית
- Node.js 20.19 ומעלה (מומלץ Node 22 LTS)
- npm

```bash
npm install
npm start
```
פתחי: http://localhost:4200

## מה כלול
- אתר שיווקי בעברית, RTL ורספונסיבי, עם מראה חם בגווני אדום/אפרסק בהשראת אתר סמן הקיים.
- סמל מיקום אדום עם הילה וטבעות זוהרות, כולל favicon.
- ממשק ניהול ליצירה, עריכה, פרסום, הסרה ושיתוף של עמודי עסקים.
- עמוד עסק עם טלפון, מייל, אתר, כתובת, שעות פעילות, ניווט ושיתוף ב-WhatsApp/SMS/Email.
- העלאת גלריית תמונות מוצרים/מקום בלבד (לא תמונות אנשים) לאחסון Supabase.
- שכבת גישה ל-Supabase Database + Storage וכניסת מנהלת.
- Edge Function לשליחת פניות מייל דרך Resend.
- Meta title/description לעמודי עסקים, sitemap דינמי ו-robots.txt ראשוני.

## חיבור לענן
קראי את `SETUP-CLOUD.md` ובצעי את שלבי ההקמה. פרטי Supabase עדיין placeholders בקובצי environment עד שתיצרי פרויקט משלך. אין אפשרות להפעיל ענן אמיתי בלי פרטי החשבון וההרשאות שלך.

## מבנה
- `src/app/pages/home` – אתר סמן
- `src/app/pages/admin` – ממשק ניהול
- `src/app/pages/business` – תבנית עמוד עסק
- `src/app/services/business.service.ts` – גישה לענן או מצב הדגמה מקומי
- `src/app/services/auth.service.ts` – התחברות מנהלת
- `supabase/migrations` – טבלאות, הרשאות ואחסון
- `supabase/functions/send-contact` – שליחת מייל דרך Resend
- `supabase/functions/sitemap` – מפת אתר דינמית לעמודי עסקים מפורסמים

## חשוב לפני השקה
יש להגדיר Supabase, משתמשת מנהלת, Resend, דומיין ואחסון אתר. יש לבצע בדיקות הרשאות, גיבויים, פרטיות, הגבלת קצב לטופס והגדרות SEO/Google Search Console לפני קבלת לקוחות אמיתיים.
