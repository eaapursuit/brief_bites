-- db/schema.sql
DROP DATABASE IF EXISTS news;
CREATE DATABASE news;

\c news;

DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS searches;

--Articles Table
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    article_description TEXT NOT NULL,
    article_url TEXT,
    author VARCHAR(255),
    category VARCHAR(100),
    published TIMESTAMP WITH TIME ZONE,
    summary TEXT,
    summary_type INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

--Searches table for tracking user searches
CREATE TABLE searches (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    search_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)

--Create indices for better query performances
CREATE INDEX idx_articles_title ON articles(title);
CREATE INDEX idx_searches_query ON searches(query);

--Create function to update at the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

--Create triggers to automatically update updated_at columns
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_searches_updated_at
    BEFORE UPDATE ON searches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();