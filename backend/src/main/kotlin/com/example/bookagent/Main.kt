package com.example

import com.example.config.Env
import com.example.embeddings.EmbeddingsClient
import com.example.embeddings.LocalEmbeddingsClient
import com.example.embeddings.OpenAIEmbeddingsClient
import com.example.llm.LlmClient
import com.example.llm.LocalLlmClient
import com.example.llm.OpenAILlmClient
import com.example.rag.VectorStore
import com.example.routes.askRoutes
import com.example.routes.healthRoutes
import com.example.routes.ingestRoutes
import com.example.routes.streamRoutes
import com.example.routes.uploadPdfRoute
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.callloging.*
import io.ktor.server.plugins.compression.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.websocket.*
import io.ktor.serialization.kotlinx.json.*
import java.time.Duration

fun main() {
    // Read port from env (container-friendly). Default 8080.
    val port = System.getenv("SERVER_PORT")?.toIntOrNull() ?: 8080
    embeddedServer(Netty, port = port, module = Application::module).start(wait = true)
}

fun Application.module() {
    install(CallLogging)
    install(Compression)
    install(ContentNegotiation) { json() }
    install(CORS) {
        anyHost() // tighten for prod
        allowHeader("Content-Type")
    }
    install(WebSockets) {
        pingPeriod = Duration.ofSeconds(30)
        timeout = Duration.ofSeconds(60)
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }

    val env = Env.fromSystem()

    val embeddings: EmbeddingsClient =
        if (env.openAiApiKey != null) OpenAIEmbeddingsClient(env.openAiApiKey)
        else LocalEmbeddingsClient()

    val llm: LlmClient =
        if (env.openAiApiKey != null) OpenAILlmClient(env.openAiApiKey)
        else LocalLlmClient()

    val vectorStore = VectorStore()

    // Routes
    healthRoutes()
    ingestRoutes(vectorStore, embeddings)
    uploadPdfRoute(vectorStore, embeddings)
    askRoutes(vectorStore, embeddings, llm)
    streamRoutes(vectorStore, embeddings, llm)
}