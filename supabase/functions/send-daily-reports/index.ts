// דוח יומי: מייל למנהלת סמן + מייל לכל עסק שהפעיל דוח ושהיו לו כניסות.
// מופעל על ידי pg_cron (ראו supabase/DAILY-REPORT-SCHEDULER.sql) ומוגן בסוד.
// המתג הכללי "שליחת דוחות כניסות למייל" (seman_settings) חייב להיות פעיל, אחרת לא נשלח דבר.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-report-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const TZ = 'Asia/Jerusalem';

function safeEqual(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

// היום מוגדר לפי שעון ישראל (כולל מעבר שעון קיץ/חורף), לא לפי UTC.
function tzOffsetMs(instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(instant);
  const get = (type: string) => Number(parts.find(p => p.type === type)!.value);
  return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second')) - instant.getTime();
}
function localMidnightUtc(y: number, m: number, d: number): Date {
  const base = Date.UTC(y, m - 1, d);
  const guess = base - tzOffsetMs(new Date(base));
  return new Date(base - tzOffsetMs(new Date(guess)));
}
export function israelDayWindow(now: Date) {
  const label = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const [y, m, d] = label.split('-').map(Number);
  return { label, start: localMidnightUtc(y, m, d), end: localMidnightUtc(y, m, d + 1) };
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const expected = Deno.env.get('DAILY_REPORT_SECRET');
  if (!expected || !safeEqual(request.headers.get('x-report-secret') || '', expected)) return json({ error: 'Unauthorized' }, 401);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const ownerEmail = Deno.env.get('OWNER_EMAIL');
    const sender = Deno.env.get('MAIL_FROM');
    if (!supabaseUrl || !serviceKey || !resendKey || !ownerEmail || !sender) {
      return json({ error: 'Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, OWNER_EMAIL or MAIL_FROM' }, 503);
    }
    const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };

    const settingsResponse = await fetch(`${supabaseUrl}/rest/v1/seman_settings?select=send_visit_report_email&id=eq.true&limit=1`, { headers });
    if (!settingsResponse.ok) throw new Error('Could not load settings');
    const settings = await settingsResponse.json();
    if (!settings?.[0]?.send_visit_report_email) return json({ ok: true, skipped: 'Daily reports are switched off in admin settings' });

    const { label: dateLabel, start, end } = israelDayWindow(new Date());
    const [businessResponse, visitResponse] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/businesses?select=id,name,email,published,send_visit_report_email&order=name.asc`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/business_visits?select=business_id&visited_at=gte.${encodeURIComponent(start.toISOString())}&visited_at=lt.${encodeURIComponent(end.toISOString())}&limit=100000`, { headers })
    ]);
    if (!businessResponse.ok || !visitResponse.ok) throw new Error('Could not load businesses or visits');
    const businesses = await businessResponse.json();
    const visits = await visitResponse.json();
    const counts = new Map<string, number>();
    for (const visit of visits) counts.set(visit.business_id, (counts.get(visit.business_id) || 0) + 1);

    const sendMail = async (to: string, subject: string, text: string) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: sender, to: [to], subject, text })
      });
      if (!response.ok) throw new Error(`Resend failed: ${await response.text()}`);
    };

    const ownerLines = businesses.map((b: { id: string; name: string; email?: string; published: boolean }) =>
      `${b.name} | ${b.published ? 'פעיל' : 'לא פעיל'} | ${counts.get(b.id) || 0} כניסות | ${b.email || 'ללא מייל'}`
    );
    await sendMail(ownerEmail, `דוח יומי סמן – ${dateLabel}`,
      `דוח יומי של כל העסקים בסמן (${dateLabel})\n\n${ownerLines.join('\n') || 'לא קיימים עסקים במערכת'}\n\nסה״כ עסקים: ${businesses.length}\nסה״כ כניסות: ${visits.length}`);

    let businessEmailsSent = 0;
    const failures: string[] = [];
    for (const business of businesses) {
      const count = counts.get(business.id) || 0;
      if (!business.published || !business.send_visit_report_email || count < 1 || !business.email) continue;
      try {
        await sendMail(business.email, `סיכום יומי לעסק ${business.name} – ${dateLabel}`,
          `שלום ${business.name},\n\nהיו היום ${count} כניסות לעמוד העסק שלך בסמן.\n\nצוות סמן`);
        businessEmailsSent++;
      } catch (error) {
        // כשל במייל של עסק אחד אינו עוצר את שאר הדוחות
        console.error(`Report failed for ${business.id}:`, error);
        failures.push(business.name);
      }
    }
    return json({ ok: true, date: dateLabel, businesses: businesses.length, visits: visits.length, businessEmailsSent, failedBusinesses: failures, ownerEmailSent: true });
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : 'Daily report failed' }, 500);
  }
});
