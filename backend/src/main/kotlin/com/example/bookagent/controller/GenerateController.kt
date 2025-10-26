package com.example.bookagent.controller

import com.example.bookagent.dto.ChatRequest
import com.example.bookagent.dto.GenerateRequest
import com.example.bookagent.repository.ChunkRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/generate")
class GenerateController(
    private val chunkRepo: ChunkRepository,
    @Value("\${OPENAI_API_KEY:}") private val openaiKey: String
) {

    private val webClient: WebClient = WebClient.create("https://api.openai.com")

    @PostMapping("/hero-rewrite")
    fun generate(@RequestBody req: GenerateRequest): ResponseEntity<Any> {
        if (openaiKey.isBlank()) {
            return ResponseEntity.status(500).body(mapOf("error" to "OPENAI_API_KEY not set on server"))
        }

        val chunks = chunkRepo.findAllById(req.chunkIds)
        val joined = chunks.joinToString("\n\n") { it.text }

        val system = "You are a helpful creative writing assistant. Rewrite the passage preserving plot continuity unless asked to change it."
        val user = StringBuilder()
            .append("Original passage:\n")
            .append(joined)
            .append("\n\nHero change request:\n")
            .append("Name: ${req.heroSpec.name}\n")
            .append("Age: ${req.heroSpec.age}\n")
            .append("Personality: ${req.heroSpec.personality.joinToString(", ")}\n")
            .append("Role: ${req.heroSpec.role}\n")
            .append("Constraints: ${req.constraints}\n")
            .append("\nReturn only the rewritten passage.")
            .toString()

        val payload = mapOf(
            "model" to "gpt-4o-mini",
            "messages" to listOf(
                mapOf("role" to "system", "content" to system),
                mapOf("role" to "user", "content" to user)
            ),
            "max_tokens" to 800,
            "temperature" to 0.4
        )

        val responseMono: Mono<Map<String, Any>> = webClient.post()
            .uri("/v1/chat/completions")
            .header("Authorization", "Bearer $openaiKey")
            .bodyValue(payload)
            .retrieve()
            .bodyToMono(Map::class.java)
            .map { it as Map<String, Any> }

        val response = responseMono.block()
        return ResponseEntity.ok(response)
    }

    // New: chat endpoint that takes a message and optional chunk context
    @PostMapping("/chat")
    fun chat(@RequestBody req: ChatRequest): ResponseEntity<Any> {
        if (openaiKey.isBlank()) {
            return ResponseEntity.status(500).body(mapOf("error" to "OPENAI_API_KEY not set on server"))
        }

        // Fetch chunk texts if provided
        val contextText = when {
            !req.chunkIds.isNullOrEmpty() -> {
                val chunks = chunkRepo.findAllById(req.chunkIds)
                chunks.joinToString("\n\n") { it.text }
            }
            req.bookId != null -> {
                // Optionally include first few pages as context for a book-level chat (simple approach)
                val chunks = chunkRepo.findAllByBookId(req.bookId).sortedBy { it.pageNumber }.take(3)
                chunks.joinToString("\n\n") { it.text }
            }
            else -> ""
        }

        val system = "You are a helpful creative writing assistant. Use the provided book context when answering questions or performing edits. If no context is provided, answer using general knowledge."

        val userContent = StringBuilder()
            .append(if (contextText.isNotBlank()) "Context from book:\n$contextText\n\n" else "")
            .append("User message:\n")
            .append(req.message)
            .toString()

        val payload = mapOf(
            "model" to "gpt-4o-mini",
            "messages" to listOf(
                mapOf("role" to "system", "content" to system),
                mapOf("role" to "user", "content" to userContent)
            ),
            "max_tokens" to 800,
            "temperature" to 0.5
        )

        val responseMono: Mono<Map<String, Any>> = webClient.post()
            .uri("/v1/chat/completions")
            .header("Authorization", "Bearer $openaiKey")
            .bodyValue(payload)
            .retrieve()
            .bodyToMono(Map::class.java)
            .map { it as Map<String, Any> }

        val response = responseMono.block()
        return ResponseEntity.ok(response)
    }
}