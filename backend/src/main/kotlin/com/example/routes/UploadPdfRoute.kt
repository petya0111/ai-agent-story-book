package com.example.routes

import com.example.embeddings.EmbeddingsClient
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
data class UploadPdfResponse(val storedPath: String, val chunks: Int, val mode: String)

fun Application.uploadPdfRoute(store: VectorStore, embeddings: EmbeddingsClient, uploadDir: String = "data/uploads") {
    routing {
        post("/uploadPdf") {
            val multipart = call.receiveMultipart()
            var savedFile: File? = null
            multipart.forEachPart { part ->
                if (part is PartData.FileItem) {
                    if (!part.originalFileName.orEmpty().lowercase().endsWith(".pdf")) {
                        part.dispose()
                        call.respond(HttpStatusCode.BadRequest, "Only .pdf accepted")
                        return@post
                    }
                    val dir = File(uploadDir).also { it.mkdirs() }
                    val dest = File(dir, part.originalFileName ?: "uploaded.pdf")
                    part.streamProvider().use { input ->
                        dest.outputStream().use { output -> input.copyTo(output) }
                    }
                    savedFile = dest
                }
                part.dispose()
            }
            val pdf = savedFile ?: run {
                call.respond(HttpStatusCode.BadRequest, "No PDF file part found")
                return@post
            }
            val usingOpenAI = embeddings::class.simpleName?.contains("OpenAI") == true
            val pages = PdfExtractor.extractPages(pdf.absolutePath)
            val chunks = PdfChunker.chunkPages(pages)
            val vecs = embeddings.embed(chunks.map { it.text })
            val records = chunks.zip(vecs).map { (c, v) ->
                VectorStore.Record(id = c.id, text = c.text, vector = v, meta = c.meta)
            }
            store.clear(); store.addAll(records)
            call.respond(UploadPdfResponse(storedPath = pdf.absolutePath, chunks = records.size, mode = if (usingOpenAI) "openai" else "local"))
        }
    }
}