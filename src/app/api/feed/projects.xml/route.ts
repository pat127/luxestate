import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase?.from('projects')?.select('id, name, developer, project_type, status, starting_price, location_area, total_units, sold_units, available_units, handover_date')?.eq('published', true)?.order('created_at', { ascending: false });

  if (error || !projects) {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><projects count="0"/>`,
      { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
    );
  }

  const now = new Date()?.toISOString()?.split('T')?.[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

  const projectsXml = projects?.map((p) => `
  <project>
    <id>${p?.id}</id>
    <name><![CDATA[${p?.name || ''}]]></name>
    <developer><![CDATA[${p?.developer || ''}]]></developer>
    <type>${p?.project_type || ''}</type>
    <status>${p?.status || ''}</status>
    <starting_price currency="AED">${p?.starting_price || 0}</starting_price>
    <location>
      <area><![CDATA[${p?.location_area || ''}]]></area>
    </location>
    <units>
      <total>${p?.total_units || 0}</total>
      <sold>${p?.sold_units || 0}</sold>
      <available>${p?.available_units ?? ((p?.total_units || 0) - (p?.sold_units || 0))}</available>
    </units>
    <completion><![CDATA[${p?.handover_date || ''}]]></completion>
    <updated>${now}</updated>
    <url>${siteUrl}/projects/${p?.id}</url>
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
