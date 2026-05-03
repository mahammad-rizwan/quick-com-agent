import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function parseUserMessage(message, history = []) {
  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a friendly grocery shopping assistant for an Indian quick commerce app.
Analyze user messages and return ONLY this JSON:
{
  "intent": "chat" | "shop",
  "reply": "friendly conversational reply (always fill this)",
  "products": [{"name": "onions", "quantity": "2kg"}]
}

Intent rules:
- "chat"  → greetings, questions, anything NOT about buying/searching groceries
- "shop"  → user mentions any grocery product they want to buy, order, search, compare, add

Always fill "reply" with a friendly message.
For "shop" intent reply should be like "Sure! Let me search for that on Blinkit and Instamart right away!"
If no quantity mentioned use "1 unit".
Extract ALL products mentioned.`
      },
      ...history,
      { role: "user", content: message }
    ],
    temperature: 0,
    max_tokens: 500,
  });
  return JSON.parse(res.choices[0].message.content);
}

export async function generateRecommendation(products, blinkitData, instamartData) {
  const summary = products.map(p => {
    const b  = blinkitData[p.name];
    const im = instamartData[p.name];
    const bEta  = b?.eta  ?? '?';
    const imEta = im?.eta ?? '?';
    return `${p.quantity} ${p.name}: Blinkit ₹${b?.price ?? 'N/A'} (${bEta} mins) | Instamart ₹${im?.price ?? 'N/A'} (${imEta} mins)`;
  }).join('\n');

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a smart grocery shopping advisor.
Given product prices and delivery times from Blinkit and Instamart, return ONLY this JSON:
{
  "cheapest": {
    "platform": "Blinkit or Instamart",
    "totalPrice": 123,
    "totalEta": 12,
    "reason": "short reason why"
  },
  "fastest": {
    "platform": "Blinkit or Instamart",
    "totalPrice": 145,
    "totalEta": 8,
    "reason": "short reason why"
  },
  "bestOverall": {
    "platform": "Blinkit or Instamart",
    "totalPrice": 130,
    "totalEta": 10,
    "reason": "short reason why"
  }
}`
      },
      { role: "user", content: `Products:\n${summary}` }
    ],
    temperature: 0,
    max_tokens: 400,
  });
  return JSON.parse(res.choices[0].message.content);
}