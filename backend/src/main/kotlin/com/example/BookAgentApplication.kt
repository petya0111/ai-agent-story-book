package com.example

import org.springframework.boot.SpringApplication
import org.springframework.boot.WebApplicationType
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
class BookAgentApplication

fun main(args: Array<String>) {
    // Force servlet web application type so embedded Tomcat is started in container environments.
    // Set as a system property as an additional guard for environments that may set profiles or properties early.
    System.setProperty("spring.main.web-application-type", WebApplicationType.SERVLET.name)
    val app = SpringApplication(BookAgentApplication::class.java)
    app.webApplicationType = WebApplicationType.SERVLET
    app.run(*args)
}