# חיבור סמן לענן – Supabase

הקוד מוכן לחיבור ל-Supabase, אבל לא ניתן להפעיל מסד נתונים אמיתי בלי לפתוח פרויקט בחשבון שלך ולהעתיק את פרטי החיבור. **לעולם אין להכניס לקוד Service Role Key**. בקוד הדפדפן משתמשים רק ב-Project URL וב-Publishable/anon key.

## 1. יצירת פרויקט Supabase
1. היכנסי ל-https://supabase.com/ וצרי פרויקט חדש.
2. שמרי את סיסמת מסד הנתונים במקום בטוח.
3. במסך Project Settings → API העתיקי את Project URL ואת Publishable key (או anon public key).
4. פתחי בפרויקט את `src/environments/environment.ts` וגם `src/environments/environment.prod.ts` והחליפי:
   - `https://YOUR_PROJECT_ID.supabase.co` ב-Project URL שלך.
   - `YOUR_SUPABASE_ANON_KEY` במפתח הציבורי.

## 2. יצירת הטבלאות והרשאות
1. ב-Supabase פתחי SQL Editor.
2. פתחי במחשב את `supabase/migrations/202611010001_initial_schema.sql`.
3. העתיקי את כל תוכנו לחלון SQL Editor והריצי.
4. בקוד המדיניות מוגדרת כרגע כתובת מנהלת קיימת: `elisheva92121@gmail.com`. לפני הרצת ה-SQL, ודאי שזו כתובת המייל המדויקת של משתמשת הניהול ועדכני אותה בכל המדיניות בקובץ אם צריך. אין לשמור סיסמה בקוד או ב-GitHub.
5. ב-Supabase → Authentication → Providers/Settings ודאי שיצירת משתמשים (Sign ups) כבויה. צרי משתמש מנהלת אחד דרך Authentication → Users → Add user, עם כתובת המייל המורשית שב-SQL.

## 3. הפעלת תמונות
ה-SQL יוצר Storage bucket ציבורי בשם `business-images`, עם העלאה/עדכון/מחיקה שמותרים רק למשתמשת המנהלת. אפשר להעלות גלריה של תמונות מוצר, תמונות חלל העסק ותמונות שירות – **לא תמונות של אנשים**. הקפידי לבדוק כל תמונה לפני העלאה. אם היו עסקים שנשמרו בגרסה המקומית, לאחר חיבור הענן והתחברות כמנהלת יופיע כפתור „ייבוא הנתונים לענן”.

## 4. שליחת מייל אמיתית
הטופס משתמש ב-Supabase Edge Function וב-Resend. צריך להגדיר פעם אחת:
1. צרי חשבון ב-https://resend.com/ והוסיפי/אמתִי כתובת שולח או דומיין לפי ההוראות שלהם.
2. התקיני את Supabase CLI לפי התיעוד הרשמי והתחברי: `supabase login`.
3. מתוך תיקיית הפרויקט הריצי `supabase link --project-ref YOUR_PROJECT_REF`.
4. הגדירי סודות (החליפי בערכים האמיתיים):
   `supabase secrets set RESEND_API_KEY=re_xxxxxxxxx OWNER_EMAIL=elisheva92121@gmail.com SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY MAIL_FROM="Seman <hello@YOUR_VERIFIED_DOMAIN>"`
5. פרסמי את הפונקציה: `supabase functions deploy send-contact`.

הפונקציה שולחת את הפנייה ל-OWNER_EMAIL. כתובת השולחת חייבת להיות מאומתת ב-Resend. אין לשים את מפתח Resend בקוד Angular או ב-GitHub.

## 5. Sitemap ו-Google
1. לאחר רכישת דומיין וחיבורו לאחסון, הגדירי את כתובת האתר: `supabase secrets set SITE_URL=https://YOUR_DOMAIN`.
2. פרסמי את מפת האתר הדינמית: `supabase functions deploy sitemap`.
3. הגדירי באחסון האתר Rewrite מ-`/sitemap.xml` לכתובת הפונקציה `https://YOUR_PROJECT_REF.supabase.co/functions/v1/sitemap`. את סוג ה-Rewrite המדויק נגדיר לאחר בחירת שירות האחסון.
4. החליפי ב-`public/robots.txt` את `YOUR_DOMAIN` בדומיין האמיתי.
5. הוסיפי את האתר ל-Google Search Console, אמתִי בעלות והגישי `https://YOUR_DOMAIN/sitemap.xml`.

מפת האתר תכלול את דף הבית ואת כל עמודי העסקים המפורסמים. גוגל מחליט בעצמו מתי לסרוק ולאנדקס עמודים ואיזה דירוג לתת להם.

