import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { summarizeChatHistory, Message as SummaryMessage } from '@/lib/summary';

const SYS = `
You are an AI assistant for Shed Shop, a private garden tattoo studio specializing in fine line and black & gray tattoos. Your job is to generate rough tattoo quotes and help clients book consultations.
You must follow these rules:
- Your final output must contain a quote in the format "QUOTE: $AMOUNT" or "QUOTE: $MIN-$MAX". This is not optional.
- Minimum charge is $100.
- Hourly rate is $80.
- Flash tattoos are palm-sized and usually take 2 hours ($160).
- Reject cover-ups and color tattoos politely. For cover-ups, state they require an in-person consultation and do not provide a quote.
- For pieces larger than a hand, state they are likely multi-session and require an in-person consultation. Do not provide a quote.
- Ask for design idea, style, placement, and size in inches before quoting.
- After quoting, offer to schedule a free consultation.
- Always use CAD for currency. Example: $100 CAD.
- Your persona is pleasant, welcoming, and professional.
`.trim();

type IncomingMessage = { role: "user" | "assistant"; content: string };
interface ChatRequestBody {
  history: IncomingMessage[];
  mode?: "reply" | "summary";
}

export async function POST(request: Request) {
  try {
    const { history, mode = "reply" } = (await request.json()) as ChatRequestBody;

    if (mode === "summary") {
      const summaryInput: SummaryMessage[] = history.map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }));
      const summaryText = await summarizeChatHistory(summaryInput);
      return NextResponse.json(
        { summary: summaryText },
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Default "reply" mode
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set.");
    }
    const client = new Groq();
    const aiResponse = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYS },
        ...history.map(({ role, content }) => ({ role, content })),
      ],
    });

    const reply = aiResponse.choices[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response.";

    // Improved quote extraction for decimals and ranges
    const rangeMatch = reply.match(/QUOTE:\s*\$?(\d+(?:\.\d+)?)(?:\s*-\s*\$?(\d+(?:\.\d+)?))?/i) 
      || reply.match(/\$?(\d+(?:\.\d+)?)(?:\s*-\s*\$?(\d+(?:\.\d+)?))?\s*CAD/i);

    let quoteAmount: number | null = null;
    if (rangeMatch) {
      const lowerBound = parseFloat(rangeMatch[1]);
      const upperBound = rangeMatch[2] ? parseFloat(rangeMatch[2]) : null;

      if (upperBound) {
        // If there's a lower and upper bound, pick the greater value
        quoteAmount = Math.max(lowerBound, upperBound);
      } else {
        // Single number case
        quoteAmount = lowerBound;
      }
    }

    return NextResponse.json({
      reply: reply.replace(/QUOTE:.*$/i, '').trim(), // Remove the quote line from the visible reply
      quote: quoteAmount,
    });

  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json(
      { error: "Server error – check logs for details." },
      { status: 500 }
    );
  }
}
