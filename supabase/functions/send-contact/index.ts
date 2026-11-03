// שליחת פניות מטפסי האתר (סמן ועמודי עסקים) דרך Resend.
// הגנות: honeypot, הגבלת קצב לפי IP (best-effort בזיכרון המופע), ניקוי תווי שורה חדשה
// מכותרת המייל, ו-CORS שניתן להגבלה לדומיין האתר באמצעות ALLOWED_ORIGIN.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || '*';
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const oneLine = (value: string) => value.replace(/[\r\n\t]+/g, ' ').trim();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(time => now - time < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) { hits.set(ip, recent); return true; }
  recent.push(now);
  hits.set(ip, recent);
  // מניעת גדילה בלתי מוגבלת של המפה
  if (hits.size > 5000) for (const [key, times] of hits) if (!times.some(time => now - time < WINDOW_MS)) hits.delete(key);
  return false;
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const ip = (request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    if (rateLimited(ip)) return json({ error: 'נשלחו יותר מדי פניות. נסו שוב בעוד כמה דקות.' }, 429);

    const payload = await request.json();
    // שדה מלכודת נסתר. מבקרים אמיתיים משאירים אותו ריק.
    if (String(payload.company_website || '').trim()) return json({ ok: true });

    const name = oneLine(String(payload.name || '')).slice(0, 120);
    const business = oneLine(String(payload.business || '')).slice(0, 120);
    const email = oneLine(String(payload.email || '')).slice(0, 200);
    const phone = oneLine(String(payload.phone || '')).slice(0, 50);
    const message = String(payload.message || '').trim().slice(0, 3000);
    if (!name || !email || !EMAIL_RE.test(email)) {
      return json({ error: 'נא למלא שם וכתובת מייל תקינה.' }, 400);
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'שירות שליחת המייל עדיין לא הוגדר בשרת.' }, 503);
    const sender = Deno.env.get('MAIL_FROM') || 'Seman <onboarding@resend.dev>';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const readHeaders = anonKey ? { apikey: anonKey, Authorization: `Bearer ${anonKey}` } : undefined;

    let recipientEmail = Deno.env.get('OWNER_EMAIL') || 'elisheva92121@gmail.com';
    let subject: string;
    const businessSlug = oneLine(String(payload.businessSlug || '')).slice(0, 120);

    if (businessSlug) {
      if (!supabaseUrl || !readHeaders) return json({ error: 'חיבור מסד הנתונים לשליחת פניות עדיין לא הוגדר.' }, 503);
      const lookup = await fetch(`${supabaseUrl}/rest/v1/businesses?select=name,email&slug=eq.${encodeURIComponent(businessSlug)}&published=eq.true&limit=1`, { headers: readHeaders });
      if (!lookup.ok) return json({ error: 'לא הצלחנו לאתר את פרטי העסק.' }, 502);
      const rows = await lookup.json();
      const businessEmail = String(rows?.[0]?.email || '').trim();
      if (!rows?.length) return json({ error: 'העסק לא נמצא.' }, 404);
      if (!EMAIL_RE.test(businessEmail)) return json({ error: 'לעסק עדיין לא הוגדרה כתובת דוא״ל לקבלת פניות.' }, 400);
      recipientEmail = businessEmail;
      subject = oneLine(`פנייה חדשה לעסק ${rows[0].name || businessSlug} – ${name}`).slice(0, 200);
    } else {
      // כתובת היעד לפניות סמן ניתנת לעריכה במסך "עריכת תוכן אתר סמן" (אזור "צור קשר").
      // אם לא הוגדרה כתובת תקינה שם, נשתמש בסוד OWNER_EMAIL.
      if (supabaseUrl && readHeaders) {
        try {
          const res = await fetch(`${supabaseUrl}/rest/v1/seman_site_content?select=content&section_key=eq.contact&limit=1`, { headers: readHeaders });
          if (res.ok) {
            const rows = await res.json();
            const configured = String(rows?.[0]?.content?.email || '').trim();
            if (EMAIL_RE.test(configured)) recipientEmail = configured;
          }
        } catch (error) { console.error('Could not read contact email override:', error); }
      }
      subject = oneLine(`פנייה חדשה מאתר סמן – ${name}`).slice(0, 200);
    }

    const lines = [
      `שם: ${name}`,
      `שם העסק: ${business || 'לא צוין'}`,
      `מייל לחזרה: ${email}`,
      `טלפון: ${phone || 'לא צוין'}`,
      '',
      'תוכן הפנייה:',
      message || 'לא צורף תוכן נוסף',
    ];

    const mailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: sender, to: [recipientEmail], reply_to: email, subject, text: lines.join('\n') }),
    });

    if (!mailResponse.ok) {
      console.error('Resend error:', await mailResponse.text());
      return json({ error: 'שליחת המייל נכשלה. נסי שוב מאוחר יותר.' }, 502);
    }
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ error: 'לא הצלחנו לעבד את הפנייה.' }, 500);
  }
});
