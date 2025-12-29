package com.example.llm

class LocalLlmClient : LlmClient {
    override suspend fun answer(question: String, contexts: List<String>): String {
        val preview = contexts.firstOrNull()?.take(400)?.replace("\n", " ") ?: "(no context loaded)"
        return """
            [Local Prototype Answer]
            Context snippet: $preview

            Ask more specific questions or ingest more chapters for richer detail.
        """.trimIndent()
    }
}