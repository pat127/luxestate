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
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
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

    const roleLabel: Record<string, string> = {
      super_admin: "Super Admin / CEO",
      admin: "Admin",
      marketing: "Marketing",
      agent: "Agent",
    };

    const emailHtml = `
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
                      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Welcome to the Team</h1>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 40px;">
                      <p style="margin:0 0 20px;font-size:14px;color:#999999;line-height:1.6;">Hi <strong style="color:#ffffff;">${name}</strong>,</p>
                      <p style="margin:0 0 24px;font-size:14px;color:#999999;line-height:1.6;">
                        Your LuxEstate CRM account has been created. Below are your login credentials. Please keep them secure and change your password after your first login.
                      </p>
                      <!-- Credentials Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #C5A47E33;margin-bottom:24px;">
                        <tr>
                          <td style="padding:20px 24px;">
                            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#C5A47E;">Your Credentials</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding:8px 0;border-bottom:1px solid #222222;">
                                  <span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Username / Email</span>
                                  <p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${email}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0;border-bottom:1px solid #222222;">
                                  <span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Temporary Password</span>
                                  <p style="margin:4px 0 0;font-size:14px;color:#C5A47E;font-weight:700;font-family:monospace;letter-spacing:0.05em;">${password}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0;">
                                  <span style="font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.1em;">Role</span>
                                  <p style="margin:4px 0 0;font-size:14px;color:#ffffff;font-weight:600;">${roleLabel[role] || role}</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0 0 24px;font-size:13px;color:#666666;line-height:1.6;">
                        ⚠️ For security, please change your password immediately after logging in for the first time.
                      </p>
                      <p style="margin:0;font-size:13px;color:#666666;line-height:1.6;">
                        If you have any questions, contact your administrator.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid #222222;">
                      <p style="margin:0;font-size:11px;color:#444444;text-align:center;">© LuxEstate · This is an automated message, please do not reply.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [email],
        subject: `Welcome to LuxEstate CRM — Your Account Details`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return new Response(JSON.stringify({ error: resendData.message || "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ success: true, emailId: resendData.id }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
