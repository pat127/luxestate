import { NextResponse } from 'next/server';

const projects = [
  { id: 1, ref: 'LX-PRJ-001', name: 'Skyline Residences', developer: 'Emaar', type: 'Off-Plan', status: 'Active', startingPrice: 1200000, area: 'Downtown Dubai', totalUnits: 240, soldUnits: 180, completion: 'Q4 2026' },
  { id: 2, ref: 'LX-PRJ-002', name: 'Marina Bay Towers', developer: 'DAMAC', type: 'Off-Plan', status: 'Active', startingPrice: 900000, area: 'Dubai Marina', totalUnits: 320, soldUnits: 210, completion: 'Q2 2027' },
  { id: 3, ref: 'LX-PRJ-003', name: 'Palm Grove Villas', developer: 'Nakheel', type: 'Completed', status: 'Completed', startingPrice: 8000000, area: 'Palm Jumeirah', totalUnits: 48, soldUnits: 48, completion: 'Q1 2024' },
  { id: 4, ref: 'LX-PRJ-004', name: 'Creek Horizon', developer: 'Meraas', type: 'Off-Plan', status: 'Launching', startingPrice: 1800000, area: 'Dubai Creek', totalUnits: 180, soldUnits: 0, completion: 'Q3 2028' },
];

export async function GET() {
  const now = new Date()?.toISOString()?.split('T')?.[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

  const projectsXml = projects?.map((p) => `
  <project>
    <id>${p?.ref}</id>
    <name><![CDATA[${p?.name}]]></name>
    <developer><![CDATA[${p?.developer}]]></developer>
    <type>${p?.type}</type>
    <status>${p?.status}</status>
    <starting_price currency="AED">${p?.startingPrice}</starting_price>
    <location>
      <area><![CDATA[${p?.area}]]></area>
    </location>
    <units>
      <total>${p?.totalUnits}</total>
      <sold>${p?.soldUnits}</sold>
      <available>${p?.totalUnits - p?.soldUnits}</available>
    </units>
    <completion><![CDATA[${p?.completion}]]></completion>
    <updated>${now}</updated>
    <url>${siteUrl}/admin/projects/${p?.id}</url>
  </project>`)?.join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<projects xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" generated="${now}" count="${projects?.length}">
${projectsXml}
</projects>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
