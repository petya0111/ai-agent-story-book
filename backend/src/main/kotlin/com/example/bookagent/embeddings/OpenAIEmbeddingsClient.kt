package com.example.embeddings

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class OpenAIEmbeddingsClient(
    private val apiKey: String,
    private val model: String = "text-embedding-3-small"
) : EmbeddingsClient {

    private val client = OkHttpClient()
    private val json = Json { ignoreUnknownKeys = true }

    @Serializable
    private data class EmbeddingsRequest(val model: String, val input: List<String>)
    @Serializable
    private data class EmbeddingData(val index: Int, val embedding: List<Double>)
    @Serializable
    private data class EmbeddingsResponse(val data: List<EmbeddingData>)

    override suspend fun embed(texts: List<String>): List<DoubleArray> {
        if (texts.isEmpty()) return emptyList()
        val body = json.encodeToString(
            EmbeddingsRequest.serializer(),
            EmbeddingsRequest(model = model, input = texts)
        ).toRequestBody("application/json".toMediaType())
        val req = Request.Builder()
            .url("https://api.openai.com/v1/embeddings")
            .addHeader("Authorization", "Bearer $apiKey")
            .post(body)
            .build()
        client.newCall(req).execute().use { resp ->
            if (!resp.isSuccessful) error("OpenAI embeddings failed: ${resp.code} ${resp.message}")
            val payload = resp.body?.string() ?: error("Empty embeddings response")
            val parsed = json.decodeFromString(EmbeddingsResponse.serializer(), payload)
            return parsed.data.sortedBy { it.index }.map { it.embedding.toDoubleArray() }
        }
    }
}