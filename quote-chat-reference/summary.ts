import Groq from "groq-sdk";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

/**
 * Given a full chat history array, calls Groq's API once to produce a
 * single-paragraph "tattoo description" summary.
 * @param history An array of objects with { role: "user" | "assistant", content: string }
 * @returns A promise that resolves to the string summary.
 */
export async function summarizeChatHistory(history: Message[]): Promise<string> {
  const systemPrompt =
    "You are the Shed Shop tattoo assistant. Given a sequence of user and assistant messages, output a concise, one-paragraph description of the tattoo request that covers everything the client said (style, size, placement, any clarifications). Produce a summary that will read well inside an email or a Google Calendar event.";

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in the environment variables.");
  }
  
  const client = new Groq();

  try {
    const response = await client.chat.completions.create({
      model: "gemma2-9b-it",
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
      ],
    });
    
    const summary = response.choices[0]?.message?.content?.trim();
    if (!summary) {
      console.error("Groq API returned an empty summary.");
      // Fallback to a simple concatenation if the API fails to return a summary
      return history.map(m => m.content).join("\n\n");
    }

    return summary;
  } catch (error) {
    console.error("Error summarizing chat history with Groq:", error);
    // Fallback to a simple concatenation in case of an API error
    return history.map(m => m.content).join("\n\n");
  }
} 