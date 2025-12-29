package com.example.llm

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class OpenAILlmClient(
    private val apiKey: String,
    private val model: String = "gpt-4o-mini"
) : LlmClient {

    private val client = OkHttpClient()
    private val json = Json { ignoreUnknownKeys = true }

    @Serializable
    private data class Message(val role: String, val content: String)
    @Serializable
    private data class ChatRequest(val model: String, val messages: List<Message>, val temperature: Double = 0.2)
    @Serializable
    private data class Choice(val index: Int, val message: Message)
    @Serializable
    private data class ChatResponse(val choices: List<Choice>)

    override suspend fun answer(question: String, contexts: List<String>): String {
        val system = "You are a lore expert for the fantasy book. Only use provided context; if unsure, say you are unsure."
        val contextBlock = contexts.joinToString("\n\n---\n\n")
        val user = "Context:\n$contextBlock\n\nQuestion: $question\nAnswer:"
        val body = json.encodeToString(
            ChatRequest.serializer(),
            ChatRequest(model = model, messages = listOf(Message("system", system), Message("user", user)), temperature = 0.2)
        ).toRequestBody("application/json".toMediaType())
        val req = Request.Builder()
            .url("https://api.openai.com/v1/chat/completions")
            .addHeader("Authorization", "Bearer $apiKey")
            .post(body)
            .build()
        client.newCall(req).execute().use { resp ->
            if (!resp.isSuccessful) error("OpenAI chat failed: ${resp.code} ${resp.message}")
            val payload = resp.body?.string() ?: error("Empty chat response")
            val parsed = json.decodeFromString(ChatResponse.serializer(), payload)
            return parsed.choices.firstOrNull()?.message?.content?.trim()
                ?: "I'm unsure based on the provided context."
        }
    }
}