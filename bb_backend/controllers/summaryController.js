const express = require('express');
const summary = express.Router();
const db = require('../db/dbConfig');
const main = require('../openai-api');

// get a specific article summary from DB by ID
summary.get('/:id/', async (req, res) => {
    const { id } = req.params;
    const numId = Number(id);

    try {
        const article = await db.one('SELECT * from articles WHERE id = $1', [numId]);
        const abstract = article.abstract;
        const summary_type = abstract.summary_type;
        const summary = await main(abstract, summary_type, summary_type);
        res.status(200).json(summary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error getting article' });
    };
});

module.exports = summary;