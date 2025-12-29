package com.example.rag

import kotlin.math.sqrt

class VectorStore {
    data class Record(val id: String, val text: String, val vector: DoubleArray, val meta: Map<String, String> = emptyMap())
    private val records = mutableListOf<Record>()
    fun clear() = records.clear()
    fun addAll(r: List<Record>) { records += r }
    fun isEmpty() = records.isEmpty()
    fun topK(query: DoubleArray, k: Int = 5): List<Record> {
        if (records.isEmpty()) return emptyList()
        val qn = l2norm(query)
        return records.asSequence().map { r -> r to cosine(r.vector, query, qn) }
            .sortedByDescending { it.second }.take(k).map { it.first }.toList()
    }
    private fun cosine(v: DoubleArray, q: DoubleArray, qn: Double): Double {
        var dot = 0.0
        val vn = l2norm(v)
        val n = minOf(v.size, q.size)
        for (i in 0 until n) dot += v[i] * q[i]
        val denom = vn * qn
        return if (denom > 0) dot / denom else 0.0
    }
    private fun l2norm(a: DoubleArray) = sqrt(a.sumOf { it * it })
}