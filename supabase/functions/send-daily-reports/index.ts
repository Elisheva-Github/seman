const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-report-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const expected = Deno.env.get('DAILY_REPORT_SECRET');
  if (!expected || request.headers.get('x-report-secret') !== expected) return json({ error: 'Unauthorized' }, 401);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const ownerEmail = Deno.env.get('OWNER_EMAIL');
    const sender = Deno.env.get('MAIL_FROM');
    if (!supabaseUrl || !serviceKey || !resendKey || !ownerEmail || !sender) {
      return json({ error: 'Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, OWNER_EMAIL or MAIL_FROM' }, 503);
    }

    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const dateLabel = start.toISOString().slice(0, 10);
    const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
    const [businessResponse, visitResponse] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/businesses?select=id,name,email,published,send_visit_report_email&order=name.asc`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/business_visits?select=business_id&visited_at=gte.${encodeURIComponent(start.toISOString())}&visited_at=lt.${encodeURIComponent(end.toISOString())}`, { headers })
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

    // The Seman owner gets a complete daily overview, including businesses with zero visits.
    const ownerLines = businesses.map((b: any) =>
      `${b.name} | ${b.published ? 'פעיל' : 'לא פעיל'} | ${counts.get(b.id) || 0} כניסות | ${b.email || 'ללא מייל'}`
    );
    await sendMail(ownerEmail, `דוח יומי סמן – ${dateLabel}`,
      `דוח יומי של כל העסקים בסמן (${dateLabel})\n\n${ownerLines.join('\n') || 'לא קיימים עסקים במערכת'}\n\nסה״כ עסקים: ${businesses.length}\nסה״כ כניסות: ${visits.length}`);

    let businessEmailsSent = 0;
    for (const business of businesses) {
      const count = counts.get(business.id) || 0;
      if (!business.published || !business.send_visit_report_email || count < 1 || !business.email) continue;
      await sendMail(business.email, `סיכום יומי לעסק ${business.name} – ${dateLabel}`,
        `שלום ${business.name},\n\nהיו היום ${count} כניסות לעמוד העסק שלך בסמן.\n\nצוות סמן`);
      businessEmailsSent++;
    }
    return json({ ok: true, date: dateLabel, businesses: businesses.length, visits: visits.length, businessEmailsSent, ownerEmailSent: true });
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : 'Daily report failed' }, 500);
  }
});
