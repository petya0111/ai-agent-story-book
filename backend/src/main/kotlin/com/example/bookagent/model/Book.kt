package com.example.bookagent.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "books")
data class Book(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    var title: String = "",

    @Column
    var author: String? = null,

    @Column(name = "pdf_path")
    var pdfPath: String? = null,

    @Column(name = "pages")
    var pages: Int = 0,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now()
)