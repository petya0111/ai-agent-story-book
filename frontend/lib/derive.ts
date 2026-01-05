export function deriveQuestionsFromTexts(texts: string[], max = 8): string[] {
  const combined = texts.join('\n\n');

  // Extract probable names / proper nouns (simple heuristic)
  const nameMatches = Array.from(new Set(combined.match(/\b([A-Z][a-z]{2,})(?:\s[A-Z][a-z]{2,})?/g) || []));

  // Keywords to look for in the text
  const keywords = [
    "kingdom",
    "forest",
    "throne",
    "battle",
    "prophecy",
    "oracle",
    "leader",
    "curse",
    "river",
    "castle",
    "village",
  ];

  const lower = combined.toLowerCase();
  const foundKeywords = keywords.filter((k) => lower.includes(k));

  const questions: string[] = [];

  // Add questions about top names
  for (let i = 0; i < Math.min(4, nameMatches.length); i++) {
    const n = nameMatches[i];
    questions.push(`What role does ${n} play in Hale's story?`);
    questions.push(`How does ${n} influence Hale's choices and fate?`);
  }

  // Add keyword-based questions
  for (const k of foundKeywords) {
    if (k === "kingdom") questions.push("How does the kingdom's politics affect Hale?");
    else if (k === "forest") questions.push("What important events occur in the forest and why do they matter?");
    else if (k === "throne") questions.push("Who contends for the throne and how does that impact Hale?");
    else if (k === "battle") questions.push("Describe the major battles and their consequences for the characters.");
    else if (k === "prophecy") questions.push("What prophecies shape Hale's motivations?");
    else if (k === "oracle") questions.push("What guidance does the Oracle provide and how reliable is it?");
    else questions.push(`What is the significance of the ${k} in the chronicle?`);
  }

  // Add some general story-level questions
  questions.push("What is the primary motivation driving Hale throughout the book?");
  questions.push("What are the major turning points in Hale's journey?");

  // Deduplicate and limit
  const uniq = Array.from(new Set(questions)).slice(0, max);
  return uniq;
}
