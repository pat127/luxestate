import { NextResponse } from 'next/server';

const properties = [
  { id: 1, ref: 'LX-RES-001', title: 'Obsidian Penthouse', type: 'Residential', status: 'Available', price: 28500000, area: 'Downtown Dubai', community: 'Burj Khalifa District', address: 'Obsidian Tower, Downtown Dubai', lat: 25.1972, lng: 55.2744, beds: 5, baths: 6, sqft: 8200, agent: 'Sarah Mitchell' },
  { id: 2, ref: 'LX-RES-002', title: 'Meridian Villa', type: 'Residential', status: 'Under Offer', price: 42000000, area: 'Palm Jumeirah', community: 'Frond N', address: 'Meridian Villa, Palm Jumeirah', lat: 25.1124, lng: 55.1390, beds: 7, baths: 9, sqft: 14500, agent: 'James Carter' },
  { id: 3, ref: 'LX-COM-001', title: 'Atlas Tower Office', type: 'Commercial', status: 'Available', price: 12000000, area: 'DIFC', community: 'Gate Village', address: 'Atlas Tower, DIFC', lat: 25.2131, lng: 55.2796, beds: 0, baths: 0, sqft: 5400, agent: 'Omar Hassan' },
  { id: 4, ref: 'LX-COM-002', title: 'The Crescent Retail', type: 'Commercial', status: 'Sold', price: 8500000, area: 'JBR', community: 'The Walk', address: 'The Crescent, JBR', lat: 25.0777, lng: 55.1333, beds: 0, baths: 0, sqft: 3200, agent: 'Priya Sharma' },
  { id: 5, ref: 'LX-RES-003', title: 'Vantage Estate', type: 'Residential', status: 'Available', price: 65000000, area: 'Emirates Hills', community: 'Sector E', address: 'Vantage Estate, Emirates Hills', lat: 25.0657, lng: 55.1713, beds: 9, baths: 11, sqft: 22000, agent: 'Sarah Mitchell' },
];

export async function GET() {
  const now = new Date()?.toISOString()?.split('T')?.[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

  const listingsXml = properties?.map((p) => `
  <listing>
    <id>${p?.ref}</id>
    <title><![CDATA[${p?.title}]]></title>
    <type>${p?.type}</type>
    <status>${p?.status}</status>
    <price currency="AED">${p?.price}</price>
    <location>
      <area><![CDATA[${p?.area}]]></area>
      <community><![CDATA[${p?.community}]]></community>
      <address><![CDATA[${p?.address}]]></address>
      <lat>${p?.lat}</lat>
      <lng>${p?.lng}</lng>
    </location>
    <specs>
      <bedrooms>${p?.beds}</bedrooms>
      <bathrooms>${p?.baths}</bathrooms>
      <area_sqft>${p?.sqft}</area_sqft>
    </specs>
    <agent><![CDATA[${p?.agent}]]></agent>
    <updated>${now}</updated>
    <url>${siteUrl}/admin/properties/${p?.id}</url>
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
