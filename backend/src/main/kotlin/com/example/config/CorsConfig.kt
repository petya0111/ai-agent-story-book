package com.example.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter

@Configuration
class CorsConfig {
    @Bean
    fun corsFilter(): CorsFilter {
        val config = CorsConfiguration()
        // Use a wildcard origin. NOTE: when using a wildcard origin you MUST set allowCredentials = false
        // because browsers will reject credentialed responses with Access-Control-Allow-Origin: *.
        // If you need credentialed requests (cookies, Authorization headers), switch to explicit origins
        // or use allowedOriginPatterns and ensure the response sets a specific origin value.
        config.allowedOrigins = listOf("*")
        config.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
        config.allowedHeaders = listOf("*")
    // disable credentialed responses when allowing any origin
    config.allowCredentials = false
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", config)
        return CorsFilter(source)
    }
}