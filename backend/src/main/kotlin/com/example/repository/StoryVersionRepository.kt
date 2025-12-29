package com.example.bookagent.repository

import com.example.bookagent.model.StoryVersion
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface StoryVersionRepository : JpaRepository<StoryVersion, Long> {
    fun findAllByBookId(bookId: Long): List<StoryVersion>
}