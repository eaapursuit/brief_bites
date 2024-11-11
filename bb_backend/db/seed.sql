-- db/seed.sql
\c news

---Clear existing data
TRUNCATE articles, searches RESTART IDENTITY;

--Insert sample articles
INSERT INTO articles (
    title, 
    article_description,
    article_url,
    author,
    category,
    published,
    summary,
    summary_type,
    created_at,
    updated_at
) VALUES 
(
    'Breaking News: Major Scientific Discovery',
    'Scientists have made a groundbreaking discovery that could change our understanding of the universe.',
    'https://example.com/scientific-discovery',
    'Dr. Jane Smith',
    'Science',
    '2024-03-15T14:30:00Z',
    'Scientists discover new particle that challenges existing physics models.',
    1
),
(
    'Technology Giants Announce Collaboration',
    'Major tech companies join forces to develop new AI standards.',
    'https://example.com/tech-collaboration',
    'John Doe',
    'Technology',
    '2024-03-14T09:15:00Z',
    'Tech leaders collaborate on AI safety guidelines.',
    2
);

-- Insert sample searches
INSERT INTO searches (query, search_count) VALUES 
('scientific discovery', 3),
('technology news', 5),
('AI development', 2);