package com.example.embeddings

interface EmbeddingsClient {
    suspend fun embed(texts: List<String>): List<DoubleArray>
}