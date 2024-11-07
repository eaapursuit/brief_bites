const express = require("express");
const article = express.Router();
const db = require("../db/dbConfig");
const fetch = require("node-fetch");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 300 });
require("dotenv").config();
const API_KEY = process.env.VITE_CURRENTS_API_KEY;

// Fetches latest news from Currents API
article.get("/latest", async (req, res) => {
  try {
    if (!API_KEY) {
      return res
        .status(500)
        .json({ error: "API key is missing in environment variables" });
    }

    const CACHE_KEY = "latestNewsArticles";
    const cachedData = cache.get(CACHE_KEY);

    if (cachedData) {
      console.log("Serving latest news from cache");
      return res.status(200).json(cachedData);
    }

    const url = `https://api.currentapi.services/v1/latest-news?language=us&apiKey=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorMessage = `API response error: ${response.status}`;
      console.error(errorMessage);
      return res.status(response.status).json({ error: errorMessage });
    }

    const data = await response.json();
    const processedData = {
      articles: data.news
        .filter(
          (article) =>
            article.title &&
            article.article_description &&
            article.article_description.length > 50
        )
        .map((article) => ({
          title: article.title,
          description: article.article_description,
          url: article.article_url,
          author: article.author,
          category: article.category,
          published: article.published,
        })),
    };

    try {
      cache.set(CACHE_KEY, processedData);
    } catch (cacheError) {
      console.error("Cache set error:", cacheError.message);
    }

    res.status(200).json(processedData);
  } catch (err) {
    console.error("Error fetching latest news:", err.message);
    res
      .status(500)
      .json({ error: "Error fetching latest news. Please try again later" });
  }
});

article.post("/", async (req, res) => {
  const { title, article_description, summary_type } = req.body;

  if (!title || !article_description || typeof summary_type !== "number") {
    return res.status(400).json({
      error: "Title, article description, and summary type are required",
    });
  }

  try {
    const newArticle = await db.one(
      "INSERT INTO articles (title, article_description, summary_type) VALUES ($1, $2, $3) RETURNING *",
      [title, article_description, summary_type]
    );
    res.status(201).json(newArticle);
  } catch (err) {
    console.error("Database error creating article:", err.message);
    res
      .status(500)
      .json({ error: "Internal server error while creating article" });
  }
});

// get a specific article from DB by ID
article.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid article ID" });
  }

  try {
    const article = await db.one("SELECT * FROM articles WHERE id = $1", [id]);
    res.status(200).json(article);
  } catch (err) {
    if (err.code === "NO_DATA") {
      res.status(404).json({ error: "Article not found" });
    } else {
      console.error("Database error fetching article:", err.message);
      res
        .status(500)
        .json({ error: "Internal server error while fetching article" });
    }
  }
});

// update an existing article by ID
article.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, article_description, summary_type } = req.body;

  if (isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid article ID" });
  }

  // Validate summary_type only if provided in request body
  if (summary_type !== undefined && typeof summary_type !== "number") {
    return res.status(400).json({ error: "Summary type must be a number" });
  }

  if (!title && !article_description && summary_type === undefined) {
    return res
      .status(400)
      .json({ error: "At least one field must be updated" });
  }

  try {
    const updatedArticle = await db.one(
      `UPDATE articles
         SET title = COALESCE($1, title),
             article_description = COALESCE($2, article_description),
             summary_type = COALESCE($3, summary_type),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
      [title, article_description, summary_type, id]
    );
    res.status(200).json(updatedArticle);
  } catch (err) {
    if (err.code === "NO_DATA") {
      res.status(404).json({ error: "Article not found" });
    } else {
      console.error("Database error updating article:", err.message);
      res
        .status(500)
        .json({ error: "Internal server error while updating article" });
    }
  }
});

// delete an article by ID
article.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid article ID" });
  }

  try {
    const result = await db.result("DELETE FROM articles WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.status(204).json({ message: "Article deleted successfully" });
  } catch (err) {
    console.error("Database error deleting article:", err.message);
    res
      .status(500)
      .json({ error: "Internal server error while deleting article" });
  }
});

module.exports = article;
