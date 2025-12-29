package com.example.bookagent.controller

import com.example.bookagent.model.Book
import com.example.bookagent.model.Chunk
import com.example.bookagent.repository.BookRepository
import com.example.bookagent.repository.ChunkRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/book")
class BookController(
    private val bookRepo: BookRepository,
    private val chunkRepo: ChunkRepository
) {
    @GetMapping("/metadata")
    fun metadata(): List<Book> = bookRepo.findAll()

    @GetMapping("/{id}")
    fun getBook(@PathVariable id: Long): ResponseEntity<Book> =
        bookRepo.findById(id).map { ResponseEntity.ok(it) }.orElse(ResponseEntity.notFound().build())

    @GetMapping("/pages")
    fun pages(@RequestParam bookId: Long, @RequestParam start: Int, @RequestParam end: Int): ResponseEntity<List<Chunk>> {
        val chunks = chunkRepo.findAllByBookIdAndPageNumberBetween(bookId, start, end)
        return ResponseEntity.ok(chunks)
    }

    @GetMapping("/chunks/{id}")
    fun chunk(@PathVariable id: Long): ResponseEntity<Chunk> =
        chunkRepo.findById(id).map { ResponseEntity.ok(it) }.orElse(ResponseEntity.notFound().build())
}