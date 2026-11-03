// רישום טעינת עמוד עסק. נקראת מהדפדפן ללא התחברות.
// הגנות: רק עסק מפורסם נספר, ו-IP אחד נספר פעם אחת לכל עסק בחלון זמן (best-effort בזיכרון המופע).
const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || '*';
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
};
const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const DEDUPE_MS = 30 * 60 * 1000;
const seen = new Map<string, number>();

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const { businessId } = await request.json();
    if (typeof businessId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(businessId)) return json({ error: 'Invalid business' }, 400);
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({ error: 'Visit tracking is not configured' }, 503);

    const ip = (request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    const dedupeKey = `${ip}|${businessId}`;
    const now = Date.now();
    const last = seen.get(dedupeKey);
    if (last && now - last < DEDUPE_MS) return json({ ok: true, counted: false });

    const headers = { apikey: key, Authorization: `Bearer ${key}` };
    const check = await fetch(`${url}/rest/v1/businesses?select=id&id=eq.${businessId}&published=eq.true&limit=1`, { headers });
    if (!check.ok) return json({ error: 'Could not verify business' }, 502);
    if (!(await check.json()).length) return json({ ok: true, counted: false });

    const response = await fetch(`${url}/rest/v1/business_visits`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ business_id: businessId })
    });
    if (!response.ok) {
      console.error('Visit insert failed:', await response.text());
      return json({ error: 'Could not record visit' }, 502);
    }
    seen.set(dedupeKey, now);
    if (seen.size > 5000) for (const [k, t] of seen) if (now - t > DEDUPE_MS) seen.delete(k);
    return json({ ok: true, counted: true });
  } catch (error) {
    console.error(error);
    return json({ error: 'Invalid request' }, 400);
  }
});
