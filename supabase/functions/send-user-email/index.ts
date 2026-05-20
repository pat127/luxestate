declare const Deno: { env: { get(key: string): string | undefined } };

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  // ✅ CORS preflight
  if (req?.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  try {
    const { type, to, full_name, email, password, user_id, reset_link } = await req?.json();

    const RESEND_API_KEY = Deno?.env?.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    // Use a verified sender domain if configured, otherwise fall back to Resend test address
    // NOTE: onboarding@resend.dev only delivers to the Resend account owner's email.
    // Set RESEND_FROM_EMAIL to a verified domain sender (e.g. noreply@yourdomain.com) to send to any recipient.
    const FROM_EMAIL = Deno?.env?.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";

    let subject = "";
    let html = "";

    if (type === "welcome") {
      subject = "Your Cove Estates Admin Account Credentials";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; padding: 40px; border: 1px solid #262626;">
          <div style="margin-bottom: 32px;">
            <div style="width: 32px; height: 32px; background: #c9a96e; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="color: #0a0a0a; font-weight: 900; font-size: 14px;">C</span>
            </div>
            <h1 style="color: #c9a96e; font-size: 20px; font-weight: 700; margin: 0 0 4px 0; letter-spacing: 0.05em; text-transform: uppercase;">Cove Estates</h1>
            <p style="color: #737373; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Admin Portal</p>
          </div>

          <h2 style="color: #e5e5e5; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Welcome, ${full_name}</h2>
          <p style="color: #a3a3a3; font-size: 14px; margin: 0 0 32px 0;">Your admin account has been created. Use the credentials below to log in.</p>

          <div style="background: #141414; border: 1px solid #262626; padding: 24px; margin-bottom: 24px;">
            <p style="color: #737373; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 16px 0;">Your Login Credentials</p>
            
            <div style="margin-bottom: 16px;">
              <p style="color: #737373; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">User ID</p>
              <p style="color: #c9a96e; font-family: monospace; font-size: 13px; margin: 0; background: #0a0a0a; padding: 8px 12px; border: 1px solid #262626;">${user_id}</p>
            </div>

            <div style="margin-bottom: 16px;">
              <p style="color: #737373; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Email</p>
              <p style="color: #e5e5e5; font-family: monospace; font-size: 13px; margin: 0; background: #0a0a0a; padding: 8px 12px; border: 1px solid #262626;">${email}</p>
            </div>

            <div>
              <p style="color: #737373; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Temporary Password</p>
              <p style="color: #e5e5e5; font-family: monospace; font-size: 13px; margin: 0; background: #0a0a0a; padding: 8px 12px; border: 1px solid #262626;">${password}</p>
            </div>
          </div>

          <p style="color: #737373; font-size: 12px; margin: 0 0 24px 0;">⚠️ Please change your password after your first login for security.</p>

          <a href="https://coveestate.com/admin/login" style="display: inline-block; background: #c9a96e; color: #0a0a0a; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; padding: 12px 24px; text-decoration: none;">
            Log In to Admin Portal →
          </a>

          <p style="color: #404040; font-size: 11px; margin: 32px 0 0 0;">This is an automated message from Cove Estates Admin System. Do not reply to this email.</p>
        </div>
      `;
    } else if (type === "reset") {
      subject = "Reset Your Cove Estates Admin Password";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; padding: 40px; border: 1px solid #262626;">
          <div style="margin-bottom: 32px;">
            <div style="width: 32px; height: 32px; background: #c9a96e; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="color: #0a0a0a; font-weight: 900; font-size: 14px;">C</span>
            </div>
            <h1 style="color: #c9a96e; font-size: 20px; font-weight: 700; margin: 0 0 4px 0; letter-spacing: 0.05em; text-transform: uppercase;">Cove Estates</h1>
            <p style="color: #737373; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Admin Portal</p>
          </div>

          <h2 style="color: #e5e5e5; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Password Reset Request</h2>
          <p style="color: #a3a3a3; font-size: 14px; margin: 0 0 32px 0;">We received a request to reset the password for <strong style="color: #e5e5e5;">${email}</strong>. Click the button below to set a new password.</p>

          <a href="${reset_link}" style="display: inline-block; background: #c9a96e; color: #0a0a0a; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; padding: 12px 24px; text-decoration: none; margin-bottom: 24px;">
            Reset Password →
          </a>

          <p style="color: #737373; font-size: 12px; margin: 24px 0 0 0;">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>

          <p style="color: #404040; font-size: 11px; margin: 32px 0 0 0;">This is an automated message from Cove Estates Admin System. Do not reply to this email.</p>
        </div>
      `;
    } else {
      throw new Error("Invalid email type");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res?.json();
    if (!res?.ok) {
      console.error("Resend API error:", JSON.stringify(data));
      throw new Error(data.message || data.error || "Failed to send email via Resend");
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("send-user-email error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
