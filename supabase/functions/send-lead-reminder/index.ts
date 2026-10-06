import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: { env: { get(key: string): string | undefined } };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // 1. Fetch all pending reminders due today or overdue (not yet resolved)
    const { data: reminders, error: remErr } = await supabase
      .from("lead_reminders")
      .select("*")
      .lte("follow_up_date", todayStr)
      .neq("status", "resolved");

    if (remErr) throw remErr;
    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ success: true, processed: 0 }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let processed = 0;

    for (const reminder of reminders) {
      const isOverdue = reminder.follow_up_date < todayStr;
      const isPushDue =
        !reminder.last_pushed_at ||
        new Date(reminder.last_pushed_at).toISOString().split("T")[0] !== todayStr;

      if (!isPushDue) continue; // Already pushed today

      // 2. Check if lead status is still not terminal (not Lost/Won)
      const { data: lead } = await supabase
        .from("leads")
        .select("status, name, email, phone, assigned_agent, follow_up_date")
        .eq("id", reminder.lead_id)
        .maybeSingle();

      // If lead is Lost or follow_up_date changed, resolve reminder
      if (!lead || lead.status === "Lost") {
        await supabase
          .from("lead_reminders")
          .update({ status: "resolved", updated_at: new Date().toISOString() })
          .eq("id", reminder.id);
        continue;
      }

      const pushCount = (reminder.push_count || 0) + 1;
      const overdueLabel = isOverdue
        ? ` (${Math.ceil((today.getTime() - new Date(reminder.follow_up_date).getTime()) / 86400000)} day${pushCount > 1 ? "s" : ""} overdue)`
        : "";

      // 3. Create in-app notification
      await supabase.from("crm_notifications").insert({
        type: "follow_up",
        title: `Follow-up Due: ${reminder.lead_name}${overdueLabel}`,
        message: `${reminder.assigned_agent ? `Assigned to ${reminder.assigned_agent}. ` : ""}Follow-up was scheduled for ${reminder.follow_up_date}. Update the lead status to resolve this reminder.`,
        lead_id: reminder.lead_id,
        lead_name: reminder.lead_name,
        action_url: "/admin/leads",
        read: false,
      });

      // 4. Create / push task
      const taskTitle = `Follow up with ${reminder.lead_name}${overdueLabel}`;
      const taskDesc = `Lead follow-up reminder${isOverdue ? " (OVERDUE)" : ""}. Phone: ${reminder.lead_phone || "—"} | Email: ${reminder.lead_email || "—"}. Update lead status to resolve this task.`;

      // Check if an open follow-up task already exists for this lead
      const { data: existingTask } = await supabase
        .from("tasks")
        .select("id")
        .ilike("title", `%Follow up with ${reminder.lead_name}%`)
        .neq("status", "Completed")
        .maybeSingle();

      if (existingTask) {
        // Push the due date forward to today and update title
        await supabase
          .from("tasks")
          .update({
            title: taskTitle,
            description: taskDesc,
            due_date: todayStr,
            priority: isOverdue ? "High" : "Medium",
          })
          .eq("id", existingTask.id);
      } else {
        // Create new task
        await supabase.from("tasks").insert({
          title: taskTitle,
          description: taskDesc,
          assignee: reminder.assigned_agent || "Admin",
          priority: isOverdue ? "High" : "Medium",
          status: "Todo",
          category: "Lead",
          due_date: todayStr,
        });
      }

      // 5. Send email reminder if agent email available
      if (RESEND_API_KEY && reminder.agent_email) {
        const subject = isOverdue
          ? `[OVERDUE] Follow-up Required: ${reminder.lead_name}`
          : `[Reminder] Follow-up Due Today: ${reminder.lead_name}`;

        const html = `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222222;max-width:600px;width:100%;">
                    <tr>
                      <td style="padding:32px 40px 24px;border-bottom:1px solid #222222;">
                        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#C5A47E;">Cove Estates CRM</p>
                        <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:${isOverdue ? "#ef4444" : "#ffffff"};letter-spacing:-0.02em;">
                          ${isOverdue ? "⚠️ Overdue Follow-up" : "📅 Follow-up Due Today"}
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px 40px;">
                        <p style="margin:0 0 20px;font-size:14px;color:#999999;line-height:1.6;">
                          Dear <strong style="color:#ffffff;">${reminder.assigned_agent || "Team"}</strong>,
                        </p>
                        <p style="margin:0 0 28px;font-size:14px;color:#999999;line-height:1.6;">
                          ${isOverdue
                            ? `A follow-up with <strong style="color:#C5A47E;">${reminder.lead_name}</strong> is <strong style="color:#ef4444;">overdue</strong> (was due ${reminder.follow_up_date}). This is push #${pushCount}.`
                            : `Your follow-up with <strong style="color:#C5A47E;">${reminder.lead_name}</strong> is due <strong style="color:#ffffff;">today</strong>.`
                          }
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #C5A47E33;margin-bottom:28px;">
                          <tr><td style="padding:16px 20px 0;">
                            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#C5A47E;">Lead Details</p>
                          </td></tr>
                          <tr><td style="padding:0 20px 16px;">
                            <p style="margin:0 0 6px;font-size:14px;color:#ffffff;font-weight:600;">${reminder.lead_name}</p>
                            ${reminder.lead_phone ? `<p style="margin:0 0 4px;font-size:12px;color:#999999;">📞 ${reminder.lead_phone}</p>` : ""}
                            ${reminder.lead_email ? `<p style="margin:0 0 4px;font-size:12px;color:#C5A47E;">✉️ ${reminder.lead_email}</p>` : ""}
                            <p style="margin:8px 0 0;font-size:11px;color:#555555;">Follow-up Date: ${reminder.follow_up_date}</p>
                          </td></tr>
                        </table>
                        <a href="https://coveestate.com/admin/leads" style="display:inline-block;background:#C5A47E;color:#0a0a0a;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;padding:12px 28px;text-decoration:none;">
                          Open Lead in CRM →
                        </a>
                        <p style="margin:20px 0 0;font-size:11px;color:#444444;">
                          This reminder will keep pushing daily until the lead status is updated.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 40px;border-top:1px solid #222222;">
                        <p style="margin:0;font-size:11px;color:#444444;text-align:center;">© Cove Estates CRM · Automated follow-up reminder</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
          </html>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "onboarding@resend.dev",
            to: [reminder.agent_email],
            subject,
            html,
          }),
        });
      }

      // 6. Update reminder record
      await supabase
        .from("lead_reminders")
        .update({
          reminder_sent_at: new Date().toISOString(),
          last_pushed_at: new Date().toISOString(),
          push_count: pushCount,
          status: "sent",
          updated_at: new Date().toISOString(),
        })
        .eq("id", reminder.id);

      processed++;
    }

    return new Response(JSON.stringify({ success: true, processed }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
