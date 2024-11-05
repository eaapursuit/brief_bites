const express = require('express');
const article = express.Router();
const db = require('../db/dbConfig');

// get all articles
article.get('/', async (req, res) => {
    await db.any('SELECT * FROM articles')
   .then(data => {
        res.status(200).json(data);
    })
   .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Error getting articles' });
    });
});

// get a specific article from DB by ID
article.get('/:id/', async (req, res) => {
    const { id } = req.params;
    const numId = Number(id);

    await db.one('SELECT * FROM articles WHERE id = $1', [numId])
    .then(data => {
        console.log(data);
        res.status(200).json(data);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Error getting article' });
    });
});

// create a new article in the database
article.post('/', async (req, res) => {
    const article = req.body;

    await db.one('INSERT INTO articles (title, abstract, summary_type) VALUES ($1, $2, $3) RETURNING *', [article.title, article.abstract, article.summaryType])
   .then(data => {
        console.log('Added an article');
        res.status(201).json(data);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Error creating article' });
    });
})

module.exports = article;