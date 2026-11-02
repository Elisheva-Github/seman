const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const payload = await request.json();
    const name = String(payload.name || '').trim().slice(0, 120);
    const business = String(payload.business || '').trim().slice(0, 120);
    const email = String(payload.email || '').trim().slice(0, 200);
    const phone = String(payload.phone || '').trim().slice(0, 50);
    const message = String(payload.message || '').trim().slice(0, 3000);
    // Hidden honeypot field. Real visitors leave it empty.
    if (String(payload.company_website || '').trim()) return json({ ok: true });
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'נא למלא שם וכתובת מייל תקינה.' }, 400);
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    const ownerEmail = Deno.env.get('OWNER_EMAIL') || 'elisheva92121@gmail.com';
    let recipientEmail = ownerEmail;
    const businessSlug = String(payload.businessSlug || '').trim().slice(0, 120);
    if (businessSlug) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
      if (!supabaseUrl || !anonKey) return json({ error: 'חיבור מסד הנתונים לשליחת פניות עדיין לא הוגדר.' }, 503);
      const lookup = await fetch(`${supabaseUrl}/rest/v1/businesses?select=email&slug=eq.${encodeURIComponent(businessSlug)}&published=eq.true&limit=1`, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } });
      if (!lookup.ok) return json({ error: 'לא הצלחנו לאתר את פרטי העסק.' }, 502);
      const businesses = await lookup.json();
      const businessEmail = String(businesses?.[0]?.email || '').trim();
      if (!businessEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)) return json({ error: 'לעסק עדיין לא הוגדרה כתובת דוא״ל לקבלת פניות.' }, 400);
      recipientEmail = businessEmail;
    }
    const sender = Deno.env.get('MAIL_FROM') || 'Seman <onboarding@resend.dev>';
    if (!apiKey) return json({ error: 'שירות שליחת המייל עדיין לא הוגדר בשרת.' }, 503);

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
      body: JSON.stringify({
        from: sender,
        to: [recipientEmail],
        reply_to: email,
        subject: businessSlug ? `פנייה חדשה לעסק ${businessSlug} – ${name}` : `פנייה חדשה מאתר סמן – ${name}`, 
        text: lines.join('\n'),
      }),
    });

    if (!mailResponse.ok) {
      const detail = await mailResponse.text();
      console.error('Resend error:', detail);
      return json({ error: 'שליחת המייל נכשלה. נסי שוב מאוחר יותר.' }, 502);
    }
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ error: 'לא הצלחנו לעבד את הפנייה.' }, 500);
  }
});
