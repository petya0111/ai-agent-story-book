package com.example

data class Env(val openAiApiKey: String?) {
    companion object {
        fun fromSystem(): Env {
            val key = System.getenv("OPENAI_API_KEY")?.takeIf { it.isNotBlank() }
            return Env(openAiApiKey = key)
        }
    }
}