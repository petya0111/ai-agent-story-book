package com.example.rag

object Chunker {
    data class Chunk(val id: String, val text: String, val meta: Map<String, String> = emptyMap())
    fun chunkText(raw: String, targetChars: Int = 3500): List<Chunk> {
        val paragraphs = raw.split(Regex("\\n\\s*\\n")).map { it.trim() }.filter { it.isNotEmpty() }
        val list = mutableListOf<String>()
        val buf = StringBuilder()
        for (p in paragraphs) {
            if (buf.length + p.length + 2 > targetChars && buf.isNotEmpty()) {
                list.add(buf.toString()); buf.clear()
            }
            if (buf.isNotEmpty()) buf.append("\n\n")
            buf.append(p)
        }
        if (buf.isNotEmpty()) list.add(buf.toString())
        return list.mapIndexed { i, t -> Chunk("chunk-$i", t) }
    }
}