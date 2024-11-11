const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const db = require("../db/dbConfig");
const cache = new NodeCache({ stdTTL: 300 });
require("dotenv").config();


const API_KEY = process.env.CURRENTS_API_KEY;

const newsController = {
  async searchNews(req, res) {
    try {
      if (!API_KEY) {
        return res
          .status(500)
          .json({ error: "API key is missing in environment variables" });
      }

      const { q: searchQuery, page = 1, page_size = 30 } = req.query;

      if (!searchQuery) {
        return res.status(400).json({ error: "Search query is required" });
      }

      try {
        const savedSearch = await db.oneOrNone(
          'SELECT * FROM searches where query = $1',
          [searchQuery]
        );

        if (savedSearch) {
          console.log('Search found in database');

          await db.none(
            'UPDATE searches SET search_count = search_count + 1 WHERE query = $1',
            [searchQuery]
          );
        } else {
          await db.none(
            'INSERT INTO searches (query, search_count) VALUES ($1, 1)',
            [searchQuery]
          );
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }

      const CACHE_KEY = `searchResults_${searchQuery}_page_${page}`;
      const cachedData = cache.get(CACHE_KEY);

      if (cachedData) {
        console.log("Serving search results from cache");
        return res.status(200).json(cachedData);
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        keywords: searchQuery,
        apiKey: API_KEY,
        page: page.toString(),
        page_size: page_size.toString(),
        ...req.query,
      });
      console.log(queryParams)
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
      res.setHeader('Content-Type', 'application/json');

      console.log("Starting getFilterOptions")
      console.log("API Key available:", !!API_KEY);

      if(!API_KEY) {
        return res.status(500).json({ 
          error: "API key is missing in environment variables",
          details: "API key is not configured"
        });
      }
      
      const fetchOptions = async (type) => {
        
          const url = `https://api.currentsapi.services/v1/available/${type}?apiKey=${API_KEY}`
          console.log(`Attempting to fetch ${type} from Currents API`);
          console.log(`Fetching ${type} from:`, url);
        
          const response = await fetch(url, {
            method: "GET",
            headers: { 
              "Content-Type": "application/json", 
              "Accept": "application/json"
            },
          });
        
          console.log(`${type} response status:`, response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error fetching ${type}:`, errorText);
            throw new Error(`Failed to fetch ${type} with status: ${response.status}`);
          }

          const data = await response.json();
          console.log(`${type} data received:`, data);
          return data; 
        };

      // console.log("API Key:", API_KEY);

      const results = await Promise.all([
        fetchOptions("categories"),
        fetchOptions("regions"),
        fetchOptions("languages"),
      ]);

      const [categories, regions, languages] = results;

      const formattedResponse = {
        categories: categories?.categories || [],
        regions: regions?.regions || [], 
        languages:languages?.languages | [],
      }

      console.log("Sending responses:", formattedResponse)
      return res.json(formattedResponse);

    } catch (error) {
      console.error("Error fetching filter options:", error);
      return res.status(500).json({
        error: "Failed to fetch filter options",
        details: error.message,
      });
    }
  },
};

module.exports = newsController;
