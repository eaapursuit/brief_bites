-- db/schema.sql
-- DROP DATABASE IF EXISTS summaries;

DROP DATABASE IF EXISTS news;

CREATE DATABASE news;

DROP TABLE IF EXISTS articles;

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