const express = require('express');
const summary = express.Router();
const db = require('../db/dbConfig');
const generateSummary = require('../openai-api');

// get a specific article summary from DB by ID
summary.get('/:id/', async (req, res) => {
    const { id } = req.params;
    const numId = Number(id);

    try {
        const article = await db.one('SELECT * from articles WHERE id = $1', [numId]);
        
        //if a summary doesnt exist, generate it
        if (!article.summary){
            const summary = await generateSummary(article.article_description, article.summary_type);

            //update the article with the new summary
            await db.none(
                'UPDATE articles SET summary = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [summary, numId]
            );

            article.summary = summary;
        }

        res.status(200).json({
            id: article.id,
            title: article.title,
            description: article.article_description,
            summary: article.summary,
            summary_type: article.summary_type,
            url: article.article_url,
            author: article.author,
            category: article.category,
            published: article.published        
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error getting article summary' });
    };
});

module.exports = summary;