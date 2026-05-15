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
    const { name, email, phone, budget, propertyType, message, formType, projectName, reference } = await req.json();

    if (!name || !email) {
      return new Response(JSON.stringify({ error: "Missing required fields: name and email" }), {
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

    const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "onboarding@resend.dev";

    // ─── Form type labels ───────────────────────────────────────────────────────
    const formLabels: Record<string, string> = {
      contact: "General Contact",
      property_inquiry: "Property Enquiry",
      project_inquiry: "Project Priority Registration",
    };
    const formLabel = formLabels[formType] || "Inquiry";

    // ─── Confirmation email to inquirer ─────────────────────────────────────────
    const confirmationHtml = `
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
                <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222222;max-width:560px;width:100%;">
                  <!-- Header -->
                  <tr>
                    <td style="padding:32px 40px 24px;border-bottom:1px solid #222222;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#C5A47E;">LuxEstate</p>
                      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">We've Received Your ${formLabel}</h1>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 40px;">
                      <p style="margin:0 0 20px;font-size:14px;color:#999999;line-height:1.6;">Dear <strong style="color:#ffffff;">${name}</strong>,</p>
                      <p style="margin:0 0 24px;font-size:14px;color:#999999;line-height:1.6;">
                        Thank you for reaching out to LuxEstate. We have received your inquiry and a member of our team will be in touch with you within 24 hours.
                      </p>
                      ${(projectName || propertyType || budget || message) ? `
                      <!-- Summary Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #C5A47E33;margin-bottom:24px;">
                        <tr>
                          <td style="padding:20px 24px;">
                            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#C5A47E;">Your Submission Summary</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              ${projectName ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">${formType === 'project_inquiry' ? 'Project of Interest' : 'Property'}</span><p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${projectName}${reference ? ` (Ref: ${reference})` : ''}</p></td></tr>` : ''}
                              ${propertyType ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Property Type</span><p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${propertyType}</p></td></tr>` : ''}
                              ${budget ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Budget</span><p style="margin:4px 0 0;font-size:14px;color:#C5A47E;font-weight:700;">${budget}</p></td></tr>` : ''}
                              ${phone ? `<tr><td style="padding:8px 0;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Phone</span><p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${phone}</p></td></tr>` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>
                      ` : ''}
                      <p style="margin:0 0 8px;font-size:13px;color:#666666;line-height:1.6;">
                        Our specialists are available to assist you with any questions in the meantime.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid #222222;">
                      <p style="margin:0;font-size:11px;color:#444444;text-align:center;">© LuxEstate · This is an automated confirmation, please do not reply.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // ─── Notification email to admin ─────────────────────────────────────────────
    const adminHtml = `
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
                <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222222;max-width:560px;width:100%;">
                  <!-- Header -->
                  <tr>
                    <td style="padding:32px 40px 24px;border-bottom:1px solid #222222;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#C5A47E;">LuxEstate CRM</p>
                      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">New ${formLabel} Received</h1>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 40px;">
                      <p style="margin:0 0 24px;font-size:14px;color:#999999;line-height:1.6;">
                        A new lead has been submitted via the website. Details below:
                      </p>
                      <!-- Lead Details -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #C5A47E33;margin-bottom:24px;">
                        <tr>
                          <td style="padding:20px 24px;">
                            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#C5A47E;">Lead Information</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding:8px 0;border-bottom:1px solid #222222;">
                                  <span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Name</span>
                                  <p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${name}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0;border-bottom:1px solid #222222;">
                                  <span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Email</span>
                                  <p style="margin:4px 0 0;font-size:14px;color:#C5A47E;font-weight:600;">${email}</p>
                                </td>
                              </tr>
                              ${phone ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Phone</span><p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${phone}</p></td></tr>` : ''}
                              ${budget ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Budget</span><p style="margin:4px 0 0;font-size:14px;color:#C5A47E;font-weight:700;">${budget}</p></td></tr>` : ''}
                              ${propertyType ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Property Type</span><p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${propertyType}</p></td></tr>` : ''}
                              ${projectName ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">${formType === 'project_inquiry' ? 'Project of Interest' : 'Property'}</span><p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${projectName}${reference ? ` (Ref: ${reference})` : ''}</p></td></tr>` : ''}
                              ${message ? `<tr><td style="padding:8px 0;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Message</span><p style="margin:4px 0 0;font-size:13px;color:#999999;line-height:1.5;">${message}</p></td></tr>` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0;font-size:12px;color:#555555;line-height:1.6;">
                        Source: <strong style="color:#888888;">${formLabel}</strong> · This lead has been automatically added to your CRM.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid #222222;">
                      <p style="margin:0;font-size:11px;color:#444444;text-align:center;">© LuxEstate CRM · Automated lead notification</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // ─── Send both emails ────────────────────────────────────────────────────────
    const [confirmationRes, adminRes] = await Promise.all([
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: [email],
          subject: `LuxEstate — We've Received Your ${formLabel}`,
          html: confirmationHtml,
        }),
      }),
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: [ADMIN_EMAIL],
          subject: `[LuxEstate] New ${formLabel} from ${name}`,
          html: adminHtml,
        }),
      }),
    ]);

    const confirmationData = await confirmationRes.json();
    const adminData = await adminRes.json();

    if (!confirmationRes.ok || !adminRes.ok) {
      return new Response(
        JSON.stringify({
          error: "One or more emails failed to send",
          confirmationError: !confirmationRes.ok ? confirmationData : null,
          adminError: !adminRes.ok ? adminData : null,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, confirmationId: confirmationData.id, adminNotificationId: adminData.id }),
      {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
