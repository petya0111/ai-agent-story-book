package com.example.llm

interface LlmClient {
    suspend fun answer(question: String, contexts: List<String>): String
}