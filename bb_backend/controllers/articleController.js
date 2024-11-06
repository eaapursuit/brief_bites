const express = require('express');
const article = express.Router();
const db = require('../db/dbConfig');
const fetch = require('node-fetch')
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 });


require('dotenv').config();
const API_KEY = process.env.VITE_CURRENTS_API_KEY;
const CACHE_KEY = 'latest-news';

// fetches latest news from CurrentsAPI

article.get('/latest', async (req, res) => {
    try {
        //Checks cache first
        const cachedData = cache.get(CACHE_KEY);
        if(cachedData) {
            console.log('Serving from cache');
            return res.status(200).json(cachedData);
        }
        
    const url = 'https://api.currentapi.services/v1/latest-news?'+'language=us&'+ `apiKey=${API_KEY}`;
   
    const response = await fetch(url);

    if(!response.ok) {
        switch (response.status) {
            case 401:
                throw new Error('Invalid API key');
            case 429:
                throw new Error('Rate limit exceeded');
            case 500:
                throw new Error('CurrentsAPI server error');
            default:
                throw new Error(`HTTP error! status: ${response.status}`)
        }
    }

    const data = await response.json();

    const processedData = {
        articles: data.news.map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            author: article.author,
            category: article.category,
            published: article.published,
        })).filter(article => article.title && article.description && article.description.length > 50

        )
    };

    //store it in cache
    cache.set(CACHE_KEY, processedData);

    res.status(200).json(processedData);
} catch (err) {
    console.error('Error fetching news:', err.message);

    if(err.message === 'Invalid API key') {
        return res.status(401).json({ error: 'Authentication failed' });
    }
    if(err.message === 'Rate limit exceeded'){
        return res.status(429).json({ error: 'Too many requests' });
    }

    res.status(500).json({ error: 'Error fetching latest news' });
}
    
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