package com.example.rag

object PdfChunker {
    data class PdfChunk(
        val id: String,
        val text: String,
        val pageStart: Int,
        val pageEnd: Int,
        val meta: Map<String, String>
    )
    fun chunkPages(pages: List<PdfExtractor.Page>, targetChars: Int = 5000): List<PdfChunk> {
        if (pages.isEmpty()) return emptyList()
        val chunks = mutableListOf<PdfChunk>()
        var buf = StringBuilder()
        var first = pages.first().pageNumber
        var last = first
        var idx = 0
        for (pg in pages) {
            val pageText = pg.text
            if (buf.length + pageText.length + 2 > targetChars && buf.isNotEmpty()) {
                chunks += PdfChunk(
                    id = "pdfchunk-$idx",
                    text = buf.toString().trim(),
                    pageStart = first,
                    pageEnd = last,
                    meta = mapOf("source" to "pdf", "page_start" to first.toString(), "page_end" to last.toString())
                )
                idx++; buf = StringBuilder(); first = pg.pageNumber
            }
            if (buf.isNotEmpty()) buf.append("\n\n")
            buf.append(pageText)
            last = pg.pageNumber
        }
        if (buf.isNotEmpty()) {
            chunks += PdfChunk(
                id = "pdfchunk-$idx",
                text = buf.toString().trim(),
                pageStart = first,
                pageEnd = last,
                meta = mapOf("source" to "pdf", "page_start" to first.toString(), "page_end" to last.toString())
            )
        }
        return chunks
    }
}