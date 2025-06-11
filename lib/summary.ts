import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

interface Message {
  role: "user" | "assistant";
  content: string;
  quoted?: boolean;
  quote?: number | null;
}

export async function summarizeChat(messages: Message[]): Promise<string> {
  try {
    // Filter out system messages and create conversation text
    const conversationText = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role === 'user' ? 'Client' : 'Chef Alex AI'}: ${msg.content}`)
      .join('\n');

    const summaryPrompt = `Please create a concise summary of this catering consultation chat for use in booking emails and calendar events. Focus on:
- Event type and occasion
- Number of guests
- Date/time preferences
- Location
- Menu preferences or dietary restrictions
- Service level requested
- Budget/quote discussed
- Any special requests

Keep it professional and under 200 words.

Chat conversation:
${conversationText}`;

    const completion = await groq.chat.completions.create({
      model: "gemma2-9b-it",
      messages: [
        {
          role: "user",
          content: summaryPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || createFallbackSummary(messages);
  } catch (error) {
    console.error('Summary generation failed:', error);
    return createFallbackSummary(messages);
  }
}

function createFallbackSummary(messages: Message[]): string {
  const userMessages = messages.filter(msg => msg.role === 'user');
  const quotedMessages = messages.filter(msg => msg.quoted && msg.quote);
  
  let summary = "Catering consultation summary:\n";
  
  if (userMessages.length > 0) {
    summary += `Client discussed: ${userMessages.map(msg => msg.content).join(' | ')}\n`;
  }
  
  if (quotedMessages.length > 0) {
    const quote = quotedMessages[quotedMessages.length - 1].quote;
    summary += `Estimated quote: $${quote} CAD\n`;
  }
  
  summary += `Total messages exchanged: ${messages.length}`;
  
  return summary;
} 