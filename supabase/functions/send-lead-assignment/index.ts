import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

declare const Deno: { env: { get(key: string): string | undefined } };

serve(async (req) => {
  // ✅ CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  try {
    const {
      agent_name,
      agent_email,
      leads, // array of { name, phone, email, status, source, budget, interest }
      is_bulk,
      assigned_by,
    } = await req.json();

    if (!agent_email || !agent_name || !leads || leads.length === 0) {
      return new Response(JSON.stringify({ error: "Missing required fields: agent_email, agent_name, leads" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const leadCount = leads.length;
    const isBulk = is_bulk || leadCount > 1;
    const subject = isBulk
      ? `[Cove Estates CRM] ${leadCount} Leads Assigned to You`
      : `[Cove Estates CRM] New Lead Assigned — ${leads[0].name}`;

    const leadsTableRows = leads
      .map(
        (lead: any) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #222222;">
            <p style="margin:0;font-size:13px;color:#ffffff;font-weight:600;">${lead.name || "—"}</p>
            ${lead.phone ? `<p style="margin:3px 0 0;font-size:11px;color:#999999;">${lead.phone}</p>` : ""}
            ${lead.email ? `<p style="margin:2px 0 0;font-size:11px;color:#C5A47E;">${lead.email}</p>` : ""}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #222222;vertical-align:top;">
            ${lead.status ? `<span style="display:inline-block;padding:2px 8px;background:#C5A47E22;color:#C5A47E;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">${lead.status}</span>` : ""}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #222222;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#888888;">${lead.source || "—"}</p>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #222222;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#C5A47E;font-weight:600;">${lead.budget || "—"}</p>
          </td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222222;max-width:600px;width:100%;">
                  <!-- Header -->
                  <tr>
                    <td style="padding:32px 40px 24px;border-bottom:1px solid #222222;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#C5A47E;">Cove Estates CRM</p>
                      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
                        ${isBulk ? `${leadCount} Leads Assigned to You` : `New Lead Assigned`}
                      </h1>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 40px;">
                      <p style="margin:0 0 8px;font-size:14px;color:#999999;line-height:1.6;">
                        Dear <strong style="color:#ffffff;">${agent_name}</strong>,
                      </p>
                      <p style="margin:0 0 28px;font-size:14px;color:#999999;line-height:1.6;">
                        ${
                          isBulk
                            ? `<strong style="color:#C5A47E;">${leadCount} leads</strong> have been assigned to you${assigned_by ? ` by <strong style="color:#ffffff;">${assigned_by}</strong>` : ""}. Please review and follow up promptly.`
                            : `A new lead has been assigned to you${assigned_by ? ` by <strong style="color:#ffffff;">${assigned_by}</strong>` : ""}. Please review the details below and follow up as soon as possible.`
                        }
                      </p>

                      <!-- Leads Table -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #C5A47E33;margin-bottom:28px;">
                        <tr>
                          <td style="padding:16px 20px 0;">
                            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#C5A47E;">
                              ${isBulk ? "Assigned Leads" : "Lead Details"}
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 20px 16px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <thead>
                                <tr>
                                  <th style="text-align:left;padding:0 0 8px;font-size:10px;color:#555555;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Lead</th>
                                  <th style="text-align:left;padding:0 0 8px;font-size:10px;color:#555555;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Status</th>
                                  <th style="text-align:left;padding:0 0 8px;font-size:10px;color:#555555;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Source</th>
                                  <th style="text-align:left;padding:0 0 8px;font-size:10px;color:#555555;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Budget</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${leadsTableRows}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA -->
                      <a href="https://coveestate.com/admin/leads" style="display:inline-block;background:#C5A47E;color:#0a0a0a;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;padding:12px 28px;text-decoration:none;">
                        View Leads in CRM →
                      </a>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid #222222;">
                      <p style="margin:0;font-size:11px;color:#444444;text-align:center;">© Cove Estates CRM · Automated lead assignment notification</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [agent_email],
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.message || "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
