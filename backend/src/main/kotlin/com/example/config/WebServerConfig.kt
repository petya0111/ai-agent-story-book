package com.example.config

import org.apache.catalina.connector.Connector
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory
import org.springframework.boot.web.server.WebServerFactoryCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class WebServerConfig {
    @Bean
    fun servletWebServerFactory(): TomcatServletWebServerFactory {
        val factory = TomcatServletWebServerFactory()
        // leave defaults; explicit bean ensures a servlet web server factory is present
        return factory
    }
}
