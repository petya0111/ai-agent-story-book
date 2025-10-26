import fs from "fs";
import pdfParse from "pdf-parse";
import prisma from "../db/prisma";

/**
 * Reads BOOK_PDF_PATH if set, splits into naive page-based chunks,
 * and writes Book + Chunk entries into the DB if none exist.
 *
 * This is a minimal implementation; for production use, implement robust chunking,
 * duplicates checks, embeddings creation, and background jobs.
 */
export async function ingestPdfIfNeeded() {
  const pdfPath = process.env.BOOK_PDF_PATH;
  if (!pdfPath) {
    console.log("BOOK_PDF_PATH not configured; skipping PDF ingest.");
    return;
  }

  const existing = await prisma.book.findFirst();
  if (existing) {
    console.log("Book already present in DB; skipping ingest.");
    return;
  }

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`BOOK_PDF_PATH file not found: ${pdfPath}`);
  }
  const data = fs.readFileSync(pdfPath);
  const parsed = await pdfParse(data);
  // pdf-parse gives text with form-feed characters between pages in some cases.
  // We'll split by form-feed or by newline heuristics.
  const rawText = parsed.text || "";
  const pages = rawText.split(/\f|\n{2,}/).filter(Boolean);

  const book = await prisma.book.create({
    data: {
      title: process.env.BOOK_TITLE ?? "Imported Book",
      pages: pages.length,
      pdfPath: pdfPath
    }
  });

  const chunkCreates = pages.map((p, idx) => ({
    bookId: book.id,
    pageNumber: idx + 1,
    text: p.slice(0, 10000) // truncate large pages
  }));

  await prisma.chunk.createMany({ data: chunkCreates });
  console.log(`Ingested PDF into DB as book id ${book.id} with ${pages.length} pages.`);
}