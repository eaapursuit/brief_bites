const express = require("express");
const router = express.Router();
const db = require("../db/dbConfig");
const fetch = require("node-fetch");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 300 });
require("dotenv").config();
const API_KEY = process.env.VITE_CURRENTS_API_KEY;

const newsController = {
  async searchNews(req, res) {
    try {
      if (!API_KEY) {
        return res
          .status(500)
          .json({ error: "API key is missing in environment variables" });
      }

      const { q: searchQuery } = req.query;

      if (!searchQuery) {
        return res.status(400).json({ error: "Search query is required" });
      }

    const CACHE_KEY = `searchResults_${searchQuery}`;
    const cachedData = cache.get(CACHE_KEY);

    if (cachedData) {
      console.log("Serving search results from cache");
      return res.status(200).json(cachedData);
    }

      //Build query parameters
      const queryParams = new URLSearchParams({
        keywords: searchQuery,
        apiKey: API_KEY,
        ...req.query,
      });

      const response = await fetch(
        `https://api.currentsapi.services/v1/search?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      cache.set(CACHE_KEY, data);
      res.json(data);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({
        error: "Failed to fetch news",
        details: error.message,
      });
    }
  },

  async getFilterOptions(req, res) {
    try {
      const endpoints = ["categories", "regions", "languages"].map((type) =>
        fetch(
          `https://api.currentsapi.services/v1/available/${type}?apiKey=${API_KEY}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        ).then(async (res) => {
            if (!res.ok) {
                throw new Error(`Failed to fetch ${type} with status" ${res.status}`);
            }
            return res.json();
        })
      );

      const [categories, regions, languages] = await Promise.all(endpoints);

      res.json({
        categories,
        regions,
        languages,
      });
    } catch (error) {
      console.error("Error fetching filter options:", error);
      res.status(500).json({
        error: "Failed to fetch filter options",
        details: error.message,
      });
    }
  },
};

router.get("/search", newsController.searchNews);
router.get("/filters", newsController.getFilterOptions);


module.exports = router;