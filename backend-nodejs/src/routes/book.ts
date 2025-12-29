import express from "express";
import prisma from "../db/prisma";

const router = express.Router();

// GET /api/book/metadata
router.get("/metadata", async (_req, res) => {
  const book = await prisma.book.findFirst();
  if (!book) return res.status(404).json({ error: "No book found" });
  const chunkCount = await prisma.chunk.count({ where: { bookId: book.id } });
  res.json({
    id: book.id,
    title: book.title,
    pages: book.pages,
    chunkCount
  });
});

// GET /api/book/pages?start=1&end=2
router.get("/pages", async (req, res) => {
  const start = Number(req.query.start || 1);
  const end = Number(req.query.end || start);
  // naive mapping: chunk.page between start and end
  const chunks = await prisma.chunk.findMany({
    where: {
      pageNumber: { gte: start, lte: end }
    },
    orderBy: { pageNumber: "asc" }
  });
  res.json({ chunks });
});

// GET /api/book/chunk/:id
router.get("/chunk/:id", async (req, res) => {
  const id = Number(req.params.id);
  const chunk = await prisma.chunk.findUnique({ where: { id } });
  if (!chunk) return res.status(404).json({ error: "Chunk not found" });
  res.json(chunk);
});

// GET /api/book/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) return res.status(404).json({ error: "Book not found" });
  const chunkCount = await prisma.chunk.count({ where: { bookId: book.id } });
  res.json({
    id: book.id,
    title: book.title,
    pages: book.pages,
    chunkCount
  });
});

export default router;