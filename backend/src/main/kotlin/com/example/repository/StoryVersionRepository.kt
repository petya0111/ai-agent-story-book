package com.example.repository

import com.example.model.StoryVersion
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface StoryVersionRepository : JpaRepository<StoryVersion, Long> {
    fun findAllByBookId(bookId: Long): List<StoryVersion>
}