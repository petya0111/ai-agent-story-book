package com.example

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BookAgentApplication

fun main(args: Array<String>) {
    runApplication<BookAgentApplication>(*args)
}