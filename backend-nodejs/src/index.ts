import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { json } from "body-parser";
import bookRouter from "./routes/book";
import generateRouter from "./routes/generate";
import storiesRouter from "./routes/stories";
import { ingestPdfIfNeeded } from "./utils/pdfIngest";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const app = express();

app.use(cors());
app.use(json({ limit: "2mb" }));

app.use("/api/book", bookRouter);
app.use("/api/generate", generateRouter);
app.use("/api/stories", storiesRouter);

app.get("/", (_req, res) => {
  res.send({ ok: true, message: "Book agent backend" });
});

async function start() {
  // Ingest PDF into DB as chunks if a pdf path is configured
  try {
    await ingestPdfIfNeeded();
  } catch (err) {
    console.error("PDF ingest error (continuing):", err);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start();