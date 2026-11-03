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
    const { businessId } = await request.json();
    if (typeof businessId !== 'string' || !/^[0-9a-f-]{36}$/i.test(businessId)) return json({ error: 'Invalid business' }, 400);
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({ error: 'Visit tracking is not configured' }, 503);
    const response = await fetch(`${url}/rest/v1/business_visits`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ business_id: businessId })
    });
    if (!response.ok) {
      console.error('Visit insert failed:', await response.text());
      return json({ error: 'Could not record visit' }, 502);
    }
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ error: 'Invalid request' }, 400);
  }
});
