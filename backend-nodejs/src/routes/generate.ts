import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import prisma from "../db/prisma";

dotenv.config();
const router = express.Router();

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  console.warn("OPENAI_API_KEY not set - generate endpoint will fail until configured.");
}
const openai = new OpenAI({ apiKey: openaiApiKey });

// POST /api/generate/hero-rewrite
router.post("/hero-rewrite", async (req, res) => {
  /*
    Body expected:
    {
      chunkIds: number[],
      heroSpec: { name?: string, age?: string, personality?: string[], role?: string, pronouns?: string },
      constraints?: { tone?: string, maxTokens?: number, readingLevel?: string },
      nVariants?: number
    }
  */
  try {
    const { chunkIds = [], heroSpec = {}, constraints = {}, nVariants = 1 } = req.body;

    if (!Array.isArray(chunkIds) || chunkIds.length === 0) {
      return res.status(400).json({ error: "chunkIds required" });
    }

    // Fetch the concatenated chunk text
    const chunks = await prisma.chunk.findMany({
      where: { id: { in: chunkIds } },
      orderBy: { pageNumber: "asc" }
    });
    const chunkText = chunks.map((c: { text: string }) => c.text).join("\n\n");

    // Build prompt
    const systemPrompt =
      "You are an expert creative writing assistant that rewrites passages while preserving plot continuity unless instructed otherwise. When asked to change a hero, update names/pronouns/traits as necessary and keep the scene coherent. Return only the rewritten passage.";

    const heroDescription = [
      heroSpec.name ? `name: ${heroSpec.name}` : null,
      heroSpec.age ? `age: ${heroSpec.age}` : null,
      heroSpec.pronouns ? `pronouns: ${heroSpec.pronouns}` : null,
      heroSpec.role ? `role: ${heroSpec.role}` : null,
      heroSpec.personality ? `personality: ${heroSpec.personality.join?.(", ") ?? heroSpec.personality}` : null
    ]
      .filter(Boolean)
      .join("; ");

    const userPrompt = `Original passage:\n\n${chunkText}\n\nHero change request: ${heroDescription}\n\nConstraints: ${JSON.stringify(
      constraints
    )}\n\nReturn only the rewritten passage.`;

    // Call OpenAI Chat Completions
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      n: Math.min(3, Math.max(1, Number(nVariants))),
      max_tokens: constraints.maxTokens || 512,
      temperature: Number(process.env.GENERATE_TEMPERATURE || 0.4)
    });

    const results = response.choices.map((c) => c.message?.content || "").filter(Boolean);
    res.json({ results });
  } catch (err) {
    console.error("generate error", err);
    res.status(500).json({ error: "Generation failed", details: String(err) });
  }
});

// POST /api/generate/chat
router.post("/chat", async (req, res) => {
  try {
    const { message, bookId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    if (!openaiApiKey) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    // Get some book context if bookId is provided
    let context = "";
    if (bookId) {
      const chunks = await prisma.chunk.findMany({
        where: { bookId },
        take: 3,
        orderBy: { pageNumber: "asc" }
      });
      context = chunks.map(c => c.text).join("\n\n");
    }

    const systemMessage = context 
      ? `You are a helpful assistant discussing this story content:\n\n${context}\n\nAnswer questions about the story and engage in conversation about its themes, characters, and plot.`
      : "You are a helpful assistant for discussing stories and literature.";

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const reply = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    
    res.json({ reply });
  } catch (err) {
    console.error("chat error", err);
    res.status(500).json({ error: "Chat failed", details: String(err) });
  }
});

export default router;