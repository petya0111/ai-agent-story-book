package com.example.routes

import com.example.embeddings.EmbeddingsClient
import com.example.llm.LlmClient
import com.example.rag.VectorStore
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable

@Serializable
private data class AskRequest(val question: String, val topK: Int = 5)
@Serializable
private data class Citation(val id: String, val preview: String)
@Serializable
private data class AskResponse(val answer: String, val citations: List<Citation>, val provider: String)

fun Application.askRoutes(store: VectorStore, embeddings: EmbeddingsClient, llm: LlmClient) {
    routing {
        post("/ask") {
            if (store.isEmpty()) {
                call.respond(HttpStatusCode.BadRequest, "Vector store empty; ingest first.")
                return@post
            }
            val req = runCatching { call.receive<AskRequest>() }.getOrNull()
            val question = req?.question?.trim().orEmpty()
            val k = req?.topK ?: 5
            if (question.isEmpty()) {
                call.respond(HttpStatusCode.BadRequest, "Missing question")
                return@post
            }
            val qVec = embeddings.embed(listOf(question)).first()
            val top = store.topK(qVec, k)
            val contexts = top.map { it.text }
            val answer = llm.answer(question, contexts)
            val citations = top.map {
                val prev = it.text.take(200).replace("\n", " ")
                val ps = it.meta["page_start"]; val pe = it.meta["page_end"]
                val info = if (ps != null && pe != null) " (pp. $ps-$pe)" else ""
                Citation(id = it.id, preview = prev + info)
            }
            val provider = if (llm::class.simpleName?.contains("OpenAI") == true) "openai" else "local"
            call.respond(AskResponse(answer = answer, citations = citations, provider = provider))
        }
    }
}