-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create enum for content formats
CREATE TYPE content_format AS ENUM ('markdown', 'html', 'rawHtml', 'links', 'screenshot');

-- Main documents table
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    url VARCHAR(2048) NOT NULL,
    title VARCHAR(512),
    description TEXT,
    language VARCHAR(10),
    source_url VARCHAR(2048),
    status_code INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_crawled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    content_embedding vector(1536),  -- For semantic search capability
    CONSTRAINT unique_url UNIQUE (url)
);

-- Table for document content in different formats
CREATE TABLE document_contents (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL,
    format content_format NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT unique_document_format UNIQUE (document_id, format)
);

-- Table for metadata key-value pairs
CREATE TABLE document_metadata (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL,
    key VARCHAR(255) NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT unique_document_metadata UNIQUE (document_id, key)
);

-- Create indexes
CREATE INDEX idx_documents_url ON documents(url);
CREATE INDEX idx_documents_title ON documents(title);
CREATE INDEX idx_document_metadata_key ON document_metadata(key);
CREATE INDEX idx_document_contents_format ON document_contents(format);

