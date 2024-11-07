-- db/seed.sql
\c news

INSERT INTO articles (title, article_description, summary_type, created_at, updated_at)
VALUES 
('some gigantic title', 'an article description', 8, NOW(), NOW());