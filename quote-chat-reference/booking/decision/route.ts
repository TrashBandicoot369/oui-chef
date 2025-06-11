export const runtime = 'nodejs'

import { kv } from "@/lib/kv"
import { sendMail } from "@/lib/mail"
import { addConsult } from "@/lib/calendar"
import { NextResponse } from "next/server"
import { summarizeChatHistory, Message as SummaryMessage } from '@/lib/summary';

// Define Message interface
interface Message {
  role: "user" | "assistant";
  content: string;
  quoted?: boolean;
  quote?: number | null;
}

export async function GET(req: Request) {
  try {
    if (!kv) {
      console.error("[API BOOKING DECISION CONFIG ERROR]", "Upstash KV is not configured. Booking system requires KV.");
      return NextResponse.json(
        { error: "Booking decision service is temporarily unavailable due to a configuration issue. Please try again later." }, 
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const action = searchParams.get("a") // accept | reject

    if (!id || !action) {
      console.error("[API BOOKING DECISION VALIDATION ERROR]", "Missing id or action in query params");
      return NextResponse.json({ error: "Missing required parameters (id or action)" }, { status: 400 });
    }

    const booking = await kv.hgetall<{
      name: string;
      email: string;
      phone: string;
      time: string;
      quote: string;
      status: string;
      tattooDetails?: string;
      chatHistory?: string;
    }>(`booking:${id}`)

    if (!booking) {
      console.warn("[API BOOKING DECISION WARN]", `Booking not found for id: ${id}`);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    
    // Check if booking status has already been set, to prevent reprocessing
    if (booking.status === "accept" || booking.status === "reject") {
        console.log(`[API BOOKING DECISION INFO] Booking ${id} already processed with status: ${booking.status}`);
        // Redirect to thank-you page even if already processed
        const thankYouUrl = new URL("/confirmation", process.env.NEXT_PUBLIC_BASE_URL || req.url);
        return NextResponse.redirect(thankYouUrl);
    }

    await kv.hset(`booking:${id}`, { status: action })

    if (action === "accept") {
      // Validate booking.time before attempting to parse it
      if (!booking.time || isNaN(new Date(booking.time).getTime())) {
        console.error("[API BOOKING DECISION ERROR]", `Invalid date format for booking.time: ${booking.time} for booking ID: ${id}`);
        throw new Error(`Invalid date format for booking time: ${booking.time}`);
      }

      let tattooDetails = booking.tattooDetails || "";
      if (booking.chatHistory) {
          try {
              const storedHistory: Message[] = JSON.parse(booking.chatHistory);
              const summaryInput: SummaryMessage[] = storedHistory.map(m => ({
                  role: m.role === "assistant" ? "assistant" : "user",
                  content: m.content
              }));
              tattooDetails = await summarizeChatHistory(summaryInput);
          } catch (e) {
              console.error("Failed to parse chat history or generate summary", e);
              // Fallback to existing tattooDetails if any
          }
      }

      await addConsult(
        `Tattoo consult – ${booking.name}`,
        `Quote $${booking.quote} CAD • Phone ${booking.phone}`,
        new Date(booking.time).toISOString(),
        booking.email,
        tattooDetails
      )
      
      const clientEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2D4A3E;">Booking Confirmed - Shed Shop</h2>
          <p>Hi ${booking.name},</p>
          <p>Your consultation is confirmed for <strong>${booking.time}</strong>. We're looking forward to seeing you!</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2D4A3E;">Tattoo Details Summary</h3>
            <p style="white-space: pre-wrap;">${tattooDetails}</p>
          </div>
          <p style="color: #666; margin-top: 30px;">
            Best regards,<br>
            Hope @ Shed Shop
          </p>
        </div>
      `;

      await sendMail(
        booking.email,
        "Shed Shop booking CONFIRMED",
        clientEmailHtml
      )
    } else if (action === "reject") { // Explicitly check for reject
      await sendMail(
        booking.email,
        "Shed Shop booking DECLINED",
        `<p>That slot isn't available. Please reply with another preferred time and we'll try again.</p>`,
      )
    } else {
      console.warn("[API BOOKING DECISION WARN]", `Invalid action: ${action} for booking ID: ${id}`);
      return NextResponse.json({ error: "Invalid action specified" }, { status: 400 });
    }

    const thankYouRedirectUrl = new URL("/confirmation", process.env.NEXT_PUBLIC_BASE_URL!);
    return NextResponse.redirect(thankYouRedirectUrl);

  } catch (error: any) {
    console.error("[API BOOKING DECISION ERROR]", error);
    let errorMessage = "An unknown error occurred while processing the booking decision.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Avoid redirecting on error, instead return a JSON error response
    // The client or admin clicking the link should ideally see an error page or message
    // rather than being redirected to /thank-you if something went wrong.
    return NextResponse.json({ 
      error: "Failed to process booking decision.", 
      details: errorMessage,
      stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined 
    }, { status: 500 });
  }
} 