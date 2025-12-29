package com.example.controller

import com.example.model.StoryVersion
import com.example.dto.SaveStoryRequest
import com.example.repository.StoryVersionRepository
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/stories")
class StoryController(private val repo: StoryVersionRepository) {

    @PostMapping
    fun create(@Validated @RequestBody req: SaveStoryRequest): ResponseEntity<StoryVersion> {
        val sv = StoryVersion(
            bookId = req.bookId,
            chunkId = req.chunkIds.firstOrNull(),
            content = req.content,
            authorId = req.authorId,
            parentVersionId = req.parentVersionId,
            metadata = req.metadata?.let { com.fasterxml.jackson.module.kotlin.jacksonObjectMapper().writeValueAsString(it) }
        )
        val saved = repo.save(sv)
        return ResponseEntity.ok(saved)
    }

    @GetMapping
    fun list(@RequestParam bookId: Long): List<StoryVersion> = repo.findAllByBookId(bookId)

    @GetMapping("/{id}")
    fun get(@PathVariable id: Long): ResponseEntity<StoryVersion> =
        repo.findById(id).map { ResponseEntity.ok(it) }.orElse(ResponseEntity.notFound().build())

    @PostMapping("/{id}/revert")
    fun revert(@PathVariable id: Long): ResponseEntity<StoryVersion> =
        repo.findById(id).map { existing ->
            // create a new version that is a copy (parent is the reverted one)
            val copy = existing.copy(id = 0, parentVersionId = existing.id)
            ResponseEntity.ok(repo.save(copy))
        }.orElse(ResponseEntity.notFound().build())
}