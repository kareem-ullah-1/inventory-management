import { Anthropic } from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "Messages are required." });
    }

    const prompt = [
      { role: "system", content: "You are a helpful inventory management assistant. Answer clearly and concisely." },
      ...messages.map((message) => ({ role: message.role, content: message.content })),
    ];

    const response = await anthropic.messages.create({
      model: "claude-3.5-mini",
      messages: prompt,
    });

    const reply =
      response.output?.[0]?.content?.[0]?.text ||
      response.output?.text ||
      response.output?.[0]?.content ||
      "Sorry, I couldn't generate a response.";

    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ success: false, message: error.message || "Chat failed." });
  }
};
