-- db/seed.sql
\c news

INSERT INTO articles (title, abstract, summary_type, created_at, updated_at)
VALUES 
('some gigantic title', 'a very small abstract', 8, NOW(), NOW());