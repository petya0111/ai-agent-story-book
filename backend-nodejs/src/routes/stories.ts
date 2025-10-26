import express from "express";
import prisma from "../db/prisma";

const router = express.Router();

// POST /api/stories
router.post("/", async (req, res) => {
  /*
    body:
    {
      title?: string,
      bookId: number,
      chunkIds: number[],
      content: string,
      heroSpec?: object,
      parentVersionId?: number,
      authorId?: number
    }
  */
  try {
    const { title, bookId, chunkIds = [], content, heroSpec = null, parentVersionId = null, authorId = null } = req.body;
    if (!bookId || !content) return res.status(400).json({ error: "bookId and content required" });
    const story = await prisma.storyVersion.create({
      data: {
        title: title ?? null,
        bookId,
        content,
        authorId: authorId ?? null,
        parentVersionId,
        meta: {
          create: {
            key: "heroSpec",
            value: heroSpec ? JSON.stringify(heroSpec) : null
          }
        }
      }
    });
    res.json(story);
  } catch (err) {
    console.error("stories POST error", err);
    res.status(500).json({ error: "Failed to save story" });
  }
});

// GET /api/stories?bookId=&heroName=
router.get("/", async (req, res) => {
  const bookId = req.query.bookId ? Number(req.query.bookId) : undefined;
  const stories = await prisma.storyVersion.findMany({
    where: { bookId },
    orderBy: { createdAt: "desc" }
  });
  res.json({ stories });
});

// GET /api/stories/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const story = await prisma.storyVersion.findUnique({ where: { id } });
  if (!story) return res.status(404).json({ error: "Story not found" });
  res.json(story);
});

export default router;