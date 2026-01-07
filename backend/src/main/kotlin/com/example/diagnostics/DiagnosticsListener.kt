package com.example.diagnostics

import org.slf4j.LoggerFactory
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.boot.context.event.ApplicationStartedEvent
import org.springframework.context.event.ContextClosedEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class DiagnosticsListener {
    private val log = LoggerFactory.getLogger(DiagnosticsListener::class.java)

    @EventListener
    fun onStarted(e: ApplicationStartedEvent) {
        log.info("[Diagnostics] ApplicationStartedEvent received: ${e::class.simpleName}")
        logThreadSnapshot("after-started")
    }

    @EventListener
    fun onReady(e: ApplicationReadyEvent) {
        log.info("[Diagnostics] ApplicationReadyEvent received: ${e::class.simpleName}")
        logThreadSnapshot("on-ready")

        // Start a non-daemon thread to keep the JVM alive for diagnosis and allow inspection.
        Thread({
            try {
                log.info("[Diagnostics] Diagnostic keep-alive thread started (will sleep for 5m).")
                Thread.sleep(5 * 60 * 1000L)
                log.info("[Diagnostics] Diagnostic keep-alive thread finishing sleep.")
            } catch (ex: InterruptedException) {
                log.warn("[Diagnostics] keep-alive interrupted", ex)
            }
        }, "diagnostics-keepalive").apply { isDaemon = false }.start()
    }

    @EventListener
    fun onClosed(e: ContextClosedEvent) {
        log.info("[Diagnostics] ContextClosedEvent received: ${e::class.simpleName}")
        logThreadSnapshot("on-closed")
    }

    private fun logThreadSnapshot(stage: String) {
        val sb = StringBuilder()
        sb.append("[Diagnostics] Thread snapshot at ").append(stage).append("\n")
        val map = Thread.getAllStackTraces()
        for ((t, st) in map) {
            sb.append("- Thread: ").append(t.name).append(" (daemon=").append(t.isDaemon).append(") state=").append(t.state).append("\n")
            for (el in st) {
                sb.append("    at ").append(el.toString()).append("\n")
            }
        }
        log.info(sb.toString())
    }
}
