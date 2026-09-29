import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

declare const Deno: { env: { get(key: string): string | undefined } };

serve(async (req) => {
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
      type, // 'review_requested' | 'approved' | 'rejected'
      to,
      recipient_name,
      item_type, // 'property' | 'project'
      item_title,
      item_ref,
      submitted_by_name,
      submitted_by_role,
      comments,
      admin_url,
    } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
    const itemLabel = item_type === 'project' ? 'Project' : 'Property';
    const approvalUrl = admin_url || "https://coveestate.com/admin/approvals";

    let subject = "";
    let html = "";

    if (type === "review_requested") {
      subject = `[Cove Estates] Approval Required: ${itemLabel} — ${item_title}`;
      html = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
          <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
              <tr><td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222222;max-width:560px;width:100%;">
                  <tr>
                    <td style="padding:32px 40px 24px;border-bottom:1px solid #222222;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#C5A47E;">Cove Estates CRM</p>
                      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;">Approval Required</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px 40px;">
                      <p style="margin:0 0 20px;font-size:14px;color:#999999;line-height:1.6;">Dear <strong style="color:#ffffff;">${recipient_name}</strong>,</p>
                      <p style="margin:0 0 24px;font-size:14px;color:#999999;line-height:1.6;">
                        A new ${itemLabel.toLowerCase()} listing has been submitted for your approval by <strong style="color:#C5A47E;">${submitted_by_name}</strong> (${submitted_by_role}).
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #C5A47E33;margin-bottom:28px;">
                        <tr>
                          <td style="padding:20px 24px;">
                            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#C5A47E;">${itemLabel} Details</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr><td style="padding:8px 0;border-bottom:1px solid #222222;">
                                <span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">${itemLabel} Title</span>
                                <p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${item_title}</p>
                              </td></tr>
                              ${item_ref ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;">
                                <span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Reference</span>
                                <p style="margin:4px 0 0;font-size:14px;color:#C5A47E;font-weight:600;">${item_ref}</p>
                              </td></tr>` : ''}
                              <tr><td style="padding:8px 0;">
                                <span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Submitted By</span>
                                <p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${submitted_by_name} <span style="color:#666;font-weight:400;">(${submitted_by_role})</span></p>
                              </td></tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <a href="${approvalUrl}" style="display:inline-block;background:#C5A47E;color:#0a0a0a;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;padding:12px 28px;text-decoration:none;">
                        Review &amp; Approve →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid #222222;">
                      <p style="margin:0;font-size:11px;color:#444444;text-align:center;">© Cove Estates CRM · Automated approval notification</p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `;
    } else if (type === "approved") {
      subject = `[Cove Estates] Your ${itemLabel} Has Been Approved — ${item_title}`;
      html = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
          <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
              <tr><td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222222;max-width:560px;width:100%;">
                  <tr>
                    <td style="padding:32px 40px 24px;border-bottom:1px solid #222222;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#C5A47E;">Cove Estates CRM</p>
                      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#10b981;">✓ Approved</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px 40px;">
                      <p style="margin:0 0 20px;font-size:14px;color:#999999;line-height:1.6;">Dear <strong style="color:#ffffff;">${recipient_name}</strong>,</p>
                      <p style="margin:0 0 24px;font-size:14px;color:#999999;line-height:1.6;">
                        Great news! Your ${itemLabel.toLowerCase()} listing has been <strong style="color:#10b981;">approved</strong>. You can now publish it to the website.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #10b98133;margin-bottom:28px;">
                        <tr>
                          <td style="padding:20px 24px;">
                            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#10b981;">${itemLabel} Approved</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr><td style="padding:8px 0;border-bottom:1px solid #222222;">
                                <span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">${itemLabel}</span>
                                <p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${item_title}</p>
                              </td></tr>
                              ${item_ref ? `<tr><td style="padding:8px 0;">
                                <span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Reference</span>
                                <p style="margin:4px 0 0;font-size:14px;color:#C5A47E;font-weight:600;">${item_ref}</p>
                              </td></tr>` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>
                      <a href="${approvalUrl.replace('/approvals', item_type === 'project' ? '/projects' : '/properties')}" style="display:inline-block;background:#10b981;color:#ffffff;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;padding:12px 28px;text-decoration:none;">
                        Go to ${itemLabel}s →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid #222222;">
                      <p style="margin:0;font-size:11px;color:#444444;text-align:center;">© Cove Estates CRM · Automated approval notification</p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `;
    } else if (type === "rejected") {
      subject = `[Cove Estates] Changes Requested: ${itemLabel} — ${item_title}`;
      html = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
          <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
              <tr><td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222222;max-width:560px;width:100%;">
                  <tr>
                    <td style="padding:32px 40px 24px;border-bottom:1px solid #222222;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#C5A47E;">Cove Estates CRM</p>
                      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#f59e0b;">Changes Requested</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px 40px;">
                      <p style="margin:0 0 20px;font-size:14px;color:#999999;line-height:1.6;">Dear <strong style="color:#ffffff;">${recipient_name}</strong>,</p>
                      <p style="margin:0 0 24px;font-size:14px;color:#999999;line-height:1.6;">
                        Your ${itemLabel.toLowerCase()} listing requires some changes before it can be approved. Please review the comments below and resubmit.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #f59e0b33;margin-bottom:28px;">
                        <tr>
                          <td style="padding:20px 24px;">
                            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#f59e0b;">${itemLabel} Details</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr><td style="padding:8px 0;border-bottom:1px solid #222222;">
                                <span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">${itemLabel}</span>
                                <p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${item_title}</p>
                              </td></tr>
                              ${item_ref ? `<tr><td style="padding:8px 0;border-bottom:1px solid #222222;">
                                <span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Reference</span>
                                <p style="margin:4px 0 0;font-size:14px;color:#C5A47E;font-weight:600;">${item_ref}</p>
                              </td></tr>` : ''}
                              ${comments ? `<tr><td style="padding:8px 0;">
                                <span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Comments from CEO</span>
                                <p style="margin:4px 0 0;font-size:14px;color:#f59e0b;line-height:1.6;">${comments}</p>
                              </td></tr>` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>
                      <a href="${approvalUrl.replace('/approvals', item_type === 'project' ? '/projects' : '/properties')}" style="display:inline-block;background:#C5A47E;color:#0a0a0a;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;padding:12px 28px;text-decoration:none;">
                        Update ${itemLabel} →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid #222222;">
                      <p style="margin:0;font-size:11px;color:#444444;text-align:center;">© Cove Estates CRM · Automated approval notification</p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `;
    } else {
      return new Response(JSON.stringify({ error: "Invalid notification type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

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