## 6. בדיקת ענן
1. הריצי `npm install` ואז `npm start`.
2. היכנסי ל-`/admin` והתחברי עם משתמש המנהלת שיצרת.
3. הוסיפי עסק בדיקה, סמני פרסום ושמרי.
4. פתחי `/biz/slug-העסק` בחלון פרטי או בטלפון כדי לוודא שהעמוד הציבורי נטען.
5. בדקי העלאת תמונה ושליחת טופס יצירת קשר.

## 7. GitHub
מתוך תיקיית הפרויקט:

```bash
git init
git add .
git commit -m "Initial Seman cloud-ready platform"
```

ב-GitHub צרי Repository חדש (מומלץ Private), ואז העתיקי את כתובת ה-repository והפעילי:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPOSITORY.git
git push -u origin main
```

אין להעלות ל-GitHub סיסמאות, Service Role Keys או מפתחות Resend. המפתח הציבורי של Supabase מיועד לשימוש בדפדפן, וההרשאות נאכפות באמצעות RLS.

## מצב נוכחי והגבלות
- כאשר פרטי Supabase עדיין נשארים כ-placeholder, האפליקציה עובדת במצב הדגמה ושומרת ב-localStorage. זה **לא** ענן.
- לאחר הכנסת פרטי Supabase והרצת ה-SQL, נתוני העסקים והעלאות התמונות עוברים לענן. פעולות ניהול דורשות משתמשת מורשית.
- טופס דף הבית שולח פניות לכתובת OWNER_EMAIL. טופס בעמוד עסק שולח לכתובת המייל השמורה בעסק, ורק אם העסק מפורסם. שני הטפסים יפעלו רק לאחר פרסום Edge Function והגדרת Resend והסודות הנדרשים.
- שיתוף WhatsApp/SMS/Email נפתח באפליקציה המתאימה במכשיר. זה לא שירות דיוור אוטומטי.
- לפני השקה מסחרית יש להוסיף גיבויים, ניטור, הגבלת קצב לטופס, בדיקת פרטיות/תנאי שימוש והגדרת דומיין.


## 8. עדכון נובמבר 2026 – הפעלה/השבתה ודוחות יומיים

יש לבצע את השלבים הבאים לפני שימוש בגרסה המעודכנת:

1. ב-Supabase SQL Editor להריץ את הקובץ `supabase/migrations/202611030001_business_controls_and_visits.sql`.
2. לפרוס את פונקציות Edge:
   ```bash
   supabase functions deploy track-visit
   supabase functions deploy send-daily-reports
   ```
3. להגדיר סודות ב-Supabase (לא בקוד הדפדפן):
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
   supabase secrets set DAILY_REPORT_SECRET=CREATE_A_LONG_RANDOM_SECRET
   ```
   ודאי שגם `SUPABASE_URL`, `RESEND_API_KEY`, `OWNER_EMAIL`, `MAIL_FROM` מוגדרים. `MAIL_FROM` חייב להיות שולח/דומיין מאומת ב-Resend.
4. הפעילי את ההרחבות `pg_cron`, `pg_net` ו-`Vault` בפרויקט Supabase. בקובץ `supabase/DAILY-REPORT-SCHEDULER.sql` יש הוראות לשמירת כתובת הפונקציה והסוד ב-Vault ולתזמון אוטומטי. ברירת המחדל היא 18:00 UTC (20:00 בישראל בחורף); יש להתאים לשעון קיץ ולשעה הרצויה. לחלופין אפשר להשתמש בשירות תזמון חיצוני. בקשת POST צריכה לכלול header בשם `x-report-secret` עם הערך של `DAILY_REPORT_SECRET`. כתובת הפונקציה:
   `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-daily-reports`
5. דוח מנהלת סמן נשלח בכל הרצה וכולל את כל העסקים, מצב פעיל/לא פעיל ומספר כניסות. דוח למנהל עסק נשלח רק אם העסק פעיל, הופעל עבורו הדוח, יש לו כתובת מייל, ונרשמה לפחות כניסה אחת באותו יום UTC.
6. בדיקת עשן: פתחי עמוד עסק מפורסם בחלון פרטי, בדקי שנרשמה שורה ב-`business_visits`, הפעילי את `send-daily-reports` באופן ידני ובדקי שהתקבלו המיילים.

**הערות חשובות:** מדידת כניסות כרגע סופרת טעינות של עמוד עסק, ולא מבקר ייחודי. הדוח מסכם כניסות בלבד ואינו כולל עדיין פירוט פניות לפי WhatsApp/טלפון/טופס. הדוחות משתמשים בחלון יום UTC; יש להתאים את שעת התזמון ואת אזור הזמן לפני הפעלה מסחרית. נקודת הקצה למדידת כניסות ציבורית ולכן מומלץ להוסיף הגבלת קצב/הגנת בוט לפני קמפיין רחב.
