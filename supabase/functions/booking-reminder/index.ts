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
    // Hardcoded for Rozeyy's booking — change or remove after use
    let booking_id = "4ab532ef-acae-48f3-ba87-579361723171";
    try {
      const body = await req.json();
      if (body?.booking_id) booking_id = body.booking_id;
    } catch (_) {}

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

    const depositAmount = Number(booking.deposit_amount);
    const totalPrice = Number(booking.total_price);
    const remainingBalance = totalPrice - depositAmount;

    const reminderHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111111;">
        
        <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px;">Getting ready for your appointment! &nbsp;💈</h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hey ${booking.name},<br/><br/>
          Just a quick message to let you know I'm preparing for your booking. Here are your details so you can double check everything is correct.
        </p>

        <div style="background-color: #f4f4f4; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h3 style="margin-top: 0; margin-bottom: 15px;">Your Booking Details:</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 15px; line-height: 1.8;">
            <li><strong>Date:</strong> ${dateFormatted}</li>
            <li><strong>Time:</strong> ${timeFormatted}</li>
            <li><strong>Location:</strong> Eccles, Salford &middot; M30 7PL</li>
            <li style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;"><strong>Service Price:</strong> &pound;${totalPrice.toFixed(2)}</li>
            <li><strong>Deposit Paid:</strong> &pound;${depositAmount.toFixed(2)}</li>
            ${remainingBalance > 0
              ? `<li style="font-size: 16px; margin-top: 5px; color: #0B6B4F;"><strong>Left to pay on the day:</strong> &pound;${remainingBalance.toFixed(2)}</li>`
              : `<li style="font-size: 16px; margin-top: 5px; color: #0B6B4F;"><strong>&check; Paid in Full</strong></li>`
            }
          </ul>
          ${booking.notes ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 14px;">
            <strong>Your notes:</strong><br/>
            <span style="color: #444; font-style: italic;">${booking.notes}</span>
          </div>
          ` : ''}
        </div>

        <p style="font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
          If anything above doesn't look right, just reply to this email or DM me on Instagram <a href="https://instagram.com/locsbywog" style="color: #0B6B4F; font-weight: bold;">@locsbywog</a> and I'll sort it out.
        </p>

        <div style="background-color: #0B6B4F; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="color: #ffffff; font-size: 14px; margin: 0; line-height: 1.5;">
            <strong>Quick reminder:</strong> Please arrive on time. There is a &pound;10 fee for lateness over 15 minutes past your appointment time.
          </p>
        </div>

        <p style="font-size: 15px; font-weight: bold;">
          See you soon,<br/>
          Wog
        </p>
        
        <p style="font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
          LocsByWog &middot; Eccles, Salford &middot; M30 7PL
        </p>
      </div>
    `;

    await resend.emails.send({
      from: "LocsByWog <bookings@blocq.co.uk>",
      to: [booking.email],
      subject: `Getting ready for your booking, ${booking.name}! 💈`,
      html: reminderHtml,
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Reminder sent to ${booking.email} for ${booking.name}'s booking on ${dateFormatted}` 
    }), {
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
