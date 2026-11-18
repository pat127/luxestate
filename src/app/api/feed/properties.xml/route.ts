import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: properties, error } = await supabase?.from('properties')?.select('id, reference_number, title, property_type, availability, price_aed, location_area, community, full_address, latitude, longitude, bedrooms, bathrooms, area_sqft, agent_name')?.eq('published', true)?.order('created_at', { ascending: false });

  if (error || !properties) {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><listings count="0"/>`,
      { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
    );
  }

  const now = new Date()?.toISOString()?.split('T')?.[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

  const listingsXml = properties?.map((p) => `
  <listing>
    <id>${p?.reference_number || p?.id}</id>
    <title><![CDATA[${p?.title || ''}]]></title>
    <type>${p?.property_type || ''}</type>
    <status>${p?.availability || ''}</status>
    <price currency="AED">${p?.price_aed || 0}</price>
    <location>
      <area><![CDATA[${p?.location_area || ''}]]></area>
      <community><![CDATA[${p?.community || ''}]]></community>
      <address><![CDATA[${p?.full_address || ''}]]></address>
      <lat>${p?.latitude || ''}</lat>
      <lng>${p?.longitude || ''}</lng>
    </location>
    <specs>
      <bedrooms>${p?.bedrooms || 0}</bedrooms>
      <bathrooms>${p?.bathrooms || 0}</bathrooms>
      <area_sqft>${p?.area_sqft || 0}</area_sqft>
    </specs>
    <agent><![CDATA[${p?.agent_name || ''}]]></agent>
    <updated>${now}</updated>
    <url>${siteUrl}/properties/${p?.id}</url>
  </listing>`)?.join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<listings xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" generated="${now}" count="${properties?.length}">
${listingsXml}
</listings>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
