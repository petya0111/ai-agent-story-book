package com.example.routes

import com.example.embeddings.EmbeddingsClient
import com.example.llm.LlmClient
import com.example.rag.VectorStore
import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.delay
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlin.random.Random

@Serializable data class StreamInit(val type: String = "init", val message: String)
@Serializable data class StartAnswer(val type: String = "start_answer", val utteranceId: String, val emotion: String)
@Serializable data class TokenFragment(val type: String = "token", val utteranceId: String, val textFragment: String)
@Serializable data class VisemeEvent(val type: String = "viseme", val utteranceId: String, val viseme: String, val startMs: Long, val endMs: Long)
@Serializable data class Done(val type: String = "done", val utteranceId: String)

fun Application.streamRoutes(store: VectorStore, embeddings: EmbeddingsClient, llm: LlmClient) {
    routing {
        webSocket("/ws") {
            sendSerialized(StreamInit(message = "Connected. Send a question as plain text."))
            for (frame in incoming) {
                if (frame is Frame.Text) {
                    val q = frame.readText().trim()
                    if (q.isEmpty()) continue
                    val uttId = "utt-" + Random.nextInt(100000)
                    val contexts = if (!store.isEmpty()) {
                        val qVec = embeddings.embed(listOf(q)).first()
                        store.topK(qVec, 5).map { it.text }
                    } else emptyList()
                    val answer = llm.answer(q, contexts)
                    val emotion = inferEmotion(answer)
                    sendSerialized(StartAnswer(utteranceId = uttId, emotion = emotion))
                    val tokens = answer.split(Regex("\\s+"))
                    var elapsed = 0L
                    val msPerToken = 65L
                    tokens.forEach { t ->
                        sendSerialized(TokenFragment(utteranceId = uttId, textFragment = "$t "))
                        val vis = mapWordToViseme(t)
                        sendSerialized(VisemeEvent(utteranceId = uttId, viseme = vis, startMs = elapsed, endMs = elapsed + msPerToken))
                        elapsed += msPerToken
                        delay(30)
                    }
                    sendSerialized(Done(utteranceId = uttId))
                }
            }
        }
    }
}

private val json = Json { ignoreUnknownKeys = true }
private suspend fun DefaultWebSocketServerSession.sendSerialized(any: Any) {
    send(Frame.Text(json.encodeToString(any)))
}

private fun inferEmotion(answer: String): String {
    val l = answer.lowercase()
    return when {
        "great" in l || "wonderful" in l -> "happy"
        "however" in l || "but" in l -> "concerned"
        "shadow" in l || "myst" in l -> "curious"
        "!" in l -> "surprised"
        else -> "neutral"
    }
}

private fun mapWordToViseme(word: String): String {
    val w = word.lowercase()
    return when {
        w.startsWith("m") || w.startsWith("b") || w.startsWith("p") -> "MBP"
        w.startsWith("f") || w.startsWith("v") -> "FV"
        w.contains("th") || w.startsWith("s") || w.startsWith("t") || w.startsWith("d") || w.startsWith("g") -> "SCDG"
        w.startsWith("l") -> "L"
        w.startsWith("w") || w.startsWith("q") -> "WQ"
        w.contains("oo") || w.contains("o") -> "O"
        w.contains("ee") || w.contains("ea") || w.contains("i") -> "E"
        w.contains("a") -> "A"
        else -> "REST"
    }
}