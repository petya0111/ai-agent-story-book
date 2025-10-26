package com.example.bookagent.controller

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
            // In dev you can return a mock or error so user knows to set OPENAI_API_KEY
            return ResponseEntity.status(500).body(mapOf("error" to "OPENAI_API_KEY not set on server"))
        }

        // Fetch chunk texts
        val chunks = chunkRepo.findAllById(req.chunkIds)
        val joined = chunks.joinToString("\n\n") { it.text }

        // Build a simple prompt using a template; in production use a more robust template + few-shot.
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

        // Call OpenAI Chat Completion (simple example using chat/completions or responses endpoints)
        val payload = mapOf(
            "model" to "gpt-4o-mini", // adjust as available/desired
            "messages" to listOf(
                mapOf("role" to "system", "content" to system),
                mapOf("role" to "user", "content" to user)
            ),
            "max_tokens" to 800,
            "temperature" to 0.4
        )

        // Synchronous call (for streaming you'd use proper streaming endpoints)
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