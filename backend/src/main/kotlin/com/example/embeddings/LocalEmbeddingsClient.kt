package com.example.embeddings

import kotlin.math.abs
import kotlin.math.sqrt

class LocalEmbeddingsClient(private val dim: Int = 384) : EmbeddingsClient {
    override suspend fun embed(texts: List<String>): List<DoubleArray> =
        texts.map { text ->
            val vec = DoubleArray(dim)
            val words = text.lowercase()
                .replace(Regex("[^a-z0-9\\s]"), " ")
                .split(Regex("\\s+"))
                .filter { it.isNotBlank() }
            for (w in words) {
                val h = abs(w.hashCode()) % dim
                vec[h] += 1.0
            }
            val norm = sqrt(vec.sumOf { it * it })
            if (norm > 0) for (i in vec.indices) vec[i] /= norm
            vec
        }
}