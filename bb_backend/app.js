// DEPENDENCIES
const cors = require("cors");
const express = require("express");
// const articleController = require('./controllers/articleController');
// const summaryController = require('./controllers/summaryController');
const newsController = require('./controllers/newsController');

// CONFIGURATION
const app = express();

// MIDDLEWARE
app.use(cors());

app.use(express.json());

// app.use('/api/articles', articleController);
// app.use('/api/summaries', summaryController);
app.use('/api/newsSearches', newsController);

// ROUTES
app.get("/", (req, res) => {
  res.json({ message: "welcome" });
});

// 404 PAGE
app.get("*", (req, res) => {
  res.status(404).send("Page not found");
});

// EXPORT
module.exports = app;