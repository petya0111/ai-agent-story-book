package com.example.service

import com.example.model.Book
import com.example.model.Chunk
import com.example.repository.BookRepository
import com.example.repository.ChunkRepository
import jakarta.transaction.Transactional
import org.apache.pdfbox.Loader
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.text.PDFTextStripper
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.core.env.Environment
import org.springframework.stereotype.Component
import java.io.File
import java.time.Instant

@Component
class PdfIngestRunner(
    private val env: Environment,
    private val bookRepo: BookRepository,
    private val chunkRepo: ChunkRepository
) : CommandLineRunner {

    private val log = LoggerFactory.getLogger(PdfIngestRunner::class.java)

    @Transactional
    override fun run(vararg args: String?) {
        // Gate ingestion behind an explicit env var to avoid running on every startup.
        // Default: disabled. Set INGEST_ON_STARTUP=true in the environment to enable one-time ingestion.
        val ingestOnStartup = env.getProperty("INGEST_ON_STARTUP", "false").toBoolean()
        if (!ingestOnStartup) {
            log.info("INGEST_ON_STARTUP is not true; skipping PDF ingestion on startup. Set INGEST_ON_STARTUP=true to enable.")
            return
        }

        // Only ingest if no books exist (safe for dev)
        if (bookRepo.count() > 0) {
            log.info("Books already present in DB — skipping PDF ingestion.")
            return
        }

        val pdfPath = env.getProperty("BOOK_PDF_PATH") ?: "backend/books/book.pdf"
        val file = File(pdfPath)
        if (!file.exists()) {
            log.warn("BOOK_PDF_PATH is set to '$pdfPath' but file does not exist. Place your book PDF there to auto-ingest.")
            return
        }

        log.info("Starting PDF ingestion from: $pdfPath")
        val document = Loader.loadPDF(file)
        document.use {
            val stripper = PDFTextStripper()
            val numPages = document.numberOfPages
            val book = Book(
                title = file.nameWithoutExtension,
                author = null,
                pdfPath = pdfPath,
                pages = numPages,
                createdAt = Instant.now()
            )
            val savedBook = bookRepo.save(book)
            log.info("Created Book record id=${savedBook.id}, pages=$numPages")

            // Extract per-page text and save as chunks
            for (p in 1..numPages) {
                stripper.startPage = p
                stripper.endPage = p
                val pageText = stripper.getText(document).trim()
                if (pageText.isNotEmpty()) {
                    val chunk = Chunk(
                        bookId = savedBook.id,
                        pageNumber = p,
                        text = pageText,
                        startOffset = 0,
                        endOffset = pageText.length,
                        createdAt = Instant.now()
                    )
                    chunkRepo.save(chunk)
                    log.info("Saved chunk for page $p (length=${pageText.length})")
                } else {
                    log.info("Page $p empty — skipping")
                }
            }
            log.info("PDF ingestion complete.")
        }
    }
}