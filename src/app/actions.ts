'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateInsight(input: { mode: string; content: string }) {
  console.log('👻 Ghost is thinking about:', input);

  // Artificial delay for theatrical effect (min 2 seconds)
  const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));

  const prompt = `
    You are GiftGhost, an unparalleled empathy engine. 
    Analyze the following input provided by a user who wants to buy a gift for someone.
    Input Mode: ${input.mode}
    Input Content: "${input.content}"

    Your Goal: Infer the target persona's deepest, unstated desires.
    
    1. EXTRACT: The core persona (e.g., "The Pragmatic Dreamer", "The Tired Optimizer").
    2. FIND: An "Obsession" (something they irrationally love) or a "Pain Point" (something that friction in their life).
    3. RECOMMEND: A specific, surprising gift. NOT a generic gift card. 
       - It must be specific (e.g., "A vintage 1980s Casio watch" not "A watch").
       - It must address the obsession or pain point.
       - Include a "Buy Link" (Use a Google Search URL query for the item).

    output strictly in JSON format:
    {
      "persona": "string",
      "pain_point": "string",
      "obsession": "string",
      "gift_recommendation": {
        "item": "string",
        "reason": "string (Why this hits their soul?)",
        "buy_link": "string (Google Search URL)"
      }
    }
  `;

  try {
    const [completion] = await Promise.all([
      openai.chat.completions.create({
        messages: [{ role: 'system', content: prompt }],
        model: 'gpt-4o',
        response_format: { type: "json_object" },
      }),
      minDelay // Wait for at least 2 seconds
    ]);

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return { success: true, ...result };

  } catch (error) {
    console.error('AI Error:', error);
    // Fallback for demo if key is missing or error
    return {
      success: false, 
      error: "The Ghost is confused. (Check API Key)",
      // Return a fallback mock so the app doesn't crash during demo
      persona: "The Mystery",
      pain_point: "Unknown",
      obsession: "Unknown",
        gift_recommendation: {
        item: "A handwritten letter",
        reason: "When technology fails, humanity wins.",
        buy_link: "#"
      }
    };
  }
}
