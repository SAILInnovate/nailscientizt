import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    let booking_id = "4ab532ef-acae-48f3-ba87-579361723171"; // Most recent booking
    try {
      const body = await req.json();
      if (body?.booking_id) booking_id = body.booking_id;
    } catch (_) {
      // No body sent — use the hardcoded ID
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") as string,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
    );

    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (fetchError || !booking) {
      throw new Error(`Failed to fetch booking: ${fetchError?.message}`);
    }

    let dateFormatted = "Unknown Date";
    let timeFormatted = "Unknown Time";

    if (booking.start_datetime) {
      const d = new Date(booking.start_datetime);
      if (!isNaN(d.getTime())) {
        dateFormatted = d.toLocaleDateString('en-GB', {
          weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
        });
        timeFormatted = d.toLocaleTimeString('en-GB', {
          hour: '2-digit', minute: '2-digit'
        });
      }
    }

    let isLate = false;
    if (booking.start_datetime) {
      const d = new Date(booking.start_datetime);
      const hour = d.getUTCHours();
      isLate = hour >= 22 || hour < 5;
    }

    const cleanIG = (booking.instagram || "").replace('@', '');
    const igLink = `https://instagram.com/${cleanIG}`;
    const cleanPhone = (booking.phone || "").replace(/[^0-9+]/g, '');

    const aishabelEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111111;">
        <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px;">Alright Aishabel, you've got a new booking! &nbsp;🎉 ${isLate ? '<span style="background-color: #FF007F; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; vertical-align: middle; margin-left: 10px;">LATE RATE</span>' : ''}</h2>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          A client has booked a slot and paid their deposit. Here are the details:
        </p>
        <div style="background-color: #f4f4f4; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 15px; line-height: 1.8;">
            <li><strong>Customer:</strong> ${booking.name}</li>
            <li><strong>Instagram:</strong> @${cleanIG}</li>
            <li><strong>Phone:</strong> ${booking.phone}</li>
            <li style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;"><strong>Date:</strong> ${dateFormatted}</li>
            <li><strong>Time:</strong> ${timeFormatted}</li>
            <li><strong>Deposit Paid:</strong> £${Number(booking.deposit_amount).toFixed(2)}</li>
            <li><strong>Balance Due:</strong> £${(Number(booking.total_price) - Number(booking.deposit_amount)).toFixed(2)} ${isLate ? '<span style="color: #FF007F; font-weight: bold;">(Includes Late Rate)</span>' : ''}</li>
          </ul>
          ${booking.notes ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 14px;">
            <strong>Notes from customer:</strong><br/>
            <span style="color: #444; font-style: italic;">${booking.notes}</span>
          </div>
          ` : ''}
        </div>
        <h3 style="font-size: 18px; margin-bottom: 12px;">Get in touch right now:</h3>
        <div style="display: flex; gap: 12px; margin-bottom: 30px;">
          <a href="${igLink}" style="background-color: #111111; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
            DM on Instagram
          </a>
          <a href="tel:${cleanPhone}" style="background-color: #FF007F; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; margin-left:10px;">
             Call / Text
          </a>
        </div>
        <p style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px;">
          This is a re-sent notification from your The Nail Scientizt booking system.
        </p>
      </div>
    `;

    await resend.emails.send({
      from: "The Nail Scientizt <bookings@blocq.co.uk>",
      to: ["thenailscientizt@gmail.com"],
      subject: `${isLate ? '🌙 ' : ''}[RESEND] BOOKING: ${booking.name} on ${dateFormatted} at ${timeFormatted}`,
      html: aishabelEmailHtml,
    });

    return new Response(JSON.stringify({ success: true, message: `Resent notification for ${booking.name}` }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 400,
    });
  }
});
