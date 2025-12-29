package com.example.routes

import com.example.embeddings.EmbeddingsClient
import com.example.rag.Chunker
import com.example.rag.PdfChunker
import com.example.rag.PdfExtractor
import com.example.rag.VectorStore
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import java.io.File

@Serializable
private data class IngestRequest(val bookPath: String? = null, val targetChars: Int? = null)

@Serializable
private data class IngestResponse(val chunks: Int, val mode: String, val format: String)

fun Application.ingestRoutes(store: VectorStore, embeddings: EmbeddingsClient) {
    routing {
        post("/ingest") {
            val body = runCatching { call.receive<IngestRequest>() }.getOrNull()
            val path = body?.bookPath ?: "data/books/sample_book.txt"
            val targetChars = body?.targetChars ?: 3500
            val file = File(path)
            if (!file.exists()) {
                call.respond(HttpStatusCode.BadRequest, "File not found: $path")
                return@post
            }
            val usingOpenAI = embeddings::class.simpleName?.contains("OpenAI") == true
            val ext = file.extension.lowercase()
            val records = when (ext) {
                "pdf" -> {
                    val pages = PdfExtractor.extractPages(path)
                    val pdfChunks = PdfChunker.chunkPages(pages, targetChars = targetChars)
                    val vecs = embeddings.embed(pdfChunks.map { it.text })
                    pdfChunks.zip(vecs).map { (c, v) ->
                        VectorStore.Record(
                            id = c.id,
                            text = c.text,
                            vector = v,
                            meta = c.meta + mapOf("page_start" to c.pageStart.toString(), "page_end" to c.pageEnd.toString())
                        )
                    }
                }
                else -> {
                    val raw = file.readText()
                    val chunks = Chunker.chunkText(raw, targetChars = targetChars)
                    val vecs = embeddings.embed(chunks.map { it.text })
                    chunks.zip(vecs).map { (c, v) ->
                        VectorStore.Record(id = c.id, text = c.text, vector = v, meta = c.meta)
                    }
                }
            }
            store.clear(); store.addAll(records)
            call.respond(IngestResponse(chunks = records.size, mode = if (usingOpenAI) "openai" else "local", format = ext))
        }
    }
}