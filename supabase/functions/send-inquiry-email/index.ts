import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

declare const Deno: { env: { get(key: string): string | undefined } };

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

const JSON_HEADERS = { "Content-Type": "application/json", ...CORS_HEADERS };

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const isRealEmail = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const v = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return false;
  if (v.startsWith("noreply@") || v.startsWith("no-reply@")) return false;
  return true;
};

serve(async (req) => {
  // ✅ CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    const { phone, budget, propertyType, message, formType, projectName, reference } = body;
    const name = escapeHtml(body.name);
    const rawEmail: string = typeof body.email === "string" ? body.email.trim() : "";
    const email = escapeHtml(rawEmail);

    if (!body.name) {
      return new Response(JSON.stringify({ error: "Missing required field: name" }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: JSON_HEADERS,
      });
    }

    // NOTE: onboarding@resend.dev only delivers to the Resend account owner's email.
    // Set RESEND_FROM_EMAIL to a sender on a verified domain to deliver to any recipient.
    const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
    const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
    if (!ADMIN_EMAIL) {
      console.error("ADMIN_NOTIFICATION_EMAIL not configured — admin lead notification cannot be delivered");
    }

    // ─── Form type labels ───────────────────────────────────────────────────────
    const formLabels: Record<string, string> = {
      contact: "General Contact",
      property_inquiry: "Property Enquiry",
      project_inquiry: "Project Priority Registration",
      landing_page: "Landing Page Registration",
    };
    const formLabel = formLabels[formType] || "Inquiry";

    const safePhone = escapeHtml(phone);
    const safeBudget = escapeHtml(budget);
    const safePropertyType = escapeHtml(propertyType);
    const safeMessage = escapeHtml(message);
    const safeProjectName = escapeHtml(projectName);
    const safeReference = escapeHtml(reference);

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
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#C5A47E;">Cove Estates</p>
                      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">We've Received Your ${formLabel}</h1>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 40px;">
                      <p style="margin:0 0 20px;font-size:14px;color:#999999;line-height:1.6;">Dear <strong style="color:#ffffff;">${name}</strong>,</p>
                      <p style="margin:0 0 24px;font-size:14px;color:#999999;line-height:1.6;">
                        Thank you for reaching out to Cove Estates. We have received your inquiry and a member of our team will be in touch with you within 24 hours.
                      </p>
                      ${(projectName || propertyType || budget || message) ? `
                      <!-- Summary Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #C5A47E33;margin-bottom:24px;">
                        <tr>
                          <td style="padding:20px 24px;">
                            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#C5A47E;">Your Submission Summary</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              ${projectName ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">${formType === 'project_inquiry' || formType === 'landing_page' ? 'Project of Interest' : 'Property'}</span><p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${safeProjectName}${reference ? ` (Ref: ${safeReference})` : ''}</p></td></tr>` : ''}
                              ${propertyType ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Property Type</span><p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${safePropertyType}</p></td></tr>` : ''}
                              ${budget ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Budget</span><p style="margin:4px 0 0;font-size:14px;color:#C5A47E;font-weight:700;">${safeBudget}</p></td></tr>` : ''}
                              ${phone ? `<tr><td style="padding:8px 0;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Phone</span><p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${safePhone}</p></td></tr>` : ''}
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
                      <p style="margin:0;font-size:11px;color:#444444;text-align:center;">© Cove Estates · This is an automated confirmation, please do not reply.</p>
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
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#C5A47E;">Cove Estates CRM</p>
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
                              ${isRealEmail(rawEmail) ? `<tr>
                                <td style="padding:8px 0;border-bottom:1px solid #222222;">
                                  <span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Email</span>
                                  <p style="margin:4px 0 0;font-size:14px;color:#C5A47E;font-weight:600;">${email}</p>
                                </td>
                              </tr>` : ''}
                              ${phone ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Phone</span><p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${safePhone}</p></td></tr>` : ''}
                              ${budget ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Budget</span><p style="margin:4px 0 0;font-size:14px;color:#C5A47E;font-weight:700;">${safeBudget}</p></td></tr>` : ''}
                              ${propertyType ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Property Type</span><p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${safePropertyType}</p></td></tr>` : ''}
                              ${projectName ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">${formType === 'project_inquiry' || formType === 'landing_page' ? 'Project of Interest' : 'Property'}</span><p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${safeProjectName}${reference ? ` (Ref: ${safeReference})` : ''}</p></td></tr>` : ''}
                              ${message ? `<tr><td style="padding:8px 0;"><span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Message</span><p style="margin:4px 0 0;font-size:13px;color:#999999;line-height:1.5;">${safeMessage}</p></td></tr>` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0 0 20px;font-size:12px;color:#555555;line-height:1.6;">
                        Source: <strong style="color:#888888;">${formLabel}</strong> · This lead has been automatically added to your CRM.
                      </p>
                      <a href="https://coveestate.com/admin/leads" style="display:inline-block;background:#C5A47E;color:#0a0a0a;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;padding:12px 28px;text-decoration:none;">
                        View Leads in CRM →
                      </a>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid #222222;">
                      <p style="margin:0;font-size:11px;color:#444444;text-align:center;">© Cove Estates CRM · Automated lead notification</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const sendEmail = async (to: string, subject: string, html: string, replyTo?: string) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject,
          html,
          ...(replyTo ? { reply_to: replyTo } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, data };
    };

    // ─── Admin notification (primary — must always be attempted) ─────────────────
    let adminResult: { ok: boolean; data: any } = {
      ok: false,
      data: { error: "ADMIN_NOTIFICATION_EMAIL not configured" },
    };
    if (ADMIN_EMAIL) {
      adminResult = await sendEmail(
        ADMIN_EMAIL,
        `[Cove Estates] New ${formLabel} from ${String(body.name)}`,
        adminHtml,
        isRealEmail(rawEmail) ? rawEmail : undefined
      );
      if (!adminResult.ok) {
        console.error("Admin notification failed:", JSON.stringify(adminResult.data));
      }
    }

    // ─── Visitor confirmation (best-effort, independent of admin notification) ───
    let confirmationResult: { ok: boolean; data: any } | null = null;
    if (isRealEmail(rawEmail)) {
      confirmationResult = await sendEmail(
        rawEmail,
        `Cove Estates — We've Received Your ${formLabel}`,
        confirmationHtml
      );
      if (!confirmationResult.ok) {
        console.error("Visitor confirmation failed:", JSON.stringify(confirmationResult.data));
      }
    }

    if (!adminResult.ok) {
      return new Response(
        JSON.stringify({
          error: "Admin lead notification failed",
          adminError: adminResult.data,
          confirmationSent: confirmationResult?.ok ?? false,
        }),
        { status: 500, headers: JSON_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        adminNotificationId: adminResult.data?.id,
        confirmationSent: confirmationResult?.ok ?? false,
        confirmationError: confirmationResult && !confirmationResult.ok ? confirmationResult.data : null,
      }),
      { headers: JSON_HEADERS }
    );
  } catch (error) {
    console.error("send-inquiry-email error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
});
