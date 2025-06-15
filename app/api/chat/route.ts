import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

interface Message {
  role: "user" | "assistant";
  content: string;
  quoted?: boolean;
  quote?: number | null;
}

// Business data function to provide accurate pricing information
function getBusinessData() {
  return {
    baseRates: {
      minimumCharge: 800, // Minimum event charge
      chefHourlyRate: 50, // Per hour for chef service
      assistantRate: 25, // Per hour for additional staff
    },
    menuPricing: {
      casualDining: { min: 50, max: 100 }, // Buffet style
      corporateLunch: { min: 40, max: 75 }, // Includes staff/rentals
      formalDinner: { min: 80, max: 150 }, // Plated, premium
      familyStyle: { min: 60, max: 120 }, // Shared dishes
      cocktailParty: { min: 40, max: 90 }, // Passed hors d'oeuvres
    },
    serviceTypes: {
      dropOff: "Delivery only - prepared food dropped off",
      staffed: "Full service with chef and wait staff",
      interactive: "Chef demonstrates cooking during event"
    },
    serviceFees: {
      equipment: 150, // Kitchen equipment rental
      travel: 0.50, // Per km outside Toronto core
      cleaning: 100, // Additional cleaning fee
    }
  };
}

const SYSTEM_PROMPT = `You are an AI assistant for Chef Alex J's private dining and catering service in Toronto. You help potential clients get rough quotes for their events and guide them through the booking process.

IMPORTANT RULES:
1. When providing a quote, you MUST format it as "QUOTE: $AMOUNT" or "QUOTE: $MIN-$MAX" (e.g., "QUOTE: $750" or "QUOTE: $1200-2000")
2. All prices are in Canadian dollars (CAD)
3. Minimum event charge is $500
4. Chef hourly rate is $80/hour, assistant staff $40/hour
5. Menu pricing per person:
   - Casual dining: $35-55
   - Corporate lunch: $25-40
   - Formal dinner: $65-120
   - Family-style: $30-50
   - Cocktail party: $18-35
6. Additional fees: Equipment rental $150, Travel $0.50/km outside Toronto core, Cleaning $100

BEFORE QUOTING, you must gather:
- Event type and style preference
- Number of guests
- Event date and location
- Service level (drop-off, staffed service, or interactive)
- Dietary restrictions or preferences
- Budget range (if they have one)

PERSONALITY:
- Professional, warm, and enthusiastic about food
- Ask thoughtful questions about their vision
- Explain value and what's included
- Be honest about limitations (e.g., very large events may need multiple sessions)
- Use culinary terminology appropriately
- Always end with encouraging them to book a consultation

QUOTE EXAMPLES:
- Small dinner party (8 people, casual): "QUOTE: $750-950"
- Corporate lunch (20 people): "QUOTE: $800-1200"
- Wedding reception (50 people, formal): "QUOTE: $4000-6500"

Remember: These are ROUGH estimates. Complex events, special dietary needs, or premium ingredients may affect final pricing. Always encourage booking a consultation for detailed planning.`;

export async function POST(request: NextRequest) {
  try {
    const { history } = await request.json();
    
    if (!Array.isArray(history)) {
      return NextResponse.json({ error: 'Invalid message history' }, { status: 400 });
    }

    // Add business data context to the conversation
    const businessData = getBusinessData();
    const contextMessage = {
      role: "system" as const,
      content: `${SYSTEM_PROMPT}\n\nCurrent business data: ${JSON.stringify(businessData)}`
    };

    const messages = [contextMessage, ...history];

    let reply = "Sorry, I couldn't process that request.";
    if (groq) {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      reply = completion.choices[0]?.message?.content || reply;
    }
    
    // Extract quote from the response using multiple patterns
    let quote: number | null = null;
    let quoted = false;

    // Look for QUOTE: $amount or QUOTE: $min-max patterns
    const quoteMatch = reply.match(/QUOTE:\s*\$?(\d+(?:\.\d+)?)(?:\s*-\s*\$?(\d+(?:\.\d+)?))?/i);
    if (quoteMatch) {
      quoted = true;
      if (quoteMatch[2]) {
        // Range quote - use the lower bound
        quote = parseFloat(quoteMatch[1]);
      } else {
        // Single quote
        quote = parseFloat(quoteMatch[1]);
      }
    }

    // Fallback: look for any $ amount in the response
    if (!quoted) {
      const dollarMatch = reply.match(/\$(\d+(?:\.\d+)?)/);
      if (dollarMatch) {
        quote = parseFloat(dollarMatch[1]);
        quoted = true;
      }
    }

    return NextResponse.json({
      reply,
      quoted,
      quote
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
