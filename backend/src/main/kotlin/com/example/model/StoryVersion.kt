package com.example.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "story_versions")
data class StoryVersion(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "book_id", nullable = false)
    var bookId: Long = 0,

    @Column(name = "chunk_id")
    var chunkId: Long? = null,

    @Column(columnDefinition = "text")
    var content: String = "",

    @Column(name = "author_id")
    var authorId: Long? = null,

    @Column(name = "parent_version_id")
    var parentVersionId: Long? = null,

    @Column(name = "metadata", columnDefinition = "text")
    var metadata: String? = null,

    @Column(name = "created_at")
    var createdAt: Instant = Instant.now()
)