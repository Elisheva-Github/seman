const xmlEscape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

Deno.serve(async () => {
  const siteUrl = (Deno.env.get('SITE_URL') || '').replace(/\/$/, '');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!siteUrl || !supabaseUrl || !anonKey) {
    return new Response('Sitemap is not configured', { status: 503 });
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/businesses?select=slug,updated_at&published=eq.true`, {
    headers: { apikey: anonKey },
  });
  if (!response.ok) return new Response('Could not load published pages', { status: 502 });
  const businesses = await response.json();
  const entries = [
    `<url><loc>${xmlEscape(siteUrl)}</loc></url>`,
    ...businesses.map((business: { slug: string; updated_at?: string }) =>
      `<url><loc>${xmlEscape(`${siteUrl}/biz/${encodeURIComponent(business.slug)}`)}</loc>${business.updated_at ? `<lastmod>${new Date(business.updated_at).toISOString()}</lastmod>` : ''}</url>`
    ),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
});
