package com.example.repository

import com.example.model.Chunk
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ChunkRepository : JpaRepository<Chunk, Long> {
    fun findAllByBookIdAndPageNumberBetween(bookId: Long, start: Int, end: Int): List<Chunk>
    fun findAllByBookId(bookId: Long): List<Chunk>
}