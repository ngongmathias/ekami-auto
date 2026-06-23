import type { VercelRequest, VercelResponse } from '@vercel/node';

// Serves rich Open Graph / Twitter preview tags for a single car so that
// when a /cars/:id link is shared to WhatsApp, Facebook, X, etc., the chat
// shows the car's photo, name and price — not the generic site logo.
//
// Only social crawlers are routed here (see the user-agent rule in
// vercel.json); real visitors still get the normal single-page app.
const SITE = 'https://ekamiauto.com';
const FALLBACK_IMAGE = `${SITE}/logo.jpg`;

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function xaf(n: unknown): string | null {
  const v = Number(n);
  if (!v || Number.isNaN(v)) return null;
  return `${v.toLocaleString('en-US')} XAF`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = (req.query.id as string) || '';
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  let title = 'Ekami Auto — Car Rentals, Sales & Repairs in Cameroon';
  let description = 'Browse quality cars for rent and sale in Cameroon.';
  let image = FALLBACK_IMAGE;
  const pageUrl = `${SITE}/cars/${encodeURIComponent(id)}`;

  try {
    if (id && supabaseUrl && anonKey) {
      const r = await fetch(
        `${supabaseUrl}/rest/v1/cars?id=eq.${encodeURIComponent(id)}&select=make,model,year,body_type,transmission,seats,price_rent_daily,price_sale,location,current_city,images,description&limit=1`,
        { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
      );
      const rows = await r.json();
      const car = Array.isArray(rows) ? rows[0] : null;

      if (car) {
        title = `${car.year ?? ''} ${car.make ?? ''} ${car.model ?? ''}`.trim() + ' — Ekami Auto';

        const bits: string[] = [];
        const rent = xaf(car.price_rent_daily);
        const sale = xaf(car.price_sale);
        if (rent) bits.push(`Rent from ${rent}/day`);
        if (sale) bits.push(`For sale: ${sale}`);
        const specs = [car.body_type, car.transmission, car.seats ? `${car.seats} seats` : null,
          car.current_city || car.location].filter(Boolean).join(' · ');
        description = [bits.join(' · '), specs].filter(Boolean).join('  |  ') ||
          (car.description ? String(car.description).slice(0, 160) : description);

        const img = Array.isArray(car.images) ? car.images[0] : null;
        if (img) image = img;
      }
    }
  } catch {
    // fall through with site defaults
  }

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta property="og:type" content="product" />
<meta property="og:site_name" content="Ekami Auto" />
<meta property="og:url" content="${esc(pageUrl)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
<link rel="canonical" href="${esc(pageUrl)}" />
</head>
<body>
<p>${esc(title)}</p>
<p><a href="${esc(pageUrl)}">View this car on Ekami Auto</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
