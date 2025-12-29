package com.example.dto

import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull

data class HeroSpec(
    val name: String?,
    val age: Int?,
    val pronouns: String?,
    val personality: List<String> = emptyList(),
    val role: String? = null
)

data class GenerateRequest(
    @field:NotEmpty
    val chunkIds: List<Long>,
    @field:NotNull
    val heroSpec: HeroSpec,
    val constraints: Map<String, String> = emptyMap(),
    val nVariants: Int = 1
)

data class SaveStoryRequest(
    val title: String?,
    val bookId: Long,
    val chunkIds: List<Long>,
    val content: String,
    val authorId: Long?,
    val parentVersionId: Long? = null,
    val metadata: Map<String, Any>? = null
)

data class ChatRequest(
    val bookId: Long? = null,
    val chunkIds: List<Long>? = null,
    val message: String,
    val heroContext: String? = null
)