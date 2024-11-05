// DEPENDENCIES
const cors = require("cors");
const express = require("express");
const articleController = require('./controllers/articleController');
const summaryController = require('./controllers/summaryController');

// CONFIGURATION
const app = express();

// MIDDLEWARE
app.use(cors());
// app.use(
//   cors({
//     origin: "http://localhost:3000", // Allow only this origin to access
//     credentials: true, // Allow cookies and headers to be sent along with the request
//   })
// );
app.use(express.json());

app.use('/api/articles', articleController);
app.use('/api/summaries', summaryController);

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