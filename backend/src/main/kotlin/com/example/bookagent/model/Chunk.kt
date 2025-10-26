package com.example.bookagent.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "chunks")
data class Chunk(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "book_id", nullable = false)
    var bookId: Long = 0,

    @Column(name = "page_number")
    var pageNumber: Int = 0,

    @Column(columnDefinition = "text")
    var text: String = "",

    @Column(name = "start_offset")
    var startOffset: Int? = null,

    @Column(name = "end_offset")
    var endOffset: Int? = null,

    @Column(name = "created_at")
    var createdAt: Instant = Instant.now()
)