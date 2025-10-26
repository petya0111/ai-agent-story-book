-- Flyway migration to create basic tables
CREATE TABLE IF NOT EXISTS books (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(1024) NOT NULL,
  author VARCHAR(512),
  pdf_path VARCHAR(2048),
  pages INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chunks (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER,
  text TEXT,
  start_offset INTEGER,
  end_offset INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_versions (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chunk_id BIGINT REFERENCES chunks(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  author_id BIGINT,
  parent_version_id BIGINT,
  metadata TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);