package com.example.rag

import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.text.PDFTextStripper
import java.io.File

object PdfExtractor {
    data class Page(val pageNumber: Int, val text: String)
    fun extractPages(path: String): List<Page> {
        val file = File(path); require(file.exists()) { "PDF not found: $path" }
        PDDocument.load(file).use { doc ->
            val stripper = PDFTextStripper()
            val pages = mutableListOf<Page>()
            val total = doc.numberOfPages
            for (p in 1..total) {
                stripper.startPage = p; stripper.endPage = p
                val raw = stripper.getText(doc)
                val cleaned = cleanPageText(raw)
                if (cleaned.isNotBlank()) pages += Page(p, cleaned)
            }
            return pages
        }
    }
    private fun cleanPageText(raw: String): String {
        var t = raw.replace("\r", "")
        t = t.replace(Regex("(?<!\\w)-(\\n)(?=\\w)"), "")
        t = t.replace(Regex("\\n{2,}"), "\n\n")
        return t.trim()
    }
}